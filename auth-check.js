/**
 * auth-check.js — مجموعة فاروق للاستشارات والأعمال
 * حماية الوصول لجميع الأدوات — الإصدار 3.0 (صارم)
 */
(function () {
    "use strict";

    /* ─── الإعدادات ─── */
    const SECRET_KEY    = "F@roukGrup_S3cur3_K3y_2026!";
    const LOGIN_PAGE    = "index.html";
    const SESSION_HOURS = 24;

    /* ─── جلب البيانات ─── */
    const token    = localStorage.getItem("userToken");
    const userName = localStorage.getItem("userName");
    const daysLeft = localStorage.getItem("daysLeft");

    /* ─── دالة الطرد الكاملة ─── */
    function reject(reason) {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userName");
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
    // الصيغة المعتمدة من السيرفر: btoa(SECRET_KEY + "|" + name + "|" + timestamp)
    let isValid = false;
    try {
        const decoded = atob(token);
        const parts   = decoded.split("|");

        if (parts.length === 3) {
            const keyMatch       = parts[0] === SECRET_KEY;
            const userMatch      = parts[1] === userName;
            const validTimestamp = !isNaN(parseInt(parts[2], 10)) && parseInt(parts[2], 10) > 0;
            isValid = keyMatch && userMatch && validTimestamp;
        }
    } catch (e) {
        isValid = false;
    }

    if (!isValid) {
        reject("invalid token");
        return;
    }

    /* ─── 3. انتهاء صلاحية الجلسة (24 ساعة) ─── */
    const sessionStart = parseInt(localStorage.getItem("sessionStart") || "0", 10);
    const now          = Date.now();

    if (sessionStart === 0) {
        localStorage.setItem("sessionStart", now.toString());
    } else {
        const hoursElapsed = (now - sessionStart) / (1000 * 60 * 60);
        if (hoursElapsed > SESSION_HOURS) {
            reject("session expired after " + SESSION_HOURS + "h");
            return;
        }
    }

    /* ─── 4. التحقق من انتهاء الاشتراك ─── */
    if (daysLeft !== null) {
        const days = parseInt(daysLeft, 10);
        if (!isNaN(days) && days <= 0) {
            reject("subscription expired");
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
