/**
 * auth-check.js — مجموعة فاروق للاستشارات والأعمال
 * الإصدار 5.3 — مطابق للتوكن الحقيقي من السيرفر
 * صيغة التوكن: btoa(SECRET_KEY + "|" + email + "|" + expiryDate)
 */
(function () {
    "use strict";

    /* ─── الإعدادات ─── */
    const SECRET_KEY = "F@r0ukGr0up_S3cur3_K3y_2026!";
    const LOGIN_PAGE = "index.html";

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
        console.warn("🚫 Access denied:", reason);
        window.location.replace(LOGIN_PAGE);
    }

    /* ─── 1. وجود البيانات الأساسية ─── */
    if (!token || !userName) {
        reject("missing credentials");
        return;
    }

    /* ─── 2. التحقق الصارم من التوكن ─── */
    let isValid = false;
    let tokenEmail = "";
    try {
        const decoded = atob(token);
        const parts   = decoded.split("|");

        if (parts.length === 3) {
            const keyMatch    = parts[0] === SECRET_KEY;
            const validExpiry = parts[2].trim().length > 0;
            tokenEmail        = parts[1]; // البريد من التوكن

            // إذا كان userEmail محفوظاً نقارنه، وإلا نقبل أي بريد صحيح
            const emailMatch = userEmail
                ? parts[1] === userEmail
                : parts[1].includes("@");

            isValid = keyMatch && emailMatch && validExpiry;
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
        const expiryDate = atob(token).split("|")[2];
        const expiry     = new Date(expiryDate);
        const today      = new Date();
        today.setHours(0, 0, 0, 0);
        if (expiry < today) {
            reject("subscription expired on " + expiryDate);
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

    console.log("✅ Access granted |", userName, "| أيام متبقية:", daysLeft ?? "غير محدد");

})();
