
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

    // ===== دوال الحساب =====
    let lastCalculation = null;

    function getInputs() {
        return {
            cash: parseFloat(document.getElementById('cash').value) || 0,
            inventory: parseFloat(document.getElementById('inventory').value) || 0,
            otherCurrent: parseFloat(document.getElementById('otherCurrentAssets').value) || 0,
            fixedAssets: parseFloat(document.getElementById('fixedAssets').value) || 0,
            currentLiabilities: parseFloat(document.getElementById('currentLiabilities').value) || 0,
            longTermLiabilities: parseFloat(document.getElementById('longTermLiabilities').value) || 0,
            revenue: parseFloat(document.getElementById('revenue').value) || 0,
            cogs: parseFloat(document.getElementById('cogs').value) || 0,
            operatingExpenses: parseFloat(document.getElementById('operatingExpenses').value) || 0,
            interestExpense: parseFloat(document.getElementById('interestExpense').value) || 0,
            taxRate: parseFloat(document.getElementById('taxRate').value) / 100 || 0,
            creditSales: parseFloat(document.getElementById('creditSales').value) || 0,
            receivables: parseFloat(document.getElementById('receivables').value) || 0,
            payables: parseFloat(document.getElementById('payables').value) || 0,
            currency: document.getElementById('currencySelect').value,
            companyName: document.getElementById('companyName').value || T('s2')
        };
    }


    // ===== عرض النتائج =====
    let radarChart, barsChart;

    async function displayResults() {
        let R;
        try { R = await FG.calc('tool18', 'main', getInputs()); } catch (e) { FG.calcError(e); return; }
        const inputs = R.inputs;
        const ratios = R.ratios;
        const currency = inputs.currency;
        const company = inputs.companyName;

        lastCalculation = { inputs, ratios, currency, company, EV: R.EV, recs: R.recs };

        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('initialMessage').style.display = 'none';

        const formatMoney = (num) => `${currency} ${num.toLocaleString(undefined, {minimumFractionDigits:0, maximumFractionDigits:0})}`;

        document.getElementById('summaryCards').innerHTML = `${T('s20')}${ratios.currentRatio.toFixed(2)}</div><div class="status ${lastCalculation.EV.currentRatio.class}">${lastCalculation.EV.currentRatio.text}${T('s21')}${(ratios.netMargin*100).toFixed(1)}%</div><div class="status ${lastCalculation.EV.netMargin.class}">${lastCalculation.EV.netMargin.text}</div></div>
            <div class="result-card"><div class="label">ROA</div><div class="value">${(ratios.roa*100).toFixed(1)}%</div><div class="status ${lastCalculation.EV.roa.class}">${lastCalculation.EV.roa.text}</div></div>
            <div class="result-card"><div class="label">ROE</div><div class="value">${(ratios.roe*100).toFixed(1)}%</div><div class="status ${lastCalculation.EV.roe.class}">${lastCalculation.EV.roe.text}${T('s22')}${ratios.debtToEquity.toFixed(2)}</div><div class="status ${lastCalculation.EV.debtToEquity.class}">${lastCalculation.EV.debtToEquity.text}${T('s23')}${ratios.cashConversionCycle.toFixed(0)}</div><div class="status ${lastCalculation.EV.ccc.class}">${lastCalculation.EV.ccc.text}${T('s24')}${formatMoney(inputs.currentAssets)}${T('s25')}${formatMoney(inputs.totalAssets)}${T('s26')}${formatMoney(inputs.totalLiabilities)}${T('s27')}${formatMoney(inputs.equity)}</div><div class="status ${inputs.equity<0?'status-bad':'status-good'}">${inputs.equity<0?T('s18'):T('s19')}</div></div>
        `;

        let tableHtml = `${T('s28')}`;
        const addRow = (cat, name, value, ev) => { tableHtml += `<tr><td>${cat}</td><td>${name}</td><td>${value}</td><td class="${ev.class}">${ev.text}</td></tr>`; };
        addRow(T('s29'),T('s30'), ratios.currentRatio.toFixed(2), lastCalculation.EV.currentRatio);
        addRow(T('s29'),T('s31'), ratios.quickRatio.toFixed(2), lastCalculation.EV.quickRatio);
        addRow(T('s29'),T('s32'), ratios.cashRatio.toFixed(2), lastCalculation.EV.cashRatio);
        addRow(T('s33'),T('s34'), (ratios.grossMargin*100).toFixed(1)+'%', lastCalculation.EV.grossMargin);
        addRow(T('s33'),T('s35'), (ratios.operatingMargin*100).toFixed(1)+'%', lastCalculation.EV.operatingMargin);
        addRow(T('s33'),T('s36'), (ratios.netMargin*100).toFixed(1)+'%', lastCalculation.EV.netMargin);
        addRow(T('s33'),'ROA', (ratios.roa*100).toFixed(1)+'%', lastCalculation.EV.roa);
        addRow(T('s33'),'ROE', (ratios.roe*100).toFixed(1)+'%', lastCalculation.EV.roe);
        addRow(T('s37'),T('s38'), ratios.debtToEquity.toFixed(2), lastCalculation.EV.debtToEquity);
        addRow(T('s37'),T('s39'), ratios.debtToAssets.toFixed(2), lastCalculation.EV.debtToAssets);
        addRow(T('s37'),T('s40'), ratios.interestCoverage.toFixed(2), lastCalculation.EV.interestCoverage);
        addRow(T('s37'),T('s41'), (ratios.equityRatio*100).toFixed(1)+'%', lastCalculation.EV.equityRatio);
        addRow(T('s42'),T('s43'), ratios.inventoryTurnover.toFixed(2), {text:T('s44'), class:'status-warning'});
        addRow(T('s42'),T('s45'), ratios.daysInventory.toFixed(0)+T('s46'), {text:'', class:'status-warning'});
        addRow(T('s42'),T('s47'), ratios.receivablesTurnover.toFixed(2), {text:T('s44'), class:'status-warning'});
        addRow(T('s42'),T('s48'), ratios.daysSalesOutstanding.toFixed(0)+T('s46'), {text:'', class:'status-warning'});
        addRow(T('s42'),T('s49'), ratios.payablesTurnover.toFixed(2), {text:T('s44'), class:'status-warning'});
        addRow(T('s42'),T('s50'), ratios.daysPayables.toFixed(0)+T('s46'), {text:'', class:'status-warning'});
        addRow(T('s42'),T('s51'), ratios.cashConversionCycle.toFixed(0)+T('s46'), {text:'', class:lastCalculation.EV.ccc.good?'status-good':'status-warning'});
        tableHtml += `</tbody>`;
        document.getElementById('ratiosTable').innerHTML = `<table>${tableHtml}</table>`;

        const recs = R.recs;
        document.getElementById('recommendations').innerHTML = `${T('s52')}${recs.map(r=>'• '+r).join('<br>')}`;

        const radarData = {
            labels: [T('s29'),T('s33'),T('s37'),T('s42')],
            datasets: [{
                label: T('s53'),
                data: [
                    ...R.radar
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
            labels: ['ROA', 'ROE', T('s36')],
            datasets: [{ label: T('s54'), data: [ratios.roa*100, ratios.roe*100, ratios.netMargin*100], backgroundColor: '#b8860b' }]
        };
        if (barsChart) barsChart.destroy();
        const ctxBars = document.getElementById('barsChart').getContext('2d');
        barsChart = new Chart(ctxBars, { type: 'bar', data: barData, options: { responsive: true, maintainAspectRatio: false } });
    }

    document.getElementById('calculateBtn').addEventListener('click', displayResults);

    // ================================================================
    // ========== تصدير Excel احترافي (مع إصلاح الخطأ) ==========
    // ================================================================
    document.getElementById('exportExcelBtn').addEventListener('click', async function() {
        if (!lastCalculation) { alert(T('s55')); return; }
        showLoading(T('s56'), T('s57'));
        try {
            const { inputs, ratios, currency, company } = lastCalculation;
            const companyName = company || T('s2');
            const now = new Date();
            const dateStr = now.toLocaleDateString(FG.locale());

            // ===== دوال أمان =====
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

            function hs(bg=HB, tc=GL){return{font:{name:'Arial',bold:true,size:11,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()},border:{top:{style:'thin',color:{argb:G}},bottom:{style:'thin',color:{argb:G}},left:{style:'thin',color:{argb:G}},right:{style:'thin',color:{argb:G}}}};}
            function cs(bg='FFFFFFFF',tc=DT,b=false,h='center'){return{font:{name:'Arial',bold:b,size:10,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:h,vertical:'middle',wrapText:true,readingOrder:FG.dir()},border:{top:{style:'hair',color:{argb:'FFCCCCCC'}},bottom:{style:'hair',color:{argb:'FFCCCCCC'}},left:{style:'hair',color:{argb:'FFCCCCCC'}},right:{style:'hair',color:{argb:'FFCCCCCC'}}}};}
            function ap(c,s){if(s.font)c.font=s.font;if(s.fill)c.fill=s.fill;if(s.alignment)c.alignment=s.alignment;if(s.border)c.border=s.border;if(s.numFmt)c.numFmt=s.numFmt;}
            function mh(ws,fc,tc,r,text,bg=HB,tc2=GL,fs=12){ws.mergeCells(r,fc,r,tc);const c=ws.getCell(r,fc);c.value=text;c.font={name:'Arial',bold:true,size:fs,color:{argb:tc2}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};c.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};}

            // 1. غلاف التقرير
            const cv = workbook.addWorksheet(T('s58'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
            cv.getRow(2).height=80; cv.getRow(4).height=60;
            cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1);
            bc.value=T('s59');
            bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};
            mh(cv,1,4,4,`${T('s60')}${companyName}`,DB,GL,18);
            const inf = [
                [T('s61'), companyName],
                [T('s62'), dateStr],
                [T('s63'), currency],
                [T('s64'), `${currency} ${safeToFixed(inputs.netProfit, 0)}`],
                ['📈 ROE', safePct(ratios.roe)]
            ];
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
            const inpSheet = workbook.addWorksheet(T('s65'), { views: [{ rightToLeft: FG.isRTL() }] });
            inpSheet.getColumn(1).width=5; inpSheet.getColumn(2).width=35; inpSheet.getColumn(3).width=20; inpSheet.getColumn(4).width=20;
            mh(inpSheet,1,4,1,T('s66'),DB,GL,14);
            const inputRows = [
                [T('s67'), inputs.cash], [T('s68'), inputs.inventory],
                [T('s69'), inputs.otherCurrent], [T('s70'), inputs.fixedAssets],
                [T('s71'), inputs.currentLiabilities], [T('s72'), inputs.longTermLiabilities],
                [T('s73'), inputs.revenue], [T('s74'), inputs.cogs],
                [T('s75'), inputs.operatingExpenses], [T('s76'), inputs.interestExpense],
                [T('s77'), (safeNum(inputs.taxRate)*100).toFixed(0)+'%'],
                [T('s78'), inputs.creditSales], [T('s79'), inputs.receivables],
                [T('s80'), inputs.payables]
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

            // 3. النسب المالية
            const ratioSheet = workbook.addWorksheet(T('s81'), { views: [{ rightToLeft: FG.isRTL() }] });
            ratioSheet.getColumn(1).width=5; ratioSheet.getColumn(2).width=25; ratioSheet.getColumn(3).width=20; ratioSheet.getColumn(4).width=15;
            mh(ratioSheet,1,4,1,T('s82'),DB,GL,14);
            const rHeader = ratioSheet.getRow(3);
            [T('s83'),T('s84'),T('s85'),T('s86')].forEach((h,i)=>{const c=rHeader.getCell(i+2);c.value=h;ap(c,hs(HB,GL));});
            const ratioList = [
                [T('s29'),T('s30'), safeToFixed(ratios.currentRatio,2), lastCalculation.EV.currentRatio.text],
                [T('s29'),T('s31'), safeToFixed(ratios.quickRatio,2), lastCalculation.EV.quickRatio.text],
                [T('s29'),T('s32'), safeToFixed(ratios.cashRatio,2), lastCalculation.EV.cashRatio.text],
                [T('s33'),T('s34'), safePct(ratios.grossMargin), lastCalculation.EV.grossMargin.text],
                [T('s33'),T('s35'), safePct(ratios.operatingMargin), lastCalculation.EV.operatingMargin.text],
                [T('s33'),T('s36'), safePct(ratios.netMargin), lastCalculation.EV.netMargin.text],
                [T('s33'),'ROA', safePct(ratios.roa), lastCalculation.EV.roa.text],
                [T('s33'),'ROE', safePct(ratios.roe), lastCalculation.EV.roe.text],
                [T('s37'),T('s38'), safeToFixed(ratios.debtToEquity,2), lastCalculation.EV.debtToEquity.text],
                [T('s37'),T('s39'), safeToFixed(ratios.debtToAssets,2), lastCalculation.EV.debtToAssets.text],
                [T('s37'),T('s40'), safeToFixed(ratios.interestCoverage,2), lastCalculation.EV.interestCoverage.text],
                [T('s42'),T('s43'), safeToFixed(ratios.inventoryTurnover,2), T('s44')],
                [T('s42'),T('s45'), safeToFixed(ratios.daysInventory,0)+T('s46'), ''],
                [T('s42'),T('s47'), safeToFixed(ratios.receivablesTurnover,2), T('s44')],
                [T('s42'),T('s48'), safeToFixed(ratios.daysSalesOutstanding,0)+T('s46'), ''],
                [T('s42'),T('s49'), safeToFixed(ratios.payablesTurnover,2), T('s44')],
                [T('s42'),T('s50'), safeToFixed(ratios.daysPayables,0)+T('s46'), ''],
                [T('s42'),T('s51'), safeToFixed(ratios.cashConversionCycle,0)+T('s46'), '']
            ];
            let rRow=4;
            ratioList.forEach(r=>{
                const row=ratioSheet.getRow(rRow);
                [2,3,4,5].forEach((c,i)=>{const cell=row.getCell(c);cell.value=r[i];ap(cell,cs(AR,DT,false,'center'));});
                rRow++;
            });

            // 4. الرسوم البيانية
            const chartSheet = workbook.addWorksheet(T('s87'), { views: [{ rightToLeft: FG.isRTL() }] });
            chartSheet.getColumn(1).width=5; chartSheet.getColumn(2).width=60;
            mh(chartSheet,1,2,1,T('s88'),DB,GL,14);
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

            // 5. التوصيات
            const recSheet = workbook.addWorksheet(T('s89'), { views: [{ rightToLeft: FG.isRTL() }] });
            recSheet.getColumn(1).width=5; recSheet.getColumn(2).width=60;
            mh(recSheet,1,2,1,T('s90'),DB,GL,14);
            const recs = lastCalculation.recs;
            let recRow=3;
            recs.forEach(r=>{
                recSheet.getRow(recRow).height=25;
                const cell = recSheet.getCell(recRow,2);
                cell.value = '• ' + r;
                cell.font = { name: 'Arial', size: 11, color: { argb: DT } };
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEFCF6' } };
                cell.alignment = { horizontal: 'right', vertical: 'middle', wrapText: true, readingOrder: FG.dir() };
                recRow++;
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const fileName = `${T('s91')}${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) {
            console.error(err);
            alert(T('s92') + err.message);
        } finally {
            hideLoading();
        }
    });

    // ================================================================
    // ========== تصدير Word احترافي ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (!lastCalculation) { alert(T('s55')); return; }
        showLoading(T('s93'), T('s94'));
        try {
            const { inputs, ratios, currency, company } = lastCalculation;
            const companyName = company || T('s2');
            const now = new Date();
            const dateStr = now.toLocaleDateString(FG.locale());

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

            const fullHtml = `${T('s95')}${companyName}${T('s96')}${dateStr}${T('s97')}${currency}${T('s98')}${cardsHtml}${T('s99')}${tableHtml}${T('s100')}${chartImgBase64}${T('s101')}${recHtml}${T('s102')}${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${T('s103')}${companyName}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert(T('s104') + err.message); } finally { hideLoading(); }
    });
