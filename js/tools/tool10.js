
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

    // ===== إظهار/إخفاء حقول CAPM =====
    document.getElementById('reMethod').addEventListener('change', function() {
        const method = this.value;
        const manualGroup = document.getElementById('manualReGroup');
        const capmFields = document.getElementById('capmFields');
        if (method === 'manual') {
            manualGroup.style.display = 'flex';
            capmFields.style.display = 'none';
        } else {
            manualGroup.style.display = 'none';
            capmFields.style.display = 'block';
        }
    });

    // ===== الحساب الرئيسي =====
    let capitalChart;
    let globalWaccData = null;

    document.getElementById('calculateBtn').addEventListener('click', function() {
        const currency = document.getElementById('currencySelect').value;
        const companyName = document.getElementById('companyName').value || 'الجهة المستفيدة';
        const equity = parseFloat(document.getElementById('equity').value) || 0;
        const debt = parseFloat(document.getElementById('debt').value) || 0;
        const costDebt = parseFloat(document.getElementById('costDebt').value) / 100 || 0;
        const taxRate = parseFloat(document.getElementById('taxRate').value) / 100 || 0;

        let costEquity, reMethod = document.getElementById('reMethod').value;
        let capmDetails = null;
        if (reMethod === 'manual') {
            costEquity = parseFloat(document.getElementById('costEquityManual').value) / 100 || 0;
        } else {
            const rf = parseFloat(document.getElementById('rf').value) / 100 || 0;
            const beta = parseFloat(document.getElementById('beta').value) || 1;
            const mrp = parseFloat(document.getElementById('marketRiskPremium').value) / 100 || 0;
            costEquity = rf + beta * mrp;
            capmDetails = { rf: rf*100, beta, mrp: mrp*100 };
        }

        if (equity <= 0 && debt <= 0) {
            alert('الرجاء إدخال قيم صحيحة.');
            return;
        }

        const total = equity + debt;
        const weightEquity = equity / total;
        const weightDebt = debt / total;
        const afterTaxCostDebt = costDebt * (1 - taxRate);
        const wacc = (weightEquity * costEquity) + (weightDebt * afterTaxCostDebt);

        document.getElementById('initialMessage').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';

        const waccPercent = (wacc * 100).toFixed(2);
        let statusText = '';
        if (wacc < 0.08) statusText = 'منخفض جداً';
        else if (wacc < 0.12) statusText = 'منخفض إلى متوسط';
        else if (wacc < 0.16) statusText = 'مرتفع نسبياً';
        else statusText = 'مرتفع جداً';

        document.getElementById('kpiCards').innerHTML = `
            <div class="result-card"><i class="fas fa-chart-line"></i><h4>WACC</h4><div class="value">${waccPercent}%</div><div class="status ${wacc<0.12?'status-good':'status-warning'}">${statusText}</div></div>
            <div class="result-card"><i class="fas fa-percent"></i><h4>وزن حقوق الملكية</h4><div class="value">${(weightEquity*100).toFixed(2)}%</div></div>
            <div class="result-card"><i class="fas fa-percent"></i><h4>وزن الديون</h4><div class="value">${(weightDebt*100).toFixed(2)}%</div></div>
            <div class="result-card"><i class="fas fa-percent"></i><h4>تكلفة حقوق الملكية (Re)</h4><div class="value">${(costEquity*100).toFixed(2)}%</div></div>
            <div class="result-card"><i class="fas fa-percent"></i><h4>تكلفة الديون بعد الضريبة</h4><div class="value">${(afterTaxCostDebt*100).toFixed(2)}%</div></div>
        `;

        document.getElementById('detailsTable').innerHTML = `
            <table>
                <tr><th>العنصر</th><th>القيمة (${currency})</th><th>الوزن</th><th>التكلفة</th></tr>
                <tr><td>حقوق الملكية</td><td>${currency}${equity.toFixed(0)}</td><td>${(weightEquity*100).toFixed(2)}%</td><td>${(costEquity*100).toFixed(2)}%</td></tr>
                <tr><td>الديون (قبل الضريبة)</td><td>${currency}${debt.toFixed(0)}</td><td>${(weightDebt*100).toFixed(2)}%</td><td>${(costDebt*100).toFixed(2)}%</td></tr>
                <tr><td>الديون (بعد الضريبة)</td><td>-</td><td>-</td><td>${(afterTaxCostDebt*100).toFixed(2)}%</td></tr>
                <tr style="background:rgba(180,133,84,0.2);font-weight:900;"><td colspan="3">المتوسط المرجح WACC</td><td>${waccPercent}%</td></tr>
            </table>
        `;

        // رسم بياني
        const ctx = document.getElementById('capitalChart').getContext('2d');
        if (capitalChart) capitalChart.destroy();
        capitalChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['حقوق الملكية', 'الديون'],
                datasets: [{
                    data: [equity, debt],
                    backgroundColor: ['#28a745', '#dc3545'],
                    borderColor: 'white',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                let label = context.label || '';
                                let value = context.raw || 0;
                                let percentage = (value / total * 100).toFixed(2);
                                return `${label}: ${currency}${value.toFixed(0)} (${percentage}%)`;
                            }
                        }
                    },
                    legend: { labels: { color: '#f0f4fa' } }
                }
            }
        });

        let interpretationText = '';
        if (wacc < 0.08) interpretationText = '🔵 WACC منخفض جداً، يعني أن تكلفة تمويل الشركة رخيصة، وهذا إيجابي للمشاريع الاستثمارية.';
        else if (wacc < 0.12) interpretationText = '🟢 WACC متوسط إلى منخفض، تكلفة تمويل معقولة.';
        else if (wacc < 0.16) interpretationText = '🟡 WACC مرتفع نسبياً، يجب مقارنته مع العائد المتوقع للمشاريع.';
        else interpretationText = '🔴 WACC مرتفع جداً، قد يكون من الصعب تحقيق عوائد تفوق هذه التكلفة.';
        document.getElementById('interpretation').innerHTML = `<p><i class="fas fa-info-circle" style="color:var(--accent-soft);"></i> ${interpretationText}</p>`;

        // تخزين للتصدير
        globalWaccData = {
            currency, companyName,
            equity, debt, costEquity: costEquity*100,
            costDebt: costDebt*100, taxRate: taxRate*100,
            weightEquity: weightEquity*100,
            weightDebt: weightDebt*100,
            afterTaxCostDebt: afterTaxCostDebt*100,
            wacc: wacc*100,
            interpretation: interpretationText,
            reMethod, capmDetails, total,
            kpiCardsHtml: document.getElementById('kpiCards').innerHTML,
            detailsTableHtml: document.getElementById('detailsTable').innerHTML,
            chart: capitalChart
        };
    });

    // ================================================================
    // ========== تصدير Excel احترافي ==========
    // ================================================================
    document.getElementById('exportExcelBtn').addEventListener('click', async function() {
        if (!globalWaccData) { alert('الرجاء إجراء التحليل أولاً.'); return; }
        showLoading('جاري إنشاء تقرير Excel...', 'إنشاء الأوراق والرسوم');
        try {
            const D = globalWaccData;
            const currency = D.currency;
            const companyName = D.companyName;

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'FAROUK GRUP';
            const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050';
            const AR = 'FFF5F0E8', DT = 'FF1A1A1A', PB = 'FFD4EDDA', NB = 'FFF8D7DA', GB = 'FFFFF3CD';
            const PT = 'FF155724', NT = 'FF721C24';
            const nc = '#,##0;(#,##0);"-"';

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
            mh(cv,1,4,4,`تقرير تحليل WACC\n${companyName}`,DB,GL,18);
            const inf=[['📋 الجهة',companyName],['📅 التاريخ',new Date().toLocaleDateString('ar-EG')],['💰 العملة',currency],['📊 WACC',`${D.wacc.toFixed(2)}%`],['🏷️ طريقة Re',D.reMethod==='manual'?'إدخال يدوي':'CAPM']];
            let ir=6;
            inf.forEach(([l,v],idx)=>{
                cv.mergeCells(ir,1,ir,2); cv.mergeCells(ir,3,ir,4);
                const lc=cv.getCell(ir,1), vc=cv.getCell(ir,3); lc.value=l; vc.value=v;
                const bg=idx%2===0?AR:'FFFEFCF6';
                ap(lc,{font:{name:'Arial',bold:true,size:11,color:{argb:'00695C'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'right',vertical:'middle',readingOrder:'rtl'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                ap(vc,{font:{name:'Arial',size:11,color:{argb:DT}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',readingOrder:'rtl'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                cv.getRow(ir).height=28; ir++;
            });

            // 2. المدخلات
            const inputsSheet = workbook.addWorksheet('المدخلات والافتراضات', { views: [{ rightToLeft: true, showGridLines: false }] });
            inputsSheet.getColumn(1).width=5; inputsSheet.getColumn(2).width=38; inputsSheet.getColumn(3).width=22; inputsSheet.getColumn(4).width=22; inputsSheet.getColumn(5).width=5;
            mh(inputsSheet,1,5,1,'📋 جدول المدخلات والافتراضات الأساسية',DB,GL,14);
            inputsSheet.getRow(1).height=40;
            mh(inputsSheet,2,4,2,'البيانات الأساسية لهيكل رأس المال',SB,'FFFFFFFF',11);
            inputsSheet.getRow(2).height=28;
            const inputFields = [
                ['حقوق الملكية (Equity)', D.equity, `${currency} ${D.equity.toFixed(0)}`],
                ['الديون (Debt)', D.debt, `${currency} ${D.debt.toFixed(0)}`],
                ['إجمالي رأس المال', D.total, `${currency} ${D.total.toFixed(0)}`],
                ['تكلفة حقوق الملكية (Re)', D.costEquity, `${D.costEquity.toFixed(2)}%`],
                ['تكلفة الديون (Rd)', D.costDebt, `${D.costDebt.toFixed(2)}%`],
                ['معدل الضريبة', D.taxRate, `${D.taxRate.toFixed(0)}%`]
            ];
            if (D.reMethod === 'capm' && D.capmDetails) {
                inputFields.push(['معدل خالي من المخاطر (Rf)', D.capmDetails.rf, `${D.capmDetails.rf.toFixed(2)}%`]);
                inputFields.push(['بيتا (β)', D.capmDetails.beta, '']);
                inputFields.push(['علاوة مخاطرة السوق', D.capmDetails.mrp, `${D.capmDetails.mrp.toFixed(2)}%`]);
            }
            inputFields.push(['طريقة حساب Re', D.reMethod==='manual'?'إدخال يدوي':'CAPM', '']);
            let iRow=3;
            inputFields.forEach(([label,val,note],idx)=>{
                inputsSheet.getRow(iRow).height=24;
                const bg=idx%2===0?'FFFEFCF6':'FFFFFFFF';
                const lc=inputsSheet.getCell(iRow,2), vc=inputsSheet.getCell(iRow,3), nc=inputsSheet.getCell(iRow,4);
                lc.value=label; vc.value=val; nc.value=note;
                ap(lc,cs(bg,DT,true,'right'));
                ap(vc,{...cs(bg,'0000FF',false,'center'),numFmt:typeof val==='number'?nc:null});
                ap(nc,cs(bg,'00695C',false,'center'));
                iRow++;
            });

            // 3. مؤشرات الأداء
            const kpiSheet = workbook.addWorksheet('مؤشرات الأداء', { views: [{ rightToLeft: true, showGridLines: false }] });
            [5,32,22,22,22,5].forEach((w,i)=>kpiSheet.getColumn(i+1).width=w);
            mh(kpiSheet,1,6,1,'📊 لوحة مؤشرات الأداء الرئيسية',DB,GL,15);
            kpiSheet.getRow(1).height=45;
            mh(kpiSheet,2,5,2,`${companyName} | ${new Date().toLocaleDateString('ar-EG')}`,HB,'FFFFFFFF',10);
            kpiSheet.getRow(2).height=26;
            const kpis = [
                { label: 'WACC', value: `${D.wacc.toFixed(2)}%`, good: D.wacc<0.12 },
                { label: 'وزن حقوق الملكية', value: `${D.weightEquity.toFixed(2)}%`, good: true },
                { label: 'وزن الديون', value: `${D.weightDebt.toFixed(2)}%`, good: true },
                { label: 'تكلفة حقوق الملكية', value: `${D.costEquity.toFixed(2)}%`, good: true },
                { label: 'تكلفة الديون بعد الضريبة', value: `${D.afterTaxCostDebt.toFixed(2)}%`, good: true }
            ];
            let kRow=3;
            kpis.forEach((k,idx)=>{
                kpiSheet.getRow(kRow).height=40;
                kpiSheet.mergeCells(kRow,2,kRow,2); kpiSheet.mergeCells(kRow,3,kRow,3); kpiSheet.mergeCells(kRow,4,kRow,4); kpiSheet.mergeCells(kRow,5,kRow,5);
                const ic=kpiSheet.getCell(kRow,2); ic.value=`🔹 ${idx+1}`;
                const lc2=kpiSheet.getCell(kRow,3); lc2.value=k.label;
                const vc3=kpiSheet.getCell(kRow,4); vc3.value=k.value;
                const nc2=kpiSheet.getCell(kRow,5); nc2.value='';
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
            kFinal.value=D.wacc<0.12?'✅ WACC منخفض — تكلفة تمويل رخيصة':'⚠️ WACC مرتفع نسبياً — يحتاج مراجعة';
            kFinal.font={name:'Arial',bold:true,size:13,color:{argb:D.wacc<0.12?PT:'856404'}};
            kFinal.fill={type:'pattern',pattern:'solid',fgColor:{argb:D.wacc<0.12?PB:GB}};
            kFinal.alignment={horizontal:'center',vertical:'middle',readingOrder:'rtl'};
            kFinal.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};
            kpiSheet.getRow(kRow).height=40;

            // 4. تفصيل الحساب
            const detailSheet = workbook.addWorksheet('تفصيل الحساب', { views: [{ rightToLeft: true, showGridLines: false }] });
            detailSheet.getColumn(1).width=5; detailSheet.getColumn(2).width=40; detailSheet.getColumn(3).width=22; detailSheet.getColumn(4).width=22; detailSheet.getColumn(5).width=22; detailSheet.getColumn(6).width=5;
            mh(detailSheet,1,6,1,'📋 تفصيل حساب WACC',DB,GL,14);
            detailSheet.getRow(1).height=40;
            const detailRows = [
                ['العنصر', 'القيمة', 'الوزن', 'التكلفة'],
                ['حقوق الملكية', `${currency} ${D.equity.toFixed(0)}`, `${D.weightEquity.toFixed(2)}%`, `${D.costEquity.toFixed(2)}%`],
                ['الديون (قبل الضريبة)', `${currency} ${D.debt.toFixed(0)}`, `${D.weightDebt.toFixed(2)}%`, `${D.costDebt.toFixed(2)}%`],
                ['الديون (بعد الضريبة)', '-', '-', `${D.afterTaxCostDebt.toFixed(2)}%`],
                ['WACC', '', '', `${D.wacc.toFixed(2)}%`]
            ];
            detailRows.forEach(r => detailSheet.addRow(r));
            detailSheet.getRow(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            detailSheet.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };

            // 5. هيكل رأس المال (رسم بياني)
            const chartsSheet = workbook.addWorksheet('هيكل رأس المال', { views: [{ rightToLeft: true, showGridLines: false }] });
            chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
            mh(chartsSheet,1,3,1,'📊 هيكل رأس المال',DB,GL,14);
            chartsSheet.getRow(1).height=40;
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
                } catch(err) {}
            }

            // 6. التفسير والتوصيات
            const evalSheet = workbook.addWorksheet('التفسير والتوصيات', { views: [{ rightToLeft: true, showGridLines: false }] });
            evalSheet.getColumn(1).width=5; evalSheet.getColumn(2).width=50; evalSheet.getColumn(3).width=5;
            mh(evalSheet,1,3,1,'📝 التفسير والتوصيات',DB,GL,14);
            evalSheet.getRow(1).height=45;
            const sections = [
                { title: '1. ملخص التحليل', content: `الجهة: ${companyName}\nإجمالي رأس المال: ${currency} ${D.total.toFixed(0)}\nWACC المحسوب: ${D.wacc.toFixed(2)}%\nطريقة حساب Re: ${D.reMethod==='manual'?'إدخال يدوي':'CAPM'}` },
                { title: '2. تفسير النتيجة', content: D.interpretation },
                { title: '3. التوصيات', content: D.wacc<0.12 ? '• يمكن استخدام هذا المعدل كحد أدنى للعائد المطلوب للمشاريع الجديدة.\n• يُنصح بالاستفادة من تكلفة التمويل المنخفضة للتوسع.' : '• يُنصح بمراجعة هيكل رأس المال لتخفيض تكلفة التمويل.\n• يمكن التفكير في إعادة هيكلة الديون أو زيادة حقوق الملكية.' },
                { title: '4. تنويه', content: 'هذا التحليل مبني على افتراضات تقديرية. النتائج الفعلية قد تختلف. يُنصح باستشارة خبير مالي قبل اتخاذ القرارات.' }
            ];
            let itRow=2;
            sections.forEach((sec,idx)=>{
                itRow++;
                evalSheet.getRow(itRow).height=30;
                evalSheet.mergeCells(itRow,2,itRow,2);
                const tc3=evalSheet.getCell(itRow,2);
                tc3.value=sec.title;
                tc3.font={name:'Arial',bold:true,size:12,color:{argb:GL}};
                tc3.fill={type:'pattern',pattern:'solid',fgColor:{argb:idx%2===0?HB:SB}};
                tc3.alignment={horizontal:'right',vertical:'middle',readingOrder:'rtl'};
                tc3.border={bottom:{style:'medium',color:{argb:G}}};
                itRow++;
                evalSheet.getRow(itRow).height=Math.max(60, sec.content.split('\n').length*18);
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
            const fileName = `تقرير_WACC_${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert('خطأ Excel: ' + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== تصدير Word احترافي ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (!globalWaccData) { alert('الرجاء إجراء التحليل أولاً.'); return; }
        showLoading('جاري إنشاء تقرير Word...', 'جمع البيانات والرسوم');
        try {
            const D = globalWaccData;
            const currency = D.currency;
            const companyName = D.companyName;
            const now = new Date();
            const dateStr = now.toLocaleDateString('ar-EG');

            const chartContainer = document.querySelector('.chart-container');
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
            <head><meta charset='utf-8'><title>تقرير WACC - FAROUK GRUP</title>
            <style>
                body{font-family:'Arial','Tajawal',sans-serif;direction:rtl;margin:2rem;background:#fff;color:#333;}
                .cover{text-align:center;border-bottom:4px solid #b8860b;margin-bottom:30px;padding-bottom:20px;}
                .cover h1{font-size:32px;color:#b8860b;margin:0;}
                .cover h2{font-size:24px;color:#b48554;margin:5px 0;}
                table{width:100%;border-collapse:collapse;margin:20px 0;} th,td{border:1px solid #b8860b;padding:8px;text-align:center;}
                th{background:#fefcf6;color:#b8860b;}
                .chart-img{max-width:100%;border:1px solid #b8860b;border-radius:10px;margin:20px 0;}
                .footer{text-align:center;margin-top:40px;color:#888;border-top:1px dashed #b8860b;padding-top:10px;}
                .highlight{font-size:2rem;font-weight:bold;color:#155724;}
            </style></head>
            <body>
                <div class="cover">
                    <h1>مجموعة فاروق للاستشارات والأعمال</h1>
                    <h2>تقرير تحليل WACC</h2>
                    <p>الجهة: ${companyName} | التاريخ: ${dateStr}</p>
                    <p>العملة: ${currency} | WACC: ${D.wacc.toFixed(2)}%</p>
                </div>
                <h2 style="color:#b8860b;">المدخلات الأساسية</h2>
                <table><tbody>
                    <tr><th>حقوق الملكية</th><td>${currency} ${D.equity.toFixed(0)}</td><th>الديون</th><td>${currency} ${D.debt.toFixed(0)}</td></tr>
                    <tr><th>تكلفة حقوق الملكية (Re)</th><td>${D.costEquity.toFixed(2)}%</td><th>تكلفة الديون (Rd)</th><td>${D.costDebt.toFixed(2)}%</td></tr>
                    <tr><th>معدل الضريبة</th><td>${D.taxRate.toFixed(0)}%</td><th>تكلفة الديون بعد الضريبة</th><td>${D.afterTaxCostDebt.toFixed(2)}%</td></tr>
                </tbody></table>
                <h2 style="color:#b8860b;">📊 مؤشرات الأداء</h2>
                <div style="margin:20px 0;padding:20px;background:#d4edda;border-radius:10px;text-align:center;">
                    <span style="font-size:2rem;font-weight:bold;color:#155724;">WACC = ${D.wacc.toFixed(2)}%</span>
                </div>
                <h2 style="color:#b8860b;">📊 هيكل رأس المال</h2>
                <div style="text-align:center;"><img src="${chartImgBase64}" class="chart-img" /></div>
                <h2 style="color:#b8860b;">📋 تفاصيل الحساب</h2>
                ${D.detailsTableHtml}
                <h2 style="color:#b8860b;">💡 تفسير النتيجة</h2>
                <div style="background:#fefcf6;padding:15px;border-radius:10px;border-right:4px solid #b8860b;">
                    <p>${D.interpretation}</p>
                </div>
                <div class="footer">تم الإنشاء بواسطة مجموعة فاروق للاستشارات والأعمال © ${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `تقرير_WACC_${companyName}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert('خطأ Word: ' + err.message); } finally { hideLoading(); }
    });
