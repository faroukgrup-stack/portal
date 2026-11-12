
        (function() {
            'use strict';

            // ===== آلة حاسبة =====
            const calcDisplay = document.getElementById('calcDisplay');
            let currentCalcInput = '';

            function handleCalc(v) {
                if (v === 'C') { currentCalcInput = '';
                    calcDisplay.value = ''; return; }
                if (v === '⌫') { currentCalcInput = currentCalcInput.slice(0, -1);
                    calcDisplay.value = currentCalcInput; return; }
                if (v === '=') {
                    try {
                        let r = eval(currentCalcInput.replace(/×/g, '*').replace(/÷/g, '/'));
                        calcDisplay.value = r;
                        currentCalcInput = r.toString();
                    } catch (e) { calcDisplay.value = T('s1');
                        currentCalcInput = ''; }
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

            // ===== عناصر قابلة للطي =====
            document.querySelectorAll('.collapsible').forEach(coll => {
                coll.addEventListener('click', function() {
                    this.classList.toggle('active');
                    const content = this.nextElementSibling;
                    if (content.style.maxHeight) content.style.maxHeight = null;
                    else content.style.maxHeight = content.scrollHeight + 'px';
                });
            });

            // ===== دوال التحميل =====
            function showLoading(title, msg) {
                document.getElementById('loadingTitle').textContent = title;
                document.getElementById('loadingMsg').textContent = msg;
                document.getElementById('exportLoading').classList.add('show');
            }

            function hideLoading() {
                document.getElementById('exportLoading').classList.remove('show');
            }

            // ===== متغيرات عامة =====
            let currentResults = null;
            let currentInputs = null;

            // ===== رسوم بيانية =====
            function renderCharts(currency, netRevenue, fixedCosts, totalVariableCost, netProfit, monthlyCustomers, avgBill,
                breakevenCustomers, contributionMarginRatio, LN) {
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
                                labels: [T('s2'), T('s3'), T('s4')],
                                datasets: [{
                                    data: [fixedCosts, totalVariableCost, netProfit > 0 ? netProfit :
                                        0
                                    ],
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
                        const xVals = LN.xVals, revLine = LN.revLine, costLine = LN.costLine;
                        window.lineChart = new Chart(lineCtx, {
                            type: 'line',
                            data: {
                                labels: xVals,
                                datasets: [
                                    { label: T('s5'), data: revLine, borderColor: '#28a745',
                                        tension: 0.1 },
                                    { label: T('s6'), data: costLine, borderColor: '#dc3545',
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
                                    x: { title: { display: true, text: T('s7') } },
                                    y: { title: { display: true, text: currency } }
                                }
                            }
                        });
                    }
                }, 50);
            }

            // ===== الحساب الرئيسي =====
            document.getElementById('calculateBtn').addEventListener('click', async function() {
                const currency = document.getElementById('currencySelect').value;
                const companyName = document.getElementById('companyName').value || T('s8');

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
                    purchaseRate, tables, seatsPerTable, sessionMinutes, hoursOpen, currency, companyName };

                let R;
                try { R = await FG.calc('tool2', 'main', currentInputs); } catch (e) { FG.calcError(e); return; }
                currentResults = R.currentResults;
                const { netRevenue, fixedCosts, totalVariableCost, netProfit, profitMargin, foodCost, drinkCost, packagingCost, deliveryCommission, wasteCost, totalOperatingCost, foodCostRatio, laborCostRatio, rentRatio, totalSalaryCost, breakevenRevenue, breakevenCustomers, breakevenDays, paybackYears, paybackMonths, annualProfit, marginOfSafety, operatingLeverage, occupancyRate, maxDailyCustomers, customersFromLocation, avgVarCostPerCustomer, totalSeats, sessionsPerDay, monthlyCustomers, contributionMarginRatio } = currentResults;

                document.getElementById('initialMessage').style.display = 'none';
                document.getElementById('resultsSection').style.display = 'block';

                document.getElementById('kpiCards').innerHTML = `${T('s12')}${currency}${netRevenue.toFixed(0)}${T('s13')}${currency}${fixedCosts.toFixed(0)}${T('s14')}${currency}${totalVariableCost.toFixed(0)}${T('s15')}${currency}${netProfit.toFixed(0)}</div><div class="status ${netProfit>0?'status-good':netProfit<0?'status-bad':'status-warning'}">${netProfit>0?T('s9'):netProfit<0?T('s10'):T('s11')}${T('s16')}${profitMargin.toFixed(1)}%</div></div>
                `;

                const alerts = R.alerts;
                document.getElementById('smartAlerts').innerHTML =
                    `${T('s25')}${alerts.join('<br>')}`;

                document.getElementById('costBreakdownTable').innerHTML = `${T('s26')}${currency}${T('s27')}${currency}${rent.toFixed(0)}</td><td>${(rent/netRevenue*100).toFixed(1)}${T('s28')}${currency}${totalSalaryCost.toFixed(0)}</td><td>${(totalSalaryCost/netRevenue*100).toFixed(1)}${T('s29')}${currency}${utilities.toFixed(0)}</td><td>${(utilities/netRevenue*100).toFixed(1)}${T('s30')}${currency}${internet.toFixed(0)}</td><td>${(internet/netRevenue*100).toFixed(1)}${T('s31')}${currency}${maintenance.toFixed(0)}</td><td>${(maintenance/netRevenue*100).toFixed(1)}${T('s32')}${currency}${marketing.toFixed(0)}</td><td>${(marketing/netRevenue*100).toFixed(1)}${T('s33')}${currency}${otherFixed.toFixed(0)}</td><td>${(otherFixed/netRevenue*100).toFixed(1)}${T('s34')}${currency}${foodCost.toFixed(0)}</td><td>${(foodCost/netRevenue*100).toFixed(1)}${T('s35')}${currency}${drinkCost.toFixed(0)}</td><td>${(drinkCost/netRevenue*100).toFixed(1)}${T('s36')}${currency}${packagingCost.toFixed(0)}</td><td>${(packagingCost/netRevenue*100).toFixed(1)}${T('s37')}${currency}${deliveryCommission.toFixed(0)}</td><td>${(deliveryCommission/netRevenue*100).toFixed(1)}${T('s38')}${currency}${wasteCost.toFixed(0)}</td><td>${(wasteCost/netRevenue*100).toFixed(1)}${T('s39')}${currency}${totalOperatingCost.toFixed(0)}</td><td>${(totalOperatingCost/netRevenue*100).toFixed(1)}%</td></tr>
                    </tbody></table>
                `;

                document.getElementById('paybackCard').innerHTML =
                    `${T('s40')}${paybackYears.toFixed(1)}${T('s41')}${paybackMonths.toFixed(0)}${T('s42')}`;

                let sensRows = R.sensRows;
                document.getElementById('sensitivityTable').innerHTML =
                    `${T('s46')}${sensRows}</tbody></table>`;

                const { healthScore, healthStatus, healthColor } = R;
                document.getElementById('healthScoreCard').innerHTML = `${T('s54')}${(foodCostRatio*100).toFixed(1)}%</td><td>${R.grades.food}</td></tr>
                        <tr><td>Labor Cost</td><td>${(laborCostRatio*100).toFixed(1)}%</td><td>${R.grades.labor}</td></tr>
                        <tr><td>Rent Ratio</td><td>${(rentRatio*100).toFixed(1)}%</td><td>${R.grades.rent}</td></tr>
                        <tr><td>Net Profit</td><td>${profitMargin.toFixed(1)}%</td><td>${R.grades.profit}${T('s55')}${healthColor}">${healthScore}/100 (${healthStatus})</span></td></tr>
                    </tbody></table>
                `;

                document.getElementById('shutdownCard').innerHTML = R.grades.shutdown ?
                    `${T('s56')}` :
                    `${T('s57')}`;
                document.getElementById('operatingLeverageCard').innerHTML =
                    `${T('s59')}${!isNaN(operatingLeverage)&&isFinite(operatingLeverage)?operatingLeverage.toFixed(2):T('s58')}`;
                document.getElementById('marginOfSafetyCard').innerHTML =
                    `${T('s60')}${marginOfSafety.toFixed(1)}%`;
                document.getElementById('capacityCard').innerHTML =
                    `${T('s61')}${maxDailyCustomers.toFixed(0)}${T('s62')}${occupancyRate.toFixed(1)}%`;
                document.getElementById('efficiencyCard').innerHTML =
                    `${T('s63')}${currency}${R.revPerSeat.toFixed(0)}${T('s64')}${currency}${R.revPerEmployee.toFixed(0)}`;

                document.getElementById('monteCarloResults').innerHTML = `${T('s65')}`;
                document.getElementById('breakevenSummary').innerHTML =
                    `${T('s66')}${currency}${breakevenRevenue.toFixed(0)}</span><span style="margin-right:1rem;">👥 ${breakevenCustomers.toFixed(0)}${T('s67')}`;

                renderCharts(currency, netRevenue, fixedCosts, totalVariableCost, netProfit, monthlyCustomers, avgBill,
                    breakevenCustomers, contributionMarginRatio, R.line);
            });

            // ===== قيمة المطعم =====
            document.getElementById('calcValuationBtn').addEventListener('click', async function() {
                if (!currentResults) { alert(T('s68')); return; }
                const currency = currentInputs.currency;
                const multiple = parseFloat(document.getElementById('valuationMultiple').value) || 3;
                let valuation;
                try { valuation = (await FG.calc('tool2', 'valuation', { annualProfit: currentResults.annualProfit, multiple })).valuation; } catch (e) { FG.calcError(e); return; }
                document.getElementById('valuationCard').innerHTML =
                    `${T('s69')}${currency}${valuation.toFixed(0)}${T('s70')}${multiple})</span>`;
            });

            // ===== مونت كارلو =====
            document.getElementById('runMonteCarloBtn').addEventListener('click', async function() {
                if (!currentInputs) { alert(T('s68')); return; }
                const i = currentInputs;
                let MC;
                try { MC = await FG.calc('tool2', 'montecarlo', i); } catch (e) { FG.calcError(e); return; }
                const { mean, p5, p95, probProfit } = MC;
                document.getElementById('monteCarloResults').innerHTML = `${T('s71')}${i.currency}${mean.toFixed(0)}${T('s72')}${i.currency}${p5.toFixed(0)}${T('s73')}${i.currency}${p95.toFixed(0)}${T('s74')}${probProfit}%</td></tr></table>
                `;
            });

            // ===== تصدير Excel =====
            async function exportToFullExcel() {
                if (!currentResults || !currentInputs) { alert(T('s75')); return; }
                showLoading(T('s76'), '');
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
                        c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true,
                        readingOrder: FG.dir() };
                        c.border = { top: { style: 'medium', color: { argb: G } }, bottom: { style: 'medium',
                                color: { argb: G } }, left: { style: 'medium', color: { argb: G } },
                            right: { style: 'medium', color: { argb: G } } };
                    }

                    const cv = workbook.addWorksheet(T('s77'), { views: [{ rightToLeft: FG.isRTL() }] });
                    [8, 45, 35, 8].forEach((w, i) => cv.getColumn(i + 1).width = w);
                    cv.getRow(2).height = 70;
                    cv.getRow(4).height = 50;
                    cv.mergeCells(2, 1, 2, 4);
                    const bc = cv.getCell(2, 1);
                    bc.value = T('s78');
                    bc.font = { name: 'Arial', bold: true, size: 24, color: { argb: GL } };
                    bc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DB } };
                    bc.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true, readingOrder: FG.dir() };
                    mh(cv, 1, 4, 4, `${T('s79')}${companyName}`, DB, GL, 16);
                    const inf = [
                        [T('s80'), companyName],
                        [T('s81'), new Date().toLocaleDateString(FG.locale())],
                        [T('s82'), currency],
                        [T('s4'), `${currency} ${R.netProfit.toFixed(0)}`],
                        [T('s83'), `${R.profitMargin.toFixed(1)}%`]
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
                        lc.alignment = { horizontal: 'right', vertical: 'middle', readingOrder: FG.dir() };
                        vc.font = { name: 'Arial', size: 10, color: { argb: 'FF1A1A1A' } };
                        vc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
                        vc.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: FG.dir() };
                        cv.getRow(ir).height = 26;
                        ir++;
                    });

                    const ish = workbook.addWorksheet(T('s84'), { views: [{ rightToLeft: FG.isRTL() }] });
                    ish.getColumn(1).width = 35;
                    ish.getColumn(2).width = 20;
                    mh(ish, 1, 2, 1, T('s85'), DB, GL, 13);
                    const infields = [
                        [T('s86'), I.dailyCustomers],
                        [T('s87'), I.avgBill],
                        [T('s88'), I.workingDays],
                        [T('s89'), I.rent],
                        [T('s90'), I.salaries],
                        [T('s91'), (I.employeeBurden * 100) + '%'],
                        [T('s92'), I.utilities],
                        [T('s93'), I.internet],
                        [T('s94'), I.maintenance],
                        [T('s95'), I.marketing],
                        [T('s96'), I.otherFixed],
                        [T('s97'), (I.foodCostPct * 100) + '%'],
                        [T('s98'), (I.drinkCostPct * 100) + '%'],
                        [T('s99'), (I.packagingPct * 100) + '%'],
                        [T('s100'), (I.deliveryPct * 100) + '%'],
                        [T('s101'), (I.deliverySalesPct * 100) + '%'],
                        [T('s102'), (I.wastePct * 100) + '%'],
                        [T('s103'), (I.vatPct * 100) + '%'],
                        [T('s104'), I.initialInvestment]
                    ];
                    infields.forEach(([l, v]) => ish.addRow([l, v]));
                    ish.getRow(2).font = { bold: true, color: { argb: 'FFFFFF' } };
                    ish.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };

                    const ksh = workbook.addWorksheet(T('s105'), { views: [{ rightToLeft: FG.isRTL() }] });
                    ksh.getColumn(1).width = 30;
                    ksh.getColumn(2).width = 20;
                    mh(ksh, 1, 2, 1, T('s106'), DB, GL, 13);
                    const kpis = [
                        [T('s107'), `${currency} ${R.netRevenue.toFixed(0)}`],
                        [T('s108'), `${currency} ${R.fixedCosts.toFixed(0)}`],
                        [T('s109'), `${currency} ${R.totalVariableCost.toFixed(0)}`],
                        [T('s4'), `${currency} ${R.netProfit.toFixed(0)}`],
                        [T('s83'), `${R.profitMargin.toFixed(1)}%`],
                        [T('s110'), `${currency} ${R.breakevenRevenue.toFixed(0)}`],
                        [T('s111'), `${R.paybackYears.toFixed(1)}${T('s112')}`],
                        [T('s113'), `${R.marginOfSafety.toFixed(1)}%`]
                    ];
                    kpis.forEach(k => ksh.addRow(k));
                    ksh.getRow(2).font = { bold: true, color: { argb: 'FFFFFF' } };
                    ksh.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };

                    const csh = workbook.addWorksheet(T('s114'), { views: [{ rightToLeft: FG.isRTL() }] });
                    csh.getColumn(1).width = 30;
                    csh.getColumn(2).width = 20;
                    csh.getColumn(3).width = 20;
                    mh(csh, 1, 3, 1, T('s114'), DB, GL, 13);
                    const costs = [
                        [T('s115'), R.rent, (R.rent / R.netRevenue * 100).toFixed(1) + '%'],
                        [T('s116'), R.totalSalaryCost, (R.totalSalaryCost / R.netRevenue * 100).toFixed(1) + '%'],
                        [T('s92'), I.utilities, (I.utilities / R.netRevenue * 100).toFixed(1) + '%'],
                        [T('s93'), I.internet, (I.internet / R.netRevenue * 100).toFixed(1) + '%'],
                        [T('s94'), I.maintenance, (I.maintenance / R.netRevenue * 100).toFixed(1) + '%'],
                        [T('s95'), I.marketing, (I.marketing / R.netRevenue * 100).toFixed(1) + '%'],
                        [T('s117'), I.otherFixed, (I.otherFixed / R.netRevenue * 100).toFixed(1) + '%'],
                        [T('s118'), R.foodCost, (R.foodCost / R.netRevenue * 100).toFixed(1) + '%'],
                        [T('s119'), R.drinkCost, (R.drinkCost / R.netRevenue * 100).toFixed(1) + '%'],
                        [T('s99'), R.packagingCost, (R.packagingCost / R.netRevenue * 100).toFixed(1) + '%'],
                        [T('s120'), R.deliveryCommission, (R.deliveryCommission / R.netRevenue * 100).toFixed(1) +
                            '%'
                        ],
                        [T('s121'), R.wasteCost, (R.wasteCost / R.netRevenue * 100).toFixed(1) + '%']
                    ];
                    costs.forEach(c => csh.addRow(c));
                    csh.getRow(2).font = { bold: true, color: { argb: 'FFFFFF' } };
                    csh.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };

                    const chsh = workbook.addWorksheet(T('s122'), { views: [{ rightToLeft: FG.isRTL() }] });
                    mh(chsh, 1, 3, 1, T('s123'), DB, GL, 13);
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
                    saveAs(blob, `${T('s124')}${companyName}_${new Date().toISOString().slice(0,10)}.xlsx`);
                } catch (err) { alert(T('s125') + err.message); } finally { hideLoading(); }
            }

            // ===== تصدير Word =====
            async function exportToWord() {
                if (!currentResults || !currentInputs) { alert(T('s75')); return; }
                showLoading(T('s126'), '');
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

                    const kpiRows = `${T('s127')}${currency}${R.netRevenue.toFixed(0)}${T('s128')}${currency}${R.fixedCosts.toFixed(0)}${T('s129')}${currency}${R.totalVariableCost.toFixed(0)}${T('s130')}${currency}${R.netProfit.toFixed(0)}</div></td></tr>
                    `;
                    let costRows = '';
                    [T('s115'), T('s116'), T('s92'), T('s93'), T('s94'), T('s95'), T('s117'), T('s118'), T('s119'), T('s99'), T('s120'), T('s121')]
                    .forEach((n, i) => {
                        const vals = [R.rent, R.totalSalaryCost, I.utilities, I.internet, I.maintenance, I
                            .marketing, I.otherFixed, R.foodCost, R.drinkCost, R.packagingCost, R
                            .deliveryCommission, R.wasteCost
                        ];
                        costRows +=
                            `<tr><td>${n}</td><td>${currency}${vals[i].toFixed(0)}</td><td>${(vals[i]/R.netRevenue*100).toFixed(1)}%</td></tr>`;
                    });

                    const fullHtml = `${T('s133')}${companyName} | ${new Date().toLocaleDateString(FG.locale())}${T('s134')}${kpiRows}</table>
                    <div style="display:flex;gap:16px;flex-wrap:wrap;justify-content:center;">
                        ${pieImg ? `${T('s131')}${pieImg}" class="chart-img"/></div>` : ''}
                        ${lineImg ? `${T('s132')}${lineImg}" class="chart-img"/></div>` : ''}${T('s135')}${costRows}${T('s136')}${currency}${R.breakevenRevenue.toFixed(0)} (${R.breakevenCustomers.toFixed(0)}${T('s137')}${R.paybackYears.toFixed(1)}${T('s138')}${R.paybackMonths.toFixed(0)}${T('s139')}${R.marginOfSafety.toFixed(1)}${T('s140')}${R.occupancyRate.toFixed(1)}%</p>
                    <div class="footer">© ${new Date().getFullYear()} FAROUK GRUP</div>
                    </body></html>`;

                    const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `${T('s124')}${companyName}_${new Date().toISOString().slice(0,10)}.doc`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                } catch (err) { alert(T('s141') + err.message); } finally { hideLoading(); }
            }

            document.getElementById('exportWordBtn').addEventListener('click', exportToWord);
            document.getElementById('exportFullExcelBtn').addEventListener('click', exportToFullExcel);

            // منع اللمس المتعدد من التسبب في اهتزاز
            document.addEventListener('touchmove', function(e) {
                if (e.target.closest('.table-container') || e.target.closest('.modal')) return;
            }, { passive: true });

        })();
    