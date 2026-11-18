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

/** V7.2: نصوص احتياطية للمفاتيح الجديدة إلى أن تُطبَّق الهجرة 006 على قاعدة البيانات */
const FALLBACK_I18N = {
    ar: { headerTitle: 'المنصة الشاملة', payTitleNew: 'الاشتراك في المنصة الشاملة', payTitleRenew: 'تجديد الاشتراك',
          payNote: 'أكمل الدفع في النموذج أدناه. بعد نجاح الدفع تنتقل تلقائياً إلى صفحة إتمام الاشتراك لإدخال بياناتك.',
          payOpenWindow: 'فتح صفحة الدفع في نافذة جديدة', errorPending: 'طلب اشتراكك قيد التحقق من الدفع، وسيُفعَّل حسابك فور التأكيد.',
          syncCloud: 'محفوظ في حسابك ومتاح من أي جهاز', syncOffline: 'محفوظ على هذا الجهاز، وسيُزامَن عند عودة الاتصال', close: 'إغلاق' },
    en: { headerTitle: 'The Comprehensive Platform', payTitleNew: 'Subscribe to the Comprehensive Platform', payTitleRenew: 'Renew subscription',
          payNote: 'Complete the payment in the form below. After a successful payment you will be taken automatically to the page where you complete your subscription details.',
          payOpenWindow: 'Open the payment page in a new window', errorPending: 'Your subscription request is awaiting payment verification. Your account will be activated once it is confirmed.',
          syncCloud: 'Saved to your account and available on any device', syncOffline: 'Saved on this device; it will sync when the connection is back', close: 'Close' },
    tr: { headerTitle: 'Kapsamlı Platform', payTitleNew: 'Kapsamlı Platforma Abone Ol', payTitleRenew: 'Aboneliği yenile',
          payNote: 'Ödemeyi aşağıdaki formda tamamlayın. Ödeme başarılı olduktan sonra bilgilerinizi gireceğiniz abonelik tamamlama sayfasına otomatik olarak yönlendirileceksiniz.',
          payOpenWindow: 'Ödeme sayfasını yeni pencerede aç', errorPending: 'Abonelik talebiniz ödeme doğrulaması bekliyor. Onaylandığında hesabınız etkinleştirilecek.',
          syncCloud: 'Hesabınıza kaydedildi, her cihazdan erişilebilir', syncOffline: 'Bu cihaza kaydedildi; bağlantı gelince senkronize edilecek', close: 'Kapat' }
};
/** ترجمة مفتاح — تُرجع المفتاح نفسه إن لم توجد ترجمة */
function t(key) {
    const d = translations[currentLang];
    if (d && Object.prototype.hasOwnProperty.call(d, key)) return d[key];
    const f = FALLBACK_I18N[currentLang] || FALLBACK_I18N[langDir(currentLang) === 'rtl' ? 'ar' : 'en'];
    return f && f[key] ? f[key] : key;
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
    const key = 'fg_ui_portal_v72_' + lang;   // V7.2: مفتاح جديد يفرض جلب النصوص الجديدة فوراً
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
