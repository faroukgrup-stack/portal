/**
 * fg-dock.js — حاوية الخدمات الجانبية لكل الأدوات (V7.2)
 * ------------------------------------------------------------------
 * يُحمَّل تلقائياً من fg-boot.js بعد منطق الأداة، ويضيف:
 *   1. حاوية جانبية (يسار الصفحة في العربية، يمين الصفحة في الإنجليزية والتركية) فيها:
 *        - الحاسبة: تعمل مع الأداة في الصفحة نفسها، وتُدرج الناتج في الخانة المحددة.
 *        - المساعد الذكي (الأداة 24 مصغّرة): يشرح خطوات التعبئة ومعنى الخانات والنتائج.
 *      الأداة تبقى الجزء الأكبر من الشاشة ويمكن متابعة العمل عليها والحاوية مفتوحة.
 *   2. تلميح عند مرور الفأرة على أي خانة يشرح ماهيتها وما يجب كتابته (من قاعدة البيانات: tip:<selector>).
 *   3. توحيد أزرار التصدير: Word أزرق «تصدير Word شامل»، Excel أخضر «تصدير Excel شامل».
 * النصوص من ui_translations (namespace = common) مع نسخة احتياطية مدمجة هنا.
 */
(function () {
    "use strict";
    var FG = window.FG;
    if (!FG || window.__FG_DOCK__) return;
    window.__FG_DOCK__ = true;
    var lang = FG.lang || "ar";
    var TOOL = FG.tool || "";

    /* ───────────── النصوص المشتركة ───────────── */
    var FALLBACK = {
        ar: { dockCalc: "الحاسبة", dockAI: "المساعد الذكي", dockClose: "إغلاق", calcInsert: "إدراج في الخانة المحددة", calcPull: "أخذ قيمة الخانة",
              calcCopy: "نسخ", calcNoField: "انقر أولاً على الخانة التي تريد تعبئتها في الأداة، ثم اضغط إدراج.", calcTarget: "الخانة المحددة:",
              calcInserted: "تم الإدراج", calcHistory: "السجل", calcErr: "خطأ في العملية",
              aiWelcome: "مرحباً، أنا المساعد الذكي لهذه الأداة. اسألني عن أي خانة أو خطوة، أو اطلب مني شرح النتائج.",
              aiPlaceholder: "اكتب سؤالك هنا...", aiSend: "إرسال", aiQ1: "اشرح لي خطوات تعبئة هذه الأداة", aiQ2: "ما معنى الخانة المحددة وماذا أكتب فيها؟",
              aiQ3: "فسّر لي النتائج الحالية", aiThinking: "جارٍ التفكير...", aiError: "تعذّر الوصول إلى المساعد الآن. حاول مرة أخرى.",
              aiClear: "محادثة جديدة", aiNote: "قد يخطئ المساعد أحياناً، فراجع الأرقام المهمة.",
              expWord: "تصدير Word شامل", expExcel: "تصدير Excel شامل", expPdf: "تصدير PDF",
              tipCurrency: "العملة التي تظهر بها كل المبالغ في الأداة والتقارير. اختر عملة مشروعك، فالأداة لا تحوّل بين العملات.",
              tipCompany: "اسم الشركة أو الجهة التي يُعدّ لها التقرير، ويظهر في عنوان تقريري Word وExcel." },
        en: { dockCalc: "Calculator", dockAI: "Smart Assistant", dockClose: "Close", calcInsert: "Insert into selected field", calcPull: "Take field value",
              calcCopy: "Copy", calcNoField: "First click the field you want to fill in the tool, then press Insert.", calcTarget: "Selected field:",
              calcInserted: "Inserted", calcHistory: "History", calcErr: "Invalid operation",
              aiWelcome: "Hello, I am the smart assistant for this tool. Ask me about any field or step, or ask me to explain the results.",
              aiPlaceholder: "Type your question here...", aiSend: "Send", aiQ1: "Explain step by step how to fill in this tool", aiQ2: "What does the selected field mean and what should I enter?",
              aiQ3: "Explain the current results", aiThinking: "Thinking...", aiError: "The assistant is not available right now. Please try again.",
              aiClear: "New chat", aiNote: "The assistant can make mistakes; double-check important figures.",
              expWord: "Full Word Export", expExcel: "Full Excel Export", expPdf: "Export PDF",
              tipCurrency: "The currency used for every amount in the tool and the reports. Choose your project currency; the tool does not convert between currencies.",
              tipCompany: "The name of the company or party the report is prepared for. It appears in the title of the Word and Excel reports." },
        tr: { dockCalc: "Hesap Makinesi", dockAI: "Akıllı Asistan", dockClose: "Kapat", calcInsert: "Seçili alana ekle", calcPull: "Alan değerini al",
              calcCopy: "Kopyala", calcNoField: "Önce araçta doldurmak istediğiniz alana tıklayın, ardından Ekle'ye basın.", calcTarget: "Seçili alan:",
              calcInserted: "Eklendi", calcHistory: "Geçmiş", calcErr: "Geçersiz işlem",
              aiWelcome: "Merhaba, bu aracın akıllı asistanıyım. Herhangi bir alan veya adım hakkında soru sorabilir ya da sonuçları açıklamamı isteyebilirsiniz.",
              aiPlaceholder: "Sorunuzu buraya yazın...", aiSend: "Gönder", aiQ1: "Bu aracı adım adım nasıl dolduracağımı açıkla", aiQ2: "Seçili alan ne anlama geliyor ve ne yazmalıyım?",
              aiQ3: "Mevcut sonuçları açıkla", aiThinking: "Düşünüyor...", aiError: "Asistana şu anda ulaşılamıyor. Lütfen tekrar deneyin.",
              aiClear: "Yeni sohbet", aiNote: "Asistan zaman zaman hata yapabilir; önemli rakamları kontrol edin.",
              expWord: "Kapsamlı Word Dışa Aktar", expExcel: "Kapsamlı Excel Dışa Aktar", expPdf: "PDF Dışa Aktar",
              tipCurrency: "Araçtaki ve raporlardaki tüm tutarların para birimi. Projenizin para birimini seçin; araç kur dönüşümü yapmaz.",
              tipCompany: "Raporun hazırlandığı şirket veya kurumun adı. Word ve Excel raporlarının başlığında görünür." }
    };
    function C(k) {
        var c = FG.common || {};
        if (Object.prototype.hasOwnProperty.call(c, k)) return c[k];
        var f = FALLBACK[lang] || (FG.isRTL() ? FALLBACK.ar : FALLBACK.en);
        return f[k] != null ? f[k] : (FALLBACK.ar[k] || k);
    }
    function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
    function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
    function inDock(node) { return !!(node && node.closest && node.closest(".fgd-root, .fgd-tip")); }
    function isField(node) {
        if (!node || !node.matches) return false;
        if (!node.matches("input, select, textarea")) return false;
        var t = (node.type || "").toLowerCase();
        if (["button", "submit", "reset", "hidden", "file", "image"].indexOf(t) !== -1) return false;
        if (node.id === "calcDisplay" || node.closest("#calculatorModal")) return false;
        return !inDock(node);
    }
    function cleanText(s) { return String(s || "").replace(/\s+/g, " ").replace(/[:：]\s*$/, "").trim(); }

    /** اسم الخانة كما يراه المستخدم (label / عنوان العمود / placeholder) */
    function fieldLabel(f) {
        if (!f) return "";
        var txt = "";
        try {
            if (f.id) { var l = document.querySelector('label[for="' + (window.CSS && CSS.escape ? CSS.escape(f.id) : f.id) + '"]'); if (l) txt = l.textContent; }
            if (!txt) { var pl = f.closest("label"); if (pl) txt = pl.textContent; }
            if (!txt) {
                var p = f.parentElement;
                for (var i = 0; i < 3 && p && !txt; i++, p = p.parentElement) {
                    var labs = p.querySelectorAll("label, .label, .input-label, h4, h5");
                    for (var j = 0; j < labs.length; j++) {
                        if (labs[j].contains(f)) continue;
                        if (labs[j].compareDocumentPosition(f) & Node.DOCUMENT_POSITION_FOLLOWING) { txt = labs[j].textContent; }
                    }
                }
            }
            if (!txt) {
                var td = f.closest("td, th");
                var table = td && td.closest("table");
                if (table) {
                    var idx = Array.prototype.indexOf.call(td.parentElement.children, td);
                    var head = table.querySelector("thead tr") || table.querySelector("tr");
                    if (head && head.children[idx] && head !== td.parentElement) txt = head.children[idx].textContent;
                }
            }
        } catch (e) {}
        if (!txt) txt = f.getAttribute("aria-label") || f.placeholder || f.title || f.name || f.id || "";
        txt = cleanText(txt);
        return txt.length > 90 ? txt.slice(0, 90) + "…" : txt;
    }

    /* ───────────── 1. توحيد أزرار التصدير ───────────── */
    function standardizeExports() {
        var map = [
            { sel: "#exportWordBtn", cls: "fg-exp-word", icon: "fa-file-word", key: "expWord" },
            { sel: "#exportExcelBtn, #exportFullExcelBtn", cls: "fg-exp-excel", icon: "fa-file-excel", key: "expExcel" },
            { sel: "#exportPdfBtn", cls: "fg-exp-pdf", icon: "fa-file-pdf", key: "expPdf" }
        ];
        map.forEach(function (m) {
            document.querySelectorAll(m.sel).forEach(function (b) {
                b.classList.add("fg-exp", m.cls);
                b.innerHTML = '<i class="fas ' + m.icon + '"></i> <span>' + esc(C(m.key)) + "</span>";
                if (b.parentElement) b.parentElement.classList.add("fg-exp-row");
            });
        });
        var w = document.querySelector("#exportWordBtn");
        var x = document.querySelector("#exportExcelBtn, #exportFullExcelBtn");
        if (w && x && w.parentElement === x.parentElement && (x.compareDocumentPosition(w) & Node.DOCUMENT_POSITION_FOLLOWING)) {
            w.parentElement.insertBefore(w, x);   // الترتيب الموحد: Word ثم Excel
        }
    }

    /* ───────────── 2. تلميحات الخانات ───────────── */
    var TIPS = [];
    function buildTips() {
        var d = (FG.dict && FG.dict()) || {};
        Object.keys(d).forEach(function (k) {
            if (k.indexOf("tip:") === 0 && d[k]) TIPS.push({ sel: k.slice(4), text: d[k] });
        });
        TIPS.push({ sel: "#currencySelect", text: C("tipCurrency") });
        TIPS.push({ sel: "#companyName", text: C("tipCompany") });
    }
    function tipFor(f) {
        for (var i = 0; i < TIPS.length; i++) {
            try { if (f.matches(TIPS[i].sel)) return TIPS[i].text; } catch (e) {}
        }
        return "";
    }
    var tipBox = null, tipFor_ = null, tipTimer = null;
    function showTip(f) {
        var text = tipFor(f);
        var label = fieldLabel(f);
        if (!text) {
            var ph = cleanText(f.placeholder);
            if (!label || !ph || ph === label) return hideTip();
            text = ph;
        }
        if (!tipBox) { tipBox = el("div", "fgd-tip"); tipBox.setAttribute("role", "tooltip"); document.body.appendChild(tipBox); }
        tipBox.innerHTML = (label ? "<strong>" + esc(label) + "</strong>" : "") + "<span>" + esc(text) + "</span>";
        tipBox.dir = FG.dir();
        tipBox.style.display = "block";
        var r = f.getBoundingClientRect();
        var bw = tipBox.offsetWidth, bh = tipBox.offsetHeight;
        var top = r.top - bh - 10, below = false;
        if (top < 8) { top = r.bottom + 10; below = true; }
        var left = FG.isRTL() ? (r.right - bw) : r.left;
        left = Math.max(8, Math.min(left, window.innerWidth - bw - 8));
        tipBox.style.top = Math.round(top) + "px";
        tipBox.style.left = Math.round(left) + "px";
        tipBox.classList.toggle("below", below);
        tipFor_ = f;
        if (!f.getAttribute("aria-description")) f.setAttribute("aria-description", text);
    }
    function hideTip() { if (tipBox) tipBox.style.display = "none"; tipFor_ = null; clearTimeout(tipTimer); }
    function initTips() {
        buildTips();
        document.addEventListener("mouseover", function (e) {
            var t = e.target;
            if (t && t.tagName === "LABEL" && t.control) t = t.control;
            var f = t && t.closest ? t.closest("input, select, textarea") : null;
            if (f && isField(f)) { if (f !== tipFor_) { clearTimeout(tipTimer); tipTimer = setTimeout(function () { showTip(f); }, 250); } }
            else if (tipFor_ && !(t && t.tagName === "LABEL")) { clearTimeout(tipTimer); hideTip(); }
        }, true);
        document.addEventListener("focusin", function (e) {
            if (isField(e.target) && window.matchMedia && window.matchMedia("(hover: none)").matches) {
                showTip(e.target); clearTimeout(tipTimer); tipTimer = setTimeout(hideTip, 6000);
            }
        }, true);
        document.addEventListener("focusout", function () { if (window.matchMedia && window.matchMedia("(hover: none)").matches) hideTip(); }, true);
        window.addEventListener("scroll", hideTip, true);
        window.addEventListener("resize", hideTip);
    }

    /* ───────────── 3. آخر خانة استخدمها المستخدم (لإدراج ناتج الحاسبة) ───────────── */
    var lastField = null;
    document.addEventListener("focusin", function (e) {
        var f = e.target;
        if (!isField(f) || f.tagName === "SELECT") return;
        var t = (f.type || "").toLowerCase();
        if (t === "checkbox" || t === "radio" || f.readOnly || f.disabled) return;
        lastField = f;
        updateTarget();
    }, true);

    /* ───────────── 4. الحاوية الجانبية ───────────── */
    var root, panel, calcPane, aiPane, railCalc, railAI, targetEl, disp, histEl;
    var ROBOT = '<svg viewBox="0 0 64 64" aria-hidden="true" class="fgd-robot"><defs><linearGradient id="fgdG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe296"/><stop offset=".55" stop-color="#e8b95c"/><stop offset="1" stop-color="#c9963e"/></linearGradient></defs>' +
        '<line x1="32" y1="6" x2="32" y2="14" stroke="url(#fgdG)" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="5" r="3.5" fill="url(#fgdG)"/>' +
        '<rect x="12" y="14" width="40" height="32" rx="10" fill="#0b0e17" stroke="url(#fgdG)" stroke-width="3"/>' +
        '<circle cx="24" cy="29" r="4.5" fill="url(#fgdG)"/><circle cx="40" cy="29" r="4.5" fill="url(#fgdG)"/>' +
        '<path d="M24 38 q8 5 16 0" fill="none" stroke="url(#fgdG)" stroke-width="3" stroke-linecap="round"/>' +
        '<rect x="5" y="24" width="5" height="12" rx="2.5" fill="url(#fgdG)"/><rect x="54" y="24" width="5" height="12" rx="2.5" fill="url(#fgdG)"/>' +
        '<path d="M20 50 h24 l4 10 h-32z" fill="url(#fgdG)" opacity=".9"/></svg>';

    function buildDock() {
        root = el("div", "fgd-root");
        root.dir = FG.dir();
        root.innerHTML =
            '<div class="fgd-rail" role="toolbar">' +
              '<button type="button" class="fgd-rail-btn" data-pane="calc" title="' + esc(C("dockCalc")) + '"><i class="fas fa-calculator"></i><span>' + esc(C("dockCalc")) + '</span></button>' +
              '<button type="button" class="fgd-rail-btn fgd-rail-ai" data-pane="ai" title="' + esc(C("dockAI")) + '">' + ROBOT + '<span>' + esc(C("dockAI")) + '</span></button>' +
            '</div>' +
            '<aside class="fgd-panel" aria-hidden="true">' +
              '<div class="fgd-head"><div class="fgd-title"></div><button type="button" class="fgd-x" title="' + esc(C("dockClose")) + '"><i class="fas fa-times"></i></button></div>' +
              '<section class="fgd-pane fgd-calc">' +
                '<div class="fgd-target"><span class="lbl">' + esc(C("calcTarget")) + '</span> <b class="val">—</b></div>' +
                '<input type="text" class="fgd-disp" dir="ltr" inputmode="decimal" autocomplete="off" value="0" aria-label="calculator">' +
                '<div class="fgd-keys" dir="ltr">' +
                  ["C", "(", ")", "⌫", "7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−", "0", ".", "%", "+"].map(function (k) {
                      var cls = /[÷×−+%()]/.test(k) ? " op" : (k === "C" || k === "⌫") ? " fn" : "";
                      return '<button type="button" class="fgd-k' + cls + '" data-k="' + k + '">' + k + "</button>";
                  }).join("") +
                  '<button type="button" class="fgd-k eq" data-k="=">=</button>' +
                '</div>' +
                '<div class="fgd-actions">' +
                  '<button type="button" class="fgd-btn gold" data-act="insert"><i class="fas fa-arrow-right-to-bracket"></i> ' + esc(C("calcInsert")) + '</button>' +
                  '<button type="button" class="fgd-btn" data-act="pull"><i class="fas fa-arrow-down"></i> ' + esc(C("calcPull")) + '</button>' +
                  '<button type="button" class="fgd-btn" data-act="copy"><i class="far fa-copy"></i> ' + esc(C("calcCopy")) + '</button>' +
                '</div>' +
                '<div class="fgd-msg" aria-live="polite"></div>' +
                '<div class="fgd-hist-t">' + esc(C("calcHistory")) + '</div><div class="fgd-hist"></div>' +
              '</section>' +
              '<section class="fgd-pane fgd-ai">' +
                '<div class="fgd-chat" aria-live="polite"></div>' +
                '<div class="fgd-quick">' +
                  '<button type="button" data-q="aiQ1">' + esc(C("aiQ1")) + '</button>' +
                  '<button type="button" data-q="aiQ2">' + esc(C("aiQ2")) + '</button>' +
                  '<button type="button" data-q="aiQ3">' + esc(C("aiQ3")) + '</button>' +
                '</div>' +
                '<form class="fgd-ask"><textarea rows="2" maxlength="1500" placeholder="' + esc(C("aiPlaceholder")) + '"></textarea>' +
                  '<button type="submit" class="fgd-btn gold" title="' + esc(C("aiSend")) + '"><i class="fas fa-paper-plane"></i></button></form>' +
                '<div class="fgd-foot"><button type="button" class="fgd-link" data-act="clear"><i class="fas fa-rotate-left"></i> ' + esc(C("aiClear")) + '</button><span>' + esc(C("aiNote")) + '</span></div>' +
              '</section>' +
            '</aside>';
        document.body.appendChild(root);
        panel = root.querySelector(".fgd-panel");
        calcPane = root.querySelector(".fgd-calc");
        aiPane = root.querySelector(".fgd-ai");
        railCalc = root.querySelector('[data-pane="calc"]');
        railAI = root.querySelector('[data-pane="ai"]');
        targetEl = root.querySelector(".fgd-target .val");
        disp = root.querySelector(".fgd-disp");
        histEl = root.querySelector(".fgd-hist");

        root.querySelectorAll(".fgd-rail-btn").forEach(function (b) {
            b.addEventListener("mousedown", function (e) { e.preventDefault(); });   // لا تُفقد الخانة المحددة
            b.addEventListener("click", function () { toggle(b.getAttribute("data-pane")); });
        });
        root.querySelector(".fgd-x").addEventListener("click", function () { open(null); });
        initCalc();
        initAI();

        // زر الحاسبة القديم داخل الأداة يفتح حاسبة الحاوية بدلاً من النافذة المنبثقة
        document.querySelectorAll(".calc-floating-btn, #calculatorBtn").forEach(function (b) {
            b.addEventListener("click", function (e) { e.preventDefault(); e.stopImmediatePropagation(); open("calc"); }, true);
        });
        var st = null;
        try { st = localStorage.getItem("fg_dock_open"); } catch (e) {}
        if ((st === "calc" || st === "ai") && window.innerWidth >= 1100) open(st);
    }

    var current = null;
    function toggle(p) { open(current === p ? null : p); }
    function open(p) {
        current = p;
        try { localStorage.setItem("fg_dock_open", p || ""); } catch (e) {}
        document.documentElement.classList.toggle("fgd-open", !!p);
        panel.setAttribute("aria-hidden", p ? "false" : "true");
        calcPane.style.display = p === "calc" ? "" : "none";
        aiPane.style.display = p === "ai" ? "" : "none";
        railCalc.classList.toggle("on", p === "calc");
        railAI.classList.toggle("on", p === "ai");
        root.querySelector(".fgd-title").innerHTML = p === "calc" ? '<i class="fas fa-calculator"></i> ' + esc(C("dockCalc"))
            : p === "ai" ? ROBOT + " " + esc(C("dockAI")) : "";
        if (p === "ai") { renderChat(); setTimeout(function () { var ta = aiPane.querySelector("textarea"); if (ta && window.innerWidth >= 900) ta.focus({ preventScroll: true }); }, 50); }
        if (p === "calc") updateTarget();
        try { window.dispatchEvent(new Event("resize")); } catch (e) {}   // تعيد الرسوم البيانية ضبط عرضها
    }

    /* ───────────── الحاسبة ───────────── */
    var expr = "0", justEvaluated = false, history = [];
    try { history = JSON.parse(sessionStorage.getItem("fg_calc_hist") || "[]") || []; } catch (e) {}
    function show() { disp.value = expr; }
    function msg(t, ok) { var m = root.querySelector(".fgd-msg"); m.textContent = t || ""; m.className = "fgd-msg" + (ok ? " ok" : ""); if (t) setTimeout(function () { if (m.textContent === t) m.textContent = ""; }, 3500); }
    function updateTarget() {
        if (!targetEl) return;
        targetEl.textContent = lastField && document.body.contains(lastField) ? (fieldLabel(lastField) || "✓") : "—";
    }
    /** مقيِّم آمن للتعابير (+ − × ÷ % أقواس) دون eval */
    function evaluate(src) {
        var s = String(src).replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/,/g, ".").replace(/\s+/g, "");
        if (!/^[0-9.+\-*/%()]*$/.test(s) || !s) throw new Error("bad");
        var pos = 0;
        function peek() { return s[pos]; }
        function num() {
            var st = pos; while (pos < s.length && /[0-9.]/.test(s[pos])) pos++;
            if (st === pos) throw new Error("bad");
            var v = parseFloat(s.slice(st, pos)); if (isNaN(v)) throw new Error("bad");
            if (peek() === "%") { pos++; v = v / 100; }
            return v;
        }
        function factor() {
            var c = peek();
            if (c === "+") { pos++; return factor(); }
            if (c === "-") { pos++; return -factor(); }
            if (c === "(") { pos++; var v = expr_(); if (peek() !== ")") throw new Error("bad"); pos++; if (peek() === "%") { pos++; v /= 100; } return v; }
            return num();
        }
        function term() {
            var v = factor();
            while (peek() === "*" || peek() === "/") {
                var o = s[pos++], r = factor();
                if (o === "/" && r === 0) throw new Error("div0");
                v = o === "*" ? v * r : v / r;
            }
            return v;
        }
        function expr_() {
            var v = term();
            while (peek() === "+" || peek() === "-") { var o = s[pos++], r = term(); v = o === "+" ? v + r : v - r; }
            return v;
        }
        var out = expr_();
        if (pos !== s.length || !isFinite(out)) throw new Error("bad");
        return Math.round(out * 1e10) / 1e10;
    }
    function press(k) {
        if (k === "C") { expr = "0"; justEvaluated = false; return show(); }
        if (k === "⌫") { expr = expr.length > 1 ? expr.slice(0, -1) : "0"; return show(); }
        if (k === "=") {
            try {
                var r = evaluate(expr);
                history.unshift(expr + " = " + r); history = history.slice(0, 12);
                try { sessionStorage.setItem("fg_calc_hist", JSON.stringify(history)); } catch (e) {}
                expr = String(r); justEvaluated = true; renderHist();
            } catch (e) { msg(C("calcErr")); }
            return show();
        }
        var isOp = /[÷×−+%]/.test(k);
        if (justEvaluated && !isOp && k !== ")") expr = "0";
        justEvaluated = false;
        if (expr === "0" && !isOp && k !== ".") expr = k; else expr += k;
        show();
    }
    function renderHist() {
        histEl.innerHTML = history.map(function (h, i) { return '<button type="button" data-i="' + i + '">' + esc(h) + "</button>"; }).join("");
    }
    function currentValue() {
        try { return evaluate(disp.value); } catch (e) { return null; }
    }
    function initCalc() {
        root.querySelectorAll(".fgd-k").forEach(function (b) {
            b.addEventListener("mousedown", function (e) { e.preventDefault(); });
            b.addEventListener("click", function () { press(b.getAttribute("data-k")); });
        });
        disp.addEventListener("input", function () { expr = disp.value.replace(/\*/g, "×").replace(/\//g, "÷") || "0"; });
        disp.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === "=") { e.preventDefault(); expr = disp.value; press("="); }
            if (e.key === "Escape") { e.preventDefault(); press("C"); }
        });
        histEl.addEventListener("click", function (e) {
            var b = e.target.closest("button"); if (!b) return;
            var h = history[+b.getAttribute("data-i")] || ""; expr = h.split(" = ").pop() || "0"; show();
        });
        root.querySelectorAll(".fgd-calc .fgd-btn").forEach(function (b) {
            b.addEventListener("mousedown", function (e) { e.preventDefault(); });
            b.addEventListener("click", function () {
                var act = b.getAttribute("data-act");
                if (act === "copy") {
                    var v = currentValue(); var t = v == null ? disp.value : String(v);
                    if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { msg(C("calcInserted").replace(/.*/, "✓ " + t), true); }).catch(function () {});
                    return;
                }
                if (!lastField || !document.body.contains(lastField)) return msg(C("calcNoField"));
                if (act === "pull") {
                    var raw = String(lastField.value || "").replace(/[^\d.\-]/g, "");
                    expr = raw || "0"; justEvaluated = false; return show();
                }
                if (act === "insert") {
                    var val = currentValue();
                    if (val == null) return msg(C("calcErr"));
                    insertInto(lastField, val);
                    msg(C("calcInserted") + ": " + val, true);
                }
            });
        });
        renderHist();
        show();
    }
    function insertInto(f, val) {
        var setter = Object.getOwnPropertyDescriptor(f.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype, "value");
        if (setter && setter.set) setter.set.call(f, String(val)); else f.value = String(val);
        f.dispatchEvent(new Event("input", { bubbles: true }));
        f.dispatchEvent(new Event("change", { bubbles: true }));
        f.classList.add("fgd-flash");
        setTimeout(function () { f.classList.remove("fgd-flash"); }, 1200);
    }

    /* ───────────── المساعد الذكي ───────────── */
    var CHAT_KEY = "fg_ai_" + TOOL + "_" + lang;
    var chat = [];
    try { chat = JSON.parse(sessionStorage.getItem(CHAT_KEY) || "[]") || []; } catch (e) {}
    var busy = false, guideText = null;
    function saveChat() { try { sessionStorage.setItem(CHAT_KEY, JSON.stringify(chat.slice(-20))); } catch (e) {} }
    function md(s) {
        var h = esc(s);
        h = h.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        h = h.replace(/^#{1,4}\s*(.+)$/gm, "<strong>$1</strong>");
        h = h.replace(/^\s*[-*•]\s+(.+)$/gm, "<li>$1</li>");
        h = h.replace(/^\s*(\d+)[.)]\s+(.+)$/gm, '<li class="n"><b>$1.</b> $2</li>');
        h = h.replace(/(<li[^>]*>.*<\/li>)(\n(?=<li))/g, "$1");
        h = h.replace(/\n/g, "<br>");
        return h;
    }
    function renderChat() {
        var box = aiPane.querySelector(".fgd-chat");
        var html = '<div class="fgd-m bot">' + ROBOT + "<div>" + md(C("aiWelcome")) + "</div></div>";
        chat.forEach(function (m) {
            html += m.role === "user" ? '<div class="fgd-m me"><div>' + esc(m.content).replace(/\n/g, "<br>") + "</div></div>"
                : '<div class="fgd-m bot">' + ROBOT + "<div>" + md(m.content) + "</div></div>";
        });
        if (busy) html += '<div class="fgd-m bot wait">' + ROBOT + '<div><i class="fas fa-circle-notch fa-spin"></i> ' + esc(C("aiThinking")) + "</div></div>";
        box.innerHTML = html;
        box.scrollTop = box.scrollHeight;
    }
    function loadGuide() {
        if (guideText !== null) return Promise.resolve(guideText);
        var file = "../data/guide-" + (lang === "ar" || lang === "tr" ? lang : "en") + ".json";
        return fetch(file, { cache: "force-cache" }).then(function (r) { return r.ok ? r.json() : []; }).then(function (arr) {
            var g = (arr || []).filter(function (x) { return x.tool === TOOL; })[0];
            var tmp = document.createElement("div"); tmp.innerHTML = g ? g.content : "";
            guideText = cleanText(tmp.innerText || tmp.textContent || "").slice(0, 9000);
            return guideText;
        }).catch(function () { guideText = ""; return ""; });
    }
    function collectFields() {
        var out = [], seen = 0;
        document.querySelectorAll("input, select, textarea").forEach(function (f) {
            if (seen >= 90 || !isField(f)) return;
            if (f.offsetParent === null && f.type !== "hidden") return;
            var t = (f.type || "").toLowerCase();
            var v = f.tagName === "SELECT" ? (f.options[f.selectedIndex] ? f.options[f.selectedIndex].text : "") : (t === "checkbox" || t === "radio") ? (f.checked ? "✓" : "✗") : f.value;
            out.push({ label: fieldLabel(f).slice(0, 80), value: String(v || "").slice(0, 80), tip: tipFor(f).slice(0, 220), selected: f === lastField });
            seen++;
        });
        return out;
    }
    function collectResults() {
        var nodes = document.querySelectorAll('[id*="result" i], [class*="result" i], [id*="Result"], .kpi-grid, #kpiCards, .summary-box');
        var picked = [], txt = "";
        nodes.forEach(function (n) {
            if (inDock(n) || n.offsetParent === null) return;
            if (picked.some(function (p) { return p.contains(n); })) return;
            picked.push(n);
        });
        picked.forEach(function (n) { txt += " " + cleanText(n.innerText); });
        return txt.trim().slice(0, 3500);
    }
    function ask(q) {
        q = String(q || "").trim();
        if (!q || busy) return;
        chat.push({ role: "user", content: q.slice(0, 1500) });
        busy = true; renderChat(); saveChat();
        var title = cleanText((document.querySelector(".hero-mini h2, h1, h2") || {}).innerText || document.title).slice(0, 120);
        loadGuide().then(function (g) {
            return FG.ai({
                service: "assistant", tool: TOOL, title: title, guide: g,
                fields: collectFields(), results: collectResults(),
                messages: chat.slice(-10)
            });
        }).then(function (content) {
            chat.push({ role: "assistant", content: String(content || "").slice(0, 6000) });
        }).catch(function () {
            chat.push({ role: "assistant", content: C("aiError") });
        }).then(function () { busy = false; saveChat(); renderChat(); });
    }
    function initAI() {
        var form = aiPane.querySelector(".fgd-ask"), ta = form.querySelector("textarea");
        form.addEventListener("submit", function (e) { e.preventDefault(); var q = ta.value; ta.value = ""; ask(q); });
        ta.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event("submit")); } });
        aiPane.querySelectorAll(".fgd-quick button").forEach(function (b) {
            b.addEventListener("mousedown", function (e) { e.preventDefault(); });
            b.addEventListener("click", function () {
                var k = b.getAttribute("data-q"), q = C(k);
                if (k === "aiQ2" && lastField) q += " (" + fieldLabel(lastField) + ")";
                ask(q);
            });
        });
        aiPane.querySelector('[data-act="clear"]').addEventListener("click", function () { chat = []; saveChat(); renderChat(); });
    }

    /* ───────────── التشغيل ───────────── */
    function boot() {
        try { standardizeExports(); } catch (e) { console.warn(e); }
        try { initTips(); } catch (e) { console.warn(e); }
        try { buildDock(); } catch (e) { console.warn(e); }
    }
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
    FG.dock = { open: open, insertInto: insertInto };
})();
