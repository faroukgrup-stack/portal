
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
        sop1_1: { risk: T('s2'), action: T('s3'), recommendation: T('s4') },
        sop1_2: { risk: T('s5'), action: T('s6'), recommendation: T('s7') },
        sop1_3: { risk: T('s2'), action: T('s8'), recommendation: T('s9') },
        sop1_4: { risk: T('s5'), action: T('s10'), recommendation: T('s11') },
        sop1_5: { risk: T('s5'), action: T('s12'), recommendation: T('s13') },
        sop1_6: { risk: T('s14'), action: T('s15'), recommendation: T('s16') },
        sop2_1: { risk: T('s5'), action: T('s17'), recommendation: T('s18') },
        sop2_2: { risk: T('s14'), action: T('s19'), recommendation: T('s20') },
        sop2_3: { risk: T('s2'), action: T('s21'), recommendation: T('s22') },
        sop2_4: { risk: T('s2'), action: T('s23'), recommendation: T('s24') },
        sop2_5: { risk: T('s5'), action: T('s25'), recommendation: T('s26') },
        sop2_6: { risk: T('s2'), action: T('s27'), recommendation: T('s28') },
        sop2_7: { risk: T('s14'), action: T('s29'), recommendation: T('s30') },
        sop2_8: { risk: T('s5'), action: T('s31'), recommendation: T('s32') },
        sop3_1: { risk: T('s2'), action: T('s33'), recommendation: T('s34') },
        sop3_2: { risk: T('s2'), action: T('s35'), recommendation: T('s36') },
        sop3_3: { risk: T('s2'), action: T('s37'), recommendation: T('s38') },
        sop3_4: { risk: T('s2'), action: T('s39'), recommendation: T('s40') },
        sop3_5: { risk: T('s5'), action: T('s41'), recommendation: T('s42') },
        sop3_6: { risk: T('s5'), action: T('s43'), recommendation: T('s44') },
        sop3_7: { risk: T('s5'), action: T('s45'), recommendation: T('s46') },
        sop4_1: { risk: T('s2'), action: T('s47'), recommendation: T('s48') },
        sop4_2: { risk: T('s2'), action: T('s49'), recommendation: T('s50') },
        sop4_3: { risk: T('s2'), action: T('s51'), recommendation: T('s52') },
        sop4_4: { risk: T('s2'), action: T('s53'), recommendation: T('s54') },
        sop4_5: { risk: T('s5'), action: T('s55'), recommendation: T('s56') },
        sop4_6: { risk: T('s5'), action: T('s57'), recommendation: T('s58') },
        sop5_1: { risk: T('s2'), action: T('s59'), recommendation: T('s60') },
        sop5_2: { risk: T('s2'), action: T('s61'), recommendation: T('s62') },
        sop5_3: { risk: T('s2'), action: T('s63'), recommendation: T('s64') },
        sop5_4: { risk: T('s2'), action: T('s65'), recommendation: T('s66') },
        sop5_5: { risk: T('s5'), action: T('s67'), recommendation: T('s68') },
        sop5_6: { risk: T('s5'), action: T('s69'), recommendation: T('s70') },
        sop6_1: { risk: T('s2'), action: T('s71'), recommendation: T('s72') },
        sop6_2: { risk: T('s2'), action: T('s73'), recommendation: T('s74') },
        sop6_3: { risk: T('s5'), action: T('s75'), recommendation: T('s76') },
        sop6_4: { risk: T('s5'), action: T('s77'), recommendation: T('s78') },
        sop6_5: { risk: T('s2'), action: T('s79'), recommendation: T('s80') },
        sop6_6: { risk: T('s2'), action: T('s81'), recommendation: T('s82') },
        sop7_1: { risk: T('s2'), action: T('s83'), recommendation: T('s84') },
        sop7_2: { risk: T('s2'), action: T('s85'), recommendation: T('s86') },
        sop7_3: { risk: T('s5'), action: T('s87'), recommendation: T('s88') },
        sop7_4: { risk: T('s5'), action: T('s89'), recommendation: T('s90') },
        sop7_5: { risk: T('s2'), action: T('s91'), recommendation: T('s92') },
        sop7_6: { risk: T('s2'), action: T('s93'), recommendation: T('s94') },
        sop7_7: { risk: T('s5'), action: T('s95'), recommendation: T('s96') },
        sop8_1: { risk: T('s2'), action: T('s97'), recommendation: T('s98') },
        sop8_2: { risk: T('s2'), action: T('s99'), recommendation: T('s100') },
        sop8_3: { risk: T('s5'), action: T('s101'), recommendation: T('s102') },
        sop8_4: { risk: T('s2'), action: T('s103'), recommendation: T('s104') },
        sop8_5: { risk: T('s5'), action: T('s105'), recommendation: T('s106') },
        sop8_6: { risk: T('s5'), action: T('s107'), recommendation: T('s108') },
        sop8_7: { risk: T('s2'), action: T('s109'), recommendation: T('s110') },
        sop9_1: { risk: T('s2'), action: T('s111'), recommendation: T('s112') },
        sop9_2: { risk: T('s5'), action: T('s113'), recommendation: T('s114') },
        sop9_3: { risk: T('s5'), action: T('s115'), recommendation: T('s116') },
        sop9_4: { risk: T('s5'), action: T('s117'), recommendation: T('s118') },
        sop9_5: { risk: T('s2'), action: T('s119'), recommendation: T('s120') },
        sop10_1: { risk: T('s2'), action: T('s121'), recommendation: T('s82') },
        sop10_2: { risk: T('s2'), action: T('s122'), recommendation: T('s123') },
        sop10_3: { risk: T('s5'), action: T('s124'), recommendation: T('s125') },
        sop10_4: { risk: T('s14'), action: T('s126'), recommendation: T('s127') },
        sop10_5: { risk: T('s2'), action: T('s128'), recommendation: T('s129') },
        sop10_6: { risk: T('s5'), action: T('s130'), recommendation: T('s131') },
        sop10_7: { risk: T('s14'), action: T('s132'), recommendation: T('s133') }
    };

    function setupRecommendations() {
        document.querySelectorAll('.sop-item').forEach(item => {
            item.addEventListener('change', function() {
                const id = this.dataset.id;
                const recBox = document.getElementById(`recommendation-${id}`);
                if (!this.checked) {
                    const data = correctiveActions[id];
                    if (data) {
                        recBox.style.display = 'block';
                        recBox.innerHTML = `${T('s134')}${data.risk}${T('s135')}${data.action}${T('s136')}${data.recommendation}`;
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
        const inspector = document.getElementById('inspectorName').value || T('s137');
        const signatureName = document.getElementById('signatureName').value || inspector;
        const signature = document.getElementById('signature').value || '';
        const items = document.querySelectorAll('.sop-item');
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
        const S = await FG.calc('tool15', 'score', { checked, total });
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
        riskEl.textContent = `${T('s144')}${data.overallRiskLevel}`;
        riskEl.className = 'overall-risk ' + (data.overallRiskLevel.includes(T('s14')) ? 'risk-level-low' : (data.overallRiskLevel.includes(T('s5')) ? 'risk-level-medium' : 'risk-level-high'));
        window.lastAuditData = data;
    });

    // ================================================================
    // ========== تصدير Excel احترافي ==========
    // ================================================================
    document.getElementById('exportExcelBtn').addEventListener('click', async function() {
        if (!window.lastAuditData) { alert(T('s145')); return; }
        showLoading(T('s146'), T('s147'));
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
            const cv = workbook.addWorksheet(T('s148'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
            cv.getRow(2).height=80; cv.getRow(4).height=60;
            cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1);
            bc.value=T('s149');
            bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};
            mh(cv,1,4,4,`${T('s150')}${data.inspector}`,DB,GL,18);
            const inf=[[T('s151'),data.date],[T('s152'),data.inspector],[T('s153'),`${data.percent}%`],[T('s154'),data.overallRiskLevel]];
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
            const detailSheet = workbook.addWorksheet(T('s155'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            detailSheet.getColumn(1).width = 5; detailSheet.getColumn(2).width = 50; detailSheet.getColumn(3).width = 15; detailSheet.getColumn(4).width = 20; detailSheet.getColumn(5).width = 30; detailSheet.getColumn(6).width = 5;
            mh(detailSheet,1,6,1,T('s156'),DB,GL,14);
            detailSheet.getRow(1).height=40;
            detailSheet.addRow([T('s157'), T('s158'), T('s159'), T('s160'), T('s161')]);
            const headerRow = detailSheet.getRow(2);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
            data.details.forEach(item => {
                detailSheet.addRow([item.label, item.status ? T('s162') : T('s163'), item.risk, item.note, item.status ? '' : item.recommendation]);
            });

            // 3. ملخص النتائج
            const summarySheet = workbook.addWorksheet(T('s164'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            summarySheet.getColumn(1).width = 30; summarySheet.getColumn(2).width = 40;
            mh(summarySheet,1,2,1,T('s165'),DB,GL,14);
            summarySheet.getRow(1).height=40;
            const summaryData = [
                [T('s166'), `${data.percent}%`],
                [T('s167'), data.evaluation],
                [T('s168'), data.overallRiskLevel],
                [T('s169'), data.checked],
                [T('s170'), data.total],
                [T('s171'), `${data.signatureName} - ${data.signature || '__________'}`]
            ];
            summaryData.forEach((row,idx) => {
                const r = idx + 3;
                const lc = summarySheet.getCell(r,1); lc.value = row[0]; ap(lc, cs(idx%2===0?'FFFEFCF6':'FFFFFFFF',DT,true,FG.start()));
                const vc = summarySheet.getCell(r,2); vc.value = row[1]; ap(vc, cs(idx%2===0?'FFFEFCF6':'FFFFFFFF',DT,false,'center'));
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const now = new Date();
            const fileName = `${T('s172')}${data.date}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert(T('s173') + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== تصدير Word احترافي ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (!window.lastAuditData) { alert(T('s145')); return; }
        showLoading(T('s174'), T('s175'));
        try {
            const data = window.lastAuditData;
            const now = new Date();
            const dateStr = now.toLocaleDateString(FG.locale());

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
                const statusText = item.status ? T('s162') : T('s163');
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

            const fullHtml = `${T('s176')}${data.date}${T('s177')}${data.inspector}${T('s178')}${dateStr}</p>
                </div>
                ${resultImg ? `<div style="text-align:center;margin:20px 0;"><img src="${resultImg}" style="max-width:100%;border:1px solid #b8860b;border-radius:10px;" /></div>` : ''}${T('s179')}${data.percent}% - ${data.evaluation}${T('s180')}${data.overallRiskLevel}${T('s181')}${itemsHTML}${T('s182')}${data.signatureName}${T('s183')}${data.signature || '________________'}${T('s184')}${now.getFullYear()} | www.farouk-grup.com</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${T('s172')}${data.date}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert(T('s185') + err.message); } finally { hideLoading(); }
    });

    // ===== تهيئة أولية =====
    document.getElementById('checkDate').value = new Date().toISOString().split('T')[0];
    setupRecommendations();
