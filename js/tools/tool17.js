
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

    // ===== إدارة المنتجات =====
    let productsData = [
        { name: '', price: '', varCost: '', mix: '' },
        { name: '', price: '', varCost: '', mix: '' },
        { name: '', price: '', varCost: '', mix: '' }
    ];

    function renderProducts() {
        const container = document.getElementById('productsContainer');
        container.innerHTML = '';
        productsData.forEach((product, idx) => {
            const div = document.createElement('div');
            div.className = 'product-row';
            div.innerHTML = `${T('s2')}${escapeHtml(product.name)}${T('s3')}${product.price}${T('s4')}${product.varCost}${T('s5')}${product.mix}${T('s6')}${idx > 0 ? '<button class="remove-product" data-index="'+idx+'">×</button>' : ''}
            `;
            container.appendChild(div);
        });

        document.querySelectorAll('.product-row').forEach((row, idx) => {
            const inputs = row.querySelectorAll('input');
            inputs[0].addEventListener('input', (e) => productsData[idx].name = e.target.value);
            inputs[1].addEventListener('input', (e) => productsData[idx].price = e.target.value);
            inputs[2].addEventListener('input', (e) => productsData[idx].varCost = e.target.value);
            inputs[3].addEventListener('input', (e) => productsData[idx].mix = e.target.value);
            const removeBtn = row.querySelector('.remove-product');
            if (removeBtn) removeBtn.addEventListener('click', () => removeProduct(idx));
        });
    }

    function removeProduct(index) {
        if (productsData.length > 1) {
            productsData.splice(index, 1);
            renderProducts();
        } else alert(T('s7'));
    }

    document.getElementById('addProductBtn').addEventListener('click', () => {
        productsData.push({ name: '', price: '', varCost: '', mix: '' });
        renderProducts();
    });

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    function getProductsData() {
        return productsData.filter(p => p.name.trim() !== '' && p.price !== '' && p.varCost !== '' && p.mix !== '')
            .map(p => ({
                name: p.name.trim(),
                price: parseFloat(p.price) || 0,
                varCost: parseFloat(p.varCost) || 0,
                mix: parseFloat(p.mix) || 0
            }));
    }

    // ===== الحساب الرئيسي =====
    let pieChartInstance = null;
    let barChartInstance = null;
    let lastCalculation = null;

    async function calculate() {
        const currency = document.getElementById('currencySelect').value;
        const fixedCosts = parseFloat(document.getElementById('fixedCosts').value) || 0;
        const actualTotalUnits = parseFloat(document.getElementById('actualTotalUnits').value) || 0;
        let products = getProductsData();
        if (products.length === 0) {
            alert(T('s8'));
            return;
        }

        let R;
        try { R = await FG.calc('tool17', 'main', { fixedCosts, actualTotalUnits, products }); } catch (e) { FG.calcError(e); return; }
        products = R.products;
        const { weightedAvgPrice, weightedAvgCMRatio, breakEvenRevenue, totalBreakEvenUnits, beUnits, beRevenue, marginOfSafety, marginOfSafetyPercent } = R;

        lastCalculation = {
            currency, fixedCosts, actualTotalUnits, products,
            weightedAvgPrice, weightedAvgCMRatio, breakEvenRevenue,
            totalBreakEvenUnits, beUnits, beRevenue,
            marginOfSafety, marginOfSafetyPercent
        };

        document.getElementById('resultsSection').style.display = 'block';
        document.getElementById('initialMessage').style.display = 'none';

        document.getElementById('resultsGrid').innerHTML = `${T('s9')}${currency}${weightedAvgPrice.toFixed(2)}${T('s10')}${(weightedAvgCMRatio*100).toFixed(1)}${T('s11')}${currency}${breakEvenRevenue.toFixed(0)}${T('s12')}${Math.ceil(totalBreakEvenUnits)}</div></div>
        `;

        let tableHtml = `${T('s13')}`;
        products.forEach((p, idx) => {
            tableHtml += `<tr><td>${p.name}</td><td>${currency}${p.price.toFixed(2)}</td><td>${currency}${p.varCost.toFixed(2)}</td><td>${currency}${p.cm.toFixed(2)} (${(p.cmRatio*100).toFixed(1)}%)</td><td>${(p.normMix*100).toFixed(1)}%</td><td>${Math.ceil(beUnits[idx])}</td><td>${currency}${beRevenue[idx].toFixed(0)}</td></tr>`;
        });
        tableHtml += '</tbody></table>';
        document.getElementById('productsBreakdown').innerHTML = tableHtml;

        if (marginOfSafety !== null) {
            document.getElementById('marginSafety').innerHTML = `${T('s14')}${currency}${marginOfSafety.toFixed(0)} (${marginOfSafetyPercent.toFixed(1)}${T('s15')}${marginOfSafetyPercent.toFixed(1)}${T('s16')}`;
        } else {
            document.getElementById('marginSafety').innerHTML = `${T('s17')}`;
        }

        const pieCanvas = document.getElementById('cmPieChart');
        const barCanvas = document.getElementById('beUnitsBarChart');

        setTimeout(() => {
            if (pieChartInstance) pieChartInstance.destroy();
            if (barChartInstance) barChartInstance.destroy();
            const ctxPie = pieCanvas.getContext('2d');
            pieChartInstance = new Chart(ctxPie, {
                type: 'pie',
                data: { labels: products.map(p => p.name), datasets: [{ data: products.map(p => p.cm), backgroundColor: ['#28a745','#ffc107','#dc3545','#17a2b8','#6f42c1','#fd7e14'] }] },
                options: { responsive: true, maintainAspectRatio: false, plugins: { tooltip: { callbacks: { label: ctx => `${ctx.label}: ${currency}${ctx.raw.toFixed(2)}` } } } }
            });
            const ctxBar = barCanvas.getContext('2d');
            barChartInstance = new Chart(ctxBar, {
                type: 'bar',
                data: { labels: products.map(p => p.name), datasets: [{ label: T('s18'), data: beUnits.map(u => Math.ceil(u)), backgroundColor: '#b8860b' }] },
                options: { responsive: true, maintainAspectRatio: false, scales: { y: { title: { display: true, text: T('s19') } } } }
            });
        }, 100);
    }

    document.getElementById('calculateBtn').addEventListener('click', calculate);

    // ================================================================
    // ========== تصدير Excel احترافي ==========
    // ================================================================
    document.getElementById('exportExcelBtn').addEventListener('click', async function() {
        if (!lastCalculation) { alert(T('s20')); return; }
        showLoading(T('s21'), T('s22'));
        try {
            const calc = lastCalculation;
            const currency = calc.currency;
            const companyName = document.getElementById('companyName').value || T('s23');
            const fixedCosts = calc.fixedCosts;
            const products = calc.products;
            const weightedAvgPrice = calc.weightedAvgPrice;
            const weightedAvgCMRatio = calc.weightedAvgCMRatio;
            const breakEvenRevenue = calc.breakEvenRevenue;
            const totalBreakEvenUnits = calc.totalBreakEvenUnits;
            const beUnits = calc.beUnits;
            const beRevenue = calc.beRevenue;
            const marginOfSafety = calc.marginOfSafety;
            const marginOfSafetyPercent = calc.marginOfSafetyPercent;

            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'FAROUK GRUP';
            const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050';
            const AR = 'FFF5F0E8', DT = 'FF1A1A1A', PB = 'FFD4EDDA', NB = 'FFF8D7DA', GB = 'FFFFF3CD';
            const PT = 'FF155724', NT = 'FF721C24';

            function hs(bg=HB, tc=GL){return{font:{name:'Arial',bold:true,size:11,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()},border:{top:{style:'thin',color:{argb:G}},bottom:{style:'thin',color:{argb:G}},left:{style:'thin',color:{argb:G}},right:{style:'thin',color:{argb:G}}}};}
            function cs(bg='FFFFFFFF',tc=DT,b=false,h='center'){return{font:{name:'Arial',bold:b,size:10,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:h,vertical:'middle',wrapText:true,readingOrder:FG.dir()},border:{top:{style:'hair',color:{argb:'FFCCCCCC'}},bottom:{style:'hair',color:{argb:'FFCCCCCC'}},left:{style:'hair',color:{argb:'FFCCCCCC'}},right:{style:'hair',color:{argb:'FFCCCCCC'}}}};}
            function ap(c,s){if(s.font)c.font=s.font;if(s.fill)c.fill=s.fill;if(s.alignment)c.alignment=s.alignment;if(s.border)c.border=s.border;if(s.numFmt)c.numFmt=s.numFmt;}
            function mh(ws,fc,tc,r,text,bg=HB,tc2=GL,fs=12){ws.mergeCells(r,fc,r,tc);const c=ws.getCell(r,fc);c.value=text;c.font={name:'Arial',bold:true,size:fs,color:{argb:tc2}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};c.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};}

            // 1. غلاف التقرير
            const cv = workbook.addWorksheet(T('s24'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
            cv.getRow(2).height=80; cv.getRow(4).height=60;
            cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1);
            bc.value=T('s25');
            bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};
            mh(cv,1,4,4,`${T('s26')}${companyName}`,DB,GL,18);
            const inf=[[T('s27'),companyName],[T('s28'),new Date().toLocaleDateString(FG.locale())],[T('s29'),currency],[T('s30'),`${currency} ${breakEvenRevenue.toFixed(0)}`],[T('s31'),Math.ceil(totalBreakEvenUnits)]];
            let ir=6;
            inf.forEach(([l,v],idx)=>{
                cv.mergeCells(ir,1,ir,2); cv.mergeCells(ir,3,ir,4);
                const lc=cv.getCell(ir,1), vc=cv.getCell(ir,3); lc.value=l; vc.value=v;
                const bg=idx%2===0?AR:'FFFEFCF6';
                ap(lc,{font:{name:'Arial',bold:true,size:11,color:{argb:'00695C'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'right',vertical:'middle',readingOrder:FG.dir()},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                ap(vc,{font:{name:'Arial',size:11,color:{argb:DT}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',readingOrder:FG.dir()},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                cv.getRow(ir).height=28; ir++;
            });

            // 2. المدخلات والمنتجات
            const inputsSheet = workbook.addWorksheet(T('s32'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            inputsSheet.getColumn(1).width=5; inputsSheet.getColumn(2).width=30; inputsSheet.getColumn(3).width=20; inputsSheet.getColumn(4).width=20; inputsSheet.getColumn(5).width=5;
            mh(inputsSheet,1,5,1,T('s33'),DB,GL,14);
            inputsSheet.getRow(1).height=40;
            mh(inputsSheet,2,4,2,T('s34'),SB,'FFFFFFFF',11);
            inputsSheet.getRow(2).height=28;
            const inputFields = [
                [T('s35'), fixedCosts, `${currency} ${fixedCosts.toFixed(0)}`],
                [T('s36'), calc.actualTotalUnits || 0, calc.actualTotalUnits ? `${calc.actualTotalUnits}${T('s37')}` : T('s38')]
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
            iRow++;
            mh(inputsSheet,iRow,4,iRow,T('s39'),SB,'FFFFFFFF',11);
            iRow++;
            const prodHeader = inputsSheet.getRow(iRow);
            [T('s40'),T('s41'),T('s42'),T('s43')].forEach((h,idx)=>{const c=prodHeader.getCell(idx+2);c.value=h;ap(c,hs(HB,GL));});
            iRow++;
            products.forEach(p=>{
                const row=inputsSheet.getRow(iRow);
                row.getCell(2).value=p.name; row.getCell(3).value=p.price; row.getCell(4).value=p.varCost; row.getCell(5).value=(p.normMix*100).toFixed(1);
                [2,3,4,5].forEach(col=>ap(row.getCell(col),cs(AR,DT,false,'center')));
                iRow++;
            });

            // 3. نتائج التعادل
            const resSheet = workbook.addWorksheet(T('s44'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            [5,30,25,20,5].forEach((w,i)=>resSheet.getColumn(i+1).width=w);
            mh(resSheet,1,5,1,T('s45'),DB,GL,15);
            resSheet.getRow(1).height=40;
            mh(resSheet,2,4,2,`${companyName} | ${new Date().toLocaleDateString(FG.locale())}`,HB,'FFFFFFFF',10);
            const kpis = [
                { label: T('s46'), value: `${currency} ${weightedAvgPrice.toFixed(2)}` },
                { label: T('s47'), value: `${(weightedAvgCMRatio*100).toFixed(1)}%` },
                { label: T('s48'), value: `${currency} ${breakEvenRevenue.toFixed(0)}` },
                { label: T('s49'), value: Math.ceil(totalBreakEvenUnits) },
                { label: T('s50'), value: marginOfSafety !== null ? `${currency} ${marginOfSafety.toFixed(0)} (${marginOfSafetyPercent.toFixed(1)}%)` : T('s38') }
            ];
            let rRow=3;
            kpis.forEach((k,idx)=>{
                resSheet.getRow(rRow).height=35;
                resSheet.mergeCells(rRow,2,rRow,2); resSheet.mergeCells(rRow,3,rRow,3); resSheet.mergeCells(rRow,4,rRow,4);
                const ic=resSheet.getCell(rRow,2); ic.value=`🔹 ${idx+1}`;
                const lc2=resSheet.getCell(rRow,3); lc2.value=k.label;
                const vc3=resSheet.getCell(rRow,4); vc3.value=k.value;
                const bg=idx%2===0?AR:'FFFEFCF6';
                [ic,lc2,vc3].forEach(c=>{c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}}; c.border={top:{style:'thin',color:{argb:G}},bottom:{style:'thin',color:{argb:G}},left:{style:'thin',color:{argb:G}},right:{style:'thin',color:{argb:G}}};});
                ic.font={name:'Arial',bold:true,size:14,color:{argb:'555555'}}; ic.alignment={horizontal:'center',vertical:'middle'};
                lc2.font={name:'Arial',bold:true,size:11,color:{argb:DT}}; lc2.alignment={horizontal:'right',vertical:'middle',readingOrder:FG.dir()};
                vc3.font={name:'Arial',bold:true,size:12,color:{argb:DT}}; vc3.alignment={horizontal:'center',vertical:'middle'};
                rRow++;
            });

            // 4. تفصيل المنتجات
            const prodDetail = workbook.addWorksheet(T('s51'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            prodDetail.getColumn(1).width=5; prodDetail.getColumn(2).width=20; prodDetail.getColumn(3).width=15; prodDetail.getColumn(4).width=18; prodDetail.getColumn(5).width=18; prodDetail.getColumn(6).width=15; prodDetail.getColumn(7).width=18; prodDetail.getColumn(8).width=18; prodDetail.getColumn(9).width=5;
            mh(prodDetail,1,9,1,T('s52'),DB,GL,14);
            prodDetail.getRow(1).height=40;
            const prodHeaders = [T('s40'),T('s53'),T('s42'),T('s54'),T('s55'),T('s56'),T('s57')];
            const headerRow2 = prodDetail.getRow(3);
            prodHeaders.forEach((h,idx)=>{const c=headerRow2.getCell(idx+2);c.value=h;ap(c,hs(HB,GL));});
            let pRow=4;
            products.forEach((p,idx)=>{
                const row=prodDetail.getRow(pRow);
                row.getCell(2).value=p.name; row.getCell(3).value=p.price; row.getCell(4).value=p.varCost;
                row.getCell(5).value=`${currency} ${p.cm.toFixed(2)} (${(p.cmRatio*100).toFixed(1)}%)`;
                row.getCell(6).value=`${(p.normMix*100).toFixed(1)}%`;
                row.getCell(7).value=Math.ceil(beUnits[idx]);
                row.getCell(8).value=`${currency} ${beRevenue[idx].toFixed(0)}`;
                [2,3,4,5,6,7,8].forEach(col=>ap(row.getCell(col),cs(AR,DT,false,'center')));
                pRow++;
            });

            // 5. الرسوم البيانية
            const chartsSheet = workbook.addWorksheet(T('s58'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            chartsSheet.getColumn(1).width=5; chartsSheet.getColumn(2).width=50; chartsSheet.getColumn(3).width=5;
            mh(chartsSheet,1,3,1,T('s59'),DB,GL,14);
            chartsSheet.getRow(1).height=40;
            const chartGrid = document.querySelector('.chart-grid');
            if (chartGrid) {
                try {
                    const origBg = chartGrid.style.backgroundColor;
                    chartGrid.style.backgroundColor = '#ffffff';
                    const canvasImg = await html2canvas(chartGrid, { scale: 2, backgroundColor: '#ffffff' });
                    chartGrid.style.backgroundColor = origBg;
                    const imgData = canvasImg.toDataURL('image/png');
                    const imageId = workbook.addImage({ base64: imgData, extension: 'png' });
                    chartsSheet.addImage(imageId, { tl: { col: 1, row: 2 }, br: { col: 2, row: 25 }, editAs: 'oneCell' });
                } catch(err) {}
            }

            // 6. التوصيات
            const recSheet = workbook.addWorksheet(T('s60'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            recSheet.getColumn(1).width=5; recSheet.getColumn(2).width=50; recSheet.getColumn(3).width=5;
            mh(recSheet,1,3,1,T('s61'),DB,GL,14);
            recSheet.getRow(1).height=40;
            let recRow=3;
            const recs = [
                { title: T('s62'), content: `${T('s63')}${currency} ${breakEvenRevenue.toFixed(0)}${T('s64')}${Math.ceil(totalBreakEvenUnits)}${T('s65')}` },
                { title: T('s66'), content: T('s67') },
                { title: T('s68'), content: marginOfSafety !== null ? `${T('s69')}${marginOfSafetyPercent.toFixed(1)}${T('s70')}${marginOfSafetyPercent.toFixed(1)}${T('s71')}` : T('s72') },
                { title: T('s73'), content: T('s74') }
            ];
            recs.forEach(sec=>{
                recSheet.getRow(recRow).height=28;
                recSheet.mergeCells(recRow,2,recRow,2);
                const tc3=recSheet.getCell(recRow,2); tc3.value=sec.title; tc3.font={name:'Arial',bold:true,size:12,color:{argb:GL}}; tc3.fill={type:'pattern',pattern:'solid',fgColor:{argb:HB}}; tc3.alignment={horizontal:'right',vertical:'middle',readingOrder:FG.dir()}; tc3.border={bottom:{style:'medium',color:{argb:G}}};
                recRow++;
                recSheet.getRow(recRow).height=Math.max(40, sec.content.split('\n').length*18);
                recSheet.mergeCells(recRow,2,recRow,2);
                const cc=recSheet.getCell(recRow,2); cc.value=sec.content; cc.font={name:'Arial',size:10,color:{argb:DT}}; cc.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFFEFCF6'}}; cc.alignment={horizontal:'right',vertical:'top',wrapText:true,readingOrder:FG.dir()}; cc.border={top:{style:'hair'},bottom:{style:'hair',color:{argb:G}},left:{style:'hair'},right:{style:'hair'}};
                recRow++;
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const now = new Date();
            const fileName = `${T('s75')}${companyName}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert(T('s76') + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== تصدير Word احترافي ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (!lastCalculation) { alert(T('s20')); return; }
        showLoading(T('s77'), T('s78'));
        try {
            const calc = lastCalculation;
            const currency = calc.currency;
            const companyName = document.getElementById('companyName').value || T('s23');
            const breakEvenRevenue = calc.breakEvenRevenue;
            const totalBreakEvenUnits = calc.totalBreakEvenUnits;
            const products = calc.products;
            const beUnits = calc.beUnits;
            const beRevenue = calc.beRevenue;
            const weightedAvgPrice = calc.weightedAvgPrice;
            const weightedAvgCMRatio = calc.weightedAvgCMRatio;
            const marginOfSafety = calc.marginOfSafety;
            const marginOfSafetyPercent = calc.marginOfSafetyPercent;
            const now = new Date();
            const dateStr = now.toLocaleDateString(FG.locale());

            const chartGrid = document.querySelector('.chart-grid');
            let chartImgBase64 = '';
            if (chartGrid) {
                const origBg = chartGrid.style.backgroundColor;
                chartGrid.style.backgroundColor = '#ffffff';
                const img = await html2canvas(chartGrid, { scale: 2, backgroundColor: '#ffffff' });
                chartGrid.style.backgroundColor = origBg;
                chartImgBase64 = img.toDataURL('image/png');
            }

            let productsTableRows = '';
            products.forEach((p, idx) => {
                productsTableRows += `<tr><td>${p.name}</td><td>${currency}${p.price.toFixed(2)}</td><td>${currency}${p.varCost.toFixed(2)}</td><td>${currency}${p.cm.toFixed(2)} (${(p.cmRatio*100).toFixed(1)}%)</td><td>${(p.normMix*100).toFixed(1)}%</td><td>${Math.ceil(beUnits[idx])}</td><td>${currency}${beRevenue[idx].toFixed(0)}</td></tr>`;
            });

            const kpis = [
                { label: T('s46'), value: `${currency}${weightedAvgPrice.toFixed(2)}`, good: true },
                { label: T('s79'), value: `${(weightedAvgCMRatio*100).toFixed(1)}%`, good: true },
                { label: T('s48'), value: `${currency}${breakEvenRevenue.toFixed(0)}`, good: true },
                { label: T('s80'), value: Math.ceil(totalBreakEvenUnits), good: true }
            ];
            let kpiRows = '';
            kpis.forEach(k => {
                kpiRows += `<tr style="border:1px solid #b8860b;"><td style="padding:10px;background:#d4edda;text-align:right;">${k.label}</td><td style="padding:10px;background:#d4edda;text-align:center;"><strong style="font-size:1.2rem;color:#155724;">${k.value}</strong></td></tr>`;
            });

            const safetyHtml = marginOfSafety !== null ? `${T('s81')}${currency}${marginOfSafety.toFixed(0)} (${marginOfSafetyPercent.toFixed(1)}${T('s82')}${marginOfSafetyPercent.toFixed(1)}${T('s83')}` : '';

            const fullHtml = `${T('s86')}${companyName}${T('s87')}${dateStr}${T('s88')}${kpiRows}</table>
                ${safetyHtml}${T('s89')}${productsTableRows}${T('s90')}${chartImgBase64}${T('s91')}${currency} ${breakEvenRevenue.toFixed(0)} (${Math.ceil(totalBreakEvenUnits)}${T('s92')}${marginOfSafety!==null?`${marginOfSafetyPercent.toFixed(1)}${T('s84')}`:T('s85')}${T('s93')}${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${T('s75')}${companyName}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert(T('s94') + err.message); } finally { hideLoading(); }
    });

    // ===== تهيئة أولية =====
    renderProducts();
