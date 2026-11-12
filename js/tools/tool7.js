
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

    // ===== المتغيرات العامة =====
    let breakevenChart = null;
    let globalResults = {};

    // ===== دالة الحساب =====
    async function computeBreakeven() {
        const currency = document.getElementById('currencySelect').value;
        const fixedCosts = parseFloat(document.getElementById('fixedCosts').value) || 0;
        const unitPrice = parseFloat(document.getElementById('unitPrice').value) || 0;
        const unitCost = parseFloat(document.getElementById('unitCost').value) || 0;
        if (fixedCosts <= 0 || unitPrice <= 0 || unitCost < 0) {
            alert(T('s2'));
            return null;
        }
        let R;
        try { R = await FG.calc('tool7', 'main', { fixedCosts, unitPrice, unitCost }); } catch (e) { FG.calcError(e); return null; }
        const { contributionMargin, breakevenUnits, breakevenRevenue, contributionMarginPercent } = R;
        return {
            currency, fixedCosts, unitPrice, unitCost,
            contributionMargin, breakevenUnits, breakevenRevenue, contributionMarginPercent, chart: R.chart,
            companyName: document.getElementById('companyName').value || T('s3')
        };
    }

    // ===== تحديث واجهة النتائج =====
    function updateUI(results) {
        if (!results) return;
        const { currency, fixedCosts, unitPrice, unitCost, contributionMargin, breakevenUnits, breakevenRevenue, contributionMarginPercent, companyName, chart } = results;
        const beUnitsDisplay = isFinite(breakevenUnits) ? breakevenUnits.toFixed(0) : '∞';
        const beRevenueDisplay = isFinite(breakevenRevenue) ? currency + ' ' + breakevenRevenue.toFixed(0) : T('s4');

        document.getElementById('kpiCards').innerHTML = `${T('s5')}${beUnitsDisplay}${T('s6')}${beRevenueDisplay}${T('s7')}${currency}${contributionMargin.toFixed(2)}${T('s8')}${contributionMarginPercent.toFixed(2)}%</div></div>
        `;

        document.getElementById('summaryTable').innerHTML = `${T('s9')}${currency}${fixedCosts.toFixed(0)}${T('s10')}${currency}${unitPrice.toFixed(2)}${T('s11')}${currency}${unitCost.toFixed(2)}${T('s12')}${currency}${contributionMargin.toFixed(2)}${T('s13')}${beUnitsDisplay}${T('s14')}${isFinite(breakevenRevenue) ? currency + ' ' + breakevenRevenue.toFixed(0) : T('s4')}</td></tr>
                </tbody>
            </table>
        `;

        // الرسم البياني
        const ctx = document.getElementById('breakevenChart').getContext('2d');
        if (breakevenChart) breakevenChart.destroy();
        const { labels, revenueData, costData, beLine } = chart;
        breakevenChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: T('s15'), data: revenueData, borderColor: '#28a745', backgroundColor: 'rgba(40,167,69,0.1)', tension: 0.1, fill: false },
                    { label: T('s16'), data: costData, borderColor: '#dc3545', backgroundColor: 'rgba(220,53,69,0.1)', tension: 0.1, fill: false },
                    { label: T('s17'), data: beLine.map(val => val), borderColor: '#b8860b', borderDash: [5,5], pointRadius: 0, fill: false }
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
    document.getElementById('calculateBtn').addEventListener('click', async function() {
        const results = await computeBreakeven();
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
            alert(T('s18'));
            return;
        }
        if (!globalResults.outputs) {
            alert(T('s19'));
            return;
        }
        showLoading(T('s20'), T('s21'));
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

            function hs(bg=HB, tc=GL){return{font:{name:'Arial',bold:true,size:11,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()},border:{top:{style:'thin',color:{argb:G}},bottom:{style:'thin',color:{argb:G}},left:{style:'thin',color:{argb:G}},right:{style:'thin',color:{argb:G}}}};}
            function cs(bg='FFFFFFFF',tc=DT,b=false,h='center'){return{font:{name:'Arial',bold:b,size:10,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:h,vertical:'middle',wrapText:true,readingOrder:FG.dir()},border:{top:{style:'hair',color:{argb:'FFCCCCCC'}},bottom:{style:'hair',color:{argb:'FFCCCCCC'}},left:{style:'hair',color:{argb:'FFCCCCCC'}},right:{style:'hair',color:{argb:'FFCCCCCC'}}}};}
            function ap(c,s){if(s.font)c.font=s.font;if(s.fill)c.fill=s.fill;if(s.alignment)c.alignment=s.alignment;if(s.border)c.border=s.border;if(s.numFmt)c.numFmt=s.numFmt;}
            function mh(ws,fc,tc,r,text,bg=HB,tc2=GL,fs=12){ws.mergeCells(r,fc,r,tc);const c=ws.getCell(r,fc);c.value=text;c.font={name:'Arial',bold:true,size:fs,color:{argb:tc2}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};c.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};}

            // 1. غلاف التقرير
            const cv = workbook.addWorksheet(T('s22'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
            cv.getRow(2).height=80; cv.getRow(4).height=60;
            cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1);
            bc.value=T('s23');
            bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};
            mh(cv,1,4,4,`${T('s24')}${companyName}`,DB,GL,18);
            const inf=[[T('s25'),companyName],[T('s26'),new Date().toLocaleDateString(FG.locale())],[T('s27'),currency],[T('s28'),`${currency} ${I.fixedCosts.toFixed(0)}`],[T('s29'),R.beUnitsDisplay],[T('s30'),R.beRevenueDisplay]];
            let ir=6;
            inf.forEach(([l,v],idx)=>{
                cv.mergeCells(ir,1,ir,2); cv.mergeCells(ir,3,ir,4);
                const lc=cv.getCell(ir,1), vc=cv.getCell(ir,3); lc.value=l; vc.value=v;
                const bg=idx%2===0?AR:'FFFEFCF6';
                ap(lc,{font:{name:'Arial',bold:true,size:11,color:{argb:'00695C'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'right',vertical:'middle',readingOrder:FG.dir()},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                ap(vc,{font:{name:'Arial',size:11,color:{argb:DT}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',readingOrder:FG.dir()},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                cv.getRow(ir).height=28; ir++;
            });
            const vr=ir+1, isg=R.contributionMargin>0;
            cv.mergeCells(vr,1,vr,4); const vc2=cv.getCell(vr,1);
            vc2.value=isg?T('s31'):T('s32');
            vc2.font={name:'Arial',bold:true,size:14,color:{argb:isg?PT:'856404'}};
            vc2.fill={type:'pattern',pattern:'solid',fgColor:{argb:isg?PB:GB}};
            vc2.alignment={horizontal:'center',vertical:'middle',readingOrder:FG.dir()};
            vc2.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};
            cv.getRow(vr).height=40;

            // 2. المدخلات
            const inputsSheet = workbook.addWorksheet(T('s33'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            inputsSheet.getColumn(1).width=5; inputsSheet.getColumn(2).width=38; inputsSheet.getColumn(3).width=22; inputsSheet.getColumn(4).width=22; inputsSheet.getColumn(5).width=5;
            mh(inputsSheet,1,5,1,T('s34'),DB,GL,14);
            inputsSheet.getRow(1).height=40;
            mh(inputsSheet,2,4,2,T('s35'),SB,'FFFFFFFF',11);
            inputsSheet.getRow(2).height=28;
            const inputFields = [
                [T('s36'), I.fixedCosts, ''],
                [T('s37'), I.unitPrice, ''],
                [T('s38'), I.unitCost, ''],
                [T('s39'), I.currency, ''],
                [T('s40'), I.companyName, '']
            ];
            let iRow=3;
            inputFields.forEach(([label,val,note],idx)=>{
                inputsSheet.getRow(iRow).height=24;
                const bg=idx%2===0?'FFFEFCF6':'FFFFFFFF';
                const lc=inputsSheet.getCell(iRow,2), vc=inputsSheet.getCell(iRow,3), nc=inputsSheet.getCell(iRow,4);
                lc.value=label; vc.value=val; nc.value=note;
                ap(lc,cs(bg,DT,true,FG.start()));
                ap(vc,{...cs(bg,'0000FF',false,'center'),numFmt:typeof val==='number'?'#,##0.00':null});
                ap(nc,cs(bg,'00695C',false,'center'));
                iRow++;
            });

            // 3. مؤشرات الأداء
            const kpiSheet = workbook.addWorksheet(T('s41'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            [5,32,22,22,22,5].forEach((w,i)=>kpiSheet.getColumn(i+1).width=w);
            mh(kpiSheet,1,6,1,T('s42'),DB,GL,15);
            kpiSheet.getRow(1).height=45;
            mh(kpiSheet,2,5,2,`${companyName} | ${new Date().toLocaleDateString(FG.locale())}`,HB,'FFFFFFFF',10);
            kpiSheet.getRow(2).height=26;
            const kpis = [
                { label: T('s43'), value: R.beUnitsDisplay, good: isFinite(R.breakevenUnits) },
                { label: T('s44'), value: R.beRevenueDisplay, good: isFinite(R.breakevenRevenue) },
                { label: T('s45'), value: `${currency}${R.contributionMargin.toFixed(2)}`, good: R.contributionMargin>0 },
                { label: T('s46'), value: `${R.contributionMarginPercent.toFixed(2)}%`, good: true }
            ];
            let kRow=3;
            kpis.forEach((k,idx)=>{
                kpiSheet.getRow(kRow).height=40;
                kpiSheet.mergeCells(kRow,2,kRow,2); kpiSheet.mergeCells(kRow,3,kRow,3); kpiSheet.mergeCells(kRow,4,kRow,4); kpiSheet.mergeCells(kRow,5,kRow,5);
                const ic=kpiSheet.getCell(kRow,2); ic.value=`🔹 ${idx+1}`;
                const lc2=kpiSheet.getCell(kRow,3); lc2.value=k.label;
                const vc3=kpiSheet.getCell(kRow,4); vc3.value=k.value;
                const nc2=kpiSheet.getCell(kRow,5); nc2.value=k.good?T('s47'):T('s48');
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
            kFinal.value=isg?T('s31'):T('s32');
            kFinal.font={name:'Arial',bold:true,size:13,color:{argb:isg?PT:'856404'}};
            kFinal.fill={type:'pattern',pattern:'solid',fgColor:{argb:isg?PB:GB}};
            kFinal.alignment={horizontal:'center',vertical:'middle',readingOrder:FG.dir()};
            kFinal.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};
            kpiSheet.getRow(kRow).height=40;

            // 4. ملخص التحليل
            const summarySheet = workbook.addWorksheet(T('s49'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            summarySheet.getColumn(1).width=5; summarySheet.getColumn(2).width=45; summarySheet.getColumn(3).width=30; summarySheet.getColumn(4).width=5;
            mh(summarySheet,1,4,1,T('s50'),DB,GL,14);
            summarySheet.getRow(1).height=40;
            const summaryRows = [
                [T('s36'), `${currency} ${I.fixedCosts.toFixed(0)}`],
                [T('s37'), `${currency} ${I.unitPrice.toFixed(2)}`],
                [T('s38'), `${currency} ${I.unitCost.toFixed(2)}`],
                [T('s45'), `${currency} ${R.contributionMargin.toFixed(2)}`],
                [T('s46'), `${R.contributionMarginPercent.toFixed(2)}%`],
                [T('s43'), R.beUnitsDisplay],
                [T('s44'), R.beRevenueDisplay]
            ];
            summarySheet.addRows([[T('s51'), T('s52')]]);
            summaryRows.forEach(row => summarySheet.addRow(row));
            const sumHeader = summarySheet.getRow(2);
            sumHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            sumHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
            summarySheet.getColumn(2).width = 40; summarySheet.getColumn(3).width = 30;

            // 5. الرسوم البيانية
            const chartsSheet = workbook.addWorksheet(T('s53'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
            mh(chartsSheet,1,3,1,T('s54'),DB,GL,14);
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
                    errCell.value = T('s55');
                    errCell.font = { name: 'Arial', italic: true, color: { argb: NT } };
                }
            } else {
                chartsSheet.getCell(3,2).value = T('s56');
            }

            // 6. التفسير والتوصيات
            const intSheet = workbook.addWorksheet(T('s57'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            intSheet.getColumn(1).width=5; intSheet.getColumn(2).width=50; intSheet.getColumn(3).width=5;
            mh(intSheet,1,3,1,T('s58'),DB,GL,14);
            intSheet.getRow(1).height=45;
            const sections = [
                { title: T('s59'), content: `${T('s60')}${companyName}${T('s61')}${currency} ${I.fixedCosts.toFixed(0)}${T('s62')}${currency} ${I.unitPrice.toFixed(2)}${T('s63')}${currency} ${I.unitCost.toFixed(2)}${T('s64')}` },
                { title: T('s65'), content: `${T('s66')}${R.beUnitsDisplay}${T('s67')}${R.beRevenueDisplay}${T('s68')}${currency} ${R.contributionMargin.toFixed(2)}${T('s69')}${R.contributionMarginPercent.toFixed(2)}%` },
                { title: T('s70'), content: isg ? T('s71') + R.beUnitsDisplay + T('s72') : T('s73') },
                { title: T('s74'), content: T('s75') }
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
                tc3.alignment={horizontal:FG.start(),vertical:'middle',readingOrder:FG.dir()};
                tc3.border={bottom:{style:'medium',color:{argb:G}}};
                itRow++;
                intSheet.getRow(itRow).height=Math.max(60, sec.content.split('\n').length*18);
                intSheet.mergeCells(itRow,2,itRow,2);
                const cc=intSheet.getCell(itRow,2);
                cc.value=sec.content;
                cc.font={name:'Arial',size:10,color:{argb:DT}};
                cc.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFEFCF6'}};
                cc.alignment={horizontal:FG.start(),vertical:'top',wrapText:true,readingOrder:FG.dir()};
                cc.border={top:{style:'hair'},bottom:{style:'hair',color:{argb:G}},left:{style:'hair'},right:{style:'hair'}};
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const now = new Date();
            const fileName = `${T('s76')}${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert(T('s77') + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== تصدير Word احترافي ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (document.getElementById('resultsSection').style.display === 'none') {
            alert(T('s18'));
            return;
        }
        if (!globalResults.outputs) {
            alert(T('s19'));
            return;
        }
        showLoading(T('s78'), T('s79'));
        try {
            const R = globalResults.outputs;
            const I = globalResults.inputs;
            const currency = I.currency;
            const companyName = I.companyName;
            const now = new Date();
            const dateStr = now.toLocaleDateString(FG.locale());

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
                { label: T('s80'), value: R.beUnitsDisplay, good: isFinite(R.breakevenUnits) },
                { label: T('s81'), value: R.beRevenueDisplay, good: isFinite(R.breakevenRevenue) },
                { label: T('s82'), value: `${currency} ${R.contributionMargin.toFixed(2)}`, good: R.contributionMargin > 0 },
                { label: T('s46'), value: `${R.contributionMarginPercent.toFixed(2)}%`, good: true }
            ];
            let kpiRows = '';
            kpiData.forEach(k => {
                kpiRows += `<tr style="border:1px solid #b8860b;"><td style="padding:12px;background:${k.good?'#d4edda':'#f8d7da'};text-align:right;">${k.label}</td><td style="padding:12px;background:${k.good?'#d4edda':'#f8d7da'};text-align:center;"><strong style="font-size:1.2rem;color:${k.good?'#155724':'#721c24'}">${k.value}</strong></td><td style="padding:12px;background:${k.good?'#d4edda':'#f8d7da'};text-align:center;">${k.good?T('s47'):T('s48')}</td></tr>`;
            });

            // جدول ملخص
            const summaryRows = [
                { label: T('s36'), value: `${currency} ${I.fixedCosts.toFixed(0)}` },
                { label: T('s37'), value: `${currency} ${I.unitPrice.toFixed(2)}` },
                { label: T('s38'), value: `${currency} ${I.unitCost.toFixed(2)}` },
                { label: T('s82'), value: `${currency} ${R.contributionMargin.toFixed(2)}` },
                { label: T('s46'), value: `${R.contributionMarginPercent.toFixed(2)}%` },
                { label: T('s43'), value: R.beUnitsDisplay },
                { label: T('s44'), value: R.beRevenueDisplay }
            ];
            let summaryHtml = T('s83');
            summaryRows.forEach(row => {
                summaryHtml += `<tr style="border:1px solid #b8860b;"><td style="padding:8px;text-align:right;">${row.label}</td><td style="padding:8px;text-align:center;">${row.value}</td></tr>`;
            });
            summaryHtml += '</tbody></table>';

            const isGood = R.contributionMargin > 0;
            const verdictHtml = `<div style="margin:20px 0;padding:15px;background:${isGood?'#d4edda':'#f8d7da'};border-radius:10px;text-align:center;"><strong>${isGood?T('s84'):T('s85')}</strong></div>`;

            const fullHtml = `${T('s86')}${companyName}${T('s87')}${dateStr}${T('s88')}${currency}${T('s89')}${currency} ${I.fixedCosts.toFixed(0)}${T('s90')}${currency} ${I.unitPrice.toFixed(2)}${T('s91')}${currency} ${I.unitCost.toFixed(2)}${T('s92')}${kpiRows}</table>
                ${verdictHtml}${T('s93')}${chartImgBase64}${T('s94')}${summaryHtml}${T('s95')}${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${T('s76')}${companyName}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert(T('s96') + err.message); } finally { hideLoading(); }
    });
