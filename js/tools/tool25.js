
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
                    } catch (e) { calcDisplay.value = 'خطأ';
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
            function calculateCCC() {
                const currency = document.getElementById('currencySelect').value;
                const company = document.getElementById('companyName').value || 'الجهة';
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
                    alert('الرجاء إدخال قيم صحيحة: COGS > 0 وصافي المبيعات الائتمانية > 0.');
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

                let status = '',
                    statusClass = '',
                    recommendation = '';
                if (ccc <= 0) {
                    status = 'ممتاز (فجوة سلبية)';
                    statusClass = 'status-good';
                    recommendation = '✅ فجوة نقدية سلبية تعني أنك تحصل على النقد من العملاء قبل دفع الموردين – نموذج تمويل مثالي. استمر في تحسين شروط الدفع مع الموردين وزيادة سرعة التحصيل.';
                } else if (ccc <= 30) {
                    status = 'جيد (فجوة قصيرة)';
                    statusClass = 'status-good';
                    recommendation = '🟢 فجوة نقدية أقل من 30 يوم – إدارة نقدية جيدة. يمكنك تحسينها أكثر بتقليل أيام المخزون أو تسريع التحصيل.';
                } else if (ccc <= 60) {
                    status = 'متوسط (فجوة معتدلة)';
                    statusClass = 'status-warning';
                    recommendation = '🟡 فجوة نقدية بين 30 و 60 يوم – تحتاج إلى مراقبة دقيقة. راجع سياسات الائتمان والمخزون لتقليل الفجوة.';
                } else if (ccc <= 90) {
                    status = 'مرتفع (فجوة طويلة)';
                    statusClass = 'status-danger';
                    recommendation = '🔴 فجوة نقدية بين 60 و 90 يوم – خطر سيولة. ركز على تخفيض المخزون، تسريع التحصيل، أو التفاوض مع الموردين لتمديد فترة السداد.';
                } else {
                    status = 'حرج (فجوة طويلة جداً)';
                    statusClass = 'status-danger';
                    recommendation = '⛔ فجوة نقدية تتجاوز 90 يوم – خطر كبير على السيولة. تحتاج إلى إعادة هيكلة جذرية لإدارة رأس المال العامل.';
                }

                // تفاصيل الحساب
                document.getElementById('calculationDetails').innerHTML = `
                    <h4 style="color:#cfa776;">📐 المعادلات المستخدمة</h4>
                    <p><strong>متوسط المخزون</strong> = (${invStart.toLocaleString()} + ${invEnd.toLocaleString()}) / 2 = ${avgInventory.toFixed(0)}</p>
                    <p><strong>متوسط الحسابات المدينة</strong> = (${arStart.toLocaleString()} + ${arEnd.toLocaleString()}) / 2 = ${avgReceivables.toFixed(0)}</p>
                    <p><strong>متوسط الحسابات الدائنة</strong> = (${apStart.toLocaleString()} + ${apEnd.toLocaleString()}) / 2 = ${avgPayables.toFixed(0)}</p>
                    <p style="direction:ltr; text-align:left; font-family:monospace;">
                        DIO = (${avgInventory.toFixed(0)} ÷ ${cogs.toLocaleString()}) × ${daysFactor.toFixed(0)} = ${dio.toFixed(1)} يوم
                    </p>
                    <p style="direction:ltr; text-align:left; font-family:monospace;">
                        DSO = (${avgReceivables.toFixed(0)} ÷ ${creditSales.toLocaleString()}) × ${daysFactor.toFixed(0)} = ${dso.toFixed(1)} يوم
                    </p>
                    <p style="direction:ltr; text-align:left; font-family:monospace;">
                        DPO = (${avgPayables.toFixed(0)} ÷ ${cogs.toLocaleString()}) × ${daysFactor.toFixed(0)} = ${dpo.toFixed(1)} يوم
                    </p>
                    <p style="direction:ltr; text-align:left; font-family:monospace; font-size:1.2rem; font-weight:bold; color:#cfa776;">
                        CCC = ${dio.toFixed(1)} + ${dso.toFixed(1)} - ${dpo.toFixed(1)} = ${ccc.toFixed(1)} يوم
                    </p>
                    <p style="color:#aab7d4; font-size:0.85rem;">* تم احتساب الأيام بناءً على مدة الفترة (${periodMonths} شهراً = ${daysFactor.toFixed(0)} يوماً).</p>
                `;

                // التوصيات
                let recHtml = `<h4 style="color:#cfa776;">📌 التقييم والتوصيات</h4>`;
                recHtml +=
                    `<p><strong>التصنيف:</strong> <span class="status ${statusClass}" style="font-size:1rem; padding:0.3rem 1.2rem;">${status}</span></p>`;
                recHtml += `<p>${recommendation}</p>`;
                if (dio > 45) recHtml +=
                    `<p>🔹 <strong>ارتفاع DIO (أيام المخزون):</strong> يوصى بتحسين إدارة المخزون، تقليل الكميات الزائدة، أو تحسين معدل الدوران.</p>`;
                if (dso > 45) recHtml +=
                    `<p>🔹 <strong>ارتفاع DSO (أيام المبيعات):</strong> راجع سياسات الائتمان، حسّن عمليات التحصيل، أو قدم خصومات للدفع العاجل.</p>`;
                if (dpo < 30) recHtml +=
                    `<p>🔹 <strong>انخفاض DPO (أيام المدفوعات):</strong> حاول التفاوض مع الموردين لتمديد فترة السداد لتتماشى مع دورة التحصيل.</p>`;
                document.getElementById('recommendations').innerHTML = recHtml;

                // عرض النتائج
                document.getElementById('resultsSection').style.display = 'block';
                document.getElementById('initialMessage').style.display = 'none';

                document.getElementById('kpiCards').innerHTML = `
                    <div class="result-card"><i class="fas fa-boxes"></i><h4>أيام المخزون (DIO)</h4><div class="value">${dio.toFixed(1)}</div><div class="unit">يوم</div></div>
                    <div class="result-card"><i class="fas fa-users"></i><h4>أيام المبيعات (DSO)</h4><div class="value">${dso.toFixed(1)}</div><div class="unit">يوم</div></div>
                    <div class="result-card"><i class="fas fa-hand-holding-usd"></i><h4>أيام المدفوعات (DPO)</h4><div class="value">${dpo.toFixed(1)}</div><div class="unit">يوم</div></div>
                    <div class="result-card" style="border-color:${ccc <= 30 ? '#28a745' : ccc <= 60 ? '#ffc107' : '#dc3545'};"><i class="fas fa-money-bill-wave"></i><h4>الفجوة النقدية (CCC)</h4><div class="value" style="color:${ccc <= 30 ? '#4ade80' : ccc <= 60 ? '#fbbf24' : '#f87171'}">${ccc.toFixed(1)}</div><div class="unit">يوم</div><div><span class="status ${statusClass}">${status}</span></div></div>
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
                            label: 'الأيام',
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
                        labels: ['DIO (أيام المخزون)', 'DSO (أيام المبيعات)', 'DPO (أيام المدفوعات)'],
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
                    outputs: { dio, dso, dpo, ccc, status, statusClass, recommendation }
                };
                currentInputs = { invStart, invEnd, arStart, arEnd, apStart, apEnd, cogs, creditSales,
                periodMonths };
            }

            // ========== تصدير Excel ==========
            async function exportToFullExcel() {
                if (!currentResults) {
                    alert('الرجاء إجراء التحليل أولاً.');
                    return;
                }
                showLoading('جاري إنشاء تقرير Excel الاحترافي...', 'إنشاء الأوراق والرسوم البيانية');
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
                                vertical: 'middle', wrapText: true, readingOrder: 'rtl' }, border: { top: {
                                    style: 'thin', color: { argb: G } }, bottom: { style: 'thin',
                                    color: { argb: G } }, left: { style: 'thin', color: { argb: G } },
                                right: { style: 'thin', color: { argb: G } } } }; }

                    function cs(bg = W, tc = DT, b = false, h = 'center') { return { font: { name: 'Arial',
                                bold: b, size: 10, color: { argb: tc } }, fill: { type: 'pattern',
                                pattern: 'solid', fgColor: { argb: bg } }, alignment: { horizontal: h,
                                vertical: 'middle', wrapText: true, readingOrder: 'rtl' }, border: { top: {
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
                            wrapText: true, readingOrder: 'rtl' }; c.border = { top: { style: 'medium',
                                color: { argb: G } }, bottom: { style: 'medium', color: { argb: G } },
                            left: { style: 'medium', color: { argb: G } }, right: { style: 'medium',
                                color: { argb: G } } }; }

                    // 1. غلاف التقرير
                    const cv = workbook.addWorksheet('غلاف التقرير', { views: [{ rightToLeft: true,
                            showGridLines: false }] });
                    [8, 45, 35, 8].forEach((w, i) => cv.getColumn(i + 1).width = w);
                    for (let r = 1; r <= 40; r++) cv.getRow(r).height = 22;
                    cv.getRow(2).height = 80;
                    cv.getRow(4).height = 60;
                    cv.mergeCells(2, 1, 2, 4);
                    const bc = cv.getCell(2, 1);
                    bc.value = 'مجموعة فاروق للاستشارات والأعمال\nFAROUK GRUP';
                    bc.font = { name: 'Arial', bold: true, size: 28, color: { argb: GL } };
                    bc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DB } };
                    bc.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true,
                    readingOrder: 'rtl' };
                    bc.border = { bottom: { style: 'thick', color: { argb: G } } };
                    mh(cv, 1, 4, 4, `تقرير تحليل الفجوة النقدية CCC\n${companyName}`, DB, GL, 18);
                    const inf = [
                        ['📋 الجهة', companyName],
                        ['📅 التاريخ', new Date().toLocaleDateString('ar-EG')],
                        ['💰 العملة', currency],
                        ['📊 CCC', `${D.outputs.ccc.toFixed(1)} يوم`],
                        ['📈 التصنيف', D.outputs.status]
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
                            alignment: { horizontal: 'right', vertical: 'middle', readingOrder: 'rtl' },
                            border: { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' },
                                right: { style: 'hair' } } });
                        ap(vc, { font: { name: 'Arial', size: 11, color: { argb: DT } },
                            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } },
                            alignment: { horizontal: 'center', vertical: 'middle', readingOrder: 'rtl' },
                            border: { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' },
                                right: { style: 'hair' } } });
                        cv.getRow(ir).height = 28;
                        ir++;
                    });

                    // 2. المدخلات
                    const inputsSheet = workbook.addWorksheet('المدخلات والافتراضات', { views: [{ rightToLeft: true,
                            showGridLines: false }] });
                    inputsSheet.getColumn(1).width = 5;
                    inputsSheet.getColumn(2).width = 38;
                    inputsSheet.getColumn(3).width = 22;
                    inputsSheet.getColumn(4).width = 22;
                    inputsSheet.getColumn(5).width = 5;
                    mh(inputsSheet, 1, 5, 1, '📋 جدول المدخلات والافتراضات الأساسية', DB, GL, 14);
                    inputsSheet.getRow(1).height = 40;
                    mh(inputsSheet, 2, 4, 2, 'البيانات الأساسية لدورة التحويل النقدي', SB, W, 11);
                    inputsSheet.getRow(2).height = 28;
                    const inputsData = [
                        ['مخزون أول المدة', D.inputs.invStart, `${currency} ${D.inputs.invStart.toFixed(0)}`],
                        ['مخزون آخر المدة', D.inputs.invEnd, `${currency} ${D.inputs.invEnd.toFixed(0)}`],
                        ['متوسط المخزون', D.inputs.avgInventory, `${currency} ${D.inputs.avgInventory.toFixed(0)}`],
                        ['حسابات مدينة أول المدة', D.inputs.arStart, `${currency} ${D.inputs.arStart.toFixed(0)}`],
                        ['حسابات مدينة آخر المدة', D.inputs.arEnd, `${currency} ${D.inputs.arEnd.toFixed(0)}`],
                        ['متوسط الحسابات المدينة', D.inputs.avgReceivables,
                            `${currency} ${D.inputs.avgReceivables.toFixed(0)}`
                        ],
                        ['حسابات دائنة أول المدة', D.inputs.apStart, `${currency} ${D.inputs.apStart.toFixed(0)}`],
                        ['حسابات دائنة آخر المدة', D.inputs.apEnd, `${currency} ${D.inputs.apEnd.toFixed(0)}`],
                        ['متوسط الحسابات الدائنة', D.inputs.avgPayables,
                            `${currency} ${D.inputs.avgPayables.toFixed(0)}`
                        ],
                        ['تكلفة البضائع المباعة (COGS)', D.inputs.cogs, `${currency} ${D.inputs.cogs.toFixed(0)}`],
                        ['صافي المبيعات الائتمانية', D.inputs.creditSales,
                            `${currency} ${D.inputs.creditSales.toFixed(0)}`
                        ],
                        ['مدة الفترة', `${D.periodMonths} شهر`, `${D.daysFactor.toFixed(0)} يوم`]
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
                    const kpiSheet = workbook.addWorksheet('مؤشرات الأداء', { views: [{ rightToLeft: true,
                            showGridLines: false }] });
                    [5, 32, 22, 22, 22, 5].forEach((w, i) => kpiSheet.getColumn(i + 1).width = w);
                    mh(kpiSheet, 1, 6, 1, '📊 لوحة مؤشرات الأداء الرئيسية', DB, GL, 15);
                    kpiSheet.getRow(1).height = 45;
                    mh(kpiSheet, 2, 5, 2, `${companyName} | ${new Date().toLocaleDateString('ar-EG')}`, HB, W, 10);
                    kpiSheet.getRow(2).height = 26;
                    const kpis = [
                        { label: 'أيام المخزون (DIO)', value: `${D.outputs.dio.toFixed(1)} يوم` },
                        { label: 'أيام المبيعات (DSO)', value: `${D.outputs.dso.toFixed(1)} يوم` },
                        { label: 'أيام المدفوعات (DPO)', value: `${D.outputs.dpo.toFixed(1)} يوم` },
                        { label: 'الفجوة النقدية (CCC)', value: `${D.outputs.ccc.toFixed(1)} يوم`, highlight: true }
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
                        [ic, lc2, vc3, nc2].forEach(c => { c.fill = { type: 'pattern', pattern: 'solid',
                                fgColor: { argb: bg } };
                            c.border = { top: { style: 'thin', color: { argb: G } }, bottom: { style: 'thin',
                                    color: { argb: G } }, left: { style: 'thin', color: { argb: G } },
                                right: { style: 'thin', color: { argb: G } } }; });
                        ic.font = { name: 'Arial', bold: true, size: 14, color: { argb: '555555' } };
                        ic.alignment = { horizontal: 'center', vertical: 'middle' };
                        lc2.font = { name: 'Arial', bold: true, size: 11, color: { argb: DT } };
                        lc2.alignment = { horizontal: 'right', vertical: 'middle', readingOrder: 'rtl' };
                        vc3.font = { name: 'Arial', bold: true, size: 13, color: { argb: tc } };
                        vc3.alignment = { horizontal: 'center', vertical: 'middle' };
                        nc2.font = { name: 'Arial', size: 9, color: { argb: '444444' } };
                        nc2.alignment = { horizontal: 'right', vertical: 'middle', readingOrder: 'rtl' };
                        kRow++;
                    });
                    kRow++;
                    kpiSheet.mergeCells(kRow, 2, kRow, 5);
                    const kFinal = kpiSheet.getCell(kRow, 2);
                    kFinal.value = D.outputs.ccc <= 30 ? '✅ إدارة نقدية ممتازة' : D.outputs.ccc <= 60 ?
                        '🟡 إدارة نقدية مقبولة' : '🔴 خطر سيولة مرتفع';
                    kFinal.font = { name: 'Arial', bold: true, size: 13, color: { argb: D.outputs.ccc <= 30 ?
                            PT : D.outputs.ccc <= 60 ? '856404' : NT } };
                    kFinal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: D.outputs.ccc <= 30 ?
                            PB : D.outputs.ccc <= 60 ? GB : NB } };
                    kFinal.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rtl' };
                    kFinal.border = { top: { style: 'medium', color: { argb: G } }, bottom: { style: 'medium',
                            color: { argb: G } }, left: { style: 'medium', color: { argb: G } },
                        right: { style: 'medium', color: { argb: G } } };
                    kpiSheet.getRow(kRow).height = 40;

                    // 4. تفصيل الحساب
                    const detailSheet = workbook.addWorksheet('تفصيل الحساب', { views: [{ rightToLeft: true,
                            showGridLines: false }] });
                    detailSheet.getColumn(1).width = 5;
                    detailSheet.getColumn(2).width = 40;
                    detailSheet.getColumn(3).width = 25;
                    detailSheet.getColumn(4).width = 25;
                    detailSheet.getColumn(5).width = 5;
                    mh(detailSheet, 1, 5, 1, '📋 تفصيل حساب دورة التحويل النقدي', DB, GL, 14);
                    detailSheet.getRow(1).height = 40;
                    detailSheet.addRow(['المؤشر', 'القيمة', 'المعادلة']);
                    const detailRows = [
                        ['متوسط المخزون', `${currency} ${D.inputs.avgInventory.toFixed(0)}`,
                            `(${D.inputs.invStart} + ${D.inputs.invEnd}) / 2`
                        ],
                        ['أيام المخزون (DIO)', `${D.outputs.dio.toFixed(1)} يوم`,
                            `(متوسط المخزون ÷ COGS) × ${D.daysFactor.toFixed(0)}`
                        ],
                        ['متوسط الحسابات المدينة', `${currency} ${D.inputs.avgReceivables.toFixed(0)}`,
                            `(${D.inputs.arStart} + ${D.inputs.arEnd}) / 2`
                        ],
                        ['أيام المبيعات (DSO)', `${D.outputs.dso.toFixed(1)} يوم`,
                            `(متوسط الحسابات المدينة ÷ المبيعات) × ${D.daysFactor.toFixed(0)}`
                        ],
                        ['متوسط الحسابات الدائنة', `${currency} ${D.inputs.avgPayables.toFixed(0)}`,
                            `(${D.inputs.apStart} + ${D.inputs.apEnd}) / 2`
                        ],
                        ['أيام المدفوعات (DPO)', `${D.outputs.dpo.toFixed(1)} يوم`,
                            `(متوسط الحسابات الدائنة ÷ COGS) × ${D.daysFactor.toFixed(0)}`
                        ],
                        ['الفجوة النقدية (CCC)', `${D.outputs.ccc.toFixed(1)} يوم`, `DIO + DSO - DPO`]
                    ];
                    detailRows.forEach(r => detailSheet.addRow(r));
                    const detHeader = detailSheet.getRow(2);
                    detHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    detHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
                    detailSheet.getColumn(2).width = 25;
                    detailSheet.getColumn(3).width = 25;

                    // 5. الرسوم البيانية
                    const chartsSheet = workbook.addWorksheet('الرسوم البيانية', { views: [{ rightToLeft: true,
                            showGridLines: false }] });
                    chartsSheet.getColumn(1).width = 5;
                    chartsSheet.getColumn(2).width = 50;
                    chartsSheet.getColumn(3).width = 5;
                    mh(chartsSheet, 1, 3, 1, '📊 الرسوم البيانية لدورة التحويل النقدي', DB, GL, 14);
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
                    const intSheet = workbook.addWorksheet('التفسير والتوصيات', { views: [{ rightToLeft: true,
                            showGridLines: false }] });
                    intSheet.getColumn(1).width = 5;
                    intSheet.getColumn(2).width = 50;
                    intSheet.getColumn(3).width = 5;
                    mh(intSheet, 1, 3, 1, '📝 التفسير والتوصيات', DB, GL, 14);
                    intSheet.getRow(1).height = 45;
                    const sections = [
                        { title: '1. ملخص التحليل',
                        content: `الجهة: ${companyName}\nالفترة: ${D.periodMonths} شهراً\nDIO: ${D.outputs.dio.toFixed(1)} يوم\nDSO: ${D.outputs.dso.toFixed(1)} يوم\nDPO: ${D.outputs.dpo.toFixed(1)} يوم\nCCC: ${D.outputs.ccc.toFixed(1)} يوم` },
                        { title: '2. تقييم الفجوة النقدية',
                        content: `التصنيف: ${D.outputs.status}\n${D.outputs.recommendation}` },
                        { title: '3. التوصيات',
                        content: D.outputs.dio > 45 ? '• يُنصح بتحسين إدارة المخزون وتقليل أيام الاحتفاظ به.\n' : '• إدارة المخزون جيدة، استمر في المراقبة.\n' + (D.outputs.dso > 45 ? '• يُنصح بتسريع عملية تحصيل المستحقات أو تقديم خصومات للدفع العاجل.\n' : '• سياسة الائتمان جيدة، استمر.\n') + (D.outputs.dpo < 30 ? '• حاول التفاوض مع الموردين لتمديد فترة السداد.\n' : '• شروط الدفع مع الموردين مناسبة.') },
                        { title: '4. تنويه',
                        content: 'هذا التحليل مبني على بيانات تقديرية. النتائج الفعلية قد تختلف حسب ظروف السوق والتغيرات التشغيلية. يُنصح باستشارة خبير مالي قبل اتخاذ القرارات.' }
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
                        readingOrder: 'rtl' };
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
                            readingOrder: 'rtl' };
                        cc.border = { top: { style: 'hair' }, bottom: { style: 'hair',
                                color: { argb: G } }, left: { style: 'hair' }, right: { style: 'hair' } };
                    });

                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const now = new Date();
                    const fileName =
                        `تقرير_CCC_${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
                    saveAs(blob, fileName);
                } catch (err) {
                    console.error(err);
                    alert('خطأ أثناء إنشاء ملف Excel: ' + err.message);
                } finally {
                    hideLoading();
                }
            }

            // ========== تصدير Word ==========
            async function exportToWord() {
                if (!currentResults) {
                    alert('الرجاء إجراء التحليل أولاً.');
                    return;
                }
                showLoading('جاري إنشاء تقرير Word الاحترافي...', 'جمع البيانات والرسوم البيانية');
                try {
                    const D = currentResults;
                    const currency = D.currency;
                    const companyName = D.company;
                    const now = new Date();
                    const dateStr = now.toLocaleDateString('ar-EG');

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

                    const fullHtml = `<!DOCTYPE html>
                    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
                    <head><meta charset='utf-8'><title>تقرير الفجوة النقدية - FAROUK GRUP</title>
                    <style>
                        body{font-family:'Arial','Tajawal',sans-serif;direction:rtl;margin:2rem;background:#fff;}
                        .cover{text-align:center;border-bottom:4px solid #b8860b;margin-bottom:30px;padding-bottom:20px;}
                        .cover h1{font-size:32px;color:#b8860b;margin:0;}
                        .cover h2{font-size:24px;color:#b48554;margin:5px 0;}
                        table{width:100%;border-collapse:collapse;margin:20px 0;direction:rtl;}
                        th,td{border:1px solid #b8860b;padding:8px;text-align:center;}
                        th{background:#fefcf6;color:#b8860b;font-weight:bold;}
                        .chart-img{max-width:100%;height:auto;border:1px solid #b8860b;border-radius:10px;margin:20px 0;}
                        .footer{text-align:center;margin-top:40px;padding-top:10px;border-top:1px dashed #b8860b;color:#888;}
                    </style></head>
                    <body>
                        <div class="cover">
                            <h1>مجموعة فاروق للاستشارات والأعمال</h1>
                            <h2>تقرير تحليل الفجوة النقدية (CCC)</h2>
                            <p>الجهة: ${companyName} | التاريخ: ${dateStr}</p>
                            <p>العملة: ${currency} | الفترة: ${D.periodMonths} شهراً</p>
                        </div>
                        <h2 style="color:#b8860b;">المدخلات الأساسية</h2>
                        <table><tbody>
                            <tr><th>مخزون أول المدة</th><td>${currency} ${D.inputs.invStart.toFixed(0)}</td><th>مخزون آخر المدة</th><td>${currency} ${D.inputs.invEnd.toFixed(0)}</td></tr>
                            <tr><th>متوسط المخزون</th><td><strong>${currency} ${D.inputs.avgInventory.toFixed(0)}</strong></td><th>حسابات مدينة أول المدة</th><td>${currency} ${D.inputs.arStart.toFixed(0)}</td></tr>
                            <tr><th>حسابات مدينة آخر المدة</th><td>${currency} ${D.inputs.arEnd.toFixed(0)}</td><th>متوسط الحسابات المدينة</th><td><strong>${currency} ${D.inputs.avgReceivables.toFixed(0)}</strong></td></tr>
                            <tr><th>حسابات دائنة أول المدة</th><td>${currency} ${D.inputs.apStart.toFixed(0)}</td><th>حسابات دائنة آخر المدة</th><td>${currency} ${D.inputs.apEnd.toFixed(0)}</td></tr>
                            <tr><th>متوسط الحسابات الدائنة</th><td><strong>${currency} ${D.inputs.avgPayables.toFixed(0)}</strong></td><th>COGS</th><td>${currency} ${D.inputs.cogs.toFixed(0)}</td></tr>
                            <tr><th>المبيعات الائتمانية</th><td>${currency} ${D.inputs.creditSales.toFixed(0)}</td><th>مدة الفترة</th><td>${D.periodMonths} شهراً</td></tr>
                        </tbody></table>
                        <h2 style="color:#b8860b;">📊 مؤشرات دورة التحويل النقدي</h2>
                        <table>
                            <thead><tr><th>المؤشر</th><th>القيمة (أيام)</th></tr></thead>
                            <tbody>
                                <tr><td>أيام المخزون (DIO)</td><td>${D.outputs.dio.toFixed(1)}</td></tr>
                                <tr><td>أيام المبيعات (DSO)</td><td>${D.outputs.dso.toFixed(1)}</td></tr>
                                <tr><td>أيام المدفوعات (DPO)</td><td>${D.outputs.dpo.toFixed(1)}</td></tr>
                                <tr style="font-weight:bold;background:#f0f0f0;"><td>الفجوة النقدية (CCC)</td><td>${D.outputs.ccc.toFixed(1)}</td></tr>
                            </tbody>
                        </table>
                        <div style="margin:20px 0;padding:20px;background:${D.outputs.ccc <= 30 ? '#d4edda' : D.outputs.ccc <= 60 ? '#fff3cd' : '#f8d7da'};border-radius:10px;text-align:center;">
                            <span style="font-size:1.5rem;font-weight:bold;color:${D.outputs.ccc <= 30 ? '#155724' : D.outputs.ccc <= 60 ? '#856404' : '#721c24'};">التصنيف: ${D.outputs.status}</span>
                            <p style="margin-top:10px;">${D.outputs.recommendation}</p>
                        </div>
                        <h2 style="color:#b8860b;">📊 الرسوم البيانية</h2>
                        <div style="text-align:center;"><img src="${chartImgBase64}" class="chart-img" /></div>
                        <div class="footer">تم الإنشاء بواسطة مجموعة فاروق للاستشارات والأعمال © ${now.getFullYear()}</div>
                    </body></html>`;

                    const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download =
                        `تقرير_CCC_${companyName}_${now.toISOString().slice(0,10)}.doc`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                } catch (err) {
                    console.error(err);
                    alert('خطأ في إنشاء تقرير Word');
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
    