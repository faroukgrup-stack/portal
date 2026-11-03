
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
            let chartInstance = null;
            window.lastResults = null;

            // ===== Main calculation =====
            function calculateCACCLV() {
                const currency = document.getElementById('currencySelect').value;
                const company = document.getElementById('companyName').value || 'Entity';

                const marketingSpend = parseFloat(document.getElementById('marketingSpend').value) || 0;
                const newCustomers = parseInt(document.getElementById('newCustomers').value) || 1;
                const avgOrder = parseFloat(document.getElementById('avgOrderValue').value) || 0;
                const visitsPerYear = parseInt(document.getElementById('visitsPerYear').value) || 1;
                const lifespan = parseFloat(document.getElementById('customerLifespan').value) || 1;
                const profitMargin = parseFloat(document.getElementById('profitMargin').value) || 0;

                if (marketingSpend <= 0 || newCustomers <= 0 || avgOrder <= 0 || visitsPerYear <= 0 || lifespan <= 0 || profitMargin <= 0) {
                    alert('Please enter positive values for all fields.');
                    return;
                }

                const cac = marketingSpend / newCustomers;
                const annualRevenuePerCustomer = avgOrder * visitsPerYear;
                const lifetimeRevenue = annualRevenuePerCustomer * lifespan;
                const clv = lifetimeRevenue * (profitMargin / 100);
                const ratio = clv / cac;

                let status, badgeClass, recommendation;
                if (ratio >= 4) {
                    status = 'Excellent';
                    badgeClass = 'badge-excellent';
                    recommendation = `✅ A ratio of ${ratio.toFixed(2)} means every dollar spent on marketing returns over $4 in profit. Your marketing strategy is excellent and sustainable. Continue investing and look for expansion opportunities.`;
                } else if (ratio >= 3) {
                    status = 'Very Good';
                    badgeClass = 'badge-good';
                    recommendation = `✅ A ratio of ${ratio.toFixed(2)} means your marketing investment is viable. You can improve performance by increasing average order value or improving customer retention.`;
                } else if (ratio >= 2) {
                    status = 'Moderate';
                    badgeClass = 'badge-fair';
                    recommendation = `🟡 A ratio of ${ratio.toFixed(2)} indicates the return is not sufficient. Review marketing channels, try to reduce costs, or increase customer lifetime.`;
                } else {
                    status = 'Poor';
                    badgeClass = 'badge-poor';
                    recommendation = `🔴 A ratio of ${ratio.toFixed(2)} means you are losing money on marketing. You need a radical restructuring: reduce acquisition cost, raise prices, or improve customer loyalty.`;
                }

                displayResults({
                    cac, clv, ratio, status, badgeClass, recommendation, currency, company,
                    marketingSpend, newCustomers, avgOrder, visitsPerYear, lifespan, profitMargin
                });
            }

            function displayResults(data) {
                document.getElementById('initialMessage').style.display = 'none';
                document.getElementById('resultsSection').style.display = 'block';

                document.getElementById('summaryCards').innerHTML = `
                    <div class="summary-card">
                        <div class="number">${data.currency}${data.cac.toFixed(2)}</div>
                        <div class="label">Acquisition Cost (CAC)</div>
                    </div>
                    <div class="summary-card">
                        <div class="number">${data.currency}${data.clv.toFixed(2)}</div>
                        <div class="label">Lifetime Value (CLV)</div>
                    </div>
                    <div class="summary-card">
                        <div class="number">${data.ratio.toFixed(2)}x</div>
                        <div class="label">CLV / CAC Ratio</div>
                    </div>
                    <div class="summary-card">
                        <div class="number"><span class="badge ${data.badgeClass}">${data.status}</span></div>
                        <div class="label">Rating</div>
                    </div>
                `;

                document.getElementById('recommendationBox').innerHTML = `
                    <h4><i class="fas fa-lightbulb" style="color:#cfa776;"></i> Strategic Recommendation</h4>
                    <p>${data.recommendation}</p>
                `;

                document.getElementById('detailsTable').innerHTML = `
                    <table>
                        <thead><tr><th>Indicator</th><th>Value</th><th>Explanation</th></tr></thead>
                        <tbody>
                            <tr><td>Total Marketing Spend</td><td>${data.currency}${data.marketingSpend}</td><td>Amount spent on ads and promotions monthly</td></tr>
                            <tr><td>New Customers</td><td>${data.newCustomers}</td><td>Number of customers acquired during the month</td></tr>
                            <tr><td>Acquisition Cost (CAC)</td><td>${data.currency}${data.cac.toFixed(2)}</td><td>Spend ÷ New Customers</td></tr>
                            <tr><td>Average Order Value</td><td>${data.currency}${data.avgOrder}</td><td>Average amount spent per visit</td></tr>
                            <tr><td>Annual Visits</td><td>${data.visitsPerYear}</td><td>Number of purchases per year</td></tr>
                            <tr><td>Lifespan (Years)</td><td>${data.lifespan}</td><td>Average duration the customer stays</td></tr>
                            <tr><td>Profit Margin</td><td>${data.profitMargin}%</td><td>Net profit percentage from each sale</td></tr>
                            <tr><td><strong>Lifetime Value (CLV)</strong></td><td><strong>${data.currency}${data.clv.toFixed(2)}</strong></td><td>Revenue × Profit Margin over customer lifetime</td></tr>
                            <tr><td><strong>CLV / CAC Ratio</strong></td><td><strong>${data.ratio.toFixed(2)}x</strong></td><td>Viability indicator (preferably ≥ 3)</td></tr>
                        </tbody>
                    </table>
                `;

                const ctx = document.getElementById('cacClvChart').getContext('2d');
                if (chartInstance) chartInstance.destroy();

                chartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Acquisition Cost (CAC)', 'Lifetime Value (CLV)'],
                        datasets: [{
                            label: 'Value in Currency',
                            data: [data.cac, data.clv],
                            backgroundColor: ['rgba(220,53,69,0.7)', 'rgba(40,167,69,0.7)'],
                            borderColor: ['#dc3545', '#28a745'],
                            borderWidth: 2,
                            borderRadius: 8,
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return `${data.currency}${context.parsed.y.toFixed(2)}`;
                                    }
                                }
                            },
                            legend: { display: false }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: { color: '#aab7d4', callback: function(value) { return data.currency + value; } },
                                grid: { color: 'rgba(180,133,84,0.2)' }
                            },
                            x: {
                                ticks: { color: '#aab7d4' },
                                grid: { display: false }
                            }
                        }
                    }
                });

                window.lastResults = data;
            }

            // ========== Export to Professional Excel ==========
            async function exportExcel() {
                if (!window.lastResults) {
                    alert('Please run the calculation first.');
                    return;
                }
                showLoading('Creating Professional Excel Report...', 'Creating sheets and formatting');
                try {
                    const data = window.lastResults;
                    const currency = data.currency;
                    const company = data.company;

                    const workbook = new ExcelJS.Workbook();
                    workbook.creator = 'FAROUK GRUP';
                    workbook.created = new Date();

                    const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050';
                    const AR = 'FFF5F0E8', W = 'FFFFFFFF', DT = 'FF1A1A1A';
                    const PB = 'FFD4EDDA', NB = 'FFF8D7DA', PT = 'FF155724', NT = 'FF721C24', GB = 'FFFFF3CD';

                    function hs(bg = HB, tc = GL) {
                        return {
                            font: { name: 'Arial', bold: true, size: 11, color: { argb: tc } },
                            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } },
                            alignment: { horizontal: 'center', vertical: 'middle', wrapText: true, readingOrder: 'ltr' },
                            border: {
                                top: { style: 'thin', color: { argb: G } },
                                bottom: { style: 'thin', color: { argb: G } },
                                left: { style: 'thin', color: { argb: G } },
                                right: { style: 'thin', color: { argb: G } }
                            }
                        };
                    }

                    function cs(bg = W, tc = DT, bold = false, h = 'center') {
                        return {
                            font: { name: 'Arial', bold: bold, size: 10, color: { argb: tc } },
                            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } },
                            alignment: { horizontal: h, vertical: 'middle', wrapText: true, readingOrder: 'ltr' },
                            border: {
                                top: { style: 'hair', color: { argb: 'FFCCCCCC' } },
                                bottom: { style: 'hair', color: { argb: 'FFCCCCCC' } },
                                left: { style: 'hair', color: { argb: 'FFCCCCCC' } },
                                right: { style: 'hair', color: { argb: 'FFCCCCCC' } }
                            }
                        };
                    }

                    function mh(ws, fc, tc, r, text, bg = HB, tc2 = GL, fs = 12) {
                        ws.mergeCells(r, fc, r, tc);
                        const c = ws.getCell(r, fc);
                        c.value = text;
                        c.font = { name: 'Arial', bold: true, size: fs, color: { argb: tc2 } };
                        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
                        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true, readingOrder: 'ltr' };
                        c.border = {
                            top: { style: 'medium', color: { argb: G } },
                            bottom: { style: 'medium', color: { argb: G } },
                            left: { style: 'medium', color: { argb: G } },
                            right: { style: 'medium', color: { argb: G } }
                        };
                    }

                    // 1. Cover Sheet
                    const cv = workbook.addWorksheet('Report Cover', { views: [{ rightToLeft: false, showGridLines: false }] });
                    [8, 45, 35, 8].forEach((w, i) => cv.getColumn(i + 1).width = w);
                    for (let r = 1; r <= 30; r++) cv.getRow(r).height = 22;
                    cv.getRow(2).height = 80;
                    cv.getRow(4).height = 60;
                    cv.mergeCells(2, 1, 2, 4);
                    const bc = cv.getCell(2, 1);
                    bc.value = 'FAROUK GRUP for Consulting & Business\nFAROUK GRUP';
                    bc.font = { name: 'Arial', bold: true, size: 26, color: { argb: GL } };
                    bc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DB } };
                    bc.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true, readingOrder: 'ltr' };
                    bc.border = { bottom: { style: 'thick', color: { argb: G } } };
                    mh(cv, 1, 4, 4, `CAC & CLV Analysis Report\n${company}`, DB, GL, 18);

                    const inf = [
                        ['📋 Entity', company],
                        ['📅 Date', new Date().toLocaleDateString('en-US')],
                        ['💰 Currency', currency],
                        ['📊 CAC', `${currency}${data.cac.toFixed(2)}`],
                        ['📈 CLV', `${currency}${data.clv.toFixed(2)}`],
                        ['🔢 Ratio', `${data.ratio.toFixed(2)}x`],
                        ['🏷️ Rating', data.status]
                    ];
                    let ir = 6;
                    inf.forEach(([l, v], idx) => {
                        cv.mergeCells(ir, 1, ir, 2);
                        cv.mergeCells(ir, 3, ir, 4);
                        const lc = cv.getCell(ir, 1), vc = cv.getCell(ir, 3);
                        lc.value = l; vc.value = v;
                        const bg = idx % 2 === 0 ? AR : 'FFFEFCF6';
                        lc.font = { name: 'Arial', bold: true, size: 11, color: { argb: '00695C' } };
                        lc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
                        lc.alignment = { horizontal: 'right', vertical: 'middle', readingOrder: 'ltr' };
                        vc.font = { name: 'Arial', size: 11, color: { argb: DT } };
                        vc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
                        vc.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'ltr' };
                        cv.getRow(ir).height = 28;
                        ir++;
                    });

                    // 2. Details
                    const ws = workbook.addWorksheet('CAC_CLV Details', { views: [{ rightToLeft: false, showGridLines: false }] });
                    ws.getColumn(1).width = 5;
                    ws.getColumn(2).width = 32;
                    ws.getColumn(3).width = 22;
                    ws.getColumn(4).width = 45;

                    mh(ws, 1, 4, 1, `CAC & CLV Report - ${company}`, DB, GL, 16);
                    ws.getRow(1).height = 40;
                    mh(ws, 1, 4, 2, `Currency: ${currency}  |  Report Date: ${new Date().toLocaleDateString('en-US')}`, HB, GL, 11);
                    ws.getRow(2).height = 28;

                    const headers = ['#', 'Indicator', 'Value', 'Explanation'];
                    headers.forEach((h, idx) => {
                        const cell = ws.getCell(3, idx + 1);
                        cell.value = h;
                        Object.assign(cell, hs(SB, W));
                    });
                    ws.getRow(3).height = 28;

                    const rows = [
                        ['1', 'Total Marketing Spend', `${currency}${data.marketingSpend}`, 'Amount spent on ads and promotions monthly'],
                        ['2', 'New Customers', data.newCustomers, 'Number of customers acquired during the month'],
                        ['3', 'Acquisition Cost (CAC)', `${currency}${data.cac.toFixed(2)}`, 'Spend ÷ New Customers'],
                        ['4', 'Average Order Value', `${currency}${data.avgOrder}`, 'Average amount spent per visit'],
                        ['5', 'Annual Visits', data.visitsPerYear, 'Number of purchases per year'],
                        ['6', 'Lifespan (Years)', data.lifespan, 'Average duration the customer stays'],
                        ['7', 'Profit Margin', `${data.profitMargin}%`, 'Net profit percentage from each sale'],
                        ['8', 'Lifetime Value (CLV)', `${currency}${data.clv.toFixed(2)}`, 'Revenue × Profit Margin over customer lifetime'],
                        ['9', 'CLV / CAC Ratio', `${data.ratio.toFixed(2)}x`, 'Viability indicator (preferably ≥ 3)'],
                        ['10', 'Rating', data.status, data.recommendation]
                    ];

                    rows.forEach((r, i) => {
                        const rowNum = i + 4;
                        const bg = i % 2 === 0 ? AR : 'FFFEFCF6';
                        const row = ws.getRow(rowNum);
                        row.height = 26;
                        r.forEach((val, colIdx) => {
                            const cell = ws.getCell(rowNum, colIdx + 1);
                            cell.value = val;
                            Object.assign(cell, cs(bg, DT, false, colIdx === 0 || colIdx === 2 ? 'center' : 'left'));
                            if (colIdx === 3) cell.alignment.horizontal = 'left';
                        });
                        if (r[0] === '10') {
                            const statusCell = ws.getCell(rowNum, 3);
                            if (data.status === 'Excellent') statusCell.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF28A745' } };
                            else if (data.status === 'Very Good') statusCell.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF17A2B8' } };
                            else if (data.status === 'Moderate') statusCell.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FFD39C0B' } };
                            else statusCell.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FFDC3545' } };
                        }
                    });

                    const footerRow = rows.length + 5;
                    ws.mergeCells(footerRow, 1, footerRow, 4);
                    const footerCell = ws.getCell(footerRow, 1);
                    footerCell.value = 'This report was created by FAROUK GRUP for Consulting & Business';
                    footerCell.font = { name: 'Arial', size: 9, color: { argb: 'FF888888' } };
                    footerCell.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'ltr' };
                    ws.getRow(footerRow).height = 28;

                    // 3. Recommendations
                    const recSheet = workbook.addWorksheet('Recommendations', { views: [{ rightToLeft: false, showGridLines: false }] });
                    recSheet.getColumn(1).width = 5;
                    recSheet.getColumn(2).width = 70;
                    recSheet.getColumn(3).width = 5;
                    mh(recSheet, 1, 3, 1, '📋 Strategic Recommendation', DB, GL, 14);
                    recSheet.getRow(1).height = 40;
                    recSheet.mergeCells(3, 2, 3, 2);
                    const recCell = recSheet.getCell(3, 2);
                    recCell.value = data.recommendation;
                    recCell.font = { name: 'Arial', size: 11, color: { argb: DT } };
                    recCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEFCF6' } };
                    recCell.alignment = { horizontal: 'left', vertical: 'top', wrapText: true, readingOrder: 'ltr' };
                    recCell.border = {
                        top: { style: 'thin', color: { argb: G } },
                        bottom: { style: 'thin', color: { argb: G } },
                        left: { style: 'thin', color: { argb: G } },
                        right: { style: 'thin', color: { argb: G } }
                    };
                    recSheet.getRow(3).height = 120;

                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    saveAs(blob, `CAC_CLV_${company}_${new Date().toISOString().slice(0,10)}.xlsx`);
                } catch (err) {
                    console.error(err);
                    alert('Error creating Excel file: ' + err.message);
                } finally {
                    hideLoading();
                }
            }

            // ========== Export to Word ==========
            async function exportWord() {
                if (!window.lastResults) {
                    alert('Please run the calculation first.');
                    return;
                }
                showLoading('Creating Professional Word Report...', 'Gathering data and charts');
                try {
                    const data = window.lastResults;
                    const currency = data.currency;
                    const company = data.company;

                    let chartImgBase64 = '';
                    const chartEl = document.querySelector('.chart-container');
                    if (chartEl) {
                        const origBg = chartEl.style.backgroundColor;
                        chartEl.style.backgroundColor = '#ffffff';
                        const img = await html2canvas(chartEl, { scale: 2, backgroundColor: '#ffffff' });
                        chartEl.style.backgroundColor = origBg;
                        chartImgBase64 = img.toDataURL('image/png');
                    }

                    const now = new Date();
                    const dateStr = now.toLocaleDateString('en-US');

                    const fullHtml = `<!DOCTYPE html>
                    <html dir="ltr">
                    <head><meta charset="utf-8"><title>CAC & CLV Report - FAROUK GRUP</title>
                    <style>
                        body{font-family:'Tajawal',Arial,sans-serif;margin:2rem;background:#fff;color:#333;direction:ltr;}
                        .cover{text-align:center;border-bottom:4px solid #b8860b;margin-bottom:30px;padding-bottom:20px;}
                        .cover h1{font-size:28px;color:#b8860b;margin:0;}
                        .cover h2{font-size:20px;color:#b48554;margin:8px 0;}
                        table{width:100%;border-collapse:collapse;margin:20px 0;}
                        th,td{border:1px solid #b8860b;padding:10px;text-align:center;}
                        th{background:#fefcf6;color:#b8860b;font-weight:bold;}
                        .highlight{font-weight:bold;color:#b8860b;}
                        .rec{background:#fefcf6;padding:15px;border-radius:10px;border-left:4px solid #b8860b;margin:20px 0;}
                        .chart-img{max-width:100%;height:auto;border:1px solid #b8860b;border-radius:10px;margin:20px 0;}
                        .footer{text-align:center;margin-top:40px;color:#888;border-top:1px dashed #b8860b;padding-top:10px;}
                        .kpi-table td{padding:15px;vertical-align:top;}
                        .kpi-value{font-size:1.5rem;font-weight:900;color:#b8860b;}
                    </style></head>
                    <body>
                        <div class="cover">
                            <h1>FAROUK GRUP for Consulting & Business</h1>
                            <h2>CAC & CLV Analysis Report</h2>
                            <p>Entity: ${company} | Date: ${dateStr}</p>
                            <p>Currency: ${currency}</p>
                        </div>

                        <h2 style="color:#b8860b;">📊 Summary Indicators</h2>
                        <table class="kpi-table">
                            <tr>
                                <td>
                                    <div>Acquisition Cost (CAC)</div>
                                    <div class="kpi-value">${currency}${data.cac.toFixed(2)}</div>
                                </td>
                                <td>
                                    <div>Lifetime Value (CLV)</div>
                                    <div class="kpi-value">${currency}${data.clv.toFixed(2)}</div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div>CLV / CAC Ratio</div>
                                    <div class="kpi-value">${data.ratio.toFixed(2)}x</div>
                                </td>
                                <td>
                                    <div>Rating</div>
                                    <div class="kpi-value">${data.status}</div>
                                </td>
                            </tr>
                        </table>

                        <h2 style="color:#b8860b;">📈 Chart</h2>
                        <div style="text-align:center;">
                            ${chartImgBase64 ? `<img src="${chartImgBase64}" class="chart-img" />` : '<p>Chart not available</p>'}
                        </div>

                        <h2 style="color:#b8860b;">📄 Calculation Details</h2>
                        <table>
                            <thead><tr><th>Indicator</th><th>Value</th><th>Explanation</th></tr></thead>
                            <tbody>
                                <tr><td>Total Marketing Spend</td><td>${currency}${data.marketingSpend}</td><td>Amount spent on ads and promotions monthly</td></tr>
                                <tr><td>New Customers</td><td>${data.newCustomers}</td><td>Number of customers acquired during the month</td></tr>
                                <tr><td class="highlight">Acquisition Cost (CAC)</td><td class="highlight">${currency}${data.cac.toFixed(2)}</td><td>Spend ÷ New Customers</td></tr>
                                <tr><td>Average Order Value</td><td>${currency}${data.avgOrder}</td><td>Average amount spent per visit</td></tr>
                                <tr><td>Annual Visits</td><td>${data.visitsPerYear}</td><td>Number of purchases per year</td></tr>
                                <tr><td>Lifespan (Years)</td><td>${data.lifespan}</td><td>Average duration the customer stays</td></tr>
                                <tr><td>Profit Margin</td><td>${data.profitMargin}%</td><td>Net profit percentage from each sale</td></tr>
                                <tr><td class="highlight">Lifetime Value (CLV)</td><td class="highlight">${currency}${data.clv.toFixed(2)}</td><td>Revenue × Profit Margin over customer lifetime</td></tr>
                                <tr><td class="highlight">CLV / CAC Ratio</td><td class="highlight">${data.ratio.toFixed(2)}x</td><td>Viability indicator (preferably ≥ 3)</td></tr>
                            </tbody>
                        </table>

                        <div class="rec">
                            <h3 style="color:#b8860b;margin-top:0;">📌 Strategic Recommendation</h3>
                            <p>${data.recommendation}</p>
                        </div>

                        <div class="footer">Created by FAROUK GRUP for Consulting & Business © ${now.getFullYear()}</div>
                    </body></html>`;

                    const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `CAC_CLV_${company}_${now.toISOString().slice(0,10)}.doc`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                } catch (error) {
                    console.error(error);
                    alert('Error creating Word report');
                } finally {
                    hideLoading();
                }
            }

            // ===== Attach event listeners =====
            document.getElementById('calculateBtn').addEventListener('click', calculateCACCLV);
            document.getElementById('exportWordBtn').addEventListener('click', exportWord);
            document.getElementById('exportExcelBtn').addEventListener('click', exportExcel);

            document.addEventListener('touchmove', function(e) {
                if (e.target.closest('.table-container') || e.target.closest('.modal')) return;
            }, { passive: true });

        })();
    