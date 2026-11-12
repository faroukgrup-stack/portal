
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
            let currentResults = null;
            let currentInputs = null;
            let chart1 = null,
                chart2 = null;

            // ===== الحساب الرئيسي =====
            async function calculateCCC() {
                const currency = document.getElementById('currencySelect').value;
                const company = document.getElementById('companyName').value || T('s2');
                const periodMonths = parseInt(document.getElementById('periodMonths').value) || 12;

                const invStart = parseFloat(document.getElementById('invStart').value) || 0;
                const invEnd = parseFloat(document.getElementById('invEnd').value) || 0;
                const arStart = parseFloat(document.getElementById('arStart').value) || 0;
                const arEnd = parseFloat(document.getElementById('arEnd').value) || 0;
                const apStart = parseFloat(document.getElementById('apStart').value) || 0;
                const apEnd = parseFloat(document.getElementById('apEnd').value) || 0;
                const cogs = parseFloat(document.getElementById('cogs').value) || 0;
                const creditSales = parseFloat(document.getElementById('creditSales').value) || 0;

                if (cogs <= 0 || creditSales <= 0) {
                    alert(T('s3'));
                    return;
                }

                let R;
                try { R = await FG.calc('tool25', 'main', { periodMonths, invStart, invEnd, arStart, arEnd, apStart, apEnd, cogs, creditSales }); } catch (e) { FG.calcError(e); return; }
                const { avgInventory, avgReceivables, avgPayables, daysFactor, dio, dso, dpo, ccc, status, statusClass, recommendation } = R;

                // تفاصيل الحساب
                document.getElementById('calculationDetails').innerHTML = `${T('s14')}${invStart.toLocaleString()} + ${invEnd.toLocaleString()}) / 2 = ${avgInventory.toFixed(0)}${T('s15')}${arStart.toLocaleString()} + ${arEnd.toLocaleString()}) / 2 = ${avgReceivables.toFixed(0)}${T('s16')}${apStart.toLocaleString()} + ${apEnd.toLocaleString()}) / 2 = ${avgPayables.toFixed(0)}</p>
                    <p style="direction:ltr; text-align:left; font-family:monospace;">
                        DIO = (${avgInventory.toFixed(0)} ÷ ${cogs.toLocaleString()}) × ${daysFactor.toFixed(0)} = ${dio.toFixed(1)}${T('s17')}${avgReceivables.toFixed(0)} ÷ ${creditSales.toLocaleString()}) × ${daysFactor.toFixed(0)} = ${dso.toFixed(1)}${T('s18')}${avgPayables.toFixed(0)} ÷ ${cogs.toLocaleString()}) × ${daysFactor.toFixed(0)} = ${dpo.toFixed(1)}${T('s19')}${dio.toFixed(1)} + ${dso.toFixed(1)} - ${dpo.toFixed(1)} = ${ccc.toFixed(1)}${T('s20')}${periodMonths}${T('s21')}${daysFactor.toFixed(0)}${T('s22')}`;

                // التوصيات
                let recHtml = `${T('s23')}`;
                recHtml +=
                    `${T('s24')}${statusClass}" style="font-size:1rem; padding:0.3rem 1.2rem;">${status}</span></p>`;
                recHtml += `<p>${recommendation}</p>`;
                recHtml += R.extra;
                document.getElementById('recommendations').innerHTML = recHtml;

                // عرض النتائج
                document.getElementById('resultsSection').style.display = 'block';
                document.getElementById('initialMessage').style.display = 'none';

                document.getElementById('kpiCards').innerHTML = `${T('s28')}${dio.toFixed(1)}${T('s29')}${dso.toFixed(1)}${T('s30')}${dpo.toFixed(1)}${T('s31')}${R.cccLevel === 'good' ? '#28a745' : R.cccLevel === 'mid' ? '#ffc107' : '#dc3545'}${T('s32')}${R.cccLevel === 'good' ? '#4ade80' : R.cccLevel === 'mid' ? '#fbbf24' : '#f87171'}">${ccc.toFixed(1)}${T('s33')}${statusClass}">${status}</span></div></div>
                `;

                // الرسوم البيانية
                const ctx1 = document.getElementById('cccChart').getContext('2d');
                const ctx2 = document.getElementById('componentsChart').getContext('2d');
                if (chart1) chart1.destroy();
                if (chart2) chart2.destroy();

                chart1 = new Chart(ctx1, {
                    type: 'bar',
                    data: {
                        labels: ['DIO', 'DSO', 'DPO', 'CCC'],
                        datasets: [{
                            label: T('s34'),
                            data: [dio, dso, dpo, ccc],
                            backgroundColor: ['rgba(40,167,69,0.7)', 'rgba(23,162,184,0.7)',
                                'rgba(255,193,7,0.7)', 'rgba(180,133,84,0.8)'
                            ],
                            borderColor: ['#28a745', '#17a2b8', '#ffc107', '#b48554'],
                            borderWidth: 2,
                            borderRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: { beginAtZero: true, ticks: { color: '#aab7d4' }, grid: { color: 'rgba(180,133,84,0.2)' } },
                            x: { ticks: { color: '#aab7d4' }, grid: { display: false } }
                        }
                    }
                });

                chart2 = new Chart(ctx2, {
                    type: 'doughnut',
                    data: {
                        labels: [T('s35'), T('s36'), T('s37')],
                        datasets: [{ data: [dio, dso, dpo], backgroundColor: ['#28a745', '#17a2b8',
                                '#ffc107'
                            ], borderColor: '#0b0e17', borderWidth: 2 }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { labels: { color: '#aab7d4' } } }
                    }
                });

                // تخزين النتائج للتصدير
                currentResults = {
                    currency,
                    company,
                    periodMonths,
                    daysFactor,
                    inputs: { invStart, invEnd, arStart, arEnd, apStart, apEnd, cogs, creditSales, avgInventory,
                        avgReceivables, avgPayables },
                    outputs: { dio, dso, dpo, ccc, status, statusClass, recommendation, cccLevel: R.cccLevel, flags: R.flags }
                };
                currentInputs = { invStart, invEnd, arStart, arEnd, apStart, apEnd, cogs, creditSales,
                periodMonths };
            }

            // ========== تصدير Excel ==========
            async function exportToFullExcel() {
                if (!currentResults) {
                    alert(T('s38'));
                    return;
                }
                showLoading(T('s39'), T('s40'));
                try {
                    const D = currentResults;
                    const currency = D.currency;
                    const companyName = D.company;

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
                    const cv = workbook.addWorksheet(T('s41'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    [8, 45, 35, 8].forEach((w, i) => cv.getColumn(i + 1).width = w);
                    for (let r = 1; r <= 40; r++) cv.getRow(r).height = 22;
                    cv.getRow(2).height = 80;
                    cv.getRow(4).height = 60;
                    cv.mergeCells(2, 1, 2, 4);
                    const bc = cv.getCell(2, 1);
                    bc.value = T('s42');
                    bc.font = { name: 'Arial', bold: true, size: 28, color: { argb: GL } };
                    bc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DB } };
                    bc.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true,
                    readingOrder: FG.dir() };
                    bc.border = { bottom: { style: 'thick', color: { argb: G } } };
                    mh(cv, 1, 4, 4, `${T('s43')}${companyName}`, DB, GL, 18);
                    const inf = [
                        [T('s44'), companyName],
                        [T('s45'), new Date().toLocaleDateString(FG.locale())],
                        [T('s46'), currency],
                        ['📊 CCC', `${D.outputs.ccc.toFixed(1)}${T('s47')}`],
                        [T('s48'), D.outputs.status]
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
                    const inputsSheet = workbook.addWorksheet(T('s49'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    inputsSheet.getColumn(1).width = 5;
                    inputsSheet.getColumn(2).width = 38;
                    inputsSheet.getColumn(3).width = 22;
                    inputsSheet.getColumn(4).width = 22;
                    inputsSheet.getColumn(5).width = 5;
                    mh(inputsSheet, 1, 5, 1, T('s50'), DB, GL, 14);
                    inputsSheet.getRow(1).height = 40;
                    mh(inputsSheet, 2, 4, 2, T('s51'), SB, W, 11);
                    inputsSheet.getRow(2).height = 28;
                    const inputsData = [
                        [T('s52'), D.inputs.invStart, `${currency} ${D.inputs.invStart.toFixed(0)}`],
                        [T('s53'), D.inputs.invEnd, `${currency} ${D.inputs.invEnd.toFixed(0)}`],
                        [T('s54'), D.inputs.avgInventory, `${currency} ${D.inputs.avgInventory.toFixed(0)}`],
                        [T('s55'), D.inputs.arStart, `${currency} ${D.inputs.arStart.toFixed(0)}`],
                        [T('s56'), D.inputs.arEnd, `${currency} ${D.inputs.arEnd.toFixed(0)}`],
                        [T('s57'), D.inputs.avgReceivables,
                            `${currency} ${D.inputs.avgReceivables.toFixed(0)}`
                        ],
                        [T('s58'), D.inputs.apStart, `${currency} ${D.inputs.apStart.toFixed(0)}`],
                        [T('s59'), D.inputs.apEnd, `${currency} ${D.inputs.apEnd.toFixed(0)}`],
                        [T('s60'), D.inputs.avgPayables,
                            `${currency} ${D.inputs.avgPayables.toFixed(0)}`
                        ],
                        [T('s61'), D.inputs.cogs, `${currency} ${D.inputs.cogs.toFixed(0)}`],
                        [T('s62'), D.inputs.creditSales,
                            `${currency} ${D.inputs.creditSales.toFixed(0)}`
                        ],
                        [T('s63'), `${D.periodMonths}${T('s64')}`, `${D.daysFactor.toFixed(0)}${T('s47')}`]
                    ];
                    let iRow = 3;
                    inputsData.forEach(([label, val, note], idx) => {
                        inputsSheet.getRow(iRow).height = 24;
                        const bg = idx % 2 === 0 ? 'FFFEFCF6' : 'FFFFFFFF';
                        const lc = inputsSheet.getCell(iRow, 2),
                            vc = inputsSheet.getCell(iRow, 3),
                            nc = inputsSheet.getCell(iRow, 4);
                        lc.value = label;
                        vc.value = val;
                        nc.value = note;
                        ap(lc, cs(bg, DT, true, 'right'));
                        ap(vc, { ...cs(bg, '0000FF', false, 'center'), numFmt: typeof val === 'number' ?
                            '#,##0' : null });
                        ap(nc, cs(bg, '00695C', false, 'center'));
                        iRow++;
                    });

                    // 3. مؤشرات الأداء
                    const kpiSheet = workbook.addWorksheet(T('s65'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    [5, 32, 22, 22, 22, 5].forEach((w, i) => kpiSheet.getColumn(i + 1).width = w);
                    mh(kpiSheet, 1, 6, 1, T('s66'), DB, GL, 15);
                    kpiSheet.getRow(1).height = 45;
                    mh(kpiSheet, 2, 5, 2, `${companyName} | ${new Date().toLocaleDateString(FG.locale())}`, HB, W, 10);
                    kpiSheet.getRow(2).height = 26;
                    const kpis = [
                        { label: T('s67'), value: `${D.outputs.dio.toFixed(1)}${T('s47')}` },
                        { label: T('s68'), value: `${D.outputs.dso.toFixed(1)}${T('s47')}` },
                        { label: T('s69'), value: `${D.outputs.dpo.toFixed(1)}${T('s47')}` },
                        { label: T('s70'), value: `${D.outputs.ccc.toFixed(1)}${T('s47')}`, highlight: true }
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
                        const isGood = idx === 3 ? D.outputs.cccLevel === 'good' : true;
                        const bg = isGood ? PB : (D.outputs.ccc > 60 && idx === 3 ? NB : GB);
                        const tc = isGood ? PT : (D.outputs.ccc > 60 && idx === 3 ? NT : 'FF856404');
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
                    kFinal.value = D.outputs.cccLevel === 'good' ? T('s71') : D.outputs.cccLevel === 'mid' ?
                        T('s72') : T('s73');
                    kFinal.font = { name: 'Arial', bold: true, size: 13, color: { argb: D.outputs.cccLevel === 'good' ?
                            PT : D.outputs.cccLevel === 'mid' ? '856404' : NT } };
                    kFinal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: D.outputs.cccLevel === 'good' ?
                            PB : D.outputs.cccLevel === 'mid' ? GB : NB } };
                    kFinal.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: FG.dir() };
                    kFinal.border = { top: { style: 'medium', color: { argb: G } }, bottom: { style: 'medium',
                            color: { argb: G } }, left: { style: 'medium', color: { argb: G } },
                        right: { style: 'medium', color: { argb: G } } };
                    kpiSheet.getRow(kRow).height = 40;

                    // 4. تفصيل الحساب
                    const detailSheet = workbook.addWorksheet(T('s74'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    detailSheet.getColumn(1).width = 5;
                    detailSheet.getColumn(2).width = 40;
                    detailSheet.getColumn(3).width = 25;
                    detailSheet.getColumn(4).width = 25;
                    detailSheet.getColumn(5).width = 5;
                    mh(detailSheet, 1, 5, 1, T('s75'), DB, GL, 14);
                    detailSheet.getRow(1).height = 40;
                    detailSheet.addRow([T('s76'), T('s77'), T('s78')]);
                    const detailRows = [
                        [T('s79'), `${currency} ${D.inputs.avgInventory.toFixed(0)}`,
                            `(${D.inputs.invStart} + ${D.inputs.invEnd}) / 2`
                        ],
                        [T('s80'), `${D.outputs.dio.toFixed(1)}${T('s81')}`,
                            `${T('s82')}${D.daysFactor.toFixed(0)}`
                        ],
                        [T('s83'), `${currency} ${D.inputs.avgReceivables.toFixed(0)}`,
                            `(${D.inputs.arStart} + ${D.inputs.arEnd}) / 2`
                        ],
                        [T('s84'), `${D.outputs.dso.toFixed(1)}${T('s81')}`,
                            `${T('s85')}${D.daysFactor.toFixed(0)}`
                        ],
                        [T('s86'), `${currency} ${D.inputs.avgPayables.toFixed(0)}`,
                            `(${D.inputs.apStart} + ${D.inputs.apEnd}) / 2`
                        ],
                        [T('s87'), `${D.outputs.dpo.toFixed(1)}${T('s81')}`,
                            `${T('s88')}${D.daysFactor.toFixed(0)}`
                        ],
                        [T('s89'), `${D.outputs.ccc.toFixed(1)}${T('s81')}`, `DIO + DSO - DPO`]
                    ];
                    detailRows.forEach(r => detailSheet.addRow(r));
                    const detHeader = detailSheet.getRow(2);
                    detHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    detHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
                    detailSheet.getColumn(2).width = 25;
                    detailSheet.getColumn(3).width = 25;

                    // 5. الرسوم البيانية
                    const chartsSheet = workbook.addWorksheet(T('s90'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    chartsSheet.getColumn(1).width = 5;
                    chartsSheet.getColumn(2).width = 50;
                    chartsSheet.getColumn(3).width = 5;
                    mh(chartsSheet, 1, 3, 1, T('s91'), DB, GL, 14);
                    chartsSheet.getRow(1).height = 40;

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
                            chartsSheet.addImage(imageId, { tl: { col: 1, row: 2 }, br: { col: 2,
                                    row: 14 }, editAs: 'oneCell' });
                        } catch (err) { /* */ }
                    }

                    // 6. التفسير والتوصيات
                    const intSheet = workbook.addWorksheet(T('s92'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    intSheet.getColumn(1).width = 5;
                    intSheet.getColumn(2).width = 50;
                    intSheet.getColumn(3).width = 5;
                    mh(intSheet, 1, 3, 1, T('s93'), DB, GL, 14);
                    intSheet.getRow(1).height = 45;
                    const sections = [
                        { title: T('s94'),
                        content: `${T('s95')}${companyName}${T('s96')}${D.periodMonths}${T('s97')}${D.outputs.dio.toFixed(1)}${T('s98')}${D.outputs.dso.toFixed(1)}${T('s99')}${D.outputs.dpo.toFixed(1)}${T('s100')}${D.outputs.ccc.toFixed(1)}${T('s47')}` },
                        { title: T('s101'),
                        content: `${T('s102')}${D.outputs.status}\n${D.outputs.recommendation}` },
                        { title: T('s103'),
                        content: D.outputs.flags.dioHigh ? T('s104') : T('s105') + (D.outputs.flags.dsoHigh ? T('s106') : T('s107')) + (D.outputs.flags.dpoLow ? T('s108') : T('s109')) },
                        { title: T('s110'),
                        content: T('s111') }
                    ];
                    let itRow = 2;
                    sections.forEach((sec, idx) => {
                        itRow++;
                        intSheet.getRow(itRow).height = 30;
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
                        `${T('s112')}${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
                    saveAs(blob, fileName);
                } catch (err) {
                    console.error(err);
                    alert(T('s113') + err.message);
                } finally {
                    hideLoading();
                }
            }

            // ========== تصدير Word ==========
            async function exportToWord() {
                if (!currentResults) {
                    alert(T('s38'));
                    return;
                }
                showLoading(T('s114'), T('s115'));
                try {
                    const D = currentResults;
                    const currency = D.currency;
                    const companyName = D.company;
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

                    const fullHtml = `${T('s116')}${companyName}${T('s117')}${dateStr}${T('s118')}${currency}${T('s119')}${D.periodMonths}${T('s120')}${currency} ${D.inputs.invStart.toFixed(0)}${T('s121')}${currency} ${D.inputs.invEnd.toFixed(0)}${T('s122')}${currency} ${D.inputs.avgInventory.toFixed(0)}${T('s123')}${currency} ${D.inputs.arStart.toFixed(0)}${T('s124')}${currency} ${D.inputs.arEnd.toFixed(0)}${T('s125')}${currency} ${D.inputs.avgReceivables.toFixed(0)}${T('s126')}${currency} ${D.inputs.apStart.toFixed(0)}${T('s127')}${currency} ${D.inputs.apEnd.toFixed(0)}${T('s128')}${currency} ${D.inputs.avgPayables.toFixed(0)}</strong></td><th>COGS</th><td>${currency} ${D.inputs.cogs.toFixed(0)}${T('s129')}${currency} ${D.inputs.creditSales.toFixed(0)}${T('s130')}${D.periodMonths}${T('s131')}${D.outputs.dio.toFixed(1)}${T('s132')}${D.outputs.dso.toFixed(1)}${T('s133')}${D.outputs.dpo.toFixed(1)}${T('s134')}${D.outputs.ccc.toFixed(1)}</td></tr>
                            </tbody>
                        </table>
                        <div style="margin:20px 0;padding:20px;background:${D.outputs.cccLevel === 'good' ? '#d4edda' : D.outputs.cccLevel === 'mid' ? '#fff3cd' : '#f8d7da'};border-radius:10px;text-align:center;">
                            <span style="font-size:1.5rem;font-weight:bold;color:${D.outputs.cccLevel === 'good' ? '#155724' : D.outputs.cccLevel === 'mid' ? '#856404' : '#721c24'}${T('s135')}${D.outputs.status}</span>
                            <p style="margin-top:10px;">${D.outputs.recommendation}${T('s136')}${chartImgBase64}${T('s137')}${now.getFullYear()}</div>
                    </body></html>`;

                    const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download =
                        `${T('s112')}${companyName}_${now.toISOString().slice(0,10)}.doc`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                } catch (err) {
                    console.error(err);
                    alert(T('s138'));
                } finally {
                    hideLoading();
                }
            }

            // ===== ربط الأزرار =====
            document.getElementById('calculateBtn').addEventListener('click', calculateCCC);
            document.getElementById('exportWordBtn').addEventListener('click', exportToWord);
            document.getElementById('exportFullExcelBtn').addEventListener('click', exportToFullExcel);

            // تشغيل تلقائي
            window.addEventListener('load', function() {
                setTimeout(calculateCCC, 500);
            });

        })();
    