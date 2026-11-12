
    AOS.init({ duration: 800, once: true, offset: 100 });

    // ===== آلة حاسبة =====
    const calcDisplay = document.getElementById('calcDisplay');
    let currentCalcInput = '';

    function handleCalc(v) {
        if (v === 'C') { currentCalcInput = ''; calcDisplay.value = ''; return; }
        if (v === '⌫') { currentCalcInput = currentCalcInput.slice(0, -1); calcDisplay.value = currentCalcInput; return; }
        if (v === '=') {
            try {
                let r = eval(currentCalcInput.replace(/×/g, '*').replace(/÷/g, '/'));
                calcDisplay.value = r;
                currentCalcInput = r.toString();
            } catch (e) { calcDisplay.value = T('s1'); currentCalcInput = ''; }
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

    // ===== ربط شريط التمرير مع حقل الإشغال =====
    const occupancyRange = document.getElementById('occupancyRange');
    const occupancyInput = document.getElementById('occupancy');
    occupancyRange.addEventListener('input', function() {
        occupancyInput.value = (this.value / 100).toFixed(2);
    });
    occupancyInput.addEventListener('input', function() {
        let val = parseFloat(this.value) || 0;
        if (val > 1) val = 1;
        if (val < 0) val = 0;
        occupancyRange.value = val * 100;
    });

    // ===== تخزين القيم الأصلية =====
    let originalInputs = {};

    function saveOriginalInputs() {
        originalInputs = {
            rent: document.getElementById('rent').value,
            occupancy: document.getElementById('occupancy').value,
            rentIncrease: document.getElementById('rentIncrease').value,
            discountRate: document.getElementById('discountRate').value,
            landAppreciation: document.getElementById('landAppreciation').value,
            ltv: document.getElementById('ltv').value,
            interestRate: document.getElementById('interestRate').value,
            loanTerm: document.getElementById('loanTerm').value
        };
    }

    function restoreOriginalInputs() {
        document.getElementById('rent').value = originalInputs.rent;
        document.getElementById('occupancy').value = originalInputs.occupancy;
        document.getElementById('rentIncrease').value = originalInputs.rentIncrease;
        document.getElementById('discountRate').value = originalInputs.discountRate;
        document.getElementById('landAppreciation').value = originalInputs.landAppreciation;
        document.getElementById('ltv').value = originalInputs.ltv;
        document.getElementById('interestRate').value = originalInputs.interestRate;
        document.getElementById('loanTerm').value = originalInputs.loanTerm;
        occupancyRange.value = originalInputs.occupancy * 100;
        calculateAll();
    }

    // ===== الحساب الرئيسي =====
    let myCashChart;

    async function calculateAll() {
        const currency = document.getElementById('currencySelect').value;
        const companyName = document.getElementById('companyName').value || T('s2');

        // قراءة المدخلات
        const marketValue = parseFloat(document.getElementById('marketValue').value) || 0;
        const units = parseFloat(document.getElementById('units').value) || 1;
        const rentPerUnit = parseFloat(document.getElementById('rent').value) || 0;
        const monthlyExpenses = parseFloat(document.getElementById('monthlyExpenses').value) || 0;
        const occupancy = parseFloat(document.getElementById('occupancy').value) || 1;
        const taxRatePercent = parseFloat(document.getElementById('taxRate').value) || 0;
        const assessedDiscountPercent = parseFloat(document.getElementById('assessedDiscount').value) || 0;
        const rentIncreasePercent = parseFloat(document.getElementById('rentIncrease').value) || 0;
        const landAppreciationPercent = parseFloat(document.getElementById('landAppreciation').value) || 0;
        const purchaseCosts = parseFloat(document.getElementById('purchaseCosts').value) || 0;
        const ltvPercent = parseFloat(document.getElementById('ltv').value) || 0;
        const interestRatePercent = parseFloat(document.getElementById('interestRate').value) || 0;
        const loanTerm = parseInt(document.getElementById('loanTerm').value) || 20;
        const discountRatePercent = parseFloat(document.getElementById('discountRate').value) || 0;
        const reinvestRatePercent = parseFloat(document.getElementById('reinvestRate').value) || 0;
        const years = parseInt(document.getElementById('years').value) || 20;

        // تحويل النسب
        let R;
        try { R = await FG.calc('tool5', 'main', { marketValue, units, rentPerUnit, monthlyExpenses, occupancy, taxRatePercent, assessedDiscountPercent, rentIncreasePercent, landAppreciationPercent, purchaseCosts, ltvPercent, interestRatePercent, loanTerm, discountRatePercent, reinvestRatePercent, years }); } catch (e) { FG.calcError(e); return; }
        let { taxRate, assessedDiscount, rentIncrease, landAppreciation, discountRate, reinvestRate, ltv, interestRate, totalInvestment, loanAmount, annualDebtService, equity, assessedValue, annualRentBase, annualExpenses, noiBeforeDebt, cashFlows, terminalValue, remainingLoan, netTerminalValue, npv, irr, mirr, cumulative, paybackYear, fractional, paybackPeriod, pvFuture, pi, cashOnCash, totalProfit, roi, score, ratingText, ratingClass, ratingIcon } = R;

        // عرض النتائج
        document.getElementById('initialMessage').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';

        document.getElementById('kpiCards').innerHTML = `${T('s13')}${currency} ${npv.toFixed(0)}</div><div class="unit">${npv > 0 ? T('s3') : npv < 0 ? T('s4') : T('s5')}${T('s14')}${(irr*100).toFixed(2)}%</div><div class="unit">${irr > discountRate ? T('s6') : irr < discountRate ? T('s7') : T('s8')}${T('s15')}${(mirr*100).toFixed(2)}${T('s16')}${reinvestRatePercent}${T('s17')}${paybackPeriod !== null ? paybackPeriod.toFixed(1) : T('s9')}${T('s18')}${pi.toFixed(2)}</div><div class="unit">${pi > 1 ? T('s3') : pi < 1 ? T('s10') : T('s5')}${T('s19')}${cashOnCash.toFixed(2)}${T('s20')}${roi.toFixed(2)}${T('s21')}${ltv > 0 ? `${T('s11')}${(ltv*100).toFixed(0)}${T('s12')}${currency} ${loanAmount.toFixed(0)}</div></div>` : ''}
        `;

        // تقييم المشروع
        document.getElementById('projectRating').innerHTML = `${T('s25')}${score}/100</div>
            <div class="status ${ratingClass}" style="font-size:1.2rem; margin-top:0.5rem;">${ratingIcon} ${ratingText}</div>
        `;

        // جدول التدفقات
        let tableHtml = T('s26') + currency + T('s27') + currency + ')</th></tr></thead><tbody>';
        let cum = 0;
        for (let i = 0; i <= years; i++) {
            cum += cashFlows[i];
            const yearLabel = (i === 0) ? T('s28') : i;
            tableHtml += `<tr><td>${yearLabel}</td><td class="${cashFlows[i] < 0 ? 'negative' : 'positive'}">${currency} ${cashFlows[i].toFixed(0)}</td><td class="${cum < 0 ? 'negative' : 'positive'}">${currency} ${cum.toFixed(0)}</td></tr>`;
        }
        tableHtml += '</tbody></table>';
        document.getElementById('cashFlowTable').innerHTML = tableHtml;

        // ملخص فترة الاسترداد
        const paybackSummary = document.getElementById('paybackSummary');
        if (paybackPeriod !== null) {
            paybackSummary.innerHTML = `${T('s29')}${paybackPeriod.toFixed(1)}${T('s30')}${currency} ${cum.toFixed(0)}</span>
                </div>
            `;
        } else {
            paybackSummary.innerHTML = `${T('s31')}`;
        }

        // الرسم البياني
        const ctx = document.getElementById('cashChart').getContext('2d');
        if (myCashChart) myCashChart.destroy();
        const labels = [];
        const cfData = [];
        const cumData = [];
        let cum2 = 0;
        for (let i = 0; i <= years; i++) {
            labels.push(i === 0 ? '0' : i.toString());
            cfData.push(cashFlows[i]);
            cum2 += cashFlows[i];
            cumData.push(cum2);
        }
        myCashChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    { label: T('s32'), data: cfData, borderColor: '#4ade80', backgroundColor: 'rgba(74,222,128,0.1)', tension: 0.1, yAxisID: 'y' },
                    { label: T('s33'), data: cumData, borderColor: '#b8860b', backgroundColor: 'rgba(184,134,11,0.1)', tension: 0.1, yAxisID: 'y1' }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: {
                    y: { type: 'linear', display: true, position: 'right', title: { display: true, text: T('s34'), color: '#aab7d4' }, grid: { color: 'rgba(180,133,84,0.1)' }, ticks: { color: '#aab7d4' } },
                    y1: { type: 'linear', display: true, position: 'left', title: { display: true, text: T('s33'), color: '#aab7d4' }, grid: { color: 'rgba(180,133,84,0.1)' }, ticks: { color: '#aab7d4' } }
                },
                plugins: { legend: { labels: { color: '#f0f4fa' } } }
            }
        });

        // تحليل الحساسية (جدول سريع)
        const sensTable = document.getElementById('sensitivityTable');
        sensTable.innerHTML = `${T('s35')}${currency}${T('s36')}${npv.toFixed(0)}</td><td>${(irr*100).toFixed(2)}</td><td>${pi.toFixed(2)}</td></tr>
                </tbody>
            </table>
        `;

        // حفظ النتائج للتصدير
        window.lastRealEstateResults = {
            inputs: {
                currency, companyName,
                marketValue, units, rentPerUnit, monthlyExpenses, occupancy, taxRatePercent,
                assessedDiscountPercent, rentIncreasePercent, landAppreciationPercent, purchaseCosts,
                ltvPercent, interestRatePercent, loanTerm, discountRatePercent, reinvestRatePercent, years
            },
            outputs: {
                npv, irr, mirr, paybackPeriod, pi, cashOnCash, roi, score, ratingText, ratingClass,
                cashFlows, cumulative: cum, terminalValue, loanAmount, equity, annualDebtService,
                years, discountRate, reinvestRate, ltv, annualRentBase, annualExpenses
            }
        };
    }

    // ===== أزرار الحساسية =====
    document.getElementById('sens10').addEventListener('click', function() {
        const rent = document.getElementById('rent');
        rent.value = (parseFloat(rent.value) * 1.1).toFixed(0);
        calculateAll();
    });
    document.getElementById('sens-10').addEventListener('click', function() {
        const rent = document.getElementById('rent');
        rent.value = (parseFloat(rent.value) * 0.9).toFixed(0);
        calculateAll();
    });
    document.getElementById('sensOcc10').addEventListener('click', function() {
        const occ = document.getElementById('occupancy');
        occ.value = Math.min(1, (parseFloat(occ.value) + 0.1)).toFixed(2);
        occupancyRange.value = occ.value * 100;
        calculateAll();
    });
    document.getElementById('sensOcc-10').addEventListener('click', function() {
        const occ = document.getElementById('occupancy');
        occ.value = Math.max(0, (parseFloat(occ.value) - 0.1)).toFixed(2);
        occupancyRange.value = occ.value * 100;
        calculateAll();
    });
    document.getElementById('resetSens').addEventListener('click', function() {
        restoreOriginalInputs();
    });

    document.getElementById('calculateBtn').addEventListener('click', function() {
        saveOriginalInputs();
        calculateAll();
    });

    // ================================================================
    // ========== تصدير Word احترافي ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (document.getElementById('resultsSection').style.display === 'none') {
            alert(T('s37'));
            return;
        }
        showLoading(T('s38'), T('s39'));
        try {
            const data = window.lastRealEstateResults;
            if (!data) { alert(T('s37')); hideLoading(); return; }
            const inp = data.inputs;
            const out = data.outputs;
            const currency = inp.currency;
            const companyName = inp.companyName;

            // صورة الرسم البياني
            const canvas = document.getElementById('cashChart');
            canvas.style.backgroundColor = '#ffffff';
            const imgData = await html2canvas(canvas, { scale: 2, backgroundColor: '#ffffff' });
            canvas.style.backgroundColor = '';
            const chartImg = imgData.toDataURL('image/png');

            // بطاقات KPI
            const kpiCards = document.querySelectorAll('.result-card');
            let kpiRows = ''; let row = ''; let count = 0;
            kpiCards.forEach((card, idx) => {
                const icon = card.querySelector('i') ? card.querySelector('i').outerHTML : '';
                const title = card.querySelector('h4') ? card.querySelector('h4').innerText : '';
                const value = card.querySelector('.value') ? card.querySelector('.value').innerText : '';
                const unit = card.querySelector('.unit') ? card.querySelector('.unit').innerText : '';
                const status = card.querySelector('.status') ? card.querySelector('.status').outerHTML : '';
                const cell = `<td style="border:1px solid #b8860b; padding:12px; text-align:center; background:#fefcf6;">${icon}<h4 style="margin:0.5rem 0; color:#666;">${title}</h4><div style="font-size:1.6rem; font-weight:900; color:#b8860b;">${value}</div>${unit ? `<div style="font-size:0.9rem; color:#777;">${unit}</div>` : ''}${status ? status.replace(/class="status/g, 'style="margin-top:0.3rem; padding:0.2rem 0.6rem; border-radius:20px; display:inline-block;') : ''}</td>`;
                row += cell; count++;
                if (count % 2 === 0 || idx === kpiCards.length - 1) { kpiRows += `<tr>${row}</tr>`; row = ''; }
            });

            const ratingHTML = document.getElementById('projectRating').innerHTML;
            const tableHTML = document.getElementById('cashFlowTable').innerHTML;
            const paybackHTML = document.getElementById('paybackSummary').innerHTML;
            const sensHTML = document.getElementById('sensitivityTable').innerHTML;
            const now = new Date();
            const dateStr = now.toLocaleDateString(FG.locale(), { year: 'numeric', month: 'long', day: 'numeric' });

            const fullHtml = `${T('s44')}${companyName}${T('s45')}${dateStr}${T('s46')}${currency}${T('s47')}${currency} ${inp.marketValue}${T('s48')}${inp.units}${T('s49')}${currency} ${inp.rentPerUnit}${T('s50')}${currency} ${inp.monthlyExpenses}${T('s51')}${(inp.occupancy*100).toFixed(0)}${T('s52')}${inp.taxRatePercent}${T('s53')}${inp.assessedDiscountPercent}${T('s54')}${inp.rentIncreasePercent}${T('s55')}${inp.landAppreciationPercent}${T('s56')}${currency} ${inp.purchaseCosts}${T('s57')}${inp.discountRatePercent}${T('s58')}${inp.reinvestRatePercent}${T('s59')}${inp.years}</td><td></td><td></td></tr>
                    ${inp.ltvPercent > 0 ? `${T('s40')}${inp.ltvPercent}${T('s41')}${inp.interestRatePercent}${T('s42')}${inp.loanTerm}${T('s43')}` : ''}${T('s60')}${kpiRows}${T('s61')}${ratingHTML}${T('s62')}${chartImg}${T('s63')}${tableHTML}${T('s64')}${sensHTML}${T('s65')}${paybackHTML}${T('s66')}${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${T('s67')}${companyName}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch (err) { alert(T('s68') + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== تصدير Excel شامل ==========
    // ================================================================
    document.getElementById('exportFullExcelBtn').addEventListener('click', async function() {
        if (!window.lastRealEstateResults) {
            alert(T('s69'));
            return;
        }
        showLoading(T('s70'), T('s71'));
        try {
            const data = window.lastRealEstateResults;
            const inp = data.inputs;
            const out = data.outputs;
            const currency = inp.currency;
            const companyName = inp.companyName;

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
            const cv = workbook.addWorksheet(T('s72'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
            cv.getRow(2).height=80; cv.getRow(4).height=60;
            cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1);
            bc.value=T('s73');
            bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};
            mh(cv,1,4,4,`${T('s74')}${companyName}`,DB,GL,18);
            const inf=[[T('s75'),companyName],[T('s76'),new Date().toLocaleDateString(FG.locale())],[T('s77'),currency],['📊 NPV',`${currency} ${out.npv.toFixed(0)}`],['📈 IRR',`${(out.irr*100).toFixed(2)}%`]];
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
            const inputsSheet = workbook.addWorksheet(T('s78'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            inputsSheet.getColumn(1).width=5; inputsSheet.getColumn(2).width=38; inputsSheet.getColumn(3).width=22; inputsSheet.getColumn(4).width=22; inputsSheet.getColumn(5).width=5;
            mh(inputsSheet,1,5,1,T('s79'),DB,GL,14);
            inputsSheet.getRow(1).height=40;
            mh(inputsSheet,2,4,2,T('s80'),SB,'FFFFFFFF',11);
            inputsSheet.getRow(2).height=28;
            const inputFields = [
                [T('s81'), inp.marketValue, ''],
                [T('s82'), inp.units, ''],
                [T('s83'), inp.rentPerUnit, ''],
                [T('s84'), inp.monthlyExpenses, ''],
                [T('s85'), (inp.occupancy*100).toFixed(0), '%'],
                [T('s86'), inp.taxRatePercent, '%'],
                [T('s87'), inp.assessedDiscountPercent, '%'],
                [T('s88'), inp.rentIncreasePercent, '%'],
                [T('s89'), inp.landAppreciationPercent, '%'],
                [T('s90'), inp.purchaseCosts, ''],
                [T('s91'), inp.ltvPercent, '%'],
                [T('s92'), inp.interestRatePercent, '%'],
                [T('s93'), inp.loanTerm, T('s94')],
                [T('s95'), inp.discountRatePercent, '%'],
                [T('s96'), inp.reinvestRatePercent, '%'],
                [T('s97'), inp.years, '']
            ];
            let iRow=3;
            inputFields.forEach(([label,val,note],idx)=>{
                inputsSheet.getRow(iRow).height=24;
                const bg=idx%2===0?'FFFEFCF6':'FFFFFFFF';
                const lc=inputsSheet.getCell(iRow,2), vc=inputsSheet.getCell(iRow,3), nc=inputsSheet.getCell(iRow,4);
                lc.value=label; vc.value=val; nc.value=note;
                ap(lc,cs(bg,DT,true,FG.start()));
                ap(vc,{...cs(bg,'0000FF',false,'center'),numFmt:typeof val==='number'?'#,##0':null});
                ap(nc,cs(bg,'00695C',false,'center'));
                iRow++;
            });

            // 3. مؤشرات الأداء
            const kpiSheet = workbook.addWorksheet(T('s98'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            [5,32,22,22,22,5].forEach((w,i)=>kpiSheet.getColumn(i+1).width=w);
            mh(kpiSheet,1,6,1,T('s99'),DB,GL,15);
            kpiSheet.getRow(1).height=45;
            mh(kpiSheet,2,5,2,`${companyName} | ${new Date().toLocaleDateString(FG.locale())}`,HB,'FFFFFFFF',10);
            kpiSheet.getRow(2).height=26;
            const kpis = [
                { label: 'NPV', value: `${currency} ${out.npv.toFixed(0)}`, good: out.npv>0 },
                { label: 'IRR', value: `${(out.irr*100).toFixed(2)}%`, good: out.irr>out.discountRate },
                { label: 'MIRR', value: `${(out.mirr*100).toFixed(2)}%`, good: true },
                { label: T('s100'), value: out.paybackPeriod!==null?out.paybackPeriod.toFixed(1)+T('s101'):T('s102'), good: out.paybackPeriod!==null&&out.paybackPeriod<inp.years/2 },
                { label: 'PI', value: out.pi.toFixed(2), good: out.pi>1 },
                { label: 'Cash on Cash', value: `${out.cashOnCash.toFixed(2)}%`, good: out.cashOnCash>0 }
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
            kFinal.value=out.npv>0?T('s103'):T('s104');
            kFinal.font={name:'Arial',bold:true,size:13,color:{argb:out.npv>0?PT:'856404'}};
            kFinal.fill={type:'pattern',pattern:'solid',fgColor:{argb:out.npv>0?PB:GB}};
            kFinal.alignment={horizontal:'center',vertical:'middle',readingOrder:FG.dir()};
            kFinal.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};
            kpiSheet.getRow(kRow).height=40;

            // 4. التدفقات النقدية
            const cashSheet = workbook.addWorksheet(T('s105'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            cashSheet.getColumn(1).width=5; cashSheet.getColumn(2).width=15; cashSheet.getColumn(3).width=20; cashSheet.getColumn(4).width=20; cashSheet.getColumn(5).width=5;
            mh(cashSheet,1,5,1,T('s106'),DB,GL,14);
            cashSheet.getRow(1).height=40;
            cashSheet.addRow([T('s107'), `${T('s108')}${currency})`, `${T('s109')}${currency})`]);
            let cum=0;
            for (let i=0; i<=inp.years; i++) {
                cum += out.cashFlows[i];
                cashSheet.addRow([i===0?T('s28'):i, out.cashFlows[i], cum]);
            }
            cashSheet.getRow(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            cashSheet.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
            cashSheet.getColumn(2).numFmt = '#,##0';
            cashSheet.getColumn(3).numFmt = '#,##0';

            // 5. تحليل الحساسية
            const sensSheet = workbook.addWorksheet(T('s110'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            sensSheet.getColumn(1).width=5; sensSheet.getColumn(2).width=25; sensSheet.getColumn(3).width=22; sensSheet.getColumn(4).width=22; sensSheet.getColumn(5).width=5;
            mh(sensSheet,1,5,1,T('s111'),DB,GL,14);
            sensSheet.getRow(1).height=40;
            sensSheet.addRow([T('s112'), `NPV (${currency})`, 'IRR (%)', 'PI']);
            sensSheet.addRow([T('s113'), out.npv, (out.irr*100).toFixed(2), out.pi.toFixed(2)]);
            sensSheet.getRow(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            sensSheet.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };

            // 6. الرسوم البيانية
            const chartsSheet = workbook.addWorksheet(T('s114'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
            mh(chartsSheet,1,3,1,T('s115'),DB,GL,14);
            chartsSheet.getRow(1).height=40;
            const chartCanvas = document.getElementById('cashChart');
            if (chartCanvas) {
                try {
                    const origBg = chartCanvas.style.backgroundColor;
                    chartCanvas.style.backgroundColor = '#ffffff';
                    const canvasImg = await html2canvas(chartCanvas, { scale: 2, backgroundColor: '#ffffff' });
                    chartCanvas.style.backgroundColor = origBg;
                    const imgData = canvasImg.toDataURL('image/png');
                    const imageId = workbook.addImage({ base64: imgData, extension: 'png' });
                    chartsSheet.addImage(imageId, { tl: { col: 1, row: 2 }, br: { col: 2, row: 28 }, editAs: 'oneCell' });
                } catch(err) {}
            }

            // 7. التقييم والتوصيات
            const evalSheet = workbook.addWorksheet(T('s116'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            evalSheet.getColumn(1).width=5; evalSheet.getColumn(2).width=50; evalSheet.getColumn(3).width=5;
            mh(evalSheet,1,3,1,T('s117'),DB,GL,14);
            evalSheet.getRow(1).height=45;
            const sections = [
                { title: T('s118'), content: `${T('s119')}${out.score}${T('s120')}${out.ratingText}` },
                { title: T('s121'), content: out.paybackPeriod!==null ? `${T('s122')}${out.paybackPeriod.toFixed(1)}${T('s123')}` : T('s124') },
                { title: T('s125'), content: out.npv>0 ? T('s126') : T('s127') },
                { title: T('s128'), content: T('s129') }
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
            const fileName = `${T('s67')}${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert(T('s130') + err.message); } finally { hideLoading(); }
    });

    // ===== تهيئة أولية =====
    // تعيين القيم الأولية للشريط
    occupancyRange.value = 100;
    occupancyInput.value = 1;
