
        (function() {
            'use strict';

            // ===== Yükleme fonksiyonları =====
            function showLoading(title, msg) {
                document.getElementById('loadingTitle').textContent = title;
                document.getElementById('loadingMsg').textContent = msg;
                document.getElementById('exportLoading').classList.add('show');
            }

            function hideLoading() {
                document.getElementById('exportLoading').classList.remove('show');
            }

            // ===== Sorular (26 ifade) =====
            const questionsList = [
                "Çalışanların işlerinden ne istediklerini size söylemeleri gerektiğini ve bunu yapacaklarını varsayıyor musunuz?",
                "Çalışanları elde tutmanın İK departmanının veya ücret uzmanlarının işi olduğunu düşünüyor musunuz?",
                "Çalışanların kariyer yolları onların kendi işleridir, sizin işiniz değil mi?",
                "Çalışanların size saygı duyduğunuzu bilmelerinin zaten bilinen bir şey olduğunu ve bu nedenle bunu göstermenize gerek olmadığını mı düşünüyorsunuz?",
                "Çalışanların işlerinde zorlanmadıklarını hissederlerse size söylemeleri gerektiğini mi düşünüyorsunuz?",
                "Çalışanların özel hayatlarını kapıda bırakmalarını ve sadece iş hayatlarının ilgi alanınızda olmasını mı bekliyorsunuz?",
                "Özellikle terfiler kolayca mevcut olmadığında, çalışanlarla kariyer seçeneklerini tartışmaktan kaçınıyor musunuz?",
                "Temel olarak pratik veya teknik becerilere göre mi işe alım yapıyorsunuz?",
                "Çalışanlara bilgiyi sadece ihtiyaç duyulduğunda mı veriyorsunuz?",
                "Burada işinizi yapmak için bulunduğunuzu ve çalışanların sizi sevmek zorunda olmadığını mı düşünüyorsunuz?",
                "İşyerinde eğlenmek için bulunmadığınızı mı düşünüyorsunuz?",
                "Çalışanları ağınızdaki diğer kişilerle tanıştırırsanız, onların onları ikna edip ayrılmalarına neden olacağından mı korkuyorsunuz?",
                "Mentorluk için zamanınız olmadığını mı düşünüyorsunuz?",
                "Yetkin ve başarılı çalışanları kaybetmenin size ne kadar maliyetli olduğunu gerçekten biliyor musunuz?",
                "İyi insanları başka fırsatlar aramalarına yardımcı olmak yerine saklama eğiliminde misiniz?",
                "Ne yaptığımızı sevme lüksüne sahip olmadığımız konusunda hemfikir misiniz?",
                "Çalışanlarınızın yararına politikaları sorgulamamakta başarısız mı oluyorsunuz?",
                "İyi işin kendi başına bir ödül olduğunu mu düşünüyorsunuz?",
                "İnsanları, nasıl, nerede ve ne zaman kontrol etmezseniz işin iyi yapılmayacağını mı düşünüyorsunuz?",
                "Çalışanlarınıza olumsuz geri bildirim veya düzeltme vermekten kaçınıyor musunuz?",
                "Kendinizi iyi bir dinleyici olmanızı engelleyecek kadar meşgul görüyor musunuz?",
                "Çalışanların değerlerini onların kendi özel işleri olarak görüyor ve bu nedenle nadiren tartışıyor musunuz?",
                "Çalışan sağlığı programlarının gereksiz maliyetler olduğunu mu düşünüyorsunuz?",
                "Nesiller arası farklılıkların iş yeri ile ilgisi olmadığını mı düşünüyorsunuz?",
                "Çalışanların genellikle ne yapacaklarını sizin söylemenizi beklemeleri gerektiğini mi düşünüyorsunuz?",
                "Çalışan bağlılığı ve elde tutmanın temel liderlik becerileri olmadığını ve bunları geliştirmek için zaman harcamaya gerek olmadığını mı savunuyorsunuz?"
            ];

            const optionLabels = {
                1: "Her zaman / Evet",
                2: "Çoğunlukla / Sık sık",
                3: "Bazen",
                4: "Asla / Hayır"
            };

            const totalQuestions = questionsList.length;
            let answers = new Array(totalQuestions).fill(null);
            const container = document.getElementById("questionsContainer");

            // ===== Soru arayüzünü oluştur =====
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

            // ===== Puan hesaplama ve öneriler =====
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
                        level: "Mükemmel - Yetenekleri Elde Tutma Zihniyeti",
                        message: "Tebrikler. Çalışanları kazanma zihniyetine sahipsiniz ve muhtemelen yetenekli çalışanlarınızı bağlı tutmak ve elde tutmak için gerekli adımları atıyorsunuz. Güven ve gelişim kültürünü güçlendirmeye devam edin.",
                        color: "#4ade80"
                    };
                } else if (score >= 53 && score <= 79) {
                    return {
                        level: "Orta - Yetenekleri Kaybetme Riski",
                        message: "Dikkat! En iyi çalışanlarınızı kaybetme riskiyle karşı karşıyasınız. Bazıları zaten ayrılmış olabilir. Durumu değerlendirin ve daha fazla yetenek kaybetmeden önce harekete geçin. İletişim ve güveni geliştirmeye odaklanın.",
                        color: "#fb923c"
                    };
                } else if (score >= 38 && score <= 52) {
                    return {
                        level: "Düşük - Acil Uyarı",
                        message: "Dikkat! Yetenekli çalışanları kaybetme riskiniz çok yüksek. İnançlarınız ve eylemlerinizle çatışma halinde olabilirsiniz ve bu durum, bağlı ve kalmak isteyen çalışanlara sahip olmanızın önünde bir engel olabilir. Hızlı ve odaklı bir eylem planına ihtiyacınız var.",
                        color: "#f87171"
                    };
                } else {
                    return {
                        level: "Çok Kritik",
                        message: "Çok düşük sonuç. Ekibinize karşı liderliğinizde ciddi bir bozukluk var. Yeteneklerin çoğu ayrıldı veya ayrılmak üzere. Yönetim felsefenizde acil bir değişiklik ve yoğun liderlik eğitimi almanızı öneririz.",
                        color: "#ef4444"
                    };
                }
            }

            function generateRecommendations(score) {
                const recs = [];
                if (score >= 80) {
                    recs.push("🟢 Liderlik performansınız mükemmel. Güven kültürünü güçlendirmeye, açık iletişim ve takım başarılarının takdirinde rol model olmaya devam edin.");
                    recs.push("🎯 Mentorluk becerilerini geliştirmeye ve deneyimi kurumunuzdaki yeni liderlere aktarmaya odaklanın.");
                } else if (score >= 53) {
                    recs.push("🟡 Risk bölgesindesiniz. İyileştirme önceliklerinizi belirleyin: takımınızla günlük iletişimi iyileştirerek başlayın ve düzenli olarak görüşlerini isteyin.");
                    recs.push("📌 Kararlarda şeffaflık yoluyla güven inşa edin ve her çalışana aktif dinleme için zaman ayırın.");
                    recs.push("🔹 Profesyonel gelişim politikalarını gözden geçirin ve net kariyer yolları olduğundan emin olun.");
                } else if (score >= 38) {
                    recs.push("🔴 Acil müdahaleye ihtiyacınız var. Her çalışanla bireysel görüşmelere başlayarak motivasyonlarını ve zorluklarını anlayın.");
                    recs.push("⚡ Takım kültürünü değerlendirin ve takım etkinlikleri ile başarıların takdiri yoluyla aidiyet duygusunu güçlendirin.");
                    recs.push("📈 Liderlik becerileriniz için kapsamlı bir gelişim planı oluşturmak üzere bir organizasyonel liderlik uzmanına danışın.");
                } else {
                    recs.push("⛔ Durumunuz kritik. Yönetim felsefenizde köklü bir değişiklik yapmanızı ve yoğun bir liderlik eğitim programına başlamanızı öneririz.");
                    recs.push("🔄 Bazı yetkileri ekibinize devredin ve karar alma süreçlerine katılım yoluyla güven inşa edin.");
                    recs.push("📅 İç ortamı iyileştirmek için ölçülebilir kısa vadeli hedefler belirleyin ve ilerlemeyi haftalık olarak takip edin.");
                }
                if (score <= 60) {
                    recs.push("💡 Ekibinizdeki tükenmişlik belirtilerine dikkat edin, psikolojik destek ve esnek çalışma olanakları sağlayın.");
                }
                if (score <= 45) {
                    recs.push("🚨 Teşvik yapısında bir sorun olabilir, ekibin beklentilerine uygun şekilde gözden geçirin ve düzenleyin.");
                }
                return recs;
            }

            // ===== Modal'ı göster =====
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
                document.getElementById("modalScore").innerText = `${totalScore} puan (104 üzerinden)`;
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
            // Excel Dışa Aktar - Profesyonel
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

                showLoading('Profesyonel Excel raporu oluşturuluyor...', 'Sayfalar ve tablolar oluşturuluyor');
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

                    // 1. Kapak sayfası
                    const cv = workbook.addWorksheet('Rapor Kapağı', { views: [{ rightToLeft: true,
                            showGridLines: false }] });
                    [8, 45, 35, 8].forEach((w, i) => cv.getColumn(i + 1).width = w);
                    for (let r = 1; r <= 40; r++) cv.getRow(r).height = 22;
                    cv.getRow(2).height = 80;
                    cv.getRow(4).height = 60;
                    cv.mergeCells(2, 1, 2, 4);
                    const bc = cv.getCell(2, 1);
                    bc.value = 'FAROUK GRUP\nDanışmanlık ve İşletme';
                    bc.font = { name: 'Arial', bold: true, size: 28, color: { argb: GL } };
                    bc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DB } };
                    bc.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true,
                    readingOrder: 'rtl' };
                    bc.border = { bottom: { style: 'thick', color: { argb: G } } };
                    mh(cv, 1, 4, 4, 'Yönetici Değerlendirme Ölçeği Raporu', DB, GL, 18);
                    const inf = [
                        ['📋 Değerlendirme', 'Yönetici Değerlendirme Ölçeği'],
                        ['📅 Tarih', new Date().toLocaleDateString('tr-TR')],
                        ['📊 Puan', `${totalScore} puan (104 üzerinden)`],
                        ['🏷️ Derece', interpretation.level]
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

                    // 2. Sonuç ve Öneriler
                    const summarySheet = workbook.addWorksheet('Sonuç ve Öneriler', { views: [{ rightToLeft: true,
                            showGridLines: false }] });
                    summarySheet.getColumn(1).width = 5;
                    summarySheet.getColumn(2).width = 50;
                    summarySheet.getColumn(3).width = 5;
                    mh(summarySheet, 1, 3, 1, '📊 Toplam Puan ve Öneriler', DB, GL, 14);
                    summarySheet.getRow(1).height = 40;

                    summarySheet.mergeCells(2, 2, 2, 2);
                    const sc = summarySheet.getCell(2, 2);
                    sc.value = `Toplam Puan: ${totalScore} puan (104 üzerinden)  |  Derece: ${interpretation.level}`;
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
                    rt.value = '📌 Öneriler ve Gelişim Önerileri';
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

                    // 3. İfade detayları
                    const detailSheet = workbook.addWorksheet('Değerlendirme Detayları', { views: [{ rightToLeft: true,
                            showGridLines: false }] });
                    detailSheet.getColumn(1).width = 5;
                    detailSheet.getColumn(2).width = 10;
                    detailSheet.getColumn(3).width = 60;
                    detailSheet.getColumn(4).width = 20;
                    detailSheet.getColumn(5).width = 15;
                    detailSheet.getColumn(6).width = 5;
                    mh(detailSheet, 1, 6, 1, '📋 İfadelere Göre Değerlendirme Detayları', DB, GL, 14);
                    detailSheet.getRow(1).height = 40;
                    detailSheet.addRow(['#', 'İfade', 'Derece', 'Puan']);
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
                        `Yonetici_Degerlendirme_Raporu_${now.toISOString().slice(0,10)}.xlsx`;
                    saveAs(blob, fileName);
                } catch (err) {
                    console.error(err);
                    alert('Excel dosyası oluşturulurken hata: ' + err.message);
                } finally {
                    hideLoading();
                }
            }

            // ============================================================
            // Word Dışa Aktar - Profesyonel
            // ============================================================
            function generateWordHTML() {
                let totalScore = 0;
                let allAnswered = true;
                for (let i = 0; i < totalQuestions; i++) {
                    if (answers[i] === null) { allAnswered = false; break; }
                    totalScore += answers[i];
                }
                const interpretation = allAnswered ? getInterpretation(totalScore) : { level: "Tamamlanmadı",
                    message: "Tüm ifadeler yanıtlanmadı.", color: "#888" };
                const recommendations = allAnswered ? generateRecommendations(totalScore) :
                ["Öneriler için değerlendirmeyi tamamlayın."];

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
                        <h1>Yönetici Değerlendirme Ölçeği Raporu</h1>
                        <div class="summary">
                            <strong>Toplam Puan:</strong> ${allAnswered ? totalScore + ' puan (104 üzerinden)' : 'Tamamlanmadı'} &nbsp;|&nbsp;
                            <strong>Derece:</strong> <span style="color:${interpretation.color};">${interpretation.level}</span><br>
                            <strong>Yorum:</strong> ${interpretation.message}
                        </div>
                        <div class="rec-box">
                            <h3>📌 Öneriler ve Gelişim Önerileri</h3>
                            <ul>${recHtml}</ul>
                        </div>
                        <h2>İfadelere Göre Değerlendirme Detayları</h2>
                        <table class="details">
                            <thead><tr><th>#</th><th>İfade</th><th>Derece</th><th>Puan</th></tr></thead>
                            <tbody>${rows}</tbody>
                        </table>
                        <div class="footer">Bu rapor FAROUK GRUP tarafından oluşturulmuştur | ${new Date().toLocaleDateString('tr-TR')}</div>
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

                showLoading('Profesyonel Word raporu oluşturuluyor...', 'Veriler toplanıyor');
                try {
                    const content = generateWordHTML();
                    if (!content) { alert('Lütfen önce değerlendirmeyi tamamlayın.'); return; }
                    const blob = new Blob(['\uFEFF' + content], { type: 'application/msword' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `Yonetici_Degerlendirme_Raporu.doc`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                } catch (err) {
                    console.error(err);
                    alert('Word raporu oluşturulurken hata: ' + err.message);
                } finally {
                    hideLoading();
                }
            }

            // ===== Butonları bağla =====
            document.getElementById("exportWordBtn").addEventListener("click", exportToWord);
            document.getElementById("exportExcelBtn").addEventListener("click", exportToFullExcel);

            // ============================================================
            // Başlangıç
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
    