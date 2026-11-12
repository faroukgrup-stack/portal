
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

            // ===== إدارة التدفقات النقدية =====
            let cashflows = [];
            let chartInstance = null;
            let currentResults = null;

            function renderCashflows() {
                const container = document.getElementById('cashflowContainer');
                const years = parseInt(document.getElementById('projectYears').value) || 5;
                while (cashflows.length < years) cashflows.push(0);
                while (cashflows.length > years) cashflows.pop();
                container.innerHTML = '';
                cashflows.forEach((val, idx) => {
                    const row = document.createElement('div');
                    row.className = 'cashflow-row';
                    const yearNum = idx + 1;
                    row.innerHTML = `${T('s2')}${yearNum}</label>
                            <input type="number" class="cf-input" data-index="${idx}" value="${val}" step="1000">
                        </div>
                    `;
                    container.appendChild(row);
                });
                document.querySelectorAll('.cf-input').forEach(input => {
                    input.addEventListener('input', function() {
                        const idx = parseInt(this.dataset.index);
                        cashflows[idx] = parseFloat(this.value) || 0;
                    });
                });
            }

            function updateCashflowsFromInputs() {
                document.querySelectorAll('.cf-input').forEach(input => {
                    const idx = parseInt(input.dataset.index);
                    cashflows[idx] = parseFloat(input.value) || 0;
                });
            }

            document.getElementById('addYearBtn').addEventListener('click', function() {
                const years = parseInt(document.getElementById('projectYears').value) || 5;
                document.getElementById('projectYears').value = years + 1;
                cashflows.push(0);
                renderCashflows();
            });

            document.getElementById('removeYearBtn').addEventListener('click', function() {
                const years = parseInt(document.getElementById('projectYears').value) || 5;
                if (years > 1) {
                    document.getElementById('projectYears').value = years - 1;
                    cashflows.pop();
                    renderCashflows();
                }
            });

            document.getElementById('fillExampleBtn').addEventListener('click', function() {
                document.getElementById('projectYears').value = 5;
                cashflows = [150000, 180000, 220000, 200000, 180000];
                renderCashflows();
            });

            // ===== الحساب الرئيسي =====
            async function calculateInvestmentMetrics() {
                updateCashflowsFromInputs();

                const currency = document.getElementById('currencySelect').value;
                const company = document.getElementById('companyName').value || T('s3');
                const initialInvestment = parseFloat(document.getElementById('initialInvestment').value) || 0;
                const discountRate = parseFloat(document.getElementById('discountRate').value) / 100 || 0;
                const years = parseInt(document.getElementById('projectYears').value) || 0;

                while (cashflows.length < years) cashflows.push(0);
                while (cashflows.length > years) cashflows.pop();

                if (initialInvestment <= 0 || discountRate < 0 || years <= 0) {
                    alert(T('s4'));
                    return;
                }

                let R;
                try { R = await FG.calc('tool26', 'main', { initialInvestment, discountRate, years, cashflows }); } catch (e) { FG.calcError(e); return; }
                const { npv, irrPercent, payback, dPayback, isAcceptable, status, statusClass } = R;

                currentResults = {
                    currency,
                    company,
                    inputs: { initialInvestment, discountRate: discountRate * 100, years, cashflows: [...cashflows] },
                    outputs: { npv, irr: irrPercent, payback, dPayback, status, statusClass, isAcceptable },
                    rows: R.rows
                };

                document.getElementById('resultsSection').style.display = 'block';
                document.getElementById('initialMessage').style.display = 'none';

                // بطاقات النتائج
                document.getElementById('kpiCards').innerHTML = `
                    <div class="result-card" style="border-color:${npv >= 0 ? '#28a745' : '#dc3545'}${T('s10')}${npv >= 0 ? '#4ade80' : '#f87171'}">${currency}${npv.toFixed(2)}</div>
                        <div class="unit">${npv >= 0 ? T('s8') : T('s9')}${T('s11')}${irrPercent.toFixed(2)}${T('s12')}${(discountRate*100).toFixed(2)}${T('s13')}${payback.toFixed(2)}${T('s14')}${dPayback.toFixed(2)}${T('s15')}${isAcceptable ? '#28a745' : '#dc3545'}${T('s16')}${statusClass}">${status}</span></div>
                    </div>
                `;

                // جدول التدفقات
                let tableHtml = `${T('s17')}`;
                for (let i = 0; i < years; i++) {
                    const { cf, factor, dcf, cum } = R.rows[i];
                    tableHtml += `<tr>
                        <td>${i+1}</td>
                        <td>${currency}${cf.toFixed(0)}</td>
                        <td>${factor.toFixed(4)}</td>
                        <td>${currency}${dcf.toFixed(0)}</td>
                        <td class="${cum >= 0 ? 'positive' : 'negative'}">${currency}${cum.toFixed(0)}</td>
                    </tr>`;
                }
                tableHtml += `</tbody></table>`;
                document.getElementById('cashflowTable').innerHTML = tableHtml;

                // التوصيات
                const recDiv = document.getElementById('recommendations');
                let recHtml = `${T('s18')}`;
                if (isAcceptable) {
                    recHtml += `${T('s19')}`;
                    recHtml += `${T('s20')}${currency}${npv.toFixed(2)}${T('s21')}${irrPercent.toFixed(2)}${T('s22')}${(discountRate*100).toFixed(2)}%).</p>`;
                    if (payback < years) {
                        recHtml += `${T('s23')}${payback.toFixed(2)}${T('s24')}${years}${T('s25')}`;
                    } else {
                        recHtml += `${T('s26')}${payback.toFixed(2)}${T('s27')}${years}${T('s28')}`;
                    }
                } else if (npv > 0 || irrPercent > discountRate * 100) {
                    recHtml += `${T('s29')}`;
                    recHtml += `${T('s30')}`;
                } else {
                    recHtml += `${T('s31')}`;
                    recHtml += `${T('s32')}${currency}${npv.toFixed(2)}${T('s21')}${irrPercent.toFixed(2)}${T('s33')}${(discountRate*100).toFixed(2)}%).</p>`;
                    recHtml += `${T('s34')}`;
                }
                recDiv.innerHTML = recHtml;

                // الرسم البياني
                const ctx = document.getElementById('cashflowChart').getContext('2d');
                if (chartInstance) chartInstance.destroy();

                const labels = [];
                const dataValues = [];
                const cumulativeValues = [];
                let cumVal = -initialInvestment;
                for (let i = 0; i < years; i++) {
                    labels.push(`${T('s35')}${i+1}`);
                    dataValues.push(cashflows[i] || 0);
                    cumVal += (cashflows[i] || 0);
                    cumulativeValues.push(cumVal);
                }

                chartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: T('s36'),
                            data: dataValues,
                            backgroundColor: dataValues.map(v => v >= 0 ? 'rgba(40,167,69,0.7)' :
                                'rgba(220,53,69,0.7)'),
                            borderColor: dataValues.map(v => v >= 0 ? '#28a745' : '#dc3545'),
                            borderWidth: 2,
                            borderRadius: 4,
                            order: 2
                        }, {
                            label: T('s37'),
                            data: cumulativeValues,
                            type: 'line',
                            borderColor: '#b48554',
                            backgroundColor: 'rgba(180,133,84,0.1)',
                            fill: true,
                            tension: 0.1,
                            pointRadius: 5,
                            pointBackgroundColor: '#b48554',
                            order: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { labels: { color: '#aab7d4' } }
                        },
                        scales: {
                            y: { beginAtZero: true, ticks: { color: '#aab7d4' }, grid: { color: 'rgba(180,133,84,0.2)' } },
                            x: { ticks: { color: '#aab7d4' }, grid: { display: false } }
                        }
                    }
                });
            }

            // ========== تصدير Excel ==========
            async function exportToFullExcel() {
                if (!currentResults) { alert(T('s38')); return; }
                showLoading(T('s39'), T('s40'));
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
                    mh(cv, 1, 4, 4, `${T('s43')}${company}`, DB, GL, 18);
                    const inf = [
                        [T('s44'), company],
                        [T('s45'), new Date().toLocaleDateString(FG.locale())],
                        [T('s46'), currency],
                        ['📊 NPV', `${currency}${D.outputs.npv.toFixed(2)}`],
                        ['📈 IRR', `${D.outputs.irr.toFixed(2)}%`],
                        [T('s47'), D.outputs.status]
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
                    const inputsSheet = workbook.addWorksheet(T('s48'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    inputsSheet.getColumn(1).width = 5;
                    inputsSheet.getColumn(2).width = 38;
                    inputsSheet.getColumn(3).width = 22;
                    inputsSheet.getColumn(4).width = 22;
                    inputsSheet.getColumn(5).width = 5;
                    mh(inputsSheet, 1, 5, 1, T('s49'), DB, GL, 14);
                    inputsSheet.getRow(1).height = 40;
                    mh(inputsSheet, 2, 4, 2, T('s50'), SB, W, 11);
                    inputsSheet.getRow(2).height = 28;
                    const inputFields = [
                        [T('s51'), D.inputs.initialInvestment, `${currency} ${D.inputs.initialInvestment.toFixed(0)}`],
                        [T('s52'), D.inputs.discountRate, `${D.inputs.discountRate.toFixed(2)}%`],
                        [T('s53'), D.inputs.years, '']
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
                        ap(lc, cs(bg, DT, true, 'right'));
                        ap(vc, { ...cs(bg, '0000FF', false, 'center'), numFmt: typeof val === 'number' ?
                            '#,##0.00' : null });
                        ap(nc, cs(bg, '00695C', false, 'center'));
                        iRow++;
                    });

                    // 3. التدفقات النقدية
                    const cfSheet = workbook.addWorksheet(T('s54'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    cfSheet.getColumn(1).width = 5;
                    cfSheet.getColumn(2).width = 15;
                    cfSheet.getColumn(3).width = 22;
                    cfSheet.getColumn(4).width = 22;
                    cfSheet.getColumn(5).width = 22;
                    cfSheet.getColumn(6).width = 22;
                    cfSheet.getColumn(7).width = 5;
                    mh(cfSheet, 1, 7, 1, T('s55'), DB, GL, 14);
                    cfSheet.getRow(1).height = 40;
                    cfSheet.addRow([T('s56'), T('s57'), T('s58'), T('s59'), T('s37')]);
                    for (let i = 0; i < D.inputs.years; i++) {
                        const { cf, factor, dcf, cum } = D.rows[i];
                        cfSheet.addRow([i + 1, cf, factor
                            .toFixed(4), dcf, cum
                        ]);
                    }
                    const cfHeader = cfSheet.getRow(2);
                    cfHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    cfHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };

                    // 4. مؤشرات الأداء
                    const kpiSheet = workbook.addWorksheet(T('s60'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    [5, 32, 22, 22, 22, 5].forEach((w, i) => kpiSheet.getColumn(i + 1).width = w);
                    mh(kpiSheet, 1, 6, 1, T('s61'), DB, GL, 15);
                    kpiSheet.getRow(1).height = 45;
                    mh(kpiSheet, 2, 5, 2, `${company} | ${new Date().toLocaleDateString(FG.locale())}`, HB, W, 10);
                    kpiSheet.getRow(2).height = 26;
                    const kpis = [
                        { label: 'NPV', value: `${currency}${D.outputs.npv.toFixed(2)}`, good: D.outputs.npv >
                            0 },
                        { label: 'IRR', value: `${D.outputs.irr.toFixed(2)}%`, good: D.outputs.irr > D
                                .inputs.discountRate },
                        { label: 'Payback', value: `${D.outputs.payback.toFixed(2)}${T('s62')}`, good: D.outputs
                                .payback < D.inputs.years },
                        { label: T('s63'), value: D.outputs.status, good: D.outputs.isAcceptable }
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
                    kFinal.value = D.outputs.isAcceptable ? T('s64') :
                        T('s65');
                    kFinal.font = { name: 'Arial', bold: true, size: 13, color: { argb: D.outputs
                            .isAcceptable ? PT : '856404' } };
                    kFinal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: D.outputs
                            .isAcceptable ? PB : GB } };
                    kFinal.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: FG.dir() };
                    kFinal.border = { top: { style: 'medium', color: { argb: G } }, bottom: { style: 'medium',
                            color: { argb: G } }, left: { style: 'medium', color: { argb: G } },
                        right: { style: 'medium', color: { argb: G } } };
                    kpiSheet.getRow(kRow).height = 40;

                    // 5. الرسوم البيانية
                    const chartsSheet = workbook.addWorksheet(T('s66'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    chartsSheet.getColumn(1).width = 5;
                    chartsSheet.getColumn(2).width = 50;
                    chartsSheet.getColumn(3).width = 5;
                    mh(chartsSheet, 1, 3, 1, T('s67'), DB, GL, 14);
                    chartsSheet.getRow(1).height = 40;

                    const chartContainer = document.querySelector('.chart-container');
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
                                    row: 18 }, editAs: 'oneCell' });
                        } catch (err) { /* */ }
                    }

                    // 6. التوصيات
                    const recSheet = workbook.addWorksheet(T('s68'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    recSheet.getColumn(1).width = 5;
                    recSheet.getColumn(2).width = 50;
                    recSheet.getColumn(3).width = 5;
                    mh(recSheet, 1, 3, 1, T('s69'), DB, GL, 14);
                    recSheet.getRow(1).height = 40;
                    let recContent = '';
                    if (D.outputs.isAcceptable) {
                        recContent =
                            `${T('s70')}${currency}${D.outputs.npv.toFixed(2)}${T('s21')}${D.outputs.irr.toFixed(2)}${T('s22')}${D.inputs.discountRate.toFixed(2)}${T('s71')}${D.outputs.payback.toFixed(2)}${T('s62')}`;
                    } else {
                        recContent =
                            `${T('s72')}${currency}${D.outputs.npv.toFixed(2)}${T('s21')}${D.outputs.irr.toFixed(2)}${T('s33')}${D.inputs.discountRate.toFixed(2)}${T('s73')}`;
                    }
                    recSheet.getCell(3, 2).value = recContent;
                    recSheet.getCell(3, 2).font = { name: 'Arial', size: 11 };
                    recSheet.getCell(3, 2).alignment = { wrapText: true, readingOrder: FG.dir() };

                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const now = new Date();
                    const fileName =
                        `${T('s74')}${company}_${now.toISOString().slice(0,10)}.xlsx`;
                    saveAs(blob, fileName);
                } catch (err) {
                    console.error(err);
                    alert(T('s75') + err.message);
                } finally {
                    hideLoading();
                }
            }

            // ========== تصدير Word ==========
            async function exportToWord() {
                if (!currentResults) { alert(T('s38')); return; }
                showLoading(T('s76'), T('s77'));
                try {
                    const D = currentResults;
                    const currency = D.currency;
                    const company = D.company;
                    const now = new Date();
                    const dateStr = now.toLocaleDateString(FG.locale());

                    const chartContainer = document.querySelector('.chart-container');
                    let chartImgBase64 = '';
                    if (chartContainer) {
                        const origBg = chartContainer.style.backgroundColor;
                        chartContainer.style.backgroundColor = '#ffffff';
                        const img = await html2canvas(chartContainer, { scale: 2,
                            backgroundColor: '#ffffff' });
                        chartContainer.style.backgroundColor = origBg;
                        chartImgBase64 = img.toDataURL('image/png');
                    }

                    let cfRows = '';
                    for (let i = 0; i < D.inputs.years; i++) {
                        cfRows +=
                            `<tr><td>${i+1}</td><td>${currency}${(D.inputs.cashflows[i]||0).toFixed(0)}</td></tr>`;
                    }

                    const fullHtml = `${T('s81')}${company}${T('s82')}${dateStr}${T('s83')}${currency}${T('s84')}${currency}${D.inputs.initialInvestment.toFixed(0)}${T('s85')}${D.inputs.discountRate.toFixed(2)}${T('s86')}${D.inputs.years}${T('s87')}${cfRows}${T('s88')}${currency}${D.outputs.npv.toFixed(2)}${T('s89')}${D.outputs.irr.toFixed(2)}${T('s90')}${D.outputs.payback.toFixed(2)}${T('s91')}${D.outputs.dPayback.toFixed(2)}${T('s92')}${D.outputs.isAcceptable ? '#28a745' : '#dc3545'};">${D.outputs.status}${T('s93')}${D.outputs.isAcceptable ? T('s78') : T('s79')}</p></div>
                        ${chartImgBase64 ? `${T('s80')}${chartImgBase64}" class="chart-img" /></div>` : ''}${T('s94')}${now.getFullYear()}</div>
                    </body></html>`;

                    const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download =
                        `${T('s74')}${company}_${now.toISOString().slice(0,10)}.doc`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                } catch (err) {
                    console.error(err);
                    alert(T('s95'));
                } finally {
                    hideLoading();
                }
            }

            // ===== ربط الأزرار =====
            document.getElementById('calculateBtn').addEventListener('click', calculateInvestmentMetrics);
            document.getElementById('exportWordBtn').addEventListener('click', exportToWord);
            document.getElementById('exportFullExcelBtn').addEventListener('click', exportToFullExcel);

            // تشغيل تلقائي مع مثال
            window.addEventListener('load', function() {
                document.getElementById('fillExampleBtn').click();
                setTimeout(calculateInvestmentMetrics, 300);
            });

        })();
    