
    AOS.init({ duration: 800, once: true, offset: 100 });

    // ===== Calculator =====
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
            } catch(e) { calcDisplay.value = 'Error'; currentCalcInput = ''; }
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

    // ===== Loading functions =====
    function showLoading(title, msg) {
        document.getElementById('loadingTitle').textContent = title;
        document.getElementById('loadingMsg').textContent = msg;
        document.getElementById('exportLoading').classList.add('show');
    }
    function hideLoading() {
        document.getElementById('exportLoading').classList.remove('show');
    }

    // ===== Recommendations data =====
    const correctiveActions = {
        sop1_1: { risk: "High", action: "Reject goods if temperature exceeds 4°C for chilled or -18°C for frozen.", recommendation: "Use a calibrated thermometer and record temperature. If high, reject shipment immediately." },
        sop1_2: { risk: "Medium", action: "Damaged packaging may cause contamination.", recommendation: "Inspect packaging upon receipt. If damaged, return or use immediately." },
        sop1_3: { risk: "High", action: "Expired products must not be used.", recommendation: "Check dates before acceptance. Any expired product must be rejected." },
        sop1_4: { risk: "Medium", action: "High-risk products need health certificates.", recommendation: "Request certificates from the supplier and keep on file." },
        sop1_5: { risk: "Medium", action: "Raw materials may contaminate ready-to-eat products.", recommendation: "Allocate separate areas for raw and ready-to-eat items." },
        sop1_6: { risk: "Low", action: "Failure to record receiving data may result in lost information.", recommendation: "Ensure the receiving log is completed daily." },
        sop2_1: { risk: "Medium", action: "Dry storage temperature is not suitable.", recommendation: "Install a thermometer and record readings daily." },
        sop2_2: { risk: "Low", action: "Low shelves make cleaning difficult.", recommendation: "Raise shelves to 15-20 cm above the floor." },
        sop2_3: { risk: "High", action: "Failure to record refrigerator temperature may lead to food spoilage.", recommendation: "Record temperature twice daily." },
        sop2_4: { risk: "High", action: "High freezer temperature spoils food.", recommendation: "Monitor and record temperature daily." },
        sop2_5: { risk: "Medium", action: "Storing raw above cooked products causes contamination.", recommendation: "Ensure raw items are placed on lower shelves." },
        sop2_6: { risk: "High", action: "Chemicals near food is dangerous.", recommendation: "Designate a separate location for chemicals." },
        sop2_7: { risk: "Low", action: "Not implementing FIFO may lead to expiration.", recommendation: "Train staff on FIFO." },
        sop2_8: { risk: "Medium", action: "Overstocking prevents airflow.", recommendation: "Leave space between products." },
        sop3_1: { risk: "High", action: "Not washing hands transfers contaminants.", recommendation: "Ensure hands are washed for 20 seconds." },
        sop3_2: { risk: "High", action: "Using one board causes cross-contamination.", recommendation: "Dedicate separate cutting boards." },
        sop3_3: { risk: "High", action: "Not sanitizing tools contaminates food.", recommendation: "Sanitize tools immediately after use." },
        sop3_4: { risk: "High", action: "Leaving food outside refrigeration promotes bacterial growth.", recommendation: "Return food to refrigeration immediately." },
        sop3_5: { risk: "Medium", action: "Thawing at room temperature promotes bacterial growth.", recommendation: "Thaw in the refrigerator or microwave." },
        sop3_6: { risk: "Medium", action: "Uncovered food may become contaminated.", recommendation: "Cover food during preparation." },
        sop3_7: { risk: "Medium", action: "Unwashed vegetables carry contaminants.", recommendation: "Wash vegetables thoroughly." },
        sop4_1: { risk: "High", action: "Undercooked poultry may contain Salmonella.", recommendation: "Cook poultry to 74°C." },
        sop4_2: { risk: "High", action: "Ground meat needs 71°C.", recommendation: "Use a thermometer." },
        sop4_3: { risk: "High", action: "Undercooked fish may contain parasites.", recommendation: "Cook fish to 63°C." },
        sop4_4: { risk: "High", action: "Inadequate reheating does not kill bacteria.", recommendation: "Reheat to 74°C." },
        sop4_5: { risk: "Medium", action: "Not recording temperatures makes tracing difficult.", recommendation: "Record cooking temperatures." },
        sop4_6: { risk: "Medium", action: "Reheating food more than once spoils it.", recommendation: "Do not reheat food more than once." },
        sop5_1: { risk: "High", action: "Preparing plates with unwashed hands contaminates food.", recommendation: "Wash hands thoroughly before service." },
        sop5_2: { risk: "High", action: "Dirty utensils transfer contamination.", recommendation: "Ensure utensils are clean." },
        sop5_3: { risk: "High", action: "Cold food promotes bacterial growth.", recommendation: "Use hot-holding equipment." },
        sop5_4: { risk: "High", action: "Cold food must remain below 4°C.", recommendation: "Use refrigerated display units." },
        sop5_5: { risk: "Medium", action: "Touching food with bare hands transfers contaminants.", recommendation: "Use gloves or utensils." },
        sop5_6: { risk: "Medium", action: "Uncovered food is exposed to contamination.", recommendation: "Use transparent covers." },
        sop6_1: { risk: "High", action: "Slow cooling allows bacterial growth.", recommendation: "Cool food from 60°C to 20°C within 2 hours." },
        sop6_2: { risk: "High", action: "The second phase of cooling is essential.", recommendation: "Complete cooling to 4°C." },
        sop6_3: { risk: "Medium", action: "Deep containers slow cooling.", recommendation: "Use shallow containers." },
        sop6_4: { risk: "Medium", action: "Uncovered food becomes contaminated.", recommendation: "Cover food and label with production date." },
        sop6_5: { risk: "High", action: "Placing hot food in the refrigerator raises its temperature.", recommendation: "Cool food first." },
        sop6_6: { risk: "High", action: "Lack of monitoring loses control.", recommendation: "Record temperatures daily." },
        sop7_1: { risk: "High", action: "Dirty uniforms transfer dirt.", recommendation: "Provide clean uniforms daily." },
        sop7_2: { risk: "High", action: "Hair may fall into food.", recommendation: "Enforce the use of hair covers." },
        sop7_3: { risk: "Medium", action: "Jewelry harbors bacteria.", recommendation: "Prohibit wearing jewelry." },
        sop7_4: { risk: "Medium", action: "Long nails hide bacteria.", recommendation: "Emphasize nail trimming." },
        sop7_5: { risk: "High", action: "Sick workers transmit diseases.", recommendation: "Require reporting of any symptoms." },
        sop7_6: { risk: "High", action: "Not washing hands transfers germs.", recommendation: "Provide handwashing stations and instructions." },
        sop7_7: { risk: "Medium", action: "Lack of sanitizer reduces hygiene.", recommendation: "Provide alcohol-based sanitizers." },
        sop8_1: { risk: "High", action: "Unclean surfaces contaminate food.", recommendation: "Clean and sanitize work surfaces." },
        sop8_2: { risk: "High", action: "Dirty sinks spread bacteria.", recommendation: "Clean sinks daily." },
        sop8_3: { risk: "Medium", action: "Food debris attracts pests.", recommendation: "Clean floors immediately." },
        sop8_4: { risk: "High", action: "Unapproved products do not sanitize.", recommendation: "Use approved products." },
        sop8_5: { risk: "Medium", action: "No cleaning schedule leads to buildup.", recommendation: "Create a cleaning schedule and sign it." },
        sop8_6: { risk: "Medium", action: "Dirty hoods contaminate air.", recommendation: "Clean hoods regularly." },
        sop8_7: { risk: "High", action: "Washing with cold water does not sanitize.", recommendation: "Ensure 60°C temperature." },
        sop9_1: { risk: "High", action: "Presence of pests indicates hygiene issues.", recommendation: "Inspect the facility daily." },
        sop9_2: { risk: "Medium", action: "Gaps allow insects to enter.", recommendation: "Seal all gaps." },
        sop9_3: { risk: "Medium", action: "No traps allow pest multiplication.", recommendation: "Install light traps." },
        sop9_4: { risk: "Medium", action: "Professional pest control is essential.", recommendation: "Maintain a contract with a pest control company." },
        sop9_5: { risk: "High", action: "Accumulated waste attracts pests.", recommendation: "Dispose of waste immediately." },
        sop10_1: { risk: "High", action: "Not recording makes tracking impossible.", recommendation: "Record temperatures daily." },
        sop10_2: { risk: "High", action: "Cooking temperatures are essential for safety.", recommendation: "Record them in a dedicated log." },
        sop10_3: { risk: "Medium", action: "Loss of receiving records hinders traceability.", recommendation: "Keep records for 6 months." },
        sop10_4: { risk: "Low", action: "Signature ensures accountability.", recommendation: "Require manager's signature." },
        sop10_5: { risk: "High", action: "Untrained staff lack safety knowledge.", recommendation: "Provide training courses." },
        sop10_6: { risk: "Medium", action: "Lack of instructions leads to forgetfulness.", recommendation: "Post clear instructions." },
        sop10_7: { risk: "Low", action: "Meetings remind staff.", recommendation: "Hold weekly meetings." }
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
                        recBox.innerHTML = `<strong>⚠️ Risk Level: ${data.risk}</strong><br><strong>Corrective Action:</strong> ${data.action}<br><strong>Recommendation:</strong> ${data.recommendation}`;
                    }
                } else {
                    recBox.style.display = 'none';
                }
            });
        });
    }

    // ===== Collect audit data =====
    function collectAuditData() {
        const date = document.getElementById('checkDate').value;
        const inspector = document.getElementById('inspectorName').value || 'Not specified';
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
        const percent = Math.round((checked / total) * 100);
        let evaluation = '', overallRiskLevel = '';
        if (percent === 100) { evaluation = 'Excellent! Full compliance'; overallRiskLevel = 'Low'; }
        else if (percent >= 90) { evaluation = 'Very Good'; overallRiskLevel = 'Low'; }
        else if (percent >= 75) { evaluation = 'Acceptable'; overallRiskLevel = 'Medium'; }
        else if (percent >= 50) { evaluation = 'Needs Improvement'; overallRiskLevel = 'High'; }
        else { evaluation = 'Non-compliant'; overallRiskLevel = 'Very High'; }
        return { date, inspector, signatureName, signature, details, checked, total, percent, evaluation, overallRiskLevel };
    }

    // ===== Calculate result =====
    document.getElementById('calculateBtn').addEventListener('click', function() {
        const data = collectAuditData();
        document.getElementById('resultArea').style.display = 'flex';
        document.getElementById('scoreDisplay').textContent = data.percent + '%';
        document.getElementById('evaluationText').textContent = data.evaluation;
        const riskEl = document.getElementById('overallRiskDisplay');
        riskEl.textContent = `Overall Risk Level: ${data.overallRiskLevel}`;
        riskEl.className = 'overall-risk ' + (data.overallRiskLevel.includes('Low') ? 'risk-level-low' : (data.overallRiskLevel.includes('Medium') ? 'risk-level-medium' : 'risk-level-high'));
        window.lastAuditData = data;
    });

    // ================================================================
    // ========== Export to Excel ==========
    // ================================================================
    document.getElementById('exportExcelBtn').addEventListener('click', async function() {
        if (!window.lastAuditData) { alert('Please run the analysis first (click "Calculate Results").'); return; }
        showLoading('Generating Excel report...', 'Creating sheets');
        try {
            const data = window.lastAuditData;
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'FAROUK GRUP';
            const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050';
            const AR = 'FFF5F0E8', DT = 'FF1A1A1A', PB = 'FFD4EDDA', NB = 'FFF8D7DA';
            const PT = 'FF155724', NT = 'FF721C24', GB = 'FFFFF3CD';

            function hs(bg=HB, tc=GL){return{font:{name:'Arial',bold:true,size:11,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',wrapText:true},border:{top:{style:'thin',color:{argb:G}},bottom:{style:'thin',color:{argb:G}},left:{style:'thin',color:{argb:G}},right:{style:'thin',color:{argb:G}}}};}
            function cs(bg='FFFFFFFF',tc=DT,b=false,h='center'){return{font:{name:'Arial',bold:b,size:10,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:h,vertical:'middle',wrapText:true},border:{top:{style:'hair',color:{argb:'FFCCCCCC'}},bottom:{style:'hair',color:{argb:'FFCCCCCC'}},left:{style:'hair',color:{argb:'FFCCCCCC'}},right:{style:'hair',color:{argb:'FFCCCCCC'}}}};}
            function ap(c,s){if(s.font)c.font=s.font;if(s.fill)c.fill=s.fill;if(s.alignment)c.alignment=s.alignment;if(s.border)c.border=s.border;if(s.numFmt)c.numFmt=s.numFmt;}
            function mh(ws,fc,tc,r,text,bg=HB,tc2=GL,fs=12){ws.mergeCells(r,fc,r,tc);const c=ws.getCell(r,fc);c.value=text;c.font={name:'Arial',bold:true,size:fs,color:{argb:tc2}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true};c.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};}

            // 1. Cover
            const cv = workbook.addWorksheet('Cover Page', { views: [{ showGridLines: false }] });
            [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
            cv.getRow(2).height=80; cv.getRow(4).height=60;
            cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1);
            bc.value='FAROUK GRUP\nConsulting & Business';
            bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true};
            mh(cv,1,4,4,`SOPs Audit Report\n${data.inspector}`,DB,GL,18);
            const inf=[['📋 Date',data.date],['👤 Inspector',data.inspector],['📊 Compliance',`${data.percent}%`],['⚠️ Overall Risk',data.overallRiskLevel]];
            let ir=6;
            inf.forEach(([l,v],idx)=>{
                cv.mergeCells(ir,1,ir,2); cv.mergeCells(ir,3,ir,4);
                const lc=cv.getCell(ir,1), vc=cv.getCell(ir,3); lc.value=l; vc.value=v;
                const bg=idx%2===0?AR:'FFFEFCF6';
                ap(lc,{font:{name:'Arial',bold:true,size:11,color:{argb:'00695C'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'right',vertical:'middle'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                ap(vc,{font:{name:'Arial',size:11,color:{argb:DT}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                cv.getRow(ir).height=28; ir++;
            });

            // 2. Audit details
            const detailSheet = workbook.addWorksheet('Audit Details', { views: [{ showGridLines: false }] });
            detailSheet.getColumn(1).width = 5; detailSheet.getColumn(2).width = 50; detailSheet.getColumn(3).width = 15; detailSheet.getColumn(4).width = 20; detailSheet.getColumn(5).width = 30; detailSheet.getColumn(6).width = 5;
            mh(detailSheet,1,6,1,'📋 SOPs Checklist',DB,GL,14);
            detailSheet.getRow(1).height=40;
            detailSheet.addRow(['Item', 'Status', 'Risk Level', 'Notes', 'Recommendation']);
            const headerRow = detailSheet.getRow(2);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
            data.details.forEach(item => {
                detailSheet.addRow([item.label, item.status ? '✅ Compliant' : '❌ Non-compliant', item.risk, item.note, item.status ? '' : item.recommendation]);
            });

            // 3. Summary
            const summarySheet = workbook.addWorksheet('Summary', { views: [{ showGridLines: false }] });
            summarySheet.getColumn(1).width = 30; summarySheet.getColumn(2).width = 40;
            mh(summarySheet,1,2,1,'📊 Audit Summary',DB,GL,14);
            summarySheet.getRow(1).height=40;
            const summaryData = [
                ['Compliance Percentage', `${data.percent}%`],
                ['Evaluation', data.evaluation],
                ['Overall Risk Level', data.overallRiskLevel],
                ['Compliant Items', data.checked],
                ['Total Items', data.total],
                ['Manager Signature', `${data.signatureName} - ${data.signature || '__________'}`]
            ];
            summaryData.forEach((row,idx) => {
                const r = idx + 3;
                const lc = summarySheet.getCell(r,1); lc.value = row[0]; ap(lc, cs(idx%2===0?'FFFEFCF6':'FFFFFFFF',DT,true,'left'));
                const vc = summarySheet.getCell(r,2); vc.value = row[1]; ap(vc, cs(idx%2===0?'FFFEFCF6':'FFFFFFFF',DT,false,'center'));
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const now = new Date();
            const fileName = `SOPs_${data.date}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert('Excel Error: ' + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== Export to Word ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (!window.lastAuditData) { alert('Please run the analysis first (click "Calculate Results").'); return; }
        showLoading('Generating Word report...', 'Collecting data');
        try {
            const data = window.lastAuditData;
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US');

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
                const statusText = item.status ? '✅ Compliant' : '❌ Non-compliant';
                itemsHTML += `
                    <tr>
                        <td style="border:1px solid #b8860b;padding:8px;text-align:left;">${item.label}</td>
                        <td style="border:1px solid #b8860b;padding:8px;text-align:center;color:${statusColor};font-weight:bold;">${statusText}</td>
                        <td style="border:1px solid #b8860b;padding:8px;text-align:center;">${item.risk}</td>
                        <td style="border:1px solid #b8860b;padding:8px;text-align:center;">${item.note || '-'}</td>
                        <td style="border:1px solid #b8860b;padding:8px;text-align:left;">${item.status ? '-' : item.recommendation}</td>
                    </tr>
                `;
            });

            const fullHtml = `<!DOCTYPE html>
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
            <head><meta charset='utf-8'><title>SOPs Audit Report - FAROUK GRUP</title>
            <style>
                body{font-family:'Arial',sans-serif;direction:ltr;margin:2rem;background:#fff;color:#333;}
                .cover{text-align:center;border-bottom:4px solid #b8860b;margin-bottom:30px;padding-bottom:20px;}
                .cover h1{font-size:32px;color:#b8860b;margin:0;}
                .cover h2{font-size:24px;color:#b48554;margin:5px 0;}
                .cover p{color:#666;}
                table{width:100%;border-collapse:collapse;margin:20px 0;} th,td{border:1px solid #b8860b;padding:8px;text-align:center;}
                th{background:#fefcf6;color:#b8860b;font-weight:bold;}
                .signature{margin-top:40px;display:flex;justify-content:space-between;flex-wrap:wrap;}
                .chart-img{max-width:100%;border:1px solid #b8860b;border-radius:10px;margin:20px 0;}
                .footer{text-align:center;margin-top:40px;color:#888;border-top:1px dashed #b8860b;padding-top:10px;}
            </style></head>
            <body>
                <div class="cover">
                    <h1>FAROUK GRUP</h1>
                    <h2>📋 SOPs Audit Report</h2>
                    <p>Date: ${data.date} | Inspector: ${data.inspector}</p>
                    <p>Report Generated: ${dateStr}</p>
                </div>
                ${resultImg ? `<div style="text-align:center;margin:20px 0;"><img src="${resultImg}" style="max-width:100%;border:1px solid #b8860b;border-radius:10px;" /></div>` : ''}
                <h2 style="color:#b8860b;">Audit Result: ${data.percent}% - ${data.evaluation}</h2>
                <h3 style="color:#b8860b;">Overall Risk Level: ${data.overallRiskLevel}</h3>
                <table>
                    <thead><tr><th style="background:#fefcf6;color:#b8860b;border:1px solid #b8860b;padding:8px;">Item</th><th style="background:#fefcf6;color:#b8860b;border:1px solid #b8860b;padding:8px;">Status</th><th style="background:#fefcf6;color:#b8860b;border:1px solid #b8860b;padding:8px;">Risk Level</th><th style="background:#fefcf6;color:#b8860b;border:1px solid #b8860b;padding:8px;">Notes</th><th style="background:#fefcf6;color:#b8860b;border:1px solid #b8860b;padding:8px;">Recommendation</th></tr></thead>
                    <tbody>${itemsHTML}</tbody>
                </table>
                <div class="signature">
                    <div><strong>Inspector Name:</strong> ${data.signatureName}</div>
                    <div><strong>Signature:</strong> ${data.signature || '________________'}</div>
                </div>
                <div class="footer">Generated by FAROUK GRUP © ${now.getFullYear()} | www.farouk-grup.com</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `SOPs_${data.date}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert('Word Error: ' + err.message); } finally { hideLoading(); }
    });

    // ===== Initial setup =====
    document.getElementById('checkDate').value = new Date().toISOString().split('T')[0];
    setupRecommendations();
