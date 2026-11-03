/**
 * auth-check.js — مجموعة فاروق للاستشارات والأعمال
 * الإصدار 6.0 — نظام التوكن الموقّع (HMAC) من السيرفر
 * صيغة التوكن الجديدة: base64url(payload).base64url(HMAC-SHA256)
 * لا يوجد مفتاح سري في المتصفح — التحقق النهائي يتم على السيرفر (validate)
 * توكنات النظام القديم غير صالحة — سيُعاد تسجيل دخول المستخدمين مرة واحدة.
 */
(function () {
    "use strict";

    /* ─── الإعدادات ─── */
    const LOGIN_PAGE = location.pathname.includes("/tools/") ? "../index.html" : "index.html";

    /* ─── فك ترميز base64url في المتصفح ─── */
    function b64urlDecode(str) {
        let s = str.replace(/-/g, "+").replace(/_/g, "/");
        while (s.length % 4) s += "=";
        return atob(s);
    }

    /* ─── جلب البيانات ─── */
    const token     = localStorage.getItem("userToken");
    const userName  = localStorage.getItem("userName");  // الاسم الكامل
    const userEmail = localStorage.getItem("userEmail"); // البريد الإلكتروني
    const daysLeft  = localStorage.getItem("daysLeft");

    /* ─── دالة الطرد الكاملة ─── */
    function reject(reason) {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("daysLeft");
        localStorage.removeItem("sessionStart");
        window.location.replace(LOGIN_PAGE);
    }

    /* ─── 1. وجود البيانات الأساسية ─── */
    if (!token || !userName) {
        reject("missing credentials");
        return;
    }

    /* ─── 2. فحص بنية التوكن الموقّع (بدون أي مفتاح في المتصفح) ─── */
    let isValid = false;
    let tokenEmail = "";
    let tokenExpiry = "";
    try {
        const parts = token.split(".");
        if (parts.length === 2 && parts[0].length > 10 && parts[1].length >= 20) {
            const payload = JSON.parse(b64urlDecode(parts[0]));
            if (payload.u && payload.x) {
                tokenEmail  = payload.u;
                tokenExpiry = payload.x;
                const emailMatch = userEmail
                    ? payload.u === userEmail
                    : payload.u.includes("@");
                isValid = emailMatch;
            }
        }
    } catch (e) {
        isValid = false;
    }

    if (!isValid) {
        reject("invalid token");
        return;
    }

    /* ─── 3. التحقق من تاريخ انتهاء الاشتراك ─── */
    try {
        const expiry = new Date(tokenExpiry);
        const today  = new Date();
        today.setHours(0, 0, 0, 0);
        if (expiry < today) {
            reject("subscription expired");
            return;
        }
    } catch (e) {}

    /* ─── 4. التحقق من daysLeft ─── */
    if (daysLeft !== null) {
        const days = parseInt(daysLeft, 10);
        if (!isNaN(days) && days <= 0) {
            reject("subscription expired (daysLeft=0)");
            return;
        }
    }

    /* ─── 5. منع الرجوع للخلف بزر المتصفح ─── */
    history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", function () {
        history.pushState(null, "", window.location.href);
    });

    /* ─── 6. عرض بيانات المستخدم في الصفحة ─── */
    window.addEventListener("DOMContentLoaded", function () {
        const nameEl = document.getElementById("displayUserName");
        if (nameEl) nameEl.innerText = userName;

        const daysEl = document.getElementById("displayDaysLeft");
        if (daysEl && daysLeft) daysEl.innerText = daysLeft;
    });


})();


/* ============================================================
   🛡️ كود الحماية من أدوات المطور (DevTools Protection)
   يعمل تلقائياً على جميع الأدوات التي تستدعي هذا الملف
   ============================================================ */
(function () {
    "use strict";

    // منع F12 واختصارات أدوات المطور وعرض المصدر
    document.addEventListener('keydown', function (e) {

        // F12
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            return false;
        }

        // Ctrl + Shift + I / J / C
        if (e.ctrlKey && e.shiftKey &&
            (e.key === 'I' || e.key === 'i' ||
             e.key === 'J' || e.key === 'j' ||
             e.key === 'C' || e.key === 'c')) {
            e.preventDefault();
            return false;
        }

        // Ctrl + U (عرض المصدر)
        if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
            e.preventDefault();
            return false;
        }

    }, true); // استخدام true لضمان الاعتراض قبل أي معالج آخر

    // منع النقر بزر الماوس الأيمن (بدون رسالة)
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
        return false;
    }, true);


})();