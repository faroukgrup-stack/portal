(function() {
    const token = localStorage.getItem('userToken');
    if (!token) {
        alert("يرجى تسجيل الدخول أولاً للوصول إلى هذه الأداة.");
        window.location.href = "index.html";
        return;
    }

    const SECRET_KEY = "F@roukGrup_S3cur3_K3y_2026!";  // هذا هو المفتاح الصحيح

    try {
        const decoded = atob(token);
        const parts = decoded.split('|');
        if (parts.length !== 3 || parts[0] !== SECRET_KEY) {
            throw new Error("Invalid token");
        }
        // التحقق من اسم المستخدم اختياري
        const storedUser = localStorage.getItem('userName');
        if (storedUser && parts[1] !== storedUser) {
            throw new Error("User mismatch");
        }
        console.log("Token validated successfully");
    } catch(e) {
        console.warn("Token validation failed:", e);
        alert("جلسة غير صالحة، يرجى تسجيل الدخول مجدداً.");
        localStorage.removeItem('userToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('daysLeft');
        window.location.href = "index.html";
    }
})();
