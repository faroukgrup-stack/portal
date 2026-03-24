// ملف auth.js المطور والمتوافق مع نظام التوكن الجديد
(function() {
    // 1. جلب البيانات من localStorage (لأننا اعتمدناها في الملف الآخر)
    const token = localStorage.getItem('userToken');
    const user = localStorage.getItem('userName');
    const SECRET_KEY = "F@roukGrup_S3cur3_K3y_2026!";

    let isValid = false;

    try {
        if (token && user) {
            // فك تشفير التوكن للتأكد من صحته
            const decoded = atob(token);
            const parts = decoded.split('|');
            
            // التأكد من المفتاح السري واسم المستخدم
            if (parts.length === 3 && parts[0] === SECRET_KEY && parts[1] === user) {
                isValid = true;
            }
        }
    } catch (e) {
        isValid = false;
    }

    // 2. إذا كان غير صالح، اطرده لصفحة الدخول
    if (!isValid) {
        console.warn("Access denied: Invalid or missing token.");
        window.location.href = "index.html";
        return;
    }

    // 3. إذا كان صالحاً، اعرض الاسم عند تحميل الصفحة
    window.addEventListener('DOMContentLoaded', () => {
        const nameElement = document.getElementById('displayUserName');
        if (nameElement) nameElement.innerText = user;
    });
})();
