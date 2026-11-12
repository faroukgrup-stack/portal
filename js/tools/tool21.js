
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
                T('s1'),
                T('s2'),
                T('s3'),
                T('s4'),
                T('s5'),
                T('s6'),
                T('s7'),
                T('s8'),
                T('s9'),
                T('s10'),
                T('s11'),
                T('s12'),
                T('s13'),
                T('s14'),
                T('s15'),
                T('s16'),
                T('s17'),
                T('s18'),
                T('s19'),
                T('s20'),
                T('s21'),
                T('s22'),
                T('s23'),
                T('s24'),
                T('s25'),
                T('s26')
            ];

            const optionLabels = {
                1: T('s27'),
                2: T('s28'),
                3: T('s29'),
                4: T('s30')
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
            // الحساب والتفسير والتوصيات تتم على الخادم (Supabase Edge Function)
            async function evaluateAll() {
                return await FG.calc('tool21', 'evaluate', { answers });
            }

            // ===== عرض المودال =====
            async function showResultModal() {
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

                let E;
                try { E = await evaluateAll(); } catch (e) { FG.calcError(e); return; }
                const { totalScore, interpretation, recommendations } = E;
                if (totalScore === null) return;

                const modal = document.getElementById("resultModal");
                document.getElementById("modalScore").innerText = `${totalScore}${T('s52')}`;
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

                showLoading(T('s53'), T('s54'));
                try {
                    const { totalScore, interpretation, recommendations } = await evaluateAll();
                    if (totalScore === null) return;

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
                    const cv = workbook.addWorksheet(T('s55'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    [8, 45, 35, 8].forEach((w, i) => cv.getColumn(i + 1).width = w);
                    for (let r = 1; r <= 40; r++) cv.getRow(r).height = 22;
                    cv.getRow(2).height = 80;
                    cv.getRow(4).height = 60;
                    cv.mergeCells(2, 1, 2, 4);
                    const bc = cv.getCell(2, 1);
                    bc.value = T('s56');
                    bc.font = { name: 'Arial', bold: true, size: 28, color: { argb: GL } };
                    bc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DB } };
                    bc.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true,
                    readingOrder: FG.dir() };
                    bc.border = { bottom: { style: 'thick', color: { argb: G } } };
                    mh(cv, 1, 4, 4, T('s57'), DB, GL, 18);
                    const inf = [
                        [T('s58'), T('s59')],
                        [T('s60'), new Date().toLocaleDateString(FG.locale())],
                        [T('s61'), `${totalScore}${T('s52')}`],
                        [T('s62'), interpretation.level]
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
                    const summarySheet = workbook.addWorksheet(T('s63'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    summarySheet.getColumn(1).width = 5;
                    summarySheet.getColumn(2).width = 50;
                    summarySheet.getColumn(3).width = 5;
                    mh(summarySheet, 1, 3, 1, T('s64'), DB, GL, 14);
                    summarySheet.getRow(1).height = 40;

                    summarySheet.mergeCells(2, 2, 2, 2);
                    const sc = summarySheet.getCell(2, 2);
                    sc.value = `${T('s65')}${totalScore}${T('s66')}${interpretation.level}`;
                    sc.font = { name: 'Arial', bold: true, size: 14, color: { argb: interpretation.color } };
                    sc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AR } };
                    sc.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: FG.dir() };
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
                    readingOrder: FG.dir() };
                    ic.border = { top: { style: 'hair' }, bottom: { style: 'hair', color: { argb: G } },
                        left: { style: 'hair' }, right: { style: 'hair' } };
                    summarySheet.getRow(3).height = 40;

                    let recRow = 5;
                    summarySheet.mergeCells(recRow, 2, recRow, 2);
                    const rt = summarySheet.getCell(recRow, 2);
                    rt.value = T('s67');
                    rt.font = { name: 'Arial', bold: true, size: 12, color: { argb: GL } };
                    rt.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HB } };
                    rt.alignment = { horizontal: 'right', vertical: 'middle', readingOrder: FG.dir() };
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
                            readingOrder: FG.dir() };
                        rc.border = { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' },
                            right: { style: 'hair' } };
                        summarySheet.getRow(recRow).height = 22;
                        recRow++;
                    });

                    // 3. تفاصيل العبارات
                    const detailSheet = workbook.addWorksheet(T('s68'), { views: [{ rightToLeft: FG.isRTL(),
                            showGridLines: false }] });
                    detailSheet.getColumn(1).width = 5;
                    detailSheet.getColumn(2).width = 10;
                    detailSheet.getColumn(3).width = 60;
                    detailSheet.getColumn(4).width = 20;
                    detailSheet.getColumn(5).width = 15;
                    detailSheet.getColumn(6).width = 5;
                    mh(detailSheet, 1, 6, 1, T('s69'), DB, GL, 14);
                    detailSheet.getRow(1).height = 40;
                    detailSheet.addRow(['#', T('s70'), T('s71'), T('s72')]);
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
                            Object.assign(cell, cs(bg, DT, false, col === 2 ? 'center' : FG.start()));
                        });
                    });

                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const now = new Date();
                    const fileName =
                        `${T('s73')}${now.toISOString().slice(0,10)}.xlsx`;
                    saveAs(blob, fileName);
                } catch (err) {
                    console.error(err);
                    alert(T('s74') + err.message);
                } finally {
                    hideLoading();
                }
            }

            // ============================================================
            // تصدير Word احترافي
            // ============================================================
            async function generateWordHTML() {
                let totalScore = 0;
                let allAnswered = true;
                for (let i = 0; i < totalQuestions; i++) {
                    if (answers[i] === null) { allAnswered = false; break; }
                    totalScore += answers[i];
                }
                const E = allAnswered ? await evaluateAll() : null;
                const interpretation = allAnswered ? E.interpretation : { level: T('s75'),
                    message: T('s76'), color: "#888" };
                const recommendations = allAnswered ? E.recommendations :
                [T('s77')];

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

                return `${T('s79')}${allAnswered ? totalScore + T('s52') : T('s78')}${T('s80')}${interpretation.color};">${interpretation.level}${T('s81')}${interpretation.message}${T('s82')}${recHtml}${T('s83')}${rows}${T('s84')}${new Date().toLocaleDateString(FG.locale())}</div>
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

                showLoading(T('s85'), T('s86'));
                try {
                    const content = await generateWordHTML();
                    if (!content) { alert(T('s87')); return; }
                    const blob = new Blob(['\uFEFF' + content], { type: 'application/msword' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `${T('s88')}`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                } catch (err) {
                    console.error(err);
                    alert(T('s89') + err.message);
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
    