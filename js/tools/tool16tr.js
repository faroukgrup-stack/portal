
    AOS.init({ duration: 800, once: true });

    // ===== Zaman ve tarih =====
    function updateDateTime() {
        const now = new Date();
        document.getElementById('currentDate').innerText = now.toLocaleDateString('tr-TR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        document.getElementById('currentTime').innerText = now.toLocaleTimeString('tr-TR', {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    }
    setInterval(updateDateTime, 1000);
    updateDateTime();

    // ===== Yükleme ekranı =====
    function showLoading(title, msg) {
        document.getElementById('loadingTitle').textContent = title;
        document.getElementById('loadingMsg').textContent = msg;
        document.getElementById('exportLoading').classList.add('show');
    }
    function hideLoading() {
        document.getElementById('exportLoading').classList.remove('show');
    }

    // ===== Hesap makinesi kodu =====
    let display = document.getElementById('display');
    let historyDisplayElem = document.getElementById('historyDisplay');
    let errorMsgElem = document.getElementById('errorMessage');
    let historyTableBody = document.getElementById('historyTableBody');

    let currentInput = '0';
    let previousInput = '';
    let operator = null;
    let memory = 0;
    let history = [];

    function showError(text) {
        errorMsgElem.style.display = 'block';
        errorMsgElem.innerText = text;
        setTimeout(() => { errorMsgElem.style.display = 'none'; }, 3000);
    }

    function updateDisplay() {
        if (currentInput.length > 15 && !currentInput.includes('e')) {
            let num = parseFloat(currentInput);
            display.innerText = Number.isInteger(num) ? num : num.toPrecision(12).replace(/\.?0+$/, '');
        } else {
            display.innerText = currentInput;
        }
    }

    function appendToDisplay(value) {
        if (currentInput === '0' && value !== '.') {
            currentInput = value;
        } else {
            if (value === '.' && currentInput.includes('.')) return;
            currentInput += value;
        }
        updateDisplay();
    }

    function clearDisplay() {
        currentInput = '0';
        previousInput = '';
        operator = null;
        updateDisplay();
        historyDisplayElem.innerText = '';
    }

    function clearEntry() {
        currentInput = '0';
        updateDisplay();
    }

    function backspace() {
        if (currentInput.length > 1) {
            currentInput = currentInput.slice(0, -1);
        } else {
            currentInput = '0';
        }
        if (currentInput === '-') currentInput = '0';
        updateDisplay();
    }

    function setOperator(op) {
        if (operator !== null && previousInput !== '') {
            calculateResult(false);
        }
        previousInput = currentInput;
        currentInput = '0';
        operator = op;
        historyDisplayElem.innerText = previousInput + ' ' + operator;
    }

    function calculateResult(saveToHistory = true) {
        if (operator === null || previousInput === '') return;

        let prev = parseFloat(previousInput);
        let curr = parseFloat(currentInput);
        let result;
        let type = operator;

        switch (operator) {
            case '+': result = prev + curr; break;
            case '-': result = prev - curr; break;
            case '*': result = prev * curr; break;
            case '/':
                if (curr === 0) { showError('Matematik Hatası: Sıfıra Bölme'); return; }
                result = prev / curr;
                break;
            default: return;
        }

        result = Math.round(result * 1000000000) / 1000000000;

        let operationStr = `${previousInput} ${operator} ${currentInput} = ${result}`;

        if (saveToHistory) {
            history.unshift({ text: operationStr, type: type });
            if (history.length > 50) history.pop();
            filterHistory();
        }

        currentInput = result.toString();
        previousInput = '';
        operator = null;
        historyDisplayElem.innerText = operationStr;
        updateDisplay();
    }

    function toggleSign() {
        if (currentInput !== '0') {
            currentInput = (parseFloat(currentInput) * -1).toString();
            updateDisplay();
        }
    }

    function calculatePercent() {
        let curr = parseFloat(currentInput);
        let result;

        if (previousInput !== '' && operator !== null) {
            let prev = parseFloat(previousInput);
            if (operator === '+') result = prev + (prev * curr / 100);
            else if (operator === '-') result = prev - (prev * curr / 100);
            else if (operator === '*') result = prev * (curr / 100);
            else if (operator === '/') result = prev / (curr / 100);
            else result = curr / 100;

            result = Math.round(result * 1000000000) / 1000000000;
            let operationStr = `${prev} ${operator} ${curr}% = ${result}`;
            history.unshift({ text: operationStr, type: operator });
            filterHistory();
            historyDisplayElem.innerText = operationStr;
            currentInput = result.toString();
            previousInput = '';
            operator = null;
        } else {
            result = curr / 100;
            currentInput = result.toString();
        }
        updateDisplay();
    }

    function calculateSquareRoot() {
        let value = parseFloat(currentInput);
        if (value < 0) { showError('Negatif sayının karekökü alınamaz'); return; }
        let res = Math.sqrt(value);
        res = Math.round(res * 1000000000) / 1000000000;
        currentInput = res.toString();
        history.unshift({ text: `√(${value}) = ${currentInput}`, type: 'مالية' });
        filterHistory();
        updateDisplay();
    }

    function calculateReciprocal() {
        let value = parseFloat(currentInput);
        if (value === 0) { showError('Sıfırın tersi tanımsızdır'); return; }
        let res = 1 / value;
        res = Math.round(res * 1000000000) / 1000000000;
        currentInput = res.toString();
        history.unshift({ text: `1/(${value}) = ${currentInput}`, type: 'مالية' });
        filterHistory();
        updateDisplay();
    }

    function power() {
        let base = parseFloat(currentInput);
        let exponent = prompt('Üs değerini girin (kuvvet):', '2');
        if (exponent === null || exponent.trim() === '') return;
        let exp = parseFloat(exponent);
        if (isNaN(exp)) { showError('Geçersiz değer'); return; }
        let res = Math.pow(base, exp);
        res = Math.round(res * 1000000000) / 1000000000;
        currentInput = res.toString();
        history.unshift({ text: `${base}^${exp} = ${currentInput}`, type: 'مالية' });
        filterHistory();
        updateDisplay();
    }

    function log10() {
        let val = parseFloat(currentInput);
        if (val <= 0) { showError('Logaritma yalnızca pozitif sayılar için'); return; }
        let res = Math.log10(val);
        res = Math.round(res * 1000000000) / 1000000000;
        currentInput = res.toString();
        history.unshift({ text: `log10(${val}) = ${currentInput}`, type: 'مالية' });
        filterHistory();
        updateDisplay();
    }

    function factorial() {
        let n = parseInt(currentInput);
        if (isNaN(n) || n < 0 || n > 170) {
            showError('Pozitif tam sayı girin (170\'den küçük)');
            return;
        }
        let fact = 1;
        for (let i = 2; i <= n; i++) fact *= i;
        currentInput = fact.toString();
        history.unshift({ text: `${n}! = ${currentInput}`, type: 'مالية' });
        filterHistory();
        updateDisplay();
    }

    function applyTax() {
        let rate = prompt('KDV oranını girin (%) (örnek: 15):', '15');
        if (rate === null || rate.trim() === '') return;
        let r = parseFloat(rate);
        if (isNaN(r)) return;
        let amount = parseFloat(currentInput);
        let taxValue = amount * (r / 100);
        let result = amount + taxValue;
        result = Math.round(result * 100) / 100;
        history.unshift({ text: `${amount} + KDV %${r} = ${result}`, type: 'مالية' });
        currentInput = result.toString();
        updateDisplay();
        filterHistory();
    }

    function applyDiscount() {
        let rate = prompt('İndirim oranını girin (%) (örnek: 10):', '10');
        if (rate === null || rate.trim() === '') return;
        let r = parseFloat(rate);
        if (isNaN(r)) return;
        let amount = parseFloat(currentInput);
        let discountValue = amount * (r / 100);
        let result = amount - discountValue;
        result = Math.round(result * 100) / 100;
        history.unshift({ text: `${amount} - İndirim %${r} = ${result}`, type: 'مالية' });
        currentInput = result.toString();
        updateDisplay();
        filterHistory();
    }

    function calculateROI() {
        let cost = parseFloat(currentInput);
        if (cost === 0) { showError('Maliyet sıfırdan büyük olmalı'); return; }
        let revenue = prompt('Beklenen toplam geliri girin:', cost * 1.2);
        if (revenue === null || revenue.trim() === '') return;
        let rev = parseFloat(revenue);
        if (isNaN(rev)) return;
        let roi = ((rev - cost) / cost) * 100;
        roi = Math.round(roi * 100) / 100;
        history.unshift({ text: `ROI (Maliyet:${cost}, Gelir:${rev}) = %${roi}`, type: 'مالية' });
        currentInput = roi.toString();
        updateDisplay();
        filterHistory();
    }

    function calculateSimpleInterest() {
        let principal = parseFloat(currentInput);
        let rate = prompt('Beklenen yıllık faiz oranı (%)', '5');
        if (rate === null || rate.trim() === '') return;
        let r = parseFloat(rate) / 100;
        let time = prompt('Süre (yıl olarak)', '1');
        if (time === null || time.trim() === '') return;
        let t = parseFloat(time);
        if (isNaN(r) || isNaN(t)) return;
        let interest = principal * r * t;
        interest = Math.round(interest * 100) / 100;
        history.unshift({ text: `Faiz (${principal}×${r*100}%×${t}yıl) = ${interest}`, type: 'مالية' });
        currentInput = interest.toString();
        updateDisplay();
        filterHistory();
    }

    function handleMemory(cmd) {
        let value = parseFloat(currentInput);
        switch (cmd) {
            case 'MC': memory = 0; historyDisplayElem.innerText = "Bellek Temizlendi";
                setTimeout(() => historyDisplayElem.innerText = "", 1000); break;
            case 'MR': currentInput = memory.toString(); updateDisplay(); break;
            case 'M+': memory += value; historyDisplayElem.innerText = "M+ " + value;
                setTimeout(() => historyDisplayElem.innerText = "", 1000); break;
            case 'M-': memory -= value; historyDisplayElem.innerText = "M- " + value;
                setTimeout(() => historyDisplayElem.innerText = "", 1000); break;
        }
    }

    function renderHistory(filteredList) {
        historyTableBody.innerHTML = '';
        if (filteredList.length === 0) {
            historyTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center;color:#aab7d4;padding:1.5rem 0;">Kayıtlı işlem yok</td></tr>`;
            return;
        }
        filteredList.forEach((item, index) => {
            let parts = item.text.split('=');
            let operationStr = parts[0] ? parts[0].trim() : '';
            let resultStr = parts[1] ? parts[1].trim() : item.text;
            let badgeClass = item.type === 'مالية' ? 'badge-finance' : 'badge-math';
            let tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="badge ${badgeClass}">${item.type}</span></td>
                <td class="td-operation">${operationStr}</td>
                <td class="td-result">${resultStr}</td>
                <td>
                    <div class="action-btns">
                        <button class="icon-btn restore" title="Sonucu kullan" onclick="restoreResult('${resultStr}')"><i class="fas fa-reply"></i></button>
                        <button class="icon-btn delete" title="Kaydı sil" onclick="deleteHistoryItem(${index})"><i class="fas fa-trash"></i></button>
                    </div>
                </td>
            `;
            historyTableBody.appendChild(tr);
        });
    }

    function restoreResult(val) {
        val = val.replace('%', '').trim();
        currentInput = val;
        updateDisplay();
    }

    function filterHistory() {
        let filter = document.getElementById('filterSelect').value;
        let filtered = history;
        if (filter !== 'all') {
            filtered = history.filter(item => item.type === filter);
        }
        renderHistory(filtered);
    }

    function deleteHistoryItem(index) {
        let filter = document.getElementById('filterSelect').value;
        let displayed = (filter === 'all') ? history : history.filter(i => i.type === filter);
        let realItem = displayed[index];
        let actualIndex = history.findIndex(i => i === realItem);
        if (actualIndex !== -1) history.splice(actualIndex, 1);
        filterHistory();
    }

    function clearHistory() {
        if (confirm("Tüm hesap kayıtlarını silmek istediğinize emin misiniz?")) {
            history = [];
            filterHistory();
        }
    }

    function exportHistory() {
        if (history.length === 0) { showError("Geçmiş boş"); return; }
        let csv = 'Tür,İşlem,Sonuç\n';
        history.forEach(item => {
            let parts = item.text.split('=');
            let op = parts[0].trim().replace(/"/g, '""');
            let res = parts[1] ? parts[1].trim().replace(/"/g, '""') : '';
            csv += `"${item.type}","${op}","${res}"\n`;
        });
        let blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        let link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Hesap_Geçmişi_FAROUK_${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
    }

    // ================================================================
    // ========== Excel Dışa Aktar ==========
    // ================================================================
    document.getElementById('exportExcelBtn').addEventListener('click', async function() {
        if (history.length === 0) { alert('Lütfen önce bazı hesaplamalar yapın.'); return; }
        showLoading('Excel raporu oluşturuluyor...', 'Sayfalar oluşturuluyor');
        try {
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'FAROUK GRUP';
            const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050';
            const AR = 'FFF5F0E8', DT = 'FF1A1A1A', PB = 'FFD4EDDA', NB = 'FFF8D7DA';
            const PT = 'FF155724', NT = 'FF721C24';

            function cs(bg='FFFFFFFF',tc=DT,b=false,h='center'){return{font:{name:'Arial',bold:b,size:10,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:h,vertical:'middle',wrapText:true,readingOrder:'rtl'},border:{top:{style:'hair',color:{argb:'FFCCCCCC'}},bottom:{style:'hair',color:{argb:'FFCCCCCC'}},left:{style:'hair',color:{argb:'FFCCCCCC'}},right:{style:'hair',color:{argb:'FFCCCCCC'}}}};}
            function ap(c,s){if(s.font)c.font=s.font;if(s.fill)c.fill=s.fill;if(s.alignment)c.alignment=s.alignment;if(s.border)c.border=s.border;if(s.numFmt)c.numFmt=s.numFmt;}
            function mh(ws,fc,tc,r,text,bg=HB,tc2=GL,fs=12){ws.mergeCells(r,fc,r,tc);const c=ws.getCell(r,fc);c.value=text;c.font={name:'Arial',bold:true,size:fs,color:{argb:tc2}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:'rtl'};c.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};}

            // 1. Kapak
            const cv = workbook.addWorksheet('Kapak', { views: [{ rightToLeft: true, showGridLines: false }] });
            [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
            cv.getRow(2).height=80; cv.getRow(4).height=60;
            cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1);
            bc.value='FAROUK GRUP\nDanışmanlık ve İşletme';
            bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:'rtl'};
            mh(cv,1,4,4,`Hesap İşlemleri Raporu\n${new Date().toLocaleDateString('tr-TR')}`,DB,GL,18);
            const inf=[['📋 İşlem Sayısı',history.length],['📅 Tarih',new Date().toLocaleDateString('tr-TR')],['⏰ Saat',new Date().toLocaleTimeString('tr-TR')]];
            let ir=6;
            inf.forEach(([l,v],idx)=>{
                cv.mergeCells(ir,1,ir,2); cv.mergeCells(ir,3,ir,4);
                const lc=cv.getCell(ir,1), vc=cv.getCell(ir,3); lc.value=l; vc.value=v;
                const bg=idx%2===0?AR:'FFFEFCF6';
                ap(lc,{font:{name:'Arial',bold:true,size:11,color:{argb:'00695C'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'right',vertical:'middle',readingOrder:'rtl'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                ap(vc,{font:{name:'Arial',size:11,color:{argb:DT}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',readingOrder:'rtl'},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                cv.getRow(ir).height=28; ir++;
            });

            // 2. İşlem geçmişi
            const logSheet = workbook.addWorksheet('İşlem Geçmişi', { views: [{ rightToLeft: true, showGridLines: false }] });
            logSheet.getColumn(1).width = 5; logSheet.getColumn(2).width = 20; logSheet.getColumn(3).width = 50; logSheet.getColumn(4).width = 30;
            mh(logSheet,1,4,1,'📋 İşlem Geçmişi',DB,GL,14);
            logSheet.getRow(1).height=40;
            logSheet.addRow(['#', 'Tür', 'İşlem', 'Sonuç']);
            const headerRow = logSheet.getRow(2);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
            history.forEach((item, idx) => {
                let parts = item.text.split('=');
                let op = parts[0] ? parts[0].trim() : '';
                let res = parts[1] ? parts[1].trim() : item.text;
                logSheet.addRow([idx+1, item.type, op, res]);
            });

            // 3. Özet
            const sumSheet = workbook.addWorksheet('Özet', { views: [{ rightToLeft: true, showGridLines: false }] });
            sumSheet.getColumn(1).width = 5; sumSheet.getColumn(2).width = 35; sumSheet.getColumn(3).width = 30;
            mh(sumSheet,1,3,1,'📊 Özet İstatistikler',DB,GL,14);
            sumSheet.getRow(1).height=40;
            const mathCount = history.filter(i => i.type !== 'مالية').length;
            const finCount = history.filter(i => i.type === 'مالية').length;
            const sumData = [
                ['Toplam İşlem', history.length],
                ['Matematik İşlemleri', mathCount],
                ['Finansal İşlemler', finCount],
                ['Rapor Tarihi', new Date().toLocaleDateString('tr-TR')]
            ];
            sumSheet.addRow(['Gösterge', 'Değer']);
            sumData.forEach(row => sumSheet.addRow(row));
            sumSheet.getRow(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            sumSheet.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const now = new Date();
            const fileName = `Hesap_Geçmişi_${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert('Excel hatası: ' + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== Word Dışa Aktar ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (history.length === 0) { alert('Lütfen önce bazı hesaplamalar yapın.'); return; }
        showLoading('Word raporu oluşturuluyor...', 'Veriler toplanıyor');
        try {
            const now = new Date();
            const dateStr = now.toLocaleDateString('tr-TR');

            let tableRows = '';
            history.forEach((item, idx) => {
                let parts = item.text.split('=');
                let op = parts[0] ? parts[0].trim() : '';
                let res = parts[1] ? parts[1].trim() : item.text;
                const badgeColor = item.type === 'مالية' ? '#ffc107' : '#007bff';
                const textColor = item.type === 'مالية' ? '#111' : '#fff';
                tableRows += `
                    <tr>
                        <td style="border:1px solid #b8860b;padding:8px;text-align:center;">${idx+1}</td>
                        <td style="border:1px solid #b8860b;padding:8px;text-align:center;"><span style="background:${badgeColor};color:${textColor};padding:0.2rem 0.6rem;border-radius:4px;font-weight:700;">${item.type}</span></td>
                        <td style="border:1px solid #b8860b;padding:8px;text-align:center;direction:ltr;">${op}</td>
                        <td style="border:1px solid #b8860b;padding:8px;text-align:center;direction:ltr;font-weight:700;color:#b8860b;">${res}</td>
                    </tr>
                `;
            });

            const mathCount = history.filter(i => i.type !== 'مالية').length;
            const finCount = history.filter(i => i.type === 'مالية').length;

            const fullHtml = `<!DOCTYPE html>
            <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word'>
            <head><meta charset='utf-8'><title>Hesap Makinesi Raporu - FAROUK GRUP</title>
            <style>
                body{font-family:'Arial','Tajawal',sans-serif;direction:rtl;margin:2rem;background:#fff;color:#333;}
                .cover{text-align:center;border-bottom:4px solid #b8860b;margin-bottom:30px;padding-bottom:20px;}
                .cover h1{font-size:32px;color:#b8860b;margin:0;}
                .cover h2{font-size:24px;color:#b48554;margin:5px 0;}
                .cover p{color:#666;}
                table{width:100%;border-collapse:collapse;margin:20px 0;} th,td{border:1px solid #b8860b;padding:8px;text-align:center;}
                th{background:#fefcf6;color:#b8860b;font-weight:bold;}
                .footer{text-align:center;margin-top:40px;color:#888;border-top:1px dashed #b8860b;padding-top:10px;}
                .summary{background:#fefcf6;padding:15px;border-radius:10px;border-right:4px solid #b8860b;margin:20px 0;}
            </style></head>
            <body>
                <div class="cover">
                    <h1>FAROUK GRUP</h1>
                    <h2>📋 Hesap İşlemleri Raporu</h2>
                    <p>Tarih: ${dateStr} | Saat: ${now.toLocaleTimeString('tr-TR')}</p>
                </div>
                <div class="summary">
                    <h3 style="color:#b8860b;">📊 İşlem Özeti</h3>
                    <p>Toplam İşlem: <strong>${history.length}</strong></p>
                    <p>Temel Matematik İşlemleri: <strong>${mathCount}</strong></p>
                    <p>Finansal / Gelişmiş İşlemler: <strong>${finCount}</strong></p>
                </div>
                <h2 style="color:#b8860b;">📋 Tam İşlem Geçmişi</h2>
                <table>
                    <thead><tr><th>#</th><th>Tür</th><th>İşlem</th><th>Sonuç</th></tr></thead>
                    <tbody>${tableRows}</tbody>
                </table>
                <div class="footer">FAROUK GRUP tarafından oluşturulmuştur © ${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `Hesap_Raporu_${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert('Word hatası: ' + err.message); } finally { hideLoading(); }
    });

    // ===== Klavye desteği =====
    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
        const key = e.key;
        if (['+', '-', '*', '/', '=', 'Enter', 'Escape', 'Backspace', 'Delete', '%'].includes(key) ||
            (key >= '0' && key <= '9') || key === '.') {
            e.preventDefault();
        }
        if (key >= '0' && key <= '9') appendToDisplay(key);
        else if (key === '.') appendToDisplay('.');
        else if (key === '+') setOperator('+');
        else if (key === '-') setOperator('-');
        else if (key === '*') setOperator('*');
        else if (key === '/') setOperator('/');
        else if (key === '=' || key === 'Enter') calculateResult();
        else if (key === 'Escape') clearDisplay();
        else if (key === 'Delete') clearEntry();
        else if (key === 'Backspace') backspace();
    });

    filterHistory();
