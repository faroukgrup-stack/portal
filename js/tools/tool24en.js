
        (function() {
            'use strict';

            // ===== Calculator =====
            const calcDisplay = document.getElementById('calcDisplay');
            let currentCalcInput = '';

            function handleCalc(v) {
                if (v === 'C') { currentCalcInput = ''; calcDisplay.value = ''; return; }
                if (v === '⌫') { currentCalcInput = currentCalcInput.slice(0, -1); calcDisplay.value = currentCalcInput; return; }
                if (v === '=') {
                    try {
                        let r = eval(currentCalcInput.replace(/×/g, '*').replace(/÷/g, '/'));
                        calcDisplay.value = r;
                        currentCalcInput = r.toString();
                    } catch (e) { calcDisplay.value = 'Error'; currentCalcInput = ''; }
                    return;
                }
                currentCalcInput += v;
                calcDisplay.value = currentCalcInput;
            }

            document.querySelectorAll('.calc-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const v = this.dataset.val;
                    if (v !== undefined) handleCalc(v);
                });
            });

            const modalEl = document.getElementById('calculatorModal');
            document.getElementById('calculatorBtn').addEventListener('click', function(e) {
                e.stopPropagation();
                modalEl.classList.add('active');
                calcDisplay.value = currentCalcInput;
            });
            document.getElementById('modalClose').addEventListener('click', function() { modalEl.classList.remove('active'); });
            modalEl.addEventListener('click', function(e) { if (e.target === modalEl) modalEl.classList.remove('active'); });
            document.addEventListener('keydown', function(e) {
                if (!modalEl.classList.contains('active')) return;
                e.preventDefault();
                const k = e.key;
                if (k >= '0' && k <= '9') handleCalc(k);
                else if (k === '.') handleCalc('.');
                else if (k === '+' || k === '-' || k === '*' || k === '/') handleCalc(k);
                else if (k === 'Enter' || k === '=') handleCalc('=');
                else if (k === 'Backspace') handleCalc('⌫');
                else if (k === 'Escape') modalEl.classList.remove('active');
                else if (k.toLowerCase() === 'c') handleCalc('C');
            });

            // ===== Loading functions =====
            function showLoading(title, msg) {
                document.getElementById('loadingTitle').textContent = title;
                document.getElementById('loadingMsg').textContent = msg;
                document.getElementById('exportLoading').classList.add('show');
            }

            function hideLoading() {
                document.getElementById('exportLoading').classList.remove('show');
            }

            // ===== Show/hide count field =====
            document.getElementById('toolService').addEventListener('change', function() {
                const needsCount = ['weeklyContent'];
                document.getElementById('countRow').style.display = needsCount.includes(this.value) ? 'block' : 'none';
            });
            document.getElementById('toolService').dispatchEvent(new Event('change'));

            // ===== Control variables =====
            const PROXY_URL = 'https://falling-sound-3ffcgemini-proxyjs.faroukgrup.workers.dev/';
            let abortController = null;
            let generationInProgress = false;
            let generatedContent = '';

            // ===== Cleaning and display functions =====
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
                    reportAnalysis: 'Report Analysis',
                    weeklyContent: 'Weekly Plan',
                    buildContent: 'Build Content',
                    askQuestion: 'Answer a Question'
                };
                document.getElementById('kpiCards').innerHTML = `
                    <div class="result-card"><i class="fas fa-tag"></i><h4>Service Type</h4><div class="value">${serviceNames[service] || service}</div></div>
                    <div class="result-card"><i class="fas fa-file-word"></i><h4>Word Count</h4><div class="value">${wordCount}</div></div>
                    <div class="result-card"><i class="fas fa-text-width"></i><h4>Character Count</h4><div class="value">${charCount}</div></div>
                    <div class="result-card"><i class="fas fa-layer-group"></i><h4>Sections</h4><div class="value">${sections.length}</div></div>
                `;
            }

            function finishGeneration() {
                generationInProgress = false;
                document.getElementById('generateBtn').style.display = 'flex';
                document.getElementById('cancelBtn').style.display = 'none';
                abortController = null;
                hideLoading();
            }

            // ===== Proxy API call =====
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
                    throw new Error('Unexpected response from server');
                } catch (err) {
                    clearTimeout(timeout);
                    if (err.name === 'AbortError' && !signal?.aborted) throw new Error('Connection timeout');
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

            // ===== Generate button =====
            document.getElementById('generateBtn').addEventListener('click', async function() {
                if (generationInProgress) return;

                const service = document.getElementById('toolService').value;
                const prompt = document.getElementById('userPrompt').value.trim();
                const count = document.getElementById('itemCount')?.value || 7;

                if (!prompt) {
                    alert('Please enter the text.');
                    return;
                }

                abortController = new AbortController();
                generationInProgress = true;
                document.getElementById('generateBtn').style.display = 'none';
                document.getElementById('cancelBtn').style.display = 'flex';
                document.getElementById('initialMessage').style.display = 'none';
                document.getElementById('resultsSection').style.display = 'none';
                showLoading('Generating...', 'Please wait');

                let instruction = '';
                if (service === 'reportAnalysis') instruction = 'Analyze the following report. Sections: Executive Summary, Analysis, Strengths/Weaknesses, Recommendations.';
                else if (service === 'weeklyContent') instruction = `Weekly content plan (${count} days).`;
                else if (service === 'buildContent') instruction = `Full content (introduction, 3 sections, conclusion).`;
                else if (service === 'askQuestion') instruction = `Answer in detail.`;

                const fullPrompt = `${instruction}\nDetails:\n${prompt}\nLanguage: English. Use ### for headings.`;

                try {
                    const result = await callGroqViaProxy(fullPrompt, abortController.signal);
                    generatedContent = result;
                    document.getElementById('resultsSection').style.display = 'block';
                    displayContent(result, service, count);
                } catch (err) {
                    if (err.name === 'AbortError') {
                        document.getElementById('aiOutput').innerHTML = '<p style="color:#fbbf24; text-align:center;">Request cancelled.</p>';
                    } else {
                        document.getElementById('aiOutput').innerHTML = `<p style="color:#f87171; text-align:center;">${err.message}</p>`;
                    }
                    document.getElementById('resultsSection').style.display = 'block';
                } finally {
                    finishGeneration();
                }
            });

            // ===== Cancel button =====
            document.getElementById('cancelBtn').addEventListener('click', function() {
                if (abortController) abortController.abort();
            });

            // ===== Export to Word =====
            document.getElementById('exportWordBtn').addEventListener('click', function() {
                if (!generatedContent) {
                    alert('No content to export.');
                    return;
                }

                const contentHtml = document.getElementById('aiOutput').innerHTML;
                const html = `<!DOCTYPE html>
                <html dir="ltr">
                <head>
                    <meta charset="UTF-8">
                    <title>Smart Content Report</title>
                    <style>
                        body { font-family: 'Tajawal', sans-serif; padding: 20px; background: #fff; color: #333; }
                        h3 { color: #b8860b; border-bottom: 2px solid #b8860b; padding-bottom: 8px; }
                        .content-card { border: 1px solid #ddd; border-radius: 12px; padding: 15px; margin-bottom: 15px; }
                        .footer { margin-top: 30px; color: #888; text-align: center; border-top: 1px solid #ddd; padding-top: 15px; }
                    </style>
                </head>
                <body>
                    ${contentHtml}
                    <div class="footer">Created by FAROUK GRUP for Consulting & Business | ${new Date().toLocaleDateString('en-US')}</div>
                </body>
                </html>`;

                const blob = new Blob(['\uFEFF' + html], { type: 'application/msword' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = `Smart_Content_${new Date().toISOString().slice(0,10)}.doc`;
                a.click();
                URL.revokeObjectURL(a.href);
            });

        })();
    