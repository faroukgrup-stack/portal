
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

            // ===== Cashflow management =====
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
                    row.innerHTML = `
                        <div class="field">
                            <label>Year ${yearNum}</label>
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

            // ===== Main calculation =====
            function calculateInvestmentMetrics() {
                updateCashflowsFromInputs();

                const currency = document.getElementById('currencySelect').value;
                const company = document.getElementById('companyName').value || 'Entity';
                const initialInvestment = parseFloat(document.getElementById('initialInvestment').value) || 0;
                const discountRate = parseFloat(document.getElementById('discountRate').value) / 100 || 0;
                const years = parseInt(document.getElementById('projectYears').value) || 0;

                while (cashflows.length < years) cashflows.push(0);
                while (cashflows.length > years) cashflows.pop();

                if (initialInvestment <= 0 || discountRate < 0 || years <= 0) {
                    alert('Please enter valid values (Investment > 0, Discount Rate >= 0, Years > 0).');
                    return;
                }

                // Calculate NPV
                let npv = -initialInvestment;
                for (let i = 0; i < years; i++) {
                    const cf = cashflows[i] || 0;
                    npv += cf / Math.pow(1 + discountRate, i + 1);
                }

                // Calculate IRR (Newton-Raphson)
                let irr = 0.1;
                const maxIter = 1000;
                const tolerance = 0.00001;
                for (let iter = 0; iter < maxIter; iter++) {
                    let npv_irr = -initialInvestment;
                    let dnpv = 0;
                    for (let i = 0; i < years; i++) {
                        const cf = cashflows[i] || 0;
                        const denom = Math.pow(1 + irr, i + 1);
                        npv_irr += cf / denom;
                        dnpv += -(i + 1) * cf / Math.pow(1 + irr, i + 2);
                    }
                    if (Math.abs(npv_irr) < tolerance) break;
                    if (dnpv === 0) break;
                    irr = irr - npv_irr / dnpv;
                    if (irr < -0.99) irr = -0.99;
                    if (irr > 10) irr = 10;
                }
                const irrPercent = irr * 100;

                // Payback period
                let cumulative = 0;
                let paybackYear = 0;
                let paybackRemaining = 0;
                for (let i = 0; i < years; i++) {
                    cumulative += cashflows[i] || 0;
                    if (cumulative >= initialInvestment) {
                        paybackYear = i + 1;
                        const excess = cumulative - initialInvestment;
                        paybackRemaining = (cashflows[i] || 0) > 0 ? (excess / (cashflows[i] || 0)) : 0;
                        break;
                    }
                }
                let payback = paybackYear > 0 ? paybackYear - paybackRemaining : 0;

                // Discounted payback
                let discountedCumulative = 0;
                let dPaybackYear = 0;
                let dPaybackRemaining = 0;
                for (let i = 0; i < years; i++) {
                    const dcf = (cashflows[i] || 0) / Math.pow(1 + discountRate, i + 1);
                    discountedCumulative += dcf;
                    if (discountedCumulative >= initialInvestment) {
                        dPaybackYear = i + 1;
                        const excess = discountedCumulative - initialInvestment;
                        dPaybackRemaining = dcf > 0 ? (excess / dcf) : 0;
                        break;
                    }
                }
                let dPayback = dPaybackYear > 0 ? dPaybackYear - dPaybackRemaining : 0;

                const isAcceptable = npv > 0 && irrPercent > discountRate * 100;
                let status = '', statusClass = '';
                if (isAcceptable) {
                    status = 'Acceptable (Viable Investment)';
                    statusClass = 'status-good';
                } else if (npv > 0 || irrPercent > discountRate * 100) {
                    status = 'Partially Acceptable (Review)';
                    statusClass = 'status-warning';
                } else {
                    status = 'Not Acceptable (Non-Viable)';
                    statusClass = 'status-bad';
                }

                currentResults = {
                    currency, company,
                    inputs: { initialInvestment, discountRate: discountRate * 100, years, cashflows: [...cashflows] },
                    outputs: { npv, irr: irrPercent, payback, dPayback, status, statusClass, isAcceptable }
                };

                document.getElementById('resultsSection').style.display = 'block';
                document.getElementById('initialMessage').style.display = 'none';

                // KPI Cards
                document.getElementById('kpiCards').innerHTML = `
                    <div class="result-card" style="border-color:${npv >= 0 ? '#28a745' : '#dc3545'};">
                        <i class="fas fa-money-bill-wave"></i>
                        <h4>NPV</h4>
                        <div class="value" style="color:${npv >= 0 ? '#4ade80' : '#f87171'}">${currency}${npv.toFixed(2)}</div>
                        <div class="unit">${npv >= 0 ? '✅ Positive' : '❌ Negative'}</div>
                    </div>
                    <div class="result-card">
                        <i class="fas fa-percent"></i>
                        <h4>IRR</h4>
                        <div class="value">${irrPercent.toFixed(2)}%</div>
                        <div class="unit">vs Discount: ${(discountRate*100).toFixed(2)}%</div>
                    </div>
                    <div class="result-card">
                        <i class="fas fa-clock"></i>
                        <h4>Payback Period</h4>
                        <div class="value">${payback.toFixed(2)}</div>
                        <div class="unit">years</div>
                    </div>
                    <div class="result-card">
                        <i class="fas fa-hourglass-half"></i>
                        <h4>Discounted Payback</h4>
                        <div class="value">${dPayback.toFixed(2)}</div>
                        <div class="unit">years</div>
                    </div>
                    <div class="result-card" style="border-color:${isAcceptable ? '#28a745' : '#dc3545'};">
                        <i class="fas fa-check-circle"></i>
                        <h4>Final Verdict</h4>
                        <div class="value" style="font-size:1.1rem;"><span class="status ${statusClass}">${status}</span></div>
                    </div>
                `;

                // Cashflow table
                let tableHtml = `<table><thead><tr><th>Year</th><th>Cashflow</th><th>Discount Factor</th><th>Discounted Value</th><th>Cumulative</th></tr></thead><tbody>`;
                let cum = -initialInvestment;
                for (let i = 0; i < years; i++) {
                    const cf = cashflows[i] || 0;
                    const dcf = cf / Math.pow(1 + discountRate, i + 1);
                    cum += dcf;
                    tableHtml += `<tr>
                        <td>${i+1}</td>
                        <td>${currency}${cf.toFixed(0)}</td>
                        <td>${(1 / Math.pow(1 + discountRate, i + 1)).toFixed(4)}</td>
                        <td>${currency}${dcf.toFixed(0)}</td>
                        <td class="${cum >= 0 ? 'positive' : 'negative'}">${currency}${cum.toFixed(0)}</td>
                    </tr>`;
                }
                tableHtml += `</tbody></table>`;
                document.getElementById('cashflowTable').innerHTML = tableHtml;

                // Recommendations
                const recDiv = document.getElementById('recommendations');
                let recHtml = `<h4 style="color:#cfa776;">📌 Feasibility Analysis</h4>`;
                if (isAcceptable) {
                    recHtml += `<p style="color:#4ade80;">✅ The project is a viable investment.</p>`;
                    recHtml += `<p>NPV is positive (${currency}${npv.toFixed(2)}), and IRR (${irrPercent.toFixed(2)}%) exceeds the discount rate (${(discountRate*100).toFixed(2)}%).</p>`;
                    if (payback < years) {
                        recHtml += `<p>Payback period (${payback.toFixed(2)} years) is shorter than the project duration (${years} years).</p>`;
                    } else {
                        recHtml += `<p>⚠️ Payback period (${payback.toFixed(2)} years) exceeds the project duration (${years} years).</p>`;
                    }
                } else if (npv > 0 || irrPercent > discountRate * 100) {
                    recHtml += `<p style="color:#fbbf24;">🟡 The project is partially acceptable.</p>`;
                    recHtml += `<p>One indicator is positive but not both. Re-evaluate assumptions or improve cashflows.</p>`;
                } else {
                    recHtml += `<p style="color:#f87171;">🔴 The project is not viable.</p>`;
                    recHtml += `<p>NPV is negative (${currency}${npv.toFixed(2)}), and IRR (${irrPercent.toFixed(2)}%) is below the discount rate (${(discountRate*100).toFixed(2)}%).</p>`;
                    recHtml += `<p>It is recommended to review the project or explore better investment alternatives.</p>`;
                }
                recDiv.innerHTML = recHtml;

                // Chart
                const ctx = document.getElementById('cashflowChart').getContext('2d');
                if (chartInstance) chartInstance.destroy();

                const labels = [];
                const dataValues = [];
                const cumulativeValues = [];
                let cumVal = -initialInvestment;
                for (let i = 0; i < years; i++) {
                    labels.push(`Year ${i+1}`);
                    dataValues.push(cashflows[i] || 0);
                    cumVal += (cashflows[i] || 0);
                    cumulativeValues.push(cumVal);
                }

                chartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Annual Cashflow',
                            data: dataValues,
                            backgroundColor: dataValues.map(v => v >= 0 ? 'rgba(40,167,69,0.7)' : 'rgba(220,53,69,0.7)'),
                            borderColor: dataValues.map(v => v >= 0 ? '#28a745' : '#dc3545'),
                            borderWidth: 2,
                            borderRadius: 4,
                            order: 2
                        }, {
                            label: 'Cumulative',
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

            // ========== Export to Full Excel ==========
            async function exportToFullExcel() {
                if (!currentResults) { alert('Please run the analysis first.'); return; }
                showLoading('Creating Professional Excel Report...', 'Creating sheets and charts');
                try {
                    const D = currentResults;
                    const currency = D.currency;
                    const company = D.company;

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
                    mh(cv, 1, 4, 4, `Investment Analysis Report\n${company}`, DB, GL, 18);
                    const inf = [
                        ['📋 Entity', company],
                        ['📅 Date', new Date().toLocaleDateString('en-US')],
                        ['💰 Currency', currency],
                        ['📊 NPV', `${currency}${D.outputs.npv.toFixed(2)}`],
                        ['📈 IRR', `${D.outputs.irr.toFixed(2)}%`],
                        ['🏷️ Verdict', D.outputs.status]
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
                    mh(inputsSheet, 2, 4, 2, 'Project Base Data', SB, W, 11);
                    inputsSheet.getRow(2).height = 28;
                    const inputFields = [
                        ['Initial Investment', D.inputs.initialInvestment, `${currency} ${D.inputs.initialInvestment.toFixed(0)}`],
                        ['Discount Rate', D.inputs.discountRate, `${D.inputs.discountRate.toFixed(2)}%`],
                        ['Project Duration (Years)', D.inputs.years, '']
                    ];
                    let iRow = 3;
                    inputFields.forEach(([label, val, note], idx) => {
                        inputsSheet.getRow(iRow).height = 24;
                        const bg = idx % 2 === 0 ? 'FFFEFCF6' : 'FFFFFFFF';
                        const lc = inputsSheet.getCell(iRow, 2), vc = inputsSheet.getCell(iRow, 3), nc = inputsSheet.getCell(iRow, 4);
                        lc.value = label; vc.value = val; nc.value = note;
                        ap(lc, cs(bg, DT, true, 'right'));
                        ap(vc, { ...cs(bg, '0000FF', false, 'center'), numFmt: typeof val === 'number' ? '#,##0.00' : null });
                        ap(nc, cs(bg, '00695C', false, 'center'));
                        iRow++;
                    });

                    // 3. Cashflows
                    const cfSheet = workbook.addWorksheet('Cashflows', { views: [{ rightToLeft: false, showGridLines: false }] });
                    cfSheet.getColumn(1).width = 5;
                    cfSheet.getColumn(2).width = 15;
                    cfSheet.getColumn(3).width = 22;
                    cfSheet.getColumn(4).width = 22;
                    cfSheet.getColumn(5).width = 22;
                    cfSheet.getColumn(6).width = 22;
                    cfSheet.getColumn(7).width = 5;
                    mh(cfSheet, 1, 7, 1, '📋 Cashflow Table', DB, GL, 14);
                    cfSheet.getRow(1).height = 40;
                    cfSheet.addRow(['Year', 'Cashflow', 'Discount Factor', 'Discounted Value', 'Cumulative']);
                    let cum = -D.inputs.initialInvestment;
                    for (let i = 0; i < D.inputs.years; i++) {
                        const cf = D.inputs.cashflows[i] || 0;
                        const dcf = cf / Math.pow(1 + D.inputs.discountRate / 100, i + 1);
                        cum += dcf;
                        cfSheet.addRow([i + 1, cf, (1 / Math.pow(1 + D.inputs.discountRate / 100, i + 1)).toFixed(4), dcf, cum]);
                    }
                    const cfHeader = cfSheet.getRow(2);
                    cfHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    cfHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };

                    // 4. KPI Dashboard
                    const kpiSheet = workbook.addWorksheet('KPI Dashboard', { views: [{ rightToLeft: false, showGridLines: false }] });
                    [5, 32, 22, 22, 22, 5].forEach((w, i) => kpiSheet.getColumn(i + 1).width = w);
                    mh(kpiSheet, 1, 6, 1, '📊 KPI Dashboard', DB, GL, 15);
                    kpiSheet.getRow(1).height = 45;
                    mh(kpiSheet, 2, 5, 2, `${company} | ${new Date().toLocaleDateString('en-US')}`, HB, W, 10);
                    kpiSheet.getRow(2).height = 26;
                    const kpis = [
                        { label: 'NPV', value: `${currency}${D.outputs.npv.toFixed(2)}`, good: D.outputs.npv > 0 },
                        { label: 'IRR', value: `${D.outputs.irr.toFixed(2)}%`, good: D.outputs.irr > D.inputs.discountRate },
                        { label: 'Payback', value: `${D.outputs.payback.toFixed(2)} years`, good: D.outputs.payback < D.inputs.years },
                        { label: 'Verdict', value: D.outputs.status, good: D.outputs.isAcceptable }
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
                        const bg = k.good ? PB : NB, tc = k.good ? PT : NT;
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
                    kFinal.value = D.outputs.isAcceptable ? '✅ Project is viable' : '⚠️ Project is not viable';
                    kFinal.font = { name: 'Arial', bold: true, size: 13, color: { argb: D.outputs.isAcceptable ? PT : '856404' } };
                    kFinal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: D.outputs.isAcceptable ? PB : GB } };
                    kFinal.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'ltr' };
                    kFinal.border = { top: { style: 'medium', color: { argb: G } }, bottom: { style: 'medium', color: { argb: G } }, left: { style: 'medium', color: { argb: G } }, right: { style: 'medium', color: { argb: G } } };
                    kpiSheet.getRow(kRow).height = 40;

                    // 5. Charts
                    const chartsSheet = workbook.addWorksheet('Charts', { views: [{ rightToLeft: false, showGridLines: false }] });
                    chartsSheet.getColumn(1).width = 5;
                    chartsSheet.getColumn(2).width = 50;
                    chartsSheet.getColumn(3).width = 5;
                    mh(chartsSheet, 1, 3, 1, '📊 Cashflow Chart', DB, GL, 14);
                    chartsSheet.getRow(1).height = 40;

                    const chartContainer = document.querySelector('.chart-container');
                    if (chartContainer) {
                        try {
                            const origBg = chartContainer.style.backgroundColor;
                            chartContainer.style.backgroundColor = '#ffffff';
                            const canvasImg = await html2canvas(chartContainer, { scale: 2, backgroundColor: '#ffffff' });
                            chartContainer.style.backgroundColor = origBg;
                            const imgData = canvasImg.toDataURL('image/png');
                            const imageId = workbook.addImage({ base64: imgData, extension: 'png' });
                            chartsSheet.addImage(imageId, { tl: { col: 1, row: 2 }, br: { col: 2, row: 18 }, editAs: 'oneCell' });
                        } catch (err) { /* silent */ }
                    }

                    // 6. Recommendations
                    const recSheet = workbook.addWorksheet('Recommendations', { views: [{ rightToLeft: false, showGridLines: false }] });
                    recSheet.getColumn(1).width = 5;
                    recSheet.getColumn(2).width = 50;
                    recSheet.getColumn(3).width = 5;
                    mh(recSheet, 1, 3, 1, '💡 Recommendations', DB, GL, 14);
                    recSheet.getRow(1).height = 40;
                    let recContent = '';
                    if (D.outputs.isAcceptable) {
                        recContent = `✅ The project is a viable investment.\nNPV is positive (${currency}${D.outputs.npv.toFixed(2)}), and IRR (${D.outputs.irr.toFixed(2)}%) exceeds the discount rate (${D.inputs.discountRate.toFixed(2)}%).\nPayback period: ${D.outputs.payback.toFixed(2)} years`;
                    } else {
                        recContent = `🔴 The project is not viable.\nNPV is negative (${currency}${D.outputs.npv.toFixed(2)}), and IRR (${D.outputs.irr.toFixed(2)}%) is below the discount rate (${D.inputs.discountRate.toFixed(2)}%).\nIt is recommended to review the project or explore better alternatives.`;
                    }
                    recSheet.getCell(3, 2).value = recContent;
                    recSheet.getCell(3, 2).font = { name: 'Arial', size: 11 };
                    recSheet.getCell(3, 2).alignment = { wrapText: true, readingOrder: 'ltr' };

                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const now = new Date();
                    const fileName = `Investment_${company}_${now.toISOString().slice(0,10)}.xlsx`;
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
                if (!currentResults) { alert('Please run the analysis first.'); return; }
                showLoading('Creating Professional Word Report...', 'Gathering data and charts');
                try {
                    const D = currentResults;
                    const currency = D.currency;
                    const company = D.company;
                    const now = new Date();
                    const dateStr = now.toLocaleDateString('en-US');

                    const chartContainer = document.querySelector('.chart-container');
                    let chartImgBase64 = '';
                    if (chartContainer) {
                        const origBg = chartContainer.style.backgroundColor;
                        chartContainer.style.backgroundColor = '#ffffff';
                        const img = await html2canvas(chartContainer, { scale: 2, backgroundColor: '#ffffff' });
                        chartContainer.style.backgroundColor = origBg;
                        chartImgBase64 = img.toDataURL('image/png');
                    }

                    let cfRows = '';
                    for (let i = 0; i < D.inputs.years; i++) {
                        cfRows += `<tr><td>${i+1}</td><td>${currency}${(D.inputs.cashflows[i]||0).toFixed(0)}</td></tr>`;
                    }

                    const fullHtml = `<!DOCTYPE html>
                    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
                    <head><meta charset='utf-8'><title>Investment Analysis Report - FAROUK GRUP</title>
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
                        .rec{background:#f9f9f9;padding:15px;border-left:4px solid #b8860b;margin:20px 0;}
                    </style></head>
                    <body>
                        <div class="cover">
                            <h1>FAROUK GRUP for Consulting & Business</h1>
                            <h2>Investment Analysis Report</h2>
                            <p>Entity: ${company} | Date: ${dateStr}</p>
                            <p>Currency: ${currency}</p>
                        </div>
                        <h2 style="color:#b8860b;">Project Data</h2>
                        <table><tbody>
                            <tr><th>Initial Investment</th><td>${currency}${D.inputs.initialInvestment.toFixed(0)}</td></tr>
                            <tr><th>Discount Rate</th><td>${D.inputs.discountRate.toFixed(2)}%</td></tr>
                            <tr><th>Project Duration</th><td>${D.inputs.years} years</td></tr>
                        </tbody></table>
                        <h2 style="color:#b8860b;">📈 Annual Cashflows</h2>
                        <table><thead><tr><th>Year</th><th>Cashflow</th></tr></thead><tbody>${cfRows}</tbody></table>
                        <h2 style="color:#b8860b;">📊 Investment Metrics</h2>
                        <table>
                            <thead><tr><th>Metric</th><th>Value</th></tr></thead>
                            <tbody>
                                <tr><td>NPV</td><td>${currency}${D.outputs.npv.toFixed(2)}</td></tr>
                                <tr><td>IRR</td><td>${D.outputs.irr.toFixed(2)}%</td></tr>
                                <tr><td>Payback Period</td><td>${D.outputs.payback.toFixed(2)} years</td></tr>
                                <tr><td>Discounted Payback</td><td>${D.outputs.dPayback.toFixed(2)} years</td></tr>
                                <tr style="font-weight:bold;"><td>Final Verdict</td><td style="color:${D.outputs.isAcceptable ? '#28a745' : '#dc3545'};">${D.outputs.status}</td></tr>
                            </tbody>
                        </table>
                        <div class="rec"><h3 style="color:#b8860b;">💡 Recommendation</h3><p>${D.outputs.isAcceptable ? '✅ The project is a viable investment.' : '🔴 The project is not viable.'}</p></div>
                        ${chartImgBase64 ? `<h2 style="color:#b8860b;">📊 Cashflow Chart</h2><div style="text-align:center;"><img src="${chartImgBase64}" class="chart-img" /></div>` : ''}
                        <div class="footer">Created by FAROUK GRUP for Consulting & Business © ${now.getFullYear()}</div>
                    </body></html>`;

                    const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `Investment_${company}_${now.toISOString().slice(0,10)}.doc`;
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
            document.getElementById('calculateBtn').addEventListener('click', calculateInvestmentMetrics);
            document.getElementById('exportWordBtn').addEventListener('click', exportToWord);
            document.getElementById('exportFullExcelBtn').addEventListener('click', exportToFullExcel);

            // Auto-run with example
            window.addEventListener('load', function() {
                document.getElementById('fillExampleBtn').click();
                setTimeout(calculateInvestmentMetrics, 300);
            });

        })();
    