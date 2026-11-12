
    (function() {
        'use strict';

        // ===== الحاسبة =====
        const calcDisplay = document.getElementById('calcDisplay');
        let currentCalcInput = '';
        function handleCalc(v) {
            if (v === 'C') { currentCalcInput = ''; calcDisplay.value = ''; return; }
            if (v === '⌫') { currentCalcInput = currentCalcInput.slice(0, -1); calcDisplay.value = currentCalcInput; return; }
            if (v === '=') {
                try { let r = eval(currentCalcInput.replace(/×/g,'*').replace(/÷/g,'/')); calcDisplay.value = r; currentCalcInput = r.toString(); }
                catch(e) { calcDisplay.value = T('s1'); currentCalcInput = ''; }
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
        document.getElementById('modalClose').addEventListener('click', () => modalEl.classList.remove('active'));
        modalEl.addEventListener('click', e => { if (e.target === modalEl) modalEl.classList.remove('active'); });

        // ===== تحميل =====
        function showLoading(t, m) {
            document.getElementById('loadingTitle').textContent = t;
            document.getElementById('loadingMsg').textContent = m;
            document.getElementById('exportLoading').classList.add('show');
        }
        function hideLoading() { document.getElementById('exportLoading').classList.remove('show'); }

        // ===== الحساب =====
        let globalData = null;
        let growthChart = null;


        document.getElementById('calculateBtn').addEventListener('click', async function() {
            const currency = document.getElementById('currencySelect').value;
            const companyName = document.getElementById('companyName').value || T('s2');
            const start = parseFloat(document.getElementById('startValue').value);
            const end = parseFloat(document.getElementById('endValue').value);
            const years = parseInt(document.getElementById('years').value);
            const inflationPercent = parseFloat(document.getElementById('inflationRate').value) || 0;
            const inflation = inflationPercent / 100;

            const startB = parseFloat(document.getElementById('startValueB').value);
            const endB = parseFloat(document.getElementById('endValueB').value);
            const yearsB = parseInt(document.getElementById('yearsB').value);

            if (!start || !end || !years || start <= 0 || end <= 0 || years <= 0) {
                alert(T('s3'));
                return;
            }

            // ===== الحسابات الأساسية =====
            let R;
            try { R = await FG.calc('tool32', 'main', { start, end, years, inflation, startB, endB, yearsB }); } catch (e) { FG.calcError(e); return; }
            const { cagr, realCagr, totalGrowth, simpleAnnual, endRealValue, realGrowth, purchasingPowerLoss,
                doublingTimeNominal, doublingTimeReal, rule72, rows, cagrB, realCagrB, comparison } = R;

            globalData = {
                currency, companyName, start, end, years, inflation, inflationPercent,
                cagr, realCagr, totalGrowth, simpleAnnual,
                endRealValue, realGrowth, purchasingPowerLoss,
                doublingTimeNominal, doublingTimeReal, rule72,
                rows, cagrB, realCagrB, comparison, startB, endB, yearsB
            };

            document.getElementById('initialMessage').style.display = 'none';
            document.getElementById('resultsSection').style.display = 'block';

            // ===== KPI الرئيسية =====
            const cagrPercent = (cagr * 100).toFixed(2);
            const realCagrPercent = realCagr !== null ? (realCagr * 100).toFixed(2) : '—';

            // تقييم CAGR الاسمي
            const { statusNominal, classNominal, statusReal, classReal } = R;

            // هل تفوق على التضخم؟
            const beatsInflation = realCagr !== null && realCagr > 0;

            document.getElementById('kpiCards').innerHTML = `${T('s17')}${cagrPercent}%</div>
                    <div class="status ${classNominal}">${statusNominal}</div>
                </div>
                <div class="result-card ${realCagr !== null ? (beatsInflation ? 'highlight-green' : 'highlight-red') : ''}${T('s18')}${realCagrPercent}${realCagr !== null ? '%' : ''}</div>
                    <div class="status ${classReal}">${statusReal}</div>
                </div>
                <div class="result-card ${beatsInflation ? 'highlight-green' : 'highlight-red'}${T('s19')}${inflationPercent.toFixed(2)}${T('s20')}${beatsInflation ? 'status-good' : 'status-bad'}">
                        ${beatsInflation ? T('s15') : T('s16')}${T('s21')}${totalGrowth.toFixed(2)}${T('s22')}${years}${T('s23')}${realGrowth >= 0 ? 'highlight-green' : 'highlight-red'}${T('s24')}${realGrowth.toFixed(2)}${T('s25')}${purchasingPowerLoss.toFixed(2)}${T('s26')}`;

            // ===== تفصيل الحسابات =====
            document.getElementById('detailCards').innerHTML = `${T('s27')}${currency}${endRealValue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}${T('s28')}${currency}${end.toLocaleString()}${T('s29')}${doublingTimeNominal !== null && isFinite(doublingTimeNominal) ? doublingTimeNominal.toFixed(2) : '∞'}${T('s30')}${doublingTimeReal !== null && isFinite(doublingTimeReal) ? doublingTimeReal.toFixed(2) : '∞'}${T('s31')}${rule72 !== null && isFinite(rule72) ? rule72.toFixed(2) : '∞'}${T('s32')}${simpleAnnual.toFixed(2)}${T('s33')}${cagr * 100 > simpleAnnual ? 'positive' : 'negative'}">${(cagr * 100 - simpleAnnual).toFixed(2)}${T('s34')}`;

            // ===== جدول النمو =====
            let tableHtml = `${T('s35')}`;
            rows.forEach(r => {
                const diff = r.compound - r.simple;
                const diffClass = diff > 0 ? 'positive' : (diff < 0 ? 'negative' : '');
                tableHtml += `<tr>
                    <td>${r.year === 0 ? T('s36') : r.year}</td>
                    <td>${currency}${r.compound.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                    <td>${currency}${r.realCompound.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                    <td>${currency}${r.simple.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                    <td class="${diffClass}">${currency}${diff.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                </tr>`;
            });
            tableHtml += '</tbody></table>';
            document.getElementById('growthTable').innerHTML = tableHtml;

            // ===== جدول المقارنة =====
            if (comparison) {
                const cagrBPercent = (comparison.cagrB * 100).toFixed(2);
                const realCagrBPercent = comparison.realCagrB !== null ? (comparison.realCagrB * 100).toFixed(2) : '—';
                let winnerNominal = comparison.betterNominal === 'A'
                    ? '<span class="positive">🏆 A</span>'
                    : comparison.betterNominal === 'B'
                        ? '<span class="positive">🏆 B</span>'
                        : T('s37');
                let winnerReal = comparison.betterReal === 'A'
                    ? '<span class="positive">🏆 A</span>'
                    : comparison.betterReal === 'B'
                        ? '<span class="positive">🏆 B</span>'
                        : T('s37');
                document.getElementById('comparisonTable').innerHTML = `${T('s38')}${currency}${start.toLocaleString()}</td>
                            <td>${currency}${startB.toLocaleString()}${T('s39')}${currency}${end.toLocaleString()}</td>
                            <td>${currency}${endB.toLocaleString()}${T('s40')}${years}</td>
                            <td>${yearsB}${T('s41')}${cagrPercent}%</td>
                            <td>${cagrBPercent}%</td>
                            <td class="${comparison.diffNominal > 0 ? 'positive' : (comparison.diffNominal < 0 ? 'negative' : '')}">
                                ${(comparison.diffNominal * 100).toFixed(2)}%
                            </td>
                            <td>${winnerNominal}${T('s42')}${realCagrPercent}%</td>
                            <td>${realCagrBPercent}%</td>
                            <td class="${comparison.diffReal > 0 ? 'positive' : (comparison.diffReal < 0 ? 'negative' : '')}">
                                ${(comparison.diffReal * 100).toFixed(2)}%
                            </td>
                            <td>${winnerReal}</td>
                        </tr>
                    </tbody></table>
                `;
            } else {
                document.getElementById('comparisonTable').innerHTML =
                    T('s43');
            }

            // ===== الرسم البياني =====
            const ctx = document.getElementById('growthChart').getContext('2d');
            if (growthChart) growthChart.destroy();
            const labels = rows.map(r => r.year === 0 ? T('s36') : `${T('s44')}${r.year}`);
            growthChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: T('s45'),
                            data: rows.map(r => r.compound),
                            borderColor: '#b48554',
                            backgroundColor: 'rgba(180,133,84,0.15)',
                            fill: true,
                            tension: 0.15,
                            borderWidth: 3,
                            pointRadius: 4,
                            pointBackgroundColor: '#b48554'
                        },
                        {
                            label: T('s46'),
                            data: rows.map(r => r.realCompound),
                            borderColor: '#4ade80',
                            backgroundColor: 'rgba(74,222,128,0.06)',
                            fill: false,
                            tension: 0.15,
                            borderWidth: 3,
                            pointRadius: 4,
                            pointBackgroundColor: '#4ade80',
                            borderDash: [8, 4]
                        },
                        {
                            label: T('s47'),
                            data: rows.map(r => r.simple),
                            borderColor: '#6ba3d6',
                            backgroundColor: 'rgba(100,150,200,0.05)',
                            fill: false,
                            tension: 0,
                            borderWidth: 2,
                            borderDash: [4, 4],
                            pointRadius: 3,
                            pointBackgroundColor: '#6ba3d6'
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { labels: { color: '#f0f4fa', font: { size: 12 } } },
                        tooltip: {
                            callbacks: {
                                label: ctx => `${ctx.dataset.label}: ${currency}${Math.round(ctx.raw).toLocaleString()}`
                            }
                        }
                    },
                    scales: {
                        y: {
                            ticks: { color: '#aab7d4', callback: v => currency + v.toLocaleString() },
                            grid: { color: 'rgba(180,133,84,0.1)' }
                        },
                        x: {
                            ticks: { color: '#aab7d4' },
                            grid: { display: false }
                        }
                    }
                }
            });
        });

        // ===== تصدير Excel =====
        document.getElementById('exportFullExcelBtn').addEventListener('click', async function() {
            if (!globalData) { alert(T('s48')); return; }
            showLoading(T('s49'), T('s50'));
            try {
                const D = globalData;
                const workbook = new ExcelJS.Workbook();
                workbook.creator = 'FAROUK GRUP';
                const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050';
                const AR = 'FFF5F0E8', DT = 'FF1A1A1A', PB = 'FFD4EDDA', NB = 'FFF8D7DA', GB = 'FFFFF3CD';
                const PT = 'FF155724', NT = 'FF721C24';

                function cs(bg='FFFFFFFF',tc=DT,b=false,h='center'){return{font:{name:'Arial',bold:b,size:10,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:h,vertical:'middle',wrapText:true,readingOrder:FG.dir()},border:{top:{style:'hair',color:{argb:'FFCCCCCC'}},bottom:{style:'hair',color:{argb:'FFCCCCCC'}},left:{style:'hair',color:{argb:'FFCCCCCC'}},right:{style:'hair',color:{argb:'FFCCCCCC'}}}};}
                function ap(c,s){if(s.font)c.font=s.font;if(s.fill)c.fill=s.fill;if(s.alignment)c.alignment=s.alignment;if(s.border)c.border=s.border;if(s.numFmt)c.numFmt=s.numFmt;}
                function mh(ws,fc,tc,r,text,bg=HB,tc2=GL,fs=12){ws.mergeCells(r,fc,r,tc);const c=ws.getCell(r,fc);c.value=text;c.font={name:'Arial',bold:true,size:fs,color:{argb:tc2}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};c.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};}

                // 1. غلاف
                const cv = workbook.addWorksheet(T('s51'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
                [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
                cv.getRow(2).height=80; cv.getRow(4).height=60;
                cv.mergeCells(2,1,2,4);
                const bc=cv.getCell(2,1);
                bc.value=T('s52');
                bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}};
                bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}};
                bc.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};
                mh(cv,1,4,4,`${T('s53')}${D.companyName}`,DB,GL,18);
                const inf=[
                    [T('s54'),D.companyName],
                    [T('s55'),new Date().toLocaleDateString(FG.locale())],
                    [T('s56'),D.currency],
                    [T('s57'),`${(D.cagr*100).toFixed(2)}%`],
                    [T('s58'),D.realCagr !== null ? `${(D.realCagr*100).toFixed(2)}%` : '—'],
                    [T('s59'),`${D.inflationPercent.toFixed(2)}%`]
                ];
                let ir=6;
                inf.forEach(([l,v],idx)=>{
                    cv.mergeCells(ir,1,ir,2); cv.mergeCells(ir,3,ir,4);
                    const lc=cv.getCell(ir,1), vc=cv.getCell(ir,3);
                    lc.value=l; vc.value=v;
                    const bg=idx%2===0?AR:'FFFEFCF6';
                    ap(lc,{font:{name:'Arial',bold:true,size:11,color:{argb:'00695C'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:FG.start(),vertical:'middle',readingOrder:FG.dir()},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                    ap(vc,{font:{name:'Arial',size:11,color:{argb:DT}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',readingOrder:FG.dir()},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                    cv.getRow(ir).height=28; ir++;
                });

                // 2. المدخلات والنتائج
                const s1 = workbook.addWorksheet(T('s60'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
                [5,42,22,22,5].forEach((w,i)=>s1.getColumn(i+1).width=w);
                mh(s1,1,5,1,T('s61'),DB,GL,14);
                s1.getRow(1).height=40;
                const rows1 = [
                    [T('s62'), `${D.currency} ${D.start.toLocaleString()}`],
                    [T('s63'), `${D.currency} ${D.end.toLocaleString()}`],
                    [T('s64'), `${D.currency} ${D.endRealValue.toFixed(2)}`],
                    [T('s65'), D.years],
                    [T('s66'), `${D.inflationPercent.toFixed(2)}%`],
                    [T('s67'), `${(D.cagr*100).toFixed(4)}%`],
                    [T('s68'), D.realCagr !== null ? `${(D.realCagr*100).toFixed(4)}%` : '—'],
                    [T('s69'), `${D.totalGrowth.toFixed(2)}%`],
                    [T('s70'), `${D.realGrowth.toFixed(2)}%`],
                    [T('s71'), `${D.purchasingPowerLoss.toFixed(2)}%`],
                    [T('s72'), `${D.simpleAnnual.toFixed(2)}%`],
                    [T('s73'), D.doublingTimeNominal && isFinite(D.doublingTimeNominal) ? `${D.doublingTimeNominal.toFixed(2)}${T('s74')}` : T('s75')],
                    [T('s76'), D.doublingTimeReal && isFinite(D.doublingTimeReal) ? `${D.doublingTimeReal.toFixed(2)}${T('s74')}` : T('s75')],
                    [T('s77'), D.rule72 && isFinite(D.rule72) ? `${D.rule72.toFixed(2)}${T('s74')}` : T('s75')]
                ];
                let r1=3;
                rows1.forEach(([label,val],idx)=>{
                    s1.getRow(r1).height=24;
                    const bg=idx%2===0?'FFFEFCF6':'FFFFFFFF';
                    const lc=s1.getCell(r1,2), vc=s1.getCell(r1,3);
                    lc.value=label; vc.value=val;
                    ap(lc,cs(bg,DT,true,FG.start()));
                    ap(vc,cs(bg,'0000FF',false,'center'));
                    r1++;
                });

                // 3. جدول النمو
                const s2 = workbook.addWorksheet(T('s78'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
                [5,12,20,20,20,20,5].forEach((w,i)=>s2.getColumn(i+1).width=w);
                mh(s2,1,7,1,T('s79'),DB,GL,14);
                s2.getRow(1).height=40;
                s2.addRow([T('s80'),T('s81'),T('s82'),T('s83'),T('s84'),T('s85')]);
                D.rows.forEach((r,idx)=>{
                    const diff = r.compound - r.simple;
                    const diffReal = r.realCompound - r.simple;
                    s2.addRow([
                        r.year === 0 ? T('s36') : r.year,
                        r.compound,
                        r.realCompound,
                        r.simple,
                        diff,
                        diffReal
                    ]);
                });
                const hRow = s2.getRow(2);
                hRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                hRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
                [2,3,4,5,6].forEach(c => s2.getColumn(c).numFmt = '#,##0');

                // 4. مقارنة
                if (D.comparison) {
                    const s3 = workbook.addWorksheet(T('s86'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
                    [5,28,22,22,22,5].forEach((w,i)=>s3.getColumn(i+1).width=w);
                    mh(s3,1,6,1,T('s87'),DB,GL,14);
                    s3.getRow(1).height=40;
                    s3.addRow([T('s88'),T('s89'),T('s90'),T('s91')]);
                    s3.addRow([T('s62'), D.start, D.startB, '-']);
                    s3.addRow([T('s92'), D.end, D.endB, '-']);
                    s3.addRow([T('s93'), D.years, D.yearsB, '-']);
                    s3.addRow([T('s94'), (D.cagr*100).toFixed(2), (D.comparison.cagrB*100).toFixed(2), (D.comparison.diffNominal*100).toFixed(2)]);
                    s3.addRow([T('s95'), D.realCagr !== null ? (D.realCagr*100).toFixed(2) : '—', D.comparison.realCagrB !== null ? (D.comparison.realCagrB*100).toFixed(2) : '—', (D.comparison.diffReal*100).toFixed(2)]);
                    const hRow3 = s3.getRow(2);
                    hRow3.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    hRow3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
                }

                // 5. الرسم البياني
                const s4 = workbook.addWorksheet(T('s96'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
                s4.getColumn(1).width=5; s4.getColumn(2).width=50; s4.getColumn(3).width=5;
                mh(s4,1,3,1,T('s97'),DB,GL,14);
                s4.getRow(1).height=40;
                const chartContainer = document.querySelector('.chart-container');
                if (chartContainer) {
                    try {
                        const origBg = chartContainer.style.backgroundColor;
                        chartContainer.style.backgroundColor = '#ffffff';
                        const canvasImg = await html2canvas(chartContainer, { scale: 2, backgroundColor: '#ffffff' });
                        chartContainer.style.backgroundColor = origBg;
                        const imageId = workbook.addImage({ base64: canvasImg.toDataURL('image/png'), extension: 'png' });
                        s4.addImage(imageId, { tl: { col: 1, row: 2 }, br: { col: 2, row: 22 }, editAs: 'oneCell' });
                    } catch(err) {}
                }

                const buffer = await workbook.xlsx.writeBuffer();
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                const now = new Date();
                saveAs(blob, `${T('s98')}${D.companyName}_${now.toISOString().slice(0,10)}.xlsx`);
            } catch(err) {
                console.error(err);
                alert(T('s99') + err.message);
            } finally { hideLoading(); }
        });

        // ===== تصدير Word =====
        document.getElementById('exportWordBtn').addEventListener('click', async function() {
            if (!globalData) { alert(T('s48')); return; }
            showLoading(T('s100'), T('s101'));
            try {
                const D = globalData;
                const now = new Date();
                const dateStr = now.toLocaleDateString(FG.locale());

                const chartContainer = document.querySelector('.chart-container');
                let chartImgBase64 = '';
                if (chartContainer) {
                    const origBg = chartContainer.style.backgroundColor;
                    chartContainer.style.backgroundColor = '#ffffff';
                    const img = await html2canvas(chartContainer, { scale: 2, backgroundColor: '#ffffff' });
                    chartContainer.style.backgroundColor = origBg;
                    chartImgBase64 = img.toDataURL('image/png');
                }

                let tableRows = '';
                D.rows.forEach(r => {
                    const diff = r.compound - r.simple;
                    tableRows += `<tr>
                        <td>${r.year === 0 ? T('s36') : r.year}</td>
                        <td>${D.currency} ${r.compound.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                        <td>${D.currency} ${r.realCompound.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                        <td>${D.currency} ${r.simple.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                        <td style="color:${diff>0?'#155724':(diff<0?'#721c24':'#333')};">${D.currency} ${diff.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</td>
                    </tr>`;
                });

                const realCagrPercent = D.realCagr !== null ? (D.realCagr * 100).toFixed(2) : '—';
                const beatsInflation = D.realCagr !== null && D.realCagr > 0;

                const comparisonHtml = D.comparison ? `${T('s102')}${D.currency} ${D.start.toLocaleString()}</td><td>${D.currency} ${D.startB.toLocaleString()}${T('s103')}${D.currency} ${D.end.toLocaleString()}</td><td>${D.currency} ${D.endB.toLocaleString()}${T('s104')}${D.years}</td><td>${D.yearsB}${T('s105')}${(D.cagr*100).toFixed(2)}%</td><td>${(D.comparison.cagrB*100).toFixed(2)}%</td><td>${(D.comparison.diffNominal*100).toFixed(2)}${T('s106')}${realCagrPercent}%</td><td>${D.comparison.realCagrB !== null ? (D.comparison.realCagrB*100).toFixed(2)+'%' : '—'}</td><td>${(D.comparison.diffReal*100).toFixed(2)}%</td></tr>
                        </tbody>
                    </table>
                ` : '';

                const fullHtml = `${T('s111')}${D.companyName}${T('s112')}${dateStr}${T('s113')}${D.currency}${T('s114')}${(D.cagr*100).toFixed(2)}%</strong></div>
                        <div class="kpi ${beatsInflation ? 'highlight-good' : 'highlight-bad'}${T('s115')}${realCagrPercent}${T('s116')}${D.inflationPercent.toFixed(2)}%</strong></div>
                        <div class="kpi ${D.realGrowth >= 0 ? 'highlight-good' : 'highlight-bad'}${T('s117')}${D.realGrowth.toFixed(2)}${T('s118')}${D.currency} ${D.start.toLocaleString()}${T('s119')}${D.currency} ${D.end.toLocaleString()}${T('s120')}${D.currency} ${D.endRealValue.toFixed(2)}${T('s121')}${D.years}${T('s122')}${D.inflationPercent.toFixed(2)}${T('s123')}${D.simpleAnnual.toFixed(2)}${T('s124')}${D.doublingTimeNominal && isFinite(D.doublingTimeNominal) ? D.doublingTimeNominal.toFixed(2)+T('s107') : '∞'}${T('s125')}${D.doublingTimeReal && isFinite(D.doublingTimeReal) ? D.doublingTimeReal.toFixed(2)+T('s107') : '∞'}${T('s126')}${tableRows}</tbody>
                    </table>
                    ${comparisonHtml}
                    ${chartImgBase64 ? `${T('s108')}${chartImgBase64}" class="chart-img" /></div>` : ''}${T('s127')}${(D.cagr*100).toFixed(2)}${T('s128')}${D.years}${T('s129')}${realCagrPercent}${T('s130')}${D.inflationPercent.toFixed(2)}${T('s131')}${D.purchasingPowerLoss.toFixed(2)}${T('s132')}${beatsInflation
                            ? T('s109')
                            : T('s110')}${T('s133')}${now.getFullYear()}</div>
                </body></html>`;

                const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `${T('s98')}${D.companyName}_${now.toISOString().slice(0,10)}.doc`;
                link.click();
                URL.revokeObjectURL(link.href);
            } catch(err) {
                console.error(err);
                alert(T('s134') + err.message);
            } finally { hideLoading(); }
        });

    })();
    