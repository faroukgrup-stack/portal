
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

    // ===== دوال الحساب الأساسية =====
    function fmtNum(n) { return Math.round(n).toLocaleString('en-US'); }

    // ===== المتغيرات العامة =====
    let globalResults = {};
    let fcfChart = null;

    async function computeCashFlow() {
        const currency = document.getElementById('currencySelect').value;
        const period = document.getElementById('periodSelect').value;
        const flowType = document.getElementById('flowTypeSelect').value;

        // قراءة القيم المدخلة (تُعتبر سنوية)
        let revenueAnnual = parseFloat(document.getElementById('revenue').value) || 0;
        let opexAnnual = parseFloat(document.getElementById('opex').value) || 0;
        let depreciationAnnual = parseFloat(document.getElementById('depreciation').value) || 0;
        let taxRatePercent = parseFloat(document.getElementById('taxRate').value) || 0;
        let taxRate = taxRatePercent / 100;
        let capexAnnual = parseFloat(document.getElementById('capex').value) || 0;
        let wcChangeAnnual = parseFloat(document.getElementById('wcChange').value) || 0;
        let growthRatePercent = parseFloat(document.getElementById('growthRate').value) || 0;
        let growthRate = growthRatePercent / 100;

        // تحويل القيم حسب الفترة المختارة
        if (revenueAnnual <= 0) { alert(T('s5')); return null; }
        let R;
        try { R = await FG.calc('tool8', 'main', { revenueAnnual, opexAnnual, depreciationAnnual, taxRate, capexAnnual, wcChangeAnnual, growthRate, period, flowType }); } catch (e) { FG.calcError(e); return null; }
        const { revenue, opex, depreciation, capex, wcChange, periodName, ebit, taxes, nopat, operatingCF, finalFCF, flowName, labels, values } = R;

        // عرض النتائج
        document.getElementById('initialMessage').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';

        document.getElementById('kpiCards').innerHTML = `${T('s27')}${periodName})</h4><div class="value">${currency}${fmtNum(revenue)}</div></div>
            <div class="result-card"><i class="fas fa-file-invoice"></i><h4>EBIT</h4><div class="value">${currency}${fmtNum(ebit)}</div></div>
            <div class="result-card"><i class="fas fa-calculator"></i><h4>NOPAT</h4><div class="value">${currency}${fmtNum(nopat)}</div></div>
            <div class="result-card"><i class="fas fa-chart-line"></i><h4>${flowName}</h4><div class="value">${currency}${fmtNum(finalFCF)}</div><div class="status ${finalFCF > 0 ? 'status-good' : finalFCF < 0 ? 'status-bad' : 'status-warning'}">${finalFCF > 0 ? T('s24') : finalFCF < 0 ? T('s25') : T('s26')}</div></div>
        `;

        // جدول تفصيلي
        let tableRows = `${T('s28')}${periodName})</td><td>${currency}${fmtNum(revenue)}${T('s29')}${currency}${fmtNum(opex)}${T('s30')}${currency}${fmtNum(depreciation)}</td></tr>
            <tr><td style="text-align:right">EBIT</td><td>${currency}${fmtNum(ebit)}${T('s31')}${taxRatePercent.toFixed(0)}%)</td><td>${currency}${fmtNum(taxes)}</td></tr>
            <tr><td style="text-align:right">NOPAT</td><td>${currency}${fmtNum(nopat)}${T('s32')}${currency}${fmtNum(depreciation)}${T('s33')}${currency}${fmtNum(operatingCF)}</td></tr>
        `;
        if (flowType === 'free') {
            tableRows += `${T('s34')}${periodName})</td><td>${currency}${fmtNum(capex)}${T('s35')}${currency}${fmtNum(wcChange)}</td></tr>
            `;
        }
        tableRows += `<tr style="background:rgba(180,133,84,0.15);font-weight:900;"><td style="text-align:right">${flowName}</td><td>${currency}${fmtNum(finalFCF)}</td></tr>`;

        document.getElementById('detailsTable').innerHTML = `${T('s36')}${currency})</th></tr></thead>
                <tbody>${tableRows}</tbody>
            </table>
        `;

        // رسم بياني باستخدام Chart.js
        const ctx = document.getElementById('fcfChart').getContext('2d');
        if (fcfChart) fcfChart.destroy();
        const colors = values.map(v => v >= 0 ? 'rgba(74,222,128,0.8)' : 'rgba(248,113,113,0.8)');
        fcfChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: flowName,
                    data: values,
                    backgroundColor: colors,
                    borderColor: colors.map(c => c.replace('0.8', '1')),
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#f0f4fa' } },
                    tooltip: {
                        callbacks: {
                            label: function(ctx) {
                                return `${ctx.dataset.label}: ${currency} ${fmtNum(ctx.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: { ticks: { color: '#aab7d4' }, grid: { color: 'rgba(180,133,84,0.15)' } },
                    x: { ticks: { color: '#aab7d4', maxTicksLimit: 10 } }
                }
            }
        });

        // التفسير
        let interpretation = '';
        if (finalFCF > 0) {
            interpretation = `${flowName}${T('s37')}${currency}${fmtNum(finalFCF)} (${periodName}${T('s38')}${currency}${fmtNum(values[4])}${T('s39')}`;
        } else if (finalFCF < 0) {
            interpretation = `${flowName}${T('s40')}${currency}${fmtNum(Math.abs(finalFCF))} (${periodName}${T('s41')}${currency}${fmtNum(values[4])}${T('s42')}`;
        } else {
            interpretation = `${flowName}${T('s43')}${periodName}${T('s44')}`;
        }
        document.getElementById('interpretation').innerHTML = `<p><i class="fas fa-lightbulb" style="color:var(--accent-soft);"></i> ${interpretation}</p>`;

        // تخزين النتائج للتصدير
        globalResults = {
            inputs: {
                revenueAnnual: parseFloat(document.getElementById('revenue').value),
                opexAnnual: parseFloat(document.getElementById('opex').value),
                depreciationAnnual: parseFloat(document.getElementById('depreciation').value),
                taxRatePercent: taxRatePercent,
                capexAnnual: parseFloat(document.getElementById('capex').value),
                wcChangeAnnual: parseFloat(document.getElementById('wcChange').value),
                growthRatePercent: growthRatePercent,
                period, flowType,
                companyName: document.getElementById('companyName').value || T('s45'),
                currency
            },
            outputs: {
                periodName, revenuePerPeriod: revenue, opexPerPeriod: opex,
                depreciationPerPeriod: depreciation, capexPerPeriod: capex,
                wcChangePerPeriod: wcChange, taxRatePercent,
                growthRatePercent, ebit, taxes, nopat, operatingCF,
                finalFCF, flowName, labels, values, interpretation
            }
        };
        return globalResults;
    }

    document.getElementById('calculateBtn').addEventListener('click', function() {
        computeCashFlow();
    });

    // ================================================================
    // ========== تصدير Excel احترافي ==========
    // ================================================================
    document.getElementById('exportFullExcelBtn').addEventListener('click', async function() {
        if (document.getElementById('resultsSection').style.display === 'none') {
            alert(T('s46'));
            return;
        }
        if (!globalResults.outputs) { alert(T('s47')); return; }
        showLoading(T('s48'), T('s49'));
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
            const nc = '#,##0;(#,##0);"-"';

            function hs(bg=HB, tc=GL){return{font:{name:'Arial',bold:true,size:11,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()},border:{top:{style:'thin',color:{argb:G}},bottom:{style:'thin',color:{argb:G}},left:{style:'thin',color:{argb:G}},right:{style:'thin',color:{argb:G}}}};}
            function cs(bg='FFFFFFFF',tc=DT,b=false,h='center'){return{font:{name:'Arial',bold:b,size:10,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:h,vertical:'middle',wrapText:true,readingOrder:FG.dir()},border:{top:{style:'hair',color:{argb:'FFCCCCCC'}},bottom:{style:'hair',color:{argb:'FFCCCCCC'}},left:{style:'hair',color:{argb:'FFCCCCCC'}},right:{style:'hair',color:{argb:'FFCCCCCC'}}}};}
            function ap(c,s){if(s.font)c.font=s.font;if(s.fill)c.fill=s.fill;if(s.alignment)c.alignment=s.alignment;if(s.border)c.border=s.border;if(s.numFmt)c.numFmt=s.numFmt;}
            function mh(ws,fc,tc,r,text,bg=HB,tc2=GL,fs=12){ws.mergeCells(r,fc,r,tc);const c=ws.getCell(r,fc);c.value=text;c.font={name:'Arial',bold:true,size:fs,color:{argb:tc2}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};c.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};}

            // 1. غلاف التقرير
            const cv = workbook.addWorksheet(T('s50'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
            cv.getRow(2).height=80; cv.getRow(4).height=60;
            cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1);
            bc.value=T('s51');
            bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};
            mh(cv,1,4,4,`${T('s52')}${companyName}`,DB,GL,18);
            const inf=[[T('s53'),companyName],[T('s54'),new Date().toLocaleDateString(FG.locale())],[T('s55'),currency],[T('s56'),R.periodName],[T('s57'),R.flowName],[T('s58'),`${currency} ${fmtNum(R.finalFCF)}`]];
            let ir=6;
            inf.forEach(([l,v],idx)=>{
                cv.mergeCells(ir,1,ir,2); cv.mergeCells(ir,3,ir,4);
                const lc=cv.getCell(ir,1), vc=cv.getCell(ir,3); lc.value=l; vc.value=v;
                const bg=idx%2===0?AR:'FFFEFCF6';
                ap(lc,{font:{name:'Arial',bold:true,size:11,color:{argb:'00695C'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'right',vertical:'middle',readingOrder:FG.dir()},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                ap(vc,{font:{name:'Arial',size:11,color:{argb:DT}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',readingOrder:FG.dir()},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                cv.getRow(ir).height=28; ir++;
            });
            const vr=ir+1, isg=R.finalFCF>0;
            cv.mergeCells(vr,1,vr,4); const vc2=cv.getCell(vr,1);
            vc2.value=isg?T('s59'):T('s60');
            vc2.font={name:'Arial',bold:true,size:14,color:{argb:isg?PT:'856404'}};
            vc2.fill={type:'pattern',pattern:'solid',fgColor:{argb:isg?PB:GB}};
            vc2.alignment={horizontal:'center',vertical:'middle',readingOrder:FG.dir()};
            vc2.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};
            cv.getRow(vr).height=40;

            // 2. المدخلات
            const inputsSheet = workbook.addWorksheet(T('s61'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            inputsSheet.getColumn(1).width=5; inputsSheet.getColumn(2).width=38; inputsSheet.getColumn(3).width=22; inputsSheet.getColumn(4).width=22; inputsSheet.getColumn(5).width=5;
            mh(inputsSheet,1,5,1,T('s62'),DB,GL,14);
            inputsSheet.getRow(1).height=40;
            mh(inputsSheet,2,4,2,T('s63'),SB,'FFFFFFFF',11);
            inputsSheet.getRow(2).height=28;
            const inputFields = [
                [T('s64'), I.revenueAnnual, `${currency} ${fmtNum(I.revenueAnnual)}`],
                [T('s65'), I.opexAnnual, `${currency} ${fmtNum(I.opexAnnual)}`],
                [T('s66'), I.depreciationAnnual, `${currency} ${fmtNum(I.depreciationAnnual)}`],
                [T('s67'), I.taxRatePercent, ''],
                [T('s68'), I.capexAnnual, `${currency} ${fmtNum(I.capexAnnual)}`],
                [T('s69'), I.wcChangeAnnual, `${currency} ${fmtNum(I.wcChangeAnnual)}`],
                [T('s70'), I.growthRatePercent, ''],
                [T('s71'), I.period === 'monthly' ? T('s72') : I.period === 'quarterly' ? T('s73') : T('s74'), ''],
                [T('s75'), I.flowType === 'operating' ? T('s76') : T('s77'), ''],
                [T('s78'), I.currency, ''],
                [T('s79'), I.companyName, '']
            ];
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
            const kpiSheet = workbook.addWorksheet(T('s80'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            [5,32,22,22,22,5].forEach((w,i)=>kpiSheet.getColumn(i+1).width=w);
            mh(kpiSheet,1,6,1,T('s81'),DB,GL,15);
            kpiSheet.getRow(1).height=45;
            mh(kpiSheet,2,5,2,`${companyName} | ${new Date().toLocaleDateString(FG.locale())}`,HB,'FFFFFFFF',10);
            kpiSheet.getRow(2).height=26;
            const kpis = [
                { label: T('s82'), value: `${currency} ${fmtNum(R.revenuePerPeriod)}`, good: true },
                { label: 'EBIT', value: `${currency} ${fmtNum(R.ebit)}`, good: R.ebit>0 },
                { label: 'NOPAT', value: `${currency} ${fmtNum(R.nopat)}`, good: R.nopat>0 },
                { label: T('s83'), value: `${currency} ${fmtNum(R.operatingCF)}`, good: R.operatingCF>0 },
                { label: R.flowName, value: `${currency} ${fmtNum(R.finalFCF)}`, good: R.finalFCF>0 }
            ];
            let kRow=3;
            kpis.forEach((k,idx)=>{
                kpiSheet.getRow(kRow).height=40;
                kpiSheet.mergeCells(kRow,2,kRow,2); kpiSheet.mergeCells(kRow,3,kRow,3); kpiSheet.mergeCells(kRow,4,kRow,4); kpiSheet.mergeCells(kRow,5,kRow,5);
                const ic=kpiSheet.getCell(kRow,2); ic.value=`🔹 ${idx+1}`;
                const lc2=kpiSheet.getCell(kRow,3); lc2.value=k.label;
                const vc3=kpiSheet.getCell(kRow,4); vc3.value=k.value;
                const nc2=kpiSheet.getCell(kRow,5); nc2.value=k.good?T('s84'):T('s85');
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
            kFinal.value=R.finalFCF>0?T('s59'):T('s86');
            kFinal.font={name:'Arial',bold:true,size:13,color:{argb:R.finalFCF>0?PT:'856404'}};
            kFinal.fill={type:'pattern',pattern:'solid',fgColor:{argb:R.finalFCF>0?PB:GB}};
            kFinal.alignment={horizontal:'center',vertical:'middle',readingOrder:FG.dir()};
            kFinal.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};
            kpiSheet.getRow(kRow).height=40;

            // 4. تفصيل الحساب
            const detailSheet = workbook.addWorksheet(T('s87'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            detailSheet.getColumn(1).width=5; detailSheet.getColumn(2).width=45; detailSheet.getColumn(3).width=30; detailSheet.getColumn(4).width=5;
            mh(detailSheet,1,4,1,T('s88'),DB,GL,14);
            detailSheet.getRow(1).height=40;
            const detailRows = [
                [T('s89'), `${currency} ${fmtNum(R.revenuePerPeriod)}`],
                [T('s90'), `${currency} ${fmtNum(R.opexPerPeriod)}`],
                [T('s91'), `${currency} ${fmtNum(R.depreciationPerPeriod)}`],
                ['EBIT', `${currency} ${fmtNum(R.ebit)}`],
                [T('s92'), `${currency} ${fmtNum(R.taxes)}`],
                ['NOPAT', `${currency} ${fmtNum(R.nopat)}`],
                [T('s93'), `${currency} ${fmtNum(R.depreciationPerPeriod)}`],
                [T('s94'), `${currency} ${fmtNum(R.operatingCF)}`]
            ];
            if (I.flowType === 'free') {
                detailRows.push([T('s95'), `${currency} ${fmtNum(R.capexPerPeriod)}`]);
                detailRows.push([T('s96'), `${currency} ${fmtNum(R.wcChangePerPeriod)}`]);
            }
            detailRows.push([R.flowName, `${currency} ${fmtNum(R.finalFCF)}`]);
            detailSheet.addRows([[T('s97'), T('s98')]]);
            detailRows.forEach(row => detailSheet.addRow(row));
            detailSheet.getRow(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            detailSheet.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
            detailSheet.getColumn(2).width=40; detailSheet.getColumn(3).width=30;

            // 5. توقعات التدفق النقدي
            const forecastSheet = workbook.addWorksheet(T('s99'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            forecastSheet.getColumn(1).width=5; forecastSheet.getColumn(2).width=40; forecastSheet.getColumn(3).width=30; forecastSheet.getColumn(4).width=5;
            mh(forecastSheet,1,4,1,T('s100'),DB,GL,14);
            forecastSheet.getRow(1).height=40;
            const forecastRows = R.labels.map((label, idx) => [label, `${currency} ${fmtNum(R.values[idx])}`]);
            forecastSheet.addRows([[T('s101'), `${T('s102')}${currency})`]]);
            forecastRows.forEach(row => forecastSheet.addRow(row));
            forecastSheet.getRow(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            forecastSheet.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
            forecastSheet.getColumn(2).width=35; forecastSheet.getColumn(3).width=35;

            // 6. الرسوم البيانية
            const chartsSheet = workbook.addWorksheet(T('s103'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
            mh(chartsSheet,1,3,1,T('s104'),DB,GL,14);
            chartsSheet.getRow(1).height=40;
            const canvasElem = document.getElementById('fcfChart');
            if (canvasElem) {
                try {
                    const origBg = canvasElem.style.backgroundColor;
                    canvasElem.style.backgroundColor = '#ffffff';
                    const canvasImg = await html2canvas(canvasElem, { scale: 2, backgroundColor: '#ffffff' });
                    canvasElem.style.backgroundColor = origBg;
                    const imgData = canvasImg.toDataURL('image/png');
                    const imageId = workbook.addImage({ base64: imgData, extension: 'png' });
                    chartsSheet.addImage(imageId, { tl: { col: 1, row: 2 }, br: { col: 2, row: 18 }, editAs: 'oneCell' });
                } catch(err) { chartsSheet.getCell(3,2).value = T('s105'); }
            }

            // 7. التفسير والتوصيات
            const evalSheet = workbook.addWorksheet(T('s106'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            evalSheet.getColumn(1).width=5; evalSheet.getColumn(2).width=50; evalSheet.getColumn(3).width=5;
            mh(evalSheet,1,3,1,T('s107'),DB,GL,14);
            evalSheet.getRow(1).height=45;
            const sections = [
                { title: T('s108'), content: `${T('s109')}${companyName}${T('s110')}${R.periodName}${T('s111')}${R.flowName}${T('s112')}${currency} ${fmtNum(R.finalFCF)}${T('s113')}${I.growthRatePercent}%` },
                { title: T('s114'), content: `${T('s115')}${currency} ${fmtNum(R.values[4])}` },
                { title: T('s116'), content: R.finalFCF>0 ? T('s117') : T('s118') }
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
            const fileName = `${T('s119')}${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert(T('s120') + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== تصدير Word احترافي ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (document.getElementById('resultsSection').style.display === 'none') {
            alert(T('s46'));
            return;
        }
        if (!globalResults.outputs) { alert(T('s47')); return; }
        showLoading(T('s121'), T('s122'));
        try {
            const R = globalResults.outputs;
            const I = globalResults.inputs;
            const currency = I.currency;
            const companyName = I.companyName;
            const now = new Date();
            const dateStr = now.toLocaleDateString(FG.locale());

            // صورة الرسم البياني
            const canvas = document.getElementById('fcfChart');
            let chartImg = '';
            if (canvas) {
                const origBg = canvas.style.backgroundColor;
                canvas.style.backgroundColor = '#ffffff';
                const img = await html2canvas(canvas, { scale: 2, backgroundColor: '#ffffff' });
                canvas.style.backgroundColor = origBg;
                chartImg = img.toDataURL('image/png');
            }

            // بطاقات KPI
            const kpiData = [
                { label: T('s82'), value: `${currency} ${fmtNum(R.revenuePerPeriod)}`, good: true },
                { label: 'EBIT', value: `${currency} ${fmtNum(R.ebit)}`, good: R.ebit>0 },
                { label: 'NOPAT', value: `${currency} ${fmtNum(R.nopat)}`, good: R.nopat>0 },
                { label: T('s123'), value: `${currency} ${fmtNum(R.operatingCF)}`, good: R.operatingCF>0 },
                { label: R.flowName, value: `${currency} ${fmtNum(R.finalFCF)}`, good: R.finalFCF>0 }
            ];
            let kpiRows = '';
            kpiData.forEach(k => {
                kpiRows += `<tr style="border:1px solid #b8860b;"><td style="padding:12px;background:${k.good?'#d4edda':'#f8d7da'};text-align:right;">${k.label}</td><td style="padding:12px;background:${k.good?'#d4edda':'#f8d7da'};text-align:center;"><strong style="font-size:1.2rem;color:${k.good?'#155724':'#721c24'}">${k.value}</strong></td><td style="padding:12px;background:${k.good?'#d4edda':'#f8d7da'};text-align:center;">${k.good?T('s84'):T('s85')}</td></tr>`;
            });

            // جدول تفصيل الحساب
            const detailRows = [
                { label: T('s89'), value: `${currency} ${fmtNum(R.revenuePerPeriod)}` },
                { label: T('s124'), value: `${currency} ${fmtNum(R.opexPerPeriod)}` },
                { label: T('s125'), value: `${currency} ${fmtNum(R.depreciationPerPeriod)}` },
                { label: 'EBIT', value: `${currency} ${fmtNum(R.ebit)}` },
                { label: T('s92'), value: `${currency} ${fmtNum(R.taxes)}` },
                { label: 'NOPAT', value: `${currency} ${fmtNum(R.nopat)}` },
                { label: T('s93'), value: `${currency} ${fmtNum(R.depreciationPerPeriod)}` },
                { label: T('s123'), value: `${currency} ${fmtNum(R.operatingCF)}` }
            ];
            if (I.flowType === 'free') {
                detailRows.push({ label: '- CAPEX', value: `${currency} ${fmtNum(R.capexPerPeriod)}` });
                detailRows.push({ label: T('s96'), value: `${currency} ${fmtNum(R.wcChangePerPeriod)}` });
            }
            detailRows.push({ label: R.flowName, value: `${currency} ${fmtNum(R.finalFCF)}` });
            let detailHtml = T('s126');
            detailRows.forEach(row => {
                detailHtml += `<tr style="border:1px solid #b8860b;"><td style="padding:8px;text-align:right;">${row.label}</td><td style="padding:8px;text-align:center;">${row.value}</td></tr>`;
            });
            detailHtml += '</tbody></table>';

            // جدول التوقعات
            let forecastHtml = T('s127');
            for (let i=0; i<R.labels.length; i++) {
                forecastHtml += `<tr><td>${R.labels[i]}</td><td>${currency} ${fmtNum(R.values[i])}</td></tr>`;
            }
            forecastHtml += '</tbody></table>';

            const isGood = R.finalFCF > 0;
            const verdictHtml = `<div style="margin:20px 0;padding:15px;background:${isGood?'#d4edda':'#f8d7da'};border-radius:10px;text-align:center;"><strong>${isGood?T('s59'):T('s86')}</strong></div>`;

            const fullHtml = `${T('s128')}${companyName}${T('s129')}${dateStr}${T('s130')}${R.periodName}${T('s131')}${R.flowName}${T('s132')}${currency} ${fmtNum(I.revenueAnnual)}${T('s133')}${currency} ${fmtNum(I.opexAnnual)}${T('s134')}${currency} ${fmtNum(I.depreciationAnnual)}${T('s135')}${I.taxRatePercent}${T('s136')}${currency} ${fmtNum(I.capexAnnual)}${T('s137')}${currency} ${fmtNum(I.wcChangeAnnual)}${T('s138')}${I.growthRatePercent}${T('s139')}${kpiRows}</table>
                ${verdictHtml}${T('s140')}${chartImg}${T('s141')}${detailHtml}${T('s142')}${forecastHtml}${T('s143')}${R.interpretation}${T('s144')}${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF'+fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${T('s119')}${companyName}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert(T('s145') + err.message); } finally { hideLoading(); }
    });
