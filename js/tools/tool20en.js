
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

            // ===== Domains & Criteria (40 criteria) =====
            const domains = [
                { name: "Parent Company", range: [1, 4], criteria: ["Loyalty to the company and safeguarding its interests", "Compliance with company rules and policies", "Preserving company property", "Protecting company secrets"] },
                { name: "Top Management", range: [5, 8], criteria: ["Understanding top management's goals and policies", "Accepting supervisors' criticism and guidance", "Following top management's instructions", "Accepting work demands under pressure"] },
                { name: "Department or Division", range: [9, 12], criteria: ["Knowledge of work methods and procedures", "Interest in developing and improving work standards", "Flexibility and adaptability in the work environment", "Cooperation with colleagues at work"] },
                { name: "Specialization Area", range: [13, 16], criteria: ["Level of competence in the field of specialization", "Keeping up with the latest developments in the field", "Ability to absorb new trends in the specialty", "Ability to transfer expertise in the field"] },
                { name: "Managerial Skills", range: [17, 20], criteria: ["Ability to plan effectively", "Ability to make decisions", "Ability to provide administrative supervision", "Ability to provide technical supervision"] },
                { name: "Practical Skills", range: [21, 28], criteria: ["Creativity and innovation at work", "Initiative and proactivity at work", "Accuracy, order, and organization at work", "Ability to work without supervision", "Ability to work under pressure", "Interest in developing and improving work methods", "Ability to find solutions to work problems", "Ability to take on higher responsibilities"] },
                { name: "Work Commitment", range: [29, 34], criteria: ["Commitment to work rules, methods, and procedures", "Following direct supervisor's instructions at work", "Punctuality and attendance", "Following safety and security rules", "Following professional appearance and grooming standards", "Following official dress code"] },
                { name: "Personal Traits & Relationships", range: [35, 40], criteria: ["Emotional stability and composure at work", "Quick wit and good judgment", "Ability to take responsibility", "Relationship with colleagues", "Relationship with subordinates", "Relationship with the public"] }
            ];

            let allCriteria = [];
            let globalIndex = 0;
            domains.forEach(domain => {
                domain.criteria.forEach(c => {
                    globalIndex++;
                    allCriteria.push({ id: globalIndex, domain: domain.name, text: c });
                });
            });
            const totalQuestions = allCriteria.length; // 40

            const optionLabels = { 1: "Poor", 2: "Average", 3: "Good", 4: "Very Good", 5: "Excellent" };
            let answers = new Array(totalQuestions).fill(null);
            const container = document.getElementById("questionsContainer");

            // ===== Render Questions =====
            function renderQuestions() {
                container.innerHTML = "";
                let currentDomain = "";
                let domainDiv = null;

                allCriteria.forEach((item, idx) => {
                    if (item.domain !== currentDomain) {
                        currentDomain = item.domain;
                        domainDiv = document.createElement("div");
                        domainDiv.className = "domain-section";
                        const title = document.createElement("div");
                        title.className = "domain-title";
                        const badge = document.createElement("span");
                        badge.className = "num-badge";
                        badge.innerText = item.id;
                        title.appendChild(badge);
                        const titleText = document.createElement("span");
                        titleText.innerText = currentDomain;
                        title.appendChild(titleText);
                        domainDiv.appendChild(title);
                        container.appendChild(domainDiv);
                    }

                    const qDiv = document.createElement("div");
                    qDiv.className = "question-item";
                    qDiv.setAttribute("data-qidx", idx);

                    const qHeader = document.createElement("div");
                    qHeader.className = "question-text";
                    const numSpan = document.createElement("span");
                    numSpan.className = "q-num";
                    numSpan.innerText = item.id;
                    const textSpan = document.createElement("span");
                    textSpan.innerText = item.text;
                    qHeader.appendChild(numSpan);
                    qHeader.appendChild(textSpan);

                    const optionsDiv = document.createElement("div");
                    optionsDiv.className = "options-row";

                    for (let val = 1; val <= 5; val++) {
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
                    domainDiv.appendChild(qDiv);

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

            // ===== Calculation & Recommendations =====
            function calculateTotalScore() {
                let sum = 0;
                for (let i = 0; i < totalQuestions; i++) {
                    if (answers[i] === null) return null;
                    sum += answers[i];
                }
                return sum;
            }

            function getDomainAverages() {
                let domainResults = [];
                let startIdx = 0;
                domains.forEach(domain => {
                    const count = domain.criteria.length;
                    let sum = 0;
                    let allAnswered = true;
                    for (let i = startIdx; i < startIdx + count; i++) {
                        if (answers[i] === null) { allAnswered = false; break; }
                        sum += answers[i];
                    }
                    const avg = allAnswered ? (sum / count) : null;
                    const maxPossible = count * 5;
                    const achieved = allAnswered ? sum : 0;
                    const percent = allAnswered ? (achieved / maxPossible) * 100 : 0;
                    domainResults.push({
                        name: domain.name,
                        avg: avg,
                        percent: percent,
                        count: count,
                        sum: sum,
                        allAnswered: allAnswered
                    });
                    startIdx += count;
                });
                return domainResults;
            }

            function getInterpretation(score) {
                const maxScore = totalQuestions * 5;
                const percent = (score / maxScore) * 100;
                if (percent >= 90) return { level: "Excellent", message: "Outstanding performance, deserves recognition and promotion.", color: "#4ade80" };
                else if (percent >= 75) return { level: "Very Good", message: "High performance, with some areas for improvement.", color: "#facc15" };
                else if (percent >= 60) return { level: "Good", message: "Acceptable performance, needs improvement in some areas.", color: "#fb923c" };
                else if (percent >= 45) return { level: "Average", message: "Below expectations, needs a development plan.", color: "#f87171" };
                else return { level: "Poor", message: "Unsatisfactory performance, requires urgent intervention.", color: "#ef4444" };
            }

            function getDomainSuggestion(domainName, level) {
                const suggestions = {
                    "Parent Company": {
                        weak: "Conduct awareness sessions about the company's vision and mission, and enhance belonging through moral and material incentive programs.",
                        medium: "Strengthen internal communication channels to explain policies, and involve the employee in simple decision-making that affects company interests."
                    },
                    "Top Management": {
                        weak: "Organize workshops on how to accept constructive criticism and manage pressure, while providing a leadership model to follow within the department.",
                        medium: "Improve communication between supervisors and subordinates, and hold regular meetings to discuss challenges and find joint solutions."
                    },
                    "Department or Division": {
                        weak: "Update work procedures periodically, provide a unified procedure manual, and encourage a culture of cooperation through team-building activities.",
                        medium: "Organize brainstorming sessions within the department, and implement job rotation to increase flexibility and procedural knowledge."
                    },
                    "Specialization Area": {
                        weak: "Provide intensive training programs in the specialty, attend specialized conferences, and create an updated digital reference library.",
                        medium: "Connect the employee with a mentor in the same field, and encourage them to obtain professional certifications."
                    },
                    "Managerial Skills": {
                        weak: "Enroll the employee in leadership and project management courses, and assign them simple supervisory tasks under direct guidance.",
                        medium: "Apply self-assessment of managerial tasks, and hold regular feedback sessions with the direct supervisor."
                    },
                    "Practical Skills": {
                        weak: "Provide on-the-job training, set daily performance goals, and encourage the employee to offer solutions to simple problems immediately.",
                        medium: "Launch internal competitions for creativity and innovation, and give the employee more authority to carry out tasks without constant supervisor approval."
                    },
                    "Work Commitment": {
                        weak: "Review the disciplinary code with the employee, apply a clear and fair reward and punishment system, and monitor adherence to dress code.",
                        medium: "Promote a culture of role-modeling through committed supervisors, and constantly remind the employee of the importance of punctuality and procedures."
                    },
                    "Personal Traits & Relationships": {
                        weak: "Enroll the employee in emotional intelligence and communication skills courses, and hold awareness sessions on the importance of mutual respect in the workplace.",
                        medium: "Encourage the employee to participate in social events within the company, and train them on how to deal with different personalities."
                    }
                };
                const domainSuggest = suggestions[domainName];
                if (!domainSuggest) return "Review performance in this area and set an improvement plan with the supervisor.";
                return domainSuggest[level] || domainSuggest.medium;
            }

            function generateRecommendations(domainAverages, totalScore) {
                const maxScore = totalQuestions * 5;
                const overallPercent = (totalScore / maxScore) * 100;
                let recommendations = [];

                if (overallPercent >= 90) {
                    recommendations.push("🟢 Your performance is excellent in all areas. We recommend continuing at this level, focusing on transferring experience to others and taking on greater leadership roles.");
                } else if (overallPercent >= 75) {
                    recommendations.push("🟡 Your performance is very good. Focus on strengthening current strengths, especially in areas where you scored below 80%.");
                } else if (overallPercent >= 60) {
                    recommendations.push("🟠 Your performance is acceptable. We recommend developing an individual improvement plan focusing on areas below 60%.");
                } else if (overallPercent >= 45) {
                    recommendations.push("🔴 Your performance needs significant improvement. We recommend intensive supervisor intervention and setting short-term measurable goals.");
                } else {
                    recommendations.push("⛔ Your performance is unsatisfactory. We recommend weekly evaluation sessions, identifying causes of weakness, and possibly reassigning tasks or providing intensive training.");
                }

                domainAverages.forEach(d => {
                    if (!d.allAnswered) return;
                    if (d.percent < 60) {
                        let suggestion = `🔻 "${d.name}" domain is **weak** (${Math.round(d.percent)}%). `;
                        suggestion += getDomainSuggestion(d.name, "weak");
                        recommendations.push(suggestion);
                    } else if (d.percent < 75) {
                        let suggestion = `📌 "${d.name}" domain needs **improvement** (${Math.round(d.percent)}%). `;
                        suggestion += getDomainSuggestion(d.name, "medium");
                        recommendations.push(suggestion);
                    } else {
                        recommendations.push(`✅ "${d.name}" domain is **strong** (${Math.round(d.percent)}%), keep maintaining this level.`);
                    }
                });

                return recommendations;
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
                const domainAverages = getDomainAverages();
                const recommendations = generateRecommendations(domainAverages, totalScore);

                const modal = document.getElementById("resultModal");
                document.getElementById("modalScore").innerText = `${totalScore} points (out of 200)`;
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
                // Validate all answers
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
                    const empName = document.getElementById("empName").value || "Not entered";
                    const empId = document.getElementById("empId").value || "Not entered";
                    const workPlace = document.getElementById("workPlace").value || "Not entered";
                    const qualification = document.getElementById("qualification").value || "Not entered";
                    const grade = document.getElementById("grade").value || "Not entered";
                    const gradeDate = document.getElementById("gradeDate").value || "Not entered";
                    const hireDate = document.getElementById("hireDate").value || "Not entered";
                    const prevScore = document.getElementById("prevScore").value || "Not entered";

                    const totalScore = calculateTotalScore();
                    if (totalScore === null) return;
                    const interpretation = getInterpretation(totalScore);
                    const domainAverages = getDomainAverages();
                    const recommendations = generateRecommendations(domainAverages, totalScore);

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
                    mh(cv, 1, 4, 4, `Employee Evaluation Report\n${empName}`, DB, GL, 18);
                    const inf = [
                        ['📋 Employee Name', empName],
                        ['📅 Date', new Date().toLocaleDateString('en-US')],
                        ['📊 Employee ID', empId],
                        ['🏢 Work Location', workPlace],
                        ['📈 Qualification', qualification],
                        ['💼 Job Title', grade],
                        ['⭐ Previous Evaluation', prevScore]
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

                    // 2. Summary & Recommendations
                    const summarySheet = workbook.addWorksheet('Results & Recommendations', { views: [{ rightToLeft: false,
                            showGridLines: false }] });
                    summarySheet.getColumn(1).width = 5;
                    summarySheet.getColumn(2).width = 50;
                    summarySheet.getColumn(3).width = 5;
                    mh(summarySheet, 1, 3, 1, '📊 Overall Score & Recommendations', DB, GL, 14);
                    summarySheet.getRow(1).height = 40;

                    summarySheet.mergeCells(2, 2, 2, 2);
                    const sc = summarySheet.getCell(2, 2);
                    sc.value = `Total Score: ${totalScore} points (out of 200)  |  Rating: ${interpretation.level}`;
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

                    // Recommendations
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

                    // 3. Detailed Criteria
                    const detailSheet = workbook.addWorksheet('Evaluation Details', { views: [{ rightToLeft: false,
                            showGridLines: false }] });
                    detailSheet.getColumn(1).width = 5;
                    detailSheet.getColumn(2).width = 10;
                    detailSheet.getColumn(3).width = 35;
                    detailSheet.getColumn(4).width = 45;
                    detailSheet.getColumn(5).width = 20;
                    detailSheet.getColumn(6).width = 15;
                    detailSheet.getColumn(7).width = 5;
                    mh(detailSheet, 1, 7, 1, '📋 Detailed Evaluation by Criteria', DB, GL, 14);
                    detailSheet.getRow(1).height = 40;
                    detailSheet.addRow(['#', 'Domain', 'Criteria', 'Rating', 'Score']);
                    const detailHeader = detailSheet.getRow(2);
                    detailHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    detailHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
                    detailSheet.getRow(2).height = 28;

                    allCriteria.forEach((item, idx) => {
                        const answer = answers[idx] !== null ? answers[idx] : '-';
                        const label = answer !== '-' ? optionLabels[answer] : '-';
                        const row = detailSheet.addRow([item.id, item.domain, item.text, label, answer]);
                        row.height = 22;
                        const bg = idx % 2 === 0 ? AR : 'FFFEFCF6';
                        row.eachCell((cell) => {
                            const col = cell.col;
                            if (col === 5) {
                                cell.font = { name: 'Arial', bold: true, size: 10, color: { argb: answer >=
                                        4 ? 'FF28A745' : answer >= 3 ? 'FFED6C02' :
                                        'FFDC3545' } };
                            }
                            Object.assign(cell, cs(bg, DT, false, col === 2 ? 'center' : 'left'));
                        });
                    });

                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const now = new Date();
                    const fileName =
                        `Evaluation_${empName}_${now.toISOString().slice(0,10)}.xlsx`;
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
                const empName = document.getElementById("empName").value || "Not entered";
                const empId = document.getElementById("empId").value || "Not entered";
                const workPlace = document.getElementById("workPlace").value || "Not entered";
                const qualification = document.getElementById("qualification").value || "Not entered";
                const grade = document.getElementById("grade").value || "Not entered";
                const gradeDate = document.getElementById("gradeDate").value || "Not entered";
                const hireDate = document.getElementById("hireDate").value || "Not entered";
                const prevScore = document.getElementById("prevScore").value || "Not entered";

                const totalScore = calculateTotalScore();
                if (totalScore === null) return null;
                const interpretation = getInterpretation(totalScore);
                const domainAverages = getDomainAverages();
                const recommendations = generateRecommendations(domainAverages, totalScore);

                let rows = "";
                allCriteria.forEach((item, idx) => {
                    const answer = answers[idx] !== null ? answers[idx] : "-";
                    const label = answer !== "-" ? optionLabels[answer] : "-";
                    rows += `<tr><td style="border:1px solid #999;padding:6px;text-align:center;">${item.id}</td>
                            <td style="border:1px solid #999;padding:6px;">${item.domain}</td>
                            <td style="border:1px solid #999;padding:6px;">${item.text}</td>
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
                            .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                            .info-table td { padding: 8px 12px; border: 1px solid #ccc; }
                            .info-table td:first-child { font-weight: bold; background: #f0f0f0; width: 25%; }
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
                        <h1>Employee Evaluation Report with Recommendations</h1>
                        <table class="info-table">
                            <tr><td>Name</td><td>${empName}</td><td>Employee ID</td><td>${empId}</td></tr>
                            <tr><td>Work Location</td><td>${workPlace}</td><td>Qualification</td><td>${qualification}</td></tr>
                            <tr><td>Job Title</td><td>${grade}</td><td>Grade Date</td><td>${gradeDate}</td></tr>
                            <tr><td>Hire Date</td><td>${hireDate}</td><td>Previous Evaluation</td><td>${prevScore}</td></tr>
                        </table>

                        <div class="summary">
                            <strong>Total Score:</strong> ${totalScore} points (out of 200) &nbsp;|&nbsp;
                            <strong>Rating:</strong> <span style="color:${interpretation.color};">${interpretation.level}</span><br>
                            <strong>Interpretation:</strong> ${interpretation.message}
                        </div>

                        <div class="rec-box">
                            <h3>📌 Recommendations & Proposed Development</h3>
                            <ul>${recHtml}</ul>
                        </div>

                        <h2>Detailed Evaluation by Criteria</h2>
                        <table class="details">
                            <thead><tr><th>#</th><th>Domain</th><th>Criteria</th><th>Rating</th><th>Score</th></tr></thead>
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
                    if (!content) { alert('Please complete the evaluation first.'); return; }
                    const blob = new Blob(['\uFEFF' + content], { type: 'application/msword' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `Evaluation_${document.getElementById('empName').value || 'Employee'}.doc`;
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
    