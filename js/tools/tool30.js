
        (function() {
            'use strict';

            // ===== آلة حاسبة =====
            const calcDisplay = document.getElementById('calcDisplay');
            let currentCalcInput = '';

            function handleCalc(v) {
                if (v === 'C') { currentCalcInput = '';
                    calcDisplay.value = ''; return; }
                if (v === '⌫') { currentCalcInput = currentCalcInput.slice(0, -1);
                    calcDisplay.value = currentCalcInput; return; }
                if (v === '=') {
                    try {
                        let r = eval(currentCalcInput.replace(/×/g, '*').replace(/÷/g, '/'));
                        calcDisplay.value = r;
                        currentCalcInput = r.toString();
                    } catch (e) { calcDisplay.value = T('s1');
                        currentCalcInput = ''; }
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

            // ===== تفعيل/تعطيل حقول ضخ رأس المال =====
            document.getElementById('capitalInjectionEnabled').addEventListener('change', function(e) {
                const disabled = !e.target.checked;
                document.getElementById('injectionAmount').disabled = disabled;
                document.getElementById('injectionROI').disabled = disabled;
            });

            // ===== دوال التحميل =====
            function showLoading(title, msg) {
                document.getElementById('loadingTitle').textContent = title;
                document.getElementById('loadingMsg').textContent = msg;
                document.getElementById('exportLoading').classList.add('show');
            }

            function hideLoading() {
                document.getElementById('exportLoading').classList.remove('show');
            }

            // ===== الحساب الرئيسي =====
            async function computeValuation() {
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

                const injectionEnabled = document.getElementById('capitalInjectionEnabled').checked;
                const injectionAmount = parseFloat(document.getElementById('injectionAmount').value) || 0;
                const injectionROI = parseFloat(document.getElementById('injectionROI').value) || 20;
                return await FG.calc('tool30', 'main', { rev, cogs, opex, depr, interest, taxes, totalDebt, assetValue, multiplier, ownership, estYear, leaseExpiry, injectionEnabled, injectionAmount, injectionROI });
            }

            // ===== عرض النتائج =====
            function displayResults(res) {
                const currency = document.getElementById('currencySelect').value;
                document.getElementById('initialMessage').style.display = 'none';
                document.getElementById('resultsSection').style.display = 'block';

                // بطاقات KPI
                document.getElementById('kpiCards').innerHTML = `
                    <div class="result-card"><i class="fas fa-chart-bar"></i><h4>EBITDA</h4><div class="value">${currency}${res.EBITDA.toFixed(0)}${T('s12')}${currency}${(res.EBITDA * res.multiplier).toFixed(0)}${T('s13')}${res.multiplier.toFixed(2)}${T('s14')}${currency}${res.fairValue.toFixed(0)}</div><div class="status ${res.fairValue > res.totalDebt ? 'status-good' : 'status-bad'}">${res.fairValue > 0 ? T('s6') : T('s7')}${T('s15')}${res.ownership}%)</h4><div class="value">${currency}${res.sharePrice.toFixed(0)}${T('s16')}${isFinite(res.paybackYears) ? res.paybackYears.toFixed(2)+T('s8') : T('s9')}${T('s17')}${res.efficiencyIndex.toFixed(2)}</div><div class="status ${res.efficiencyIndex >= 1 ? 'status-good' : 'status-bad'}">${res.efficiencyIndex >= 1 ? T('s10') : T('s11')}</div></div>
                `;

                // تحذير الإيجار
                const leaseDiv = document.getElementById('leaseWarning');
                if (res.leaseWarning) {
                    leaseDiv.style.display = 'block';
                    leaseDiv.innerHTML = res.leaseWarning;
                } else {
                    leaseDiv.style.display = 'none';
                }

                // بطاقة الكفاءة
                const effCard = document.getElementById('efficiencyCard');
                let effHtml = `${T('s18')}`;
                if (res.assetValue > 0) {
                    effHtml += `${T('s19')}${currency}${res.assetValue.toFixed(0)} | `;
                    effHtml += `${T('s20')}${currency}${res.fairValue.toFixed(0)} | `;
                    effHtml += res.fairValue >= res.assetValue ?
                        T('s21') :
                        T('s22');
                } else {
                    effHtml += T('s23');
                }

                // تأثير ضخ رأس المال
                if (res.injectionImpact) {
                    const inj = res.injectionImpact;
                    effHtml += `${T('s24')}`;
                    effHtml += `${T('s25')}${currency}${inj.newFairValue.toFixed(0)} | `;
                    effHtml +=
                        `${T('s27')}${isFinite(inj.newPayback) ? inj.newPayback.toFixed(2)+T('s8') : T('s26')}`;
                }
                effCard.innerHTML = effHtml;

                // جدول الحساسية
                const sensDiv = document.getElementById('sensitivityTable');
                let sensRows = '';
                res.sens.forEach(({ m, ev, fair }) => {
                    sensRows += `<tr>
                        <td>${m}</td>
                        <td>${currency}${ev.toFixed(0)}</td>
                        <td>${currency}${fair.toFixed(0)}</td>
                        <td>${currency}${(res.sens.find(s => s.m === m).share).toFixed(0)}</td>
                    </tr>`;
                });
                sensDiv.innerHTML = `${T('s28')}${sensRows}</tbody>
                    </table>
                `;

                // تخزين النتائج للتصدير
                window.lastValuation = res;
            }

            // ===== ربط زر الحساب =====
            document.getElementById('calculateBtn').addEventListener('click', async function() {
                let res;
                try { res = await computeValuation(); } catch (e) { FG.calcError(e); return; }
                displayResults(res);
            });

            // ========== تصدير Excel ==========
            async function exportToFullExcel() {
                if (!window.lastValuation) { alert(T('s29')); return; }
                showLoading(T('s30'), T('s31'));
                try {
                    const D = window.lastValuation;
                    const currency = document.getElementById('currencySelect').value;
                    const name = document.getElementById('restaurantName').value || T('s32');

                    const workbook = new ExcelJS.Workbook();
                    workbook.creator = 'FAROUK GRUP';
                    workbook.created = new Date();

                    const G = 'FFB48554',
                        GL = 'FFCFA776',
                        DB = 'FF0B0E17',
                        HB = 'FF1A2035',
                        SB = 'FF243050';
                    const AR = 'FFF5F0E8',
                        W = 'FFFFFFFF',
                        DT = 'FF1A1A1A',
                        PB = 'FFD4EDDA',
                        NB = 'FFF8D7DA';
                    const PT = 'FF155724',
                        NT = 'FF721C24',
                        GB = 'FFFFF3CD';

                    function hs(bg = HB, tc = GL) { return { font: { name: 'Arial', bold: true, size: 11,
                                color: { argb: tc } }, fill: { type: 'pattern', pattern: 'solid',
                                fgColor: { argb: bg } }, alignment: { horizontal: 'center',
                                vertical: 'middle', wrapText: true, readingOrder: FG.dir() }, border: { top: {
                                    style: 'thin', color: { argb: G } }, bottom: { style: 'thin',
                                    color: { argb: G } }, left: { style: 'thin', color: { argb: G } },
                                right: { style: 'thin', color: { argb: G } } } }; }

                    function cs(bg = W, tc = DT, b = false, h = 'center') { return { font: { name: 'Arial',
                                bold: b, size: 10, color: { argb: tc } }, fill: { type: 'pattern',
                                pattern: 'solid', fgColor: { argb: bg } }, alignment: { horizontal: h,
                                vertical: 'middle', wrapText: true, readingOrder: FG.dir() }, border: { top: {
                                    style: 'hair', color: { argb: 'FFCCCCCC' } }, bottom: { style: 'hair',
                                    color: { argb: 'FFCCCCCC' } }, left: { style: 'hair',
                                    color: { argb: 'FFCCCCCC' } }, right: { style: 'hair',
                                    color: { argb: 'FFCCCCCC' } } } }; }

                    function ap(c, s) { if (s.font) c.font = s.font; if (s.fill) c.fill = s.fill; if (s
                            .alignment) c.alignment = s.alignment; if (s.border) c.border = s.border; if (s
                            .numFmt) c.numFmt = s.numFmt; }

                    function mh(ws, fc, tc, r, text, bg = HB, tc2 = GL, fs = 12) { ws.mergeCells(r, fc, r,
                        tc); const c = ws.getCell(r, fc); c.value = text; c.font = { name: 'Arial', bold: true,
                            size: fs, color: { argb: tc2 } }; c.fill = { type: 'pattern', pattern: 'solid',
                            fgColor: { argb: bg } }; c.alignment = { horizontal: 'center', vertical: 'middle',
                            wrapText: true, readingOrder: FG.dir() }; c.border = { top: { style: 'medium',
                                color: { argb: G } }, bottom: { style: 'medium', color: { argb: G } },
                            left: { style: 'medium', color: { argb: G } }, right: { style: 'medium',
                                color: { argb: G } } }; }

                    // 1. غلاف التقرير
                    const cv = workbook.addWorksheet(T('s33'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    [8, 45, 35, 8].forEach((w, i) => cv.getColumn(i + 1).width = w);
                    for (let r = 1; r <= 40; r++) cv.getRow(r).height = 22;
                    cv.getRow(2).height = 80;
                    cv.getRow(4).height = 60;
                    cv.mergeCells(2, 1, 2, 4);
                    const bc = cv.getCell(2, 1);
                    bc.value = T('s34');
                    bc.font = { name: 'Arial', bold: true, size: 28, color: { argb: GL } };
                    bc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DB } };
                    bc.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true,
                    readingOrder: FG.dir() };
                    bc.border = { bottom: { style: 'thick', color: { argb: G } } };
                    mh(cv, 1, 4, 4, `${T('s35')}${name}`, DB, GL, 18);
                    const inf = [
                        [T('s36'), name],
                        [T('s37'), new Date().toLocaleDateString(FG.locale())],
                        [T('s38'), currency],
                        [T('s39'), `${currency}${D.fairValue.toFixed(0)}`],
                        ['📈 EBITDA', `${currency}${D.EBITDA.toFixed(0)}`],
                        [T('s40'), `${D.multiplier.toFixed(2)}x`]
                    ];
                    let ir = 6;
                    inf.forEach(([l, v], idx) => {
                        cv.mergeCells(ir, 1, ir, 2);
                        cv.mergeCells(ir, 3, ir, 4);
                        const lc = cv.getCell(ir, 1),
                            vc = cv.getCell(ir, 3);
                        lc.value = l;
                        vc.value = v;
                        const bg = idx % 2 === 0 ? AR : 'FFFEFCF6';
                        ap(lc, { font: { name: 'Arial', bold: true, size: 11, color: { argb: '00695C' } },
                            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } },
                            alignment: { horizontal: 'right', vertical: 'middle', readingOrder: FG.dir() },
                            border: { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' },
                                right: { style: 'hair' } } });
                        ap(vc, { font: { name: 'Arial', size: 11, color: { argb: DT } },
                            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } },
                            alignment: { horizontal: 'center', vertical: 'middle', readingOrder: FG.dir() },
                            border: { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' },
                                right: { style: 'hair' } } });
                        cv.getRow(ir).height = 28;
                        ir++;
                    });

                    // 2. المدخلات
                    const inputsSheet = workbook.addWorksheet(T('s41'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    inputsSheet.getColumn(1).width = 5;
                    inputsSheet.getColumn(2).width = 38;
                    inputsSheet.getColumn(3).width = 22;
                    inputsSheet.getColumn(4).width = 22;
                    inputsSheet.getColumn(5).width = 5;
                    mh(inputsSheet, 1, 5, 1, T('s42'), DB, GL, 14);
                    inputsSheet.getRow(1).height = 40;
                    mh(inputsSheet, 2, 4, 2, T('s43'), SB, W, 11);
                    inputsSheet.getRow(2).height = 28;

                    let iRow = 3;
                    const addInputRow = (label, val, note = '') => {
                        inputsSheet.getRow(iRow).height = 24;
                        const bg = iRow % 2 === 0 ? 'FFFEFCF6' : 'FFFFFFFF';
                        const lc = inputsSheet.getCell(iRow, 2),
                            vc = inputsSheet.getCell(iRow, 3),
                            nc = inputsSheet.getCell(iRow, 4);
                        lc.value = label;
                        vc.value = val;
                        nc.value = note;
                        ap(lc, cs(bg, DT, true, 'right'));
                        ap(vc, { ...cs(bg, '0000FF', false, 'center'), numFmt: typeof val === 'number' ?
                            '#,##0.00' : null });
                        ap(nc, cs(bg, '00695C', false, 'center'));
                        iRow++;
                    };

                    addInputRow(T('s44'), D.rev);
                    addInputRow(T('s45'), D.cogs);
                    addInputRow(T('s46'), D.opex);
                    addInputRow(T('s47'), D.depr);
                    addInputRow(T('s48'), D.interest);
                    addInputRow(T('s49'), D.taxes);
                    addInputRow(T('s50'), D.totalDebt);
                    addInputRow(T('s51'), D.assetValue);
                    addInputRow(T('s52'), D.originalMultiplier);
                    addInputRow(T('s53'), D.ownership, '%');
                    addInputRow(T('s54'), D.estYear);
                    addInputRow(T('s55'), D.leaseExpiry);
                    if (D.injectionImpact) {
                        addInputRow(T('s56'), document.getElementById('injectionAmount').value || 0);
                        addInputRow(T('s57'), document.getElementById('injectionROI').value || 0);
                    }

                    // 3. مؤشرات الأداء
                    const kpiSheet = workbook.addWorksheet(T('s58'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    [5, 32, 22, 22, 22, 5].forEach((w, i) => kpiSheet.getColumn(i + 1).width = w);
                    mh(kpiSheet, 1, 6, 1, T('s59'), DB, GL, 15);
                    kpiSheet.getRow(1).height = 45;
                    mh(kpiSheet, 2, 5, 2, `${name} | ${new Date().toLocaleDateString(FG.locale())}`, HB, W, 10);
                    kpiSheet.getRow(2).height = 26;

                    const kpis = [
                        { label: 'EBITDA', value: `${currency}${D.EBITDA.toFixed(0)}`, good: D.EBITDA > 0 },
                        { label: T('s60'), value: `${currency}${D.fairValue.toFixed(0)}`, good: D
                                .fairValue > 0 },
                        { label: T('s61'), value: `${currency}${D.sharePrice.toFixed(0)}`, good: D
                                .sharePrice > 0 },
                        { label: T('s62'), value: isFinite(D.paybackYears) ? D.paybackYears.toFixed(
                                2) + T('s8') : T('s9'), good: isFinite(D.paybackYears) && D
                                .paybackYears < 10 },
                        { label: T('s63'), value: D.efficiencyIndex.toFixed(2), good: D
                                .efficiencyIndex >= 1 },
                        { label: T('s64'), value: D.multiplier.toFixed(2) + 'x', good: D
                                .multiplier >= 2 }
                    ];
                    let kRow = 3;
                    kpis.forEach((k, idx) => {
                        kpiSheet.getRow(kRow).height = 40;
                        kpiSheet.mergeCells(kRow, 2, kRow, 2);
                        kpiSheet.mergeCells(kRow, 3, kRow, 3);
                        kpiSheet.mergeCells(kRow, 4, kRow, 4);
                        kpiSheet.mergeCells(kRow, 5, kRow, 5);
                        const ic = kpiSheet.getCell(kRow, 2);
                        ic.value = `🔹 ${idx+1}`;
                        const lc2 = kpiSheet.getCell(kRow, 3);
                        lc2.value = k.label;
                        const vc3 = kpiSheet.getCell(kRow, 4);
                        vc3.value = k.value;
                        const nc2 = kpiSheet.getCell(kRow, 5);
                        nc2.value = '';
                        const bg = k.good ? PB : NB,
                            tc = k.good ? PT : NT;
                        [ic, lc2, vc3, nc2].forEach(c => { c.fill = { type: 'pattern', pattern: 'solid',
                                fgColor: { argb: bg } };
                            c.border = { top: { style: 'thin', color: { argb: G } }, bottom: { style: 'thin',
                                    color: { argb: G } }, left: { style: 'thin', color: { argb: G } },
                                right: { style: 'thin', color: { argb: G } } }; });
                        ic.font = { name: 'Arial', bold: true, size: 14, color: { argb: '555555' } };
                        ic.alignment = { horizontal: 'center', vertical: 'middle' };
                        lc2.font = { name: 'Arial', bold: true, size: 11, color: { argb: DT } };
                        lc2.alignment = { horizontal: 'right', vertical: 'middle', readingOrder: FG.dir() };
                        vc3.font = { name: 'Arial', bold: true, size: 13, color: { argb: tc } };
                        vc3.alignment = { horizontal: 'center', vertical: 'middle' };
                        nc2.font = { name: 'Arial', size: 9, color: { argb: '444444' } };
                        nc2.alignment = { horizontal: 'right', vertical: 'middle', readingOrder: FG.dir() };
                        kRow++;
                    });
                    kRow++;
                    kpiSheet.mergeCells(kRow, 2, kRow, 5);
                    const kFinal = kpiSheet.getCell(kRow, 2);
                    kFinal.value = D.fairValue > 0 ? T('s65') : T('s66');
                    kFinal.font = { name: 'Arial', bold: true, size: 13, color: { argb: D.fairValue > 0 ?
                            PT : '856404' } };
                    kFinal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: D.fairValue > 0 ?
                            PB : GB } };
                    kFinal.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: FG.dir() };
                    kFinal.border = { top: { style: 'medium', color: { argb: G } }, bottom: { style: 'medium',
                            color: { argb: G } }, left: { style: 'medium', color: { argb: G } },
                        right: { style: 'medium', color: { argb: G } } };
                    kpiSheet.getRow(kRow).height = 40;

                    // 4. تحليل الحساسية
                    const sensSheet = workbook.addWorksheet(T('s67'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    sensSheet.getColumn(1).width = 5;
                    sensSheet.getColumn(2).width = 20;
                    sensSheet.getColumn(3).width = 22;
                    sensSheet.getColumn(4).width = 22;
                    sensSheet.getColumn(5).width = 22;
                    sensSheet.getColumn(6).width = 5;
                    mh(sensSheet, 1, 6, 1, T('s68'), DB, GL, 14);
                    sensSheet.getRow(1).height = 40;
                    sensSheet.addRow([T('s69'), T('s70'), T('s60'), T('s71')]);
                    D.sens.forEach(({ m, ev, fair, share }) => {
                        sensSheet.addRow([m, ev, fair, share]);
                    });
                    const sensHeader = sensSheet.getRow(2);
                    sensHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    sensHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };

                    // 5. التوصيات
                    const recSheet = workbook.addWorksheet(T('s72'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    recSheet.getColumn(1).width = 5;
                    recSheet.getColumn(2).width = 50;
                    recSheet.getColumn(3).width = 5;
                    mh(recSheet, 1, 3, 1, T('s73'), DB, GL, 14);
                    recSheet.getRow(1).height = 40;
                    let recContent = '';
                    if (D.fairValue > 0) {
                        recContent =
                            `${T('s74')}${currency}${D.fairValue.toFixed(0)}\n`;
                        recContent += `${T('s75')}${D.ownership}%): ${currency}${D.sharePrice.toFixed(0)}\n`;
                        if (D.leaseWarning) recContent += `⚠️ ${D.leaseWarning}\n`;
                        if (D.injectionImpact) {
                            recContent += `${T('s76')}${currency}${D.injectionImpact.newFairValue.toFixed(0)}\n`;
                        }
                        recContent += `${T('s77')}`;
                    } else {
                        recContent =
                            `${T('s78')}`;
                    }
                    recSheet.getCell(3, 2).value = recContent;
                    recSheet.getCell(3, 2).font = { name: 'Arial', size: 11 };
                    recSheet.getCell(3, 2).alignment = { wrapText: true, readingOrder: FG.dir() };

                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const now = new Date();
                    const fileName =
                        `${T('s79')}${name}_${now.toISOString().slice(0,10)}.xlsx`;
                    saveAs(blob, fileName);
                } catch (err) {
                    console.error(err);
                    alert(T('s80') + err.message);
                } finally {
                    hideLoading();
                }
            }

            // ========== تصدير Word ==========
            async function exportToWord() {
                if (!window.lastValuation) { alert(T('s29')); return; }
                showLoading(T('s81'), T('s82'));
                try {
                    const D = window.lastValuation;
                    const currency = document.getElementById('currencySelect').value;
                    const name = document.getElementById('restaurantName').value || T('s32');
                    const now = new Date();
                    const dateStr = now.toLocaleDateString(FG.locale());

                    let injectionHtml = '';
                    if (D.injectionImpact) {
                        injectionHtml = `${T('s84')}${currency}${D.injectionImpact.newFairValue.toFixed(0)}${T('s85')}${isFinite(D.injectionImpact.newPayback) ? D.injectionImpact.newPayback.toFixed(2)+T('s83') : T('s26')}</p>
                        `;
                    }

                    const fullHtml = `${T('s88')}${name}${T('s89')}${dateStr}${T('s90')}${currency}${T('s91')}${currency}${D.EBITDA.toFixed(0)}${T('s92')}${currency}${D.fairValue.toFixed(0)}${T('s93')}${D.ownership}%</td><td>${currency}${D.sharePrice.toFixed(0)}${T('s94')}${isFinite(D.paybackYears) ? D.paybackYears.toFixed(2)+T('s83') : T('s9')}${T('s95')}${D.efficiencyIndex.toFixed(2)}${T('s96')}${D.multiplier.toFixed(2)}x</td></tr>
                            </tbody>
                        </table>
                        ${D.leaseWarning ? `<div style="background:#f8d7da;padding:10px;border-radius:8px;border-right:4px solid #dc3545;margin:20px 0;">${D.leaseWarning}</div>` : ''}
                        ${injectionHtml}${T('s97')}${D.fairValue > 0 ? T('s86') : T('s87')}${T('s98')}${now.getFullYear()}</div>
                    </body></html>`;

                    const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `${T('s79')}${name}_${now.toISOString().slice(0,10)}.doc`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                } catch (err) {
                    console.error(err);
                    alert(T('s99'));
                } finally {
                    hideLoading();
                }
            }

            // ===== ربط أزرار التصدير =====
            document.getElementById('exportWordBtn').addEventListener('click', exportToWord);
            document.getElementById('exportFullExcelBtn').addEventListener('click', exportToFullExcel);

            // ===== تشغيل تلقائي =====
            window.addEventListener('load', function() {
                // تشغيل الحساب تلقائياً لعرض النتائج الافتراضية
                setTimeout(function() {
                    computeValuation().then(displayResults, FG.calcError);
                }, 400);
            });

        })();
    