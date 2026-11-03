
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
                    } catch (e) { calcDisplay.value = 'خطأ'; currentCalcInput = ''; }
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
            function calculateCACCLV() {
                const currency = document.getElementById('currencySelect').value;
                const company = document.getElementById('companyName').value || 'الجهة';

                const marketingSpend = parseFloat(document.getElementById('marketingSpend').value) || 0;
                const newCustomers = parseInt(document.getElementById('newCustomers').value) || 1;
                const avgOrder = parseFloat(document.getElementById('avgOrderValue').value) || 0;
                const visitsPerYear = parseInt(document.getElementById('visitsPerYear').value) || 1;
                const lifespan = parseFloat(document.getElementById('customerLifespan').value) || 1;
                const profitMargin = parseFloat(document.getElementById('profitMargin').value) || 0;

                if (marketingSpend <= 0 || newCustomers <= 0 || avgOrder <= 0 || visitsPerYear <= 0 || lifespan <= 0 || profitMargin <= 0) {
                    alert('الرجاء إدخال قيم موجبة لجميع الحقول.');
                    return;
                }

                const cac = marketingSpend / newCustomers;
                const annualRevenuePerCustomer = avgOrder * visitsPerYear;
                const lifetimeRevenue = annualRevenuePerCustomer * lifespan;
                const clv = lifetimeRevenue * (profitMargin / 100);
                const ratio = clv / cac;

                let status, badgeClass, recommendation;
                if (ratio >= 4) {
                    status = 'ممتاز';
                    badgeClass = 'badge-excellent';
                    recommendation = `✅ نسبة ${ratio.toFixed(2)} تعني أن كل دولار تنفقه على التسويق يعود عليك بأكثر من 4 دولارات أرباح. استراتيجيتك التسويقية ممتازة ومستدامة. استمر في الاستثمار وابحث عن فرص للتوسع.`;
                } else if (ratio >= 3) {
                    status = 'جيد جداً';
                    badgeClass = 'badge-good';
                    recommendation = `✅ نسبة ${ratio.toFixed(2)} تعني أن استثمارك التسويقي مجدٍ. يمكنك تحسين الأداء بزيادة متوسط قيمة الطلب أو تحسين الاحتفاظ بالعملاء.`;
                } else if (ratio >= 2) {
                    status = 'متوسط';
                    badgeClass = 'badge-fair';
                    recommendation = `🟡 نسبة ${ratio.toFixed(2)} تشير إلى أن العائد ليس كافياً. راجع قنوات التسويق، أو حاول خفض التكاليف، أو زيادة متوسط العمر الافتراضي للعميل.`;
                } else {
                    status = 'ضعيف';
                    badgeClass = 'badge-poor';
                    recommendation = `🔴 نسبة ${ratio.toFixed(2)} تعني أنك تخسر أموالك في التسويق. أنت بحاجة إلى إعادة هيكلة جذرية: خفض تكلفة الاستحواذ، رفع الأسعار، أو تحسين ولاء العملاء.`;
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
                        <div class="label">تكلفة الاستحواذ (CAC)</div>
                    </div>
                    <div class="summary-card">
                        <div class="number">${data.currency}${data.clv.toFixed(2)}</div>
                        <div class="label">القيمة الدائمة (CLV)</div>
                    </div>
                    <div class="summary-card">
                        <div class="number">${data.ratio.toFixed(2)}x</div>
                        <div class="label">نسبة CLV / CAC</div>
                    </div>
                    <div class="summary-card">
                        <div class="number"><span class="badge ${data.badgeClass}">${data.status}</span></div>
                        <div class="label">التصنيف</div>
                    </div>
                `;

                document.getElementById('recommendationBox').innerHTML = `
                    <h4><i class="fas fa-lightbulb" style="color:#cfa776;"></i> التوصية الاستراتيجية</h4>
                    <p>${data.recommendation}</p>
                `;

                document.getElementById('detailsTable').innerHTML = `
                    <table>
                        <thead><tr><th>المؤشر</th><th>القيمة</th><th>الشرح</th></tr></thead>
                        <tbody>
                            <tr><td>إجمالي مصاريف التسويق</td><td>${data.currency}${data.marketingSpend}</td><td>المبلغ المنفق على الإعلانات والعروض شهرياً</td></tr>
                            <tr><td>عدد العملاء الجدد</td><td>${data.newCustomers}</td><td>عدد العملاء الذين تم جلبهم خلال الشهر</td></tr>
                            <tr><td>تكلفة الاستحواذ (CAC)</td><td>${data.currency}${data.cac.toFixed(2)}</td><td>المصاريف ÷ عدد العملاء الجدد</td></tr>
                            <tr><td>متوسط قيمة الطلب</td><td>${data.currency}${data.avgOrder}</td><td>متوسط ما ينفقه العميل في كل زيارة</td></tr>
                            <tr><td>الزيارات السنوية</td><td>${data.visitsPerYear}</td><td>عدد مرات الشراء في السنة</td></tr>
                            <tr><td>سنوات البقاء</td><td>${data.lifespan}</td><td>متوسط المدة التي يبقى فيها العميل</td></tr>
                            <tr><td>هامش الربح</td><td>${data.profitMargin}%</td><td>نسبة الربح الصافي من كل عملية بيع</td></tr>
                            <tr><td><strong>القيمة الدائمة (CLV)</strong></td><td><strong>${data.currency}${data.clv.toFixed(2)}</strong></td><td>الإيرادات × هامش الربح طوال فترة العميل</td></tr>
                            <tr><td><strong>نسبة CLV / CAC</strong></td><td><strong>${data.ratio.toFixed(2)}x</strong></td><td>مؤشر الجدوى (يفضل أن تكون ≥ 3)</td></tr>
                        </tbody>
                    </table>
                `;

                const ctx = document.getElementById('cacClvChart').getContext('2d');
                if (chartInstance) chartInstance.destroy();

                chartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['تكلفة الاستحواذ (CAC)', 'القيمة الدائمة (CLV)'],
                        datasets: [{
                            label: 'القيمة بالعملة',
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
                    alert('الرجاء إجراء الحساب أولاً.');
                    return;
                }
                showLoading('جاري إنشاء تقرير Excel الاحترافي...', 'إنشاء الأوراق والتنسيق');
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
                            alignment: { horizontal: 'center', vertical: 'middle', wrapText: true, readingOrder: 'rtl' },
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
                            alignment: { horizontal: h, vertical: 'middle', wrapText: true, readingOrder: 'rtl' },
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
                        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true, readingOrder: 'rtl' };
                        c.border = {
                            top: { style: 'medium', color: { argb: G } },
                            bottom: { style: 'medium', color: { argb: G } },
                            left: { style: 'medium', color: { argb: G } },
                            right: { style: 'medium', color: { argb: G } }
                        };
                    }

                    // 1. غلاف التقرير
                    const cv = workbook.addWorksheet('غلاف التقرير', { views: [{ rightToLeft: true, showGridLines: false }] });
                    [8, 45, 35, 8].forEach((w, i) => cv.getColumn(i + 1).width = w);
                    for (let r = 1; r <= 30; r++) cv.getRow(r).height = 22;
                    cv.getRow(2).height = 80;
                    cv.getRow(4).height = 60;
                    cv.mergeCells(2, 1, 2, 4);
                    const bc = cv.getCell(2, 1);
                    bc.value = 'مجموعة فاروق للاستشارات والأعمال\nFAROUK GRUP';
                    bc.font = { name: 'Arial', bold: true, size: 26, color: { argb: GL } };
                    bc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DB } };
                    bc.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true, readingOrder: 'rtl' };
                    bc.border = { bottom: { style: 'thick', color: { argb: G } } };
                    mh(cv, 1, 4, 4, `تقرير تحليل CAC و CLV\n${company}`, DB, GL, 18);

                    const inf = [
                        ['📋 الجهة', company],
                        ['📅 التاريخ', new Date().toLocaleDateString('ar-EG')],
                        ['💰 العملة', currency],
                        ['📊 CAC', `${currency}${data.cac.toFixed(2)}`],
                        ['📈 CLV', `${currency}${data.clv.toFixed(2)}`],
                        ['🔢 النسبة', `${data.ratio.toFixed(2)}x`],
                        ['🏷️ التصنيف', data.status]
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
                        lc.alignment = { horizontal: 'right', vertical: 'middle', readingOrder: 'rtl' };
                        vc.font = { name: 'Arial', size: 11, color: { argb: DT } };
                        vc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
                        vc.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rtl' };
                        cv.getRow(ir).height = 28;
                        ir++;
                    });

                    // 2. التفاصيل
                    const ws = workbook.addWorksheet('تفاصيل CAC_CLV', { views: [{ rightToLeft: true, showGridLines: false }] });
                    ws.getColumn(1).width = 5;
                    ws.getColumn(2).width = 32;
                    ws.getColumn(3).width = 22;
                    ws.getColumn(4).width = 45;

                    mh(ws, 1, 4, 1, `تقرير CAC و CLV - ${company}`, DB, GL, 16);
                    ws.getRow(1).height = 40;
                    mh(ws, 1, 4, 2, `العملة: ${currency}  |  تاريخ التقرير: ${new Date().toLocaleDateString('ar-EG')}`, HB, GL, 11);
                    ws.getRow(2).height = 28;

                    const headers = ['#', 'المؤشر', 'القيمة', 'الشرح'];
                    headers.forEach((h, idx) => {
                        const cell = ws.getCell(3, idx + 1);
                        cell.value = h;
                        Object.assign(cell, hs(SB, W));
                    });
                    ws.getRow(3).height = 28;

                    const rows = [
                        ['1', 'إجمالي مصاريف التسويق', `${currency}${data.marketingSpend}`, 'المبلغ المنفق على الإعلانات والعروض شهرياً'],
                        ['2', 'عدد العملاء الجدد', data.newCustomers, 'عدد العملاء الذين تم جلبهم خلال الشهر'],
                        ['3', 'تكلفة الاستحواذ (CAC)', `${currency}${data.cac.toFixed(2)}`, 'المصاريف ÷ عدد العملاء الجدد'],
                        ['4', 'متوسط قيمة الطلب', `${currency}${data.avgOrder}`, 'متوسط ما ينفقه العميل في كل زيارة'],
                        ['5', 'الزيارات السنوية', data.visitsPerYear, 'عدد مرات الشراء في السنة'],
                        ['6', 'سنوات البقاء', data.lifespan, 'متوسط المدة التي يبقى فيها العميل'],
                        ['7', 'هامش الربح', `${data.profitMargin}%`, 'نسبة الربح الصافي من كل عملية بيع'],
                        ['8', 'القيمة الدائمة (CLV)', `${currency}${data.clv.toFixed(2)}`, 'الإيرادات × هامش الربح طوال فترة العميل'],
                        ['9', 'نسبة CLV / CAC', `${data.ratio.toFixed(2)}x`, 'مؤشر الجدوى (يفضل أن تكون ≥ 3)'],
                        ['10', 'التصنيف', data.status, data.recommendation]
                    ];

                    rows.forEach((r, i) => {
                        const rowNum = i + 4;
                        const bg = i % 2 === 0 ? AR : 'FFFEFCF6';
                        const row = ws.getRow(rowNum);
                        row.height = 26;
                        r.forEach((val, colIdx) => {
                            const cell = ws.getCell(rowNum, colIdx + 1);
                            cell.value = val;
                            Object.assign(cell, cs(bg, DT, false, colIdx === 0 || colIdx === 2 ? 'center' : 'right'));
                            if (colIdx === 3) cell.alignment.horizontal = 'right';
                        });
                        if (r[0] === '10') {
                            const statusCell = ws.getCell(rowNum, 3);
                            if (data.status === 'ممتاز') statusCell.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF28A745' } };
                            else if (data.status === 'جيد جداً') statusCell.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FF17A2B8' } };
                            else if (data.status === 'متوسط') statusCell.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FFD39C0B' } };
                            else statusCell.font = { name: 'Arial', bold: true, size: 10, color: { argb: 'FFDC3545' } };
                        }
                    });

                    // تذييل
                    const footerRow = rows.length + 5;
                    ws.mergeCells(footerRow, 1, footerRow, 4);
                    const footerCell = ws.getCell(footerRow, 1);
                    footerCell.value = 'تم إنشاء التقرير بواسطة مجموعة فاروق للاستشارات والأعمال';
                    footerCell.font = { name: 'Arial', size: 9, color: { argb: 'FF888888' } };
                    footerCell.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rtl' };
                    ws.getRow(footerRow).height = 28;

                    // 3. التوصيات
                    const recSheet = workbook.addWorksheet('التوصيات', { views: [{ rightToLeft: true, showGridLines: false }] });
                    recSheet.getColumn(1).width = 5;
                    recSheet.getColumn(2).width = 70;
                    recSheet.getColumn(3).width = 5;
                    mh(recSheet, 1, 3, 1, '📋 التوصية الاستراتيجية', DB, GL, 14);
                    recSheet.getRow(1).height = 40;
                    recSheet.mergeCells(3, 2, 3, 2);
                    const recCell = recSheet.getCell(3, 2);
                    recCell.value = data.recommendation;
                    recCell.font = { name: 'Arial', size: 11, color: { argb: DT } };
                    recCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEFCF6' } };
                    recCell.alignment = { horizontal: 'right', vertical: 'top', wrapText: true, readingOrder: 'rtl' };
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
                    alert('خطأ أثناء إنشاء ملف Excel: ' + err.message);
                } finally {
                    hideLoading();
                }
            }

            // ========== تصدير Word ==========
            async function exportWord() {
                if (!window.lastResults) {
                    alert('الرجاء إجراء الحساب أولاً.');
                    return;
                }
                showLoading('جاري إنشاء تقرير Word الاحترافي...', 'جمع البيانات والرسوم البيانية');
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
                    const dateStr = now.toLocaleDateString('ar-EG');

                    const fullHtml = `<!DOCTYPE html>
                    <html dir="rtl">
                    <head><meta charset="utf-8"><title>تقرير CAC و CLV - FAROUK GRUP</title>
                    <style>
                        body{font-family:'Tajawal',Arial,sans-serif;margin:2rem;background:#fff;color:#333;direction:rtl;}
                        .cover{text-align:center;border-bottom:4px solid #b8860b;margin-bottom:30px;padding-bottom:20px;}
                        .cover h1{font-size:28px;color:#b8860b;margin:0;}
                        .cover h2{font-size:20px;color:#b48554;margin:8px 0;}
                        table{width:100%;border-collapse:collapse;margin:20px 0;}
                        th,td{border:1px solid #b8860b;padding:10px;text-align:center;}
                        th{background:#fefcf6;color:#b8860b;font-weight:bold;}
                        .highlight{font-weight:bold;color:#b8860b;}
                        .rec{background:#fefcf6;padding:15px;border-radius:10px;border-right:4px solid #b8860b;margin:20px 0;}
                        .chart-img{max-width:100%;height:auto;border:1px solid #b8860b;border-radius:10px;margin:20px 0;}
                        .footer{text-align:center;margin-top:40px;color:#888;border-top:1px dashed #b8860b;padding-top:10px;}
                        .kpi-table td{padding:15px;vertical-align:top;}
                        .kpi-value{font-size:1.5rem;font-weight:900;color:#b8860b;}
                    </style></head>
                    <body>
                        <div class="cover">
                            <h1>مجموعة فاروق للاستشارات والأعمال</h1>
                            <h2>تقرير تحليل CAC و CLV</h2>
                            <p>الجهة: ${company} | التاريخ: ${dateStr}</p>
                            <p>العملة: ${currency}</p>
                        </div>

                        <h2 style="color:#b8860b;">📊 ملخص المؤشرات</h2>
                        <table class="kpi-table">
                            <tr>
                                <td>
                                    <div>تكلفة الاستحواذ (CAC)</div>
                                    <div class="kpi-value">${currency}${data.cac.toFixed(2)}</div>
                                </td>
                                <td>
                                    <div>القيمة الدائمة (CLV)</div>
                                    <div class="kpi-value">${currency}${data.clv.toFixed(2)}</div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <div>نسبة CLV / CAC</div>
                                    <div class="kpi-value">${data.ratio.toFixed(2)}x</div>
                                </td>
                                <td>
                                    <div>التصنيف</div>
                                    <div class="kpi-value">${data.status}</div>
                                </td>
                            </tr>
                        </table>

                        <h2 style="color:#b8860b;">📈 الرسم البياني</h2>
                        <div style="text-align:center;">
                            ${chartImgBase64 ? `<img src="${chartImgBase64}" class="chart-img" />` : '<p>لا يتوفر رسم بياني</p>'}
                        </div>

                        <h2 style="color:#b8860b;">📄 تفاصيل الحساب</h2>
                        <table>
                            <thead><tr><th>المؤشر</th><th>القيمة</th><th>الشرح</th></tr></thead>
                            <tbody>
                                <tr><td>إجمالي مصاريف التسويق</td><td>${currency}${data.marketingSpend}</td><td>المبلغ المنفق على الإعلانات والعروض شهرياً</td></tr>
                                <tr><td>عدد العملاء الجدد</td><td>${data.newCustomers}</td><td>عدد العملاء الذين تم جلبهم خلال الشهر</td></tr>
                                <tr><td class="highlight">تكلفة الاستحواذ (CAC)</td><td class="highlight">${currency}${data.cac.toFixed(2)}</td><td>المصاريف ÷ عدد العملاء الجدد</td></tr>
                                <tr><td>متوسط قيمة الطلب</td><td>${currency}${data.avgOrder}</td><td>متوسط ما ينفقه العميل في كل زيارة</td></tr>
                                <tr><td>الزيارات السنوية</td><td>${data.visitsPerYear}</td><td>عدد مرات الشراء في السنة</td></tr>
                                <tr><td>سنوات البقاء</td><td>${data.lifespan}</td><td>متوسط المدة التي يبقى فيها العميل</td></tr>
                                <tr><td>هامش الربح</td><td>${data.profitMargin}%</td><td>نسبة الربح الصافي من كل عملية بيع</td></tr>
                                <tr><td class="highlight">القيمة الدائمة (CLV)</td><td class="highlight">${currency}${data.clv.toFixed(2)}</td><td>الإيرادات × هامش الربح طوال فترة العميل</td></tr>
                                <tr><td class="highlight">نسبة CLV / CAC</td><td class="highlight">${data.ratio.toFixed(2)}x</td><td>مؤشر الجدوى (يفضل أن تكون ≥ 3)</td></tr>
                            </tbody>
                        </table>

                        <div class="rec">
                            <h3 style="color:#b8860b;margin-top:0;">📌 التوصية الاستراتيجية</h3>
                            <p>${data.recommendation}</p>
                        </div>

                        <div class="footer">تم الإنشاء بواسطة مجموعة فاروق للاستشارات والأعمال © ${now.getFullYear()}</div>
                    </body></html>`;

                    const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `CAC_CLV_${company}_${now.toISOString().slice(0,10)}.doc`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                } catch (error) {
                    console.error(error);
                    alert('خطأ في إنشاء تقرير Word');
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
    