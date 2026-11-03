
    (function() {
        const form = document.getElementById('feedbackForm');
        const starRows = document.querySelectorAll('.stars-row');

        // Her satıra yıldızları ekle
        starRows.forEach(row => {
            const tagSpan = row.querySelector('.rating-value-tag');
            const name = row.dataset.name;
            // Değeri saklamak için gizli input (başlangıçta boş = seçilmedi)
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = name;
            hiddenInput.value = '';
            row.appendChild(hiddenInput);

            // 5 yıldız butonu oluştur (hepsi sönük)
            for (let i = 1; i <= 5; i++) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'star-btn';
                btn.dataset.value = i;
                btn.textContent = '★';
                btn.setAttribute('aria-label', `${i} / 5 yıldız`);
                row.appendChild(btn);
            }

            const buttons = row.querySelectorAll('.star-btn');

            // Etiketi güncelle (boşsa "?" göster)
            if (tagSpan) tagSpan.textContent = '?';

            // Yıldıza tıklama olayı
            buttons.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const clickedValue = parseInt(this.dataset.value);
                    hiddenInput.value = clickedValue;
                    if (tagSpan) tagSpan.textContent = clickedValue;

                    // Tüm yıldızları seçilen değere göre doldur
                    buttons.forEach(b => {
                        const v = parseInt(b.dataset.value);
                        if (v <= clickedValue) {
                            b.classList.add('filled');
                            b.classList.remove('just-selected');
                        } else {
                            b.classList.remove('filled', 'just-selected');
                        }
                    });
                    // Tıklanan yıldıza pop efekti
                    this.classList.add('just-selected');
                    setTimeout(() => this.classList.remove('just-selected'), 350);

                    // Genel ortalamayı yeniden hesapla
                    recalcAverage();
                });

                // Dokunmatik cihazlar için destek
                btn.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    this.click();
                }, { passive: false });
            });
        });

        // Genel ortalamayı hesapla (boş alanları yoksay)
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
                let status = avg <= 2.5 ? 'Memnun değil ❌' : avg <= 3.5 ? 'Nötr ⚠️' : 'Memnun ✅';
                avgField.value = avg;
                statusField.value = status;
            } else {
                // Henüz değerlendirme yok
                avgField.value = '';
                statusField.value = '';
            }
        }

        // İlk hesaplama (alanlar boş görünecek)
        recalcAverage();

        // Form gönderimi
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            recalcAverage();
            form.submit();
            setTimeout(() => {
                form.style.display = 'none';
                document.querySelector('.header').style.display = 'none';
                document.getElementById('thankYouArea').style.display = 'block';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }, 250);
        });

        // Seçenek butonları için dokunmatik iyileştirme
        document.querySelectorAll('.option-btn').forEach(label => {
            label.addEventListener('touchstart', function(e) {
                // Doğal etkileşime izin ver
            }, { passive: true });
        });
    })();
