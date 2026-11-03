
        (function() {
            'use strict';

            // ===== Hesap makinesi =====
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
                    } catch (e) { calcDisplay.value = 'Hata'; currentCalcInput = ''; }
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

            // ===== Yükleme fonksiyonları =====
            function showLoading(title, msg) {
                document.getElementById('loadingTitle').textContent = title;
                document.getElementById('loadingMsg').textContent = msg;
                document.getElementById('exportLoading').classList.add('show');
            }

            function hideLoading() {
                document.getElementById('exportLoading').classList.remove('show');
            }

            // ===== Genel değişkenler =====
            let currentStage = 'post';
            let valuationChart = null;
            let globalSaaSData = null;

            function fmtNum(n) {
                return Math.round(n).toLocaleString('en-US');
            }

            window.switchStage = function(stage) {
                currentStage = stage;
                document.getElementById('stagePostRevenue').classList.toggle('active', stage === 'post');
                document.getElementById('stagePreRevenue').classList.toggle('active', stage === 'pre');
                document.getElementById('postRevenueSection').style.display = (stage === 'post') ? 'block' : 'none';
                document.getElementById('preRevenueSection').style.display = (stage === 'pre') ? 'block' : 'none';
                document.getElementById('resultsSection').style.display = 'none';
                document.getElementById('initialMessage').style.display = 'block';
            };

            // ===== Ana hesaplama =====
            function computeSaaS() {
                const cur = document.getElementById('currencySelect').value;

                if (currentStage === 'pre') {
                    const berkus = ['berkusIdea', 'berkusPrototype', 'berkusTeam', 'berkusRelations', 'berkusExecution']
                        .map(id => Math.min(parseFloat(document.getElementById(id).value) || 0, 500000))
                        .reduce((a, b) => a + b, 0);
                    const rebuild = parseFloat(document.getElementById('rebuildCost').value) || 0;
                    const risk = parseFloat(document.getElementById('riskPremium').value) || 0;
                    const riskCost = rebuild * (1 + risk / 100);
                    return {
                        stage: 'pre',
                        currency: cur,
                        berkusTotal: berkus,
                        riskAdjustedCost: riskCost,
                        preLow: Math.min(berkus, riskCost),
                        preBase: (berkus + riskCost) / 2,
                        preHigh: Math.max(berkus, riskCost)
                    };
                }

                // Gelir sonrası
                const ARR = parseFloat(document.getElementById('arrInput').value) || 0;
                const growth = parseFloat(document.getElementById('growthRate').value) || 0;
                const gross = parseFloat(document.getElementById('grossMargin').value) || 0;
                const margin = parseFloat(document.getElementById('profitMargin').value) || 0;
                const churn = parseFloat(document.getElementById('churnRate').value) || 0;
                const nrr = parseFloat(document.getElementById('nrrInput').value) || 100;
                const cust = parseFloat(document.getElementById('customersCount').value) || 0;
                const cac = parseFloat(document.getElementById('cacInput').value) || 0;
                const ltv = parseFloat(document.getElementById('ltvInput').value) || 0;
                const netBurn = parseFloat(document.getElementById('netBurnRate').value) || 0;
                const cash = parseFloat(document.getElementById('cashOnHand').value) || 0;
                const arrQ = parseFloat(document.getElementById('arrCurrentQ').value);
                const arrPrevQ = parseFloat(document.getElementById('arrPrevQ').value);
                const salesMkt = parseFloat(document.getElementById('salesMarketingPrevQ').value);
                const exitVal = parseFloat(document.getElementById('exitValue').value) || 0;
                const roi = parseFloat(document.getElementById('roiMultiple').value) || 10;

                const rule40 = growth + margin;
                const ltvCac = cac > 0 ? ltv / cac : 0;
                const grossRatio = gross / 100;
                const mrrPerCust = cust > 0 ? (ARR / 12) / cust : 0;
                const cacPayback = (mrrPerCust > 0 && cac > 0) ? cac / (mrrPerCust * grossRatio) : null;

                let magicNum, magicEst = false;
                if (!isNaN(arrQ) && !isNaN(arrPrevQ) && !isNaN(salesMkt) && salesMkt > 0 && arrPrevQ > 0) {
                    magicNum = ((arrQ - arrPrevQ) * 4) / salesMkt;
                } else {
                    magicNum = (growth > 0 && netBurn > 0) ? (ARR * (growth / 100)) / (netBurn * 12 * 0.6) : 0;
                    magicEst = true;
                }
                document.getElementById('magicNumberNote').style.display = magicEst ? 'block' : 'none';

                const netNewARR = ARR * (growth / 100);
                const burnMult = (netNewARR > 0 && netBurn > 0) ? (netBurn * 12) / netNewARR : null;
                const runway = netBurn > 0 ? cash / netBurn : Infinity;

                // Puanlama ile çarpan belirleme
                let score = 0;
                if (growth >= 100) score += 40;
                else if (growth >= 50) score += 30 + (growth - 50) * 0.2;
                else if (growth >= 20) score += 15 + (growth - 20) * 0.5;
                else score += growth * 0.75;

                if (gross >= 80) score += 15;
                else if (gross >= 60) score += 10 + (gross - 60) * 0.25;

                if (nrr >= 130) score += 15;
                else if (nrr >= 100) score += 10 + (nrr - 100) * 0.166;

                if (churn <= 1) score += 10;
                else if (churn <= 2) score += 8;
                else if (churn <= 5) score += 4;

                if (ltvCac >= 5) score += 10;
                else if (ltvCac >= 3) score += 6 + (ltvCac - 3) * 2;
                else if (ltvCac >= 1) score += ltvCac * 2;

                if (rule40 >= 40) score += 10;
                else if (rule40 >= 0) score += rule40 * 0.25;

                const baseMult = 2 + (score / 100) * 18;
                const lowMult = Math.max(1.5, baseMult - 2.2);
                const highMult = Math.min(22, baseMult + 2.2);

                const evLow = ARR * lowMult;
                const evBase = ARR * baseMult;
                const evHigh = ARR * highMult;

                const vcBase = roi > 0 ? exitVal / roi : 0;
                const vcLow = vcBase * 0.7;
                const vcHigh = vcBase * 1.4;

                return {
                    stage: 'post',
                    currency: cur,
                    ARR,
                    growthRate: growth,
                    grossMargin: gross,
                    profitMargin: margin,
                    churn,
                    nrr,
                    ltvCac,
                    cacPaybackMonths: cacPayback,
                    magicNumber: magicNum,
                    magicEstimated: magicEst,
                    burnMultiple: burnMult,
                    runwayMonths: runway,
                    rule40,
                    lowMultiple: lowMult,
                    baseMultiple: baseMult,
                    highMultiple: highMult,
                    evLow,
                    evBase,
                    evHigh,
                    vcLow,
                    vcBase,
                    vcHigh
                };
            }

            // ===== Sonuçları göster =====
            function displayResults(res) {
                document.getElementById('initialMessage').style.display = 'none';
                document.getElementById('resultsSection').style.display = 'block';
                const cur = res.currency;

                if (res.stage === 'post') {
                    document.getElementById('kpiCards').innerHTML = `
                        <div class="result-card"><i class="fas fa-sync-alt"></i><h4>Tekrarlayan Gelir</h4><div class="value">${cur}${(res.ARR/1000).toFixed(0)}K</div></div>
                        <div class="result-card"><i class="fas fa-chart-line"></i><h4>Büyüme Oranı</h4><div class="value">${res.growthRate.toFixed(1)}%</div></div>
                        <div class="result-card"><i class="fas fa-undo-alt"></i><h4>Net Elde Tutma</h4><div class="value">${res.nrr.toFixed(0)}%</div></div>
                        <div class="result-card"><i class="fas fa-balance-scale"></i><h4>LTV/CAC Oranı</h4><div class="value">${res.ltvCac.toFixed(2)}x</div></div>
                        <div class="result-card"><i class="fas fa-clock"></i><h4>CAC Geri Ödeme</h4><div class="value">${res.cacPaybackMonths !== null ? res.cacPaybackMonths.toFixed(1)+' ay' : 'Mevcut değil'}</div></div>
                        <div class="result-card"><i class="fas fa-magic"></i><h4>Sihirli Sayı</h4><div class="value">${res.magicNumber.toFixed(2)}${res.magicEstimated ? '*' : ''}</div></div>
                        <div class="result-card"><i class="fas fa-fire"></i><h4>Yanma Çarpanı</h4><div class="value">${res.burnMultiple !== null ? res.burnMultiple.toFixed(2)+'x' : 'Mevcut değil'}</div></div>
                        <div class="result-card"><i class="fas fa-hourglass-half"></i><h4>Nakit Parkuru</h4><div class="value">${isFinite(res.runwayMonths) ? res.runwayMonths.toFixed(1)+' ay' : '∞'}</div></div>
                    `;

                    let badgeClass = 'status-good';
                    if (res.rule40 < 20) badgeClass = 'status-bad';
                    else if (res.rule40 < 40) badgeClass = 'status-warning';
                    document.getElementById('rule40Badge').innerHTML = `
                        <span class="status ${badgeClass}" style="font-size:1.1rem;padding:0.4rem 1.2rem;">
                            Kural 40: ${res.rule40.toFixed(1)}% (Büyüme ${res.growthRate}% + Marj ${res.profitMargin}%) – ${res.rule40 >= 40 ? '✅ Karşılanıyor' : '⚠️ Karşılanmıyor'}
                        </span>
                    `;

                    document.getElementById('valuationTable').innerHTML = `
                        <table>
                            <thead><tr><th>Yöntem</th><th>Düşük</th><th>Baz</th><th>Yüksek</th></tr></thead>
                            <tbody>
                                <tr><td><strong>Gelir Çarpanı (${res.baseMultiple.toFixed(1)}x)</strong></td><td>${cur}${(res.evLow/1e6).toFixed(2)} Mn</td><td class="highlight">${cur}${(res.evBase/1e6).toFixed(2)} Mn</td><td>${cur}${(res.evHigh/1e6).toFixed(2)} Mn</td></tr>
                                <tr><td><strong>VC Yöntemi</strong></td><td>${cur}${(res.vcLow/1e6).toFixed(2)} Mn</td><td class="highlight">${cur}${(res.vcBase/1e6).toFixed(2)} Mn</td><td>${cur}${(res.vcHigh/1e6).toFixed(2)} Mn</td></tr>
                                <tr style="background:rgba(180,133,84,0.08);"><td><strong>📊 Genel Aralık</strong></td><td><strong>${cur}${(Math.min(res.evLow,res.vcLow)/1e6).toFixed(2)} Mn</strong></td><td><strong>${cur}${(((res.evBase+res.vcBase)/2)/1e6).toFixed(2)} Mn</strong></td><td><strong>${cur}${(Math.max(res.evHigh,res.vcHigh)/1e6).toFixed(2)} Mn</strong></td></tr>
                            </tbody>
                        </table>
                    `;

                    let explainHtml = `<h4 style="color:#cfa776;">📝 Sonuç Yorumu</h4>`;
                    explainHtml += `<p><strong>Kural 40:</strong> ${res.rule40.toFixed(1)}% – ${res.rule40 >= 40 ? '✅ Mükemmel, büyüme ve kârlılık dengeli.' : '⚠️ %40\'ın altında, kârlılığı veya büyümeyi iyileştirmeniz gerekebilir.'}</p>`;
                    explainHtml += `<p><strong>LTV/CAC Oranı:</strong> ${res.ltvCac.toFixed(2)}x – ${res.ltvCac >= 3 ? '✅ Sağlıklı oran, edinim maliyeti iyi karşılanıyor.' : '⚠️ 3x\'in altında, pazarlama verimliliği artırılmalı.'}</p>`;
                    explainHtml += `<p><strong>CAC Geri Ödeme Süresi:</strong> ${res.cacPaybackMonths !== null ? res.cacPaybackMonths.toFixed(1)+' ay' : 'Mevcut değil'} – ${res.cacPaybackMonths !== null && res.cacPaybackMonths < 12 ? '✅ Hızlı geri ödeme.' : '⚠️ Nispeten uzun geri ödeme süresi.'}</p>`;
                    explainHtml += `<p><strong>Sihirli Sayı:</strong> ${res.magicNumber.toFixed(2)} – ${res.magicNumber >= 1 ? '✅ Pazarlama harcamaları verimli.' : '⚠️ Pazarlama yatırım getirisi düşük.'}</p>`;
                    explainHtml += `<p><strong>Yanma Çarpanı:</strong> ${res.burnMultiple !== null ? res.burnMultiple.toFixed(2)+'x' : 'Mevcut değil'} – ${res.burnMultiple !== null && res.burnMultiple < 1.5 ? '✅ Büyümeye göre etkin nakit tüketimi.' : '⚠️ Yeni gelire göre yanma oranı yüksek.'}</p>`;
                    explainHtml += `<p><strong>Nakit Parkuru:</strong> ${isFinite(res.runwayMonths) ? res.runwayMonths.toFixed(1)+' ay' : '∞'} – ${isFinite(res.runwayMonths) && res.runwayMonths > 18 ? '✅ 18 aydan fazla likidite.' : '⚠️ Yakında finansman turu gerekebilir.'}</p>`;
                    explainHtml += `<p style="margin-top:1rem;"><strong>💡 Özet:</strong> Şirketin baz değerlemesi <strong>${cur}${(Math.min(res.evLow,res.vcLow)/1e6).toFixed(2)} Mn – ${cur}${(Math.max(res.evHigh,res.vcHigh)/1e6).toFixed(2)} Mn</strong> aralığındadır. Yatırım görüşmelerinde bu aralık kullanılabilir.</p>`;
                    document.getElementById('explainSection').innerHTML = explainHtml;

                    document.getElementById('additionalNotes').innerHTML = `${res.magicEstimated ? '⚠️ Sihirli Sayı tahminidir. Kesin değer için çeyreklik verileri girin. ' : ''}💰 Nakit Parkuru ve Yanma Çarpanı aylık net nakit tüketimine göre hesaplanmıştır.`;

                    const ctx = document.getElementById('valuationChart').getContext('2d');
                    if (valuationChart) valuationChart.destroy();
                    valuationChart = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: ['Düşük', 'Baz', 'Yüksek'],
                            datasets: [
                                { label: 'Gelir Çarpanı', data: [res.evLow / 1e6, res.evBase / 1e6, res.evHigh / 1e6], backgroundColor: '#c9a050' },
                                { label: 'VC Yöntemi', data: [res.vcLow / 1e6, res.vcBase / 1e6, res.vcHigh / 1e6], backgroundColor: '#4a7a8c' }
                            ]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { labels: { color: '#f0f4fa' } } },
                            scales: {
                                y: { ticks: { callback: v => v + ' Mn', color: '#f0f4fa' }, grid: { color: 'rgba(180,133,84,0.15)' } },
                                x: { ticks: { color: '#f0f4fa' } }
                            }
                        }
                    });

                } else {
                    // Gelir öncesi
                    document.getElementById('kpiCards').innerHTML = `
                        <div class="result-card"><i class="fas fa-seedling"></i><h4>Berkus Değerlemesi</h4><div class="value">${cur}${(res.berkusTotal/1000).toFixed(0)} K</div></div>
                        <div class="result-card"><i class="fas fa-cogs"></i><h4>İkame Maliyet</h4><div class="value">${cur}${(res.riskAdjustedCost/1000).toFixed(0)} K</div></div>
                    `;
                    document.getElementById('rule40Badge').innerHTML = '';
                    document.getElementById('valuationTable').innerHTML = `
                        <table>
                            <thead><tr><th>Yöntem</th><th>Değer</th></tr></thead>
                            <tbody>
                                <tr><td><strong>Berkus Yöntemi</strong></td><td class="highlight">${cur}${(res.berkusTotal/1000).toFixed(0)} K</td></tr>
                                <tr><td><strong>İkame Maliyet</strong></td><td class="highlight">${cur}${(res.riskAdjustedCost/1000).toFixed(0)} K</td></tr>
                                <tr style="background:rgba(180,133,84,0.08);"><td><strong>📊 Genel Aralık</strong></td><td><strong>${cur}${(res.preLow/1000).toFixed(0)} K – ${cur}${(res.preHigh/1000).toFixed(0)} K</strong></td></tr>
                            </tbody>
                        </table>
                    `;
                    document.getElementById('explainSection').innerHTML = `
                        <h4 style="color:#cfa776;">📝 Sonuç Yorumu</h4>
                        <p>Gelir öncesi aşamada değerleme aralığı Berkus ve İkame Maliyet yöntemlerine göre sunulmaktadır. Aralık, iki yöntem arasındaki minimum ve maksimum değerleri yansıtır.</p>
                        <p><strong>Berkus Değerlemesi:</strong> ${cur}${(res.berkusTotal/1000).toFixed(0)} K – Beş faktöre dayanır: fikir, prototip, ekip, ilişkiler ve uygulama.</p>
                        <p><strong>İkame Maliyet:</strong> ${cur}${(res.riskAdjustedCost/1000).toFixed(0)} K – Teknolojiyi yeniden inşa maliyeti artı risk primi.</p>
                        <p style="margin-top:1rem;"><strong>💡 Özet:</strong> Şirketin tahmini değerleme aralığı <strong>${cur}${(res.preLow/1000).toFixed(0)} K – ${cur}${(res.preHigh/1000).toFixed(0)} K</strong>'dir. Tohum turu görüşmelerinde kullanılabilir.</p>
                    `;
                    document.getElementById('additionalNotes').innerHTML = 'Erken aşama değerlemeleri doğası gereği tahminidir. Gerçek rakamlar yatırımcıların ikna olmasına ve sunum kalitesine bağlıdır.';

                    if (valuationChart) { valuationChart.destroy(); valuationChart = null; }
                    document.getElementById('valuationChart').parentElement.style.display = 'none';
                }

                globalSaaSData = res;
            }

            // ===== Hesapla butonu =====
            document.getElementById('calculateBtn').addEventListener('click', function() {
                const res = computeSaaS();
                displayResults(res);
            });

            // ========== Excel Dışa Aktar ==========
            async function exportToFullExcel() {
                if (!globalSaaSData) { alert('Lütfen önce analiz yapın.'); return; }
                showLoading('Profesyonel Excel raporu oluşturuluyor...', 'Sayfalar ve grafikler oluşturuluyor');
                try {
                    const D = globalSaaSData;
                    const cur = D.currency;
                    const company = document.getElementById('companyName').value || 'Şirket';

                    const workbook = new ExcelJS.Workbook();
                    workbook.creator = 'FAROUK GRUP';
                    workbook.created = new Date();

                    const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050';
                    const AR = 'FFF5F0E8', W = 'FFFFFFFF', DT = 'FF1A1A1A', PB = 'FFD4EDDA', NB = 'FFF8D7DA';
                    const PT = 'FF155724', NT = 'FF721C24', GB = 'FFFFF3CD';

                    function hs(bg = HB, tc = GL) { return { font: { name: 'Arial', bold: true, size: 11, color: { argb: tc } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }, alignment: { horizontal: 'center', vertical: 'middle', wrapText: true, readingOrder: 'rtl' }, border: { top: { style: 'thin', color: { argb: G } }, bottom: { style: 'thin', color: { argb: G } }, left: { style: 'thin', color: { argb: G } }, right: { style: 'thin', color: { argb: G } } } }; }

                    function cs(bg = W, tc = DT, b = false, h = 'center') { return { font: { name: 'Arial', bold: b, size: 10, color: { argb: tc } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }, alignment: { horizontal: h, vertical: 'middle', wrapText: true, readingOrder: 'rtl' }, border: { top: { style: 'hair', color: { argb: 'FFCCCCCC' } }, bottom: { style: 'hair', color: { argb: 'FFCCCCCC' } }, left: { style: 'hair', color: { argb: 'FFCCCCCC' } }, right: { style: 'hair', color: { argb: 'FFCCCCCC' } } } }; }

                    function ap(c, s) { if (s.font) c.font = s.font; if (s.fill) c.fill = s.fill; if (s.alignment) c.alignment = s.alignment; if (s.border) c.border = s.border; if (s.numFmt) c.numFmt = s.numFmt; }

                    function mh(ws, fc, tc, r, text, bg = HB, tc2 = GL, fs = 12) { ws.mergeCells(r, fc, r, tc); const c = ws.getCell(r, fc); c.value = text; c.font = { name: 'Arial', bold: true, size: fs, color: { argb: tc2 } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }; c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true, readingOrder: 'rtl' }; c.border = { top: { style: 'medium', color: { argb: G } }, bottom: { style: 'medium', color: { argb: G } }, left: { style: 'medium', color: { argb: G } }, right: { style: 'medium', color: { argb: G } } }; }

                    // 1. Kapak
                    const cv = workbook.addWorksheet('Kapak', { views: [{ rightToLeft: true, showGridLines: false }] });
                    [8, 45, 35, 8].forEach((w, i) => cv.getColumn(i + 1).width = w);
                    for (let r = 1; r <= 40; r++) cv.getRow(r).height = 22;
                    cv.getRow(2).height = 80;
                    cv.getRow(4).height = 60;
                    cv.mergeCells(2, 1, 2, 4);
                    const bc = cv.getCell(2, 1);
                    bc.value = 'FAROUK GRUP\nDanışmanlık ve İşletme';
                    bc.font = { name: 'Arial', bold: true, size: 28, color: { argb: GL } };
                    bc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DB } };
                    bc.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true, readingOrder: 'rtl' };
                    bc.border = { bottom: { style: 'thick', color: { argb: G } } };
                    mh(cv, 1, 4, 4, `SaaS Girişim Değerleme Raporu\n${company}`, DB, GL, 18);
                    const inf = [
                        ['📋 Şirket', company],
                        ['📅 Tarih', new Date().toLocaleDateString('tr-TR')],
                        ['💰 Para Birimi', cur],
                        ['📊 Aşama', D.stage === 'post' ? 'Gelir Sonrası' : 'Gelir Öncesi']
                    ];
                    if (D.stage === 'post') {
                        inf.push(['📈 Baz Değerleme', `${cur} ${fmtNum((D.evBase + D.vcBase) / 2)}`]);
                        inf.push(['🔢 Gelir Çarpanı', `${D.baseMultiple.toFixed(2)}x`]);
                        inf.push(['🎯 Kural 40', `${D.rule40.toFixed(1)}%`]);
                    } else {
                        inf.push(['📈 Berkus Değerlemesi', `${cur} ${fmtNum(D.berkusTotal)}`]);
                        inf.push(['🔧 İkame Maliyet', `${cur} ${fmtNum(D.riskAdjustedCost)}`]);
                    }
                    let ir = 6;
                    inf.forEach(([l, v], idx) => {
                        cv.mergeCells(ir, 1, ir, 2);
                        cv.mergeCells(ir, 3, ir, 4);
                        const lc = cv.getCell(ir, 1), vc = cv.getCell(ir, 3);
                        lc.value = l; vc.value = v;
                        const bg = idx % 2 === 0 ? AR : 'FFFEFCF6';
                        ap(lc, { font: { name: 'Arial', bold: true, size: 11, color: { argb: '00695C' } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }, alignment: { horizontal: 'right', vertical: 'middle', readingOrder: 'rtl' }, border: { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' }, right: { style: 'hair' } } });
                        ap(vc, { font: { name: 'Arial', size: 11, color: { argb: DT } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }, alignment: { horizontal: 'center', vertical: 'middle', readingOrder: 'rtl' }, border: { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' }, right: { style: 'hair' } } });
                        cv.getRow(ir).height = 28;
                        ir++;
                    });

                    // 2. Girdiler
                    const inputsSheet = workbook.addWorksheet('Girdiler', { views: [{ rightToLeft: true, showGridLines: false }] });
                    inputsSheet.getColumn(1).width = 5;
                    inputsSheet.getColumn(2).width = 38;
                    inputsSheet.getColumn(3).width = 22;
                    inputsSheet.getColumn(4).width = 22;
                    inputsSheet.getColumn(5).width = 5;
                    mh(inputsSheet, 1, 5, 1, '📋 Girdi Tablosu', DB, GL, 14);
                    inputsSheet.getRow(1).height = 40;
                    mh(inputsSheet, 2, 4, 2, 'Temel Veriler', SB, W, 11);
                    inputsSheet.getRow(2).height = 28;

                    let iRow = 3;
                    const addInputRow = (label, val, note = '') => {
                        inputsSheet.getRow(iRow).height = 24;
                        const bg = iRow % 2 === 0 ? 'FFFEFCF6' : 'FFFFFFFF';
                        const lc = inputsSheet.getCell(iRow, 2), vc = inputsSheet.getCell(iRow, 3), nc = inputsSheet.getCell(iRow, 4);
                        lc.value = label; vc.value = val; nc.value = note;
                        ap(lc, cs(bg, DT, true, 'right'));
                        ap(vc, { ...cs(bg, '0000FF', false, 'center'), numFmt: typeof val === 'number' ? '#,##0.00' : null });
                        ap(nc, cs(bg, '00695C', false, 'center'));
                        iRow++;
                    };

                    if (D.stage === 'post') {
                        addInputRow('Yıllık Tekrarlayan Gelir (ARR)', D.ARR);
                        addInputRow('Yıllık Büyüme Oranı', D.growthRate, '%');
                        addInputRow('Brüt Kâr Marjı', D.grossMargin, '%');
                        addInputRow('Faaliyet Kâr Marjı', D.profitMargin, '%');
                        addInputRow('Aylık Kayıp Oranı', D.churn, '%');
                        addInputRow('Net Gelir Elde Tutma (NRR)', D.nrr, '%');
                        addInputRow('Müşteri Sayısı', parseFloat(document.getElementById('customersCount').value) || 0);
                        addInputRow('Müşteri Edinim Maliyeti (CAC)', parseFloat(document.getElementById('cacInput').value) || 0);
                        addInputRow('Müşteri Yaşam Boyu Değeri (LTV)', parseFloat(document.getElementById('ltvInput').value) || 0);
                        addInputRow('Net Aylık Nakit Tüketimi', parseFloat(document.getElementById('netBurnRate').value) || 0);
                        addInputRow('Mevcut Nakit', parseFloat(document.getElementById('cashOnHand').value) || 0);
                        addInputRow('Beklenen Çıkış Değeri', parseFloat(document.getElementById('exitValue').value) || 0);
                        addInputRow('Hedef Yatırım Getirisi', parseFloat(document.getElementById('roiMultiple').value) || 10);
                        addInputRow('Çıkış Yılı', parseFloat(document.getElementById('exitYears').value) || 6);
                    } else {
                        addInputRow('Berkus - Fikir', parseFloat(document.getElementById('berkusIdea').value) || 0);
                        addInputRow('Berkus - Prototip', parseFloat(document.getElementById('berkusPrototype').value) || 0);
                        addInputRow('Berkus - Ekip', parseFloat(document.getElementById('berkusTeam').value) || 0);
                        addInputRow('Berkus - İlişkiler', parseFloat(document.getElementById('berkusRelations').value) || 0);
                        addInputRow('Berkus - Uygulama', parseFloat(document.getElementById('berkusExecution').value) || 0);
                        addInputRow('Yeniden İnşa Maliyeti', parseFloat(document.getElementById('rebuildCost').value) || 0);
                        addInputRow('Risk Primi', parseFloat(document.getElementById('riskPremium').value) || 0, '%');
                    }

                    // 3. KPI
                    const kpiSheet = workbook.addWorksheet('Göstergeler', { views: [{ rightToLeft: true, showGridLines: false }] });
                    [5, 32, 22, 22, 22, 5].forEach((w, i) => kpiSheet.getColumn(i + 1).width = w);
                    mh(kpiSheet, 1, 6, 1, '📊 Temel Göstergeler', DB, GL, 15);
                    kpiSheet.getRow(1).height = 45;
                    mh(kpiSheet, 2, 5, 2, `${company} | ${new Date().toLocaleDateString('tr-TR')}`, HB, W, 10);
                    kpiSheet.getRow(2).height = 26;

                    let kpis = [];
                    if (D.stage === 'post') {
                        kpis = [
                            { label: 'Tekrarlayan Gelir (ARR)', value: `${cur} ${fmtNum(D.ARR)}`, good: true },
                            { label: 'Büyüme Oranı', value: `${D.growthRate.toFixed(1)}%`, good: D.growthRate > 20 },
                            { label: 'Net Elde Tutma (NRR)', value: `${D.nrr.toFixed(0)}%`, good: D.nrr >= 100 },
                            { label: 'LTV/CAC Oranı', value: `${D.ltvCac.toFixed(2)}x`, good: D.ltvCac >= 3 },
                            { label: 'CAC Geri Ödeme', value: D.cacPaybackMonths !== null ? `${D.cacPaybackMonths.toFixed(1)} ay` : 'Mevcut değil', good: D.cacPaybackMonths !== null && D.cacPaybackMonths < 12 },
                            { label: 'Sihirli Sayı', value: `${D.magicNumber.toFixed(2)}`, good: D.magicNumber >= 1 },
                            { label: 'Yanma Çarpanı', value: D.burnMultiple !== null ? `${D.burnMultiple.toFixed(2)}x` : 'Mevcut değil', good: D.burnMultiple !== null && D.burnMultiple < 1.5 },
                            { label: 'Nakit Parkuru', value: isFinite(D.runwayMonths) ? `${D.runwayMonths.toFixed(1)} ay` : '∞', good: isFinite(D.runwayMonths) && D.runwayMonths > 12 }
                        ];
                    } else {
                        kpis = [
                            { label: 'Berkus Değerlemesi', value: `${cur} ${fmtNum(D.berkusTotal)}`, good: true },
                            { label: 'İkame Maliyet', value: `${cur} ${fmtNum(D.riskAdjustedCost)}`, good: true },
                            { label: 'Düşük Aralık', value: `${cur} ${fmtNum(D.preLow)}`, good: true },
                            { label: 'Yüksek Aralık', value: `${cur} ${fmtNum(D.preHigh)}`, good: true }
                        ];
                    }

                    let kRow = 3;
                    kpis.forEach((k, idx) => {
                        kpiSheet.getRow(kRow).height = 40;
                        kpiSheet.mergeCells(kRow, 2, kRow, 2);
                        kpiSheet.mergeCells(kRow, 3, kRow, 3);
                        kpiSheet.mergeCells(kRow, 4, kRow, 4);
                        kpiSheet.mergeCells(kRow, 5, kRow, 5);
                        const ic = kpiSheet.getCell(kRow, 2); ic.value = `🔹 ${idx+1}`;
                        const lc2 = kpiSheet.getCell(kRow, 3); lc2.value = k.label;
                        const vc3 = kpiSheet.getCell(kRow, 4); vc3.value = k.value;
                        const nc2 = kpiSheet.getCell(kRow, 5); nc2.value = '';
                        const bg = k.good ? PB : NB, tc = k.good ? PT : NT;
                        [ic, lc2, vc3, nc2].forEach(c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }; c.border = { top: { style: 'thin', color: { argb: G } }, bottom: { style: 'thin', color: { argb: G } }, left: { style: 'thin', color: { argb: G } }, right: { style: 'thin', color: { argb: G } } }; });
                        ic.font = { name: 'Arial', bold: true, size: 14, color: { argb: '555555' } };
                        ic.alignment = { horizontal: 'center', vertical: 'middle' };
                        lc2.font = { name: 'Arial', bold: true, size: 11, color: { argb: DT } };
                        lc2.alignment = { horizontal: 'right', vertical: 'middle', readingOrder: 'rtl' };
                        vc3.font = { name: 'Arial', bold: true, size: 13, color: { argb: tc } };
                        vc3.alignment = { horizontal: 'center', vertical: 'middle' };
                        nc2.font = { name: 'Arial', size: 9, color: { argb: '444444' } };
                        nc2.alignment = { horizontal: 'right', vertical: 'middle', readingOrder: 'rtl' };
                        kRow++;
                    });
                    kRow++;
                    kpiSheet.mergeCells(kRow, 2, kRow, 5);
                    const kFinal = kpiSheet.getCell(kRow, 2);
                    const isGood = D.stage === 'post' ? (D.evBase + D.vcBase) / 2 > 0 : D.preBase > 0;
                    kFinal.value = isGood ? '✅ Değerleme Olumlu' : '⚠️ Değerleme Gözden Geçirilmeli';
                    kFinal.font = { name: 'Arial', bold: true, size: 13, color: { argb: isGood ? PT : '856404' } };
                    kFinal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isGood ? PB : GB } };
                    kFinal.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rtl' };
                    kFinal.border = { top: { style: 'medium', color: { argb: G } }, bottom: { style: 'medium', color: { argb: G } }, left: { style: 'medium', color: { argb: G } }, right: { style: 'medium', color: { argb: G } } };
                    kpiSheet.getRow(kRow).height = 40;

                    // 4. Değerleme Tablosu
                    const valSheet = workbook.addWorksheet('Değerleme Aralığı', { views: [{ rightToLeft: true, showGridLines: false }] });
                    [5, 35, 22, 22, 22, 5].forEach((w, i) => valSheet.getColumn(i + 1).width = w);
                    mh(valSheet, 1, 6, 1, '📊 Değerleme Aralığı', DB, GL, 14);
                    valSheet.getRow(1).height = 40;

                    if (D.stage === 'post') {
                        ['Yöntem', 'Düşük', 'Baz', 'Yüksek'].forEach((h, i) => { const c = valSheet.getCell(2, i + 2); c.value = h; ap(c, hs(SB, GL)); });
                        const data = [
                            [`Gelir Çarpanı (${D.baseMultiple.toFixed(1)}x)`, D.evLow, D.evBase, D.evHigh],
                            ['VC Yöntemi', D.vcLow, D.vcBase, D.vcHigh],
                            ['Genel Aralık', Math.min(D.evLow, D.vcLow), (D.evBase + D.vcBase) / 2, Math.max(D.evHigh, D.vcHigh)]
                        ];
                        data.forEach((row, i) => {
                            const r = 3 + i;
                            valSheet.getRow(r).height = 30;
                            row.forEach((v, j) => {
                                const c = valSheet.getCell(r, j + 2);
                                c.value = v;
                                ap(c, { ...cs(i === 2 ? GB : W, i === 2 ? DT : DT, i === 2 || j === 1, 'center'), numFmt: typeof v === 'number' ? '#,##0' : null });
                                if (j === 0) { c.font = { name: 'Arial', bold: true, size: 10, color: { argb: G } }; c.numFmt = '@'; }
                            });
                        });
                    } else {
                        ['Yöntem', 'Değer'].forEach((h, i) => { const c = valSheet.getCell(2, i + 2); c.value = h; ap(c, hs(SB, GL)); });
                        [
                            ['Berkus Yöntemi', D.berkusTotal],
                            ['İkame Maliyet', D.riskAdjustedCost],
                            ['Aralık', `${fmtNum(D.preLow)} – ${fmtNum(D.preHigh)}`]
                        ].forEach((row, i) => {
                            const r = 3 + i;
                            valSheet.getRow(r).height = 30;
                            const lc = valSheet.getCell(r, 2), vc = valSheet.getCell(r, 3);
                            lc.value = row[0]; vc.value = row[1];
                            ap(lc, cs(W, DT, true, 'right'));
                            ap(vc, { ...cs(W, DT, true, 'center'), numFmt: typeof row[1] === 'number' ? '#,##0' : null });
                            if (typeof row[1] !== 'number') vc.numFmt = '@';
                        });
                    }

                    // 5. Grafik (sadece gelir sonrası)
                    if (D.stage === 'post') {
                        const chartSheet = workbook.addWorksheet('Grafik', { views: [{ rightToLeft: true, showGridLines: false }] });
                        chartSheet.getColumn(1).width = 5;
                        chartSheet.getColumn(2).width = 50;
                        chartSheet.getColumn(3).width = 5;
                        mh(chartSheet, 1, 3, 1, '📈 Değerleme Grafiği', DB, GL, 14);
                        chartSheet.getRow(1).height = 40;
                        const canvasElem = document.getElementById('valuationChart');
                        if (canvasElem) {
                            try {
                                const origBg = canvasElem.style.backgroundColor;
                                canvasElem.style.backgroundColor = '#ffffff';
                                const canvasImg = await html2canvas(canvasElem, { scale: 2, backgroundColor: '#ffffff' });
                                canvasElem.style.backgroundColor = origBg;
                                const imgData = canvasImg.toDataURL('image/png');
                                const imageId = workbook.addImage({ base64: imgData, extension: 'png' });
                                chartSheet.addImage(imageId, { tl: { col: 1, row: 2 }, br: { col: 2, row: 18 }, editAs: 'oneCell' });
                            } catch (err) { /* */ }
                        }
                    }

                    // 6. Öneriler
                    const intSheet = workbook.addWorksheet('Öneriler', { views: [{ rightToLeft: true, showGridLines: false }] });
                    intSheet.getColumn(1).width = 5;
                    intSheet.getColumn(2).width = 50;
                    intSheet.getColumn(3).width = 5;
                    mh(intSheet, 1, 3, 1, '📝 Öneriler ve Yorum', DB, GL, 14);
                    intSheet.getRow(1).height = 45;

                    let sections = [];
                    if (D.stage === 'post') {
                        const baseVal = (D.evBase + D.vcBase) / 2;
                        sections = [
                            { title: '1. Değerleme Özeti', content: `Şirket: ${company}\nBaz Değerleme: ${cur} ${fmtNum(baseVal)}\nGelir Çarpanı: ${D.baseMultiple.toFixed(2)}x\nKural 40: ${D.rule40.toFixed(1)}%` },
                            { title: '2. Metrik Analizi', content: `LTV/CAC Oranı: ${D.ltvCac.toFixed(2)}x\nCAC Geri Ödeme: ${D.cacPaybackMonths !== null ? D.cacPaybackMonths.toFixed(1)+' ay' : 'Mevcut değil'}\nSihirli Sayı: ${D.magicNumber.toFixed(2)}\nYanma Çarpanı: ${D.burnMultiple !== null ? D.burnMultiple.toFixed(2)+'x' : 'Mevcut değil'}\nNakit Parkuru: ${isFinite(D.runwayMonths) ? D.runwayMonths.toFixed(1)+' ay' : '∞'}` },
                            { title: '3. Öneriler', content: baseVal > 0 && D.rule40 >= 20 ? '• Bu aralık yatırım görüşmelerinde kullanılabilir.\n• Zayıf metrikleri iyileştirerek çarpanı yükseltin.\n• Nakit tüketimini ve parkuru sürekli izleyin.' : '• Maliyet ve gelir yapısını gözden geçirin.\n• Pazarlama ve satış verimliliğini artırın.\n• Finansman turu öncesi uzman danışmanlığı alın.' },
                            { title: '4. Uyarı', content: 'Bu analiz tahmini varsayımlara ve puanlama modeline dayanmaktadır. Gerçek sonuçlar farklı olabilir. Yatırım kararları öncesinde finansal uzmana danışılması önerilir.' }
                        ];
                    } else {
                        sections = [
                            { title: '1. Değerleme Özeti', content: `Şirket: ${company} (Gelir Öncesi)\nBerkus Değerlemesi: ${cur} ${fmtNum(D.berkusTotal)}\nİkame Maliyet: ${cur} ${fmtNum(D.riskAdjustedCost)}\nAralık: ${cur} ${fmtNum(D.preLow)} – ${cur} ${fmtNum(D.preHigh)}` },
                            { title: '2. Öneriler', content: '• MVP (Minimum Uygulanabilir Ürün) geliştirmeye odaklanın.\n• Kurucu ekibi ve stratejik ilişkileri güçlendirin.\n• Melek yatırımcı veya tohum fonlarıyla görüşün.\n• Şirket değerlemesi tohum turu aralığındadır.' },
                            { title: '3. Uyarı', content: 'Erken aşama değerlemeleri doğası gereği tahminidir. Gerçek rakamlar yatırımcıların ikna olmasına ve sunum kalitesine bağlıdır.' }
                        ];
                    }

                    let itRow = 2;
                    sections.forEach((sec, idx) => {
                        itRow++;
                        intSheet.getRow(itRow).height = 28;
                        intSheet.mergeCells(itRow, 2, itRow, 2);
                        const tc3 = intSheet.getCell(itRow, 2);
                        tc3.value = sec.title;
                        tc3.font = { name: 'Arial', bold: true, size: 12, color: { argb: GL } };
                        tc3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? HB : SB } };
                        tc3.alignment = { horizontal: 'right', vertical: 'middle', readingOrder: 'rtl' };
                        tc3.border = { bottom: { style: 'medium', color: { argb: G } } };
                        itRow++;
                        intSheet.getRow(itRow).height = Math.max(60, sec.content.split('\n').length * 18);
                        intSheet.mergeCells(itRow, 2, itRow, 2);
                        const cc = intSheet.getCell(itRow, 2);
                        cc.value = sec.content;
                        cc.font = { name: 'Arial', size: 10, color: { argb: DT } };
                        cc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEFCF6' } };
                        cc.alignment = { horizontal: 'right', vertical: 'top', wrapText: true, readingOrder: 'rtl' };
                        cc.border = { top: { style: 'hair' }, bottom: { style: 'hair', color: { argb: G } }, left: { style: 'hair' }, right: { style: 'hair' } };
                    });

                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const now = new Date();
                    const fileName = `SaaS_Değerleme_${company}_${now.toISOString().slice(0,10)}.xlsx`;
                    saveAs(blob, fileName);
                } catch (err) {
                    console.error(err);
                    alert('Excel dosyası oluşturulurken hata: ' + err.message);
                } finally {
                    hideLoading();
                }
            }

            // ========== Word Dışa Aktar ==========
            async function exportToWord() {
                if (!globalSaaSData) { alert('Lütfen önce analiz yapın.'); return; }
                showLoading('Profesyonel Word raporu oluşturuluyor...', 'Veriler ve grafikler toplanıyor');
                try {
                    const D = globalSaaSData;
                    const cur = D.currency;
                    const company = document.getElementById('companyName').value || 'Şirket';
                    const now = new Date();
                    const dateStr = now.toLocaleDateString('tr-TR');

                    let chartImg = '';
                    if (D.stage === 'post') {
                        const canvas = document.getElementById('valuationChart');
                        if (canvas) {
                            const origBg = canvas.style.backgroundColor;
                            canvas.style.backgroundColor = '#ffffff';
                            const img = await html2canvas(canvas, { scale: 2, backgroundColor: '#ffffff' });
                            canvas.style.backgroundColor = origBg;
                            chartImg = img.toDataURL('image/png');
                        }
                    }

                    let kpiRows = '', metricsTable = '';
                    if (D.stage === 'post') {
                        const kpis = [
                            { l: 'Tekrarlayan Gelir (ARR)', v: `${cur} ${fmtNum(D.ARR)}`, g: true },
                            { l: 'Yıllık Büyüme Oranı', v: `${D.growthRate.toFixed(1)}%`, g: D.growthRate > 20 },
                            { l: 'Net Elde Tutma (NRR)', v: `${D.nrr.toFixed(0)}%`, g: D.nrr >= 100 },
                            { l: 'LTV/CAC Oranı', v: `${D.ltvCac.toFixed(2)}x`, g: D.ltvCac >= 3 },
                            { l: 'CAC Geri Ödeme', v: D.cacPaybackMonths !== null ? `${D.cacPaybackMonths.toFixed(1)} ay` : 'Mevcut değil', g: D.cacPaybackMonths !== null && D.cacPaybackMonths < 12 },
                            { l: 'Sihirli Sayı', v: `${D.magicNumber.toFixed(2)}`, g: D.magicNumber >= 1 },
                            { l: 'Yanma Çarpanı', v: D.burnMultiple !== null ? `${D.burnMultiple.toFixed(2)}x` : 'Mevcut değil', g: D.burnMultiple !== null && D.burnMultiple < 1.5 },
                            { l: 'Nakit Parkuru', v: isFinite(D.runwayMonths) ? `${D.runwayMonths.toFixed(1)} ay` : '∞', g: isFinite(D.runwayMonths) && D.runwayMonths > 12 }
                        ];
                        kpis.forEach(k => {
                            kpiRows += `<tr><td style="padding:10px;background:${k.g?'#d4edda':'#f8d7da'};text-align:right;">${k.l}</td><td style="padding:10px;background:${k.g?'#d4edda':'#f8d7da'};text-align:center;"><strong style="color:${k.g?'#155724':'#721c24'};">${k.v}</strong></td></tr>`;
                        });
                        metricsTable = `
                            <h3 style="color:#b8860b;">📊 Değerleme Aralığı</h3>
                            <table><thead><tr><th>Yöntem</th><th>Düşük</th><th>Baz</th><th>Yüksek</th></tr></thead><tbody>
                                <tr><td>Gelir Çarpanı (${D.baseMultiple.toFixed(1)}x)</td><td>${cur} ${fmtNum(D.evLow)}</td><td><strong>${cur} ${fmtNum(D.evBase)}</strong></td><td>${cur} ${fmtNum(D.evHigh)}</td></tr>
                                <tr><td>VC Yöntemi</td><td>${cur} ${fmtNum(D.vcLow)}</td><td><strong>${cur} ${fmtNum(D.vcBase)}</strong></td><td>${cur} ${fmtNum(D.vcHigh)}</td></tr>
                                <tr style="background:#fefcf6;"><td><strong>Genel Aralık</strong></td><td><strong>${cur} ${fmtNum(Math.min(D.evLow,D.vcLow))}</strong></td><td><strong>${cur} ${fmtNum((D.evBase+D.vcBase)/2)}</strong></td><td><strong>${cur} ${fmtNum(Math.max(D.evHigh,D.vcHigh))}</strong></td></tr>
                            </tbody></table>
                        `;
                    } else {
                        kpiRows = `
                            <tr><td style="padding:10px;background:#d4edda;text-align:right;">Berkus Değerlemesi</td><td style="padding:10px;background:#d4edda;text-align:center;"><strong style="color:#155724;">${cur} ${fmtNum(D.berkusTotal)}</strong></td></tr>
                            <tr><td style="padding:10px;background:#d4edda;text-align:right;">İkame Maliyet</td><td style="padding:10px;background:#d4edda;text-align:center;"><strong style="color:#155724;">${cur} ${fmtNum(D.riskAdjustedCost)}</strong></td></tr>
                        `;
                        metricsTable = `
                            <h3 style="color:#b8860b;">📊 Değerleme Aralığı</h3>
                            <table><thead><tr><th>Yöntem</th><th>Değer</th></tr></thead><tbody>
                                <tr><td>Berkus Yöntemi</td><td><strong>${cur} ${fmtNum(D.berkusTotal)}</strong></td></tr>
                                <tr><td>İkame Maliyet</td><td><strong>${cur} ${fmtNum(D.riskAdjustedCost)}</strong></td></tr>
                                <tr style="background:#fefcf6;"><td><strong>Genel Aralık</strong></td><td><strong>${cur} ${fmtNum(D.preLow)} – ${cur} ${fmtNum(D.preHigh)}</strong></td></tr>
                            </tbody></table>
                        `;
                    }

                    const fullHtml = `<!DOCTYPE html>
                    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
                    <head><meta charset='utf-8'><title>SaaS Değerleme Raporu - FAROUK GRUP</title>
                    <style>
                        body{font-family:'Arial','Tajawal',sans-serif;direction:rtl;margin:2rem;background:#fff;}
                        .cover{text-align:center;border-bottom:4px solid #b8860b;margin-bottom:30px;padding-bottom:20px;}
                        .cover h1{font-size:32px;color:#b8860b;margin:0;}
                        .cover h2{font-size:24px;color:#b48554;margin:5px 0;}
                        .cover p{color:#666;}
                        table{width:100%;border-collapse:collapse;margin:20px 0;direction:rtl;}
                        th,td{border:1px solid #b8860b;padding:8px;text-align:center;}
                        th{background:#fefcf6;color:#b8860b;font-weight:bold;}
                        .chart-img{max-width:100%;height:auto;border:1px solid #b8860b;border-radius:10px;margin:20px 0;}
                        .footer{text-align:center;margin-top:40px;padding-top:10px;border-top:1px dashed #b8860b;color:#888;font-size:10pt;}
                    </style></head>
                    <body>
                        <div class="cover">
                            <h1>FAROUK GRUP</h1>
                            <h2>SaaS Girişim Değerleme Raporu</h2>
                            <p>Şirket: ${company} | Tarih: ${dateStr}</p>
                            <p>Aşama: ${D.stage==='post'?'Gelir Sonrası':'Gelir Öncesi'} | Para Birimi: ${cur}</p>
                        </div>
                        <h2 style="color:#b8860b;">📊 Temel Göstergeler</h2>
                        <table>${kpiRows}</table>
                        ${metricsTable}
                        ${chartImg?`<h2 style="color:#b8860b;">📈 Değerleme Grafiği</h2><div style="text-align:center;"><img src="${chartImg}" class="chart-img"/></div>`:''}
                        <div class="footer">FAROUK GRUP tarafından oluşturulmuştur © ${now.getFullYear()}</div>
                    </body></html>`;

                    const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `SaaS_Değerleme_${company}_${now.toISOString().slice(0,10)}.doc`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                } catch (err) {
                    console.error(err);
                    alert('Word raporu oluşturulurken hata');
                } finally {
                    hideLoading();
                }
            }

            document.getElementById('exportWordBtn').addEventListener('click', exportToWord);
            document.getElementById('exportFullExcelBtn').addEventListener('click', exportToFullExcel);

            window.addEventListener('load', function() {
                switchStage('post');
                setTimeout(function() {
                    const res = computeSaaS();
                    displayResults(res);
                }, 400);
            });

        })();
    