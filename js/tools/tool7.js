
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

    // ===== شاشة تحميل =====
    function showLoading(title, msg) {
        document.getElementById('loadingTitle').textContent = title;
        document.getElementById('loadingMsg').textContent = msg;
        document.getElementById('exportLoading').classList.add('show');
    }
    function hideLoading() {
        document.getElementById('exportLoading').classList.remove('show');
    }

    // ===== المتغيرات العامة =====
    let breakevenChart = null;
    let globalResults = {};

    // ===== دالة الحساب =====
    function computeBreakeven() {
        const currency = document.getElementById('currencySelect').value;
        const fixedCosts = parseFloat(document.getElementById('fixedCosts').value) || 0;
        const unitPrice = parseFloat(document.getElementById('unitPrice').value) || 0;
        const unitCost = parseFloat(document.getElementById('unitCost').value) || 0;
        if (fixedCosts <= 0 || unitPrice <= 0 || unitCost < 0) {
            alert('الرجاء إدخال قيم صحيحة (التكاليف الثابتة وسعر البيع أكبر من صفر).');
            return null;
        }
        const contributionMargin = unitPrice - unitCost;
        let breakevenUnits = 0, breakevenRevenue = 0, contributionMarginPercent = 0;
        if (contributionMargin > 0) {
            breakevenUnits = fixedCosts / contributionMargin;
            breakevenRevenue = breakevenUnits * unitPrice;
            contributionMarginPercent = (contributionMargin / unitPrice) * 100;
        } else {
            breakevenUnits = Infinity;
            breakevenRevenue = Infinity;
            contributionMarginPercent = (contributionMargin / unitPrice) * 100;
        }
        return {
            currency, fixedCosts, unitPrice, unitCost,
            contributionMargin, breakevenUnits, breakevenRevenue, contributionMarginPercent,
            companyName: document.getElementById('companyName').value || 'الجهة المستفيدة'
        };
    }

    // ===== تحديث واجهة النتائج =====
    function updateUI(results) {
        if (!results) return;
        const { currency, fixedCosts, unitPrice, unitCost, contributionMargin, breakevenUnits, breakevenRevenue, contributionMarginPercent, companyName } = results;
        const beUnitsDisplay = isFinite(breakevenUnits) ? breakevenUnits.toFixed(0) : '∞';
        const beRevenueDisplay = isFinite(breakevenRevenue) ? currency + ' ' + breakevenRevenue.toFixed(0) : 'غير قابل للتحقيق';

        document.getElementById('kpiCards').innerHTML = `
            <div class="result-card"><i class="fas fa-cubes"></i><h4>كمية التعادل</h4><div class="value">${beUnitsDisplay}</div><div class="unit">وحدة / شهر</div></div>
            <div class="result-card"><i class="fas fa-dollar-sign"></i><h4>إيرادات التعادل</h4><div class="value">${beRevenueDisplay}</div><div class="unit">شهرياً</div></div>
            <div class="result-card"><i class="fas fa-chart-pie"></i><h4>هامش المساهمة</h4><div class="value">${currency}${contributionMargin.toFixed(2)}</div><div class="unit">للوحدة</div></div>
            <div class="result-card"><i class="fas fa-percent"></i><h4>نسبة هامش المساهمة</h4><div class="value">${contributionMarginPercent.toFixed(2)}%</div></div>
        `;

        document.getElementById('summaryTable').innerHTML = `
            <table>
                <thead><tr><th>البيان</th><th>القيمة</th></tr></thead>
                <tbody>
                    <tr><td>التكاليف الثابتة الشهرية</td><td>${currency}${fixedCosts.toFixed(0)}</td></tr>
                    <tr><td>سعر بيع الوحدة</td><td>${currency}${unitPrice.toFixed(2)}</td></tr>
                    <tr><td>التكلفة المتغيرة للوحدة</td><td>${currency}${unitCost.toFixed(2)}</td></tr>
                    <tr><td>هامش المساهمة للوحدة</td><td>${currency}${contributionMargin.toFixed(2)}</td></tr>
                    <tr><td>كمية التعادل الشهرية</td><td>${beUnitsDisplay} وحدة</td></tr>
                    <tr><td>إيرادات التعادل الشهرية</td><td>${isFinite(breakevenRevenue) ? currency + ' ' + breakevenRevenue.toFixed(0) : 'غير قابل للتحقيق'}</td></tr>
                </tbody>
            </table>
        `;

        // الرسم البياني
        const ctx = document.getElementById('breakevenChart').getContext('2d');
        if (breakevenChart) breakevenChart.destroy();
        let maxUnits = 1000;
        if (isFinite(breakevenUnits) && breakevenUnits > 0) maxUnits = Math.ceil(breakevenUnits * 2);
        const step = Math.ceil(maxUnits / 20);
        const labels = [], revenueData = [], costData = [], beLine = [];
        for (let units = 0; units <= maxUnits; units += step) {
            labels.push(units);
            revenueData.push(units * unitPrice);
            costData.push(fixedCosts + units * unitCost);
            beLine.push(isFinite(breakevenRevenue) ? breakevenRevenue : null);
        }
        breakevenChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: 'الإيرادات', data: revenueData, borderColor: '#28a745', backgroundColor: 'rgba(40,167,69,0.1)', tension: 0.1, fill: false },
                    { label: 'التكاليف الكلية', data: costData, borderColor: '#dc3545', backgroundColor: 'rgba(220,53,69,0.1)', tension: 0.1, fill: false },
                    { label: 'نقطة التعادل', data: beLine.map(val => val), borderColor: '#b8860b', borderDash: [5,5], pointRadius: 0, fill: false }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, ticks: { color: '#aab7d4' }, grid: { color: 'rgba(180,133,84,0.2)' } },
                    x: { ticks: { color: '#aab7d4' } }
                },
                plugins: { legend: { labels: { color: '#f0f4fa' } } }
            }
        });

        globalResults = {
            inputs: { fixedCosts, unitPrice, unitCost, companyName, currency },
            outputs: { contributionMargin, breakevenUnits, breakevenRevenue, contributionMarginPercent, beUnitsDisplay, beRevenueDisplay }
        };
    }

    // ===== زر الحساب =====
    document.getElementById('calculateBtn').addEventListener('click', function() {
        const results = computeBreakeven();
        if (!results) return;
        document.getElementById('initialMessage').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';
        updateUI(results);
    });

    // ================================================================
    // ========== تصدير Excel شامل ==========
    // ================================================================
    document.getElementById('exportFullExcelBtn').addEventListener('click', async function() {
        if (document.getElementById('resultsSection').style.display === 'none') {
            alert('الرجاء إجراء التحليل أولاً.');
            return;
        }
        if (!globalResults.outputs) {
            alert('الرجاء حساب النتائج أولاً.');
            return;
        }
        showLoading('جاري إنشاء تقرير Excel...', 'إنشاء الأوراق والرسوم');
        try {
            const R = globalResults.outputs;
            const I = globalResults.inputs;
            const currency = I.currency;
            const companyName = I.companyName;

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
            cv.getRow(2).height=80; cv.getRow(4).height=60;
            cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1);
            bc.value='مجموعة فاروق للاستشارات والأعمال\nFAROUK GRUP';
            bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:'rtl'};
            mh(cv,1,4,4,`تقرير تحليل نقطة التعادل\n${companyName}`,DB,GL,18);
            const inf=[['📋 الجهة',companyName],['📅 التاريخ',new Date().toLocaleDateString('ar-EG')],['💰 العملة',currency],['🏦 التكاليف الثابتة',`${currency} ${I.fixedCosts.toFixed(0)}`],['📈 كمية التعادل',R.beUnitsDisplay],['💵 إيرادات التعادل',R.beRevenueDisplay]];
            let ir=6;
            inf.forEach(([l,v],idx)=>{
                cv.mergeCells(ir,1,ir,2); cv.mergeCells(ir,3,ir,4);
                const lc=cv.getCell(ir,1), vc=cv.getCell(ir,3); lc.value=l; vc.value=v;
                const bg=idx%2===0?AR:'FFFEFCF6';
                ap(lc,{font:{name:'Arial',bold:true,size:11,color:{argb:'00695C'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'right',vertical:'middle',readingOrder:'rtl'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                ap(vc,{font:{name:'Arial',size:11,color:{argb:DT}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',readingOrder:'rtl'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                cv.getRow(ir).height=28; ir++;
            });
            const vr=ir+1, isg=R.contributionMargin>0;
            cv.mergeCells(vr,1,vr,4); const vc2=cv.getCell(vr,1);
            vc2.value=isg?'✅ هامش المساهمة إيجابي — يمكن تحقيق التعادل':'⚠️ هامش المساهمة سالب أو صفر — لا يمكن تحقيق التعادل';
            vc2.font={name:'Arial',bold:true,size:14,color:{argb:isg?PT:'856404'}};
            vc2.fill={type:'pattern',pattern:'solid',fgColor:{argb:isg?PB:GB}};
            vc2.alignment={horizontal:'center',vertical:'middle',readingOrder:'rtl'};
            vc2.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};
            cv.getRow(vr).height=40;

            // 2. المدخلات
            const inputsSheet = workbook.addWorksheet('المدخلات والافتراضات', { views: [{ rightToLeft: true, showGridLines: false }] });
            inputsSheet.getColumn(1).width=5; inputsSheet.getColumn(2).width=38; inputsSheet.getColumn(3).width=22; inputsSheet.getColumn(4).width=22; inputsSheet.getColumn(5).width=5;
            mh(inputsSheet,1,5,1,'📋 جدول المدخلات والافتراضات الأساسية',DB,GL,14);
            inputsSheet.getRow(1).height=40;
            mh(inputsSheet,2,4,2,'البيانات الأساسية للمشروع',SB,'FFFFFFFF',11);
            inputsSheet.getRow(2).height=28;
            const inputFields = [
                ['التكاليف الثابتة الشهرية', I.fixedCosts, ''],
                ['سعر بيع الوحدة', I.unitPrice, ''],
                ['التكلفة المتغيرة للوحدة', I.unitCost, ''],
                ['العملة', I.currency, ''],
                ['اسم الجهة', I.companyName, '']
            ];
            let iRow=3;
            inputFields.forEach(([label,val,note],idx)=>{
                inputsSheet.getRow(iRow).height=24;
                const bg=idx%2===0?'FFFEFCF6':'FFFFFFFF';
                const lc=inputsSheet.getCell(iRow,2), vc=inputsSheet.getCell(iRow,3), nc=inputsSheet.getCell(iRow,4);
                lc.value=label; vc.value=val; nc.value=note;
                ap(lc,cs(bg,DT,true,'right'));
                ap(vc,{...cs(bg,'0000FF',false,'center'),numFmt:typeof val==='number'?'#,##0.00':null});
                ap(nc,cs(bg,'00695C',false,'center'));
                iRow++;
            });

            // 3. مؤشرات الأداء
            const kpiSheet = workbook.addWorksheet('مؤشرات الأداء الرئيسية', { views: [{ rightToLeft: true, showGridLines: false }] });
            [5,32,22,22,22,5].forEach((w,i)=>kpiSheet.getColumn(i+1).width=w);
            mh(kpiSheet,1,6,1,'📊 لوحة مؤشرات الأداء الرئيسية',DB,GL,15);
            kpiSheet.getRow(1).height=45;
            mh(kpiSheet,2,5,2,`${companyName} | ${new Date().toLocaleDateString('ar-EG')}`,HB,'FFFFFFFF',10);
            kpiSheet.getRow(2).height=26;
            const kpis = [
                { label: 'كمية التعادل الشهرية', value: R.beUnitsDisplay, good: isFinite(R.breakevenUnits) },
                { label: 'إيرادات التعادل الشهرية', value: R.beRevenueDisplay, good: isFinite(R.breakevenRevenue) },
                { label: 'هامش المساهمة للوحدة', value: `${currency}${R.contributionMargin.toFixed(2)}`, good: R.contributionMargin>0 },
                { label: 'نسبة هامش المساهمة', value: `${R.contributionMarginPercent.toFixed(2)}%`, good: true }
            ];
            let kRow=3;
            kpis.forEach((k,idx)=>{
                kpiSheet.getRow(kRow).height=40;
                kpiSheet.mergeCells(kRow,2,kRow,2); kpiSheet.mergeCells(kRow,3,kRow,3); kpiSheet.mergeCells(kRow,4,kRow,4); kpiSheet.mergeCells(kRow,5,kRow,5);
                const ic=kpiSheet.getCell(kRow,2); ic.value=`🔹 ${idx+1}`;
                const lc2=kpiSheet.getCell(kRow,3); lc2.value=k.label;
                const vc3=kpiSheet.getCell(kRow,4); vc3.value=k.value;
                const nc2=kpiSheet.getCell(kRow,5); nc2.value=k.good?'✅ إيجابي':'⚠️ مراجعة';
                const bg=k.good?PB:NB, tc=k.good?PT:NT;
                [ic,lc2,vc3,nc2].forEach(c=>{c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}}; c.border={top:{style:'thin',color:{argb:G}},bottom:{style:'thin',color:{argb:G}},left:{style:'thin',color:{argb:G}},right:{style:'thin',color:{argb:G}}};});
                ic.font={name:'Arial',bold:true,size:14,color:{argb:'555555'}}; ic.alignment={horizontal:'center',vertical:'middle'};
                lc2.font={name:'Arial',bold:true,size:11,color:{argb:DT}}; lc2.alignment={horizontal:'right',vertical:'middle',readingOrder:'rtl'};
                vc3.font={name:'Arial',bold:true,size:13,color:{argb:tc}}; vc3.alignment={horizontal:'center',vertical:'middle'};
                kRow++;
            });
            kRow++;
            kpiSheet.mergeCells(kRow,2,kRow,5);
            const kFinal=kpiSheet.getCell(kRow,2);
            kFinal.value=isg?'✅ هامش المساهمة إيجابي — يمكن تحقيق التعادل':'⚠️ هامش المساهمة سالب أو صفر — لا يمكن تحقيق التعادل';
            kFinal.font={name:'Arial',bold:true,size:13,color:{argb:isg?PT:'856404'}};
            kFinal.fill={type:'pattern',pattern:'solid',fgColor:{argb:isg?PB:GB}};
            kFinal.alignment={horizontal:'center',vertical:'middle',readingOrder:'rtl'};
            kFinal.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};
            kpiSheet.getRow(kRow).height=40;

            // 4. ملخص التحليل
            const summarySheet = workbook.addWorksheet('ملخص التحليل', { views: [{ rightToLeft: true, showGridLines: false }] });
            summarySheet.getColumn(1).width=5; summarySheet.getColumn(2).width=45; summarySheet.getColumn(3).width=30; summarySheet.getColumn(4).width=5;
            mh(summarySheet,1,4,1,'📋 ملخص تحليل نقطة التعادل',DB,GL,14);
            summarySheet.getRow(1).height=40;
            const summaryRows = [
                ['التكاليف الثابتة الشهرية', `${currency} ${I.fixedCosts.toFixed(0)}`],
                ['سعر بيع الوحدة', `${currency} ${I.unitPrice.toFixed(2)}`],
                ['التكلفة المتغيرة للوحدة', `${currency} ${I.unitCost.toFixed(2)}`],
                ['هامش المساهمة للوحدة', `${currency} ${R.contributionMargin.toFixed(2)}`],
                ['نسبة هامش المساهمة', `${R.contributionMarginPercent.toFixed(2)}%`],
                ['كمية التعادل الشهرية', R.beUnitsDisplay],
                ['إيرادات التعادل الشهرية', R.beRevenueDisplay]
            ];
            summarySheet.addRows([['البيان', 'القيمة']]);
            summaryRows.forEach(row => summarySheet.addRow(row));
            const sumHeader = summarySheet.getRow(2);
            sumHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            sumHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
            summarySheet.getColumn(2).width = 40; summarySheet.getColumn(3).width = 30;

            // 5. الرسوم البيانية
            const chartsSheet = workbook.addWorksheet('الرسوم البيانية', { views: [{ rightToLeft: true, showGridLines: false }] });
            chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
            mh(chartsSheet,1,3,1,'📈 الرسم البياني لنقطة التعادل',DB,GL,14);
            chartsSheet.getRow(1).height=40;
            const canvasElem = document.getElementById('breakevenChart');
            if (canvasElem) {
                try {
                    const origBg = canvasElem.style.backgroundColor;
                    canvasElem.style.backgroundColor = '#ffffff';
                    const canvasImg = await html2canvas(canvasElem, { scale: 2, backgroundColor: '#ffffff' });
                    canvasElem.style.backgroundColor = origBg;
                    const imgData = canvasImg.toDataURL('image/png');
                    const imageId = workbook.addImage({ base64: imgData, extension: 'png' });
                    chartsSheet.addImage(imageId, { tl: { col: 1, row: 2 }, br: { col: 2, row: 18 }, editAs: 'oneCell' });
                } catch (err) {
                    const errCell = chartsSheet.getCell(3,2);
                    errCell.value = 'لم نتمكن من التقاط الرسم البياني. تأكد من ظهوره على الصفحة.';
                    errCell.font = { name: 'Arial', italic: true, color: { argb: NT } };
                }
            } else {
                chartsSheet.getCell(3,2).value = 'الرسم البياني غير متاح.';
            }

            // 6. التفسير والتوصيات
            const intSheet = workbook.addWorksheet('التفسير والتوصيات', { views: [{ rightToLeft: true, showGridLines: false }] });
            intSheet.getColumn(1).width=5; intSheet.getColumn(2).width=50; intSheet.getColumn(3).width=5;
            mh(intSheet,1,3,1,'📝 التفسير والتوصيات',DB,GL,14);
            intSheet.getRow(1).height=45;
            const sections = [
                { title: '1. ملخص المشروع', content: `الجهة: ${companyName}\nالتكاليف الثابتة الشهرية: ${currency} ${I.fixedCosts.toFixed(0)}\nسعر البيع: ${currency} ${I.unitPrice.toFixed(2)} لكل وحدة\nالتكلفة المتغيرة: ${currency} ${I.unitCost.toFixed(2)} لكل وحدة` },
                { title: '2. نتائج التحليل', content: `كمية التعادل: ${R.beUnitsDisplay} وحدة شهرياً\nإيرادات التعادل: ${R.beRevenueDisplay}\nهامش المساهمة للوحدة: ${currency} ${R.contributionMargin.toFixed(2)}\nنسبة هامش المساهمة: ${R.contributionMarginPercent.toFixed(2)}%` },
                { title: '3. التوصيات', content: isg ? '✅ هامش المساهمة إيجابي — يمكن تحقيق التعادل.\n• يجب بيع أكثر من ' + R.beUnitsDisplay + ' وحدة شهرياً لتحقيق الربح.\n• مراقبة التكاليف الثابتة والمتغيرة باستمرار.\n• يمكن استخدام التحليل لتحديد أهداف المبيعات.' : '⚠️ هامش المساهمة سالب أو صفر — لا يمكن تحقيق التعادل.\n• رفع سعر البيع أو خفض التكلفة المتغيرة.\n• مراجعة هيكل التكاليف الثابتة.\n• دراسة إمكانية تحسين الكفاءة التشغيلية.' },
                { title: '4. تنويه', content: 'هذا التحليل مبني على افتراضات تقديرية. النتائج الفعلية قد تختلف بسبب ظروف السوق والتغيرات التشغيلية. يُنصح باستشارة خبير مالي قبل اتخاذ القرارات الاستثمارية.' }
            ];
            let itRow=2;
            sections.forEach((sec,idx)=>{
                itRow++;
                intSheet.getRow(itRow).height=30;
                intSheet.mergeCells(itRow,2,itRow,2);
                const tc3=intSheet.getCell(itRow,2);
                tc3.value=sec.title;
                tc3.font={name:'Arial',bold:true,size:12,color:{argb:GL}};
                tc3.fill={type:'pattern',pattern:'solid',fgColor:{argb:idx%2===0?HB:SB}};
                tc3.alignment={horizontal:'right',vertical:'middle',readingOrder:'rtl'};
                tc3.border={bottom:{style:'medium',color:{argb:G}}};
                itRow++;
                intSheet.getRow(itRow).height=Math.max(60, sec.content.split('\n').length*18);
                intSheet.mergeCells(itRow,2,itRow,2);
                const cc=intSheet.getCell(itRow,2);
                cc.value=sec.content;
                cc.font={name:'Arial',size:10,color:{argb:DT}};
                cc.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFEFCF6'}};
                cc.alignment={horizontal:'right',vertical:'top',wrapText:true,readingOrder:'rtl'};
                cc.border={top:{style:'hair'},bottom:{style:'hair',color:{argb:G}},left:{style:'hair'},right:{style:'hair'}};
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const now = new Date();
            const fileName = `تقرير_تعادل_${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert('خطأ Excel: ' + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== تصدير Word احترافي ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (document.getElementById('resultsSection').style.display === 'none') {
            alert('الرجاء إجراء التحليل أولاً.');
            return;
        }
        if (!globalResults.outputs) {
            alert('الرجاء حساب النتائج أولاً.');
            return;
        }
        showLoading('جاري إنشاء تقرير Word...', 'جمع البيانات والرسوم');
        try {
            const R = globalResults.outputs;
            const I = globalResults.inputs;
            const currency = I.currency;
            const companyName = I.companyName;
            const now = new Date();
            const dateStr = now.toLocaleDateString('ar-EG');

            // التقاط الرسم البياني
            const canvas = document.getElementById('breakevenChart');
            let chartImgBase64 = '';
            if (canvas) {
                const origBg = canvas.style.backgroundColor;
                canvas.style.backgroundColor = '#ffffff';
                const img = await html2canvas(canvas, { scale: 2, backgroundColor: '#ffffff' });
                canvas.style.backgroundColor = origBg;
                chartImgBase64 = img.toDataURL('image/png');
            }

            // بطاقات KPI
            const kpiData = [
                { label: 'كمية التعادل', value: R.beUnitsDisplay, good: isFinite(R.breakevenUnits) },
                { label: 'إيرادات التعادل', value: R.beRevenueDisplay, good: isFinite(R.breakevenRevenue) },
                { label: 'هامش المساهمة للوحدة', value: `${currency} ${R.contributionMargin.toFixed(2)}`, good: R.contributionMargin > 0 },
                { label: 'نسبة هامش المساهمة', value: `${R.contributionMarginPercent.toFixed(2)}%`, good: true }
            ];
            let kpiRows = '';
            kpiData.forEach(k => {
                kpiRows += `<tr style="border:1px solid #b8860b;"><td style="padding:12px;background:${k.good?'#d4edda':'#f8d7da'};text-align:right;">${k.label}</td><td style="padding:12px;background:${k.good?'#d4edda':'#f8d7da'};text-align:center;"><strong style="font-size:1.2rem;color:${k.good?'#155724':'#721c24'}">${k.value}</strong></td><td style="padding:12px;background:${k.good?'#d4edda':'#f8d7da'};text-align:center;">${k.good?'✅ إيجابي':'⚠️ مراجعة'}</td></tr>`;
            });

            // جدول ملخص
            const summaryRows = [
                { label: 'التكاليف الثابتة الشهرية', value: `${currency} ${I.fixedCosts.toFixed(0)}` },
                { label: 'سعر بيع الوحدة', value: `${currency} ${I.unitPrice.toFixed(2)}` },
                { label: 'التكلفة المتغيرة للوحدة', value: `${currency} ${I.unitCost.toFixed(2)}` },
                { label: 'هامش المساهمة للوحدة', value: `${currency} ${R.contributionMargin.toFixed(2)}` },
                { label: 'نسبة هامش المساهمة', value: `${R.contributionMarginPercent.toFixed(2)}%` },
                { label: 'كمية التعادل الشهرية', value: R.beUnitsDisplay },
                { label: 'إيرادات التعادل الشهرية', value: R.beRevenueDisplay }
            ];
            let summaryHtml = '<table style="width:100%;border-collapse:collapse;"><thead><tr><th style="border:1px solid #b8860b;padding:8px;">البيان</th><th style="border:1px solid #b8860b;padding:8px;">القيمة</th></tr></thead><tbody>';
            summaryRows.forEach(row => {
                summaryHtml += `<tr style="border:1px solid #b8860b;"><td style="padding:8px;text-align:right;">${row.label}</td><td style="padding:8px;text-align:center;">${row.value}</td></tr>`;
            });
            summaryHtml += '</tbody></table>';

            const isGood = R.contributionMargin > 0;
            const verdictHtml = `<div style="margin:20px 0;padding:15px;background:${isGood?'#d4edda':'#f8d7da'};border-radius:10px;text-align:center;"><strong>${isGood?'✅ هامش المساهمة إيجابي — يمكن تحقيق التعادل':'⚠️ هامش المساهمة سالب أو صفر — لا يمكن تحقيق التعادل'}</strong></div>`;

            const fullHtml = `<!DOCTYPE html>
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
            <head><meta charset='utf-8'><title>تقرير نقطة التعادل - FAROUK GRUP</title>
            <style>
                body{font-family:'Arial','Tajawal',sans-serif;direction:rtl;margin:2rem;background:#fff;}
                .cover{text-align:center;border-bottom:4px solid #b8860b;margin-bottom:30px;padding-bottom:20px;}
                .cover h1{font-size:32px;color:#b8860b;margin:0;}.cover h2{font-size:24px;color:#b48554;margin:5px 0;}
                table{width:100%;border-collapse:collapse;margin:20px 0;} th,td{border:1px solid #b8860b;padding:8px;text-align:center;}
                th{background:#fefcf6;color:#b8860b;font-weight:bold;}
                .chart-img{max-width:100%;border:1px solid #b8860b;border-radius:10px;margin:20px 0;}
                .footer{text-align:center;margin-top:40px;padding-top:10px;border-top:1px dashed #b8860b;color:#888;font-size:10pt;}
            </style></head>
            <body>
                <div class="cover">
                    <h1>مجموعة فاروق للاستشارات والأعمال</h1>
                    <h2>تقرير تحليل نقطة التعادل (Break-Even Analysis)</h2>
                    <p>الجهة: ${companyName} | التاريخ: ${dateStr}</p>
                    <p>العملة: ${currency}</p>
                </div>
                <h2 style="color:#b8860b;">المدخلات الأساسية</h2>
                <table>
                    <tr><th>التكاليف الثابتة الشهرية</th><td>${currency} ${I.fixedCosts.toFixed(0)}</td><th>سعر بيع الوحدة</th><td>${currency} ${I.unitPrice.toFixed(2)}</td></tr>
                    <tr><th>التكلفة المتغيرة للوحدة</th><td>${currency} ${I.unitCost.toFixed(2)}</td><th></th><td></td></tr>
                </table>
                <h2 style="color:#b8860b;">📊 مؤشرات الأداء الرئيسية</h2>
                <table>${kpiRows}</table>
                ${verdictHtml}
                <h2 style="color:#b8860b;">📈 الرسم البياني لنقطة التعادل</h2>
                <div style="text-align:center;"><img src="${chartImgBase64}" class="chart-img" /></div>
                <h2 style="color:#b8860b;">📋 ملخص التحليل</h2>
                ${summaryHtml}
                <div style="background:#fefcf6;padding:15px;border-radius:10px;border-right:4px solid #b8860b;">
                    <strong>ملاحظة استشارية:</strong> تمثل نقطة التعادل الحد الأدنى من المبيعات اللازم لتغطية كافة التكاليف دون تحقيق ربح أو خسارة. أي مبيعات تتجاوز هذه النقطة ستبدأ في توليد أرباح صافية للمنشأة.
                </div>
                <div class="footer">تم الإنشاء بواسطة مجموعة فاروق للاستشارات والأعمال © ${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `تقرير_تعادل_${companyName}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert('خطأ Word: ' + err.message); } finally { hideLoading(); }
    });
