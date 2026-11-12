/**
 * fg-config.js — إعدادات الاتصال بـ Supabase (الملف الوحيد الذي تعدّله عند النشر)
 * ------------------------------------------------------------------
 * من لوحة Supabase:   Project Settings ← API Keys
 *   SUPABASE_URL      = Project URL            (مثال: https://abcd1234.supabase.co)
 *   SUPABASE_ANON_KEY = Publishable key (sb_publishable_...) أو مفتاح anon public من تبويب Legacy
 *                       (آمن للمتصفح، فالحماية عبر RLS والـ Edge Functions)
 * تحذير: لا تضع هنا أبداً service_role key أو ADMIN_KEY.
 */
window.FG_CONFIG = {
    SUPABASE_URL: "https://ljysoujfhrcolncyhyfd.supabase.co",
    SUPABASE_ANON_KEY: "sb_publishable_EFcCy6PQY7KwyH39yYWTJw_l0Z6-jRp",

    DEFAULT_LANG: "ar",              // العربية هي اللغة الأساسية
    LANGS: ["ar", "en", "tr"],       // لغات احتياطية فقط، فالقائمة الفعلية تُقرأ من جدول languages
    RTL_LANGS: ["ar"],
    I18N_CACHE_MINUTES: 60,          // مدة كاش الترجمات في المتصفح
    SUB_CHECK_MINUTES: 10,           // كل كم دقيقة يُعاد فحص الاشتراك من السيرفر
    RENEW_URL: "https://alfan.link/faroukazem?digital=r89RJK",
    PORTAL_URL: "https://portal.farouk-grup.com/"
};
