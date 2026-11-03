
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

    // ===== Shift management =====
    let shiftCount = 2;
    function renderShifts() {
        const container = document.getElementById('shiftsContainer');
        container.innerHTML = '';
        for (let i = 1; i <= shiftCount; i++) {
            const div = document.createElement('div');
            div.className = 'shift-row';
            div.innerHTML = `
                <input type="number" id="shiftEmployees${i}" placeholder="Number of employees" value="" min="0" step="1">
                <input type="number" id="shiftHours${i}" placeholder="Shift hours" value="" min="1" step="0.5">
                <span style="color:#cfa776;font-weight:700;">Shift ${i}</span>
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

    // ===== Main calculation =====
    let laborChart;
    let globalLaborData = null;

    document.getElementById('calculateBtn').addEventListener('click', function() {
        const currency = document.getElementById('currencySelect').value;
        const companyName = document.getElementById('companyName').value || 'Beneficiary Entity';

        const monthlySales = parseFloat(document.getElementById('monthlySales').value) || 0;
        const avgBill = parseFloat(document.getElementById('avgBill').value) || 1;
        const avgMonthlyWage = parseFloat(document.getElementById('avgMonthlyWage').value) || 0;
        const workingDays = parseInt(document.getElementById('workingDays').value) || 6;
        const targetPercent = parseFloat(document.getElementById('targetLaborPercent').value) || 25;
        const vacationType = document.getElementById('vacationDistribution').value;

        let totalEmployees = 0;
        let totalShiftHours = 0;
        const shiftsDetail = [];
        for (let i = 1; i <= shiftCount; i++) {
            const emp = parseInt(document.getElementById(`shiftEmployees${i}`)?.value) || 0;
            const hours = parseFloat(document.getElementById(`shiftHours${i}`)?.value) || 0;
            totalEmployees += emp;
            totalShiftHours += emp * hours;
            shiftsDetail.push({ shift: i, employees: emp, hours: hours });
        }

        if (totalEmployees === 0 || totalShiftHours === 0) {
            alert('Please enter the number of employees and working hours for each shift');
            return;
        }

        const weeksPerMonth = 4.33;
        const daysPerMonth = workingDays * weeksPerMonth;

        const monthlyLaborCost = totalEmployees * avgMonthlyWage;
        const laborPercent = monthlySales ? (monthlyLaborCost / monthlySales) * 100 : 0;

        const salesPerEmployee = totalEmployees ? monthlySales / totalEmployees : 0;
        const dailyLaborCost = daysPerMonth ? monthlyLaborCost / daysPerMonth : 0;
        const avgHoursPerEmployee = totalEmployees ? totalShiftHours / totalEmployees : 0;
        const expectedCustomers = monthlySales / avgBill;
        const customersPerEmployee = totalEmployees ? expectedCustomers / totalEmployees : 0;

        const idealMin = targetPercent - 5;
        const idealMax = targetPercent + 5;
        let alertClass = '', alertMessage = '';
        if (laborPercent < idealMin) {
            alertClass = 'alert-warning';
            alertMessage = `⚠️ Labor cost (${laborPercent.toFixed(1)}%) is below the target (${targetPercent}%). Staff may be insufficient to serve expected sales.`;
        } else if (laborPercent > idealMax) {
            alertClass = 'alert-danger';
            alertMessage = `🔴 Labor cost (${laborPercent.toFixed(1)}%) is above the ideal level (${targetPercent}%). This indicates wage waste.`;
        } else {
            alertClass = 'alert-success';
            alertMessage = `✅ Labor cost (${laborPercent.toFixed(1)}%) is within the ideal range (${idealMin}-${idealMax}%).`;
        }

        let efficiencyRating = '';
        if (laborPercent < 20) efficiencyRating = 'Excellent';
        else if (laborPercent <= 30) efficiencyRating = 'Good';
        else if (laborPercent <= 35) efficiencyRating = 'High';
        else efficiencyRating = 'Risk';

        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('initialMessage').style.display = 'none';

        document.getElementById('resultsGrid').innerHTML = `
            <div class="result-card"><i class="fas fa-user-friends"></i><div class="label">Total Employees</div><div class="value">${totalEmployees}</div><div class="unit">Employees</div></div>
            <div class="result-card"><i class="fas fa-money-bill-wave"></i><div class="label">Monthly Labor Cost</div><div class="value">${currency}${monthlyLaborCost.toLocaleString()}</div><div class="unit">Approx.</div></div>
            <div class="result-card"><i class="fas fa-percent"></i><div class="label">Labor Ratio</div><div class="value">${laborPercent.toFixed(1)}%</div><div class="unit">of sales</div></div>
            <div class="result-card"><i class="fas fa-chart-bar"></i><div class="label">Sales per Employee</div><div class="value">${currency}${salesPerEmployee.toFixed(0)}</div><div class="unit">Monthly</div></div>
            <div class="result-card"><i class="fas fa-sun"></i><div class="label">Daily Labor Cost</div><div class="value">${currency}${dailyLaborCost.toFixed(0)}</div><div class="unit">Per day</div></div>
            <div class="result-card"><i class="fas fa-hourglass-half"></i><div class="label">Avg Working Hours</div><div class="value">${avgHoursPerEmployee.toFixed(1)}</div><div class="unit">Hours/Employee/Day</div></div>
            <div class="result-card"><i class="fas fa-users"></i><div class="label">Expected Customers</div><div class="value">${Math.round(expectedCustomers)}</div><div class="unit">Customers/Month</div></div>
            <div class="result-card"><i class="fas fa-user-check"></i><div class="label">Customers per Employee</div><div class="value">${customersPerEmployee.toFixed(0)}</div><div class="unit">Customer/Employee</div></div>
            <div class="result-card"><i class="fas fa-tachometer-alt"></i><div class="label">Efficiency Indicator</div><div class="value">${efficiencyRating}</div><div class="unit">${laborPercent.toFixed(1)}%</div></div>
        `;

        document.getElementById('evaluationAlert').innerHTML = `<div class="alert ${alertClass}">${alertMessage}</div>`;

        let suggestions = '';
        if (laborPercent > idealMax) {
            suggestions += '<li>Reduce the number of employees during quiet periods (analyze peak times).</li>';
            suggestions += '<li>Combine some tasks or use multi-skilled employees.</li>';
            suggestions += '<li>Increase sales (marketing) to reduce the ratio without changing staff numbers.</li>';
        } else if (laborPercent < idealMin) {
            suggestions += '<li>You may need to increase staff to better serve customers.</li>';
            suggestions += '<li>Ensure the target sales are realistic and achievable.</li>';
        } else {
            suggestions += '<li>The current distribution is good. Continue monitoring performance.</li>';
        }

        if (vacationType === 'staggered') {
            suggestions += '<li>Staggered leaves ensure coverage without waste. It is recommended to continue this system.</li>';
        } else {
            suggestions += '<li>Unified leave system may cause coverage gaps on the day off. Consider implementing staggered leaves.</li>';
        }

        const shiftAnalysis = shiftsDetail.map(s => `Shift ${s.shift}: ${s.employees} employees, ${s.hours} hours.`).join('<br>');
        suggestions += '<br><strong>Current shift distribution:</strong><br>' + shiftAnalysis;

        document.getElementById('suggestions').innerHTML = `<h4><i class="fas fa-lightbulb"></i> Recommendations to reduce waste and improve efficiency</h4><ul>${suggestions}</ul>`;

        const ctx = document.getElementById('laborChart').getContext('2d');
        if (laborChart) laborChart.destroy();
        laborChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Monthly Sales', 'Labor Cost'],
                datasets: [{
                    label: `Value (${currency})`,
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
            targetPercent, vacationType: vacationType === 'staggered' ? 'Staggered leaves' : 'All employees same leave',
            totalEmployees, totalShiftHours, monthlyLaborCost, laborPercent,
            salesPerEmployee, dailyLaborCost, avgHoursPerEmployee,
            expectedCustomers, customersPerEmployee, efficiencyRating,
            alertMessage, suggestionsHtml: suggestions, shiftsDetail,
            idealMin, idealMax
        };
    });

    // ================================================================
    // ========== Export to Excel ==========
    // ================================================================
    document.getElementById('exportExcelBtn').addEventListener('click', async function() {
        if (!globalLaborData) { alert('Please run the analysis first.'); return; }
        showLoading('Generating Excel report...', 'Creating sheets and charts');
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
            mh(cv,1,4,4,`Labor Cost Analysis Report\n${companyName}`,DB,GL,18);
            const inf=[['📋 Entity',companyName],['📅 Date',new Date().toLocaleDateString('en-US')],['💰 Currency',currency],['📊 Labor Ratio',`${D.laborPercent.toFixed(1)}%`],['👥 Total Employees',D.totalEmployees]];
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
            mh(inputsSheet,2,4,2,'Basic Data',SB,'FFFFFFFF',11);
            inputsSheet.getRow(2).height=28;
            const inputFields = [
                ['Target Monthly Sales', D.monthlySales, `${currency} ${D.monthlySales.toFixed(0)}`],
                ['Average Bill per Customer', D.avgBill, `${currency} ${D.avgBill}`],
                ['Average Monthly Wage', D.avgMonthlyWage, `${currency} ${D.avgMonthlyWage}`],
                ['Working Days per Week', D.workingDays, ''],
                ['Target Labor Ratio', `${D.targetPercent}%`, ''],
                ['Number of Shifts', D.shiftsDetail.length, ''],
                ['Leave System', D.vacationType, '']
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

            // 3. Shift details
            const shiftsSheet = workbook.addWorksheet('Shift Details', { views: [{ showGridLines: false }] });
            shiftsSheet.getColumn(1).width=5; shiftsSheet.getColumn(2).width=20; shiftsSheet.getColumn(3).width=25; shiftsSheet.getColumn(4).width=25; shiftsSheet.getColumn(5).width=5;
            mh(shiftsSheet,1,5,1,'🕒 Shift Details',DB,GL,14);
            shiftsSheet.getRow(1).height=40;
            shiftsSheet.addRow(['Shift', 'Employees', 'Shift Hours', 'Total Working Hours']);
            D.shiftsDetail.forEach(s => { shiftsSheet.addRow([s.shift, s.employees, s.hours, s.employees * s.hours]); });
            const shiftHeader = shiftsSheet.getRow(2);
            shiftHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            shiftHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };

            // 4. KPIs
            const kpiSheet = workbook.addWorksheet('Key Performance Indicators', { views: [{ showGridLines: false }] });
            [5,32,22,22,22,5].forEach((w,i)=>kpiSheet.getColumn(i+1).width=w);
            mh(kpiSheet,1,6,1,'📊 KPI Dashboard',DB,GL,15);
            kpiSheet.getRow(1).height=45;
            mh(kpiSheet,2,5,2,`${companyName} | ${new Date().toLocaleDateString('en-US')}`,HB,'FFFFFFFF',10);
            kpiSheet.getRow(2).height=26;
            const kpis = [
                { label: 'Labor Ratio', value: `${D.laborPercent.toFixed(1)}%`, good: D.laborPercent >= D.idealMin && D.laborPercent <= D.idealMax },
                { label: 'Monthly Labor Cost', value: `${currency} ${D.monthlyLaborCost.toFixed(0)}`, good: true },
                { label: 'Sales per Employee', value: `${currency} ${D.salesPerEmployee.toFixed(0)}`, good: true },
                { label: 'Avg Working Hours', value: `${D.avgHoursPerEmployee.toFixed(1)} hrs`, good: true },
                { label: 'Customers per Employee', value: D.customersPerEmployee.toFixed(0), good: true }
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
            kFinal.value=D.laborPercent >= D.idealMin && D.laborPercent <= D.idealMax ? '✅ Ratio is within the ideal range' : '⚠️ Ratio is outside the ideal range';
            kFinal.font={name:'Arial',bold:true,size:13,color:{argb:D.laborPercent >= D.idealMin && D.laborPercent <= D.idealMax?PT:'856404'}};
            kFinal.fill={type:'pattern',pattern:'solid',fgColor:{argb:D.laborPercent >= D.idealMin && D.laborPercent <= D.idealMax?PB:GB}};
            kFinal.alignment={horizontal:'center',vertical:'middle'};
            kFinal.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};
            kpiSheet.getRow(kRow).height=40;

            // 5. Chart
            const chartsSheet = workbook.addWorksheet('Chart', { views: [{ showGridLines: false }] });
            chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
            mh(chartsSheet,1,3,1,'📈 Sales vs Labor Cost',DB,GL,14);
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

            // 6. Recommendations
            const recSheet = workbook.addWorksheet('Recommendations', { views: [{ showGridLines: false }] });
            recSheet.getColumn(1).width=5; recSheet.getColumn(2).width=50; recSheet.getColumn(3).width=5;
            mh(recSheet,1,3,1,'💡 Recommendations',DB,GL,14);
            recSheet.getRow(1).height=40;
            recSheet.getCell(3,2).value = D.suggestionsHtml.replace(/<[^>]*>/g, '\n').replace(/•/g, '-');
            recSheet.getCell(3,2).font = { name: 'Arial', size: 11 };
            recSheet.getCell(3,2).alignment = { wrapText: true };

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const now = new Date();
            const fileName = `Labor_${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert('Excel Error: ' + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== Export to Word ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (!globalLaborData) { alert('Please run the analysis first.'); return; }
        showLoading('Generating Word report...', 'Collecting data and charts');
        try {
            const D = globalLaborData;
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

            const fullHtml = `<!DOCTYPE html>
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
            <head><meta charset='utf-8'><title>Labor Cost Report - FAROUK GRUP</title>
            <style>
                body{font-family:'Arial',sans-serif;direction:ltr;margin:2rem;background:#fff;color:#333;}
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
                    <h1>FAROUK GRUP</h1>
                    <h2>Optimal Labor Cost Analysis Report</h2>
                    <p>Entity: ${companyName} | Date: ${dateStr}</p>
                    <p>Currency: ${currency} | Labor Ratio: ${D.laborPercent.toFixed(1)}%</p>
                </div>
                <h2 style="color:#b8860b;">Input Overview</h2>
                <table><tbody>
                    <tr><th>Monthly Sales</th><td>${currency} ${D.monthlySales}</td><th>Average Bill</th><td>${currency} ${D.avgBill}</td></tr>
                    <tr><th>Average Monthly Wage</th><td>${currency} ${D.avgMonthlyWage}</td><th>Working Days</th><td>${D.workingDays}</td></tr>
                    <tr><th>Target Labor Ratio</th><td>${D.targetPercent}%</td><th>Number of Shifts</th><td>${D.shiftsDetail.length}</td></tr>
                </tbody></table>
                <h2 style="color:#b8860b;">📊 Key Performance Indicators</h2>
                <table>${kpiRows}</table>
                <h2 style="color:#b8860b;">📈 Chart</h2>
                <div style="text-align:center;"><img src="${chartImgBase64}" class="chart-img" /></div>
                <h2 style="color:#b8860b;">💡 Recommendations</h2>
                <div style="background:#fefcf6;padding:15px;border-radius:10px;border-left:4px solid #b8860b;">
                    <ul>${D.suggestionsHtml}</ul>
                </div>
                <div class="footer">Generated by FAROUK GRUP © ${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Labor_${companyName}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert('Word Error: ' + err.message); } finally { hideLoading(); }
    });

    // ===== Initial setup =====
    renderShifts();
