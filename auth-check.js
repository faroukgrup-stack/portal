(function() {
    const token = localStorage.getItem('userToken');
    if (!token) {
        window.location.href = "index.html";
        return;
    }

    const SECRET_KEY = "F@roukGrup_S3cur3_K3y_2026!";

    try {
        const decoded = atob(token);
        const parts = decoded.split('|');
        if (parts.length !== 3 || parts[0] !== SECRET_KEY) {
            throw new Error("Invalid token");
        }
        // اختياري: التحقق من اسم المستخدم
        const storedUser = localStorage.getItem('userName');
        if (storedUser && parts[1] !== storedUser) {
            throw new Error("User mismatch");
        }
        // إذا وصلنا هنا، التوكن صالح
        console.log("Token validated successfully");
    } catch(e) {
        // أي خطأ في التحقق يعني أن التوكن غير صالح
        console.warn("Invalid token detected, clearing localStorage and redirecting.");
        localStorage.removeItem('userToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('daysLeft');
        // يمكن عرض رسالة للمستخدم قبل التوجيه
        alert("انتهت صلاحية الجلسة أو حدث خطأ. يرجى تسجيل الدخول مجددًا.");
        window.location.href = "index.html";
    }
})();
