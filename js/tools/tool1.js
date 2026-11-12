
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

            // ===== عناصر قابلة للطي =====
            document.querySelectorAll('.collapsible').forEach(coll => {
                coll.addEventListener('click', function() {
                    this.classList.toggle('active');
                    const content = this.nextElementSibling;
                    if (content.style.maxHeight) content.style.maxHeight = null;
                    else content.style.maxHeight = content.scrollHeight + 'px';
                });
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

            // ===== متغيرات عامة =====
            let currentResults = null;
            let currentInputs = null;

            // ===== المعادلات المالية تُنفّذ الآن على السيرفر (Supabase Edge Function: calc/tool1) =====

            let charts = {};

            function renderCharts(res, inputs, currency, C) {
                for (let key in charts) if (charts[key]) charts[key].destroy();

                const ctx1 = document.getElementById('cashFlowChart').getContext('2d');
                charts.cashFlow = new Chart(ctx1, {
                    type: 'bar',
                    data: {
                        labels: Array.from({ length: res.years }, (_, i) => `${T('s16')}${i+1}`),
                        datasets: [{ label: T('s17'), data: res.fcf, backgroundColor: 'rgba(184,134,11,0.7)',
                            borderColor: '#b8860b', borderWidth: 1 }]
                    },
                    options: { responsive: true, plugins: { legend: { display: false } } }
                });

                const discountRates = C.discountRates;
                const npvValues = C.npvValues;
                const ctx2 = document.getElementById('npvCurveChart').getContext('2d');
                charts.npvCurve = new Chart(ctx2, {
                    type: 'line',
                    data: {
                        labels: discountRates.map(r => r + '%'),
                        datasets: [{ label: T('s18'), data: npvValues, borderColor: '#b8860b',
                            backgroundColor: 'rgba(184,134,11,0.1)', fill: true }]
                    }
                });

                const ctx3 = document.getElementById('revExpChart').getContext('2d');
                charts.revExp = new Chart(ctx3, {
                    type: 'line',
                    data: {
                        labels: Array.from({ length: res.years }, (_, i) => `${T('s16')}${i+1}`),
                        datasets: [
                            { label: T('s19'), data: res.revenues, borderColor: '#28a745' },
                            { label: T('s20'), data: C.totalExpenses, borderColor: '#dc3545' }
                        ]
                    }
                });

                const units = C.units, revenueData = C.revenueData, fixedCostData = C.fixedCostData, totalCostData = C.totalCostData;
                const ctx4 = document.getElementById('breakevenChart').getContext('2d');
                charts.breakeven = new Chart(ctx4, {
                    type: 'line',
                    data: {
                        labels: units.map(u => u.toFixed(0) + T('s21')),
                        datasets: [
                            { label: T('s19'), data: revenueData, borderColor: '#28a745' },
                            { label: T('s22'), data: totalCostData, borderColor: '#dc3545' },
                            { label: T('s23'), data: fixedCostData, borderColor: '#b8860b',
                            borderDash: [5, 5] }
                        ]
                    }
                });
            }

            function renderScenarios(res, inputs, currency, SC) {
                const pesRes = SC.pes, optRes = SC.opt;
                document.getElementById('scenarioContainer').innerHTML = `${T('s25')}${currency}${pesRes.npv.toFixed(0)}</div><div class="label">NPV</div><div class="value">${!isNaN(pesRes.irr)?(pesRes.irr*100).toFixed(2)+'%':T('s24')}${T('s26')}${currency}${res.npv.toFixed(0)}</div><div class="label">NPV</div><div class="value">${!isNaN(res.irr)?(res.irr*100).toFixed(2)+'%':T('s24')}${T('s27')}${currency}${optRes.npv.toFixed(0)}</div><div class="label">NPV</div><div class="value">${!isNaN(optRes.irr)?(optRes.irr*100).toFixed(2)+'%':T('s24')}</div></div>
                `;
            }

            // ===== الحدث الرئيسي للحساب =====
            document.getElementById('calculateBtn').addEventListener('click', async function() {
                const currency = document.getElementById('currencySelect').value;
                const inputs = {
                    fixedCapital: parseFloat(document.getElementById('fixedCapital').value) || 0,
                    setupCapital: parseFloat(document.getElementById('setupCapital').value) || 0,
                    monthlySales: parseFloat(document.getElementById('monthlySales').value) || 0,
                    employees: parseFloat(document.getElementById('employees').value) || 0,
                    netSalary: parseFloat(document.getElementById('netSalary').value) || 0,
                    salaryBurden: parseFloat(document.getElementById('salaryBurden').value) || 1,
                    netRent: parseFloat(document.getElementById('netRent').value) || 0,
                    rentTax: parseFloat(document.getElementById('rentTax').value) / 100 || 0,
                    totalVariableCostPercent: parseFloat(document.getElementById('totalVariableCostPercent')
                        .value) || 0,
                    opexMonthly: parseFloat(document.getElementById('opexMonthly').value) || 0,
                    cashReserve: parseFloat(document.getElementById('cashReserve').value) || 0,
                    wcMonths: parseFloat(document.getElementById('wcMonths').value) || 3,
                    growth: parseFloat(document.getElementById('growthRate').value) / 100 || 0,
                    expGrowth: parseFloat(document.getElementById('expGrowth').value) / 100 || 0,
                    discount: parseFloat(document.getElementById('discountRate').value) / 100 || 0,
                    taxRate: parseFloat(document.getElementById('taxRate').value) / 100 || 0,
                    lifeYears: parseInt(document.getElementById('lifeYears').value) || 8,
                    reinvestRate: parseFloat(document.getElementById('reinvestRate').value) / 100 || 0.10,
                    debtService: parseFloat(document.getElementById('debtService').value) || 0,
                    pricePerUnit: parseFloat(document.getElementById('pricePerUnit').value) || 0
                };

                let R;
                try { R = await FG.calc('tool1', 'main', inputs); } catch (e) { FG.calcError(e); return; }
                const res = R.res;
                window.lastResult = res;
                window.lastEvaluation = R.evaluation;
                window.lastInputs = inputs;

                document.getElementById('initialMessage').style.display = 'none';
                document.getElementById('resultsSection').style.display = 'block';

                document.getElementById('kpiCards').innerHTML = `${T('s34')}${currency}${res.npv.toFixed(0)}</div><div class="status ${res.npv>0?'status-good':'status-bad'}">${res.npv>0?T('s28'):T('s29')}${T('s35')}${!isNaN(res.irr)?(res.irr*100).toFixed(2):T('s24')}%</div><div class="status ${res.irr>inputs.discount?'status-good':'status-bad'}">${!isNaN(res.irr)?(res.irr>inputs.discount?T('s30'):T('s31')):''}${T('s36')}${res.pi.toFixed(2)}</div><div class="unit">${res.pi>=1?T('s32'):T('s33')}${T('s37')}${res.payback!==null?res.payback.toFixed(1):'∞'}${T('s38')}${res.dpbp!==null?res.dpbp.toFixed(1):'∞'}${T('s39')}${(res.roi*100).toFixed(2)}${T('s40')}${currency}${res.workingCapitalRequired.toFixed(0)}${T('s41')}${res.operatingMargin.toFixed(2)}%</div></div>
                    <div class="result-card"><i class="fas fa-percent"></i><h4>MIRR</h4><div class="value">${!isNaN(res.mirr)?(res.mirr*100).toFixed(2):T('s24')}%</div></div>
                    <div class="result-card"><i class="fas fa-shield-alt"></i><h4>DSCR</h4><div class="value">${res.dscr.toFixed(2)}${T('s42')}${currency}${res.ebitda.toFixed(0)}${T('s43')}${currency}${res.netIncome.toFixed(0)}${T('s44')}${res.netProfitMargin.toFixed(2)}%</div></div>
                `;

                const evaluation = R.evaluation;
                let detailsHtml = evaluation.details.map(d =>
                    `<div style="font-size:0.85rem; margin:0.1rem 0;">${d}</div>`).join('');
                document.getElementById('projectScore').innerHTML = `${T('s45')}${evaluation.score} / 100</div>
                    <div class="status ${evaluation.gradeClass}" style="font-size:1.1rem; margin:0.5rem 0;">${evaluation.icon} ${evaluation.grade}</div>
                    <div style="margin-top:0.8rem; border-top:1px solid var(--border-light); padding-top:0.5rem;">${detailsHtml}</div>
                `;

                let tableHtml =
                    T('s46');
                for (let i = 0; i < res.years; i++) {
                    tableHtml +=
                        `<tr><td>${i+1}</td><td>${currency}${res.revenues[i].toFixed(0)}</td><td>${currency}${res.fixedExpenses[i].toFixed(0)}</td><td>${currency}${res.variableExpenses[i].toFixed(0)}</td><td>${currency}${res.depreciation.toFixed(0)}</td><td class="${res.ebit[i]<0?'negative':'positive'}">${currency}${res.ebit[i].toFixed(0)}</td><td>${currency}${res.tax[i].toFixed(0)}</td><td class="${res.nopat[i]<0?'negative':'positive'}">${currency}${res.nopat[i].toFixed(0)}</td><td class="${res.fcf[i]<0?'negative':'positive'}">${currency}${res.fcf[i].toFixed(0)}</td></tr>`;
                }
                tableHtml += '</tbody></table>';
                document.getElementById('cashFlowTable').innerHTML = tableHtml;

                const riskDataText = `${T('s47')}${currency} ${res.totalInvestment.toFixed(0)}${T('s48')}${currency} ${res.revenues[0].toFixed(0)}${T('s49')}${currency} ${res.fixedExpenses[0].toFixed(0)}${T('s50')}${currency} ${res.variableExpenses[0].toFixed(0)}${T('s51')}${currency} ${res.depreciation.toFixed(0)}${T('s52')}${(inputs.growth*100).toFixed(1)}${T('s53')}${(inputs.expGrowth*100).toFixed(1)}${T('s54')}${(inputs.discount*100).toFixed(1)}${T('s55')}${(inputs.taxRate*100).toFixed(0)}%
                `;
                document.getElementById('riskDataText').innerHTML = riskDataText;

                document.getElementById('breakevenCard').innerHTML = `${T('s56')}${currency}${res.beRevenueActual.toFixed(0)}${T('s57')}${res.beUnitsActual.toFixed(0)}${T('s58')}${currency}${res.totalFixedMonthly.toFixed(0)}${T('s59')}${(res.contributionMarginRatio*100).toFixed(0)}%)</span></div>
                `;

                renderCharts(res, inputs, currency, R.charts);
                renderScenarios(res, inputs, currency, R.scenarios);
            });

            // ===== تحليل الحساسية =====
            document.getElementById('runSensitivity').addEventListener('click', async function() {
                if (!window.lastInputs) { alert(T('s60')); return; }
                const inputs = { ...window.lastInputs };
                const currency = document.getElementById('currencySelect').value;
                const sensitivityVar = document.getElementById('sensitivityVar').value;
                const rangePercent = parseFloat(document.getElementById('sensitivityRange').value) / 100;
                let SR;
                try { SR = await FG.calc('tool1', 'sensitivity', { inputs, sensitivityVar, rangePercent }); } catch (e) { FG.calcError(e); return; }
                const labels = SR.labels, npvResults = SR.npvResults, irrResults = SR.irrResults;

                let tableHtml =
                    T('s61');
                for (let i = 0; i < labels.length; i++) {
                    tableHtml +=
                        `<tr><td>${labels[i]}</td><td class="${npvResults[i]>0?'positive':'negative'}">${currency}${npvResults[i].toFixed(0)}</td><td>${irrResults[i].toFixed(2)}%</td></tr>`;
                }
                tableHtml += '</tbody></table>';
                document.getElementById('sensitivityResults').innerHTML = tableHtml;
            });

            // ========== تصدير Excel ==========
            async function exportToFullExcel() {
                if (!window.lastResult || !window.lastInputs) {
                    alert(T('s62'));
                    return;
                }
                showLoading(T('s63'), T('s64'));
                try {
                    const currency = document.getElementById('currencySelect').value;
                    const companyName = document.getElementById('companyName').value || T('s65');
                    const res = window.lastResult;
                    const inputs = window.lastInputs;
                    const evaluation = window.lastEvaluation;

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
                    const cv = workbook.addWorksheet(T('s66'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    [8, 45, 35, 8].forEach((w, i) => cv.getColumn(i + 1).width = w);
                    for (let r = 1; r <= 40; r++) cv.getRow(r).height = 22;
                    cv.getRow(2).height = 80;
                    cv.getRow(4).height = 60;
                    cv.mergeCells(2, 1, 2, 4);
                    const bc = cv.getCell(2, 1);
                    bc.value = T('s67');
                    bc.font = { name: 'Arial', bold: true, size: 28, color: { argb: GL } };
                    bc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DB } };
                    bc.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true,
                    readingOrder: FG.dir() };
                    bc.border = { bottom: { style: 'thick', color: { argb: G } } };
                    mh(cv, 1, 4, 4, `${T('s68')}${companyName}`, DB, GL, 18);
                    const inf = [
                        [T('s69'), companyName],
                        [T('s70'), new Date().toLocaleDateString(FG.locale())],
                        [T('s71'), currency],
                        ['📊 NPV', `${currency} ${res.npv.toFixed(0)}`],
                        ['📈 IRR', !isNaN(res.irr) ? (res.irr * 100).toFixed(2) + '%' : T('s24')]
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
                    const inputsSheet = workbook.addWorksheet(T('s72'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    inputsSheet.getColumn(1).width = 5;
                    inputsSheet.getColumn(2).width = 38;
                    inputsSheet.getColumn(3).width = 22;
                    inputsSheet.getColumn(4).width = 22;
                    inputsSheet.getColumn(5).width = 5;
                    mh(inputsSheet, 1, 5, 1, T('s73'), DB, GL, 14);
                    inputsSheet.getRow(1).height = 40;
                    mh(inputsSheet, 2, 4, 2, T('s74'), SB, W, 11);
                    inputsSheet.getRow(2).height = 28;
                    const inputFields = [
                        [T('s75'), inputs.fixedCapital, `${currency} ${inputs.fixedCapital.toFixed(0)}`],
                        [T('s76'), inputs.setupCapital, `${currency} ${inputs.setupCapital.toFixed(0)}`],
                        [T('s77'), inputs.monthlySales,
                            `${currency} ${inputs.monthlySales.toFixed(0)}`],
                        [T('s78'), inputs.employees, ''],
                        [T('s79'), inputs.netSalary,
                            `${currency} ${inputs.netSalary.toFixed(0)}`],
                        [T('s80'), inputs.salaryBurden, ''],
                        [T('s81'), inputs.netRent, `${currency} ${inputs.netRent.toFixed(0)}`],
                        [T('s82'), inputs.rentTax * 100, `${(inputs.rentTax*100).toFixed(0)}%`],
                        [T('s83'), inputs.totalVariableCostPercent * 100,
                            `${(inputs.totalVariableCostPercent*100).toFixed(1)}%`
                        ],
                        [T('s84'), inputs.opexMonthly,
                            `${currency} ${inputs.opexMonthly.toFixed(0)}`],
                        [T('s85'), inputs.cashReserve,
                            `${currency} ${inputs.cashReserve.toFixed(0)}`],
                        [T('s86'), inputs.wcMonths, ''],
                        [T('s87'), inputs.growth * 100, `${(inputs.growth*100).toFixed(1)}%`],
                        [T('s88'), inputs.expGrowth * 100, `${(inputs.expGrowth*100).toFixed(1)}%`],
                        [T('s89'), inputs.discount * 100, `${(inputs.discount*100).toFixed(1)}%`],
                        [T('s90'), inputs.taxRate * 100, `${(inputs.taxRate*100).toFixed(0)}%`],
                        [T('s91'), inputs.lifeYears, T('s92')],
                        [T('s93'), inputs.reinvestRate * 100,
                            `${(inputs.reinvestRate*100).toFixed(1)}%`],
                        [T('s94'), inputs.debtService,
                            `${currency} ${inputs.debtService.toFixed(0)}`],
                        [T('s95'), inputs.pricePerUnit, `${currency} ${inputs.pricePerUnit.toFixed(0)}`]
                    ];
                    let iRow = 3;
                    inputFields.forEach(([label, val, note], idx) => {
                        inputsSheet.getRow(iRow).height = 24;
                        const bg = idx % 2 === 0 ? 'FFFEFCF6' : 'FFFFFFFF';
                        const lc = inputsSheet.getCell(iRow, 2),
                            vc = inputsSheet.getCell(iRow, 3),
                            nc = inputsSheet.getCell(iRow, 4);
                        lc.value = label;
                        vc.value = val;
                        nc.value = note;
                        ap(lc, cs(bg, DT, true, FG.start()));
                        ap(vc, { ...cs(bg, '0000FF', false, 'center'), numFmt: typeof val === 'number' ?
                            '#,##0' : null });
                        ap(nc, cs(bg, '00695C', false, 'center'));
                        iRow++;
                    });

                    // 3. KPI
                    const kpiSheet = workbook.addWorksheet(T('s96'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    [5, 32, 22, 22, 22, 5].forEach((w, i) => kpiSheet.getColumn(i + 1).width = w);
                    mh(kpiSheet, 1, 6, 1, T('s97'), DB, GL, 15);
                    kpiSheet.getRow(1).height = 45;
                    mh(kpiSheet, 2, 5, 2, `${companyName} | ${new Date().toLocaleDateString(FG.locale())}`, HB, W, 10);
                    kpiSheet.getRow(2).height = 26;
                    const kpis = [
                        { label: 'NPV', value: `${currency} ${res.npv.toFixed(0)}`, good: res.npv > 0 },
                        { label: 'IRR', value: !isNaN(res.irr) ? (res.irr * 100).toFixed(2) + '%' :
                            T('s24'), good: !isNaN(res.irr) && res.irr > inputs.discount },
                        { label: 'PI', value: res.pi.toFixed(2), good: res.pi >= 1 },
                        { label: T('s98'), value: res.payback !== null ? res.payback.toFixed(1) +
                            T('s99') : '∞', good: res.payback !== null && res.payback < inputs
                            .lifeYears / 2 },
                        { label: 'ROI', value: (res.roi * 100).toFixed(2) + '%', good: true },
                        { label: T('s100'), value: `${currency} ${res.ebitda.toFixed(0)}`, good: true }
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
                        lc2.alignment = { horizontal: FG.start(), vertical: 'middle', readingOrder: FG.dir() };
                        vc3.font = { name: 'Arial', bold: true, size: 13, color: { argb: tc } };
                        vc3.alignment = { horizontal: 'center', vertical: 'middle' };
                        nc2.font = { name: 'Arial', size: 9, color: { argb: '444444' } };
                        nc2.alignment = { horizontal: 'right', vertical: 'middle', readingOrder: FG.dir() };
                        kRow++;
                    });
                    kRow++;
                    kpiSheet.mergeCells(kRow, 2, kRow, 5);
                    const kFinal = kpiSheet.getCell(kRow, 2);
                    kFinal.value = res.npv > 0 ? T('s101') :
                        T('s102');
                    kFinal.font = { name: 'Arial', bold: true, size: 13, color: { argb: res.npv > 0 ? PT :
                            '856404' } };
                    kFinal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: res.npv > 0 ? PB :
                        GB } };
                    kFinal.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: FG.dir() };
                    kFinal.border = { top: { style: 'medium', color: { argb: G } }, bottom: { style: 'medium',
                            color: { argb: G } }, left: { style: 'medium', color: { argb: G } },
                        right: { style: 'medium', color: { argb: G } } };
                    kpiSheet.getRow(kRow).height = 40;

                    // 4. التدفقات النقدية
                    const cashSheet = workbook.addWorksheet(T('s103'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    cashSheet.getColumn(1).width = 5;
                    cashSheet.getColumn(2).width = 15;
                    cashSheet.getColumn(3).width = 18;
                    cashSheet.getColumn(4).width = 18;
                    cashSheet.getColumn(5).width = 18;
                    cashSheet.getColumn(6).width = 18;
                    cashSheet.getColumn(7).width = 15;
                    cashSheet.getColumn(8).width = 18;
                    cashSheet.getColumn(9).width = 18;
                    cashSheet.getColumn(10).width = 18;
                    cashSheet.getColumn(11).width = 5;
                    mh(cashSheet, 1, 11, 1, T('s104'), DB, GL, 14);
                    cashSheet.getRow(1).height = 40;
                    cashSheet.addRow([T('s105'), T('s19'), T('s106'), T('s107'), T('s108'), 'EBIT', T('s109'),
                        T('s110'), T('s111')
                    ]);
                    for (let i = 0; i < res.years; i++) {
                        cashSheet.addRow([i + 1, res.revenues[i], res.fixedExpenses[i], res.variableExpenses[i],
                            res.depreciation, res.ebit[i], res.tax[i], res.nopat[i], res.fcf[i]
                        ]);
                    }
                    const cashHeader = cashSheet.getRow(2);
                    cashHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    cashHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };

                    // 5. الرسوم البيانية
                    const chartsSheet = workbook.addWorksheet(T('s112'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    chartsSheet.getColumn(1).width = 5;
                    chartsSheet.getColumn(2).width = 50;
                    chartsSheet.getColumn(3).width = 5;
                    mh(chartsSheet, 1, 3, 1, T('s113'), DB, GL, 14);
                    chartsSheet.getRow(1).height = 40;
                    const chartContainer = document.querySelector('.charts-container');
                    if (chartContainer) {
                        try {
                            const origBg = chartContainer.style.backgroundColor;
                            chartContainer.style.backgroundColor = '#ffffff';
                            const canvasImg = await html2canvas(chartContainer, { scale: 2,
                                backgroundColor: '#ffffff' });
                            chartContainer.style.backgroundColor = origBg;
                            const imgData = canvasImg.toDataURL('image/png');
                            const imageId = workbook.addImage({ base64: imgData, extension: 'png' });
                            chartsSheet.addImage(imageId, { tl: { col: 1, row: 2 }, br: { col: 2,
                                    row: 30 }, editAs: 'oneCell' });
                        } catch (err) {}
                    }

                    // 6. التقييم
                    const evalSheet = workbook.addWorksheet(T('s114'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    evalSheet.getColumn(1).width = 5;
                    evalSheet.getColumn(2).width = 50;
                    evalSheet.getColumn(3).width = 5;
                    mh(evalSheet, 1, 3, 1, T('s115'), DB, GL, 14);
                    evalSheet.getRow(1).height = 45;
                    const sections = [
                        { title: T('s116'), content: `${T('s117')}${evaluation.score}${T('s118')}${evaluation.grade}\n${evaluation.details.join('\n')}` },
                        { title: T('s119'),
                        content: `${T('s120')}${currency} ${res.beRevenueActual.toFixed(0)}${T('s121')}${res.beUnitsActual.toFixed(0)}${T('s21')}` },
                        { title: T('s122'), content: res.npv > 0 ?
                            T('s123') :
                            T('s124')
                        },
                        { title: T('s125'),
                        content: T('s126') }
                    ];
                    let itRow = 2;
                    sections.forEach((sec, idx) => {
                        itRow++;
                        evalSheet.getRow(itRow).height = 30;
                        evalSheet.mergeCells(itRow, 2, itRow, 2);
                        const tc3 = evalSheet.getCell(itRow, 2);
                        tc3.value = sec.title;
                        tc3.font = { name: 'Arial', bold: true, size: 12, color: { argb: GL } };
                        tc3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 ===
                                0 ? HB : SB } };
                        tc3.alignment = { horizontal: FG.start(), vertical: 'middle',
                        readingOrder: FG.dir() };
                        tc3.border = { bottom: { style: 'medium', color: { argb: G } } };
                        itRow++;
                        evalSheet.getRow(itRow).height = Math.max(60, sec.content.split('\n')
                        .length * 18);
                        evalSheet.mergeCells(itRow, 2, itRow, 2);
                        const cc = evalSheet.getCell(itRow, 2);
                        cc.value = sec.content;
                        cc.font = { name: 'Arial', size: 10, color: { argb: DT } };
                        cc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEFCF6' } };
                        cc.alignment = { horizontal: FG.start(), vertical: 'top', wrapText: true,
                            readingOrder: FG.dir() };
                        cc.border = { top: { style: 'hair' }, bottom: { style: 'hair',
                                color: { argb: G } }, left: { style: 'hair' }, right: { style: 'hair' } };
                    });

                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const now = new Date();
                    const fileName =
                        `${T('s127')}${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
                    saveAs(blob, fileName);
                } catch (err) {
                    console.error(err);
                    alert(T('s128') + err.message);
                } finally {
                    hideLoading();
                }
            }

            // ========== تصدير Word ==========
            async function exportToWord() {
                if (!window.lastResult || !window.lastInputs) {
                    alert(T('s62'));
                    return;
                }
                showLoading(T('s129'), T('s130'));
                try {
                    const currency = document.getElementById('currencySelect').value;
                    const companyName = document.getElementById('companyName').value || T('s65');
                    const res = window.lastResult;
                    const inputs = window.lastInputs;
                    const evaluation = window.lastEvaluation;

                    const chartContainer = document.querySelector('.charts-container');
                    let chartImgBase64 = '';
                    if (chartContainer) {
                        const origBg = chartContainer.style.backgroundColor;
                        chartContainer.style.backgroundColor = '#ffffff';
                        const img = await html2canvas(chartContainer, { scale: 2,
                            backgroundColor: '#ffffff' });
                        chartContainer.style.backgroundColor = origBg;
                        chartImgBase64 = img.toDataURL('image/png');
                    }

                    let kpiRows = '';
                    const kpiCards = document.querySelectorAll('#kpiCards .result-card');
                    let row = '';
                    let count = 0;
                    kpiCards.forEach((card, index) => {
                        const icon = card.querySelector('i') ? card.querySelector('i').outerHTML : '';
                        const title = card.querySelector('h4') ? card.querySelector('h4').innerText : '';
                        const value = card.querySelector('.value') ? card.querySelector('.value')
                            .innerText : '';
                        const unit = card.querySelector('.unit') ? card.querySelector('.unit')
                            .innerText : '';
                        const status = card.querySelector('.status') ? card.querySelector('.status')
                            .outerHTML : '';
                        const cell =
                            `<td style="border:1px solid #b8860b; padding:15px; text-align:center; background:#fefcf6;">${icon}<h4 style="margin:0.5rem 0; color:#666;">${title}</h4><div style="font-size:1.6rem; font-weight:900; color:#b8860b;">${value}</div><div style="font-size:0.9rem; color:#777;">${unit}</div>${status}</td>`;
                        row += cell;
                        count++;
                        if (count % 2 === 0 || index === kpiCards.length - 1) { kpiRows +=
                            `<tr>${row}</tr>`; row = ''; }
                    });

                    let tableRows = '';
                    for (let i = 0; i < res.years; i++) {
                        tableRows +=
                            `<tr><td>${i+1}</td><td>${currency}${res.revenues[i].toFixed(0)}</td><td>${currency}${res.fixedExpenses[i].toFixed(0)}</td><td>${currency}${res.variableExpenses[i].toFixed(0)}</td><td>${currency}${res.depreciation.toFixed(0)}</td><td>${currency}${res.ebit[i].toFixed(0)}</td><td>${currency}${res.tax[i].toFixed(0)}</td><td>${currency}${res.nopat[i].toFixed(0)}</td><td>${currency}${res.fcf[i].toFixed(0)}</td></tr>`;
                    }

                    const now = new Date();
                    const dateStr = now.toLocaleDateString(FG.locale());

                    const fullHtml = `${T('s131')}${companyName}${T('s132')}${dateStr}${T('s133')}${currency} | NPV: ${currency} ${res.npv.toFixed(0)}${T('s134')}${currency} ${inputs.fixedCapital}${T('s135')}${currency} ${inputs.setupCapital}${T('s136')}${currency} ${inputs.monthlySales}${T('s137')}${inputs.employees}${T('s138')}${currency} ${inputs.netSalary}${T('s139')}${currency} ${inputs.netRent}${T('s140')}${(inputs.growth*100).toFixed(1)}${T('s141')}${(inputs.discount*100).toFixed(1)}${T('s142')}${kpiRows}${T('s143')}${chartImgBase64}${T('s144')}${tableRows}${T('s145')}${currency} ${res.beRevenueActual.toFixed(0)} (${res.beUnitsActual.toFixed(0)}${T('s146')}${evaluation.score}/100 - ${evaluation.grade}</p>
                            <p>${evaluation.details.join('<br>')}${T('s147')}${now.getFullYear()}</div>
                    </body></html>`;

                    const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download =
                        `${T('s127')}${companyName}_${now.toISOString().slice(0,10)}.doc`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                } catch (error) {
                    console.error(error);
                    alert(T('s148'));
                } finally {
                    hideLoading();
                }
            }

            document.getElementById('exportWordBtn').addEventListener('click', exportToWord);
            document.getElementById('exportFullExcelBtn').addEventListener('click', exportToFullExcel);

            document.addEventListener('touchmove', function(e) {
                if (e.target.closest('.table-container') || e.target.closest('.modal')) return;
            }, { passive: true });

        })();
    