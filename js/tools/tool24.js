
        (function() {
            'use strict';

            // ===== دوال التحميل =====
            function showLoading(title, msg) {
                document.getElementById('loadingTitle').textContent = title;
                document.getElementById('loadingMsg').textContent = msg;
                document.getElementById('exportLoading').classList.add('show');
            }

            function hideLoading() {
                document.getElementById('exportLoading').classList.remove('show');
            }

            // ===== إظهار/إخفاء حقل العدد =====
            document.getElementById('toolService').addEventListener('change', function() {
                const needsCount = ['weeklyContent', 'viralIdeas', 'digitalProducts', 'videoScript'];
                document.getElementById('countRow').style.display = needsCount.includes(this.value) ? 'block' : 'none';
            });
            document.getElementById('toolService').dispatchEvent(new Event('change'));

            // ===== متغيرات التحكم =====
            // الطلب يمرّ عبر Edge Function "ai-content" (التعليمات ومفتاح النموذج محفوظة على الخادم)
            let abortController = null;
            let generationInProgress = false;
            let generatedContent = '';

            // ===== دوال التنظيف والعرض =====
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

                // إحصائيات سريعة
                const wordCount = cleaned.split(/\s+/).length;
                const charCount = cleaned.length;
                const serviceNames = {
                    reportAnalysis: T('s1'),
                    weeklyContent: T('s2'),
                    monthlyContent: T('s3'),
                    viralIdeas: T('s4'),
                    buildContent: T('s5'),
                    digitalProducts: T('s6'),
                    askQuestion: T('s7'),
                    videoScript: T('s8')
                };
                document.getElementById('kpiCards').innerHTML = `${T('s9')}${serviceNames[service] || service}${T('s10')}${wordCount}${T('s11')}${charCount}${T('s12')}${sections.length}</div></div>
                `;
            }

            function finishGeneration() {
                generationInProgress = false;
                document.getElementById('generateBtn').style.display = 'flex';
                document.getElementById('cancelBtn').style.display = 'none';
                abortController = null;
                hideLoading();
            }

            // ===== الاتصال بالـ Proxy =====
            async function callAIServer(payload, signal) {
                return await new Promise((resolve, reject) => {
                    const timeout = setTimeout(() => reject(new Error(T('s14'))), 30000);
                    if (signal) signal.addEventListener('abort', () => {
                        clearTimeout(timeout);
                        const e = new Error('aborted'); e.name = 'AbortError'; reject(e);
                    });
                    FG.ai(payload).then(content => {
                        clearTimeout(timeout);
                        if (content) resolve(content); else reject(new Error(T('s13')));
                    }, err => { clearTimeout(timeout); reject(err); });
                });
            }


            // ===== زر التوليد =====
            document.getElementById('generateBtn').addEventListener('click', async function() {
                if (generationInProgress) return;

                const service = document.getElementById('toolService').value;
                const prompt = document.getElementById('userPrompt').value.trim();
                const count = document.getElementById('itemCount')?.value || 7;

                if (!prompt) {
                    alert(T('s15'));
                    return;
                }

                abortController = new AbortController();
                generationInProgress = true;
                document.getElementById('generateBtn').style.display = 'none';
                document.getElementById('cancelBtn').style.display = 'flex';
                document.getElementById('initialMessage').style.display = 'none';
                document.getElementById('resultsSection').style.display = 'none';
                showLoading(T('s16'), T('s17'));

                try {
                    const result = await callAIServer({ service, prompt, count }, abortController.signal);
                    generatedContent = result;
                    document.getElementById('resultsSection').style.display = 'block';
                    displayContent(result, service, count);
                } catch (err) {
                    if (err.name === 'AbortError') {
                        document.getElementById('aiOutput').innerHTML = T('s29');
                    } else {
                        document.getElementById('aiOutput').innerHTML = `<p style="color:#f87171; text-align:center;">${err.message}</p>`;
                    }
                    document.getElementById('resultsSection').style.display = 'block';
                } finally {
                    finishGeneration();
                }
            });

            // ===== زر الإلغاء =====
            document.getElementById('cancelBtn').addEventListener('click', function() {
                if (abortController) abortController.abort();
            });

            // ===== تصدير Word =====
            document.getElementById('exportWordBtn').addEventListener('click', function() {
                if (!generatedContent) {
                    alert(T('s30'));
                    return;
                }

                const contentHtml = document.getElementById('aiOutput').innerHTML;
                const html = `${T('s31')}${contentHtml}${T('s32')}${new Date().toLocaleDateString(FG.locale())}</div>
                </body>
                </html>`;

                const blob = new Blob(['\uFEFF' + html], { type: 'application/msword' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `${T('s33')}${new Date().toISOString().slice(0,10)}.doc`;
                a.click();
                URL.revokeObjectURL(a.href);
            });

        })();
    