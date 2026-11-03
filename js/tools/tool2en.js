
        (function() {
            'use strict';

            // ===== FIX: Declare global variables for results and inputs =====
            let currentResults = null;
            let currentInputs = null;

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

            // ===== Collapsible =====
            document.querySelectorAll('.collapsible').forEach(coll => {
                coll.addEventListener('click', function() {
                    this.classList.toggle('active');
                    const content = this.nextElementSibling;
                    if (content.style.maxHeight) content.style.maxHeight = null;
                    else content.style.maxHeight = content.scrollHeight + 'px';
                });
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

            // ===== Charts =====
            function renderCharts(currency, netRevenue, fixedCosts, totalVariableCost, netProfit, monthlyCustomers, avgBill,
                breakevenCustomers, contributionMarginRatio) {
                if (window.pieChart) { window.pieChart.destroy();
                    window.pieChart = null; }
                if (window.lineChart) { window.lineChart.destroy();
                    window.lineChart = null; }

                setTimeout(() => {
                    const pieCtx = document.getElementById('costPieChart')?.getContext('2d');
                    if (pieCtx) {
                        window.pieChart = new Chart(pieCtx, {
                            type: 'pie',
                            data: {
                                labels: ['Fixed Costs', 'Variable Costs', 'Net Profit'],
                                datasets: [{
                                    data: [fixedCosts, totalVariableCost, netProfit > 0 ? netProfit : 0],
                                    backgroundColor: ['#dc3545', '#ffc107', '#28a745']
                                }]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    tooltip: {
                                        callbacks: {
                                            label: (ctx) => `${ctx.label}: ${currency}${ctx.raw.toFixed(0)}`
                                        }
                                    }
                                }
                            }
                        });
                    }
                    const lineCtx = document.getElementById('breakevenChart')?.getContext('2d');
                    if (lineCtx) {
                        const maxX = Math.max(monthlyCustomers, breakevenCustomers) * 1.5 || 100;
                        const xVals = [],
                            revLine = [],
                            costLine = [];
                        for (let i = 0; i <= 20; i++) {
                            let c = (i / 20) * maxX;
                            xVals.push(c.toFixed(0));
                            revLine.push(c * avgBill);
                            costLine.push(fixedCosts + c * avgBill * (1 - contributionMarginRatio));
                        }
                        window.lineChart = new Chart(lineCtx, {
                            type: 'line',
                            data: {
                                labels: xVals,
                                datasets: [
                                    { label: 'Revenue', data: revLine, borderColor: '#28a745',
                                        tension: 0.1 },
                                    { label: 'Total Cost', data: costLine, borderColor: '#dc3545',
                                        tension: 0.1 }
                                ]
                            },
                            options: {
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    tooltip: {
                                        callbacks: {
                                            label: (ctx) => `${ctx.dataset.label}: ${currency}${ctx.raw.toFixed(0)}`
                                        }
                                    }
                                },
                                scales: {
                                    x: { title: { display: true, text: 'Number of Customers' } },
                                    y: { title: { display: true, text: currency } }
                                }
                            }
                        });
                    }
                }, 50);
            }

            // ===== Main Calculation =====
            document.getElementById('calculateBtn').addEventListener('click', function() {
                const currency = document.getElementById('currencySelect').value;
                const companyName = document.getElementById('companyName').value || 'Beneficiary Entity';

                const dailyCustomers = parseFloat(document.getElementById('dailyCustomers').value) || 0;
                const avgBill = parseFloat(document.getElementById('avgBill').value) || 0;
                const workingDays = parseFloat(document.getElementById('workingDays').value) || 26;
                const rent = parseFloat(document.getElementById('rent').value) || 0;
                const salaries = parseFloat(document.getElementById('salaries').value) || 0;
                const employeeBurden = parseFloat(document.getElementById('employeeBurden').value) / 100 || 0;
                const utilities = parseFloat(document.getElementById('utilities').value) || 0;
                const internet = parseFloat(document.getElementById('internet').value) || 0;
                const maintenance = parseFloat(document.getElementById('maintenance').value) || 0;
                const marketing = parseFloat(document.getElementById('marketing').value) || 0;
                const otherFixed = parseFloat(document.getElementById('otherFixed').value) || 0;
                const foodCostPct = parseFloat(document.getElementById('foodCostPct').value) / 100 || 0;
                const drinkCostPct = parseFloat(document.getElementById('drinkCostPct').value) / 100 || 0;
                const packagingPct = parseFloat(document.getElementById('packagingPct').value) / 100 || 0;
                const deliveryPct = parseFloat(document.getElementById('deliveryPct').value) / 100 || 0;
                const deliverySalesPct = parseFloat(document.getElementById('deliverySalesPct').value) / 100 || 0;
                const wastePct = parseFloat(document.getElementById('wastePct').value) / 100 || 0;
                const vatPct = parseFloat(document.getElementById('vatPct').value) / 100 || 0;
                const initialInvestment = parseFloat(document.getElementById('initialInvestment').value) || 0;
                const footTraffic = parseFloat(document.getElementById('footTraffic').value) || 0;
                const entryRate = parseFloat(document.getElementById('entryRate').value) / 100 || 0;
                const purchaseRate = parseFloat(document.getElementById('purchaseRate').value) / 100 || 0;
                const tables = parseFloat(document.getElementById('tables').value) || 0;
                const seatsPerTable = parseFloat(document.getElementById('seatsPerTable').value) || 4;
                const sessionMinutes = parseFloat(document.getElementById('sessionMinutes').value) || 60;
                const hoursOpen = parseFloat(document.getElementById('hoursOpen').value) || 10;

                currentInputs = { dailyCustomers, avgBill, workingDays, rent, salaries, employeeBurden, utilities,
                    internet, maintenance, marketing, otherFixed, foodCostPct, drinkCostPct, packagingPct,
                    deliveryPct, deliverySalesPct, wastePct, vatPct, initialInvestment, footTraffic, entryRate,
                    purchaseRate, tables, seatsPerTable, sessionMinutes, hoursOpen, currency, companyName
                };

                const monthlyCustomers = dailyCustomers * workingDays;
                const netRevenue = monthlyCustomers * avgBill;
                const totalSalaryCost = salaries * (1 + employeeBurden);
                const fixedCosts = rent + totalSalaryCost + utilities + internet + maintenance + marketing + otherFixed;

                const foodSales = netRevenue * 0.7;
                const drinkSales = netRevenue * 0.3;
                const deliverySales = netRevenue * deliverySalesPct;
                const foodCost = foodSales * foodCostPct;
                const drinkCost = drinkSales * drinkCostPct;
                const packagingCost = netRevenue * packagingPct;
                const deliveryCommission = deliverySales * deliveryPct;
                const wasteCost = (foodCost + drinkCost) * wastePct;
                const totalVariableCost = foodCost + drinkCost + packagingCost + deliveryCommission + wasteCost;
                const totalOperatingCost = fixedCosts + totalVariableCost;
                const profitBeforeTax = netRevenue - totalOperatingCost;
                const incomeTax = profitBeforeTax > 0 ? profitBeforeTax * 0.25 : 0;
                const netProfit = profitBeforeTax - incomeTax;
                const profitMargin = (netProfit / netRevenue) * 100;

                const contributionMargin = netRevenue - totalVariableCost;
                const contributionMarginRatio = contributionMargin / netRevenue;
                const breakevenRevenue = fixedCosts / contributionMarginRatio;
                const breakevenCustomers = fixedCosts / (avgBill * contributionMarginRatio);
                const breakevenDays = breakevenCustomers / dailyCustomers;

                const annualProfit = netProfit * 12;
                const paybackYears = initialInvestment / annualProfit;
                const paybackMonths = paybackYears * 12;

                const foodCostRatio = foodCost / netRevenue;
                const laborCostRatio = totalSalaryCost / netRevenue;
                const rentRatio = rent / netRevenue;

                const totalSeats = tables * seatsPerTable;
                const sessionsPerDay = hoursOpen * 60 / sessionMinutes;
                const maxDailyCustomers = totalSeats * sessionsPerDay;
                const occupancyRate = (dailyCustomers / maxDailyCustomers) * 100;
                const marginOfSafety = ((netRevenue - breakevenRevenue) / netRevenue) * 100;
                const operatingLeverage = contributionMargin / profitBeforeTax;

                const avgVarCostPerCustomer = totalVariableCost / monthlyCustomers;
                const customersFromLocation = footTraffic * entryRate * purchaseRate;

                currentResults = { netRevenue, fixedCosts, totalVariableCost, netProfit, profitMargin, foodCost,
                    drinkCost, packagingCost, deliveryCommission, wasteCost, totalOperatingCost, foodCostRatio,
                    laborCostRatio, rentRatio, totalSalaryCost, rent, utilities, internet, maintenance, marketing,
                    otherFixed, breakevenRevenue, breakevenCustomers, breakevenDays, paybackYears, paybackMonths,
                    annualProfit, marginOfSafety, operatingLeverage, occupancyRate, maxDailyCustomers,
                    customersFromLocation, avgVarCostPerCustomer, totalSeats, sessionsPerDay, monthlyCustomers,
                    contributionMarginRatio
                };

                document.getElementById('initialMessage').style.display = 'none';
                document.getElementById('resultsSection').style.display = 'block';

                document.getElementById('kpiCards').innerHTML = `
                    <div class="result-card"><i class="fas fa-dollar-sign"></i><h4>Revenue</h4><div class="value">${currency}${netRevenue.toFixed(0)}</div></div>
                    <div class="result-card"><i class="fas fa-file-invoice"></i><h4>Fixed Costs</h4><div class="value">${currency}${fixedCosts.toFixed(0)}</div></div>
                    <div class="result-card"><i class="fas fa-boxes"></i><h4>Variable Costs</h4><div class="value">${currency}${totalVariableCost.toFixed(0)}</div></div>
                    <div class="result-card"><i class="fas fa-chart-line"></i><h4>Net Profit</h4><div class="value">${currency}${netProfit.toFixed(0)}</div><div class="status ${netProfit>0?'status-good':netProfit<0?'status-bad':'status-warning'}">${netProfit>0?'Profitable':netProfit<0?'Losing':'Neutral'}</div></div>
                    <div class="result-card"><i class="fas fa-percent"></i><h4>Profit Margin</h4><div class="value">${profitMargin.toFixed(1)}%</div></div>
                `;

                const alerts = [];
                if (foodCostRatio > 0.35) alerts.push('⚠️ Food cost is high >35%');
                if (laborCostRatio > 0.30) alerts.push('⚠️ Labor cost is high >30%');
                if (wastePct > 0.05) alerts.push(`⚠️ Waste is high ${(wastePct*100).toFixed(1)}%`);
                if (profitMargin < 10 && netProfit > 0) alerts.push('⚠️ Profit margin is low <10%');
                if (netProfit < 0) alerts.push('🔴 The project is losing');
                if (occupancyRate < 30) alerts.push('⚠️ Occupancy is low <30%');
                if (marginOfSafety < 10 && netProfit > 0) alerts.push('⚠️ Margin of safety is tight <10%');
                if (alerts.length === 0) alerts.push('✅ All indicators look good');
                document.getElementById('smartAlerts').innerHTML =
                    `<strong><i class="fas fa-exclamation-triangle" style="color:#cfa776;"></i> Alerts:</strong><br> ${alerts.join('<br>')}`;

                document.getElementById('costBreakdownTable').innerHTML = `
                    <table><thead><tr><th>Item</th><th>Value (${currency})</th><th>%</th></tr></thead><tbody>
                        <tr><td>Rent</td><td>${currency}${rent.toFixed(0)}</td><td>${(rent/netRevenue*100).toFixed(1)}%</td></tr>
                        <tr><td>Salaries (after burden)</td><td>${currency}${totalSalaryCost.toFixed(0)}</td><td>${(totalSalaryCost/netRevenue*100).toFixed(1)}%</td></tr>
                        <tr><td>Utilities</td><td>${currency}${utilities.toFixed(0)}</td><td>${(utilities/netRevenue*100).toFixed(1)}%</td></tr>
                        <tr><td>Internet</td><td>${currency}${internet.toFixed(0)}</td><td>${(internet/netRevenue*100).toFixed(1)}%</td></tr>
                        <tr><td>Maintenance</td><td>${currency}${maintenance.toFixed(0)}</td><td>${(maintenance/netRevenue*100).toFixed(1)}%</td></tr>
                        <tr><td>Marketing</td><td>${currency}${marketing.toFixed(0)}</td><td>${(marketing/netRevenue*100).toFixed(1)}%</td></tr>
                        <tr><td>Other Fixed</td><td>${currency}${otherFixed.toFixed(0)}</td><td>${(otherFixed/netRevenue*100).toFixed(1)}%</td></tr>
                        <tr><td>Food Cost</td><td>${currency}${foodCost.toFixed(0)}</td><td>${(foodCost/netRevenue*100).toFixed(1)}%</td></tr>
                        <tr><td>Drink Cost</td><td>${currency}${drinkCost.toFixed(0)}</td><td>${(drinkCost/netRevenue*100).toFixed(1)}%</td></tr>
                        <tr><td>Packaging</td><td>${currency}${packagingCost.toFixed(0)}</td><td>${(packagingCost/netRevenue*100).toFixed(1)}%</td></tr>
                        <tr><td>Delivery Commission</td><td>${currency}${deliveryCommission.toFixed(0)}</td><td>${(deliveryCommission/netRevenue*100).toFixed(1)}%</td></tr>
                        <tr><td>Waste</td><td>${currency}${wasteCost.toFixed(0)}</td><td>${(wasteCost/netRevenue*100).toFixed(1)}%</td></tr>
                        <tr style="background:rgba(180,133,84,0.15);font-weight:900;"><td>Total</td><td>${currency}${totalOperatingCost.toFixed(0)}</td><td>${(totalOperatingCost/netRevenue*100).toFixed(1)}%</td></tr>
                    </tbody></table>
                `;

                document.getElementById('paybackCard').innerHTML =
                    `<span><i class="fas fa-clock"></i> Payback: <strong>${paybackYears.toFixed(1)} years</strong> (≈ ${paybackMonths.toFixed(0)} months)</span>`;

                const scenarios = [{ name: 'Optimistic', mult: 1.4 }, { name: 'Realistic', mult: 1.0 }, { name: 'Pessimistic',
                        mult: 0.6 }];
                let sensRows = '';
                scenarios.forEach(s => {
                    const cust = dailyCustomers * s.mult;
                    const rev = cust * workingDays * avgBill;
                    const food = rev * 0.7 * foodCostPct;
                    const drink = rev * 0.3 * drinkCostPct;
                    const pack = rev * packagingPct;
                    const deliv = rev * deliverySalesPct * deliveryPct;
                    const waste = (food + drink) * wastePct;
                    const varCost = food + drink + pack + deliv + waste;
                    const pbt = rev - fixedCosts - varCost;
                    const tax = pbt > 0 ? pbt * 0.25 : 0;
                    const profit = pbt - tax;
                    sensRows +=
                        `<tr><td>${s.name}</td><td>${cust.toFixed(0)}</td><td>${currency}${rev.toFixed(0)}</td><td class="${profit>=0?'positive':'negative'}">${currency}${profit.toFixed(0)}</td><td>${(profit/rev*100).toFixed(1)}%</td></tr>`;
                });
                document.getElementById('sensitivityTable').innerHTML =
                    `<table><thead><tr><th>Scenario</th><th>Customers</th><th>Revenue</th><th>Net Profit</th><th>Profit Margin</th></tr></thead><tbody>${sensRows}</tbody></table>`;

                let healthScore = 0;
                healthScore += foodCostRatio <= 0.3 ? 25 : (foodCostRatio <= 0.35 ? 20 : 10);
                healthScore += laborCostRatio <= 0.25 ? 25 : (laborCostRatio <= 0.3 ? 20 : 10);
                healthScore += rentRatio <= 0.08 ? 25 : (rentRatio <= 0.12 ? 20 : 10);
                healthScore += profitMargin >= 15 ? 25 : (profitMargin >= 10 ? 20 : 10);
                let healthStatus = '',
                    healthColor = '';
                if (healthScore >= 80) { healthStatus = 'Excellent 🟢';
                    healthColor = 'status-good'; } else if (healthScore >= 60) { healthStatus = 'Good 🟡';
                    healthColor = 'status-warning'; } else { healthStatus = 'Poor 🔴';
                    healthColor = 'status-bad'; }
                document.getElementById('healthScoreCard').innerHTML = `
                    <table style="width:100%"><thead><tr><th>Indicator</th><th>Value</th><th>Assessment</th></tr></thead><tbody>
                        <tr><td>Food Cost</td><td>${(foodCostRatio*100).toFixed(1)}%</td><td>${foodCostRatio<=0.3?'✅ Good':(foodCostRatio<=0.35?'⚠️ Average':'❌ High')}</td></tr>
                        <tr><td>Labor Cost</td><td>${(laborCostRatio*100).toFixed(1)}%</td><td>${laborCostRatio<=0.25?'✅ Good':(laborCostRatio<=0.3?'⚠️ Average':'❌ High')}</td></tr>
                        <tr><td>Rent Ratio</td><td>${(rentRatio*100).toFixed(1)}%</td><td>${rentRatio<=0.08?'✅ Good':(rentRatio<=0.12?'⚠️ Average':'❌ High')}</td></tr>
                        <tr><td>Net Profit</td><td>${profitMargin.toFixed(1)}%</td><td>${profitMargin>=15?'✅ Good':(profitMargin>=10?'⚠️ Average':'❌ Poor')}</td></tr>
                        <tr style="background:rgba(180,133,84,0.12);"><td colspan="2">Score</td><td><span class="status ${healthColor}">${healthScore}/100 (${healthStatus})</span></td></tr>
                    </tbody></table>
                `;

                document.getElementById('shutdownCard').innerHTML = avgBill < avgVarCostPerCustomer ?
                    `⚠️ Risk of temporary shutdown` :
                    `✅ No immediate shutdown risk`;
                document.getElementById('operatingLeverageCard').innerHTML =
                    `Leverage: ${!isNaN(operatingLeverage)&&isFinite(operatingLeverage)?operatingLeverage.toFixed(2):'Undefined'}`;
                document.getElementById('marginOfSafetyCard').innerHTML =
                    `Margin of Safety: ${marginOfSafety.toFixed(1)}%`;
                document.getElementById('capacityCard').innerHTML =
                    `Max Capacity: ${maxDailyCustomers.toFixed(0)} customers/day<br>Occupancy: ${occupancyRate.toFixed(1)}%`;
                document.getElementById('efficiencyCard').innerHTML =
                    `Per Seat: ${currency}${(netRevenue/totalSeats).toFixed(0)}<br>Per Employee: ${currency}${(netRevenue/Math.max(1,Math.ceil(salaries/3000))).toFixed(0)}`;

                document.getElementById('monteCarloResults').innerHTML = `Press "Run" for simulation.`;
                document.getElementById('breakevenSummary').innerHTML =
                    `<span>🎯 Break-even: ${currency}${breakevenRevenue.toFixed(0)}</span><span style="margin-right:1rem;">👥 ${breakevenCustomers.toFixed(0)} customers</span>`;

                renderCharts(currency, netRevenue, fixedCosts, totalVariableCost, netProfit, monthlyCustomers, avgBill,
                    breakevenCustomers, contributionMarginRatio);
            });

            // ===== Restaurant Valuation =====
            document.getElementById('calcValuationBtn').addEventListener('click', function() {
                if (!currentResults) { alert('Please run the calculation first'); return; }
                const currency = currentInputs.currency;
                const multiple = parseFloat(document.getElementById('valuationMultiple').value) || 3;
                const valuation = currentResults.annualProfit * multiple;
                document.getElementById('valuationCard').innerHTML =
                    `<span>Valuation: <strong>${currency}${valuation.toFixed(0)}</strong> (Multiple ${multiple})</span>`;
            });

            // ===== Monte Carlo =====
            document.getElementById('runMonteCarloBtn').addEventListener('click', function() {
                if (!currentInputs) { alert('Please run the calculation first'); return; }
                const i = currentInputs;
                const fixedCosts = i.rent + i.salaries * (1 + i.employeeBurden) + i.utilities + i.internet + i
                .maintenance + i.marketing + i.otherFixed;
                const profits = [];
                for (let s = 0; s < 1000; s++) {
                    const custF = 0.7 + Math.random() * 0.6;
                    const billF = 0.85 + Math.random() * 0.3;
                    const cust = i.dailyCustomers * custF;
                    const bill = i.avgBill * billF;
                    const rev = cust * i.workingDays * bill;
                    const food = rev * 0.7 * i.foodCostPct * (0.9 + Math.random() * 0.2);
                    const drink = rev * 0.3 * i.drinkCostPct * (0.9 + Math.random() * 0.2);
                    const pack = rev * i.packagingPct;
                    const deliv = rev * i.deliverySalesPct * i.deliveryPct;
                    const waste = (food + drink) * i.wastePct;
                    const varCost = food + drink + pack + deliv + waste;
                    const pbt = rev - fixedCosts - varCost;
                    const tax = pbt > 0 ? pbt * 0.25 : 0;
                    profits.push(pbt - tax);
                }
                profits.sort((a, b) => a - b);
                const mean = profits.reduce((a, b) => a + b, 0) / 1000;
                const p5 = profits[50],
                    p95 = profits[950];
                const probProfit = (profits.filter(p => p > 0).length / 10).toFixed(1);
                document.getElementById('monteCarloResults').innerHTML = `
                    <table style="width:100%;"><tr><td>Mean</td><td>${i.currency}${mean.toFixed(0)}</td></tr>
                    <tr><td>Worst 5%</td><td>${i.currency}${p5.toFixed(0)}</td></tr>
                    <tr><td>Best 5%</td><td>${i.currency}${p95.toFixed(0)}</td></tr>
                    <tr><td>Profit Probability</td><td>${probProfit}%</td></tr></table>
                `;
            });

            // ===== Export to Excel =====
            async function exportToFullExcel() {
                if (!currentResults || !currentInputs) { alert('Please run the analysis first.'); return; }
                showLoading('Generating Excel...', '');
                try {
                    const R = currentResults,
                        I = currentInputs;
                    const currency = I.currency,
                        companyName = I.companyName;
                    const workbook = new ExcelJS.Workbook();
                    workbook.creator = 'FAROUK GRUP';
                    const G = 'FFB48554',
                        GL = 'FFCFA776',
                        DB = 'FF0B0E17';

                    function mh(ws, fc, tc, r, text, bg = DB, tc2 = GL, fs = 12) {
                        ws.mergeCells(r, fc, r, tc);
                        const c = ws.getCell(r, fc);
                        c.value = text;
                        c.font = { name: 'Arial', bold: true, size: fs, color: { argb: tc2 } };
                        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
                        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                        c.border = { top: { style: 'medium', color: { argb: G } }, bottom: { style: 'medium',
                                color: { argb: G } }, left: { style: 'medium', color: { argb: G } },
                            right: { style: 'medium', color: { argb: G } } };
                    }

                    const cv = workbook.addWorksheet('Cover Page', { views: [{ showGridLines: false }] });
                    [8, 45, 35, 8].forEach((w, i) => cv.getColumn(i + 1).width = w);
                    cv.getRow(2).height = 70;
                    cv.getRow(4).height = 50;
                    cv.mergeCells(2, 1, 2, 4);
                    const bc = cv.getCell(2, 1);
                    bc.value = 'FAROUK GRUP\nRestaurant Analysis Report';
                    bc.font = { name: 'Arial', bold: true, size: 24, color: { argb: GL } };
                    bc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DB } };
                    bc.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    mh(cv, 1, 4, 4, `Restaurant Cost Analysis Report\n${companyName}`, DB, GL, 16);
                    const inf = [
                        ['Entity', companyName],
                        ['Date', new Date().toLocaleDateString('en-US')],
                        ['Currency', currency],
                        ['Net Profit', `${currency} ${R.netProfit.toFixed(0)}`],
                        ['Profit Margin', `${R.profitMargin.toFixed(1)}%`]
                    ];
                    let ir = 6;
                    inf.forEach(([l, v], idx) => {
                        cv.mergeCells(ir, 1, ir, 2);
                        cv.mergeCells(ir, 3, ir, 4);
                        const lc = cv.getCell(ir, 1),
                            vc = cv.getCell(ir, 3);
                        lc.value = l;
                        vc.value = v;
                        const bg = idx % 2 === 0 ? 'FFF5F0E8' : 'FFFEFCF6';
                        lc.font = { name: 'Arial', bold: true, size: 10, color: { argb: '00695C' } };
                        lc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
                        lc.alignment = { horizontal: 'right', vertical: 'middle' };
                        vc.font = { name: 'Arial', size: 10, color: { argb: 'FF1A1A1A' } };
                        vc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
                        vc.alignment = { horizontal: 'center', vertical: 'middle' };
                        cv.getRow(ir).height = 26;
                        ir++;
                    });

                    const ish = workbook.addWorksheet('Inputs', { views: [{ showGridLines: false }] });
                    ish.getColumn(1).width = 35;
                    ish.getColumn(2).width = 20;
                    mh(ish, 1, 2, 1, 'Key Inputs', DB, GL, 13);
                    const infields = [
                        ['Daily Customers', I.dailyCustomers],
                        ['Average Bill', I.avgBill],
                        ['Working Days', I.workingDays],
                        ['Rent', I.rent],
                        ['Salaries (Net)', I.salaries],
                        ['Employee Burden', (I.employeeBurden * 100) + '%'],
                        ['Utilities', I.utilities],
                        ['Internet', I.internet],
                        ['Maintenance', I.maintenance],
                        ['Marketing', I.marketing],
                        ['Other Fixed', I.otherFixed],
                        ['Food Cost', (I.foodCostPct * 100) + '%'],
                        ['Drink Cost', (I.drinkCostPct * 100) + '%'],
                        ['Packaging', (I.packagingPct * 100) + '%'],
                        ['Delivery Commission', (I.deliveryPct * 100) + '%'],
                        ['Delivery Sales %', (I.deliverySalesPct * 100) + '%'],
                        ['Waste %', (I.wastePct * 100) + '%'],
                        ['VAT %', (I.vatPct * 100) + '%'],
                        ['Initial Investment', I.initialInvestment]
                    ];
                    infields.forEach(([l, v]) => ish.addRow([l, v]));
                    ish.getRow(2).font = { bold: true, color: { argb: 'FFFFFF' } };
                    ish.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };

                    const ksh = workbook.addWorksheet('KPIs', { views: [{ showGridLines: false }] });
                    ksh.getColumn(1).width = 30;
                    ksh.getColumn(2).width = 20;
                    mh(ksh, 1, 2, 1, 'Key Performance Indicators', DB, GL, 13);
                    const kpis = [
                        ['Monthly Revenue', `${currency} ${R.netRevenue.toFixed(0)}`],
                        ['Fixed Costs', `${currency} ${R.fixedCosts.toFixed(0)}`],
                        ['Variable Costs', `${currency} ${R.totalVariableCost.toFixed(0)}`],
                        ['Net Profit', `${currency} ${R.netProfit.toFixed(0)}`],
                        ['Profit Margin', `${R.profitMargin.toFixed(1)}%`],
                        ['Break-even Revenue', `${currency} ${R.breakevenRevenue.toFixed(0)}`],
                        ['Payback Period', `${R.paybackYears.toFixed(1)} years`],
                        ['Margin of Safety', `${R.marginOfSafety.toFixed(1)}%`]
                    ];
                    kpis.forEach(k => ksh.addRow(k));
                    ksh.getRow(2).font = { bold: true, color: { argb: 'FFFFFF' } };
                    ksh.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };

                    const csh = workbook.addWorksheet('Cost Breakdown', { views: [{ showGridLines: false }] });
                    csh.getColumn(1).width = 30;
                    csh.getColumn(2).width = 20;
                    csh.getColumn(3).width = 20;
                    mh(csh, 1, 3, 1, 'Cost Breakdown', DB, GL, 13);
                    const costs = [
                        ['Rent', R.rent, (R.rent / R.netRevenue * 100).toFixed(1) + '%'],
                        ['Salaries', R.totalSalaryCost, (R.totalSalaryCost / R.netRevenue * 100).toFixed(1) + '%'],
                        ['Utilities', I.utilities, (I.utilities / R.netRevenue * 100).toFixed(1) + '%'],
                        ['Internet', I.internet, (I.internet / R.netRevenue * 100).toFixed(1) + '%'],
                        ['Maintenance', I.maintenance, (I.maintenance / R.netRevenue * 100).toFixed(1) + '%'],
                        ['Marketing', I.marketing, (I.marketing / R.netRevenue * 100).toFixed(1) + '%'],
                        ['Other', I.otherFixed, (I.otherFixed / R.netRevenue * 100).toFixed(1) + '%'],
                        ['Food', R.foodCost, (R.foodCost / R.netRevenue * 100).toFixed(1) + '%'],
                        ['Drinks', R.drinkCost, (R.drinkCost / R.netRevenue * 100).toFixed(1) + '%'],
                        ['Packaging', R.packagingCost, (R.packagingCost / R.netRevenue * 100).toFixed(1) + '%'],
                        ['Delivery', R.deliveryCommission, (R.deliveryCommission / R.netRevenue * 100).toFixed(1) +
                            '%'],
                        ['Waste', R.wasteCost, (R.wasteCost / R.netRevenue * 100).toFixed(1) + '%']
                    ];
                    costs.forEach(c => csh.addRow(c));
                    csh.getRow(2).font = { bold: true, color: { argb: 'FFFFFF' } };
                    csh.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };

                    const chsh = workbook.addWorksheet('Charts', { views: [{ showGridLines: false }] });
                    mh(chsh, 1, 3, 1, 'Charts', DB, GL, 13);
                    const pieCanvas = document.getElementById('costPieChart');
                    const lineCanvas = document.getElementById('breakevenChart');
                    if (pieCanvas) {
                        const img = await html2canvas(pieCanvas, { scale: 2, backgroundColor: '#ffffff' });
                        const id = workbook.addImage({ base64: img.toDataURL('image/png'), extension: 'png' });
                        chsh.addImage(id, { tl: { col: 0, row: 2 }, br: { col: 3, row: 14 } });
                    }
                    if (lineCanvas) {
                        const img = await html2canvas(lineCanvas, { scale: 2, backgroundColor: '#ffffff' });
                        const id = workbook.addImage({ base64: img.toDataURL('image/png'), extension: 'png' });
                        chsh.addImage(id, { tl: { col: 0, row: 16 }, br: { col: 3, row: 28 } });
                    }

                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    saveAs(blob, `Restaurant_${companyName}_${new Date().toISOString().slice(0,10)}.xlsx`);
                } catch (err) { alert('Excel Error: ' + err.message); } finally { hideLoading(); }
            }

            // ===== Export to Word =====
            async function exportToWord() {
                if (!currentResults || !currentInputs) { alert('Please run the analysis first.'); return; }
                showLoading('Generating Word...', '');
                try {
                    const R = currentResults,
                        I = currentInputs;
                    const currency = I.currency,
                        companyName = I.companyName;
                    const pieCanvas = document.getElementById('costPieChart');
                    const lineCanvas = document.getElementById('breakevenChart');
                    let pieImg = '',
                        lineImg = '';
                    if (pieCanvas) { const c = await html2canvas(pieCanvas, { scale: 2, backgroundColor: '#ffffff' });
                        pieImg = c.toDataURL('image/png'); }
                    if (lineCanvas) { const c = await html2canvas(lineCanvas, { scale: 2, backgroundColor: '#ffffff' });
                        lineImg = c.toDataURL('image/png'); }

                    const kpiRows = `
                        <tr><td style="border:1px solid #b8860b;padding:8px;background:#fefcf6;"><h4>Revenue</h4><div style="font-size:1.2rem;color:#b8860b;">${currency}${R.netRevenue.toFixed(0)}</div></td>
                        <td style="border:1px solid #b8860b;padding:8px;background:#fefcf6;"><h4>Fixed Costs</h4><div style="font-size:1.2rem;color:#b8860b;">${currency}${R.fixedCosts.toFixed(0)}</div></td></tr>
                        <tr><td style="border:1px solid #b8860b;padding:8px;background:#fefcf6;"><h4>Variable Costs</h4><div style="font-size:1.2rem;color:#b8860b;">${currency}${R.totalVariableCost.toFixed(0)}</div></td>
                        <td style="border:1px solid #b8860b;padding:8px;background:#fefcf6;"><h4>Net Profit</h4><div style="font-size:1.2rem;color:#b8860b;">${currency}${R.netProfit.toFixed(0)}</div></td></tr>
                    `;
                    let costRows = '';
                    ['Rent', 'Salaries', 'Utilities', 'Internet', 'Maintenance', 'Marketing', 'Other', 'Food', 'Drinks',
                        'Packaging', 'Delivery', 'Waste'
                    ].forEach((n, i) => {
                        const vals = [R.rent, R.totalSalaryCost, I.utilities, I.internet, I.maintenance, I
                            .marketing, I.otherFixed, R.foodCost, R.drinkCost, R.packagingCost, R
                            .deliveryCommission, R.wasteCost
                        ];
                        costRows +=
                            `<tr><td>${n}</td><td>${currency}${vals[i].toFixed(0)}</td><td>${(vals[i]/R.netRevenue*100).toFixed(1)}%</td></tr>`;
                    });

                    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
                        body{font-family:'Arial',sans-serif;margin:2rem;background:#fff;color:#333;}
                        .cover{text-align:center;border-bottom:4px solid #b8860b;margin-bottom:30px;padding-bottom:20px;}
                        .cover h1{color:#b8860b;font-size:28px;}.cover h2{color:#b48554;font-size:20px;}
                        table{width:100%;border-collapse:collapse;margin:16px 0;} th,td{border:1px solid #b8860b;padding:6px;text-align:center;}
                        th{background:#fefcf6;color:#b8860b;} .chart-img{max-width:100%;border:1px solid #b8860b;margin:8px;}
                        .footer{text-align:center;margin-top:30px;color:#888;border-top:1px dashed #b8860b;padding-top:10px;}
                    </style></head><body>
                    <div class="cover"><h1>FAROUK GRUP</h1><h2>Restaurant Cost Analysis Report</h2>
                    <p>Entity: ${companyName} | ${new Date().toLocaleDateString('en-US')}</p></div>
                    <h2>Key Performance Indicators</h2><table>${kpiRows}</table>
                    <div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;">
                        ${pieImg ? `<div style="flex:1;min-width:260px;"><h3>Cost Distribution</h3><img src="${pieImg}" class="chart-img"/></div>` : ''}
                        ${lineImg ? `<div style="flex:1;min-width:260px;"><h3>Break-even Point</h3><img src="${lineImg}" class="chart-img"/></div>` : ''}
                    </div>
                    <h2>Cost Breakdown</h2><table><thead><tr><th>Item</th><th>Value</th><th>%</th></tr></thead><tbody>${costRows}</tbody></table>
                    <h2>Break-even Point</h2><p>Break-even Revenue: ${currency}${R.breakevenRevenue.toFixed(0)} (${R.breakevenCustomers.toFixed(0)} customers)</p>
                    <h2>Payback Period</h2><p>${R.paybackYears.toFixed(1)} years (${R.paybackMonths.toFixed(0)} months)</p>
                    <h2>Restaurant Health</h2><p>Margin of Safety: ${R.marginOfSafety.toFixed(1)}% | Occupancy: ${R.occupancyRate.toFixed(1)}%</p>
                    <div class="footer">© ${new Date().getFullYear()} FAROUK GRUP</div>
                    </body></html>`;

                    const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `Restaurant_${companyName}_${new Date().toISOString().slice(0,10)}.doc`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                } catch (err) { alert('Word Error: ' + err.message); } finally { hideLoading(); }
            }

            document.getElementById('exportWordBtn').addEventListener('click', exportToWord);
            document.getElementById('exportFullExcelBtn').addEventListener('click', exportToFullExcel);

            document.addEventListener('touchmove', function(e) {
                if (e.target.closest('.table-container') || e.target.closest('.modal')) return;
            }, { passive: true });

        })();
    