
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
            } catch(e) { calcDisplay.value = T('s1'); currentCalcInput = ''; }
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
            alert(T('s2'));
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
        if (confirm(T('s3'))) {
            dishes.splice(index, 1);
            renderDishesTable();
            document.getElementById('resultsArea').style.display = 'none';
            document.getElementById('initialMessage').style.display = 'block';
        }
    }

    function clearAllDishes() {
        if (dishes.length === 0) return;
        if (confirm(T('s4'))) {
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
            alert(T('s5'));
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
                    alert(T('s6'));
                } else {
                    renderDishesTable();
                    document.getElementById('resultsArea').style.display = 'none';
                    document.getElementById('initialMessage').style.display = 'block';
                    alert(`${T('s7')}${imported}${T('s8')}`);
                }
            } catch (err) {
                alert(T('s9') + err.message);
            }
        };
        reader.readAsArrayBuffer(fileInput.files[0]);
        fileInput.value = '';
    });


    // ===== التحليل (مصفوفة BCG) =====
    async function analyzeMenu() {
        if (dishes.length < 2) {
            alert(T('s10'));
            return;
        }

        let R;
        try { R = await FG.calc('tool22', 'main', { dishes }); } catch (e) { FG.calcError(e); return; }
        const { results, avgProfit, avgPopularity, totalRevenue, totalCost, totalProfit } = R;

        document.getElementById('initialMessage').style.display = 'none';
        document.getElementById('resultsArea').style.display = 'block';

        const categories = {
            [T('s11')]: 0,
            [T('s13')]: 0,
            [T('s15')]: 0,
            [T('s17')]: 0
        };
        results.forEach(r => {
            categories[r.category] = (categories[r.category] || 0) + 1;
        });

        document.getElementById('summaryCards').innerHTML = `
            <div class="summary-card"><div class="number">${results.length}${T('s19')}${categories[T('s11')]}${T('s20')}${categories[T('s13')]}${T('s21')}${categories[T('s15')]}${T('s22')}${categories[T('s17')]}${T('s23')}${totalRevenue.toFixed(0)}${T('s24')}${totalProfit.toFixed(0)}${T('s25')}`;

        let recHtml = `${T('s26')}`;
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
            if (r.category.includes(T('s27'))) return '#28a745';
            if (r.category.includes(T('s28'))) return '#ffc107';
            if (r.category.includes(T('s29'))) return '#17a2b8';
            return '#dc3545';
        });

        menuChartInstance = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: T('s30'),
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
                        title: { display: true, text: T('s31'), color: '#aab7d4' },
                        ticks: { color: '#aab7d4' },
                        grid: { color: 'rgba(180,133,84,0.15)' },
                        beginAtZero: true
                    },
                    y: {
                        title: { display: true, text: T('s32'), color: '#aab7d4' },
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
        if (!window.lastMenuResults) { alert(T('s33')); return; }
        showLoading(T('s34'), T('s35'));
        try {
            const res = window.lastMenuResults;
            const currency = document.getElementById('currencySelect').value;
            const companyName = document.getElementById('companyName').value || T('s36');

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'FAROUK GRUP';
            const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050';
            const AR = 'FFF5F0E8', DT = 'FF1A1A1A', PB = 'FFD4EDDA', NB = 'FFF8D7DA', GB = 'FFFFF3CD';
            const PT = 'FF155724', NT = 'FF721C24';
            const nc = '#,##0;(#,##0);"-"';

            function hs(bg=HB, tc=GL){return{font:{name:'Arial',bold:true,size:11,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()},border:{top:{style:'thin',color:{argb:G}},bottom:{style:'thin',color:{argb:G}},left:{style:'thin',color:{argb:G}},right:{style:'thin',color:{argb:G}}}};}
            function cs(bg='FFFFFFFF',tc=DT,b=false,h='center'){return{font:{name:'Arial',bold:b,size:10,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:h,vertical:'middle',wrapText:true,readingOrder:FG.dir()},border:{top:{style:'hair',color:{argb:'FFCCCCCC'}},bottom:{style:'hair',color:{argb:'FFCCCCCC'}},left:{style:'hair',color:{argb:'FFCCCCCC'}},right:{style:'hair',color:{argb:'FFCCCCCC'}}}};}
            function ap(c,s){if(s.font)c.font=s.font;if(s.fill)c.fill=s.fill;if(s.alignment)c.alignment=s.alignment;if(s.border)c.border=s.border;if(s.numFmt)c.numFmt=s.numFmt;}
            function mh(ws,fc,tc,r,text,bg=HB,tc2=GL,fs=12){ws.mergeCells(r,fc,r,tc);const c=ws.getCell(r,fc);c.value=text;c.font={name:'Arial',bold:true,size:fs,color:{argb:tc2}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};c.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};}

            // 1. غلاف التقرير
            const cv = workbook.addWorksheet(T('s37'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
            cv.getRow(2).height=80; cv.getRow(4).height=60;
            cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1);
            bc.value=T('s38');
            bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};
            mh(cv,1,4,4,`${T('s39')}${companyName}`,DB,GL,18);
            const inf=[[T('s40'),companyName],[T('s41'),new Date().toLocaleDateString(FG.locale())],[T('s42'),currency],[T('s43'),res.results.length],[T('s44'),res.categories[T('s11')]]];
            let ir=6;
            inf.forEach(([l,v],idx)=>{
                cv.mergeCells(ir,1,ir,2); cv.mergeCells(ir,3,ir,4);
                const lc=cv.getCell(ir,1), vc=cv.getCell(ir,3); lc.value=l; vc.value=v;
                const bg=idx%2===0?AR:'FFFEFCF6';
                ap(lc,{font:{name:'Arial',bold:true,size:11,color:{argb:'00695C'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'right',vertical:'middle',readingOrder:FG.dir()},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                ap(vc,{font:{name:'Arial',size:11,color:{argb:DT}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',readingOrder:FG.dir()},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                cv.getRow(ir).height=28; ir++;
            });

            // 2. المدخلات
            const inputsSheet = workbook.addWorksheet(T('s45'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            inputsSheet.getColumn(1).width=5; inputsSheet.getColumn(2).width=30; inputsSheet.getColumn(3).width=20; inputsSheet.getColumn(4).width=20; inputsSheet.getColumn(5).width=20; inputsSheet.getColumn(6).width=5;
            mh(inputsSheet,1,6,1,T('s46'),DB,GL,14);
            inputsSheet.getRow(1).height=40;
            const headerRow = inputsSheet.getRow(3);
            ['#',T('s47'),T('s48'),T('s49'),T('s50')].forEach((h,i)=>{const c=headerRow.getCell(i+2);c.value=h;ap(c,hs(HB,GL));});
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
            const matrixSheet = workbook.addWorksheet(T('s51'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            matrixSheet.getColumn(1).width=5; matrixSheet.getColumn(2).width=25; matrixSheet.getColumn(3).width=18; matrixSheet.getColumn(4).width=18; matrixSheet.getColumn(5).width=18; matrixSheet.getColumn(6).width=16; matrixSheet.getColumn(7).width=40; matrixSheet.getColumn(8).width=5;
            mh(matrixSheet,1,8,1,T('s52'),DB,GL,14);
            matrixSheet.getRow(1).height=40;
            const mHeaders = [T('s47'),T('s53'),T('s54'),T('s55'),T('s56')];
            const mRow = matrixSheet.getRow(3);
            mHeaders.forEach((h,i)=>{const c=mRow.getCell(i+2);c.value=h;ap(c,hs(HB,GL));});
            res.results.forEach((r,idx)=>{
                const row=idx+4;
                matrixSheet.getRow(row).height=24;
                const bg=idx%2===0?AR:'FFFEFCF6';
                const catColor = r.category.includes(T('s27'))?'FF28A745':r.category.includes(T('s28'))?'FFD39C0B':r.category.includes(T('s29'))?'FF17A2B8':'FFDC3545';
                [r.name, r.margin, r.popularity, r.category, r.recommendation].forEach((val,j)=>{
                    const c=matrixSheet.getCell(row,j+2);c.value=val;
                    ap(c,{...cs(bg,DT,false,j===3?'center':'right'),numFmt:typeof val==='number'?nc:null});
                    if(j===3){c.font={name:'Arial',bold:true,size:10,color:{argb:catColor}};}
                });
            });

            // 4. ملخص
            const summarySheet = workbook.addWorksheet(T('s57'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            summarySheet.getColumn(1).width=5; summarySheet.getColumn(2).width=30; summarySheet.getColumn(3).width=25; summarySheet.getColumn(4).width=5;
            mh(summarySheet,1,4,1,T('s58'),DB,GL,14);
            summarySheet.getRow(1).height=40;
            const sumData = [
                [T('s59'), res.results.length],
                [T('s60'), res.categories[T('s11')]],
                [T('s61'), res.categories[T('s13')]],
                [T('s62'), res.categories[T('s15')]],
                [T('s63'), res.categories[T('s17')]],
                [T('s64'), `${currency} ${res.totalRevenue.toFixed(0)}`],
                [T('s65'), `${currency} ${res.totalCost.toFixed(0)}`],
                [T('s66'), `${currency} ${res.totalProfit.toFixed(0)}`]
            ];
            summarySheet.addRow([T('s67'),T('s68')]);
            sumData.forEach(row=>summarySheet.addRow(row));
            summarySheet.getRow(2).font={bold:true,color:{argb:'FFFFFFFF'}};
            summarySheet.getRow(2).fill={type:'pattern',pattern:'solid',fgColor:{argb:G}};

            // 5. الرسوم البيانية
            const chartsSheet = workbook.addWorksheet(T('s69'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
            mh(chartsSheet,1,3,1,T('s70'),DB,GL,14);
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
            const recSheet = workbook.addWorksheet(T('s71'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            recSheet.getColumn(1).width=5; recSheet.getColumn(2).width=50; recSheet.getColumn(3).width=5;
            mh(recSheet,1,3,1,T('s72'),DB,GL,14);
            recSheet.getRow(1).height=40;
            const starCount = res.categories[T('s11')];
            const dogCount = res.categories[T('s17')];
            const recs = [
                { title: T('s73'), content: `${T('s74')}${starCount}${T('s75')}` },
                { title: T('s76'), content: T('s77') },
                { title: T('s78'), content: T('s79') },
                { title: T('s80'), content: `${T('s81')}${dogCount}${T('s82')}` }
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
                tc3.alignment={horizontal:'right',vertical:'middle',readingOrder:FG.dir()};
                tc3.border={bottom:{style:'medium',color:{argb:G}}};
                itRow++;
                recSheet.getRow(itRow).height=Math.max(40, sec.content.split('\n').length*18);
                recSheet.mergeCells(itRow,2,itRow,2);
                const cc=recSheet.getCell(itRow,2);
                cc.value=sec.content;
                cc.font={name:'Arial',size:10,color:{argb:DT}};
                cc.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFEFCF6'}};
                cc.alignment={horizontal:'right',vertical:'top',wrapText:true,readingOrder:FG.dir()};
                cc.border={top:{style:'hair'},bottom:{style:'hair',color:{argb:G}},left:{style:'hair'},right:{style:'hair'}};
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const now = new Date();
            const fileName = `${T('s83')}${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert(T('s84') + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== تصدير Word احترافي ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (!window.lastMenuResults) { alert(T('s33')); return; }
        showLoading(T('s85'), T('s86'));
        try {
            const res = window.lastMenuResults;
            const currency = document.getElementById('currencySelect').value;
            const companyName = document.getElementById('companyName').value || T('s36');
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
            res.results.forEach(r => {
                const badgeColor = r.category.includes(T('s27'))?'#28a745':r.category.includes(T('s28'))?'#ffc107':r.category.includes(T('s29'))?'#17a2b8':'#dc3545';
                const textColor = r.category.includes(T('s27'))||r.category.includes(T('s29'))?'white':'#111';
                tableRows += `<tr>
                    <td style="border:1px solid #b8860b;padding:8px;text-align:center;">${r.name}</td>
                    <td style="border:1px solid #b8860b;padding:8px;text-align:center;">${r.margin.toFixed(2)}</td>
                    <td style="border:1px solid #b8860b;padding:8px;text-align:center;">${r.popularity.toFixed(1)}%</td>
                    <td style="border:1px solid #b8860b;padding:8px;text-align:center;"><span style="background:${badgeColor};color:${textColor};padding:0.2rem 0.6rem;border-radius:20px;font-weight:700;font-size:0.8rem;">${r.category}</span></td>
                    <td style="border:1px solid #b8860b;padding:8px;text-align:right;font-size:0.85rem;color:#555;">${r.recommendation}</td>
                </tr>`;
            });

            const fullHtml = `${T('s87')}${companyName}${T('s88')}${dateStr}${T('s89')}${currency}${T('s90')}${res.results.length}${T('s91')}${res.categories[T('s11')]}${T('s92')}${res.categories[T('s13')]}${T('s93')}${res.categories[T('s15')]}${T('s94')}${res.categories[T('s17')]}${T('s95')}${currency} ${res.totalRevenue.toFixed(0)}${T('s96')}${currency} ${res.totalProfit.toFixed(0)}${T('s97')}${chartImgBase64}${T('s98')}${tableRows}${T('s99')}${res.categories[T('s11')]}${T('s100')}${res.categories[T('s13')]}${T('s101')}${res.categories[T('s15')]}${T('s102')}${res.categories[T('s17')]}${T('s103')}${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${T('s83')}${companyName}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert(T('s104') + err.message); } finally { hideLoading(); }
    });

    // ===== تهيئة أولية =====
    renderDishesTable();
