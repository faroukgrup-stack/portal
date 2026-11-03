
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

            // ===== Core financial functions =====
            function calculateIRR(cashFlows, guess = 0.1, maxIter = 10000, tol = 1e-8) {
                let hasPositive = false, hasNegative = false;
                for (let i = 0; i < cashFlows.length; i++) { if (cashFlows[i] > 0) hasPositive = true; if (cashFlows[i] < 0) hasNegative = true; }
                if (!hasPositive || !hasNegative) return NaN;
                let low = -0.99;
                let high = 1e6;
                let fLow = 0, fHigh = 0;
                for (let i = 0; i < cashFlows.length; i++) { fLow += cashFlows[i] / Math.pow(1 + low, i); fHigh += cashFlows[i] / Math.pow(1 + high, i); }
                if (fLow * fHigh > 0) {
                    let step = 1;
                    while (fLow * fHigh > 0 && high < 1e12) { high *= 2; fHigh = 0; for (let i = 0; i < cashFlows.length; i++) fHigh += cashFlows[i] / Math.pow(1 + high, i); }
                    if (fLow * fHigh > 0) return NaN;
                }
                for (let iter = 0; iter < maxIter; iter++) {
                    let mid = (low + high) / 2;
                    let fMid = 0;
                    for (let i = 0; i < cashFlows.length; i++) fMid += cashFlows[i] / Math.pow(1 + mid, i);
                    if (Math.abs(fMid) < tol) return mid;
                    if (fMid > 0) low = mid;
                    else high = mid;
                }
                return (low + high) / 2;
            }

            function calculateMIRR(cashFlows, financeRate, reinvestRate) {
                let n = cashFlows.length - 1;
                let pvNeg = 0;
                let fvPos = 0;
                for (let i = 0; i <= n; i++) {
                    if (cashFlows[i] < 0) pvNeg += cashFlows[i] / Math.pow(1 + financeRate, i);
                    else if (cashFlows[i] > 0) fvPos += cashFlows[i] * Math.pow(1 + reinvestRate, n - i);
                }
                if (pvNeg === 0) return NaN;
                return Math.pow(-fvPos / pvNeg, 1 / n) - 1;
            }

            function computeProjectFromInputs(inputs) {
                const fixedCap = inputs.fixedCapital,
                    setupCap = inputs.setupCapital,
                    monthlySales = inputs.monthlySales,
                    employees = inputs.employees,
                    netSalary = inputs.netSalary,
                    salaryBurden = inputs.salaryBurden,
                    netRent = inputs.netRent,
                    rentTax = inputs.rentTax,
                    totalVariableCostPercent = inputs.totalVariableCostPercent,
                    opexMonthly = inputs.opexMonthly,
                    cashReserve = inputs.cashReserve,
                    growth = inputs.growth,
                    expGrowth = inputs.expGrowth,
                    discount = inputs.discount,
                    taxRate = inputs.taxRate,
                    lifeYears = inputs.lifeYears,
                    reinvestRate = inputs.reinvestRate,
                    wcMonths = inputs.wcMonths,
                    pricePerUnit = inputs.pricePerUnit;

                const salariesMonthly = employees * netSalary * salaryBurden;
                const rentMonthly = netRent * (1 + rentTax);
                const fixedMonthly = salariesMonthly + rentMonthly + opexMonthly;
                const totalFixedMonthly = fixedMonthly + cashReserve;
                const workingCapitalRequired = totalFixedMonthly * wcMonths;
                const totalInvestment = fixedCap + setupCap + workingCapitalRequired;
                const revenue1 = monthlySales * 12;
                const fixedExpenses1 = (salariesMonthly + rentMonthly + opexMonthly) * 12;
                const depreciation = fixedCap / lifeYears;
                const years = lifeYears;

                let revenues = [], fixedExpenses = [], variableExpenses = [], ebit = [], tax = [], nopat = [], fcf = [];
                let cashFlows = [-totalInvestment];
                for (let i = 1; i <= years; i++) {
                    let rev = revenue1 * Math.pow(1 + growth, i - 1);
                    let fixedExp = fixedExpenses1 * Math.pow(1 + expGrowth, i - 1);
                    let varExp = rev * totalVariableCostPercent;
                    let ebit_ = rev - fixedExp - varExp - depreciation;
                    let tax_ = ebit_ > 0 ? ebit_ * taxRate : 0;
                    let nopat_ = ebit_ - tax_;
                    let fcf_ = nopat_ + depreciation;
                    revenues.push(rev);
                    fixedExpenses.push(fixedExp);
                    variableExpenses.push(varExp);
                    ebit.push(ebit_);
                    tax.push(tax_);
                    nopat.push(nopat_);
                    fcf.push(fcf_);
                    cashFlows.push(fcf_);
                }

                let npv = -totalInvestment;
                for (let i = 1; i <= years; i++) npv += fcf[i - 1] / Math.pow(1 + discount, i);

                const irrValue = calculateIRR(cashFlows);
                const mirrValue = calculateMIRR(cashFlows, discount, reinvestRate);

                let cum = 0, paybackYear = null, paybackFraction = 0;
                for (let i = 0; i < cashFlows.length; i++) {
                    cum += cashFlows[i];
                    if (cum >= 0 && paybackYear === null) { paybackYear = i; let prevCum = cum - cashFlows[i]; paybackFraction = -prevCum / cashFlows[i]; break; }
                }
                const payback = paybackYear !== null ? paybackYear - 1 + paybackFraction : null;

                let discountedCum = 0, dpbpYear = null, dpbpFraction = 0;
                for (let i = 0; i < cashFlows.length; i++) {
                    let dcf = cashFlows[i] / Math.pow(1 + discount, i);
                    discountedCum += dcf;
                    if (discountedCum >= 0 && dpbpYear === null) { dpbpYear = i; let prevCum = discountedCum - dcf; dpbpFraction = -prevCum / dcf; break; }
                }
                const dpbp = dpbpYear !== null ? dpbpYear - 1 + dpbpFraction : null;

                const pvFuture = cashFlows.slice(1).reduce((acc, val, idx) => acc + val / Math.pow(1 + discount, idx + 1), 0);
                const pi = pvFuture / Math.abs(cashFlows[0]);
                const avgNetProfit = nopat.reduce((a, b) => a + b, 0) / years;
                const roi = avgNetProfit / totalInvestment;
                const operatingMargin = revenues[0] ? (ebit[0] / revenues[0]) * 100 : 0;
                const debtService = inputs.debtService || 0;
                const ebitda1 = ebit[0] + depreciation;
                const dscr = debtService > 0 ? ebitda1 / debtService : 0;
                const totalFixedAnnual = fixedExpenses1;
                const contributionMarginRatio = 1 - totalVariableCostPercent;
                const beRevenueActual = totalFixedAnnual / contributionMarginRatio;
                const beUnitsActual = beRevenueActual / pricePerUnit;
                const ebitda = ebit[0] + depreciation;
                const netIncome = nopat[0];
                const netProfitMargin = revenues[0] ? (netIncome / revenues[0]) * 100 : 0;

                return { npv, irr: irrValue, mirr: mirrValue, payback, dpbp, pi, roi, operatingMargin, dscr,
                    workingCapitalRequired, totalInvestment, beRevenueActual, beUnitsActual, totalFixedMonthly,
                    contributionMarginRatio, revenues, fixedExpenses, variableExpenses, ebit, tax, nopat, fcf,
                    years, depreciation, cashFlows, ebitda, netIncome, netProfitMargin };
            }

            function evaluateProject(res, inputs) {
                let score = 0;
                const details = [];
                if (res.npv > 0) { score += 20; details.push("✅ NPV positive"); } else details.push("❌ NPV negative");
                if (!isNaN(res.irr) && res.irr > inputs.discount) { score += 20; details.push("✅ IRR > discount rate"); } else details.push("❌ IRR ≤ discount rate");
                if (res.pi >= 1) { score += 20; details.push("✅ PI ≥ 1"); } else details.push("❌ PI < 1");
                const halfLife = inputs.lifeYears / 2;
                if (res.payback !== null && res.payback < halfLife) { score += 20; details.push(`✅ Payback (${res.payback.toFixed(1)} yrs) < half life (${halfLife} yrs)`); } else if (res.payback !== null) details.push(`❌ Payback (${res.payback.toFixed(1)} yrs) ≥ half life (${halfLife} yrs)`);
                else details.push("❌ No payback within project life");
                if (inputs.debtService > 0) { if (res.dscr > 1.3) { score += 20; details.push(`✅ DSCR (${res.dscr.toFixed(2)}) > 1.3`); } else details.push(`❌ DSCR (${res.dscr.toFixed(2)}) ≤ 1.3`); } else { score += 20; details.push("✅ No debt (default 20 points)"); }
                let grade = "", gradeClass = "", icon = "";
                if (score >= 80) { grade = "Excellent"; gradeClass = "status-good"; icon = "🟢"; }
                else if (score >= 50) { grade = "Moderate"; gradeClass = "status-warning"; icon = "🟡"; }
                else { grade = "High Risk"; gradeClass = "status-bad"; icon = "🔴"; }
                return { score, grade, gradeClass, icon, details };
            }

            let charts = {};

            function renderCharts(res, inputs, currency) {
                for (let key in charts) if (charts[key]) charts[key].destroy();

                const ctx1 = document.getElementById('cashFlowChart').getContext('2d');
                charts.cashFlow = new Chart(ctx1, {
                    type: 'bar',
                    data: {
                        labels: Array.from({ length: res.years }, (_, i) => `Year ${i+1}`),
                        datasets: [{ label: 'Free Cash Flow', data: res.fcf, backgroundColor: 'rgba(184,134,11,0.7)',
                            borderColor: '#b8860b', borderWidth: 1 }]
                    },
                    options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } } }
                });

                const discountRates = [5, 7, 10, 12, 15, 18, 20];
                const npvValues = discountRates.map(r => { let d = r / 100; let npv = -res.totalInvestment; for (let i = 1; i <= res.years; i++) npv += res.fcf[i - 1] / Math.pow(1 + d, i); return npv; });
                const ctx2 = document.getElementById('npvCurveChart').getContext('2d');
                charts.npvCurve = new Chart(ctx2, {
                    type: 'line',
                    data: {
                        labels: discountRates.map(r => r + '%'),
                        datasets: [{ label: 'Net Present Value', data: npvValues, borderColor: '#b8860b',
                            backgroundColor: 'rgba(184,134,11,0.1)', fill: true }]
                    },
                    options: { responsive: true, maintainAspectRatio: true }
                });

                const ctx3 = document.getElementById('revExpChart').getContext('2d');
                charts.revExp = new Chart(ctx3, {
                    type: 'line',
                    data: {
                        labels: Array.from({ length: res.years }, (_, i) => `Year ${i+1}`),
                        datasets: [
                            { label: 'Revenue', data: res.revenues, borderColor: '#28a745' },
                            { label: 'Total Expenses', data: res.fixedExpenses.map((f, i) => f + res.variableExpenses[i]), borderColor: '#dc3545' }
                        ]
                    },
                    options: { responsive: true, maintainAspectRatio: true }
                });

                const beUnits = res.beUnitsActual;
                const units = [0, beUnits, beUnits * 1.5];
                const revenueData = units.map(u => u * inputs.pricePerUnit);
                const fixedCostData = units.map(() => res.fixedExpenses[0]);
                const totalCostData = units.map(u => res.fixedExpenses[0] + u * inputs.pricePerUnit * res.totalVariableCostPercent);
                const ctx4 = document.getElementById('breakevenChart').getContext('2d');
                charts.breakeven = new Chart(ctx4, {
                    type: 'line',
                    data: {
                        labels: units.map(u => u.toFixed(0) + ' units'),
                        datasets: [
                            { label: 'Revenue', data: revenueData, borderColor: '#28a745' },
                            { label: 'Total Cost', data: totalCostData, borderColor: '#dc3545' },
                            { label: 'Fixed Cost', data: fixedCostData, borderColor: '#b8860b', borderDash: [5, 5] }
                        ]
                    },
                    options: { responsive: true, maintainAspectRatio: true }
                });
            }

            function renderScenarios(res, inputs, currency) {
                const pessimisticInputs = { ...inputs };
                pessimisticInputs.monthlySales *= 0.8;
                pessimisticInputs.totalVariableCostPercent = Math.min(inputs.totalVariableCostPercent * 1.1, 1);
                pessimisticInputs.growth *= 0.5;
                const pesRes = computeProjectFromInputs(pessimisticInputs);

                const optimisticInputs = { ...inputs };
                optimisticInputs.monthlySales *= 1.2;
                optimisticInputs.totalVariableCostPercent = Math.max(inputs.totalVariableCostPercent * 0.9, 0);
                optimisticInputs.growth *= 1.5;
                const optRes = computeProjectFromInputs(optimisticInputs);

                document.getElementById('scenarioContainer').innerHTML = `
                    <div class="scenario-card pessimistic"><h4>🔴 Pessimistic</h4><div class="value">${currency}${pesRes.npv.toFixed(0)}</div><div class="label">NPV</div><div class="value">${!isNaN(pesRes.irr)?(pesRes.irr*100).toFixed(2)+'%':'Undefined'}</div></div>
                    <div class="scenario-card expected"><h4>🟡 Expected</h4><div class="value">${currency}${res.npv.toFixed(0)}</div><div class="label">NPV</div><div class="value">${!isNaN(res.irr)?(res.irr*100).toFixed(2)+'%':'Undefined'}</div></div>
                    <div class="scenario-card optimistic"><h4>🟢 Optimistic</h4><div class="value">${currency}${optRes.npv.toFixed(0)}</div><div class="label">NPV</div><div class="value">${!isNaN(optRes.irr)?(optRes.irr*100).toFixed(2)+'%':'Undefined'}</div></div>
                `;
            }

            // ===== Main Calculate event =====
            document.getElementById('calculateBtn').addEventListener('click', function() {
                const currency = document.getElementById('currencySelect').value;
                const inputs = {
                    fixedCapital: parseFloat(document.getElementById('fixedCapital').value) || 0,
                    setupCapital: parseFloat(document.getElementById('setupCapital').value) || 0,
                    monthlySales: parseFloat(document.getElementById('monthlySales').value) || 0,
                    employees: parseFloat(document.getElementById('employees').value) || 0,
                    netSalary: parseFloat(document.getElementById('netSalary').value) || 0,
                    salaryBurden: parseFloat(document.getElementById('salaryBurden').value) || 1,
                    netRent: parseFloat(document.getElementById('netRent').value) || 0,
                    rentTax: parseFloat(document.getElementById('rentTax').value) / 100 || 0,
                    totalVariableCostPercent: parseFloat(document.getElementById('totalVariableCostPercent').value) || 0,
                    opexMonthly: parseFloat(document.getElementById('opexMonthly').value) || 0,
                    cashReserve: parseFloat(document.getElementById('cashReserve').value) || 0,
                    wcMonths: parseFloat(document.getElementById('wcMonths').value) || 3,
                    growth: parseFloat(document.getElementById('growthRate').value) / 100 || 0,
                    expGrowth: parseFloat(document.getElementById('expGrowth').value) / 100 || 0,
                    discount: parseFloat(document.getElementById('discountRate').value) / 100 || 0,
                    taxRate: parseFloat(document.getElementById('taxRate').value) / 100 || 0,
                    lifeYears: parseInt(document.getElementById('lifeYears').value) || 8,
                    reinvestRate: parseFloat(document.getElementById('reinvestRate').value) / 100 || 0.10,
                    debtService: parseFloat(document.getElementById('debtService').value) || 0,
                    pricePerUnit: parseFloat(document.getElementById('pricePerUnit').value) || 0
                };

                const res = computeProjectFromInputs(inputs);
                window.lastResult = res;
                window.lastInputs = inputs;

                document.getElementById('initialMessage').style.display = 'none';
                document.getElementById('resultsSection').style.display = 'block';

                document.getElementById('kpiCards').innerHTML = `
                    <div class="result-card"><i class="fas fa-coins"></i><h4>Net Present Value (NPV)</h4><div class="value">${currency}${res.npv.toFixed(0)}</div><div class="status ${res.npv>0?'status-good':'status-bad'}">${res.npv>0?'Accepted':'Rejected'}</div></div>
                    <div class="result-card"><i class="fas fa-percent"></i><h4>Internal Rate of Return (IRR)</h4><div class="value">${!isNaN(res.irr)?(res.irr*100).toFixed(2):'Undefined'}%</div><div class="status ${res.irr>inputs.discount?'status-good':'status-bad'}">${!isNaN(res.irr)?(res.irr>inputs.discount?'> Discount Rate':'≤ Discount Rate'):''}</div></div>
                    <div class="result-card"><i class="fas fa-chart-pie"></i><h4>Profitability Index (PI)</h4><div class="value">${res.pi.toFixed(2)}</div><div class="unit">${res.pi>=1?'Profitable':'Not Profitable'}</div></div>
                    <div class="result-card"><i class="fas fa-clock"></i><h4>Payback Period</h4><div class="value">${res.payback!==null?res.payback.toFixed(1):'∞'}</div><div class="unit">Years</div></div>
                    <div class="result-card"><i class="fas fa-hourglass-half"></i><h4>Discounted Payback</h4><div class="value">${res.dpbp!==null?res.dpbp.toFixed(1):'∞'}</div><div class="unit">Years</div></div>
                    <div class="result-card"><i class="fas fa-percent"></i><h4>Return on Investment (ROI)</h4><div class="value">${(res.roi*100).toFixed(2)}%</div><div class="unit">Avg. Annual</div></div>
                    <div class="result-card"><i class="fas fa-hand-holding-usd"></i><h4>Working Capital</h4><div class="value">${currency}${res.workingCapitalRequired.toFixed(0)}</div></div>
                    <div class="result-card"><i class="fas fa-percent"></i><h4>Operating Margin</h4><div class="value">${res.operatingMargin.toFixed(2)}%</div></div>
                    <div class="result-card"><i class="fas fa-percent"></i><h4>MIRR</h4><div class="value">${!isNaN(res.mirr)?(res.mirr*100).toFixed(2):'Undefined'}%</div></div>
                    <div class="result-card"><i class="fas fa-shield-alt"></i><h4>DSCR</h4><div class="value">${res.dscr.toFixed(2)}</div></div>
                    <div class="result-card"><i class="fas fa-chart-line"></i><h4>EBITDA (Y1)</h4><div class="value">${currency}${res.ebitda.toFixed(0)}</div></div>
                    <div class="result-card"><i class="fas fa-file-invoice-dollar"></i><h4>Net Profit (Y1)</h4><div class="value">${currency}${res.netIncome.toFixed(0)}</div></div>
                    <div class="result-card"><i class="fas fa-percent"></i><h4>Net Profit Margin</h4><div class="value">${res.netProfitMargin.toFixed(2)}%</div></div>
                `;

                const evaluation = evaluateProject(res, inputs);
                let detailsHtml = evaluation.details.map(d => `<div style="font-size:0.85rem; margin:0.1rem 0;">${d}</div>`).join('');
                document.getElementById('projectScore').innerHTML = `
                    <h3><i class="fas fa-star" style="color:#cfa776;"></i> Project Evaluation</h3>
                    <div style="font-size:2rem; font-weight:900; color:#cfa776;">${evaluation.score} / 100</div>
                    <div class="status ${evaluation.gradeClass}" style="font-size:1.1rem; margin:0.5rem 0;">${evaluation.icon} ${evaluation.grade}</div>
                    <div style="margin-top:0.8rem; border-top:1px solid rgba(180,133,84,0.2); padding-top:0.5rem;">${detailsHtml}</div>
                `;

                let tableHtml = '<table><thead><tr><th>Year</th><th>Revenue</th><th>Fixed Expenses</th><th>Variable</th><th>Depreciation</th><th>EBIT</th><th>Tax</th><th>Net Profit</th><th>Cash Flow</th></tr></thead><tbody>';
                for (let i = 0; i < res.years; i++) {
                    tableHtml += `<tr><td>${i+1}</td><td>${currency}${res.revenues[i].toFixed(0)}</td><td>${currency}${res.fixedExpenses[i].toFixed(0)}</td><td>${currency}${res.variableExpenses[i].toFixed(0)}</td><td>${currency}${res.depreciation.toFixed(0)}</td><td class="${res.ebit[i]<0?'negative':'positive'}">${currency}${res.ebit[i].toFixed(0)}</td><td>${currency}${res.tax[i].toFixed(0)}</td><td class="${res.nopat[i]<0?'negative':'positive'}">${currency}${res.nopat[i].toFixed(0)}</td><td class="${res.fcf[i]<0?'negative':'positive'}">${currency}${res.fcf[i].toFixed(0)}</td></tr>`;
                }
                tableHtml += '</tbody></table>';
                document.getElementById('cashFlowTable').innerHTML = tableHtml;

                const riskDataText = `
                    <strong>Initial Investment:</strong> ${currency} ${res.totalInvestment.toFixed(0)}<br>
                    <strong>Annual Revenue (Y1):</strong> ${currency} ${res.revenues[0].toFixed(0)}<br>
                    <strong>Fixed Costs (Y1):</strong> ${currency} ${res.fixedExpenses[0].toFixed(0)}<br>
                    <strong>Variable Costs (Y1):</strong> ${currency} ${res.variableExpenses[0].toFixed(0)}<br>
                    <strong>Annual Depreciation:</strong> ${currency} ${res.depreciation.toFixed(0)}<br>
                    <strong>Revenue Growth:</strong> ${(inputs.growth*100).toFixed(1)}%<br>
                    <strong>Cost Growth:</strong> ${(inputs.expGrowth*100).toFixed(1)}%<br>
                    <strong>Discount Rate:</strong> ${(inputs.discount*100).toFixed(1)}%<br>
                    <strong>Tax Rate:</strong> ${(inputs.taxRate*100).toFixed(0)}%
                `;
                document.getElementById('riskDataText').innerHTML = riskDataText;

                document.getElementById('breakevenCard').innerHTML = `
                    <div><i class="fas fa-calendar-alt" style="color:#cfa776;"></i> <strong>Break‑even Revenue (Annual):</strong> ${currency}${res.beRevenueActual.toFixed(0)}</div>
                    <div><i class="fas fa-boxes" style="color:#cfa776;"></i> <strong>Units (Annual):</strong> ${res.beUnitsActual.toFixed(0)} units</div>
                    <div><span style="font-size:0.8rem; color:#aab7d4;">(Monthly fixed costs: ${currency}${res.totalFixedMonthly.toFixed(0)}, Contribution margin ${(res.contributionMarginRatio*100).toFixed(0)}%)</span></div>
                `;

                renderCharts(res, inputs, currency);
                renderScenarios(res, inputs, currency);
            });

            // ===== Sensitivity Analysis =====
            document.getElementById('runSensitivity').addEventListener('click', function() {
                if (!window.lastInputs) { alert('Please run the main analysis first.'); return; }
                const inputs = { ...window.lastInputs };
                const currency = document.getElementById('currencySelect').value;
                const sensitivityVar = document.getElementById('sensitivityVar').value;
                const rangePercent = parseFloat(document.getElementById('sensitivityRange').value) / 100;
                const multipliers = [-rangePercent, -rangePercent / 2, 0, rangePercent / 2, rangePercent];
                const labels = [], npvResults = [], irrResults = [];

                for (let m of multipliers) {
                    let modified = { ...inputs };
                    if (sensitivityVar === 'monthlySales') modified.monthlySales = inputs.monthlySales * (1 + m);
                    else if (sensitivityVar === 'fixedCosts') { modified.netSalary *= (1 + m); modified.netRent *= (1 + m); modified.opexMonthly *= (1 + m); }
                    else if (sensitivityVar === 'totalVariableCostPercent') modified.totalVariableCostPercent = Math.min(1, Math.max(0, inputs.totalVariableCostPercent * (1 + m)));
                    else if (sensitivityVar === 'discountRate') modified.discount = inputs.discount * (1 + m);
                    else if (sensitivityVar === 'growthRate') modified.growth = inputs.growth * (1 + m);
                    const res = computeProjectFromInputs(modified);
                    npvResults.push(res.npv);
                    irrResults.push(res.irr * 100);
                    labels.push((m * 100).toFixed(0) + '%');
                }

                let tableHtml = '<table><thead><tr><th>Change</th><th>NPV</th><th>IRR (%)</th></tr></thead><tbody>';
                for (let i = 0; i < labels.length; i++) {
                    tableHtml += `<tr><td>${labels[i]}</td><td class="${npvResults[i]>0?'positive':'negative'}">${currency}${npvResults[i].toFixed(0)}</td><td>${irrResults[i].toFixed(2)}%</td></tr>`;
                }
                tableHtml += '</tbody></table>';
                document.getElementById('sensitivityResults').innerHTML = tableHtml;
            });

            // ========== Export to Excel (Comprehensive) ==========
            async function exportToFullExcel() {
                if (!window.lastResult || !window.lastInputs) {
                    alert('Please run the analysis first.');
                    return;
                }
                showLoading('Generating professional Excel report...', 'Creating sheets and charts');
                try {
                    const currency = document.getElementById('currencySelect').value;
                    const companyName = document.getElementById('companyName').value || 'Beneficiary Entity';
                    const res = window.lastResult;
                    const inputs = window.lastInputs;
                    const evaluation = evaluateProject(res, inputs);

                    const workbook = new ExcelJS.Workbook();
                    workbook.creator = 'FAROUK GRUP';
                    workbook.created = new Date();

                    const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050';
                    const AR = 'FFF5F0E8', W = 'FFFFFFFF', DT = 'FF1A1A1A', PB = 'FFD4EDDA', NB = 'FFF8D7DA';
                    const PT = 'FF155724', NT = 'FF721C24', GB = 'FFFFF3CD';

                    function hs(bg = HB, tc = GL) { return { font: { name: 'Arial', bold: true, size: 11, color: { argb: tc } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }, alignment: { horizontal: 'center', vertical: 'middle', wrapText: true }, border: { top: { style: 'thin', color: { argb: G } }, bottom: { style: 'thin', color: { argb: G } }, left: { style: 'thin', color: { argb: G } }, right: { style: 'thin', color: { argb: G } } } }; }
                    function cs(bg = W, tc = DT, b = false, h = 'center') { return { font: { name: 'Arial', bold: b, size: 10, color: { argb: tc } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }, alignment: { horizontal: h, vertical: 'middle', wrapText: true }, border: { top: { style: 'hair', color: { argb: 'FFCCCCCC' } }, bottom: { style: 'hair', color: { argb: 'FFCCCCCC' } }, left: { style: 'hair', color: { argb: 'FFCCCCCC' } }, right: { style: 'hair', color: { argb: 'FFCCCCCC' } } } }; }
                    function ap(c, s) { if (s.font) c.font = s.font; if (s.fill) c.fill = s.fill; if (s.alignment) c.alignment = s.alignment; if (s.border) c.border = s.border; if (s.numFmt) c.numFmt = s.numFmt; }
                    function mh(ws, fc, tc, r, text, bg = HB, tc2 = GL, fs = 12) { ws.mergeCells(r, fc, r, tc); const c = ws.getCell(r, fc); c.value = text; c.font = { name: 'Arial', bold: true, size: fs, color: { argb: tc2 } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }; c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }; c.border = { top: { style: 'medium', color: { argb: G } }, bottom: { style: 'medium', color: { argb: G } }, left: { style: 'medium', color: { argb: G } }, right: { style: 'medium', color: { argb: G } } }; }

                    // 1. Cover
                    const cv = workbook.addWorksheet('Cover Page', { views: [{ showGridLines: false }] });
                    [8, 45, 35, 8].forEach((w, i) => cv.getColumn(i + 1).width = w);
                    for (let r = 1; r <= 40; r++) cv.getRow(r).height = 22;
                    cv.getRow(2).height = 80;
                    cv.getRow(4).height = 60;
                    cv.mergeCells(2, 1, 2, 4);
                    const bc = cv.getCell(2, 1);
                    bc.value = 'FAROUK GRUP\nConsulting & Business';
                    bc.font = { name: 'Arial', bold: true, size: 28, color: { argb: GL } };
                    bc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DB } };
                    bc.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
                    bc.border = { bottom: { style: 'thick', color: { argb: G } } };
                    mh(cv, 1, 4, 4, `Financial Feasibility Report\n${companyName}`, DB, GL, 18);
                    const inf = [
                        ['📋 Entity', companyName],
                        ['📅 Date', new Date().toLocaleDateString('en-US')],
                        ['💰 Currency', currency],
                        ['📊 NPV', `${currency} ${res.npv.toFixed(0)}`],
                        ['📈 IRR', !isNaN(res.irr) ? (res.irr * 100).toFixed(2) + '%' : 'Undefined']
                    ];
                    let ir = 6;
                    inf.forEach(([l, v], idx) => {
                        cv.mergeCells(ir, 1, ir, 2);
                        cv.mergeCells(ir, 3, ir, 4);
                        const lc = cv.getCell(ir, 1), vc = cv.getCell(ir, 3);
                        lc.value = l;
                        vc.value = v;
                        const bg = idx % 2 === 0 ? AR : 'FFFEFCF6';
                        ap(lc, { font: { name: 'Arial', bold: true, size: 11, color: { argb: '00695C' } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }, alignment: { horizontal: 'right', vertical: 'middle' }, border: { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' }, right: { style: 'hair' } } });
                        ap(vc, { font: { name: 'Arial', size: 11, color: { argb: DT } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }, alignment: { horizontal: 'center', vertical: 'middle' }, border: { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' }, right: { style: 'hair' } } });
                        cv.getRow(ir).height = 28;
                        ir++;
                    });

                    // 2. Inputs
                    const inputsSheet = workbook.addWorksheet('Inputs & Assumptions', { views: [{ showGridLines: false }] });
                    inputsSheet.getColumn(1).width = 5;
                    inputsSheet.getColumn(2).width = 38;
                    inputsSheet.getColumn(3).width = 22;
                    inputsSheet.getColumn(4).width = 22;
                    inputsSheet.getColumn(5).width = 5;
                    mh(inputsSheet, 1, 5, 1, '📋 Inputs & Assumptions', DB, GL, 14);
                    inputsSheet.getRow(1).height = 40;
                    mh(inputsSheet, 2, 4, 2, 'Project Basic Data', SB, W, 11);
                    inputsSheet.getRow(2).height = 28;
                    const inputFields = [
                        ['Fixed Capital', inputs.fixedCapital, `${currency} ${inputs.fixedCapital.toFixed(0)}`],
                        ['Setup Capital', inputs.setupCapital, `${currency} ${inputs.setupCapital.toFixed(0)}`],
                        ['Monthly Cash Sales', inputs.monthlySales, `${currency} ${inputs.monthlySales.toFixed(0)}`],
                        ['Number of Employees', inputs.employees, ''],
                        ['Average Monthly Net Salary', inputs.netSalary, `${currency} ${inputs.netSalary.toFixed(0)}`],
                        ['Employee Cost Factor', inputs.salaryBurden, ''],
                        ['Monthly Net Rent', inputs.netRent, `${currency} ${inputs.netRent.toFixed(0)}`],
                        ['VAT on Rent', inputs.rentTax * 100, `${(inputs.rentTax*100).toFixed(0)}%`],
                        ['Total Variable Costs (% of sales)', inputs.totalVariableCostPercent * 100, `${(inputs.totalVariableCostPercent*100).toFixed(1)}%`],
                        ['Monthly Fixed Operating Expenses', inputs.opexMonthly, `${currency} ${inputs.opexMonthly.toFixed(0)}`],
                        ['Monthly Cash Reserve', inputs.cashReserve, `${currency} ${inputs.cashReserve.toFixed(0)}`],
                        ['Working Capital Coverage (months)', inputs.wcMonths, ''],
                        ['Annual Sales Growth', inputs.growth * 100, `${(inputs.growth*100).toFixed(1)}%`],
                        ['Annual Expense Growth', inputs.expGrowth * 100, `${(inputs.expGrowth*100).toFixed(1)}%`],
                        ['Discount Rate (WACC)', inputs.discount * 100, `${(inputs.discount*100).toFixed(1)}%`],
                        ['Income Tax Rate', inputs.taxRate * 100, `${(inputs.taxRate*100).toFixed(0)}%`],
                        ['Economic Life', inputs.lifeYears, 'Years'],
                        ['Reinvestment Rate (MIRR)', inputs.reinvestRate * 100, `${(inputs.reinvestRate*100).toFixed(1)}%`],
                        ['Annual Debt Service', inputs.debtService, `${currency} ${inputs.debtService.toFixed(0)}`],
                        ['Unit Selling Price', inputs.pricePerUnit, `${currency} ${inputs.pricePerUnit.toFixed(0)}`]
                    ];
                    let iRow = 3;
                    inputFields.forEach(([label, val, note], idx) => {
                        inputsSheet.getRow(iRow).height = 24;
                        const bg = idx % 2 === 0 ? 'FFFEFCF6' : 'FFFFFFFF';
                        const lc = inputsSheet.getCell(iRow, 2), vc = inputsSheet.getCell(iRow, 3), nc = inputsSheet.getCell(iRow, 4);
                        lc.value = label;
                        vc.value = val;
                        nc.value = note;
                        ap(lc, cs(bg, DT, true, 'left'));
                        ap(vc, { ...cs(bg, '0000FF', false, 'center'), numFmt: typeof val === 'number' ? '#,##0' : null });
                        ap(nc, cs(bg, '00695C', false, 'center'));
                        iRow++;
                    });

                    // 3. KPI
                    const kpiSheet = workbook.addWorksheet('Key Performance Indicators', { views: [{ showGridLines: false }] });
                    [5, 32, 22, 22, 22, 5].forEach((w, i) => kpiSheet.getColumn(i + 1).width = w);
                    mh(kpiSheet, 1, 6, 1, '📊 KPI Dashboard', DB, GL, 15);
                    kpiSheet.getRow(1).height = 45;
                    mh(kpiSheet, 2, 5, 2, `${companyName} | ${new Date().toLocaleDateString('en-US')}`, HB, W, 10);
                    kpiSheet.getRow(2).height = 26;
                    const kpis = [
                        { label: 'NPV', value: `${currency} ${res.npv.toFixed(0)}`, good: res.npv > 0 },
                        { label: 'IRR', value: !isNaN(res.irr) ? (res.irr * 100).toFixed(2) + '%' : 'Undefined', good: !isNaN(res.irr) && res.irr > inputs.discount },
                        { label: 'PI', value: res.pi.toFixed(2), good: res.pi >= 1 },
                        { label: 'Payback Period', value: res.payback !== null ? res.payback.toFixed(1) + ' years' : '∞', good: res.payback !== null && res.payback < inputs.lifeYears / 2 },
                        { label: 'ROI', value: (res.roi * 100).toFixed(2) + '%', good: true },
                        { label: 'EBITDA (Y1)', value: `${currency} ${res.ebitda.toFixed(0)}`, good: true }
                    ];
                    let kRow = 3;
                    kpis.forEach((k, idx) => {
                        kpiSheet.getRow(kRow).height = 40;
                        kpiSheet.mergeCells(kRow, 2, kRow, 2);
                        kpiSheet.mergeCells(kRow, 3, kRow, 3);
                        kpiSheet.mergeCells(kRow, 4, kRow, 4);
                        kpiSheet.mergeCells(kRow, 5, kRow, 5);
                        const ic = kpiSheet.getCell(kRow, 2);
                        ic.value = `🔹 ${idx+1}`;
                        const lc2 = kpiSheet.getCell(kRow, 3);
                        lc2.value = k.label;
                        const vc3 = kpiSheet.getCell(kRow, 4);
                        vc3.value = k.value;
                        const nc2 = kpiSheet.getCell(kRow, 5);
                        nc2.value = '';
                        const bg = k.good ? PB : NB, tc = k.good ? PT : NT;
                        [ic, lc2, vc3, nc2].forEach(c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }; c.border = { top: { style: 'thin', color: { argb: G } }, bottom: { style: 'thin', color: { argb: G } }, left: { style: 'thin', color: { argb: G } }, right: { style: 'thin', color: { argb: G } } }; });
                        ic.font = { name: 'Arial', bold: true, size: 14, color: { argb: '555555' } };
                        ic.alignment = { horizontal: 'center', vertical: 'middle' };
                        lc2.font = { name: 'Arial', bold: true, size: 11, color: { argb: DT } };
                        lc2.alignment = { horizontal: 'left', vertical: 'middle' };
                        vc3.font = { name: 'Arial', bold: true, size: 13, color: { argb: tc } };
                        vc3.alignment = { horizontal: 'center', vertical: 'middle' };
                        kRow++;
                    });
                    kRow++;
                    kpiSheet.mergeCells(kRow, 2, kRow, 5);
                    const kFinal = kpiSheet.getCell(kRow, 2);
                    kFinal.value = res.npv > 0 ? '✅ Project is financially feasible (NPV positive)' : '⚠️ Project is not feasible (NPV negative)';
                    kFinal.font = { name: 'Arial', bold: true, size: 13, color: { argb: res.npv > 0 ? PT : '856404' } };
                    kFinal.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: res.npv > 0 ? PB : GB } };
                    kFinal.alignment = { horizontal: 'center', vertical: 'middle' };
                    kFinal.border = { top: { style: 'medium', color: { argb: G } }, bottom: { style: 'medium', color: { argb: G } }, left: { style: 'medium', color: { argb: G } }, right: { style: 'medium', color: { argb: G } } };
                    kpiSheet.getRow(kRow).height = 40;

                    // 4. Cash Flows
                    const cashSheet = workbook.addWorksheet('Projected Cash Flows', { views: [{ showGridLines: false }] });
                    cashSheet.getColumn(1).width = 5;
                    cashSheet.getColumn(2).width = 15;
                    cashSheet.getColumn(3).width = 18;
                    cashSheet.getColumn(4).width = 18;
                    cashSheet.getColumn(5).width = 18;
                    cashSheet.getColumn(6).width = 18;
                    cashSheet.getColumn(7).width = 15;
                    cashSheet.getColumn(8).width = 18;
                    cashSheet.getColumn(9).width = 18;
                    cashSheet.getColumn(10).width = 18;
                    cashSheet.getColumn(11).width = 5;
                    mh(cashSheet, 1, 11, 1, '📋 Projected Cash Flows', DB, GL, 14);
                    cashSheet.getRow(1).height = 40;
                    cashSheet.addRow(['Year', 'Revenue', 'Fixed Expenses', 'Variable', 'Depreciation', 'EBIT', 'Tax', 'Net Profit', 'Cash Flow']);
                    for (let i = 0; i < res.years; i++) {
                        cashSheet.addRow([i + 1, res.revenues[i], res.fixedExpenses[i], res.variableExpenses[i],
                            res.depreciation, res.ebit[i], res.tax[i], res.nopat[i], res.fcf[i]
                        ]);
                    }
                    const cashHeader = cashSheet.getRow(2);
                    cashHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    cashHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };

                    // 5. Charts
                    const chartsSheet = workbook.addWorksheet('Charts', { views: [{ showGridLines: false }] });
                    chartsSheet.getColumn(1).width = 5;
                    chartsSheet.getColumn(2).width = 50;
                    chartsSheet.getColumn(3).width = 5;
                    mh(chartsSheet, 1, 3, 1, '📊 Project Charts', DB, GL, 14);
                    chartsSheet.getRow(1).height = 40;
                    const chartContainer = document.querySelector('.charts-container');
                    if (chartContainer) {
                        try {
                            const origBg = chartContainer.style.backgroundColor;
                            chartContainer.style.backgroundColor = '#ffffff';
                            const canvasImg = await html2canvas(chartContainer, { scale: 2, backgroundColor: '#ffffff' });
                            chartContainer.style.backgroundColor = origBg;
                            const imgData = canvasImg.toDataURL('image/png');
                            const imageId = workbook.addImage({ base64: imgData, extension: 'png' });
                            chartsSheet.addImage(imageId, { tl: { col: 1, row: 2 }, br: { col: 2, row: 30 }, editAs: 'oneCell' });
                        } catch (err) { }
                    }

                    // 6. Evaluation
                    const evalSheet = workbook.addWorksheet('Evaluation & Recommendations', { views: [{ showGridLines: false }] });
                    evalSheet.getColumn(1).width = 5;
                    evalSheet.getColumn(2).width = 50;
                    evalSheet.getColumn(3).width = 5;
                    mh(evalSheet, 1, 3, 1, '📝 Evaluation & Recommendations', DB, GL, 14);
                    evalSheet.getRow(1).height = 45;
                    const sections = [
                        { title: '1. Project Evaluation', content: `Score: ${evaluation.score}/100\nGrade: ${evaluation.grade}\n${evaluation.details.join('\n')}` },
                        { title: '2. Break‑even Analysis', content: `Annual Break‑even Revenue: ${currency} ${res.beRevenueActual.toFixed(0)}\nUnits: ${res.beUnitsActual.toFixed(0)} units` },
                        { title: '3. Recommendations', content: res.npv > 0 ? '• Project is financially feasible, proceed.\n• Monitor variable costs to maintain margins.\n• Maintain required working capital.' : '• Project is not feasible as is.\n• Explore cost reduction or revenue increase.\n• Reassess assumptions or consider alternatives.' },
                        { title: '4. Disclaimer', content: 'This analysis is based on estimated assumptions. Actual results may vary. Professional financial advice is recommended.' }
                    ];
                    let itRow = 2;
                    sections.forEach((sec, idx) => {
                        itRow++;
                        evalSheet.getRow(itRow).height = 30;
                        evalSheet.mergeCells(itRow, 2, itRow, 2);
                        const tc3 = evalSheet.getCell(itRow, 2);
                        tc3.value = sec.title;
                        tc3.font = { name: 'Arial', bold: true, size: 12, color: { argb: GL } };
                        tc3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: idx % 2 === 0 ? HB : SB } };
                        tc3.alignment = { horizontal: 'left', vertical: 'middle' };
                        tc3.border = { bottom: { style: 'medium', color: { argb: G } } };
                        itRow++;
                        evalSheet.getRow(itRow).height = Math.max(60, sec.content.split('\n').length * 18);
                        evalSheet.mergeCells(itRow, 2, itRow, 2);
                        const cc = evalSheet.getCell(itRow, 2);
                        cc.value = sec.content;
                        cc.font = { name: 'Arial', size: 10, color: { argb: DT } };
                        cc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEFCF6' } };
                        cc.alignment = { horizontal: 'left', vertical: 'top', wrapText: true };
                        cc.border = { top: { style: 'hair' }, bottom: { style: 'hair', color: { argb: G } }, left: { style: 'hair' }, right: { style: 'hair' } };
                    });

                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const now = new Date();
                    const fileName = `Feasibility_${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
                    saveAs(blob, fileName);
                } catch (err) {
                    console.error(err);
                    alert('Error generating Excel file: ' + err.message);
                } finally {
                    hideLoading();
                }
            }

            // ========== Export to Word ==========
            async function exportToWord() {
                if (!window.lastResult || !window.lastInputs) {
                    alert('Please run the analysis first.');
                    return;
                }
                showLoading('Generating professional Word report...', 'Collecting data and charts');
                try {
                    const currency = document.getElementById('currencySelect').value;
                    const companyName = document.getElementById('companyName').value || 'Beneficiary Entity';
                    const res = window.lastResult;
                    const inputs = window.lastInputs;
                    const evaluation = evaluateProject(res, inputs);

                    const chartContainer = document.querySelector('.charts-container');
                    let chartImgBase64 = '';
                    if (chartContainer) {
                        const origBg = chartContainer.style.backgroundColor;
                        chartContainer.style.backgroundColor = '#ffffff';
                        const img = await html2canvas(chartContainer, { scale: 2, backgroundColor: '#ffffff' });
                        chartContainer.style.backgroundColor = origBg;
                        chartImgBase64 = img.toDataURL('image/png');
                    }

                    let kpiRows = '';
                    const kpiCards = document.querySelectorAll('#kpiCards .result-card');
                    let row = '';
                    let count = 0;
                    kpiCards.forEach((card, index) => {
                        const icon = card.querySelector('i') ? card.querySelector('i').outerHTML : '';
                        const title = card.querySelector('h4') ? card.querySelector('h4').innerText : '';
                        const value = card.querySelector('.value') ? card.querySelector('.value').innerText : '';
                        const unit = card.querySelector('.unit') ? card.querySelector('.unit').innerText : '';
                        const status = card.querySelector('.status') ? card.querySelector('.status').outerHTML : '';
                        const cell = `<td style="border:1px solid #b8860b; padding:15px; text-align:center; background:#fefcf6;">${icon}<h4 style="margin:0.5rem 0; color:#666;">${title}</h4><div style="font-size:1.6rem; font-weight:900; color:#b8860b;">${value}</div><div style="font-size:0.9rem; color:#777;">${unit}</div>${status}</td>`;
                        row += cell;
                        count++;
                        if (count % 2 === 0 || index === kpiCards.length - 1) { kpiRows += `<tr>${row}</tr>`; row = ''; }
                    });

                    let tableRows = '';
                    for (let i = 0; i < res.years; i++) {
                        tableRows += `<tr><td>${i+1}</td><td>${currency}${res.revenues[i].toFixed(0)}</td><td>${currency}${res.fixedExpenses[i].toFixed(0)}</td><td>${currency}${res.variableExpenses[i].toFixed(0)}</td><td>${currency}${res.depreciation.toFixed(0)}</td><td>${currency}${res.ebit[i].toFixed(0)}</td><td>${currency}${res.tax[i].toFixed(0)}</td><td>${currency}${res.nopat[i].toFixed(0)}</td><td>${currency}${res.fcf[i].toFixed(0)}</td></tr>`;
                    }

                    const now = new Date();
                    const dateStr = now.toLocaleDateString('en-US');

                    const fullHtml = `<!DOCTYPE html>
                    <html>
                    <head><meta charset="utf-8"><title>Feasibility Report - FAROUK GRUP</title>
                    <style>
                        body{font-family:'Arial',sans-serif;margin:2rem;background:#fff;color:#333;}
                        .cover{text-align:center;border-bottom:4px solid #b8860b;margin-bottom:30px;padding-bottom:20px;}
                        .cover h1{font-size:32px;color:#b8860b;margin:0;}
                        .cover h2{font-size:24px;color:#b48554;margin:5px 0;}
                        table{width:100%;border-collapse:collapse;margin:20px 0;}
                        th,td{border:1px solid #b8860b;padding:8px;text-align:center;}
                        th{background:#fefcf6;color:#b8860b;}
                        .chart-img{max-width:100%;height:auto;border:1px solid #b8860b;border-radius:10px;margin:20px 0;}
                        .footer{text-align:center;margin-top:40px;color:#888;border-top:1px dashed #b8860b;padding-top:10px;}
                    </style></head>
                    <body>
                        <div class="cover">
                            <h1>FAROUK GRUP</h1>
                            <h2>Financial Feasibility Report</h2>
                            <p>Entity: ${companyName} | Date: ${dateStr}</p>
                            <p>Currency: ${currency} | NPV: ${currency} ${res.npv.toFixed(0)}</p>
                        </div>
                        <h2 style="color:#b8860b;">Inputs Overview</h2>
                        <table><tbody>
                            <tr><th>Fixed Capital</th><td>${currency} ${inputs.fixedCapital}</td><th>Setup Capital</th><td>${currency} ${inputs.setupCapital}</td></tr>
                            <tr><th>Monthly Sales</th><td>${currency} ${inputs.monthlySales}</td><th>Employees</th><td>${inputs.employees}</td></tr>
                            <tr><th>Avg Salary</th><td>${currency} ${inputs.netSalary}</td><th>Monthly Rent</th><td>${currency} ${inputs.netRent}</td></tr>
                            <tr><th>Sales Growth</th><td>${(inputs.growth*100).toFixed(1)}%</td><th>Discount Rate</th><td>${(inputs.discount*100).toFixed(1)}%</td></tr>
                        </tbody></table>
                        <h2 style="color:#b8860b;">📊 Key Performance Indicators</h2>
                        <table>${kpiRows}</table>
                        <h2 style="color:#b8860b;">📈 Charts</h2>
                        <div style="text-align:center;"><img src="${chartImgBase64}" class="chart-img" /></div>
                        <h2 style="color:#b8860b;">📋 Projected Cash Flows</h2>
                        <table><thead><tr><th>Year</th><th>Revenue</th><th>Fixed Exp.</th><th>Variable Exp.</th><th>Depreciation</th><th>EBIT</th><th>Tax</th><th>Net Profit</th><th>Cash Flow</th></tr></thead><tbody>${tableRows}</tbody></table>
                        <h2 style="color:#b8860b;">🎯 Break‑even Point</h2>
                        <p>Annual Break‑even Revenue: ${currency} ${res.beRevenueActual.toFixed(0)} (${res.beUnitsActual.toFixed(0)} units)</p>
                        <h2 style="color:#b8860b;">💡 Evaluation & Recommendations</h2>
                        <div style="background:#fefcf6;padding:15px;border-radius:10px;border-left:4px solid #b8860b;">
                            <p><strong>Score:</strong> ${evaluation.score}/100 - ${evaluation.grade}</p>
                            <p>${evaluation.details.join('<br>')}</p>
                        </div>
                        <div class="footer">Generated by FAROUK GRUP © ${now.getFullYear()}</div>
                    </body></html>`;

                    const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `Feasibility_${companyName}_${now.toISOString().slice(0,10)}.doc`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                } catch (error) {
                    console.error(error);
                    alert('Error generating Word report');
                } finally {
                    hideLoading();
                }
            }

            document.getElementById('exportWordBtn').addEventListener('click', exportToWord);
            document.getElementById('exportFullExcelBtn').addEventListener('click', exportToFullExcel);

            document.addEventListener('touchmove', function(e) {
                if (e.target.closest('.table-container') || e.target.closest('.modal')) return;
            }, { passive: true });

        })();
    