
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

    // ===== عناصر قابلة للطي =====
    document.querySelectorAll('.collapsible').forEach(coll => {
        coll.addEventListener('click', function() {
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            if (content.style.maxHeight) content.style.maxHeight = null;
            else content.style.maxHeight = content.scrollHeight + 'px';
        });
    });

    // ===== الحساب الرئيسي =====
    let pieChart, stackedBarChart;
    let globalLoanData = null;

    document.getElementById('calculateBtn').addEventListener('click', async function() {
        const currency = document.getElementById('currencySelect').value;
        const companyName = document.getElementById('companyName').value || T('s2');

        const principal = parseFloat(document.getElementById('loanAmount').value) || 0;
        const annualRate = parseFloat(document.getElementById('interestRate').value) / 100 || 0;
        const years = parseInt(document.getElementById('loanYears').value) || 10;
        const frequency = parseInt(document.getElementById('paymentFrequency').value);
        const downPayment = parseFloat(document.getElementById('downPayment').value) || 0;
        const extraPayment = parseFloat(document.getElementById('extraPayment').value) || 0;
        const gracePeriod = parseInt(document.getElementById('gracePeriod').value) || 0;

        if (principal <= 0 || annualRate <= 0 || years <= 0) {
            alert(T('s3'));
            return;
        }

        let R;
        try { R = await FG.calc('tool12', 'main', { principal, annualRate, years, frequency, downPayment, extraPayment, gracePeriod, currency }); } catch (e) { FG.calcError(e); return; }
        const { loanAfterDown, totalPayment, schedule, totalInterest, actualPeriods, totalPayments, yearsSaved } = R;

        document.getElementById('initialMessage').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';

        let savingsText = extraPayment > 0 ? `${T('s4')}${Math.abs(yearsSaved).toFixed(1)}${T('s5')}` : '';
        document.getElementById('kpiCards').innerHTML = `${T('s7')}${currency}${totalPayment.toFixed(2)}</div><div class="unit">${extraPayment > 0 ? T('s6') : ''}${T('s8')}${currency}${totalInterest.toFixed(2)}${T('s9')}${currency}${totalPayments.toFixed(2)}${T('s10')}${actualPeriods}</div><div class="unit">${savingsText}</div></div>
        `;

        let alerts = R.alerts;
        document.getElementById('smartAlerts').innerHTML = `${T('s18')}${alerts.join('<br>')}`;

        let tableHtml = T('s19');
        schedule.forEach(row => {
            tableHtml += `<tr><td>${row.period}</td><td>${currency}${row.payment.toFixed(2)}</td><td>${currency}${row.interest.toFixed(2)}</td><td>${currency}${row.principalPaid.toFixed(2)}</td><td>${currency}${row.balance.toFixed(2)}</td></tr>`;
        });
        tableHtml += '</tbody></table>';
        document.getElementById('amortTable').innerHTML = tableHtml;

        // الرسم البياني الأول - دائري
        const pieCtx = document.getElementById('pieChart').getContext('2d');
        if (pieChart) pieChart.destroy();
        pieChart = new Chart(pieCtx, {
            type: 'pie',
            data: {
                labels: [T('s20'), T('s21')],
                datasets: [{ data: [totalInterest, loanAfterDown], backgroundColor: ['#dc3545', '#28a745'], borderColor: 'white', borderWidth: 2 }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${currency}${ctx.raw.toFixed(2)}` } }
                }
            }
        });

        // الرسم البياني الثاني - شريطي مكدس
        const barCtx = document.getElementById('stackedBarChart').getContext('2d');
        if (stackedBarChart) stackedBarChart.destroy();
        const displayCount = Math.min(schedule.length, 60);
        const displaySchedule = schedule.slice(0, displayCount);
        stackedBarChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: displaySchedule.map(r => r.period),
                datasets: [
                    { label: T('s22'), data: displaySchedule.map(r => r.interest), backgroundColor: '#dc3545' },
                    { label: T('s21'), data: displaySchedule.map(r => r.principalPaid), backgroundColor: '#28a745' }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: { stacked: true, ticks: { color: '#ccc', maxTicksLimit: 20 } },
                    y: { stacked: true, beginAtZero: true, ticks: { color: '#ccc' } }
                },
                plugins: { legend: { labels: { color: '#ddd' } } }
            }
        });

        // تخزين البيانات للتصدير
        globalLoanData = {
            currency, companyName, principal, annualRate, years, frequency,
            downPayment, extraPayment, gracePeriod, loanAfterDown,
            totalPayment: totalPayment.toFixed(2),
            totalInterest: totalInterest.toFixed(2),
            totalPayments: totalPayments.toFixed(2),
            actualPeriods, schedule, yearsSaved: yearsSaved.toFixed(1),
            totalPrincipalPaid: loanAfterDown,
            alerts: alerts.join('<br>'), interestGood: R.interestGood
        };
    });

    // ================================================================
    // ========== تصدير Excel احترافي ==========
    // ================================================================
    document.getElementById('exportExcelBtn').addEventListener('click', async function() {
        if (!globalLoanData) { alert(T('s23')); return; }
        showLoading(T('s24'), T('s25'));
        try {
            const D = globalLoanData;
            const currency = D.currency;
            const companyName = D.companyName;

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'FAROUK GRUP';
            const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050';
            const AR = 'FFF5F0E8', DT = 'FF1A1A1A', PB = 'FFD4EDDA', NB = 'FFF8D7DA', GB = 'FFFFF3CD';
            const PT = 'FF155724', NT = 'FF721C24';
            const nc = '#,##0.00;(#,##0.00);"-"';

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
            const inf=[[T('s29'),companyName],[T('s30'),new Date().toLocaleDateString(FG.locale())],[T('s31'),currency],[T('s32'),`${currency} ${D.totalPayment}`],[T('s33'),`${currency} ${D.totalInterest}`]];
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
            const freqMap = {12:T('s37'),4:T('s38'),2:T('s39'),1:T('s40')};
            const inputFields = [
                [T('s41'), D.principal, `${currency} ${D.principal.toFixed(0)}`],
                [T('s42'), D.annualRate*100, `${(D.annualRate*100).toFixed(2)}%`],
                [T('s43'), D.years, ''],
                [T('s44'), freqMap[D.frequency] || T('s37'), ''],
                [T('s45'), D.downPayment, `${currency} ${D.downPayment.toFixed(0)}`],
                [T('s46'), D.extraPayment, `${currency} ${D.extraPayment.toFixed(0)}`],
                [T('s47'), D.gracePeriod, ''],
                [T('s48'), D.loanAfterDown, `${currency} ${D.loanAfterDown.toFixed(0)}`]
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
            const kpiSheet = workbook.addWorksheet(T('s49'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            [5,32,22,22,22,5].forEach((w,i)=>kpiSheet.getColumn(i+1).width=w);
            mh(kpiSheet,1,6,1,T('s50'),DB,GL,15);
            kpiSheet.getRow(1).height=45;
            mh(kpiSheet,2,5,2,`${companyName} | ${new Date().toLocaleDateString(FG.locale())}`,HB,'FFFFFFFF',10);
            kpiSheet.getRow(2).height=26;
            const kpis = [
                { label: T('s51'), value: `${currency} ${D.totalPayment}`, good: true },
                { label: T('s20'), value: `${currency} ${D.totalInterest}`, good: D.interestGood },
                { label: T('s52'), value: `${currency} ${D.totalPayments}`, good: true },
                { label: T('s53'), value: D.actualPeriods, good: true }
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
            kFinal.value=D.extraPayment>0?T('s54'):T('s55');
            kFinal.font={name:'Arial',bold:true,size:13,color:{argb:PT}};
            kFinal.fill={type:'pattern',pattern:'solid',fgColor:{argb:PB}};
            kFinal.alignment={horizontal:'center',vertical:'middle',readingOrder:FG.dir()};
            kFinal.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};
            kpiSheet.getRow(kRow).height=40;

            // 4. جدول السداد
            const tableSheet = workbook.addWorksheet(T('s56'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            tableSheet.getColumn(1).width=5; tableSheet.getColumn(2).width=15; tableSheet.getColumn(3).width=20; tableSheet.getColumn(4).width=20; tableSheet.getColumn(5).width=20; tableSheet.getColumn(6).width=20; tableSheet.getColumn(7).width=5;
            mh(tableSheet,1,7,1,T('s57'),DB,GL,14);
            tableSheet.getRow(1).height=40;
            tableSheet.addRow([T('s58'), T('s59'), T('s22'), T('s21'), T('s60')]);
            const headerRow = tableSheet.getRow(2);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
            D.schedule.forEach(r => {
                tableSheet.addRow([r.period, r.payment, r.interest, r.principalPaid, r.balance]);
            });

            // 5. الرسوم البيانية
            const chartsSheet = workbook.addWorksheet(T('s61'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
            mh(chartsSheet,1,3,1,T('s62'),DB,GL,14);
            chartsSheet.getRow(1).height=40;
            const chartContainer = document.querySelector('.charts-container');
            if (chartContainer) {
                try {
                    const origBg = chartContainer.style.backgroundColor;
                    chartContainer.style.backgroundColor = '#ffffff';
                    const canvasImg = await html2canvas(chartContainer, { scale: 2, backgroundColor: '#ffffff' });
                    chartContainer.style.backgroundColor = origBg;
                    const imgData = canvasImg.toDataURL('image/png');
                    const imageId = workbook.addImage({ base64: imgData, extension: 'png' });
                    chartsSheet.addImage(imageId, { tl: { col: 1, row: 2 }, br: { col: 2, row: 25 }, editAs: 'oneCell' });
                } catch(err) {}
            }

            // 6. التفسير والتوصيات
            const evalSheet = workbook.addWorksheet(T('s63'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            evalSheet.getColumn(1).width=5; evalSheet.getColumn(2).width=50; evalSheet.getColumn(3).width=5;
            mh(evalSheet,1,3,1,T('s64'),DB,GL,14);
            evalSheet.getRow(1).height=45;
            const sections = [
                { title: T('s65'), content: `${T('s66')}${companyName}${T('s67')}${currency} ${D.principal.toFixed(0)}${T('s68')}${(D.annualRate*100).toFixed(2)}${T('s69')}${D.years}${T('s70')}` },
                { title: T('s71'), content: `${T('s72')}${currency} ${D.totalPayment}${T('s73')}${currency} ${D.totalInterest}${T('s74')}${currency} ${D.totalPayments}${T('s75')}${D.actualPeriods}${T('s76')}${D.yearsSaved}${T('s70')}` },
                { title: T('s77'), content: D.extraPayment > 0 ? T('s78') : T('s79') },
                { title: T('s80'), content: T('s81') }
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
            const fileName = `${T('s82')}${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert(T('s83') + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== تصدير Word احترافي ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (!globalLoanData) { alert(T('s23')); return; }
        showLoading(T('s84'), T('s85'));
        try {
            const D = globalLoanData;
            const currency = D.currency;
            const companyName = D.companyName;
            const now = new Date();
            const dateStr = now.toLocaleDateString(FG.locale());

            const chartContainer = document.querySelector('.charts-container');
            let chartImgBase64 = '';
            if (chartContainer) {
                const origBg = chartContainer.style.backgroundColor;
                chartContainer.style.backgroundColor = '#ffffff';
                const img = await html2canvas(chartContainer, { scale: 2, backgroundColor: '#ffffff' });
                chartContainer.style.backgroundColor = origBg;
                chartImgBase64 = img.toDataURL('image/png');
            }

            let tableRows = '';
            D.schedule.forEach(r => {
                tableRows += `<tr><td>${r.period}</td><td>${currency} ${r.payment.toFixed(2)}</td><td>${currency} ${r.interest.toFixed(2)}</td><td>${currency} ${r.principalPaid.toFixed(2)}</td><td>${currency} ${r.balance.toFixed(2)}</td></tr>`;
            });

            const fullHtml = `${T('s86')}${companyName}${T('s87')}${dateStr}${T('s88')}${currency}${T('s89')}${currency} ${D.totalPayment}${T('s90')}${currency} ${D.principal.toFixed(0)}${T('s91')}${(D.annualRate*100).toFixed(2)}${T('s92')}${D.years}${T('s93')}${D.frequency===12?T('s37'):D.frequency===4?T('s38'):D.frequency===2?T('s39'):T('s40')}${T('s94')}${currency} ${D.downPayment}${T('s95')}${currency} ${D.extraPayment}${T('s96')}${currency} ${D.totalInterest}${T('s97')}${chartImgBase64}${T('s98')}${tableRows}${T('s99')}${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${T('s82')}${companyName}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert(T('s100') + err.message); } finally { hideLoading(); }
    });
