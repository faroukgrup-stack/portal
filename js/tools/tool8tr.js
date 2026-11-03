
    AOS.init({ duration: 800, once: true, offset: 100 });

    // ===== Hesap makinesi =====
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
            } catch(e) { calcDisplay.value = 'Hata'; currentCalcInput = ''; }
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

    // ===== Yükleme ekranı =====
    function showLoading(title, msg) {
        document.getElementById('loadingTitle').textContent = title;
        document.getElementById('loadingMsg').textContent = msg;
        document.getElementById('exportLoading').classList.add('show');
    }
    function hideLoading() {
        document.getElementById('exportLoading').classList.remove('show');
    }

    // ===== Temel hesaplama fonksiyonları =====
    function fmtNum(n) { return Math.round(n).toLocaleString('en-US'); }

    // ===== Genel değişkenler =====
    let globalResults = {};
    let fcfChart = null;

    function computeCashFlow() {
        const currency = document.getElementById('currencySelect').value;
        const period = document.getElementById('periodSelect').value;
        const flowType = document.getElementById('flowTypeSelect').value;

        let revenueAnnual = parseFloat(document.getElementById('revenue').value) || 0;
        let opexAnnual = parseFloat(document.getElementById('opex').value) || 0;
        let depreciationAnnual = parseFloat(document.getElementById('depreciation').value) || 0;
        let taxRatePercent = parseFloat(document.getElementById('taxRate').value) || 0;
        let taxRate = taxRatePercent / 100;
        let capexAnnual = parseFloat(document.getElementById('capex').value) || 0;
        let wcChangeAnnual = parseFloat(document.getElementById('wcChange').value) || 0;
        let growthRatePercent = parseFloat(document.getElementById('growthRate').value) || 0;
        let growthRate = growthRatePercent / 100;

        let revenue = revenueAnnual;
        let opex = opexAnnual;
        let depreciation = depreciationAnnual;
        let capex = capexAnnual;
        let wcChange = wcChangeAnnual;

        if (period === 'monthly') {
            revenue /= 12;
            opex /= 12;
            depreciation /= 12;
            capex /= 12;
            wcChange /= 12;
        } else if (period === 'quarterly') {
            revenue /= 4;
            opex /= 4;
            depreciation /= 4;
            capex /= 4;
            wcChange /= 4;
        }

        let periodName = '';
        if (period === 'monthly') periodName = 'Aylık';
        else if (period === 'quarterly') periodName = '3 Aylık';
        else periodName = 'Yıllık';

        if (revenue <= 0) { alert('Lütfen geçerli gelir girin.'); return null; }

        const ebit = revenue - opex - depreciation;
        const taxes = ebit > 0 ? ebit * taxRate : 0;
        const nopat = ebit - taxes;
        const operatingCF = nopat + depreciation;

        let finalFCF, flowName;
        if (flowType === 'operating') {
            finalFCF = operatingCF;
            flowName = 'Faaliyet Nakit Akışı (OCF)';
        } else {
            finalFCF = operatingCF - capex - wcChange;
            flowName = 'Serbest Nakit Akışı (FCFF)';
        }

        // Gelecek 5 dönem tahmini
        const labels = [];
        const values = [];
        let currentFCF = finalFCF;
        const startYear = new Date().getFullYear();

        if (period === 'yearly') {
            for (let i = 0; i < 5; i++) {
                labels.push(startYear + i);
                values.push(currentFCF);
                currentFCF = currentFCF * (1 + growthRate);
            }
        } else if (period === 'quarterly') {
            const quarters = ['1. Çeyrek', '2. Çeyrek', '3. Çeyrek', '4. Çeyrek'];
            let year = startYear;
            let qIndex = 0;
            for (let i = 0; i < 5; i++) {
                labels.push(`${quarters[qIndex]} ${year}`);
                values.push(currentFCF);
                currentFCF = currentFCF * (1 + growthRate);
                qIndex++;
                if (qIndex === 4) { qIndex = 0; year++; }
            }
        } else { // monthly
            const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
            let year = startYear;
            let mIndex = 0;
            for (let i = 0; i < 5; i++) {
                labels.push(`${months[mIndex]} ${year}`);
                values.push(currentFCF);
                currentFCF = currentFCF * (1 + growthRate);
                mIndex++;
                if (mIndex === 12) { mIndex = 0; year++; }
            }
        }

        document.getElementById('initialMessage').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';

        document.getElementById('kpiCards').innerHTML = `
            <div class="result-card"><i class="fas fa-dollar-sign"></i><h4>Gelir (${periodName})</h4><div class="value">${currency}${fmtNum(revenue)}</div></div>
            <div class="result-card"><i class="fas fa-file-invoice"></i><h4>EBIT</h4><div class="value">${currency}${fmtNum(ebit)}</div></div>
            <div class="result-card"><i class="fas fa-calculator"></i><h4>NOPAT</h4><div class="value">${currency}${fmtNum(nopat)}</div></div>
            <div class="result-card"><i class="fas fa-chart-line"></i><h4>${flowName}</h4><div class="value">${currency}${fmtNum(finalFCF)}</div><div class="status ${finalFCF > 0 ? 'status-good' : finalFCF < 0 ? 'status-bad' : 'status-warning'}">${finalFCF > 0 ? 'Pozitif' : finalFCF < 0 ? 'Negatif' : 'Nötr'}</div></div>
        `;

        // Detay tablosu
        let tableRows = `
            <tr><td style="text-align:right">Gelir (${periodName})</td><td>${currency}${fmtNum(revenue)}</td></tr>
            <tr><td style="text-align:right">Faaliyet Giderleri (nakit)</td><td>${currency}${fmtNum(opex)}</td></tr>
            <tr><td style="text-align:right">Amortisman ve İtfa</td><td>${currency}${fmtNum(depreciation)}</td></tr>
            <tr><td style="text-align:right">EBIT</td><td>${currency}${fmtNum(ebit)}</td></tr>
            <tr><td style="text-align:right">Vergi (${taxRatePercent.toFixed(0)}%)</td><td>${currency}${fmtNum(taxes)}</td></tr>
            <tr><td style="text-align:right">NOPAT</td><td>${currency}${fmtNum(nopat)}</td></tr>
            <tr><td style="text-align:right">+ Amortisman</td><td>${currency}${fmtNum(depreciation)}</td></tr>
            <tr><td style="text-align:right">Faaliyet Nakit Akışı</td><td>${currency}${fmtNum(operatingCF)}</td></tr>
        `;
        if (flowType === 'free') {
            tableRows += `
                <tr><td style="text-align:right">- Sermaye Harcamaları (CAPEX) (${periodName})</td><td>${currency}${fmtNum(capex)}</td></tr>
                <tr><td style="text-align:right">- İşletme Sermayesi Değişimi</td><td>${currency}${fmtNum(wcChange)}</td></tr>
            `;
        }
        tableRows += `<tr style="background:rgba(180,133,84,0.15);font-weight:900;"><td style="text-align:right">${flowName}</td><td>${currency}${fmtNum(finalFCF)}</td></tr>`;

        document.getElementById('detailsTable').innerHTML = `
            <table>
                <thead><tr><th>Kalem</th><th>Değer (${currency})</th></tr></thead>
                <tbody>${tableRows}</tbody>
            </table>
        `;

        // Grafik
        const ctx = document.getElementById('fcfChart').getContext('2d');
        if (fcfChart) fcfChart.destroy();
        const colors = values.map(v => v >= 0 ? 'rgba(74,222,128,0.8)' : 'rgba(248,113,113,0.8)');
        fcfChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: flowName,
                    data: values,
                    backgroundColor: colors,
                    borderColor: colors.map(c => c.replace('0.8', '1')),
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { labels: { color: '#f0f4fa' } },
                    tooltip: {
                        callbacks: {
                            label: function(ctx) {
                                return `${ctx.dataset.label}: ${currency} ${fmtNum(ctx.raw)}`;
                            }
                        }
                    }
                },
                scales: {
                    y: { ticks: { color: '#aab7d4' }, grid: { color: 'rgba(180,133,84,0.15)' } },
                    x: { ticks: { color: '#aab7d4', maxTicksLimit: 10 } }
                }
            }
        });

        // Yorum
        let interpretation = '';
        if (finalFCF > 0) {
            interpretation = `${flowName} pozitif (${currency}${fmtNum(finalFCF)} - ${periodName}). Şirket, harcamaları karşıladıktan sonra nakit üretiyor. Beklenen büyüme ile 5 dönem sonra ${currency}${fmtNum(values[4])} seviyesine ulaşması bekleniyor.`;
        } else if (finalFCF < 0) {
            interpretation = `${flowName} negatif (${currency}${fmtNum(Math.abs(finalFCF))} - ${periodName}). Şirket nakit tüketiyor ve dış finansmana ihtiyaç duyabilir. Büyüme ile 5 dönem sonra ${currency}${fmtNum(values[4])} seviyesine ulaşabilir.`;
        } else {
            interpretation = `${flowName} sıfır (${periodName}), şirket sadece temel ihtiyaçlarını karşılıyor.`;
        }
        document.getElementById('interpretation').innerHTML = `<p><i class="fas fa-lightbulb" style="color:var(--accent-soft);"></i> ${interpretation}</p>`;

        // Sonuçları kaydet
        globalResults = {
            inputs: {
                revenueAnnual: parseFloat(document.getElementById('revenue').value),
                opexAnnual: parseFloat(document.getElementById('opex').value),
                depreciationAnnual: parseFloat(document.getElementById('depreciation').value),
                taxRatePercent: taxRatePercent,
                capexAnnual: parseFloat(document.getElementById('capex').value),
                wcChangeAnnual: parseFloat(document.getElementById('wcChange').value),
                growthRatePercent: growthRatePercent,
                period, flowType,
                companyName: document.getElementById('companyName').value || 'Yararlanıcı kurum',
                currency
            },
            outputs: {
                periodName, revenuePerPeriod: revenue, opexPerPeriod: opex,
                depreciationPerPeriod: depreciation, capexPerPeriod: capex,
                wcChangePerPeriod: wcChange, taxRatePercent,
                growthRatePercent, ebit, taxes, nopat, operatingCF,
                finalFCF, flowName, labels, values, interpretation
            }
        };
        return globalResults;
    }

    document.getElementById('calculateBtn').addEventListener('click', function() {
        computeCashFlow();
    });

    // ================================================================
    // ========== Excel Dışa Aktar ==========
    // ================================================================
    document.getElementById('exportFullExcelBtn').addEventListener('click', async function() {
        if (document.getElementById('resultsSection').style.display === 'none') {
            alert('Lütfen önce analizi yapın.');
            return;
        }
        if (!globalResults.outputs) { alert('Lütfen önce sonuçları hesaplayın.'); return; }
        showLoading('Excel raporu oluşturuluyor...', 'Sayfalar ve grafikler oluşturuluyor');
        try {
            const R = globalResults.outputs;
            const I = globalResults.inputs;
            const currency = I.currency;
            const companyName = I.companyName;

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'FAROUK GRUP';
            const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050';
            const AR = 'FFF5F0E8', DT = 'FF1A1A1A', PB = 'FFD4EDDA', NB = 'FFF8D7DA', GB = 'FFFFF3CD';
            const PT = 'FF155724', NT = 'FF721C24';
            const nc = '#,##0;(#,##0);"-"';

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
            mh(cv,1,4,4,`Nakit Akışı Analiz Raporu\n${companyName}`,DB,GL,18);
            const inf=[['📋 Kurum',companyName],['📅 Tarih',new Date().toLocaleDateString('tr-TR')],['💰 Para Birimi',currency],['📊 Dönem',R.periodName],['🔧 Akış Tipi',R.flowName],['💵 Nakit Akışı',`${currency} ${fmtNum(R.finalFCF)}`]];
            let ir=6;
            inf.forEach(([l,v],idx)=>{
                cv.mergeCells(ir,1,ir,2); cv.mergeCells(ir,3,ir,4);
                const lc=cv.getCell(ir,1), vc=cv.getCell(ir,3); lc.value=l; vc.value=v;
                const bg=idx%2===0?AR:'FFFEFCF6';
                ap(lc,{font:{name:'Arial',bold:true,size:11,color:{argb:'00695C'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'right',vertical:'middle',readingOrder:'rtl'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                ap(vc,{font:{name:'Arial',size:11,color:{argb:DT}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',readingOrder:'rtl'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                cv.getRow(ir).height=28; ir++;
            });
            const vr=ir+1, isg=R.finalFCF>0;
            cv.mergeCells(vr,1,vr,4); const vc2=cv.getCell(vr,1);
            vc2.value=isg?'✅ Nakit akışı pozitif — likidite iyi':'⚠️ Nakit akışı negatif veya sıfır — inceleme gerekli';
            vc2.font={name:'Arial',bold:true,size:14,color:{argb:isg?PT:'856404'}};
            vc2.fill={type:'pattern',pattern:'solid',fgColor:{argb:isg?PB:GB}};
            vc2.alignment={horizontal:'center',vertical:'middle',readingOrder:'rtl'};
            vc2.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};
            cv.getRow(vr).height=40;

            // 2. Girdiler
            const inputsSheet = workbook.addWorksheet('Girdiler ve Varsayımlar', { views: [{ rightToLeft: true, showGridLines: false }] });
            inputsSheet.getColumn(1).width=5; inputsSheet.getColumn(2).width=38; inputsSheet.getColumn(3).width=22; inputsSheet.getColumn(4).width=22; inputsSheet.getColumn(5).width=5;
            mh(inputsSheet,1,5,1,'📋 Temel Girdiler ve Varsayımlar',DB,GL,14);
            inputsSheet.getRow(1).height=40;
            mh(inputsSheet,2,4,2,'Proje Verileri',SB,'FFFFFFFF',11);
            inputsSheet.getRow(2).height=28;
            const inputFields = [
                ['Gelir (Yıllık)', I.revenueAnnual, `${currency} ${fmtNum(I.revenueAnnual)}`],
                ['Faaliyet Giderleri (Yıllık)', I.opexAnnual, `${currency} ${fmtNum(I.opexAnnual)}`],
                ['Amortisman (Yıllık)', I.depreciationAnnual, `${currency} ${fmtNum(I.depreciationAnnual)}`],
                ['Vergi Oranı (%)', I.taxRatePercent, ''],
                ['Sermaye Harcamaları (Yıllık)', I.capexAnnual, `${currency} ${fmtNum(I.capexAnnual)}`],
                ['İşletme Sermayesi Değişimi (Yıllık)', I.wcChangeAnnual, `${currency} ${fmtNum(I.wcChangeAnnual)}`],
                ['Beklenen Büyüme Oranı (%)', I.growthRatePercent, ''],
                ['Dönem', I.period === 'monthly' ? 'Aylık' : I.period === 'quarterly' ? '3 Aylık' : 'Yıllık', ''],
                ['Akış Tipi', I.flowType === 'operating' ? 'Faaliyet (OCF)' : 'Serbest (FCFF)', ''],
                ['Para Birimi', I.currency, ''],
                ['Kurum Adı', I.companyName, '']
            ];
            let iRow=3;
            inputFields.forEach(([label,val,note],idx)=>{
                inputsSheet.getRow(iRow).height=24;
                const bg=idx%2===0?'FFFEFCF6':'FFFFFFFF';
                const lc=inputsSheet.getCell(iRow,2), vc=inputsSheet.getCell(iRow,3), nc=inputsSheet.getCell(iRow,4);
                lc.value=label; vc.value=val; nc.value=note;
                ap(lc,cs(bg,DT,true,'right'));
                ap(vc,{...cs(bg,'0000FF',false,'center'),numFmt:typeof val==='number'?nc:null});
                ap(nc,cs(bg,'00695C',false,'center'));
                iRow++;
            });

            // 3. KPI
            const kpiSheet = workbook.addWorksheet('Temel Göstergeler', { views: [{ rightToLeft: true, showGridLines: false }] });
            [5,32,22,22,22,5].forEach((w,i)=>kpiSheet.getColumn(i+1).width=w);
            mh(kpiSheet,1,6,1,'📊 Temel Göstergeler',DB,GL,15);
            kpiSheet.getRow(1).height=45;
            mh(kpiSheet,2,5,2,`${companyName} | ${new Date().toLocaleDateString('tr-TR')}`,HB,'FFFFFFFF',10);
            kpiSheet.getRow(2).height=26;
            const kpis = [
                { label: 'Gelir (dönem başı)', value: `${currency} ${fmtNum(R.revenuePerPeriod)}`, good: true },
                { label: 'EBIT', value: `${currency} ${fmtNum(R.ebit)}`, good: R.ebit>0 },
                { label: 'NOPAT', value: `${currency} ${fmtNum(R.nopat)}`, good: R.nopat>0 },
                { label: 'Faaliyet Nakit Akışı', value: `${currency} ${fmtNum(R.operatingCF)}`, good: R.operatingCF>0 },
                { label: R.flowName, value: `${currency} ${fmtNum(R.finalFCF)}`, good: R.finalFCF>0 }
            ];
            let kRow=3;
            kpis.forEach((k,idx)=>{
                kpiSheet.getRow(kRow).height=40;
                kpiSheet.mergeCells(kRow,2,kRow,2); kpiSheet.mergeCells(kRow,3,kRow,3); kpiSheet.mergeCells(kRow,4,kRow,4); kpiSheet.mergeCells(kRow,5,kRow,5);
                const ic=kpiSheet.getCell(kRow,2); ic.value=`🔹 ${idx+1}`;
                const lc2=kpiSheet.getCell(kRow,3); lc2.value=k.label;
                const vc3=kpiSheet.getCell(kRow,4); vc3.value=k.value;
                const nc2=kpiSheet.getCell(kRow,5); nc2.value=k.good?'✅ Pozitif':'⚠️ İncele';
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
            kFinal.value=R.finalFCF>0?'✅ Nakit akışı pozitif — likidite iyi':'⚠️ Nakit akışı negatif — inceleme gerekli';
            kFinal.font={name:'Arial',bold:true,size:13,color:{argb:R.finalFCF>0?PT:'856404'}};
            kFinal.fill={type:'pattern',pattern:'solid',fgColor:{argb:R.finalFCF>0?PB:GB}};
            kFinal.alignment={horizontal:'center',vertical:'middle',readingOrder:'rtl'};
            kFinal.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};
            kpiSheet.getRow(kRow).height=40;

            // 4. Hesaplama Detayı
            const detailSheet = workbook.addWorksheet('Hesaplama Detayı', { views: [{ rightToLeft: true, showGridLines: false }] });
            detailSheet.getColumn(1).width=5; detailSheet.getColumn(2).width=45; detailSheet.getColumn(3).width=30; detailSheet.getColumn(4).width=5;
            mh(detailSheet,1,4,1,'📋 Hesaplama Detayı',DB,GL,14);
            detailSheet.getRow(1).height=40;
            const detailRows = [
                ['Gelir', `${currency} ${fmtNum(R.revenuePerPeriod)}`],
                ['Faaliyet Giderleri', `${currency} ${fmtNum(R.opexPerPeriod)}`],
                ['Amortisman', `${currency} ${fmtNum(R.depreciationPerPeriod)}`],
                ['EBIT', `${currency} ${fmtNum(R.ebit)}`],
                ['Vergi', `${currency} ${fmtNum(R.taxes)}`],
                ['NOPAT', `${currency} ${fmtNum(R.nopat)}`],
                ['+ Amortisman', `${currency} ${fmtNum(R.depreciationPerPeriod)}`],
                ['Faaliyet Nakit Akışı', `${currency} ${fmtNum(R.operatingCF)}`]
            ];
            if (I.flowType === 'free') {
                detailRows.push(['- Sermaye Harcamaları (CAPEX)', `${currency} ${fmtNum(R.capexPerPeriod)}`]);
                detailRows.push(['- İşletme Sermayesi Değişimi', `${currency} ${fmtNum(R.wcChangePerPeriod)}`]);
            }
            detailRows.push([R.flowName, `${currency} ${fmtNum(R.finalFCF)}`]);
            detailSheet.addRows([['Kalem', 'Değer']]);
            detailRows.forEach(row => detailSheet.addRow(row));
            detailSheet.getRow(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            detailSheet.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
            detailSheet.getColumn(2).width=40; detailSheet.getColumn(3).width=30;

            // 5. Tahminler
            const forecastSheet = workbook.addWorksheet('Nakit Akışı Tahmini', { views: [{ rightToLeft: true, showGridLines: false }] });
            forecastSheet.getColumn(1).width=5; forecastSheet.getColumn(2).width=40; forecastSheet.getColumn(3).width=30; forecastSheet.getColumn(4).width=5;
            mh(forecastSheet,1,4,1,'📈 Gelecek 5 Dönem Nakit Akışı',DB,GL,14);
            forecastSheet.getRow(1).height=40;
            const forecastRows = R.labels.map((label, idx) => [label, `${currency} ${fmtNum(R.values[idx])}`]);
            forecastSheet.addRows([['Dönem', `Beklenen Nakit Akışı (${currency})`]]);
            forecastRows.forEach(row => forecastSheet.addRow(row));
            forecastSheet.getRow(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            forecastSheet.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
            forecastSheet.getColumn(2).width=35; forecastSheet.getColumn(3).width=35;

            // 6. Grafik
            const chartsSheet = workbook.addWorksheet('Grafikler', { views: [{ rightToLeft: true, showGridLines: false }] });
            chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
            mh(chartsSheet,1,3,1,'📈 Nakit Akışı Grafiği',DB,GL,14);
            chartsSheet.getRow(1).height=40;
            const canvasElem = document.getElementById('fcfChart');
            if (canvasElem) {
                try {
                    const origBg = canvasElem.style.backgroundColor;
                    canvasElem.style.backgroundColor = '#ffffff';
                    const canvasImg = await html2canvas(canvasElem, { scale: 2, backgroundColor: '#ffffff' });
                    canvasElem.style.backgroundColor = origBg;
                    const imgData = canvasImg.toDataURL('image/png');
                    const imageId = workbook.addImage({ base64: imgData, extension: 'png' });
                    chartsSheet.addImage(imageId, { tl: { col: 1, row: 2 }, br: { col: 2, row: 18 }, editAs: 'oneCell' });
                } catch(err) { chartsSheet.getCell(3,2).value = 'Grafik yakalanamadı.'; }
            }

            // 7. Yorum
            const evalSheet = workbook.addWorksheet('Yorum ve Öneriler', { views: [{ rightToLeft: true, showGridLines: false }] });
            evalSheet.getColumn(1).width=5; evalSheet.getColumn(2).width=50; evalSheet.getColumn(3).width=5;
            mh(evalSheet,1,3,1,'📝 Yorum ve Öneriler',DB,GL,14);
            evalSheet.getRow(1).height=45;
            const sections = [
                { title: '1. Özet', content: `Kurum: ${companyName}\nDönem: ${R.periodName}\nAkış Tipi: ${R.flowName}\nMevcut Nakit Akışı: ${currency} ${fmtNum(R.finalFCF)}\nBüyüme Oranı: ${I.growthRatePercent}%` },
                { title: '2. Gelecek Tahmini', content: `5 dönem sonra beklenen nakit akışı: ${currency} ${fmtNum(R.values[4])}` },
                { title: '3. Öneriler', content: R.finalFCF>0 ? '✅ Nakit akışı pozitif — fazla nakit yatırım veya borç ödemede kullanılabilir.\n• Sermaye harcamalarını izleyin.\n• İşletme sermayesi yönetimini iyileştirin.' : '⚠️ Nakit akışı negatif — maliyet yapısı gözden geçirilmelidir.\n• Faaliyet giderlerini azaltın.\n• Ek finansman kaynakları araştırın.' }
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
            const fileName = `NakitAkışı_Raporu_${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert('Excel hatası: ' + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== Word Dışa Aktar ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (document.getElementById('resultsSection').style.display === 'none') {
            alert('Lütfen önce analizi yapın.');
            return;
        }
        if (!globalResults.outputs) { alert('Lütfen önce sonuçları hesaplayın.'); return; }
        showLoading('Word raporu oluşturuluyor...', 'Veriler ve grafikler toplanıyor');
        try {
            const R = globalResults.outputs;
            const I = globalResults.inputs;
            const currency = I.currency;
            const companyName = I.companyName;
            const now = new Date();
            const dateStr = now.toLocaleDateString('tr-TR');

            const canvas = document.getElementById('fcfChart');
            let chartImg = '';
            if (canvas) {
                const origBg = canvas.style.backgroundColor;
                canvas.style.backgroundColor = '#ffffff';
                const img = await html2canvas(canvas, { scale: 2, backgroundColor: '#ffffff' });
                canvas.style.backgroundColor = origBg;
                chartImg = img.toDataURL('image/png');
            }

            const kpiData = [
                { label: 'Gelir (dönem başı)', value: `${currency} ${fmtNum(R.revenuePerPeriod)}`, good: true },
                { label: 'EBIT', value: `${currency} ${fmtNum(R.ebit)}`, good: R.ebit>0 },
                { label: 'NOPAT', value: `${currency} ${fmtNum(R.nopat)}`, good: R.nopat>0 },
                { label: 'Faaliyet Nakit Akışı', value: `${currency} ${fmtNum(R.operatingCF)}`, good: R.operatingCF>0 },
                { label: R.flowName, value: `${currency} ${fmtNum(R.finalFCF)}`, good: R.finalFCF>0 }
            ];
            let kpiRows = '';
            kpiData.forEach(k => {
                kpiRows += `<tr style="border:1px solid #b8860b;"><td style="padding:12px;background:${k.good?'#d4edda':'#f8d7da'};text-align:right;">${k.label}</td><td style="padding:12px;background:${k.good?'#d4edda':'#f8d7da'};text-align:center;"><strong style="font-size:1.2rem;color:${k.good?'#155724':'#721c24'}">${k.value}</strong></td><td style="padding:12px;background:${k.good?'#d4edda':'#f8d7da'};text-align:center;">${k.good?'✅ Pozitif':'⚠️ İncele'}</td></tr>`;
            });

            const detailRows = [
                { label: 'Gelir', value: `${currency} ${fmtNum(R.revenuePerPeriod)}` },
                { label: 'Faaliyet Giderleri', value: `${currency} ${fmtNum(R.opexPerPeriod)}` },
                { label: 'Amortisman', value: `${currency} ${fmtNum(R.depreciationPerPeriod)}` },
                { label: 'EBIT', value: `${currency} ${fmtNum(R.ebit)}` },
                { label: 'Vergi', value: `${currency} ${fmtNum(R.taxes)}` },
                { label: 'NOPAT', value: `${currency} ${fmtNum(R.nopat)}` },
                { label: '+ Amortisman', value: `${currency} ${fmtNum(R.depreciationPerPeriod)}` },
                { label: 'Faaliyet Nakit Akışı', value: `${currency} ${fmtNum(R.operatingCF)}` }
            ];
            if (I.flowType === 'free') {
                detailRows.push({ label: '- CAPEX', value: `${currency} ${fmtNum(R.capexPerPeriod)}` });
                detailRows.push({ label: '- İşletme Sermayesi Değişimi', value: `${currency} ${fmtNum(R.wcChangePerPeriod)}` });
            }
            detailRows.push({ label: R.flowName, value: `${currency} ${fmtNum(R.finalFCF)}` });
            let detailHtml = '<table style="width:100%;border-collapse:collapse;"><thead><tr><th>Kalem</th><th>Değer</th></tr></thead><tbody>';
            detailRows.forEach(row => {
                detailHtml += `<tr style="border:1px solid #b8860b;"><td style="padding:8px;text-align:right;">${row.label}</td><td style="padding:8px;text-align:center;">${row.value}</td></tr>`;
            });
            detailHtml += '</tbody></table>';

            let forecastHtml = '<table style="width:100%;border-collapse:collapse;"><thead><tr><th>Dönem</th><th>Beklenen Nakit Akışı</th></tr></thead><tbody>';
            for (let i=0; i<R.labels.length; i++) {
                forecastHtml += `<tr><td>${R.labels[i]}</td><td>${currency} ${fmtNum(R.values[i])}</td></tr>`;
            }
            forecastHtml += '</tbody></table>';

            const isGood = R.finalFCF > 0;
            const verdictHtml = `<div style="margin:20px 0;padding:15px;background:${isGood?'#d4edda':'#f8d7da'};border-radius:10px;text-align:center;"><strong>${isGood?'✅ Nakit akışı pozitif — likidite iyi':'⚠️ Nakit akışı negatif — inceleme gerekli'}</strong></div>`;

            const fullHtml = `<!DOCTYPE html>
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
            <head><meta charset='utf-8'><title>Nakit Akışı Raporu - FAROUK GRUP</title>
            <style>
                body{font-family:'Arial','Tajawal',sans-serif;direction:rtl;margin:2rem;background:#fff;}
                .cover{text-align:center;border-bottom:4px solid #b8860b;margin-bottom:30px;padding-bottom:20px;}
                .cover h1{font-size:32px;color:#b8860b;margin:0;}
                .cover h2{font-size:24px;color:#b48554;margin:5px 0;}
                table{width:100%;border-collapse:collapse;margin:20px 0;}
                th,td{border:1px solid #b8860b;padding:8px;text-align:center;}
                th{background:#fefcf6;color:#b8860b;font-weight:bold;}
                .chart-img{max-width:100%;border:1px solid #b8860b;border-radius:10px;margin:20px 0;}
                .footer{text-align:center;margin-top:40px;padding-top:10px;border-top:1px dashed #b8860b;color:#888;font-size:10pt;}
            </style></head>
            <body>
                <div class="cover">
                    <h1>FAROUK GRUP</h1>
                    <h2>Gelişmiş Nakit Akışı Analiz Raporu</h2>
                    <p>Kurum: ${companyName} | Tarih: ${dateStr}</p>
                    <p>Dönem: ${R.periodName} | Akış Tipi: ${R.flowName}</p>
                </div>
                <h2 style="color:#b8860b;">Temel Girdiler</h2>
                <table><tbody>
                    <tr><th>Gelir (Yıllık)</th><td>${currency} ${fmtNum(I.revenueAnnual)}</td><th>Faaliyet Giderleri</th><td>${currency} ${fmtNum(I.opexAnnual)}</td></tr>
                    <tr><th>Amortisman (Yıllık)</th><td>${currency} ${fmtNum(I.depreciationAnnual)}</td><th>Vergi Oranı</th><td>${I.taxRatePercent}%</td></tr>
                    <tr><th>CAPEX (Yıllık)</th><td>${currency} ${fmtNum(I.capexAnnual)}</td><th>İşletme Sermayesi Değişimi</th><td>${currency} ${fmtNum(I.wcChangeAnnual)}</td></tr>
                    <tr><th>Beklenen Büyüme</th><td>${I.growthRatePercent}%</td><th></th><th></th></tr>
                </tbody></table>
                <h2 style="color:#b8860b;">📊 Temel Göstergeler</h2>
                <table>${kpiRows}</table>
                ${verdictHtml}
                <h2 style="color:#b8860b;">📈 Nakit Akışı Grafiği</h2>
                <div style="text-align:center;"><img src="${chartImg}" class="chart-img" /></div>
                <h2 style="color:#b8860b;">📋 Hesaplama Detayı</h2>
                ${detailHtml}
                <h2 style="color:#b8860b;">📊 Gelecek Dönem Tahminleri</h2>
                ${forecastHtml}
                <h2 style="color:#b8860b;">💡 Sonuç Yorumu</h2>
                <div style="background:#fefcf6;padding:15px;border-radius:10px;border-right:4px solid #b8860b;"><p>${R.interpretation}</p></div>
                <div class="footer">FAROUK GRUP tarafından oluşturulmuştur © ${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF'+fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `NakitAkışı_Raporu_${companyName}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert('Word hatası: ' + err.message); } finally { hideLoading(); }
    });
