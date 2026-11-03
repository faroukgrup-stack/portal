
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

            // ===== Global variables =====
            let currentResults = null;
            let currentInputs = null;
            let chart1 = null, chart2 = null;

            // ===== Main calculation =====
            function calculateCCC() {
                const currency = document.getElementById('currencySelect').value;
                const company = document.getElementById('companyName').value || 'Entity';
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
                    alert('Please enter valid values: COGS > 0 and Net Credit Sales > 0.');
                    return;
                }

                const avgInventory = (invStart + invEnd) / 2;
                const avgReceivables = (arStart + arEnd) / 2;
                const avgPayables = (apStart + apEnd) / 2;
                const daysFactor = (periodMonths / 12) * 365;

                const dio = cogs > 0 ? (avgInventory / cogs) * daysFactor : 0;
                const dso = creditSales > 0 ? (avgReceivables / creditSales) * daysFactor : 0;
                const dpo = cogs > 0 ? (avgPayables / cogs) * daysFactor : 0;
                const ccc = dio + dso - dpo;

                let status = '', statusClass = '', recommendation = '';
                if (ccc <= 0) {
                    status = 'Excellent (Negative Gap)';
                    statusClass = 'status-good';
                    recommendation = '✅ A negative cash gap means you receive cash from customers before paying suppliers – an ideal financing model. Continue improving payment terms with suppliers and increasing collection speed.';
                } else if (ccc <= 30) {
                    status = 'Good (Short Gap)';
                    statusClass = 'status-good';
                    recommendation = '🟢 Cash gap less than 30 days – good cash management. You can improve further by reducing inventory days or accelerating collections.';
                } else if (ccc <= 60) {
                    status = 'Moderate (Moderate Gap)';
                    statusClass = 'status-warning';
                    recommendation = '🟡 Cash gap between 30 and 60 days – needs careful monitoring. Review credit and inventory policies to reduce the gap.';
                } else if (ccc <= 90) {
                    status = 'High (Long Gap)';
                    statusClass = 'status-bad';
                    recommendation = '🔴 Cash gap between 60 and 90 days – liquidity risk. Focus on reducing inventory, accelerating collections, or negotiating with suppliers to extend payment terms.';
                } else {
                    status = 'Critical (Very Long Gap)';
                    statusClass = 'status-bad';
                    recommendation = '⛔ Cash gap exceeding 90 days – major liquidity risk. You need a radical restructuring of working capital management.';
                }

                // Calculation details
                document.getElementById('calculationDetails').innerHTML = `
                    <h4 style="color:#cfa776;">📐 Formulas Used</h4>
                    <p><strong>Average Inventory</strong> = (${invStart.toLocaleString()} + ${invEnd.toLocaleString()}) / 2 = ${avgInventory.toFixed(0)}</p>
                    <p><strong>Average Receivables</strong> = (${arStart.toLocaleString()} + ${arEnd.toLocaleString()}) / 2 = ${avgReceivables.toFixed(0)}</p>
                    <p><strong>Average Payables</strong> = (${apStart.toLocaleString()} + ${apEnd.toLocaleString()}) / 2 = ${avgPayables.toFixed(0)}</p>
                    <p style="direction:ltr; text-align:left; font-family:monospace;">
                        DIO = (${avgInventory.toFixed(0)} ÷ ${cogs.toLocaleString()}) × ${daysFactor.toFixed(0)} = ${dio.toFixed(1)} days
                    </p>
                    <p style="direction:ltr; text-align:left; font-family:monospace;">
                        DSO = (${avgReceivables.toFixed(0)} ÷ ${creditSales.toLocaleString()}) × ${daysFactor.toFixed(0)} = ${dso.toFixed(1)} days
                    </p>
                    <p style="direction:ltr; text-align:left; font-family:monospace;">
                        DPO = (${avgPayables.toFixed(0)} ÷ ${cogs.toLocaleString()}) × ${daysFactor.toFixed(0)} = ${dpo.toFixed(1)} days
                    </p>
                    <p style="direction:ltr; text-align:left; font-family:monospace; font-size:1.2rem; font-weight:bold; color:#cfa776;">
                        CCC = ${dio.toFixed(1)} + ${dso.toFixed(1)} - ${dpo.toFixed(1)} = ${ccc.toFixed(1)} days
                    </p>
                    <p style="color:#aab7d4; font-size:0.85rem;">* Days calculated based on period length (${periodMonths} months = ${daysFactor.toFixed(0)} days).</p>
                `;

                // Recommendations
                let recHtml = `<h4 style="color:#cfa776;">📌 Assessment & Recommendations</h4>`;
                recHtml += `<p><strong>Rating:</strong> <span class="status ${statusClass}" style="font-size:1rem; padding:0.3rem 1.2rem;">${status}</span></p>`;
                recHtml += `<p>${recommendation}</p>`;
                if (dio > 45) recHtml += `<p>🔹 <strong>High DIO (Inventory Days):</strong> Recommend improving inventory management, reducing excess quantities, or improving turnover rate.</p>`;
                if (dso > 45) recHtml += `<p>🔹 <strong>High DSO (Sales Days):</strong> Review credit policies, improve collection processes, or offer discounts for early payment.</p>`;
                if (dpo < 30) recHtml += `<p>🔹 <strong>Low DPO (Payables Days):</strong> Try to negotiate with suppliers to extend payment terms to align with the collection cycle.</p>`;
                document.getElementById('recommendations').innerHTML = recHtml;

                // Display results
                document.getElementById('resultsSection').style.display = 'block';
                document.getElementById('initialMessage').style.display = 'none';

                document.getElementById('kpiCards').innerHTML = `
                    <div class="result-card"><i class="fas fa-boxes"></i><h4>DIO</h4><div class="value">${dio.toFixed(1)}</div><div class="unit">days</div></div>
                    <div class="result-card"><i class="fas fa-users"></i><h4>DSO</h4><div class="value">${dso.toFixed(1)}</div><div class="unit">days</div></div>
                    <div class="result-card"><i class="fas fa-hand-holding-usd"></i><h4>DPO</h4><div class="value">${dpo.toFixed(1)}</div><div class="unit">days</div></div>
                    <div class="result-card" style="border-color:${ccc <= 30 ? '#28a745' : ccc <= 60 ? '#ffc107' : '#dc3545'};"><i class="fas fa-money-bill-wave"></i><h4>CCC</h4><div class="value" style="color:${ccc <= 30 ? '#4ade80' : ccc <= 60 ? '#fbbf24' : '#f87171'}">${ccc.toFixed(1)}</div><div class="unit">days</div><div><span class="status ${statusClass}">${status}</span></div></div>
                `;

                // Charts
                const ctx1 = document.getElementById('cccChart').getContext('2d');
                const ctx2 = document.getElementById('componentsChart').getContext('2d');
                if (chart1) chart1.destroy();
                if (chart2) chart2.destroy();

                chart1 = new Chart(ctx1, {
                    type: 'bar',
                    data: {
                        labels: ['DIO', 'DSO', 'DPO', 'CCC'],
                        datasets: [{
                            label: 'Days',
                            data: [dio, dso, dpo, ccc],
                            backgroundColor: ['rgba(40,167,69,0.7)', 'rgba(23,162,184,0.7)', 'rgba(255,193,7,0.7)', 'rgba(180,133,84,0.8)'],
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
                        labels: ['DIO (Inventory Days)', 'DSO (Sales Days)', 'DPO (Payables Days)'],
                        datasets: [{ data: [dio, dso, dpo], backgroundColor: ['#28a745', '#17a2b8', '#ffc107'], borderColor: '#0b0e17', borderWidth: 2 }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { labels: { color: '#aab7d4' } } }
                    }
                });

                // Store results for export
                currentResults = {
                    currency, company, periodMonths, daysFactor,
                    inputs: { invStart, invEnd, arStart, arEnd, apStart, apEnd, cogs, creditSales, avgInventory, avgReceivables, avgPayables },
                    outputs: { dio, dso, dpo, ccc, status, statusClass, recommendation }
                };
                currentInputs = { invStart, invEnd, arStart, arEnd, apStart, apEnd, cogs, creditSales, periodMonths };
            }

            // ========== Export to Full Excel ==========
            async function exportToFullExcel() {
                if (!currentResults) {
                    alert('Please run the analysis first.');
                    return;
                }
                showLoading('Creating Professional Excel Report...', 'Creating sheets and charts');
                try {
                    const D = currentResults;
                    const currency = D.currency;
                    const companyName = D.company;

                    const workbook = new ExcelJS.Workbook();
                    workbook.creator = 'FAROUK GRUP';
                    workbook.created = new Date();

                    const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050';
                    const AR = 'FFF5F0E8', W = 'FFFFFFFF', DT = 'FF1A1A1A', PB = 'FFD4EDDA', NB = 'FFF8D7DA';
                    const PT = 'FF155724', NT = 'FF721C24', GB = 'FFFFF3CD';

                    function hs(bg = HB, tc = GL) { return { font: { name: 'Arial', bold: true, size: 11, color: { argb: tc } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }, alignment: { horizontal: 'center', vertical: 'middle', wrapText: true, readingOrder: 'ltr' }, border: { top: { style: 'thin', color: { argb: G } }, bottom: { style: 'thin', color: { argb: G } }, left: { style: 'thin', color: { argb: G } }, right: { style: 'thin', color: { argb: G } } } }; }

                    function cs(bg = W, tc = DT, b = false, h = 'center') { return { font: { name: 'Arial', bold: b, size: 10, color: { argb: tc } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }, alignment: { horizontal: h, vertical: 'middle', wrapText: true, readingOrder: 'ltr' }, border: { top: { style: 'hair', color: { argb: 'FFCCCCCC' } }, bottom: { style: 'hair', color: { argb: 'FFCCCCCC' } }, left: { style: 'hair', color: { argb: 'FFCCCCCC' } }, right: { style: 'hair', color: { argb: 'FFCCCCCC' } } } }; }

                    function ap(c, s) { if (s.font) c.font = s.font; if (s.fill) c.fill = s.fill; if (s.alignment) c.alignment = s.alignment; if (s.border) c.border = s.border; if (s.numFmt) c.numFmt = s.numFmt; }

                    function mh(ws, fc, tc, r, text, bg = HB, tc2 = GL, fs = 12) { ws.mergeCells(r, fc, r, tc); const c = ws.getCell(r, fc); c.value = text; c.font = { name: 'Arial', bold: true, size: fs, color: { argb: tc2 } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }; c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true, readingOrder: 'ltr' }; c.border = { top: { style: 'medium', color: { argb: G } }, bottom: { style: 'medium', color: { argb: G } }, left: { style: 'medium', color: { argb: G } }, right: { style: 'medium', color: { argb: G } } }; }

                    // 1. Cover Sheet
                    const cv = workbook.addWorksheet('Report Cover', { views: [{ rightToLeft: false, showGridLines: false }] });
                    [8, 45, 35, 8].forEach((w, i) => cv.getColumn(i + 1).width = w);
                    for (let r = 1; r <= 40; r++) cv.getRow(r).height = 22;
                    cv.getRow(2).height = 80;
                    cv.getRow(4).height = 60;
                    cv.mergeCells(2, 1, 2, 4);
                    const bc = cv.getCell(2, 1);
                    bc.value = 'FAROUK GRUP for Consulting & Business\nFAROUK GRUP';
                    bc.font = { name: 'Arial', bold: true, size: 28, color: { argb: GL } };
                    bc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DB } };
                    bc.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true, readingOrder: 'ltr' };
                    bc.border = { bottom: { style: 'thick', color: { argb: G } } };
                    mh(cv, 1, 4, 4, `Cash Gap (CCC) Analysis Report\n${companyName}`, DB, GL, 18);
                    const inf = [
                        ['📋 Entity', companyName],
                        ['📅 Date', new Date().toLocaleDateString('en-US')],
                        ['💰 Currency', currency],
                        ['📊 CCC', `${D.outputs.ccc.toFixed(1)} days`],
                        ['📈 Rating', D.outputs.status]
                    ];
                    let ir = 6;
                    inf.forEach(([l, v], idx) => {
                        cv.mergeCells(ir, 1, ir, 2);
                        cv.mergeCells(ir, 3, ir, 4);
                        const lc = cv.getCell(ir, 1), vc = cv.getCell(ir, 3);
                        lc.value = l; vc.value = v;
                        const bg = idx % 2 === 0 ? AR : 'FFFEFCF6';
                        ap(lc, { font: { name: 'Arial', bold: true, size: 11, color: { argb: '00695C' } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }, alignment: { horizontal: 'right', vertical: 'middle', readingOrder: 'ltr' }, border: { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' }, right: { style: 'hair' } } });
                        ap(vc, { font: { name: 'Arial', size: 11, color: { argb: DT } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }, alignment: { horizontal: 'center', vertical: 'middle', readingOrder: 'ltr' }, border: { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' }, right: { style: 'hair' } } });
                        cv.getRow(ir).height = 28;
                        ir++;
                    });

                    // 2. Inputs
                    const inputsSheet = workbook.addWorksheet('Inputs & Assumptions', { views: [{ rightToLeft: false, showGridLines: false }] });
                    inputsSheet.getColumn(1).width = 5;
                    inputsSheet.getColumn(2).width = 38;
                    inputsSheet.getColumn(3).width = 22;
                    inputsSheet.getColumn(4).width = 22;
                    inputsSheet.getColumn(5).width = 5;
                    mh(inputsSheet, 1, 5, 1, '📋 Inputs & Assumptions', DB, GL, 14);
                    inputsSheet.getRow(1).height = 40;
                    mh(inputsSheet, 2, 4, 2, 'Base Data for CCC Analysis', SB, W, 11);
                    inputsSheet.getRow(2).height = 28;
                    const inputsData = [
                        ['Beginning Inventory', D.inputs.invStart, `${currency} ${D.inputs.invStart.toFixed(0)}`],
                        ['Ending Inventory', D.inputs.invEnd, `${currency} ${D.inputs.invEnd.toFixed(0)}`],
                        ['Average Inventory', D.inputs.avgInventory, `${currency} ${D.inputs.avgInventory.toFixed(0)}`],
                        ['Beginning Receivables', D.inputs.arStart, `${currency} ${D.inputs.arStart.toFixed(0)}`],
                        ['Ending Receivables', D.inputs.arEnd, `${currency} ${D.inputs.arEnd.toFixed(0)}`],
                        ['Average Receivables', D.inputs.avgReceivables, `${currency} ${D.inputs.avgReceivables.toFixed(0)}`],
                        ['Beginning Payables', D.inputs.apStart, `${currency} ${D.inputs.apStart.toFixed(0)}`],
                        ['Ending Payables', D.inputs.apEnd, `${currency} ${D.inputs.apEnd.toFixed(0)}`],
                        ['Average Payables', D.inputs.avgPayables, `${currency} ${D.inputs.avgPayables.toFixed(0)}`],
                        ['COGS', D.inputs.cogs, `${currency} ${D.inputs.cogs.toFixed(0)}`],
                        ['Net Credit Sales', D.inputs.creditSales, `${currency} ${D.inputs.creditSales.toFixed(0)}`],
                        ['Period Length', `${D.periodMonths} months`, `${D.daysFactor.toFixed(0)} days`]
                    ];
                    let iRow = 3;
                    inputsData.forEach(([label, val, note], idx) => {
                        inputsSheet.getRow(iRow).height = 24;
                        const bg = idx % 2 === 0 ? 'FFFEFCF6' : 'FFFFFFFF';
                        const lc = inputsSheet.getCell(iRow, 2), vc = inputsSheet.getCell(iRow, 3), nc = inputsSheet.getCell(iRow, 4);
                        lc.value = label; vc.value = val; nc.value = note;
                        ap(lc, cs(bg, DT, true, 'right'));
                        ap(vc, { ...cs(bg, '0000FF', false, 'center'), numFmt: typeof val === 'number' ? '#,##0' : null });
                        ap(nc, cs(bg, '00695C', false, 'center'));
                        iRow++;
                    });

                    // 3. KPI Dashboard
                    const kpiSheet = workbook.addWorksheet('KPI Dashboard', { views: [{ rightToLeft: false, showGridLines: false }] });
                    [5, 32, 22, 22, 22, 5].forEach((w, i) => kpiSheet.getColumn(i + 1).width = w);
                    mh(kpiSheet, 1, 6, 1, '📊 KPI Dashboard', DB, GL, 15);
                    kpiSheet.getRow(1).height = 45;
                    mh(kpiSheet, 2, 5, 2, `${companyName} | ${new Date().toLocaleDateString('en-US')}`, HB, W, 10);
                    kpiSheet.getRow(2).height = 26;
                    const kpis = [
                        { label: 'DIO', value: `${D.outputs.dio.toFixed(1)} days` },
                        { label: 'DSO', value: `${D.outputs.dso.toFixed(1)} days` },
                        { label: 'DPO', value: `${D.outputs.dpo.toFixed(1)} days` },
                        { label: 'CCC', value: `${D.outputs.ccc.toFixed(1)} days`, highlight: true }
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
                        const isGood = idx === 3 ? D.outputs.ccc <= 30 : true;
                        const bg = isGood ? PB : (D.outputs.ccc > 60 && idx === 3 ? NB : GB);
                        const tc = isGood ? PT : (D.outputs.ccc > 60 && idx === 3 ? NT : 'FF856404');
                        [ic, lc2, vc3, nc2].forEach(c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }; c.border = { top: { style: 'thin', color: { argb: G } }, bottom: { style: 'thin', color: { argb: G } }, left: { style: 'thin', color: { argb: G } }, right: { style: 'thin', color: { argb: G } } }; });
                        ic.font = { name: 'Arial', bold: true, size: 14, color: { argb: '555555' } };
                        ic.alignment = { horizontal: 'center', vertical: 'middle' };
                        lc2.font = { name: 'Arial', bold: true, size: 11, color: { argb: DT } };
                        lc2.alignment = { horizontal: 'right', vertical: 'middle', readingOrder: 'ltr' };
                        vc3.font = { name: 'Arial', bold: true, size: 13, color: { argb: tc } };
                        vc3.alignment = { horizontal: 'center', vertical: 'middle' };
                        nc2.font = { name: 'Arial', size: 9, color: { argb: '444444' } };
                        nc2.alignment = { horizontal: 'right', vertical: 'middle', readingOrder: 'ltr' };
                        kRow++;
                    });
                    kRow++;
                    kpiSheet.mergeCells(kRow, 2, kRow, 5);
                    const kFinal = kpiSheet.getCell(kRow, 2);
                    kFinal.value = D.outputs.ccc <= 30 ? '✅ Excellent Cash Management' : D.outputs.ccc <= 60 ? '🟡 Acceptable Cash Management' : '🔴 High Liquidity Risk';
                    kFinal.font = { name: 'Arial', bold: true, size: 13, color: { argb: D.outputs.ccc <= 30 ? PT : D.outputs.ccc <= 60 ? '856404' : NT } };
                    kFinal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: D.outputs.ccc <= 30 ? PB : D.outputs.ccc <= 60 ? GB : NB } };
                    kFinal.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'ltr' };
                    kFinal.border = { top: { style: 'medium', color: { argb: G } }, bottom: { style: 'medium', color: { argb: G } }, left: { style: 'medium', color: { argb: G } }, right: { style: 'medium', color: { argb: G } } };
                    kpiSheet.getRow(kRow).height = 40;

                    // 4. Calculation Details
                    const detailSheet = workbook.addWorksheet('Calculation Details', { views: [{ rightToLeft: false, showGridLines: false }] });
                    detailSheet.getColumn(1).width = 5;
                    detailSheet.getColumn(2).width = 40;
                    detailSheet.getColumn(3).width = 25;
                    detailSheet.getColumn(4).width = 25;
                    detailSheet.getColumn(5).width = 5;
                    mh(detailSheet, 1, 5, 1, '📋 CCC Calculation Details', DB, GL, 14);
                    detailSheet.getRow(1).height = 40;
                    detailSheet.addRow(['Indicator', 'Value', 'Formula']);
                    const detailRows = [
                        ['Average Inventory', `${currency} ${D.inputs.avgInventory.toFixed(0)}`, `(${D.inputs.invStart} + ${D.inputs.invEnd}) / 2`],
                        ['DIO', `${D.outputs.dio.toFixed(1)} days`, `(Avg Inventory ÷ COGS) × ${D.daysFactor.toFixed(0)}`],
                        ['Average Receivables', `${currency} ${D.inputs.avgReceivables.toFixed(0)}`, `(${D.inputs.arStart} + ${D.inputs.arEnd}) / 2`],
                        ['DSO', `${D.outputs.dso.toFixed(1)} days`, `(Avg Receivables ÷ Credit Sales) × ${D.daysFactor.toFixed(0)}`],
                        ['Average Payables', `${currency} ${D.inputs.avgPayables.toFixed(0)}`, `(${D.inputs.apStart} + ${D.inputs.apEnd}) / 2`],
                        ['DPO', `${D.outputs.dpo.toFixed(1)} days`, `(Avg Payables ÷ COGS) × ${D.daysFactor.toFixed(0)}`],
                        ['CCC', `${D.outputs.ccc.toFixed(1)} days`, `DIO + DSO - DPO`]
                    ];
                    detailRows.forEach(r => detailSheet.addRow(r));
                    const detHeader = detailSheet.getRow(2);
                    detHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    detHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
                    detailSheet.getColumn(2).width = 25;
                    detailSheet.getColumn(3).width = 25;

                    // 5. Charts
                    const chartsSheet = workbook.addWorksheet('Charts', { views: [{ rightToLeft: false, showGridLines: false }] });
                    chartsSheet.getColumn(1).width = 5;
                    chartsSheet.getColumn(2).width = 50;
                    chartsSheet.getColumn(3).width = 5;
                    mh(chartsSheet, 1, 3, 1, '📊 CCC Charts', DB, GL, 14);
                    chartsSheet.getRow(1).height = 40;

                    const chartContainer = document.querySelector('.chart-card');
                    if (chartContainer) {
                        try {
                            const origBg = chartContainer.style.backgroundColor;
                            chartContainer.style.backgroundColor = '#ffffff';
                            const canvasImg = await html2canvas(chartContainer, { scale: 2, backgroundColor: '#ffffff' });
                            chartContainer.style.backgroundColor = origBg;
                            const imgData = canvasImg.toDataURL('image/png');
                            const imageId = workbook.addImage({ base64: imgData, extension: 'png' });
                            chartsSheet.addImage(imageId, { tl: { col: 1, row: 2 }, br: { col: 2, row: 14 }, editAs: 'oneCell' });
                        } catch (err) { /* silent */ }
                    }

                    // 6. Recommendations
                    const recSheet = workbook.addWorksheet('Interpretation & Recommendations', { views: [{ rightToLeft: false, showGridLines: false }] });
                    recSheet.getColumn(1).width = 5;
                    recSheet.getColumn(2).width = 50;
                    recSheet.getColumn(3).width = 5;
                    mh(recSheet, 1, 3, 1, '📝 Interpretation & Recommendations', DB, GL, 14);
                    recSheet.getRow(1).height = 45;
                    const sections = [
                        { title: '1. Summary', content: `Entity: ${companyName}\nPeriod: ${D.periodMonths} months\nDIO: ${D.outputs.dio.toFixed(1)} days\nDSO: ${D.outputs.dso.toFixed(1)} days\nDPO: ${D.outputs.dpo.toFixed(1)} days\nCCC: ${D.outputs.ccc.toFixed(1)} days` },
                        { title: '2. Assessment', content: `Rating: ${D.outputs.status}\n${D.outputs.recommendation}` },
                        { title: '3. Recommendations', content: (D.outputs.dio > 45 ? '• Recommend improving inventory management and reducing holding days.\n' : '• Inventory management is good, continue monitoring.\n') + (D.outputs.dso > 45 ? '• Recommend accelerating collection of receivables or offering early payment discounts.\n' : '• Credit policy is good, continue.\n') + (D.outputs.dpo < 30 ? '• Try to negotiate with suppliers to extend payment terms.\n' : '• Payment terms with suppliers are appropriate.') },
                        { title: '4. Disclaimer', content: 'This analysis is based on estimated data. Actual results may vary depending on market conditions and operational changes. Consult a financial expert before making decisions.' }
                    ];
                    let itRow = 2;
                    sections.forEach((sec, idx) => {
                        itRow++;
                        recSheet.getRow(itRow).height = 30;
                        recSheet.mergeCells(itRow, 2, itRow, 2);
                        const tc3 = recSheet.getCell(itRow, 2);
                        tc3.value = sec.title;
                        tc3.font = { name: 'Arial', bold: true, size: 12, color: { argb: GL } };
                        tc3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? HB : SB } };
                        tc3.alignment = { horizontal: 'right', vertical: 'middle', readingOrder: 'ltr' };
                        tc3.border = { bottom: { style: 'medium', color: { argb: G } } };
                        itRow++;
                        recSheet.getRow(itRow).height = Math.max(60, sec.content.split('\n').length * 18);
                        recSheet.mergeCells(itRow, 2, itRow, 2);
                        const cc = recSheet.getCell(itRow, 2);
                        cc.value = sec.content;
                        cc.font = { name: 'Arial', size: 10, color: { argb: DT } };
                        cc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEFCF6' } };
                        cc.alignment = { horizontal: 'right', vertical: 'top', wrapText: true, readingOrder: 'ltr' };
                        cc.border = { top: { style: 'hair' }, bottom: { style: 'hair', color: { argb: G } }, left: { style: 'hair' }, right: { style: 'hair' } };
                    });

                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const now = new Date();
                    const fileName = `CCC_${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
                    saveAs(blob, fileName);
                } catch (err) {
                    console.error(err);
                    alert('Error creating Excel file: ' + err.message);
                } finally {
                    hideLoading();
                }
            }

            // ========== Export to Word ==========
            async function exportToWord() {
                if (!currentResults) {
                    alert('Please run the analysis first.');
                    return;
                }
                showLoading('Creating Professional Word Report...', 'Gathering data and charts');
                try {
                    const D = currentResults;
                    const currency = D.currency;
                    const companyName = D.company;
                    const now = new Date();
                    const dateStr = now.toLocaleDateString('en-US');

                    const chartContainer = document.querySelector('.chart-card');
                    let chartImgBase64 = '';
                    if (chartContainer) {
                        const origBg = chartContainer.style.backgroundColor;
                        chartContainer.style.backgroundColor = '#ffffff';
                        const img = await html2canvas(chartContainer, { scale: 2, backgroundColor: '#ffffff' });
                        chartContainer.style.backgroundColor = origBg;
                        chartImgBase64 = img.toDataURL('image/png');
                    }

                    const fullHtml = `<!DOCTYPE html>
                    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
                    <head><meta charset='utf-8'><title>CCC Report - FAROUK GRUP</title>
                    <style>
                        body{font-family:'Arial','Tajawal',sans-serif;direction:ltr;margin:2rem;background:#fff;}
                        .cover{text-align:center;border-bottom:4px solid #b8860b;margin-bottom:30px;padding-bottom:20px;}
                        .cover h1{font-size:32px;color:#b8860b;margin:0;}
                        .cover h2{font-size:24px;color:#b48554;margin:5px 0;}
                        table{width:100%;border-collapse:collapse;margin:20px 0;direction:ltr;}
                        th,td{border:1px solid #b8860b;padding:8px;text-align:center;}
                        th{background:#fefcf6;color:#b8860b;font-weight:bold;}
                        .chart-img{max-width:100%;height:auto;border:1px solid #b8860b;border-radius:10px;margin:20px 0;}
                        .footer{text-align:center;margin-top:40px;padding-top:10px;border-top:1px dashed #b8860b;color:#888;}
                    </style></head>
                    <body>
                        <div class="cover">
                            <h1>FAROUK GRUP for Consulting & Business</h1>
                            <h2>Cash Gap (CCC) Analysis Report</h2>
                            <p>Entity: ${companyName} | Date: ${dateStr}</p>
                            <p>Currency: ${currency} | Period: ${D.periodMonths} months</p>
                        </div>
                        <h2 style="color:#b8860b;">Base Inputs</h2>
                        <table><tbody>
                            <tr><th>Beginning Inventory</th><td>${currency} ${D.inputs.invStart.toFixed(0)}</td><th>Ending Inventory</th><td>${currency} ${D.inputs.invEnd.toFixed(0)}</td></tr>
                            <tr><th>Average Inventory</th><td><strong>${currency} ${D.inputs.avgInventory.toFixed(0)}</strong></td><th>Beginning Receivables</th><td>${currency} ${D.inputs.arStart.toFixed(0)}</td></tr>
                            <tr><th>Ending Receivables</th><td>${currency} ${D.inputs.arEnd.toFixed(0)}</td><th>Average Receivables</th><td><strong>${currency} ${D.inputs.avgReceivables.toFixed(0)}</strong></td></tr>
                            <tr><th>Beginning Payables</th><td>${currency} ${D.inputs.apStart.toFixed(0)}</td><th>Ending Payables</th><td>${currency} ${D.inputs.apEnd.toFixed(0)}</td></tr>
                            <tr><th>Average Payables</th><td><strong>${currency} ${D.inputs.avgPayables.toFixed(0)}</strong></td><th>COGS</th><td>${currency} ${D.inputs.cogs.toFixed(0)}</td></tr>
                            <tr><th>Credit Sales</th><td>${currency} ${D.inputs.creditSales.toFixed(0)}</td><th>Period Length</th><td>${D.periodMonths} months</td></tr>
                        </tbody></table>
                        <h2 style="color:#b8860b;">📊 CCC Indicators</h2>
                        <table>
                            <thead><tr><th>Indicator</th><th>Value (Days)</th></tr></thead>
                            <tbody>
                                <tr><td>DIO</td><td>${D.outputs.dio.toFixed(1)}</td></tr>
                                <tr><td>DSO</td><td>${D.outputs.dso.toFixed(1)}</td></tr>
                                <tr><td>DPO</td><td>${D.outputs.dpo.toFixed(1)}</td></tr>
                                <tr style="font-weight:bold;background:#f0f0f0;"><td>CCC</td><td>${D.outputs.ccc.toFixed(1)}</td></tr>
                            </tbody>
                        </table>
                        <div style="margin:20px 0;padding:20px;background:${D.outputs.ccc <= 30 ? '#d4edda' : D.outputs.ccc <= 60 ? '#fff3cd' : '#f8d7da'};border-radius:10px;text-align:center;">
                            <span style="font-size:1.5rem;font-weight:bold;color:${D.outputs.ccc <= 30 ? '#155724' : D.outputs.ccc <= 60 ? '#856404' : '#721c24'};">Rating: ${D.outputs.status}</span>
                            <p style="margin-top:10px;">${D.outputs.recommendation}</p>
                        </div>
                        <h2 style="color:#b8860b;">📊 Charts</h2>
                        <div style="text-align:center;"><img src="${chartImgBase64}" class="chart-img" /></div>
                        <div class="footer">Created by FAROUK GRUP for Consulting & Business © ${now.getFullYear()}</div>
                    </body></html>`;

                    const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `CCC_${companyName}_${now.toISOString().slice(0,10)}.doc`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                } catch (err) {
                    console.error(err);
                    alert('Error creating Word report');
                } finally {
                    hideLoading();
                }
            }

            // ===== Attach event listeners =====
            document.getElementById('calculateBtn').addEventListener('click', calculateCCC);
            document.getElementById('exportWordBtn').addEventListener('click', exportToWord);
            document.getElementById('exportFullExcelBtn').addEventListener('click', exportToFullExcel);

            // Auto-run on load
            window.addEventListener('load', function() {
                setTimeout(calculateCCC, 500);
            });

        })();
    