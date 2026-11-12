
        (function() {
            'use strict';

            // ===== آلة حاسبة =====
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
                    } catch (e) { calcDisplay.value = T('s1'); currentCalcInput = ''; }
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
            let chartInstance = null;
            window.lastResults = null;

            // ===== الحساب الرئيسي =====
            async function calculateCACCLV() {
                const currency = document.getElementById('currencySelect').value;
                const company = document.getElementById('companyName').value || T('s2');

                const marketingSpend = parseFloat(document.getElementById('marketingSpend').value) || 0;
                const newCustomers = parseInt(document.getElementById('newCustomers').value) || 1;
                const avgOrder = parseFloat(document.getElementById('avgOrderValue').value) || 0;
                const visitsPerYear = parseInt(document.getElementById('visitsPerYear').value) || 1;
                const lifespan = parseFloat(document.getElementById('customerLifespan').value) || 1;
                const profitMargin = parseFloat(document.getElementById('profitMargin').value) || 0;

                if (marketingSpend <= 0 || newCustomers <= 0 || avgOrder <= 0 || visitsPerYear <= 0 || lifespan <= 0 || profitMargin <= 0) {
                    alert(T('s3'));
                    return;
                }

                let R;
                try { R = await FG.calc('tool23', 'main', { marketingSpend, newCustomers, avgOrder, visitsPerYear, lifespan, profitMargin }); } catch (e) { FG.calcError(e); return; }
                const { cac, clv, ratio, status, badgeClass, recommendation } = R;

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
                        <div class="number">${data.currency}${data.cac.toFixed(2)}${T('s15')}${data.currency}${data.clv.toFixed(2)}${T('s16')}${data.ratio.toFixed(2)}${T('s17')}${data.badgeClass}">${data.status}${T('s18')}`;

                document.getElementById('recommendationBox').innerHTML = `${T('s19')}${data.recommendation}</p>
                `;

                document.getElementById('detailsTable').innerHTML = `${T('s20')}${data.currency}${data.marketingSpend}${T('s21')}${data.newCustomers}${T('s22')}${data.currency}${data.cac.toFixed(2)}${T('s23')}${data.currency}${data.avgOrder}${T('s24')}${data.visitsPerYear}${T('s25')}${data.lifespan}${T('s26')}${data.profitMargin}${T('s27')}${data.currency}${data.clv.toFixed(2)}${T('s28')}${data.ratio.toFixed(2)}${T('s29')}`;

                const ctx = document.getElementById('cacClvChart').getContext('2d');
                if (chartInstance) chartInstance.destroy();

                chartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: [T('s30'), T('s31')],
                        datasets: [{
                            label: T('s32'),
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

            // ========== تصدير Excel احترافي ==========
            async function exportExcel() {
                if (!window.lastResults) {
                    alert(T('s33'));
                    return;
                }
                showLoading(T('s34'), T('s35'));
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
                            alignment: { horizontal: 'center', vertical: 'middle', wrapText: true, readingOrder: FG.dir() },
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
                            alignment: { horizontal: h, vertical: 'middle', wrapText: true, readingOrder: FG.dir() },
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
                        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true, readingOrder: FG.dir() };
                        c.border = {
                            top: { style: 'medium', color: { argb: G } },
                            bottom: { style: 'medium', color: { argb: G } },
                            left: { style: 'medium', color: { argb: G } },
                            right: { style: 'medium', color: { argb: G } }
                        };
                    }

                    // 1. غلاف التقرير
                    const cv = workbook.addWorksheet(T('s36'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
                    [8, 45, 35, 8].forEach((w, i) => cv.getColumn(i + 1).width = w);
                    for (let r = 1; r <= 30; r++) cv.getRow(r).height = 22;
                    cv.getRow(2).height = 80;
                    cv.getRow(4).height = 60;
                    cv.mergeCells(2, 1, 2, 4);
                    const bc = cv.getCell(2, 1);
                    bc.value = T('s37');
                    bc.font = { name: 'Arial', bold: true, size: 26, color: { argb: GL } };
                    bc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DB } };
                    bc.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true, readingOrder: FG.dir() };
                    bc.border = { bottom: { style: 'thick', color: { argb: G } } };
                    mh(cv, 1, 4, 4, `${T('s38')}${company}`, DB, GL, 18);

                    const inf = [
                        [T('s39'), company],
                        [T('s40'), new Date().toLocaleDateString(FG.locale())],
                        [T('s41'), currency],
                        ['📊 CAC', `${currency}${data.cac.toFixed(2)}`],
                        ['📈 CLV', `${currency}${data.clv.toFixed(2)}`],
                        [T('s42'), `${data.ratio.toFixed(2)}x`],
                        [T('s43'), data.status]
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
                        lc.alignment = { horizontal: 'right', vertical: 'middle', readingOrder: FG.dir() };
                        vc.font = { name: 'Arial', size: 11, color: { argb: DT } };
                        vc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
                        vc.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: FG.dir() };
                        cv.getRow(ir).height = 28;
                        ir++;
                    });

                    // 2. التفاصيل
                    const ws = workbook.addWorksheet(T('s44'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
                    ws.getColumn(1).width = 5;
                    ws.getColumn(2).width = 32;
                    ws.getColumn(3).width = 22;
                    ws.getColumn(4).width = 45;

                    mh(ws, 1, 4, 1, `${T('s45')}${company}`, DB, GL, 16);
                    ws.getRow(1).height = 40;
                    mh(ws, 1, 4, 2, `${T('s46')}${currency}${T('s47')}${new Date().toLocaleDateString(FG.locale())}`, HB, GL, 11);
                    ws.getRow(2).height = 28;

                    const headers = ['#', T('s48'), T('s49'), T('s50')];
                    headers.forEach((h, idx) => {
                        const cell = ws.getCell(3, idx + 1);
                        cell.value = h;
                        Object.assign(cell, hs(SB, W));
                    });
                    ws.getRow(3).height = 28;

                    const rows = [
                        ['1', T('s51'), `${currency}${data.marketingSpend}`, T('s52')],
                        ['2', T('s53'), data.newCustomers, T('s54')],
                        ['3', T('s30'), `${currency}${data.cac.toFixed(2)}`, T('s55')],
                        ['4', T('s56'), `${currency}${data.avgOrder}`, T('s57')],
                        ['5', T('s58'), data.visitsPerYear, T('s59')],
                        ['6', T('s60'), data.lifespan, T('s61')],
                        ['7', T('s62'), `${data.profitMargin}%`, T('s63')],
                        ['8', T('s31'), `${currency}${data.clv.toFixed(2)}`, T('s64')],
                        ['9', T('s65'), `${data.ratio.toFixed(2)}x`, T('s66')],
                        ['10', T('s67'), data.status, data.recommendation]
                    ];

                    rows.forEach((r, i) => {
                        const rowNum = i + 4;
                        const bg = i % 2 === 0 ? AR : 'FFFEFCF6';
                        const row = ws.getRow(rowNum);
                        row.height = 26;
                        r.forEach((val, colIdx) => {
                            const cell = ws.getCell(rowNum, colIdx + 1);
                            cell.value = val;
                            Object.assign(cell, cs(bg, DT, false, colIdx === 0 || colIdx === 2 ? 'center' : FG.start()));
                            if (colIdx === 3) cell.alignment.horizontal = FG.start();
                        });
                        if (r[0] === '10') {
                            const statusCell = ws.getCell(rowNum, 3);
                            if (data.status === T('s4')) statusCell.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF28A745' } };
                            else if (data.status === T('s7')) statusCell.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF17A2B8' } };
                            else if (data.status === T('s9')) statusCell.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FFD39C0B' } };
                            else statusCell.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FFDC3545' } };
                        }
                    });

                    // تذييل
                    const footerRow = rows.length + 5;
                    ws.mergeCells(footerRow, 1, footerRow, 4);
                    const footerCell = ws.getCell(footerRow, 1);
                    footerCell.value = T('s68');
                    footerCell.font = { name: 'Arial', size: 9, color: { argb: 'FF888888' } };
                    footerCell.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: FG.dir() };
                    ws.getRow(footerRow).height = 28;

                    // 3. التوصيات
                    const recSheet = workbook.addWorksheet(T('s69'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
                    recSheet.getColumn(1).width = 5;
                    recSheet.getColumn(2).width = 70;
                    recSheet.getColumn(3).width = 5;
                    mh(recSheet, 1, 3, 1, T('s70'), DB, GL, 14);
                    recSheet.getRow(1).height = 40;
                    recSheet.mergeCells(3, 2, 3, 2);
                    const recCell = recSheet.getCell(3, 2);
                    recCell.value = data.recommendation;
                    recCell.font = { name: 'Arial', size: 11, color: { argb: DT } };
                    recCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEFCF6' } };
                    recCell.alignment = { horizontal: FG.start(), vertical: 'top', wrapText: true, readingOrder: FG.dir() };
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
                    alert(T('s71') + err.message);
                } finally {
                    hideLoading();
                }
            }

            // ========== تصدير Word ==========
            async function exportWord() {
                if (!window.lastResults) {
                    alert(T('s33'));
                    return;
                }
                showLoading(T('s72'), T('s73'));
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
                    const dateStr = now.toLocaleDateString(FG.locale());

                    const fullHtml = `${T('s75')}${company}${T('s76')}${dateStr}${T('s77')}${currency}${T('s78')}${currency}${data.cac.toFixed(2)}${T('s79')}${currency}${data.clv.toFixed(2)}${T('s80')}${data.ratio.toFixed(2)}${T('s81')}${data.status}${T('s82')}${chartImgBase64 ? `<img src="${chartImgBase64}" class="chart-img" />` : T('s74')}${T('s83')}${currency}${data.marketingSpend}${T('s84')}${data.newCustomers}${T('s85')}${currency}${data.cac.toFixed(2)}${T('s86')}${currency}${data.avgOrder}${T('s87')}${data.visitsPerYear}${T('s88')}${data.lifespan}${T('s89')}${data.profitMargin}${T('s90')}${currency}${data.clv.toFixed(2)}${T('s91')}${data.ratio.toFixed(2)}${T('s92')}${data.recommendation}${T('s93')}${now.getFullYear()}</div>
                    </body></html>`;

                    const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `CAC_CLV_${company}_${now.toISOString().slice(0,10)}.doc`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                } catch (error) {
                    console.error(error);
                    alert(T('s94'));
                } finally {
                    hideLoading();
                }
            }

            // ===== ربط الأزرار =====
            document.getElementById('calculateBtn').addEventListener('click', calculateCACCLV);
            document.getElementById('exportWordBtn').addEventListener('click', exportWord);
            document.getElementById('exportExcelBtn').addEventListener('click', exportExcel);

            document.addEventListener('touchmove', function(e) {
                if (e.target.closest('.table-container') || e.target.closest('.modal')) return;
            }, { passive: true });

        })();
    