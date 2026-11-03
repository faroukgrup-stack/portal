
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

    // ===== Calculation functions =====
    let lastCalculation = null;

    function getInputs() {
        const cash = parseFloat(document.getElementById('cash').value) || 0;
        const inventory = parseFloat(document.getElementById('inventory').value) || 0;
        const otherCurrent = parseFloat(document.getElementById('otherCurrentAssets').value) || 0;
        const currentAssets = cash + inventory + otherCurrent;
        const fixedAssets = parseFloat(document.getElementById('fixedAssets').value) || 0;
        const totalAssets = currentAssets + fixedAssets;
        const currentLiabilities = parseFloat(document.getElementById('currentLiabilities').value) || 0;
        const longTermLiabilities = parseFloat(document.getElementById('longTermLiabilities').value) || 0;
        const totalLiabilities = currentLiabilities + longTermLiabilities;
        const equity = totalAssets - totalLiabilities;

        const revenue = parseFloat(document.getElementById('revenue').value) || 0;
        const cogs = parseFloat(document.getElementById('cogs').value) || 0;
        const operatingExpenses = parseFloat(document.getElementById('operatingExpenses').value) || 0;
        const interestExpense = parseFloat(document.getElementById('interestExpense').value) || 0;
        const taxRate = parseFloat(document.getElementById('taxRate').value) / 100 || 0;

        let creditSales = parseFloat(document.getElementById('creditSales').value) || 0;
        if (creditSales === 0 && revenue > 0) creditSales = revenue;

        const receivables = parseFloat(document.getElementById('receivables').value) || 0;
        const payables = parseFloat(document.getElementById('payables').value) || 0;

        const operatingProfit = revenue - cogs - operatingExpenses;
        const ebit = operatingProfit;
        const profitBeforeTax = operatingProfit - interestExpense;
        const netProfit = profitBeforeTax > 0 ? profitBeforeTax * (1 - taxRate) : profitBeforeTax;

        return {
            currency: document.getElementById('currencySelect').value,
            companyName: document.getElementById('companyName').value || 'Entity',
            currentAssets, cash, inventory, currentLiabilities, totalAssets, totalLiabilities, equity,
            revenue, cogs, operatingExpenses, interestExpense, taxRate,
            operatingProfit, ebit, netProfit,
            creditSales, receivables, payables,
            fixedAssets, longTermLiabilities
        };
    }

    function evaluateRatio(value, thresholds) {
        if (value === undefined || isNaN(value)) return { status: 'warning', text: 'Undefined', class: 'status-warning' };
        if (value >= thresholds.good) return { status: 'good', text: 'Good', class: 'status-good' };
        if (value >= thresholds.warning) return { status: 'warning', text: 'Acceptable', class: 'status-warning' };
        return { status: 'bad', text: 'Poor', class: 'status-bad' };
    }

    function calculateRatios(inputs) {
        const currentRatio = inputs.currentLiabilities ? inputs.currentAssets / inputs.currentLiabilities : 0;
        const quickRatio = inputs.currentLiabilities ? (inputs.currentAssets - inputs.inventory) / inputs.currentLiabilities : 0;
        const cashRatio = inputs.currentLiabilities ? inputs.cash / inputs.currentLiabilities : 0;

        const grossMargin = inputs.revenue ? (inputs.revenue - inputs.cogs) / inputs.revenue : 0;
        const operatingMargin = inputs.revenue ? inputs.operatingProfit / inputs.revenue : 0;
        const netMargin = inputs.revenue ? inputs.netProfit / inputs.revenue : 0;
        const roa = inputs.totalAssets ? inputs.netProfit / inputs.totalAssets : 0;
        const roe = inputs.equity ? inputs.netProfit / inputs.equity : 0;

        const debtToEquity = inputs.equity ? inputs.totalLiabilities / inputs.equity : 0;
        const debtToAssets = inputs.totalAssets ? inputs.totalLiabilities / inputs.totalAssets : 0;
        const interestCoverage = inputs.interestExpense ? inputs.ebit / inputs.interestExpense : 0;
        const equityRatio = inputs.totalAssets ? inputs.equity / inputs.totalAssets : 0;

        const inventoryTurnover = (inputs.cogs && inputs.inventory) ? inputs.cogs / inputs.inventory : 0;
        const daysInventory = inventoryTurnover ? 365 / inventoryTurnover : 0;
        const receivablesTurnover = (inputs.creditSales && inputs.receivables) ? inputs.creditSales / inputs.receivables : 0;
        const daysSalesOutstanding = receivablesTurnover ? 365 / receivablesTurnover : 0;
        const payablesTurnover = (inputs.cogs && inputs.payables) ? inputs.cogs / inputs.payables : 0;
        const daysPayables = payablesTurnover ? 365 / payablesTurnover : 0;
        const cashConversionCycle = daysInventory + daysSalesOutstanding - daysPayables;

        return {
            currentRatio, quickRatio, cashRatio,
            grossMargin, operatingMargin, netMargin, roa, roe,
            debtToEquity, debtToAssets, interestCoverage, equityRatio,
            inventoryTurnover, daysInventory, receivablesTurnover, daysSalesOutstanding,
            payablesTurnover, daysPayables, cashConversionCycle
        };
    }

    function getRecommendation(ratios) {
        let rec = [];
        if (ratios.currentRatio < 1) rec.push('⚠️ Liquidity is very low, risk of financial distress.');
        else if (ratios.currentRatio < 1.5) rec.push('🟡 Liquidity is acceptable, it is preferable to increase current assets.');
        else rec.push('✅ Liquidity is good, ability to pay short-term obligations.');

        if (ratios.quickRatio < 0.5) rec.push('⚠️ Quick ratio is low, reliance on inventory to pay debts.');
        if (ratios.roe < 0.1) rec.push('⚠️ Return on equity is low, improve profitability.');
        if (ratios.debtToEquity > 2) rec.push('🔴 Debt ratio is very high, high bankruptcy risk.');
        if (ratios.interestCoverage < 1.5) rec.push('⚠️ Interest coverage is weak, difficulty paying debt obligations.');
        if (ratios.cashConversionCycle < 0) rec.push('✅ Cash conversion cycle is negative (excellent financing from suppliers).');
        else if (ratios.cashConversionCycle > 90) rec.push('⚠️ Cash conversion cycle is very long, working capital tied up.');

        return rec;
    }

    // ===== Display results =====
    let radarChart, barsChart;

    function displayResults() {
        const inputs = getInputs();
        const ratios = calculateRatios(inputs);
        const currency = inputs.currency;
        const company = inputs.companyName;

        lastCalculation = { inputs, ratios, currency, company };

        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('initialMessage').style.display = 'none';

        const formatMoney = (num) => `${currency} ${num.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:0})}`;

        document.getElementById('summaryCards').innerHTML = `
            <div class="result-card"><div class="label">Current Ratio</div><div class="value">${ratios.currentRatio.toFixed(2)}</div><div class="status ${evaluateRatio(ratios.currentRatio,{good:1.5,warning:1}).class}">${evaluateRatio(ratios.currentRatio,{good:1.5,warning:1}).text}</div></div>
            <div class="result-card"><div class="label">Net Profit Margin</div><div class="value">${(ratios.netMargin*100).toFixed(1)}%</div><div class="status ${evaluateRatio(ratios.netMargin,{good:0.15,warning:0.05}).class}">${evaluateRatio(ratios.netMargin,{good:0.15,warning:0.05}).text}</div></div>
            <div class="result-card"><div class="label">ROA</div><div class="value">${(ratios.roa*100).toFixed(1)}%</div><div class="status ${evaluateRatio(ratios.roa,{good:0.1,warning:0.05}).class}">${evaluateRatio(ratios.roa,{good:0.1,warning:0.05}).text}</div></div>
            <div class="result-card"><div class="label">ROE</div><div class="value">${(ratios.roe*100).toFixed(1)}%</div><div class="status ${evaluateRatio(ratios.roe,{good:0.2,warning:0.1}).class}">${evaluateRatio(ratios.roe,{good:0.2,warning:0.1}).text}</div></div>
            <div class="result-card"><div class="label">Debt to Equity</div><div class="value">${ratios.debtToEquity.toFixed(2)}</div><div class="status ${evaluateRatio(ratios.debtToEquity,{good:1,warning:2}).class}">${evaluateRatio(ratios.debtToEquity,{good:1,warning:2}).text}</div></div>
            <div class="result-card"><div class="label">Cash Conversion Cycle (Days)</div><div class="value">${ratios.cashConversionCycle.toFixed(0)}</div><div class="status ${ratios.cashConversionCycle<0?'status-good':(ratios.cashConversionCycle<60?'status-warning':'status-bad')}">${ratios.cashConversionCycle<0?'Excellent':(ratios.cashConversionCycle<60?'Acceptable':'Long')}</div></div>
            <div class="result-card"><div class="label">Total Current Assets</div><div class="value">${formatMoney(inputs.currentAssets)}</div></div>
            <div class="result-card"><div class="label">Total Assets</div><div class="value">${formatMoney(inputs.totalAssets)}</div></div>
            <div class="result-card"><div class="label">Total Liabilities</div><div class="value">${formatMoney(inputs.totalLiabilities)}</div></div>
            <div class="result-card"><div class="label">Equity</div><div class="value">${formatMoney(inputs.equity)}</div><div class="status ${inputs.equity<0?'status-bad':'status-good'}">${inputs.equity<0?'Negative':'Positive'}</div></div>
        `;

        let tableHtml = `<thead><tr><th>Category</th><th>Ratio</th><th>Value</th><th>Assessment</th></tr></thead><tbody>`;
        const addRow = (cat, name, value, ev) => { tableHtml += `<tr><td>${cat}</td><td>${name}</td><td>${value}</td><td class="${ev.class}">${ev.text}</td></tr>`; };
        addRow('Liquidity','Current Ratio', ratios.currentRatio.toFixed(2), evaluateRatio(ratios.currentRatio,{good:1.5,warning:1}));
        addRow('Liquidity','Quick Ratio', ratios.quickRatio.toFixed(2), evaluateRatio(ratios.quickRatio,{good:1,warning:0.5}));
        addRow('Liquidity','Cash Ratio', ratios.cashRatio.toFixed(2), evaluateRatio(ratios.cashRatio,{good:0.5,warning:0.2}));
        addRow('Profitability','Gross Profit Margin', (ratios.grossMargin*100).toFixed(1)+'%', evaluateRatio(ratios.grossMargin,{good:0.4,warning:0.2}));
        addRow('Profitability','Operating Profit Margin', (ratios.operatingMargin*100).toFixed(1)+'%', evaluateRatio(ratios.operatingMargin,{good:0.2,warning:0.1}));
        addRow('Profitability','Net Profit Margin', (ratios.netMargin*100).toFixed(1)+'%', evaluateRatio(ratios.netMargin,{good:0.15,warning:0.05}));
        addRow('Profitability','ROA', (ratios.roa*100).toFixed(1)+'%', evaluateRatio(ratios.roa,{good:0.1,warning:0.05}));
        addRow('Profitability','ROE', (ratios.roe*100).toFixed(1)+'%', evaluateRatio(ratios.roe,{good:0.2,warning:0.1}));
        addRow('Solvency','Debt to Equity', ratios.debtToEquity.toFixed(2), evaluateRatio(ratios.debtToEquity,{good:1,warning:2}));
        addRow('Solvency','Debt to Assets', ratios.debtToAssets.toFixed(2), evaluateRatio(ratios.debtToAssets,{good:0.5,warning:0.7}));
        addRow('Solvency','Interest Coverage', ratios.interestCoverage.toFixed(2), evaluateRatio(ratios.interestCoverage,{good:3,warning:1.5}));
        addRow('Solvency','Equity Ratio', (ratios.equityRatio*100).toFixed(1)+'%', evaluateRatio(ratios.equityRatio,{good:0.5,warning:0.3}));
        addRow('Activity','Inventory Turnover', ratios.inventoryTurnover.toFixed(2), {text:'Times', class:'status-warning'});
        addRow('Activity','Days Inventory', ratios.daysInventory.toFixed(0)+' Days', {text:'', class:'status-warning'});
        addRow('Activity','Receivables Turnover', ratios.receivablesTurnover.toFixed(2), {text:'Times', class:'status-warning'});
        addRow('Activity','Days Sales Outstanding', ratios.daysSalesOutstanding.toFixed(0)+' Days', {text:'', class:'status-warning'});
        addRow('Activity','Payables Turnover', ratios.payablesTurnover.toFixed(2), {text:'Times', class:'status-warning'});
        addRow('Activity','Days Payables', ratios.daysPayables.toFixed(0)+' Days', {text:'', class:'status-warning'});
        addRow('Activity','Cash Conversion Cycle', ratios.cashConversionCycle.toFixed(0)+' Days', {text:'', class:ratios.cashConversionCycle<0?'status-good':'status-warning'});
        tableHtml += `</tbody>`;
        document.getElementById('ratiosTable').innerHTML = `<table>${tableHtml}</table>`;

        const recs = getRecommendation(ratios);
        document.getElementById('recommendations').innerHTML = `<strong><i class="fas fa-lightbulb"></i> Recommendations & Analysis:</strong><br>${recs.map(r=>'• '+r).join('<br>')}`;

        const radarData = {
            labels: ['Liquidity','Profitability','Solvency','Activity'],
            datasets: [{
                label: 'Score (0-100)',
                data: [
                    Math.min(100, ratios.currentRatio * 50),
                    Math.min(100, ratios.netMargin * 400),
                    Math.min(100, (1 - Math.min(1, ratios.debtToAssets)) * 100),
                    Math.min(100, Math.min(1, ratios.inventoryTurnover / 10) * 100)
                ],
                backgroundColor: 'rgba(180,133,84,0.2)',
                borderColor: '#b8860b',
                borderWidth: 2
            }]
        };
        if (radarChart) radarChart.destroy();
        const ctxRadar = document.getElementById('radarChart').getContext('2d');
        radarChart = new Chart(ctxRadar, { type: 'radar', data: radarData, options: { responsive: true, maintainAspectRatio: false, scales: { r: { min: 0, max: 100, ticks: { stepSize: 20 } } } } });

        const barData = {
            labels: ['ROA', 'ROE', 'Net Profit Margin'],
            datasets: [{ label: 'Ratio (%)', data: [ratios.roa*100, ratios.roe*100, ratios.netMargin*100], backgroundColor: '#b8860b' }]
        };
        if (barsChart) barsChart.destroy();
        const ctxBars = document.getElementById('barsChart').getContext('2d');
        barsChart = new Chart(ctxBars, { type: 'bar', data: barData, options: { responsive: true, maintainAspectRatio: false } });
    }

    document.getElementById('calculateBtn').addEventListener('click', displayResults);

    // ================================================================
    // ========== Export to Professional Excel ==========
    // ================================================================
    document.getElementById('exportExcelBtn').addEventListener('click', async function() {
        if (!lastCalculation) { alert('Please run the analysis first.'); return; }
        showLoading('Creating Excel report...', 'Creating sheets and charts');
        try {
            const { inputs, ratios, currency, company } = lastCalculation;
            const companyName = company || 'Entity';
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US');

            function safeNum(val, defaultVal = 0) {
                return (typeof val === 'number' && !isNaN(val) && isFinite(val)) ? val : defaultVal;
            }
            function safeToFixed(val, digits = 2) {
                const num = safeNum(val);
                return num.toFixed(digits);
            }
            function safePct(val) {
                return (safeNum(val) * 100).toFixed(1) + '%';
            }

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'FAROUK GRUP';
            const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050';
            const AR = 'FFF5F0E8', DT = 'FF1A1A1A', PB = 'FFD4EDDA', NB = 'FFF8D7DA';
            const PT = 'FF155724', NT = 'FF721C24';

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
            mh(cv,1,4,4,`Comprehensive Financial Ratios Report\n${companyName}`,DB,GL,18);
            const inf = [
                ['📋 Entity', companyName],
                ['📅 Date', dateStr],
                ['💰 Currency', currency],
                ['📊 Net Profit', `${currency} ${safeToFixed(inputs.netProfit, 0)}`],
                ['📈 ROE', safePct(ratios.roe)]
            ];
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
            const inpSheet = workbook.addWorksheet('Financial Inputs', { views: [{ rightToLeft: false }] });
            inpSheet.getColumn(1).width=5; inpSheet.getColumn(2).width=35; inpSheet.getColumn(3).width=20; inpSheet.getColumn(4).width=20;
            mh(inpSheet,1,4,1,'📋 Financial Inputs',DB,GL,14);
            const inputRows = [
                ['Cash & Equivalents', inputs.cash], ['Inventory', inputs.inventory],
                ['Other Current Assets', inputs.otherCurrent], ['Fixed Assets', inputs.fixedAssets],
                ['Current Liabilities', inputs.currentLiabilities], ['Long-Term Liabilities', inputs.longTermLiabilities],
                ['Revenue', inputs.revenue], ['COGS', inputs.cogs],
                ['Operating Expenses', inputs.operatingExpenses], ['Interest Expense', inputs.interestExpense],
                ['Tax Rate', (safeNum(inputs.taxRate)*100).toFixed(0)+'%'],
                ['Credit Sales', inputs.creditSales], ['Accounts Receivable', inputs.receivables],
                ['Accounts Payable', inputs.payables]
            ];
            let iRow=3;
            inputRows.forEach(([l,v],idx)=>{
                inpSheet.getRow(iRow).height=24;
                const bg=idx%2===0?'FFFEFCF6':'FFFFFFFF';
                const lc=inpSheet.getCell(iRow,2), vc=inpSheet.getCell(iRow,3);
                lc.value=l; vc.value=v;
                ap(lc,cs(bg,DT,true,'right'));
                ap(vc,{...cs(bg,'0000FF',false,'center'),numFmt:typeof v==='number'?'#,##0':null});
                iRow++;
            });

            // 3. Financial Ratios
            const ratioSheet = workbook.addWorksheet('Financial Ratios', { views: [{ rightToLeft: false }] });
            ratioSheet.getColumn(1).width=5; ratioSheet.getColumn(2).width=25; ratioSheet.getColumn(3).width=20; ratioSheet.getColumn(4).width=15;
            mh(ratioSheet,1,4,1,'📊 Financial Ratios',DB,GL,14);
            const rHeader = ratioSheet.getRow(3);
            ['Category','Ratio','Value','Assessment'].forEach((h,i)=>{const c=rHeader.getCell(i+2);c.value=h;ap(c,hs(HB,GL));});
            const ratioList = [
                ['Liquidity','Current Ratio', safeToFixed(ratios.currentRatio,2), evaluateRatio(ratios.currentRatio,{good:1.5,warning:1}).text],
                ['Liquidity','Quick Ratio', safeToFixed(ratios.quickRatio,2), evaluateRatio(ratios.quickRatio,{good:1,warning:0.5}).text],
                ['Liquidity','Cash Ratio', safeToFixed(ratios.cashRatio,2), evaluateRatio(ratios.cashRatio,{good:0.5,warning:0.2}).text],
                ['Profitability','Gross Profit Margin', safePct(ratios.grossMargin), evaluateRatio(ratios.grossMargin,{good:0.4,warning:0.2}).text],
                ['Profitability','Operating Profit Margin', safePct(ratios.operatingMargin), evaluateRatio(ratios.operatingMargin,{good:0.2,warning:0.1}).text],
                ['Profitability','Net Profit Margin', safePct(ratios.netMargin), evaluateRatio(ratios.netMargin,{good:0.15,warning:0.05}).text],
                ['Profitability','ROA', safePct(ratios.roa), evaluateRatio(ratios.roa,{good:0.1,warning:0.05}).text],
                ['Profitability','ROE', safePct(ratios.roe), evaluateRatio(ratios.roe,{good:0.2,warning:0.1}).text],
                ['Solvency','Debt to Equity', safeToFixed(ratios.debtToEquity,2), evaluateRatio(ratios.debtToEquity,{good:1,warning:2}).text],
                ['Solvency','Debt to Assets', safeToFixed(ratios.debtToAssets,2), evaluateRatio(ratios.debtToAssets,{good:0.5,warning:0.7}).text],
                ['Solvency','Interest Coverage', safeToFixed(ratios.interestCoverage,2), evaluateRatio(ratios.interestCoverage,{good:3,warning:1.5}).text],
                ['Activity','Inventory Turnover', safeToFixed(ratios.inventoryTurnover,2), 'Times'],
                ['Activity','Days Inventory', safeToFixed(ratios.daysInventory,0)+' Days', ''],
                ['Activity','Receivables Turnover', safeToFixed(ratios.receivablesTurnover,2), 'Times'],
                ['Activity','Days Sales Outstanding', safeToFixed(ratios.daysSalesOutstanding,0)+' Days', ''],
                ['Activity','Payables Turnover', safeToFixed(ratios.payablesTurnover,2), 'Times'],
                ['Activity','Days Payables', safeToFixed(ratios.daysPayables,0)+' Days', ''],
                ['Activity','Cash Conversion Cycle', safeToFixed(ratios.cashConversionCycle,0)+' Days', '']
            ];
            let rRow=4;
            ratioList.forEach(r=>{
                const row=ratioSheet.getRow(rRow);
                [2,3,4,5].forEach((c,i)=>{const cell=row.getCell(c);cell.value=r[i];ap(cell,cs(AR,DT,false,'center'));});
                rRow++;
            });

            // 4. Charts
            const chartSheet = workbook.addWorksheet('Charts', { views: [{ rightToLeft: false }] });
            chartSheet.getColumn(1).width=5; chartSheet.getColumn(2).width=60;
            mh(chartSheet,1,2,1,'📈 Charts',DB,GL,14);
            const chartGrid = document.querySelector('.chart-grid');
            if (chartGrid) {
                try {
                    const origBg = chartGrid.style.backgroundColor;
                    chartGrid.style.backgroundColor = '#ffffff';
                    const canvasImg = await html2canvas(chartGrid, { scale: 2, backgroundColor: '#ffffff' });
                    chartGrid.style.backgroundColor = origBg;
                    const imgData = canvasImg.toDataURL('image/png');
                    const imageId = workbook.addImage({ base64: imgData, extension: 'png' });
                    chartSheet.addImage(imageId, { tl: { col: 1, row: 2 }, br: { col: 2, row: 30 }, editAs: 'oneCell' });
                } catch(e) {}
            }

            // 5. Recommendations
            const recSheet = workbook.addWorksheet('Recommendations', { views: [{ rightToLeft: false }] });
            recSheet.getColumn(1).width=5; recSheet.getColumn(2).width=60;
            mh(recSheet,1,2,1,'💡 Recommendations',DB,GL,14);
            const recs = getRecommendation(ratios);
            let recRow=3;
            recs.forEach(r=>{
                recSheet.getRow(recRow).height=25;
                const cell = recSheet.getCell(recRow,2);
                cell.value = '• ' + r;
                cell.font = { name: 'Arial', size: 11, color: { argb: DT } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEFCF6' } };
                cell.alignment = { horizontal: 'right', vertical: 'middle', wrapText: true, readingOrder: 'ltr' };
                recRow++;
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const fileName = `Financial_Ratios_${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) {
            console.error(err);
            alert('Excel error: ' + err.message);
        } finally {
            hideLoading();
        }
    });

    // ================================================================
    // ========== Export to Professional Word ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (!lastCalculation) { alert('Please run the analysis first.'); return; }
        showLoading('Creating Word report...', 'Gathering data and charts');
        try {
            const { inputs, ratios, currency, company } = lastCalculation;
            const companyName = company || 'Entity';
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US');

            const chartGrid = document.querySelector('.chart-grid');
            let chartImgBase64 = '';
            if (chartGrid) {
                const origBg = chartGrid.style.backgroundColor;
                chartGrid.style.backgroundColor = '#ffffff';
                const img = await html2canvas(chartGrid, { scale: 2, backgroundColor: '#ffffff' });
                chartGrid.style.backgroundColor = origBg;
                chartImgBase64 = img.toDataURL('image/png');
            }

            const cardsHtml = document.getElementById('summaryCards').innerHTML;
            const tableHtml = document.getElementById('ratiosTable').innerHTML;
            const recHtml = document.getElementById('recommendations').innerHTML;

            const fullHtml = `<!DOCTYPE html>
            <html dir="ltr">
            <head><meta charset="UTF-8"><title>Financial Ratios Report - FAROUK GRUP</title>
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
                    <h2>Comprehensive Financial Ratios Report</h2>
                    <p>Entity: ${companyName} | Date: ${dateStr}</p>
                    <p>Currency: ${currency}</p>
                </div>
                <h2 style="color:#b8860b;">📊 Summary</h2>
                <div style="display:flex;flex-wrap:wrap;gap:10px;">${cardsHtml}</div>
                <h2 style="color:#b8860b;">📋 Detailed Analysis</h2>
                ${tableHtml}
                <h2 style="color:#b8860b;">📈 Charts</h2>
                <div style="text-align:center;"><img src="${chartImgBase64}" class="chart-img" /></div>
                <h2 style="color:#b8860b;">💡 Recommendations</h2>
                <div style="background:#fefcf6;padding:15px;border-radius:10px;border-left:4px solid #b8860b;">
                    ${recHtml}
                </div>
                <div class="footer">Created by FAROUK GRUP for Consulting & Business © ${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Financial_Ratios_${companyName}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert('Word error: ' + err.message); } finally { hideLoading(); }
    });
