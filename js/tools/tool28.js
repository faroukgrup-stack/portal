
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
            let comparisonChart = null;
            let impactChart = null;
            let currentResults = null;

            // ===== المحاكاة الرئيسية =====
            async function runSimulation() {
                const currency = document.getElementById('currencySelect').value;
                const company = document.getElementById('companyName').value || T('s2');

                const baseRevenue = parseFloat(document.getElementById('baseRevenue').value) || 0;
                const baseSalaries = parseFloat(document.getElementById('baseSalaries').value) || 0;
                const baseMaterials = parseFloat(document.getElementById('baseMaterials').value) || 0;
                const baseOtherCosts = parseFloat(document.getElementById('baseOtherCosts').value) || 0;

                const scenarioRevenuePct = parseFloat(document.getElementById('scenarioRevenue').value) || 0;
                const scenarioSalariesPct = parseFloat(document.getElementById('scenarioSalaries').value) || 0;
                const scenarioMaterialsPct = parseFloat(document.getElementById('scenarioMaterials').value) || 0;

                if (baseRevenue <= 0 || baseSalaries < 0 || baseMaterials < 0 || baseOtherCosts < 0) {
                    alert(T('s3'));
                    return;
                }

                let R;
                try { R = await FG.calc('tool28', 'main', { baseRevenue, baseSalaries, baseMaterials, baseOtherCosts, scenarioRevenuePct, scenarioSalariesPct, scenarioMaterialsPct }); } catch (e) { FG.calcError(e); return; }
                const currentTotalCosts = R.base.totalCosts, currentProfit = R.base.profit, currentMargin = R.base.margin;
                const scenarioRevenue = R.scenario.revenue, scenarioSalaries = R.scenario.salaries, scenarioMaterials = R.scenario.materials;
                const scenarioTotalCosts = R.scenario.totalCosts, scenarioProfit = R.scenario.profit, scenarioMargin = R.scenario.margin;
                const revenueChange = R.changes.revenue, costsChange = R.changes.costs, profitChange = R.changes.profit, marginChange = R.changes.margin;

                currentResults = {
                    currency,
                    company,
                    base: R.base,
                    scenario: R.scenario,
                    changes: R.changes,
                    scenarioPcts: { revenue: scenarioRevenuePct, salaries: scenarioSalariesPct,
                        materials: scenarioMaterialsPct },
                    isBetter: R.isBetter
                };

                document.getElementById('resultsSection').style.display = 'block';
                document.getElementById('initialMessage').style.display = 'none';

                // بطاقات النتائج
                document.getElementById('kpiCards').innerHTML = `${T('s4')}${revenueChange >= 0 ? '#4ade80' : '#f87171'}">${currency}${scenarioRevenue.toFixed(0)}</div>
                        <div class="change ${revenueChange >= 0 ? 'change-positive' : 'change-negative'}">${revenueChange >= 0 ? '+' : ''}${currency}${revenueChange.toFixed(0)} (${scenarioRevenuePct >= 0 ? '+' : ''}${scenarioRevenuePct}${T('s5')}${costsChange <= 0 ? '#4ade80' : '#f87171'}">${currency}${scenarioTotalCosts.toFixed(0)}</div>
                        <div class="change ${costsChange <= 0 ? 'change-positive' : 'change-negative'}">${costsChange >= 0 ? '+' : ''}${currency}${costsChange.toFixed(0)}${T('s6')}${profitChange >= 0 ? '#4ade80' : '#f87171'}">${currency}${scenarioProfit.toFixed(0)}</div>
                        <div class="change ${profitChange >= 0 ? 'change-positive' : 'change-negative'}">${profitChange >= 0 ? '+' : ''}${currency}${profitChange.toFixed(0)} (${(profitChange / (currentProfit || 1) * 100).toFixed(1)}${T('s7')}${marginChange >= 0 ? '#4ade80' : '#f87171'}">${scenarioMargin.toFixed(1)}%</div>
                        <div class="change ${marginChange >= 0 ? 'change-positive' : 'change-negative'}">${marginChange >= 0 ? '+' : ''}${marginChange.toFixed(1)}%</div>
                    </div>
                `;

                // جدول المقارنة
                document.getElementById('comparisonTable').innerHTML = `${T('s8')}${currency}${baseRevenue.toFixed(0)}</td><td>${currency}${scenarioRevenue.toFixed(0)}</td><td style="color:${revenueChange >= 0 ? '#4ade80' : '#f87171'}">${revenueChange >= 0 ? '+' : ''}${currency}${revenueChange.toFixed(0)}</td><td style="color:${revenueChange >= 0 ? '#4ade80' : '#f87171'}">${scenarioRevenuePct >= 0 ? '+' : ''}${scenarioRevenuePct}${T('s9')}${currency}${baseSalaries.toFixed(0)}</td><td>${currency}${scenarioSalaries.toFixed(0)}</td><td style="color:${(scenarioSalaries - baseSalaries) <= 0 ? '#4ade80' : '#f87171'}">${(scenarioSalaries - baseSalaries) >= 0 ? '+' : ''}${currency}${(scenarioSalaries - baseSalaries).toFixed(0)}</td><td style="color:${(scenarioSalaries - baseSalaries) <= 0 ? '#4ade80' : '#f87171'}">${scenarioSalariesPct >= 0 ? '+' : ''}${scenarioSalariesPct}${T('s10')}${currency}${baseMaterials.toFixed(0)}</td><td>${currency}${scenarioMaterials.toFixed(0)}</td><td style="color:${(scenarioMaterials - baseMaterials) <= 0 ? '#4ade80' : '#f87171'}">${(scenarioMaterials - baseMaterials) >= 0 ? '+' : ''}${currency}${(scenarioMaterials - baseMaterials).toFixed(0)}</td><td style="color:${(scenarioMaterials - baseMaterials) <= 0 ? '#4ade80' : '#f87171'}">${scenarioMaterialsPct >= 0 ? '+' : ''}${scenarioMaterialsPct}${T('s11')}${currency}${baseOtherCosts.toFixed(0)}</td><td>${currency}${baseOtherCosts.toFixed(0)}${T('s12')}${currency}${currentTotalCosts.toFixed(0)}</td><td>${currency}${scenarioTotalCosts.toFixed(0)}</td><td style="color:${costsChange <= 0 ? '#4ade80' : '#f87171'}">${costsChange >= 0 ? '+' : ''}${currency}${costsChange.toFixed(0)}</td><td style="color:${costsChange <= 0 ? '#4ade80' : '#f87171'}">${(costsChange / (currentTotalCosts || 1) * 100).toFixed(1)}${T('s13')}${currency}${currentProfit.toFixed(0)}</td><td>${currency}${scenarioProfit.toFixed(0)}</td><td style="color:${profitChange >= 0 ? '#4ade80' : '#f87171'}">${profitChange >= 0 ? '+' : ''}${currency}${profitChange.toFixed(0)}</td><td style="color:${profitChange >= 0 ? '#4ade80' : '#f87171'}">${(profitChange / (currentProfit || 1) * 100).toFixed(1)}${T('s14')}${currentMargin.toFixed(1)}%</td><td>${scenarioMargin.toFixed(1)}%</td><td style="color:${marginChange >= 0 ? '#4ade80' : '#f87171'}">${marginChange >= 0 ? '+' : ''}${marginChange.toFixed(1)}%</td><td style="color:${marginChange >= 0 ? '#4ade80' : '#f87171'}">${(marginChange / (currentMargin || 1) * 100).toFixed(1)}%</td></tr>
                        </tbody>
                    </table>
                `;

                // التوصيات
                const recDiv = document.getElementById('recommendations');
                let recHtml = `${T('s15')}`;
                if (currentResults.isBetter) {
                    recHtml += `${T('s16')}${currency}${profitChange.toFixed(0)} (${(profitChange / (currentProfit || 1) * 100).toFixed(1)}%).</p>`;
                    recHtml += `${T('s17')}`;
                } else {
                    recHtml += `${T('s18')}${currency}${Math.abs(profitChange).toFixed(0)} (${(Math.abs(profitChange) / (currentProfit || 1) * 100).toFixed(1)}%).</p>`;
                    let reasons = [];
                    if (revenueChange < 0) reasons.push(T('s19'));
                    if (scenarioSalaries > baseSalaries) reasons.push(T('s20'));
                    if (scenarioMaterials > baseMaterials) reasons.push(T('s21'));
                    if (reasons.length > 0) {
                        recHtml += `${T('s23')}${reasons.join(T('s22'))}</strong>.</p>`;
                    }
                    recHtml += `${T('s24')}`;
                }
                recHtml += `${T('s25')}`;
                recDiv.innerHTML = recHtml;

                // الرسوم البيانية
                const ctx1 = document.getElementById('comparisonChart').getContext('2d');
                const ctx2 = document.getElementById('impactChart').getContext('2d');

                if (comparisonChart) comparisonChart.destroy();
                if (impactChart) impactChart.destroy();

                comparisonChart = new Chart(ctx1, {
                    type: 'bar',
                    data: {
                        labels: [T('s26'), T('s27'), T('s28')],
                        datasets: [{
                            label: T('s29'),
                            data: [baseRevenue, currentTotalCosts, currentProfit],
                            backgroundColor: 'rgba(180,133,84,0.6)',
                            borderColor: '#b48554',
                            borderWidth: 2,
                            borderRadius: 4
                        }, {
                            label: T('s30'),
                            data: [scenarioRevenue, scenarioTotalCosts, scenarioProfit],
                            backgroundColor: currentResults.isBetter ? 'rgba(40,167,69,0.6)' :
                                'rgba(220,53,69,0.6)',
                            borderColor: currentResults.isBetter ? '#28a745' : '#dc3545',
                            borderWidth: 2,
                            borderRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { labels: { color: '#aab7d4' } } },
                        scales: {
                            y: { beginAtZero: true, ticks: { color: '#aab7d4' }, grid: { color: 'rgba(180,133,84,0.2)' } },
                            x: { ticks: { color: '#aab7d4' }, grid: { display: false } }
                        }
                    }
                });

                impactChart = new Chart(ctx2, {
                    type: 'line',
                    data: {
                        labels: [T('s31'), T('s32')],
                        datasets: [{
                            label: T('s33'),
                            data: [currentMargin, scenarioMargin],
                            borderColor: '#4ade80',
                            backgroundColor: 'rgba(74,222,128,0.1)',
                            fill: true,
                            tension: 0.1,
                            pointRadius: 6
                        }, {
                            label: T('s28'),
                            data: [currentProfit, scenarioProfit],
                            borderColor: '#b48554',
                            backgroundColor: 'rgba(180,133,84,0.1)',
                            fill: true,
                            tension: 0.1,
                            pointRadius: 6,
                            yAxisID: 'y1'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { labels: { color: '#aab7d4' } } },
                        scales: {
                            y: {
                                beginAtZero: true,
                                position: 'right',
                                ticks: { color: '#4ade80', callback: function(value) { return value +
                                        '%'; } },
                                grid: { color: 'rgba(74,222,128,0.15)' }
                            },
                            y1: {
                                beginAtZero: true,
                                position: 'left',
                                ticks: { color: '#b48554' },
                                grid: { display: false }
                            },
                            x: { ticks: { color: '#aab7d4' }, grid: { display: false } }
                        }
                    }
                });
            }

            // ========== تصدير Excel ==========
            async function exportToFullExcel() {
                if (!currentResults) { alert(T('s34')); return; }
                showLoading(T('s35'), T('s36'));
                try {
                    const D = currentResults;
                    const currency = D.currency;
                    const company = D.company;

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
                    const cv = workbook.addWorksheet(T('s37'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    [8, 45, 35, 8].forEach((w, i) => cv.getColumn(i + 1).width = w);
                    for (let r = 1; r <= 40; r++) cv.getRow(r).height = 22;
                    cv.getRow(2).height = 80;
                    cv.getRow(4).height = 60;
                    cv.mergeCells(2, 1, 2, 4);
                    const bc = cv.getCell(2, 1);
                    bc.value = T('s38');
                    bc.font = { name: 'Arial', bold: true, size: 28, color: { argb: GL } };
                    bc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DB } };
                    bc.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true,
                    readingOrder: FG.dir() };
                    bc.border = { bottom: { style: 'thick', color: { argb: G } } };
                    mh(cv, 1, 4, 4, `${T('s39')}${company}`, DB, GL, 18);
                    const inf = [
                        [T('s40'), company],
                        [T('s41'), new Date().toLocaleDateString(FG.locale())],
                        [T('s42'), currency],
                        [T('s43'), `${D.scenarioPcts.revenue >= 0 ? '+' : ''}${D.scenarioPcts.revenue}%`],
                        [T('s44'), `${D.scenarioPcts.salaries >= 0 ? '+' : ''}${D.scenarioPcts.salaries}%`],
                        [T('s45'), `${D.scenarioPcts.materials >= 0 ? '+' : ''}${D.scenarioPcts.materials}%`],
                        [T('s46'), `${currency}${D.scenario.profit.toFixed(0)}`]
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
                    const inputsSheet = workbook.addWorksheet(T('s47'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    inputsSheet.getColumn(1).width = 5;
                    inputsSheet.getColumn(2).width = 38;
                    inputsSheet.getColumn(3).width = 22;
                    inputsSheet.getColumn(4).width = 22;
                    inputsSheet.getColumn(5).width = 5;
                    mh(inputsSheet, 1, 5, 1, T('s48'), DB, GL, 14);
                    inputsSheet.getRow(1).height = 40;
                    mh(inputsSheet, 2, 4, 2, T('s49'), SB, W, 11);
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

                    addInputRow(T('s50'), D.base.revenue);
                    addInputRow(T('s51'), D.base.salaries);
                    addInputRow(T('s52'), D.base.materials);
                    addInputRow(T('s53'), D.base.otherCosts);
                    addInputRow(T('s54'), D.scenarioPcts.revenue);
                    addInputRow(T('s55'), D.scenarioPcts.salaries);
                    addInputRow(T('s56'), D.scenarioPcts.materials);

                    // 3. مؤشرات الأداء
                    const kpiSheet = workbook.addWorksheet(T('s57'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    [5, 32, 22, 22, 22, 5].forEach((w, i) => kpiSheet.getColumn(i + 1).width = w);
                    mh(kpiSheet, 1, 6, 1, T('s58'), DB, GL, 15);
                    kpiSheet.getRow(1).height = 45;
                    mh(kpiSheet, 2, 5, 2, `${company} | ${new Date().toLocaleDateString(FG.locale())}`, HB, W, 10);
                    kpiSheet.getRow(2).height = 26;

                    const kpis = [
                        { label: T('s59'), value: `${currency} ${D.base.revenue.toFixed(0)}` },
                        { label: T('s60'), value: `${currency} ${D.scenario.revenue.toFixed(0)}` },
                        { label: T('s61'), value: `${currency} ${D.base.profit.toFixed(0)}` },
                        { label: T('s62'), value: `${currency} ${D.scenario.profit.toFixed(0)}` },
                        { label: T('s63'), value: `${currency} ${D.changes.profit.toFixed(0)}`, good: D
                                .isBetter },
                        { label: T('s64'), value: `${D.scenario.margin.toFixed(1)}%`, good: D
                                .scenario.margin > D.base.margin }
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
                        const bg = k.good !== undefined ? (k.good ? PB : NB) : 'FFFFFFFF';
                        const tc = k.good !== undefined ? (k.good ? PT : NT) : DT;
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
                    kFinal.value = D.isBetter ? T('s65') : T('s66');
                    kFinal.font = { name: 'Arial', bold: true, size: 13, color: { argb: D.isBetter ? PT :
                        NT } };
                    kFinal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: D.isBetter ? PB :
                        NB } };
                    kFinal.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: FG.dir() };
                    kFinal.border = { top: { style: 'medium', color: { argb: G } }, bottom: { style: 'medium',
                            color: { argb: G } }, left: { style: 'medium', color: { argb: G } },
                        right: { style: 'medium', color: { argb: G } } };
                    kpiSheet.getRow(kRow).height = 40;

                    // 4. جدول المقارنة
                    const compSheet = workbook.addWorksheet(T('s67'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    compSheet.getColumn(1).width = 5;
                    compSheet.getColumn(2).width = 30;
                    compSheet.getColumn(3).width = 22;
                    compSheet.getColumn(4).width = 22;
                    compSheet.getColumn(5).width = 22;
                    compSheet.getColumn(6).width = 22;
                    compSheet.getColumn(7).width = 5;
                    mh(compSheet, 1, 7, 1, T('s68'), DB, GL, 14);
                    compSheet.getRow(1).height = 40;
                    compSheet.addRow([T('s69'), T('s70'), T('s71'), T('s72'), T('s73')]);
                    const cmpData = [
                        [T('s26'), D.base.revenue, D.scenario.revenue, D.changes.revenue, (D.changes
                            .revenue / D.base.revenue * 100)],
                        [T('s74'), D.base.salaries, D.scenario.salaries, D.scenario.salaries - D.base
                            .salaries, ((D.scenario.salaries - D.base.salaries) / D.base.salaries *
                            100)
                        ],
                        [T('s75'), D.base.materials, D.scenario.materials, D.scenario.materials - D
                            .base.materials, ((D.scenario.materials - D.base.materials) / D.base
                            .materials * 100)
                        ],
                        [T('s76'), D.base.otherCosts, D.scenario.otherCosts, 0, 0],
                        [T('s77'), D.base.totalCosts, D.scenario.totalCosts, D.changes.costs, (D
                            .changes.costs / D.base.totalCosts * 100)
                        ],
                        [T('s28'), D.base.profit, D.scenario.profit, D.changes.profit, (D.changes
                            .profit / D.base.profit * 100)
                        ],
                        [T('s33'), D.base.margin, D.scenario.margin, D.changes.margin, (D.changes
                            .margin / D.base.margin * 100)
                        ]
                    ];
                    cmpData.forEach((row, idx) => {
                        const rowNum = idx + 2;
                        compSheet.getRow(rowNum).height = 24;
                        row.forEach((val, colIdx) => {
                            const cell = compSheet.getCell(rowNum, colIdx + 2);
                            if (typeof val === 'number') cell.numFmt = '#,##0.00';
                            cell.value = val;
                            Object.assign(cell, cs(idx % 2 === 0 ? AR : 'FFFEFCF6', DT, false, colIdx ===
                                0 ? 'right' : 'center'));
                        });
                    });
                    const compHeader = compSheet.getRow(2);
                    compHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    compHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };

                    // 5. الرسوم البيانية
                    const chartSheet = workbook.addWorksheet(T('s78'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    chartSheet.getColumn(1).width = 5;
                    chartSheet.getColumn(2).width = 50;
                    chartSheet.getColumn(3).width = 5;
                    mh(chartSheet, 1, 3, 1, T('s79'), DB, GL, 14);
                    chartSheet.getRow(1).height = 40;

                    const chartContainer = document.querySelector('.chart-card');
                    if (chartContainer) {
                        try {
                            const origBg = chartContainer.style.backgroundColor;
                            chartContainer.style.backgroundColor = '#ffffff';
                            const canvasImg = await html2canvas(chartContainer, { scale: 2,
                                backgroundColor: '#ffffff' });
                            chartContainer.style.backgroundColor = origBg;
                            const imgData = canvasImg.toDataURL('image/png');
                            const imageId = workbook.addImage({ base64: imgData, extension: 'png' });
                            chartSheet.addImage(imageId, { tl: { col: 1, row: 2 }, br: { col: 2,
                                    row: 18 }, editAs: 'oneCell' });
                        } catch (err) { /* */ }
                    }

                    // 6. التوصيات
                    const recSheet = workbook.addWorksheet(T('s80'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    recSheet.getColumn(1).width = 5;
                    recSheet.getColumn(2).width = 50;
                    recSheet.getColumn(3).width = 5;
                    mh(recSheet, 1, 3, 1, T('s81'), DB, GL, 14);
                    recSheet.getRow(1).height = 40;
                    let recContent = D.isBetter ?
                        `${T('s82')}${currency} ${D.changes.profit.toFixed(0)} (${(D.changes.profit / D.base.profit * 100).toFixed(1)}${T('s83')}` :
                        `${T('s84')}${currency} ${D.changes.profit.toFixed(0)} (${(D.changes.profit / D.base.profit * 100).toFixed(1)}${T('s85')}`;
                    recSheet.getCell(3, 2).value = recContent;
                    recSheet.getCell(3, 2).font = { name: 'Arial', size: 11 };
                    recSheet.getCell(3, 2).alignment = { wrapText: true, readingOrder: FG.dir() };

                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const now = new Date();
                    const fileName =
                        `${T('s86')}${company}_${now.toISOString().slice(0,10)}.xlsx`;
                    saveAs(blob, fileName);
                } catch (err) {
                    console.error(err);
                    alert(T('s87') + err.message);
                } finally {
                    hideLoading();
                }
            }

            // ========== تصدير Word ==========
            async function exportToWord() {
                if (!currentResults) { alert(T('s34')); return; }
                showLoading(T('s88'), T('s89'));
                try {
                    const D = currentResults;
                    const currency = D.currency;
                    const company = D.company;
                    const now = new Date();
                    const dateStr = now.toLocaleDateString(FG.locale());

                    const chartContainer = document.querySelector('.chart-card');
                    let chartImgBase64 = '';
                    if (chartContainer) {
                        const origBg = chartContainer.style.backgroundColor;
                        chartContainer.style.backgroundColor = '#ffffff';
                        const img = await html2canvas(chartContainer, { scale: 2,
                            backgroundColor: '#ffffff' });
                        chartContainer.style.backgroundColor = origBg;
                        chartImgBase64 = img.toDataURL('image/png');
                    }

                    const fullHtml = `${T('s93')}${company}${T('s94')}${dateStr}${T('s95')}${currency}${T('s96')}${D.scenarioPcts.revenue >= 0 ? '+' : ''}${D.scenarioPcts.revenue}${T('s97')}${D.scenarioPcts.salaries >= 0 ? '+' : ''}${D.scenarioPcts.salaries}${T('s98')}${D.scenarioPcts.materials >= 0 ? '+' : ''}${D.scenarioPcts.materials}${T('s99')}${currency}${D.base.revenue.toFixed(0)}</td><td>${currency}${D.scenario.revenue.toFixed(0)}</td><td style="color:${D.changes.revenue >= 0 ? '#28a745' : '#dc3545'}">${D.changes.revenue >= 0 ? '+' : ''}${currency}${D.changes.revenue.toFixed(0)}${T('s100')}${currency}${D.base.totalCosts.toFixed(0)}</td><td>${currency}${D.scenario.totalCosts.toFixed(0)}</td><td style="color:${D.changes.costs <= 0 ? '#28a745' : '#dc3545'}">${D.changes.costs >= 0 ? '+' : ''}${currency}${D.changes.costs.toFixed(0)}${T('s101')}${currency}${D.base.profit.toFixed(0)}</td><td>${currency}${D.scenario.profit.toFixed(0)}</td><td style="color:${D.changes.profit >= 0 ? '#28a745' : '#dc3545'}">${D.changes.profit >= 0 ? '+' : ''}${currency}${D.changes.profit.toFixed(0)}${T('s102')}${D.base.margin.toFixed(1)}%</td><td>${D.scenario.margin.toFixed(1)}%</td><td style="color:${D.changes.margin >= 0 ? '#28a745' : '#dc3545'}">${D.changes.margin >= 0 ? '+' : ''}${D.changes.margin.toFixed(1)}${T('s103')}${D.isBetter ? T('s90') : T('s91')}${T('s104')}${currency}${D.changes.profit.toFixed(0)} (${(D.changes.profit / D.base.profit * 100).toFixed(1)}%)</p>
                        </div>
                        ${chartImgBase64 ? `${T('s92')}${chartImgBase64}" class="chart-img" /></div>` : ''}${T('s105')}${now.getFullYear()}</div>
                    </body></html>`;

                    const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download =
                        `${T('s86')}${company}_${now.toISOString().slice(0,10)}.doc`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                } catch (err) {
                    console.error(err);
                    alert(T('s106'));
                } finally {
                    hideLoading();
                }
            }

            // ===== ربط الأزرار =====
            document.getElementById('simulateBtn').addEventListener('click', runSimulation);
            document.getElementById('exportWordBtn').addEventListener('click', exportToWord);
            document.getElementById('exportFullExcelBtn').addEventListener('click', exportToFullExcel);

            // ===== تشغيل تلقائي =====
            window.addEventListener('load', function() {
                setTimeout(runSimulation, 500);
            });

        })();
    