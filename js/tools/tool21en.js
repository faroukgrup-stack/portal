
        (function() {
            'use strict';

            // ===== Loading functions =====
            function showLoading(title, msg) {
                document.getElementById('loadingTitle').textContent = title;
                document.getElementById('loadingMsg').textContent = msg;
                document.getElementById('exportLoading').classList.add('show');
            }

            function hideLoading() {
                document.getElementById('exportLoading').classList.remove('show');
            }

            // ===== Questions (26 statements) =====
            const questionsList = [
                "Do you assume that employees should tell you what they want from their work and they will do so?",
                "Do you believe that retaining employees is the job of HR or compensation specialists?",
                "Do you consider career paths as the employees' own concern, not yours?",
                "Do you take for granted that employees know you respect them, so you don't need to show it?",
                "Do you think employees should tell you if they don't feel challenged in their work?",
                "Do you expect employees to leave their personal lives at the door, and feel that only their work life is your concern?",
                "Do you avoid discussing career options with employees, especially when promotions are not readily available?",
                "Do you hire primarily based on practical or technical skills?",
                "Do you give information to employees only when they need to know it?",
                "Do you believe you're here to do the job and employees don't have to like you?",
                "Do you think you're not at work to have fun?",
                "Do you fear that if you introduce employees to others in your network, they might tempt them to leave?",
                "Do you feel you don't have time for mentoring?",
                "Do you actually realize how much it costs you to lose competent and outstanding employees?",
                "Do you tend to hoard good people rather than help them pursue other opportunities?",
                "Do you agree that we don't have the luxury of loving what we do?",
                "Do you fail to question policies for the sake of your employees?",
                "Do you consider good work as a reward in itself?",
                "Do you believe that if you don't control people, how, where, and when, work won't be done well?",
                "Do you avoid giving negative feedback or correction to your employees?",
                "Do you consider yourself too busy to be a good listener?",
                "Do you view employees' values as their own concern, and thus rarely discuss them?",
                "Do you think employee wellness programs are unnecessary costs?",
                "Do you think generational differences have no relevance to the workplace?",
                "Do you believe employees should usually wait for you to dictate what they do?",
                "Do you insist that employee engagement and retention are not core leadership skills, and don't need time to improve?"
            ];

            const optionLabels = {
                1: "Always / Yes",
                2: "Usually / Often",
                3: "Sometimes",
                4: "Never / No"
            };

            const totalQuestions = questionsList.length;
            let answers = new Array(totalQuestions).fill(null);
            const container = document.getElementById("questionsContainer");

            // ===== Render Questions =====
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

            // ===== Score Calculation & Recommendations =====
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
                        level: "Excellent - Talent Retention Mindset",
                        message: "Well done. You have a people-centric mindset and are likely taking many actions to engage and retain your top talent. Continue to foster a culture of trust and development.",
                        color: "#4ade80"
                    };
                } else if (score >= 53 && score <= 79) {
                    return {
                        level: "Moderate - Risk of Losing Talent",
                        message: "Be careful. You are at risk of losing your best employees. Some may have already left. Assess the situation and take action before you lose more talent. Focus on improving communication and trust.",
                        color: "#fb923c"
                    };
                } else if (score >= 38 && score <= 52) {
                    return {
                        level: "Low - Urgent Warning",
                        message: "Pay attention. You are at high risk of losing talented employees. You may have conflicts with your beliefs and actions, and you may be an obstacle to having engaged people who want to stay with you. You need immediate and focused action.",
                        color: "#f87171"
                    };
                } else {
                    return {
                        level: "Critical",
                        message: "Very low score. You have a fundamental leadership flaw towards your team. Most talents have left or are about to leave. We recommend an immediate change in your management philosophy and intensive leadership coaching.",
                        color: "#ef4444"
                    };
                }
            }

            function generateRecommendations(score) {
                const recs = [];
                if (score >= 80) {
                    recs.push("🟢 Your leadership performance is excellent. Continue fostering a culture of trust, and be a role model for open communication and recognition of team achievements.");
                    recs.push("🎯 Focus on developing mentoring skills and transferring experience to new leaders in your organization.");
                } else if (score >= 53) {
                    recs.push("🟡 You are in the danger zone. Prioritize improvements: start by improving daily communication with your team and regularly ask for their opinions.");
                    recs.push("📌 Build trust through transparency in decisions, and dedicate time for active listening with each employee.");
                    recs.push("🔹 Review career development policies and ensure there are clear paths for professional growth.");
                } else if (score >= 38) {
                    recs.push("🔴 You need urgent intervention. Start with one-on-one sessions with each employee to understand their motivations and challenges.");
                    recs.push("⚡ Assess team culture and foster a sense of belonging through team-building activities and recognition of achievements.");
                    recs.push("📈 Consult an organizational leadership expert to develop a comprehensive plan for your leadership skills.");
                } else {
                    recs.push("⛔ Your situation is critical. We recommend a radical change in your management philosophy, starting with an intensive leadership training program.");
                    recs.push("🔄 Delegate some authority to your team, and build trust through shared decision-making.");
                    recs.push("📅 Set short-term measurable goals to improve the internal climate, and follow up weekly.");
                }
                if (score <= 60) {
                    recs.push("💡 Watch for signs of burnout in your team, and provide psychological support and flexibility at work.");
                }
                if (score <= 45) {
                    recs.push("🚨 There may be a flaw in the incentive structure, review and adjust it to align with team aspirations.");
                }
                return recs;
            }

            // ===== Show Modal =====
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
                document.getElementById("modalScore").innerText = `${totalScore} points (out of 104)`;
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
            // Export to Professional Excel
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

                showLoading('Creating Professional Excel Report...', 'Creating sheets and tables');
                try {
                    const totalScore = calculateTotalScore();
                    if (totalScore === null) return;
                    const interpretation = getInterpretation(totalScore);
                    const recommendations = generateRecommendations(totalScore);

                    const workbook = new ExcelJS.Workbook();
                    workbook.creator = 'FAROUK GRUP';
                    workbook.created = new Date();

                    const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050';
                    const AR = 'FFF5F0E8', W = 'FFFFFFFF', DT = 'FF1A1A1A';

                    function hs(bg = HB, tc = GL) { return { font: { name: 'Arial', bold: true, size: 11,
                                color: { argb: tc } }, fill: { type: 'pattern', pattern: 'solid',
                                fgColor: { argb: bg } }, alignment: { horizontal: 'center',
                                vertical: 'middle', wrapText: true, readingOrder: 'ltr' }, border: { top: {
                                    style: 'thin', color: { argb: G } }, bottom: { style: 'thin',
                                    color: { argb: G } }, left: { style: 'thin', color: { argb: G } },
                                right: { style: 'thin', color: { argb: G } } } }; }

                    function cs(bg = W, tc = DT, b = false, h = 'center') { return { font: { name: 'Arial',
                                bold: b, size: 10, color: { argb: tc } }, fill: { type: 'pattern',
                                pattern: 'solid', fgColor: { argb: bg } }, alignment: { horizontal: h,
                                vertical: 'middle', wrapText: true, readingOrder: 'ltr' }, border: { top: {
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
                            wrapText: true, readingOrder: 'ltr' }; c.border = { top: { style: 'medium',
                                color: { argb: G } }, bottom: { style: 'medium', color: { argb: G } },
                            left: { style: 'medium', color: { argb: G } }, right: { style: 'medium',
                                color: { argb: G } } }; }

                    // 1. Cover Sheet
                    const cv = workbook.addWorksheet('Report Cover', { views: [{ rightToLeft: false,
                            showGridLines: false }] });
                    [8, 45, 35, 8].forEach((w, i) => cv.getColumn(i + 1).width = w);
                    for (let r = 1; r <= 40; r++) cv.getRow(r).height = 22;
                    cv.getRow(2).height = 80;
                    cv.getRow(4).height = 60;
                    cv.mergeCells(2, 1, 2, 4);
                    const bc = cv.getCell(2, 1);
                    bc.value = 'FAROUK GRUP for Consulting & Business\nFAROUK GRUP';
                    bc.font = { name: 'Arial', bold: true, size: 28, color: { argb: GL } };
                    bc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DB } };
                    bc.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true,
                    readingOrder: 'ltr' };
                    bc.border = { bottom: { style: 'thick', color: { argb: G } } };
                    mh(cv, 1, 4, 4, 'Managerial Assessment Report', DB, GL, 18);
                    const inf = [
                        ['📋 Assessment', 'Managerial Mindset'],
                        ['📅 Date', new Date().toLocaleDateString('en-US')],
                        ['📊 Score', `${totalScore} points (out of 104)`],
                        ['🏷️ Rating', interpretation.level]
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
                            alignment: { horizontal: 'right', vertical: 'middle', readingOrder: 'ltr' },
                            border: { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' },
                                right: { style: 'hair' } } });
                        ap(vc, { font: { name: 'Arial', size: 11, color: { argb: DT } },
                            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } },
                            alignment: { horizontal: 'center', vertical: 'middle', readingOrder: 'ltr' },
                            border: { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' },
                                right: { style: 'hair' } } });
                        cv.getRow(ir).height = 28;
                        ir++;
                    });

                    // 2. Results & Recommendations
                    const summarySheet = workbook.addWorksheet('Results & Recommendations', { views: [{ rightToLeft: false,
                            showGridLines: false }] });
                    summarySheet.getColumn(1).width = 5;
                    summarySheet.getColumn(2).width = 50;
                    summarySheet.getColumn(3).width = 5;
                    mh(summarySheet, 1, 3, 1, '📊 Overall Score & Recommendations', DB, GL, 14);
                    summarySheet.getRow(1).height = 40;

                    summarySheet.mergeCells(2, 2, 2, 2);
                    const sc = summarySheet.getCell(2, 2);
                    sc.value = `Total Score: ${totalScore} points (out of 104)  |  Rating: ${interpretation.level}`;
                    sc.font = { name: 'Arial', bold: true, size: 14, color: { argb: interpretation.color } };
                    sc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AR } };
                    sc.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'ltr' };
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
                    readingOrder: 'ltr' };
                    ic.border = { top: { style: 'hair' }, bottom: { style: 'hair', color: { argb: G } },
                        left: { style: 'hair' }, right: { style: 'hair' } };
                    summarySheet.getRow(3).height = 40;

                    let recRow = 5;
                    summarySheet.mergeCells(recRow, 2, recRow, 2);
                    const rt = summarySheet.getCell(recRow, 2);
                    rt.value = '📌 Recommendations & Proposed Development';
                    rt.font = { name: 'Arial', bold: true, size: 12, color: { argb: GL } };
                    rt.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HB } };
                    rt.alignment = { horizontal: 'right', vertical: 'middle', readingOrder: 'ltr' };
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
                            readingOrder: 'ltr' };
                        rc.border = { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' },
                            right: { style: 'hair' } };
                        summarySheet.getRow(recRow).height = 22;
                        recRow++;
                    });

                    // 3. Detailed Statements
                    const detailSheet = workbook.addWorksheet('Assessment Details', { views: [{ rightToLeft: false,
                            showGridLines: false }] });
                    detailSheet.getColumn(1).width = 5;
                    detailSheet.getColumn(2).width = 10;
                    detailSheet.getColumn(3).width = 60;
                    detailSheet.getColumn(4).width = 20;
                    detailSheet.getColumn(5).width = 15;
                    detailSheet.getColumn(6).width = 5;
                    mh(detailSheet, 1, 6, 1, '📋 Detailed Assessment by Statement', DB, GL, 14);
                    detailSheet.getRow(1).height = 40;
                    detailSheet.addRow(['#', 'Statement', 'Rating', 'Score']);
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
                            Object.assign(cell, cs(bg, DT, false, col === 2 ? 'center' : 'left'));
                        });
                    });

                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const now = new Date();
                    const fileName =
                        `Managerial_Assessment_${now.toISOString().slice(0,10)}.xlsx`;
                    saveAs(blob, fileName);
                } catch (err) {
                    console.error(err);
                    alert('Error creating Excel file: ' + err.message);
                } finally {
                    hideLoading();
                }
            }

            // ============================================================
            // Export to Professional Word
            // ============================================================
            function generateWordHTML() {
                let totalScore = 0;
                let allAnswered = true;
                for (let i = 0; i < totalQuestions; i++) {
                    if (answers[i] === null) { allAnswered = false; break; }
                    totalScore += answers[i];
                }
                const interpretation = allAnswered ? getInterpretation(totalScore) : { level: "Incomplete",
                    message: "Not all statements have been answered.", color: "#888" };
                const recommendations = allAnswered ? generateRecommendations(totalScore) :
                ["Please complete the assessment to get recommendations."];

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
                    <html dir="ltr">
                    <head><meta charset="UTF-8">
                        <style>
                            body { font-family: 'Arial', sans-serif; padding: 30px; direction: ltr; }
                            h1 { color: #0a1a2a; border-bottom: 3px solid #C4A747; padding-bottom: 10px; }
                            .summary { background: #f9f9f9; padding: 15px; border-radius: 12px; margin: 20px 0; }
                            .summary strong { color: #C4A747; }
                            .rec-box { background: #f0f7ff; border-left: 5px solid #C4A747; padding: 15px; margin: 20px 0; border-radius: 10px; }
                            .rec-box h3 { margin-top: 0; color: #0a1a2a; }
                            .rec-box ul { padding-left: 20px; }
                            .rec-box li { margin-bottom: 8px; }
                            table.details { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
                            table.details th { background: #0a1a2a; color: white; padding: 8px; border: 1px solid #999; }
                            table.details td { padding: 6px; border: 1px solid #999; }
                            .footer { margin-top: 30px; font-size: 0.8rem; color: #555; text-align: center; }
                        </style>
                    </head>
                    <body>
                        <h1>Managerial Assessment Report</h1>
                        <div class="summary">
                            <strong>Total Score:</strong> ${allAnswered ? totalScore + ' points (out of 104)' : 'Incomplete'} &nbsp;|&nbsp;
                            <strong>Rating:</strong> <span style="color:${interpretation.color};">${interpretation.level}</span><br>
                            <strong>Interpretation:</strong> ${interpretation.message}
                        </div>
                        <div class="rec-box">
                            <h3>📌 Recommendations & Proposed Development</h3>
                            <ul>${recHtml}</ul>
                        </div>
                        <h2>Detailed Assessment by Statement</h2>
                        <table class="details">
                            <thead><tr><th>#</th><th>Statement</th><th>Rating</th><th>Score</th></tr></thead>
                            <tbody>${rows}</tbody>
                        </table>
                        <div class="footer">This report was created by FAROUK GRUP for Consulting & Business | ${new Date().toLocaleDateString('en-US')}</div>
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

                showLoading('Creating Professional Word Report...', 'Gathering data');
                try {
                    const content = generateWordHTML();
                    if (!content) { alert('Please complete the assessment first.'); return; }
                    const blob = new Blob(['\uFEFF' + content], { type: 'application/msword' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `Managerial_Assessment_${new Date().toISOString().slice(0,10)}.doc`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                } catch (err) {
                    console.error(err);
                    alert('Error creating Word report: ' + err.message);
                } finally {
                    hideLoading();
                }
            }

            // ===== Attach event listeners =====
            document.getElementById("exportWordBtn").addEventListener("click", exportToWord);
            document.getElementById("exportExcelBtn").addEventListener("click", exportToFullExcel);

            // ============================================================
            // Initialization
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
    