
        (function() {
            'use strict';

            // ===== دوال التحميل =====
            function showLoading(title, msg) {
                document.getElementById('loadingTitle').textContent = title;
                document.getElementById('loadingMsg').textContent = msg;
                document.getElementById('exportLoading').classList.add('show');
            }

            function hideLoading() {
                document.getElementById('exportLoading').classList.remove('show');
            }

            // ===== الأسئلة (26 عبارة) =====
            const questionsList = [
                "تفرض أن الموظفين يجب عليهم أن يخبروك بما يرغبون فيه من عملهم وسيفعلون ذلك؟",
                "تعتقد أن الاحتفاظ بالموظفين هو وظيفة قسم الموارد البشرية أو مختصي التعويضات؟",
                "تعد المسارات المهنية للموظفين من شأنهم هم وليست من شأنك؟",
                "تعد معرفة الموظفين باحترامك لهم أمرًا مسلما به ولهذا أنت لا تحتاج إلى أن تظهر ذلك؟",
                "تعتقد أنه يجب على الموظفين أن يخبروك إذا لم يشعروا بالتحدي في عملهم؟",
                "تتوقع من الموظفين ترك حياتهم الشخصية عند الباب والشعور بأن حياتهم العملية فحسب في موضع اهتمامك؟",
                "تتجنب مناقشة الخيارات المهنية مع الموظفين خاصة عندما لا تكون الترقيات متاحة بسهولة؟",
                "توظف بصفة أساسية بناءً على المهارات العملية أو الفنية؟",
                "تمنح معلومات للموظفين عندما تكون هناك حاجة إلى معرفتها فحسب؟",
                "تعتقد أنك هنا لتأدية الوظيفة وأنه ليس على الموظفين أن يحبوك؟",
                "تعتقد أنك لست في العمل لك تحظى بالمرح؟",
                "تخشى أنك إذا قدمت الموظفين إلى آخرين في شبكتك، فإنهم قد يغرونهم بترك؟",
                "تشعر أنه ليس لديك وقت للإرشاد؟",
                "هل تدرك فعلاً كم يكلفك فقدان الموظفين الأكفاء والمتميزين؟",
                "تميل إلى اكتناز الأشخاص الجيدين بدلا من مساعدتهم على السعي وراء فرص أخرى؟",
                "تتفق على أننا لا نملك رفاهية محبة ما نقوم به؟",
                "تفشل في التشكيك في السياسات لصالح موظفيك؟",
                "تعتبر العمل الجيد مكافأة في حد ذاته؟",
                "تعتقد أنك إذا لم تتحكم في الأشخاص والكيفية والأماكن والوقت فإن العمل لن يتم على نحو جيد؟",
                "تتجنب منح تقييم سلبي أو تصحيح لموظفيك؟",
                "تعتبر نفسك منشغلا للغاية إلى حد يمنعك من أن تكون مستمعا جيدا؟",
                "تنظر إلى قيم الموظفين على أنها شأنهم الخاص وبهذا لا تناقشها إلا نادرا؟",
                "تعتقد أن مبادرات البرامج الصحية للموظفين تكاليف غير ضرورية؟",
                "تعتقد أن الاختلافات بين الأجيال لا علاقة لها بمكان العمل؟",
                "تعتقد أنه يجب على الموظفين عادة انتظارك لتملي عليهم ما يقومون به؟",
                "تصر على أن مشاركة الموظفين والاحتفاظ بهم ليست مهارات قيادة جوهرية ولا تحتاج إلى تمضية وقت لتحسينها؟"
            ];

            const optionLabels = {
                1: "دائمًا / نعم",
                2: "في الغالب / كثيرًا",
                3: "أحيانًا",
                4: "مطلقًا / لا"
            };

            const totalQuestions = questionsList.length;
            let answers = new Array(totalQuestions).fill(null);
            const container = document.getElementById("questionsContainer");

            // ===== إنشاء واجهة الأسئلة =====
            function renderQuestions() {
                container.innerHTML = "";
                questionsList.forEach((qText, idx) => {
                    const qDiv = document.createElement("div");
                    qDiv.className = "question-item";
                    qDiv.setAttribute("data-qidx", idx);
                    const qHeader = document.createElement("div");
                    qHeader.className = "question-text";
                    const qNumSpan = document.createElement("span");
                    qNumSpan.className = "q-num";
                    qNumSpan.innerText = idx + 1;
                    const qTextSpan = document.createElement("span");
                    qTextSpan.innerText = qText;
                    qHeader.appendChild(qNumSpan);
                    qHeader.appendChild(qTextSpan);

                    const optionsDiv = document.createElement("div");
                    optionsDiv.className = "options-row";
                    for (let val = 1; val <= 4; val++) {
                        const radioWrap = document.createElement("div");
                        radioWrap.className = "radio-option";
                        const radioInput = document.createElement("input");
                        radioInput.type = "radio";
                        radioInput.name = `q_${idx}`;
                        radioInput.value = val;
                        radioInput.id = `q_${idx}_val_${val}`;
                        const label = document.createElement("label");
                        label.htmlFor = `q_${idx}_val_${val}`;
                        label.innerText = optionLabels[val];

                        radioInput.addEventListener("change", (function(index, selectedVal) {
                            return function(e) {
                                if (e.target.checked) {
                                    answers[index] = selectedVal;
                                    updateProgressAndBar();
                                    highlightSelectedOption(radioWrap.parentElement, selectedVal);
                                }
                            };
                        })(idx, val));

                        radioWrap.appendChild(radioInput);
                        radioWrap.appendChild(label);
                        optionsDiv.appendChild(radioWrap);
                    }

                    qDiv.appendChild(qHeader);
                    qDiv.appendChild(optionsDiv);
                    container.appendChild(qDiv);

                    if (answers[idx] !== null) {
                        const selectedRadio = document.querySelector(`input[name="q_${idx}"][value="${answers[idx]}"]`);
                        if (selectedRadio) {
                            selectedRadio.checked = true;
                            const parentOpt = selectedRadio.closest(".radio-option");
                            if (parentOpt) highlightSelectedOption(parentOpt.parentElement, answers[idx]);
                        }
                    }
                });
            }

            function highlightSelectedOption(optionsContainer, selectedVal) {
                if (!optionsContainer) return;
                const allRadios = optionsContainer.querySelectorAll(".radio-option");
                allRadios.forEach(opt => {
                    const input = opt.querySelector("input");
                    if (input && parseInt(input.value) === selectedVal) {
                        opt.classList.add("selected");
                    } else {
                        opt.classList.remove("selected");
                    }
                });
            }

            function updateProgressAndBar() {
                const answeredCount = answers.filter(a => a !== null).length;
                document.getElementById("answeredCounter").innerText = `${answeredCount} / ${totalQuestions}`;
                const percent = (answeredCount / totalQuestions) * 100;
                const fillEl = document.getElementById("progressFill");
                fillEl.style.width = `${percent}%`;
                if (answeredCount === totalQuestions) fillEl.style.background = "#FFD966";
                else fillEl.style.background = "linear-gradient(90deg, #C4A747, #e6c86e)";
            }

            // ===== حساب النتيجة والتوصيات =====
            function calculateTotalScore() {
                let sum = 0;
                for (let i = 0; i < totalQuestions; i++) {
                    if (answers[i] === null) return null;
                    sum += answers[i];
                }
                return sum;
            }

            function getInterpretation(score) {
                if (score >= 80 && score <= 104) {
                    return {
                        level: "ممتاز - عقلية الاحتفاظ بالمواهب",
                        message: "أحسنت. أنت تملك عقلية نهج محبة الموظفين، وعلى الأرجح أنك تتخذ العديد من الأفعال اللازمة لحث الموهوبين لديك على المشاركة والاحتفاظ بهم. استمر في تعزيز ثقافة الثقة والتطوير.",
                        color: "#4ade80"
                    };
                } else if (score >= 53 && score <= 79) {
                    return {
                        level: "متوسط - خطر خسارة الموهوبين",
                        message: "احذر. أنت في خطر خسارة أفضل موظفيك. قد يكون بعضهم تركوك بالفعل، قيم الموقف واتخذ إجراء قبل أن تخسر المزيد من الموهوبين. ركز على تحسين التواصل والثقة.",
                        color: "#fb923c"
                    };
                } else if (score >= 38 && score <= 52) {
                    return {
                        level: "منخفض - إنذار عاجل",
                        message: "انتبه. أنت معرض بنسبة كبيرة لخطر خسارة الموظفين الموهوبين. قد يكون لديك صراع مع معتقداتك وأفعالك، وقد تكون عقبة في طريق أن تحظى بأشخاص مشاركين يرغبون في البقاء معك. تحتاج إلى اتخاذ فعل فوري ومركز.",
                        color: "#f87171"
                    };
                } else {
                    return {
                        level: "حرج للغاية",
                        message: "نتيجة منخفضة جداً. أنت تعاني من خلل جذري في قيادتك تجاه الفريق. غادر معظم المواهب أو هم على وشك الرحيل. نوصي بتغيير فوري في فلسفتك الإدارية، وطلب تدريب قيادي مكثف.",
                        color: "#ef4444"
                    };
                }
            }

            function generateRecommendations(score) {
                const recs = [];
                if (score >= 80) {
                    recs.push("🟢 أداؤك القيادي ممتاز. استمر في تعزيز ثقافة الثقة، وكن قدوة في التواصل المفتوح والاعتراف بإنجازات الفريق.");
                    recs.push("🎯 ركز على تطوير مهارات الإرشاد (Mentoring) ونقل الخبرة للقادة الجدد في مؤسستك.");
                } else if (score >= 53) {
                    recs.push("🟡 أنت في منطقة الخطر. حدد أولويات التحسين: ابدأ بتحسين التواصل اليومي مع فريقك واطلب آرائهم بانتظام.");
                    recs.push("📌 اعمل على بناء الثقة من خلال الشفافية في القرارات، وخصص وقتاً للاستماع الفعال لكل موظف.");
                    recs.push("🔹 راجع سياسات التطوير المهني وتأكد من وجود مسارات واضحة للنمو الوظيفي.");
                } else if (score >= 38) {
                    recs.push("🔴 أنت بحاجة إلى تدخل عاجل. ابدأ بجلسات فردية مع كل موظف لفهم دوافعهم وتحدياتهم.");
                    recs.push("⚡ قم بتقييم ثقافة الفريق وعزز روح الانتماء من خلال أنشطة بناء الفريق والاعتراف بالإنجازات.");
                    recs.push("📈 استشر خبيراً في القيادة التنظيمية لوضع خطة تطوير شاملة لمهاراتك القيادية.");
                } else {
                    recs.push("⛔ حالتك حرجة. نوصي بتغيير جذري في فلسفتك الإدارية، والبدء ببرنامج تدريبي مكثف في القيادة.");
                    recs.push("🔄 فوض بعض الصلاحيات لفريقك، واعمل على بناء الثقة عبر المشاركة في اتخاذ القرارات.");
                    recs.push("📅 حدد أهدافاً قصيرة المدى قابلة للقياس لتحسين المناخ الداخلي، وتابع تنفيذها أسبوعياً.");
                }
                if (score <= 60) {
                    recs.push("💡 انتبه لعلامات الإنهاك الوظيفي لدى فريقك، وقدم الدعم النفسي والمرونة في العمل.");
                }
                if (score <= 45) {
                    recs.push("🚨 قد يكون هناك خلل في هيكل الحوافز، راجعه وعدّله بما يتناسب مع تطلعات الفريق.");
                }
                return recs;
            }

            // ===== عرض المودال =====
            function showResultModal() {
                for (let i = 0; i < totalQuestions; i++) {
                    if (answers[i] === null) {
                        const toast = document.getElementById("warningToast");
                        toast.style.display = "block";
                        setTimeout(() => {
                            toast.style.opacity = "0";
                            setTimeout(() => { toast.style.display = "none"; toast.style.opacity = "1"; }, 400);
                        }, 2000);
                        const firstUnanswered = document.querySelector(`.question-item[data-qidx="${i}"]`);
                        if (firstUnanswered) {
                            firstUnanswered.scrollIntoView({ behavior: "smooth", block: "center" });
                            firstUnanswered.style.border = "2px solid #dc3545";
                            setTimeout(() => { firstUnanswered.style.border = ""; }, 1500);
                        }
                        return;
                    }
                }

                const totalScore = calculateTotalScore();
                if (totalScore === null) return;
                const interpretation = getInterpretation(totalScore);
                const recommendations = generateRecommendations(totalScore);

                const modal = document.getElementById("resultModal");
                document.getElementById("modalScore").innerText = `${totalScore} نقطة (من 104)`;
                document.getElementById("modalInterpretation").innerHTML = `
                    <strong style="color: ${interpretation.color};">${interpretation.level}</strong><br>
                    ${interpretation.message}
                `;

                const recList = document.getElementById("recList");
                recList.innerHTML = "";
                recommendations.forEach(rec => {
                    const li = document.createElement("li");
                    li.innerHTML = `<span class="rec-dot">•</span> ${rec}`;
                    recList.appendChild(li);
                });

                modal.classList.add("active");
            }

            function closeModal() {
                document.getElementById("resultModal").classList.remove("active");
            }

            document.getElementById("showResultBtn").addEventListener("click", showResultModal);
            document.getElementById("closeModalBtn").addEventListener("click", closeModal);
            document.getElementById("resultModal").addEventListener("click", function(e) {
                if (e.target === this) closeModal();
            });

            // ============================================================
            // تصدير Excel احترافي
            // ============================================================
            async function exportToFullExcel() {
                for (let i = 0; i < totalQuestions; i++) {
                    if (answers[i] === null) {
                        const toast = document.getElementById("warningToast");
                        toast.style.display = "block";
                        setTimeout(() => {
                            toast.style.opacity = "0";
                            setTimeout(() => { toast.style.display = "none"; toast.style.opacity = "1"; }, 400);
                        }, 2000);
                        return;
                    }
                }

                showLoading('جاري إنشاء تقرير Excel الاحترافي...', 'إنشاء الأوراق والجداول');
                try {
                    const totalScore = calculateTotalScore();
                    if (totalScore === null) return;
                    const interpretation = getInterpretation(totalScore);
                    const recommendations = generateRecommendations(totalScore);

                    const workbook = new ExcelJS.Workbook();
                    workbook.creator = 'FAROUK GRUP';
                    workbook.created = new Date();

                    const G = 'FFB48554',
                        GL = 'FFCFA776',
                        DB = 'FF0B0E17',
                        HB = 'FF1A2035',
                        SB = 'FF243050';
                    const AR = 'FFF5F0E8',
                        W = 'FFFFFFFF',
                        DT = 'FF1A1A1A';

                    function hs(bg = HB, tc = GL) { return { font: { name: 'Arial', bold: true, size: 11,
                                color: { argb: tc } }, fill: { type: 'pattern', pattern: 'solid',
                                fgColor: { argb: bg } }, alignment: { horizontal: 'center',
                                vertical: 'middle', wrapText: true, readingOrder: 'rtl' }, border: { top: {
                                    style: 'thin', color: { argb: G } }, bottom: { style: 'thin',
                                    color: { argb: G } }, left: { style: 'thin', color: { argb: G } },
                                right: { style: 'thin', color: { argb: G } } } }; }

                    function cs(bg = W, tc = DT, b = false, h = 'center') { return { font: { name: 'Arial',
                                bold: b, size: 10, color: { argb: tc } }, fill: { type: 'pattern',
                                pattern: 'solid', fgColor: { argb: bg } }, alignment: { horizontal: h,
                                vertical: 'middle', wrapText: true, readingOrder: 'rtl' }, border: { top: {
                                    style: 'hair', color: { argb: 'FFCCCCCC' } }, bottom: { style: 'hair',
                                    color: { argb: 'FFCCCCCC' } }, left: { style: 'hair',
                                    color: { argb: 'FFCCCCCC' } }, right: { style: 'hair',
                                    color: { argb: 'FFCCCCCC' } } } }; }

                    function ap(c, s) { if (s.font) c.font = s.font; if (s.fill) c.fill = s.fill; if (s
                            .alignment) c.alignment = s.alignment; if (s.border) c.border = s.border; if (s
                            .numFmt) c.numFmt = s.numFmt; }

                    function mh(ws, fc, tc, r, text, bg = HB, tc2 = GL, fs = 12) { ws.mergeCells(r, fc, r,
                        tc); const c = ws.getCell(r, fc); c.value = text; c.font = { name: 'Arial', bold: true,
                            size: fs, color: { argb: tc2 } }; c.fill = { type: 'pattern', pattern: 'solid',
                            fgColor: { argb: bg } }; c.alignment = { horizontal: 'center', vertical: 'middle',
                            wrapText: true, readingOrder: 'rtl' }; c.border = { top: { style: 'medium',
                                color: { argb: G } }, bottom: { style: 'medium', color: { argb: G } },
                            left: { style: 'medium', color: { argb: G } }, right: { style: 'medium',
                                color: { argb: G } } }; }

                    // 1. غلاف التقرير
                    const cv = workbook.addWorksheet('غلاف التقرير', { views: [{ rightToLeft: true,
                            showGridLines: false }] });
                    [8, 45, 35, 8].forEach((w, i) => cv.getColumn(i + 1).width = w);
                    for (let r = 1; r <= 40; r++) cv.getRow(r).height = 22;
                    cv.getRow(2).height = 80;
                    cv.getRow(4).height = 60;
                    cv.mergeCells(2, 1, 2, 4);
                    const bc = cv.getCell(2, 1);
                    bc.value = 'مجموعة فاروق للاستشارات والأعمال\nFAROUK GRUP';
                    bc.font = { name: 'Arial', bold: true, size: 28, color: { argb: GL } };
                    bc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DB } };
                    bc.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true,
                    readingOrder: 'rtl' };
                    bc.border = { bottom: { style: 'thick', color: { argb: G } } };
                    mh(cv, 1, 4, 4, 'تقرير مقياس تقييم الإداري', DB, GL, 18);
                    const inf = [
                        ['📋 التقييم', 'مقياس تحديد الإداري'],
                        ['📅 التاريخ', new Date().toLocaleDateString('ar-EG')],
                        ['📊 النتيجة', `${totalScore} نقطة (من 104)`],
                        ['🏷️ التقدير', interpretation.level]
                    ];
                    let ir = 6;
                    inf.forEach(([l, v], idx) => {
                        cv.mergeCells(ir, 1, ir, 2);
                        cv.mergeCells(ir, 3, ir, 4);
                        const lc = cv.getCell(ir, 1),
                            vc = cv.getCell(ir, 3);
                        lc.value = l;
                        vc.value = v;
                        const bg = idx % 2 === 0 ? AR : 'FFFEFCF6';
                        ap(lc, { font: { name: 'Arial', bold: true, size: 11, color: { argb: '00695C' } },
                            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } },
                            alignment: { horizontal: 'right', vertical: 'middle', readingOrder: 'rtl' },
                            border: { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' },
                                right: { style: 'hair' } } });
                        ap(vc, { font: { name: 'Arial', size: 11, color: { argb: DT } },
                            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } },
                            alignment: { horizontal: 'center', vertical: 'middle', readingOrder: 'rtl' },
                            border: { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' },
                                right: { style: 'hair' } } });
                        cv.getRow(ir).height = 28;
                        ir++;
                    });

                    // 2. النتيجة والتوصيات
                    const summarySheet = workbook.addWorksheet('النتيجة والتوصيات', { views: [{ rightToLeft: true,
                            showGridLines: false }] });
                    summarySheet.getColumn(1).width = 5;
                    summarySheet.getColumn(2).width = 50;
                    summarySheet.getColumn(3).width = 5;
                    mh(summarySheet, 1, 3, 1, '📊 النتيجة الإجمالية والتوصيات', DB, GL, 14);
                    summarySheet.getRow(1).height = 40;

                    summarySheet.mergeCells(2, 2, 2, 2);
                    const sc = summarySheet.getCell(2, 2);
                    sc.value = `النتيجة الإجمالية: ${totalScore} نقطة (من 104)  |  التقدير: ${interpretation.level}`;
                    sc.font = { name: 'Arial', bold: true, size: 14, color: { argb: interpretation.color } };
                    sc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AR } };
                    sc.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rtl' };
                    sc.border = { top: { style: 'medium', color: { argb: G } }, bottom: { style: 'medium',
                            color: { argb: G } }, left: { style: 'medium', color: { argb: G } },
                        right: { style: 'medium', color: { argb: G } } };
                    summarySheet.getRow(2).height = 35;

                    summarySheet.mergeCells(3, 2, 3, 2);
                    const ic = summarySheet.getCell(3, 2);
                    ic.value = interpretation.message;
                    ic.font = { name: 'Arial', size: 11, color: { argb: DT } };
                    ic.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEFCF6' } };
                    ic.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true,
                    readingOrder: 'rtl' };
                    ic.border = { top: { style: 'hair' }, bottom: { style: 'hair', color: { argb: G } },
                        left: { style: 'hair' }, right: { style: 'hair' } };
                    summarySheet.getRow(3).height = 40;

                    let recRow = 5;
                    summarySheet.mergeCells(recRow, 2, recRow, 2);
                    const rt = summarySheet.getCell(recRow, 2);
                    rt.value = '📌 التوصيات والتطوير المقترح';
                    rt.font = { name: 'Arial', bold: true, size: 12, color: { argb: GL } };
                    rt.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HB } };
                    rt.alignment = { horizontal: 'right', vertical: 'middle', readingOrder: 'rtl' };
                    rt.border = { bottom: { style: 'medium', color: { argb: G } } };
                    summarySheet.getRow(recRow).height = 30;
                    recRow++;

                    recommendations.forEach((rec, idx) => {
                        summarySheet.mergeCells(recRow, 2, recRow, 2);
                        const rc = summarySheet.getCell(recRow, 2);
                        rc.value = `${idx+1}. ${rec}`;
                        const bg = idx % 2 === 0 ? AR : 'FFFEFCF6';
                        rc.font = { name: 'Arial', size: 10, color: { argb: DT } };
                        rc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
                        rc.alignment = { horizontal: 'right', vertical: 'top', wrapText: true,
                            readingOrder: 'rtl' };
                        rc.border = { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' },
                            right: { style: 'hair' } };
                        summarySheet.getRow(recRow).height = 22;
                        recRow++;
                    });

                    // 3. تفاصيل العبارات
                    const detailSheet = workbook.addWorksheet('تفاصيل التقييم', { views: [{ rightToLeft: true,
                            showGridLines: false }] });
                    detailSheet.getColumn(1).width = 5;
                    detailSheet.getColumn(2).width = 10;
                    detailSheet.getColumn(3).width = 60;
                    detailSheet.getColumn(4).width = 20;
                    detailSheet.getColumn(5).width = 15;
                    detailSheet.getColumn(6).width = 5;
                    mh(detailSheet, 1, 6, 1, '📋 تفاصيل التقييم حسب العبارات', DB, GL, 14);
                    detailSheet.getRow(1).height = 40;
                    detailSheet.addRow(['#', 'العبارة', 'التقدير', 'الدرجة']);
                    const detailHeader = detailSheet.getRow(2);
                    detailHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    detailHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
                    detailSheet.getRow(2).height = 28;

                    questionsList.forEach((q, idx) => {
                        const answer = answers[idx] !== null ? answers[idx] : '-';
                        const label = answer !== '-' ? optionLabels[answer] : '-';
                        const row = detailSheet.addRow([idx + 1, q, label, answer]);
                        row.height = 22;
                        const bg = idx % 2 === 0 ? AR : 'FFFEFCF6';
                        row.eachCell((cell) => {
                            const col = cell.col;
                            if (col === 4) {
                                cell.font = { name: 'Arial', bold: true, size: 10, color: { argb: answer >=
                                        3 ? 'FF28A745' : answer >= 2 ? 'FFED6C02' :
                                        'FFDC3545' } };
                            }
                            Object.assign(cell, cs(bg, DT, false, col === 2 ? 'center' : 'right'));
                        });
                    });

                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const now = new Date();
                    const fileName =
                        `تقرير_مقياس_تقييم_الإداري_${now.toISOString().slice(0,10)}.xlsx`;
                    saveAs(blob, fileName);
                } catch (err) {
                    console.error(err);
                    alert('خطأ أثناء إنشاء ملف Excel: ' + err.message);
                } finally {
                    hideLoading();
                }
            }

            // ============================================================
            // تصدير Word احترافي
            // ============================================================
            function generateWordHTML() {
                let totalScore = 0;
                let allAnswered = true;
                for (let i = 0; i < totalQuestions; i++) {
                    if (answers[i] === null) { allAnswered = false; break; }
                    totalScore += answers[i];
                }
                const interpretation = allAnswered ? getInterpretation(totalScore) : { level: "غير مكتمل",
                    message: "لم يتم الإجابة على جميع العبارات.", color: "#888" };
                const recommendations = allAnswered ? generateRecommendations(totalScore) :
                ["يرجى إكمال التقييم للحصول على توصيات."];

                let rows = "";
                questionsList.forEach((q, idx) => {
                    const answer = answers[idx] !== null ? answers[idx] : "-";
                    const label = answer !== "-" ? optionLabels[answer] : "-";
                    rows += `<tr><td style="border:1px solid #999;padding:6px;text-align:center;">${idx+1}</td>
                            <td style="border:1px solid #999;padding:6px;">${q}</td>
                            <td style="border:1px solid #999;padding:6px;text-align:center;">${label}</td>
                            <td style="border:1px solid #999;padding:6px;text-align:center;">${answer}</td></tr>`;
                });

                let recHtml = recommendations.map(r => `<li>${r}</li>`).join('');

                return `
                    <html dir="rtl">
                    <head><meta charset="UTF-8">
                        <style>
                            body { font-family: 'Arial', sans-serif; padding: 30px; direction: rtl; }
                            h1 { color: #0a1a2a; border-bottom: 3px solid #C4A747; padding-bottom: 10px; }
                            .summary { background: #f9f9f9; padding: 15px; border-radius: 12px; margin: 20px 0; }
                            .summary strong { color: #C4A747; }
                            .rec-box { background: #f0f7ff; border-right: 5px solid #C4A747; padding: 15px; margin: 20px 0; border-radius: 10px; }
                            .rec-box h3 { margin-top: 0; color: #0a1a2a; }
                            .rec-box ul { padding-right: 20px; }
                            .rec-box li { margin-bottom: 8px; }
                            table.details { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
                            table.details th { background: #0a1a2a; color: white; padding: 8px; border: 1px solid #999; }
                            table.details td { padding: 6px; border: 1px solid #999; }
                            .footer { margin-top: 30px; font-size: 0.8rem; color: #555; text-align: center; }
                        </style>
                    </head>
                    <body>
                        <h1>تقرير مقياس تحديد الإداري</h1>
                        <div class="summary">
                            <strong>النتيجة الإجمالية:</strong> ${allAnswered ? totalScore + ' نقطة (من 104)' : 'غير مكتملة'} &nbsp;|&nbsp;
                            <strong>التقدير:</strong> <span style="color:${interpretation.color};">${interpretation.level}</span><br>
                            <strong>التفسير:</strong> ${interpretation.message}
                        </div>
                        <div class="rec-box">
                            <h3>📌 التوصيات والتطوير المقترح</h3>
                            <ul>${recHtml}</ul>
                        </div>
                        <h2>تفاصيل التقييم حسب العبارات</h2>
                        <table class="details">
                            <thead><tr><th>#</th><th>العبارة</th><th>التقدير</th><th>الدرجة</th></tr></thead>
                            <tbody>${rows}</tbody>
                        </table>
                        <div class="footer">تم إنشاء هذا التقرير بواسطة مجموعة فاروق للإستشارات والأعمال | ${new Date().toLocaleDateString('ar-EG')}</div>
                    </body>
                    </html>
                `;
            }

            async function exportToWord() {
                for (let i = 0; i < totalQuestions; i++) {
                    if (answers[i] === null) {
                        const toast = document.getElementById("warningToast");
                        toast.style.display = "block";
                        setTimeout(() => {
                            toast.style.opacity = "0";
                            setTimeout(() => { toast.style.display = "none"; toast.style.opacity = "1"; }, 400);
                        }, 2000);
                        return;
                    }
                }

                showLoading('جاري إنشاء تقرير Word الاحترافي...', 'جمع البيانات');
                try {
                    const content = generateWordHTML();
                    if (!content) { alert('يرجى إكمال التقييم أولاً.'); return; }
                    const blob = new Blob(['\uFEFF' + content], { type: 'application/msword' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `تقرير_مقياس_تقييم_الإداري.doc`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                } catch (err) {
                    console.error(err);
                    alert('خطأ في إنشاء تقرير Word: ' + err.message);
                } finally {
                    hideLoading();
                }
            }

            // ===== ربط الأزرار =====
            document.getElementById("exportWordBtn").addEventListener("click", exportToWord);
            document.getElementById("exportExcelBtn").addEventListener("click", exportToFullExcel);

            // ============================================================
            // التهيئة
            // ============================================================
            function init() {
                renderQuestions();
                updateProgressAndBar();
                for (let i = 0; i < totalQuestions; i++) {
                    const selectedInput = document.querySelector(`input[name="q_${i}"]:checked`);
                    if (selectedInput) {
                        const val = parseInt(selectedInput.value);
                        answers[i] = val;
                        const optionsRow = selectedInput.closest('.options-row');
                        if (optionsRow) highlightSelectedOption(optionsRow, val);
                    }
                }
                updateProgressAndBar();
            }
            init();

        })();
    