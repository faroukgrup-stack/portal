// auth-check.js
// التحقق من صحة التوكن قبل عرض أي أداة

(function() {
    const token = sessionStorage.getItem('userToken');
    if (!token) {
        alert("تنبيه أمني: يرجى تسجيل الدخول أولاً للوصول إلى هذه الأداة.");
        window.location.href = "index.html";
        return;
    }

    // المفتاح السري يجب أن يكون مطابقاً تماماً لما في Google Apps Script
    const SECRET_KEY = "F@r0ukGr0up_S3cur3_K3y_2026!";

    try {
        const decoded = atob(token);
        const parts = decoded.split('|');
        if (parts.length !== 3 || parts[0] !== SECRET_KEY) {
            throw new Error("Invalid token structure");
        }

        // اختياري: التحقق من أن اسم المستخدم المخزن يتطابق مع اسم المستخدم في التوكن
        const storedUser = sessionStorage.getItem('userName');
        if (storedUser && parts[1] !== storedUser) {
            throw new Error("User mismatch");
        }

        // اختياري: التحقق من أن تاريخ الانتهاء لم يمر (إذا أردت إضافة صلاحية زمنية)
        // const expiryDate = new Date(parts[2]);
        // if (expiryDate < new Date()) throw new Error("Token expired");

        console.log("Token validation passed");
    } catch(e) {
        console.warn("Token validation failed:", e);
        alert("جلسة غير صالحة، يرجى تسجيل الدخول مجدداً.");
        sessionStorage.removeItem('userToken');
        sessionStorage.removeItem('userName');
        sessionStorage.removeItem('daysLeft');
        window.location.href = "index.html";
    }
})();
