/**
 * js/i18n.js — نصوص البوابة من قاعدة بيانات Supabase (جدول ui_translations، namespace = portal)
 * ------------------------------------------------------------
 * العربية هي الأصل: أي مفتاح غير مترجم يُعرض بالعربية تلقائياً (get_ui_i18n).
 * إضافة لغة جديدة أو تعديل نص = تعديل صفوف في الجدول فقط، دون لمس هذا الملف.
 * النصوص تُخزَّن مؤقتاً في المتصفح (localStorage) وتُحدَّث بالخلفية.
 */
const CFG = window.FG_CONFIG || {};
const sb = window.supabase.createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, storageKey: "fg-auth" }
});

let currentLang = localStorage.getItem('appLanguage') || CFG.DEFAULT_LANG || 'ar';
const translations = {};
let SUPPORTED_LANGS = [
    { code: 'ar', name: 'العربية', dir: 'rtl' },
    { code: 'en', name: 'English', dir: 'ltr' },
    { code: 'tr', name: 'Türkçe', dir: 'ltr' },
];
try {
    const cachedLangs = JSON.parse(localStorage.getItem('fg_langs') || 'null');
    if (Array.isArray(cachedLangs) && cachedLangs.length) SUPPORTED_LANGS = cachedLangs;
} catch (e) {}

/** ترجمة مفتاح — تُرجع المفتاح نفسه إن لم توجد ترجمة */
function t(key) {
    const d = translations[currentLang];
    return d && Object.prototype.hasOwnProperty.call(d, key) ? d[key] : key;
}
function langDir(code) {
    const l = SUPPORTED_LANGS.find(x => x.code === code);
    return l ? l.dir : (code === 'ar' ? 'rtl' : 'ltr');
}

/** تحميل قائمة اللغات المفعلة من جدول languages */
async function loadLanguages() {
    const { data, error } = await sb.from('languages').select('code,name,dir').eq('enabled', true).order('sort');
    if (!error && data && data.length) {
        SUPPORTED_LANGS = data;
        localStorage.setItem('fg_langs', JSON.stringify(data));
    }
    return SUPPORTED_LANGS;
}

/** تحميل قاموس لغة (من الكاش فوراً ثم تحديث من السيرفر) */
async function loadPortalDict(lang) {
    const key = 'fg_ui_portal_' + lang;
    const ttl = (CFG.I18N_CACHE_MINUTES || 60) * 60000;
    let cached = null;
    try { cached = JSON.parse(localStorage.getItem(key) || 'null'); } catch (e) {}
    const fetchIt = async () => {
        const { data, error } = await sb.rpc('get_ui_i18n', { p_namespace: 'portal', p_lang: lang });
        if (!error && data) {
            translations[lang] = data;
            try { localStorage.setItem(key, JSON.stringify({ ts: Date.now(), strings: data })); } catch (e) {}
        }
    };
    if (cached && cached.strings) {
        translations[lang] = cached.strings;
        if (Date.now() - cached.ts > ttl) fetchIt();
        return;
    }
    await fetchIt();
}
