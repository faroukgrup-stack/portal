
    AOS.init({ duration: 800, once: true });

    // ===== الوقت والتاريخ =====
    function updateDateTime() {
        const now = new Date();
        document.getElementById('currentDate').innerText = now.toLocaleDateString(FG.locale(), {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
        document.getElementById('currentTime').innerText = now.toLocaleTimeString(FG.locale(), {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });
    }
    setInterval(updateDateTime, 1000);
    updateDateTime();

    // ===== شاشة تحميل =====
    function showLoading(title, msg) {
        document.getElementById('loadingTitle').textContent = title;
        document.getElementById('loadingMsg').textContent = msg;
        document.getElementById('exportLoading').classList.add('show');
    }
    function hideLoading() {
        document.getElementById('exportLoading').classList.remove('show');
    }

    // ===== كود الآلة الحاسبة كاملاً =====
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
                if (curr === 0) { showError(T('s1')); return; }
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
        if (value < 0) { showError(T('s2')); return; }
        let res = Math.sqrt(value);
        res = Math.round(res * 1000000000) / 1000000000;
        currentInput = res.toString();
        history.unshift({ text: `√(${value}) = ${currentInput}`, type: 'مالية' });
        filterHistory();
        updateDisplay();
    }

    function calculateReciprocal() {
        let value = parseFloat(currentInput);
        if (value === 0) { showError(T('s3')); return; }
        let res = 1 / value;
        res = Math.round(res * 1000000000) / 1000000000;
        currentInput = res.toString();
        history.unshift({ text: `1/(${value}) = ${currentInput}`, type: 'مالية' });
        filterHistory();
        updateDisplay();
    }

    function power() {
        let base = parseFloat(currentInput);
        let exponent = prompt(T('s4'), '2');
        if (exponent === null || exponent.trim() === '') return;
        let exp = parseFloat(exponent);
        if (isNaN(exp)) { showError(T('s5')); return; }
        let res = Math.pow(base, exp);
        res = Math.round(res * 1000000000) / 1000000000;
        currentInput = res.toString();
        history.unshift({ text: `${base}^${exp} = ${currentInput}`, type: 'مالية' });
        filterHistory();
        updateDisplay();
    }

    function log10() {
        let val = parseFloat(currentInput);
        if (val <= 0) { showError(T('s6')); return; }
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
            showError(T('s7'));
            return;
        }
        let fact = 1;
        for (let i = 2; i <= n; i++) fact *= i;
        currentInput = fact.toString();
        history.unshift({ text: `${n}! = ${currentInput}`, type: 'مالية' });
        filterHistory();
        updateDisplay();
    }

    async function applyTax() {
        let rate = prompt(T('s8'), '15');
        if (rate === null || rate.trim() === '') return;
        let r = parseFloat(rate);
        if (isNaN(r)) return;
        let amount = parseFloat(currentInput);
        let result;
        try { result = (await FG.calc('tool16', 'fin', { kind: 'tax', amount, r })).result; } catch (e) { FG.calcError(e); return; }
        history.unshift({ text: `${amount}${T('s9')}${r}% = ${result}`, type: 'مالية' });
        currentInput = result.toString();
        updateDisplay();
        filterHistory();
    }

    async function applyDiscount() {
        let rate = prompt(T('s10'), '10');
        if (rate === null || rate.trim() === '') return;
        let r = parseFloat(rate);
        if (isNaN(r)) return;
        let amount = parseFloat(currentInput);
        let result;
        try { result = (await FG.calc('tool16', 'fin', { kind: 'discount', amount, r })).result; } catch (e) { FG.calcError(e); return; }
        history.unshift({ text: `${amount}${T('s11')}${r}% = ${result}`, type: 'مالية' });
        currentInput = result.toString();
        updateDisplay();
        filterHistory();
    }

    async function calculateROI() {
        let cost = parseFloat(currentInput);
        if (cost === 0) { showError(T('s12')); return; }
        let revenue = prompt(T('s13'), cost * 1.2);
        if (revenue === null || revenue.trim() === '') return;
        let rev = parseFloat(revenue);
        if (isNaN(rev)) return;
        let roi;
        try { roi = (await FG.calc('tool16', 'fin', { kind: 'roi', cost, rev })).result; } catch (e) { FG.calcError(e); return; }
        history.unshift({ text: `${T('s14')}${cost}${T('s15')}${rev}) = %${roi}`, type: 'مالية' });
        currentInput = roi.toString();
        updateDisplay();
        filterHistory();
    }

    async function calculateSimpleInterest() {
        let principal = parseFloat(currentInput);
        let rate = prompt(T('s16'), '5');
        if (rate === null || rate.trim() === '') return;
        let r = parseFloat(rate) / 100;
        let time = prompt(T('s17'), '1');
        if (time === null || time.trim() === '') return;
        let t = parseFloat(time);
        if (isNaN(r) || isNaN(t)) return;
        let interest;
        try { interest = (await FG.calc('tool16', 'fin', { kind: 'interest', principal, r, t })).result; } catch (e) { FG.calcError(e); return; }
        history.unshift({ text: `${T('s18')}${principal}×${r*100}%×${t}${T('s19')}${interest}`, type: 'مالية' });
        currentInput = interest.toString();
        updateDisplay();
        filterHistory();
    }

    function handleMemory(cmd) {
        let value = parseFloat(currentInput);
        switch (cmd) {
            case 'MC': memory = 0; historyDisplayElem.innerText = "Memory Cleared";
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
            historyTableBody.innerHTML = `${T('s20')}`;
            return;
        }
        filteredList.forEach((item, index) => {
            let parts = item.text.split('=');
            let operationStr = parts[0] ? parts[0].trim() : '';
            let resultStr = parts[1] ? parts[1].trim() : item.text;
            let badgeClass = item.type === 'مالية' ? 'badge-finance' : 'badge-math';
            let tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span class="badge ${badgeClass}">${item.type === 'مالية' ? T('x_fin') : item.type}</span></td>
                <td class="td-operation">${operationStr}</td>
                <td class="td-result">${resultStr}${T('s21')}${resultStr}${T('s22')}${index})"><i class="fas fa-trash"></i></button>
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
        if (confirm(T('s23'))) {
            history = [];
            filterHistory();
        }
    }

    function exportHistory() {
        if (history.length === 0) { showError(T('s24')); return; }
        let csv = T('s25');
        history.forEach(item => {
            let parts = item.text.split('=');
            let op = parts[0].trim().replace(/"/g, '""');
            let res = parts[1] ? parts[1].trim().replace(/"/g, '""') : '';
            csv += `"${item.type}","${op}","${res}"\n`;
        });
        let blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
        let link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${T('s26')}${new Date().toISOString().slice(0,10)}.csv`;
        link.click();
    }

    // ================================================================
    // ========== تصدير Excel احترافي ==========
    // ================================================================
    document.getElementById('exportExcelBtn').addEventListener('click', async function() {
        if (history.length === 0) { alert(T('s27')); return; }
        showLoading(T('s28'), T('s29'));
        try {
            const workbook = new ExcelJS.Workbook();
            workbook.creator = 'FAROUK GRUP';
            const G = 'FFB48554', GL = 'FFCFA776', DB = 'FF0B0E17', HB = 'FF1A2035', SB = 'FF243050';
            const AR = 'FFF5F0E8', DT = 'FF1A1A1A', PB = 'FFD4EDDA', NB = 'FFF8D7DA';
            const PT = 'FF155724', NT = 'FF721C24';

            function cs(bg='FFFFFFFF',tc=DT,b=false,h='center'){return{font:{name:'Arial',bold:b,size:10,color:{argb:tc}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:h,vertical:'middle',wrapText:true,readingOrder:FG.dir()},border:{top:{style:'hair',color:{argb:'FFCCCCCC'}},bottom:{style:'hair',color:{argb:'FFCCCCCC'}},left:{style:'hair',color:{argb:'FFCCCCCC'}},right:{style:'hair',color:{argb:'FFCCCCCC'}}}};}
            function ap(c,s){if(s.font)c.font=s.font;if(s.fill)c.fill=s.fill;if(s.alignment)c.alignment=s.alignment;if(s.border)c.border=s.border;if(s.numFmt)c.numFmt=s.numFmt;}
            function mh(ws,fc,tc,r,text,bg=HB,tc2=GL,fs=12){ws.mergeCells(r,fc,r,tc);const c=ws.getCell(r,fc);c.value=text;c.font={name:'Arial',bold:true,size:fs,color:{argb:tc2}};c.fill={type:'pattern',pattern:'solid',fgColor:{argb:bg}};c.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};c.border={top:{style:'medium',color:{argb:G}},bottom:{style:'medium',color:{argb:G}},left:{style:'medium',color:{argb:G}},right:{style:'medium',color:{argb:G}}};}

            // 1. غلاف التقرير
            const cv = workbook.addWorksheet(T('s30'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            [8,45,35,8].forEach((w,i)=>cv.getColumn(i+1).width=w);
            cv.getRow(2).height=80; cv.getRow(4).height=60;
            cv.mergeCells(2,1,2,4); const bc=cv.getCell(2,1);
            bc.value=T('s31');
            bc.font={name:'Arial',bold:true,size:28,color:{argb:GL}}; bc.fill={type:'pattern',pattern:'solid',fgColor:{argb:DB}}; bc.alignment={horizontal:'center',vertical:'middle',wrapText:true,readingOrder:FG.dir()};
            mh(cv,1,4,4,`${T('s32')}${new Date().toLocaleDateString(FG.locale())}`,DB,GL,18);
            const inf=[[T('s33'),history.length],[T('s34'),new Date().toLocaleDateString(FG.locale())],[T('s35'),new Date().toLocaleTimeString(FG.locale())]];
            let ir=6;
            inf.forEach(([l,v],idx)=>{
                cv.mergeCells(ir,1,ir,2); cv.mergeCells(ir,3,ir,4);
                const lc=cv.getCell(ir,1), vc=cv.getCell(ir,3); lc.value=l; vc.value=v;
                const bg=idx%2===0?AR:'FFFEFCF6';
                ap(lc,{font:{name:'Arial',bold:true,size:11,color:{argb:'00695C'}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'right',vertical:'middle',readingOrder:FG.dir()},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                ap(vc,{font:{name:'Arial',size:11,color:{argb:DT}},fill:{type:'pattern',pattern:'solid',fgColor:{argb:bg}},alignment:{horizontal:'center',vertical:'middle',readingOrder:FG.dir()},border:{top:{style:'hair'},bottom:{style:'hair'},left:{style:'hair'},right:{style:'hair'}}});
                cv.getRow(ir).height=28; ir++;
            });

            // 2. سجل العمليات
            const logSheet = workbook.addWorksheet(T('s36'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            logSheet.getColumn(1).width = 5; logSheet.getColumn(2).width = 20; logSheet.getColumn(3).width = 50; logSheet.getColumn(4).width = 30; logSheet.getColumn(5).width = 5;
            mh(logSheet,1,5,1,T('s37'),DB,GL,14);
            logSheet.getRow(1).height=40;
            logSheet.addRow(['#', T('s38'), T('s39'), T('s40')]);
            const headerRow = logSheet.getRow(2);
            headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };
            history.forEach((item, idx) => {
                let parts = item.text.split('=');
                let op = parts[0] ? parts[0].trim() : '';
                let res = parts[1] ? parts[1].trim() : item.text;
                logSheet.addRow([idx+1, item.type, op, res]);
            });

            // 3. ملخص إحصائي
            const sumSheet = workbook.addWorksheet(T('s41'), { views: [{ rightToLeft: FG.isRTL(), showGridLines: false }] });
            sumSheet.getColumn(1).width = 5; sumSheet.getColumn(2).width = 35; sumSheet.getColumn(3).width = 30; sumSheet.getColumn(4).width = 5;
            mh(sumSheet,1,4,1,T('s42'),DB,GL,14);
            sumSheet.getRow(1).height=40;
            const mathCount = history.filter(i => i.type !== 'مالية').length;
            const finCount = history.filter(i => i.type === 'مالية').length;
            const sumData = [
                [T('s43'), history.length],
                [T('s44'), mathCount],
                [T('s45'), finCount],
                [T('s46'), new Date().toLocaleDateString(FG.locale())]
            ];
            sumSheet.addRow([T('s47'), T('s48')]);
            sumData.forEach(row => sumSheet.addRow(row));
            sumSheet.getRow(2).font = { bold: true, color: { argb: 'FFFFFFFF' } };
            sumSheet.getRow(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: G } };

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const now = new Date();
            const fileName = `${T('s49')}${now.toISOString().slice(0,10)}.xlsx`;
            saveAs(blob, fileName);
        } catch(err) { alert(T('s50') + err.message); } finally { hideLoading(); }
    });

    // ================================================================
    // ========== تصدير Word احترافي ==========
    // ================================================================
    document.getElementById('exportWordBtn').addEventListener('click', async function() {
        if (history.length === 0) { alert(T('s27')); return; }
        showLoading(T('s51'), T('s52'));
        try {
            const now = new Date();
            const dateStr = now.toLocaleDateString(FG.locale());

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

            const fullHtml = `${T('s53')}${dateStr}${T('s54')}${now.toLocaleTimeString(FG.locale())}${T('s55')}${history.length}${T('s56')}${mathCount}${T('s57')}${finCount}${T('s58')}${tableRows}${T('s59')}${now.getFullYear()}</div>
            </body></html>`;

            const blob = new Blob(['\uFEFF' + fullHtml], { type: 'application/msword' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${T('s60')}${now.toISOString().slice(0,10)}.doc`;
            link.click();
            URL.revokeObjectURL(link.href);
        } catch(err) { alert(T('s61') + err.message); } finally { hideLoading(); }
    });

    // ===== دعم لوحة المفاتيح =====
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

    // تهيئة الجدول
    filterHistory();
