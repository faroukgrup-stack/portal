
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
            } catch(e) { calcDisplay.value = T('s1'); currentCalcInput = ''; }
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

    // ===== متغير عام =====
    let globalForecastData = null;

    // ===== دوال الحساب =====
    function getInputs() {
        return {
            currency: document.getElementById('currencySelect').value,
            companyName: document.getElementById('companyName').value || T('s2'),
            baseRevenue: parseFloat(document.getElementById('baseRevenue').value) || 0,
            cogsPercent: parseFloat(document.getElementById('cogsPercent').value) / 100 || 0,
            opexPercent: parseFloat(document.getElementById('opexPercent').value) / 100 || 0,
            taxRate: parseFloat(document.getElementById('taxRate').value) / 100 || 0,
            depreciation: parseFloat(document.getElementById('depreciation').value) || 0,
            capex: parseFloat(document.getElementById('capex').value) || 0,
            dso: parseFloat(document.getElementById('dso').value) || 0,
            dio: parseFloat(document.getElementById('dio').value) || 0,
            dpo: parseFloat(document.getElementById('dpo').value) || 0,
            growthRate: parseFloat(document.getElementById('growthRate').value) / 100 || 0,
            forecastYears: parseInt(document.getElementById('forecastYears').value) || 5,
            discountRate: parseFloat(document.getElementById('discountRate').value) / 100 || 0.1,
            initialWC: parseFloat(document.getElementById('initialWC').value) || 0,
            initialInvestment: parseFloat(document.getElementById('initialInvestment').value) || 0,
            terminalGrowth: parseFloat(document.getElementById('terminalGrowth').value) / 100 || 0.03
        };
    }


    // ===== عرض النتائج =====
    let revenueChart, fcfChart;

    async function displayForecast() {
        const inputs = getInputs();
        let forecast;
        try { forecast = await FG.calc('tool19', 'main', inputs); } catch (e) { FG.calcError(e); return; }
        const currency = inputs.currency;
        const years = inputs.forecastYears;

        globalForecastData = { inputs, forecast, years, currency };

        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('initialMessage').style.display = 'none';

        document.getElementById('kpiCards').innerHTML = `${T('s8')}${currency}${forecast.totalNpv.toFixed(0)}</div><div class="status ${forecast.totalNpv>0?'status-good':'status-bad'}">${forecast.totalNpv>0?T('s3'):T('s4')}${T('s9')}${forecast.irr ? (forecast.irr*100).toFixed(2)+'%' : T('s5')}</div><div class="status ${forecast.irr && forecast.irr>inputs.discountRate?'status-good':'status-warning'}">${forecast.irr && forecast.irr>inputs.discountRate ? T('s6') : T('s7')}${T('s10')}${forecast.paybackPeriod ? forecast.paybackPeriod.toFixed(1) : '∞'}${T('s11')}${currency}${forecast.terminalValue.toFixed(0)}</div></div>
        `;

        let incomeHtml = `${T('s12')}`;
        for (let i = 0; i < years; i++) {
            incomeHtml += `${T('s13')}${i+1}</td><td>${currency}${forecast.revenue[i].toFixed(0)}</td><td>${currency}${forecast.cogs[i].toFixed(0)}</td><td>${currency}${forecast.opex[i].toFixed(0)}</td><td>${currency}${inputs.depreciation.toFixed(0)}</td><td class="${forecast.ebit[i]>=0?'positive':'negative'}">${currency}${forecast.ebit[i].toFixed(0)}</td><td>${currency}${forecast.tax[i].toFixed(0)}</td><td class="${forecast.netIncome[i]>=0?'positive':'negative'}">${currency}${forecast.netIncome[i].toFixed(0)}</td></tr>`;
        }
        incomeHtml += `</tbody>`;
        document.getElementById('incomeTable').innerHTML = `<table>${incomeHtml}</table>`;

        let cashHtml = `${T('s14')}`;
        for (let i = 0; i < years; i++) {
            let changeWC = (i === 0) ? forecast.wc[i] - inputs.initialWC : forecast.wc[i] - forecast.wc[i - 1];
            cashHtml += `${T('s13')}${i+1}</td><td>${currency}${forecast.netIncome[i].toFixed(0)}</td><td>${currency}${inputs.depreciation.toFixed(0)}</td><td>${currency}${inputs.capex.toFixed(0)}</td><td>${currency}${changeWC.toFixed(0)}</td><td class="${forecast.fcf[i]>=0?'positive':'negative'}">${currency}${forecast.fcf[i].toFixed(0)}</td></tr>`;
        }
        cashHtml += `</tbody>`;
        document.getElementById('cashFlowTable').innerHTML = `<table>${cashHtml}</table>`;

        if (revenueChart) revenueChart.destroy();
        const ctxRev = document.getElementById('revenueChart').getContext('2d');
        revenueChart = new Chart(ctxRev, {
            type: 'line',
            data: {
                labels: Array.from({ length: years }, (_, i) => `${T('s15')}${i+1}`),
                datasets: [
                    { label: T('s16'), data: forecast.revenue, borderColor: '#28a745', fill: false },
                    { label: T('s17'), data: forecast.netIncome, borderColor: '#b8860b', fill: false }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        if (fcfChart) fcfChart.destroy();
        const ctxFcf = document.getElementById('fcfChart').getContext('2d');
        fcfChart = new Chart(ctxFcf, {
            type: 'bar',
            data: {
                labels: Array.from({ length: years }, (_, i) => `${T('s15')}${i+1}`),
                datasets: [{ label: T('s18'), data: forecast.fcf, backgroundColor: '#b8860b' }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        document.getElementById('valuationCard').innerHTML = `${T('s21')}${currency}${forecast.totalNpv.toFixed(0)}</div>
            <div>IRR: ${forecast.irr ? (forecast.irr*100).toFixed(2)+'%' : T('s5')}${T('s22')}${forecast.paybackPeriod ? forecast.paybackPeriod.toFixed(1)+T('s19') : T('s20')}${T('s23')}${(inputs.terminalGrowth*100).toFixed(1)}%</div>
        `;
    }

    document.getElementById('calculateBtn').addEventListener('click', displayForecast);

    // ================================================================
    // ========== تصدير Excel احترافي (مطابق للأدوات السابقة) ==========
    // ================================================================
    document.getElementById('exportExcelBtn').addEventListener('click', async function() {
        if (!globalForecastData) { alert(T('s24')); return; }
        showLoading(T('s25'), T('s26'));
        try {
            const F = globalForecastData.forecast;
            const I = globalForecastData.inputs;
            const currency = I.currency;
            const companyName = I.companyName;
            const years = globalForecastData.years;

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'FAROUK GRUP';
            const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050';
            const AR = 'FFF5F0E8', DT = 'FF1A1A1A', PB = 'FFD4EDDA', NB = 'FFF8D7DA', GB = 'FFFFF3CD';
            const PT = 'FF155724', NT = 'FF721C24';
            const nc = '#,##0;(#,##0);"-"';

            function hs(bg=HB, tc=GL){return{font:{name:'Arial',bold:true,size:11,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()},border:{top:{style:'thin',color:{argb:G}},bottom:{style:'thin',color:{argb:G}},left:{style:'thin',color:{argb:G}},right:{style:'thin',color:{argb:G}}}};}
            function cs(bg='FFFFFFFF',tc=DT,b=false,h='center'){return{font:{name:'Arial',bold:b,size:10,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:h,vertical:'middle',wrapText:true,readingOrder:FG.dir()},border:{top:{style:'hair',color:{argb:'FFCCCCCC'}},bottom:{style:'hair',color:{argb:'FFCCCCCC'}},left:{style:'hair',color:{argb:'FFCCCCCC'}},right:{style:'hair',color:{argb:'FFCCCCCC'}}}};}
            function ap(c,s){if(s.font)c.font=s.font;if(s.fill)c.fill=s.fill;if(s.alignment)c.alignment=s.alignment;if(s.border)c.border=s.border;if(s.numFmt)c.numFmt=s.numFmt;}
            function mh(ws,fc,tc,r,text,bg=HB,tc2=GL,fs=12){ws.mergeCells(r,fc,r,tc);const c=ws.getCell(r,fc);c.value=text;c.font={name:'Arial',bold:true,size:fs,color:{argb:tc2}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};c.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};}

            // 1. غلاف التقرير
            const cv = workbook.addWorksheet(T('s27'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
            cv.getRow(2).height=80; cv.getRow(4).height=60;
            cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1);
            bc.value=T('s28');
            bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};
            mh(cv,1,4,4,`${T('s29')}${companyName}`,DB,GL,18);
            const inf=[[T('s30'),companyName],[T('s31'),new Date().toLocaleDateString(FG.locale())],[T('s32'),currency],[T('s33'),`${years}${T('s34')}`],['💵 NPV',`${currency} ${F.totalNpv.toFixed(0)}`],['📊 IRR',F.irr?(F.irr*100).toFixed(2)+'%':T('s5')]];
            let ir=6;
            inf.forEach(([l,v],idx)=>{
                cv.mergeCells(ir,1,ir,2); cv.mergeCells(ir,3,ir,4);
                const lc=cv.getCell(ir,1), vc=cv.getCell(ir,3); lc.value=l; vc.value=v;
                const bg=idx%2===0?AR:'FFFEFCF6';
                ap(lc,{font:{name:'Arial',bold:true,size:11,color:{argb:'00695C'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'right',vertical:'middle',readingOrder:FG.dir()},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                ap(vc,{font:{name:'Arial',size:11,color:{argb:DT}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',readingOrder:FG.dir()},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                cv.getRow(ir).height=28; ir++;
            });

            // 2. المدخلات
            const inputsSheet = workbook.addWorksheet(T('s35'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            inputsSheet.getColumn(1).width=5; inputsSheet.getColumn(2).width=38; inputsSheet.getColumn(3).width=22; inputsSheet.getColumn(4).width=22; inputsSheet.getColumn(5).width=5;
            mh(inputsSheet,1,5,1,T('s36'),DB,GL,14);
            inputsSheet.getRow(1).height=40;
            mh(inputsSheet,2,4,2,T('s37'),SB,'FFFFFFFF',11);
            inputsSheet.getRow(2).height=28;
            const inputFields = [
                [T('s38'), I.baseRevenue, `${currency} ${I.baseRevenue.toFixed(0)}`],
                [T('s39'), (I.cogsPercent*100), `${(I.cogsPercent*100).toFixed(0)}%`],
                [T('s40'), (I.opexPercent*100), `${(I.opexPercent*100).toFixed(0)}%`],
                [T('s41'), (I.taxRate*100), `${(I.taxRate*100).toFixed(0)}%`],
                [T('s42'), I.depreciation, `${currency} ${I.depreciation.toFixed(0)}`],
                [T('s43'), I.capex, `${currency} ${I.capex.toFixed(0)}`],
                [T('s44'), I.dso, `${I.dso}${T('s45')}`],
                [T('s46'), I.dio, `${I.dio}${T('s45')}`],
                [T('s47'), I.dpo, `${I.dpo}${T('s45')}`],
                [T('s48'), (I.growthRate*100), `${(I.growthRate*100).toFixed(1)}%`],
                [T('s49'), years, T('s50')],
                [T('s51'), (I.discountRate*100), `${(I.discountRate*100).toFixed(1)}%`],
                [T('s52'), I.initialWC, `${currency} ${I.initialWC.toFixed(0)}`],
                [T('s53'), I.initialInvestment, `${currency} ${I.initialInvestment.toFixed(0)}`],
                [T('s54'), (I.terminalGrowth*100), `${(I.terminalGrowth*100).toFixed(1)}%`]
            ];
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
            const kpiSheet = workbook.addWorksheet(T('s55'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            [5,32,22,22,22,5].forEach((w,i)=>kpiSheet.getColumn(i+1).width=w);
            mh(kpiSheet,1,6,1,T('s56'),DB,GL,15);
            kpiSheet.getRow(1).height=45;
            mh(kpiSheet,2,5,2,`${companyName} | ${new Date().toLocaleDateString(FG.locale())}`,HB,'FFFFFFFF',10);
            kpiSheet.getRow(2).height=26;
            const kpis = [
                { label: 'NPV', value: `${currency} ${F.totalNpv.toFixed(0)}`, good: F.totalNpv>0 },
                { label: 'IRR', value: F.irr?(F.irr*100).toFixed(2)+'%':T('s5'), good: F.irr && F.irr>I.discountRate },
                { label: T('s57'), value: F.paybackPeriod?F.paybackPeriod.toFixed(1)+T('s19'):T('s20'), good: F.paybackPeriod && F.paybackPeriod<=years },
                { label: T('s58'), value: `${currency} ${F.terminalValue.toFixed(0)}`, good: F.terminalValue>0 },
                { label: T('s59'), value: `${currency} ${F.revenue[years-1].toFixed(0)}`, good: true }
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
                lc2.font={name:'Arial',bold:true,size:11,color:{argb:DT}}; lc2.alignment={horizontal:'right',vertical:'middle',readingOrder:FG.dir()};
                vc3.font={name:'Arial',bold:true,size:13,color:{argb:tc}}; vc3.alignment={horizontal:'center',vertical:'middle'};
                kRow++;
            });
            kRow++;
            kpiSheet.mergeCells(kRow,2,kRow,5);
            const kFinal=kpiSheet.getCell(kRow,2);
            kFinal.value=F.totalNpv>0?T('s60'):T('s61');
            kFinal.font={name:'Arial',bold:true,size:13,color:{argb:F.totalNpv>0?PT:'856404'}};
            kFinal.fill={type:'pattern',pattern:'solid',fgColor:{argb:F.totalNpv>0?PB:GB}};
            kFinal.alignment={horizontal:'center',vertical:'middle',readingOrder:FG.dir()};
            kFinal.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};
            kpiSheet.getRow(kRow).height=40;

            // 4. قائمة الدخل
            const incomeSheet = workbook.addWorksheet(T('s62'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            incomeSheet.getColumn(1).width=5; incomeSheet.getColumn(2).width=14; incomeSheet.getColumn(3).width=16; incomeSheet.getColumn(4).width=16; incomeSheet.getColumn(5).width=16; incomeSheet.getColumn(6).width=14; incomeSheet.getColumn(7).width=16; incomeSheet.getColumn(8).width=14; incomeSheet.getColumn(9).width=16; incomeSheet.getColumn(10).width=5;
            mh(incomeSheet,1,10,1,T('s63'),DB,GL,14);
            incomeSheet.getRow(1).height=40;
            const incHeaders = [T('s64'),T('s16'),T('s65'),T('s66'),T('s67'),'EBIT',T('s68'),T('s17')];
            const incRow = incomeSheet.getRow(2);
            incHeaders.forEach((h,i)=>{const c=incomeSheet.getCell(2,i+2);c.value=h;c.font={name:'Arial',bold:true,size:10,color:{argb:'FFFFFFFF'}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:G}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};c.border={top:{style:'thin'},bottom:{style:'thin'},left:{style:'thin'},right:{style:'thin'}};});
            incomeSheet.getRow(2).height=28;
            for (let i=0; i<years; i++) {
                const r=i+3;
                const rowData = [`${T('s15')}${i+1}`, F.revenue[i], F.cogs[i], F.opex[i], I.depreciation, F.ebit[i], F.tax[i], F.netIncome[i]];
                rowData.forEach((val,j)=>{const c=incomeSheet.getCell(r,j+2);c.value=val;c.font={name:'Arial',size:10,color:{argb:DT}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:i%2===0?'FFFEFCF6':'FFFFFFFF'}};c.alignment={horizontal:'center',vertical:'middle',readingOrder:FG.dir()};c.border={top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}};if(typeof val==='number')c.numFmt=nc;});
                incomeSheet.getRow(r).height=22;
            }

            // 5. التدفقات النقدية
            const fcfSheet = workbook.addWorksheet(T('s69'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            fcfSheet.getColumn(1).width=5; fcfSheet.getColumn(2).width=14; fcfSheet.getColumn(3).width=16; fcfSheet.getColumn(4).width=14; fcfSheet.getColumn(5).width=14; fcfSheet.getColumn(6).width=22; fcfSheet.getColumn(7).width=22; fcfSheet.getColumn(8).width=5;
            mh(fcfSheet,1,8,1,T('s70'),DB,GL,14);
            fcfSheet.getRow(1).height=40;
            const fcfHeaders = [T('s64'),T('s17'),T('s67'),'CAPEX',T('s71'),T('s18')];
            const fcfHRow = fcfSheet.getRow(2);
            fcfHeaders.forEach((h,i)=>{const c=fcfSheet.getCell(2,i+2);c.value=h;c.font={name:'Arial',bold:true,size:10,color:{argb:'FFFFFFFF'}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:G}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};c.border={top:{style:'thin'},bottom:{style:'thin'},left:{style:'thin'},right:{style:'thin'}};});
            fcfSheet.getRow(2).height=28;
            for (let i=0; i<years; i++) {
                const r=i+3;
                const changeWC = (i===0)?F.wc[i]-I.initialWC:F.wc[i]-F.wc[i-1];
                const rowData = [`${T('s15')}${i+1}`, F.netIncome[i], I.depreciation, I.capex, changeWC, F.fcf[i]];
                rowData.forEach((val,j)=>{const c=fcfSheet.getCell(r,j+2);c.value=val;c.font={name:'Arial',size:10,color:{argb:DT}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:i%2===0?'FFFEFCF6':'FFFFFFFF'}};c.alignment={horizontal:'center',vertical:'middle',readingOrder:FG.dir()};c.border={top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}};if(typeof val==='number')c.numFmt=nc;});
                fcfSheet.getRow(r).height=22;
            }

            // 6. الرسوم البيانية
            const chartsSheet = workbook.addWorksheet(T('s72'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
            mh(chartsSheet,1,3,1,T('s73'),DB,GL,14);
            chartsSheet.getRow(1).height=40;
            const revCanvas = document.getElementById('revenueChart');
            if (revCanvas) {
                try {
                    const origBg = revCanvas.parentElement.style.backgroundColor;
                    revCanvas.parentElement.style.backgroundColor = '#ffffff';
                    const revImg = await html2canvas(revCanvas, { scale: 2, backgroundColor: '#ffffff' });
                    revCanvas.parentElement.style.backgroundColor = origBg;
                    const revImageId = workbook.addImage({ base64: revImg.toDataURL('image/png'), extension: 'png' });
                    chartsSheet.addImage(revImageId, { tl: { col: 1, row: 2 }, br: { col: 2, row: 14 }, editAs: 'oneCell' });
                } catch(err) {}
            }
            const fcfCanvas = document.getElementById('fcfChart');
            if (fcfCanvas) {
                try {
                    const origBg2 = fcfCanvas.parentElement.style.backgroundColor;
                    fcfCanvas.parentElement.style.backgroundColor = '#ffffff';
                    const fcfImg = await html2canvas(fcfCanvas, { scale: 2, backgroundColor: '#ffffff' });
                    fcfCanvas.parentElement.style.backgroundColor = origBg2;
                    const fcfImageId = workbook.addImage({ base64: fcfImg.toDataURL('image/png'), extension: 'png' });
                    chartsSheet.addImage(fcfImageId, { tl: { col: 1, row: 16 }, br: { col: 2, row: 28 }, editAs: 'oneCell' });
                } catch(err) {}
            }

            // 7. التوصيات
            const recSheet = workbook.addWorksheet(T('s74'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            recSheet.getColumn(1).width=5; recSheet.getColumn(2).width=50; recSheet.getColumn(3).width=5;
            mh(recSheet,1,3,1,T('s75'),DB,GL,14);
            recSheet.getRow(1).height=45;
            const sections = [
                { title: T('s76'), content: `${T('s77')}${companyName}${T('s78')}${currency}${T('s79')}${years}${T('s80')}${(I.growthRate*100).toFixed(1)}${T('s81')}${(I.discountRate*100).toFixed(1)}%` },
                { title: T('s82'), content: `NPV: ${currency} ${F.totalNpv.toFixed(0)}\nIRR: ${F.irr?(F.irr*100).toFixed(2)+'%':T('s5')}${T('s83')}${F.paybackPeriod?F.paybackPeriod.toFixed(1)+T('s19'):T('s20')}${T('s84')}${currency} ${F.terminalValue.toFixed(0)}` },
                { title: T('s85'), content: F.totalNpv>0?T('s86'):T('s87') },
                { title: T('s88'), content: T('s89') }
            ];
            let itRow=2;
            sections.forEach((sec,idx)=>{
                itRow++;
                recSheet.getRow(itRow).height=30;
                recSheet.mergeCells(itRow,2,itRow,2);
                const tc3=recSheet.getCell(itRow,2);
                tc3.value=sec.title; tc3.font={name:'Arial',bold:true,size:12,color:{argb:GL}};
                tc3.fill={type:'pattern',pattern:'solid',fgColor:{argb:idx%2===0?HB:SB}};
                tc3.alignment={horizontal:'right',vertical:'middle',readingOrder:FG.dir()};
                tc3.border={bottom:{style:'medium',color:{argb:G}}};
                itRow++;
                recSheet.getRow(itRow).height=Math.max(60, sec.content.split('\n').length*18);
                recSheet.mergeCells(itRow,2,itRow,2);
                const cc=recSheet.getCell(itRow,2);
                cc.value=sec.content;
                cc.font={name:'Arial',size:10,color:{argb:DT}};
                cc.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFEFCF6'}};
                cc.alignment={horizontal:'right',vertical:'top',wrapText:true,readingOrder:FG.dir()};
                cc.border={top:{style:'hair'},bottom:{style:'hair',color:{argb:G}},left:{style:'hair'},right:{style:'hair'}};
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const now = new Date();
            const fileName = `${T('s90')}${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert(T('s91') + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== تصدير Word احترافي ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (!globalForecastData) { alert(T('s24')); return; }
        showLoading(T('s92'), T('s93'));
        try {
            const F = globalForecastData.forecast;
            const I = globalForecastData.inputs;
            const currency = I.currency;
            const companyName = I.companyName;
            const years = globalForecastData.years;
            const now = new Date();
            const dateStr = now.toLocaleDateString(FG.locale());

            const revCanvas = document.getElementById('revenueChart');
            const fcfCanvas = document.getElementById('fcfChart');
            let revImgBase64='', fcfImgBase64='';
            if (revCanvas) {
                const origBg = revCanvas.parentElement.style.backgroundColor;
                revCanvas.parentElement.style.backgroundColor = '#ffffff';
                const img = await html2canvas(revCanvas, { scale: 2, backgroundColor: '#ffffff' });
                revCanvas.parentElement.style.backgroundColor = origBg;
                revImgBase64 = img.toDataURL('image/png');
            }
            if (fcfCanvas) {
                const origBg = fcfCanvas.parentElement.style.backgroundColor;
                fcfCanvas.parentElement.style.backgroundColor = '#ffffff';
                const img = await html2canvas(fcfCanvas, { scale: 2, backgroundColor: '#ffffff' });
                fcfCanvas.parentElement.style.backgroundColor = origBg;
                fcfImgBase64 = img.toDataURL('image/png');
            }

            const kpiData = [
                { label: 'NPV', value: `${currency} ${F.totalNpv.toFixed(0)}`, good: F.totalNpv>0 },
                { label: 'IRR', value: F.irr?(F.irr*100).toFixed(2)+'%':T('s5'), good: F.irr && F.irr>I.discountRate },
                { label: T('s57'), value: F.paybackPeriod?F.paybackPeriod.toFixed(1)+T('s19'):T('s20'), good: F.paybackPeriod && F.paybackPeriod<=years },
                { label: T('s58'), value: `${currency} ${F.terminalValue.toFixed(0)}`, good: F.terminalValue>0 }
            ];
            let kpiRows='';
            kpiData.forEach(k=>{
                kpiRows += `<tr style="border:1px solid #b8860b;"><td style="padding:12px;background:${k.good?'#d4edda':'#f8d7da'};text-align:right;">${k.label}</td><td style="padding:12px;background:${k.good?'#d4edda':'#f8d7da'};text-align:center;"><strong style="font-size:1.2rem;color:${k.good?'#155724':'#721c24'}">${k.value}</strong></td><td style="padding:12px;background:${k.good?'#d4edda':'#f8d7da'};text-align:center;">${k.good?T('s94'):T('s95')}</td></tr>`;
            });

            let incomeHtml = T('s96');
            for (let i=0; i<years; i++) {
                incomeHtml += `${T('s97')}${i+1}</td><td style="padding:8px;text-align:center;">${currency} ${F.revenue[i].toFixed(0)}</td><td style="padding:8px;text-align:center;">${currency} ${F.cogs[i].toFixed(0)}</td><td style="padding:8px;text-align:center;">${currency} ${F.opex[i].toFixed(0)}</td><td style="padding:8px;text-align:center;">${currency} ${I.depreciation.toFixed(0)}</td><td style="padding:8px;text-align:center;">${currency} ${F.ebit[i].toFixed(0)}</td><td style="padding:8px;text-align:center;">${currency} ${F.tax[i].toFixed(0)}</td><td style="padding:8px;text-align:center;">${currency} ${F.netIncome[i].toFixed(0)}</td></tr>`;
            }
            incomeHtml += '</tbody></table>';

            let fcfHtml = T('s98');
            for (let i=0; i<years; i++) {
                const changeWC = (i===0)?F.wc[i]-I.initialWC:F.wc[i]-F.wc[i-1];
                fcfHtml += `${T('s97')}${i+1}</td><td style="padding:8px;text-align:center;">${currency} ${F.netIncome[i].toFixed(0)}</td><td style="padding:8px;text-align:center;">${currency} ${I.depreciation.toFixed(0)}</td><td style="padding:8px;text-align:center;">${currency} ${I.capex.toFixed(0)}</td><td style="padding:8px;text-align:center;">${currency} ${changeWC.toFixed(0)}</td><td style="padding:8px;text-align:center;">${currency} ${F.fcf[i].toFixed(0)}</td></tr>`;
            }
            fcfHtml += '</tbody></table>';

            const fullHtml = `${T('s100')}${companyName}${T('s101')}${dateStr}${T('s102')}${currency}${T('s103')}${years}${T('s104')}${currency} ${I.baseRevenue.toFixed(0)}${T('s105')}${(I.growthRate*100).toFixed(1)}${T('s106')}${(I.cogsPercent*100).toFixed(0)}${T('s107')}${(I.opexPercent*100).toFixed(0)}${T('s108')}${(I.taxRate*100).toFixed(0)}${T('s109')}${(I.discountRate*100).toFixed(1)}${T('s110')}${currency} ${I.depreciation.toFixed(0)}${T('s111')}${currency} ${I.capex.toFixed(0)}${T('s112')}${currency} ${I.initialInvestment.toFixed(0)}${T('s113')}${(I.terminalGrowth*100).toFixed(1)}${T('s114')}${kpiRows}</table>
                <div style="margin:20px 0;padding:15px;background:${F.totalNpv>0?'#d4edda':'#f8d7da'};border-radius:10px;text-align:center;"><strong>${F.totalNpv>0?T('s60'):T('s61')}${T('s115')}${revImgBase64 ? `<img src="${revImgBase64}" class="chart-img" />` : T('s99')}</div>
                <div style="text-align:center;">${fcfImgBase64 ? `<img src="${fcfImgBase64}" class="chart-img" />` : T('s99')}${T('s116')}${incomeHtml}${T('s117')}${fcfHtml}${T('s118')}${currency} ${F.totalNpv.toFixed(0)}</p>
                    <p><strong>IRR:</strong> ${F.irr?(F.irr*100).toFixed(2)+'%':T('s5')}${T('s119')}${F.paybackPeriod?F.paybackPeriod.toFixed(1)+T('s19'):T('s20')}${T('s120')}${currency} ${F.terminalValue.toFixed(0)}${T('s121')}${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${T('s90')}${companyName}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert(T('s122') + err.message); } finally { hideLoading(); }
    });
