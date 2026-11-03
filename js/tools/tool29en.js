
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

            // ========== Domains & Criteria (16 criteria) ==========
            const domains = [{
                name: "Knowledge",
                icon: "fa-brain",
                criteria: [
                    "Accurate understanding of corporate finance basics (Income Statement, Balance Sheet, Cash Flow)",
                    "Produce a case study using financial techniques such as discounted cash flows",
                    "Sufficient knowledge of management accounting system and ability to explain and modify it",
                    "Understand HR policies and procedures to support the team in payroll and career development"
                ]
            }, {
                name: "Capabilities",
                icon: "fa-chart-line",
                criteria: [
                    "Access a company's website and identify its products and market strategies within 10 minutes",
                    "Calculate financial ratios from the annual report and compare institutions with industry standards",
                    "Use risk assessment process and provide optimistic, realistic, and pessimistic financial estimates",
                    "Present a compelling business case to promote a project and adjust key performance indicators"
                ]
            }, {
                name: "Directions",
                icon: "fa-compass",
                criteria: [
                    "Spend company money prudently and continuously seek cost reduction and return enhancement",
                    "Constantly move toward KPIs while recognizing when they are inappropriate and changing them",
                    "Commit to achieving goals while recognizing that ignorance of financial and administrative matters reduces performance",
                    "Strengthen the cognitive relationship with finance and consider financial management as a source of goal support"
                ]
            }, {
                name: "Behaviors",
                icon: "fa-user-check",
                criteria: [
                    "Regularly read financial pages of newspapers and follow industry and customer developments",
                    "Conduct one-on-one conversations with team members and understand their personal and professional aspirations",
                    "Continuously review the personal development plan and plan for the next promotion",
                    "Show enthusiasm for the team and determination to achieve all KPIs"
                ]
            }];

            let allCriteria = [];
            domains.forEach(domain => {
                domain.criteria.forEach((text) => {
                    allCriteria.push({ domain: domain.name, text: text });
                });
            });
            const totalQuestions = allCriteria.length; // 16
            let answers = new Array(totalQuestions).fill(null);
            const container = document.getElementById("questionsContainer");

            const scoreLabels = {
                0: "Unaware",
                1: "Minimal Knowledge",
                2: "Reasonable Familiarity",
                3: "Good Level",
                4: "Above Average",
                5: "Expert"
            };

            // ========== Build UI ==========
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
                        const domainObj = domains.find(d => d.name === currentDomain);
                        title.innerHTML = `<i class="fas ${domainObj?.icon || 'fa-circle'}"></i> ${currentDomain}`;
                        domainDiv.appendChild(title);
                        container.appendChild(domainDiv);
                    }

                    const qDiv = document.createElement("div");
                    qDiv.className = "question-item";
                    qDiv.setAttribute("data-qidx", idx);

                    const qHeader = document.createElement("div");
                    qHeader.className = "question-text";
                    qHeader.innerHTML = `<span class="q-num">${idx+1}</span> ${item.text}`;

                    const optionsDiv = document.createElement("div");
                    optionsDiv.className = "options-row";

                    for (let val = 0; val <= 5; val++) {
                        const radioWrap = document.createElement("div");
                        radioWrap.className = "radio-option";
                        const radioInput = document.createElement("input");
                        radioInput.type = "radio";
                        radioInput.name = `q_${idx}`;
                        radioInput.value = val;
                        radioInput.id = `q_${idx}_val_${val}`;
                        const label = document.createElement("label");
                        label.htmlFor = `q_${idx}_val_${val}`;
                        label.innerText = `${val} - ${scoreLabels[val]}`;

                        radioInput.addEventListener("change", (function(index, selectedVal) {
                            return function(e) {
                                if (e.target.checked) {
                                    answers[index] = selectedVal;
                                    updateProgressAndBar();
                                    applyColorCoding(index, selectedVal);
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
                            applyColorCoding(idx, answers[idx]);
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

            function applyColorCoding(index, value) {
                const questionDiv = document.querySelector(`.question-item[data-qidx="${index}"]`);
                if (!questionDiv) return;
                questionDiv.classList.remove("critical", "warning-item");
                if (value === 0 || value === 1) {
                    questionDiv.classList.add("critical");
                } else if (value === 2) {
                    questionDiv.classList.add("warning-item");
                }
            }

            function updateProgressAndBar() {
                const answeredCount = answers.filter(a => a !== null).length;
                document.getElementById("answeredCounter").innerText = `${answeredCount} / ${totalQuestions}`;
                const percent = (answeredCount / totalQuestions) * 100;
                document.getElementById("progressFill").style.width = `${percent}%`;
            }

            // ========== Calculations & Recommendations ==========
            function calculateTotalScore() {
                let sum = 0;
                for (let i = 0; i < totalQuestions; i++) {
                    if (answers[i] === null) return null;
                    sum += answers[i];
                }
                return sum;
            }

            function getCriticalAndWarningItems() {
                const critical = [];
                const warning = [];
                allCriteria.forEach((item, idx) => {
                    if (answers[idx] === null) return;
                    if (answers[idx] === 0 || answers[idx] === 1) {
                        critical.push({ ...item, index: idx, score: answers[idx] });
                    } else if (answers[idx] === 2) {
                        warning.push({ ...item, index: idx, score: answers[idx] });
                    }
                });
                return { critical, warning };
            }

            function getInterpretation(score) {
                const maxScore = totalQuestions * 5; // 80
                const percent = (score / maxScore) * 100;
                if (percent >= 85) return { level: "Expert Practitioner", message: "Exceptional knowledge and skills, you are a role model in your organization.", color: "#4ade80" };
                else if (percent >= 70) return { level: "Advanced", message: "Very good level with opportunities for improvement in some areas.", color: "#facc15" };
                else if (percent >= 50) return { level: "Qualified", message: "Solid foundation, but there are gaps that need a development plan.", color: "#fb923c" };
                else if (percent >= 30) return { level: "Beginner", message: "Only basic knowledge, should intensify learning and practical application.", color: "#f87171" };
                else return { level: "Limited Awareness", message: "You are at the beginning of your journey, need to build a strong knowledge base immediately.", color: "#ef4444" };
            }

            function generateRecommendations() {
                const totalScore = calculateTotalScore();
                if (totalScore === null) return [];
                const { critical, warning } = getCriticalAndWarningItems();
                let recommendations = [];

                if (critical.length > 0) {
                    recommendations.push("🔴 <strong>Critical areas (urgent action needed):</strong>");
                    critical.forEach(item => {
                        recommendations.push(`• ${item.text} (Score: ${item.score} - ${scoreLabels[item.score]})`);
                    });
                    recommendations.push("⚠️ These areas are essential for success and must be addressed with top priority.");
                }
                if (warning.length > 0) {
                    recommendations.push("🟠 <strong>Concerning areas (need development and monitoring):</strong>");
                    warning.forEach(item => {
                        recommendations.push(`• ${item.text} (Score: 2 - ${scoreLabels[2]})`);
                    });
                }
                if (critical.length === 0 && warning.length === 0 && totalScore > 0) {
                    recommendations.push("✅ No critical or highly concerning areas. Maintain excellence and monitor your progress.");
                }

                const maxScore = totalQuestions * 5;
                const percent = (totalScore / maxScore) * 100;
                if (percent < 50) {
                    recommendations.push("📌 Tip: Focus on building financial and administrative knowledge through specialized courses and seek guidance from experts.");
                } else if (percent < 75) {
                    recommendations.push("📌 Tip: Deepen your understanding in the orange areas, and practice applying skills in real projects.");
                } else {
                    recommendations.push("📌 Tip: You are in a strong position, share your knowledge with colleagues and take on leadership roles.");
                }

                return recommendations;
            }

            // ========== Show Modal ==========
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
                const recommendations = generateRecommendations();

                document.getElementById("modalScore").innerText = `${totalScore} points (out of 80)`;
                document.getElementById("modalInterpretation").innerHTML = `
                    <strong style="color: ${interpretation.color}; font-size:1.3rem;">${interpretation.level}</strong><br>
                    ${interpretation.message}
                `;
                const recList = document.getElementById("recList");
                recList.innerHTML = "";
                recommendations.forEach(rec => {
                    const li = document.createElement("li");
                    li.innerHTML = `<span class="rec-dot">•</span> ${rec}`;
                    recList.appendChild(li);
                });
                document.getElementById("resultModal").classList.add("active");
            }

            document.getElementById("showResultBtn").addEventListener("click", showResultModal);
            document.getElementById("closeModalBtn").addEventListener("click", function() {
                document.getElementById("resultModal").classList.remove("active");
            });
            document.getElementById("resultModal").addEventListener("click", function(e) {
                if (e.target === this) document.getElementById("resultModal").classList.remove("active");
            });

            // ========== Export Word ==========
            function generateWordHTML() {
                const empName = document.getElementById("empName").value || "Not specified";
                const jobTitle = document.getElementById("jobTitle").value || "Not specified";
                const department = document.getElementById("department").value || "Not specified";
                const evalDate = document.getElementById("evalDate").value || new Date().toISOString().slice(0, 10);

                let totalScore = 0;
                let allAnswered = true;
                for (let i = 0; i < totalQuestions; i++) {
                    if (answers[i] === null) { allAnswered = false; break; }
                    totalScore += answers[i];
                }
                const interpretation = allAnswered ? getInterpretation(totalScore) : { level: "Incomplete", message: "Not all criteria have been answered." };
                const recommendations = allAnswered ? generateRecommendations() : ["Complete all criteria."];

                let rows = "";
                allCriteria.forEach((item, idx) => {
                    const ans = answers[idx] !== null ? answers[idx] : "-";
                    const label = ans !== "-" ? scoreLabels[ans] : "-";
                    rows += `<tr>
                        <td style="border:1px solid #aaa;padding:6px;">${idx+1}</td>
                        <td style="border:1px solid #aaa;padding:6px;">${item.domain}</td>
                        <td style="border:1px solid #aaa;padding:6px;">${item.text}</td>
                        <td style="border:1px solid #aaa;padding:6px;text-align:center;">${label}</td>
                        <td style="border:1px solid #aaa;padding:6px;text-align:center;">${ans}</td>
                    </tr>`;
                });

                let recHtml = recommendations.map(r => `<li>${r}</li>`).join('');

                return `<!DOCTYPE html>
                <html dir="ltr">
                <head><meta charset="UTF-8">
                    <style>
                        body { font-family: 'Arial', 'Tajawal', sans-serif; padding: 30px; direction: ltr; }
                        h1 { color: #0a1a2a; border-bottom: 3px solid #b48554; padding-bottom: 10px; }
                        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                        .info-table td { padding: 8px; border: 1px solid #ccc; }
                        .info-table td:first-child { font-weight: bold; background: #f0f0f0; width: 25%; }
                        .summary { background: #f5f0e8; padding: 15px; border-radius: 12px; margin: 20px 0; }
                        .summary strong { color: #b48554; }
                        .rec-box { border-left: 5px solid #b48554; padding: 15px; background: #faf8f5; border-radius: 10px; margin: 20px 0; }
                        .rec-box h3 { margin-top: 0; color: #0a1a2a; }
                        .rec-box ul { padding-left: 20px; }
                        .rec-box li { margin-bottom: 8px; }
                        table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
                        th { background: #1a1a2e; color: white; padding: 8px; border: 1px solid #999; }
                        td { border: 1px solid #ddd; padding: 6px; }
                        .footer { margin-top: 30px; font-size: 0.8rem; color: #555; text-align: center; }
                    </style>
                </head>
                <body>
                    <h1>Knowledge & Skills Assessment Report</h1>
                    <table class="info-table">
                        <tr><td><strong>Name</strong></td><td>${empName}</td><td><strong>Job Title</strong></td><td>${jobTitle}</td></tr>
                        <tr><td><strong>Department</strong></td><td>${department}</td><td><strong>Assessment Date</strong></td><td>${evalDate}</td></tr>
                    </table>
                    <div class="summary">
                        <strong>Score:</strong> ${allAnswered ? totalScore+'/80' : 'Incomplete'} &nbsp;|&nbsp;
                        <strong>Rating:</strong> <span style="color:${interpretation.color};">${interpretation.level}</span><br>
                        <small>${interpretation.message}</small>
                    </div>
                    <div class="rec-box">
                        <h3>📌 Recommendations</h3>
                        <ul>${recHtml}</ul>
                    </div>
                    <h2>Criteria Details</h2>
                    <table><thead><tr><th>#</th><th>Domain</th><th>Criteria</th><th>Rating</th><th>Score</th></tr></thead><tbody>${rows}</tbody></table>
                    <div class="footer">This report was created by FAROUK GRUP for Consulting & Business | ${new Date().toLocaleDateString('en-US')}</div>
                </body></html>`;
            }

            function exportToWord() {
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
                const content = generateWordHTML();
                const blob = new Blob(['\uFEFF' + content], { type: 'application/msword' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `Skills_Assessment_${document.getElementById('empName').value || 'Individual'}.doc`;
                link.click();
                URL.revokeObjectURL(link.href);
            }
            document.getElementById("exportWordBtn").addEventListener("click", exportToWord);

            // ========== Export Excel ==========
            async function exportToExcel() {
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
                    const empName = document.getElementById("empName").value || "Not specified";
                    const jobTitle = document.getElementById("jobTitle").value || "Not specified";
                    const department = document.getElementById("department").value || "Not specified";
                    const evalDate = document.getElementById("evalDate").value || new Date().toISOString().slice(0, 10);

                    const totalScore = calculateTotalScore();
                    const interpretation = getInterpretation(totalScore);
                    const recommendations = generateRecommendations();

                    const workbook = new ExcelJS.Workbook();
                    workbook.creator = 'FAROUK GRUP';
                    workbook.created = new Date();

                    const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050';
                    const AR = 'FFF5F0E8', W = 'FFFFFFFF', DT = 'FF1A1A1A';
                    const RED = 'FFE6B8B7', ORANGE = 'FFFDE4C8';

                    function hs(bg = HB, tc = GL) { return { font: { name: 'Arial', bold: true, size: 11, color: { argb: tc } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }, alignment: { horizontal: 'center', vertical: 'middle', wrapText: true, readingOrder: 'ltr' }, border: { top: { style: 'thin', color: { argb: G } }, bottom: { style: 'thin', color: { argb: G } }, left: { style: 'thin', color: { argb: G } }, right: { style: 'thin', color: { argb: G } } } }; }

                    function cs(bg = W, tc = DT, b = false, h = 'center') { return { font: { name: 'Arial', bold: b, size: 10, color: { argb: tc } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }, alignment: { horizontal: h, vertical: 'middle', wrapText: true, readingOrder: 'ltr' }, border: { top: { style: 'hair', color: { argb: 'FFCCCCCC' } }, bottom: { style: 'hair', color: { argb: 'FFCCCCCC' } }, left: { style: 'hair', color: { argb: 'FFCCCCCC' } }, right: { style: 'hair', color: { argb: 'FFCCCCCC' } } } }; }

                    function ap(c, s) { if (s.font) c.font = s.font; if (s.fill) c.fill = s.fill; if (s.alignment) c.alignment = s.alignment; if (s.border) c.border = s.border; if (s.numFmt) c.numFmt = s.numFmt; }

                    function mh(ws, fc, tc, r, text, bg = HB, tc2 = GL, fs = 12) { ws.mergeCells(r, fc, r, tc); const c = ws.getCell(r, fc); c.value = text; c.font = { name: 'Arial', bold: true, size: fs, color: { argb: tc2 } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }; c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true, readingOrder: 'ltr' }; c.border = { top: { style: 'medium', color: { argb: G } }, bottom: { style: 'medium', color: { argb: G } }, left: { style: 'medium', color: { argb: G } }, right: { style: 'medium', color: { argb: G } } }; }

                    // 1. Cover Sheet
                    const cv = workbook.addWorksheet('Report Cover', { views: [{ rightToLeft: false, showGridLines: false }] });
                    [8, 45, 35, 8].forEach((w, i) => cv.getColumn(i + 1).width = w);
                    for (let r = 1; r <= 40; r++) cv.getRow(r).height = 22;
                    cv.getRow(2).height = 80;
                    cv.getRow(4).height = 60;
                    cv.mergeCells(2, 1, 2, 4);
                    const bc = cv.getCell(2, 1);
                    bc.value = 'FAROUK GRUP for Consulting & Business\nFAROUK GRUP';
                    bc.font = { name: 'Arial', bold: true, size: 28, color: { argb: GL } };
                    bc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DB } };
                    bc.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true, readingOrder: 'ltr' };
                    bc.border = { bottom: { style: 'thick', color: { argb: G } } };
                    mh(cv, 1, 4, 4, `Knowledge & Skills Assessment Report\n${empName}`, DB, GL, 18);
                    const inf = [
                        ['📋 Employee Name', empName],
                        ['📅 Date', evalDate],
                        ['💼 Job Title', jobTitle],
                        ['🏢 Department', department],
                        ['📊 Total Score', `${totalScore}/80`],
                        ['🏅 Rating', interpretation.level]
                    ];
                    let ir = 6;
                    inf.forEach(([l, v], idx) => {
                        cv.mergeCells(ir, 1, ir, 2);
                        cv.mergeCells(ir, 3, ir, 4);
                        const lc = cv.getCell(ir, 1), vc = cv.getCell(ir, 3);
                        lc.value = l; vc.value = v;
                        const bg = idx % 2 === 0 ? AR : 'FFFEFCF6';
                        ap(lc, { font: { name: 'Arial', bold: true, size: 11, color: { argb: '00695C' } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }, alignment: { horizontal: 'right', vertical: 'middle', readingOrder: 'ltr' }, border: { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' }, right: { style: 'hair' } } });
                        ap(vc, { font: { name: 'Arial', size: 11, color: { argb: DT } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }, alignment: { horizontal: 'center', vertical: 'middle', readingOrder: 'ltr' }, border: { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' }, right: { style: 'hair' } } });
                        cv.getRow(ir).height = 28;
                        ir++;
                    });

                    // 2. Results & Recommendations
                    const recSheet = workbook.addWorksheet('Results & Recommendations', { views: [{ rightToLeft: false, showGridLines: false }] });
                    recSheet.getColumn(1).width = 5;
                    recSheet.getColumn(2).width = 50;
                    recSheet.getColumn(3).width = 5;
                    mh(recSheet, 1, 3, 1, '📊 Overall Score & Recommendations', DB, GL, 14);
                    recSheet.getRow(1).height = 40;

                    recSheet.mergeCells(2, 2, 2, 2);
                    const sc = recSheet.getCell(2, 2);
                    sc.value = `Score: ${totalScore}/80  |  Rating: ${interpretation.level}`;
                    sc.font = { name: 'Arial', bold: true, size: 14, color: { argb: interpretation.color } };
                    sc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AR } };
                    sc.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'ltr' };
                    sc.border = { top: { style: 'medium', color: { argb: G } }, bottom: { style: 'medium', color: { argb: G } }, left: { style: 'medium', color: { argb: G } }, right: { style: 'medium', color: { argb: G } } };
                    recSheet.getRow(2).height = 35;

                    recSheet.mergeCells(3, 2, 3, 2);
                    const ic = recSheet.getCell(3, 2);
                    ic.value = interpretation.message;
                    ic.font = { name: 'Arial', size: 11, color: { argb: DT } };
                    ic.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEFCF6' } };
                    ic.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true, readingOrder: 'ltr' };
                    ic.border = { top: { style: 'hair' }, bottom: { style: 'hair', color: { argb: G } }, left: { style: 'hair' }, right: { style: 'hair' } };
                    recSheet.getRow(3).height = 40;

                    let recRow = 5;
                    recSheet.mergeCells(recRow, 2, recRow, 2);
                    const rt = recSheet.getCell(recRow, 2);
                    rt.value = '📌 Recommendations & Development Priorities';
                    rt.font = { name: 'Arial', bold: true, size: 12, color: { argb: GL } };
                    rt.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HB } };
                    rt.alignment = { horizontal: 'right', vertical: 'middle', readingOrder: 'ltr' };
                    rt.border = { bottom: { style: 'medium', color: { argb: G } } };
                    recSheet.getRow(recRow).height = 30;
                    recRow++;

                    recommendations.forEach((rec, idx) => {
                        recSheet.mergeCells(recRow, 2, recRow, 2);
                        const rc = recSheet.getCell(recRow, 2);
                        rc.value = `${idx+1}. ${rec}`;
                        const bg = idx % 2 === 0 ? AR : 'FFFEFCF6';
                        rc.font = { name: 'Arial', size: 10, color: { argb: DT } };
                        rc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
                        rc.alignment = { horizontal: 'right', vertical: 'top', wrapText: true, readingOrder: 'ltr' };
                        rc.border = { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' }, right: { style: 'hair' } };
                        recSheet.getRow(recRow).height = 22;
                        recRow++;
                    });

                    // 3. Criteria Details
                    const detailSheet = workbook.addWorksheet('Assessment Details', { views: [{ rightToLeft: false, showGridLines: false }] });
                    detailSheet.getColumn(1).width = 5;
                    detailSheet.getColumn(2).width = 10;
                    detailSheet.getColumn(3).width = 30;
                    detailSheet.getColumn(4).width = 45;
                    detailSheet.getColumn(5).width = 20;
                    detailSheet.getColumn(6).width = 15;
                    detailSheet.getColumn(7).width = 5;
                    mh(detailSheet, 1, 7, 1, '📋 Detailed Assessment by Criteria', DB, GL, 14);
                    detailSheet.getRow(1).height = 40;
                    detailSheet.addRow(['#', 'Domain', 'Criteria', 'Rating', 'Score']);
                    const detailHeader = detailSheet.getRow(2);
                    detailHeader.font = { bold: true, color: { argb: 'FFFFFFFF' } };
                    detailHeader.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
                    detailSheet.getRow(2).height = 28;

                    allCriteria.forEach((item, idx) => {
                        const ans = answers[idx] !== null ? answers[idx] : '-';
                        const label = ans !== '-' ? scoreLabels[ans] : '-';
                        const row = detailSheet.addRow([idx + 1, item.domain, item.text, label, ans]);
                        row.height = 22;
                        const bg = idx % 2 === 0 ? AR : 'FFFEFCF6';
                        const bgColor = (ans === 0 || ans === 1) ? RED : (ans === 2 ? ORANGE : bg);
                        row.eachCell((cell) => {
                            if (cell.col === 5) {
                                cell.font = { name: 'Arial', bold: true, size: 10, color: { argb: ans >= 4 ? 'FF28A745' : ans >= 3 ? 'FFED6C02' : 'FFDC3545' } };
                            }
                            Object.assign(cell, cs(bgColor, DT, false, cell.col === 2 || cell.col === 5 ? 'center' : 'left'));
                        });
                    });

                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const now = new Date();
                    const fileName = `Skills_Assessment_${empName}_${now.toISOString().slice(0,10)}.xlsx`;
                    saveAs(blob, fileName);
                } catch (err) {
                    console.error(err);
                    alert('Error creating Excel file: ' + err.message);
                } finally {
                    hideLoading();
                }
            }
            document.getElementById("exportExcelBtn").addEventListener("click", exportToExcel);

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
                        applyColorCoding(i, val);
                    }
                }
                updateProgressAndBar();
            }
            init();

        })();
    