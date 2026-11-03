
AOS.init({ duration: 800, once: true, offset: 100 });

// ===== Hesap makinesi =====
const calcDisplay = document.getElementById('calcDisplay');
let currentCalcInput = '';
function handleCalc(v) {
    if (v === 'C') { currentCalcInput = ''; calcDisplay.value = ''; return; }
    if (v === '⌫') { currentCalcInput = currentCalcInput.slice(0, -1); calcDisplay.value = currentCalcInput; return; }
    if (v === '=') { try { let r = eval(currentCalcInput.replace(/×/g,'*').replace(/÷/g,'/')); calcDisplay.value = r; currentCalcInput = r.toString(); } catch(e) { calcDisplay.value = 'Hata'; currentCalcInput = ''; } return; }
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

// ===== Dinamik ekipman =====
const equipmentContainer = document.getElementById('equipmentContainer');
function addEquipmentRow(name = '', power = '', cost = '', space = '') {
    const row = document.createElement('div'); row.className = 'equipment-row';
    row.innerHTML = `<input type="text" class="eq-name" placeholder="Ekipman adı" value="${name}"><input type="number" class="eq-power" placeholder="Güç (kW)" value="${power}" step="0.1" min="0"><input type="number" class="eq-cost" placeholder="Fiyat" value="${cost}" step="100" min="0"><input type="number" class="eq-space" placeholder="Alan (m²)" value="${space}" step="0.1" min="0"><button class="remove-equipment" onclick="this.parentElement.remove()">×</button>`;
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
        powerAlert.innerHTML = `⚠️ Uyarı: Toplam gerekli güç (${requiredAmps.toFixed(0)} Amper) mevcut kapasiteyi (${electricalCapacity} Amper) aşıyor.`;
    } else { powerAlert.style.display = 'none'; }
}
document.getElementById('electricalCapacity').addEventListener('input', updatePowerAlert);
equipmentContainer.addEventListener('input', updatePowerAlert);

// ===== Ana hesaplama =====
let financeChart, riskChart;
function calculateAll() {
    const currency = document.getElementById('currencySelect').value;
    const companyName = document.getElementById('companyName').value || 'Yararlanıcı kurum';
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
    if (seatDensity < 1.2) warnings.push("⚠️ Sandalyeler fazla, alan dar (yüksek yoğunluk)");
    if (seats / employeesCount < 8) warnings.push("⚠️ Çalışan sayısı sandalye sayısına göre yüksek");
    if (primePercent > 65) warnings.push("⚠️ Prime Cost yüksek (>%65)");
    if (accountingProfit < 0) warnings.push("🔴 Proje mevcut tahminlere göre zarar ediyor");
    if (monthlyFixedCosts < monthlyRevenue * 0.15) warnings.push("⚠️ Sabit maliyetler çok düşük (<%15)");
    if (laborCostPercent < 15) warnings.push("⚠️ İşgücü maliyet oranı çok düşük (<%15)");
    if (totalInvestment / seats > 5000) warnings.push("💡 Sandalye başına yatırım yüksek, fizibiliteyi kontrol edin");

    // Teknik değerlendirme
    let technicalScore = 0; const requiredAmps = (totalPower * 1000) / 220;
    if (electricalCapacity >= requiredAmps * 1.2) technicalScore += 40; else if (electricalCapacity >= requiredAmps) technicalScore += 30; else if (electricalCapacity >= requiredAmps * 0.8) technicalScore += 15; else technicalScore += 5;
    if (waterAvailabilityText.includes('Uygun')) technicalScore += 15; else if (waterAvailabilityText.includes('Geliştirme')) technicalScore += 5;
    if (ventilationText.includes('Uygun')) technicalScore += 15; else if (ventilationText.includes('Geliştirme')) technicalScore += 5;
    if (seatDensity >= 1.2 && seatDensity <= 1.8) technicalScore += 15; else if (seatDensity >= 1.0 && seatDensity < 1.2) technicalScore += 8; else if (seatDensity > 1.8 && seatDensity <= 2.2) technicalScore += 8;
    if (totalSpace <= kitchenArea * 0.5) technicalScore += 15; else if (totalSpace <= kitchenArea * 0.7) technicalScore += 8;
    technicalScore = Math.min(technicalScore, 100);
    let technicalRating = '', technicalColor = '';
    if (technicalScore >= 85) { technicalRating = '🟢 Mükemmel'; technicalColor = 'alert-success'; }
    else if (technicalScore >= 70) { technicalRating = '🟡 İyi'; technicalColor = 'alert-warning'; }
    else if (technicalScore >= 50) { technicalRating = '🟠 Orta'; technicalColor = 'alert-warning'; }
    else { technicalRating = '🔴 Zayıf'; technicalColor = 'alert-danger'; }

    // Finansal değerlendirme
    let financialScore = 0;
    if (primePercent <= 55) financialScore += 30; else if (primePercent <= 65) financialScore += 20; else if (primePercent <= 75) financialScore += 10;
    if (accountingProfit > 0) { const profitMargin = accountingProfit / monthlyRevenue; if (profitMargin >= 0.2) financialScore += 30; else if (profitMargin >= 0.1) financialScore += 20; else if (profitMargin >= 0.05) financialScore += 15; else financialScore += 10; }
    if (accountingProfit > 0 && totalInvestment > 0) { if (paybackMonths <= 12) financialScore += 20; else if (paybackMonths <= 24) financialScore += 15; else if (paybackMonths <= 36) financialScore += 10; else financialScore += 5; } else if (accountingProfit <= 0) { financialScore = Math.max(0, financialScore - 10); }
    const maxMonthlyMeals = maxCustomersDaily * 26;
    if (breakEvenMeals <= maxMonthlyMeals * 0.5) financialScore += 20; else if (breakEvenMeals <= maxMonthlyMeals * 0.7) financialScore += 15; else if (breakEvenMeals <= maxMonthlyMeals * 0.9) financialScore += 10; else if (breakEvenMeals <= maxMonthlyMeals) financialScore += 5;
    financialScore = Math.min(financialScore, 100);
    let financialRating = '', financialColor = '';
    if (financialScore >= 85) { financialRating = '🟢 Mükemmel'; financialColor = 'alert-success'; }
    else if (financialScore >= 70) { financialRating = '🟡 İyi'; financialColor = 'alert-warning'; }
    else if (financialScore >= 50) { financialRating = '🟠 Orta'; financialColor = 'alert-warning'; }
    else { financialRating = '🔴 Zayıf'; financialColor = 'alert-danger'; }

    // Sonuçları göster
    document.getElementById('initialMessage').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('kpiCards').innerHTML = `
        <div class="result-card"><i class="fas fa-dollar-sign"></i><h4>Aylık Gelir</h4><div class="value">${currency}${Math.round(monthlyRevenue)}</div></div>
        <div class="result-card"><i class="fas fa-file-invoice"></i><h4>Net Kâr (Amortisman sonrası)</h4><div class="value">${currency}${Math.round(accountingProfit)}</div><div class="status ${accountingProfit > 0 ? 'status-good' : 'status-bad'}">${accountingProfit > 0 ? 'Kârlı' : 'Zarar'}</div></div>
        <div class="result-card"><i class="fas fa-chart-line"></i><h4>Başabaş Geliri</h4><div class="value">${currency}${Math.round(breakEvenRevenue)}</div></div>
        <div class="result-card"><i class="fas fa-hand-holding-usd"></i><h4>Geri Ödeme Süresi</h4><div class="value">${paybackMonths === Infinity ? '∞' : paybackMonths.toFixed(1)}</div><div class="unit">ay</div></div>
    `;
    if (warnings.length > 0) {
        document.getElementById('warnings').style.display = 'block';
        document.getElementById('warnings').innerHTML = `<strong>⚠️ Uyarılar:</strong><br>${warnings.join('<br>')}`;
        document.getElementById('warnings').className = 'alert alert-warning';
    } else { document.getElementById('warnings').style.display = 'none'; }
    document.getElementById('projectRatingCard').innerHTML = `
        <h3><i class="fas fa-star"></i> Proje Değerlendirmesi</h3>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <div style="flex: 1; min-width: 200px;"><h4>Teknik Değerlendirme</h4><div class="alert ${technicalColor}" style="font-size:1.2rem;">${technicalRating}</div><p>Teknik Puan: ${technicalScore}/100</p></div>
            <div style="flex: 1; min-width: 200px;"><h4>Finansal Değerlendirme</h4><div class="alert ${financialColor}" style="font-size:1.2rem;">${financialRating}</div><p>Finansal Puan: ${financialScore}/100</p></div>
        </div>
    `;
    if (financeChart) financeChart.destroy();
    const ctx1 = document.getElementById('financeChart').getContext('2d');
    financeChart = new Chart(ctx1, {
        type: 'bar',
        data: { labels: ['Gelir', 'Yiyecek Maliyeti', 'Maaşlar', 'Sabit Maliyetler', 'Net Kâr'], datasets: [{ label: `Değer (${currency})`, data: [monthlyRevenue, monthlyFoodCost, monthlyLaborCost, monthlyFixedCosts, accountingProfit], backgroundColor: ['#28a745', '#ffc107', '#17a2b8', '#fd7e14', '#b8860b'] }] },
        options: { responsive: true, maintainAspectRatio: false }
    });
    if (riskChart) riskChart.destroy();
    const ctx2 = document.getElementById('riskChart').getContext('2d');
    riskChart = new Chart(ctx2, {
        type: 'bar',
        data: { labels: ['Normal', '%20 Düşüş'], datasets: [{ label: `Net Kâr (${currency})`, data: [accountingProfit, riskProfit], backgroundColor: ['#28a745', '#dc3545'] }] },
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
// ========== Profesyonel Word Dışa Aktar ==========
// ================================================================
async function exportToWord() {
    if (document.getElementById('resultsSection').style.display === 'none') { alert('Lütfen önce analiz yapın.'); return; }
    showLoading('Profesyonel Word raporu oluşturuluyor...', 'Veriler ve grafikler toplanıyor');
    try {
        const currency = document.getElementById('currencySelect').value;
        const companyName = document.getElementById('companyName').value || 'Yararlanıcı kurum';
        const res = window.lastResults;
        if (!res) { alert('Lütfen önce analiz yapın.'); hideLoading(); return; }

        const chart1 = document.getElementById('financeChart');
        const chart2 = document.getElementById('riskChart');
        const [canvas1, canvas2] = await Promise.all([
            html2canvas(chart1, { scale: 2, backgroundColor: '#ffffff' }),
            html2canvas(chart2, { scale: 2, backgroundColor: '#ffffff' })
        ]);
        const img1 = canvas1.toDataURL('image/png');
        const img2 = canvas2.toDataURL('image/png');

        const kitchenType = document.getElementById('kitchenType').options[document.getElementById('kitchenType').selectedIndex].text;
        const serviceModel = document.getElementById('serviceModel').options[document.getElementById('serviceModel').selectedIndex].text;
        const shifts = document.getElementById('shifts').options[document.getElementById('shifts').selectedIndex].text;
        const water = document.getElementById('waterAvailability').options[document.getElementById('waterAvailability').selectedIndex].text;
        const ventilation = document.getElementById('ventilation').options[document.getElementById('ventilation').selectedIndex].text;
        const delivery = document.getElementById('deliveryAccess').options[document.getElementById('deliveryAccess').selectedIndex].text;

        let equipHTML = '';
        res.equipment.forEach(eq => {
            if (eq.name) equipHTML += `<tr><td>${eq.name}</td><td>${eq.power} kW</td><td>${currency} ${eq.cost}</td><td>${eq.space} m²</td></tr>`;
        });

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
        const dateStr = now.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });

        const fullHtml = `<!DOCTYPE html>
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head><meta charset='utf-8'><title>Teknik Fizibilite Raporu - FAROUK GRUP</title>
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
                <h1>FAROUK GRUP</h1>
                <h2>Restoranlar için İleri Teknik Fizibilite Raporu</h2>
                <p>Kurum: ${companyName} | Tarih: ${dateStr}</p>
                <p>Para Birimi: ${currency}</p>
            </div>
            <h2 style="color:#b8860b;">Temel Girdiler</h2>
            <table>
                <tr><th>Mutfak Türü</th><td>${kitchenType}</td><th>Sandalye Sayısı</th><td>${res.seats}</td></tr>
                <tr><th>Hizmet Modeli</th><td>${serviceModel}</td><th>Çalışma Saati</th><td>${res.hoursOpen} saat/gün</td></tr>
                <tr><th>Çalışma Periyotları</th><td>${shifts}</td><th>Toplam Alan</th><td>${res.totalArea} m²</td></tr>
                <tr><th>Mutfak Oranı</th><td>${res.kitchenPercent}%</td><th>Elektrik Kapasitesi</th><td>${res.electricalCapacity} Amper</td></tr>
                <tr><th>Su</th><td>${water}</td><th>Havalandırma</th><td>${ventilation}</td></tr>
                <tr><th>Teslimat Kolaylığı</th><td>${delivery}</td><th></th><td></td></tr>
            </table>
            <h3 style="color:#b8860b;">Ekipmanlar</h3>
            <table><thead><tr><th>Ekipman</th><th>Güç (kW)</th><th>Maliyet</th><th>Alan (m²)</th></tr></thead><tbody>${equipHTML}</tbody></table>
            <h2 style="color:#b8860b;">Temel Performans Göstergeleri</h2>
            <table>${kpiRows}</table>
            ${warningsHTML ? `<div style="background:#fff3cd;padding:15px;border-radius:10px;border-right:4px solid #ffc107;margin:20px 0;">${warningsHTML}</div>` : ''}
            <h2 style="color:#b8860b;">📈 Grafikler</h2>
            <div style="display:flex;gap:20px;flex-wrap:wrap;justify-content:center;">
                <div style="flex:1;min-width:300px;"><h3>Finansal Performans Analizi</h3><img src="${img1}" class="chart-img"/></div>
                <div style="flex:1;min-width:300px;"><h3>Risk Analizi</h3><img src="${img2}" class="chart-img"/></div>
            </div>
            <h2 style="color:#b8860b;">💡 Proje Değerlendirmesi ve Öneriler</h2>
            <div style="background:#fefcf6;padding:15px;border-radius:10px;border-right:4px solid #b8860b;">${ratingHTML}</div>
            <div class="footer">FAROUK GRUP tarafından oluşturulmuştur © ${now.getFullYear()}</div>
        </body></html>`;

        const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Teknik_Fizibilite_${companyName}_${now.toISOString().slice(0,10)}.doc`;
        link.click();
        URL.revokeObjectURL(link.href);
    } catch (error) { console.error(error); alert('Word raporu oluşturulurken hata'); } finally { hideLoading(); }
}

// ================================================================
// ========== Profesyonel Excel Dışa Aktar ==========
// ================================================================
async function exportToFullExcel() {
    if (!window.lastResults) { alert('Lütfen önce analiz yapın ("Teknik Çalışmayı Hesapla").'); return; }
    showLoading('Profesyonel Excel raporu oluşturuluyor...', 'Sayfalar ve grafikler oluşturuluyor');
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

        // 1. Kapak
        const cv = workbook.addWorksheet('Kapak', { views: [{ rightToLeft: true, showGridLines: false }] });
        [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
        cv.getRow(2).height=80; cv.getRow(4).height=60;
        cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1);
        bc.value='FAROUK GRUP\nDanışmanlık ve İşletme';
        bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:'rtl'};
        mh(cv,1,4,4,`Restoran Teknik Fizibilite Raporu\n${companyName}`,DB,GL,18);
        const inf=[['📋 Kurum',companyName],['📅 Tarih',new Date().toLocaleDateString('tr-TR')],['💰 Para Birimi',currency],['📊 Net Kâr',`${currency} ${res.accountingProfit.toFixed(0)}`],['📈 Geri Ödeme',res.paybackMonths===Infinity?'Süresiz':`${res.paybackMonths.toFixed(1)} ay`]];
        let ir=6;
        inf.forEach(([l,v],idx)=>{
            cv.mergeCells(ir,1,ir,2); cv.mergeCells(ir,3,ir,4);
            const lc=cv.getCell(ir,1), vc=cv.getCell(ir,3); lc.value=l; vc.value=v;
            const bg=idx%2===0?AR:'FFFEFCF6';
            ap(lc,{font:{name:'Arial',bold:true,size:11,color:{argb:'00695C'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'right',vertical:'middle',readingOrder:'rtl'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
            ap(vc,{font:{name:'Arial',size:11,color:{argb:DT}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',readingOrder:'rtl'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
            cv.getRow(ir).height=28; ir++;
        });

        // 2. Girdiler
        const inputsSheet = workbook.addWorksheet('Girdiler ve Varsayımlar', { views: [{ rightToLeft: true, showGridLines: false }] });
        inputsSheet.getColumn(1).width=5; inputsSheet.getColumn(2).width=38; inputsSheet.getColumn(3).width=22; inputsSheet.getColumn(4).width=22; inputsSheet.getColumn(5).width=5;
        mh(inputsSheet,1,5,1,'📋 Temel Girdiler',DB,GL,14);
        inputsSheet.getRow(1).height=40;
        mh(inputsSheet,2,4,2,'Proje Verileri',SB,'FFFFFFFF',11);
        inputsSheet.getRow(2).height=28;
        const inputFields = [
            ['Mutfak Türü', document.getElementById('kitchenType').options[document.getElementById('kitchenType').selectedIndex].text, ''],
            ['Sandalye Sayısı', res.seats, ''],
            ['Hizmet Modeli', document.getElementById('serviceModel').options[document.getElementById('serviceModel').selectedIndex].text, ''],
            ['Günlük Çalışma Saati', res.hoursOpen, 'saat'],
            ['Çalışma Periyotları', document.getElementById('shifts').options[document.getElementById('shifts').selectedIndex].text, ''],
            ['Toplam Alan', res.totalArea, 'm²'],
            ['Mutfak Oranı', res.kitchenPercent, '%'],
            ['Elektrik Kapasitesi', res.electricalCapacity, 'Amper'],
            ['Su Kaynağı', res.waterAvailabilityText, ''],
            ['Havalandırma', res.ventilationText, ''],
            ['Teslimat Kolaylığı', res.deliveryAccessText, ''],
            ['Ekipman Sayısı', res.equipment.length, ''],
            ['Toplam Ekipman Gücü', res.totalPower, 'kW'],
            ['Toplam Ekipman Maliyeti', `${currency} ${res.equipmentCost.toFixed(0)}`, ''],
            ['Ekipman Alanı', res.totalSpace, 'm²'],
            ['Masa Devir Hızı', res.turnoverRate, ''],
            ['Yoğun Saat', res.peakHours, ''],
            ['Doluluk Oranı', res.occupancyRate*100, '%'],
            ['Ortalama Yemek Fiyatı', `${currency} ${res.avgMealPrice}`, ''],
            ['Yiyecek Maliyeti', res.foodCostPercent*100, '%'],
            ['Çalışan Sayısı', res.employeesCount, ''],
            ['Ortalama Maaş', `${currency} ${res.avgSalary}`, ''],
            ['Aylık Kira', `${currency} ${res.monthlyRent}`, ''],
            ['Diğer Giderler', `${currency} ${res.otherOpCost}`, ''],
            ['Ekipman Ömrü', res.equipmentLife, 'yıl'],
            ['Dekorasyon Maliyeti', `${currency} ${res.constructionCost}`, ''],
            ['Lisanslar', `${currency} ${res.licensesCost}`, ''],
            ['İşletme Sermayesi', `${currency} ${res.workingCapital}`, '']
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

        // 3. Göstergeler
        const kpiSheet = workbook.addWorksheet('Performans Göstergeleri', { views: [{ rightToLeft: true, showGridLines: false }] });
        [5,32,22,22,22,5].forEach((w,i)=>kpiSheet.getColumn(i+1).width=w);
        mh(kpiSheet,1,6,1,'📊 Performans Göstergeleri',DB,GL,15);
        kpiSheet.getRow(1).height=45;
        mh(kpiSheet,2,5,2,`${companyName} | ${new Date().toLocaleDateString('tr-TR')}`,HB,'FFFFFFFF',10);
        kpiSheet.getRow(2).height=26;
        const kpis = [
            { label: 'Aylık Gelir', value: `${currency} ${Math.round(res.monthlyRevenue)}`, good: true },
            { label: 'Net Kâr', value: `${currency} ${Math.round(res.accountingProfit)}`, good: res.accountingProfit>0 },
            { label: 'Başabaş Geliri', value: `${currency} ${Math.round(res.breakEvenRevenue)}`, good: true },
            { label: 'Geri Ödeme', value: res.paybackMonths===Infinity?'Süresiz':`${res.paybackMonths.toFixed(1)} ay`, good: res.paybackMonths<24 },
            { label: 'Prime Cost', value: `${res.primePercent.toFixed(1)}%`, good: res.primePercent<65 },
            { label: 'Kâr Marjı', value: `${((res.accountingProfit/res.monthlyRevenue)*100).toFixed(1)}%`, good: res.accountingProfit>0 }
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
        kFinal.value=res.accountingProfit>0?'✅ Proje Finansal Olarak Uygun (Pozitif Kâr)':'⚠️ Proje Uygun Değil (Zarar)';
        kFinal.font={name:'Arial',bold:true,size:13,color:{argb:res.accountingProfit>0?PT:'856404'}};
        kFinal.fill={type:'pattern',pattern:'solid',fgColor:{argb:res.accountingProfit>0?PB:GB}};
        kFinal.alignment={horizontal:'center',vertical:'middle',readingOrder:'rtl'};
        kFinal.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};
        kpiSheet.getRow(kRow).height=40;

        // 4. Özet
        const summarySheet = workbook.addWorksheet('Finansal Özet', { views: [{ rightToLeft: true, showGridLines: false }] });
        summarySheet.getColumn(1).width=5; summarySheet.getColumn(2).width=35; summarySheet.getColumn(3).width=25; summarySheet.getColumn(4).width=25; summarySheet.getColumn(5).width=5;
        mh(summarySheet,1,5,1,'📋 Finansal ve Teknik Özet',DB,GL,14);
        summarySheet.getRow(1).height=40;
        const summData = [
            ['Toplam Yatırım', `${currency} ${res.totalInvestment.toFixed(0)}`, 'Teknik Puan', `${res.technicalScore}/100 (${res.technicalRating})`],
            ['Aylık Gelir', `${currency} ${res.monthlyRevenue.toFixed(0)}`, 'Finansal Puan', `${res.financialScore}/100 (${res.financialRating})`],
            ['Toplam Gider', `${currency} ${res.totalMonthlyExpenses.toFixed(0)}`, 'Başabaş Noktası', `${currency} ${res.breakEvenRevenue.toFixed(0)}`],
            ['Net Kâr', `${currency} ${res.accountingProfit.toFixed(0)}`, 'Güvenlik Marjı', `${((res.monthlyRevenue - res.breakEvenRevenue) / res.monthlyRevenue * 100).toFixed(1)}%`],
            ['Geri Ödeme', res.paybackMonths===Infinity?'Süresiz':`${res.paybackMonths.toFixed(1)} ay`, '', '']
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

        // 5. Grafik
        const chartsSheet = workbook.addWorksheet('Grafikler', { views: [{ rightToLeft: true, showGridLines: false }] });
        chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
        mh(chartsSheet,1,3,1,'📊 Proje Grafikleri',DB,GL,14);
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

        // 6. Değerlendirme
        const evalSheet = workbook.addWorksheet('Değerlendirme ve Öneriler', { views: [{ rightToLeft: true, showGridLines: false }] });
        evalSheet.getColumn(1).width=5; evalSheet.getColumn(2).width=50; evalSheet.getColumn(3).width=5;
        mh(evalSheet,1,3,1,'📝 Değerlendirme ve Öneriler',DB,GL,14);
        evalSheet.getRow(1).height=45;
        const warningsText = res.warnings && res.warnings.length ? res.warnings.join('\n') : 'Henüz uyarı yok.';
        const sections = [
            { title: '1. Teknik ve Finansal Değerlendirme', content: `Teknik Puan: ${res.technicalScore}/100 (${res.technicalRating})\nFinansal Puan: ${res.financialScore}/100 (${res.financialRating})` },
            { title: '2. Uyarılar', content: warningsText },
            { title: '3. Öneriler', content: res.accountingProfit>0 ? '• Proje teknik ve finansal olarak uygundur, ilerlenmesi önerilir.\n• Prime Cost\'u izleyerek kârlılığı koruyun.\n• Gerekli işletme sermayesini ayırın.' : '• Proje mevcut haliyle uygun değildir.\n• Maliyetleri düşürmenin veya gelirleri artırmanın yollarını araştırın.\n• Varsayımları (doluluk, fiyatlar, maliyetler) yeniden değerlendirin.' },
            { title: '4. Uyarı', content: 'Bu analiz tahmini varsayımlara dayanmaktadır. Gerçek sonuçlar farklı olabilir. Finansal ve teknik uzmana danışmanız önerilir.' }
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
        const fileName = `Teknik_Fizibilite_${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
        saveAs(blob, fileName);
    } catch(err) { console.error(err); alert('Excel hatası: ' + err.message); } finally { hideLoading(); }
}

// ===== Yükleme ekranı =====
function showLoading(title, msg) {
    document.getElementById('loadingTitle').textContent = title;
    document.getElementById('loadingMsg').textContent = msg;
    document.getElementById('exportLoading').classList.add('show');
}
function hideLoading() {
    document.getElementById('exportLoading').classList.remove('show');
}

// Yükleme ekranı yoksa oluştur
if (!document.getElementById('exportLoading')) {
    const loadDiv = document.createElement('div');
    loadDiv.className = 'export-loading';
    loadDiv.id = 'exportLoading';
    loadDiv.innerHTML = `<div class="export-loading-box"><i class="fas fa-spinner"></i><h3 id="loadingTitle">Oluşturuluyor...</h3><p id="loadingMsg">Lütfen bekleyin</p></div>`;
    document.body.appendChild(loadDiv);
}

document.getElementById('exportWordBtn').addEventListener('click', exportToWord);
document.getElementById('exportFullExcelBtn').addEventListener('click', exportToFullExcel);
updatePowerAlert();
