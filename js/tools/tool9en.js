
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

    // ===== Show/hide custom rate field =====
    document.getElementById('depMethod').addEventListener('change', function() {
        document.getElementById('rateGroup').style.display = (this.value === 'custom') ? 'block' : 'none';
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

    // ===== Global variables =====
    let globalDepData = null;
    let bookValueChart = null;

    // ===== Compute function =====
    function computeDepreciation() {
        const currency = document.getElementById('currencySelect').value;
        const cost = parseFloat(document.getElementById('assetCost').value) || 0;
        const salvage = parseFloat(document.getElementById('salvageValue').value) || 0;
        const life = parseInt(document.getElementById('usefulLife').value) || 5;
        const method = document.getElementById('depMethod').value;
        const customRateInput = parseFloat(document.getElementById('customRate').value) || 20;
        const customRate = customRateInput / 100;
        const purchaseMonth = parseInt(document.getElementById('purchaseMonth').value) || 1;
        const yearFraction = (12 - (purchaseMonth - 1)) / 12;

        if (cost <= salvage) {
            alert('Asset cost must be greater than salvage value.');
            return null;
        }

        let effectiveRate = 0;
        if (method === 'straight') effectiveRate = 1 / life;
        else if (method === 'declining') effectiveRate = 1 / life;
        else if (method === 'double') effectiveRate = 2 / life;
        else if (method === 'custom') effectiveRate = customRate;

        let schedule = [];
        let totalDep = 0;
        let bookVal = cost;
        const totalDepreciable = cost - salvage;
        let maxYears = life + 1;

        for (let year = 1; year <= maxYears; year++) {
            let annualDep = 0;
            if (method === 'straight') {
                let fullYearDep = totalDepreciable / life;
                annualDep = (year === 1) ? fullYearDep * yearFraction : fullYearDep;
            } else {
                annualDep = (year === 1) ? bookVal * effectiveRate * yearFraction : bookVal * effectiveRate;
            }

            if (totalDep + annualDep > totalDepreciable) {
                annualDep = totalDepreciable - totalDep;
            }
            if (annualDep < 0) annualDep = 0;

            bookVal -= annualDep;
            totalDep += annualDep;
            schedule.push({
                year: year,
                depreciation: annualDep,
                accumulated: totalDep,
                bookValue: Math.max(bookVal, salvage)
            });

            if (totalDep >= totalDepreciable - 0.01) break;
            if (bookVal <= salvage + 0.01) break;
        }

        const avgAnnualDep = totalDep / schedule.length;

        document.getElementById('initialMessage').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';

        document.getElementById('kpiCards').innerHTML = `
            <div class="result-card"><i class="fas fa-dollar-sign"></i><h4>Total Depreciation</h4><div class="value">${currency}${totalDep.toFixed(0)}</div></div>
            <div class="result-card"><i class="fas fa-chart-line"></i><h4>Final Book Value</h4><div class="value">${currency}${(cost - totalDep).toFixed(0)}</div></div>
            <div class="result-card"><i class="fas fa-calendar"></i><h4>Actual Years</h4><div class="value">${schedule.length}</div></div>
            <div class="result-card"><i class="fas fa-chart-bar"></i><h4>Avg Annual Depreciation</h4><div class="value">${currency}${avgAnnualDep.toFixed(0)}</div></div>
            <div class="result-card"><i class="fas fa-percent"></i><h4>Annual Depreciation Rate</h4><div class="value">${(effectiveRate * 100).toFixed(1)}%</div><div class="unit">${method === 'straight' ? 'Fixed' : 'Effective'}</div></div>
        `;

        let tableHtml = '<table><thead><tr><th>Year</th><th>Annual Depreciation</th><th>Accumulated Depreciation</th><th>Book Value</th></tr></thead><tbody>';
        schedule.forEach(r => {
            tableHtml += `<tr><td>${r.year}</td><td>${currency}${r.depreciation.toFixed(0)}</td><td>${currency}${r.accumulated.toFixed(0)}</td><td>${currency}${r.bookValue.toFixed(0)}</td></tr>`;
        });
        tableHtml += '</tbody></table>';
        document.getElementById('depTable').innerHTML = tableHtml;

        const ctx = document.getElementById('bookValueChart').getContext('2d');
        if (bookValueChart) bookValueChart.destroy();
        const labels = schedule.map(r => `Year ${r.year}`);
        const bookValues = schedule.map(r => r.bookValue);
        bookValueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Book Value',
                    data: bookValues,
                    borderColor: '#b8860b',
                    backgroundColor: 'rgba(184,134,11,0.1)',
                    tension: 0.1,
                    fill: true
                }]
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

        const methodNames = {
            straight: 'Straight Line',
            declining: 'Declining Balance (1/Life)',
            double: 'Double Declining (2/Life)',
            custom: `Custom Rate (${customRateInput}%)`
        };
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const companyName = document.getElementById('companyName').value || 'Beneficiary Entity';

        globalDepData = {
            inputs: {
                cost, salvage, life, method, customRateInput,
                purchaseMonth, purchaseMonthName: monthNames[purchaseMonth-1],
                yearFraction, currency, companyName, effectiveRate
            },
            outputs: {
                totalDepreciation: totalDep,
                finalBookValue: cost - totalDep,
                actualYears: schedule.length,
                avgAnnualDep,
                effectiveRatePercent: effectiveRate * 100,
                depreciationSchedule: schedule,
                methodName: methodNames[method]
            }
        };
        return globalDepData;
    }

    document.getElementById('calculateBtn').addEventListener('click', computeDepreciation);

    // ================================================================
    // ========== Export to Excel ==========
    // ================================================================
    document.getElementById('exportExcelBtn').addEventListener('click', async function() {
        if (!globalDepData) { alert('Please run the calculation first.'); return; }
        showLoading('Generating Excel report...', 'Creating sheets and charts');
        try {
            const D = globalDepData;
            const I = D.inputs;
            const O = D.outputs;
            const currency = I.currency;
            const companyName = I.companyName;

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'FAROUK GRUP';
            const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050';
            const AR = 'FFF5F0E8', DT = 'FF1A1A1A', PB = 'FFD4EDDA', NB = 'FFF8D7DA', GB = 'FFFFF3CD';
            const PT = 'FF155724', NT = 'FF721C24';

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
            mh(cv,1,4,4,`Depreciation Analysis Report\n${companyName}`,DB,GL,18);
            const inf=[['📋 Entity',companyName],['📅 Date',new Date().toLocaleDateString('en-US')],['💰 Currency',currency],['📊 Method',O.methodName],['🏷️ Useful Life',`${I.life} years`],['📉 Total Depreciation',`${currency} ${O.totalDepreciation.toFixed(0)}`]];
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
            mh(inputsSheet,2,4,2,'Asset Basic Data',SB,'FFFFFFFF',11);
            inputsSheet.getRow(2).height=28;
            const inputFields = [
                ['Asset Cost', I.cost, `${currency} ${I.cost.toFixed(0)}`],
                ['Salvage Value', I.salvage, `${currency} ${I.salvage.toFixed(0)}`],
                ['Useful Life (years)', I.life, ''],
                ['Depreciation Method', O.methodName, ''],
                ['Purchase Month', I.purchaseMonthName, ''],
                ['Annual Depreciation Rate', `${O.effectiveRatePercent.toFixed(1)}%`, ''],
                ['Currency', I.currency, ''],
                ['Entity Name', I.companyName, '']
            ];
            let iRow=3;
            inputFields.forEach(([label,val,note],idx)=>{
                inputsSheet.getRow(iRow).height=24;
                const bg=idx%2===0?'FFFEFCF6':'FFFFFFFF';
                const lc=inputsSheet.getCell(iRow,2), vc=inputsSheet.getCell(iRow,3), nc=inputsSheet.getCell(iRow,4);
                lc.value=label; vc.value=val; nc.value=note;
                ap(lc,cs(bg,DT,true,'left'));
                ap(vc,{...cs(bg,'0000FF',false,'center'),numFmt:typeof val==='number'?'#,##0':null});
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
                { label: 'Total Depreciation', value: `${currency} ${O.totalDepreciation.toFixed(0)}`, good: true },
                { label: 'Final Book Value', value: `${currency} ${O.finalBookValue.toFixed(0)}`, good: true },
                { label: 'Actual Years', value: O.actualYears, good: true },
                { label: 'Avg Annual Depreciation', value: `${currency} ${O.avgAnnualDep.toFixed(0)}`, good: true },
                { label: 'Annual Depreciation Rate', value: `${O.effectiveRatePercent.toFixed(1)}%`, good: true }
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

            // 4. Depreciation Schedule
            const tableSheet = workbook.addWorksheet('Depreciation Schedule', { views: [{ showGridLines: false }] });
            tableSheet.getColumn(1).width=5; tableSheet.getColumn(2).width=15; tableSheet.getColumn(3).width=25; tableSheet.getColumn(4).width=25; tableSheet.getColumn(5).width=25; tableSheet.getColumn(6).width=5;
            mh(tableSheet,1,6,1,'📋 Annual Depreciation Schedule',DB,GL,14);
            tableSheet.getRow(1).height=40;
            tableSheet.addRow(['Year', 'Annual Depreciation', 'Accumulated', 'Book Value']);
            tableSheet.getRow(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            tableSheet.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
            O.depreciationSchedule.forEach(r => {
                tableSheet.addRow([r.year, `${currency} ${r.depreciation.toFixed(0)}`, `${currency} ${r.accumulated.toFixed(0)}`, `${currency} ${r.bookValue.toFixed(0)}`]);
            });

            // 5. Chart
            const chartsSheet = workbook.addWorksheet('Chart', { views: [{ showGridLines: false }] });
            chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
            mh(chartsSheet,1,3,1,'📈 Book Value Chart',DB,GL,14);
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

            // 6. Interpretation
            const evalSheet = workbook.addWorksheet('Interpretation & Recommendations', { views: [{ showGridLines: false }] });
            evalSheet.getColumn(1).width=5; evalSheet.getColumn(2).width=50; evalSheet.getColumn(3).width=5;
            mh(evalSheet,1,3,1,'📝 Interpretation & Recommendations',DB,GL,14);
            evalSheet.getRow(1).height=45;
            const sections = [
                { title: '1. Asset Summary', content: `Entity: ${companyName}\nAsset Cost: ${currency} ${I.cost}\nSalvage Value: ${currency} ${I.salvage}\nUseful Life: ${I.life} years\nDepreciation Method: ${O.methodName}` },
                { title: '2. Depreciation Results', content: `Total Depreciation: ${currency} ${O.totalDepreciation.toFixed(0)}\nFinal Book Value: ${currency} ${O.finalBookValue.toFixed(0)}\nAvg Annual Depreciation: ${currency} ${O.avgAnnualDep.toFixed(0)}\nAnnual Depreciation Rate: ${O.effectiveRatePercent.toFixed(1)}%` },
                { title: '3. Recommendations', content: '• Review the depreciation schedule periodically to ensure alignment with accounting standards.\n• Use this schedule for tax planning and budgeting purposes.\n• Update salvage value and useful life when significant changes occur.' },
                { title: '4. Disclaimer', content: 'This analysis is based on estimated assumptions. Actual results may vary. Professional accounting advice is recommended before making decisions.' }
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
            const fileName = `Depreciation_${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert('Excel Error: ' + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== Export to Word ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (!globalDepData) { alert('Please run the calculation first.'); return; }
        showLoading('Generating Word report...', 'Collecting data and charts');
        try {
            const D = globalDepData;
            const I = D.inputs;
            const O = D.outputs;
            const currency = I.currency;
            const companyName = I.companyName;
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US');

            // Chart image
            const chartContainer = document.querySelector('.chart-container');
            let chartImg = '';
            if (chartContainer) {
                const origBg = chartContainer.style.backgroundColor;
                chartContainer.style.backgroundColor = '#ffffff';
                const img = await html2canvas(chartContainer, { scale: 2, backgroundColor: '#ffffff' });
                chartContainer.style.backgroundColor = origBg;
                chartImg = img.toDataURL('image/png');
            }

            // Depreciation schedule table
            let tableRows = '';
            O.depreciationSchedule.forEach(r => {
                tableRows += `<tr><td>${r.year}</td><td>${currency} ${r.depreciation.toFixed(0)}</td><td>${currency} ${r.accumulated.toFixed(0)}</td><td>${currency} ${r.bookValue.toFixed(0)}</td></tr>`;
            });

            // KPI cards
            let kpiRows = '';
            const kpiData = [
                { label: 'Total Depreciation', value: `${currency} ${O.totalDepreciation.toFixed(0)}` },
                { label: 'Final Book Value', value: `${currency} ${O.finalBookValue.toFixed(0)}` },
                { label: 'Actual Years', value: O.actualYears },
                { label: 'Avg Annual Depreciation', value: `${currency} ${O.avgAnnualDep.toFixed(0)}` },
                { label: 'Annual Depreciation Rate', value: `${O.effectiveRatePercent.toFixed(1)}%` }
            ];
            kpiData.forEach(k => {
                kpiRows += `<tr style="border:1px solid #b8860b;"><td style="padding:12px;background:#d4edda;text-align:left;">${k.label}</td><td style="padding:12px;background:#d4edda;text-align:center;"><strong style="font-size:1.2rem;color:#155724">${k.value}</strong></td></tr>`;
            });

            const fullHtml = `<!DOCTYPE html>
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
            <head><meta charset='utf-8'><title>Depreciation Report - FAROUK GRUP</title>
            <style>
                body{font-family:'Arial',sans-serif;direction:ltr;margin:2rem;background:#fff;color:#333;}
                .cover{text-align:center;border-bottom:4px solid #b8860b;margin-bottom:30px;padding-bottom:20px;}
                .cover h1{font-size:32px;color:#b8860b;margin:0;}
                .cover h2{font-size:24px;color:#b48554;margin:5px 0;}
                table{width:100%;border-collapse:collapse;margin:20px 0;} th,td{border:1px solid #b8860b;padding:8px;text-align:center;}
                th{background:#fefcf6;color:#b8860b;font-weight:bold;}
                .chart-img{max-width:100%;border:1px solid #b8860b;border-radius:10px;margin:20px 0;}
                .footer{text-align:center;margin-top:40px;padding-top:10px;border-top:1px dashed #b8860b;color:#888;font-size:10pt;}
            </style></head>
            <body>
                <div class="cover">
                    <h1>FAROUK GRUP</h1>
                    <h2>Advanced Depreciation Analysis Report</h2>
                    <p>Entity: ${companyName} | Date: ${dateStr}</p>
                    <p>Depreciation Method: ${O.methodName} | Useful Life: ${I.life} years</p>
                </div>
                <h2 style="color:#b8860b;">Input Overview</h2>
                <table><tbody>
                    <tr><th>Asset Cost</th><td>${currency} ${I.cost}</td><th>Salvage Value</th><td>${currency} ${I.salvage}</td></tr>
                    <tr><th>Useful Life</th><td>${I.life} years</td><th>Purchase Month</th><td>${I.purchaseMonthName}</td></tr>
                    <tr><th>Depreciation Rate</th><td>${O.effectiveRatePercent.toFixed(1)}%</td><th></th><td></td></tr>
                </tbody></table>
                <h2 style="color:#b8860b;">📊 Key Performance Indicators</h2>
                <table>${kpiRows}</table>
                <h2 style="color:#b8860b;">📈 Book Value Chart</h2>
                <div style="text-align:center;"><img src="${chartImg}" class="chart-img" /></div>
                <h2 style="color:#b8860b;">📋 Annual Depreciation Schedule</h2>
                <table><thead><tr><th>Year</th><th>Annual Depreciation</th><th>Accumulated Depreciation</th><th>Book Value</th></tr></thead><tbody>${tableRows}</tbody></table>
                <h2 style="color:#b8860b;">💡 Recommendations</h2>
                <div style="background:#fefcf6;padding:15px;border-radius:10px;border-left:4px solid #b8860b;">
                    <p>• Review the depreciation schedule periodically to ensure alignment with accounting standards.</p>
                    <p>• Use this schedule for tax planning and budgeting purposes.</p>
                    <p>• Update salvage value and useful life when significant changes occur.</p>
                </div>
                <div class="footer">Generated by FAROUK GRUP © ${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Depreciation_${companyName}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert('Word Error: ' + err.message); } finally { hideLoading(); }
    });
