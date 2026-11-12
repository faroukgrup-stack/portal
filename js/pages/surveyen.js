
    (function() {
        const form = document.getElementById('feedbackForm');
        const starRows = document.querySelectorAll('.stars-row');

        // Build stars in each row
        starRows.forEach(row => {
            const tagSpan = row.querySelector('.rating-value-tag');
            const name = row.dataset.name;
            const hiddenInput = document.createElement('input');
            hiddenInput.type = 'hidden';
            hiddenInput.name = name;
            hiddenInput.value = '';
            row.appendChild(hiddenInput);

            // Create 5 star buttons (all off)
            for (let i = 1; i <= 5; i++) {
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'star-btn';
                btn.dataset.value = i;
                btn.textContent = '★';
                btn.setAttribute('aria-label', `Rate ${i} out of 5`);
                row.appendChild(btn);
            }

            const buttons = row.querySelectorAll('.star-btn');
            if (tagSpan) tagSpan.textContent = '?';

            // Click handler on any star
            buttons.forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.preventDefault();
                    const clickedValue = parseInt(this.dataset.value);
                    hiddenInput.value = clickedValue;
                    if (tagSpan) tagSpan.textContent = clickedValue;

                    buttons.forEach(b => {
                        const v = parseInt(b.dataset.value);
                        if (v <= clickedValue) {
                            b.classList.add('filled');
                            b.classList.remove('just-selected');
                        } else {
                            b.classList.remove('filled', 'just-selected');
                        }
                    });
                    this.classList.add('just-selected');
                    setTimeout(() => this.classList.remove('just-selected'), 350);

                    recalcAverage();
                });

                btn.addEventListener('touchstart', function(e) {
                    e.preventDefault();
                    this.click();
                }, { passive: false });
            });
        });

        // Calculate average from star inputs (ignore empty)
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
                let status = avg <= 2.5 ? 'Unsatisfied ❌' : avg <= 3.5 ? 'Neutral ⚠️' : 'Satisfied ✅';
                avgField.value = avg;
                statusField.value = status;
            } else {
                avgField.value = '';
                statusField.value = '';
            }
        }

        recalcAverage();

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

        document.querySelectorAll('.option-btn').forEach(label => {
            label.addEventListener('touchstart', function(e) {}, { passive: true });
        });
    })();
