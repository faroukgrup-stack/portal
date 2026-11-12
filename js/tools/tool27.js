
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

            // ===== الحساب الرئيسي =====
            async function computeSaaS() {
                const cur = document.getElementById('currencySelect').value;
                const v = (id) => document.getElementById(id).value;
                let P;
                if (currentStage === 'pre') {
                    P = {
                        stage: 'pre', currency: cur,
                        berkusValues: ['berkusIdea', 'berkusPrototype', 'berkusTeam', 'berkusRelations', 'berkusExecution']
                            .map(id => parseFloat(v(id)) || 0),
                        rebuild: parseFloat(v('rebuildCost')) || 0,
                        risk: parseFloat(v('riskPremium')) || 0
                    };
                } else {
                    P = {
                        stage: 'post', currency: cur,
                        ARR: parseFloat(v('arrInput')) || 0,
                        growth: parseFloat(v('growthRate')) || 0,
                        gross: parseFloat(v('grossMargin')) || 0,
                        margin: parseFloat(v('profitMargin')) || 0,
                        churn: parseFloat(v('churnRate')) || 0,
                        nrr: parseFloat(v('nrrInput')) || 100,
                        cust: parseFloat(v('customersCount')) || 0,
                        cac: parseFloat(v('cacInput')) || 0,
                        ltv: parseFloat(v('ltvInput')) || 0,
                        netBurn: parseFloat(v('netBurnRate')) || 0,
                        cash: parseFloat(v('cashOnHand')) || 0,
                        arrQ: parseFloat(v('arrCurrentQ')),
                        arrPrevQ: parseFloat(v('arrPrevQ')),
                        salesMkt: parseFloat(v('salesMarketingPrevQ')),
                        exitVal: parseFloat(v('exitValue')) || 0,
                        roi: parseFloat(v('roiMultiple')) || 10
                    };
                }
                const res = await FG.calc('tool27', 'main', P);
                if (res.stage === 'post') document.getElementById('magicNumberNote').style.display = res.magicEstimated ? 'block' : 'none';
                return res;
            }

            // ===== عرض النتائج =====
            function displayResults(res) {
                document.getElementById('initialMessage').style.display = 'none';
                document.getElementById('resultsSection').style.display = 'block';
                const cur = res.currency;

                if (res.stage === 'post') {
                    // بطاقات KPI
                    document.getElementById('kpiCards').innerHTML = `${T('s4')}${cur}${(res.ARR/1000).toFixed(0)}${T('s5')}${res.growthRate.toFixed(1)}${T('s6')}${res.nrr.toFixed(0)}${T('s7')}${res.ltvCac.toFixed(2)}${T('s8')}${res.cacPaybackMonths !== null ? res.cacPaybackMonths.toFixed(1)+T('s2') : T('s3')}${T('s9')}${res.magicNumber.toFixed(2)}${res.magicEstimated ? '*' : ''}${T('s10')}${res.burnMultiple !== null ? res.burnMultiple.toFixed(2)+'x' : T('s3')}${T('s11')}${isFinite(res.runwayMonths) ? res.runwayMonths.toFixed(1)+T('s2') : '∞'}</div></div>
                    `;

                    // قاعدة الـ40
                    const badgeClass = res.ev.r40Class;
                    document.getElementById('rule40Badge').innerHTML = `
                        <span class="status ${badgeClass}${T('s14')}${res.rule40.toFixed(1)}${T('s15')}${res.growthRate}${T('s16')}${res.profitMargin}%) – ${res.ev.r40 ? T('s12') : T('s13')}
                        </span>
                    `;

                    // جدول التقييم
                    document.getElementById('valuationTable').innerHTML = `${T('s17')}${res.baseMultiple.toFixed(1)}x)</strong></td><td>${cur}${(res.evLow/1e6).toFixed(2)}${T('s18')}${cur}${(res.evBase/1e6).toFixed(2)}${T('s19')}${cur}${(res.evHigh/1e6).toFixed(2)}${T('s20')}${cur}${(res.vcLow/1e6).toFixed(2)}${T('s18')}${cur}${(res.vcBase/1e6).toFixed(2)}${T('s19')}${cur}${(res.vcHigh/1e6).toFixed(2)}${T('s21')}${cur}${(Math.min(res.evLow,res.vcLow)/1e6).toFixed(2)}${T('s22')}${cur}${(((res.evBase+res.vcBase)/2)/1e6).toFixed(2)}${T('s22')}${cur}${(Math.max(res.evHigh,res.vcHigh)/1e6).toFixed(2)}${T('s23')}`;

                    // التفسير
                    let explainHtml = `${T('s24')}`;
                    explainHtml += `${T('s27')}${res.rule40.toFixed(1)}% – ${res.ev.r40 ? T('s25') : T('s26')}</p>`;
                    explainHtml += `${T('s30')}${res.ltvCac.toFixed(2)}x – ${res.ev.ltv ? T('s28') : T('s29')}</p>`;
                    explainHtml += `${T('s34')}${res.cacPaybackMonths !== null ? res.cacPaybackMonths.toFixed(1)+T('s31') : T('s3')} – ${res.ev.pay ? T('s32') : T('s33')}</p>`;
                    explainHtml += `${T('s37')}${res.magicNumber.toFixed(2)} – ${res.ev.magic ? T('s35') : T('s36')}</p>`;
                    explainHtml += `${T('s40')}${res.burnMultiple !== null ? res.burnMultiple.toFixed(2)+'x' : T('s3')} – ${res.ev.burn ? T('s38') : T('s39')}</p>`;
                    explainHtml += `${T('s43')}${isFinite(res.runwayMonths) ? res.runwayMonths.toFixed(1)+T('s31') : '∞'} – ${res.ev.runway ? T('s41') : T('s42')}</p>`;
                    explainHtml += `${T('s44')}${cur}${(Math.min(res.evLow,res.vcLow)/1e6).toFixed(2)}${T('s45')}${cur}${(Math.max(res.evHigh,res.vcHigh)/1e6).toFixed(2)}${T('s46')}`;
                    document.getElementById('explainSection').innerHTML = explainHtml;

                    document.getElementById('additionalNotes').innerHTML = `${res.magicEstimated ? T('s47') : ''}${T('s48')}`;

                    // الرسم البياني
                    const ctx = document.getElementById('valuationChart').getContext('2d');
                    if (valuationChart) valuationChart.destroy();
                    valuationChart = new Chart(ctx, {
                        type: 'bar',
                        data: {
                            labels: [T('s49'), T('s50'), T('s51')],
                            datasets: [
                                { label: T('s52'), data: [res.evLow / 1e6, res.evBase / 1e6, res
                                        .evHigh / 1e6
                                    ], backgroundColor: '#c9a050' },
                                { label: T('s53'), data: [res.vcLow / 1e6, res.vcBase / 1e6, res
                                        .vcHigh / 1e6
                                    ], backgroundColor: '#4a7a8c' }
                            ]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { labels: { color: '#f0f4fa' } } },
                            scales: {
                                y: { ticks: { callback: v => v + T('s54'), color: '#f0f4fa' }, grid: { color: 'rgba(180,133,84,0.15)' } },
                                x: { ticks: { color: '#f0f4fa' } }
                            }
                        }
                    });

                } else {
                    // مرحلة ما قبل الإيرادات
                    document.getElementById('kpiCards').innerHTML = `${T('s55')}${cur}${(res.berkusTotal/1000).toFixed(0)}${T('s56')}${cur}${(res.riskAdjustedCost/1000).toFixed(0)}${T('s57')}`;
                    document.getElementById('rule40Badge').innerHTML = '';
                    document.getElementById('valuationTable').innerHTML = `${T('s58')}${cur}${(res.berkusTotal/1000).toFixed(0)}${T('s59')}${cur}${(res.riskAdjustedCost/1000).toFixed(0)}${T('s60')}${cur}${(res.preLow/1000).toFixed(0)}${T('s61')}${cur}${(res.preHigh/1000).toFixed(0)}${T('s62')}`;
                    document.getElementById('explainSection').innerHTML = `${T('s63')}${cur}${(res.berkusTotal/1000).toFixed(0)}${T('s64')}${cur}${(res.riskAdjustedCost/1000).toFixed(0)}${T('s65')}${cur}${(res.preLow/1000).toFixed(0)}${T('s61')}${cur}${(res.preHigh/1000).toFixed(0)}${T('s66')}`;
                    document.getElementById('additionalNotes').innerHTML = T('s67');

                    // إخفاء الرسم البياني
                    if (valuationChart) { valuationChart.destroy();
                        valuationChart = null; }
                    document.getElementById('valuationChart').parentElement.style.display = 'none';
                }

                globalSaaSData = res;
            }

            // ===== ربط زر الحساب =====
            document.getElementById('calculateBtn').addEventListener('click', async function() {
                let res;
                try { res = await computeSaaS(); } catch (e) { FG.calcError(e); return; }
                displayResults(res);
            });

            // ========== تصدير Excel ==========
            async function exportToFullExcel() {
                if (!globalSaaSData) { alert(T('s68')); return; }
                showLoading(T('s69'), T('s70'));
                try {
                    const D = globalSaaSData;
                    const cur = D.currency;
                    const company = document.getElementById('companyName').value || T('s71');

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
                    const cv = workbook.addWorksheet(T('s72'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    [8, 45, 35, 8].forEach((w, i) => cv.getColumn(i + 1).width = w);
                    for (let r = 1; r <= 40; r++) cv.getRow(r).height = 22;
                    cv.getRow(2).height = 80;
                    cv.getRow(4).height = 60;
                    cv.mergeCells(2, 1, 2, 4);
                    const bc = cv.getCell(2, 1);
                    bc.value = T('s73');
                    bc.font = { name: 'Arial', bold: true, size: 28, color: { argb: GL } };
                    bc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DB } };
                    bc.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true,
                    readingOrder: FG.dir() };
                    bc.border = { bottom: { style: 'thick', color: { argb: G } } };
                    mh(cv, 1, 4, 4, `${T('s74')}${company}`, DB, GL, 18);
                    const inf = [
                        [T('s75'), company],
                        [T('s76'), new Date().toLocaleDateString(FG.locale())],
                        [T('s77'), cur],
                        [T('s78'), D.stage === 'post' ? T('s79') : T('s80')]
                    ];
                    if (D.stage === 'post') {
                        inf.push([T('s81'), `${cur} ${fmtNum((D.evBase + D.vcBase) / 2)}`]);
                        inf.push([T('s82'), `${D.baseMultiple.toFixed(2)}x`]);
                        inf.push([T('s83'), `${D.rule40.toFixed(1)}%`]);
                    } else {
                        inf.push([T('s84'), `${cur} ${fmtNum(D.berkusTotal)}`]);
                        inf.push([T('s85'), `${cur} ${fmtNum(D.riskAdjustedCost)}`]);
                    }
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
                    const inputsSheet = workbook.addWorksheet(T('s86'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    inputsSheet.getColumn(1).width = 5;
                    inputsSheet.getColumn(2).width = 38;
                    inputsSheet.getColumn(3).width = 22;
                    inputsSheet.getColumn(4).width = 22;
                    inputsSheet.getColumn(5).width = 5;
                    mh(inputsSheet, 1, 5, 1, T('s87'), DB, GL, 14);
                    inputsSheet.getRow(1).height = 40;
                    mh(inputsSheet, 2, 4, 2, T('s88'), SB, W, 11);
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

                    if (D.stage === 'post') {
                        addInputRow(T('s89'), D.ARR);
                        addInputRow(T('s90'), D.growthRate, '%');
                        addInputRow(T('s91'), D.grossMargin, '%');
                        addInputRow(T('s92'), D.profitMargin, '%');
                        addInputRow(T('s93'), D.churn, '%');
                        addInputRow(T('s94'), D.nrr, '%');
                        addInputRow(T('s95'), parseFloat(document.getElementById('customersCount').value) || 0);
                        addInputRow(T('s96'), parseFloat(document.getElementById('cacInput')
                            .value) || 0);
                        addInputRow(T('s97'), parseFloat(document.getElementById('ltvInput')
                            .value) || 0);
                        addInputRow(T('s98'), parseFloat(document.getElementById('netBurnRate').value) ||
                            0);
                        addInputRow(T('s99'), parseFloat(document.getElementById('cashOnHand').value) || 0);
                        addInputRow(T('s100'), parseFloat(document.getElementById('exitValue')
                            .value) || 0);
                        addInputRow(T('s101'), parseFloat(document.getElementById('roiMultiple')
                            .value) || 10);
                        addInputRow(T('s102'), parseFloat(document.getElementById('exitYears').value) || 6);
                    } else {
                        addInputRow(T('s103'), parseFloat(document.getElementById('berkusIdea').value) || 0);
                        addInputRow(T('s104'), parseFloat(document.getElementById('berkusPrototype')
                            .value) || 0);
                        addInputRow(T('s105'), parseFloat(document.getElementById('berkusTeam').value) || 0);
                        addInputRow(T('s106'), parseFloat(document.getElementById('berkusRelations')
                            .value) || 0);
                        addInputRow(T('s107'), parseFloat(document.getElementById('berkusExecution')
                            .value) || 0);
                        addInputRow(T('s108'), parseFloat(document.getElementById('rebuildCost')
                            .value) || 0);
                        addInputRow(T('s109'), parseFloat(document.getElementById('riskPremium').value) || 0,
                            '%');
                    }

                    // 3. مؤشرات الأداء
                    const kpiSheet = workbook.addWorksheet(T('s110'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    [5, 32, 22, 22, 22, 5].forEach((w, i) => kpiSheet.getColumn(i + 1).width = w);
                    mh(kpiSheet, 1, 6, 1, T('s111'), DB, GL, 15);
                    kpiSheet.getRow(1).height = 45;
                    mh(kpiSheet, 2, 5, 2, `${company} | ${new Date().toLocaleDateString(FG.locale())}`, HB, W, 10);
                    kpiSheet.getRow(2).height = 26;

                    let kpis = [];
                    if (D.stage === 'post') {
                        kpis = [
                            { label: T('s112'), value: `${cur} ${fmtNum(D.ARR)}`, good: true },
                            { label: T('s113'), value: `${D.growthRate.toFixed(1)}%`, good: D.ev.growth },
                            { label: T('s114'), value: `${D.nrr.toFixed(0)}%`, good: D.ev.nrr },
                            { label: T('s115'), value: `${D.ltvCac.toFixed(2)}x`, good: D.ev.ltv },
                            { label: T('s116'), value: D.cacPaybackMonths !== null ? `${D.cacPaybackMonths.toFixed(1)}${T('s2')}` :
                                    T('s3'), good: D.ev.pay },
                            { label: T('s117'), value: `${D.magicNumber.toFixed(2)}`, good: D.ev.magic },
                            { label: T('s118'), value: D.burnMultiple !== null ? `${D.burnMultiple.toFixed(2)}x` :
                                    T('s3'), good: D.ev.burn },
                            { label: T('s119'), value: isFinite(D.runwayMonths) ? `${D.runwayMonths.toFixed(1)}${T('s2')}` :
                                    '∞', good: D.ev.runway12 }
                        ];
                    } else {
                        kpis = [
                            { label: T('s120'), value: `${cur} ${fmtNum(D.berkusTotal)}`, good: true },
                            { label: T('s121'), value: `${cur} ${fmtNum(D.riskAdjustedCost)}`,
                            good: true },
                            { label: T('s122'), value: `${cur} ${fmtNum(D.preLow)}`, good: true },
                            { label: T('s123'), value: `${cur} ${fmtNum(D.preHigh)}`, good: true }
                        ];
                    }

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
                    const isGood = D.stage === 'post' ? (D.evBase + D.vcBase) / 2 > 0 : D.preBase > 0;
                    kFinal.value = isGood ? T('s124') : T('s125');
                    kFinal.font = { name: 'Arial', bold: true, size: 13, color: { argb: isGood ? PT :
                        '856404' } };
                    kFinal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: isGood ? PB : GB } };
                    kFinal.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: FG.dir() };
                    kFinal.border = { top: { style: 'medium', color: { argb: G } }, bottom: { style: 'medium',
                            color: { argb: G } }, left: { style: 'medium', color: { argb: G } },
                        right: { style: 'medium', color: { argb: G } } };
                    kpiSheet.getRow(kRow).height = 40;

                    // 4. نطاق التقييم
                    const valSheet = workbook.addWorksheet(T('s126'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    [5, 35, 22, 22, 22, 5].forEach((w, i) => valSheet.getColumn(i + 1).width = w);
                    mh(valSheet, 1, 6, 1, T('s127'), DB, GL, 14);
                    valSheet.getRow(1).height = 40;

                    if (D.stage === 'post') {
                        [T('s128'), T('s49'), T('s50'), T('s51')].forEach((h, i) => { const c = valSheet.getCell(2, i +
                            2);
                            c.value = h;
                            ap(c, hs(SB, GL)); });
                        const data = [
                            [`${T('s129')}${D.baseMultiple.toFixed(1)}x)`, D.evLow, D.evBase, D.evHigh],
                            [T('s53'), D.vcLow, D.vcBase, D.vcHigh],
                            [T('s130'), Math.min(D.evLow, D.vcLow), (D.evBase + D.vcBase) / 2, Math
                                .max(D.evHigh, D.vcHigh)
                            ]
                        ];
                        data.forEach((row, i) => {
                            const r = 3 + i;
                            valSheet.getRow(r).height = 30;
                            row.forEach((v, j) => {
                                const c = valSheet.getCell(r, j + 2);
                                c.value = v;
                                ap(c, { ...cs(i === 2 ? GB : W, i === 2 ? DT : DT, i === 2 || j ===
                                        1, 'center'
                                    ), numFmt: typeof v === 'number' ? '#,##0' : null });
                                if (j === 0) { c.font = { name: 'Arial', bold: true, size: 10,
                                        color: { argb: G } };
                                    c.numFmt = '@'; }
                            });
                        });
                    } else {
                        [T('s128'), T('s131')].forEach((h, i) => { const c = valSheet.getCell(2, i + 2);
                            c.value = h;
                            ap(c, hs(SB, GL)); });
                        [
                            [T('s132'), D.berkusTotal],
                            [T('s121'), D.riskAdjustedCost],
                            [T('s133'), `${fmtNum(D.preLow)} – ${fmtNum(D.preHigh)}`]
                        ].forEach((row, i) => {
                            const r = 3 + i;
                            valSheet.getRow(r).height = 30;
                            const lc = valSheet.getCell(r, 2),
                                vc = valSheet.getCell(r, 3);
                            lc.value = row[0];
                            vc.value = row[1];
                            ap(lc, cs(W, DT, true, 'right'));
                            ap(vc, { ...cs(W, DT, true, 'center'), numFmt: typeof row[1] === 'number' ?
                                    '#,##0' : null });
                            if (typeof row[1] !== 'number') vc.numFmt = '@';
                        });
                    }

                    // 5. الرسم البياني (للمرحلة ما بعد الإيرادات فقط)
                    if (D.stage === 'post') {
                        const chartSheet = workbook.addWorksheet(T('s134'), { views: [{ rightToLeft: FG.isRTL(),
                                showGridLines: false }] });
                        chartSheet.getColumn(1).width = 5;
                        chartSheet.getColumn(2).width = 50;
                        chartSheet.getColumn(3).width = 5;
                        mh(chartSheet, 1, 3, 1, T('s135'), DB, GL, 14);
                        chartSheet.getRow(1).height = 40;
                        const canvasElem = document.getElementById('valuationChart');
                        if (canvasElem) {
                            try {
                                const origBg = canvasElem.style.backgroundColor;
                                canvasElem.style.backgroundColor = '#ffffff';
                                const canvasImg = await html2canvas(canvasElem, { scale: 2,
                                    backgroundColor: '#ffffff' });
                                canvasElem.style.backgroundColor = origBg;
                                const imgData = canvasImg.toDataURL('image/png');
                                const imageId = workbook.addImage({ base64: imgData, extension: 'png' });
                                chartSheet.addImage(imageId, { tl: { col: 1, row: 2 }, br: { col: 2,
                                        row: 18 }, editAs: 'oneCell' });
                            } catch (err) { /* */ }
                        }
                    }

                    // 6. التفسير والتوصيات
                    const intSheet = workbook.addWorksheet(T('s136'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    intSheet.getColumn(1).width = 5;
                    intSheet.getColumn(2).width = 50;
                    intSheet.getColumn(3).width = 5;
                    mh(intSheet, 1, 3, 1, T('s137'), DB, GL, 14);
                    intSheet.getRow(1).height = 45;

                    let sections = [];
                    if (D.stage === 'post') {
                        const baseVal = (D.evBase + D.vcBase) / 2;
                        sections = [
                            { title: T('s138'),
                            content: `${T('s139')}${company}${T('s140')}${cur} ${fmtNum(baseVal)}${T('s141')}${D.baseMultiple.toFixed(2)}${T('s142')}${D.rule40.toFixed(1)}%` },
                            { title: T('s143'),
                            content: `${T('s144')}${D.ltvCac.toFixed(2)}${T('s145')}${D.cacPaybackMonths !== null ? D.cacPaybackMonths.toFixed(1)+T('s31') : T('s3')}${T('s146')}${D.magicNumber.toFixed(2)}${T('s147')}${D.burnMultiple !== null ? D.burnMultiple.toFixed(2)+'x' : T('s3')}${T('s148')}${isFinite(D.runwayMonths) ? D.runwayMonths.toFixed(1)+T('s31') : '∞'}` },
                            { title: T('s149'),
                            content: baseVal > 0 && D.ev.r40mid ? T('s150') :
                                T('s151') },
                            { title: T('s152'),
                            content: T('s153') }
                        ];
                    } else {
                        sections = [
                            { title: T('s138'),
                            content: `${T('s139')}${company}${T('s154')}${cur} ${fmtNum(D.berkusTotal)}${T('s155')}${cur} ${fmtNum(D.riskAdjustedCost)}${T('s156')}${cur} ${fmtNum(D.preLow)} – ${cur} ${fmtNum(D.preHigh)}` },
                            { title: T('s157'),
                            content: T('s158') },
                            { title: T('s159'),
                            content: T('s67') }
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
                        tc3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 ===
                                0 ? HB : SB } };
                        tc3.alignment = { horizontal: 'right', vertical: 'middle',
                        readingOrder: FG.dir() };
                        tc3.border = { bottom: { style: 'medium', color: { argb: G } } };
                        itRow++;
                        intSheet.getRow(itRow).height = Math.max(60, sec.content.split('\n')
                        .length * 18);
                        intSheet.mergeCells(itRow, 2, itRow, 2);
                        const cc = intSheet.getCell(itRow, 2);
                        cc.value = sec.content;
                        cc.font = { name: 'Arial', size: 10, color: { argb: DT } };
                        cc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEFCF6' } };
                        cc.alignment = { horizontal: 'right', vertical: 'top', wrapText: true,
                            readingOrder: FG.dir() };
                        cc.border = { top: { style: 'hair' }, bottom: { style: 'hair',
                                color: { argb: G } }, left: { style: 'hair' }, right: { style: 'hair' } };
                    });

                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const now = new Date();
                    const fileName =
                        `${T('s160')}${company}_${now.toISOString().slice(0,10)}.xlsx`;
                    saveAs(blob, fileName);
                } catch (err) {
                    console.error(err);
                    alert(T('s161') + err.message);
                } finally {
                    hideLoading();
                }
            }

            // ========== تصدير Word ==========
            async function exportToWord() {
                if (!globalSaaSData) { alert(T('s68')); return; }
                showLoading(T('s162'), T('s163'));
                try {
                    const D = globalSaaSData;
                    const cur = D.currency;
                    const company = document.getElementById('companyName').value || T('s71');
                    const now = new Date();
                    const dateStr = now.toLocaleDateString(FG.locale());

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

                    let kpiRows = '',
                        metricsTable = '',
                        sensRows = '';
                    if (D.stage === 'post') {
                        const kpis = [
                            { l: T('s112'), v: `${cur} ${fmtNum(D.ARR)}`, g: true },
                            { l: T('s164'), v: `${D.growthRate.toFixed(1)}%`, g: D.ev.growth },
                            { l: T('s114'), v: `${D.nrr.toFixed(0)}%`, g: D.ev.nrr },
                            { l: T('s115'), v: `${D.ltvCac.toFixed(2)}x`, g: D.ev.ltv },
                            { l: T('s116'), v: D.cacPaybackMonths !== null ? `${D.cacPaybackMonths.toFixed(1)}${T('s31')}` :
                                    T('s3'), g: D.ev.pay },
                            { l: T('s165'), v: `${D.magicNumber.toFixed(2)}`, g: D.ev.magic },
                            { l: T('s166'), v: D.burnMultiple !== null ? `${D.burnMultiple.toFixed(2)}x` :
                                    T('s3'), g: D.ev.burn },
                            { l: T('s167'), v: isFinite(D.runwayMonths) ? `${D.runwayMonths.toFixed(1)}${T('s31')}` :
                                    '∞', g: D.ev.runway12 }
                        ];
                        kpis.forEach(k => {
                            kpiRows +=
                                `<tr><td style="padding:10px;background:${k.g?'#d4edda':'#f8d7da'};text-align:right;">${k.l}</td><td style="padding:10px;background:${k.g?'#d4edda':'#f8d7da'};text-align:center;"><strong style="color:${k.g?'#155724':'#721c24'};">${k.v}</strong></td></tr>`;
                        });
                        metricsTable = `${T('s168')}${D.baseMultiple.toFixed(1)}x)</td><td>${cur} ${fmtNum(D.evLow)}</td><td><strong>${cur} ${fmtNum(D.evBase)}</strong></td><td>${cur} ${fmtNum(D.evHigh)}${T('s169')}${cur} ${fmtNum(D.vcLow)}</td><td><strong>${cur} ${fmtNum(D.vcBase)}</strong></td><td>${cur} ${fmtNum(D.vcHigh)}${T('s170')}${cur} ${fmtNum(Math.min(D.evLow,D.vcLow))}</strong></td><td><strong>${cur} ${fmtNum((D.evBase+D.vcBase)/2)}</strong></td><td><strong>${cur} ${fmtNum(Math.max(D.evHigh,D.vcHigh))}</strong></td></tr>
                            </tbody></table>
                        `;
                        sensRows = `${T('s181')}${D.rule40.toFixed(1)}% – ${D.ev.r40?T('s171'):T('s172')}</p>
                                <p><strong>LTV/CAC:</strong> ${D.ltvCac.toFixed(2)}x – ${D.ev.ltv?T('s173'):T('s174')}${T('s182')}${D.cacPaybackMonths!==null?D.cacPaybackMonths.toFixed(1)+T('s175'):T('s176')}${T('s183')}${D.magicNumber.toFixed(2)} – ${D.ev.magic?T('s177'):T('s178')}${T('s184')}${D.burnMultiple!==null?D.burnMultiple.toFixed(2)+'x':T('s176')} – ${D.ev.burn?T('s179'):T('s180')}${T('s185')}${isFinite(D.runwayMonths)?D.runwayMonths.toFixed(1)+T('s175'):'∞'}</p>
                            </div>
                        `;
                    } else {
                        kpiRows = `${T('s186')}${cur} ${fmtNum(D.berkusTotal)}${T('s187')}${cur} ${fmtNum(D.riskAdjustedCost)}</strong></td></tr>
                        `;
                        metricsTable = `${T('s188')}${cur} ${fmtNum(D.berkusTotal)}${T('s189')}${cur} ${fmtNum(D.riskAdjustedCost)}${T('s190')}${cur} ${fmtNum(D.preLow)} – ${cur} ${fmtNum(D.preHigh)}</strong></td></tr>
                            </tbody></table>
                        `;
                    }

                    const fullHtml = `${T('s192')}${company}${T('s193')}${dateStr}${T('s194')}${D.stage==='post'?T('s79'):T('s80')}${T('s195')}${cur}${T('s196')}${kpiRows}</table>
                        ${metricsTable}
                        ${sensRows}
                        ${chartImg?`${T('s191')}${chartImg}" class="chart-img"/></div>`:''}${T('s197')}${now.getFullYear()} | www.farouk-grup.com</div>
                    </body></html>`;

                    const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download =
                        `${T('s160')}${company}_${now.toISOString().slice(0,10)}.doc`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                } catch (err) {
                    console.error(err);
                    alert(T('s198'));
                } finally {
                    hideLoading();
                }
            }

            // ===== ربط أزرار التصدير =====
            document.getElementById('exportWordBtn').addEventListener('click', exportToWord);
            document.getElementById('exportFullExcelBtn').addEventListener('click', exportToFullExcel);

            // ===== تشغيل تلقائي مع مثال =====
            window.addEventListener('load', function() {
                // تأكد من أن المرحلة الافتراضية هي ما بعد الإيرادات
                switchStage('post');
                // تنفيذ الحساب تلقائياً بعد تحميل الصفحة
                setTimeout(function() {
                    computeSaaS().then(displayResults, FG.calcError);
                }, 400);
            });

        })();
    