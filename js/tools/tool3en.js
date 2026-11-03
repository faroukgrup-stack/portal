
        (function() {
            'use strict';

            // ===== Calculator =====
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
                    } catch (e) { calcDisplay.value = 'Error'; currentCalcInput = ''; }
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

            // ===== Equipment Management =====
            const equipmentContainer = document.getElementById('equipmentContainer');

            function addEquipmentRow(name = '', power = '', cost = '', space = '') {
                const row = document.createElement('div');
                row.className = 'equipment-row';
                row.innerHTML = `
                    <input type="text" class="eq-name" placeholder="Equipment name" value="${name}">
                    <input type="number" class="eq-power" placeholder="Power (kW)" value="${power}" step="0.1" min="0">
                    <input type="number" class="eq-cost" placeholder="Cost" value="${cost}" step="100" min="0">
                    <input type="number" class="eq-space" placeholder="Space (m²)" value="${space}" step="0.1" min="0">
                    <button class="remove-equipment" onclick="this.parentElement.remove()">×</button>
                `;
                equipmentContainer.appendChild(row);
            }
            addEquipmentRow('', '', '', '');
            addEquipmentRow('', '', '', '');

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
                    powerAlert.innerHTML = `⚠️ Warning: Total required power (${requiredAmps.toFixed(0)} Amps) exceeds site capacity (${electricalCapacity} Amps).`;
                } else { powerAlert.style.display = 'none'; }
            }

            document.getElementById('electricalCapacity').addEventListener('input', updatePowerAlert);
            equipmentContainer.addEventListener('input', updatePowerAlert);

            // ===== Loading functions =====
            function showLoading(title, msg) {
                document.getElementById('loadingTitle').textContent = title;
                document.getElementById('loadingMsg').textContent = msg;
                document.getElementById('exportLoading').classList.add('show');
            }

            function hideLoading() {
                document.getElementById('exportLoading').classList.remove('show');
            }

            // ===== Charts =====
            let financeChart, riskChart;

            // ===== Main Calculation =====
            function calculateAll() {
                const currency = document.getElementById('currencySelect').value;
                const companyName = document.getElementById('companyName').value || 'Beneficiary Entity';
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
                if (seatDensity < 1.2) warnings.push("⚠️ Seats are too many for the space (high density).");
                if (seats / employeesCount < 8) warnings.push("⚠️ Number of employees is high relative to seats.");
                if (primePercent > 65) warnings.push("⚠️ Prime Cost is high (>65%).");
                if (accountingProfit < 0) warnings.push("🔴 Project is loss-making based on current estimates.");
                if (monthlyFixedCosts < monthlyRevenue * 0.15) warnings.push("⚠️ Fixed costs are very low (<15% of revenue).");
                if (laborCostPercent < 15) warnings.push("⚠️ Labor cost percentage is very low (<15%).");
                if (totalInvestment / seats > 5000) warnings.push("💡 High investment per seat, check the viability.");

                // Technical Score
                let technicalScore = 0;
                const requiredAmps = (totalPower * 1000) / 220;
                if (electricalCapacity >= requiredAmps * 1.2) technicalScore += 40;
                else if (electricalCapacity >= requiredAmps) technicalScore += 30;
                else if (electricalCapacity >= requiredAmps * 0.8) technicalScore += 15;
                else technicalScore += 5;

                if (waterAvailabilityText.includes('Suitable')) technicalScore += 15;
                else if (waterAvailabilityText.includes('Development')) technicalScore += 5;

                if (ventilationText.includes('Suitable')) technicalScore += 15;
                else if (ventilationText.includes('Development')) technicalScore += 5;

                if (seatDensity >= 1.2 && seatDensity <= 1.8) technicalScore += 15;
                else if (seatDensity >= 1.0 && seatDensity < 1.2) technicalScore += 8;
                else if (seatDensity > 1.8 && seatDensity <= 2.2) technicalScore += 8;

                if (totalSpace <= kitchenArea * 0.5) technicalScore += 15;
                else if (totalSpace <= kitchenArea * 0.7) technicalScore += 8;

                technicalScore = Math.min(technicalScore, 100);
                let technicalRating = '', technicalColor = '';
                if (technicalScore >= 85) { technicalRating = '🟢 Excellent'; technicalColor = 'alert-success'; }
                else if (technicalScore >= 70) { technicalRating = '🟡 Good'; technicalColor = 'alert-warning'; }
                else if (technicalScore >= 50) { technicalRating = '🟠 Average'; technicalColor = 'alert-warning'; }
                else { technicalRating = '🔴 Poor'; technicalColor = 'alert-danger'; }

                // Financial Score
                let financialScore = 0;
                if (primePercent <= 55) financialScore += 30;
                else if (primePercent <= 65) financialScore += 20;
                else if (primePercent <= 75) financialScore += 10;

                if (accountingProfit > 0) {
                    const profitMargin = accountingProfit / monthlyRevenue;
                    if (profitMargin >= 0.2) financialScore += 30;
                    else if (profitMargin >= 0.1) financialScore += 20;
                    else if (profitMargin >= 0.05) financialScore += 15;
                    else financialScore += 10;
                }

                if (accountingProfit > 0 && totalInvestment > 0) {
                    if (paybackMonths <= 12) financialScore += 20;
                    else if (paybackMonths <= 24) financialScore += 15;
                    else if (paybackMonths <= 36) financialScore += 10;
                    else financialScore += 5;
                } else if (accountingProfit <= 0) {
                    financialScore = Math.max(0, financialScore - 10);
                }

                const maxMonthlyMeals = maxCustomersDaily * 26;
                if (breakEvenMeals <= maxMonthlyMeals * 0.5) financialScore += 20;
                else if (breakEvenMeals <= maxMonthlyMeals * 0.7) financialScore += 15;
                else if (breakEvenMeals <= maxMonthlyMeals * 0.9) financialScore += 10;
                else if (breakEvenMeals <= maxMonthlyMeals) financialScore += 5;

                financialScore = Math.min(financialScore, 100);
                let financialRating = '', financialColor = '';
                if (financialScore >= 85) { financialRating = '🟢 Excellent'; financialColor = 'alert-success'; }
                else if (financialScore >= 70) { financialRating = '🟡 Good'; financialColor = 'alert-warning'; }
                else if (financialScore >= 50) { financialRating = '🟠 Average'; financialColor = 'alert-warning'; }
                else { financialRating = '🔴 Poor'; financialColor = 'alert-danger'; }

                // Display results
                document.getElementById('initialMessage').style.display = 'none';
                document.getElementById('resultsSection').style.display = 'block';

                document.getElementById('kpiCards').innerHTML = `
                    <div class="result-card"><i class="fas fa-dollar-sign"></i><h4>Monthly Revenue</h4><div class="value">${currency}${Math.round(monthlyRevenue)}</div></div>
                    <div class="result-card"><i class="fas fa-file-invoice"></i><h4>Net Profit (after depreciation)</h4><div class="value">${currency}${Math.round(accountingProfit)}</div><div class="status ${accountingProfit > 0 ? 'status-good' : 'status-bad'}">${accountingProfit > 0 ? 'Profitable' : 'Losing'}</div></div>
                    <div class="result-card"><i class="fas fa-chart-line"></i><h4>Break-even Revenue</h4><div class="value">${currency}${Math.round(breakEvenRevenue)}</div></div>
                    <div class="result-card"><i class="fas fa-hand-holding-usd"></i><h4>Payback Period</h4><div class="value">${paybackMonths === Infinity ? '∞' : paybackMonths.toFixed(1)}</div><div class="unit">Months</div></div>
                `;

                if (warnings.length > 0) {
                    document.getElementById('warnings').style.display = 'block';
                    document.getElementById('warnings').innerHTML = `<strong>⚠️ Warnings:</strong><br>${warnings.join('<br>')}`;
                    document.getElementById('warnings').className = 'alert alert-warning';
                } else {
                    document.getElementById('warnings').style.display = 'none';
                }

                document.getElementById('projectRatingCard').innerHTML = `
                    <h3><i class="fas fa-star"></i> Project Evaluation</h3>
                    <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 200px;"><h4>Technical Rating</h4><div class="alert ${technicalColor}" style="font-size:1.2rem;">${technicalRating}</div><p>Technical Score: ${technicalScore}/100</p></div>
                        <div style="flex: 1; min-width: 200px;"><h4>Financial Rating</h4><div class="alert ${financialColor}" style="font-size:1.2rem;">${financialRating}</div><p>Financial Score: ${financialScore}/100</p></div>
                    </div>
                `;

                if (financeChart) financeChart.destroy();
                const ctx1 = document.getElementById('financeChart').getContext('2d');
                financeChart = new Chart(ctx1, {
                    type: 'bar',
                    data: {
                        labels: ['Revenue', 'Food Cost', 'Salaries', 'Fixed Costs', 'Net Profit'],
                        datasets: [{ label: `Value (${currency})`, data: [monthlyRevenue, monthlyFoodCost, monthlyLaborCost, monthlyFixedCosts, accountingProfit], backgroundColor: ['#28a745', '#ffc107', '#17a2b8', '#fd7e14', '#b8860b'] }]
                    },
                    options: { responsive: true, maintainAspectRatio: false }
                });

                if (riskChart) riskChart.destroy();
                const ctx2 = document.getElementById('riskChart').getContext('2d');
                riskChart = new Chart(ctx2, {
                    type: 'bar',
                    data: {
                        labels: ['Normal', '20% Decline'],
                        datasets: [{ label: `Net Profit (${currency})`, data: [accountingProfit, riskProfit], backgroundColor: ['#28a745', '#dc3545'] }]
                    },
                    options: { responsive: true, maintainAspectRatio: false }
                });

                // Store results for export
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
            // ========== Export to Word (Professional) ==========
            // ================================================================
            async function exportToWord() {
                if (document.getElementById('resultsSection').style.display === 'none') {
                    alert('Please run the analysis first.');
                    return;
                }
                showLoading('Generating professional Word report...', 'Collecting data and charts');
                try {
                    const currency = document.getElementById('currencySelect').value;
                    const companyName = document.getElementById('companyName').value || 'Beneficiary Entity';
                    const res = window.lastResults;
                    if (!res) { alert('Please run the analysis first.'); hideLoading(); return; }

                    // Capture charts
                    const chart1 = document.getElementById('financeChart');
                    const chart2 = document.getElementById('riskChart');
                    const [canvas1, canvas2] = await Promise.all([
                        html2canvas(chart1, { scale: 2, backgroundColor: '#ffffff' }),
                        html2canvas(chart2, { scale: 2, backgroundColor: '#ffffff' })
                    ]);
                    const img1 = canvas1.toDataURL('image/png');
                    const img2 = canvas2.toDataURL('image/png');

                    // Build input table
                    const kitchenType = document.getElementById('kitchenType').options[document.getElementById('kitchenType').selectedIndex].text;
                    const serviceModel = document.getElementById('serviceModel').options[document.getElementById('serviceModel').selectedIndex].text;
                    const shifts = document.getElementById('shifts').options[document.getElementById('shifts').selectedIndex].text;
                    const water = document.getElementById('waterAvailability').options[document.getElementById('waterAvailability').selectedIndex].text;
                    const ventilation = document.getElementById('ventilation').options[document.getElementById('ventilation').selectedIndex].text;
                    const delivery = document.getElementById('deliveryAccess').options[document.getElementById('deliveryAccess').selectedIndex].text;

                    // Equipment table
                    let equipHTML = '';
                    res.equipment.forEach(eq => {
                        if (eq.name) equipHTML += `<tr><td>${eq.name}</td><td>${eq.power} kW</td><td>${currency} ${eq.cost}</td><td>${eq.space} m²</td></tr>`;
                    });

                    // KPI cards
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
                    const dateStr = now.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

                    const fullHtml = `<!DOCTYPE html>
                    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
                    <head><meta charset='utf-8'><title>Technical Feasibility Report - FAROUK GRUP</title>
                    <style>
                        body{font-family:'Arial',sans-serif;direction:ltr;margin:2rem;background:#fff;color:#333;}
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
                            <h2>Advanced Technical Feasibility Study for Restaurants</h2>
                            <p>Entity: ${companyName} | Date: ${dateStr}</p>
                            <p>Currency: ${currency}</p>
                        </div>
                        <h2 style="color:#b8860b;">Input Data</h2>
                        <table>
                            <tr><th>Kitchen Type</th><td>${kitchenType}</td><th>Seats</th><td>${res.seats}</td></tr>
                            <tr><th>Service Model</th><td>${serviceModel}</td><th>Operating Hours</th><td>${res.hoursOpen} hrs/day</td></tr>
                            <tr><th>Shifts</th><td>${shifts}</td><th>Total Area</th><td>${res.totalArea} m²</td></tr>
                            <tr><th>Kitchen %</th><td>${res.kitchenPercent}%</td><th>Electrical Capacity</th><td>${res.electricalCapacity} Amps</td></tr>
                            <tr><th>Water</th><td>${water}</td><th>Ventilation</th><td>${ventilation}</td></tr>
                            <tr><th>Delivery Accessibility</th><td>${delivery}</td><th></th><td></td></tr>
                        </table>
                        <h3 style="color:#b8860b;">Equipment</h3>
                        <table><thead><tr><th>Equipment</th><th>Power (kW)</th><th>Cost</th><th>Space (m²)</th></tr></thead><tbody>${equipHTML}</tbody></table>
                        <h2 style="color:#b8860b;">Key Performance Indicators</h2>
                        <table>${kpiRows}</table>
                        ${warningsHTML ? `<div style="background:#fff3cd;padding:15px;border-radius:10px;border-left:4px solid #ffc107;margin:20px 0;">${warningsHTML}</div>` : ''}
                        <h2 style="color:#b8860b;">📈 Charts</h2>
                        <div style="display:flex;gap:20px;flex-wrap:wrap;justify-content:center;">
                            <div style="flex:1;min-width:300px;"><h3>Financial Performance</h3><img src="${img1}" class="chart-img"/></div>
                            <div style="flex:1;min-width:300px;"><h3>Risk Analysis</h3><img src="${img2}" class="chart-img"/></div>
                        </div>
                        <h2 style="color:#b8860b;">💡 Evaluation & Recommendations</h2>
                        <div style="background:#fefcf6;padding:15px;border-radius:10px;border-left:4px solid #b8860b;">${ratingHTML}</div>
                        <div class="footer">Generated by FAROUK GRUP © ${now.getFullYear()}</div>
                    </body></html>`;

                    const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `Technical_Feasibility_${companyName}_${now.toISOString().slice(0,10)}.doc`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                } catch (error) {
                    console.error(error);
                    alert('Error generating Word report');
                } finally {
                    hideLoading();
                }
            }

            // ================================================================
            // ========== Export to Excel (Professional) ==========
            // ================================================================
            async function exportToFullExcel() {
                if (!window.lastResults) {
                    alert('Please run the analysis first (click "Calculate Technical Study").');
                    return;
                }
                showLoading('Generating professional Excel report...', 'Creating sheets and charts');
                try {
                    const res = window.lastResults;
                    const currency = res.currency;
                    const companyName = res.companyName;

                    const workbook = new ExcelJS.Workbook();
                    workbook.creator = 'FAROUK GRUP';
                    const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050';
                    const AR = 'FFF5F0E8', DT = 'FF1A1A1A', PB = 'FFD4EDDA', NB = 'FFF8D7DA', GB = 'FFFFF3CD';
                    const PT = 'FF155724', NT = 'FF721C24';

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
                    mh(cv,1,4,4,`Technical Feasibility Study for Restaurants\n${companyName}`,DB,GL,18);
                    const inf=[['📋 Entity',companyName],['📅 Date',new Date().toLocaleDateString('en-US')],['💰 Currency',currency],['📊 Net Profit',`${currency} ${res.accountingProfit.toFixed(0)}`],['📈 Payback',res.paybackMonths===Infinity?'Undefined':`${res.paybackMonths.toFixed(1)} months`]];
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
                    mh(inputsSheet,2,4,2,'Project Basic Data',SB,'FFFFFFFF',11);
                    inputsSheet.getRow(2).height=28;
                    const inputFields = [
                        ['Kitchen Type', document.getElementById('kitchenType').options[document.getElementById('kitchenType').selectedIndex].text, ''],
                        ['Seats', res.seats, ''],
                        ['Service Model', document.getElementById('serviceModel').options[document.getElementById('serviceModel').selectedIndex].text, ''],
                        ['Daily Operating Hours', res.hoursOpen, 'hrs'],
                        ['Shifts', document.getElementById('shifts').options[document.getElementById('shifts').selectedIndex].text, ''],
                        ['Total Area', res.totalArea, 'm²'],
                        ['Kitchen Area %', res.kitchenPercent, '%'],
                        ['Electrical Capacity', res.electricalCapacity, 'Amps'],
                        ['Water Supply', res.waterAvailabilityText, ''],
                        ['Ventilation', res.ventilationText, ''],
                        ['Delivery Accessibility', res.deliveryAccessText, ''],
                        ['Equipment Count', res.equipment.length, ''],
                        ['Total Equipment Power', res.totalPower, 'kW'],
                        ['Total Equipment Cost', `${currency} ${res.equipmentCost.toFixed(0)}`, ''],
                        ['Equipment Space', res.totalSpace, 'm²'],
                        ['Table Turnover Rate', res.turnoverRate, ''],
                        ['Peak Hours', res.peakHours, ''],
                        ['Occupancy Rate', res.occupancyRate*100, '%'],
                        ['Avg Meal Price', `${currency} ${res.avgMealPrice}`, ''],
                        ['Food Cost %', res.foodCostPercent*100, '%'],
                        ['Employees', res.employeesCount, ''],
                        ['Avg Salary', `${currency} ${res.avgSalary}`, ''],
                        ['Monthly Rent', `${currency} ${res.monthlyRent}`, ''],
                        ['Other OPEX', `${currency} ${res.otherOpCost}`, ''],
                        ['Equipment Life', res.equipmentLife, 'years'],
                        ['Fit-out Cost', `${currency} ${res.constructionCost}`, ''],
                        ['Licenses', `${currency} ${res.licensesCost}`, ''],
                        ['Working Capital', `${currency} ${res.workingCapital}`, '']
                    ];
                    let iRow=3;
                    inputFields.forEach(([label,val,note],idx)=>{
                        inputsSheet.getRow(iRow).height=24;
                        const bg=idx%2===0?'FFFEFCF6':'FFFFFFFF';
                        const lc=inputsSheet.getCell(iRow,2), vc=inputsSheet.getCell(iRow,3), nc=inputsSheet.getCell(iRow,4);
                        lc.value=label; vc.value=val; nc.value=note;
                        ap(lc,cs(bg,DT,true,'left'));
                        ap(vc,{...cs(bg,'0000FF',false,'center'),numFmt:typeof val==='number'?'#,##0':null});
                        ap(nc,cs(bg,'00695C',false,'center'));
                        iRow++;
                    });

                    // 3. KPIs
                    const kpiSheet = workbook.addWorksheet('KPIs', { views: [{ showGridLines: false }] });
                    [5,32,22,22,22,5].forEach((w,i)=>kpiSheet.getColumn(i+1).width=w);
                    mh(kpiSheet,1,6,1,'📊 KPI Dashboard',DB,GL,15);
                    kpiSheet.getRow(1).height=45;
                    mh(kpiSheet,2,5,2,`${companyName} | ${new Date().toLocaleDateString('en-US')}`,HB,'FFFFFFFF',10);
                    kpiSheet.getRow(2).height=26;
                    const kpis = [
                        { label: 'Monthly Revenue', value: `${currency} ${Math.round(res.monthlyRevenue)}`, good: true },
                        { label: 'Net Profit', value: `${currency} ${Math.round(res.accountingProfit)}`, good: res.accountingProfit>0 },
                        { label: 'Break-even Revenue', value: `${currency} ${Math.round(res.breakEvenRevenue)}`, good: true },
                        { label: 'Payback Period', value: res.paybackMonths===Infinity?'Undefined':`${res.paybackMonths.toFixed(1)} months`, good: res.paybackMonths<24 },
                        { label: 'Prime Cost', value: `${res.primePercent.toFixed(1)}%`, good: res.primePercent<65 },
                        { label: 'Profit Margin', value: `${((res.accountingProfit/res.monthlyRevenue)*100).toFixed(1)}%`, good: res.accountingProfit>0 }
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
                    kFinal.value=res.accountingProfit>0?'✅ Project is feasible (positive profit)':'⚠️ Project is not feasible (loss)';
                    kFinal.font={name:'Arial',bold:true,size:13,color:{argb:res.accountingProfit>0?PT:'856404'}};
                    kFinal.fill={type:'pattern',pattern:'solid',fgColor:{argb:res.accountingProfit>0?PB:GB}};
                    kFinal.alignment={horizontal:'center',vertical:'middle'};
                    kFinal.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};
                    kpiSheet.getRow(kRow).height=40;

                    // 4. Summary
                    const summarySheet = workbook.addWorksheet('Financial Summary', { views: [{ showGridLines: false }] });
                    summarySheet.getColumn(1).width=5; summarySheet.getColumn(2).width=35; summarySheet.getColumn(3).width=25; summarySheet.getColumn(4).width=25; summarySheet.getColumn(5).width=5;
                    mh(summarySheet,1,5,1,'📋 Financial & Technical Summary',DB,GL,14);
                    summarySheet.getRow(1).height=40;
                    const summData = [
                        ['Total Investment', `${currency} ${res.totalInvestment.toFixed(0)}`, '', ''],
                        ['Monthly Revenue', `${currency} ${res.monthlyRevenue.toFixed(0)}`, 'Technical Rating', `${res.technicalScore}/100 (${res.technicalRating})`],
                        ['Total Monthly Costs', `${currency} ${res.totalMonthlyExpenses.toFixed(0)}`, 'Financial Rating', `${res.financialScore}/100 (${res.financialRating})`],
                        ['Net Profit', `${currency} ${res.accountingProfit.toFixed(0)}`, 'Break-even Revenue', `${currency} ${res.breakEvenRevenue.toFixed(0)}`],
                        ['Payback Period', res.paybackMonths===Infinity?'Undefined':`${res.paybackMonths.toFixed(1)} months`, 'Margin of Safety', `${((res.monthlyRevenue - res.breakEvenRevenue) / res.monthlyRevenue * 100).toFixed(1)}%`]
                    ];
                    let sRow=2;
                    summData.forEach(([l1,v1,l2,v2],idx)=>{
                        summarySheet.getRow(sRow).height=30;
                        const bg=idx%2===0?'FFFEFCF6':'FFFFFFFF';
                        const c1=summarySheet.getCell(sRow,2); c1.value=l1; ap(c1,cs(bg,DT,true,'left'));
                        const c2=summarySheet.getCell(sRow,3); c2.value=v1; ap(c2,{...cs(bg,'0000FF',false,'center'),numFmt:typeof v1==='number'?'#,##0':null});
                        if(l2){ const c3=summarySheet.getCell(sRow,4); c3.value=l2; ap(c3,cs(bg,DT,true,'left'));
                        const c4=summarySheet.getCell(sRow,5); c4.value=v2; ap(c4,cs(bg,'00695C',false,'center')); }
                        sRow++;
                    });

                    // 5. Charts
                    const chartsSheet = workbook.addWorksheet('Charts', { views: [{ showGridLines: false }] });
                    chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
                    mh(chartsSheet,1,3,1,'📊 Project Charts',DB,GL,14);
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

                    // 6. Evaluation
                    const evalSheet = workbook.addWorksheet('Evaluation & Recommendations', { views: [{ showGridLines: false }] });
                    evalSheet.getColumn(1).width=5; evalSheet.getColumn(2).width=50; evalSheet.getColumn(3).width=5;
                    mh(evalSheet,1,3,1,'📝 Evaluation & Recommendations',DB,GL,14);
                    evalSheet.getRow(1).height=45;
                    const warningsText = res.warnings && res.warnings.length ? res.warnings.join('\n') : 'No warnings currently.';
                    const sections = [
                        { title: '1. Technical & Financial Assessment', content: `Technical Score: ${res.technicalScore}/100 (${res.technicalRating})\nFinancial Score: ${res.financialScore}/100 (${res.financialRating})` },
                        { title: '2. Warnings', content: warningsText },
                        { title: '3. Recommendations', content: res.accountingProfit>0 ? '• Project is technically and financially viable.\n• Monitor Prime Cost to maintain profitability.\n• Ensure working capital is available.' : '• Project is not viable as is.\n• Explore cost reduction or revenue increase.\n• Reassess assumptions (occupancy, prices, costs).' },
                        { title: '4. Disclaimer', content: 'This analysis is based on estimated assumptions. Actual results may vary. Professional financial and technical advice is recommended.' }
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
                        tc3.alignment={horizontal:'left',vertical:'middle'};
                        tc3.border={bottom:{style:'medium',color:{argb:G}}};
                        itRow++;
                        evalSheet.getRow(itRow).height=Math.max(60, sec.content.split('\n').length*18);
                        evalSheet.mergeCells(itRow,2,itRow,2);
                        const cc=evalSheet.getCell(itRow,2);
                        cc.value=sec.content;
                        cc.font={name:'Arial',size:10,color:{argb:DT}};
                        cc.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFEFCF6'}};
                        cc.alignment={horizontal:'left',vertical:'top',wrapText:true};
                        cc.border={top:{style:'hair'},bottom:{style:'hair',color:{argb:G}},left:{style:'hair'},right:{style:'hair'}};
                    });

                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const now = new Date();
                    const fileName = `Technical_Feasibility_${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
                    saveAs(blob, fileName);
                } catch(err) {
                    console.error(err);
                    alert('Excel Error: ' + err.message);
                } finally {
                    hideLoading();
                }
            }

            document.getElementById('exportWordBtn').addEventListener('click', exportToWord);
            document.getElementById('exportFullExcelBtn').addEventListener('click', exportToFullExcel);

            // Initial power alert
            updatePowerAlert();

        })();
    