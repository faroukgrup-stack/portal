(function() {
    const token = localStorage.getItem('userToken');
    const userName = localStorage.getItem('userName');

    if (!token || !userName) {
        alert("يرجى تسجيل الدخول أولاً للوصول إلى هذه الأداة.");
        window.location.href = "index.html";
        return;
    }

    // التحقق الأساسي: هل التوكن على الأقل يبدو مشفراً بشكل صحيح؟
    try {
        const decoded = atob(token);
        if (decoded.split('|').length !== 3) {
            throw new Error("تنسيق غير صحيح");
        }
    } catch(e) {
        console.warn("Token validation failed:", e);
        alert("جلسة غير صالحة، يرجى تسجيل الدخول مجدداً.");
        localStorage.removeItem('userToken');
        localStorage.removeItem('userName');
        localStorage.removeItem('daysLeft');
        window.location.href = "index.html";
        return;
    }

    console.log("✅ Access granted to tool");
})();
