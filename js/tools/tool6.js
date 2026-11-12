
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

// ===== نوع التحليل =====
let currentAnalysisType = 'sensitivity';

function setAnalysisType(type) {
    currentAnalysisType = type;
    document.getElementById('optSensitivity').classList.toggle('active', type === 'sensitivity');
    document.getElementById('optMonteCarlo').classList.toggle('active', type === 'montecarlo');
    document.getElementById('sensitivityInputs').classList.toggle('hidden-section', type !== 'sensitivity');
    document.getElementById('monteCarloInputs').classList.toggle('hidden-section', type !== 'montecarlo');
    document.getElementById('sensitivityResults').classList.toggle('hidden-section', type !== 'sensitivity');
    document.getElementById('monteCarloResults').classList.toggle('hidden-section', type !== 'montecarlo');
}

// ===== دوال الحساب الأساسية =====
function fmtNum(n) { return Math.round(n).toLocaleString('en-US'); }
function fmtPct(n) { return (n * 100).toFixed(2) + '%'; }


// ===== الحدث الرئيسي للحساب =====
let globalResults = {};
let npvChart = null;

document.getElementById('calculateBtn').addEventListener('click', async function() {
    const currency = document.getElementById('currencySelect').value;
    const I = parseFloat(document.getElementById('initialInvestment').value) || 0;
    const r0 = parseFloat(document.getElementById('annualRevenue').value) || 0;
    const c0 = parseFloat(document.getElementById('annualCosts').value) || 0;
    const d = parseFloat(document.getElementById('depreciation').value) || 0;
    const gR = parseFloat(document.getElementById('growthRevenue').value) / 100 || 0;
    const gC = parseFloat(document.getElementById('growthCosts').value) / 100 || 0;
    const disc = parseFloat(document.getElementById('discountRate').value) / 100 || 0;
    const t = parseFloat(document.getElementById('taxRate').value) / 100 || 0;
    const Y = parseInt(document.getElementById('years').value) || 8;

    if (I <= 0 || r0 <= 0) { alert(T('s2')); return; }

    // الحالة الأساسية
    const P = { I, r0, c0, d, gR, gC, t, Y, disc };
    let B;
    try { B = await FG.calc('tool6', 'main', P); } catch (e) { FG.calcError(e); return; }
    const { baseNPV, baseIRR, cf, payback, totalDCF, pi } = B;
    const companyName = document.getElementById('companyName').value || T('s3');

    globalResults = {
        currency, companyName,
        investment: I, revenue0: r0, costs0: c0, depr: d,
        growthRev: gR, growthCost: gC,
        discount: disc, tax: t, years: Y,
        baseNPV, baseIRR, payback, totalDCF, pi,
        cashflows: cf,
        analysisType: currentAnalysisType
    };

    // عرض بطاقات KPI
    document.getElementById('kpiCards').innerHTML = `${T('s10')}${currency} ${fmtNum(baseNPV)}</div><div class="status ${baseNPV>0?'status-good':'status-bad'}">${baseNPV>0?T('s4'):T('s5')}${T('s11')}${isFinite(baseIRR)?(baseIRR*100).toFixed(2):'—'}%</div><div class="status ${isFinite(baseIRR)&&baseIRR>disc?'status-good':'status-bad'}">${isFinite(baseIRR)&&baseIRR>disc?T('s6'):'⚠️'}${T('s12')}${payback!==null?payback:'>'+Y}${T('s13')}${payback!==null&&payback<=Y?'status-good':'status-warning'}">${payback!==null&&payback<=Y?T('s7'):'⚠️'}${T('s14')}${pi.toFixed(3)}</div><div class="status ${pi>1?'status-good':'status-bad'}">${pi>1?T('s8'):T('s9')}</div></div>
    `;

    document.getElementById('initialMessage').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';

    // ===== تحليل الحساسية =====
    if (currentAnalysisType === 'sensitivity') {
        document.getElementById('sensitivityResults').classList.remove('hidden-section');
        document.getElementById('monteCarloResults').classList.add('hidden-section');

        const rC = parseFloat(document.getElementById('revChange').value) / 100 || 0;
        const cC = parseFloat(document.getElementById('costChange').value) / 100 || 0;
        let S;
        try { S = await FG.calc('tool6', 'sensitivity', Object.assign({ rC, cC }, P)); } catch (e) { FG.calcError(e); return; }
        const { matrix, rL, cL } = S;
        globalResults.sensitivity = { matrix, revLabels: rL, costLabels: cL, revChange: rC, costChange: cC };

        let tbl = T('s15');
        cL.forEach(l => tbl += `<th>${l}</th>`);
        tbl += '</tr></thead><tbody>';
        for (let i = 0; i < 3; i++) {
            tbl += `<tr><td><strong>${rL[i]}</strong></td>`;
            for (let j = 0; j < 3; j++) {
                const n = matrix[i][j];
                tbl += `<td class="${n>0?'positive':'negative'}">${currency} ${fmtNum(n)}</td>`;
            }
            tbl += '</tr>';
        }
        tbl += '</tbody></table>';
        document.getElementById('sensitivityTable').innerHTML = tbl;

        document.getElementById('interpretation').innerHTML = `${T('s18')}${baseNPV>0?T('s16'):T('s17')}</strong> — NPV = ${currency} ${fmtNum(baseNPV)}${T('s19')}${currency} ${fmtNum(S.flatMax)}${T('s20')}${currency} ${fmtNum(S.flatMin)}</p>
            <p>📐 IRR = ${(baseIRR*100).toFixed(2)}${T('s21')}${(disc*100).toFixed(1)}%</p>
        `;

    } else { // Monte Carlo
        document.getElementById('sensitivityResults').classList.add('hidden-section');
        document.getElementById('monteCarloResults').classList.remove('hidden-section');

        const rV = parseFloat(document.getElementById('revVolatility').value) / 100 || 0.15;
        const cV = parseFloat(document.getElementById('costVolatility').value) / 100 || 0.10;
        const nS = parseInt(document.getElementById('numSimulations').value) || 5000;

        let MC;
        try { MC = await FG.calc('tool6', 'montecarlo', Object.assign({ rV, cV, nS }, P)); } catch (e) { FG.calcError(e); return; }
        const mean = MC.meanNPV, med = MC.medianNPV, p5 = MC.p5NPV, p95 = MC.p95NPV, probLoss = MC.probLoss, std = MC.stdNPV, skew = MC.skewness, cv = MC.cv;

        globalResults.monteCarlo = {
            numSims: nS, revVol: rV, costVol: cV,
            meanNPV: mean, medianNPV: med, p5NPV: p5, p25NPV: MC.p25NPV, p75NPV: MC.p75NPV, p95NPV: p95,
            probLoss, stdNPV: std, skewness: skew, cv
        };

        // رسم الهيستوغرام
        const ctx = document.getElementById('npvHistogram').getContext('2d');
        const bins = MC.bins, binLabels = MC.binLabels, binColors = MC.binColors;
        if (window.npvChart) window.npvChart.destroy();
        window.npvChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: binLabels,
                datasets: [{
                    label: T('s22'),
                    data: bins,
                    backgroundColor: binColors,
                    borderColor: binColors.map(c => c.replace('0.7', '1')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, ticks: { color: '#aab7d4' }, grid: { color: 'rgba(180,133,84,0.2)' } },
                    x: { ticks: { color: '#aab7d4', maxTicksLimit: 10 } }
                },
                plugins: { legend: { labels: { color: '#f0f4fa' } } }
            }
        });

        // إحصائيات مونت كارلو
        const pLoss = parseFloat(probLoss);
        document.getElementById('monteCarloStats').innerHTML = `${T('s32')}${mean>0?'positive':'negative'}">${currency} ${fmtNum(mean)}</td><td>${mean>0?T('s23'):T('s24')}${T('s33')}${med>0?'positive':'negative'}">${currency} ${fmtNum(med)}${T('s34')}${currency} ${fmtNum(p5)}${T('s35')}${currency} ${fmtNum(p95)}${T('s36')}${pLoss>50?'negative':'positive'}">${probLoss}%</td><td>${MC.riskLevel}${T('s37')}${currency} ${fmtNum(std)}${T('s38')}${cv}%</td><td>${MC.cvLevel}${T('s39')}${skew.toFixed(3)}</td><td>${skew>0?T('s30'):T('s31')}${T('s40')}${nS.toLocaleString()}${T('s41')}`;

        document.getElementById('interpretation').innerHTML = `${T('s42')}${currency} ${fmtNum(mean)}${T('s43')}${probLoss}%</strong></p>
            <p>🛡️ VaR 95%: <strong>${currency} ${fmtNum(Math.abs(p5))}${T('s44')}${currency} ${fmtNum(p95)}</strong></p>
        `;
    }
});

// ================================================================
// ========== تصدير Excel احترافي ==========
// ================================================================
document.getElementById('exportExcelBtn').addEventListener('click', async function() {
    if (document.getElementById('resultsSection').style.display === 'none') {
        alert(T('s45'));
        return;
    }
    showLoading(T('s46'), T('s47'));
    try {
        const R = globalResults;
        const currency = R.currency;
        const companyName = R.companyName;

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
        const cv = workbook.addWorksheet(T('s48'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
        [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
        cv.getRow(2).height=80; cv.getRow(4).height=60;
        cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1);
        bc.value=T('s49');
        bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};
        mh(cv,1,4,4,`${T('s52')}${R.analysisType==='sensitivity'?T('s50'):T('s51')})`,DB,GL,18);
        const inf=[[T('s53'),companyName],[T('s54'),new Date().toLocaleDateString(FG.locale())],[T('s55'),currency],[T('s56'),`${R.years}${T('s57')}`],[T('s58'),`${currency} ${fmtNum(R.investment)}`],['📈 NPV',`${currency} ${fmtNum(R.baseNPV)}`],['🔢 IRR',`${(R.baseIRR*100).toFixed(2)}%`],['⚖️ PI',R.pi?R.pi.toFixed(3):'-']];
        let ir=6;
        inf.forEach(([l,v],idx)=>{
            cv.mergeCells(ir,1,ir,2); cv.mergeCells(ir,3,ir,4);
            const lc=cv.getCell(ir,1), vc=cv.getCell(ir,3); lc.value=l; vc.value=v;
            const bg=idx%2===0?AR:'FFFEFCF6';
            ap(lc,{font:{name:'Arial',bold:true,size:11,color:{argb:'00695C'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'right',vertical:'middle',readingOrder:FG.dir()},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
            ap(vc,{font:{name:'Arial',size:11,color:{argb:DT}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',readingOrder:FG.dir()},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
            cv.getRow(ir).height=28; ir++;
        });
        const vr=ir+1, isGood=R.baseNPV>0 && R.baseIRR>R.discount && R.pi>1;
        cv.mergeCells(vr,1,vr,4); const vc2=cv.getCell(vr,1);
        vc2.value=isGood?T('s59'):T('s60');
        vc2.font={name:'Arial',bold:true,size:14,color:{argb:isGood?PT:'856404'}};
        vc2.fill={type:'pattern',pattern:'solid',fgColor:{argb:isGood?PB:GB}};
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
            [T('s64'), R.investment, ''],
            [T('s65'), R.revenue0, ''],
            [T('s66'), R.costs0, ''],
            [T('s67'), R.depr, ''],
            [T('s68'), R.growthRev*100, '%'],
            [T('s69'), R.growthCost*100, '%'],
            [T('s70'), R.discount*100, '%'],
            [T('s71'), R.tax*100, '%'],
            [T('s72'), R.years, ''],
            [T('s73'), R.analysisType==='sensitivity'?T('s74'):T('s75'), '']
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
        const kpiSheet = workbook.addWorksheet(T('s76'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
        [5,32,22,22,22,5].forEach((w,i)=>kpiSheet.getColumn(i+1).width=w);
        mh(kpiSheet,1,6,1,T('s77'),DB,GL,15);
        kpiSheet.getRow(1).height=45;
        mh(kpiSheet,2,5,2,`${companyName} | ${new Date().toLocaleDateString(FG.locale())}`,HB,'FFFFFFFF',10);
        kpiSheet.getRow(2).height=26;
        const kpis = [
            { label: 'NPV', value: `${currency} ${fmtNum(R.baseNPV)}`, good: R.baseNPV>0 },
            { label: 'IRR', value: `${(R.baseIRR*100).toFixed(2)}%`, good: R.baseIRR>R.discount },
            { label: 'PI', value: R.pi.toFixed(3), good: R.pi>1 },
            { label: T('s78'), value: R.payback?`${R.payback}${T('s79')}`:`>${R.years}${T('s79')}`, good: R.payback!==null&&R.payback<=R.years },
            { label: T('s80'), value: `${(R.discount*100).toFixed(2)}%`, good: true },
        ];
        let kRow=3;
        kpis.forEach((k,idx)=>{
            kpiSheet.getRow(kRow).height=40;
            kpiSheet.mergeCells(kRow,2,kRow,2); kpiSheet.mergeCells(kRow,3,kRow,3); kpiSheet.mergeCells(kRow,4,kRow,4); kpiSheet.mergeCells(kRow,5,kRow,5);
            const ic=kpiSheet.getCell(kRow,2); ic.value=`🔹 ${idx+1}`;
            const lc2=kpiSheet.getCell(kRow,3); lc2.value=k.label;
            const vc3=kpiSheet.getCell(kRow,4); vc3.value=k.value;
            const nc2=kpiSheet.getCell(kRow,5); nc2.value=k.good?T('s81'):T('s82');
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
        kFinal.value=isGood?T('s83'):T('s84');
        kFinal.font={name:'Arial',bold:true,size:13,color:{argb:isGood?PT:'856404'}};
        kFinal.fill={type:'pattern',pattern:'solid',fgColor:{argb:isGood?PB:GB}};
        kFinal.alignment={horizontal:'center',vertical:'middle',readingOrder:FG.dir()};
        kFinal.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};
        kpiSheet.getRow(kRow).height=40;

        // 4. التدفقات النقدية
        const cashSheet = workbook.addWorksheet(T('s85'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
        cashSheet.getColumn(1).width=5; cashSheet.getColumn(2).width=15; cashSheet.getColumn(3).width=20; cashSheet.getColumn(4).width=20; cashSheet.getColumn(5).width=5;
        mh(cashSheet,1,5,1,T('s86'),DB,GL,14);
        cashSheet.getRow(1).height=40;
        cashSheet.addRow([T('s87'), `${T('s88')}${currency})`, `${T('s89')}${currency})`]);
        let cum=-R.investment;
        cashSheet.addRow([T('s90'), -R.investment, -R.investment]);
        R.cashflows.forEach((row,idx)=>{
            const yr = idx+1;
            cum += row.fcf;
            cashSheet.addRow([yr, row.fcf, cum]);
        });
        cashSheet.getRow(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cashSheet.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
        cashSheet.getColumn(2).numFmt = '#,##0';
        cashSheet.getColumn(3).numFmt = '#,##0';

        // 5. تحليل الحساسية أو مونت كارلو حسب النوع
        if (R.analysisType === 'sensitivity' && R.sensitivity) {
            const sensSheet = workbook.addWorksheet(T('s50'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            sensSheet.getColumn(1).width=5; sensSheet.getColumn(2).width=25; sensSheet.getColumn(3).width=22; sensSheet.getColumn(4).width=22; sensSheet.getColumn(5).width=22; sensSheet.getColumn(6).width=5;
            mh(sensSheet,1,6,1,T('s91'),DB,GL,14);
            sensSheet.getRow(1).height=40;
            const sM=R.sensitivity;
            sensSheet.addRow([T('s92'), ...sM.costLabels]);
            for (let i=0; i<3; i++) {
                const row = [sM.revLabels[i], ...sM.matrix[i].map(v => v)];
                sensSheet.addRow(row);
            }
            sensSheet.getRow(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            sensSheet.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
            sensSheet.getColumn(3).numFmt = '#,##0';
            sensSheet.getColumn(4).numFmt = '#,##0';
            sensSheet.getColumn(5).numFmt = '#,##0';
        } else if (R.analysisType === 'montecarlo' && R.monteCarlo) {
            const mc = R.monteCarlo;
            const mcSheet = workbook.addWorksheet(T('s93'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            mcSheet.getColumn(1).width=5; mcSheet.getColumn(2).width=38; mcSheet.getColumn(3).width=25; mcSheet.getColumn(4).width=30; mcSheet.getColumn(5).width=5;
            mh(mcSheet,1,5,1,T('s94'),DB,GL,14);
            mcSheet.getRow(1).height=40;
            const mcData = [
                [T('s95'), mc.meanNPV, mc.meanNPV>0?T('s4'):T('s96')],
                [T('s97'), mc.medianNPV, ''],
                ['VaR 95%', mc.p5NPV, T('s98')],
                [T('s99'), mc.p95NPV, T('s100')],
                [T('s101'), parseFloat(mc.probLoss), '%'],
                [T('s102'), mc.stdNPV, ''],
                [T('s103'), parseFloat(mc.cv), '%'],
                [T('s104'), mc.skewness, ''],
                [T('s105'), mc.numSims, '']
            ];
            mcSheet.addRow([T('s106'), T('s107'), T('s108')]);
            mcData.forEach(row => mcSheet.addRow(row));
            mcSheet.getRow(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            mcSheet.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
            mcSheet.getColumn(3).numFmt = '#,##0';
        }

        // 6. الرسوم البيانية (صورة الرسم البياني)
        const chartsSheet = workbook.addWorksheet(T('s109'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
        chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
        mh(chartsSheet,1,3,1,T('s110'),DB,GL,14);
        chartsSheet.getRow(1).height=40;

        let chartCanvas = null;
        if (R.analysisType === 'montecarlo') {
            chartCanvas = document.getElementById('npvHistogram');
        } else {
            // يمكن إضافة رسم بياني آخر للحساسية إن أردت
        }
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
        } else {
            chartsSheet.getCell(3,2).value = T('s111');
        }

        // 7. التفسير والتوصيات
        const evalSheet = workbook.addWorksheet(T('s112'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
        evalSheet.getColumn(1).width=5; evalSheet.getColumn(2).width=50; evalSheet.getColumn(3).width=5;
        mh(evalSheet,1,3,1,T('s113'),DB,GL,14);
        evalSheet.getRow(1).height=45;
        const sections = [
            { title: T('s114'), content: `${T('s115')}${companyName}${T('s116')}${currency} ${fmtNum(R.investment)}${T('s117')}${R.years}${T('s57')}` },
            { title: T('s118'), content: `NPV = ${currency} ${fmtNum(R.baseNPV)} | IRR = ${(R.baseIRR*100).toFixed(2)}% | PI = ${R.pi.toFixed(3)}` },
            { title: T('s119'), content: isGood ? T('s120') : T('s121') },
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
        const fileName = `${T('s122')}${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
        saveAs(blob, fileName);
    } catch(err) { alert(T('s123') + err.message); } finally { hideLoading(); }
});

// ================================================================
// ========== تصدير Word احترافي ==========
// ================================================================
document.getElementById('exportWordBtn').addEventListener('click', async function() {
    if (document.getElementById('resultsSection').style.display === 'none') {
        alert(T('s45'));
        return;
    }
    showLoading(T('s124'), T('s125'));
    try {
        const R = globalResults;
        const currency = R.currency;
        const companyName = R.companyName;
        const now = new Date();
        const dateStr = now.toLocaleDateString(FG.locale());

        // صورة الرسم البياني إن وجدت
        let chartImg = '';
        if (R.analysisType === 'montecarlo') {
            const canvas = document.getElementById('npvHistogram');
            if (canvas) {
                const origBg = canvas.style.backgroundColor;
                canvas.style.backgroundColor = '#ffffff';
                const img = await html2canvas(canvas, { scale: 2, backgroundColor: '#ffffff' });
                canvas.style.backgroundColor = origBg;
                chartImg = img.toDataURL('image/png');
            }
        }

        // بطاقات KPI
        const kpiData = [
            { label: T('s126'), value: `${currency} ${fmtNum(R.baseNPV)}`, good: R.baseNPV>0 },
            { label: T('s127'), value: `${(R.baseIRR*100).toFixed(2)}%`, good: R.baseIRR>R.discount },
            { label: T('s128'), value: R.pi.toFixed(3), good: R.pi>1 },
            { label: T('s129'), value: R.payback?`${R.payback}${T('s130')}`:`>${R.years}${T('s131')}`, good: R.payback!==null&&R.payback<=R.years },
        ];
        let kpiRows = '';
        kpiData.forEach(k => {
            kpiRows += `
                <tr style="border:1px solid #b8860b;">
                    <td style="padding:12px;background:${k.good?'#d4edda':'#f8d7da'};text-align:right;">${k.label}</td>
                    <td style="padding:12px;background:${k.good?'#d4edda':'#f8d7da'};text-align:center;"><strong style="font-size:1.2rem;color:${k.good?'#155724':'#721c24'}">${k.value}</strong></td>
                    <td style="padding:12px;background:${k.good?'#d4edda':'#f8d7da'};text-align:center;">${k.good?T('s132'):T('s133')}</td>
                </tr>`;
        });

        // التدفقات النقدية
        let cfRows = '';
        let cum = -R.investment;
        cfRows += `${T('s134')}${currency} ${fmtNum(-R.investment)}</td><td>${currency} ${fmtNum(-R.investment)}</td></tr>`;
        R.cashflows.forEach(row => {
            cum += row.fcf;
            cfRows += `
                <tr><td>${row.year}</td><td class="${row.fcf>=0?'positive':'negative'}">${currency} ${fmtNum(row.fcf)}</td><td class="${cum>=0?'positive':'negative'}">${currency} ${fmtNum(cum)}</td></tr>`;
        });

        // جدول الحساسية (إن وجد)
        let sensHtml = '';
        if (R.analysisType === 'sensitivity' && R.sensitivity) {
            const sM = R.sensitivity;
            sensHtml += T('s135');
            sensHtml += T('s136');
            sM.costLabels.forEach(l => sensHtml += `${T('s137')}${l}</th>`);
            sensHtml += '</tr></thead><tbody>';
            for (let i=0; i<3; i++) {
                sensHtml += `${T('s138')}${sM.revLabels[i]}</strong></td>`;
                for (let j=0; j<3; j++) {
                    const npv = sM.matrix[i][j];
                    sensHtml += `<td style="border:1px solid #b8860b;padding:8px;text-align:center;" class="${npv>0?'positive':'negative'}">${currency} ${fmtNum(npv)}</td>`;
                }
                sensHtml += '</tr>';
            }
            sensHtml += '</tbody></table>';
        }

        // إحصائيات مونت كارلو
        let mcHtml = '';
        if (R.analysisType === 'montecarlo' && R.monteCarlo) {
            const mc = R.monteCarlo;
            mcHtml = T('s139');
            mcHtml += `${T('s140')}${mc.meanNPV>0?'positive':'negative'}">${currency} ${fmtNum(mc.meanNPV)}${T('s141')}${mc.medianNPV>0?'positive':'negative'}">${currency} ${fmtNum(mc.medianNPV)}</td></tr>
                <tr><td>VaR 95%</td><td class="negative">${currency} ${fmtNum(mc.p5NPV)}${T('s142')}${currency} ${fmtNum(mc.p95NPV)}${T('s143')}${parseFloat(mc.probLoss)>50?'negative':'positive'}">${mc.probLoss}${T('s144')}${currency} ${fmtNum(mc.stdNPV)}${T('s145')}${mc.cv}${T('s146')}${mc.numSims.toLocaleString()}</td></tr>
            </tbody></table>`;
            if (chartImg) {
                mcHtml += `<div style="text-align:center;margin:20px 0;"><img src="${chartImg}" style="max-width:100%;border:1px solid #b8860b;border-radius:10px;" /></div>`;
            }
        }

        const isGood = R.baseNPV>0 && R.baseIRR>R.discount && R.pi>1;
        const verdictHtml = `<div style="margin:20px 0;padding:15px;background:${isGood?'#d4edda':'#f8d7da'};border-radius:10px;border:1px solid #b8860b;text-align:center;"><h3 style="margin:0;color:${isGood?'#155724':'#721c24'};">${isGood?T('s147'):T('s148')}</h3></div>`;

        const fullHtml = `${T('s155')}${companyName}${T('s156')}${dateStr}${T('s157')}${currency} ${fmtNum(R.investment)}${T('s158')}${R.years}${T('s159')}${currency} ${fmtNum(R.revenue0)}${T('s160')}${currency} ${fmtNum(R.costs0)}${T('s161')}${fmtPct(R.growthRev)}${T('s162')}${fmtPct(R.growthCost)}${T('s163')}${fmtPct(R.discount)}${T('s164')}${fmtPct(R.tax)}${T('s165')}${R.analysisType==='sensitivity'?T('s149'):T('s150')}${T('s166')}${kpiRows}</table>
            ${verdictHtml}${T('s167')}${currency}${T('s168')}${currency})</th></tr></thead><tbody>${cfRows}</tbody></table>

            ${sensHtml}
            ${mcHtml}${T('s169')}${currency} ${fmtNum(R.investment)}${T('s170')}${R.years}${T('s171')}${currency} ${fmtNum(R.baseNPV)} (${R.baseNPV>0?T('s151'):T('s152')}${T('s172')}${(R.baseIRR*100).toFixed(2)}${T('s173')}${R.pi.toFixed(3)}${T('s174')}${isGood?T('s153'):T('s154')}${T('s175')}${now.getFullYear()}</div>
        </body></html>`;

        const blob = new Blob(['\uFEFF'+fullHtml], { type: 'application/msword' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${T('s122')}${companyName}_${now.toISOString().slice(0,10)}.doc`;
        link.click();
        URL.revokeObjectURL(link.href);
    } catch(err) { alert(T('s176') + err.message); } finally { hideLoading(); }
});
