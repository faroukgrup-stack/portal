
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

            // ===== Sermaye enjeksiyonu aktif/deaktif =====
            document.getElementById('capitalInjectionEnabled').addEventListener('change', function(e) {
                const disabled = !e.target.checked;
                document.getElementById('injectionAmount').disabled = disabled;
                document.getElementById('injectionROI').disabled = disabled;
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

            // ===== Ana hesaplama =====
            function computeValuation() {
                const rev = parseFloat(document.getElementById('revenue').value) || 0;
                const cogs = parseFloat(document.getElementById('cogs').value) || 0;
                const opex = parseFloat(document.getElementById('opex').value) || 0;
                const depr = parseFloat(document.getElementById('depreciation').value) || 0;
                const interest = parseFloat(document.getElementById('interest').value) || 0;
                const taxes = parseFloat(document.getElementById('taxes').value) || 0;
                const totalDebt = parseFloat(document.getElementById('totalDebt').value) || 0;
                const assetValue = parseFloat(document.getElementById('assetValue').value) || 0;
                const multiplier = parseFloat(document.getElementById('multiplier').value) || 3;
                const ownership = parseFloat(document.getElementById('ownershipPercent').value) || 100;
                const estYear = parseInt(document.getElementById('estYear').value) || 2018;
                const leaseExpiry = parseInt(document.getElementById('leaseExpiry').value) || 2029;

                const EBITDA = rev - cogs - opex;
                const netProfit = EBITDA - depr - interest - taxes;
                const enterpriseValue = EBITDA * multiplier;
                const equityValue = enterpriseValue - totalDebt;
                const fairValue = equityValue > 0 ? equityValue : 0;
                const sharePrice = (fairValue * ownership) / 100;
                const paybackYears = netProfit > 0 ? equityValue / netProfit : Infinity;
                const efficiencyIndex = assetValue > 0 ? fairValue / assetValue : 0;

                // Kira
                const currentYear = new Date().getFullYear();
                const remainingLease = leaseExpiry - currentYear;
                let leaseWarning = '';
                let adjustedMultiplier = multiplier;
                if (remainingLease < 3 && remainingLease >= 0) {
                    adjustedMultiplier = Math.max(0.2, remainingLease / 10) * multiplier;
                    leaseWarning = `⚠️ Uyarı: Kira sözleşmesine ${remainingLease} yıl kaldı. Çarpan otomatik olarak ${adjustedMultiplier.toFixed(2)}'ye düşürüldü.`;
                } else if (remainingLease < 0) {
                    leaseWarning = '⛔ Kira sözleşmesi sona erdi! Acilen yenilenmeli. Çarpan 0.5 olarak kabul edildi.';
                    adjustedMultiplier = 0.5;
                }

                const finalEV = EBITDA * adjustedMultiplier;
                const finalEquity = finalEV - totalDebt;
                const finalFairValue = finalEquity > 0 ? finalEquity : 0;

                // Sermaye enjeksiyonu
                const injectionEnabled = document.getElementById('capitalInjectionEnabled').checked;
                let injectionImpact = null;
                if (injectionEnabled) {
                    const injectionAmount = parseFloat(document.getElementById('injectionAmount').value) || 0;
                    const injectionROI = parseFloat(document.getElementById('injectionROI').value) || 20;
                    const incrementalEBITDA = injectionAmount * (injectionROI / 100);
                    const newEBITDA = EBITDA + incrementalEBITDA;
                    const newEV = newEBITDA * adjustedMultiplier;
                    const newEquity = newEV - totalDebt;
                    injectionImpact = {
                        newFairValue: newEquity > 0 ? newEquity : 0,
                        incrementalEBITDA: incrementalEBITDA,
                        newPayback: (netProfit + incrementalEBITDA) > 0 ? newEquity / (netProfit + incrementalEBITDA) : Infinity
                    };
                }

                return {
                    EBITDA,
                    netProfit,
                    enterpriseValue,
                    equityValue,
                    fairValue: finalFairValue,
                    sharePrice,
                    paybackYears,
                    efficiencyIndex,
                    assetValue,
                    multiplier: adjustedMultiplier,
                    remainingLease,
                    leaseWarning,
                    injectionImpact,
                    rev,
                    cogs,
                    opex,
                    depr,
                    interest,
                    taxes,
                    totalDebt,
                    ownership,
                    estYear,
                    leaseExpiry,
                    originalMultiplier: multiplier
                };
            }

            // ===== Sonuçları göster =====
            function displayResults(res) {
                const currency = document.getElementById('currencySelect').value;
                document.getElementById('initialMessage').style.display = 'none';
                document.getElementById('resultsSection').style.display = 'block';

                document.getElementById('kpiCards').innerHTML = `
                    <div class="result-card"><i class="fas fa-chart-bar"></i><h4>EBITDA</h4><div class="value">${currency}${res.EBITDA.toFixed(0)}</div></div>
                    <div class="result-card"><i class="fas fa-building"></i><h4>İşletme Değeri (EV)</h4><div class="value">${currency}${(res.EBITDA * res.multiplier).toFixed(0)}</div><div class="unit">Çarpan ${res.multiplier.toFixed(2)}</div></div>
                    <div class="result-card"><i class="fas fa-hand-holding-usd"></i><h4>Adil Değer</h4><div class="value">${currency}${res.fairValue.toFixed(0)}</div><div class="status ${res.fairValue > res.totalDebt ? 'status-good' : 'status-bad'}">${res.fairValue > 0 ? 'Pozitif' : 'Negatif'}</div></div>
                    <div class="result-card"><i class="fas fa-user-check"></i><h4>Payınız (${res.ownership}%)</h4><div class="value">${currency}${res.sharePrice.toFixed(0)}</div></div>
                    <div class="result-card"><i class="fas fa-clock"></i><h4>Geri Ödeme Süresi</h4><div class="value">${isFinite(res.paybackYears) ? res.paybackYears.toFixed(2)+' yıl' : 'Sonsuz'}</div></div>
                    <div class="result-card"><i class="fas fa-balance-scale"></i><h4>Verimlilik Endeksi</h4><div class="value">${res.efficiencyIndex.toFixed(2)}</div><div class="status ${res.efficiencyIndex >= 1 ? 'status-good' : 'status-bad'}">${res.efficiencyIndex >= 1 ? 'Verimli' : 'Verimsiz'}</div></div>
                `;

                const leaseDiv = document.getElementById('leaseWarning');
                if (res.leaseWarning) {
                    leaseDiv.style.display = 'block';
                    leaseDiv.innerHTML = res.leaseWarning;
                } else {
                    leaseDiv.style.display = 'none';
                }

                const effCard = document.getElementById('efficiencyCard');
                let effHtml = `<strong><i class="fas fa-info-circle"></i> Adil Değer ve Varlıklar Karşılaştırması:</strong> `;
                if (res.assetValue > 0) {
                    effHtml += `Varlıkların piyasa değeri ${currency}${res.assetValue.toFixed(0)} | `;
                    effHtml += `Adil değer ${currency}${res.fairValue.toFixed(0)} | `;
                    effHtml += res.fairValue >= res.assetValue ?
                        '✅ Restoran varlıklarından daha yüksek değer üretiyor (kârlı işletme)' :
                        '❌ Değer varlıklardan düşük – restoran operasyonel olarak verimsiz';
                } else {
                    effHtml += 'Varlık değeri girilmediğinden karşılaştırma yapılamıyor.';
                }

                if (res.injectionImpact) {
                    const inj = res.injectionImpact;
                    effHtml += `<br><br><strong>💉 Sermaye enjeksiyonu sonrası:</strong> `;
                    effHtml += `Beklenen adil değer ${currency}${inj.newFairValue.toFixed(0)} | `;
                    effHtml += `Yeni geri ödeme süresi ${isFinite(inj.newPayback) ? inj.newPayback.toFixed(2)+' yıl' : 'Hesaplanamadı'}`;
                }
                effCard.innerHTML = effHtml;

                const sensDiv = document.getElementById('sensitivityTable');
                const mults = [2, 2.5, 3, 3.5, 4];
                let sensRows = '';
                mults.forEach(m => {
                    const ev = res.EBITDA * m;
                    const eq = ev - res.totalDebt;
                    const fair = eq > 0 ? eq : 0;
                    sensRows += `<tr>
                        <td>${m}</td>
                        <td>${currency}${ev.toFixed(0)}</td>
                        <td>${currency}${fair.toFixed(0)}</td>
                        <td>${currency}${((fair * res.ownership)/100).toFixed(0)}</td>
                    </tr>`;
                });
                sensDiv.innerHTML = `
                    <table>
                        <thead><tr><th>Çarpan</th><th>İşletme Değeri</th><th>Adil Değer</th><th>Payınız</th></tr></thead>
                        <tbody>${sensRows}</tbody>
                    </table>
                `;

                window.lastValuation = res;
            }

            document.getElementById('calculateBtn').addEventListener('click', function() {
                const res = computeValuation();
                displayResults(res);
            });

            // ========== Excel Dışa Aktar ==========
            async function exportToFullExcel() {
                if (!window.lastValuation) { alert('Lütfen önce analiz yapın.'); return; }
                showLoading('Profesyonel Excel raporu oluşturuluyor...', 'Sayfalar ve tablolar oluşturuluyor');
                try {
                    const D = window.lastValuation;
                    const currency = document.getElementById('currencySelect').value;
                    const name = document.getElementById('restaurantName').value || 'Restoran';

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
                    mh(cv, 1, 4, 4, `Restoran Değerleme Raporu\n${name}`, DB, GL, 18);
                    const inf = [
                        ['📋 Restoran Adı', name],
                        ['📅 Tarih', new Date().toLocaleDateString('tr-TR')],
                        ['💰 Para Birimi', currency],
                        ['📊 Adil Değer', `${currency}${D.fairValue.toFixed(0)}`],
                        ['📈 EBITDA', `${currency}${D.EBITDA.toFixed(0)}`],
                        ['🔢 Kullanılan Çarpan', `${D.multiplier.toFixed(2)}x`]
                    ];
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
                    mh(inputsSheet, 1, 5, 1, '📋 Girdiler', DB, GL, 14);
                    inputsSheet.getRow(1).height = 40;
                    mh(inputsSheet, 2, 4, 2, 'Yıllık Finansal Veriler', SB, W, 11);
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

                    addInputRow('Toplam Gelir', D.rev);
                    addInputRow('Satılan Mal Maliyeti (COGS)', D.cogs);
                    addInputRow('Faaliyet Giderleri (OPEX)', D.opex);
                    addInputRow('Amortisman (D&A)', D.depr);
                    addInputRow('Ödenen Faiz', D.interest);
                    addInputRow('Ödenen Vergiler', D.taxes);
                    addInputRow('Toplam Borç', D.totalDebt);
                    addInputRow('Ekipman ve Demirbaş Değeri', D.assetValue);
                    addInputRow('Piyasa Çarpanı', D.originalMultiplier);
                    addInputRow('Mülkiyet Oranı', D.ownership, '%');
                    addInputRow('Kuruluş Yılı', D.estYear);
                    addInputRow('Kira Bitiş Yılı', D.leaseExpiry);
                    if (D.injectionImpact) {
                        addInputRow('Sermaye Enjeksiyonu (Tutar)', document.getElementById('injectionAmount').value || 0);
                        addInputRow('Sermaye Enjeksiyonu (Getiri %)', document.getElementById('injectionROI').value || 0);
                    }

                    // 3. Göstergeler
                    const kpiSheet = workbook.addWorksheet('Göstergeler', { views: [{ rightToLeft: true, showGridLines: false }] });
                    [5, 32, 22, 22, 22, 5].forEach((w, i) => kpiSheet.getColumn(i + 1).width = w);
                    mh(kpiSheet, 1, 6, 1, '📊 Temel Göstergeler', DB, GL, 15);
                    kpiSheet.getRow(1).height = 45;
                    mh(kpiSheet, 2, 5, 2, `${name} | ${new Date().toLocaleDateString('tr-TR')}`, HB, W, 10);
                    kpiSheet.getRow(2).height = 26;

                    const kpis = [
                        { label: 'EBITDA', value: `${currency}${D.EBITDA.toFixed(0)}`, good: D.EBITDA > 0 },
                        { label: 'Adil Değer', value: `${currency}${D.fairValue.toFixed(0)}`, good: D.fairValue > 0 },
                        { label: 'Payınız', value: `${currency}${D.sharePrice.toFixed(0)}`, good: D.sharePrice > 0 },
                        { label: 'Geri Ödeme Süresi', value: isFinite(D.paybackYears) ? D.paybackYears.toFixed(2) + ' yıl' : 'Sonsuz', good: isFinite(D.paybackYears) && D.paybackYears < 10 },
                        { label: 'Verimlilik Endeksi', value: D.efficiencyIndex.toFixed(2), good: D.efficiencyIndex >= 1 },
                        { label: 'Kullanılan Çarpan', value: D.multiplier.toFixed(2) + 'x', good: D.multiplier >= 2 }
                    ];
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
                    kFinal.value = D.fairValue > 0 ? '✅ Değerleme Olumlu' : '⚠️ Değerleme Sıfır veya Negatif';
                    kFinal.font = { name: 'Arial', bold: true, size: 13, color: { argb: D.fairValue > 0 ? PT : '856404' } };
                    kFinal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: D.fairValue > 0 ? PB : GB } };
                    kFinal.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rtl' };
                    kFinal.border = { top: { style: 'medium', color: { argb: G } }, bottom: { style: 'medium', color: { argb: G } }, left: { style: 'medium', color: { argb: G } }, right: { style: 'medium', color: { argb: G } } };
                    kpiSheet.getRow(kRow).height = 40;

                    // 4. Duyarlılık
                    const sensSheet = workbook.addWorksheet('Duyarlılık Analizi', { views: [{ rightToLeft: true, showGridLines: false }] });
                    sensSheet.getColumn(1).width = 5;
                    sensSheet.getColumn(2).width = 20;
                    sensSheet.getColumn(3).width = 22;
                    sensSheet.getColumn(4).width = 22;
                    sensSheet.getColumn(5).width = 22;
                    sensSheet.getColumn(6).width = 5;
                    mh(sensSheet, 1, 6, 1, '📈 Duyarlılık Analizi (Çarpan Etkisi)', DB, GL, 14);
                    sensSheet.getRow(1).height = 40;
                    sensSheet.addRow(['Çarpan', 'İşletme Değeri', 'Adil Değer', 'Payınız']);
                    const mults = [2, 2.5, 3, 3.5, 4];
                    mults.forEach(m => {
                        const ev = D.EBITDA * m;
                        const eq = ev - D.totalDebt;
                        const fair = eq > 0 ? eq : 0;
                        sensSheet.addRow([m, ev, fair, (fair * D.ownership) / 100]);
                    });
                    const sensHeader = sensSheet.getRow(2);
                    sensHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    sensHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };

                    // 5. Öneriler
                    const recSheet = workbook.addWorksheet('Öneriler', { views: [{ rightToLeft: true, showGridLines: false }] });
                    recSheet.getColumn(1).width = 5;
                    recSheet.getColumn(2).width = 50;
                    recSheet.getColumn(3).width = 5;
                    mh(recSheet, 1, 3, 1, '💡 Öneriler', DB, GL, 14);
                    recSheet.getRow(1).height = 40;
                    let recContent = '';
                    if (D.fairValue > 0) {
                        recContent = `✅ Değerleme pozitif: Adil değer ${currency}${D.fairValue.toFixed(0)}\n`;
                        recContent += `Payınız (${D.ownership}%): ${currency}${D.sharePrice.toFixed(0)}\n`;
                        if (D.leaseWarning) recContent += `⚠️ ${D.leaseWarning}\n`;
                        if (D.injectionImpact) {
                            recContent += `💉 Sermaye enjeksiyonu sonrası: Beklenen adil değer ${currency}${D.injectionImpact.newFairValue.toFixed(0)}\n`;
                        }
                        recContent += `\nBu aralıkta müzakere edilmesi önerilir. Zayıf göstergeleri iyileştirin.`;
                    } else {
                        recContent = `🔴 Değerleme sıfır veya negatif. Maliyet yapısını gözden geçirmeniz, gelirleri artırmanız veya borçları azaltmanız gerekir.`;
                    }
                    recSheet.getCell(3, 2).value = recContent;
                    recSheet.getCell(3, 2).font = { name: 'Arial', size: 11 };
                    recSheet.getCell(3, 2).alignment = { wrapText: true, readingOrder: 'rtl' };

                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const now = new Date();
                    const fileName = `Restoran_Değerleme_${name}_${now.toISOString().slice(0,10)}.xlsx`;
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
                if (!window.lastValuation) { alert('Lütfen önce analiz yapın.'); return; }
                showLoading('Profesyonel Word raporu oluşturuluyor...', 'Veriler toplanıyor');
                try {
                    const D = window.lastValuation;
                    const currency = document.getElementById('currencySelect').value;
                    const name = document.getElementById('restaurantName').value || 'Restoran';
                    const now = new Date();
                    const dateStr = now.toLocaleDateString('tr-TR');

                    let injectionHtml = '';
                    if (D.injectionImpact) {
                        injectionHtml = `
                            <h3 style="color:#b8860b;">💉 Sermaye Enjeksiyonu Etkisi</h3>
                            <p>Enjeksiyon sonrası adil değer: ${currency}${D.injectionImpact.newFairValue.toFixed(0)}</p>
                            <p>Yeni geri ödeme süresi: ${isFinite(D.injectionImpact.newPayback) ? D.injectionImpact.newPayback.toFixed(2)+' yıl' : 'Hesaplanamadı'}</p>
                        `;
                    }

                    const fullHtml = `<!DOCTYPE html>
                    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
                    <head><meta charset='utf-8'><title>Restoran Değerleme Raporu - FAROUK GRUP</title>
                    <style>
                        body{font-family:'Arial','Tajawal',sans-serif;direction:rtl;margin:2rem;background:#fff;}
                        .cover{text-align:center;border-bottom:4px solid #b8860b;margin-bottom:30px;padding-bottom:20px;}
                        .cover h1{font-size:32px;color:#b8860b;margin:0;}
                        .cover h2{font-size:24px;color:#b48554;margin:5px 0;}
                        table{width:100%;border-collapse:collapse;margin:20px 0;direction:rtl;}
                        th,td{border:1px solid #b8860b;padding:8px;text-align:center;}
                        th{background:#fefcf6;color:#b8860b;font-weight:bold;}
                        .footer{text-align:center;margin-top:40px;padding-top:10px;border-top:1px dashed #b8860b;color:#888;font-size:10pt;}
                        .rec{background:#f9f9f9;padding:15px;border-right:4px solid #b8860b;margin:20px 0;}
                    </style></head>
                    <body>
                        <div class="cover">
                            <h1>FAROUK GRUP</h1>
                            <h2>Restoran Değerleme Raporu</h2>
                            <p>Restoran: ${name} | Tarih: ${dateStr}</p>
                            <p>Para Birimi: ${currency}</p>
                        </div>
                        <h2 style="color:#b8860b;">📊 Temel Göstergeler</h2>
                        <table>
                            <thead><tr><th>Gösterge</th><th>Değer</th></tr></thead>
                            <tbody>
                                <tr><td>EBITDA</td><td>${currency}${D.EBITDA.toFixed(0)}</td></tr>
                                <tr><td>Adil Değer</td><td>${currency}${D.fairValue.toFixed(0)}</td></tr>
                                <tr><td>Payınız (${D.ownership}%)</td><td>${currency}${D.sharePrice.toFixed(0)}</td></tr>
                                <tr><td>Geri Ödeme Süresi</td><td>${isFinite(D.paybackYears) ? D.paybackYears.toFixed(2)+' yıl' : 'Sonsuz'}</td></tr>
                                <tr><td>Verimlilik Endeksi</td><td>${D.efficiencyIndex.toFixed(2)}</td></tr>
                                <tr><td>Kullanılan Çarpan</td><td>${D.multiplier.toFixed(2)}x</td></tr>
                            </tbody>
                        </table>
                        ${D.leaseWarning ? `<div style="background:#f8d7da;padding:10px;border-radius:8px;border-right:4px solid #dc3545;margin:20px 0;">${D.leaseWarning}</div>` : ''}
                        ${injectionHtml}
                        <div class="rec">
                            <h3 style="color:#b8860b;">📌 Öneri</h3>
                            <p>${D.fairValue > 0 ? '✅ Değerleme pozitif, sunulan aralıkta müzakere edilmesi önerilir.' : '🔴 Değerleme sıfır veya negatif, maliyet yapısı gözden geçirilmeli veya gelirler artırılmalıdır.'}</p>
                        </div>
                        <div class="footer">FAROUK GRUP tarafından oluşturulmuştur © ${now.getFullYear()}</div>
                    </body></html>`;

                    const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `Restoran_Değerleme_${name}_${now.toISOString().slice(0,10)}.doc`;
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
                setTimeout(function() {
                    const res = computeValuation();
                    displayResults(res);
                }, 400);
            });

        })();
    