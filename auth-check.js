(function() {
    const token = localStorage.getItem('userToken');
    const userName = localStorage.getItem('userName');

    if (!token || !userName) {
        alert("يرجى تسجيل الدخول أولاً للوصول إلى هذه الأداة.");
        window.location.href = "index.html";
        return;
    }

    // اختياري: التحقق من أن التوكن ليس فارغاً وأن اسم المستخدم موجود
    console.log("تم التحقق من الجلسة بنجاح.");
})();
