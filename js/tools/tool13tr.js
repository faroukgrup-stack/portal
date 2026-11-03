
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

    // ===== Vardiya yönetimi =====
    let shiftCount = 2;
    function renderShifts() {
        const container = document.getElementById('shiftsContainer');
        container.innerHTML = '';
        for (let i = 1; i <= shiftCount; i++) {
            const div = document.createElement('div');
            div.className = 'shift-row';
            div.innerHTML = `
                <input type="number" id="shiftEmployees${i}" placeholder="Çalışan sayısı" value="" min="0" step="1">
                <input type="number" id="shiftHours${i}" placeholder="Vardiya saati" value="" min="1" step="0.5">
                <span style="color:#cfa776;font-weight:700;">Vardiya ${i}</span>
                ${i > 1 ? `<button class="remove-shift" onclick="removeShift(${i})"><i class="fas fa-times"></i></button>` : ''}
            `;
            container.appendChild(div);
        }
    }
    window.removeShift = function(index) {
        shiftCount--;
        renderShifts();
    };
    document.getElementById('addShiftBtn').addEventListener('click', function() {
        shiftCount++;
        renderShifts();
    });
    document.getElementById('numShifts').addEventListener('change', function() {
        shiftCount = parseInt(this.value);
        renderShifts();
    });

    // ===== Ana hesaplama =====
    let laborChart;
    let globalLaborData = null;

    document.getElementById('calculateBtn').addEventListener('click', function() {
        const currency = document.getElementById('currencySelect').value;
        const companyName = document.getElementById('companyName').value || 'Yararlanıcı kurum';

        const monthlySales = parseFloat(document.getElementById('monthlySales').value) || 0;
        const avgBill = parseFloat(document.getElementById('avgBill').value) || 1;
        const avgMonthlyWage = parseFloat(document.getElementById('avgMonthlyWage').value) || 0;
        const workingDays = parseInt(document.getElementById('workingDays').value) || 6;
        const targetPercent = parseFloat(document.getElementById('targetLaborPercent').value) || 25;
        const vacationType = document.getElementById('vacationDistribution').value;

        let totalEmployees = 0;
        let totalShiftHours = 0;
        const shiftsDetail = [];
        for (let i = 1; i <= shiftCount; i++) {
            const emp = parseInt(document.getElementById(`shiftEmployees${i}`)?.value) || 0;
            const hours = parseFloat(document.getElementById(`shiftHours${i}`)?.value) || 0;
            totalEmployees += emp;
            totalShiftHours += emp * hours;
            shiftsDetail.push({ shift: i, employees: emp, hours: hours });
        }

        if (totalEmployees === 0 || totalShiftHours === 0) {
            alert('Lütfen her vardiya için çalışan sayısı ve saat bilgilerini girin.');
            return;
        }

        const weeksPerMonth = 4.33;
        const daysPerMonth = workingDays * weeksPerMonth;

        const monthlyLaborCost = totalEmployees * avgMonthlyWage;
        const laborPercent = monthlySales ? (monthlyLaborCost / monthlySales) * 100 : 0;

        const salesPerEmployee = totalEmployees ? monthlySales / totalEmployees : 0;
        const dailyLaborCost = daysPerMonth ? monthlyLaborCost / daysPerMonth : 0;
        const avgHoursPerEmployee = totalEmployees ? totalShiftHours / totalEmployees : 0;
        const expectedCustomers = monthlySales / avgBill;
        const customersPerEmployee = totalEmployees ? expectedCustomers / totalEmployees : 0;

        const idealMin = targetPercent - 5;
        const idealMax = targetPercent + 5;
        let alertClass = '', alertMessage = '';
        if (laborPercent < idealMin) {
            alertClass = 'alert-warning';
            alertMessage = `⚠️ İşgücü oranı (${laborPercent.toFixed(1)}%) hedeflenen seviyenin (${targetPercent}%) altında. Çalışan sayısı yetersiz olabilir.`;
        } else if (laborPercent > idealMax) {
            alertClass = 'alert-danger';
            alertMessage = `🔴 İşgücü oranı (${laborPercent.toFixed(1)}%) ideal seviyenin (${targetPercent}%) üzerinde. Bu durum maaşlarda israf olduğunu gösterir.`;
        } else {
            alertClass = 'alert-success';
            alertMessage = `✅ İşgücü oranı (${laborPercent.toFixed(1)}%) ideal aralıkta (${idealMin}-${idealMax}%).`;
        }

        let efficiencyRating = '';
        if (laborPercent < 20) efficiencyRating = 'Mükemmel';
        else if (laborPercent <= 30) efficiencyRating = 'İyi';
        else if (laborPercent <= 35) efficiencyRating = 'Yüksek';
        else efficiencyRating = 'Risk';

        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('initialMessage').style.display = 'none';

        document.getElementById('resultsGrid').innerHTML = `
            <div class="result-card"><i class="fas fa-user-friends"></i><div class="label">Toplam Çalışan</div><div class="value">${totalEmployees}</div><div class="unit">kişi</div></div>
            <div class="result-card"><i class="fas fa-money-bill-wave"></i><div class="label">Aylık İşgücü Maliyeti</div><div class="value">${currency}${monthlyLaborCost.toLocaleString()}</div><div class="unit">yaklaşık</div></div>
            <div class="result-card"><i class="fas fa-percent"></i><div class="label">İşgücü Oranı</div><div class="value">${laborPercent.toFixed(1)}%</div><div class="unit">satışa göre</div></div>
            <div class="result-card"><i class="fas fa-chart-bar"></i><div class="label">Çalışan Başı Satış</div><div class="value">${currency}${salesPerEmployee.toFixed(0)}</div><div class="unit">aylık</div></div>
            <div class="result-card"><i class="fas fa-sun"></i><div class="label">Günlük İşgücü Maliyeti</div><div class="value">${currency}${dailyLaborCost.toFixed(0)}</div><div class="unit">günlük</div></div>
            <div class="result-card"><i class="fas fa-hourglass-half"></i><div class="label">Ortalama Çalışma Saati</div><div class="value">${avgHoursPerEmployee.toFixed(1)}</div><div class="unit">saat/çalışan/gün</div></div>
            <div class="result-card"><i class="fas fa-users"></i><div class="label">Beklenen Müşteri</div><div class="value">${Math.round(expectedCustomers)}</div><div class="unit">müşteri/ay</div></div>
            <div class="result-card"><i class="fas fa-user-check"></i><div class="label">Çalışan Başı Müşteri</div><div class="value">${customersPerEmployee.toFixed(0)}</div><div class="unit">müşteri/çalışan</div></div>
            <div class="result-card"><i class="fas fa-tachometer-alt"></i><div class="label">Verimlilik Endeksi</div><div class="value">${efficiencyRating}</div><div class="unit">${laborPercent.toFixed(1)}%</div></div>
        `;

        document.getElementById('evaluationAlert').innerHTML = `<div class="alert ${alertClass}">${alertMessage}</div>`;

        let suggestions = '';
        if (laborPercent > idealMax) {
            suggestions += '<li>Yoğun olmayan saatlerde çalışan sayısını azaltın (yoğunluk analizi yapın).</li>';
            suggestions += '<li>Bazı görevleri birleştirin veya çok yetenekli personel kullanın.</li>';
            suggestions += '<li>Çalışan sayısını değiştirmeden satışları artırmak için pazarlama yapın.</li>';
        } else if (laborPercent < idealMin) {
            suggestions += '<li>Müşteri hizmetlerini iyileştirmek için çalışan sayısını artırmanız gerekebilir.</li>';
            suggestions += '<li>Hedeflenen satışların gerçekçi olup olmadığını kontrol edin.</li>';
        } else {
            suggestions += '<li>Mevcut dağılım iyi, performansı izlemeye devam edin.</li>';
        }

        if (vacationType === 'staggered') {
            suggestions += '<li>Kademeli izin sistemi tüm günlerde kapsama sağlar. Bu sistemi sürdürmeniz önerilir.</li>';
        } else {
            suggestions += '<li>Tek tip izin, tatil günlerinde eksikliğe neden olabilir. Kademeli izin sistemini değerlendirin.</li>';
        }

        const shiftAnalysis = shiftsDetail.map(s => `Vardiya ${s.shift}: ${s.employees} çalışan, ${s.hours} saat.`).join('<br>');
        suggestions += '<br><strong>Mevcut vardiya dağılımı:</strong><br>' + shiftAnalysis;

        document.getElementById('suggestions').innerHTML = `<h4><i class="fas fa-lightbulb"></i> Atıkları Azaltmak ve Verimliliği Artırmak İçin Öneriler</h4><ul>${suggestions}</ul>`;

        const ctx = document.getElementById('laborChart').getContext('2d');
        if (laborChart) laborChart.destroy();
        laborChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Aylık Satış', 'İşgücü Maliyeti'],
                datasets: [{
                    label: `Değer (${currency})`,
                    data: [monthlySales, monthlyLaborCost],
                    backgroundColor: ['#28a745', '#b8860b']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: true, ticks: { color: '#aab7d4' } },
                    x: { ticks: { color: '#aab7d4' } }
                },
                plugins: {
                    legend: { labels: { color: '#cfa776' } }
                }
            }
        });

        globalLaborData = {
            currency, companyName,
            monthlySales, avgBill, avgMonthlyWage, workingDays,
            targetPercent, vacationType: vacationType === 'staggered' ? 'Kademeli izin' : 'Tüm çalışanlar aynı izin',
            totalEmployees, totalShiftHours, monthlyLaborCost, laborPercent,
            salesPerEmployee, dailyLaborCost, avgHoursPerEmployee,
            expectedCustomers, customersPerEmployee, efficiencyRating,
            alertMessage, suggestionsHtml: suggestions, shiftsDetail,
            idealMin, idealMax
        };
    });

    // ================================================================
    // ========== Excel Dışa Aktar ==========
    // ================================================================
    document.getElementById('exportExcelBtn').addEventListener('click', async function() {
        if (!globalLaborData) { alert('Lütfen önce analizi yapın.'); return; }
        showLoading('Excel raporu oluşturuluyor...', 'Sayfalar ve grafikler oluşturuluyor');
        try {
            const D = globalLaborData;
            const currency = D.currency;
            const companyName = D.companyName;

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
            mh(cv,1,4,4,`İşgücü Maliyet Analiz Raporu\n${companyName}`,DB,GL,18);
            const inf=[['📋 Kurum',companyName],['📅 Tarih',new Date().toLocaleDateString('tr-TR')],['💰 Para Birimi',currency],['📊 İşgücü Oranı',`${D.laborPercent.toFixed(1)}%`],['👥 Toplam Çalışan',D.totalEmployees]];
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
            mh(inputsSheet,2,4,2,'Temel Veriler',SB,'FFFFFFFF',11);
            inputsSheet.getRow(2).height=28;
            const inputFields = [
                ['Hedeflenen Aylık Satış', D.monthlySales, `${currency} ${D.monthlySales.toFixed(0)}`],
                ['Müşteri Başı Ortalama Fiş', D.avgBill, `${currency} ${D.avgBill}`],
                ['Çalışan Başı Ortalama Aylık Maaş', D.avgMonthlyWage, `${currency} ${D.avgMonthlyWage}`],
                ['Haftalık Çalışma Günü', D.workingDays, ''],
                ['Hedeflenen İşgücü Oranı', `${D.targetPercent}%`, ''],
                ['Vardiya Sayısı', D.shiftsDetail.length, ''],
                ['İzin Sistemi', D.vacationType, '']
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

            // 3. Vardiya detayları
            const shiftsSheet = workbook.addWorksheet('Vardiya Detayları', { views: [{ rightToLeft: true, showGridLines: false }] });
            shiftsSheet.getColumn(1).width=5; shiftsSheet.getColumn(2).width=20; shiftsSheet.getColumn(3).width=25; shiftsSheet.getColumn(4).width=25; shiftsSheet.getColumn(5).width=5;
            mh(shiftsSheet,1,5,1,'🕒 Vardiya Detayları',DB,GL,14);
            shiftsSheet.getRow(1).height=40;
            shiftsSheet.addRow(['Vardiya', 'Çalışan Sayısı', 'Vardiya Saati', 'Toplam Çalışma Saati']);
            D.shiftsDetail.forEach(s => { shiftsSheet.addRow([s.shift, s.employees, s.hours, s.employees * s.hours]); });
            const shiftHeader = shiftsSheet.getRow(2);
            shiftHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            shiftHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };

            // 4. KPI
            const kpiSheet = workbook.addWorksheet('Temel Göstergeler', { views: [{ rightToLeft: true, showGridLines: false }] });
            [5,32,22,22,22,5].forEach((w,i)=>kpiSheet.getColumn(i+1).width=w);
            mh(kpiSheet,1,6,1,'📊 Temel Göstergeler',DB,GL,15);
            kpiSheet.getRow(1).height=45;
            mh(kpiSheet,2,5,2,`${companyName} | ${new Date().toLocaleDateString('tr-TR')}`,HB,'FFFFFFFF',10);
            kpiSheet.getRow(2).height=26;
            const kpis = [
                { label: 'İşgücü Oranı', value: `${D.laborPercent.toFixed(1)}%`, good: D.laborPercent >= D.idealMin && D.laborPercent <= D.idealMax },
                { label: 'Aylık İşgücü Maliyeti', value: `${currency} ${D.monthlyLaborCost.toFixed(0)}`, good: true },
                { label: 'Çalışan Başı Satış', value: `${currency} ${D.salesPerEmployee.toFixed(0)}`, good: true },
                { label: 'Ortalama Çalışma Saati', value: `${D.avgHoursPerEmployee.toFixed(1)} saat`, good: true },
                { label: 'Çalışan Başı Müşteri', value: D.customersPerEmployee.toFixed(0), good: true }
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
            kFinal.value=D.laborPercent >= D.idealMin && D.laborPercent <= D.idealMax ? '✅ Oran ideal aralıkta' : '⚠️ Oran ideal aralığın dışında';
            kFinal.font={name:'Arial',bold:true,size:13,color:{argb:D.laborPercent >= D.idealMin && D.laborPercent <= D.idealMax?PT:'856404'}};
            kFinal.fill={type:'pattern',pattern:'solid',fgColor:{argb:D.laborPercent >= D.idealMin && D.laborPercent <= D.idealMax?PB:GB}};
            kFinal.alignment={horizontal:'center',vertical:'middle',readingOrder:'rtl'};
            kFinal.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};
            kpiSheet.getRow(kRow).height=40;

            // 5. Grafik
            const chartsSheet = workbook.addWorksheet('Grafik', { views: [{ rightToLeft: true, showGridLines: false }] });
            chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
            mh(chartsSheet,1,3,1,'📈 Satış ve İşgücü Maliyeti',DB,GL,14);
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

            // 6. Öneriler
            const recSheet = workbook.addWorksheet('Öneriler', { views: [{ rightToLeft: true, showGridLines: false }] });
            recSheet.getColumn(1).width=5; recSheet.getColumn(2).width=50; recSheet.getColumn(3).width=5;
            mh(recSheet,1,3,1,'💡 Öneriler',DB,GL,14);
            recSheet.getRow(1).height=40;
            recSheet.getCell(3,2).value = D.suggestionsHtml.replace(/<[^>]*>/g, '\n').replace(/•/g, '-');
            recSheet.getCell(3,2).font = { name: 'Arial', size: 11 };
            recSheet.getCell(3,2).alignment = { wrapText: true, readingOrder: 'rtl' };

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const now = new Date();
            const fileName = `Isgucu_Raporu_${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert('Excel hatası: ' + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== Word Dışa Aktar ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (!globalLaborData) { alert('Lütfen önce analizi yapın.'); return; }
        showLoading('Word raporu oluşturuluyor...', 'Veriler ve grafikler toplanıyor');
        try {
            const D = globalLaborData;
            const currency = D.currency;
            const companyName = D.companyName;
            const now = new Date();
            const dateStr = now.toLocaleDateString('tr-TR');

            const chartContainer = document.querySelector('.chart-container');
            let chartImgBase64 = '';
            if (chartContainer) {
                const origBg = chartContainer.style.backgroundColor;
                chartContainer.style.backgroundColor = '#ffffff';
                const img = await html2canvas(chartContainer, { scale: 2, backgroundColor: '#ffffff' });
                chartContainer.style.backgroundColor = origBg;
                chartImgBase64 = img.toDataURL('image/png');
            }

            const kpiCards = document.querySelectorAll('.result-card');
            let kpiRows = ''; let row = ''; let count = 0;
            kpiCards.forEach((card, index) => {
                const icon = card.querySelector('i') ? card.querySelector('i').outerHTML : '';
                const label = card.querySelector('.label') ? card.querySelector('.label').innerText : '';
                const value = card.querySelector('.value') ? card.querySelector('.value').innerText : '';
                const unit = card.querySelector('.unit') ? card.querySelector('.unit').innerText : '';
                const cell = `<td style="border:1px solid #b8860b; padding:12px; text-align:center; background:#fefcf6;">${icon}<div style="font-weight:700; color:#666;">${label}</div><div style="font-size:1.5rem; font-weight:900; color:#b8860b;">${value}</div><div style="font-size:0.85rem; color:#777;">${unit}</div></td>`;
                row += cell; count++;
                if (count % 2 === 0 || index === kpiCards.length - 1) { kpiRows += `<tr>${row}</tr>`; row = ''; }
            });

            const fullHtml = `<!DOCTYPE html>
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
            <head><meta charset='utf-8'><title>İşgücü Maliyet Raporu - FAROUK GRUP</title>
            <style>
                body{font-family:'Arial','Tajawal',sans-serif;direction:rtl;margin:2rem;background:#fff;color:#333;}
                .cover{text-align:center;border-bottom:4px solid #b8860b;margin-bottom:30px;padding-bottom:20px;}
                .cover h1{font-size:32px;color:#b8860b;margin:0;}
                .cover h2{font-size:24px;color:#b48554;margin:5px 0;}
                table{width:100%;border-collapse:collapse;margin:20px 0;} th,td{border:1px solid #b8860b;padding:8px;text-align:center;}
                th{background:#fefcf6;color:#b8860b;}
                .chart-img{max-width:100%;border:1px solid #b8860b;border-radius:10px;margin:20px 0;}
                .footer{text-align:center;margin-top:40px;color:#888;border-top:1px dashed #b8860b;padding-top:10px;}
            </style></head>
            <body>
                <div class="cover">
                    <h1>FAROUK GRUP</h1>
                    <h2>İdeal İşgücü Maliyet Analiz Raporu</h2>
                    <p>Kurum: ${companyName} | Tarih: ${dateStr}</p>
                    <p>Para Birimi: ${currency} | İşgücü Oranı: ${D.laborPercent.toFixed(1)}%</p>
                </div>
                <h2 style="color:#b8860b;">Temel Girdiler</h2>
                <table><tbody>
                    <tr><th>Aylık Satış</th><td>${currency} ${D.monthlySales}</td><th>Ortalama Fiş</th><td>${currency} ${D.avgBill}</td></tr>
                    <tr><th>Ortalama Aylık Maaş</th><td>${currency} ${D.avgMonthlyWage}</td><th>Çalışma Günü</th><td>${D.workingDays}</td></tr>
                    <tr><th>Hedeflenen İşgücü Oranı</th><td>${D.targetPercent}%</td><th>Vardiya Sayısı</th><td>${D.shiftsDetail.length}</td></tr>
                </tbody></table>
                <h2 style="color:#b8860b;">📊 Temel Göstergeler</h2>
                <table>${kpiRows}</table>
                <h2 style="color:#b8860b;">📈 Grafik</h2>
                <div style="text-align:center;"><img src="${chartImgBase64}" class="chart-img" /></div>
                <h2 style="color:#b8860b;">💡 Öneriler</h2>
                <div style="background:#fefcf6;padding:15px;border-radius:10px;border-right:4px solid #b8860b;">
                    <ul>${D.suggestionsHtml}</ul>
                </div>
                <div class="footer">FAROUK GRUP tarafından oluşturulmuştur © ${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Isgucu_Raporu_${companyName}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert('Word hatası: ' + err.message); } finally { hideLoading(); }
    });

    // ===== Başlangıç =====
    renderShifts();
