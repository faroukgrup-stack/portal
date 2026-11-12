
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

    // ===== بيانات التوصيات =====
    const correctiveActions = {
        rec1: { risk: T('s2'), action: T('s3'), recommendation: T('s4') },
        rec2: { risk: T('s5'), action: T('s6'), recommendation: T('s7') },
        rec3: { risk: T('s2'), action: T('s8'), recommendation: T('s9') },
        rec4: { risk: T('s5'), action: T('s10'), recommendation: T('s11') },
        rec5: { risk: T('s5'), action: T('s12'), recommendation: T('s13') },
        sto1: { risk: T('s2'), action: T('s14'), recommendation: T('s15') },
        sto2: { risk: T('s2'), action: T('s16'), recommendation: T('s17') },
        sto3: { risk: T('s5'), action: T('s18'), recommendation: T('s19') },
        sto4: { risk: T('s2'), action: T('s20'), recommendation: T('s21') },
        sto5: { risk: T('s5'), action: T('s22'), recommendation: T('s23') },
        sto6: { risk: T('s5'), action: T('s24'), recommendation: T('s25') },
        prep1: { risk: T('s2'), action: T('s26'), recommendation: T('s27') },
        prep2: { risk: T('s2'), action: T('s28'), recommendation: T('s29') },
        prep3: { risk: T('s2'), action: T('s30'), recommendation: T('s31') },
        prep4: { risk: T('s2'), action: T('s32'), recommendation: T('s33') },
        prep5: { risk: T('s2'), action: T('s34'), recommendation: T('s35') },
        cook1: { risk: T('s2'), action: T('s36'), recommendation: T('s37') },
        cook2: { risk: T('s2'), action: T('s38'), recommendation: T('s39') },
        cook3: { risk: T('s2'), action: T('s40'), recommendation: T('s41') },
        cook4: { risk: T('s2'), action: T('s42'), recommendation: T('s43') },
        cook5: { risk: T('s5'), action: T('s44'), recommendation: T('s45') },
        cool1: { risk: T('s2'), action: T('s46'), recommendation: T('s47') },
        cool2: { risk: T('s2'), action: T('s48'), recommendation: T('s49') },
        cool3: { risk: T('s5'), action: T('s50'), recommendation: T('s51') },
        cool4: { risk: T('s5'), action: T('s52'), recommendation: T('s53') },
        per1: { risk: T('s5'), action: T('s54'), recommendation: T('s55') },
        per2: { risk: T('s5'), action: T('s56'), recommendation: T('s57') },
        per3: { risk: T('s58'), action: T('s59'), recommendation: T('s60') },
        per4: { risk: T('s58'), action: T('s61'), recommendation: T('s62') },
        per5: { risk: T('s2'), action: T('s63'), recommendation: T('s64') },
        per6: { risk: T('s2'), action: T('s65'), recommendation: T('s66') },
        clean1: { risk: T('s2'), action: T('s67'), recommendation: T('s68') },
        clean2: { risk: T('s2'), action: T('s69'), recommendation: T('s70') },
        clean3: { risk: T('s5'), action: T('s71'), recommendation: T('s72') },
        clean4: { risk: T('s2'), action: T('s73'), recommendation: T('s74') },
        clean5: { risk: T('s5'), action: T('s75'), recommendation: T('s76') },
        pest1: { risk: T('s2'), action: T('s77'), recommendation: T('s78') },
        pest2: { risk: T('s2'), action: T('s79'), recommendation: T('s80') },
        pest3: { risk: T('s5'), action: T('s81'), recommendation: T('s82') },
        pest4: { risk: T('s2'), action: T('s83'), recommendation: T('s84') },
        doc1: { risk: T('s2'), action: T('s85'), recommendation: T('s86') },
        doc2: { risk: T('s2'), action: T('s87'), recommendation: T('s88') },
        doc3: { risk: T('s5'), action: T('s89'), recommendation: T('s90') },
        doc4: { risk: T('s5'), action: T('s91'), recommendation: T('s92') },
        tr1: { risk: T('s2'), action: T('s93'), recommendation: T('s94') },
        tr2: { risk: T('s5'), action: T('s95'), recommendation: T('s96') },
        tr3: { risk: T('s5'), action: T('s97'), recommendation: T('s98') }
    };

    function setupRecommendations() {
        document.querySelectorAll('.haccp-item').forEach(item => {
            item.addEventListener('change', function() {
                const id = this.dataset.id;
                const recBox = document.getElementById(`recommendation-${id}`);
                if (!this.checked) {
                    const data = correctiveActions[id];
                    if (data) {
                        recBox.style.display = 'block';
                        recBox.innerHTML = `${T('s99')}${data.risk}${T('s100')}${data.action}${T('s101')}${data.recommendation}`;
                    }
                } else {
                    recBox.style.display = 'none';
                }
            });
        });
    }

    // ===== جمع بيانات التدقيق =====
    async function collectAuditData() {
        const date = document.getElementById('checkDate').value;
        const inspector = document.getElementById('inspectorName').value || T('s102');
        const signatureName = document.getElementById('signatureName').value || inspector;
        const signature = document.getElementById('signature').value || '';
        const items = document.querySelectorAll('.haccp-item');
        let checked = 0;
        const details = [];
        items.forEach(item => {
            const id = item.dataset.id;
            const label = item.closest('.checklist-item').querySelector('label').innerText;
            const note = document.getElementById(`note-${id}`)?.value || '';
            const status = item.checked;
            if (status) checked++;
            const data = correctiveActions[id] || {};
            details.push({
                id, label, status, note,
                risk: data.risk || '',
                action: data.action || '',
                recommendation: data.recommendation || ''
            });
        });
        const total = items.length;
        const S = await FG.calc('tool14', 'score', { checked, total });
        const { percent, evaluation, overallRiskLevel } = S;
        return { date, inspector, signatureName, signature, details, checked, total, percent, evaluation, overallRiskLevel };
    }

    // ===== حساب النتيجة =====
    document.getElementById('calculateBtn').addEventListener('click', async function() {
        let data;
        try { data = await collectAuditData(); } catch (e) { FG.calcError(e); return; }
        document.getElementById('resultArea').style.display = 'flex';
        document.getElementById('scoreDisplay').textContent = data.percent + '%';
        document.getElementById('evaluationText').textContent = data.evaluation;
        const riskEl = document.getElementById('overallRiskDisplay');
        riskEl.textContent = `${T('s109')}${data.overallRiskLevel}`;
        riskEl.className = 'overall-risk ' + (data.overallRiskLevel.includes(T('s58')) ? 'risk-level-low' : (data.overallRiskLevel.includes(T('s5')) ? 'risk-level-medium' : 'risk-level-high'));
        // تخزين النتائج للتصدير
        window.lastAuditData = data;
    });

    // ================================================================
    // ========== تصدير Excel احترافي ==========
    // ================================================================
    document.getElementById('exportExcelBtn').addEventListener('click', async function() {
        if (!window.lastAuditData) { alert(T('s110')); return; }
        showLoading(T('s111'), T('s112'));
        try {
            const data = window.lastAuditData;
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'FAROUK GRUP';
            const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050';
            const AR = 'FFF5F0E8', DT = 'FF1A1A1A', PB = 'FFD4EDDA', NB = 'FFF8D7DA';
            const PT = 'FF155724', NT = 'FF721C24', GB = 'FFFFF3CD';

            function hs(bg=HB, tc=GL){return{font:{name:'Arial',bold:true,size:11,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()},border:{top:{style:'thin',color:{argb:G}},bottom:{style:'thin',color:{argb:G}},left:{style:'thin',color:{argb:G}},right:{style:'thin',color:{argb:G}}}};}
            function cs(bg='FFFFFFFF',tc=DT,b=false,h='center'){return{font:{name:'Arial',bold:b,size:10,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:h,vertical:'middle',wrapText:true,readingOrder:FG.dir()},border:{top:{style:'hair',color:{argb:'FFCCCCCC'}},bottom:{style:'hair',color:{argb:'FFCCCCCC'}},left:{style:'hair',color:{argb:'FFCCCCCC'}},right:{style:'hair',color:{argb:'FFCCCCCC'}}}};}
            function ap(c,s){if(s.font)c.font=s.font;if(s.fill)c.fill=s.fill;if(s.alignment)c.alignment=s.alignment;if(s.border)c.border=s.border;if(s.numFmt)c.numFmt=s.numFmt;}
            function mh(ws,fc,tc,r,text,bg=HB,tc2=GL,fs=12){ws.mergeCells(r,fc,r,tc);const c=ws.getCell(r,fc);c.value=text;c.font={name:'Arial',bold:true,size:fs,color:{argb:tc2}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};c.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};}

            // 1. غلاف التقرير
            const cv = workbook.addWorksheet(T('s113'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
            cv.getRow(2).height=80; cv.getRow(4).height=60;
            cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1);
            bc.value=T('s114');
            bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};
            mh(cv,1,4,4,`${T('s115')}${data.inspector}`,DB,GL,18);
            const inf=[[T('s116'),data.date],[T('s117'),data.inspector],[T('s118'),`${data.percent}%`],[T('s119'),data.overallRiskLevel]];
            let ir=6;
            inf.forEach(([l,v],idx)=>{
                cv.mergeCells(ir,1,ir,2); cv.mergeCells(ir,3,ir,4);
                const lc=cv.getCell(ir,1), vc=cv.getCell(ir,3); lc.value=l; vc.value=v;
                const bg=idx%2===0?AR:'FFFEFCF6';
                ap(lc,{font:{name:'Arial',bold:true,size:11,color:{argb:'00695C'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'right',vertical:'middle',readingOrder:FG.dir()},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                ap(vc,{font:{name:'Arial',size:11,color:{argb:DT}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',readingOrder:FG.dir()},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                cv.getRow(ir).height=28; ir++;
            });

            // 2. تفاصيل التدقيق
            const detailSheet = workbook.addWorksheet(T('s120'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            detailSheet.getColumn(1).width = 5; detailSheet.getColumn(2).width = 50; detailSheet.getColumn(3).width = 15; detailSheet.getColumn(4).width = 20; detailSheet.getColumn(5).width = 30; detailSheet.getColumn(6).width = 5;
            mh(detailSheet,1,6,1,T('s121'),DB,GL,14);
            detailSheet.getRow(1).height=40;
            detailSheet.addRow([T('s122'), T('s123'), T('s124'), T('s125'), T('s126')]);
            const headerRow = detailSheet.getRow(2);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
            data.details.forEach(item => {
                detailSheet.addRow([item.label, item.status ? T('s127') : T('s128'), item.risk, item.note, item.status ? '' : item.recommendation]);
            });

            // 3. ملخص النتائج
            const summarySheet = workbook.addWorksheet(T('s129'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            summarySheet.getColumn(1).width = 30; summarySheet.getColumn(2).width = 40;
            mh(summarySheet,1,2,1,T('s130'),DB,GL,14);
            summarySheet.getRow(1).height=40;
            const summaryData = [
                [T('s131'), `${data.percent}%`],
                [T('s132'), data.evaluation],
                [T('s133'), data.overallRiskLevel],
                [T('s134'), data.checked],
                [T('s135'), data.total],
                [T('s136'), `${data.signatureName} - ${data.signature || '__________'}`]
            ];
            summaryData.forEach((row,idx) => {
                const r = idx + 3;
                const lc = summarySheet.getCell(r,1); lc.value = row[0]; ap(lc, cs(idx%2===0?'FFFEFCF6':'FFFFFFFF',DT,true,FG.start()));
                const vc = summarySheet.getCell(r,2); vc.value = row[1]; ap(vc, cs(idx%2===0?'FFFEFCF6':'FFFFFFFF',DT,false,'center'));
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const now = new Date();
            const fileName = `${T('s137')}${data.date}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert(T('s138') + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== تصدير Word احترافي ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (!window.lastAuditData) { alert(T('s110')); return; }
        showLoading(T('s139'), T('s140'));
        try {
            const data = window.lastAuditData;
            const now = new Date();
            const dateStr = now.toLocaleDateString(FG.locale());

            // التقاط صورة منطقة النتائج
            const resultArea = document.getElementById('resultArea');
            let resultImg = '';
            if (resultArea) {
                try {
                    const origBg = resultArea.style.backgroundColor;
                    resultArea.style.backgroundColor = '#ffffff';
                    const canvas = await html2canvas(resultArea, { scale: 2, backgroundColor: '#ffffff' });
                    resultArea.style.backgroundColor = origBg;
                    resultImg = canvas.toDataURL('image/png');
                } catch(e) {}
            }

            let itemsHTML = '';
            data.details.forEach(item => {
                const statusColor = item.status ? '#155724' : '#721c24';
                const statusText = item.status ? T('s127') : T('s128');
                itemsHTML += `
                    <tr>
                        <td style="border:1px solid #b8860b;padding:8px;text-align:right;">${item.label}</td>
                        <td style="border:1px solid #b8860b;padding:8px;text-align:center;color:${statusColor};font-weight:bold;">${statusText}</td>
                        <td style="border:1px solid #b8860b;padding:8px;text-align:center;">${item.risk}</td>
                        <td style="border:1px solid #b8860b;padding:8px;text-align:center;">${item.note || '-'}</td>
                        <td style="border:1px solid #b8860b;padding:8px;text-align:right;">${item.status ? '-' : item.recommendation}</td>
                    </tr>
                `;
            });

            const fullHtml = `${T('s141')}${data.date}${T('s142')}${data.inspector}${T('s143')}${dateStr}</p>
                </div>
                ${resultImg ? `<div style="text-align:center;margin:20px 0;"><img src="${resultImg}" style="max-width:100%;border:1px solid #b8860b;border-radius:10px;" /></div>` : ''}${T('s144')}${data.percent}% - ${data.evaluation}${T('s145')}${data.overallRiskLevel}${T('s146')}${itemsHTML}${T('s147')}${data.signatureName}${T('s148')}${data.signature || '________________'}${T('s149')}${now.getFullYear()} | www.farouk-grup.com</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${T('s137')}${data.date}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert(T('s150') + err.message); } finally { hideLoading(); }
    });

    // ===== تهيئة أولية =====
    document.getElementById('checkDate').value = new Date().toISOString().split('T')[0];
    setupRecommendations();
