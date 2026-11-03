
    AOS.init({ duration: 800, once: true, offset: 100 });

    // ===== Calculator =====
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
            } catch(e) { calcDisplay.value = 'Error'; currentCalcInput = ''; }
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

    // ===== Loading overlay =====
    function showLoading(title, msg) {
        document.getElementById('loadingTitle').textContent = title;
        document.getElementById('loadingMsg').textContent = msg;
        document.getElementById('exportLoading').classList.add('show');
    }
    function hideLoading() {
        document.getElementById('exportLoading').classList.remove('show');
    }

    // ===== Global variable =====
    let globalForecastData = null;

    // ===== Calculation functions =====
    function getInputs() {
        return {
            currency: document.getElementById('currencySelect').value,
            companyName: document.getElementById('companyName').value || 'Entity',
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

    function calculateForecast(inputs) {
        const years = inputs.forecastYears;
        let revenue = [], cogs = [], opex = [], ebit = [], tax = [], netIncome = [], fcf = [];

        for (let i = 0; i < years; i++) {
            let rev = inputs.baseRevenue * Math.pow(1 + inputs.growthRate, i + 1);
            revenue.push(rev);
            let c = rev * inputs.cogsPercent;
            cogs.push(c);
            let op = rev * inputs.opexPercent;
            opex.push(op);
            let ebit_i = rev - c - op - inputs.depreciation;
            ebit.push(ebit_i);
            let tax_i = ebit_i > 0 ? ebit_i * inputs.taxRate : 0;
            tax.push(tax_i);
            let net = ebit_i - tax_i;
            netIncome.push(net);
        }

        let wc = [];
        for (let i = 0; i < years; i++) {
            let receivables = (inputs.dso / 365) * revenue[i];
            let inventory = (inputs.dio / 365) * inputs.cogsPercent * revenue[i];
            let payables = (inputs.dpo / 365) * inputs.cogsPercent * revenue[i];
            let wc_i = receivables + inventory - payables;
            wc.push(wc_i);
        }

        for (let i = 0; i < years; i++) {
            let changeWC = (i === 0) ? wc[i] - inputs.initialWC : wc[i] - wc[i - 1];
            let fcf_i = netIncome[i] + inputs.depreciation - inputs.capex - changeWC;
            fcf.push(fcf_i);
        }

        let npv = -inputs.initialInvestment;
        let cumFcf = 0;
        let paybackYear = null, paybackFraction = 0;
        for (let i = 0; i < years; i++) {
            let pv = fcf[i] / Math.pow(1 + inputs.discountRate, i + 1);
            npv += pv;
            cumFcf += fcf[i];
            if (cumFcf >= inputs.initialInvestment && paybackYear === null) {
                paybackYear = i + 1;
                let prevCum = cumFcf - fcf[i];
                paybackFraction = (inputs.initialInvestment - prevCum) / fcf[i];
            }
        }
        let paybackPeriod = paybackYear ? paybackYear - 1 + paybackFraction : null;

        let terminalFcf = fcf[years - 1] * (1 + inputs.terminalGrowth);
        let terminalValue = terminalFcf / (inputs.discountRate - inputs.terminalGrowth);
        let pvTerminal = terminalValue / Math.pow(1 + inputs.discountRate, years);
        let totalNpv = npv + pvTerminal;

        let irr = null;
        let cashFlows = [-inputs.initialInvestment, ...fcf];
        cashFlows[cashFlows.length - 1] += terminalValue;
        irr = calculateIRR(cashFlows);

        return { revenue, cogs, opex, ebit, tax, netIncome, fcf, wc, npv, totalNpv, irr, paybackPeriod, terminalValue };
    }

    function calculateIRR(cashFlows) {
        let hasPos = cashFlows.some(cf => cf > 0);
        let hasNeg = cashFlows.some(cf => cf < 0);
        if (!hasPos || !hasNeg) return NaN;
        let low = -0.99, high = 1e6, fLow = 0, fHigh = 0;
        for (let i = 0; i < cashFlows.length; i++) {
            fLow += cashFlows[i] / Math.pow(1 + low, i);
            fHigh += cashFlows[i] / Math.pow(1 + high, i);
        }
        if (fLow * fHigh > 0) return NaN;
        for (let iter = 0; iter < 1000; iter++) {
            let mid = (low + high) / 2;
            let fMid = 0;
            for (let i = 0; i < cashFlows.length; i++) fMid += cashFlows[i] / Math.pow(1 + mid, i);
            if (Math.abs(fMid) < 1e-8) return mid;
            if (fMid > 0) low = mid;
            else high = mid;
        }
        return (low + high) / 2;
    }

    // ===== Display results =====
    let revenueChart, fcfChart;

    function displayForecast() {
        const inputs = getInputs();
        const forecast = calculateForecast(inputs);
        const currency = inputs.currency;
        const years = inputs.forecastYears;

        globalForecastData = { inputs, forecast, years, currency };

        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('initialMessage').style.display = 'none';

        document.getElementById('kpiCards').innerHTML = `
            <div class="result-card"><div class="label">Net Present Value (NPV)</div><div class="value">${currency}${forecast.totalNpv.toFixed(0)}</div><div class="status ${forecast.totalNpv>0?'status-good':'status-bad'}">${forecast.totalNpv>0?'Profitable':'Loss-making'}</div></div>
            <div class="result-card"><div class="label">Internal Rate of Return (IRR)</div><div class="value">${forecast.irr ? (forecast.irr*100).toFixed(2)+'%' : 'N/A'}</div><div class="status ${forecast.irr && forecast.irr>inputs.discountRate?'status-good':'status-warning'}">${forecast.irr && forecast.irr>inputs.discountRate ? '> Discount Rate' : '≤ Discount Rate'}</div></div>
            <div class="result-card"><div class="label">Payback Period</div><div class="value">${forecast.paybackPeriod ? forecast.paybackPeriod.toFixed(1) : '∞'}</div><div class="unit">years</div></div>
            <div class="result-card"><div class="label">Terminal Value</div><div class="value">${currency}${forecast.terminalValue.toFixed(0)}</div></div>
        `;

        let incomeHtml = `<thead><tr><th>Year</th><th>Revenue</th><th>COGS</th><th>Operating Expenses</th><th>Depreciation</th><th>EBIT</th><th>Tax</th><th>Net Income</th></tr></thead><tbody>`;
        for (let i = 0; i < years; i++) {
            incomeHtml += `<tr><td>Year ${i+1}</td><td>${currency}${forecast.revenue[i].toFixed(0)}</td><td>${currency}${forecast.cogs[i].toFixed(0)}</td><td>${currency}${forecast.opex[i].toFixed(0)}</td><td>${currency}${inputs.depreciation.toFixed(0)}</td><td class="${forecast.ebit[i]>=0?'positive':'negative'}">${currency}${forecast.ebit[i].toFixed(0)}</td><td>${currency}${forecast.tax[i].toFixed(0)}</td><td class="${forecast.netIncome[i]>=0?'positive':'negative'}">${currency}${forecast.netIncome[i].toFixed(0)}</td></tr>`;
        }
        incomeHtml += `</tbody>`;
        document.getElementById('incomeTable').innerHTML = `<table>${incomeHtml}</table>`;

        let cashHtml = `<thead><tr><th>Year</th><th>Net Income</th><th>Depreciation</th><th>CAPEX</th><th>Change in WC</th><th>Free Cash Flow (FCF)</th></tr></thead><tbody>`;
        for (let i = 0; i < years; i++) {
            let changeWC = (i === 0) ? forecast.wc[i] - inputs.initialWC : forecast.wc[i] - forecast.wc[i - 1];
            cashHtml += `<tr><td>Year ${i+1}</td><td>${currency}${forecast.netIncome[i].toFixed(0)}</td><td>${currency}${inputs.depreciation.toFixed(0)}</td><td>${currency}${inputs.capex.toFixed(0)}</td><td>${currency}${changeWC.toFixed(0)}</td><td class="${forecast.fcf[i]>=0?'positive':'negative'}">${currency}${forecast.fcf[i].toFixed(0)}</td></tr>`;
        }
        cashHtml += `</tbody>`;
        document.getElementById('cashFlowTable').innerHTML = `<table>${cashHtml}</table>`;

        if (revenueChart) revenueChart.destroy();
        const ctxRev = document.getElementById('revenueChart').getContext('2d');
        revenueChart = new Chart(ctxRev, {
            type: 'line',
            data: {
                labels: Array.from({ length: years }, (_, i) => `Year ${i+1}`),
                datasets: [
                    { label: 'Revenue', data: forecast.revenue, borderColor: '#28a745', fill: false },
                    { label: 'Net Income', data: forecast.netIncome, borderColor: '#b8860b', fill: false }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        if (fcfChart) fcfChart.destroy();
        const ctxFcf = document.getElementById('fcfChart').getContext('2d');
        fcfChart = new Chart(ctxFcf, {
            type: 'bar',
            data: {
                labels: Array.from({ length: years }, (_, i) => `Year ${i+1}`),
                datasets: [{ label: 'Free Cash Flow', data: forecast.fcf, backgroundColor: '#b8860b' }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        document.getElementById('valuationCard').innerHTML = `
            <div class="label">Project Valuation</div>
            <div>NPV (including terminal value): ${currency}${forecast.totalNpv.toFixed(0)}</div>
            <div>IRR: ${forecast.irr ? (forecast.irr*100).toFixed(2)+'%' : 'N/A'}</div>
            <div>Payback Period: ${forecast.paybackPeriod ? forecast.paybackPeriod.toFixed(1)+' years' : 'Not achieved'}</div>
            <div class="unit">* Terminal value calculated with perpetual growth rate ${(inputs.terminalGrowth*100).toFixed(1)}%</div>
        `;
    }

    document.getElementById('calculateBtn').addEventListener('click', displayForecast);

    // ================================================================
    // ========== Export to Professional Excel ==========
    // ================================================================
    document.getElementById('exportExcelBtn').addEventListener('click', async function() {
        if (!globalForecastData) { alert('Please run the analysis first.'); return; }
        showLoading('Creating Excel report...', 'Creating sheets and charts');
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

            function hs(bg=HB, tc=GL){return{font:{name:'Arial',bold:true,size:11,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',wrapText:true,readingOrder:'ltr'},border:{top:{style:'thin',color:{argb:G}},bottom:{style:'thin',color:{argb:G}},left:{style:'thin',color:{argb:G}},right:{style:'thin',color:{argb:G}}}};}
            function cs(bg='FFFFFFFF',tc=DT,b=false,h='center'){return{font:{name:'Arial',bold:b,size:10,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:h,vertical:'middle',wrapText:true,readingOrder:'ltr'},border:{top:{style:'hair',color:{argb:'FFCCCCCC'}},bottom:{style:'hair',color:{argb:'FFCCCCCC'}},left:{style:'hair',color:{argb:'FFCCCCCC'}},right:{style:'hair',color:{argb:'FFCCCCCC'}}}};}
            function ap(c,s){if(s.font)c.font=s.font;if(s.fill)c.fill=s.fill;if(s.alignment)c.alignment=s.alignment;if(s.border)c.border=s.border;if(s.numFmt)c.numFmt=s.numFmt;}
            function mh(ws,fc,tc,r,text,bg=HB,tc2=GL,fs=12){ws.mergeCells(r,fc,r,tc);const c=ws.getCell(r,fc);c.value=text;c.font={name:'Arial',bold:true,size:fs,color:{argb:tc2}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:'ltr'};c.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};}

            // 1. Cover sheet
            const cv = workbook.addWorksheet('Report Cover', { views: [{ rightToLeft: false, showGridLines: false }] });
            [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
            cv.getRow(2).height=80; cv.getRow(4).height=60;
            cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1);
            bc.value='FAROUK GRUP for Consulting & Business\nFAROUK GRUP';
            bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:'ltr'};
            mh(cv,1,4,4,`Advanced Financial Forecast Report\n${companyName}`,DB,GL,18);
            const inf=[['📋 Entity',companyName],['📅 Date',new Date().toLocaleDateString('en-US')],['💰 Currency',currency],['📈 Forecast Period',`${years} years`],['💵 NPV',`${currency} ${F.totalNpv.toFixed(0)}`],['📊 IRR',F.irr?(F.irr*100).toFixed(2)+'%':'N/A']];
            let ir=6;
            inf.forEach(([l,v],idx)=>{
                cv.mergeCells(ir,1,ir,2); cv.mergeCells(ir,3,ir,4);
                const lc=cv.getCell(ir,1), vc=cv.getCell(ir,3); lc.value=l; vc.value=v;
                const bg=idx%2===0?AR:'FFFEFCF6';
                ap(lc,{font:{name:'Arial',bold:true,size:11,color:{argb:'00695C'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'right',vertical:'middle',readingOrder:'ltr'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                ap(vc,{font:{name:'Arial',size:11,color:{argb:DT}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',readingOrder:'ltr'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                cv.getRow(ir).height=28; ir++;
            });

            // 2. Inputs
            const inputsSheet = workbook.addWorksheet('Inputs & Assumptions', { views: [{ rightToLeft: false, showGridLines: false }] });
            inputsSheet.getColumn(1).width=5; inputsSheet.getColumn(2).width=38; inputsSheet.getColumn(3).width=22; inputsSheet.getColumn(4).width=22; inputsSheet.getColumn(5).width=5;
            mh(inputsSheet,1,5,1,'📋 Inputs & Assumptions',DB,GL,14);
            inputsSheet.getRow(1).height=40;
            mh(inputsSheet,2,4,2,'Project Base Data',SB,'FFFFFFFF',11);
            inputsSheet.getRow(2).height=28;
            const inputFields = [
                ['Base Year Revenue', I.baseRevenue, `${currency} ${I.baseRevenue.toFixed(0)}`],
                ['COGS (%)', (I.cogsPercent*100), `${(I.cogsPercent*100).toFixed(0)}%`],
                ['Operating Expenses (%)', (I.opexPercent*100), `${(I.opexPercent*100).toFixed(0)}%`],
                ['Tax Rate (%)', (I.taxRate*100), `${(I.taxRate*100).toFixed(0)}%`],
                ['Annual Depreciation', I.depreciation, `${currency} ${I.depreciation.toFixed(0)}`],
                ['Annual CAPEX', I.capex, `${currency} ${I.capex.toFixed(0)}`],
                ['DSO (Days)', I.dso, `${I.dso} days`],
                ['DIO (Days)', I.dio, `${I.dio} days`],
                ['DPO (Days)', I.dpo, `${I.dpo} days`],
                ['Revenue Growth Rate (%)', (I.growthRate*100), `${(I.growthRate*100).toFixed(1)}%`],
                ['Forecast Period (Years)', years, 'years'],
                ['Discount Rate (WACC) (%)', (I.discountRate*100), `${(I.discountRate*100).toFixed(1)}%`],
                ['Initial Working Capital', I.initialWC, `${currency} ${I.initialWC.toFixed(0)}`],
                ['Initial Investment (Year 0)', I.initialInvestment, `${currency} ${I.initialInvestment.toFixed(0)}`],
                ['Perpetual Growth Rate (%)', (I.terminalGrowth*100), `${(I.terminalGrowth*100).toFixed(1)}%`]
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

            // 3. KPI Dashboard
            const kpiSheet = workbook.addWorksheet('KPI Dashboard', { views: [{ rightToLeft: false, showGridLines: false }] });
            [5,32,22,22,22,5].forEach((w,i)=>kpiSheet.getColumn(i+1).width=w);
            mh(kpiSheet,1,6,1,'📊 KPI Dashboard',DB,GL,15);
            kpiSheet.getRow(1).height=45;
            mh(kpiSheet,2,5,2,`${companyName} | ${new Date().toLocaleDateString('en-US')}`,HB,'FFFFFFFF',10);
            kpiSheet.getRow(2).height=26;
            const kpis = [
                { label: 'NPV', value: `${currency} ${F.totalNpv.toFixed(0)}`, good: F.totalNpv>0 },
                { label: 'IRR', value: F.irr?(F.irr*100).toFixed(2)+'%':'N/A', good: F.irr && F.irr>I.discountRate },
                { label: 'Payback Period', value: F.paybackPeriod?F.paybackPeriod.toFixed(1)+' years':'Not achieved', good: F.paybackPeriod && F.paybackPeriod<=years },
                { label: 'Terminal Value', value: `${currency} ${F.terminalValue.toFixed(0)}`, good: F.terminalValue>0 },
                { label: 'Final Year Revenue', value: `${currency} ${F.revenue[years-1].toFixed(0)}`, good: true }
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
                lc2.font={name:'Arial',bold:true,size:11,color:{argb:DT}}; lc2.alignment={horizontal:'right',vertical:'middle',readingOrder:'ltr'};
                vc3.font={name:'Arial',bold:true,size:13,color:{argb:tc}}; vc3.alignment={horizontal:'center',vertical:'middle'};
                kRow++;
            });
            kRow++;
            kpiSheet.mergeCells(kRow,2,kRow,5);
            const kFinal=kpiSheet.getCell(kRow,2);
            kFinal.value=F.totalNpv>0?'✅ Project is profitable — investment recommended':'⚠️ Project is loss-making — review needed';
            kFinal.font={name:'Arial',bold:true,size:13,color:{argb:F.totalNpv>0?PT:'856404'}};
            kFinal.fill={type:'pattern',pattern:'solid',fgColor:{argb:F.totalNpv>0?PB:GB}};
            kFinal.alignment={horizontal:'center',vertical:'middle',readingOrder:'ltr'};
            kFinal.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};
            kpiSheet.getRow(kRow).height=40;

            // 4. Income Statement
            const incomeSheet = workbook.addWorksheet('Projected Income Statement', { views: [{ rightToLeft: false, showGridLines: false }] });
            incomeSheet.getColumn(1).width=5; incomeSheet.getColumn(2).width=14; incomeSheet.getColumn(3).width=16; incomeSheet.getColumn(4).width=16; incomeSheet.getColumn(5).width=16; incomeSheet.getColumn(6).width=14; incomeSheet.getColumn(7).width=16; incomeSheet.getColumn(8).width=14; incomeSheet.getColumn(9).width=16; incomeSheet.getColumn(10).width=5;
            mh(incomeSheet,1,10,1,'📋 Projected Income Statement',DB,GL,14);
            incomeSheet.getRow(1).height=40;
            const incHeaders = ['Year','Revenue','COGS','Operating Expenses','Depreciation','EBIT','Tax','Net Income'];
            const incRow = incomeSheet.getRow(2);
            incHeaders.forEach((h,i)=>{const c=incomeSheet.getCell(2,i+2);c.value=h;c.font={name:'Arial',bold:true,size:10,color:{argb:'FFFFFFFF'}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:G}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:'ltr'};c.border={top:{style:'thin'},bottom:{style:'thin'},left:{style:'thin'},right:{style:'thin'}};});
            incomeSheet.getRow(2).height=28;
            for (let i=0; i<years; i++) {
                const r=i+3;
                const rowData = [`Year ${i+1}`, F.revenue[i], F.cogs[i], F.opex[i], I.depreciation, F.ebit[i], F.tax[i], F.netIncome[i]];
                rowData.forEach((val,j)=>{const c=incomeSheet.getCell(r,j+2);c.value=val;c.font={name:'Arial',size:10,color:{argb:DT}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:i%2===0?'FFFEFCF6':'FFFFFFFF'}};c.alignment={horizontal:'center',vertical:'middle',readingOrder:'ltr'};c.border={top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}};if(typeof val==='number')c.numFmt=nc;});
                incomeSheet.getRow(r).height=22;
            }

            // 5. Free Cash Flows
            const fcfSheet = workbook.addWorksheet('Free Cash Flows', { views: [{ rightToLeft: false, showGridLines: false }] });
            fcfSheet.getColumn(1).width=5; fcfSheet.getColumn(2).width=14; fcfSheet.getColumn(3).width=16; fcfSheet.getColumn(4).width=14; fcfSheet.getColumn(5).width=14; fcfSheet.getColumn(6).width=22; fcfSheet.getColumn(7).width=22; fcfSheet.getColumn(8).width=5;
            mh(fcfSheet,1,8,1,'💵 Free Cash Flows (FCF)',DB,GL,14);
            fcfSheet.getRow(1).height=40;
            const fcfHeaders = ['Year','Net Income','Depreciation','CAPEX','Change in WC','Free Cash Flow'];
            const fcfHRow = fcfSheet.getRow(2);
            fcfHeaders.forEach((h,i)=>{const c=fcfSheet.getCell(2,i+2);c.value=h;c.font={name:'Arial',bold:true,size:10,color:{argb:'FFFFFFFF'}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:G}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:'ltr'};c.border={top:{style:'thin'},bottom:{style:'thin'},left:{style:'thin'},right:{style:'thin'}};});
            fcfSheet.getRow(2).height=28;
            for (let i=0; i<years; i++) {
                const r=i+3;
                const changeWC = (i===0)?F.wc[i]-I.initialWC:F.wc[i]-F.wc[i-1];
                const rowData = [`Year ${i+1}`, F.netIncome[i], I.depreciation, I.capex, changeWC, F.fcf[i]];
                rowData.forEach((val,j)=>{const c=fcfSheet.getCell(r,j+2);c.value=val;c.font={name:'Arial',size:10,color:{argb:DT}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:i%2===0?'FFFEFCF6':'FFFFFFFF'}};c.alignment={horizontal:'center',vertical:'middle',readingOrder:'ltr'};c.border={top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}};if(typeof val==='number')c.numFmt=nc;});
                fcfSheet.getRow(r).height=22;
            }

            // 6. Charts
            const chartsSheet = workbook.addWorksheet('Charts', { views: [{ rightToLeft: false, showGridLines: false }] });
            chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
            mh(chartsSheet,1,3,1,'📈 Forecast Charts',DB,GL,14);
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

            // 7. Recommendations
            const recSheet = workbook.addWorksheet('Interpretation & Recommendations', { views: [{ rightToLeft: false, showGridLines: false }] });
            recSheet.getColumn(1).width=5; recSheet.getColumn(2).width=50; recSheet.getColumn(3).width=5;
            mh(recSheet,1,3,1,'📝 Interpretation & Recommendations',DB,GL,14);
            recSheet.getRow(1).height=45;
            const sections = [
                { title: '1. Project Summary', content: `Entity: ${companyName}\nCurrency: ${currency}\nForecast Period: ${years} years\nRevenue Growth Rate: ${(I.growthRate*100).toFixed(1)}%\nDiscount Rate: ${(I.discountRate*100).toFixed(1)}%` },
                { title: '2. Analysis Results', content: `NPV: ${currency} ${F.totalNpv.toFixed(0)}\nIRR: ${F.irr?(F.irr*100).toFixed(2)+'%':'N/A'}\nPayback Period: ${F.paybackPeriod?F.paybackPeriod.toFixed(1)+' years':'Not achieved'}\nTerminal Value: ${currency} ${F.terminalValue.toFixed(0)}` },
                { title: '3. Recommendations', content: F.totalNpv>0?'• The project is profitable — proceed.\n• Monitor actual cash flows.\n• Update assumptions annually.':'• The project is currently not profitable.\n• Reduce operating costs.\n• Reassess growth rate expectations.' },
                { title: '4. Disclaimer', content: 'This analysis is based on estimated assumptions. Actual results may differ. Consult a financial expert.' }
            ];
            let itRow=2;
            sections.forEach((sec,idx)=>{
                itRow++;
                recSheet.getRow(itRow).height=30;
                recSheet.mergeCells(itRow,2,itRow,2);
                const tc3=recSheet.getCell(itRow,2);
                tc3.value=sec.title; tc3.font={name:'Arial',bold:true,size:12,color:{argb:GL}};
                tc3.fill={type:'pattern',pattern:'solid',fgColor:{argb:idx%2===0?HB:SB}};
                tc3.alignment={horizontal:'right',vertical:'middle',readingOrder:'ltr'};
                tc3.border={bottom:{style:'medium',color:{argb:G}}};
                itRow++;
                recSheet.getRow(itRow).height=Math.max(60, sec.content.split('\n').length*18);
                recSheet.mergeCells(itRow,2,itRow,2);
                const cc=recSheet.getCell(itRow,2);
                cc.value=sec.content;
                cc.font={name:'Arial',size:10,color:{argb:DT}};
                cc.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFEFCF6'}};
                cc.alignment={horizontal:'right',vertical:'top',wrapText:true,readingOrder:'ltr'};
                cc.border={top:{style:'hair'},bottom:{style:'hair',color:{argb:G}},left:{style:'hair'},right:{style:'hair'}};
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const now = new Date();
            const fileName = `Financial_Forecast_${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert('Excel error: ' + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== Export to Professional Word ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (!globalForecastData) { alert('Please run the analysis first.'); return; }
        showLoading('Creating Word report...', 'Gathering data and charts');
        try {
            const F = globalForecastData.forecast;
            const I = globalForecastData.inputs;
            const currency = I.currency;
            const companyName = I.companyName;
            const years = globalForecastData.years;
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US');

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
                { label: 'IRR', value: F.irr?(F.irr*100).toFixed(2)+'%':'N/A', good: F.irr && F.irr>I.discountRate },
                { label: 'Payback Period', value: F.paybackPeriod?F.paybackPeriod.toFixed(1)+' years':'Not achieved', good: F.paybackPeriod && F.paybackPeriod<=years },
                { label: 'Terminal Value', value: `${currency} ${F.terminalValue.toFixed(0)}`, good: F.terminalValue>0 }
            ];
            let kpiRows='';
            kpiData.forEach(k=>{
                kpiRows += `<tr style="border:1px solid #b8860b;"><td style="padding:12px;background:${k.good?'#d4edda':'#f8d7da'};text-align:right;">${k.label}</td><td style="padding:12px;background:${k.good?'#d4edda':'#f8d7da'};text-align:center;"><strong style="font-size:1.2rem;color:${k.good?'#155724':'#721c24'}">${k.value}</strong></td><td style="padding:12px;background:${k.good?'#d4edda':'#f8d7da'};text-align:center;">${k.good?'✅ Positive':'⚠️ Review'}</td></tr>`;
            });

            let incomeHtml = '<table style="width:100%;border-collapse:collapse;"><thead><tr><th style="border:1px solid #b8860b;padding:8px;">Year</th><th style="border:1px solid #b8860b;padding:8px;">Revenue</th><th style="border:1px solid #b8860b;padding:8px;">COGS</th><th style="border:1px solid #b8860b;padding:8px;">Operating Expenses</th><th style="border:1px solid #b8860b;padding:8px;">Depreciation</th><th style="border:1px solid #b8860b;padding:8px;">EBIT</th><th style="border:1px solid #b8860b;padding:8px;">Tax</th><th style="border:1px solid #b8860b;padding:8px;">Net Income</th></tr></thead><tbody>';
            for (let i=0; i<years; i++) {
                incomeHtml += `<tr style="border:1px solid #b8860b;"><td style="padding:8px;text-align:center;">Year ${i+1}</td><td style="padding:8px;text-align:center;">${currency} ${F.revenue[i].toFixed(0)}</td><td style="padding:8px;text-align:center;">${currency} ${F.cogs[i].toFixed(0)}</td><td style="padding:8px;text-align:center;">${currency} ${F.opex[i].toFixed(0)}</td><td style="padding:8px;text-align:center;">${currency} ${I.depreciation.toFixed(0)}</td><td style="padding:8px;text-align:center;">${currency} ${F.ebit[i].toFixed(0)}</td><td style="padding:8px;text-align:center;">${currency} ${F.tax[i].toFixed(0)}</td><td style="padding:8px;text-align:center;">${currency} ${F.netIncome[i].toFixed(0)}</td></tr>`;
            }
            incomeHtml += '</tbody></table>';

            let fcfHtml = '<table style="width:100%;border-collapse:collapse;"><thead><tr><th style="border:1px solid #b8860b;padding:8px;">Year</th><th style="border:1px solid #b8860b;padding:8px;">Net Income</th><th style="border:1px solid #b8860b;padding:8px;">Depreciation</th><th style="border:1px solid #b8860b;padding:8px;">CAPEX</th><th style="border:1px solid #b8860b;padding:8px;">Change in WC</th><th style="border:1px solid #b8860b;padding:8px;">Free Cash Flow</th></tr></thead><tbody>';
            for (let i=0; i<years; i++) {
                const changeWC = (i===0)?F.wc[i]-I.initialWC:F.wc[i]-F.wc[i-1];
                fcfHtml += `<tr style="border:1px solid #b8860b;"><td style="padding:8px;text-align:center;">Year ${i+1}</td><td style="padding:8px;text-align:center;">${currency} ${F.netIncome[i].toFixed(0)}</td><td style="padding:8px;text-align:center;">${currency} ${I.depreciation.toFixed(0)}</td><td style="padding:8px;text-align:center;">${currency} ${I.capex.toFixed(0)}</td><td style="padding:8px;text-align:center;">${currency} ${changeWC.toFixed(0)}</td><td style="padding:8px;text-align:center;">${currency} ${F.fcf[i].toFixed(0)}</td></tr>`;
            }
            fcfHtml += '</tbody></table>';

            const fullHtml = `<!DOCTYPE html>
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
            <head><meta charset='utf-8'><title>Financial Forecast Report - FAROUK GRUP</title>
            <style>
                body{font-family:'Arial','Tajawal',sans-serif;direction:ltr;margin:2rem;background:#fff;color:#333;}
                .cover{text-align:center;border-bottom:4px solid #b8860b;margin-bottom:30px;padding-bottom:20px;}
                .cover h1{font-size:32px;color:#b8860b;margin:0;}
                .cover h2{font-size:24px;color:#b48554;margin:5px 0;}
                table{width:100%;border-collapse:collapse;margin:20px 0;} th,td{border:1px solid #b8860b;padding:8px;text-align:center;}
                th{background:#fefcf6;color:#b8860b;}
                .chart-img{max-width:100%;border:1px solid #b8860b;border-radius:10px;margin:20px 0;}
                .footer{text-align:center;margin-top:40px;color:#888;border-top:1px dashed #b8860b;padding-top:10px;}
            </style></head>
            <body>
                <div class="cover">
                    <h1>FAROUK GRUP for Consulting & Business</h1>
                    <h2>Advanced Financial Forecast Report</h2>
                    <p>Entity: ${companyName} | Date: ${dateStr}</p>
                    <p>Currency: ${currency} | Forecast Period: ${years} years</p>
                </div>
                <h2 style="color:#b8860b;">Base Inputs</h2>
                <table><tbody>
                    <tr><th>Base Year Revenue</th><td>${currency} ${I.baseRevenue.toFixed(0)}</td><th>Revenue Growth Rate</th><td>${(I.growthRate*100).toFixed(1)}%</td></tr>
                    <tr><th>COGS</th><td>${(I.cogsPercent*100).toFixed(0)}%</td><th>Operating Expenses</th><td>${(I.opexPercent*100).toFixed(0)}%</td></tr>
                    <tr><th>Tax Rate</th><td>${(I.taxRate*100).toFixed(0)}%</td><th>Discount Rate</th><td>${(I.discountRate*100).toFixed(1)}%</td></tr>
                    <tr><th>Annual Depreciation</th><td>${currency} ${I.depreciation.toFixed(0)}</td><th>Annual CAPEX</th><td>${currency} ${I.capex.toFixed(0)}</td></tr>
                    <tr><th>Initial Investment</th><td>${currency} ${I.initialInvestment.toFixed(0)}</td><th>Perpetual Growth Rate</th><td>${(I.terminalGrowth*100).toFixed(1)}%</td></tr>
                </tbody></table>
                <h2 style="color:#b8860b;">📊 KPI Dashboard</h2>
                <table>${kpiRows}</table>
                <div style="margin:20px 0;padding:15px;background:${F.totalNpv>0?'#d4edda':'#f8d7da'};border-radius:10px;text-align:center;"><strong>${F.totalNpv>0?'✅ Project is profitable — investment recommended':'⚠️ Project is loss-making — review needed'}</strong></div>
                <h2 style="color:#b8860b;">📈 Charts</h2>
                <div style="text-align:center;">${revImgBase64 ? `<img src="${revImgBase64}" class="chart-img" />` : '<p>Chart not available</p>'}</div>
                <div style="text-align:center;">${fcfImgBase64 ? `<img src="${fcfImgBase64}" class="chart-img" />` : '<p>Chart not available</p>'}</div>
                <h2 style="color:#b8860b;">📋 Projected Income Statement</h2>
                ${incomeHtml}
                <h2 style="color:#b8860b;">💵 Free Cash Flows</h2>
                ${fcfHtml}
                <h2 style="color:#b8860b;">💰 Project Valuation</h2>
                <div style="background:#fefcf6;padding:15px;border-radius:10px;border-left:4px solid #b8860b;">
                    <p><strong>NPV:</strong> ${currency} ${F.totalNpv.toFixed(0)}</p>
                    <p><strong>IRR:</strong> ${F.irr?(F.irr*100).toFixed(2)+'%':'N/A'}</p>
                    <p><strong>Payback Period:</strong> ${F.paybackPeriod?F.paybackPeriod.toFixed(1)+' years':'Not achieved'}</p>
                    <p><strong>Terminal Value:</strong> ${currency} ${F.terminalValue.toFixed(0)}</p>
                </div>
                <div class="footer">Created by FAROUK GRUP for Consulting & Business © ${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Financial_Forecast_${companyName}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert('Word error: ' + err.message); } finally { hideLoading(); }
    });
