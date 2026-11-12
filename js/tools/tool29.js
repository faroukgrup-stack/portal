
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

            // ========== تعريف المجالات والمعايير (16 معياراً) ==========
            const domains = [{
                name: T('s1'),
                icon: "fa-brain",
                criteria: [
                    T('s2'),
                    T('s3'),
                    T('s4'),
                    T('s5')
                ]
            }, {
                name: T('s6'),
                icon: "fa-chart-line",
                criteria: [
                    T('s7'),
                    T('s8'),
                    T('s9'),
                    T('s10')
                ]
            }, {
                name: T('s11'),
                icon: "fa-compass",
                criteria: [
                    T('s12'),
                    T('s13'),
                    T('s14'),
                    T('s15')
                ]
            }, {
                name: T('s16'),
                icon: "fa-user-check",
                criteria: [
                    T('s17'),
                    T('s18'),
                    T('s19'),
                    T('s20')
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
                0: T('s21'),
                1: T('s22'),
                2: T('s23'),
                3: T('s24'),
                4: T('s25'),
                5: T('s26')
            };

            // ========== بناء الواجهة ==========
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
                                    highlightSelectedOption(radioWrap.parentElement,
                                    selectedVal);
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

            // ========== الحسابات والتوصيات ==========
            // الحساب والتفسير والتوصيات تتم على الخادم (Supabase Edge Function)
            async function evaluateAll() {
                return await FG.calc('tool29', 'evaluate', { answers });
            }

            // ========== عرض المودال ==========
            async function showResultModal() {
                for (let i = 0; i < totalQuestions; i++) {
                    if (answers[i] === null) {
                        const toast = document.getElementById("warningToast");
                        toast.style.display = "block";
                        setTimeout(() => {
                            toast.style.opacity = "0";
                            setTimeout(() => { toast.style.display = "none";
                                toast.style.opacity = "1"; }, 400);
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
                let E;
                try { E = await evaluateAll(); } catch (e) { FG.calcError(e); return; }
                const { totalScore, interpretation, recommendations } = E;
                if (totalScore === null) return;

                document.getElementById("modalScore").innerText = `${totalScore}${T('s46')}`;
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

            // ========== تصدير Word ==========
            async function generateWordHTML() {
                const empName = document.getElementById("empName").value || T('s47');
                const jobTitle = document.getElementById("jobTitle").value || T('s47');
                const department = document.getElementById("department").value || T('s47');
                const evalDate = document.getElementById("evalDate").value || new Date().toISOString().slice(0, 10);

                let totalScore = 0;
                let allAnswered = true;
                for (let i = 0; i < totalQuestions; i++) {
                    if (answers[i] === null) { allAnswered = false; break; }
                    totalScore += answers[i];
                }
                const E = allAnswered ? await evaluateAll() : null;
                const interpretation = allAnswered ? E.interpretation : { level: T('s48'),
                    message: T('s49') };
                const recommendations = allAnswered ? E.recommendations : [T('s50')];

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

                return `${T('s52')}${empName}${T('s53')}${jobTitle}${T('s54')}${department}${T('s55')}${evalDate}${T('s56')}${allAnswered ? totalScore+'/80' : T('s51')}${T('s57')}${interpretation.color};">${interpretation.level}</span><br>
                        <small>${interpretation.message}${T('s58')}${recHtml}${T('s59')}${rows}${T('s60')}${new Date().toLocaleDateString(FG.locale())}</div>
                </body></html>`;
            }

            async function exportToWord() {
                for (let i = 0; i < totalQuestions; i++) {
                    if (answers[i] === null) {
                        const toast = document.getElementById("warningToast");
                        toast.style.display = "block";
                        setTimeout(() => {
                            toast.style.opacity = "0";
                            setTimeout(() => { toast.style.display = "none";
                                toast.style.opacity = "1"; }, 400);
                        }, 2000);
                        return;
                    }
                }
                let content;
                try { content = await generateWordHTML(); } catch (e) { FG.calcError(e); return; }
                const blob = new Blob(['\uFEFF' + content], { type: 'application/msword' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = `${T('s62')}${document.getElementById('empName').value || T('s61')}.doc`;
                link.click();
                URL.revokeObjectURL(link.href);
            }
            document.getElementById("exportWordBtn").addEventListener("click", exportToWord);

            // ========== تصدير Excel ==========
            async function exportToExcel() {
                for (let i = 0; i < totalQuestions; i++) {
                    if (answers[i] === null) {
                        const toast = document.getElementById("warningToast");
                        toast.style.display = "block";
                        setTimeout(() => {
                            toast.style.opacity = "0";
                            setTimeout(() => { toast.style.display = "none";
                                toast.style.opacity = "1"; }, 400);
                        }, 2000);
                        return;
                    }
                }

                showLoading(T('s63'), T('s64'));
                try {
                    const empName = document.getElementById("empName").value || T('s47');
                    const jobTitle = document.getElementById("jobTitle").value || T('s47');
                    const department = document.getElementById("department").value || T('s47');
                    const evalDate = document.getElementById("evalDate").value || new Date().toISOString().slice(0, 10);

                    const { totalScore, interpretation, recommendations } = await evaluateAll();

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
                    const RED = 'FFE6B8B7',
                        ORANGE = 'FFFDE4C8';

                    function hs(bg = HB, tc = GL) { return { font: { name: 'Arial', bold: true, size: 11,
                                color: { argb: tc } }, fill: { type: 'pattern', pattern: 'solid',
                                fgColor: { argb: bg } }, alignment: { horizontal: 'center',
                                vertical: 'middle', wrapText: true, readingOrder: FG.dir() }, border: { top: {
                                    style: 'thin', color: { argb: G } }, bottom: { style: 'thin',
                                    color: { argb: G } }, left: { style: 'thin', color: { argb: G } },
                                right: { style: 'thin', color: { argb: G } } } }; }

                    function cs(bg = W, tc = DT, b = false, h = 'center') { return { font: { name: 'Arial',
                                bold: b, size: 10, color: { argb: tc } }, fill: { type: 'pattern',
                                pattern: 'solid', fgColor: { argb: bg } }, alignment: { horizontal: h,
                                vertical: 'middle', wrapText: true, readingOrder: FG.dir() }, border: { top: {
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
                            wrapText: true, readingOrder: FG.dir() }; c.border = { top: { style: 'medium',
                                color: { argb: G } }, bottom: { style: 'medium', color: { argb: G } },
                            left: { style: 'medium', color: { argb: G } }, right: { style: 'medium',
                                color: { argb: G } } }; }

                    // 1. غلاف التقرير
                    const cv = workbook.addWorksheet(T('s65'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    [8, 45, 35, 8].forEach((w, i) => cv.getColumn(i + 1).width = w);
                    for (let r = 1; r <= 40; r++) cv.getRow(r).height = 22;
                    cv.getRow(2).height = 80;
                    cv.getRow(4).height = 60;
                    cv.mergeCells(2, 1, 2, 4);
                    const bc = cv.getCell(2, 1);
                    bc.value = T('s66');
                    bc.font = { name: 'Arial', bold: true, size: 28, color: { argb: GL } };
                    bc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DB } };
                    bc.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true,
                    readingOrder: FG.dir() };
                    bc.border = { bottom: { style: 'thick', color: { argb: G } } };
                    mh(cv, 1, 4, 4, `${T('s67')}${empName}`, DB, GL, 18);
                    const inf = [
                        [T('s68'), empName],
                        [T('s69'), evalDate],
                        [T('s70'), jobTitle],
                        [T('s71'), department],
                        [T('s72'), `${totalScore}/80`],
                        [T('s73'), interpretation.level]
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
                            alignment: { horizontal: 'right', vertical: 'middle', readingOrder: FG.dir() },
                            border: { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' },
                                right: { style: 'hair' } } });
                        ap(vc, { font: { name: 'Arial', size: 11, color: { argb: DT } },
                            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } },
                            alignment: { horizontal: 'center', vertical: 'middle', readingOrder: FG.dir() },
                            border: { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' },
                                right: { style: 'hair' } } });
                        cv.getRow(ir).height = 28;
                        ir++;
                    });

                    // 2. النتيجة والتوصيات
                    const recSheet = workbook.addWorksheet(T('s74'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    recSheet.getColumn(1).width = 5;
                    recSheet.getColumn(2).width = 50;
                    recSheet.getColumn(3).width = 5;
                    mh(recSheet, 1, 3, 1, T('s75'), DB, GL, 14);
                    recSheet.getRow(1).height = 40;

                    recSheet.mergeCells(2, 2, 2, 2);
                    const sc = recSheet.getCell(2, 2);
                    sc.value = `${T('s76')}${totalScore}${T('s77')}${interpretation.level}`;
                    sc.font = { name: 'Arial', bold: true, size: 14, color: { argb: interpretation.color } };
                    sc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AR } };
                    sc.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: FG.dir() };
                    sc.border = { top: { style: 'medium', color: { argb: G } }, bottom: { style: 'medium',
                            color: { argb: G } }, left: { style: 'medium', color: { argb: G } },
                        right: { style: 'medium', color: { argb: G } } };
                    recSheet.getRow(2).height = 35;

                    recSheet.mergeCells(3, 2, 3, 2);
                    const ic = recSheet.getCell(3, 2);
                    ic.value = interpretation.message;
                    ic.font = { name: 'Arial', size: 11, color: { argb: DT } };
                    ic.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEFCF6' } };
                    ic.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true,
                    readingOrder: FG.dir() };
                    ic.border = { top: { style: 'hair' }, bottom: { style: 'hair', color: { argb: G } },
                        left: { style: 'hair' }, right: { style: 'hair' } };
                    recSheet.getRow(3).height = 40;

                    let recRow = 5;
                    recSheet.mergeCells(recRow, 2, recRow, 2);
                    const rt = recSheet.getCell(recRow, 2);
                    rt.value = T('s78');
                    rt.font = { name: 'Arial', bold: true, size: 12, color: { argb: GL } };
                    rt.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HB } };
                    rt.alignment = { horizontal: 'right', vertical: 'middle', readingOrder: FG.dir() };
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
                        rc.alignment = { horizontal: 'right', vertical: 'top', wrapText: true,
                            readingOrder: FG.dir() };
                        rc.border = { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' },
                            right: { style: 'hair' } };
                        recSheet.getRow(recRow).height = 22;
                        recRow++;
                    });

                    // 3. تفاصيل المعايير
                    const detailSheet = workbook.addWorksheet(T('s79'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    detailSheet.getColumn(1).width = 5;
                    detailSheet.getColumn(2).width = 10;
                    detailSheet.getColumn(3).width = 30;
                    detailSheet.getColumn(4).width = 45;
                    detailSheet.getColumn(5).width = 20;
                    detailSheet.getColumn(6).width = 15;
                    detailSheet.getColumn(7).width = 5;
                    mh(detailSheet, 1, 7, 1, T('s80'), DB, GL, 14);
                    detailSheet.getRow(1).height = 40;
                    detailSheet.addRow(['#', T('s81'), T('s82'), T('s83'), T('s84')]);
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
                                cell.font = { name: 'Arial', bold: true, size: 10, color: { argb: ans >=
                                        4 ? 'FF28A745' : ans >= 3 ? 'FFED6C02' :
                                        'FFDC3545' } };
                            }
                            Object.assign(cell, cs(bgColor, DT, false, cell.col === 2 || cell.col ===
                                5 ? 'center' : FG.start()));
                        });
                    });

                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const now = new Date();
                    const fileName =
                        `${T('s85')}${empName}_${now.toISOString().slice(0,10)}.xlsx`;
                    saveAs(blob, fileName);
                } catch (err) {
                    console.error(err);
                    alert(T('s86') + err.message);
                } finally {
                    hideLoading();
                }
            }
            document.getElementById("exportExcelBtn").addEventListener("click", exportToExcel);

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
                        applyColorCoding(i, val);
                    }
                }
                updateProgressAndBar();
            }
            init();

        })();
    