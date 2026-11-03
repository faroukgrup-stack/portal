
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

    // ===== Temel veriler =====
    let dishes = [];
    let menuChartInstance = null;

    // ===== Yemek yönetimi =====
    function renderDishesTable() {
        const container = document.getElementById('dishesTableContainer');
        const tbody = document.getElementById('dishesTableBody');
        if (dishes.length === 0) {
            container.style.display = 'none';
            return;
        }
        container.style.display = 'block';
        tbody.innerHTML = '';
        dishes.forEach((dish, idx) => {
            const margin = dish.price - dish.cost;
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${idx+1}</td>
                <td>${dish.name}</td>
                <td>${dish.price.toFixed(2)}</td>
                <td>${dish.cost.toFixed(2)}</td>
                <td>${margin.toFixed(2)}</td>
                <td>${dish.units}</td>
                <td><button class="btn-danger" style="padding:0.15rem 0.6rem;border-radius:30px;font-size:0.7rem;" onclick="removeDish(${idx})"><i class="fas fa-times"></i></button></td>
            `;
            tbody.appendChild(tr);
        });
    }

    function addDish() {
        const name = document.getElementById('dishName').value.trim();
        const price = parseFloat(document.getElementById('dishPrice').value);
        const cost = parseFloat(document.getElementById('dishCost').value);
        const units = parseInt(document.getElementById('dishUnits').value);
        if (!name || isNaN(price) || isNaN(cost) || isNaN(units) || price <= 0 || cost < 0 || units < 0) {
            alert('Lütfen geçerli veriler girin (Ad, Fiyat >0, Maliyet >=0, Satış >=0)');
            return;
        }
        dishes.push({ name, price, cost, units });
        renderDishesTable();
        document.getElementById('dishName').value = '';
        document.getElementById('dishPrice').value = '';
        document.getElementById('dishCost').value = '';
        document.getElementById('dishUnits').value = '';
        document.getElementById('resultsArea').style.display = 'none';
        document.getElementById('initialMessage').style.display = 'block';
    }

    function removeDish(index) {
        if (confirm('Bu yemeği silmek istediğinize emin misiniz?')) {
            dishes.splice(index, 1);
            renderDishesTable();
            document.getElementById('resultsArea').style.display = 'none';
            document.getElementById('initialMessage').style.display = 'block';
        }
    }

    function clearAllDishes() {
        if (dishes.length === 0) return;
        if (confirm('Tüm yemekler silinecek. Emin misiniz?')) {
            dishes = [];
            renderDishesTable();
            document.getElementById('resultsArea').style.display = 'none';
            document.getElementById('initialMessage').style.display = 'block';
        }
    }

    document.getElementById('addDishBtn').addEventListener('click', addDish);
    document.getElementById('clearDishesBtn').addEventListener('click', clearAllDishes);

    document.querySelectorAll('#dishName, #dishPrice, #dishCost, #dishUnits').forEach(input => {
        input.addEventListener('keypress', e => { if (e.key === 'Enter') addDish(); });
    });

    // ===== Excel'den içe aktar =====
    document.getElementById('importExcelBtn').addEventListener('click', function() {
        const fileInput = document.getElementById('excelFileInput');
        if (fileInput.files.length === 0) {
            alert('Lütfen önce bir Excel dosyası seçin.');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
                let imported = 0;
                for (let i = 0; i < jsonData.length; i++) {
                    const row = jsonData[i];
                    if (row.length < 4) continue;
                    const name = String(row[0]).trim();
                    const price = parseFloat(row[1]);
                    const cost = parseFloat(row[2]);
                    const units = parseInt(row[3]);
                    if (!name || isNaN(price) || isNaN(cost) || isNaN(units) || price <= 0 || cost < 0 || units < 0) continue;
                    dishes.push({ name, price, cost, units });
                    imported++;
                }
                if (imported === 0) {
                    alert('Veri içe aktarılamadı. Sütunların: Ad, Fiyat, Maliyet, Satış (ilk 4 sütun) olduğundan emin olun.');
                } else {
                    renderDishesTable();
                    document.getElementById('resultsArea').style.display = 'none';
                    document.getElementById('initialMessage').style.display = 'block';
                    alert(`${imported} yemek başarıyla içe aktarıldı.`);
                }
            } catch (err) {
                alert('Dosya okunurken hata oluştu: ' + err.message);
            }
        };
        reader.readAsArrayBuffer(fileInput.files[0]);
        fileInput.value = '';
    });

    document.getElementById('downloadTemplateBtn').addEventListener('click', function() {
        const wb = XLSX.utils.book_new();
        const data = [['Yemek Adı', 'Satış Fiyatı', 'Maliyet', 'Satış Adedi'], ['Örnek Yemek', 25, 12.5, 150]];
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Menü');
        XLSX.writeFile(wb, 'Menü_Şablonu.xlsx');
    });

    // ===== Analiz (BCG Matrisi) =====
    function analyzeMenu() {
        if (dishes.length < 2) {
            alert('Analiz için en az iki yemek ekleyin.');
            return;
        }

        const totalUnits = dishes.reduce((sum, d) => sum + d.units, 0);
        const avgProfit = dishes.reduce((sum, d) => sum + (d.price - d.cost), 0) / dishes.length;
        const avgPopularity = 100 / dishes.length;

        const results = dishes.map((dish) => {
            const margin = dish.price - dish.cost;
            const popularity = totalUnits > 0 ? (dish.units / totalUnits) * 100 : 0;
            const isProfitable = margin >= avgProfit;
            const isPopular = popularity >= avgPopularity;
            let category, recommendation, badgeClass;
            if (isProfitable && isPopular) {
                category = 'Yıldız (Star)';
                badgeClass = 'badge-star';
                recommendation = '✅ Tanıtıma devam edin, kaliteyi koruyun ve fiyatı sabitleyin. Ana kâr kaynağı olarak değerlendirin.';
            } else if (isProfitable && !isPopular) {
                category = 'Sorgu İşareti (Question Mark)';
                badgeClass = 'badge-question';
                recommendation = '❓ Pazarlamayı iyileştirin, talebi artırmak için fiyatı değiştirin veya promosyonlar sunun. Dikkatli yatırım yapın.';
            } else if (!isProfitable && isPopular) {
                category = 'Nakit İnek (Cash Cow)';
                badgeClass = 'badge-cash';
                recommendation = '🐄 Marjı iyileştirmek için fiyatı hafifçe yükseltin veya maliyeti düşürün. Satışları koruyarak kârlılığı artırın.';
            } else {
                category = 'Köpek (Dog)';
                badgeClass = 'badge-dog';
                recommendation = '🐕 Silmeyi, yeniden tasarlamayı veya malzemelerini değiştirmeyi düşünün. Stratejik değeri yoksa kaldırın.';
            }
            return { ...dish, margin, popularity, category, badgeClass, recommendation };
        });

        document.getElementById('initialMessage').style.display = 'none';
        document.getElementById('resultsArea').style.display = 'block';

        const categories = {
            'Yıldız (Star)': 0,
            'Sorgu İşareti (Question Mark)': 0,
            'Nakit İnek (Cash Cow)': 0,
            'Köpek (Dog)': 0
        };
        let totalRevenue = 0, totalCost = 0;
        results.forEach(r => {
            categories[r.category] = (categories[r.category] || 0) + 1;
            totalRevenue += r.price * r.units;
            totalCost += r.cost * r.units;
        });
        const totalProfit = totalRevenue - totalCost;

        document.getElementById('summaryCards').innerHTML = `
            <div class="summary-card"><div class="number">${results.length}</div><div class="label">Yemek Sayısı</div></div>
            <div class="summary-card"><div class="number">${categories['Yıldız (Star)']}</div><div class="label">Yıldızlar ⭐</div></div>
            <div class="summary-card"><div class="number">${categories['Sorgu İşareti (Question Mark)']}</div><div class="label">Sorgu İşaretleri ❓</div></div>
            <div class="summary-card"><div class="number">${categories['Nakit İnek (Cash Cow)']}</div><div class="label">Nakit İnekler 🐄</div></div>
            <div class="summary-card"><div class="number">${categories['Köpek (Dog)']}</div><div class="label">Köpekler 🐕</div></div>
            <div class="summary-card"><div class="number">${totalRevenue.toFixed(0)}</div><div class="label">Toplam Gelir</div></div>
            <div class="summary-card"><div class="number">${totalProfit.toFixed(0)}</div><div class="label">Net Kâr</div></div>
        `;

        let recHtml = `<table><thead><tr><th>Yemek</th><th>Kâr Marjı</th><th>Satış Oranı</th><th>BCG Sınıflandırması</th><th>Öneri</th></tr></thead><tbody>`;
        results.forEach(r => {
            recHtml += `<tr>
                <td>${r.name}</td>
                <td>${r.margin.toFixed(2)}</td>
                <td>${r.popularity.toFixed(1)}%</td>
                <td><span class="badge ${r.badgeClass}">${r.category}</span></td>
                <td class="recommendation">${r.recommendation}</td>
            </tr>`;
        });
        recHtml += '</tbody></table>';
        document.getElementById('recommendationsTable').innerHTML = recHtml;

        const ctx = document.getElementById('menuChart').getContext('2d');
        if (menuChartInstance) menuChartInstance.destroy();

        const colors = results.map(r => {
            if (r.category.includes('Yıldız')) return '#28a745';
            if (r.category.includes('Sorgu')) return '#ffc107';
            if (r.category.includes('Nakit')) return '#17a2b8';
            return '#dc3545';
        });

        menuChartInstance = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Yemekler',
                    data: results.map((r, i) => ({ x: r.popularity, y: r.margin })),
                    backgroundColor: colors,
                    pointRadius: 10,
                    pointHoverRadius: 14,
                    pointBorderColor: 'white',
                    borderWidth: 2,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const r = results[context.dataIndex];
                                return `${r.name} (${r.category})`;
                            }
                        }
                    },
                    legend: { display: false }
                },
                scales: {
                    x: {
                        title: { display: true, text: 'Popülerlik (Satış Oranı %)', color: '#aab7d4' },
                        ticks: { color: '#aab7d4' },
                        grid: { color: 'rgba(180,133,84,0.15)' },
                        beginAtZero: true
                    },
                    y: {
                        title: { display: true, text: 'Kâr Marjı (Para Birimi)', color: '#aab7d4' },
                        ticks: { color: '#aab7d4' },
                        grid: { color: 'rgba(180,133,84,0.15)' },
                        beginAtZero: true
                    }
                }
            }
        });

        window.lastMenuResults = { results, avgProfit, avgPopularity, totalRevenue, totalCost, totalProfit, categories };
    }

    document.getElementById('analyzeBtn').addEventListener('click', analyzeMenu);

    // ================================================================
    // ========== Profesyonel Excel Dışa Aktar ==========
    // ================================================================
    document.getElementById('exportExcelBtn').addEventListener('click', async function() {
        if (!window.lastMenuResults) { alert('Lütfen önce analiz yapın ("Menüyü Analiz Et").'); return; }
        showLoading('Profesyonel Excel raporu oluşturuluyor...', 'Sayfalar ve grafikler oluşturuluyor');
        try {
            const res = window.lastMenuResults;
            const currency = document.getElementById('currencySelect').value;
            const companyName = document.getElementById('companyName').value || 'Kurum';

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

            // 1. Kapak sayfası
            const cv = workbook.addWorksheet('Rapor Kapağı', { views: [{ rightToLeft: true, showGridLines: false }] });
            [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
            cv.getRow(2).height=80; cv.getRow(4).height=60;
            cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1);
            bc.value='FAROUK GRUP\nDanışmanlık ve İşletme';
            bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:'rtl'};
            mh(cv,1,4,4,`Menü Mühendisliği Raporu\n${companyName}`,DB,GL,18);
            const inf=[['📋 Kurum',companyName],['📅 Tarih',new Date().toLocaleDateString('tr-TR')],['💰 Para Birimi',currency],['📊 Yemek Sayısı',res.results.length],['⭐ Yıldız Sayısı',res.categories['Yıldız (Star)']]];
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
            const inputsSheet = workbook.addWorksheet('Girdiler', { views: [{ rightToLeft: true, showGridLines: false }] });
            inputsSheet.getColumn(1).width=5; inputsSheet.getColumn(2).width=30; inputsSheet.getColumn(3).width=20; inputsSheet.getColumn(4).width=20; inputsSheet.getColumn(5).width=20; inputsSheet.getColumn(6).width=5;
            mh(inputsSheet,1,6,1,'📋 Yemek Listesi',DB,GL,14);
            inputsSheet.getRow(1).height=40;
            const headerRow = inputsSheet.getRow(3);
            ['#','Yemek','Satış Fiyatı','Maliyet','Satış Adedi'].forEach((h,i)=>{const c=headerRow.getCell(i+2);c.value=h;ap(c,hs(HB,GL));});
            dishes.forEach((d,idx)=>{
                const r=idx+4;
                inputsSheet.getRow(r).height=24;
                const bg=idx%2===0?AR:'FFFEFCF6';
                [idx+1, d.name, d.price, d.cost, d.units].forEach((val,j)=>{
                    const c=inputsSheet.getCell(r,j+2);c.value=val;
                    ap(c,{...cs(bg,DT,false,'center'),numFmt:typeof val==='number'?nc:null});
                });
            });

            // 3. BCG Matrisi
            const matrixSheet = workbook.addWorksheet('BCG Matrisi', { views: [{ rightToLeft: true, showGridLines: false }] });
            matrixSheet.getColumn(1).width=5; matrixSheet.getColumn(2).width=25; matrixSheet.getColumn(3).width=18; matrixSheet.getColumn(4).width=18; matrixSheet.getColumn(5).width=18; matrixSheet.getColumn(6).width=16; matrixSheet.getColumn(7).width=40; matrixSheet.getColumn(8).width=5;
            mh(matrixSheet,1,8,1,'📊 BCG Matrisi Analizi',DB,GL,14);
            matrixSheet.getRow(1).height=40;
            const mHeaders = ['Yemek','Kâr Marjı','Satış Oranı','Sınıflandırma','Öneri'];
            const mRow = matrixSheet.getRow(3);
            mHeaders.forEach((h,i)=>{const c=mRow.getCell(i+2);c.value=h;ap(c,hs(HB,GL));});
            res.results.forEach((r,idx)=>{
                const row=idx+4;
                matrixSheet.getRow(row).height=24;
                const bg=idx%2===0?AR:'FFFEFCF6';
                const catColor = r.category.includes('Yıldız')?'FF28A745':r.category.includes('Sorgu')?'FFD39C0B':r.category.includes('Nakit')?'FF17A2B8':'FFDC3545';
                [r.name, r.margin, r.popularity, r.category, r.recommendation].forEach((val,j)=>{
                    const c=matrixSheet.getCell(row,j+2);c.value=val;
                    ap(c,{...cs(bg,DT,false,j===3?'center':'right'),numFmt:typeof val==='number'?nc:null});
                    if(j===3){c.font={name:'Arial',bold:true,size:10,color:{argb:catColor}};}
                });
            });

            // 4. Özet
            const summarySheet = workbook.addWorksheet('Özet', { views: [{ rightToLeft: true, showGridLines: false }] });
            summarySheet.getColumn(1).width=5; summarySheet.getColumn(2).width=30; summarySheet.getColumn(3).width=25; summarySheet.getColumn(4).width=5;
            mh(summarySheet,1,4,1,'📊 Analiz Özeti',DB,GL,14);
            summarySheet.getRow(1).height=40;
            const sumData = [
                ['Yemek Sayısı', res.results.length],
                ['Yıldızlar (Stars)', res.categories['Yıldız (Star)']],
                ['Sorgu İşaretleri (Question Marks)', res.categories['Sorgu İşareti (Question Mark)']],
                ['Nakit İnekler (Cash Cows)', res.categories['Nakit İnek (Cash Cow)']],
                ['Köpekler (Dogs)', res.categories['Köpek (Dog)']],
                ['Toplam Gelir', `${currency} ${res.totalRevenue.toFixed(0)}`],
                ['Toplam Maliyet', `${currency} ${res.totalCost.toFixed(0)}`],
                ['Net Kâr', `${currency} ${res.totalProfit.toFixed(0)}`]
            ];
            summarySheet.addRow(['Gösterge','Değer']);
            sumData.forEach(row=>summarySheet.addRow(row));
            summarySheet.getRow(2).font={bold:true,color:{argb:'FFFFFFFF'}};
            summarySheet.getRow(2).fill={type:'pattern',pattern:'solid',fgColor:{argb:G}};

            // 5. Grafikler
            const chartsSheet = workbook.addWorksheet('Grafikler', { views: [{ rightToLeft: true, showGridLines: false }] });
            chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
            mh(chartsSheet,1,3,1,'📈 Grafik (BCG Matrisi)',DB,GL,14);
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
                    chartsSheet.addImage(imageId, { tl: { col: 1, row: 2 }, br: { col: 2, row: 25 }, editAs: 'oneCell' });
                } catch(err) {}
            }

            // 6. Öneriler
            const recSheet = workbook.addWorksheet('Stratejik Öneriler', { views: [{ rightToLeft: true, showGridLines: false }] });
            recSheet.getColumn(1).width=5; recSheet.getColumn(2).width=50; recSheet.getColumn(3).width=5;
            mh(recSheet,1,3,1,'💡 Stratejik Öneriler',DB,GL,14);
            recSheet.getRow(1).height=40;
            const starCount = res.categories['Yıldız (Star)'];
            const dogCount = res.categories['Köpek (Dog)'];
            const recs = [
                { title: '⭐ Yıldızlar', content: `Yıldız sayısı: ${starCount}. Tanıtıma devam edin ve fiyatları sabitleyin. Bu yemekler ana kâr kaynağıdır.` },
                { title: '❓ Sorgu İşaretleri', content: 'Pazarlamayı iyileştirin, fiyatı değiştirin veya promosyonlar sunun. Performansı izleyerek dikkatli yatırım yapın.' },
                { title: '🐄 Nakit İnekler', content: 'Marjı iyileştirmek için fiyatı hafifçe yükseltin veya maliyeti düşürün. Satışları koruyarak kârlılığı artırın.' },
                { title: '🐕 Köpekler', content: `Köpek sayısı: ${dogCount}. Silmeyi veya yeniden tasarlamayı düşünün. Stratejik değeri yoksa kaldırın.` }
            ];
            let itRow=2;
            recs.forEach(sec=>{
                itRow++;
                recSheet.getRow(itRow).height=30;
                recSheet.mergeCells(itRow,2,itRow,2);
                const tc3=recSheet.getCell(itRow,2);
                tc3.value=sec.title;
                tc3.font={name:'Arial',bold:true,size:12,color:{argb:GL}};
                tc3.fill={type:'pattern',pattern:'solid',fgColor:{argb:HB}};
                tc3.alignment={horizontal:'right',vertical:'middle',readingOrder:'rtl'};
                tc3.border={bottom:{style:'medium',color:{argb:G}}};
                itRow++;
                recSheet.getRow(itRow).height=Math.max(40, sec.content.split('\n').length*18);
                recSheet.mergeCells(itRow,2,itRow,2);
                const cc=recSheet.getCell(itRow,2);
                cc.value=sec.content;
                cc.font={name:'Arial',size:10,color:{argb:DT}};
                cc.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFEFCF6'}};
                cc.alignment={horizontal:'right',vertical:'top',wrapText:true,readingOrder:'rtl'};
                cc.border={top:{style:'hair'},bottom:{style:'hair',color:{argb:G}},left:{style:'hair'},right:{style:'hair'}};
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const now = new Date();
            const fileName = `Menu_Muhendisligi_${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert('Excel hatası: ' + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== Profesyonel Word Dışa Aktar ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (!window.lastMenuResults) { alert('Lütfen önce analiz yapın ("Menüyü Analiz Et").'); return; }
        showLoading('Profesyonel Word raporu oluşturuluyor...', 'Veriler ve grafikler toplanıyor');
        try {
            const res = window.lastMenuResults;
            const currency = document.getElementById('currencySelect').value;
            const companyName = document.getElementById('companyName').value || 'Kurum';
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

            let tableRows = '';
            res.results.forEach(r => {
                const badgeColor = r.category.includes('Yıldız')?'#28a745':r.category.includes('Sorgu')?'#ffc107':r.category.includes('Nakit')?'#17a2b8':'#dc3545';
                const textColor = r.category.includes('Yıldız')||r.category.includes('Nakit')?'white':'#111';
                tableRows += `<tr>
                    <td style="border:1px solid #b8860b;padding:8px;text-align:center;">${r.name}</td>
                    <td style="border:1px solid #b8860b;padding:8px;text-align:center;">${r.margin.toFixed(2)}</td>
                    <td style="border:1px solid #b8860b;padding:8px;text-align:center;">${r.popularity.toFixed(1)}%</td>
                    <td style="border:1px solid #b8860b;padding:8px;text-align:center;"><span style="background:${badgeColor};color:${textColor};padding:0.2rem 0.6rem;border-radius:20px;font-weight:700;font-size:0.8rem;">${r.category}</span></td>
                    <td style="border:1px solid #b8860b;padding:8px;text-align:right;font-size:0.85rem;color:#555;">${r.recommendation}</td>
                </tr>`;
            });

            const fullHtml = `<!DOCTYPE html>
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
            <head><meta charset='utf-8'><title>Menü Mühendisliği - FAROUK GRUP</title>
            <style>
                body{font-family:'Arial','Tajawal',sans-serif;direction:rtl;margin:2rem;background:#fff;color:#333;}
                .cover{text-align:center;border-bottom:4px solid #b8860b;margin-bottom:30px;padding-bottom:20px;}
                .cover h1{font-size:32px;color:#b8860b;margin:0;}
                .cover h2{font-size:24px;color:#b48554;margin:5px 0;}
                table{width:100%;border-collapse:collapse;margin:20px 0;} th,td{border:1px solid #b8860b;padding:8px;text-align:center;}
                th{background:#fefcf6;color:#b8860b;font-weight:bold;}
                .chart-img{max-width:100%;border:1px solid #b8860b;border-radius:10px;margin:20px 0;}
                .footer{text-align:center;margin-top:40px;color:#888;border-top:1px dashed #b8860b;padding-top:10px;}
                .summary{background:#fefcf6;padding:15px;border-radius:10px;border-right:4px solid #b8860b;margin:20px 0;}
            </style></head>
            <body>
                <div class="cover">
                    <h1>FAROUK GRUP</h1>
                    <h2>🧮 Menü Mühendisliği Raporu (BCG Matrisi)</h2>
                    <p>Kurum: ${companyName} | Tarih: ${dateStr}</p>
                    <p>Para Birimi: ${currency}</p>
                </div>
                <div class="summary">
                    <h3 style="color:#b8860b;">📊 Analiz Özeti</h3>
                    <p>Yemek Sayısı: <strong>${res.results.length}</strong> | Yıldızlar: <strong>${res.categories['Yıldız (Star)']}</strong> | Sorgu İşaretleri: <strong>${res.categories['Sorgu İşareti (Question Mark)']}</strong> | Nakit İnekler: <strong>${res.categories['Nakit İnek (Cash Cow)']}</strong> | Köpekler: <strong>${res.categories['Köpek (Dog)']}</strong></p>
                    <p>Toplam Gelir: ${currency} ${res.totalRevenue.toFixed(0)} | Net Kâr: ${currency} ${res.totalProfit.toFixed(0)}</p>
                </div>
                <h2 style="color:#b8860b;">📈 Grafik (BCG Matrisi)</h2>
                <div style="text-align:center;"><img src="${chartImgBase64}" class="chart-img" /></div>
                <h2 style="color:#b8860b;">📋 Yemek Analizi</h2>
                <table>
                    <thead><tr><th>Yemek</th><th>Kâr Marjı</th><th>Satış Oranı</th><th>Sınıflandırma</th><th>Öneri</th></tr></thead>
                    <tbody>${tableRows}</tbody>
                </table>
                <h2 style="color:#b8860b;">💡 Stratejik Öneriler</h2>
                <div style="background:#fefcf6;padding:15px;border-radius:10px;border-right:4px solid #b8860b;">
                    <p><strong>⭐ Yıldızlar (${res.categories['Yıldız (Star)']}):</strong> Tanıtıma devam edin ve fiyatları sabitleyin. Ana kâr kaynağıdır.</p>
                    <p><strong>❓ Sorgu İşaretleri (${res.categories['Sorgu İşareti (Question Mark)']}):</strong> Pazarlamayı iyileştirin, fiyatı değiştirin veya promosyonlar sunun.</p>
                    <p><strong>🐄 Nakit İnekler (${res.categories['Nakit İnek (Cash Cow)']}):</strong> Marjı iyileştirmek için fiyatı hafifçe yükseltin veya maliyeti düşürün.</p>
                    <p><strong>🐕 Köpekler (${res.categories['Köpek (Dog)']}):</strong> Silmeyi veya yeniden tasarlamayı düşünün. Stratejik değeri yoksa kaldırın.</p>
                </div>
                <div class="footer">FAROUK GRUP tarafından oluşturulmuştur © ${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Menu_Muhendisligi_${companyName}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert('Word hatası: ' + err.message); } finally { hideLoading(); }
    });

    renderDishesTable();
