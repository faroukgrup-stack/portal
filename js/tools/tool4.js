
    AOS.init({ duration: 800, once: true, offset: 100 });

    // ===== آلة حاسبة =====
    const calcDisplay = document.getElementById('calcDisplay');
    let currentCalcInput = '';
    function handleCalc(v) {
        if (v === 'C') { currentCalcInput = ''; calcDisplay.value = ''; return; }
        if (v === '⌫') { currentCalcInput = currentCalcInput.slice(0, -1); calcDisplay.value = currentCalcInput; return; }
        if (v === '=') {
            try {
                let r = eval(currentCalcInput.replace(/×/g,'*').replace(/÷/g,'/'));
                calcDisplay.value = r;
                currentCalcInput = r.toString();
            } catch(e) { calcDisplay.value = 'خطأ'; currentCalcInput = ''; }
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

    // ===== المنافسون =====
    let competitorCount = 2;
    function renderCompetitors() {
        const container = document.getElementById('competitorsContainer');
        container.innerHTML = '';
        for (let i = 1; i <= competitorCount; i++) {
            const div = document.createElement('div');
            div.className = 'competitor-row';
            div.innerHTML = `
                <input type="text" class="comp-name" placeholder="اسم المنافس" value="">
                <input type="number" class="comp-strength" placeholder="القوة (1-10)" value="" min="1" max="10">
                <input type="number" class="comp-weakness" placeholder="الضعف (1-10)" value="" min="1" max="10">
                ${i > 1 ? '<button class="remove-btn" onclick="removeCompetitor(this)">×</button>' : ''}
            `;
            container.appendChild(div);
        }
    }
    window.removeCompetitor = function(btn) { btn.parentElement.remove(); competitorCount--; };
    document.getElementById('addCompetitor').addEventListener('click', () => { competitorCount++; renderCompetitors(); });

    // ===== القنوات =====
    let channelCount = 2;
    function renderChannels() {
        const container = document.getElementById('channelsContainer');
        container.innerHTML = '';
        for (let i = 1; i <= channelCount; i++) {
            const div = document.createElement('div');
            div.className = 'channel-row';
            div.innerHTML = `
                <input type="text" class="channel-name" placeholder="القناة" value="">
                <input type="number" class="channel-budget" placeholder="الميزانية الشهرية" value="">
                <input type="number" class="channel-customers" placeholder="العملاء المتوقعون شهرياً" value="">
                ${i > 1 ? '<button class="remove-btn" onclick="removeChannel(this)">×</button>' : ''}
            `;
            container.appendChild(div);
        }
    }
    window.removeChannel = function(btn) { btn.parentElement.remove(); channelCount--; };
    document.getElementById('addChannel').addEventListener('click', () => { channelCount++; renderChannels(); });

    // ===== شاشة تحميل =====
    function showLoading(title, msg) {
        document.getElementById('loadingTitle').textContent = title;
        document.getElementById('loadingMsg').textContent = msg;
        document.getElementById('exportLoading').classList.add('show');
    }
    function hideLoading() {
        document.getElementById('exportLoading').classList.remove('show');
    }
    if (!document.getElementById('exportLoading')) {
        const loadDiv = document.createElement('div');
        loadDiv.className = 'export-loading';
        loadDiv.id = 'exportLoading';
        loadDiv.innerHTML = `<div class="export-loading-box"><i class="fas fa-spinner"></i><h3 id="loadingTitle">جاري الإنشاء...</h3><p id="loadingMsg">يرجى الانتظار</p></div>`;
        document.body.appendChild(loadDiv);
    }

    // ===== جمع البيانات =====
    function getData() {
        const competitors = [];
        document.querySelectorAll('.competitor-row').forEach(row => {
            const name = row.querySelector('.comp-name')?.value.trim();
            const strength = parseFloat(row.querySelector('.comp-strength')?.value) || 0;
            const weakness = parseFloat(row.querySelector('.comp-weakness')?.value) || 0;
            if (name) competitors.push({ name, strength, weakness });
        });
        const channels = [];
        document.querySelectorAll('.channel-row').forEach(row => {
            const name = row.querySelector('.channel-name')?.value.trim();
            const budget = parseFloat(row.querySelector('.channel-budget')?.value) || 0;
            const customers = parseFloat(row.querySelector('.channel-customers')?.value) || 0;
            if (name) channels.push({ name, budget, customers });
        });
        return {
            currency: document.getElementById('currencySelect').value,
            companyName: document.getElementById('companyName').value || 'الجهة المستفيدة',
            projectName: document.getElementById('projectName').value || 'مشروع',
            projectDesc: document.getElementById('projectDesc').value || '',
            location: document.getElementById('location').value || '',
            studyMonths: parseFloat(document.getElementById('studyMonths').value) || 12,
            tam: parseFloat(document.getElementById('tam').value) || 0,
            sam: parseFloat(document.getElementById('sam').value) || 0,
            som: parseFloat(document.getElementById('som').value) || 0,
            growthRate: parseFloat(document.getElementById('growthRate').value) / 100 || 0,
            trends: document.getElementById('trends').value || '',
            ageGroup: document.getElementById('ageGroup').value || '',
            gender: document.getElementById('gender').value || 'all',
            geoArea: document.getElementById('geoArea').value || '',
            income: document.getElementById('income').value || 'medium',
            interests: document.getElementById('interests').value || '',
            audienceSize: parseFloat(document.getElementById('audienceSize').value) || 0,
            competitors,
            productStrategy: document.getElementById('productStrategy').value || '',
            price: parseFloat(document.getElementById('price').value) || 0,
            costPerMeal: parseFloat(document.getElementById('costPerMeal').value) || 0,
            placeStrategy: document.getElementById('placeStrategy').value || '',
            promotionStrategy: document.getElementById('promotionStrategy').value || '',
            marketingTeam: parseFloat(document.getElementById('marketingTeam').value) || 0,
            planDuration: parseFloat(document.getElementById('planDuration').value) || 12,
            rent: parseFloat(document.getElementById('rent').value) || 0,
            salaries: parseFloat(document.getElementById('salaries').value) || 0,
            utilities: parseFloat(document.getElementById('utilities').value) || 0,
            otherOpCost: parseFloat(document.getElementById('otherOpCost').value) || 0,
            channels,
            purchaseFrequency: parseFloat(document.getElementById('purchaseFrequency').value) || 1,
            loyaltyMonths: parseFloat(document.getElementById('loyaltyMonths').value) || 6,
            walkIn: parseFloat(document.getElementById('walkIn').value) || 0
        };
    }

    // ===== الحساب =====
    let revenueChart, breakEvenChart;

    document.getElementById('calculateBtn').addEventListener('click', function() {
        const d = getData();

        const totalChannelCustomers = d.channels.reduce((sum, ch) => sum + ch.customers, 0);
        const totalMarketingBudget = d.channels.reduce((sum, ch) => sum + ch.budget, 0);
        const totalActiveCustomers = totalChannelCustomers + d.walkIn;
        const avgOrderValue = d.price;
        const monthlyRevenue = totalActiveCustomers * avgOrderValue * d.purchaseFrequency;
        const annualRevenue = monthlyRevenue * 12;
        const annualMarketingCost = totalMarketingBudget * d.planDuration;
        const marketingContribution = annualRevenue - annualMarketingCost;
        const cac = totalChannelCustomers > 0 ? totalMarketingBudget / totalChannelCustomers : 0;
        const roas = annualMarketingCost > 0 ? (annualRevenue / annualMarketingCost).toFixed(2) : 0;
        const ltv = (d.price - d.costPerMeal) * d.purchaseFrequency * d.loyaltyMonths;
        const breakEvenCustomers = cac > 0 ? annualMarketingCost / (avgOrderValue * d.purchaseFrequency * 12) : 0;

        let compStrengthAvg = 0, compWeaknessAvg = 0;
        d.competitors.forEach(c => { compStrengthAvg += c.strength; compWeaknessAvg += c.weakness; });
        if (d.competitors.length) { compStrengthAvg /= d.competitors.length; compWeaknessAvg /= d.competitors.length; }
        const compIndex = compStrengthAvg - compWeaknessAvg;
        let compDesc = '', compColor = '';
        if (compIndex > 3) { compDesc = 'سوق صعب (منافسة قوية)'; compColor = '🔴'; }
        else if (compIndex > 1) { compDesc = 'منافسة متوسطة'; compColor = '🟡'; }
        else { compDesc = 'فرصة ممتازة (منافسة ضعيفة)'; compColor = '🟢'; }

        let marketScore = (d.growthRate * 40) + (Math.log10(d.tam+1) * 10) + (Math.max(0, 10 - compIndex) * 3);
        marketScore = marketScore / 10;
        if (marketingContribution < 0) marketScore = Math.min(marketScore, 5);
        if (annualRevenue > d.som * 1.2) marketScore = Math.min(marketScore, 3);
        marketScore = Math.min(10, Math.max(0, marketScore)).toFixed(1);
        let marketColor = marketScore >= 7 ? '🟢' : (marketScore >= 4 ? '🟡' : '🔴');

        let warnings = [];
        if (d.costPerMeal >= d.price) warnings.push('🔴 خطأ: تكلفة الوجبة أكبر من أو تساوي سعر البيع!');
        if (ltv / cac < 3 && cac > 0) warnings.push('🟡 تنبيه: نسبة LTV/CAC أقل من 3 (المثالي > 3)');
        if (breakEvenCustomers > totalActiveCustomers) {
            warnings.push(`🔴 فجوة العملاء: تحتاج ${Math.ceil(breakEvenCustomers - totalActiveCustomers)} عميل إضافي شهرياً لتغطية تكاليف التسويق.`);
        }
        if (annualRevenue > d.som) {
            warnings.push(`🔴 الإيرادات المتوقعة (${d.currency}${annualRevenue.toLocaleString()}) تتجاوز الحصة المستهدفة SOM (${d.currency}${d.som.toLocaleString()}). غير منطقي!`);
        } else if (annualRevenue < d.som * 0.5) {
            warnings.push(`🟡 الإيرادات تمثل ${(annualRevenue/d.som*100).toFixed(1)}% فقط من الحصة المستهدفة SOM.`);
        }

        document.getElementById('resultsSection').style.display = 'block';

        document.getElementById('reportHeader').innerHTML = `
            <h3 style="color:var(--accent-soft);">📌 تقرير: ${d.projectName}</h3>
            <p><strong>الجهة:</strong> ${d.companyName} | <strong>الموقع:</strong> ${d.location} | <strong>الوصف:</strong> ${d.projectDesc}</p>
        `;

        document.getElementById('resultsGrid').innerHTML = `
            <div class="result-card"><div class="label">عملاء نشطين (شهرياً)</div><div class="value">${totalActiveCustomers}</div></div>
            <div class="result-card"><div class="label">الإيرادات السنوية</div><div class="value">${d.currency}${annualRevenue.toLocaleString()}</div></div>
            <div class="result-card"><div class="label">تكاليف التسويق السنوية</div><div class="value">${d.currency}${annualMarketingCost.toLocaleString()}</div></div>
            <div class="result-card"><div class="label">الهامش التسويقي السنوي</div><div class="value" style="color:${marketingContribution>=0?'#4ade80':'#f87171'}">${d.currency}${marketingContribution.toLocaleString()}</div></div>
            <div class="result-card"><div class="label">تكلفة الاستحواذ CAC</div><div class="value">${d.currency}${cac.toFixed(2)}</div></div>
            <div class="result-card"><div class="label">القيمة الدائمة LTV</div><div class="value">${d.currency}${ltv.toFixed(2)}</div></div>
            <div class="result-card"><div class="label">العائد على الإنفاق ROAS</div><div class="value">${roas}x</div></div>
            <div class="result-card"><div class="label">عملاء التعادل (شهرياً)</div><div class="value">${Math.ceil(breakEvenCustomers)}</div></div>
        `;

        let alertHtml = '';
        if (warnings.length) {
            alertHtml = '<div class="alert alert-danger"><ul>' + warnings.map(w => `<li>${w}</li>`).join('') + '</ul></div>';
        }
        document.getElementById('alerts').innerHTML = alertHtml;

        let advice = `<h4>🏢 تحليل المنافسين (${d.competitors.length} منافس)</h4>`;
        advice += `<p>متوسط القوة: ${compStrengthAvg.toFixed(1)}/10 | متوسط الضعف: ${compWeaknessAvg.toFixed(1)}/10 | مؤشر المنافسة: ${compIndex.toFixed(1)} ${compColor} (${compDesc})</p>`;
        advice += `<h4>🌟 مؤشر جاذبية السوق: ${marketScore}/10 ${marketColor}</h4>`;
        advice += `<h4>💡 التوجيه الاستراتيجي</h4>`;
        let finalAdvice = `الهامش التسويقي ${marketingContribution >=0 ? 'إيجابي' : 'سلبي'} بمقدار ${d.currency}${Math.abs(marketingContribution).toLocaleString()}. `;
        if (marketingContribution > 0 && roas > 2) {
            finalAdvice += 'يبدو النموذج التسويقي واعداً، يمكن زيادة الميزانية لاقتناص حصة أكبر.';
        } else if (marketingContribution > 0 && roas <= 2) {
            finalAdvice += 'الهامش التسويقي إيجابي لكن العائد الإعلاني منخفض، راجع كفاءة القنوات.';
        } else {
            finalAdvice += 'الإنفاق التسويقي لا يغطي تكاليفه، أعد النظر في استراتيجية الاكتساب أو التسعير.';
        }
        finalAdvice += '<br><small>* الهامش التسويقي يمثل الإيرادات ناقص تكاليف التسويق فقط، ولا يشمل المصاريف التشغيلية الأخرى.</small>';
        advice += `<p>${finalAdvice}</p>`;
        document.getElementById('strategicAdvice').innerHTML = advice;

        if (revenueChart) revenueChart.destroy();
        const ctx1 = document.getElementById('revenueChart').getContext('2d');
        revenueChart = new Chart(ctx1, {
            type: 'bar',
            data: {
                labels: ['الإيرادات السنوية', 'تكاليف التسويق السنوية'],
                datasets: [{ label: `القيمة (${d.currency})`, data: [annualRevenue, annualMarketingCost], backgroundColor: ['#b8860b', '#dc3545'] }]
            },
            options: { responsive: true, maintainAspectRatio: false, animation: false }
        });

        if (breakEvenChart) breakEvenChart.destroy();
        const ctx2 = document.getElementById('breakEvenChart').getContext('2d');
        breakEvenChart = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels: ['عملاء حاليون', 'عملاء التعادل (تكاليف التسويق)'],
                datasets: [{ data: [totalActiveCustomers, Math.ceil(breakEvenCustomers)], backgroundColor: ['#28a745', '#17a2b8'] }]
            },
            options: { responsive: true, maintainAspectRatio: false, animation: false }
        });

        window.lastMarketingResults = {
            inputs: d,
            outputs: {
                totalActiveCustomers, annualRevenue, annualMarketingCost, marketingContribution,
                cac, roas, ltv, breakEvenCustomers,
                compStrengthAvg, compWeaknessAvg, compIndex, compDesc, compColor,
                marketScore, marketColor, warnings
            }
        };
    });

    // ================================================================
    // ========== تصدير Word ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', function() {
        if (document.getElementById('resultsSection').style.display === 'none') {
            alert('الرجاء إجراء التحليل أولاً');
            return;
        }
        showLoading('جاري إنشاء تقرير Word...', 'جمع البيانات');
        try {
            const d = getData();
            const res = window.lastMarketingResults?.outputs || {};
            const currency = d.currency;
            const companyName = d.companyName;

            const chart1 = document.getElementById('revenueChart');
            const chart2 = document.getElementById('breakEvenChart');
            let img1 = '', img2 = '';
            if (chart1) img1 = chart1.toDataURL('image/png');
            if (chart2) img2 = chart2.toDataURL('image/png');

            const kpiCards = document.querySelectorAll('.result-card');
            let kpiRows = ''; let row = ''; let count = 0;
            kpiCards.forEach((card, index) => {
                const icon = card.querySelector('i') ? card.querySelector('i').outerHTML : '';
                const title = card.querySelector('.label') ? card.querySelector('.label').innerText : '';
                const value = card.querySelector('.value') ? card.querySelector('.value').innerText : '';
                const unit = card.querySelector('.unit') ? card.querySelector('.unit').innerText : '';
                const cell = `<td style="border:1px solid #b8860b; padding:10px; text-align:center; background:#fefcf6;">${icon}<h4 style="margin:0.3rem 0; color:#666; font-size:0.9rem;">${title}</h4><div style="font-size:1.4rem; font-weight:900; color:#b8860b;">${value}</div>${unit ? `<div style="font-size:0.8rem; color:#777;">${unit}</div>` : ''}</td>`;
                row += cell; count++;
                if (count % 2 === 0 || index === kpiCards.length - 1) { kpiRows += `<tr>${row}</tr>`; row = ''; }
            });

            const warningsHTML = document.getElementById('alerts')?.innerHTML || '';
            const strategicHTML = document.getElementById('strategicAdvice')?.innerHTML || '';
            const now = new Date();
            const dateStr = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

            const fullHtml = `<!DOCTYPE html>
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
            <head><meta charset='utf-8'><title>تقرير تسويقي - FAROUK GRUP</title>
            <style>
                body{font-family:'Arial',sans-serif;direction:rtl;margin:2rem;background:#fff;color:#333;}
                .cover{text-align:center;border-bottom:4px solid #b8860b;margin-bottom:30px;padding-bottom:20px;}
                .cover h1{font-size:28px;color:#b8860b;margin:0;}.cover h2{font-size:20px;color:#b48554;margin:5px 0;}
                table{width:100%;border-collapse:collapse;margin:15px 0;} th,td{border:1px solid #b8860b;padding:8px;text-align:center;}
                th{background:#fefcf6;color:#b8860b;}
                .chart-img{max-width:100%;border:1px solid #b8860b;border-radius:8px;margin:15px 0;}
                .footer{text-align:center;margin-top:30px;color:#888;border-top:1px dashed #b8860b;padding-top:10px;}
                .alert-box{background:#fff3cd;padding:12px;border-radius:8px;border-right:4px solid #ffc107;margin:15px 0;}
                .strategic-box{background:#fefcf6;padding:12px;border-radius:8px;border-right:4px solid #b8860b;margin:15px 0;}
            </style></head>
            <body>
                <div class="cover">
                    <h1>مجموعة فاروق للاستشارات والأعمال</h1>
                    <h2>تقرير الدراسة التسويقية الشاملة</h2>
                    <p>الجهة: ${companyName} | التاريخ: ${dateStr}</p>
                    <p>العملة: ${currency}</p>
                </div>
                <h2 style="color:#b8860b;">المدخلات الأساسية</h2>
                <table>
                    <tr><th>اسم المشروع</th><td>${d.projectName}</td><th>الموقع</th><td>${d.location}</td></tr>
                    <tr><th>إجمالي السوق (TAM)</th><td>${d.tam.toLocaleString()}</td><th>السوق القابل للخدمة (SAM)</th><td>${d.sam.toLocaleString()}</td></tr>
                    <tr><th>الحصة المستهدفة (SOM)</th><td>${d.som.toLocaleString()}</td><th>نمو سنوي</th><td>${(d.growthRate*100).toFixed(1)}%</td></tr>
                    <tr><th>عدد المنافسين</th><td>${d.competitors.length}</td><th>مدة الدراسة</th><td>${d.studyMonths} شهر</td></tr>
                    <tr><th>سعر الوجبة</th><td>${currency} ${d.price}</td><th>تكلفة الوجبة</th><td>${currency} ${d.costPerMeal}</td></tr>
                </table>
                <h2 style="color:#b8860b;">مؤشرات الأداء التسويقية</h2>
                <table>${kpiRows}</table>
                ${warningsHTML ? `<div class="alert-box">${warningsHTML}</div>` : ''}
                <div class="strategic-box">${strategicHTML}</div>
                <h2 style="color:#b8860b;">📈 الرسوم البيانية</h2>
                <div style="display:flex;gap:15px;flex-wrap:wrap;justify-content:center;">
                    ${img1 ? `<div style="flex:1;min-width:280px;"><img src="${img1}" class="chart-img"/></div>` : ''}
                    ${img2 ? `<div style="flex:1;min-width:280px;"><img src="${img2}" class="chart-img"/></div>` : ''}
                </div>
                <div class="footer">تم الإنشاء بواسطة مجموعة فاروق للاستشارات والأعمال © ${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `تقرير_تسويقي_${d.projectName}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (err) { alert('خطأ في Word: ' + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== تصدير Excel احترافي ==========
    // ================================================================
    document.getElementById('exportFullExcelBtn').addEventListener('click', async function() {
        if (!window.lastMarketingResults) {
            alert('الرجاء إجراء التحليل أولاً (اضغط على "احسب الدراسة الآن").');
            return;
        }
        showLoading('جاري إنشاء تقرير Excel...', 'إنشاء الأوراق والرسوم');
        try {
            const data = window.lastMarketingResults;
            const d = data.inputs;
            const out = data.outputs;
            const currency = d.currency;
            const companyName = d.companyName;

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'FAROUK GRUP';
            const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050';
            const AR = 'FFF5F0E8', DT = 'FF1A1A1A', PB = 'FFD4EDDA', NB = 'FFF8D7DA', GB = 'FFFFF3CD';
            const PT = 'FF155724', NT = 'FF721C24';

            function hs(bg=HB, tc=GL){return{font:{name:'Arial',bold:true,size:11,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',wrapText:true,readingOrder:'rtl'},border:{top:{style:'thin',color:{argb:G}},bottom:{style:'thin',color:{argb:G}},left:{style:'thin',color:{argb:G}},right:{style:'thin',color:{argb:G}}}};}
            function cs(bg='FFFFFFFF',tc=DT,b=false,h='center'){return{font:{name:'Arial',bold:b,size:10,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:h,vertical:'middle',wrapText:true,readingOrder:'rtl'},border:{top:{style:'hair',color:{argb:'FFCCCCCC'}},bottom:{style:'hair',color:{argb:'FFCCCCCC'}},left:{style:'hair',color:{argb:'FFCCCCCC'}},right:{style:'hair',color:{argb:'FFCCCCCC'}}}};}
            function ap(c,s){if(s.font)c.font=s.font;if(s.fill)c.fill=s.fill;if(s.alignment)c.alignment=s.alignment;if(s.border)c.border=s.border;if(s.numFmt)c.numFmt=s.numFmt;}
            function mh(ws,fc,tc,r,text,bg=HB,tc2=GL,fs=12){ws.mergeCells(r,fc,r,tc);const c=ws.getCell(r,fc);c.value=text;c.font={name:'Arial',bold:true,size:fs,color:{argb:tc2}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:'rtl'};c.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};}

            // 1. غلاف التقرير
            const cv = workbook.addWorksheet('غلاف التقرير', { views: [{ rightToLeft: true, showGridLines: false }] });
            [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
            cv.getRow(2).height=70; cv.getRow(4).height=50;
            cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1);
            bc.value='مجموعة فاروق للاستشارات والأعمال\nFAROUK GRUP';
            bc.font={name:'Arial',bold:true,size:26,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:'rtl'};
            mh(cv,1,4,4,`تقرير الدراسة التسويقية\n${companyName}`,DB,GL,17);
            const inf=[['📋 الجهة',companyName],['📅 التاريخ',new Date().toLocaleDateString('ar-EG')],['💰 العملة',currency],['📊 الإيرادات السنوية',`${currency} ${out.annualRevenue.toLocaleString()}`],['📈 ROAS',`${out.roas}x`]];
            let ir=6;
            inf.forEach(([l,v],idx)=>{
                cv.mergeCells(ir,1,ir,2); cv.mergeCells(ir,3,ir,4);
                const lc=cv.getCell(ir,1), vc=cv.getCell(ir,3); lc.value=l; vc.value=v;
                const bg=idx%2===0?AR:'FFFEFCF6';
                ap(lc,{font:{name:'Arial',bold:true,size:11,color:{argb:'00695C'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'right',vertical:'middle',readingOrder:'rtl'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                ap(vc,{font:{name:'Arial',size:11,color:{argb:DT}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',readingOrder:'rtl'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                cv.getRow(ir).height=26; ir++;
            });

            // 2. المدخلات
            const inputsSheet = workbook.addWorksheet('المدخلات والافتراضات', { views: [{ rightToLeft: true, showGridLines: false }] });
            inputsSheet.getColumn(1).width=5; inputsSheet.getColumn(2).width=38; inputsSheet.getColumn(3).width=22; inputsSheet.getColumn(4).width=22; inputsSheet.getColumn(5).width=5;
            mh(inputsSheet,1,5,1,'📋 جدول المدخلات والافتراضات الأساسية',DB,GL,14);
            inputsSheet.getRow(1).height=35;
            mh(inputsSheet,2,4,2,'البيانات الأساسية للمشروع',SB,'FFFFFFFF',11);
            inputsSheet.getRow(2).height=24;
            const inputFields = [
                ['اسم المشروع', d.projectName, ''],
                ['الموقع', d.location, ''],
                ['مدة الدراسة (شهر)', d.studyMonths, ''],
                ['إجمالي السوق (TAM)', d.tam, ''],
                ['السوق القابل للخدمة (SAM)', d.sam, ''],
                ['الحصة المستهدفة (SOM)', d.som, ''],
                ['نمو سنوي (%)', d.growthRate*100, '%'],
                ['الشريحة العمرية', d.ageGroup, ''],
                ['المنطقة الجغرافية', d.geoArea, ''],
                ['حجم الجمهور المحتمل', d.audienceSize, ''],
                ['عدد المنافسين', d.competitors.length, ''],
                ['متوسط قوة المنافسين', out.compStrengthAvg.toFixed(1), '/10'],
                ['متوسط ضعف المنافسين', out.compWeaknessAvg.toFixed(1), '/10'],
                ['سعر الوجبة', d.price, ''],
                ['تكلفة الوجبة', d.costPerMeal, ''],
                ['عدد فريق التسويق', d.marketingTeam, ''],
                ['مدة الخطة (شهر)', d.planDuration, ''],
                ['الإيجار الشهري', d.rent, ''],
                ['الرواتب الشهرية', d.salaries, ''],
                ['الفواتير', d.utilities, ''],
                ['مصاريف أخرى', d.otherOpCost, ''],
                ['مرات الشراء شهرياً', d.purchaseFrequency, ''],
                ['مدة الولاء (شهر)', d.loyaltyMonths, ''],
                ['عملاء عابرون', d.walkIn, '']
            ];
            let iRow=3;
            inputFields.forEach(([label,val,note],idx)=>{
                inputsSheet.getRow(iRow).height=22;
                const bg=idx%2===0?'FFFEFCF6':'FFFFFFFF';
                const lc=inputsSheet.getCell(iRow,2), vc=inputsSheet.getCell(iRow,3), nc=inputsSheet.getCell(iRow,4);
                lc.value=label; vc.value=val; nc.value=note;
                ap(lc,cs(bg,DT,true,'right'));
                ap(vc,{...cs(bg,'0000FF',false,'center'),numFmt:typeof val==='number'?'#,##0':null});
                ap(nc,cs(bg,'00695C',false,'center'));
                iRow++;
            });

            // 3. مؤشرات الأداء
            const kpiSheet = workbook.addWorksheet('مؤشرات الأداء التسويقية', { views: [{ rightToLeft: true, showGridLines: false }] });
            [5,32,22,22,22,5].forEach((w,i)=>kpiSheet.getColumn(i+1).width=w);
            mh(kpiSheet,1,6,1,'📊 لوحة مؤشرات الأداء التسويقية',DB,GL,15);
            kpiSheet.getRow(1).height=40;
            mh(kpiSheet,2,5,2,`${companyName} | ${new Date().toLocaleDateString('ar-EG')}`,HB,'FFFFFFFF',10);
            kpiSheet.getRow(2).height=24;
            const kpis = [
                { label: 'العملاء النشطين', value: out.totalActiveCustomers, good: true },
                { label: 'الإيرادات السنوية', value: `${currency} ${out.annualRevenue.toLocaleString()}`, good: out.annualRevenue>0 },
                { label: 'تكاليف التسويق السنوية', value: `${currency} ${out.annualMarketingCost.toLocaleString()}`, good: true },
                { label: 'الهامش التسويقي', value: `${currency} ${out.marketingContribution.toLocaleString()}`, good: out.marketingContribution>0 },
                { label: 'تكلفة الاستحواذ (CAC)', value: `${currency} ${out.cac.toFixed(2)}`, good: out.cac>0 },
                { label: 'القيمة الدائمة (LTV)', value: `${currency} ${out.ltv.toFixed(2)}`, good: out.ltv>0 }
            ];
            let kRow=3;
            kpis.forEach((k,idx)=>{
                kpiSheet.getRow(kRow).height=36;
                kpiSheet.mergeCells(kRow,2,kRow,2); kpiSheet.mergeCells(kRow,3,kRow,3); kpiSheet.mergeCells(kRow,4,kRow,4); kpiSheet.mergeCells(kRow,5,kRow,5);
                const ic=kpiSheet.getCell(kRow,2); ic.value=`🔹 ${idx+1}`;
                const lc2=kpiSheet.getCell(kRow,3); lc2.value=k.label;
                const vc3=kpiSheet.getCell(kRow,4); vc3.value=k.value;
                const nc2=kpiSheet.getCell(kRow,5); nc2.value='';
                const bg=k.good?PB:NB, tc=k.good?PT:NT;
                [ic,lc2,vc3,nc2].forEach(c=>{c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}}; c.border={top:{style:'thin',color:{argb:G}},bottom:{style:'thin',color:{argb:G}},left:{style:'thin',color:{argb:G}},right:{style:'thin',color:{argb:G}}};});
                ic.font={name:'Arial',bold:true,size:13,color:{argb:'555555'}}; ic.alignment={horizontal:'center',vertical:'middle'};
                lc2.font={name:'Arial',bold:true,size:10,color:{argb:DT}}; lc2.alignment={horizontal:'right',vertical:'middle',readingOrder:'rtl'};
                vc3.font={name:'Arial',bold:true,size:12,color:{argb:tc}}; vc3.alignment={horizontal:'center',vertical:'middle'};
                kRow++;
            });
            kRow++;
            kpiSheet.mergeCells(kRow,2,kRow,5);
            const kFinal=kpiSheet.getCell(kRow,2);
            kFinal.value=out.marketingContribution>0?'✅ الهامش التسويقي إيجابي (نموذج واعد)':'⚠️ الهامش التسويقي سلبي (يحتاج مراجعة)';
            kFinal.font={name:'Arial',bold:true,size:12,color:{argb:out.marketingContribution>0?PT:'856404'}};
            kFinal.fill={type:'pattern',pattern:'solid',fgColor:{argb:out.marketingContribution>0?PB:GB}};
            kFinal.alignment={horizontal:'center',vertical:'middle',readingOrder:'rtl'};
            kFinal.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};
            kpiSheet.getRow(kRow).height=36;

            // 4. التحذيرات
            if (out.warnings && out.warnings.length) {
                const warnSheet = workbook.addWorksheet('التحذيرات', { views: [{ rightToLeft: true, showGridLines: false }] });
                warnSheet.getColumn(1).width=5; warnSheet.getColumn(2).width=50; warnSheet.getColumn(3).width=5;
                mh(warnSheet,1,3,1,'⚠️ قائمة التحذيرات',DB,'FFDC3545',14);
                warnSheet.getRow(1).height=35;
                let wRow=2;
                out.warnings.forEach((w,idx)=>{
                    warnSheet.getRow(wRow).height=22;
                    warnSheet.mergeCells(wRow,2,wRow,2);
                    const c=warnSheet.getCell(wRow,2);
                    c.value=`${idx+1}. ${w}`;
                    c.font={name:'Arial',size:10,color:{argb:'FF721C24'}};
                    c.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF8D7DA'}};
                    c.alignment={horizontal:'right',vertical:'middle',wrapText:true,readingOrder:'rtl'};
                    c.border={top:{style:'hair'},bottom:{style:'hair',color:{argb:G}},left:{style:'hair'},right:{style:'hair'}};
                    wRow++;
                });
            }

            // 5. الرسوم البيانية
            const chartsSheet = workbook.addWorksheet('الرسوم البيانية', { views: [{ rightToLeft: true, showGridLines: false }] });
            chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
            mh(chartsSheet,1,3,1,'📊 الرسوم البيانية للمشروع',DB,GL,14);
            chartsSheet.getRow(1).height=35;
            const chartContainer = document.querySelector('.chart-grid');
            if (chartContainer) {
                try {
                    const origBg = chartContainer.style.backgroundColor;
                    chartContainer.style.backgroundColor = '#ffffff';
                    const canvasImg = await html2canvas(chartContainer, { scale: 2, backgroundColor: '#ffffff' });
                    chartContainer.style.backgroundColor = origBg;
                    const imgData = canvasImg.toDataURL('image/png');
                    const imageId = workbook.addImage({ base64: imgData, extension: 'png' });
                    chartsSheet.addImage(imageId, { tl: { col: 1, row: 2 }, br: { col: 2, row: 26 }, editAs: 'oneCell' });
                } catch(err) {}
            }

            // 6. التقييم والتوصيات
            const evalSheet = workbook.addWorksheet('التقييم والتوصيات', { views: [{ rightToLeft: true, showGridLines: false }] });
            evalSheet.getColumn(1).width=5; evalSheet.getColumn(2).width=50; evalSheet.getColumn(3).width=5;
            mh(evalSheet,1,3,1,'📝 التقييم والتوصيات',DB,GL,14);
            evalSheet.getRow(1).height=35;
            const warningsText = out.warnings && out.warnings.length ? out.warnings.join('\n') : 'لا توجد تحذيرات حالياً.';
            const sections = [
                { title: '1. مؤشر جاذبية السوق', content: `${out.marketScore}/10 ${out.marketColor}` },
                { title: '2. تحليل المنافسين', content: `القوة: ${out.compStrengthAvg.toFixed(1)}/10 | الضعف: ${out.compWeaknessAvg.toFixed(1)}/10\n${out.compDesc}` },
                { title: '3. التحذيرات', content: warningsText },
                { title: '4. التوصيات', content: out.marketingContribution>0 ? '• النموذج التسويقي واعد.\n• يُنصح بزيادة الميزانية التسويقية تدريجياً مع مراقبة ROAS.\n• العمل على تحسين LTV عبر برامج الولاء.' : '• الهامش التسويقي سلبي.\n• راجع هيكل التكاليف أو ارفع الأسعار.\n• اختبر قنوات تسويقية أكثر كفاءة.' }
            ];
            let itRow=2;
            sections.forEach((sec,idx)=>{
                itRow++;
                evalSheet.getRow(itRow).height=26;
                evalSheet.mergeCells(itRow,2,itRow,2);
                const tc3=evalSheet.getCell(itRow,2);
                tc3.value=sec.title;
                tc3.font={name:'Arial',bold:true,size:11,color:{argb:GL}};
                tc3.fill={type:'pattern',pattern:'solid',fgColor:{argb:idx%2===0?HB:SB}};
                tc3.alignment={horizontal:'right',vertical:'middle',readingOrder:'rtl'};
                tc3.border={bottom:{style:'medium',color:{argb:G}}};
                itRow++;
                evalSheet.getRow(itRow).height=Math.max(50, sec.content.split('\n').length*16);
                evalSheet.mergeCells(itRow,2,itRow,2);
                const cc=evalSheet.getCell(itRow,2);
                cc.value=sec.content;
                cc.font={name:'Arial',size:10,color:{argb:DT}};
                cc.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFEFCF6'}};
                cc.alignment={horizontal:'right',vertical:'top',wrapText:true,readingOrder:'rtl'};
                cc.border={top:{style:'hair'},bottom:{style:'hair',color:{argb:G}},left:{style:'hair'},right:{style:'hair'}};
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const now = new Date();
            const fileName = `تقرير_تسويقي_${d.projectName}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert('خطأ Excel: ' + err.message); } finally { hideLoading(); }
    });

    // ===== تصدير PDF =====
    document.getElementById('exportPdfBtn').addEventListener('click', async function() {
        if (document.getElementById('resultsSection').style.display === 'none') {
            alert('الرجاء إجراء التحليل أولاً');
            return;
        }
        try {
            const cloneSection = document.getElementById('resultsSection').cloneNode(true);
            const actionBar = cloneSection.querySelector('.action-bar');
            if (actionBar) actionBar.remove();
            cloneSection.querySelectorAll('button').forEach(btn => btn.style.display = 'none');
            cloneSection.style.backgroundColor = '#ffffff';
            cloneSection.style.padding = '15px';
            cloneSection.style.borderRadius = '10px';
            cloneSection.style.direction = 'rtl';
            cloneSection.style.fontFamily = 'Tajawal, sans-serif';

            const d = getData();
            const headerDiv = document.createElement('div');
            headerDiv.innerHTML = `<div style="text-align:center; border-bottom:3px solid #b8860b; padding-bottom:10px; margin-bottom:15px;"><h2 style="color:#b8860b; font-size:22px;">مجموعة فاروق للاستشارات والأعمال</h2><p style="font-size:16px; color:#333;">تقرير الدراسة التسويقية: ${d.projectName}</p><p style="font-size:14px; color:#666;">الجهة: ${d.companyName} | التاريخ: ${new Date().toLocaleDateString('ar-EG')}</p></div>`;
            cloneSection.insertBefore(headerDiv, cloneSection.firstChild);
            const footerDiv = document.createElement('div');
            footerDiv.innerHTML = `<div style="text-align:center; margin-top:20px; padding-top:10px; border-top:1px dashed #b8860b; color:#888;">© ${new Date().getFullYear()} FAROUK GRUP</div>`;
            cloneSection.appendChild(footerDiv);

            cloneSection.style.position = 'absolute';
            cloneSection.style.left = '-9999px';
            cloneSection.style.top = '0';
            document.body.appendChild(cloneSection);

            const canvas = await html2canvas(cloneSection, { scale: 2, backgroundColor: '#ffffff' });
            const imgData = canvas.toDataURL('image/png');
            document.body.removeChild(cloneSection);

            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgHeight = (canvas.height * pdfWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdf.internal.pageSize.getHeight();
            }
            pdf.save('تقرير_تسويقي_FAROUK.pdf');
        } catch (error) {
            alert('حدث خطأ: ' + error.message);
        }
    });

    renderCompetitors();
    renderChannels();
