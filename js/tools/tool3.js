
AOS.init({ duration: 800, once: true, offset: 100 });

// ===== آلة حاسبة =====
const calcDisplay = document.getElementById('calcDisplay');
let currentCalcInput = '';
function handleCalc(v) {
    if (v === 'C') { currentCalcInput = ''; calcDisplay.value = ''; return; }
    if (v === '⌫') { currentCalcInput = currentCalcInput.slice(0, -1); calcDisplay.value = currentCalcInput; return; }
    if (v === '=') { try { let r = eval(currentCalcInput.replace(/×/g,'*').replace(/÷/g,'/')); calcDisplay.value = r; currentCalcInput = r.toString(); } catch(e) { calcDisplay.value = T('s1'); currentCalcInput = ''; } return; }
    currentCalcInput += v; calcDisplay.value = currentCalcInput;
}
document.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', function(e) { e.stopPropagation(); const v = this.dataset.val; if (v !== undefined) handleCalc(v); });
});
const modalEl = document.getElementById('calculatorModal');
document.getElementById('calculatorBtn').addEventListener('click', function(e) { e.stopPropagation(); modalEl.classList.add('active'); calcDisplay.value = currentCalcInput; });
document.getElementById('modalClose').addEventListener('click', function() { modalEl.classList.remove('active'); });
modalEl.addEventListener('click', function(e) { if (e.target === modalEl) modalEl.classList.remove('active'); });
document.addEventListener('keydown', function(e) {
    if (!modalEl.classList.contains('active')) return;
    e.preventDefault(); const k = e.key;
    if (k >= '0' && k <= '9') handleCalc(k); else if (k === '.') handleCalc('.'); else if (k === '+' || k === '-' || k === '*' || k === '/') handleCalc(k);
    else if (k === 'Enter' || k === '=') handleCalc('='); else if (k === 'Backspace') handleCalc('⌫');
    else if (k === 'Escape') modalEl.classList.remove('active'); else if (k.toLowerCase() === 'c') handleCalc('C');
});

// ===== المعدات الديناميكي =====
const equipmentContainer = document.getElementById('equipmentContainer');
function addEquipmentRow(name = '', power = '', cost = '', space = '') {
    const row = document.createElement('div'); row.className = 'equipment-row';
    row.innerHTML = `${T('s2')}${name}${T('s3')}${power}${T('s4')}${cost}${T('s5')}${space}" step="0.1" min="0"><button class="remove-equipment" onclick="this.parentElement.remove()">×</button>`;
    equipmentContainer.appendChild(row);
}
addEquipmentRow('', '', '', ''); addEquipmentRow('', '', '', '');
document.getElementById('addEquipmentBtn').addEventListener('click', () => addEquipmentRow());
function getEquipmentData() {
    const rows = document.querySelectorAll('#equipmentContainer .equipment-row');
    const equipment = [];
    rows.forEach(row => {
        const name = row.querySelector('.eq-name')?.value || '';
        const power = parseFloat(row.querySelector('.eq-power')?.value) || 0;
        const cost = parseFloat(row.querySelector('.eq-cost')?.value) || 0;
        const space = parseFloat(row.querySelector('.eq-space')?.value) || 0;
        if (name) equipment.push({ name, power, cost, space });
    });
    return equipment;
}
function equipmentForServer() { return getEquipmentData(); }
async function updatePowerAlert() {
    const electricalCapacity = parseFloat(document.getElementById('electricalCapacity').value) || 200;
    let P; try { P = await FG.calc('tool3', 'power', { equipment: equipmentForServer(), electricalCapacity }); } catch (e) { return; }
    const requiredAmps = P.requiredAmps;
    const powerAlert = document.getElementById('powerAlert');
    if (P.over) {
        powerAlert.style.display = 'block';
        powerAlert.className = 'alert alert-danger';
        powerAlert.innerHTML = `${T('s6')}${requiredAmps.toFixed(0)}${T('s7')}${electricalCapacity}${T('s8')}`;
    } else { powerAlert.style.display = 'none'; }
}
document.getElementById('electricalCapacity').addEventListener('input', updatePowerAlert);
equipmentContainer.addEventListener('input', updatePowerAlert);

// ===== الحساب الرئيسي =====
let financeChart, riskChart;
async function calculateAll() {
    const currency = document.getElementById('currencySelect').value;
    const companyName = document.getElementById('companyName').value || T('s9');
    const seats = parseFloat(document.getElementById('seats').value) || 50;
    const hoursOpen = parseFloat(document.getElementById('hoursOpen').value) || 12;
    const totalArea = parseFloat(document.getElementById('totalArea').value) || 150;
    const kitchenPercent = parseFloat(document.getElementById('kitchenPercent').value) || 35;
    const electricalCapacity = parseFloat(document.getElementById('electricalCapacity').value) || 200;
    const waterAvailabilityText = document.getElementById('waterAvailability').options[document.getElementById('waterAvailability').selectedIndex].text;
    const ventilationText = document.getElementById('ventilation').options[document.getElementById('ventilation').selectedIndex].text;
    const deliveryAccessText = document.getElementById('deliveryAccess').options[document.getElementById('deliveryAccess').selectedIndex].text;
    const equipment = getEquipmentData();
    const waterValue = document.getElementById('waterAvailability').value;
    const ventilationValue = document.getElementById('ventilation').value;
    const turnoverRate = parseFloat(document.getElementById('turnoverRate').value) || 2;
    const peakHours = parseFloat(document.getElementById('peakHours').value) || 4;
    const occupancyRate = parseFloat(document.getElementById('occupancyRate').value) / 100 || 0.7;
    const avgMealPrice = parseFloat(document.getElementById('avgMealPrice').value) || 50;
    const foodCostPercent = parseFloat(document.getElementById('foodCostPercent').value) / 100 || 0.3;
    const employeesCount = parseFloat(document.getElementById('employeesCount').value) || 6;
    const avgSalary = parseFloat(document.getElementById('avgSalary').value) || 2000;
    const monthlyRent = parseFloat(document.getElementById('monthlyRent').value) || 4000;
    const otherOpCost = parseFloat(document.getElementById('otherOpCost').value) || 2000;
    const equipmentLife = parseFloat(document.getElementById('equipmentLife').value) || 10;
    const constructionCost = parseFloat(document.getElementById('constructionCost').value) || 50000;
    const licensesCost = parseFloat(document.getElementById('licensesCost').value) || 5000;
    const workingCapital = parseFloat(document.getElementById('workingCapital').value) || 15000;

    let R;
    try { R = await FG.calc('tool3', 'main', { seats, hoursOpen, totalArea, kitchenPercent, electricalCapacity, waterValue, ventilationValue, equipment, turnoverRate, peakHours, occupancyRate, avgMealPrice, foodCostPercent, employeesCount, avgSalary, monthlyRent, otherOpCost, equipmentLife, constructionCost, licensesCost, workingCapital }); } catch (e) { FG.calcError(e); return; }
    const { totalPower, equipmentCost, totalSpace, kitchenArea, diningArea, seatDensity, maxCustomersDaily, actualCustomersDaily,
        monthlyRevenue, monthlyFoodCost, monthlyLaborCost, monthlyFixedCosts, totalMonthlyExpenses, netProfit, totalInvestment, monthlyDepreciation,
        netProfitAfterDepreciation, accountingProfit, contributionPerMeal, breakEvenMeals, breakEvenRevenue, revenuePerSeat, primeCost, primePercent,
        laborCostPercent, fixedCostPercent, riskRevenue, riskProfit, paybackMonths, warnings, technicalScore, technicalRating, technicalColor,
        financialScore, financialRating, financialColor, profitMarginPct, marginOfSafetyPct } = R;

    // عرض النتائج
    document.getElementById('initialMessage').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('kpiCards').innerHTML = `${T('s25')}${currency}${Math.round(monthlyRevenue)}${T('s26')}${currency}${Math.round(accountingProfit)}</div><div class="status ${accountingProfit > 0 ? 'status-good' : 'status-bad'}">${accountingProfit > 0 ? T('s23') : T('s24')}${T('s27')}${currency}${Math.round(breakEvenRevenue)}${T('s28')}${paybackMonths === Infinity ? '∞' : paybackMonths.toFixed(1)}${T('s29')}`;
    if (warnings.length > 0) {
        document.getElementById('warnings').style.display = 'block';
        document.getElementById('warnings').innerHTML = `${T('s30')}${warnings.join('<br>')}`;
        document.getElementById('warnings').className = 'alert alert-warning';
    } else { document.getElementById('warnings').style.display = 'none'; }
    document.getElementById('projectRatingCard').innerHTML = `${T('s31')}${technicalColor}" style="font-size:1.2rem;">${technicalRating}${T('s32')}${technicalScore}${T('s33')}${financialColor}" style="font-size:1.2rem;">${financialRating}${T('s34')}${financialScore}/100</p></div>
        </div>
    `;
    if (financeChart) financeChart.destroy();
    const ctx1 = document.getElementById('financeChart').getContext('2d');
    financeChart = new Chart(ctx1, {
        type: 'bar',
        data: { labels: [T('s35'), T('s36'), T('s37'), T('s38'), T('s39')], datasets: [{ label: `${T('s40')}${currency})`, data: [monthlyRevenue, monthlyFoodCost, monthlyLaborCost, monthlyFixedCosts, accountingProfit], backgroundColor: ['#28a745', '#ffc107', '#17a2b8', '#fd7e14', '#b8860b'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
    if (riskChart) riskChart.destroy();
    const ctx2 = document.getElementById('riskChart').getContext('2d');
    riskChart = new Chart(ctx2, {
        type: 'bar',
        data: { labels: [T('s41'), T('s42')], datasets: [{ label: `${T('s43')}${currency})`, data: [accountingProfit, riskProfit], backgroundColor: ['#28a745', '#dc3545'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });

    window.lastResults = {
        currency, companyName, seats, hoursOpen, totalArea, kitchenPercent, electricalCapacity,
        waterAvailabilityText, ventilationText, deliveryAccessText, equipment: getEquipmentData(),
        totalPower, equipmentCost, totalSpace, turnoverRate, peakHours, occupancyRate,
        avgMealPrice, foodCostPercent, employeesCount, avgSalary, monthlyRent, otherOpCost,
        equipmentLife, constructionCost, licensesCost, workingCapital,
        kitchenArea, diningArea, seatDensity, maxCustomersDaily, actualCustomersDaily,
        monthlyRevenue, monthlyFoodCost, monthlyLaborCost, monthlyFixedCosts,
        totalMonthlyExpenses, netProfit, totalInvestment, monthlyDepreciation,
        netProfitAfterDepreciation, accountingProfit, contributionPerMeal,
        breakEvenMeals, breakEvenRevenue, revenuePerSeat, primeCost, primePercent,
        laborCostPercent, fixedCostPercent, riskRevenue, riskProfit, paybackMonths,
        warnings, technicalScore, technicalRating, technicalColor,
        financialScore, financialRating, financialColor, profitMarginPct, marginOfSafetyPct
    };
}
document.getElementById('calculateBtn').addEventListener('click', calculateAll);

// ================================================================
// ========== تصدير Word احترافي (متطابق مع المالي) ==========
// ================================================================
async function exportToWord() {
    if (document.getElementById('resultsSection').style.display === 'none') { alert(T('s44')); return; }
    showLoading(T('s45'), T('s46'));
    try {
        const currency = document.getElementById('currencySelect').value;
        const companyName = document.getElementById('companyName').value || T('s9');
        const res = window.lastResults;
        if (!res) { alert(T('s44')); hideLoading(); return; }

        // التقاط صور الرسوم البيانية
        const chart1 = document.getElementById('financeChart');
        const chart2 = document.getElementById('riskChart');
        const [canvas1, canvas2] = await Promise.all([
            html2canvas(chart1, { scale: 2, backgroundColor: '#ffffff' }),
            html2canvas(chart2, { scale: 2, backgroundColor: '#ffffff' })
        ]);
        const img1 = canvas1.toDataURL('image/png');
        const img2 = canvas2.toDataURL('image/png');

        // بناء جدول المدخلات
        const kitchenType = document.getElementById('kitchenType').options[document.getElementById('kitchenType').selectedIndex].text;
        const serviceModel = document.getElementById('serviceModel').options[document.getElementById('serviceModel').selectedIndex].text;
        const shifts = document.getElementById('shifts').options[document.getElementById('shifts').selectedIndex].text;
        const water = document.getElementById('waterAvailability').options[document.getElementById('waterAvailability').selectedIndex].text;
        const ventilation = document.getElementById('ventilation').options[document.getElementById('ventilation').selectedIndex].text;
        const delivery = document.getElementById('deliveryAccess').options[document.getElementById('deliveryAccess').selectedIndex].text;

        // جدول المعدات
        let equipHTML = '';
        res.equipment.forEach(eq => {
            if (eq.name) equipHTML += `<tr><td>${eq.name}</td><td>${eq.power} kW</td><td>${currency} ${eq.cost}</td><td>${eq.space}${T('s47')}`;
        });

        // بطاقات KPI
        const kpiCards = document.querySelectorAll('.result-card');
        let kpiRows = ''; let row = ''; let count = 0;
        kpiCards.forEach((card, index) => {
            const icon = card.querySelector('i') ? card.querySelector('i').outerHTML : '';
            const title = card.querySelector('h4') ? card.querySelector('h4').innerText : '';
            const value = card.querySelector('.value') ? card.querySelector('.value').innerText : '';
            const unit = card.querySelector('.unit') ? card.querySelector('.unit').innerText : '';
            const status = card.querySelector('.status') ? card.querySelector('.status').outerHTML : '';
            const cell = `<td style="border:1px solid #b8860b; padding:12px; text-align:center; background:#fefcf6;">${icon}<h4 style="margin:0.5rem 0; color:#666;">${title}</h4><div style="font-size:1.6rem; font-weight:900; color:#b8860b;">${value}</div>${unit ? `<div style="font-size:0.9rem; color:#777;">${unit}</div>` : ''}${status ? status.replace(/class="status/g, 'style="margin-top:0.3rem; padding:0.2rem 0.6rem; border-radius:20px; display:inline-block;') : ''}</td>`;
            row += cell; count++;
            if (count % 2 === 0 || index === kpiCards.length - 1) { kpiRows += `<tr>${row}</tr>`; row = ''; }
        });

        const ratingHTML = document.getElementById('projectRatingCard').innerHTML;
        const warningsHTML = document.getElementById('warnings').innerHTML;
        const now = new Date();
        const dateStr = now.toLocaleDateString(FG.locale(), { year: 'numeric', month: 'long', day: 'numeric' });

        const fullHtml = `${T('s48')}${companyName}${T('s49')}${dateStr}${T('s50')}${currency}${T('s51')}${kitchenType}${T('s52')}${res.seats}${T('s53')}${serviceModel}${T('s54')}${res.hoursOpen}${T('s55')}${shifts}${T('s56')}${res.totalArea}${T('s57')}${res.kitchenPercent}${T('s58')}${res.electricalCapacity}${T('s59')}${water}${T('s60')}${ventilation}${T('s61')}${delivery}${T('s62')}${equipHTML}${T('s63')}${kpiRows}</table>
            ${warningsHTML ? `<div style="background:#fff3cd;padding:15px;border-radius:10px;border-right:4px solid #ffc107;margin:20px 0;">${warningsHTML}</div>` : ''}${T('s64')}${img1}${T('s65')}${img2}${T('s66')}${ratingHTML}${T('s67')}${now.getFullYear()}</div>
        </body></html>`;

        const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${T('s68')}${companyName}_${now.toISOString().slice(0,10)}.doc`;
        link.click();
        URL.revokeObjectURL(link.href);
    } catch (error) { console.error(error); alert(T('s69')); } finally { hideLoading(); }
}

// ================================================================
// ========== تصدير Excel احترافي (متطابق مع المالي) ==========
// ================================================================
async function exportToFullExcel() {
    if (!window.lastResults) { alert(T('s70')); return; }
    showLoading(T('s71'), T('s72'));
    try {
        const res = window.lastResults;
        const currency = res.currency;
        const companyName = res.companyName;

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
        const cv = workbook.addWorksheet(T('s73'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
        [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
        cv.getRow(2).height=80; cv.getRow(4).height=60;
        cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1);
        bc.value=T('s74');
        bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};
        mh(cv,1,4,4,`${T('s75')}${companyName}`,DB,GL,18);
        const inf=[[T('s76'),companyName],[T('s77'),new Date().toLocaleDateString(FG.locale())],[T('s78'),currency],[T('s79'),`${currency} ${res.accountingProfit.toFixed(0)}`],[T('s80'),res.paybackMonths===Infinity?T('s81'):`${res.paybackMonths.toFixed(1)}${T('s82')}`]];
        let ir=6;
        inf.forEach(([l,v],idx)=>{
            cv.mergeCells(ir,1,ir,2); cv.mergeCells(ir,3,ir,4);
            const lc=cv.getCell(ir,1), vc=cv.getCell(ir,3); lc.value=l; vc.value=v;
            const bg=idx%2===0?AR:'FFFEFCF6';
            ap(lc,{font:{name:'Arial',bold:true,size:11,color:{argb:'00695C'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'right',vertical:'middle',readingOrder:FG.dir()},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
            ap(vc,{font:{name:'Arial',size:11,color:{argb:DT}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',readingOrder:FG.dir()},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
            cv.getRow(ir).height=28; ir++;
        });

        // 2. المدخلات والافتراضات
        const inputsSheet = workbook.addWorksheet(T('s83'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
        inputsSheet.getColumn(1).width=5; inputsSheet.getColumn(2).width=38; inputsSheet.getColumn(3).width=22; inputsSheet.getColumn(4).width=22; inputsSheet.getColumn(5).width=5;
        mh(inputsSheet,1,5,1,T('s84'),DB,GL,14);
        inputsSheet.getRow(1).height=40;
        mh(inputsSheet,2,4,2,T('s85'),SB,'FFFFFFFF',11);
        inputsSheet.getRow(2).height=28;
        const inputFields = [
            [T('s86'), document.getElementById('kitchenType').options[document.getElementById('kitchenType').selectedIndex].text, ''],
            [T('s87'), res.seats, ''],
            [T('s88'), document.getElementById('serviceModel').options[document.getElementById('serviceModel').selectedIndex].text, ''],
            [T('s89'), res.hoursOpen, T('s90')],
            [T('s91'), document.getElementById('shifts').options[document.getElementById('shifts').selectedIndex].text, ''],
            [T('s92'), res.totalArea, T('s93')],
            [T('s94'), res.kitchenPercent, '%'],
            [T('s95'), res.electricalCapacity, T('s96')],
            [T('s97'), res.waterAvailabilityText, ''],
            [T('s98'), res.ventilationText, ''],
            [T('s99'), res.deliveryAccessText, ''],
            [T('s100'), res.equipment.length, ''],
            [T('s101'), res.totalPower, 'kW'],
            [T('s102'), `${currency} ${res.equipmentCost.toFixed(0)}`, ''],
            [T('s103'), res.totalSpace, T('s93')],
            [T('s104'), res.turnoverRate, ''],
            [T('s105'), res.peakHours, ''],
            [T('s106'), res.occupancyRate*100, '%'],
            [T('s107'), `${currency} ${res.avgMealPrice}`, ''],
            [T('s108'), res.foodCostPercent*100, '%'],
            [T('s109'), res.employeesCount, ''],
            [T('s110'), `${currency} ${res.avgSalary}`, ''],
            [T('s111'), `${currency} ${res.monthlyRent}`, ''],
            [T('s112'), `${currency} ${res.otherOpCost}`, ''],
            [T('s113'), res.equipmentLife, T('s114')],
            [T('s115'), `${currency} ${res.constructionCost}`, ''],
            [T('s116'), `${currency} ${res.licensesCost}`, ''],
            [T('s117'), `${currency} ${res.workingCapital}`, '']
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
        const kpiSheet = workbook.addWorksheet(T('s118'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
        [5,32,22,22,22,5].forEach((w,i)=>kpiSheet.getColumn(i+1).width=w);
        mh(kpiSheet,1,6,1,T('s119'),DB,GL,15);
        kpiSheet.getRow(1).height=45;
        mh(kpiSheet,2,5,2,`${companyName} | ${new Date().toLocaleDateString(FG.locale())}`,HB,'FFFFFFFF',10);
        kpiSheet.getRow(2).height=26;
        const kpis = [
            { label: T('s120'), value: `${currency} ${Math.round(res.monthlyRevenue)}`, good: true },
            { label: T('s39'), value: `${currency} ${Math.round(res.accountingProfit)}`, good: res.accountingProfit>0 },
            { label: T('s121'), value: `${currency} ${Math.round(res.breakEvenRevenue)}`, good: true },
            { label: T('s122'), value: res.paybackMonths===Infinity?T('s81'):`${res.paybackMonths.toFixed(1)}${T('s82')}`, good: res.paybackMonths<24 },
            { label: 'Prime Cost', value: `${res.primePercent.toFixed(1)}%`, good: res.primePercent<65 },
            { label: T('s123'), value: `${res.profitMarginPct.toFixed(1)}%`, good: res.accountingProfit>0 }
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
        kFinal.value=res.accountingProfit>0?T('s124'):T('s125');
        kFinal.font={name:'Arial',bold:true,size:13,color:{argb:res.accountingProfit>0?PT:'856404'}};
        kFinal.fill={type:'pattern',pattern:'solid',fgColor:{argb:res.accountingProfit>0?PB:GB}};
        kFinal.alignment={horizontal:'center',vertical:'middle',readingOrder:FG.dir()};
        kFinal.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};
        kpiSheet.getRow(kRow).height=40;

        // 4. الملخص المالي
        const summarySheet = workbook.addWorksheet(T('s126'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
        summarySheet.getColumn(1).width=5; summarySheet.getColumn(2).width=35; summarySheet.getColumn(3).width=25; summarySheet.getColumn(4).width=25; summarySheet.getColumn(5).width=5;
        mh(summarySheet,1,5,1,T('s127'),DB,GL,14);
        summarySheet.getRow(1).height=40;
        const summData = [
            [T('s128'), `${currency} ${res.totalInvestment.toFixed(0)}`, '', ''],
            [T('s129'), `${currency} ${res.monthlyRevenue.toFixed(0)}`, T('s130'), `${res.technicalScore}/100 (${res.technicalRating})`],
            [T('s131'), `${currency} ${res.totalMonthlyExpenses.toFixed(0)}`, T('s132'), `${res.financialScore}/100 (${res.financialRating})`],
            [T('s133'), `${currency} ${res.accountingProfit.toFixed(0)}`, T('s134'), `${currency} ${res.breakEvenRevenue.toFixed(0)}`],
            [T('s135'), res.paybackMonths===Infinity?T('s136'):`${res.paybackMonths.toFixed(1)}${T('s137')}`, T('s138'), `${res.marginOfSafetyPct.toFixed(1)}%`]
        ];
        let sRow=2;
        summData.forEach(([l1,v1,l2,v2],idx)=>{
            summarySheet.getRow(sRow).height=30;
            const bg=idx%2===0?'FFFEFCF6':'FFFFFFFF';
            const c1=summarySheet.getCell(sRow,2); c1.value=l1; ap(c1,cs(bg,DT,true,FG.start()));
            const c2=summarySheet.getCell(sRow,3); c2.value=v1; ap(c2,{...cs(bg,'0000FF',false,'center'),numFmt:typeof v1==='number'?'#,##0':null});
            if(l2){ const c3=summarySheet.getCell(sRow,4); c3.value=l2; ap(c3,cs(bg,DT,true,FG.start()));
            const c4=summarySheet.getCell(sRow,5); c4.value=v2; ap(c4,cs(bg,'00695C',false,'center')); }
            sRow++;
        });

        // 5. الرسوم البيانية
        const chartsSheet = workbook.addWorksheet(T('s139'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
        chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
        mh(chartsSheet,1,3,1,T('s140'),DB,GL,14);
        chartsSheet.getRow(1).height=40;
        const chartContainer = document.querySelectorAll('.chart-container');
        if (chartContainer.length) {
            try {
                const parent = chartContainer[0].parentElement;
                const origBg = parent.style.backgroundColor;
                parent.style.backgroundColor = '#ffffff';
                const canvasImg = await html2canvas(parent, { scale: 2, backgroundColor: '#ffffff' });
                parent.style.backgroundColor = origBg;
                const imgData = canvasImg.toDataURL('image/png');
                const imageId = workbook.addImage({ base64: imgData, extension: 'png' });
                chartsSheet.addImage(imageId, { tl: { col: 1, row: 2 }, br: { col: 2, row: 28 }, editAs: 'oneCell' });
            } catch (err) {}
        }

        // 6. التقييم والتوصيات
        const evalSheet = workbook.addWorksheet(T('s141'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
        evalSheet.getColumn(1).width=5; evalSheet.getColumn(2).width=50; evalSheet.getColumn(3).width=5;
        mh(evalSheet,1,3,1,T('s142'),DB,GL,14);
        evalSheet.getRow(1).height=45;
        const warningsText = res.warnings && res.warnings.length ? res.warnings.join('\n') : T('s143');
        const sections = [
            { title: T('s144'), content: `${T('s145')}${res.technicalScore}/100 (${res.technicalRating}${T('s146')}${res.financialScore}/100 (${res.financialRating})` },
            { title: T('s147'), content: warningsText },
            { title: T('s148'), content: res.accountingProfit>0 ? T('s149') : T('s150') },
            { title: T('s151'), content: T('s152') }
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
        const fileName = `${T('s153')}${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
        saveAs(blob, fileName);
    } catch(err) { console.error(err); alert(T('s154') + err.message); } finally { hideLoading(); }
}

// ===== شاشة تحميل التصدير =====
function showLoading(title, msg) {
    document.getElementById('loadingTitle').textContent = title;
    document.getElementById('loadingMsg').textContent = msg;
    document.getElementById('exportLoading').classList.add('show');
}
function hideLoading() {
    document.getElementById('exportLoading').classList.remove('show');
}

// إضافة عنصر التحميل إذا لم يكن موجوداً
if (!document.getElementById('exportLoading')) {
    const loadDiv = document.createElement('div');
    loadDiv.className = 'export-loading';
    loadDiv.id = 'exportLoading';
    loadDiv.innerHTML = `${T('s155')}`;
    document.body.appendChild(loadDiv);
}

document.getElementById('exportWordBtn').addEventListener('click', exportToWord);
document.getElementById('exportFullExcelBtn').addEventListener('click', exportToFullExcel);
updatePowerAlert();
