
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

    // ===== إدارة الورديات =====
    let shiftCount = 2;
    function renderShifts() {
        const container = document.getElementById('shiftsContainer');
        container.innerHTML = '';
        for (let i = 1; i <= shiftCount; i++) {
            const div = document.createElement('div');
            div.className = 'shift-row';
            div.innerHTML = `
                <input type="number" id="shiftEmployees${i}${T('s2')}${i}${T('s3')}${i}</span>
                ${i > 1 ? `<button class="remove-shift" onclick="removeShift(${i})"><i class="fas fa-times"></i></button>` : ''}
            `;
            container.appendChild(div);
        }
    }
    window.removeShift = function(index) {
        shiftCount--;
        renderShifts();
    };
    document.getElementById('addShiftBtn').addEventListener('click', function() {
        shiftCount++;
        renderShifts();
    });
    document.getElementById('numShifts').addEventListener('change', function() {
        shiftCount = parseInt(this.value);
        renderShifts();
    });

    // ===== الحساب الرئيسي =====
    let laborChart;
    let globalLaborData = null;

    document.getElementById('calculateBtn').addEventListener('click', async function() {
        const currency = document.getElementById('currencySelect').value;
        const companyName = document.getElementById('companyName').value || T('s4');

        const monthlySales = parseFloat(document.getElementById('monthlySales').value) || 0;
        const avgBill = parseFloat(document.getElementById('avgBill').value) || 1;
        const avgMonthlyWage = parseFloat(document.getElementById('avgMonthlyWage').value) || 0;
        const workingDays = parseInt(document.getElementById('workingDays').value) || 6;
        const targetPercent = parseFloat(document.getElementById('targetLaborPercent').value) || 25;
        const vacationType = document.getElementById('vacationDistribution').value;

        const shiftsDetail = [];
        for (let i = 1; i <= shiftCount; i++) {
            const emp = parseInt(document.getElementById(`shiftEmployees${i}`)?.value) || 0;
            const hours = parseFloat(document.getElementById(`shiftHours${i}`)?.value) || 0;
            shiftsDetail.push({ shift: i, employees: emp, hours: hours });
        }
        let R;
        try { R = await FG.calc('tool13', 'main', { monthlySales, avgBill, avgMonthlyWage, workingDays, targetPercent, vacationType, shiftsDetail }); } catch (e) { FG.calcError(e); return; }
        if (R.invalid) {
            alert(T('s5'));
            return;
        }
        const { totalEmployees, totalShiftHours, monthlyLaborCost, laborPercent, salesPerEmployee, dailyLaborCost, avgHoursPerEmployee, expectedCustomers, customersPerEmployee, idealMin, idealMax, alertClass, alertMessage, efficiencyRating } = R;

        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('initialMessage').style.display = 'none';

        document.getElementById('resultsGrid').innerHTML = `${T('s18')}${totalEmployees}${T('s19')}${currency}${monthlyLaborCost.toLocaleString()}${T('s20')}${laborPercent.toFixed(1)}${T('s21')}${currency}${salesPerEmployee.toFixed(0)}${T('s22')}${currency}${dailyLaborCost.toFixed(0)}${T('s23')}${avgHoursPerEmployee.toFixed(1)}${T('s24')}${Math.round(expectedCustomers)}${T('s25')}${customersPerEmployee.toFixed(0)}${T('s26')}${efficiencyRating}</div><div class="unit">${laborPercent.toFixed(1)}%</div></div>
        `;

        document.getElementById('evaluationAlert').innerHTML = `<div class="alert ${alertClass}">${alertMessage}</div>`;

        let suggestions = R.suggestions;

        document.getElementById('suggestions').innerHTML = `${T('s39')}${suggestions}</ul>`;

        const ctx = document.getElementById('laborChart').getContext('2d');
        if (laborChart) laborChart.destroy();
        laborChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: [T('s40'), T('s41')],
                datasets: [{
                    label: `${T('s42')}${currency})`,
                    data: [monthlySales, monthlyLaborCost],
                    backgroundColor: ['#28a745', '#b8860b']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, ticks: { color: '#aab7d4' } },
                    x: { ticks: { color: '#aab7d4' } }
                },
                plugins: {
                    legend: { labels: { color: '#cfa776' } }
                }
            }
        });

        globalLaborData = {
            currency, companyName,
            monthlySales, avgBill, avgMonthlyWage, workingDays,
            targetPercent, vacationType: vacationType === 'staggered' ? T('s43') : T('s44'),
            totalEmployees, totalShiftHours, monthlyLaborCost, laborPercent,
            salesPerEmployee, dailyLaborCost, avgHoursPerEmployee,
            expectedCustomers, customersPerEmployee, efficiencyRating,
            alertMessage, suggestionsHtml: suggestions, shiftsDetail,
            idealMin, idealMax
        };
    });

    // ================================================================
    // ========== تصدير Excel احترافي ==========
    // ================================================================
    document.getElementById('exportExcelBtn').addEventListener('click', async function() {
        if (!globalLaborData) { alert(T('s45')); return; }
        showLoading(T('s46'), T('s47'));
        try {
            const D = globalLaborData;
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
            const cv = workbook.addWorksheet(T('s48'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
            cv.getRow(2).height=80; cv.getRow(4).height=60;
            cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1);
            bc.value=T('s49');
            bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};
            mh(cv,1,4,4,`${T('s50')}${companyName}`,DB,GL,18);
            const inf=[[T('s51'),companyName],[T('s52'),new Date().toLocaleDateString(FG.locale())],[T('s53'),currency],[T('s54'),`${D.laborPercent.toFixed(1)}%`],[T('s55'),D.totalEmployees]];
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
            const inputsSheet = workbook.addWorksheet(T('s56'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            inputsSheet.getColumn(1).width=5; inputsSheet.getColumn(2).width=38; inputsSheet.getColumn(3).width=22; inputsSheet.getColumn(4).width=22; inputsSheet.getColumn(5).width=5;
            mh(inputsSheet,1,5,1,T('s57'),DB,GL,14);
            inputsSheet.getRow(1).height=40;
            mh(inputsSheet,2,4,2,T('s58'),SB,'FFFFFFFF',11);
            inputsSheet.getRow(2).height=28;
            const inputFields = [
                [T('s59'), D.monthlySales, `${currency} ${D.monthlySales.toFixed(0)}`],
                [T('s60'), D.avgBill, `${currency} ${D.avgBill}`],
                [T('s61'), D.avgMonthlyWage, `${currency} ${D.avgMonthlyWage}`],
                [T('s62'), D.workingDays, ''],
                [T('s63'), `${D.targetPercent}%`, ''],
                [T('s64'), D.shiftsDetail.length, ''],
                [T('s65'), D.vacationType, '']
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

            // 3. تفاصيل الورديات
            const shiftsSheet = workbook.addWorksheet(T('s66'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            shiftsSheet.getColumn(1).width=5; shiftsSheet.getColumn(2).width=20; shiftsSheet.getColumn(3).width=25; shiftsSheet.getColumn(4).width=25; shiftsSheet.getColumn(5).width=5;
            mh(shiftsSheet,1,5,1,T('s67'),DB,GL,14);
            shiftsSheet.getRow(1).height=40;
            shiftsSheet.addRow([T('s68'), T('s69'), T('s70'), T('s71')]);
            D.shiftsDetail.forEach(s => { shiftsSheet.addRow([s.shift, s.employees, s.hours, s.employees * s.hours]); });
            const shiftHeader = shiftsSheet.getRow(2);
            shiftHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            shiftHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };

            // 4. مؤشرات الأداء
            const kpiSheet = workbook.addWorksheet(T('s72'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            [5,32,22,22,22,5].forEach((w,i)=>kpiSheet.getColumn(i+1).width=w);
            mh(kpiSheet,1,6,1,T('s73'),DB,GL,15);
            kpiSheet.getRow(1).height=45;
            mh(kpiSheet,2,5,2,`${companyName} | ${new Date().toLocaleDateString(FG.locale())}`,HB,'FFFFFFFF',10);
            kpiSheet.getRow(2).height=26;
            const kpis = [
                { label: T('s74'), value: `${D.laborPercent.toFixed(1)}%`, good: D.laborPercent >= D.idealMin && D.laborPercent <= D.idealMax },
                { label: T('s75'), value: `${currency} ${D.monthlyLaborCost.toFixed(0)}`, good: true },
                { label: T('s76'), value: `${currency} ${D.salesPerEmployee.toFixed(0)}`, good: true },
                { label: T('s77'), value: `${D.avgHoursPerEmployee.toFixed(1)}${T('s78')}`, good: true },
                { label: T('s79'), value: D.customersPerEmployee.toFixed(0), good: true }
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
            kFinal.value=D.laborPercent >= D.idealMin && D.laborPercent <= D.idealMax ? T('s80') : T('s81');
            kFinal.font={name:'Arial',bold:true,size:13,color:{argb:D.laborPercent >= D.idealMin && D.laborPercent <= D.idealMax?PT:'856404'}};
            kFinal.fill={type:'pattern',pattern:'solid',fgColor:{argb:D.laborPercent >= D.idealMin && D.laborPercent <= D.idealMax?PB:GB}};
            kFinal.alignment={horizontal:'center',vertical:'middle',readingOrder:FG.dir()};
            kFinal.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};
            kpiSheet.getRow(kRow).height=40;

            // 5. الرسم البياني
            const chartsSheet = workbook.addWorksheet(T('s82'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
            mh(chartsSheet,1,3,1,T('s83'),DB,GL,14);
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

            // 6. التوصيات
            const recSheet = workbook.addWorksheet(T('s84'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            recSheet.getColumn(1).width=5; recSheet.getColumn(2).width=50; recSheet.getColumn(3).width=5;
            mh(recSheet,1,3,1,T('s85'),DB,GL,14);
            recSheet.getRow(1).height=40;
            recSheet.getCell(3,2).value = D.suggestionsHtml.replace(/<[^>]*>/g, '\n').replace(/•/g, '-');
            recSheet.getCell(3,2).font = { name: 'Arial', size: 11 };
            recSheet.getCell(3,2).alignment = { wrapText: true, readingOrder: FG.dir() };

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const now = new Date();
            const fileName = `${T('s86')}${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert(T('s87') + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== تصدير Word احترافي ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (!globalLaborData) { alert(T('s45')); return; }
        showLoading(T('s88'), T('s89'));
        try {
            const D = globalLaborData;
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

            const kpiCards = document.querySelectorAll('.result-card');
            let kpiRows = ''; let row = ''; let count = 0;
            kpiCards.forEach((card, index) => {
                const icon = card.querySelector('i') ? card.querySelector('i').outerHTML : '';
                const label = card.querySelector('.label') ? card.querySelector('.label').innerText : '';
                const value = card.querySelector('.value') ? card.querySelector('.value').innerText : '';
                const unit = card.querySelector('.unit') ? card.querySelector('.unit').innerText : '';
                const cell = `<td style="border:1px solid #b8860b; padding:12px; text-align:center; background:#fefcf6;">${icon}<div style="font-weight:700; color:#666;">${label}</div><div style="font-size:1.5rem; font-weight:900; color:#b8860b;">${value}</div><div style="font-size:0.85rem; color:#777;">${unit}</div></td>`;
                row += cell; count++;
                if (count % 2 === 0 || index === kpiCards.length - 1) { kpiRows += `<tr>${row}</tr>`; row = ''; }
            });

            const fullHtml = `${T('s90')}${companyName}${T('s91')}${dateStr}${T('s92')}${currency}${T('s93')}${D.laborPercent.toFixed(1)}${T('s94')}${currency} ${D.monthlySales}${T('s95')}${currency} ${D.avgBill}${T('s96')}${currency} ${D.avgMonthlyWage}${T('s97')}${D.workingDays}${T('s98')}${D.targetPercent}${T('s99')}${D.shiftsDetail.length}${T('s100')}${kpiRows}${T('s101')}${chartImgBase64}${T('s102')}${D.suggestionsHtml}${T('s103')}${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${T('s86')}${companyName}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert(T('s104') + err.message); } finally { hideLoading(); }
    });

    // ===== تهيئة أولية =====
    renderShifts();
