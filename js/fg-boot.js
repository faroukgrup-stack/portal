/**
 * fg-boot.js — نواة صفحات الأدوات (FAROUK GRUP v7 · Supabase)
 * ------------------------------------------------------------------
 * يُحمَّل في <head> لكل أداة ويقوم بـ:
 *   1. تحديد اللغة (ar أساسية / en / tr …) وضبط الاتجاه RTL/LTR وتحميل ملفات CSS المناسبة.
 *   2. حماية الصفحة: التحقق من جلسة Supabase Auth + حالة الاشتراك (my_subscription RPC).
 *   3. جلب نصوص الأداة باللغة المختارة من قاعدة البيانات (get_tool_i18n RPC) مع كاش محلي.
 *   4. تطبيق الترجمات على عناصر data-i18n ثم تحميل منطق الواجهة js/tools/toolN.js.
 *   5. توفير FG.calc(tool, op, input) — يرسل المدخلات فقط إلى Edge Function "calc"
 *      ويستقبل النتائج النهائية. لا توجد أي معادلة مالية في المتصفح.
 */
(function () {
    "use strict";
    var CFG = window.FG_CONFIG || {};
    var TEST = window.__FG_TEST__ || null;           // يُستخدم فقط في الاختبارات الآلية
    var LANGS = (CFG.LANGS || ["ar", "en", "tr"]).slice();
    var RTL = (CFG.RTL_LANGS || ["ar"]).slice();
    // اللغات المضافة من جدول languages (تخزّنها البوابة index.html) — لا حاجة لتعديل الكود عند إضافة لغة
    try {
        (JSON.parse(localStorage.getItem("fg_langs") || "[]") || []).forEach(function (l) {
            if (l && /^[a-z]{2,3}$/.test(l.code)) {
                if (LANGS.indexOf(l.code) === -1) LANGS.push(l.code);
                if (l.dir === "rtl" && RTL.indexOf(l.code) === -1) RTL.push(l.code);
            }
        });
    } catch (e) {}
    var LOCALES = { ar: "ar-EG", en: "en-US", tr: "tr-TR" };

    /* ───────────── 1. اللغة والاتجاه ───────────── */
    var qs = new URLSearchParams(location.search);
    var lang = qs.get("lang") || localStorage.getItem("appLanguage") || CFG.DEFAULT_LANG || "ar";
    if (LANGS.indexOf(lang) === -1) lang = "ar";
    if (qs.get("lang")) localStorage.setItem("appLanguage", lang);
    var isRTL = RTL.indexOf(lang) !== -1;
    var meta = document.querySelector('meta[name="fg-tool"]');
    var TOOL = meta ? meta.getAttribute("content") : null;

    document.documentElement.lang = lang;
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.classList.add("fg-loading");

    // ملفات CSS حسب اللغة (ar: بدون لاحقة — en/tr: باللاحقة — لغة جديدة: تستخدم en أو ar حسب الاتجاه)
    var cssSuffix = lang === "ar" ? "" : (lang === "en" || lang === "tr") ? lang : (isRTL ? "" : "en");
    var dash = cssSuffix ? "-" + cssSuffix : "";
    var css = [
        "../css/tools-common" + dash + ".css",
        TOOL ? "../css/tools/" + TOOL + cssSuffix + ".css" : null,
        "../css/tools-overrides" + dash + ".css"
    ];
    var headHtml = '<style>html.fg-loading body{visibility:hidden}</style>';
    css.forEach(function (h) { if (h) headHtml += '<link rel="stylesheet" href="' + h + '">'; });
    document.write(headHtml);

    /* ───────────── 2. كائن FG العام ───────────── */
    var dict = {};
    var FG = window.FG = {
        lang: lang,
        tool: TOOL,
        sb: null,
        locale: function () { return LOCALES[lang] || lang; },
        dir: function () { return isRTL ? "rtl" : "ltr"; },
        isRTL: function () { return isRTL; },
        start: function () { return isRTL ? "right" : "left"; },
        end: function () { return isRTL ? "left" : "right"; },
        T: function (k) { return Object.prototype.hasOwnProperty.call(dict, k) ? dict[k] : k; },
        /** ترجمة رموز @{sN} القادمة من السيرفر (يعمل على النصوص والمصفوفات والكائنات) */
        localize: function (v) {
            if (typeof v === "string" && v.charCodeAt(0) === 0x2116 && v.length < 8) { // أرقام خاصة من السيرفر (JSON لا يدعم NaN/Infinity)
                if (v === "\u2116NaN") return NaN; if (v === "\u2116Inf") return Infinity; if (v === "\u2116-Inf") return -Infinity;
            }
            if (typeof v === "string") return v.indexOf("@{") === -1 ? v : v.replace(/@\{([A-Za-z0-9_.]+)\}/g, function (_, k) { return FG.T(k); });
            if (Array.isArray(v)) return v.map(FG.localize);
            if (v && typeof v === "object") { var o = {}; for (var k in v) o[k] = FG.localize(v[k]); return o; }
            return v;
        },
        whenReady: function (fn) { fn(); },
        /** الاستدعاء الوحيد للحسابات: المدخلات ← السيرفر ← النتيجة النهائية */
        calc: async function (tool, op, input) {
            if (TEST) return FG.localize(await TEST.calc(tool, op || "main", JSON.parse(JSON.stringify(input)), lang));
            var r = await FG.sb.functions.invoke("calc", { body: { tool: tool, op: op || "main", input: input, lang: lang } });
            if (r.error) {
                var status = r.error.context && r.error.context.status;
                var e = new Error(status === 401 || status === 403 ? "auth" : "network");
                e.status = status; throw e;
            }
            if (!r.data || r.data.ok !== true) { var e2 = new Error((r.data && r.data.error) || "calc"); throw e2; }
            return FG.localize(r.data.data);
        },
        /** ذكاء اصطناعي (الأداة 24) — يُرسل الطلب إلى Edge Function "ai-content" */
        ai: async function (payload) {
            if (TEST && TEST.ai) return TEST.ai(payload);
            var r = await FG.sb.functions.invoke("ai-content", { body: Object.assign({ lang: lang }, payload) });
            if (r.error || !r.data || !r.data.ok) throw new Error((r.data && r.data.error) || "AI");
            return r.data.content;
        },
        calcError: function (e) {
            console.warn("[FG.calc]", e);
            var m = { ar: "تعذّر تنفيذ الحساب على السيرفر. تحقق من الاتصال أو أعد تسجيل الدخول.",
                      en: "The server could not run the calculation. Check your connection or sign in again.",
                      tr: "Hesaplama sunucuda yapılamadı. Bağlantınızı kontrol edin veya tekrar giriş yapın." };
            alert(m[lang] || m.en);
            if (e && (e.message === "auth")) kick();
        }
    };
    // اختصار عام تستخدمه ملفات الأدوات
    window.T = FG.T;

    /* ───────────── 3. الحماية والجلسة ───────────── */
    var LOGIN_PAGE = location.pathname.indexOf("/tools/") !== -1 ? "../index.html" : "index.html";
    function kick() {
        try { if (FG.sb) FG.sb.auth.signOut(); } catch (e) {}
        ["userName", "userEmail", "daysLeft", "fg_sub"].forEach(function (k) { localStorage.removeItem(k); });
        location.replace(LOGIN_PAGE);
    }
    FG.kick = kick;

    if (!TEST) {
        if (!window.supabase || !CFG.SUPABASE_URL) { console.error("Supabase SDK/config missing"); }
        else FG.sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, {
            auth: { persistSession: true, autoRefreshToken: true, storageKey: "fg-auth" }
        });
    }

    async function checkAccess() {
        if (TEST) return true;
        var s = await FG.sb.auth.getSession();
        if (!s.data || !s.data.session) { kick(); return false; }
        var cached = null;
        try { cached = JSON.parse(localStorage.getItem("fg_sub") || "null"); } catch (e) {}
        var fresh = cached && (Date.now() - cached.ts) < (CFG.SUB_CHECK_MINUTES || 10) * 60000;
        if (fresh && cached.status === "active") { refreshSub(); return true; }
        return await refreshSub();
    }
    async function refreshSub() {
        var r = await FG.sb.rpc("my_subscription");
        var d = r.data || {};
        if (r.error || d.status !== "active") { kick(); return false; }
        localStorage.setItem("fg_sub", JSON.stringify({ status: d.status, ts: Date.now() }));
        localStorage.setItem("userName", d.full_name || d.email || "");
        localStorage.setItem("userEmail", d.email || "");
        localStorage.setItem("daysLeft", d.days_left);
        return true;
    }

    /* ───────────── 4. الترجمات من قاعدة البيانات ───────────── */
    async function loadDict() {
        if (TEST) { dict = TEST.dict || {}; return; }
        var key = "fg_i18n_" + TOOL + "_" + lang;
        var cached = null;
        try { cached = JSON.parse(localStorage.getItem(key) || "null"); } catch (e) {}
        var ttl = (CFG.I18N_CACHE_MINUTES || 60) * 60000;
        if (cached && cached.strings) {
            dict = cached.strings;
            if (Date.now() - cached.ts > ttl) fetchDict(key);   // تحديث بالخلفية
            return;
        }
        await fetchDict(key);
    }
    async function fetchDict(key) {
        var r = await FG.sb.rpc("get_tool_i18n", { p_tool: TOOL, p_lang: lang });
        if (!r.error && r.data) {
            dict = r.data;
            try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), strings: r.data })); } catch (e) {}
        }
    }

    function applyDom() {
        document.querySelectorAll("[data-i18n]").forEach(function (el) {
            var k = el.getAttribute("data-i18n");
            if (Object.prototype.hasOwnProperty.call(dict, k)) el.textContent = dict[k];
        });
        document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
            el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
                var p = pair.split(":"); if (p.length !== 2) return;
                if (Object.prototype.hasOwnProperty.call(dict, p[1])) {
                    el.setAttribute(p[0], dict[p[1]]);
                    if (p[0] === "value" && "value" in el) el.value = dict[p[1]];
                }
            });
        });
        var nameEl = document.getElementById("displayUserName");
        if (nameEl) nameEl.innerText = localStorage.getItem("userName") || "";
        var daysEl = document.getElementById("displayDaysLeft");
        if (daysEl) daysEl.innerText = localStorage.getItem("daysLeft") || "";
    }

    function loadToolScript() {
        return new Promise(function (resolve) {
            if (!TOOL) return resolve();
            var s = document.createElement("script");
            s.src = (TEST && TEST.base ? TEST.base : "../js/tools/") + TOOL + ".js";
            s.onload = resolve; s.onerror = resolve;
            document.body.appendChild(s);
        });
    }

    var domReady = new Promise(function (r) {
        if (document.readyState !== "loading") r(); else document.addEventListener("DOMContentLoaded", r);
    });
    var reveal = setTimeout(function () { document.documentElement.classList.remove("fg-loading"); }, 4000);

    FG.ready = (async function () {
        try {
            var ok = await checkAccess();
            if (!ok) return;
            await Promise.all([loadDict(), domReady]);
            applyDom();
            await loadToolScript();
        } catch (e) { console.error(e); }
        clearTimeout(reveal);
        document.documentElement.classList.remove("fg-loading");
    })();

    /* ───────────── 5. حماية أدوات المطور (كما في النسخة السابقة) ───────────── */
    if (!TEST) {
        document.addEventListener("keydown", function (e) {
            if (e.key === "F12" || e.keyCode === 123) { e.preventDefault(); return false; }
            if (e.ctrlKey && e.shiftKey && /^[ijcIJC]$/.test(e.key)) { e.preventDefault(); return false; }
            if (e.ctrlKey && (e.key === "U" || e.key === "u")) { e.preventDefault(); return false; }
        }, true);
        document.addEventListener("contextmenu", function (e) { e.preventDefault(); return false; }, true);
        history.pushState(null, "", location.href);
        window.addEventListener("popstate", function () { history.pushState(null, "", location.href); });
    }
})();
