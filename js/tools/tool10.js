
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

    document.getElementById('calculateBtn').addEventListener('click', async function() {
        const currency = document.getElementById('currencySelect').value;
        const companyName = document.getElementById('companyName').value || T('s2');
        const equity = parseFloat(document.getElementById('equity').value) || 0;
        const debt = parseFloat(document.getElementById('debt').value) || 0;
        const costDebt = parseFloat(document.getElementById('costDebt').value) / 100 || 0;
        const taxRate = parseFloat(document.getElementById('taxRate').value) / 100 || 0;

        let reMethod = document.getElementById('reMethod').value;
        const costEquityManual = parseFloat(document.getElementById('costEquityManual').value) / 100 || 0;
        const rf = parseFloat(document.getElementById('rf').value) / 100 || 0;
        const beta = parseFloat(document.getElementById('beta').value) || 1;
        const mrp = parseFloat(document.getElementById('marketRiskPremium').value) / 100 || 0;

        if (equity <= 0 && debt <= 0) {
            alert(T('s3'));
            return;
        }

        let R;
        try { R = await FG.calc('tool10', 'main', { equity, debt, costDebt, taxRate, reMethod, costEquityManual, rf, beta, mrp }); } catch (e) { FG.calcError(e); return; }
        const { costEquity, capmDetails, total, weightEquity, weightDebt, afterTaxCostDebt, wacc, waccPercent, statusText, interpretationText } = R;

        document.getElementById('initialMessage').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';


        document.getElementById('kpiCards').innerHTML = `
            <div class="result-card"><i class="fas fa-chart-line"></i><h4>WACC</h4><div class="value">${waccPercent}%</div><div class="status ${R.waccGood?'status-good':'status-warning'}">${statusText}${T('s8')}${(weightEquity*100).toFixed(2)}${T('s9')}${(weightDebt*100).toFixed(2)}${T('s10')}${(costEquity*100).toFixed(2)}${T('s11')}${(afterTaxCostDebt*100).toFixed(2)}%</div></div>
        `;

        document.getElementById('detailsTable').innerHTML = `${T('s12')}${currency}${T('s13')}${currency}${equity.toFixed(0)}</td><td>${(weightEquity*100).toFixed(2)}%</td><td>${(costEquity*100).toFixed(2)}${T('s14')}${currency}${debt.toFixed(0)}</td><td>${(weightDebt*100).toFixed(2)}%</td><td>${(costDebt*100).toFixed(2)}${T('s15')}${(afterTaxCostDebt*100).toFixed(2)}${T('s16')}${waccPercent}%</td></tr>
            </table>
        `;

        // رسم بياني
        const ctx = document.getElementById('capitalChart').getContext('2d');
        if (capitalChart) capitalChart.destroy();
        capitalChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: [T('s17'), T('s18')],
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

        document.getElementById('interpretation').innerHTML = `<p><i class="fas fa-info-circle" style="color:var(--accent-soft);"></i> ${interpretationText}</p>`;

        // تخزين للتصدير
        globalWaccData = {
            waccGood: R.waccGood,
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
        if (!globalWaccData) { alert(T('s23')); return; }
        showLoading(T('s24'), T('s25'));
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

            function hs(bg=HB, tc=GL){return{font:{name:'Arial',bold:true,size:11,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()},border:{top:{style:'thin',color:{argb:G}},bottom:{style:'thin',color:{argb:G}},left:{style:'thin',color:{argb:G}},right:{style:'thin',color:{argb:G}}}};}
            function cs(bg='FFFFFFFF',tc=DT,b=false,h='center'){return{font:{name:'Arial',bold:b,size:10,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:h,vertical:'middle',wrapText:true,readingOrder:FG.dir()},border:{top:{style:'hair',color:{argb:'FFCCCCCC'}},bottom:{style:'hair',color:{argb:'FFCCCCCC'}},left:{style:'hair',color:{argb:'FFCCCCCC'}},right:{style:'hair',color:{argb:'FFCCCCCC'}}}};}
            function ap(c,s){if(s.font)c.font=s.font;if(s.fill)c.fill=s.fill;if(s.alignment)c.alignment=s.alignment;if(s.border)c.border=s.border;if(s.numFmt)c.numFmt=s.numFmt;}
            function mh(ws,fc,tc,r,text,bg=HB,tc2=GL,fs=12){ws.mergeCells(r,fc,r,tc);const c=ws.getCell(r,fc);c.value=text;c.font={name:'Arial',bold:true,size:fs,color:{argb:tc2}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};c.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};}

            // 1. غلاف التقرير
            const cv = workbook.addWorksheet(T('s26'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
            cv.getRow(2).height=80; cv.getRow(4).height=60;
            cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1);
            bc.value=T('s27');
            bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};
            mh(cv,1,4,4,`${T('s28')}${companyName}`,DB,GL,18);
            const inf=[[T('s29'),companyName],[T('s30'),new Date().toLocaleDateString(FG.locale())],[T('s31'),currency],['📊 WACC',`${D.wacc.toFixed(2)}%`],[T('s32'),D.reMethod==='manual'?T('s33'):'CAPM']];
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
            const inputsSheet = workbook.addWorksheet(T('s34'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            inputsSheet.getColumn(1).width=5; inputsSheet.getColumn(2).width=38; inputsSheet.getColumn(3).width=22; inputsSheet.getColumn(4).width=22; inputsSheet.getColumn(5).width=5;
            mh(inputsSheet,1,5,1,T('s35'),DB,GL,14);
            inputsSheet.getRow(1).height=40;
            mh(inputsSheet,2,4,2,T('s36'),SB,'FFFFFFFF',11);
            inputsSheet.getRow(2).height=28;
            const inputFields = [
                [T('s37'), D.equity, `${currency} ${D.equity.toFixed(0)}`],
                [T('s38'), D.debt, `${currency} ${D.debt.toFixed(0)}`],
                [T('s39'), D.total, `${currency} ${D.total.toFixed(0)}`],
                [T('s40'), D.costEquity, `${D.costEquity.toFixed(2)}%`],
                [T('s41'), D.costDebt, `${D.costDebt.toFixed(2)}%`],
                [T('s42'), D.taxRate, `${D.taxRate.toFixed(0)}%`]
            ];
            if (D.reMethod === 'capm' && D.capmDetails) {
                inputFields.push([T('s43'), D.capmDetails.rf, `${D.capmDetails.rf.toFixed(2)}%`]);
                inputFields.push([T('s44'), D.capmDetails.beta, '']);
                inputFields.push([T('s45'), D.capmDetails.mrp, `${D.capmDetails.mrp.toFixed(2)}%`]);
            }
            inputFields.push([T('s46'), D.reMethod==='manual'?T('s33'):'CAPM', '']);
            let iRow=3;
            inputFields.forEach(([label,val,note],idx)=>{
                inputsSheet.getRow(iRow).height=24;
                const bg=idx%2===0?'FFFEFCF6':'FFFFFFFF';
                const lc=inputsSheet.getCell(iRow,2), vc=inputsSheet.getCell(iRow,3), nc=inputsSheet.getCell(iRow,4);
                lc.value=label; vc.value=val; nc.value=note;
                ap(lc,cs(bg,DT,true,FG.start()));
                ap(vc,{...cs(bg,'0000FF',false,'center'),numFmt:typeof val==='number'?nc:null});
                ap(nc,cs(bg,'00695C',false,'center'));
                iRow++;
            });

            // 3. مؤشرات الأداء
            const kpiSheet = workbook.addWorksheet(T('s47'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            [5,32,22,22,22,5].forEach((w,i)=>kpiSheet.getColumn(i+1).width=w);
            mh(kpiSheet,1,6,1,T('s48'),DB,GL,15);
            kpiSheet.getRow(1).height=45;
            mh(kpiSheet,2,5,2,`${companyName} | ${new Date().toLocaleDateString(FG.locale())}`,HB,'FFFFFFFF',10);
            kpiSheet.getRow(2).height=26;
            const kpis = [
                { label: 'WACC', value: `${D.wacc.toFixed(2)}%`, good: D.waccGood },
                { label: T('s49'), value: `${D.weightEquity.toFixed(2)}%`, good: true },
                { label: T('s50'), value: `${D.weightDebt.toFixed(2)}%`, good: true },
                { label: T('s51'), value: `${D.costEquity.toFixed(2)}%`, good: true },
                { label: T('s52'), value: `${D.afterTaxCostDebt.toFixed(2)}%`, good: true }
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
                lc2.font={name:'Arial',bold:true,size:11,color:{argb:DT}}; lc2.alignment={horizontal:FG.start(),vertical:'middle',readingOrder:FG.dir()};
                vc3.font={name:'Arial',bold:true,size:13,color:{argb:tc}}; vc3.alignment={horizontal:'center',vertical:'middle'};
                kRow++;
            });
            kRow++;
            kpiSheet.mergeCells(kRow,2,kRow,5);
            const kFinal=kpiSheet.getCell(kRow,2);
            kFinal.value=D.waccGood?T('s53'):T('s54');
            kFinal.font={name:'Arial',bold:true,size:13,color:{argb:D.waccGood?PT:'856404'}};
            kFinal.fill={type:'pattern',pattern:'solid',fgColor:{argb:D.waccGood?PB:GB}};
            kFinal.alignment={horizontal:'center',vertical:'middle',readingOrder:FG.dir()};
            kFinal.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};
            kpiSheet.getRow(kRow).height=40;

            // 4. تفصيل الحساب
            const detailSheet = workbook.addWorksheet(T('s55'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            detailSheet.getColumn(1).width=5; detailSheet.getColumn(2).width=40; detailSheet.getColumn(3).width=22; detailSheet.getColumn(4).width=22; detailSheet.getColumn(5).width=22; detailSheet.getColumn(6).width=5;
            mh(detailSheet,1,6,1,T('s56'),DB,GL,14);
            detailSheet.getRow(1).height=40;
            const detailRows = [
                [T('s57'), T('s58'), T('s59'), T('s60')],
                [T('s17'), `${currency} ${D.equity.toFixed(0)}`, `${D.weightEquity.toFixed(2)}%`, `${D.costEquity.toFixed(2)}%`],
                [T('s61'), `${currency} ${D.debt.toFixed(0)}`, `${D.weightDebt.toFixed(2)}%`, `${D.costDebt.toFixed(2)}%`],
                [T('s62'), '-', '-', `${D.afterTaxCostDebt.toFixed(2)}%`],
                ['WACC', '', '', `${D.wacc.toFixed(2)}%`]
            ];
            detailRows.forEach(r => detailSheet.addRow(r));
            detailSheet.getRow(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            detailSheet.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };

            // 5. هيكل رأس المال (رسم بياني)
            const chartsSheet = workbook.addWorksheet(T('s63'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
            mh(chartsSheet,1,3,1,T('s64'),DB,GL,14);
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
            const evalSheet = workbook.addWorksheet(T('s65'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            evalSheet.getColumn(1).width=5; evalSheet.getColumn(2).width=50; evalSheet.getColumn(3).width=5;
            mh(evalSheet,1,3,1,T('s66'),DB,GL,14);
            evalSheet.getRow(1).height=45;
            const sections = [
                { title: T('s67'), content: `${T('s68')}${companyName}${T('s69')}${currency} ${D.total.toFixed(0)}${T('s70')}${D.wacc.toFixed(2)}${T('s71')}${D.reMethod==='manual'?T('s33'):'CAPM'}` },
                { title: T('s72'), content: D.interpretation },
                { title: T('s73'), content: D.waccGood ? T('s74') : T('s75') },
                { title: T('s76'), content: T('s77') }
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
                tc3.alignment={horizontal:FG.start(),vertical:'middle',readingOrder:FG.dir()};
                tc3.border={bottom:{style:'medium',color:{argb:G}}};
                itRow++;
                evalSheet.getRow(itRow).height=Math.max(60, sec.content.split('\n').length*18);
                evalSheet.mergeCells(itRow,2,itRow,2);
                const cc=evalSheet.getCell(itRow,2);
                cc.value=sec.content;
                cc.font={name:'Arial',size:10,color:{argb:DT}};
                cc.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFEFCF6'}};
                cc.alignment={horizontal:FG.start(),vertical:'top',wrapText:true,readingOrder:FG.dir()};
                cc.border={top:{style:'hair'},bottom:{style:'hair',color:{argb:G}},left:{style:'hair'},right:{style:'hair'}};
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const now = new Date();
            const fileName = `${T('s78')}${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert(T('s79') + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== تصدير Word احترافي ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (!globalWaccData) { alert(T('s23')); return; }
        showLoading(T('s80'), T('s81'));
        try {
            const D = globalWaccData;
            const currency = D.currency;
            const companyName = D.companyName;
            const now = new Date();
            const dateStr = now.toLocaleDateString(FG.locale());

            const chartContainer = document.querySelector('.chart-container');
            let chartImgBase64 = '';
            if (chartContainer) {
                const origBg = chartContainer.style.backgroundColor;
                chartContainer.style.backgroundColor = '#ffffff';
                const img = await html2canvas(chartContainer, { scale: 2, backgroundColor: '#ffffff' });
                chartContainer.style.backgroundColor = origBg;
                chartImgBase64 = img.toDataURL('image/png');
            }

            const fullHtml = `${T('s82')}${companyName}${T('s83')}${dateStr}${T('s84')}${currency} | WACC: ${D.wacc.toFixed(2)}${T('s85')}${currency} ${D.equity.toFixed(0)}${T('s86')}${currency} ${D.debt.toFixed(0)}${T('s87')}${D.costEquity.toFixed(2)}${T('s88')}${D.costDebt.toFixed(2)}${T('s89')}${D.taxRate.toFixed(0)}${T('s90')}${D.afterTaxCostDebt.toFixed(2)}${T('s91')}${D.wacc.toFixed(2)}${T('s92')}${chartImgBase64}${T('s93')}${D.detailsTableHtml}${T('s94')}${D.interpretation}${T('s95')}${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${T('s78')}${companyName}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert(T('s96') + err.message); } finally { hideLoading(); }
    });
