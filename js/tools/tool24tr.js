
        (function() {
            'use strict';

            // ===== Yükleme fonksiyonları =====
            function showLoading(title, msg) {
                document.getElementById('loadingTitle').textContent = title;
                document.getElementById('loadingMsg').textContent = msg;
                document.getElementById('exportLoading').classList.add('show');
            }

            function hideLoading() {
                document.getElementById('exportLoading').classList.remove('show');
            }

            // ===== Adet alanını göster/gizle =====
            document.getElementById('toolService').addEventListener('change', function() {
                const needsCount = ['weeklyContent', 'viralIdeas', 'digitalProducts', 'videoScript'];
                document.getElementById('countRow').style.display = needsCount.includes(this.value) ? 'block' : 'none';
            });
            document.getElementById('toolService').dispatchEvent(new Event('change'));

            // ===== Kontrol değişkenleri =====
            const PROXY_URL = 'https://falling-sound-3ffcgemini-proxyjs.faroukgrup.workers.dev/';
            let abortController = null;
            let generationInProgress = false;
            let generatedContent = '';

            // ===== Temizlik ve görüntüleme =====
            function cleanText(text) {
                return text.replace(/Support Pollinations\.AI[\s\S]*/i, '')
                    .replace(/Powered by[^\n]*/gi, '')
                    .replace(/https?:\/\/[^\s]*/gi, '')
                    .replace(/\n\s*\n/g, '\n\n').trim();
            }

            function displayContent(text, service, count) {
                const output = document.getElementById('aiOutput');
                output.innerHTML = '';
                const cleaned = cleanText(text);
                const sections = cleaned.split(/###/);

                if (sections.length > 1) {
                    sections.forEach(sec => {
                        if (sec.trim().length < 5) return;
                        const lines = sec.trim().split('\n');
                        const title = lines[0].replace(/[:\-*]/g, '').trim();
                        const body = lines.slice(1).join('\n').trim();
                        const card = document.createElement('div');
                        card.className = 'content-card';
                        if (title && body) {
                            card.innerHTML = `<h3>${title}</h3><p>${body.replace(/\n/g, '<br>')}</p>`;
                        } else {
                            card.innerHTML = `<p>${sec.replace(/\n/g, '<br>')}</p>`;
                        }
                        output.appendChild(card);
                    });
                } else {
                    const card = document.createElement('div');
                    card.className = 'content-card';
                    card.innerHTML = `<p>${cleaned.replace(/\n/g, '<br>')}</p>`;
                    output.appendChild(card);
                }

                const wordCount = cleaned.split(/\s+/).length;
                const charCount = cleaned.length;
                const serviceNames = {
                    reportAnalysis: 'Rapor Analizi',
                    weeklyContent: 'Haftalık Plan',
                    monthlyContent: 'Aylık Plan',
                    viralIdeas: 'Viral Fikirler',
                    buildContent: 'İçerik Oluşturma',
                    digitalProducts: 'Dijital Ürünler',
                    askQuestion: 'Soru Yanıtlama',
                    videoScript: 'Video Metni'
                };
                document.getElementById('kpiCards').innerHTML = `
                    <div class="result-card"><i class="fas fa-tag"></i><h4>Hizmet Türü</h4><div class="value">${serviceNames[service] || service}</div></div>
                    <div class="result-card"><i class="fas fa-file-word"></i><h4>Kelime Sayısı</h4><div class="value">${wordCount}</div></div>
                    <div class="result-card"><i class="fas fa-text-width"></i><h4>Karakter Sayısı</h4><div class="value">${charCount}</div></div>
                    <div class="result-card"><i class="fas fa-layer-group"></i><h4>Bölüm Sayısı</h4><div class="value">${sections.length}</div></div>
                `;
            }

            function finishGeneration() {
                generationInProgress = false;
                document.getElementById('generateBtn').style.display = 'flex';
                document.getElementById('cancelBtn').style.display = 'none';
                abortController = null;
                hideLoading();
            }

            // ===== Proxy ile iletişim =====
            async function callGroqViaProxy(prompt, signal) {
                const controller = new AbortController();
                const timeout = setTimeout(() => controller.abort(), 30000);
                const combinedSignal = signal ? combineSignals(signal, controller.signal) : controller.signal;

                try {
                    const response = await fetch(PROXY_URL, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ prompt }),
                        signal: combinedSignal
                    });
                    clearTimeout(timeout);

                    if (!response.ok) {
                        const errData = await response.json().catch(() => ({}));
                        throw new Error(errData.error || `HTTP ${response.status}`);
                    }

                    const data = await response.json();
                    if (data.choices && data.choices[0]?.message?.content) {
                        return data.choices[0].message.content;
                    }
                    throw new Error('Sunucudan beklenmeyen yanıt');
                } catch (err) {
                    clearTimeout(timeout);
                    if (err.name === 'AbortError' && !signal?.aborted) throw new Error('Bağlantı zaman aşımı');
                    throw err;
                }
            }

            function combineSignals(s1, s2) {
                if (s1.aborted || s2.aborted) return AbortSignal.abort();
                const controller = new AbortController();
                s1.addEventListener('abort', () => controller.abort());
                s2.addEventListener('abort', () => controller.abort());
                return controller.signal;
            }

            // ===== Oluşturma butonu =====
            document.getElementById('generateBtn').addEventListener('click', async function() {
                if (generationInProgress) return;

                const service = document.getElementById('toolService').value;
                const prompt = document.getElementById('userPrompt').value.trim();
                const count = document.getElementById('itemCount')?.value || 7;

                if (!prompt) {
                    alert('Lütfen metni girin.');
                    return;
                }

                abortController = new AbortController();
                generationInProgress = true;
                document.getElementById('generateBtn').style.display = 'none';
                document.getElementById('cancelBtn').style.display = 'flex';
                document.getElementById('initialMessage').style.display = 'none';
                document.getElementById('resultsSection').style.display = 'none';
                showLoading('Oluşturuluyor...', 'Lütfen bekleyin');

                let instruction = '';
                if (service === 'reportAnalysis') instruction = `Aşağıdaki raporu analiz et. Bölümler: Yönetici özeti, Analiz, Güçlü/zayıf yönler, Öneriler.`;
                else if (service === 'weeklyContent') instruction = `Haftalık içerik planı (${count} gün).`;
                else if (service === 'monthlyContent') instruction = `Aylık plan (4 hafta).`;
                else if (service === 'viralIdeas') instruction = `${count} viral fikir.`;
                else if (service === 'buildContent') instruction = `Tam içerik (Giriş, 3 bölüm, Sonuç).`;
                else if (service === 'digitalProducts') instruction = `${count} dijital ürün.`;
                else if (service === 'askQuestion') instruction = `Detaylı cevap ver.`;
                else if (service === 'videoScript') instruction = `${count} video metni.`;

                const fullPrompt = `${instruction}\nDetaylar:\n${prompt}\nDil: Türkçe. Başlıklar için ### kullan.`;

                try {
                    const result = await callGroqViaProxy(fullPrompt, abortController.signal);
                    generatedContent = result;
                    document.getElementById('resultsSection').style.display = 'block';
                    displayContent(result, service, count);
                } catch (err) {
                    if (err.name === 'AbortError') {
                        document.getElementById('aiOutput').innerHTML = '<p style="color:#fbbf24; text-align:center;">İstek iptal edildi.</p>';
                    } else {
                        document.getElementById('aiOutput').innerHTML = `<p style="color:#f87171; text-align:center;">${err.message}</p>`;
                    }
                    document.getElementById('resultsSection').style.display = 'block';
                } finally {
                    finishGeneration();
                }
            });

            // ===== İptal butonu =====
            document.getElementById('cancelBtn').addEventListener('click', function() {
                if (abortController) abortController.abort();
            });

            // ===== Word Dışa Aktar =====
            document.getElementById('exportWordBtn').addEventListener('click', function() {
                if (!generatedContent) {
                    alert('Dışa aktarılacak içerik yok.');
                    return;
                }

                const contentHtml = document.getElementById('aiOutput').innerHTML;
                const html = `<!DOCTYPE html>
                <html dir="rtl">
                <head>
                    <meta charset="UTF-8">
                    <title>Akıllı İçerik Raporu</title>
                    <style>
                        body { font-family: 'Tajawal', sans-serif; padding: 20px; background: #fff; color: #333; }
                        h3 { color: #b8860b; border-bottom: 2px solid #b8860b; padding-bottom: 8px; }
                        .content-card { border: 1px solid #ddd; border-radius: 12px; padding: 15px; margin-bottom: 15px; }
                        .footer { margin-top: 30px; color: #888; text-align: center; border-top: 1px solid #ddd; padding-top: 15px; }
                    </style>
                </head>
                <body>
                    ${contentHtml}
                    <div class="footer">FAROUK GRUP tarafından oluşturulmuştur | ${new Date().toLocaleDateString('tr-TR')}</div>
                </body>
                </html>`;

                const blob = new Blob(['\uFEFF' + html], { type: 'application/msword' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `Akilli_Icerik_${new Date().toISOString().slice(0,10)}.doc`;
                a.click();
                URL.revokeObjectURL(a.href);
            });

        })();
    