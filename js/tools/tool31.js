
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

    // ===== Loading =====
    function showLoading(title, msg) {
        document.getElementById('loadingTitle').textContent = title;
        document.getElementById('loadingMsg').textContent = msg;
        document.getElementById('exportLoading').classList.add('show');
    }
    function hideLoading() { document.getElementById('exportLoading').classList.remove('show'); }

    // ===== Main Calculation =====
    let cashChart;
    let globalData = null;

    document.getElementById('calculateBtn').addEventListener('click', async function() {
        const currency = document.getElementById('currencySelect').value;
        const companyName = document.getElementById('companyName').value || T('s2');
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

        let R;
        try { R = await FG.calc('tool31', 'main', { openingCash, minCash, cashSales, cardSales, arCollection, inflowGrowth, otherInflows, supplierPay, weeklySalaries, weeklyRent, weeklyUtilities, weeklyTaxes, weeklyLoan, otherOutflows, outflowGrowth }); } catch (e) { FG.calcError(e); return; }
        const { weeks, rows, totalInflows, totalOutflows, minBalance, deficitWeeks, warningWeeks } = R;
        const balance = R.finalBalance;

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

        const finalStatus = balance < 0 ? T('s4') : (balance < minCash ? T('s5') : T('s3'));
        const finalClass = balance < 0 ? 'status-bad' : (balance < minCash ? 'status-warning' : 'status-good');

        document.getElementById('kpiCards').innerHTML = `${T('s6')}${currency} ${openingCash.toLocaleString()}${T('s7')}${currency} ${totalInflows.toFixed(0)}${T('s8')}${currency} ${totalOutflows.toFixed(0)}${T('s9')}${totalInflows-totalOutflows >= 0 ? '#4ade80' : '#f87171'};">${currency} ${(totalInflows-totalOutflows).toFixed(0)}${T('s10')}${currency} ${balance.toFixed(0)}</div><div class="status ${finalClass}">${finalStatus}${T('s11')}${minBalance < 0 ? '#f87171' : (minBalance < minCash ? '#fbbf24' : '#4ade80')};">${currency} ${minBalance.toFixed(0)}${T('s12')}${deficitWeeks > 0 ? '#f87171' : '#4ade80'};">${deficitWeeks}${T('s13')}`;

        let alertsHtml = '';
        if (deficitWeeks > 0) {
            alertsHtml += `${T('s14')}${deficitWeeks}${T('s15')}`;
        }
        if (warningWeeks > 0) {
            alertsHtml += `${T('s16')}${warningWeeks}${T('s17')}${currency} ${minCash.toLocaleString()}${T('s18')}`;
        }
        if (deficitWeeks === 0 && warningWeeks === 0) {
            alertsHtml += `${T('s19')}`;
        }
        document.getElementById('alertsBox').innerHTML = alertsHtml;

        // Chart
        const ctx = document.getElementById('cashChart').getContext('2d');
        if (cashChart) cashChart.destroy();
        const labels = rows.map(r => T('s20') + r.week);
        const endingBalances = rows.map(r => r.ending);
        const pointColors = endingBalances.map(v => v < 0 ? '#dc3545' : (v < minCash ? '#ffc107' : '#28a745'));
        const minLine = rows.map(() => minCash);
        const zeroLine = rows.map(() => 0);

        cashChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: T('s21'),
                        data: endingBalances,
                        borderColor: '#b8860b',
                        backgroundColor: 'rgba(184,134,11,0.1)',
                        tension: 0.15,
                        fill: true,
                        pointBackgroundColor: pointColors,
                        pointBorderColor: pointColors,
                        pointRadius: 6,
                        pointHoverRadius: 8
                    },
                    {
                        label: T('s22'),
                        data: minLine,
                        borderColor: '#ffc107',
                        borderDash: [6, 6],
                        pointRadius: 0,
                        fill: false
                    },
                    {
                        label: T('s23'),
                        data: zeroLine,
                        borderColor: '#dc3545',
                        borderDash: [3, 3],
                        pointRadius: 0,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: { color: '#aab7d4' },
                        grid: { color: 'rgba(180,133,84,0.15)' }
                    },
                    x: { ticks: { color: '#aab7d4' } }
                },
                plugins: {
                    legend: { labels: { color: '#f0f4fa' } },
                    tooltip: {
                        callbacks: {
                            label: (context) => `${context.dataset.label}: ${currency} ${context.raw.toFixed(0)}`
                        }
                    }
                }
            }
        });

        // Table
        let html = '<table><thead><tr>' +
            T('s24') +
            T('s25') +
            T('s26') +
            T('s27') +
            T('s28') +
            T('s29') +
            T('s30') +
            T('s31') +
            T('s32') +
            T('s33') +
            T('s34') +
            T('s35') +
            T('s36') +
            T('s37') +
            T('s38') +
            T('s39') +
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

    // ================================================================
    // ========== تصدير Excel ==========
    // ================================================================
    document.getElementById('exportExcelBtn').addEventListener('click', async function() {
        if (!globalData) { alert(T('s40')); return; }
        showLoading(T('s41'), T('s42'));
        try {
            const D = globalData;
            const currency = D.currency;
            const companyName = D.companyName;
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'FAROUK GRUP';
            const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050';
            const AR = 'FFF5F0E8', DT = 'FF1A1A1A', PB = 'FFD4EDDA', NB = 'FFF8D7DA', GB = 'FFFFF3CD';
            const PT = 'FF155724', NT = 'FF721C24';

            function ap(c,s){if(s.font)c.font=s.font;if(s.fill)c.fill=s.fill;if(s.alignment)c.alignment=s.alignment;if(s.border)c.border=s.border;if(s.numFmt)c.numFmt=s.numFmt;}
            function cs(bg='FFFFFFFF',tc=DT,b=false,h='center'){return{font:{name:'Arial',bold:b,size:10,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:h,vertical:'middle',wrapText:true,readingOrder:FG.dir()},border:{top:{style:'hair',color:{argb:'FFCCCCCC'}},bottom:{style:'hair',color:{argb:'FFCCCCCC'}},left:{style:'hair',color:{argb:'FFCCCCCC'}},right:{style:'hair',color:{argb:'FFCCCCCC'}}}};}
            function mh(ws,fc,tc,r,text,bg=HB,tc2=GL,fs=12){ws.mergeCells(r,fc,r,tc);const c=ws.getCell(r,fc);c.value=text;c.font={name:'Arial',bold:true,size:fs,color:{argb:tc2}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};c.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};}

            // Cover
            const cv = workbook.addWorksheet(T('s43'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
            cv.getRow(2).height=80; cv.getRow(4).height=60;
            cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1);
            bc.value=T('s44');
            bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};
            mh(cv,1,4,4,`${T('s45')}${companyName}`,DB,GL,18);
            const inf=[[T('s46'),companyName],[T('s47'),new Date().toLocaleDateString(FG.locale())],[T('s48'),currency],[T('s49'),`${currency} ${D.openingCash}`],[T('s50'),`${currency} ${D.finalBalance.toFixed(0)}`]];
            let ir=6;
            inf.forEach(([l,v],idx)=>{
                cv.mergeCells(ir,1,ir,2); cv.mergeCells(ir,3,ir,4);
                const lc=cv.getCell(ir,1), vc=cv.getCell(ir,3); lc.value=l; vc.value=v;
                const bg=idx%2===0?AR:'FFFEFCF6';
                ap(lc,{font:{name:'Arial',bold:true,size:11,color:{argb:'00695C'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'right',vertical:'middle',readingOrder:FG.dir()},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                ap(vc,{font:{name:'Arial',size:11,color:{argb:DT}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',readingOrder:FG.dir()},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                cv.getRow(ir).height=28; ir++;
            });
            const vr=ir+1, isGood=D.deficitWeeks===0 && D.warningWeeks===0;
            cv.mergeCells(vr,1,vr,4); const vc2=cv.getCell(vr,1);
            vc2.value=isGood?T('s51'):T('s52');
            vc2.font={name:'Arial',bold:true,size:14,color:{argb:isGood?PT:'856404'}};
            vc2.fill={type:'pattern',pattern:'solid',fgColor:{argb:isGood?PB:GB}};
            vc2.alignment={horizontal:'center',vertical:'middle',readingOrder:FG.dir()};
            vc2.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};
            cv.getRow(vr).height=40;

            // Detailed table
            const ts = workbook.addWorksheet(T('s53'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            ts.getColumn(1).width=10; ts.getColumn(2).width=15; ts.getColumn(3).width=15; ts.getColumn(4).width=15; ts.getColumn(5).width=15; ts.getColumn(6).width=15; ts.getColumn(7).width=15; ts.getColumn(8).width=15; ts.getColumn(9).width=15; ts.getColumn(10).width=15; ts.getColumn(11).width=15; ts.getColumn(12).width=15; ts.getColumn(13).width=15; ts.getColumn(14).width=15; ts.getColumn(15).width=15;
            mh(ts,1,15,1,T('s54'),DB,GL,14);
            ts.getRow(1).height=40;
            const headerArr = [T('s55'),T('s56'),T('s57'),T('s58'),T('s59'),T('s60'),T('s61'),T('s62'),T('s63'),T('s64'),T('s65'),T('s66'),T('s67'),T('s68'),T('s69')];
            ts.addRow(headerArr);
            const hRow = ts.getRow(2);
            hRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            hRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
            hRow.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: FG.dir() };
            D.rows.forEach(r => {
                ts.addRow([r.week, r.beginning, r.sales, r.cards, r.ar, r.inflows, r.sup, r.sal, r.rent, r.util, r.tax, r.loan, r.outflows, r.net, r.ending]);
            });

            // Chart image
            const chartsSheet = workbook.addWorksheet(T('s70'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
            mh(chartsSheet,1,3,1,T('s71'),DB,GL,14);
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
            saveAs(blob, `${T('s72')}${companyName}_${now.toISOString().slice(0,10)}.xlsx`);
        } catch(err) { alert(T('s73') + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== تصدير Word ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (!globalData) { alert(T('s40')); return; }
        showLoading(T('s74'), T('s75'));
        try {
            const D = globalData;
            const currency = D.currency;
            const companyName = D.companyName;
            const now = new Date();
            const dateStr = now.toLocaleDateString(FG.locale());

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

            const fullHtml = `${T('s76')}${companyName}${T('s77')}${dateStr}${T('s78')}${currency}${T('s79')}${currency} ${D.openingCash}${T('s80')}${currency} ${D.openingCash.toLocaleString()}${T('s81')}${currency} ${D.totalInflows.toFixed(0)}${T('s82')}${currency} ${D.totalOutflows.toFixed(0)}${T('s83')}${currency} ${(D.totalInflows-D.totalOutflows).toFixed(0)}${T('s84')}${currency} ${D.finalBalance.toFixed(0)}${T('s85')}${currency} ${D.minBalance.toFixed(0)}${T('s86')}${D.deficitWeeks}${T('s87')}${D.warningWeeks}${T('s88')}${chartImg}${T('s89')}${tableRows}${T('s90')}${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${T('s72')}${companyName}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert(T('s91') + err.message); } finally { hideLoading(); }
    });
