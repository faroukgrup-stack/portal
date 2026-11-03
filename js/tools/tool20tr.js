
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

            // ===== Alanlar ve kriterler (40 kriter) =====
            const domains = [
                { name: "Ana Şirket", range: [1, 4], criteria: ["Şirkete bağlılık ve çıkarlarını koruma", "Şirket politika ve kurallarına uyum", "Şirket mal varlığını koruma", "Şirket sırlarını koruma"] },
                { name: "Üst Yönetim", range: [5, 8], criteria: ["Üst yönetimin hedef ve politikalarını anlama", "Amirlerin eleştiri ve yönlendirmelerini kabul etme", "Üst yönetim talimatlarına uyum", "Baskı altında çalışma gereksinimlerini kabul etme"] },
                { name: "Bölüm veya Birim", range: [9, 12], criteria: ["İş prosedür ve yöntemlerini bilme", "İş seviyesini geliştirmeye özen gösterme", "Çalışma ortamında esneklik ve uyum", "İş arkadaşlarıyla iş birliği"] },
                { name: "Uzmanlık Alanı", range: [13, 16], criteria: ["Uzmanlık alanında yeterlilik", "Uzmanlık alanındaki gelişmeleri takip etme", "Uzmanlık alanındaki yenilikleri özümseme", "Uzmanlık alanında deneyim aktarımı"] },
                { name: "Yönetim Becerileri", range: [17, 20], criteria: ["İyi planlama yeteneği", "Karar alma yeteneği", "İdari denetim yeteneği", "Teknik denetim yeteneği"] },
                { name: "Pratik Beceriler", range: [21, 28], criteria: ["İşte yaratıcılık ve yenilik", "İşte inisiyatif alma", "İşte doğruluk, düzen ve organizasyon", "Denetimsiz çalışabilme", "Baskı altında çalışabilme", "İş yöntemlerini geliştirmeye özen gösterme", "İş sorunlarına çözüm bulma", "Daha üst düzey sorumlulukları üstlenme"] },
                { name: "İşe Bağlılık", range: [29, 34], criteria: ["İş kurallarına ve prosedürlerine bağlılık", "Doğrudan amir talimatlarına bağlılık", "Mesai saatlerine bağlılık", "İş sağlığı ve güvenliği kurallarına bağlılık", "Kılık kıyafet ve görünüm kurallarına bağlılık", "Resmi kıyafet kurallarına bağlılık"] },
                { name: "Kişisel Özellikler ve İlişkiler", range: [35, 40], criteria: ["Çalışma ortamında denge ve acelecilikten kaçınma", "Hazırcevaplık ve uygun davranış", "Sorumluluk üstlenme", "İş arkadaşlarıyla ilişkiler", "Astlarla ilişkiler", "Müşterilerle ilişkiler"] }
            ];

            let allCriteria = [];
            let globalIndex = 0;
            domains.forEach(domain => {
                domain.criteria.forEach(c => {
                    globalIndex++;
                    allCriteria.push({ id: globalIndex, domain: domain.name, text: c });
                });
            });
            const totalQuestions = allCriteria.length;

            const optionLabels = { 1: "Zayıf", 2: "Orta", 3: "İyi", 4: "Çok İyi", 5: "Mükemmel" };
            let answers = new Array(totalQuestions).fill(null);
            const container = document.getElementById("questionsContainer");

            // ===== Soruları oluştur =====
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

            // ===== Hesaplama ve öneriler =====
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
                if (percent >= 90) return { level: "Mükemmel", message: "Olağanüstü performans, takdir ve terfiye layık.", color: "#4ade80" };
                else if (percent >= 75) return { level: "Çok İyi", message: "Yüksek performans, geliştirilebilecek bazı noktalar var.", color: "#facc15" };
                else if (percent >= 60) return { level: "İyi", message: "Kabul edilebilir performans, bazı alanlarda iyileştirme gerekli.", color: "#fb923c" };
                else if (percent >= 45) return { level: "Orta", message: "Beklenenin altında performans, gelişim planı gerekiyor.", color: "#f87171" };
                else return { level: "Zayıf", message: "Yetersiz performans, acil müdahale gerekiyor.", color: "#ef4444" };
            }

            function getDomainSuggestion(domainName, level) {
                const suggestions = {
                    "Ana Şirket": {
                        weak: "Şirket vizyon ve misyonu hakkında farkındalık eğitimleri, aidiyet duygusunu artıracak ödül programları düzenleyin.",
                        medium: "İç iletişim kanallarını güçlendirerek politikaları açıklayın, çalışanı şirket çıkarlarını ilgilendiren basit kararlara dahil edin."
                    },
                    "Üst Yönetim": {
                        weak: "Yapıcı eleştiri ve stres yönetimi atölyeleri düzenleyin, yöneticilere örnek liderlik modeli sunun.",
                        medium: "Üst-amir iletişimini iyileştirin, sorunları paylaşmak için düzenli toplantılar yapın."
                    },
                    "Bölüm veya Birim": {
                        weak: "İş prosedürlerini güncelleyin, birleşik bir prosedür kılavuzu oluşturun, takım çalışmasını teşvik edin.",
                        medium: "Beyin fırtınası oturumları düzenleyin, esnekliği artırmak için iş rotasyonu uygulayın."
                    },
                    "Uzmanlık Alanı": {
                        weak: "Yoğun mesleki eğitim sağlayın, konferanslara katılımı teşvik edin, dijital referans kütüphanesi oluşturun.",
                        medium: "Uzmanlık alanında mentor atayın, profesyonel sertifika programlarına yönlendirin."
                    },
                    "Yönetim Becerileri": {
                        weak: "Liderlik ve proje yönetimi eğitimlerine yönlendirin, basit yönetim görevleri verin.",
                        medium: "Kendi kendine değerlendirme yöntemlerini uygulayın, düzenli geri bildirim oturumları yapın."
                    },
                    "Pratik Beceriler": {
                        weak: "İş başında eğitim, günlük performans hedefleri belirleme, basit sorunlara çözüm üretmeyi teşvik edin.",
                        medium: "İç yaratıcılık yarışmaları düzenleyin, çalışana daha fazla inisiyatif ve yetki verin."
                    },
                    "İşe Bağlılık": {
                        weak: "Disiplin kurallarını netleştirin, ödül-ceza sistemini adil uygulayın, kılık kıyafet kurallarını takip edin.",
                        medium: "Yöneticiler örnek olmalı, çalışanlara zaman ve prosedürlere bağlılığın önemini sürekli hatırlatın."
                    },
                    "Kişisel Özellikler ve İlişkiler": {
                        weak: "Duygusal zeka ve iletişim becerileri eğitimi verin, işyerinde saygı ve nezaket bilincini artırın.",
                        medium: "Sosyal etkinliklere katılımı teşvik edin, farklı kişiliklerle başa çıkma becerilerini geliştirin."
                    }
                };
                const domainSuggest = suggestions[domainName];
                if (!domainSuggest) return "Bu alanda performansı gözden geçirin ve yöneticinizle bir gelişim planı oluşturun.";
                return domainSuggest[level] || domainSuggest.medium;
            }

            function generateRecommendations(domainAverages, totalScore) {
                const maxScore = totalQuestions * 5;
                const overallPercent = (totalScore / maxScore) * 100;
                let recommendations = [];

                if (overallPercent >= 90) {
                    recommendations.push("🟢 Tüm alanlarda mükemmel performans. Başkalarına deneyim aktarmanızı ve daha fazla liderlik rolü üstlenmenizi öneririz.");
                } else if (overallPercent >= 75) {
                    recommendations.push("🟡 Performansınız çok iyi. Mevcut güçlü yönlerinizi güçlendirin, %80'in altındaki alanlara odaklanın.");
                } else if (overallPercent >= 60) {
                    recommendations.push("🟠 Performansınız kabul edilebilir düzeyde. %60'ın altındaki alanlara odaklanan bireysel gelişim planı oluşturun.");
                } else if (overallPercent >= 45) {
                    recommendations.push("🔴 Performansınız önemli ölçüde iyileştirilmeli. Yoğun yönetici desteği ve kısa vadeli ölçülebilir hedefler belirleyin.");
                } else {
                    recommendations.push("⛔ Performansınız yetersiz. Haftalık değerlendirme toplantıları yapın, zayıflığın nedenlerini belirleyin ve gerekirse görev dağılımını yeniden düzenleyin.");
                }

                domainAverages.forEach(d => {
                    if (!d.allAnswered) return;
                    if (d.percent < 60) {
                        let suggestion = `🔻 "${d.name}" alanı **zayıf** (${Math.round(d.percent)}%). `;
                        suggestion += getDomainSuggestion(d.name, "weak");
                        recommendations.push(suggestion);
                    } else if (d.percent < 75) {
                        let suggestion = `📌 "${d.name}" alanı **gelişime açık** (${Math.round(d.percent)}%). `;
                        suggestion += getDomainSuggestion(d.name, "medium");
                        recommendations.push(suggestion);
                    } else {
                        recommendations.push(`✅ "${d.name}" alanı **güçlü** (${Math.round(d.percent)}%), bu seviyeyi korumaya devam edin.`);
                    }
                });

                return recommendations;
            }

            // ===== Modal göster =====
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
                document.getElementById("modalScore").innerText = `${totalScore} puan (200 üzerinden)`;
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
            // Excel Dışa Aktar
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

                showLoading('Profesyonel Excel raporu oluşturuluyor...', 'Sayfalar oluşturuluyor');
                try {
                    const empName = document.getElementById("empName").value || "Belirtilmemiş";
                    const empId = document.getElementById("empId").value || "Belirtilmemiş";
                    const workPlace = document.getElementById("workPlace").value || "Belirtilmemiş";
                    const qualification = document.getElementById("qualification").value || "Belirtilmemiş";
                    const grade = document.getElementById("grade").value || "Belirtilmemiş";
                    const gradeDate = document.getElementById("gradeDate").value || "Belirtilmemiş";
                    const hireDate = document.getElementById("hireDate").value || "Belirtilmemiş";
                    const prevScore = document.getElementById("prevScore").value || "Belirtilmemiş";

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

                    function hs(bg = HB, tc = GL) { return { font: { name: 'Arial', bold: true, size: 11, color: { argb: tc } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }, alignment: { horizontal: 'center', vertical: 'middle', wrapText: true, readingOrder: 'rtl' }, border: { top: { style: 'thin', color: { argb: G } }, bottom: { style: 'thin', color: { argb: G } }, left: { style: 'thin', color: { argb: G } }, right: { style: 'thin', color: { argb: G } } } }; }
                    function cs(bg = W, tc = DT, b = false, h = 'center') { return { font: { name: 'Arial', bold: b, size: 10, color: { argb: tc } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }, alignment: { horizontal: h, vertical: 'middle', wrapText: true, readingOrder: 'rtl' }, border: { top: { style: 'hair', color: { argb: 'FFCCCCCC' } }, bottom: { style: 'hair', color: { argb: 'FFCCCCCC' } }, left: { style: 'hair', color: { argb: 'FFCCCCCC' } }, right: { style: 'hair', color: { argb: 'FFCCCCCC' } } } }; }
                    function ap(c, s) { if (s.font) c.font = s.font; if (s.fill) c.fill = s.fill; if (s.alignment) c.alignment = s.alignment; if (s.border) c.border = s.border; if (s.numFmt) c.numFmt = s.numFmt; }
                    function mh(ws, fc, tc, r, text, bg = HB, tc2 = GL, fs = 12) { ws.mergeCells(r, fc, r, tc); const c = ws.getCell(r, fc); c.value = text; c.font = { name: 'Arial', bold: true, size: fs, color: { argb: tc2 } }; c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }; c.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true, readingOrder: 'rtl' }; c.border = { top: { style: 'medium', color: { argb: G } }, bottom: { style: 'medium', color: { argb: G } }, left: { style: 'medium', color: { argb: G } }, right: { style: 'medium', color: { argb: G } } }; }

                    // 1. Kapak
                    const cv = workbook.addWorksheet('Kapak', { views: [{ rightToLeft: true, showGridLines: false }] });
                    [8, 45, 35, 8].forEach((w, i) => cv.getColumn(i + 1).width = w);
                    for (let r = 1; r <= 40; r++) cv.getRow(r).height = 22;
                    cv.getRow(2).height = 80; cv.getRow(4).height = 60;
                    cv.mergeCells(2, 1, 2, 4);
                    const bc = cv.getCell(2, 1);
                    bc.value = 'FAROUK GRUP\nDanışmanlık ve İşletme';
                    bc.font = { name: 'Arial', bold: true, size: 28, color: { argb: GL } };
                    bc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: DB } };
                    bc.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true, readingOrder: 'rtl' };
                    bc.border = { bottom: { style: 'thick', color: { argb: G } } };
                    mh(cv, 1, 4, 4, `Personel Değerlendirme Raporu\n${empName}`, DB, GL, 18);
                    const inf = [
                        ['📋 Çalışan Adı', empName],
                        ['📅 Tarih', new Date().toLocaleDateString('tr-TR')],
                        ['📊 Personel No', empId],
                        ['🏢 Çalışma Yeri', workPlace],
                        ['📈 Akademik Durum', qualification],
                        ['💼 Unvan', grade],
                        ['⭐ Önceki Puan', prevScore]
                    ];
                    let ir = 6;
                    inf.forEach(([l, v], idx) => {
                        cv.mergeCells(ir, 1, ir, 2); cv.mergeCells(ir, 3, ir, 4);
                        const lc = cv.getCell(ir, 1), vc = cv.getCell(ir, 3);
                        lc.value = l; vc.value = v;
                        const bg = idx % 2 === 0 ? AR : 'FFFEFCF6';
                        ap(lc, { font: { name: 'Arial', bold: true, size: 11, color: { argb: '00695C' } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }, alignment: { horizontal: 'right', vertical: 'middle', readingOrder: 'rtl' }, border: { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' }, right: { style: 'hair' } } });
                        ap(vc, { font: { name: 'Arial', size: 11, color: { argb: DT } }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } }, alignment: { horizontal: 'center', vertical: 'middle', readingOrder: 'rtl' }, border: { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' }, right: { style: 'hair' } } });
                        cv.getRow(ir).height = 28; ir++;
                    });

                    // 2. Sonuç ve Öneriler
                    const summarySheet = workbook.addWorksheet('Sonuç ve Öneriler', { views: [{ rightToLeft: true, showGridLines: false }] });
                    summarySheet.getColumn(1).width = 5; summarySheet.getColumn(2).width = 50; summarySheet.getColumn(3).width = 5;
                    mh(summarySheet, 1, 3, 1, '📊 Genel Sonuç ve Öneriler', DB, GL, 14);
                    summarySheet.getRow(1).height = 40;

                    summarySheet.mergeCells(2, 2, 2, 2);
                    const sc = summarySheet.getCell(2, 2);
                    sc.value = `Toplam Puan: ${totalScore} (200 üzerinden)  |  Değerlendirme: ${interpretation.level}`;
                    sc.font = { name: 'Arial', bold: true, size: 14, color: { argb: interpretation.color } };
                    sc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AR } };
                    sc.alignment = { horizontal: 'center', vertical: 'middle', readingOrder: 'rtl' };
                    sc.border = { top: { style: 'medium', color: { argb: G } }, bottom: { style: 'medium', color: { argb: G } }, left: { style: 'medium', color: { argb: G } }, right: { style: 'medium', color: { argb: G } } };
                    summarySheet.getRow(2).height = 35;

                    summarySheet.mergeCells(3, 2, 3, 2);
                    const ic = summarySheet.getCell(3, 2);
                    ic.value = interpretation.message;
                    ic.font = { name: 'Arial', size: 11, color: { argb: DT } };
                    ic.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEFCF6' } };
                    ic.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true, readingOrder: 'rtl' };
                    ic.border = { top: { style: 'hair' }, bottom: { style: 'hair', color: { argb: G } }, left: { style: 'hair' }, right: { style: 'hair' } };
                    summarySheet.getRow(3).height = 40;

                    let recRow = 5;
                    summarySheet.mergeCells(recRow, 2, recRow, 2);
                    const rt = summarySheet.getCell(recRow, 2);
                    rt.value = '📌 Öneriler ve Gelişim Planı';
                    rt.font = { name: 'Arial', bold: true, size: 12, color: { argb: GL } };
                    rt.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: HB } };
                    rt.alignment = { horizontal: 'right', vertical: 'middle', readingOrder: 'rtl' };
                    rt.border = { bottom: { style: 'medium', color: { argb: G } } };
                    summarySheet.getRow(recRow).height = 30; recRow++;

                    recommendations.forEach((rec, idx) => {
                        summarySheet.mergeCells(recRow, 2, recRow, 2);
                        const rc = summarySheet.getCell(recRow, 2);
                        rc.value = `${idx+1}. ${rec}`;
                        const bg = idx % 2 === 0 ? AR : 'FFFEFCF6';
                        rc.font = { name: 'Arial', size: 10, color: { argb: DT } };
                        rc.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
                        rc.alignment = { horizontal: 'right', vertical: 'top', wrapText: true, readingOrder: 'rtl' };
                        rc.border = { top: { style: 'hair' }, bottom: { style: 'hair' }, left: { style: 'hair' }, right: { style: 'hair' } };
                        summarySheet.getRow(recRow).height = 22; recRow++;
                    });

                    // 3. Kriter Detayları
                    const detailSheet = workbook.addWorksheet('Kriter Detayları', { views: [{ rightToLeft: true, showGridLines: false }] });
                    detailSheet.getColumn(1).width = 5; detailSheet.getColumn(2).width = 10; detailSheet.getColumn(3).width = 35; detailSheet.getColumn(4).width = 45; detailSheet.getColumn(5).width = 20; detailSheet.getColumn(6).width = 15;
                    mh(detailSheet, 1, 6, 1, '📋 Kriter Bazında Detaylı Değerlendirme', DB, GL, 14);
                    detailSheet.getRow(1).height = 40;
                    detailSheet.addRow(['#', 'Alan', 'Kriter', 'Değerlendirme', 'Puan']);
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
                                cell.font = { name: 'Arial', bold: true, size: 10, color: { argb: answer >= 4 ? 'FF28A745' : answer >= 3 ? 'FFED6C02' : 'FFDC3545' } };
                            }
                            Object.assign(cell, cs(bg, DT, false, col === 2 ? 'center' : 'right'));
                        });
                    });

                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    const now = new Date();
                    const fileName = `Değerlendirme_Raporu_${empName}_${now.toISOString().slice(0,10)}.xlsx`;
                    saveAs(blob, fileName);
                } catch (err) {
                    console.error(err);
                    alert('Excel dosyası oluşturulurken hata: ' + err.message);
                } finally {
                    hideLoading();
                }
            }

            // ============================================================
            // Word Dışa Aktar
            // ============================================================
            function generateWordHTML() {
                const empName = document.getElementById("empName").value || "Belirtilmemiş";
                const empId = document.getElementById("empId").value || "Belirtilmemiş";
                const workPlace = document.getElementById("workPlace").value || "Belirtilmemiş";
                const qualification = document.getElementById("qualification").value || "Belirtilmemiş";
                const grade = document.getElementById("grade").value || "Belirtilmemiş";
                const gradeDate = document.getElementById("gradeDate").value || "Belirtilmemiş";
                const hireDate = document.getElementById("hireDate").value || "Belirtilmemiş";
                const prevScore = document.getElementById("prevScore").value || "Belirtilmemiş";

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
                    <html dir="rtl">
                    <head><meta charset="UTF-8">
                        <style>
                            body { font-family: 'Arial', sans-serif; padding: 30px; direction: rtl; }
                            h1 { color: #0a1a2a; border-bottom: 3px solid #C4A747; padding-bottom: 10px; }
                            .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                            .info-table td { padding: 8px 12px; border: 1px solid #ccc; }
                            .info-table td:first-child { font-weight: bold; background: #f0f0f0; width: 25%; }
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
                        <h1>Personel Değerlendirme Raporu</h1>
                        <table class="info-table">
                            <tr><td>Ad Soyad</td><td>${empName}</td><td>Personel No</td><td>${empId}</td></tr>
                            <tr><td>Çalışma Yeri</td><td>${workPlace}</td><td>Akademik Durum</td><td>${qualification}</td></tr>
                            <tr><td>Unvan</td><td>${grade}</td><td>Unvan Tarihi</td><td>${gradeDate}</td></tr>
                            <tr><td>İşe Başlama</td><td>${hireDate}</td><td>Önceki Puan</td><td>${prevScore}</td></tr>
                        </table>

                        <div class="summary">
                            <strong>Toplam Puan:</strong> ${totalScore} (200 üzerinden) &nbsp;|&nbsp;
                            <strong>Değerlendirme:</strong> <span style="color:${interpretation.color};">${interpretation.level}</span><br>
                            <strong>Yorum:</strong> ${interpretation.message}
                        </div>

                        <div class="rec-box">
                            <h3>📌 Öneriler ve Gelişim Planı</h3>
                            <ul>${recHtml}</ul>
                        </div>

                        <h2>Kriter Bazında Detaylar</h2>
                        <table class="details">
                            <thead><tr><th>#</th><th>Alan</th><th>Kriter</th><th>Değerlendirme</th><th>Puan</th></tr></thead>
                            <tbody>${rows}</tbody>
                        </table>
                        <div class="footer">FAROUK GRUP tarafından oluşturulmuştur | ${new Date().toLocaleDateString('tr-TR')}</div>
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

                showLoading('Word raporu oluşturuluyor...', 'Veriler toplanıyor');
                try {
                    const content = generateWordHTML();
                    if (!content) { alert('Lütfen önce değerlendirmeyi tamamlayın.'); return; }
                    const blob = new Blob(['\uFEFF' + content], { type: 'application/msword' });
                    const link = document.createElement('a');
                    link.href = URL.createObjectURL(blob);
                    link.download = `Değerlendirme_${document.getElementById('empName').value || 'Çalışan'}.doc`;
                    link.click();
                    URL.revokeObjectURL(link.href);
                } catch (err) {
                    console.error(err);
                    alert('Word raporu oluşturulurken hata: ' + err.message);
                } finally {
                    hideLoading();
                }
            }

            // ===== Buton bağlantıları =====
            document.getElementById("exportWordBtn").addEventListener("click", exportToWord);
            document.getElementById("exportExcelBtn").addEventListener("click", exportToFullExcel);

            // ===== Başlangıç =====
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
    