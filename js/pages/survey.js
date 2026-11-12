
    (function() {
        const form = document.getElementById('feedbackForm');
        const starRows = document.querySelectorAll('.stars-row');

        // بناء النجوم في كل صف
        starRows.forEach(row => {
            const tagSpan = row.querySelector('.rating-value-tag');
            const name = row.dataset.name;
            // حقل مخفي لتخزين القيمة (فارغ مبدئياً = غير محدد)
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = name;
            hiddenInput.value = ''; // لا قيمة افتراضية
            row.appendChild(hiddenInput);

            // إنشاء 5 أزرار نجوم (كلها مطفأة)
            for (let i = 1; i <= 5; i++) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'star-btn';
                btn.dataset.value = i;
                btn.textContent = '★';
                btn.setAttribute('aria-label', `تقييم ${i} من 5`);
                row.appendChild(btn);
            }

            const buttons = row.querySelectorAll('.star-btn');

            // تحديث العلامة (تظهر "؟" لأن لا قيمة)
            if (tagSpan) tagSpan.textContent = '؟';

            // معالج النقر على أي نجمة
            buttons.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const clickedValue = parseInt(this.dataset.value);
                    hiddenInput.value = clickedValue;
                    if (tagSpan) tagSpan.textContent = clickedValue;

                    // إشعال النجوم حتى المختارة
                    buttons.forEach(b => {
                        const v = parseInt(b.dataset.value);
                        if (v <= clickedValue) {
                            b.classList.add('filled');
                            b.classList.remove('just-selected');
                        } else {
                            b.classList.remove('filled', 'just-selected');
                        }
                    });
                    // تأثير نبض للنجمة المضغوطة
                    this.classList.add('just-selected');
                    setTimeout(() => this.classList.remove('just-selected'), 350);

                    // إعادة حساب المتوسط العام
                    recalcAverage();
                });

                // دعم اللمس بشكل أفضل
                btn.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    this.click();
                }, { passive: false });
            });
        });

        // حساب المتوسط العام من حقول النجوم (تجاهل الحقول الفارغة)
        function recalcAverage() {
            const starInputs = form.querySelectorAll('.stars-row input[type="hidden"]');
            let sum = 0, count = 0;
            starInputs.forEach(input => {
                const val = parseInt(input.value);
                if (!isNaN(val) && val >= 1 && val <= 5) {
                    sum += val;
                    count++;
                }
            });
            const avgField = document.getElementById('hidden_avg');
            const statusField = document.getElementById('hidden_status');
            if (count > 0) {
                const avg = (sum / count).toFixed(1);
                let status = avg <= 2.5 ? 'غير راضي ❌' : avg <= 3.5 ? 'محايد ⚠️' : 'راضي ✅';
                avgField.value = avg;
                statusField.value = status;
            } else {
                // لا تقييمات بعد
                avgField.value = '';
                statusField.value = '';
            }
        }

        // حساب أولي (سيظهر الحقلان فارغين)
        recalcAverage();

        // إرسال النموذج
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            recalcAverage();
            window.FG_submitSurvey(form);
            setTimeout(() => {
                form.style.display = 'none';
                document.querySelector('.header').style.display = 'none';
                document.getElementById('thankYouArea').style.display = 'block';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 250);
        });

        // تحسين اللمس لأزرار الاختيارات
        document.querySelectorAll('.option-btn').forEach(label => {
            label.addEventListener('touchstart', function(e) {
                // يسمح بالتفاعل الطبيعي
            }, { passive: true });
        });
    })();
