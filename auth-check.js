(function() {
    const token = localStorage.getItem('userToken');
    console.log("auth-check.js: token =", token);
    if (!token) {
        console.log("لا يوجد توكن. كان سيعيد التوجيه.");
        window.location.href = "index.html";
        return;
    }

    const SECRET_KEY = "F@roukGrup_S3cur3_K3y_2026!"; // تأكد من تطابقها مع مفتاح السيرفر
    console.log("المفتاح المتوقع:", SECRET_KEY);

    try {
        const decoded = atob(token);
        console.log("التوكن بعد فك التشفير:", decoded);
        const parts = decoded.split('|');
        console.log("الأجزاء:", parts);
        if (parts.length !== 3 || parts[0] !== SECRET_KEY) {
            console.log("فشل: عدد الأجزاء =", parts.length, ", الجزء الأول =", parts[0]);
            alert("جلسة غير صالحة (تلف في التوكن).");
            localStorage.removeItem('userToken');
            localStorage.removeItem('userName');
            localStorage.removeItem('daysLeft');
            window.location.href = "index.html";
            return;
        }
        const storedUser = localStorage.getItem('userName');
        if (storedUser && parts[1] !== storedUser) {
            console.log("فشل: اسم المستخدم غير متطابق. المخزن:", storedUser, "التوكن:", parts[1]);
            alert("جلسة غير صالحة (مستخدم غير متطابق).");
            localStorage.removeItem('userToken');
            localStorage.removeItem('userName');
            localStorage.removeItem('daysLeft');
            window.location.href = "index.html";
            return;
        }
        console.log("✓ التحقق ناجح");
    } catch(e) {
        console.error("خطأ في فك التشفير:", e);
        alert("جلسة غير صالحة (خطأ في التحقق).");
        localStorage.removeItem('userToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('daysLeft');
        window.location.href = "index.html";
    }
})();
