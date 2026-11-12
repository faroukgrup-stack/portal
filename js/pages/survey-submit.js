/**
 * survey-submit.js — إرسال الاستبيان إلى Supabase (جدول survey_responses) بدلاً من Google Script
 * يُستدعى من survey*.js:  FG_submitSurvey(form)
 */
(function () {
    "use strict";
    var CFG = window.FG_CONFIG || {};
    var sb = (window.supabase && CFG.SUPABASE_URL) ? window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, { auth: { persistSession: false } }) : null;
    window.FG_submitSurvey = function (form) {
        var fd = new FormData(form), answers = {};
        fd.forEach(function (v, k) { if (String(v).trim() !== "") answers[k] = String(v).slice(0, 2000); });
        var avg = parseFloat(answers["التقييم_العام"]);
        var row = { lang: document.documentElement.lang || "ar", answers: answers,
                    avg_rating: isNaN(avg) ? null : avg, status: answers["تصنيف_العميل"] || null };
        if (!sb) { console.error("Supabase config missing"); return Promise.resolve(); }
        return sb.from("survey_responses").insert(row).then(function (r) { if (r.error) console.error(r.error); });
    };
})();
