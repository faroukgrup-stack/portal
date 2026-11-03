
    (function() {
        'use strict';

        // ===== Calculator =====
        const calcDisplay = document.getElementById('calcDisplay');
        let currentCalcInput = '';
        function handleCalc(v) {
            if (v === 'C') { currentCalcInput = ''; calcDisplay.value = ''; return; }
            if (v === '⌫') { currentCalcInput = currentCalcInput.slice(0, -1); calcDisplay.value = currentCalcInput; return; }
            if (v === '=') {
                try { let r = eval(currentCalcInput.replace(/×/g,'*').replace(/÷/g,'/')); calcDisplay.value = r; currentCalcInput = r.toString(); }
                catch(e) { calcDisplay.value = 'Error'; currentCalcInput = ''; }
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

        // ===== Loading =====
        function showLoading(t, m) {
            document.getElementById('loadingTitle').textContent = t;
            document.getElementById('loadingMsg').textContent = m;
            document.getElementById('exportLoading').classList.add('show');
        }
        function hideLoading() { document.getElementById('exportLoading').classList.remove('show'); }

        // ===== Helpers =====
        function fmt(n) { return n.toLocaleString('en-US', { maximumFractionDigits: 0 }); }

        // ===== Calculation =====
        let globalData = null;
        let growthChart = null;

        function calcCAGR(start, end, n) {
            if (start <= 0 || end <= 0 || n <= 0) return null;
            return Math.pow(end / start, 1 / n) - 1;
        }

        // Fisher equation: Real = (1 + Nominal) / (1 + Enflasyon) - 1
        function calcRealCAGR(nominalCAGR, inflation) {
            if (nominalCAGR === null || inflation === null) return null;
            return (1 + nominalCAGR) / (1 + inflation) - 1;
        }

        document.getElementById('calculateBtn').addEventListener('click', function() {
            const currency = document.getElementById('currencySelect').value;
            const companyName = document.getElementById('companyName').value || 'Faydalanan Kurum';
            const start = parseFloat(document.getElementById('startValue').value);
            const end = parseFloat(document.getElementById('endValue').value);
            const years = parseInt(document.getElementById('years').value);
            const inflationPercent = parseFloat(document.getElementById('inflationRate').value) || 0;
            const inflation = inflationPercent / 100;

            const startB = parseFloat(document.getElementById('startValueB').value);
            const endB = parseFloat(document.getElementById('endValueB').value);
            const yearsB = parseInt(document.getElementById('yearsB').value);

            if (!start || !end || !years || start <= 0 || end <= 0 || years <= 0) {
                alert('Lütfen geçerli değerler girin (sıfırdan büyük)');
                return;
            }

            // Core calculations
            const cagr = calcCAGR(start, end, years);
            const realCagr = calcRealCAGR(cagr, inflation);
            const totalGrowth = ((end - start) / start) * 100;
            const simpleAnnual = totalGrowth / years;

            // Real final value (in start-year purchasing power)
            const endRealValue = end / Math.pow(1 + inflation, years);
            const realGrowth = ((endRealValue - start) / start) * 100;
            const purchasingPowerLoss = ((end - endRealValue) / end) * 100;

            // Doubling times
            const doublingTimeNominal = cagr > 0 ? Math.log(2) / Math.log(1 + cagr) : null;
            const doublingTimeReal = realCagr > 0 ? Math.log(2) / Math.log(1 + realCagr) : null;
            const rule72 = cagr > 0 ? 72 / (cagr * 100) : null;

            // Comparison B
            let cagrB = null, realCagrB = null, comparison = null;
            if (startB > 0 && endB > 0 && yearsB > 0) {
                cagrB = calcCAGR(startB, endB, yearsB);
                realCagrB = calcRealCAGR(cagrB, inflation);
                if (cagrB !== null && cagr !== null) {
                    const diffNominal = cagr - cagrB;
                    const diffReal = realCagr - realCagrB;
                    comparison = {
                        cagrB, realCagrB,
                        diffNominal, diffReal,
                        betterNominal: diffNominal > 0 ? 'A' : (diffNominal < 0 ? 'B' : 'equal'),
                        betterReal: diffReal > 0 ? 'A' : (diffReal < 0 ? 'B' : 'equal')
                    };
                }
            }

            // Growth table
            const rows = [];
            for (let i = 0; i <= years; i++) {
                const compoundValue = start * Math.pow(1 + cagr, i);
                const realCompoundValue = start * Math.pow(1 + realCagr, i);
                const simpleValue = start + (end - start) * (i / years);
                rows.push({
                    year: i,
                    compound: compoundValue,
                    realCompound: realCompoundValue,
                    simple: simpleValue,
                    gainCompound: compoundValue - start,
                    gainSimple: simpleValue - start,
                    gainReal: realCompoundValue - start
                });
            }

            globalData = {
                currency, companyName, start, end, years, inflation, inflationPercent,
                cagr, realCagr, totalGrowth, simpleAnnual,
                endRealValue, realGrowth, purchasingPowerLoss,
                doublingTimeNominal, doublingTimeReal, rule72,
                rows, cagrB, realCagrB, comparison, startB, endB, yearsB
            };

            document.getElementById('initialMessage').style.display = 'none';
            document.getElementById('resultsSection').style.display = 'block';

            // KPI
            const cagrPercent = (cagr * 100).toFixed(2);
            const realCagrPercent = realCagr !== null ? (realCagr * 100).toFixed(2) : '—';

            let statusNominal = '', classNominal = '';
            if (cagr > 0.15) { statusNominal = 'Mükemmel Büyüme'; classNominal = 'status-good'; }
            else if (cagr > 0.07) { statusNominal = 'İyi Büyüme'; classNominal = 'status-good'; }
            else if (cagr > 0) { statusNominal = 'Zayıf Büyüme'; classNominal = 'status-warning'; }
            else if (cagr === 0) { statusNominal = 'Flat'; classNominal = 'status-warning'; }
            else { statusNominal = 'Decline'; classNominal = 'status-bad'; }

            let statusReal = '', classReal = '';
            if (realCagr === null) { statusReal = 'Hesaplanmadı'; classReal = 'status-info'; }
            else if (realCagr > 0.10) { statusReal = 'Mükemmel Reel Büyüme'; classReal = 'status-good'; }
            else if (realCagr > 0.03) { statusReal = 'İyi Reel Büyüme'; classReal = 'status-good'; }
            else if (realCagr > 0) { statusReal = 'Zayıf Reel Büyüme'; classReal = 'status-warning'; }
            else if (realCagr === 0) { statusReal = 'Sabit (Reel)'; classReal = 'status-warning'; }
            else { statusReal = 'Satın Alma Gücü Kaybediyor'; classReal = 'status-bad'; }

            const beatsEnflasyon = realCagr !== null && realCagr > 0;

            document.getElementById('kpiCards').innerHTML = `
                <div class="result-card highlight-gold">
                    <i class="fas fa-percent"></i>
                    <h4>Nominal CAGR</h4>
                    <div class="value">${cagrPercent}%</div>
                    <div class="status ${classNominal}">${statusNominal}</div>
                </div>
                <div class="result-card ${realCagr !== null ? (beatsEnflasyon ? 'highlight-green' : 'highlight-red') : ''}">
                    <i class="fas fa-shield-halved"></i>
                    <h4>Real CAGR</h4>
                    <div class="value">${realCagrPercent}${realCagr !== null ? '%' : ''}</div>
                    <div class="status ${classReal}">${statusReal}</div>
                </div>
                <div class="result-card ${beatsEnflasyon ? 'highlight-green' : 'highlight-red'}">
                    <i class="fas fa-fire"></i>
                    <h4>Varsayılan Enflasyon</h4>
                    <div class="value">${inflationPercent.toFixed(2)}%</div>
                    <div class="unit">per year</div>
                    <div class="status ${beatsEnflasyon ? 'status-good' : 'status-bad'}">
                        ${beatsEnflasyon ? '✅ Enflasyonu Yendi' : '⚠️ Enflasyonu Yenemedi'}
                    </div>
                </div>
                <div class="result-card">
                    <i class="fas fa-chart-line"></i>
                    <h4>Total Nominal Growth</h4>
                    <div class="value">${totalGrowth.toFixed(2)}%</div>
                    <div class="unit">over ${years} years</div>
                </div>
                <div class="result-card ${realGrowth >= 0 ? 'highlight-green' : 'highlight-red'}">
                    <i class="fas fa-coins"></i>
                    <h4>Total Real Growth</h4>
                    <div class="value">${realGrowth.toFixed(2)}%</div>
                    <div class="unit">in start-year purchasing power</div>
                </div>
                <div class="result-card highlight-red">
                    <i class="fas fa-arrow-down"></i>
                    <h4>Purchasing Power Loss</h4>
                    <div class="value">${purchasingPowerLoss.toFixed(2)}%</div>
                    <div class="unit">of final value</div>
                </div>
            `;

            // Detail cards
            document.getElementById('detailCards').innerHTML = `
                <div class="result-card">
                    <i class="fas fa-flag-checkered"></i>
                    <h4>Reel Son Değer</h4>
                    <div class="value">${currency}${fmt(endRealValue)}</div>
                    <div class="unit">vs ${currency}${fmt(end)} nominal</div>
                </div>
                <div class="result-card">
                    <i class="fas fa-clock"></i>
                    <h4>Doubling Time (Nominal)</h4>
                    <div class="value">${doublingTimeNominal !== null && isFinite(doublingTimeNominal) ? doublingTimeNominal.toFixed(2) : '∞'}</div>
                    <div class="unit">years</div>
                </div>
                <div class="result-card">
                    <i class="fas fa-hourglass-half"></i>
                    <h4>Doubling Time (Real)</h4>
                    <div class="value">${doublingTimeReal !== null && isFinite(doublingTimeReal) ? doublingTimeReal.toFixed(2) : '∞'}</div>
                    <div class="unit">years</div>
                </div>
                <div class="result-card">
                    <i class="fas fa-calculator"></i>
                    <h4>Rule of 72 (Estimate)</h4>
                    <div class="value">${rule72 !== null && isFinite(rule72) ? rule72.toFixed(2) : '∞'}</div>
                    <div class="unit">years</div>
                </div>
                <div class="result-card">
                    <i class="fas fa-arrow-up"></i>
                    <h4>Simple Annual Growth</h4>
                    <div class="value">${simpleAnnual.toFixed(2)}%</div>
                    <div class="unit">for comparison</div>
                </div>
                <div class="result-card">
                    <i class="fas fa-minus"></i>
                    <h4>Compound − Simple Gap</h4>
                    <div class="value ${cagr * 100 > simpleAnnual ? 'positive' : 'negative'}">${(cagr * 100 - simpleAnnual).toFixed(2)}%</div>
                    <div class="unit">compounding advantage</div>
                </div>
            `;

            // Growth table
            let tableHtml = `<table><thead><tr>
                <th>Year</th>
                <th>Nominal (CAGR)</th>
                <th>Real (Real CAGR)</th>
                <th>Simple Value</th>
                <th>Compound − Simple</th>
            </tr></thead><tbody>`;
            rows.forEach(r => {
                const diff = r.compound - r.simple;
                const diffClass = diff > 0 ? 'positive' : (diff < 0 ? 'negative' : '');
                tableHtml += `<tr>
                    <td>${r.year === 0 ? 'Start' : r.year}</td>
                    <td>${currency}${fmt(r.compound)}</td>
                    <td>${currency}${fmt(r.realCompound)}</td>
                    <td>${currency}${fmt(r.simple)}</td>
                    <td class="${diffClass}">${currency}${fmt(diff)}</td>
                </tr>`;
            });
            tableHtml += '</tbody></table>';
            document.getElementById('growthTable').innerHTML = tableHtml;

            // Comparison
            if (comparison) {
                const cagrBPercent = (comparison.cagrB * 100).toFixed(2);
                const realCagrBPercent = comparison.realCagrB !== null ? (comparison.realCagrB * 100).toFixed(2) : '—';
                let winnerNominal = comparison.betterNominal === 'A'
                    ? '<span class="positive">🏆 A</span>'
                    : comparison.betterNominal === 'B'
                        ? '<span class="positive">🏆 B</span>'
                        : '<span>⚖️ Berabere</span>';
                let winnerReal = comparison.betterReal === 'A'
                    ? '<span class="positive">🏆 A</span>'
                    : comparison.betterReal === 'B'
                        ? '<span class="positive">🏆 B</span>'
                        : '<span>⚖️ Berabere</span>';
                document.getElementById('comparisonTable').innerHTML = `
                    <table><thead><tr>
                        <th>Metric</th>
                        <th>Yatırım A</th>
                        <th>Yatırım B</th>
                        <th>Difference (A − B)</th>
                        <th>Winner</th>
                    </tr></thead><tbody>
                        <tr>
                            <td>Başlangıç Değeri</td>
                            <td>${currency}${fmt(start)}</td>
                            <td>${currency}${fmt(startB)}</td>
                            <td>-</td>
                            <td>-</td>
                        </tr>
                        <tr>
                            <td>Son Değer</td>
                            <td>${currency}${fmt(end)}</td>
                            <td>${currency}${fmt(endB)}</td>
                            <td>-</td>
                            <td>-</td>
                        </tr>
                        <tr>
                            <td>Years</td>
                            <td>${years}</td>
                            <td>${yearsB}</td>
                            <td>-</td>
                            <td>-</td>
                        </tr>
                        <tr style="background:rgba(180,133,84,0.10);font-weight:900;">
                            <td>Nominal CAGR</td>
                            <td>${cagrPercent}%</td>
                            <td>${cagrBPercent}%</td>
                            <td class="${comparison.diffNominal > 0 ? 'positive' : (comparison.diffNominal < 0 ? 'negative' : '')}">
                                ${(comparison.diffNominal * 100).toFixed(2)}%
                            </td>
                            <td>${winnerNominal}</td>
                        </tr>
                        <tr style="background:rgba(40,167,69,0.10);font-weight:900;">
                            <td>Real CAGR</td>
                            <td>${realCagrPercent}%</td>
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
                    '<div style="text-align:center;color:#aab7d4;padding:1rem;">Yatırım (B) verisi girilmedi</div>';
            }

            // Chart
            const ctx = document.getElementById('growthChart').getContext('2d');
            if (growthChart) growthChart.destroy();
            const labels = rows.map(r => r.year === 0 ? 'Start' : `Year ${r.year}`);
            growthChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: 'Nominal Bileşik Büyüme',
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
                            label: 'Reel Bileşik Büyüme (enflasyon sonrası)',
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
                            label: 'Basit Büyüme',
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

        // ===== Excel Export =====
        document.getElementById('exportFullExcelBtn').addEventListener('click', async function() {
            if (!globalData) { alert('Lütfen önce analizi çalıştırın.'); return; }
            showLoading('Excel Raporu oluşturuluyor...', 'Sayfalar ve grafikler oluşturuluyor');
            try {
                const D = globalData;
                const workbook = new ExcelJS.Workbook();
                workbook.creator = 'FAROUK GRUP';
                const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050';
                const AR = 'FFF5F0E8', DT = 'FF1A1A1A', PB = 'FFD4EDDA', NB = 'FFF8D7DA', GB = 'FFFFF3CD';

                function cs(bg='FFFFFFFF',tc=DT,b=false,h='center'){return{font:{name:'Arial',bold:b,size:10,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:h,vertical:'middle',wrapText:true,readingOrder:'ltr'},border:{top:{style:'hair',color:{argb:'FFCCCCCC'}},bottom:{style:'hair',color:{argb:'FFCCCCCC'}},left:{style:'hair',color:{argb:'FFCCCCCC'}},right:{style:'hair',color:{argb:'FFCCCCCC'}}}};}
                function ap(c,s){if(s.font)c.font=s.font;if(s.fill)c.fill=s.fill;if(s.alignment)c.alignment=s.alignment;if(s.border)c.border=s.border;if(s.numFmt)c.numFmt=s.numFmt;}
                function mh(ws,fc,tc,r,text,bg=HB,tc2=GL,fs=12){ws.mergeCells(r,fc,r,tc);const c=ws.getCell(r,fc);c.value=text;c.font={name:'Arial',bold:true,size:fs,color:{argb:tc2}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:'ltr'};c.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};}

                // 1. Cover
                const cv = workbook.addWorksheet('Rapor Kapağı', { views: [{ showGridLines: false }] });
                [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
                cv.getRow(2).height=80; cv.getRow(4).height=60;
                cv.mergeCells(2,1,2,4);
                const bc=cv.getCell(2,1);
                bc.value='Farouk Group for Consultations & Business\nFAROUK GRUP';
                bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}};
                bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}};
                bc.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:'ltr'};
                mh(cv,1,4,4,`CAGR Raporu (Nominal ve Reel)\n${D.companyName}`,DB,GL,18);
                const inf=[
                    ['📋 Kurum',D.companyName],
                    ['📅 Tarih',new Date().toLocaleDateString('en-US')],
                    ['💰 Para Birimi',D.currency],
                    ['📊 Nominal CAGR',`${(D.cagr*100).toFixed(2)}%`],
                    ['🛡️ Reel CAGR',D.realCagr !== null ? `${(D.realCagr*100).toFixed(2)}%` : '—'],
                    ['🔥 Enflasyon',`${D.inflationPercent.toFixed(2)}%`]
                ];
                let ir=6;
                inf.forEach(([l,v],idx)=>{
                    cv.mergeCells(ir,1,ir,2); cv.mergeCells(ir,3,ir,4);
                    const lc=cv.getCell(ir,1), vc=cv.getCell(ir,3);
                    lc.value=l; vc.value=v;
                    const bg=idx%2===0?AR:'FFFEFCF6';
                    ap(lc,{font:{name:'Arial',bold:true,size:11,color:{argb:'00695C'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'left',vertical:'middle',readingOrder:'ltr'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                    ap(vc,{font:{name:'Arial',size:11,color:{argb:DT}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',readingOrder:'ltr'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                    cv.getRow(ir).height=28; ir++;
                });

                // 2. Inputs & Results
                const s1 = workbook.addWorksheet('Girdiler ve Sonuçlar', { views: [{ showGridLines: false }] });
                [5,42,22,22,5].forEach((w,i)=>s1.getColumn(i+1).width=w);
                mh(s1,1,5,1,'📋 Girdiler ve Sonuçlar',DB,GL,14);
                s1.getRow(1).height=40;
                const rows1 = [
                    ['Başlangıç Değeri', `${D.currency} ${D.start.toLocaleString()}`],
                    ['Bitiş Değeri (Nominal)', `${D.currency} ${D.end.toLocaleString()}`],
                    ['Bitiş Değeri (Reel)', `${D.currency} ${D.endRealValue.toFixed(2)}`],
                    ['Yıl Sayısı', D.years],
                    ['Yıllık Enflasyon', `${D.inflationPercent.toFixed(2)}%`],
                    ['— Nominal CAGR —', `${(D.cagr*100).toFixed(4)}%`],
                    ['— Reel CAGR —', D.realCagr !== null ? `${(D.realCagr*100).toFixed(4)}%` : '—'],
                    ['Toplam Nominal Büyüme', `${D.totalGrowth.toFixed(2)}%`],
                    ['Toplam Reel Büyüme', `${D.realGrowth.toFixed(2)}%`],
                    ['Satın Alma Gücü Kaybı', `${D.purchasingPowerLoss.toFixed(2)}%`],
                    ['Basit Yıllık Büyüme', `${D.simpleAnnual.toFixed(2)}%`],
                    ['İkiye Katlama Süresi (Nominal)', D.doublingTimeNominal && isFinite(D.doublingTimeNominal) ? `${D.doublingTimeNominal.toFixed(2)} years` : 'N/A'],
                    ['İkiye Katlama Süresi (Reel)', D.doublingTimeReal && isFinite(D.doublingTimeReal) ? `${D.doublingTimeReal.toFixed(2)} years` : 'N/A'],
                    ['72 Kuralı (Tahmin)', D.rule72 && isFinite(D.rule72) ? `${D.rule72.toFixed(2)} years` : 'N/A']
                ];
                let r1=3;
                rows1.forEach(([label,val],idx)=>{
                    s1.getRow(r1).height=24;
                    const bg=idx%2===0?'FFFEFCF6':'FFFFFFFF';
                    const lc=s1.getCell(r1,2), vc=s1.getCell(r1,3);
                    lc.value=label; vc.value=val;
                    ap(lc,cs(bg,DT,true,'left'));
                    ap(vc,cs(bg,'0000FF',false,'center'));
                    r1++;
                });

                // 3. Growth table
                const s2 = workbook.addWorksheet('Büyüme Tablosu', { views: [{ showGridLines: false }] });
                [5,12,20,20,20,20,5].forEach((w,i)=>s2.getColumn(i+1).width=w);
                mh(s2,1,7,1,'📈 Yıl Yıl Büyüme (Nominal / Reel / Basit)',DB,GL,14);
                s2.getRow(1).height=40;
                s2.addRow(['Year','Nominal (CAGR)','Reel (Reel CAGR)','Basit Değer','Bileşik − Basit','Reel − Basit']);
                D.rows.forEach((r)=>{
                    const diff = r.compound - r.simple;
                    const diffReal = r.realCompound - r.simple;
                    s2.addRow([
                        r.year === 0 ? 'Start' : r.year,
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

                // 4. Comparison
                if (D.comparison) {
                    const s3 = workbook.addWorksheet('Yatırım Karşılaştırması', { views: [{ showGridLines: false }] });
                    [5,28,22,22,22,5].forEach((w,i)=>s3.getColumn(i+1).width=w);
                    mh(s3,1,6,1,'⚖️ Yatırım Karşılaştırması',DB,GL,14);
                    s3.getRow(1).height=40;
                    s3.addRow(['Metric','Yatırım A','Yatırım B','Fark (A − B)']);
                    s3.addRow(['Başlangıç Değeri', D.start, D.startB, '-']);
                    s3.addRow(['Bitiş Değeri', D.end, D.endB, '-']);
                    s3.addRow(['Yıl', D.years, D.yearsB, '-']);
                    s3.addRow(['Nominal CAGR %', (D.cagr*100).toFixed(2), (D.comparison.cagrB*100).toFixed(2), (D.comparison.diffNominal*100).toFixed(2)]);
                    s3.addRow(['Reel CAGR %', D.realCagr !== null ? (D.realCagr*100).toFixed(2) : '—', D.comparison.realCagrB !== null ? (D.comparison.realCagrB*100).toFixed(2) : '—', (D.comparison.diffReal*100).toFixed(2)]);
                    const hRow3 = s3.getRow(2);
                    hRow3.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    hRow3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
                }

                // 5. Chart
                const s4 = workbook.addWorksheet('Büyüme Grafiği', { views: [{ showGridLines: false }] });
                s4.getColumn(1).width=5; s4.getColumn(2).width=50; s4.getColumn(3).width=5;
                mh(s4,1,3,1,'📊 Büyüme Eğrisi (Nominal / Reel / Basit)',DB,GL,14);
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
                saveAs(blob, `CAGR_Report_${D.companyName}_${now.toISOString().slice(0,10)}.xlsx`);
            } catch(err) {
                console.error(err);
                alert('Excel hatası: ' + err.message);
            } finally { hideLoading(); }
        });

        // ===== Word Export =====
        document.getElementById('exportWordBtn').addEventListener('click', async function() {
            if (!globalData) { alert('Lütfen önce analizi çalıştırın.'); return; }
            showLoading('Word Raporu oluşturuluyor...', 'Veriler ve grafikler toplanıyor');
            try {
                const D = globalData;
                const now = new Date();
                const dateStr = now.toLocaleDateString('en-US');

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
                        <td>${r.year === 0 ? 'Start' : r.year}</td>
                        <td>${D.currency} ${fmt(r.compound)}</td>
                        <td>${D.currency} ${fmt(r.realCompound)}</td>
                        <td>${D.currency} ${fmt(r.simple)}</td>
                        <td style="color:${diff>0?'#155724':(diff<0?'#721c24':'#333')};">${D.currency} ${fmt(diff)}</td>
                    </tr>`;
                });

                const realCagrPercent = D.realCagr !== null ? (D.realCagr * 100).toFixed(2) : '—';
                const beatsEnflasyon = D.realCagr !== null && D.realCagr > 0;

                const comparisonHtml = D.comparison ? `
                    <h2 style="color:#b8860b;">⚖️ Investment Comparison</h2>
                    <table>
                        <thead><tr><th>Metric</th><th>Yatırım A</th><th>Yatırım B</th><th>Difference</th></tr></thead>
                        <tbody>
                            <tr><td>Başlangıç Değeri</td><td>${D.currency} ${fmt(D.start)}</td><td>${D.currency} ${fmt(D.startB)}</td><td>-</td></tr>
                            <tr><td>Son Değer</td><td>${D.currency} ${fmt(D.end)}</td><td>${D.currency} ${fmt(D.endB)}</td><td>-</td></tr>
                            <tr><td>Years</td><td>${D.years}</td><td>${D.yearsB}</td><td>-</td></tr>
                            <tr style="background:#fefcf6;font-weight:bold;"><td>Nominal CAGR</td><td>${(D.cagr*100).toFixed(2)}%</td><td>${(D.comparison.cagrB*100).toFixed(2)}%</td><td>${(D.comparison.diffNominal*100).toFixed(2)}%</td></tr>
                            <tr style="background:#f0fff4;font-weight:bold;"><td>Real CAGR</td><td>${realCagrPercent}%</td><td>${D.comparison.realCagrB !== null ? (D.comparison.realCagrB*100).toFixed(2)+'%' : '—'}</td><td>${(D.comparison.diffReal*100).toFixed(2)}%</td></tr>
                        </tbody>
                    </table>
                ` : '';

                const fullHtml = `<!DOCTYPE html>
                <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
                <head><meta charset='utf-8'><title>CAGR Raporu - FAROUK GRUP</title>
                <style>
                    body{font-family:'Arial',sans-serif;direction:ltr;margin:2rem;background:#fff;color:#333;}
                    .cover{text-align:center;border-bottom:4px solid #b8860b;margin-bottom:30px;padding-bottom:20px;}
                    .cover h1{font-size:32px;color:#b8860b;margin:0;}
                    .cover h2{font-size:24px;color:#b48554;margin:5px 0;}
                    table{width:100%;border-collapse:collapse;margin:20px 0;}
                    th,td{border:1px solid #b8860b;padding:8px;text-align:center;}
                    th{background:#fefcf6;color:#b8860b;}
                    .chart-img{max-width:100%;height:auto;border:1px solid #b8860b;border-radius:10px;margin:20px 0;}
                    .footer{text-align:center;margin-top:40px;color:#888;border-top:1px dashed #b8860b;padding-top:10px;}
                    .kpi{display:inline-block;margin:5px;padding:12px 20px;background:#fefcf6;border-radius:10px;border:1px solid #b8860b;}
                    .kpi strong{display:block;color:#b8860b;font-size:1.6rem;}
                    .highlight-good{background:#d4edda;border-color:#28a745;}
                    .highlight-bad{background:#f8d7da;border-color:#dc3545;}
                </style></head>
                <body>
                    <div class="cover">
                        <h1>Farouk Group for Consultations & Business</h1>
                        <h2>CAGR Raporu — Nominal ve Reel</h2>
                        <p>Entity: ${D.companyName} | Date: ${dateStr}</p>
                        <p>Currency: ${D.currency}</p>
                    </div>
                    <h2 style="color:#b8860b;">📊 Key Performance Indicators</h2>
                    <div style="text-align:center;">
                        <div class="kpi">Nominal CAGR<strong>${(D.cagr*100).toFixed(2)}%</strong></div>
                        <div class="kpi ${beatsEnflasyon ? 'highlight-good' : 'highlight-bad'}">Real CAGR<strong>${realCagrPercent}%</strong></div>
                        <div class="kpi">Enflasyon<strong>${D.inflationPercent.toFixed(2)}%</strong></div>
                        <div class="kpi ${D.realGrowth >= 0 ? 'highlight-good' : 'highlight-bad'}">Real Growth<strong>${D.realGrowth.toFixed(2)}%</strong></div>
                    </div>
                    <h2 style="color:#b8860b;">📋 Inputs</h2>
                    <table>
                        <tr><th>Başlangıç Değeri</th><td>${D.currency} ${fmt(D.start)}</td><th>Son Değer (Nominal)</th><td>${D.currency} ${fmt(D.end)}</td></tr>
                        <tr><th>Son Değer (Reel)</th><td>${D.currency} ${fmt(D.endRealValue)}</td><th>Years</th><td>${D.years}</td></tr>
                        <tr><th>Yıllık Enflasyon</th><td>${D.inflationPercent.toFixed(2)}%</td><th>Simple Annual Growth</th><td>${D.simpleAnnual.toFixed(2)}%</td></tr>
                        <tr><th>Doubling Time (Nominal)</th><td>${D.doublingTimeNominal && isFinite(D.doublingTimeNominal) ? D.doublingTimeNominal.toFixed(2)+' yıl' : '∞'}</td><th>Doubling Time (Real)</th><td>${D.doublingTimeReal && isFinite(D.doublingTimeReal) ? D.doublingTimeReal.toFixed(2)+' yıl' : '∞'}</td></tr>
                    </table>
                    <h2 style="color:#b8860b;">📈 Year-by-Year Growth Table</h2>
                    <table>
                        <thead><tr><th>Year</th><th>Nominal (CAGR)</th><th>Real (Real CAGR)</th><th>Simple Value</th><th>Compound − Simple</th></tr></thead>
                        <tbody>${tableRows}</tbody>
                    </table>
                    ${comparisonHtml}
                    ${chartImgBase64 ? `<h2 style="color:#b8860b;">📊 Büyüme Eğrisi</h2><div style="text-align:center;"><img src="${chartImgBase64}" class="chart-img" /></div>` : ''}
                    <h2 style="color:#b8860b;">💡 Interpretation</h2>
                    <div style="background:#fefcf6;padding:15px;border-radius:10px;border-left:4px solid #b8860b;">
                        <p><strong>Nominal CAGR:</strong> ${(D.cagr*100).toFixed(2)}% annually over ${D.years} years.</p>
                        <p><strong>Real CAGR:</strong> ${realCagrPercent}% annually after removing inflation (${D.inflationPercent.toFixed(2)}%).</p>
                        <p><strong>Purchasing Power Loss:</strong> ${D.purchasingPowerLoss.toFixed(2)}% of the final value.</p>
                        <p><strong>Conclusion:</strong> ${beatsEnflasyon
                            ? '✅ Yatırım enflasyonu yendi ve satın alma gücünde reel büyüme sağladı.'
                            : '⚠️ Yatırım enflasyonu yenemedi — reel satın alma gücü geriledi veya durgunlaştı. Strateji gözden geçirilmesi önerilir.'}</p>
                    </div>
                    <div class="footer">Generated by Farouk Group for Consultations & Business © ${now.getFullYear()}</div>
                </body></html>`;

                const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `CAGR_Report_${D.companyName}_${now.toISOString().slice(0,10)}.doc`;
                link.click();
                URL.revokeObjectURL(link.href);
            } catch(err) {
                console.error(err);
                alert('Word hatası: ' + err.message);
            } finally { hideLoading(); }
        });

    })();
    