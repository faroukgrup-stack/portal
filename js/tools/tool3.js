
AOS.init({ duration: 800, once: true, offset: 100 });

// ===== آلة حاسبة =====
const calcDisplay = document.getElementById('calcDisplay');
let currentCalcInput = '';
function handleCalc(v) {
    if (v === 'C') { currentCalcInput = ''; calcDisplay.value = ''; return; }
    if (v === '⌫') { currentCalcInput = currentCalcInput.slice(0, -1); calcDisplay.value = currentCalcInput; return; }
    if (v === '=') { try { let r = eval(currentCalcInput.replace(/×/g,'*').replace(/÷/g,'/')); calcDisplay.value = r; currentCalcInput = r.toString(); } catch(e) { calcDisplay.value = 'خطأ'; currentCalcInput = ''; } return; }
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
    row.innerHTML = `<input type="text" class="eq-name" placeholder="اسم المعدة" value="${name}"><input type="number" class="eq-power" placeholder="القدرة (kW)" value="${power}" step="0.1" min="0"><input type="number" class="eq-cost" placeholder="السعر" value="${cost}" step="100" min="0"><input type="number" class="eq-space" placeholder="المساحة (م²)" value="${space}" step="0.1" min="0"><button class="remove-equipment" onclick="this.parentElement.remove()">×</button>`;
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
function calculateEquipmentTotals() {
    const equipment = getEquipmentData();
    let totalPower = 0, totalCost = 0, totalSpace = 0;
    equipment.forEach(eq => { totalPower += eq.power; totalCost += eq.cost; totalSpace += eq.space; });
    return { totalPower, totalCost, totalSpace };
}
function updatePowerAlert() {
    const electricalCapacity = parseFloat(document.getElementById('electricalCapacity').value) || 200;
    const { totalPower } = calculateEquipmentTotals();
    const requiredAmps = (totalPower * 1000) / 220;
    const powerAlert = document.getElementById('powerAlert');
    if (requiredAmps > electricalCapacity) {
        powerAlert.style.display = 'block';
        powerAlert.className = 'alert alert-danger';
        powerAlert.innerHTML = `⚠️ تحذير: إجمالي القدرة المطلوبة (${requiredAmps.toFixed(0)} أمبير) أعلى من قدرة الموقع (${electricalCapacity} أمبير).`;
    } else { powerAlert.style.display = 'none'; }
}
document.getElementById('electricalCapacity').addEventListener('input', updatePowerAlert);
equipmentContainer.addEventListener('input', updatePowerAlert);

// ===== الحساب الرئيسي =====
let financeChart, riskChart;
function calculateAll() {
    const currency = document.getElementById('currencySelect').value;
    const companyName = document.getElementById('companyName').value || 'الجهة المستفيدة';
    const seats = parseFloat(document.getElementById('seats').value) || 50;
    const hoursOpen = parseFloat(document.getElementById('hoursOpen').value) || 12;
    const totalArea = parseFloat(document.getElementById('totalArea').value) || 150;
    const kitchenPercent = parseFloat(document.getElementById('kitchenPercent').value) || 35;
    const electricalCapacity = parseFloat(document.getElementById('electricalCapacity').value) || 200;
    const waterAvailabilityText = document.getElementById('waterAvailability').options[document.getElementById('waterAvailability').selectedIndex].text;
    const ventilationText = document.getElementById('ventilation').options[document.getElementById('ventilation').selectedIndex].text;
    const deliveryAccessText = document.getElementById('deliveryAccess').options[document.getElementById('deliveryAccess').selectedIndex].text;
    const { totalPower, totalCost: equipmentCost, totalSpace } = calculateEquipmentTotals();
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

    const kitchenArea = totalArea * (kitchenPercent / 100);
    const remainingArea = totalArea - kitchenArea;
    const diningArea = remainingArea * 0.75;
    const seatDensity = diningArea / seats;
    const maxCustomersDaily = seats * turnoverRate;
    const actualCustomersDaily = maxCustomersDaily * occupancyRate;
    const monthlyRevenue = actualCustomersDaily * avgMealPrice * 26;
    const monthlyFoodCost = monthlyRevenue * foodCostPercent;
    const monthlyLaborCost = employeesCount * avgSalary;
    const monthlyFixedCosts = monthlyRent + otherOpCost;
    const totalMonthlyExpenses = monthlyFoodCost + monthlyLaborCost + monthlyFixedCosts;
    const netProfit = monthlyRevenue - totalMonthlyExpenses;
    const totalInvestment = constructionCost + licensesCost + equipmentCost + workingCapital;
    const monthlyDepreciation = equipmentCost / (equipmentLife * 12);
    const netProfitAfterDepreciation = netProfit - monthlyDepreciation;
    const accountingProfit = netProfitAfterDepreciation;
    const contributionPerMeal = avgMealPrice * (1 - foodCostPercent);
    const breakEvenMeals = (monthlyFixedCosts + monthlyLaborCost) / contributionPerMeal;
    const breakEvenRevenue = breakEvenMeals * avgMealPrice;
    const revenuePerSeat = monthlyRevenue / seats;
    const primeCost = monthlyFoodCost + monthlyLaborCost;
    const primePercent = (primeCost / monthlyRevenue) * 100;
    const laborCostPercent = (monthlyLaborCost / monthlyRevenue) * 100;
    const fixedCostPercent = (monthlyFixedCosts / monthlyRevenue) * 100;
    const riskRevenue = monthlyRevenue * 0.8;
    const riskProfit = riskRevenue - (riskRevenue * foodCostPercent) - monthlyLaborCost - monthlyFixedCosts - monthlyDepreciation;
    const paybackMonths = (accountingProfit > 0) ? totalInvestment / accountingProfit : Infinity;

    const warnings = [];
    if (seatDensity < 1.2) warnings.push("⚠️ الكراسي كثيرة والمساحة ضيقة (كثافة مرتفعة)");
    if (seats / employeesCount < 8) warnings.push("⚠️ عدد الموظفين مرتفع مقارنة بعدد الكراسي");
    if (primePercent > 65) warnings.push("⚠️ Prime Cost مرتفع (>65%)");
    if (accountingProfit < 0) warnings.push("🔴 المشروع خاسر حسب التقديرات الحالية");
    if (monthlyFixedCosts < monthlyRevenue * 0.15) warnings.push("⚠️ التكاليف الثابتة منخفضة جداً (<15% من الإيرادات)");
    if (laborCostPercent < 15) warnings.push("⚠️ نسبة تكلفة العمالة منخفضة جداً (<15%)");
    if (totalInvestment / seats > 5000) warnings.push("💡 استثمار مرتفع لكل كرسي، تأكد من جدوى ذلك");

    // التقييم الفني
    let technicalScore = 0; const requiredAmps = (totalPower * 1000) / 220;
    if (electricalCapacity >= requiredAmps * 1.2) technicalScore += 40; else if (electricalCapacity >= requiredAmps) technicalScore += 30; else if (electricalCapacity >= requiredAmps * 0.8) technicalScore += 15; else technicalScore += 5;
    if (waterAvailabilityText.includes('مناسب')) technicalScore += 15; else if (waterAvailabilityText.includes('تطوير')) technicalScore += 5;
    if (ventilationText.includes('مناسب')) technicalScore += 15; else if (ventilationText.includes('تطوير')) technicalScore += 5;
    if (seatDensity >= 1.2 && seatDensity <= 1.8) technicalScore += 15; else if (seatDensity >= 1.0 && seatDensity < 1.2) technicalScore += 8; else if (seatDensity > 1.8 && seatDensity <= 2.2) technicalScore += 8;
    if (totalSpace <= kitchenArea * 0.5) technicalScore += 15; else if (totalSpace <= kitchenArea * 0.7) technicalScore += 8;
    technicalScore = Math.min(technicalScore, 100);
    let technicalRating = '', technicalColor = '';
    if (technicalScore >= 85) { technicalRating = '🟢 ممتاز'; technicalColor = 'alert-success'; }
    else if (technicalScore >= 70) { technicalRating = '🟡 جيد'; technicalColor = 'alert-warning'; }
    else if (technicalScore >= 50) { technicalRating = '🟠 متوسط'; technicalColor = 'alert-warning'; }
    else { technicalRating = '🔴 ضعيف'; technicalColor = 'alert-danger'; }

    // التقييم المالي
    let financialScore = 0;
    if (primePercent <= 55) financialScore += 30; else if (primePercent <= 65) financialScore += 20; else if (primePercent <= 75) financialScore += 10;
    if (accountingProfit > 0) { const profitMargin = accountingProfit / monthlyRevenue; if (profitMargin >= 0.2) financialScore += 30; else if (profitMargin >= 0.1) financialScore += 20; else if (profitMargin >= 0.05) financialScore += 15; else financialScore += 10; }
    if (accountingProfit > 0 && totalInvestment > 0) { if (paybackMonths <= 12) financialScore += 20; else if (paybackMonths <= 24) financialScore += 15; else if (paybackMonths <= 36) financialScore += 10; else financialScore += 5; } else if (accountingProfit <= 0) { financialScore = Math.max(0, financialScore - 10); }
    const maxMonthlyMeals = maxCustomersDaily * 26;
    if (breakEvenMeals <= maxMonthlyMeals * 0.5) financialScore += 20; else if (breakEvenMeals <= maxMonthlyMeals * 0.7) financialScore += 15; else if (breakEvenMeals <= maxMonthlyMeals * 0.9) financialScore += 10; else if (breakEvenMeals <= maxMonthlyMeals) financialScore += 5;
    financialScore = Math.min(financialScore, 100);
    let financialRating = '', financialColor = '';
    if (financialScore >= 85) { financialRating = '🟢 ممتاز'; financialColor = 'alert-success'; }
    else if (financialScore >= 70) { financialRating = '🟡 جيد'; financialColor = 'alert-warning'; }
    else if (financialScore >= 50) { financialRating = '🟠 متوسط'; financialColor = 'alert-warning'; }
    else { financialRating = '🔴 ضعيف'; financialColor = 'alert-danger'; }

    // عرض النتائج
    document.getElementById('initialMessage').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('kpiCards').innerHTML = `
        <div class="result-card"><i class="fas fa-dollar-sign"></i><h4>الإيرادات الشهرية</h4><div class="value">${currency}${Math.round(monthlyRevenue)}</div></div>
        <div class="result-card"><i class="fas fa-file-invoice"></i><h4>صافي الربح (بعد الإهلاك)</h4><div class="value">${currency}${Math.round(accountingProfit)}</div><div class="status ${accountingProfit > 0 ? 'status-good' : 'status-bad'}">${accountingProfit > 0 ? 'مربح' : 'خاسر'}</div></div>
        <div class="result-card"><i class="fas fa-chart-line"></i><h4>نقطة التعادل (إيرادات)</h4><div class="value">${currency}${Math.round(breakEvenRevenue)}</div></div>
        <div class="result-card"><i class="fas fa-hand-holding-usd"></i><h4>فترة الاسترداد</h4><div class="value">${paybackMonths === Infinity ? '∞' : paybackMonths.toFixed(1)}</div><div class="unit">شهر</div></div>
    `;
    if (warnings.length > 0) {
        document.getElementById('warnings').style.display = 'block';
        document.getElementById('warnings').innerHTML = `<strong>⚠️ تحذيرات:</strong><br>${warnings.join('<br>')}`;
        document.getElementById('warnings').className = 'alert alert-warning';
    } else { document.getElementById('warnings').style.display = 'none'; }
    document.getElementById('projectRatingCard').innerHTML = `
        <h3><i class="fas fa-star"></i> تقييم المشروع</h3>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 200px;"><h4>التقييم الفني</h4><div class="alert ${technicalColor}" style="font-size:1.2rem;">${technicalRating}</div><p>الدرجة الفنية: ${technicalScore}/100</p></div>
            <div style="flex: 1; min-width: 200px;"><h4>التقييم المالي</h4><div class="alert ${financialColor}" style="font-size:1.2rem;">${financialRating}</div><p>الدرجة المالية: ${financialScore}/100</p></div>
        </div>
    `;
    if (financeChart) financeChart.destroy();
    const ctx1 = document.getElementById('financeChart').getContext('2d');
    financeChart = new Chart(ctx1, {
        type: 'bar',
        data: { labels: ['الإيرادات', 'تكلفة الطعام', 'الرواتب', 'التكاليف الثابتة', 'صافي الربح'], datasets: [{ label: `القيمة (${currency})`, data: [monthlyRevenue, monthlyFoodCost, monthlyLaborCost, monthlyFixedCosts, accountingProfit], backgroundColor: ['#28a745', '#ffc107', '#17a2b8', '#fd7e14', '#b8860b'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
    if (riskChart) riskChart.destroy();
    const ctx2 = document.getElementById('riskChart').getContext('2d');
    riskChart = new Chart(ctx2, {
        type: 'bar',
        data: { labels: ['عادي', 'انخفاض 20%'], datasets: [{ label: `صافي الربح (${currency})`, data: [accountingProfit, riskProfit], backgroundColor: ['#28a745', '#dc3545'] }] },
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
        financialScore, financialRating, financialColor
    };
}
document.getElementById('calculateBtn').addEventListener('click', calculateAll);

// ================================================================
// ========== تصدير Word احترافي (متطابق مع المالي) ==========
// ================================================================
async function exportToWord() {
    if (document.getElementById('resultsSection').style.display === 'none') { alert('الرجاء إجراء التحليل أولاً.'); return; }
    showLoading('جاري إنشاء تقرير Word الاحترافي...', 'جمع البيانات والرسوم البيانية');
    try {
        const currency = document.getElementById('currencySelect').value;
        const companyName = document.getElementById('companyName').value || 'الجهة المستفيدة';
        const res = window.lastResults;
        if (!res) { alert('الرجاء إجراء التحليل أولاً.'); hideLoading(); return; }

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
            if (eq.name) equipHTML += `<tr><td>${eq.name}</td><td>${eq.power} kW</td><td>${currency} ${eq.cost}</td><td>${eq.space} م²</td></tr>`;
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
        const dateStr = now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

        const fullHtml = `<!DOCTYPE html>
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>تقرير الجدوى الفنية - FAROUK GRUP</title>
        <style>
            body{font-family:'Arial',sans-serif;direction:rtl;margin:2rem;background:#fff;color:#333;}
            .cover{text-align:center;border-bottom:4px solid #b8860b;margin-bottom:30px;padding-bottom:20px;}
            .cover h1{font-size:32px;color:#b8860b;margin:0;}.cover h2{font-size:24px;color:#b48554;margin:5px 0;}
            table{width:100%;border-collapse:collapse;margin:20px 0;} th,td{border:1px solid #b8860b;padding:8px;text-align:center;}
            th{background:#fefcf6;color:#b8860b;}
            .chart-img{max-width:100%;border:1px solid #b8860b;border-radius:10px;margin:20px 0;}
            .footer{text-align:center;margin-top:40px;color:#888;border-top:1px dashed #b8860b;padding-top:10px;}
        </style></head>
        <body>
            <div class="cover">
                <h1>مجموعة فاروق للاستشارات والأعمال</h1>
                <h2>تقرير الجدوى الفنية المتقدمة للمطاعم</h2>
                <p>الجهة: ${companyName} | التاريخ: ${dateStr}</p>
                <p>العملة: ${currency}</p>
            </div>
            <h2 style="color:#b8860b;">المدخلات الأساسية</h2>
            <table>
                <tr><th>نوع المطبخ</th><td>${kitchenType}</td><th>عدد الكراسي</th><td>${res.seats}</td></tr>
                <tr><th>نموذج الخدمة</th><td>${serviceModel}</td><th>ساعات العمل</th><td>${res.hoursOpen} ساعة/يوم</td></tr>
                <tr><th>فترات التشغيل</th><td>${shifts}</td><th>المساحة الإجمالية</th><td>${res.totalArea} م²</td></tr>
                <tr><th>نسبة المطبخ</th><td>${res.kitchenPercent}%</td><th>قدرة الكهرباء</th><td>${res.electricalCapacity} أمبير</td></tr>
                <tr><th>المياه</th><td>${water}</td><th>التهوية</th><td>${ventilation}</td></tr>
                <tr><th>سهولة التوصيل</th><td>${delivery}</td><th></th><td></td></tr>
            </table>
            <h3 style="color:#b8860b;">المعدات</h3>
            <table><thead><tr><th>المعدة</th><th>القدرة (kW)</th><th>التكلفة</th><th>المساحة (م²)</th></tr></thead><tbody>${equipHTML}</tbody></table>
            <h2 style="color:#b8860b;">مؤشرات الأداء الرئيسية</h2>
            <table>${kpiRows}</table>
            ${warningsHTML ? `<div style="background:#fff3cd;padding:15px;border-radius:10px;border-right:4px solid #ffc107;margin:20px 0;">${warningsHTML}</div>` : ''}
            <h2 style="color:#b8860b;">📈 الرسوم البيانية</h2>
            <div style="display:flex;gap:20px;flex-wrap:wrap;justify-content:center;">
                <div style="flex:1;min-width:300px;"><h3>تحليل الأداء المالي</h3><img src="${img1}" class="chart-img"/></div>
                <div style="flex:1;min-width:300px;"><h3>تحليل المخاطر</h3><img src="${img2}" class="chart-img"/></div>
            </div>
            <h2 style="color:#b8860b;">💡 تقييم المشروع والتوصيات</h2>
            <div style="background:#fefcf6;padding:15px;border-radius:10px;border-right:4px solid #b8860b;">${ratingHTML}</div>
            <div class="footer">تم الإنشاء بواسطة مجموعة فاروق للاستشارات والأعمال © ${now.getFullYear()}</div>
        </body></html>`;

        const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `تقرير_فني_مطعم_${companyName}_${now.toISOString().slice(0,10)}.doc`;
        link.click();
        URL.revokeObjectURL(link.href);
    } catch (error) { console.error(error); alert('خطأ في إنشاء تقرير Word'); } finally { hideLoading(); }
}

// ================================================================
// ========== تصدير Excel احترافي (متطابق مع المالي) ==========
// ================================================================
async function exportToFullExcel() {
    if (!window.lastResults) { alert('الرجاء إجراء التحليل أولاً (اضغط على "احسب الدراسة الفنية").'); return; }
    showLoading('جاري إنشاء تقرير Excel الاحترافي...', 'إنشاء الأوراق والرسوم البيانية');
    try {
        const res = window.lastResults;
        const currency = res.currency;
        const companyName = res.companyName;

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'FAROUK GRUP';
        const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050';
        const AR = 'FFF5F0E8', DT = 'FF1A1A1A', PB = 'FFD4EDDA', NB = 'FFF8D7DA', GB = 'FFFFF3CD';
        const PT = 'FF155724', NT = 'FF721C24';

        function hs(bg=HB, tc=GL){return{font:{name:'Arial',bold:true,size:11,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',wrapText:true,readingOrder:'rtl'},border:{top:{style:'thin',color:{argb:G}},bottom:{style:'thin',color:{argb:G}},left:{style:'thin',color:{argb:G}},right:{style:'thin',color:{argb:G}}}};}
        function cs(bg='FFFFFFFF',tc=DT,b=false,h='center'){return{font:{name:'Arial',bold:b,size:10,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:h,vertical:'middle',wrapText:true,readingOrder:'rtl'},border:{top:{style:'hair',color:{argb:'FFCCCCCC'}},bottom:{style:'hair',color:{argb:'FFCCCCCC'}},left:{style:'hair',color:{argb:'FFCCCCCC'}},right:{style:'hair',color:{argb:'FFCCCCCC'}}}};}
        function ap(c,s){if(s.font)c.font=s.font;if(s.fill)c.fill=s.fill;if(s.alignment)c.alignment=s.alignment;if(s.border)c.border=s.border;if(s.numFmt)c.numFmt=s.numFmt;}
        function mh(ws,fc,tc,r,text,bg=HB,tc2=GL,fs=12){ws.mergeCells(r,fc,r,tc);const c=ws.getCell(r,fc);c.value=text;c.font={name:'Arial',bold:true,size:fs,color:{argb:tc2}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:'rtl'};c.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};}

        // 1. غلاف التقرير
        const cv = workbook.addWorksheet('غلاف التقرير', { views: [{ rightToLeft: true, showGridLines: false }] });
        [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
        cv.getRow(2).height=80; cv.getRow(4).height=60;
        cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1);
        bc.value='مجموعة فاروق للاستشارات والأعمال\nFAROUK GRUP';
        bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:'rtl'};
        mh(cv,1,4,4,`تقرير الجدوى الفنية المتقدمة للمطاعم\n${companyName}`,DB,GL,18);
        const inf=[['📋 الجهة',companyName],['📅 التاريخ',new Date().toLocaleDateString('ar-EG')],['💰 العملة',currency],['📊 صافي الربح',`${currency} ${res.accountingProfit.toFixed(0)}`],['📈 فترة الاسترداد',res.paybackMonths===Infinity?'غير محددة':`${res.paybackMonths.toFixed(1)} شهر`]];
        let ir=6;
        inf.forEach(([l,v],idx)=>{
            cv.mergeCells(ir,1,ir,2); cv.mergeCells(ir,3,ir,4);
            const lc=cv.getCell(ir,1), vc=cv.getCell(ir,3); lc.value=l; vc.value=v;
            const bg=idx%2===0?AR:'FFFEFCF6';
            ap(lc,{font:{name:'Arial',bold:true,size:11,color:{argb:'00695C'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'right',vertical:'middle',readingOrder:'rtl'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
            ap(vc,{font:{name:'Arial',size:11,color:{argb:DT}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',readingOrder:'rtl'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
            cv.getRow(ir).height=28; ir++;
        });

        // 2. المدخلات والافتراضات
        const inputsSheet = workbook.addWorksheet('المدخلات والافتراضات', { views: [{ rightToLeft: true, showGridLines: false }] });
        inputsSheet.getColumn(1).width=5; inputsSheet.getColumn(2).width=38; inputsSheet.getColumn(3).width=22; inputsSheet.getColumn(4).width=22; inputsSheet.getColumn(5).width=5;
        mh(inputsSheet,1,5,1,'📋 جدول المدخلات والافتراضات الأساسية',DB,GL,14);
        inputsSheet.getRow(1).height=40;
        mh(inputsSheet,2,4,2,'البيانات الأساسية للمشروع',SB,'FFFFFFFF',11);
        inputsSheet.getRow(2).height=28;
        const inputFields = [
            ['نوع المطبخ', document.getElementById('kitchenType').options[document.getElementById('kitchenType').selectedIndex].text, ''],
            ['عدد الكراسي', res.seats, ''],
            ['نموذج الخدمة', document.getElementById('serviceModel').options[document.getElementById('serviceModel').selectedIndex].text, ''],
            ['ساعات العمل اليومية', res.hoursOpen, 'ساعة'],
            ['فترات التشغيل', document.getElementById('shifts').options[document.getElementById('shifts').selectedIndex].text, ''],
            ['المساحة الإجمالية', res.totalArea, 'م²'],
            ['نسبة المطبخ', res.kitchenPercent, '%'],
            ['قدرة الكهرباء', res.electricalCapacity, 'أمبير'],
            ['مصدر المياه', res.waterAvailabilityText, ''],
            ['نظام التهوية', res.ventilationText, ''],
            ['سهولة التوصيل', res.deliveryAccessText, ''],
            ['عدد المعدات', res.equipment.length, ''],
            ['إجمالي قدرة المعدات', res.totalPower, 'kW'],
            ['إجمالي تكلفة المعدات', `${currency} ${res.equipmentCost.toFixed(0)}`, ''],
            ['مساحة المعدات', res.totalSpace, 'م²'],
            ['معدل دوران الطاولة', res.turnoverRate, ''],
            ['ساعات الذروة', res.peakHours, ''],
            ['نسبة الإشغال', res.occupancyRate*100, '%'],
            ['متوسط سعر الوجبة', `${currency} ${res.avgMealPrice}`, ''],
            ['تكلفة الطعام', res.foodCostPercent*100, '%'],
            ['عدد الموظفين', res.employeesCount, ''],
            ['متوسط الراتب', `${currency} ${res.avgSalary}`, ''],
            ['الإيجار الشهري', `${currency} ${res.monthlyRent}`, ''],
            ['مصاريف تشغيل أخرى', `${currency} ${res.otherOpCost}`, ''],
            ['العمر الإنتاجي للمعدات', res.equipmentLife, 'سنة'],
            ['تكلفة الديكور', `${currency} ${res.constructionCost}`, ''],
            ['التراخيص', `${currency} ${res.licensesCost}`, ''],
            ['رأس المال العامل', `${currency} ${res.workingCapital}`, '']
        ];
        let iRow=3;
        inputFields.forEach(([label,val,note],idx)=>{
            inputsSheet.getRow(iRow).height=24;
            const bg=idx%2===0?'FFFEFCF6':'FFFFFFFF';
            const lc=inputsSheet.getCell(iRow,2), vc=inputsSheet.getCell(iRow,3), nc=inputsSheet.getCell(iRow,4);
            lc.value=label; vc.value=val; nc.value=note;
            ap(lc,cs(bg,DT,true,'right'));
            ap(vc,{...cs(bg,'0000FF',false,'center'),numFmt:typeof val==='number'?'#,##0':null});
            ap(nc,cs(bg,'00695C',false,'center'));
            iRow++;
        });

        // 3. مؤشرات الأداء
        const kpiSheet = workbook.addWorksheet('مؤشرات الأداء', { views: [{ rightToLeft: true, showGridLines: false }] });
        [5,32,22,22,22,5].forEach((w,i)=>kpiSheet.getColumn(i+1).width=w);
        mh(kpiSheet,1,6,1,'📊 لوحة مؤشرات الأداء الرئيسية',DB,GL,15);
        kpiSheet.getRow(1).height=45;
        mh(kpiSheet,2,5,2,`${companyName} | ${new Date().toLocaleDateString('ar-EG')}`,HB,'FFFFFFFF',10);
        kpiSheet.getRow(2).height=26;
        const kpis = [
            { label: 'الإيرادات الشهرية', value: `${currency} ${Math.round(res.monthlyRevenue)}`, good: true },
            { label: 'صافي الربح', value: `${currency} ${Math.round(res.accountingProfit)}`, good: res.accountingProfit>0 },
            { label: 'نقطة التعادل', value: `${currency} ${Math.round(res.breakEvenRevenue)}`, good: true },
            { label: 'فترة الاسترداد', value: res.paybackMonths===Infinity?'غير محددة':`${res.paybackMonths.toFixed(1)} شهر`, good: res.paybackMonths<24 },
            { label: 'Prime Cost', value: `${res.primePercent.toFixed(1)}%`, good: res.primePercent<65 },
            { label: 'هامش الربح', value: `${((res.accountingProfit/res.monthlyRevenue)*100).toFixed(1)}%`, good: res.accountingProfit>0 }
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
            lc2.font={name:'Arial',bold:true,size:11,color:{argb:DT}}; lc2.alignment={horizontal:'right',vertical:'middle',readingOrder:'rtl'};
            vc3.font={name:'Arial',bold:true,size:13,color:{argb:tc}}; vc3.alignment={horizontal:'center',vertical:'middle'};
            kRow++;
        });
        kRow++;
        kpiSheet.mergeCells(kRow,2,kRow,5);
        const kFinal=kpiSheet.getCell(kRow,2);
        kFinal.value=res.accountingProfit>0?'✅ المشروع مجدٍ مالياً (ربح موجب)':'⚠️ المشروع غير مجدٍ (خسارة)';
        kFinal.font={name:'Arial',bold:true,size:13,color:{argb:res.accountingProfit>0?PT:'856404'}};
        kFinal.fill={type:'pattern',pattern:'solid',fgColor:{argb:res.accountingProfit>0?PB:GB}};
        kFinal.alignment={horizontal:'center',vertical:'middle',readingOrder:'rtl'};
        kFinal.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};
        kpiSheet.getRow(kRow).height=40;

        // 4. الملخص المالي
        const summarySheet = workbook.addWorksheet('الملخص المالي', { views: [{ rightToLeft: true, showGridLines: false }] });
        summarySheet.getColumn(1).width=5; summarySheet.getColumn(2).width=35; summarySheet.getColumn(3).width=25; summarySheet.getColumn(4).width=25; summarySheet.getColumn(5).width=5;
        mh(summarySheet,1,5,1,'📋 الملخص المالي والفني',DB,GL,14);
        summarySheet.getRow(1).height=40;
        const summData = [
            ['الاستثمار الإجمالي', `${currency} ${res.totalInvestment.toFixed(0)}`, '', ''],
            ['الإيرادات الشهرية', `${currency} ${res.monthlyRevenue.toFixed(0)}`, 'التقييم الفني', `${res.technicalScore}/100 (${res.technicalRating})`],
            ['إجمالي التكاليف', `${currency} ${res.totalMonthlyExpenses.toFixed(0)}`, 'التقييم المالي', `${res.financialScore}/100 (${res.financialRating})`],
            ['صافي الربح', `${currency} ${res.accountingProfit.toFixed(0)}`, 'نقطة التعادل', `${currency} ${res.breakEvenRevenue.toFixed(0)}`],
            ['فترة الاسترداد', res.paybackMonths===Infinity?'غير محددة':`${res.paybackMonths.toFixed(1)} شهر`, 'هامش الأمان', `${((res.monthlyRevenue - res.breakEvenRevenue) / res.monthlyRevenue * 100).toFixed(1)}%`]
        ];
        let sRow=2;
        summData.forEach(([l1,v1,l2,v2],idx)=>{
            summarySheet.getRow(sRow).height=30;
            const bg=idx%2===0?'FFFEFCF6':'FFFFFFFF';
            const c1=summarySheet.getCell(sRow,2); c1.value=l1; ap(c1,cs(bg,DT,true,'right'));
            const c2=summarySheet.getCell(sRow,3); c2.value=v1; ap(c2,{...cs(bg,'0000FF',false,'center'),numFmt:typeof v1==='number'?'#,##0':null});
            if(l2){ const c3=summarySheet.getCell(sRow,4); c3.value=l2; ap(c3,cs(bg,DT,true,'right'));
            const c4=summarySheet.getCell(sRow,5); c4.value=v2; ap(c4,cs(bg,'00695C',false,'center')); }
            sRow++;
        });

        // 5. الرسوم البيانية
        const chartsSheet = workbook.addWorksheet('الرسوم البيانية', { views: [{ rightToLeft: true, showGridLines: false }] });
        chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
        mh(chartsSheet,1,3,1,'📊 الرسوم البيانية للمشروع',DB,GL,14);
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
        const evalSheet = workbook.addWorksheet('التقييم والتوصيات', { views: [{ rightToLeft: true, showGridLines: false }] });
        evalSheet.getColumn(1).width=5; evalSheet.getColumn(2).width=50; evalSheet.getColumn(3).width=5;
        mh(evalSheet,1,3,1,'📝 التقييم والتوصيات',DB,GL,14);
        evalSheet.getRow(1).height=45;
        const warningsText = res.warnings && res.warnings.length ? res.warnings.join('\n') : 'لا توجد تحذيرات حالياً.';
        const sections = [
            { title: '1. التقييم الفني والمالي', content: `الدرجة الفنية: ${res.technicalScore}/100 (${res.technicalRating})\nالدرجة المالية: ${res.financialScore}/100 (${res.financialRating})` },
            { title: '2. التحذيرات', content: warningsText },
            { title: '3. التوصيات', content: res.accountingProfit>0 ? '• المشروع مجدٍ فنياً ومالياً، يُنصح بالمضي قدماً.\n• راقب Prime Cost للحفاظ على الربحية.\n• تأكد من توفير رأس المال العامل المطلوب.' : '• المشروع غير مجدٍ بالشكل الحالي.\n• ابحث عن خفض التكاليف أو زيادة الإيرادات.\n• أعد تقييم الافتراضات (الإشغال، الأسعار، التكاليف).' },
            { title: '4. تنويه', content: 'هذا التحليل مبني على افتراضات تقديرية. النتائج الفعلية قد تختلف. يُنصح باستشارة خبير مالي وفني.' }
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
            tc3.alignment={horizontal:'right',vertical:'middle',readingOrder:'rtl'};
            tc3.border={bottom:{style:'medium',color:{argb:G}}};
            itRow++;
            evalSheet.getRow(itRow).height=Math.max(60, sec.content.split('\n').length*18);
            evalSheet.mergeCells(itRow,2,itRow,2);
            const cc=evalSheet.getCell(itRow,2);
            cc.value=sec.content;
            cc.font={name:'Arial',size:10,color:{argb:DT}};
            cc.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFEFCF6'}};
            cc.alignment={horizontal:'right',vertical:'top',wrapText:true,readingOrder:'rtl'};
            cc.border={top:{style:'hair'},bottom:{style:'hair',color:{argb:G}},left:{style:'hair'},right:{style:'hair'}};
        });

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const now = new Date();
        const fileName = `تقرير_فني_${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
        saveAs(blob, fileName);
    } catch(err) { console.error(err); alert('خطأ Excel: ' + err.message); } finally { hideLoading(); }
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
    loadDiv.innerHTML = `<div class="export-loading-box"><i class="fas fa-spinner"></i><h3 id="loadingTitle">جاري الإنشاء...</h3><p id="loadingMsg">يرجى الانتظار</p></div>`;
    document.body.appendChild(loadDiv);
}

document.getElementById('exportWordBtn').addEventListener('click', exportToWord);
document.getElementById('exportFullExcelBtn').addEventListener('click', exportToFullExcel);
updatePowerAlert();
