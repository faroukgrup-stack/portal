
    AOS.init({ duration: 800, once: true, offset: 100 });

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

    function showLoading(title, msg) {
        document.getElementById('loadingTitle').textContent = title;
        document.getElementById('loadingMsg').textContent = msg;
        document.getElementById('exportLoading').classList.add('show');
    }
    function hideLoading() { document.getElementById('exportLoading').classList.remove('show'); }

    let cashChart;
    let globalData = null;

    document.getElementById('calculateBtn').addEventListener('click', function() {
        const currency = document.getElementById('currencySelect').value;
        const companyName = document.getElementById('companyName').value || 'Beneficiary Entity';
        const openingCash = parseFloat(document.getElementById('openingCash').value) || 0;
        const minCash = parseFloat(document.getElementById('minCash').value) || 0;
        const cashSales = parseFloat(document.getElementById('cashSales').value) || 0;
        const cardSales = parseFloat(document.getElementById('cardSales').value) || 0;
        const arCollection = parseFloat(document.getElementById('arCollection').value) || 0;
        const inflowGrowth = parseFloat(document.getElementById('inflowGrowth').value) / 100 || 0;
        const otherInflows = parseFloat(document.getElementById('otherInflows').value) || 0;
        const supplierPay = parseFloat(document.getElementById('supplierPay').value) || 0;
        const weeklySalaries = parseFloat(document.getElementById('weeklySalaries').value) || 0;
        const weeklyRent = parseFloat(document.getElementById('weeklyRent').value) || 0;
        const weeklyUtilities = parseFloat(document.getElementById('weeklyUtilities').value) || 0;
        const weeklyTaxes = parseFloat(document.getElementById('weeklyTaxes').value) || 0;
        const weeklyLoan = parseFloat(document.getElementById('weeklyLoan').value) || 0;
        const otherOutflows = parseFloat(document.getElementById('otherOutflows').value) || 0;
        const outflowGrowth = parseFloat(document.getElementById('outflowGrowth').value) / 100 || 0;

        const weeks = 13;
        const rows = [];
        let balance = openingCash;
        let totalInflows = 0, totalOutflows = 0, minBalance = openingCash, deficitWeeks = 0, warningWeeks = 0;

        for (let w = 1; w <= weeks; w++) {
            const factor = Math.pow(1 + inflowGrowth, w - 1);
            const outFactor = Math.pow(1 + outflowGrowth, w - 1);
            const sales = cashSales * factor;
            const cards = cardSales * factor;
            const ar = arCollection * factor;
            const other = otherInflows * factor;
            const inflows = sales + cards + ar + other;
            const sup = supplierPay * outFactor;
            const sal = weeklySalaries * outFactor;
            const rent = weeklyRent * outFactor;
            const util = weeklyUtilities * outFactor;
            const tax = weeklyTaxes * outFactor;
            const loan = weeklyLoan * outFactor;
            const oth = otherOutflows * outFactor;
            const outflows = sup + sal + rent + util + tax + loan + oth;
            const net = inflows - outflows;
            const beginning = balance;
            const ending = beginning + net;
            let status = 'Healthy';
            let rowClass = '';
            if (ending < 0) { status = 'Cash Deficit'; rowClass = 'deficit-row'; deficitWeeks++; }
            else if (ending < minCash) { status = 'Below Minimum'; rowClass = 'warning-row'; warningWeeks++; }
            if (ending < minBalance) minBalance = ending;
            totalInflows += inflows;
            totalOutflows += outflows;
            rows.push({ week: w, beginning, inflows, outflows, net, ending, status, rowClass, sales, cards, ar, other, sup, sal, rent, util, tax, loan, oth });
            balance = ending;
        }

        globalData = {
            currency, companyName, openingCash, minCash,
            weeks, rows, totalInflows, totalOutflows,
            netChange: totalInflows - totalOutflows,
            finalBalance: balance, minBalance, deficitWeeks, warningWeeks,
            cashSales, cardSales, arCollection, otherInflows,
            supplierPay, weeklySalaries, weeklyRent, weeklyUtilities, weeklyTaxes, weeklyLoan, otherOutflows,
            inflowGrowth, outflowGrowth
        };

        document.getElementById('initialMessage').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';

        const finalStatus = balance < 0 ? 'Cash Deficit' : (balance < minCash ? 'Below Minimum' : 'Healthy');
        const finalClass = balance < 0 ? 'status-bad' : (balance < minCash ? 'status-warning' : 'status-good');

        document.getElementById('kpiCards').innerHTML = `
            <div class="result-card"><i class="fas fa-wallet"></i><h4>Opening Balance</h4><div class="value">${currency} ${openingCash.toLocaleString()}</div></div>
            <div class="result-card"><i class="fas fa-arrow-down"></i><h4>Total Inflows</h4><div class="value" style="color:#4ade80;">${currency} ${totalInflows.toFixed(0)}</div></div>
            <div class="result-card"><i class="fas fa-arrow-up"></i><h4>Total Outflows</h4><div class="value" style="color:#f87171;">${currency} ${totalOutflows.toFixed(0)}</div></div>
            <div class="result-card"><i class="fas fa-chart-line"></i><h4>Net Cash Change</h4><div class="value" style="color:${totalInflows-totalOutflows >= 0 ? '#4ade80' : '#f87171'};">${currency} ${(totalInflows-totalOutflows).toFixed(0)}</div></div>
            <div class="result-card"><i class="fas fa-flag-checkered"></i><h4>Week 13 Ending Balance</h4><div class="value">${currency} ${balance.toFixed(0)}</div><div class="status ${finalClass}">${finalStatus}</div></div>
            <div class="result-card"><i class="fas fa-arrow-down"></i><h4>Minimum Balance</h4><div class="value" style="color:${minBalance < 0 ? '#f87171' : (minBalance < minCash ? '#fbbf24' : '#4ade80')};">${currency} ${minBalance.toFixed(0)}</div></div>
            <div class="result-card"><i class="fas fa-exclamation-circle"></i><h4>Deficit Weeks</h4><div class="value" style="color:${deficitWeeks > 0 ? '#f87171' : '#4ade80'};">${deficitWeeks}</div><div class="unit">out of 13</div></div>
        `;

        let alertsHtml = '';
        if (deficitWeeks > 0) {
            alertsHtml += `<div class="alert alert-danger"><i class="fas fa-exclamation-triangle"></i> <strong>Urgent:</strong> ${deficitWeeks} week(s) with negative cash balance. Take immediate action (defer payments, accelerate collection, or obtain short-term financing).</div>`;
        }
        if (warningWeeks > 0) {
            alertsHtml += `<div class="alert alert-warning"><i class="fas fa-exclamation-circle"></i> <strong>Warning:</strong> ${warningWeeks} week(s) below minimum threshold (${currency} ${minCash.toLocaleString()}). Monitor these weeks closely.</div>`;
        }
        if (deficitWeeks === 0 && warningWeeks === 0) {
            alertsHtml += `<div class="alert alert-success"><i class="fas fa-check-circle"></i> <strong>Excellent:</strong> All 13 weeks are above the minimum threshold with no projected cash deficit.</div>`;
        }
        document.getElementById('alertsBox').innerHTML = alertsHtml;

        const ctx = document.getElementById('cashChart').getContext('2d');
        if (cashChart) cashChart.destroy();
        const labels = rows.map(r => 'Week ' + r.week);
        const endingBalances = rows.map(r => r.ending);
        const pointColors = endingBalances.map(v => v < 0 ? '#dc3545' : (v < minCash ? '#ffc107' : '#28a745'));
        const minLine = rows.map(() => minCash);
        const zeroLine = rows.map(() => 0);

        cashChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: 'Week Ending Balance', data: endingBalances, borderColor: '#b8860b', backgroundColor: 'rgba(184,134,11,0.1)', tension: 0.15, fill: true, pointBackgroundColor: pointColors, pointBorderColor: pointColors, pointRadius: 6, pointHoverRadius: 8 },
                    { label: 'Minimum Threshold', data: minLine, borderColor: '#ffc107', borderDash: [6, 6], pointRadius: 0, fill: false },
                    { label: 'Zero Line', data: zeroLine, borderColor: '#dc3545', borderDash: [3, 3], pointRadius: 0, fill: false }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: false, ticks: { color: '#aab7d4' }, grid: { color: 'rgba(180,133,84,0.15)' } },
                    x: { ticks: { color: '#aab7d4' } }
                },
                plugins: {
                    legend: { labels: { color: '#f0f4fa' } },
                    tooltip: { callbacks: { label: (context) => `${context.dataset.label}: ${currency} ${context.raw.toFixed(0)}` } }
                }
            }
        });

        let html = '<table><thead><tr>' +
            '<th>Week</th><th>Beginning Balance</th><th>Cash Sales</th><th>Card Sales</th><th>AR Collection</th><th>Total Inflows</th>' +
            '<th>Supplier Pay</th><th>Salaries</th><th>Rent</th><th>Utilities</th><th>Taxes</th><th>Loan</th><th>Total Outflows</th>' +
            '<th>Net Change</th><th>Ending Balance</th><th>Status</th>' +
            '</tr></thead><tbody>';
        rows.forEach(r => {
            html += `<tr class="${r.rowClass}">
                <td><strong>${r.week}</strong></td>
                <td>${currency} ${r.beginning.toFixed(0)}</td>
                <td>${currency} ${r.sales.toFixed(0)}</td>
                <td>${currency} ${r.cards.toFixed(0)}</td>
                <td>${currency} ${r.ar.toFixed(0)}</td>
                <td class="positive">${currency} ${r.inflows.toFixed(0)}</td>
                <td>${currency} ${r.sup.toFixed(0)}</td>
                <td>${currency} ${r.sal.toFixed(0)}</td>
                <td>${currency} ${r.rent.toFixed(0)}</td>
                <td>${currency} ${r.util.toFixed(0)}</td>
                <td>${currency} ${r.tax.toFixed(0)}</td>
                <td>${currency} ${r.loan.toFixed(0)}</td>
                <td class="negative">${currency} ${r.outflows.toFixed(0)}</td>
                <td class="${r.net >= 0 ? 'positive' : 'negative'}">${currency} ${r.net.toFixed(0)}</td>
                <td class="${r.ending >= 0 ? 'positive' : 'negative'}"><strong>${currency} ${r.ending.toFixed(0)}</strong></td>
                <td>${r.status}</td>
            </tr>`;
        });
        html += '</tbody></table>';
        document.getElementById('cashTable').innerHTML = html;
    });

    document.getElementById('exportExcelBtn').addEventListener('click', async function() {
        if (!globalData) { alert('Please run the analysis first.'); return; }
        showLoading('Generating Excel report...', 'Creating sheets and charts');
        try {
            const D = globalData;
            const currency = D.currency;
            const companyName = D.companyName;
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'FAROUK GRUP';
            const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035';
            const AR = 'FFF5F0E8', DT = 'FF1A1A1A', PB = 'FFD4EDDA', GB = 'FFFFF3CD';
            const PT = 'FF155724';

            function ap(c,s){if(s.font)c.font=s.font;if(s.fill)c.fill=s.fill;if(s.alignment)c.alignment=s.alignment;if(s.border)c.border=s.border;if(s.numFmt)c.numFmt=s.numFmt;}
            function cs(bg='FFFFFFFF',tc=DT,b=false,h='center'){return{font:{name:'Arial',bold:b,size:10,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:h,vertical:'middle',wrapText:true},border:{top:{style:'hair',color:{argb:'FFCCCCCC'}},bottom:{style:'hair',color:{argb:'FFCCCCCC'}},left:{style:'hair',color:{argb:'FFCCCCCC'}},right:{style:'hair',color:{argb:'FFCCCCCC'}}}};}
            function mh(ws,fc,tc,r,text,bg=HB,tc2=GL,fs=12){ws.mergeCells(r,fc,r,tc);const c=ws.getCell(r,fc);c.value=text;c.font={name:'Arial',bold:true,size:fs,color:{argb:tc2}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true};c.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};}

            const cv = workbook.addWorksheet('Cover Page', { views: [{ showGridLines: false }] });
            [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
            cv.getRow(2).height=80; cv.getRow(4).height=60;
            cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1);
            bc.value='FAROUK GRUP\nConsulting & Business';
            bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true};
            mh(cv,1,4,4,`13-Week Cash Flow Forecast\n${companyName}`,DB,GL,18);
            const inf=[['📋 Entity',companyName],['📅 Date',new Date().toLocaleDateString('en-US')],['💰 Currency',currency],['💵 Opening Balance',`${currency} ${D.openingCash}`],['📊 Week 13 Ending',`${currency} ${D.finalBalance.toFixed(0)}`]];
            let ir=6;
            inf.forEach(([l,v],idx)=>{
                cv.mergeCells(ir,1,ir,2); cv.mergeCells(ir,3,ir,4);
                const lc=cv.getCell(ir,1), vc=cv.getCell(ir,3); lc.value=l; vc.value=v;
                const bg=idx%2===0?AR:'FFFEFCF6';
                ap(lc,{font:{name:'Arial',bold:true,size:11,color:{argb:'00695C'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'right',vertical:'middle'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                ap(vc,{font:{name:'Arial',size:11,color:{argb:DT}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                cv.getRow(ir).height=28; ir++;
            });

            const ts = workbook.addWorksheet('Weekly Forecast', { views: [{ showGridLines: false }] });
            for (let i = 1; i <= 15; i++) ts.getColumn(i).width = 15;
            mh(ts,1,15,1,'📋 13-Week Cash Flow Forecast',DB,GL,14);
            ts.getRow(1).height=40;
            const headerArr = ['Week','Beginning','Cash Sales','Card Sales','AR Collection','Total Inflows','Supplier Pay','Salaries','Rent','Utilities','Taxes','Loan','Total Outflows','Net Change','Ending Balance'];
            ts.addRow(headerArr);
            const hRow = ts.getRow(2);
            hRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            hRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
            D.rows.forEach(r => {
                ts.addRow([r.week, r.beginning, r.sales, r.cards, r.ar, r.inflows, r.sup, r.sal, r.rent, r.util, r.tax, r.loan, r.outflows, r.net, r.ending]);
            });

            const chartsSheet = workbook.addWorksheet('Chart', { views: [{ showGridLines: false }] });
            chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
            mh(chartsSheet,1,3,1,'📈 Cash Balance Over 13 Weeks',DB,GL,14);
            chartsSheet.getRow(1).height=40;
            const canvasElem = document.getElementById('cashChart');
            if (canvasElem) {
                try {
                    const origBg = canvasElem.style.backgroundColor;
                    canvasElem.style.backgroundColor = '#ffffff';
                    const canvasImg = await html2canvas(canvasElem, { scale: 2, backgroundColor: '#ffffff' });
                    canvasElem.style.backgroundColor = origBg;
                    const imgData = canvasImg.toDataURL('image/png');
                    const imageId = workbook.addImage({ base64: imgData, extension: 'png' });
                    chartsSheet.addImage(imageId, { tl: { col: 1, row: 2 }, br: { col: 2, row: 22 }, editAs: 'oneCell' });
                } catch(err) {}
            }

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const now = new Date();
            saveAs(blob, `13WeekCashFlow_${companyName}_${now.toISOString().slice(0,10)}.xlsx`);
        } catch(err) { alert('Excel Error: ' + err.message); } finally { hideLoading(); }
    });

    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (!globalData) { alert('Please run the analysis first.'); return; }
        showLoading('Generating Word report...', 'Collecting data and charts');
        try {
            const D = globalData;
            const currency = D.currency;
            const companyName = D.companyName;
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US');

            const canvasElem = document.getElementById('cashChart');
            let chartImg = '';
            if (canvasElem) {
                const origBg = canvasElem.style.backgroundColor;
                canvasElem.style.backgroundColor = '#ffffff';
                const img = await html2canvas(canvasElem, { scale: 2, backgroundColor: '#ffffff' });
                canvasElem.style.backgroundColor = origBg;
                chartImg = img.toDataURL('image/png');
            }

            let tableRows = '';
            D.rows.forEach(r => {
                tableRows += `<tr>
                    <td>${r.week}</td>
                    <td>${currency} ${r.beginning.toFixed(0)}</td>
                    <td>${currency} ${r.inflows.toFixed(0)}</td>
                    <td>${currency} ${r.outflows.toFixed(0)}</td>
                    <td class="${r.net>=0?'positive':'negative'}">${currency} ${r.net.toFixed(0)}</td>
                    <td class="${r.ending>=0?'positive':'negative'}"><strong>${currency} ${r.ending.toFixed(0)}</strong></td>
                    <td>${r.status}</td>
                </tr>`;
            });

            const fullHtml = `<!DOCTYPE html>
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
            <head><meta charset='utf-8'><title>13-Week Cash Flow - FAROUK GRUP</title>
            <style>
                body{font-family:'Arial',sans-serif;direction:ltr;margin:2rem;background:#fff;color:#333;}
                .cover{text-align:center;border-bottom:4px solid #b8860b;margin-bottom:30px;padding-bottom:20px;}
                .cover h1{font-size:32px;color:#b8860b;margin:0;}
                .cover h2{font-size:24px;color:#b48554;margin:5px 0;}
                table{width:100%;border-collapse:collapse;margin:20px 0;} th,td{border:1px solid #b8860b;padding:6px;text-align:center;font-size:11px;}
                th{background:#fefcf6;color:#b8860b;}
                .positive{color:#155724;font-weight:bold;} .negative{color:#721c24;font-weight:bold;}
                .chart-img{max-width:100%;border:1px solid #b8860b;border-radius:10px;margin:20px 0;}
                .footer{text-align:center;margin-top:40px;color:#888;border-top:1px dashed #b8860b;padding-top:10px;}
            </style></head>
            <body>
                <div class="cover">
                    <h1>FAROUK GRUP</h1>
                    <h2>📅 13-Week Cash Flow Forecast</h2>
                    <p>Entity: ${companyName} | Date: ${dateStr}</p>
                    <p>Currency: ${currency} | Opening Balance: ${currency} ${D.openingCash}</p>
                </div>
                <h2 style="color:#b8860b;">📊 Executive Summary</h2>
                <table>
                    <tr><th>Opening Balance</th><td>${currency} ${D.openingCash.toLocaleString()}</td><th>Total Inflows</th><td>${currency} ${D.totalInflows.toFixed(0)}</td></tr>
                    <tr><th>Total Outflows</th><td>${currency} ${D.totalOutflows.toFixed(0)}</td><th>Net Change</th><td>${currency} ${(D.totalInflows-D.totalOutflows).toFixed(0)}</td></tr>
                    <tr><th>Week 13 Ending Balance</th><td>${currency} ${D.finalBalance.toFixed(0)}</td><th>Minimum Balance</th><td>${currency} ${D.minBalance.toFixed(0)}</td></tr>
                    <tr><th>Deficit Weeks</th><td>${D.deficitWeeks}</td><th>Below-Minimum Weeks</th><td>${D.warningWeeks}</td></tr>
                </table>
                <h2 style="color:#b8860b;">📈 Cash Balance Chart</h2>
                <div style="text-align:center;"><img src="${chartImg}" class="chart-img" /></div>
                <h2 style="color:#b8860b;">📋 Weekly Forecast Table</h2>
                <table><thead><tr><th>Week</th><th>Beginning</th><th>Inflows</th><th>Outflows</th><th>Net Change</th><th>Ending</th><th>Status</th></tr></thead><tbody>${tableRows}</tbody></table>
                <div class="footer">Generated by FAROUK GRUP © ${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `13WeekCashFlow_${companyName}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert('Word Error: ' + err.message); } finally { hideLoading(); }
    });
