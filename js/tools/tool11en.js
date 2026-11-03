
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

    // ===== Loading functions =====
    function showLoading(title, msg) {
        document.getElementById('loadingTitle').textContent = title;
        document.getElementById('loadingMsg').textContent = msg;
        document.getElementById('exportLoading').classList.add('show');
    }
    function hideLoading() {
        document.getElementById('exportLoading').classList.remove('show');
    }

    // ===== Main calculation =====
    let roiChart;
    let globalRoiData = null;

    document.getElementById('calculateBtn').addEventListener('click', function() {
        const currency = document.getElementById('currencySelect').value;
        const companyName = document.getElementById('companyName').value || 'Beneficiary Entity';
        const cost = parseFloat(document.getElementById('investmentCost').value) || 0;
        const profitInput = parseFloat(document.getElementById('annualProfit').value) || 0;
        const period = parseFloat(document.getElementById('period').value);
        const forecastYears = parseInt(document.getElementById('forecastYears').value) || 5;

        if (cost <= 0) {
            alert('Please enter a valid investment cost.');
            return;
        }

        const annualProfit = profitInput / period;
        const roi = (annualProfit / cost) * 100;
        const payback = cost / annualProfit;

        let statusText = '', statusClass = '';
        if (roi > 0) { statusText = 'Profitable'; statusClass = 'status-good'; }
        else if (roi < 0) { statusText = 'Losing'; statusClass = 'status-bad'; }
        else { statusText = 'Neutral'; statusClass = 'status-warning'; }

        globalRoiData = {
            currency, companyName,
            cost, annualProfit, period, forecastYears,
            roi, payback, statusText, statusClass,
            interpretation: roi > 20 ? 'Excellent investment with very high return.' :
                          (roi > 10 ? 'Good investment with reasonable return.' :
                          (roi > 0 ? 'Acceptable investment but return is relatively low.' :
                          'Loss-making investment, recommended to re-evaluate.'))
        };

        document.getElementById('initialMessage').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';

        document.getElementById('kpiCards').innerHTML = `
            <div class="result-card"><i class="fas fa-percent"></i><h4>Return on Investment (ROI)</h4><div class="value">${roi.toFixed(2)}%</div><div class="status ${statusClass}">${statusText}</div></div>
            <div class="result-card"><i class="fas fa-clock"></i><h4>Payback Period</h4><div class="value">${payback.toFixed(1)}</div><div class="unit">Years</div></div>
            <div class="result-card"><i class="fas fa-dollar-sign"></i><h4>Annual Net Profit</h4><div class="value">${currency} ${annualProfit.toFixed(0)}</div></div>
            <div class="result-card"><i class="fas fa-coins"></i><h4>Investment Cost</h4><div class="value">${currency} ${cost.toFixed(0)}</div></div>
        `;

        // Chart
        const ctx = document.getElementById('roiChart').getContext('2d');
        if (roiChart) roiChart.destroy();

        const years = [];
        const cumulativeCash = [];
        let cum = -cost;
        for (let i = 0; i <= forecastYears; i++) {
            if (i === 0) {
                years.push('Investment');
                cumulativeCash.push(-cost);
            } else {
                cum += annualProfit;
                years.push(`Year ${i}`);
                cumulativeCash.push(cum);
            }
        }
        const pointColors = cumulativeCash.map(val => val < 0 ? '#dc3545' : '#28a745');

        roiChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Cumulative Cash Flow',
                    data: cumulativeCash,
                    borderColor: '#b8860b',
                    backgroundColor: 'rgba(184,134,11,0.1)',
                    tension: 0.1,
                    fill: true,
                    pointBackgroundColor: pointColors,
                    pointBorderColor: pointColors,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        title: { display: true, text: currency, color: '#aab7d4' },
                        ticks: { color: '#aab7d4' },
                        grid: { color: 'rgba(180,133,84,0.2)' }
                    },
                    x: { ticks: { color: '#aab7d4' } }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.dataset.label}: ${currency} ${context.raw.toFixed(0)}`
                        }
                    },
                    legend: { labels: { color: '#f0f4fa' } }
                }
            }
        });
    });

    // ================================================================
    // ========== Export to Excel ==========
    // ================================================================
    document.getElementById('exportExcelBtn').addEventListener('click', async function() {
        if (!globalRoiData) { alert('Please run the analysis first.'); return; }
        showLoading('Generating Excel report...', 'Creating sheets and charts');
        try {
            const D = globalRoiData;
            const currency = D.currency;
            const companyName = D.companyName;

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'FAROUK GRUP';
            const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050';
            const AR = 'FFF5F0E8', DT = 'FF1A1A1A', PB = 'FFD4EDDA', NB = 'FFF8D7DA', GB = 'FFFFF3CD';
            const PT = 'FF155724', NT = 'FF721C24';
            const nc = '#,##0;(#,##0);"-"';

            function hs(bg=HB, tc=GL){return{font:{name:'Arial',bold:true,size:11,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',wrapText:true},border:{top:{style:'thin',color:{argb:G}},bottom:{style:'thin',color:{argb:G}},left:{style:'thin',color:{argb:G}},right:{style:'thin',color:{argb:G}}}};}
            function cs(bg='FFFFFFFF',tc=DT,b=false,h='center'){return{font:{name:'Arial',bold:b,size:10,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:h,vertical:'middle',wrapText:true},border:{top:{style:'hair',color:{argb:'FFCCCCCC'}},bottom:{style:'hair',color:{argb:'FFCCCCCC'}},left:{style:'hair',color:{argb:'FFCCCCCC'}},right:{style:'hair',color:{argb:'FFCCCCCC'}}}};}
            function ap(c,s){if(s.font)c.font=s.font;if(s.fill)c.fill=s.fill;if(s.alignment)c.alignment=s.alignment;if(s.border)c.border=s.border;if(s.numFmt)c.numFmt=s.numFmt;}
            function mh(ws,fc,tc,r,text,bg=HB,tc2=GL,fs=12){ws.mergeCells(r,fc,r,tc);const c=ws.getCell(r,fc);c.value=text;c.font={name:'Arial',bold:true,size:fs,color:{argb:tc2}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true};c.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};}

            // 1. Cover
            const cv = workbook.addWorksheet('Cover Page', { views: [{ showGridLines: false }] });
            [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
            cv.getRow(2).height=80; cv.getRow(4).height=60;
            cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1);
            bc.value='FAROUK GRUP\nConsulting & Business';
            bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true};
            mh(cv,1,4,4,`ROI Analysis Report\n${companyName}`,DB,GL,18);
            const inf=[['📋 Entity',companyName],['📅 Date',new Date().toLocaleDateString('en-US')],['💰 Currency',currency],['📊 ROI',`${D.roi.toFixed(2)}%`],['⏱️ Payback',`${D.payback.toFixed(1)} years`]];
            let ir=6;
            inf.forEach(([l,v],idx)=>{
                cv.mergeCells(ir,1,ir,2); cv.mergeCells(ir,3,ir,4);
                const lc=cv.getCell(ir,1), vc=cv.getCell(ir,3); lc.value=l; vc.value=v;
                const bg=idx%2===0?AR:'FFFEFCF6';
                ap(lc,{font:{name:'Arial',bold:true,size:11,color:{argb:'00695C'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'right',vertical:'middle'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                ap(vc,{font:{name:'Arial',size:11,color:{argb:DT}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                cv.getRow(ir).height=28; ir++;
            });

            // 2. Inputs
            const inputsSheet = workbook.addWorksheet('Inputs & Assumptions', { views: [{ showGridLines: false }] });
            inputsSheet.getColumn(1).width=5; inputsSheet.getColumn(2).width=38; inputsSheet.getColumn(3).width=22; inputsSheet.getColumn(4).width=22; inputsSheet.getColumn(5).width=5;
            mh(inputsSheet,1,5,1,'📋 Inputs & Assumptions',DB,GL,14);
            inputsSheet.getRow(1).height=40;
            mh(inputsSheet,2,4,2,'Investment Basic Data',SB,'FFFFFFFF',11);
            inputsSheet.getRow(2).height=28;
            const inputFields = [
                ['Investment Cost', D.cost, `${currency} ${D.cost.toFixed(0)}`],
                ['Annual Net Profit', D.annualProfit, `${currency} ${D.annualProfit.toFixed(0)}`],
                ['Profit Period', D.period === 1 ? 'Yearly' : (D.period === 0.5 ? 'Half-Yearly' : (D.period === 0.25 ? 'Quarterly' : 'Monthly')), ''],
                ['Forecast Years', D.forecastYears, ''],
                ['ROI', D.roi, `${D.roi.toFixed(2)}%`],
                ['Payback Period', D.payback, `${D.payback.toFixed(1)} years`],
                ['Currency', currency, ''],
                ['Entity Name', companyName, '']
            ];
            let iRow=3;
            inputFields.forEach(([label,val,note],idx)=>{
                inputsSheet.getRow(iRow).height=24;
                const bg=idx%2===0?'FFFEFCF6':'FFFFFFFF';
                const lc=inputsSheet.getCell(iRow,2), vc=inputsSheet.getCell(iRow,3), nc=inputsSheet.getCell(iRow,4);
                lc.value=label; vc.value=val; nc.value=note;
                ap(lc,cs(bg,DT,true,'left'));
                ap(vc,{...cs(bg,'0000FF',false,'center'),numFmt:typeof val==='number'?nc:null});
                ap(nc,cs(bg,'00695C',false,'center'));
                iRow++;
            });

            // 3. KPIs
            const kpiSheet = workbook.addWorksheet('Key Performance Indicators', { views: [{ showGridLines: false }] });
            [5,32,22,22,22,5].forEach((w,i)=>kpiSheet.getColumn(i+1).width=w);
            mh(kpiSheet,1,6,1,'📊 KPI Dashboard',DB,GL,15);
            kpiSheet.getRow(1).height=45;
            mh(kpiSheet,2,5,2,`${companyName} | ${new Date().toLocaleDateString('en-US')}`,HB,'FFFFFFFF',10);
            kpiSheet.getRow(2).height=26;
            const kpis = [
                { label: 'ROI', value: `${D.roi.toFixed(2)}%`, good: D.roi>0 },
                { label: 'Payback Period', value: `${D.payback.toFixed(1)} years`, good: D.payback<5 },
                { label: 'Annual Net Profit', value: `${currency} ${D.annualProfit.toFixed(0)}`, good: D.annualProfit>0 },
                { label: 'Investment Cost', value: `${currency} ${D.cost.toFixed(0)}`, good: true }
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
                lc2.font={name:'Arial',bold:true,size:11,color:{argb:DT}}; lc2.alignment={horizontal:'left',vertical:'middle'};
                vc3.font={name:'Arial',bold:true,size:13,color:{argb:tc}}; vc3.alignment={horizontal:'center',vertical:'middle'};
                kRow++;
            });
            kRow++;
            kpiSheet.mergeCells(kRow,2,kRow,5);
            const kFinal=kpiSheet.getCell(kRow,2);
            kFinal.value=D.roi>0 ? '✅ Profitable investment — recommended to proceed' : '⚠️ Loss-making investment — needs review';
            kFinal.font={name:'Arial',bold:true,size:13,color:{argb:D.roi>0?PT:'856404'}};
            kFinal.fill={type:'pattern',pattern:'solid',fgColor:{argb:D.roi>0?PB:GB}};
            kFinal.alignment={horizontal:'center',vertical:'middle'};
            kFinal.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};
            kpiSheet.getRow(kRow).height=40;

            // 4. Chart
            const chartsSheet = workbook.addWorksheet('Chart', { views: [{ showGridLines: false }] });
            chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
            mh(chartsSheet,1,3,1,'📈 Cumulative Cash Flow',DB,GL,14);
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

            // 5. Interpretation
            const evalSheet = workbook.addWorksheet('Interpretation & Recommendations', { views: [{ showGridLines: false }] });
            evalSheet.getColumn(1).width=5; evalSheet.getColumn(2).width=50; evalSheet.getColumn(3).width=5;
            mh(evalSheet,1,3,1,'📝 Interpretation & Recommendations',DB,GL,14);
            evalSheet.getRow(1).height=45;
            const sections = [
                { title: '1. Investment Summary', content: `Entity: ${companyName}\nInvestment Cost: ${currency} ${D.cost.toFixed(0)}\nAnnual Net Profit: ${currency} ${D.annualProfit.toFixed(0)}\nROI: ${D.roi.toFixed(2)}%\nPayback Period: ${D.payback.toFixed(1)} years` },
                { title: '2. Interpretation', content: D.interpretation },
                { title: '3. Recommendations', content: D.roi>15 ? '• Excellent investment, recommended to proceed.\n• Consider expanding the investment scope.' : (D.roi>5 ? '• Good investment but needs monitoring.\n• Monitor costs to improve return.' : '• Weak investment, recommended to re-evaluate or look for alternatives.') },
                { title: '4. Disclaimer', content: 'This analysis is based on estimated assumptions. Actual results may vary. Professional financial advice is recommended before making decisions.' }
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
                tc3.alignment={horizontal:'left',vertical:'middle'};
                tc3.border={bottom:{style:'medium',color:{argb:G}}};
                itRow++;
                evalSheet.getRow(itRow).height=Math.max(60, sec.content.split('\n').length*18);
                evalSheet.mergeCells(itRow,2,itRow,2);
                const cc=evalSheet.getCell(itRow,2);
                cc.value=sec.content;
                cc.font={name:'Arial',size:10,color:{argb:DT}};
                cc.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFEFCF6'}};
                cc.alignment={horizontal:'left',vertical:'top',wrapText:true};
                cc.border={top:{style:'hair'},bottom:{style:'hair',color:{argb:G}},left:{style:'hair'},right:{style:'hair'}};
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const now = new Date();
            const fileName = `ROI_${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert('Excel Error: ' + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== Export to Word ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (!globalRoiData) { alert('Please run the analysis first.'); return; }
        showLoading('Generating Word report...', 'Collecting data and charts');
        try {
            const D = globalRoiData;
            const currency = D.currency;
            const companyName = D.companyName;
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US');

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
            <head><meta charset='utf-8'><title>ROI Report - FAROUK GRUP</title>
            <style>
                body{font-family:'Arial',sans-serif;direction:ltr;margin:2rem;background:#fff;color:#333;}
                .cover{text-align:center;border-bottom:4px solid #b8860b;margin-bottom:30px;padding-bottom:20px;}
                .cover h1{font-size:32px;color:#b8860b;margin:0;}
                .cover h2{font-size:24px;color:#b48554;margin:5px 0;}
                table{width:100%;border-collapse:collapse;margin:20px 0;} th,td{border:1px solid #b8860b;padding:8px;text-align:center;}
                th{background:#fefcf6;color:#b8860b;}
                .chart-img{max-width:100%;border:1px solid #b8860b;border-radius:10px;margin:20px 0;}
                .footer{text-align:center;margin-top:40px;color:#888;border-top:1px dashed #b8860b;padding-top:10px;}
                .highlight{font-size:2rem;font-weight:bold;}
            </style></head>
            <body>
                <div class="cover">
                    <h1>FAROUK GRUP</h1>
                    <h2>ROI Analysis Report</h2>
                    <p>Entity: ${companyName} | Date: ${dateStr}</p>
                    <p>Currency: ${currency} | ROI: ${D.roi.toFixed(2)}%</p>
                </div>
                <h2 style="color:#b8860b;">Input Overview</h2>
                <table><tbody>
                    <tr><th>Investment Cost</th><td>${currency} ${D.cost.toFixed(0)}</td><th>Annual Net Profit</th><td>${currency} ${D.annualProfit.toFixed(0)}</td></tr>
                    <tr><th>ROI</th><td>${D.roi.toFixed(2)}%</td><th>Payback Period</th><td>${D.payback.toFixed(1)} years</td></tr>
                </tbody></table>
                <h2 style="color:#b8860b;">📊 Key Performance Indicators</h2>
                <div style="margin:20px 0;padding:20px;background:${D.roi>0?'#d4edda':'#f8d7da'};border-radius:10px;text-align:center;">
                    <span class="highlight" style="color:${D.roi>0?'#155724':'#721c24'};">${D.roi>0?'✅ Profitable Investment':'⚠️ Loss-making Investment'}</span>
                </div>
                <h2 style="color:#b8860b;">📈 Cumulative Cash Flow Chart</h2>
                <div style="text-align:center;"><img src="${chartImgBase64}" class="chart-img" /></div>
                <h2 style="color:#b8860b;">💡 Interpretation</h2>
                <div style="background:#fefcf6;padding:15px;border-radius:10px;border-left:4px solid #b8860b;">
                    <p>${D.interpretation}</p>
                </div>
                <div class="footer">Generated by FAROUK GRUP © ${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `ROI_${companyName}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert('Word Error: ' + err.message); } finally { hideLoading(); }
    });
