
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

    // ===== Özel oran alanını göster/gizle =====
    document.getElementById('depMethod').addEventListener('change', function() {
        document.getElementById('rateGroup').style.display = (this.value === 'custom') ? 'block' : 'none';
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

    // ===== Genel değişkenler =====
    let globalDepData = null;
    let bookValueChart = null;

    // ===== Hesaplama fonksiyonu =====
    function computeDepreciation() {
        const currency = document.getElementById('currencySelect').value;
        const cost = parseFloat(document.getElementById('assetCost').value) || 0;
        const salvage = parseFloat(document.getElementById('salvageValue').value) || 0;
        const life = parseInt(document.getElementById('usefulLife').value) || 5;
        const method = document.getElementById('depMethod').value;
        const customRateInput = parseFloat(document.getElementById('customRate').value) || 20;
        const customRate = customRateInput / 100;
        const purchaseMonth = parseInt(document.getElementById('purchaseMonth').value) || 1;
        const yearFraction = (12 - (purchaseMonth - 1)) / 12;

        if (cost <= salvage) {
            alert('Varlık maliyeti hurda değerinden büyük olmalıdır.');
            return null;
        }

        let effectiveRate = 0;
        if (method === 'straight') effectiveRate = 1 / life;
        else if (method === 'declining') effectiveRate = 1 / life;
        else if (method === 'double') effectiveRate = 2 / life;
        else if (method === 'custom') effectiveRate = customRate;

        let schedule = [];
        let totalDep = 0;
        let bookVal = cost;
        const totalDepreciable = cost - salvage;
        let maxYears = life + 1;

        for (let year = 1; year <= maxYears; year++) {
            let annualDep = 0;
            if (method === 'straight') {
                let fullYearDep = totalDepreciable / life;
                annualDep = (year === 1) ? fullYearDep * yearFraction : fullYearDep;
            } else {
                annualDep = (year === 1) ? bookVal * effectiveRate * yearFraction : bookVal * effectiveRate;
            }

            if (totalDep + annualDep > totalDepreciable) {
                annualDep = totalDepreciable - totalDep;
            }
            if (annualDep < 0) annualDep = 0;

            bookVal -= annualDep;
            totalDep += annualDep;
            schedule.push({
                year: year,
                depreciation: annualDep,
                accumulated: totalDep,
                bookValue: Math.max(bookVal, salvage)
            });

            if (totalDep >= totalDepreciable - 0.01) break;
            if (bookVal <= salvage + 0.01) break;
        }

        const avgAnnualDep = totalDep / schedule.length;

        document.getElementById('initialMessage').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';

        document.getElementById('kpiCards').innerHTML = `
            <div class="result-card"><i class="fas fa-dollar-sign"></i><h4>Toplam Amortisman</h4><div class="value">${currency}${totalDep.toFixed(0)}</div></div>
            <div class="result-card"><i class="fas fa-chart-line"></i><h4>Nihai Defter Değeri</h4><div class="value">${currency}${(cost - totalDep).toFixed(0)}</div></div>
            <div class="result-card"><i class="fas fa-calendar"></i><h4>Fiili Yıl Sayısı</h4><div class="value">${schedule.length}</div></div>
            <div class="result-card"><i class="fas fa-chart-bar"></i><h4>Ortalama Yıllık Amortisman</h4><div class="value">${currency}${avgAnnualDep.toFixed(0)}</div></div>
            <div class="result-card"><i class="fas fa-percent"></i><h4>Yıllık Amortisman Oranı</h4><div class="value">${(effectiveRate * 100).toFixed(1)}%</div><div class="unit">${method === 'straight' ? 'Sabit' : 'Etkin'}</div></div>
        `;

        let tableHtml = '<table><thead><tr><th>Yıl</th><th>Yıllık Amortisman</th><th>Birikmiş Amortisman</th><th>Defter Değeri</th></tr></thead><tbody>';
        schedule.forEach(r => {
            tableHtml += `<tr><td>${r.year}</td><td>${currency}${r.depreciation.toFixed(0)}</td><td>${currency}${r.accumulated.toFixed(0)}</td><td>${currency}${r.bookValue.toFixed(0)}</td></tr>`;
        });
        tableHtml += '</tbody></table>';
        document.getElementById('depTable').innerHTML = tableHtml;

        const ctx = document.getElementById('bookValueChart').getContext('2d');
        if (bookValueChart) bookValueChart.destroy();
        const labels = schedule.map(r => `Yıl ${r.year}`);
        const bookValues = schedule.map(r => r.bookValue);
        bookValueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Defter Değeri',
                    data: bookValues,
                    borderColor: '#b8860b',
                    backgroundColor: 'rgba(184,134,11,0.1)',
                    tension: 0.1,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, ticks: { color: '#aab7d4' }, grid: { color: 'rgba(180,133,84,0.2)' } },
                    x: { ticks: { color: '#aab7d4' } }
                },
                plugins: { legend: { labels: { color: '#f0f4fa' } } }
            }
        });

        const methodNames = {
            straight: 'Doğrusal',
            declining: 'Azalan Bakiyeli (1/Ömür)',
            double: 'Çift Azalan (2/Ömür)',
            custom: `Özel Oran (${customRateInput}%)`
        };
        const monthNames = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
        const companyName = document.getElementById('companyName').value || 'Yararlanıcı kurum';

        globalDepData = {
            inputs: {
                cost, salvage, life, method, customRateInput,
                purchaseMonth, purchaseMonthName: monthNames[purchaseMonth-1],
                yearFraction, currency, companyName, effectiveRate
            },
            outputs: {
                totalDepreciation: totalDep,
                finalBookValue: cost - totalDep,
                actualYears: schedule.length,
                avgAnnualDep,
                effectiveRatePercent: effectiveRate * 100,
                depreciationSchedule: schedule,
                methodName: methodNames[method]
            }
        };
        return globalDepData;
    }

    document.getElementById('calculateBtn').addEventListener('click', computeDepreciation);

    // ================================================================
    // ========== Excel Dışa Aktar ==========
    // ================================================================
    document.getElementById('exportExcelBtn').addEventListener('click', async function() {
        if (!globalDepData) { alert('Lütfen önce hesaplamayı yapın.'); return; }
        showLoading('Excel raporu oluşturuluyor...', 'Sayfalar ve grafikler oluşturuluyor');
        try {
            const D = globalDepData;
            const I = D.inputs;
            const O = D.outputs;
            const currency = I.currency;
            const companyName = I.companyName;

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
            mh(cv,1,4,4,`Amortisman Analiz Raporu\n${companyName}`,DB,GL,18);
            const inf=[['📋 Kurum',companyName],['📅 Tarih',new Date().toLocaleDateString('tr-TR')],['💰 Para Birimi',currency],['📊 Yöntem',O.methodName],['🏷️ Faydalı Ömür',`${I.life} yıl`],['📉 Toplam Amortisman',`${currency} ${O.totalDepreciation.toFixed(0)}`]];
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
            mh(inputsSheet,1,5,1,'📋 Temel Girdiler ve Varsayımlar',DB,GL,14);
            inputsSheet.getRow(1).height=40;
            mh(inputsSheet,2,4,2,'Varlık Verileri',SB,'FFFFFFFF',11);
            inputsSheet.getRow(2).height=28;
            const inputFields = [
                ['Varlık Maliyeti', I.cost, `${currency} ${I.cost.toFixed(0)}`],
                ['Hurda Değeri', I.salvage, `${currency} ${I.salvage.toFixed(0)}`],
                ['Faydalı Ömür (Yıl)', I.life, ''],
                ['Amortisman Yöntemi', O.methodName, ''],
                ['Satın Alma Ayı', I.purchaseMonthName, ''],
                ['Yıllık Amortisman Oranı', `${O.effectiveRatePercent.toFixed(1)}%`, ''],
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
                ap(vc,{...cs(bg,'0000FF',false,'center'),numFmt:typeof val==='number'?'#,##0':null});
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
                { label: 'Toplam Amortisman', value: `${currency} ${O.totalDepreciation.toFixed(0)}`, good: true },
                { label: 'Nihai Defter Değeri', value: `${currency} ${O.finalBookValue.toFixed(0)}`, good: true },
                { label: 'Fiili Yıl Sayısı', value: O.actualYears, good: true },
                { label: 'Ortalama Yıllık Amortisman', value: `${currency} ${O.avgAnnualDep.toFixed(0)}`, good: true },
                { label: 'Yıllık Amortisman Oranı', value: `${O.effectiveRatePercent.toFixed(1)}%`, good: true }
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

            // 4. Amortisman Tablosu
            const tableSheet = workbook.addWorksheet('Amortisman Tablosu', { views: [{ rightToLeft: true, showGridLines: false }] });
            tableSheet.getColumn(1).width=5; tableSheet.getColumn(2).width=15; tableSheet.getColumn(3).width=25; tableSheet.getColumn(4).width=25; tableSheet.getColumn(5).width=25; tableSheet.getColumn(6).width=5;
            mh(tableSheet,1,6,1,'📋 Yıllık Amortisman Tablosu',DB,GL,14);
            tableSheet.getRow(1).height=40;
            tableSheet.addRow(['Yıl', 'Yıllık Amortisman', 'Birikmiş Amortisman', 'Defter Değeri']);
            tableSheet.getRow(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            tableSheet.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
            O.depreciationSchedule.forEach(r => {
                tableSheet.addRow([r.year, `${currency} ${r.depreciation.toFixed(0)}`, `${currency} ${r.accumulated.toFixed(0)}`, `${currency} ${r.bookValue.toFixed(0)}`]);
            });

            // 5. Grafik
            const chartsSheet = workbook.addWorksheet('Grafik', { views: [{ rightToLeft: true, showGridLines: false }] });
            chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
            mh(chartsSheet,1,3,1,'📈 Defter Değeri Grafiği',DB,GL,14);
            chartsSheet.getRow(1).height=40;
            const chartContainer = document.querySelector('.chart-container');
            if (chartContainer) {
                try {
                    const origBg = chartContainer.style.backgroundColor;
                    chartContainer.style.backgroundColor = '#ffffff';
                    const canvasImg = await html2canvas(chartContainer, { scale: 2, backgroundColor: '#ffffff' });
                    chartContainer.style.backgroundColor = origBg;
                    const imgData = canvasImg.toDataURL('image/png');
                    const imageId = workbook.addImage({ base64: imgData, extension: 'png' });
                    chartsSheet.addImage(imageId, { tl: { col: 1, row: 2 }, br: { col: 2, row: 18 }, editAs: 'oneCell' });
                } catch(err) {}
            }

            // 6. Yorum
            const evalSheet = workbook.addWorksheet('Yorum ve Öneriler', { views: [{ rightToLeft: true, showGridLines: false }] });
            evalSheet.getColumn(1).width=5; evalSheet.getColumn(2).width=50; evalSheet.getColumn(3).width=5;
            mh(evalSheet,1,3,1,'📝 Yorum ve Öneriler',DB,GL,14);
            evalSheet.getRow(1).height=45;
            const sections = [
                { title: '1. Varlık Özeti', content: `Kurum: ${companyName}\nVarlık Maliyeti: ${currency} ${I.cost}\nHurda Değeri: ${currency} ${I.salvage}\nFaydalı Ömür: ${I.life} yıl\nYöntem: ${O.methodName}` },
                { title: '2. Amortisman Sonuçları', content: `Toplam Amortisman: ${currency} ${O.totalDepreciation.toFixed(0)}\nNihai Defter Değeri: ${currency} ${O.finalBookValue.toFixed(0)}\nOrtalama Yıllık Amortisman: ${currency} ${O.avgAnnualDep.toFixed(0)}\nYıllık Oran: ${O.effectiveRatePercent.toFixed(1)}%` },
                { title: '3. Öneriler', content: '• Amortisman tablosunu muhasebe standartlarına uygun olarak düzenli gözden geçirin.\n• Bu tabloyu vergi planlaması ve bütçeleme için kullanın.\n• Hurda değeri ve faydalı ömrü önemli değişikliklerde güncelleyin.' },
                { title: '4. Uyarı', content: 'Bu analiz tahmini varsayımlara dayanmaktadır. Gerçek sonuçlar değişebilir. Muhasebe uzmanına danışmanız önerilir.' }
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
            const fileName = `Amortisman_Raporu_${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert('Excel hatası: ' + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== Word Dışa Aktar ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (!globalDepData) { alert('Lütfen önce hesaplamayı yapın.'); return; }
        showLoading('Word raporu oluşturuluyor...', 'Veriler ve grafikler toplanıyor');
        try {
            const D = globalDepData;
            const I = D.inputs;
            const O = D.outputs;
            const currency = I.currency;
            const companyName = I.companyName;
            const now = new Date();
            const dateStr = now.toLocaleDateString('tr-TR');

            const chartContainer = document.querySelector('.chart-container');
            let chartImg = '';
            if (chartContainer) {
                const origBg = chartContainer.style.backgroundColor;
                chartContainer.style.backgroundColor = '#ffffff';
                const img = await html2canvas(chartContainer, { scale: 2, backgroundColor: '#ffffff' });
                chartContainer.style.backgroundColor = origBg;
                chartImg = img.toDataURL('image/png');
            }

            let tableRows = '';
            O.depreciationSchedule.forEach(r => {
                tableRows += `<tr><td>${r.year}</td><td>${currency} ${r.depreciation.toFixed(0)}</td><td>${currency} ${r.accumulated.toFixed(0)}</td><td>${currency} ${r.bookValue.toFixed(0)}</td></tr>`;
            });

            let kpiRows = '';
            const kpiData = [
                { label: 'Toplam Amortisman', value: `${currency} ${O.totalDepreciation.toFixed(0)}` },
                { label: 'Nihai Defter Değeri', value: `${currency} ${O.finalBookValue.toFixed(0)}` },
                { label: 'Fiili Yıl Sayısı', value: O.actualYears },
                { label: 'Ortalama Yıllık Amortisman', value: `${currency} ${O.avgAnnualDep.toFixed(0)}` },
                { label: 'Yıllık Amortisman Oranı', value: `${O.effectiveRatePercent.toFixed(1)}%` }
            ];
            kpiData.forEach(k => {
                kpiRows += `<tr style="border:1px solid #b8860b;"><td style="padding:12px;background:#d4edda;text-align:right;">${k.label}</td><td style="padding:12px;background:#d4edda;text-align:center;"><strong style="font-size:1.2rem;color:#155724">${k.value}</strong></td></tr>`;
            });

            const fullHtml = `<!DOCTYPE html>
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
            <head><meta charset='utf-8'><title>Amortisman Raporu - FAROUK GRUP</title>
            <style>
                body{font-family:'Arial','Tajawal',sans-serif;direction:rtl;margin:2rem;background:#fff;}
                .cover{text-align:center;border-bottom:4px solid #b8860b;margin-bottom:30px;padding-bottom:20px;}
                .cover h1{font-size:32px;color:#b8860b;margin:0;}
                .cover h2{font-size:24px;color:#b48554;margin:5px 0;}
                table{width:100%;border-collapse:collapse;margin:20px 0;}
                th,td{border:1px solid #b8860b;padding:8px;text-align:center;}
                th{background:#fefcf6;color:#b8860b;font-weight:bold;}
                .chart-img{max-width:100%;border:1px solid #b8860b;border-radius:10px;margin:20px 0;}
                .footer{text-align:center;margin-top:40px;padding-top:10px;border-top:1px dashed #b8860b;color:#888;}
            </style></head>
            <body>
                <div class="cover">
                    <h1>FAROUK GRUP</h1>
                    <h2>Gelişmiş Amortisman Analiz Raporu</h2>
                    <p>Kurum: ${companyName} | Tarih: ${dateStr}</p>
                    <p>Yöntem: ${O.methodName} | Faydalı Ömür: ${I.life} yıl</p>
                </div>
                <h2 style="color:#b8860b;">Temel Girdiler</h2>
                <table><tbody>
                    <tr><th>Varlık Maliyeti</th><td>${currency} ${I.cost}</td><th>Hurda Değeri</th><td>${currency} ${I.salvage}</td></tr>
                    <tr><th>Faydalı Ömür</th><td>${I.life} yıl</td><th>Satın Alma Ayı</th><td>${I.purchaseMonthName}</td></tr>
                    <tr><th>Amortisman Oranı</th><td>${O.effectiveRatePercent.toFixed(1)}%</td><th></th><td></td></tr>
                </tbody></table>
                <h2 style="color:#b8860b;">📊 Temel Göstergeler</h2>
                <table>${kpiRows}</table>
                <h2 style="color:#b8860b;">📈 Defter Değeri Grafiği</h2>
                <div style="text-align:center;"><img src="${chartImg}" class="chart-img" /></div>
                <h2 style="color:#b8860b;">📋 Yıllık Amortisman Tablosu</h2>
                <table><thead><tr><th>Yıl</th><th>Yıllık Amortisman</th><th>Birikmiş Amortisman</th><th>Defter Değeri</th></tr></thead><tbody>${tableRows}</tbody></table>
                <h2 style="color:#b8860b;">💡 Öneriler</h2>
                <div style="background:#fefcf6;padding:15px;border-radius:10px;border-right:4px solid #b8860b;">
                    <p>• Amortisman tablosunu muhasebe standartlarına uygun olarak düzenli gözden geçirin.</p>
                    <p>• Bu tabloyu vergi planlaması ve bütçeleme için kullanın.</p>
                    <p>• Hurda değeri ve faydalı ömrü önemli değişikliklerde güncelleyin.</p>
                </div>
                <div class="footer">FAROUK GRUP tarafından oluşturulmuştur © ${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Amortisman_Raporu_${companyName}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert('Word hatası: ' + err.message); } finally { hideLoading(); }
    });
