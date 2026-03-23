(function() {
    const token = sessionStorage.getItem('userToken');
    console.log("auth-check.js: token =", token);
    if (!token) {
        console.log("لا يوجد توكن. كان سيعيد التوجيه.");
        return;
    }

    const SECRET_KEY = "F@roukGrup_S3cur3_K3y_2026!";
    console.log("المفتاح المتوقع:", SECRET_KEY);

    try {
        const decoded = atob(token);
        console.log("التوكن بعد فك التشفير:", decoded);
        const parts = decoded.split('|');
        console.log("الأجزاء:", parts);
        if (parts.length !== 3 || parts[0] !== SECRET_KEY) {
            console.log("فشل: عدد الأجزاء =", parts.length, ", الجزء الأول =", parts[0]);
            return;
        }
        const storedUser = sessionStorage.getItem('userName');
        if (storedUser && parts[1] !== storedUser) {
            console.log("فشل: اسم المستخدم غير متطابق. المخزن:", storedUser, "التوكن:", parts[1]);
            return;
        }
        console.log("✓ التحقق ناجح");
    } catch(e) {
        console.error("خطأ في فك التشفير:", e);
    }
})();
