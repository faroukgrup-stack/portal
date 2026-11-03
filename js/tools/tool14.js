
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

    // ===== بيانات التوصيات =====
    const correctiveActions = {
        rec1: { risk: "مرتفع", action: "يجب رفض المواد إذا كانت درجة حرارتها أعلى من 4°C للمبردة أو -18°C للمجمدة.", recommendation: "استخدم مقياس حرارة معاير وسجل درجة الحرارة. إذا كانت مرتفعة، أعِد الشحنة فوراً." },
        rec2: { risk: "متوسط", action: "العبوات التالفة قد تسبب تلوثاً. يجب عزل المواد ذات العبوات التالفة.", recommendation: "افحص العبوات عند الاستلام. إذا وجدت تالفة، أعدها أو استخدمها فوراً بعد التأكد." },
        rec3: { risk: "مرتفع", action: "المواد منتهية الصلاحية يجب عدم استخدامها أبداً.", recommendation: "تحقق من التواريخ قبل الاستلام. أي مادة منتهية يجب رفضها." },
        rec4: { risk: "متوسط", action: "المواد عالية الخطورة (لحوم، دواجن) تحتاج شهادة صحية.", recommendation: "اطلب الشهادة من المورد واحتفظ بها في الملف." },
        rec5: { risk: "متوسط", action: "المواد النيئة قد تلوث الجاهزة إذا لم تفصل.", recommendation: "خصص منطقة منفصلة في شاحنة التوصيل للمواد النيئة والجاهزة." },
        sto1: { risk: "مرتفع", action: "درجة حرارة الثلاجة يجب أن تكون ≤ 4°C لمنع نمو البكتيريا.", recommendation: "افحص درجة الحرارة وسجلها يومياً. إذا كانت مرتفعة، اضبط الثلاجة أو استدع فني صيانة." },
        sto2: { risk: "مرتفع", action: "درجة حرارة المجمد يجب أن تكون ≤ -18°C.", recommendation: "سجل درجة الحرارة مرتين يومياً. أي ارتفاع يستدعي فحص الجهاز." },
        sto3: { risk: "متوسط", action: "المواد النيئة تحت المواد المطبوخة تمنع تسرب السوائل.", recommendation: "أعد تنظيم الرفوف بحيث تكون المواد النيئة في الأسفل." },
        sto4: { risk: "مرتفع", action: "المواد الكيميائية يجب تخزينها بعيداً عن الغذاء.", recommendation: "خصص خزانة منفصلة ومغلقة للمواد الكيميائية." },
        sto5: { risk: "متوسط", action: "تراكم الثلج يقلل كفاءة التبريد.", recommendation: "قم بإزالة الثلج بشكل دوري ونظف الثلاجات." },
        sto6: { risk: "متوسط", action: "FIFO يمنع انتهاء الصلاحية.", recommendation: "ضع المواد الجديدة خلف القديمة، وأشر على العبوات بالتاريخ." },
        prep1: { risk: "مرتفع", action: "غسل اليدين يمنع التلوث المتبادل.", recommendation: "وفر محطات غسل يدين بالقرب من مناطق التحضير، وراقب الالتزام." },
        prep2: { risk: "مرتفع", action: "استخدام ألواح منفصلة يمنع انتقال البكتيريا.", recommendation: "استخدم ألواح ملونة مختلفة (أحمر للحوم، أخضر للخضار، إلخ)." },
        prep3: { risk: "مرتفع", action: "تعقيم الأدوات بعد المواد النيئة ضروري.", recommendation: "استخدم معقمات معتمدة واتبع تعليمات التركيز." },
        prep4: { risk: "مرتفع", action: "الأطعمة القابلة للتلف لا تترك خارج التبريد أكثر من ساعتين.", recommendation: "تأكد من إعادة الأطعمة سريعاً إلى الثلاجة أو استخدم طاولات مبردة." },
        prep5: { risk: "مرتفع", action: "إذابة الأغذية في درجة حرارة الغرفة يسمح بنمو البكتيريا.", recommendation: "خطط مسبقاً وضع الأغذية في الثلاجة ليلة كاملة، أو استخدم الميكروويف." },
        cook1: { risk: "مرتفع", action: "عدم وصول الدواجن إلى 74°C يعني بقاء البكتيريا الضارة.", recommendation: "استخدم مقياس حرارة الطعام وسجل درجة الحرارة في منتصف القطعة." },
        cook2: { risk: "مرتفع", action: "اللحوم المفرومة تحتاج 71°C لقتل البكتيريا.", recommendation: "لا تعتمد على اللون، استخدم مقياس الحرارة دائماً." },
        cook3: { risk: "مرتفع", action: "الأسماك تحتاج 63°C.", recommendation: "تأكد من وصول السمك لدرجة الحرارة المناسبة." },
        cook4: { risk: "مرتفع", action: "إعادة التسخين غير الكافية تسمح بنمو البكتيريا.", recommendation: "أعد التسخين إلى 74°C خلال ساعتين." },
        cook5: { risk: "متوسط", action: "تسجيل درجات الحرارة مهم للتوثيق.", recommendation: "احتفظ بسجل يومي لدرجات حرارة الطهي." },
        cool1: { risk: "مرتفع", action: "التبريد البطيء يسمح بنمو البكتيريا.", recommendation: "استخدم أوعية ضحلة، وضعها في حمام ثلج، أو استخدم مبرّد سريع." },
        cool2: { risk: "مرتفع", action: "يجب إكمال التبريد إلى 4°C خلال 6 ساعات إجمالاً.", recommendation: "راقب الوقت ودرجة الحرارة، واستخدم أدوات تبريد مناسبة." },
        cool3: { risk: "متوسط", action: "الأوعية الضحلة تساعد على التبريد السريع.", recommendation: "استخدم أواني بعمق أقل من 10 سم." },
        cool4: { risk: "متوسط", action: "تغطية الأطعمة تمنع التلوث والجفاف.", recommendation: "استخدم أغطية بلاستيكية أو أطباق تغطية." },
        per1: { risk: "متوسط", action: "الزي النظيف يمنع نقل الملوثات.", recommendation: "وفر زياً نظيفاً يومياً، واستخدم مئزراً نظيفاً." },
        per2: { risk: "متوسط", action: "تغطية الشعر تمنع سقوطه في الطعام.", recommendation: "وفر شبكات شعر للجميع، وراقب الالتزام." },
        per3: { risk: "منخفض", action: "المجوهرات قد تؤوي البكتيريا أو تسقط في الطعام.", recommendation: "اطلب من الموظفين خلعها قبل البدء." },
        per4: { risk: "منخفض", action: "الأظافر الطويلة أو المطلية قد تحتوي بكتيريا.", recommendation: "قم بفحص دوري ووفّر أدوات تقليم." },
        per5: { risk: "مرتفع", action: "العامل المريض قد ينقل الأمراض.", recommendation: "اطلب من الموظفين إبلاغ المشرف وعدم العمل أثناء المرض." },
        per6: { risk: "مرتفع", action: "غسل اليدين بعد الأنشطة المذكورة ضروري.", recommendation: "وفر مغاسل وصابون ومعقمات، ودرب الموظفين على الوقت الكافي للغسل." },
        clean1: { risk: "مرتفع", action: "الأسطح غير النظيفة تلوث الطعام.", recommendation: "نظف وعقم فوراً بعد كل استخدام باستخدام مواد مناسبة." },
        clean2: { risk: "مرتفع", action: "الأحواض قد تكون مصدر تلوث.", recommendation: "نظفها يومياً بمطهر." },
        clean3: { risk: "متوسط", action: "بقايا الطعام على الأرض تجذب الآفات.", recommendation: "امسح الأرضيات فوراً بعد الانسكابات ونظفها يومياً." },
        clean4: { risk: "مرتفع", action: "المواد غير المعتمدة أو التركيز الخاطئ لا تعقم.", recommendation: "استخدم مواد معتمدة واتبع التعليمات بدقة." },
        clean5: { risk: "متوسط", action: "جدول التنظيف يضمن عدم نسيان المهام.", recommendation: "علق جدولاً واضحاً ووقع عليه بعد كل مهمة." },
        pest1: { risk: "مرتفع", action: "وجود آفات يعني خطر تلوث.", recommendation: "اتصل بشركة مكافحة فوراً وابحث عن مصدر الدخول." },
        pest2: { risk: "مرتفع", action: "الفتحات تسمح بدخول الآفات.", recommendation: "افحص وسد جميع الفتحات باستخدام سيلكون أو شبوك." },
        pest3: { risk: "متوسط", action: "المصائد تراقب وجود الآفات.", recommendation: "ركّز على الأماكن التي يحتمل وجود الآفات فيها." },
        pest4: { risk: "مرتفع", action: "شركة متخصصة تضمن مكافحة فعالة.", recommendation: "احتفظ بعقد وتقارير الزيارات." },
        doc1: { risk: "مرتفع", action: "عدم تسجيل درجات الحرارة يجعل المراقبة مستحيلة.", recommendation: "سجل درجات الحرارة مرتين يومياً في سجل مخصص." },
        doc2: { risk: "مرتفع", action: "تسجيل الطهي ضروري للتدقيق.", recommendation: "احتفظ بسجل لدرجات حرارة الطهي والتبريد." },
        doc3: { risk: "متوسط", action: "سجلات الاستلام مهمة للتتبع.", recommendation: "احتفظ بالسجلات لمدة 6 أشهر على الأقل." },
        doc4: { risk: "متوسط", action: "التوقيع يثبت المسؤولية.", recommendation: "اطلب من المسؤول التوقيع يومياً على السجلات." },
        tr1: { risk: "مرتفع", action: "الموظفون غير المدربين قد يسببون مخاطر.", recommendation: "وفر تدريباً دورياً وسجل حضور الموظفين." },
        tr2: { risk: "متوسط", action: "التعليمات المعلقة تذكر العاملين.", recommendation: "علق لوحات في أماكن بارزة توضح إجراءات السلامة." },
        tr3: { risk: "متوسط", action: "التذكير الدوري يعزز الوعي.", recommendation: "عقد اجتماعات يومية سريعة للتذكير." }
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
                        recBox.innerHTML = `<strong>⚠️ مستوى الخطر: ${data.risk}</strong><br><strong>الإجراء التصحيحي:</strong> ${data.action}<br><strong>التوصية:</strong> ${data.recommendation}`;
                    }
                } else {
                    recBox.style.display = 'none';
                }
            });
        });
    }

    // ===== جمع بيانات التدقيق =====
    function collectAuditData() {
        const date = document.getElementById('checkDate').value;
        const inspector = document.getElementById('inspectorName').value || 'غير محدد';
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
        const percent = Math.round((checked / total) * 100);
        let evaluation = '', overallRiskLevel = '';
        if (percent === 100) { evaluation = 'ممتاز! امتثال كامل'; overallRiskLevel = 'منخفض'; }
        else if (percent >= 90) { evaluation = 'جيد جداً'; overallRiskLevel = 'منخفض'; }
        else if (percent >= 75) { evaluation = 'مقبول'; overallRiskLevel = 'متوسط'; }
        else if (percent >= 50) { evaluation = 'يحتاج تحسين'; overallRiskLevel = 'مرتفع'; }
        else { evaluation = 'غير مطابق'; overallRiskLevel = 'مرتفع جداً'; }
        return { date, inspector, signatureName, signature, details, checked, total, percent, evaluation, overallRiskLevel };
    }

    // ===== حساب النتيجة =====
    document.getElementById('calculateBtn').addEventListener('click', function() {
        const data = collectAuditData();
        document.getElementById('resultArea').style.display = 'flex';
        document.getElementById('scoreDisplay').textContent = data.percent + '%';
        document.getElementById('evaluationText').textContent = data.evaluation;
        const riskEl = document.getElementById('overallRiskDisplay');
        riskEl.textContent = `مستوى الخطر العام: ${data.overallRiskLevel}`;
        riskEl.className = 'overall-risk ' + (data.overallRiskLevel.includes('منخفض') ? 'risk-level-low' : (data.overallRiskLevel.includes('متوسط') ? 'risk-level-medium' : 'risk-level-high'));
        // تخزين النتائج للتصدير
        window.lastAuditData = data;
    });

    // ================================================================
    // ========== تصدير Excel احترافي ==========
    // ================================================================
    document.getElementById('exportExcelBtn').addEventListener('click', async function() {
        if (!window.lastAuditData) { alert('الرجاء إجراء التحليل أولاً (اضغط على "احسب النتيجة").'); return; }
        showLoading('جاري إنشاء تقرير Excel...', 'إنشاء الأوراق والرسوم');
        try {
            const data = window.lastAuditData;
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'FAROUK GRUP';
            const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050';
            const AR = 'FFF5F0E8', DT = 'FF1A1A1A', PB = 'FFD4EDDA', NB = 'FFF8D7DA';
            const PT = 'FF155724', NT = 'FF721C24', GB = 'FFFFF3CD';

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
            mh(cv,1,4,4,`تقرير تدقيق HACCP\n${data.inspector}`,DB,GL,18);
            const inf=[['📋 التاريخ',data.date],['👤 المسؤول',data.inspector],['📊 نسبة الامتثال',`${data.percent}%`],['⚠️ مستوى الخطر',data.overallRiskLevel]];
            let ir=6;
            inf.forEach(([l,v],idx)=>{
                cv.mergeCells(ir,1,ir,2); cv.mergeCells(ir,3,ir,4);
                const lc=cv.getCell(ir,1), vc=cv.getCell(ir,3); lc.value=l; vc.value=v;
                const bg=idx%2===0?AR:'FFFEFCF6';
                ap(lc,{font:{name:'Arial',bold:true,size:11,color:{argb:'00695C'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'right',vertical:'middle',readingOrder:'rtl'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                ap(vc,{font:{name:'Arial',size:11,color:{argb:DT}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',readingOrder:'rtl'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                cv.getRow(ir).height=28; ir++;
            });

            // 2. تفاصيل التدقيق
            const detailSheet = workbook.addWorksheet('تفاصيل التدقيق', { views: [{ rightToLeft: true, showGridLines: false }] });
            detailSheet.getColumn(1).width = 5; detailSheet.getColumn(2).width = 50; detailSheet.getColumn(3).width = 15; detailSheet.getColumn(4).width = 20; detailSheet.getColumn(5).width = 30; detailSheet.getColumn(6).width = 5;
            mh(detailSheet,1,6,1,'📋 قائمة تدقيق HACCP',DB,GL,14);
            detailSheet.getRow(1).height=40;
            detailSheet.addRow(['البند', 'الحالة', 'مستوى الخطر', 'ملاحظات', 'التوصية']);
            const headerRow = detailSheet.getRow(2);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
            data.details.forEach(item => {
                detailSheet.addRow([item.label, item.status ? '✅ مطابق' : '❌ غير مطابق', item.risk, item.note, item.status ? '' : item.recommendation]);
            });

            // 3. ملخص النتائج
            const summarySheet = workbook.addWorksheet('ملخص النتائج', { views: [{ rightToLeft: true, showGridLines: false }] });
            summarySheet.getColumn(1).width = 30; summarySheet.getColumn(2).width = 40;
            mh(summarySheet,1,2,1,'📊 ملخص التدقيق',DB,GL,14);
            summarySheet.getRow(1).height=40;
            const summaryData = [
                ['نسبة الامتثال', `${data.percent}%`],
                ['التقييم', data.evaluation],
                ['مستوى الخطر العام', data.overallRiskLevel],
                ['عدد البنود المطابقة', data.checked],
                ['إجمالي البنود', data.total],
                ['توقيع المسؤول', `${data.signatureName} - ${data.signature || '__________'}`]
            ];
            summaryData.forEach((row,idx) => {
                const r = idx + 3;
                const lc = summarySheet.getCell(r,1); lc.value = row[0]; ap(lc, cs(idx%2===0?'FFFEFCF6':'FFFFFFFF',DT,true,'right'));
                const vc = summarySheet.getCell(r,2); vc.value = row[1]; ap(vc, cs(idx%2===0?'FFFEFCF6':'FFFFFFFF',DT,false,'center'));
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const now = new Date();
            const fileName = `تقرير_HACCP_${data.date}_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert('خطأ Excel: ' + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== تصدير Word احترافي ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (!window.lastAuditData) { alert('الرجاء إجراء التحليل أولاً (اضغط على "احسب النتيجة").'); return; }
        showLoading('جاري إنشاء تقرير Word...', 'جمع البيانات');
        try {
            const data = window.lastAuditData;
            const now = new Date();
            const dateStr = now.toLocaleDateString('ar-EG');

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
                const statusText = item.status ? '✅ مطابق' : '❌ غير مطابق';
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

            const fullHtml = `<!DOCTYPE html>
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
            <head><meta charset='utf-8'><title>تقرير HACCP - FAROUK GRUP</title>
            <style>
                body{font-family:'Arial','Tajawal',sans-serif;direction:rtl;margin:2rem;background:#fff;color:#333;}
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
                    <h1>مجموعة فاروق للاستشارات والأعمال</h1>
                    <h2>📋 تقرير التدقيق اليومي لنظام HACCP</h2>
                    <p>التاريخ: ${data.date} | المسؤول: ${data.inspector}</p>
                    <p>تاريخ التقرير: ${dateStr}</p>
                </div>
                ${resultImg ? `<div style="text-align:center;margin:20px 0;"><img src="${resultImg}" style="max-width:100%;border:1px solid #b8860b;border-radius:10px;" /></div>` : ''}
                <h2 style="color:#b8860b;">نتيجة التدقيق: ${data.percent}% - ${data.evaluation}</h2>
                <h3 style="color:#b8860b;">مستوى الخطر العام: ${data.overallRiskLevel}</h3>
                <table>
                    <thead><tr><th style="background:#fefcf6;color:#b8860b;border:1px solid #b8860b;padding:8px;">البند</th><th style="background:#fefcf6;color:#b8860b;border:1px solid #b8860b;padding:8px;">الحالة</th><th style="background:#fefcf6;color:#b8860b;border:1px solid #b8860b;padding:8px;">مستوى الخطر</th><th style="background:#fefcf6;color:#b8860b;border:1px solid #b8860b;padding:8px;">ملاحظات</th><th style="background:#fefcf6;color:#b8860b;border:1px solid #b8860b;padding:8px;">التوصية</th></tr></thead>
                    <tbody>${itemsHTML}</tbody>
                </table>
                <div class="signature">
                    <div><strong>اسم المسؤول:</strong> ${data.signatureName}</div>
                    <div><strong>التوقيع:</strong> ${data.signature || '________________'}</div>
                </div>
                <div class="footer">تم الإنشاء بواسطة مجموعة فاروق للاستشارات والأعمال © ${now.getFullYear()} | www.farouk-grup.com</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `تقرير_HACCP_${data.date}_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert('خطأ Word: ' + err.message); } finally { hideLoading(); }
    });

    // ===== تهيئة أولية =====
    document.getElementById('checkDate').value = new Date().toISOString().split('T')[0];
    setupRecommendations();
