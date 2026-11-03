
    AOS.init({ duration: 800, once: true, offset: 100 });

    // ===== آلة حاسبة =====
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
            } catch(e) { calcDisplay.value = 'خطأ'; currentCalcInput = ''; }
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

    // ===== شاشة تحميل =====
    function showLoading(title, msg) {
        document.getElementById('loadingTitle').textContent = title;
        document.getElementById('loadingMsg').textContent = msg;
        document.getElementById('exportLoading').classList.add('show');
    }
    function hideLoading() {
        document.getElementById('exportLoading').classList.remove('show');
    }

    // ===== البيانات الأساسية =====
    let dishes = [];
    let menuChartInstance = null;

    // ===== دوال إدارة الأطباق =====
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
            alert('الرجاء إدخال بيانات صحيحة (اسم، سعر >0، تكلفة >=0، مبيعات >=0)');
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
        if (confirm('هل أنت متأكد من حذف هذا الطبق؟')) {
            dishes.splice(index, 1);
            renderDishesTable();
            document.getElementById('resultsArea').style.display = 'none';
            document.getElementById('initialMessage').style.display = 'block';
        }
    }

    function clearAllDishes() {
        if (dishes.length === 0) return;
        if (confirm('سيتم حذف جميع الأطباق. هل أنت متأكد؟')) {
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

    // ===== استيراد من Excel =====
    document.getElementById('importExcelBtn').addEventListener('click', function() {
        const fileInput = document.getElementById('excelFileInput');
        if (fileInput.files.length === 0) {
            alert('الرجاء اختيار ملف Excel أولاً.');
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
                    alert('لم يتم استيراد أي بيانات. تأكد من أن الأعمدة هي: الاسم، السعر، التكلفة، المبيعات (أول 4 أعمدة).');
                } else {
                    renderDishesTable();
                    document.getElementById('resultsArea').style.display = 'none';
                    document.getElementById('initialMessage').style.display = 'block';
                    alert(`تم استيراد ${imported} طبق بنجاح.`);
                }
            } catch (err) {
                alert('حدث خطأ أثناء قراءة الملف: ' + err.message);
            }
        };
        reader.readAsArrayBuffer(fileInput.files[0]);
        fileInput.value = '';
    });


    // ===== التحليل (مصفوفة BCG) =====
    function analyzeMenu() {
        if (dishes.length < 2) {
            alert('يرجى إضافة على الأقل طبقين للتحليل.');
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
                category = 'نجم (Star)';
                badgeClass = 'badge-star';
                recommendation = '✅ استمر في الترويج، حافظ على الجودة وثبت السعر. اعتبره مصدر الربح الرئيسي.';
            } else if (isProfitable && !isPopular) {
                category = 'علامة استفهام (Question Mark)';
                badgeClass = 'badge-question';
                recommendation = '❓ حسّن التسويق، أو غيّر السعر لزيادة الطلب، أو قدّم عروضاً ترويجية. استثمر بحذر.';
            } else if (!isProfitable && isPopular) {
                category = 'بقرة نقدية (Cash Cow)';
                badgeClass = 'badge-cash';
                recommendation = '🐄 ارفع السعر قليلاً، أو خفّض التكلفة لتحسين الهامش. حافظ على المبيعات مع تحسين الربحية.';
            } else {
                category = 'كلب (Dog)';
                badgeClass = 'badge-dog';
                recommendation = '🐕 فكّر في حذفه، أو أعد تصميمه، أو غيّر مكوناته. إذا لم يكن له قيمة استراتيجية، تخلص منه.';
            }
            return { ...dish, margin, popularity, category, badgeClass, recommendation };
        });

        document.getElementById('initialMessage').style.display = 'none';
        document.getElementById('resultsArea').style.display = 'block';

        const categories = {
            'نجم (Star)': 0,
            'علامة استفهام (Question Mark)': 0,
            'بقرة نقدية (Cash Cow)': 0,
            'كلب (Dog)': 0
        };
        let totalRevenue = 0, totalCost = 0;
        results.forEach(r => {
            categories[r.category] = (categories[r.category] || 0) + 1;
            totalRevenue += r.price * r.units;
            totalCost += r.cost * r.units;
        });
        const totalProfit = totalRevenue - totalCost;

        document.getElementById('summaryCards').innerHTML = `
            <div class="summary-card"><div class="number">${results.length}</div><div class="label">عدد الأطباق</div></div>
            <div class="summary-card"><div class="number">${categories['نجم (Star)']}</div><div class="label">نجوم ⭐</div></div>
            <div class="summary-card"><div class="number">${categories['علامة استفهام (Question Mark)']}</div><div class="label">علامات استفهام ❓</div></div>
            <div class="summary-card"><div class="number">${categories['بقرة نقدية (Cash Cow)']}</div><div class="label">أبقار نقدية 🐄</div></div>
            <div class="summary-card"><div class="number">${categories['كلب (Dog)']}</div><div class="label">كلاب 🐕</div></div>
            <div class="summary-card"><div class="number">${totalRevenue.toFixed(0)}</div><div class="label">الإيرادات</div></div>
            <div class="summary-card"><div class="number">${totalProfit.toFixed(0)}</div><div class="label">صافي الربح</div></div>
        `;

        let recHtml = `<table><thead><tr><th>الطبق</th><th>هامش الربح</th><th>نسبة المبيعات</th><th>التصنيف (BCG)</th><th>التوصية</th></tr></thead><tbody>`;
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
            if (r.category.includes('نجم')) return '#28a745';
            if (r.category.includes('علامة استفهام')) return '#ffc107';
            if (r.category.includes('بقرة')) return '#17a2b8';
            return '#dc3545';
        });

        menuChartInstance = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'الأطباق',
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
                        title: { display: true, text: 'الشعبية (نسبة المبيعات %)', color: '#aab7d4' },
                        ticks: { color: '#aab7d4' },
                        grid: { color: 'rgba(180,133,84,0.15)' },
                        beginAtZero: true
                    },
                    y: {
                        title: { display: true, text: 'هامش الربح (وحدة نقدية)', color: '#aab7d4' },
                        ticks: { color: '#aab7d4' },
                        grid: { color: 'rgba(180,133,84,0.15)' },
                        beginAtZero: true
                    }
                }
            }
        });

        // تخزين النتائج للتصدير
        window.lastMenuResults = { results, avgProfit, avgPopularity, totalRevenue, totalCost, totalProfit, categories };
    }

    document.getElementById('analyzeBtn').addEventListener('click', analyzeMenu);

    // ================================================================
    // ========== تصدير Excel احترافي ==========
    // ================================================================
    document.getElementById('exportExcelBtn').addEventListener('click', async function() {
        if (!window.lastMenuResults) { alert('الرجاء إجراء التحليل أولاً (اضغط على "تحليل القائمة").'); return; }
        showLoading('جاري إنشاء تقرير Excel...', 'إنشاء الأوراق والرسوم');
        try {
            const res = window.lastMenuResults;
            const currency = document.getElementById('currencySelect').value;
            const companyName = document.getElementById('companyName').value || 'الجهة';

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

            // 1. غلاف التقرير
            const cv = workbook.addWorksheet('غلاف التقرير', { views: [{ rightToLeft: true, showGridLines: false }] });
            [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
            cv.getRow(2).height=80; cv.getRow(4).height=60;
            cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1);
            bc.value='مجموعة فاروق للاستشارات والأعمال\nFAROUK GRUP';
            bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:'rtl'};
            mh(cv,1,4,4,`تقرير هندسة قوائم الطعام\n${companyName}`,DB,GL,18);
            const inf=[['📋 الجهة',companyName],['📅 التاريخ',new Date().toLocaleDateString('ar-EG')],['💰 العملة',currency],['📊 عدد الأطباق',res.results.length],['⭐ عدد النجوم',res.categories['نجم (Star)']]];
            let ir=6;
            inf.forEach(([l,v],idx)=>{
                cv.mergeCells(ir,1,ir,2); cv.mergeCells(ir,3,ir,4);
                const lc=cv.getCell(ir,1), vc=cv.getCell(ir,3); lc.value=l; vc.value=v;
                const bg=idx%2===0?AR:'FFFEFCF6';
                ap(lc,{font:{name:'Arial',bold:true,size:11,color:{argb:'00695C'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'right',vertical:'middle',readingOrder:'rtl'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                ap(vc,{font:{name:'Arial',size:11,color:{argb:DT}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',readingOrder:'rtl'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                cv.getRow(ir).height=28; ir++;
            });

            // 2. المدخلات
            const inputsSheet = workbook.addWorksheet('المدخلات', { views: [{ rightToLeft: true, showGridLines: false }] });
            inputsSheet.getColumn(1).width=5; inputsSheet.getColumn(2).width=30; inputsSheet.getColumn(3).width=20; inputsSheet.getColumn(4).width=20; inputsSheet.getColumn(5).width=20; inputsSheet.getColumn(6).width=5;
            mh(inputsSheet,1,6,1,'📋 قائمة الأطباق المدخلة',DB,GL,14);
            inputsSheet.getRow(1).height=40;
            const headerRow = inputsSheet.getRow(3);
            ['#','الطبق','سعر البيع','التكلفة','المبيعات'].forEach((h,i)=>{const c=headerRow.getCell(i+2);c.value=h;ap(c,hs(HB,GL));});
            dishes.forEach((d,idx)=>{
                const r=idx+4;
                inputsSheet.getRow(r).height=24;
                const bg=idx%2===0?AR:'FFFEFCF6';
                [idx+1, d.name, d.price, d.cost, d.units].forEach((val,j)=>{
                    const c=inputsSheet.getCell(r,j+2);c.value=val;
                    ap(c,{...cs(bg,DT,false,'center'),numFmt:typeof val==='number'?nc:null});
                });
            });

            // 3. مصفوفة BCG
            const matrixSheet = workbook.addWorksheet('مصفوفة BCG', { views: [{ rightToLeft: true, showGridLines: false }] });
            matrixSheet.getColumn(1).width=5; matrixSheet.getColumn(2).width=25; matrixSheet.getColumn(3).width=18; matrixSheet.getColumn(4).width=18; matrixSheet.getColumn(5).width=18; matrixSheet.getColumn(6).width=16; matrixSheet.getColumn(7).width=40; matrixSheet.getColumn(8).width=5;
            mh(matrixSheet,1,8,1,'📊 تحليل مصفوفة BCG',DB,GL,14);
            matrixSheet.getRow(1).height=40;
            const mHeaders = ['الطبق','هامش الربح','نسبة المبيعات','التصنيف','التوصية'];
            const mRow = matrixSheet.getRow(3);
            mHeaders.forEach((h,i)=>{const c=mRow.getCell(i+2);c.value=h;ap(c,hs(HB,GL));});
            res.results.forEach((r,idx)=>{
                const row=idx+4;
                matrixSheet.getRow(row).height=24;
                const bg=idx%2===0?AR:'FFFEFCF6';
                const catColor = r.category.includes('نجم')?'FF28A745':r.category.includes('علامة استفهام')?'FFD39C0B':r.category.includes('بقرة')?'FF17A2B8':'FFDC3545';
                [r.name, r.margin, r.popularity, r.category, r.recommendation].forEach((val,j)=>{
                    const c=matrixSheet.getCell(row,j+2);c.value=val;
                    ap(c,{...cs(bg,DT,false,j===3?'center':'right'),numFmt:typeof val==='number'?nc:null});
                    if(j===3){c.font={name:'Arial',bold:true,size:10,color:{argb:catColor}};}
                });
            });

            // 4. ملخص
            const summarySheet = workbook.addWorksheet('ملخص', { views: [{ rightToLeft: true, showGridLines: false }] });
            summarySheet.getColumn(1).width=5; summarySheet.getColumn(2).width=30; summarySheet.getColumn(3).width=25; summarySheet.getColumn(4).width=5;
            mh(summarySheet,1,4,1,'📊 ملخص التحليل',DB,GL,14);
            summarySheet.getRow(1).height=40;
            const sumData = [
                ['عدد الأطباق', res.results.length],
                ['نجوم (Stars)', res.categories['نجم (Star)']],
                ['علامات استفهام (Question Marks)', res.categories['علامة استفهام (Question Mark)']],
                ['أبقار نقدية (Cash Cows)', res.categories['بقرة نقدية (Cash Cow)']],
                ['كلاب (Dogs)', res.categories['كلب (Dog)']],
                ['إجمالي الإيرادات', `${currency} ${res.totalRevenue.toFixed(0)}`],
                ['إجمالي التكاليف', `${currency} ${res.totalCost.toFixed(0)}`],
                ['صافي الربح', `${currency} ${res.totalProfit.toFixed(0)}`]
            ];
            summarySheet.addRow(['المؤشر','القيمة']);
            sumData.forEach(row=>summarySheet.addRow(row));
            summarySheet.getRow(2).font={bold:true,color:{argb:'FFFFFFFF'}};
            summarySheet.getRow(2).fill={type:'pattern',pattern:'solid',fgColor:{argb:G}};

            // 5. الرسوم البيانية
            const chartsSheet = workbook.addWorksheet('الرسوم البيانية', { views: [{ rightToLeft: true, showGridLines: false }] });
            chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
            mh(chartsSheet,1,3,1,'📈 المخطط البياني (مصفوفة BCG)',DB,GL,14);
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

            // 6. التوصيات
            const recSheet = workbook.addWorksheet('التوصيات', { views: [{ rightToLeft: true, showGridLines: false }] });
            recSheet.getColumn(1).width=5; recSheet.getColumn(2).width=50; recSheet.getColumn(3).width=5;
            mh(recSheet,1,3,1,'💡 التوصيات الاستراتيجية',DB,GL,14);
            recSheet.getRow(1).height=40;
            const starCount = res.categories['نجم (Star)'];
            const dogCount = res.categories['كلب (Dog)'];
            const recs = [
                { title: '⭐ النجوم', content: `عدد النجوم: ${starCount}. استمر في الترويج وثبت الأسعار. هذه الأطباق هي مصدر الربح الرئيسي.` },
                { title: '❓ علامات الاستفهام', content: 'حسّن التسويق، غيّر السعر، أو قدّم عروضاً ترويجية. استثمر بحذر مع مراقبة الأداء.' },
                { title: '🐄 الأبقار النقدية', content: 'ارفع السعر قليلاً أو خفّض التكلفة لتحسين الهامش. حافظ على المبيعات مع تحسين الربحية.' },
                { title: '🐕 الكلاب', content: `عدد الكلاب: ${dogCount}. فكّر في حذفها أو إعادة تصميمها. إذا لم يكن لها قيمة استراتيجية، تخلص منها.` }
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
            const fileName = `هندسة_قائمة_${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert('خطأ Excel: ' + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== تصدير Word احترافي ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (!window.lastMenuResults) { alert('الرجاء إجراء التحليل أولاً (اضغط على "تحليل القائمة").'); return; }
        showLoading('جاري إنشاء تقرير Word...', 'جمع البيانات والرسوم');
        try {
            const res = window.lastMenuResults;
            const currency = document.getElementById('currencySelect').value;
            const companyName = document.getElementById('companyName').value || 'الجهة';
            const now = new Date();
            const dateStr = now.toLocaleDateString('ar-EG');

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
                const badgeColor = r.category.includes('نجم')?'#28a745':r.category.includes('علامة استفهام')?'#ffc107':r.category.includes('بقرة')?'#17a2b8':'#dc3545';
                const textColor = r.category.includes('نجم')||r.category.includes('بقرة')?'white':'#111';
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
            <head><meta charset='utf-8'><title>هندسة قوائم الطعام - FAROUK GRUP</title>
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
                    <h1>مجموعة فاروق للاستشارات والأعمال</h1>
                    <h2>🧮 تقرير هندسة قوائم الطعام (مصفوفة BCG)</h2>
                    <p>الجهة: ${companyName} | التاريخ: ${dateStr}</p>
                    <p>العملة: ${currency}</p>
                </div>
                <div class="summary">
                    <h3 style="color:#b8860b;">📊 ملخص التحليل</h3>
                    <p>عدد الأطباق: <strong>${res.results.length}</strong> | النجوم: <strong>${res.categories['نجم (Star)']}</strong> | علامات استفهام: <strong>${res.categories['علامة استفهام (Question Mark)']}</strong> | أبقار نقدية: <strong>${res.categories['بقرة نقدية (Cash Cow)']}</strong> | كلاب: <strong>${res.categories['كلب (Dog)']}</strong></p>
                    <p>إجمالي الإيرادات: ${currency} ${res.totalRevenue.toFixed(0)} | صافي الربح: ${currency} ${res.totalProfit.toFixed(0)}</p>
                </div>
                <h2 style="color:#b8860b;">📈 الرسم البياني (مصفوفة BCG)</h2>
                <div style="text-align:center;"><img src="${chartImgBase64}" class="chart-img" /></div>
                <h2 style="color:#b8860b;">📋 تحليل كل طبق</h2>
                <table>
                    <thead><tr><th>الطبق</th><th>هامش الربح</th><th>نسبة المبيعات</th><th>التصنيف</th><th>التوصية</th></tr></thead>
                    <tbody>${tableRows}</tbody>
                </table>
                <h2 style="color:#b8860b;">💡 التوصيات الاستراتيجية</h2>
                <div style="background:#fefcf6;padding:15px;border-radius:10px;border-right:4px solid #b8860b;">
                    <p><strong>⭐ النجوم (${res.categories['نجم (Star)']}):</strong> استمر في الترويج وثبت الأسعار. هذه الأطباق هي مصدر الربح الرئيسي.</p>
                    <p><strong>❓ علامات الاستفهام (${res.categories['علامة استفهام (Question Mark)']}):</strong> حسّن التسويق، غيّر السعر، أو قدّم عروضاً ترويجية. استثمر بحذر.</p>
                    <p><strong>🐄 الأبقار النقدية (${res.categories['بقرة نقدية (Cash Cow)']}):</strong> ارفع السعر قليلاً أو خفّض التكلفة لتحسين الهامش.</p>
                    <p><strong>🐕 الكلاب (${res.categories['كلب (Dog)']}):</strong> فكّر في حذفها أو إعادة تصميمها. إذا لم يكن لها قيمة استراتيجية، تخلص منها.</p>
                </div>
                <div class="footer">تم الإنشاء بواسطة مجموعة فاروق للاستشارات والأعمال © ${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `هندسة_قائمة_${companyName}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert('خطأ Word: ' + err.message); } finally { hideLoading(); }
    });

    // ===== تهيئة أولية =====
    renderDishesTable();
