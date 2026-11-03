
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
            let comparisonChart = null;
            let impactChart = null;
            let currentResults = null;

            // ===== المحاكاة الرئيسية =====
            function runSimulation() {
                const currency = document.getElementById('currencySelect').value;
                const company = document.getElementById('companyName').value || 'الجهة';

                const baseRevenue = parseFloat(document.getElementById('baseRevenue').value) || 0;
                const baseSalaries = parseFloat(document.getElementById('baseSalaries').value) || 0;
                const baseMaterials = parseFloat(document.getElementById('baseMaterials').value) || 0;
                const baseOtherCosts = parseFloat(document.getElementById('baseOtherCosts').value) || 0;

                const scenarioRevenuePct = parseFloat(document.getElementById('scenarioRevenue').value) || 0;
                const scenarioSalariesPct = parseFloat(document.getElementById('scenarioSalaries').value) || 0;
                const scenarioMaterialsPct = parseFloat(document.getElementById('scenarioMaterials').value) || 0;

                if (baseRevenue <= 0 || baseSalaries < 0 || baseMaterials < 0 || baseOtherCosts < 0) {
                    alert('الرجاء إدخال قيم صحيحة (الإيرادات > 0، التكاليف >= 0).');
                    return;
                }

                const currentTotalCosts = baseSalaries + baseMaterials + baseOtherCosts;
                const currentProfit = baseRevenue - currentTotalCosts;
                const currentMargin = baseRevenue > 0 ? (currentProfit / baseRevenue) * 100 : 0;

                const scenarioRevenue = baseRevenue * (1 + scenarioRevenuePct / 100);
                const scenarioSalaries = baseSalaries * (1 + scenarioSalariesPct / 100);
                const scenarioMaterials = baseMaterials * (1 + scenarioMaterialsPct / 100);
                const scenarioTotalCosts = scenarioSalaries + scenarioMaterials + baseOtherCosts;
                const scenarioProfit = scenarioRevenue - scenarioTotalCosts;
                const scenarioMargin = scenarioRevenue > 0 ? (scenarioProfit / scenarioRevenue) * 100 : 0;

                const revenueChange = scenarioRevenue - baseRevenue;
                const costsChange = scenarioTotalCosts - currentTotalCosts;
                const profitChange = scenarioProfit - currentProfit;
                const marginChange = scenarioMargin - currentMargin;

                currentResults = {
                    currency,
                    company,
                    base: { revenue: baseRevenue, salaries: baseSalaries, materials: baseMaterials,
                        otherCosts: baseOtherCosts, totalCosts: currentTotalCosts, profit: currentProfit,
                        margin: currentMargin },
                    scenario: { revenue: scenarioRevenue, salaries: scenarioSalaries,
                        materials: scenarioMaterials, otherCosts: baseOtherCosts,
                        totalCosts: scenarioTotalCosts, profit: scenarioProfit, margin: scenarioMargin },
                    changes: { revenue: revenueChange, costs: costsChange, profit: profitChange,
                        margin: marginChange },
                    scenarioPcts: { revenue: scenarioRevenuePct, salaries: scenarioSalariesPct,
                        materials: scenarioMaterialsPct },
                    isBetter: scenarioProfit > currentProfit
                };

                document.getElementById('resultsSection').style.display = 'block';
                document.getElementById('initialMessage').style.display = 'none';

                // بطاقات النتائج
                document.getElementById('kpiCards').innerHTML = `
                    <div class="result-card">
                        <i class="fas fa-chart-line"></i>
                        <h4>الإيرادات</h4>
                        <div class="value" style="color:${revenueChange >= 0 ? '#4ade80' : '#f87171'}">${currency}${scenarioRevenue.toFixed(0)}</div>
                        <div class="change ${revenueChange >= 0 ? 'change-positive' : 'change-negative'}">${revenueChange >= 0 ? '+' : ''}${currency}${revenueChange.toFixed(0)} (${scenarioRevenuePct >= 0 ? '+' : ''}${scenarioRevenuePct}%)</div>
                    </div>
                    <div class="result-card">
                        <i class="fas fa-file-invoice"></i>
                        <h4>إجمالي التكاليف</h4>
                        <div class="value" style="color:${costsChange <= 0 ? '#4ade80' : '#f87171'}">${currency}${scenarioTotalCosts.toFixed(0)}</div>
                        <div class="change ${costsChange <= 0 ? 'change-positive' : 'change-negative'}">${costsChange >= 0 ? '+' : ''}${currency}${costsChange.toFixed(0)}</div>
                    </div>
                    <div class="result-card">
                        <i class="fas fa-money-bill-wave"></i>
                        <h4>صافي الربح</h4>
                        <div class="value" style="color:${profitChange >= 0 ? '#4ade80' : '#f87171'}">${currency}${scenarioProfit.toFixed(0)}</div>
                        <div class="change ${profitChange >= 0 ? 'change-positive' : 'change-negative'}">${profitChange >= 0 ? '+' : ''}${currency}${profitChange.toFixed(0)} (${(profitChange / (currentProfit || 1) * 100).toFixed(1)}%)</div>
                    </div>
                    <div class="result-card">
                        <i class="fas fa-percent"></i>
                        <h4>هامش الربح</h4>
                        <div class="value" style="color:${marginChange >= 0 ? '#4ade80' : '#f87171'}">${scenarioMargin.toFixed(1)}%</div>
                        <div class="change ${marginChange >= 0 ? 'change-positive' : 'change-negative'}">${marginChange >= 0 ? '+' : ''}${marginChange.toFixed(1)}%</div>
                    </div>
                `;

                // جدول المقارنة
                document.getElementById('comparisonTable').innerHTML = `
                    <table>
                        <thead><tr><th>المؤشر</th><th>القيمة الحالية</th><th>قيمة السيناريو</th><th>التغيير</th><th>نسبة التغيير</th></tr></thead>
                        <tbody>
                            <tr><td>الإيرادات</td><td>${currency}${baseRevenue.toFixed(0)}</td><td>${currency}${scenarioRevenue.toFixed(0)}</td><td style="color:${revenueChange >= 0 ? '#4ade80' : '#f87171'}">${revenueChange >= 0 ? '+' : ''}${currency}${revenueChange.toFixed(0)}</td><td style="color:${revenueChange >= 0 ? '#4ade80' : '#f87171'}">${scenarioRevenuePct >= 0 ? '+' : ''}${scenarioRevenuePct}%</td></tr>
                            <tr><td>الرواتب</td><td>${currency}${baseSalaries.toFixed(0)}</td><td>${currency}${scenarioSalaries.toFixed(0)}</td><td style="color:${(scenarioSalaries - baseSalaries) <= 0 ? '#4ade80' : '#f87171'}">${(scenarioSalaries - baseSalaries) >= 0 ? '+' : ''}${currency}${(scenarioSalaries - baseSalaries).toFixed(0)}</td><td style="color:${(scenarioSalaries - baseSalaries) <= 0 ? '#4ade80' : '#f87171'}">${scenarioSalariesPct >= 0 ? '+' : ''}${scenarioSalariesPct}%</td></tr>
                            <tr><td>المواد الخام</td><td>${currency}${baseMaterials.toFixed(0)}</td><td>${currency}${scenarioMaterials.toFixed(0)}</td><td style="color:${(scenarioMaterials - baseMaterials) <= 0 ? '#4ade80' : '#f87171'}">${(scenarioMaterials - baseMaterials) >= 0 ? '+' : ''}${currency}${(scenarioMaterials - baseMaterials).toFixed(0)}</td><td style="color:${(scenarioMaterials - baseMaterials) <= 0 ? '#4ade80' : '#f87171'}">${scenarioMaterialsPct >= 0 ? '+' : ''}${scenarioMaterialsPct}%</td></tr>
                            <tr><td>مصاريف أخرى</td><td>${currency}${baseOtherCosts.toFixed(0)}</td><td>${currency}${baseOtherCosts.toFixed(0)}</td><td style="color:#fbbf24;">0</td><td style="color:#fbbf24;">0%</td></tr>
                            <tr style="font-weight:900;border-top:2px solid rgba(180,133,84,0.2);"><td>إجمالي التكاليف</td><td>${currency}${currentTotalCosts.toFixed(0)}</td><td>${currency}${scenarioTotalCosts.toFixed(0)}</td><td style="color:${costsChange <= 0 ? '#4ade80' : '#f87171'}">${costsChange >= 0 ? '+' : ''}${currency}${costsChange.toFixed(0)}</td><td style="color:${costsChange <= 0 ? '#4ade80' : '#f87171'}">${(costsChange / (currentTotalCosts || 1) * 100).toFixed(1)}%</td></tr>
                            <tr style="font-weight:900;background:rgba(180,133,84,0.1);"><td>صافي الربح</td><td>${currency}${currentProfit.toFixed(0)}</td><td>${currency}${scenarioProfit.toFixed(0)}</td><td style="color:${profitChange >= 0 ? '#4ade80' : '#f87171'}">${profitChange >= 0 ? '+' : ''}${currency}${profitChange.toFixed(0)}</td><td style="color:${profitChange >= 0 ? '#4ade80' : '#f87171'}">${(profitChange / (currentProfit || 1) * 100).toFixed(1)}%</td></tr>
                            <tr><td>هامش الربح</td><td>${currentMargin.toFixed(1)}%</td><td>${scenarioMargin.toFixed(1)}%</td><td style="color:${marginChange >= 0 ? '#4ade80' : '#f87171'}">${marginChange >= 0 ? '+' : ''}${marginChange.toFixed(1)}%</td><td style="color:${marginChange >= 0 ? '#4ade80' : '#f87171'}">${(marginChange / (currentMargin || 1) * 100).toFixed(1)}%</td></tr>
                        </tbody>
                    </table>
                `;

                // التوصيات
                const recDiv = document.getElementById('recommendations');
                let recHtml = `<h4 style="color:#cfa776;"><i class="fas fa-lightbulb" style="color:#cfa776;"></i> تحليل السيناريو</h4>`;
                if (currentResults.isBetter) {
                    recHtml += `<p style="color:#4ade80;">✅ السيناريو يؤدي إلى <strong>تحسن</strong> في الربحية بمقدار ${currency}${profitChange.toFixed(0)} (${(profitChange / (currentProfit || 1) * 100).toFixed(1)}%).</p>`;
                    recHtml += `<p style="color:#f0f4fa;">التغييرات الإيجابية في المبيعات أو خفض التكاليف أثرت بشكل إيجابي على النتيجة النهائية. استمر في تعزيز الاستراتيجيات التي أدت إلى هذا التحسن.</p>`;
                } else {
                    recHtml += `<p style="color:#f87171;">🔴 السيناريو يؤدي إلى <strong>تراجع</strong> في الربحية بمقدار ${currency}${Math.abs(profitChange).toFixed(0)} (${(Math.abs(profitChange) / (currentProfit || 1) * 100).toFixed(1)}%).</p>`;
                    let reasons = [];
                    if (revenueChange < 0) reasons.push('انخفاض الإيرادات');
                    if (scenarioSalaries > baseSalaries) reasons.push('ارتفاع الرواتب');
                    if (scenarioMaterials > baseMaterials) reasons.push('ارتفاع تكلفة المواد الخام');
                    if (reasons.length > 0) {
                        recHtml += `<p style="color:#f0f4fa;">الأسباب الرئيسية: <strong style="color:#fbbf24;">${reasons.join('، ')}</strong>.</p>`;
                    }
                    recHtml += `<p style="color:#f0f4fa;">يوصى بمراجعة هيكل التكاليف، البحث عن بدائل للمواد الخام، أو زيادة الكفاءة التشغيلية للتعويض.</p>`;
                }
                recHtml += `<p style="color:#aab7d4;font-size:0.85rem;margin-top:0.5rem;">* يعتمد التحليل على البيانات المدخلة وقد لا يعكس جميع العوامل التشغيلية.</p>`;
                recDiv.innerHTML = recHtml;

                // الرسوم البيانية
                const ctx1 = document.getElementById('comparisonChart').getContext('2d');
                const ctx2 = document.getElementById('impactChart').getContext('2d');

                if (comparisonChart) comparisonChart.destroy();
                if (impactChart) impactChart.destroy();

                comparisonChart = new Chart(ctx1, {
                    type: 'bar',
                    data: {
                        labels: ['الإيرادات', 'التكاليف الكلية', 'صافي الربح'],
                        datasets: [{
                            label: 'القيمة الحالية',
                            data: [baseRevenue, currentTotalCosts, currentProfit],
                            backgroundColor: 'rgba(180,133,84,0.6)',
                            borderColor: '#b48554',
                            borderWidth: 2,
                            borderRadius: 4
                        }, {
                            label: 'قيمة السيناريو',
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
                        labels: ['الحالي', 'السيناريو'],
                        datasets: [{
                            label: 'هامش الربح %',
                            data: [currentMargin, scenarioMargin],
                            borderColor: '#4ade80',
                            backgroundColor: 'rgba(74,222,128,0.1)',
                            fill: true,
                            tension: 0.1,
                            pointRadius: 6
                        }, {
                            label: 'صافي الربح',
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
                if (!currentResults) { alert('الرجاء تشغيل المحاكاة أولاً.'); return; }
                showLoading('جاري إنشاء تقرير Excel الاحترافي...', 'إنشاء الأوراق والرسوم البيانية');
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
                    mh(cv, 1, 4, 4, `تقرير تحليل السيناريوهات\n${company}`, DB, GL, 18);
                    const inf = [
                        ['📋 الجهة', company],
                        ['📅 التاريخ', new Date().toLocaleDateString('ar-EG')],
                        ['💰 العملة', currency],
                        ['📊 تغيير المبيعات', `${D.scenarioPcts.revenue >= 0 ? '+' : ''}${D.scenarioPcts.revenue}%`],
                        ['📊 تغيير الرواتب', `${D.scenarioPcts.salaries >= 0 ? '+' : ''}${D.scenarioPcts.salaries}%`],
                        ['📊 تغيير المواد', `${D.scenarioPcts.materials >= 0 ? '+' : ''}${D.scenarioPcts.materials}%`],
                        ['📈 صافي الربح الجديد', `${currency}${D.scenario.profit.toFixed(0)}`]
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
                    mh(inputsSheet, 2, 4, 2, 'البيانات الأساسية', SB, W, 11);
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

                    addInputRow('الإيرادات الشهرية', D.base.revenue);
                    addInputRow('الرواتب الشهرية', D.base.salaries);
                    addInputRow('تكلفة المواد الخام', D.base.materials);
                    addInputRow('المصاريف التشغيلية الأخرى', D.base.otherCosts);
                    addInputRow('تغيير المبيعات %', D.scenarioPcts.revenue);
                    addInputRow('تغيير الرواتب %', D.scenarioPcts.salaries);
                    addInputRow('تغيير المواد %', D.scenarioPcts.materials);

                    // 3. مؤشرات الأداء
                    const kpiSheet = workbook.addWorksheet('مؤشرات الأداء', { views: [{ rightToLeft: true,
                            showGridLines: false }] });
                    [5, 32, 22, 22, 22, 5].forEach((w, i) => kpiSheet.getColumn(i + 1).width = w);
                    mh(kpiSheet, 1, 6, 1, '📊 لوحة مؤشرات الأداء الرئيسية', DB, GL, 15);
                    kpiSheet.getRow(1).height = 45;
                    mh(kpiSheet, 2, 5, 2, `${company} | ${new Date().toLocaleDateString('ar-EG')}`, HB, W, 10);
                    kpiSheet.getRow(2).height = 26;

                    const kpis = [
                        { label: 'الإيرادات (حالي)', value: `${currency} ${D.base.revenue.toFixed(0)}` },
                        { label: 'الإيرادات (سيناريو)', value: `${currency} ${D.scenario.revenue.toFixed(0)}` },
                        { label: 'صافي الربح (حالي)', value: `${currency} ${D.base.profit.toFixed(0)}` },
                        { label: 'صافي الربح (سيناريو)', value: `${currency} ${D.scenario.profit.toFixed(0)}` },
                        { label: 'تغيير الربح', value: `${currency} ${D.changes.profit.toFixed(0)}`, good: D
                                .isBetter },
                        { label: 'هامش الربح (سيناريو)', value: `${D.scenario.margin.toFixed(1)}%`, good: D
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
                    kFinal.value = D.isBetter ? '✅ السيناريو يحسن الربحية' : '🔴 السيناريو يقلل الربحية';
                    kFinal.font = { name: 'Arial', bold: true, size: 13, color: { argb: D.isBetter ? PT :
                        NT } };
                    kFinal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: D.isBetter ? PB :
                        NB } };
                    kFinal.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rtl' };
                    kFinal.border = { top: { style: 'medium', color: { argb: G } }, bottom: { style: 'medium',
                            color: { argb: G } }, left: { style: 'medium', color: { argb: G } },
                        right: { style: 'medium', color: { argb: G } } };
                    kpiSheet.getRow(kRow).height = 40;

                    // 4. جدول المقارنة
                    const compSheet = workbook.addWorksheet('جدول المقارنة', { views: [{ rightToLeft: true,
                            showGridLines: false }] });
                    compSheet.getColumn(1).width = 5;
                    compSheet.getColumn(2).width = 30;
                    compSheet.getColumn(3).width = 22;
                    compSheet.getColumn(4).width = 22;
                    compSheet.getColumn(5).width = 22;
                    compSheet.getColumn(6).width = 22;
                    compSheet.getColumn(7).width = 5;
                    mh(compSheet, 1, 7, 1, '📋 جدول المقارنة التفصيلي', DB, GL, 14);
                    compSheet.getRow(1).height = 40;
                    compSheet.addRow(['المؤشر', 'القيمة الحالية', 'قيمة السيناريو', 'التغيير', 'نسبة التغيير %']);
                    const cmpData = [
                        ['الإيرادات', D.base.revenue, D.scenario.revenue, D.changes.revenue, (D.changes
                            .revenue / D.base.revenue * 100)],
                        ['الرواتب', D.base.salaries, D.scenario.salaries, D.scenario.salaries - D.base
                            .salaries, ((D.scenario.salaries - D.base.salaries) / D.base.salaries *
                            100)
                        ],
                        ['المواد الخام', D.base.materials, D.scenario.materials, D.scenario.materials - D
                            .base.materials, ((D.scenario.materials - D.base.materials) / D.base
                            .materials * 100)
                        ],
                        ['مصاريف أخرى', D.base.otherCosts, D.scenario.otherCosts, 0, 0],
                        ['إجمالي التكاليف', D.base.totalCosts, D.scenario.totalCosts, D.changes.costs, (D
                            .changes.costs / D.base.totalCosts * 100)
                        ],
                        ['صافي الربح', D.base.profit, D.scenario.profit, D.changes.profit, (D.changes
                            .profit / D.base.profit * 100)
                        ],
                        ['هامش الربح %', D.base.margin, D.scenario.margin, D.changes.margin, (D.changes
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
                    const chartSheet = workbook.addWorksheet('الرسوم البيانية', { views: [{ rightToLeft: true,
                            showGridLines: false }] });
                    chartSheet.getColumn(1).width = 5;
                    chartSheet.getColumn(2).width = 50;
                    chartSheet.getColumn(3).width = 5;
                    mh(chartSheet, 1, 3, 1, '📊 الرسوم البيانية', DB, GL, 14);
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
                    const recSheet = workbook.addWorksheet('التوصيات', { views: [{ rightToLeft: true,
                            showGridLines: false }] });
                    recSheet.getColumn(1).width = 5;
                    recSheet.getColumn(2).width = 50;
                    recSheet.getColumn(3).width = 5;
                    mh(recSheet, 1, 3, 1, '💡 التوصيات', DB, GL, 14);
                    recSheet.getRow(1).height = 40;
                    let recContent = D.isBetter ?
                        `✅ السيناريو يحسن الربحية.\nتغيير صافي الربح: ${currency} ${D.changes.profit.toFixed(0)} (${(D.changes.profit / D.base.profit * 100).toFixed(1)}%).\nالتوصية: استمر في استراتيجيات زيادة المبيعات أو خفض التكاليف.` :
                        `🔴 السيناريو يقلل الربحية.\nتغيير صافي الربح: ${currency} ${D.changes.profit.toFixed(0)} (${(D.changes.profit / D.base.profit * 100).toFixed(1)}%).\nالتوصية: راجع هيكل التكاليف، ابحث عن بدائل للمواد، أو حسّن الكفاءة التشغيلية.`;
                    recSheet.getCell(3, 2).value = recContent;
                    recSheet.getCell(3, 2).font = { name: 'Arial', size: 11 };
                    recSheet.getCell(3, 2).alignment = { wrapText: true, readingOrder: 'rtl' };

                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const now = new Date();
                    const fileName =
                        `تقرير_سيناريوهات_${company}_${now.toISOString().slice(0,10)}.xlsx`;
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
                if (!currentResults) { alert('الرجاء تشغيل المحاكاة أولاً.'); return; }
                showLoading('جاري إنشاء تقرير Word الاحترافي...', 'جمع البيانات والرسوم البيانية');
                try {
                    const D = currentResults;
                    const currency = D.currency;
                    const company = D.company;
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
                    <head><meta charset='utf-8'><title>تقرير تحليل السيناريوهات - FAROUK GRUP</title>
                    <style>
                        body{font-family:'Arial','Tajawal',sans-serif;direction:rtl;margin:2rem;background:#fff;}
                        .cover{text-align:center;border-bottom:4px solid #b8860b;margin-bottom:30px;padding-bottom:20px;}
                        .cover h1{font-size:32px;color:#b8860b;margin:0;}
                        .cover h2{font-size:24px;color:#b48554;margin:5px 0;}
                        table{width:100%;border-collapse:collapse;margin:20px 0;direction:rtl;}
                        th,td{border:1px solid #b8860b;padding:8px;text-align:center;}
                        th{background:#fefcf6;color:#b8860b;font-weight:bold;}
                        .chart-img{max-width:100%;height:auto;border:1px solid #b8860b;border-radius:10px;margin:20px 0;}
                        .footer{text-align:center;margin-top:40px;padding-top:10px;border-top:1px dashed #b8860b;color:#888;font-size:10pt;}
                        .rec{background:#f9f9f9;padding:15px;border-right:4px solid #b8860b;margin:20px 0;}
                    </style></head>
                    <body>
                        <div class="cover">
                            <h1>مجموعة فاروق للاستشارات والأعمال</h1>
                            <h2>تقرير تحليل السيناريوهات</h2>
                            <p>الجهة: ${company} | التاريخ: ${dateStr}</p>
                            <p>العملة: ${currency}</p>
                        </div>
                        <h2 style="color:#b8860b;">تغييرات السيناريو</h2>
                        <ul>
                            <li>المبيعات: ${D.scenarioPcts.revenue >= 0 ? '+' : ''}${D.scenarioPcts.revenue}%</li>
                            <li>الرواتب: ${D.scenarioPcts.salaries >= 0 ? '+' : ''}${D.scenarioPcts.salaries}%</li>
                            <li>المواد الخام: ${D.scenarioPcts.materials >= 0 ? '+' : ''}${D.scenarioPcts.materials}%</li>
                        </ul>
                        <h2 style="color:#b8860b;">📊 جدول المقارنة</h2>
                        <table>
                            <thead><tr><th>المؤشر</th><th>القيمة الحالية</th><th>قيمة السيناريو</th><th>التغيير</th></tr></thead>
                            <tbody>
                                <tr><td>الإيرادات</td><td>${currency}${D.base.revenue.toFixed(0)}</td><td>${currency}${D.scenario.revenue.toFixed(0)}</td><td style="color:${D.changes.revenue >= 0 ? '#28a745' : '#dc3545'}">${D.changes.revenue >= 0 ? '+' : ''}${currency}${D.changes.revenue.toFixed(0)}</td></tr>
                                <tr><td>إجمالي التكاليف</td><td>${currency}${D.base.totalCosts.toFixed(0)}</td><td>${currency}${D.scenario.totalCosts.toFixed(0)}</td><td style="color:${D.changes.costs <= 0 ? '#28a745' : '#dc3545'}">${D.changes.costs >= 0 ? '+' : ''}${currency}${D.changes.costs.toFixed(0)}</td></tr>
                                <tr style="font-weight:bold;background:#f0f0f0;"><td>صافي الربح</td><td>${currency}${D.base.profit.toFixed(0)}</td><td>${currency}${D.scenario.profit.toFixed(0)}</td><td style="color:${D.changes.profit >= 0 ? '#28a745' : '#dc3545'}">${D.changes.profit >= 0 ? '+' : ''}${currency}${D.changes.profit.toFixed(0)}</td></tr>
                                <tr><td>هامش الربح</td><td>${D.base.margin.toFixed(1)}%</td><td>${D.scenario.margin.toFixed(1)}%</td><td style="color:${D.changes.margin >= 0 ? '#28a745' : '#dc3545'}">${D.changes.margin >= 0 ? '+' : ''}${D.changes.margin.toFixed(1)}%</td></tr>
                            </tbody>
                        </table>
                        <div class="rec">
                            <h3 style="color:#b8860b;">📌 التوصية</h3>
                            <p>${D.isBetter ? '✅ السيناريو يؤدي إلى تحسن في الربحية.' : '🔴 السيناريو يؤدي إلى تراجع في الربحية.'}</p>
                            <p>التغيير الكلي في صافي الربح: ${currency}${D.changes.profit.toFixed(0)} (${(D.changes.profit / D.base.profit * 100).toFixed(1)}%)</p>
                        </div>
                        ${chartImgBase64 ? `<h2 style="color:#b8860b;">📈 الرسوم البيانية</h2><div style="text-align:center;"><img src="${chartImgBase64}" class="chart-img" /></div>` : ''}
                        <div class="footer">تم الإنشاء بواسطة مجموعة فاروق للاستشارات والأعمال © ${now.getFullYear()}</div>
                    </body></html>`;

                    const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download =
                        `تقرير_سيناريوهات_${company}_${now.toISOString().slice(0,10)}.doc`;
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
            document.getElementById('simulateBtn').addEventListener('click', runSimulation);
            document.getElementById('exportWordBtn').addEventListener('click', exportToWord);
            document.getElementById('exportFullExcelBtn').addEventListener('click', exportToFullExcel);

            // ===== تشغيل تلقائي =====
            window.addEventListener('load', function() {
                setTimeout(runSimulation, 500);
            });

        })();
    