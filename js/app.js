if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}

// ---- كود الحماية ومنع الوصول لأدوات المطور ----
(function () {
  "use strict";

  document.addEventListener('keydown', function (e) {
    if (e.key === 'F12' || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }
    if (e.ctrlKey && e.shiftKey &&
        (e.key === 'I' || e.key === 'i' ||
         e.key === 'J' || e.key === 'j' ||
         e.key === 'C' || e.key === 'c')) {
      e.preventDefault();
      return false;
    }
    if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
      e.preventDefault();
      return false;
    }
  }, true);

  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    return false;
  }, true);

})();
// ---- نهاية كود الحماية ----

function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('appLanguage', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
    document.querySelectorAll('#languageSelect option').forEach(opt => {
        const key = opt.getAttribute('data-i18n');
        if (key) opt.textContent = t(key);
    });
    const savedName = localStorage.getItem('userName') || t('userLabel');
    const savedDays = localStorage.getItem('daysLeft') || '?';
    document.getElementById('userNameDisplay').textContent = `${savedName} (${t('remaining')} ${savedDays} ${t('day')})`;
    const subscribeLink = document.getElementById('subscribeLink');
    if (subscribeLink) {
        subscribeLink.href = lang === 'ar' ? 'https://portal.farouk-grup.com/finance-hub' : 'https://portal.farouk-grup.com/finance-huben';
    }
    const guideLink = document.getElementById('guideLink');
    const surveyLink = document.getElementById('surveyLink');
    if (guideLink) {
        guideLink.href = lang === 'ar' ? 'guide.html' : (lang === 'tr' ? 'guidetr.html' : 'guideen.html');
    }
    if (surveyLink) {
        surveyLink.href = lang === 'ar' ? 'survey.html' : (lang === 'tr' ? 'surveytr.html' : 'surveyen.html');
    }
    renderTools();
}

const loginLangSelect = document.getElementById('loginLangSelect');
if (loginLangSelect) {
    loginLangSelect.value = currentLang;
    loginLangSelect.addEventListener('change', function () {
        applyLanguage(this.value);
        errorMsg.textContent = '';
    });
}

const passwordField = document.getElementById('passwordInput');
const togglePasswordBtn = document.getElementById('togglePasswordBtn');
const eyeIcon = document.getElementById('eyeIcon');

togglePasswordBtn.addEventListener('click', function() {
    const isPassword = passwordField.type === 'password';
    passwordField.type = isPassword ? 'text' : 'password';
    eyeIcon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
});

const GOOGLE_SCRIPT_URL = "https://farouk-api-proxy.faroukgrup.workers.dev/";
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

const loginOverlay = document.getElementById('loginOverlay');
const dashboard = document.getElementById('dashboard');
const usernameInput = document.getElementById('usernameInput');
const loginBtn = document.getElementById('loginBtn');
const errorMsg = document.getElementById('errorMsg');
const logoutBtn = document.getElementById('logoutBtn');
const sessionExpiredOverlay = document.getElementById('sessionExpiredOverlay');
const sessionExpiredTitle = document.getElementById('sessionExpiredTitle');
const sessionExpiredMsg = document.getElementById('sessionExpiredMsg');
const renewLinkBtn = document.getElementById('renewLinkBtn');
const reloginBtn = document.getElementById('reloginBtn');

let logoutTimer = null;

function getRemainingSessionTime() {
    const loginTs = localStorage.getItem('loginTimestamp');
    if (!loginTs) return 0;
    const elapsed = Date.now() - parseInt(loginTs);
    return Math.max(0, SESSION_DURATION_MS - elapsed);
}

function isSessionExpired() {
    return getRemainingSessionTime() <= 0;
}

function forceLogout(reason, isSubscriptionExpired = false) {
    dashboard.classList.remove('show');
    if (logoutTimer) { clearTimeout(logoutTimer);
        logoutTimer = null; }
    localStorage.removeItem('userToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('daysLeft');
    localStorage.removeItem('loginTimestamp');
    localStorage.removeItem('currentUserEmail');

    if (isSubscriptionExpired) {
        sessionExpiredTitle.textContent = t('sessionExpiredTitle') + ' (⚠️ انتهى الاشتراك)';
        sessionExpiredMsg.textContent = reason;
        renewLinkBtn.style.display = 'inline-block';
    } else {
        sessionExpiredTitle.textContent = t('sessionExpiredTitle');
        sessionExpiredMsg.textContent = reason;
        renewLinkBtn.style.display = 'none';
    }
    loginOverlay.classList.remove('show');
    sessionExpiredOverlay.classList.add('show');
}

function startSessionTimer() {
    if (logoutTimer) clearTimeout(logoutTimer);
    const remaining = getRemainingSessionTime();
    if (remaining > 0) {
        logoutTimer = setTimeout(() => {
            forceLogout(t('sessionExpiredMsg'), false);
        }, remaining);
    } else {
        forceLogout(t('sessionExpiredMsg'), false);
    }
}

function showLoginScreen() {
    loginOverlay.classList.add('show');
    dashboard.classList.remove('show');
    sessionExpiredOverlay.classList.remove('show');
    if (logoutTimer) clearTimeout(logoutTimer);
    usernameInput?.focus();
}

// ============================================================
// تسجيل الدخول — مع تشخيص مفصل
// ============================================================
async function attemptLogin() {
    const user = usernameInput.value.trim();
    const pass = passwordField.value.trim();

    if (!user || !pass) {
        errorMsg.textContent = t('errorEmpty');
        return;
    }
    if (!user.includes('@') || !user.includes('.')) {
        errorMsg.textContent = t('errorEmail');
        return;
    }

    loginBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> ' + (currentLang === 'ar' ? 'جاري التحقق...' : 'Verifying...');
    loginBtn.disabled = true;
    errorMsg.innerHTML = '';

    try {
        const formData = new FormData();
        formData.append('action', 'login');
        formData.append('username', user);
        formData.append('password', pass);
        const response = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: formData });

        const text = await response.text();

        let result;
        try {
            result = JSON.parse(text);
        } catch (parseErr) {
            errorMsg.innerHTML = '❌ الرد مش JSON (Status: ' + response.status + '):<br><small style="direction:ltr;font-size:11px;word-break:break-all;display:block;max-height:80px;overflow:auto;">' 
                + text.substring(0, 250) + '</small>';
            return;
        }

        if (result.status === 'success') {
            localStorage.setItem('userToken', result.token);
            localStorage.setItem('userName', result.name);
            localStorage.setItem('daysLeft', result.daysLeft);
            localStorage.setItem('loginTimestamp', Date.now().toString());
            localStorage.setItem('currentUserEmail', user);

            const savedName = result.name || t('userLabel');
            document.getElementById('userNameDisplay').textContent = `${savedName} (${t('remaining')} ${result.daysLeft} ${t('day')})`;

            loginOverlay.classList.remove('show');
            sessionExpiredOverlay.classList.remove('show');
            dashboard.classList.add('show');

            startSessionTimer();
            loadAllData();
        } else if (result.status === 'expired') {
            errorMsg.innerHTML = t('errorExpired') + ' <a href="https://www.entervia.co/checkout/77" target="_blank" style="color:#cfa776;">' + (currentLang === 'ar' ? 'من هنا' : 'here') + '</a>';
        } else if (result.status === 'frozen') {
            errorMsg.innerHTML = '❌ تم تجميد الحساب، يرجى مراجعة الإدارة.';
        } else {
            errorMsg.innerHTML = t('errorInvalid') + (result.message ? '<br><small>' + result.message + '</small>' : '');
        }
    } catch (error) {
        errorMsg.innerHTML = t('errorNetwork') + '<br><small style="direction:ltr;font-size:11px;">' + (error.message || error) + '</small>';
    } finally {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> ' + t('loginBtn');
        loginBtn.disabled = false;
    }
}

function initialSessionCheck() {
    const token = localStorage.getItem('userToken');
    if (!token) {
        showLoginScreen();
        return;
    }

    if (isSessionExpired()) {
        localStorage.removeItem('userToken');
        localStorage.removeItem('loginTimestamp');
        localStorage.removeItem('currentUserEmail');
        showLoginScreen();
        return;
    }

    loginOverlay.classList.remove('show');
    sessionExpiredOverlay.classList.remove('show');
    dashboard.classList.add('show');

    const savedName = localStorage.getItem('userName') || t('userLabel');
    const savedDays = localStorage.getItem('daysLeft') || '?';
    document.getElementById('userNameDisplay').textContent = `${savedName} (${t('remaining')} ${savedDays} ${t('day')})`;

    startSessionTimer();
    loadAllData();

    validateWithServerInBackground(token);
}

async function validateWithServerInBackground(token) {
    try {
        const formData = new FormData();
        formData.append('action', 'validate');
        formData.append('token', token);
        const resp = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: formData });
        const result = await resp.json();
        if (result.status === 'expired') {
            forceLogout(t('errorExpired'), true);
        } else if (result.status === 'success') {
            localStorage.setItem('daysLeft', result.daysLeft);
            const savedName = localStorage.getItem('userName') || t('userLabel');
            document.getElementById('userNameDisplay').textContent = `${savedName} (${t('remaining')} ${result.daysLeft} ${t('day')})`;
        }
    } catch (e) {
        // نستمر بالجلسة المحلية
    }
}

loginBtn.addEventListener('click', attemptLogin);
passwordField.addEventListener('keypress', (e) => { if (e.key === 'Enter') attemptLogin(); });
usernameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') passwordField.focus(); });

logoutBtn.addEventListener('click', () => {
    if (logoutTimer) clearTimeout(logoutTimer);
    localStorage.removeItem('userToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('daysLeft');
    localStorage.removeItem('loginTimestamp');
    localStorage.removeItem('currentUserEmail');
    showLoginScreen();
});

reloginBtn.addEventListener('click', () => {
    sessionExpiredOverlay.classList.remove('show');
    showLoginScreen();
});

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && dashboard.classList.contains('show')) {
        if (isSessionExpired()) {
            forceLogout(t('sessionExpiredMsg'), false);
        }
    }
});

window.addEventListener('load', () => {
    applyLanguage(currentLang);
    initialSessionCheck();
    updateDateTime();
    setInterval(updateDateTime, 1000);
});

const dateSpan = document.getElementById('currentDate');
const timeSpan = document.getElementById('currentTime');

function updateDateTime() {
    const now = new Date();
    const locale = currentLang === 'ar' ? 'ar-EG' : 'en-US';
    dateSpan.textContent = now.toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    timeSpan.textContent = now.toLocaleTimeString(locale, {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

let calcInput = '0',
    calcPrev = '',
    calcOp = null;
const display = document.getElementById('calcDisplay');

function updateDisplay() { display.value = calcInput; }

window.appendCalc = function(n) {
    if (calcInput === '0' && n !== '.') calcInput = n;
    else {
        if (n === '.' && calcInput.includes('.')) return;
        calcInput += n;
    }
    updateDisplay();
};

window.setCalcOperator = function(op) {
    if (calcOp !== null) calculateCalc();
    calcPrev = calcInput;
    calcInput = '0';
    calcOp = op;
};

window.calculateCalc = function() {
    if (!calcOp || calcPrev === '') return;
    const a = parseFloat(calcPrev),
        b = parseFloat(calcInput);
    let res;
    switch (calcOp) {
        case '+':
            res = a + b;
            break;
        case '-':
            res = a - b;
            break;
        case '*':
            res = a * b;
            break;
        case '/':
            if (b === 0) { alert(currentLang === 'ar' ? 'خطأ' : 'Error');
                return; }
            res = a / b;
            break;
    }
    calcInput = res.toString();
    calcOp = null;
    calcPrev = '';
    updateDisplay();
};

window.clearCalc = function() {
    calcInput = '0';
    calcPrev = '';
    calcOp = null;
    updateDisplay();
};

document.addEventListener('keydown', function(e) {
    if (loginOverlay.classList.contains('show') || !dashboard.classList.contains('show')) return;
    const active = document.activeElement;
    if (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA') return;
    const k = e.key;
    if (k >= '0' && k <= '9') { e.preventDefault();
        appendCalc(k); } else if (k === '.') { e.preventDefault();
        appendCalc('.'); } else if (k === '+' || k === '-' || k === '*' || k === '/') { e.preventDefault();
        setCalcOperator(k); } else if (k === 'Enter' || k === '=') { e.preventDefault();
        calculateCalc(); } else if (k === 'Escape') { e.preventDefault();
        clearCalc(); } else if (k === 'Backspace') { e.preventDefault(); if (calcInput.length > 1) calcInput = calcInput
            .slice(0, -1);
        else calcInput = '0';
        updateDisplay(); }
});

const todoInput = document.getElementById('todoInput');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoList = document.getElementById('todoList');
const pendingSpan = document.getElementById('pendingCount');
const totalSpan = document.getElementById('totalCount');
let todos = [];

function loadTodos() {
    todos = JSON.parse(localStorage.getItem('employeeTodos') || '[]');
    renderTodos();
}

function saveTodos() {
    localStorage.setItem('employeeTodos', JSON.stringify(todos));
    renderTodos();
}

function renderTodos() {
    todoList.innerHTML = '';
    const pending = todos.filter(t => !t.completed).length;
    pendingSpan.textContent = pending;
    totalSpan.textContent = todos.length;
    todos.forEach((todo, idx) => {
        const div = document.createElement('div');
        div.className = 'todo-item';
        div.innerHTML = `
            <div class="todo-text">
                <input type="checkbox" ${todo.completed ? 'checked' : ''} data-index="${idx}">
                <span class="${todo.completed ? 'completed' : ''}">${todo.text}</span>
            </div>
            <span class="delete-btn delete-todo" data-index="${idx}"><i class="fas fa-trash-alt"></i></span>
        `;
        todoList.appendChild(div);
    });
    document.querySelectorAll('.todo-text input[type=checkbox]').forEach(cb => {
        cb.addEventListener('change', function() {
            todos[this.dataset.index].completed = this.checked;
            saveTodos();
        });
    });
    document.querySelectorAll('.delete-todo').forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm(currentLang === 'ar' ? 'حذف المهمة؟' : 'Delete task?')) {
                todos.splice(this.dataset.index, 1);
                saveTodos();
            }
        });
    });
}

function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;
    todos.push({ text, completed: false });
    saveTodos();
    todoInput.value = '';
}

addTodoBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') addTodo(); });

const notes = document.getElementById('notesArea');

document.getElementById('saveLocal').addEventListener('click', function() {
    localStorage.setItem('employeeNotes', notes.value);
    alert(currentLang === 'ar' ? 'تم حفظ الملاحظات.' : 'Notes saved.');
});

document.getElementById('exportNotes').addEventListener('click', function() {
    const blob = new Blob([notes.value], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `notes_faroukgrup_${new Date().toISOString().slice(0,10)}.txt`;
    a.click();
});

document.getElementById('importNotes').addEventListener('click', function() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = function(ev) { notes.value = ev.target.result; };
        reader.readAsText(file);
    };
    input.click();
});

function loadNotes() {
    const saved = localStorage.getItem('employeeNotes');
    if (saved) notes.value = saved;
}

let apps = JSON.parse(localStorage.getItem('employeeAppointments') || '[]');
const appTitle = document.getElementById('appTitle');
const appDate = document.getElementById('appDate');
const appDesc = document.getElementById('appDesc');
const appList = document.getElementById('appointmentsList');

function renderApps() {
    appList.innerHTML = '';
    apps.slice().sort((a, b) => a.date.localeCompare(b.date)).forEach(function(a, idx) {
        const d = new Date(a.date).toLocaleDateString(currentLang === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric',
            month: 'short' });
        const div = document.createElement('div');
        div.className = 'appointment-item';
        let descHtml = a.desc && a.desc.trim() ? `<div class="appointment-desc">📝 ${a.desc}</div>` : '';
        div.innerHTML = `
            <div class="appointment-info">
                <span class="appointment-date">${d}</span>
                <span class="appointment-title">${a.title}</span>
                ${descHtml}
            </div>
            <span class="delete-btn delete-app" data-idx="${idx}"><i class="fas fa-trash-alt"></i></span>
        `;
        appList.appendChild(div);
    });
    document.querySelectorAll('.delete-app').forEach(function(btn) {
        btn.addEventListener('click', function() {
            if (confirm(currentLang === 'ar' ? 'حذف الموعد؟' : 'Delete appointment?')) {
                apps.splice(this.dataset.idx, 1);
                localStorage.setItem('employeeAppointments', JSON.stringify(apps));
                renderApps();
            }
        });
    });
}

document.getElementById('addAppBtn').addEventListener('click', function() {
    if (!appTitle.value || !appDate.value) return alert(currentLang === 'ar' ? 'يرجى إدخال العنوان والتاريخ' :
        'Please enter title and date');
    apps.push({ title: appTitle.value, date: appDate.value, desc: appDesc.value });
    localStorage.setItem('employeeAppointments', JSON.stringify(apps));
    renderApps();
    appTitle.value = '';
    appDate.value = '';
    appDesc.value = '';
});

document.getElementById('exportApps').addEventListener('click', function() {
    const lines = apps.map(a => `${a.date},${a.title},${a.desc}`).join('\n');
    const blob = new Blob(['التاريخ,العنوان,الوصف\n' + lines], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `appointments_faroukgrup_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
});

function loadAppointments() {
    apps = JSON.parse(localStorage.getItem('employeeAppointments') || '[]');
    renderApps();
}

const toolCategories = [{
    nameKey: "cat_جدوى",
    icon: "fa-chart-pie",
    tools: [
        { nameKey: "tool_feasibility", icon: "fa-chart-pie", file: "tool1.html" },
        { nameKey: "tool_tech_feasibility", icon: "fa-gear", file: "tool3.html" },
        { nameKey: "tool_marketing", icon: "fa-chart-simple", file: "tool4.html" },
        { nameKey: "tool_realestate", icon: "fa-building", file: "tool5.html" },
        { nameKey: "tool_roi", icon: "fa-chart-line", file: "tool11.html" },
        { nameKey: "tool_restaurant_eval", icon: "fa-ranking-star", file: "tool30.html" },
        { nameKey: "tool_software_eval", icon: "fa-laptop-code", file: "tool27.html" },
        { nameKey: "tool_npv_irr", icon: "fa-wave-square", file: "tool26.html" },
        { nameKey: "tool_cagr", icon: "fa-arrow-trend-up", file: "tool32.html" }
    ]
}, {
    nameKey: "cat_مالي",
    icon: "fa-coins",
    tools: [
        { nameKey: "tool_cashflow", icon: "fa-coins", file: "tool8.html" },
        { nameKey: "tool_cashgap", icon: "fas fa-money-bill-wave", file: "tool25.html" },
        { nameKey: "tool_cash_forecast_13w", icon: "fas fa-money-bill-trend-up", file: "tool31.html" },
        { nameKey: "tool_ratios", icon: "fa-percentage", file: "tool18.html" },
        { nameKey: "tool_forecast", icon: "fa-arrow-trend-up", file: "tool19.html" },
        { nameKey: "tool_wacc", icon: "fa-scale-balanced", file: "tool10.html" },
        { nameKey: "tool_depreciation", icon: "fa-chart-column", file: "tool9.html" },
        { nameKey: "tool_scenario", icon: "fas fa-lightbulb", file: "tool28.html" },
        { nameKey: "tool_loan", icon: "fa-hand-holding-usd", file: "tool12.html" }
    ]
}, {
    nameKey: "cat_تكاليف",
    icon: "fa-calculator",
    tools: [
        { nameKey: "tool_restaurant_cost", icon: "fa-utensils", file: "tool2.html" },
        { nameKey: "tool_breakeven", icon: "fa-chart-line", file: "tool7.html" },
        { nameKey: "tool_multibreak", icon: "fa-chart-line", file: "tool17.html" },
        { nameKey: "tool_menu_eng", icon: "fa-object-group", file: "tool22.html" },
        { nameKey: "tool_cac", icon: "fas fa-users", file: "tool23.html" },
        { nameKey: "tool_labor", icon: "fa-users", file: "tool13.html" }
    ]
}, {
    nameKey: "cat_مخاطر",
    icon: "fa-shield",
    tools: [
        { nameKey: "tool_risk", icon: "fa-wave-square", file: "tool6.html" },
        { nameKey: "tool_haccp", icon: "fa-exclamation-triangle", file: "tool14.html" },
        { nameKey: "tool_sop", icon: "fa-clipboard-list", file: "tool15.html" }
    ]
}, {
    nameKey: "cat_اداري",
    icon: "fa-user-tie",
    tools: [
        { nameKey: "tool_employee", icon: "fa-user-check", file: "tool20.html" },
        { nameKey: "tool_manager", icon: "fa-user-check", file: "tool21.html" },
        { nameKey: "tool_skills", icon: "fa-award", file: "tool29.html" },
        { nameKey: "tool_content", icon: "fas fa-robot", file: "tool24.html" },
        { nameKey: "tool_admin_calc", icon: "fa-calculator", file: "tool16.html" }
    ]
}];

function renderTools() {
    const container = document.getElementById('toolsContainer');
    container.innerHTML = '';
    const lang = currentLang;
    toolCategories.forEach(function(cat) {
        const catDiv = document.createElement('div');
        catDiv.className = 'tools-category';
        const titleDiv = document.createElement('div');
        titleDiv.className = 'category-title';
        const catName = t(cat.nameKey);
        titleDiv.innerHTML = `<i class="fas ${cat.icon}"></i> ${catName}`;
        catDiv.appendChild(titleDiv);
        const grid = document.createElement('div');
        grid.className = 'tools-grid';
        cat.tools.forEach(function(tool) {
            const card = document.createElement('div');
            card.className = 'tool-card';
            let filePath = 'tools/' + tool.file;
            if (lang === 'en') {
                filePath = filePath.replace(/\.html$/, 'en.html');
            } else if (lang === 'tr') {
                filePath = filePath.replace(/\.html$/, 'tr.html');
            }
            card.onclick = function() { location.href = filePath; };
            const toolName = t(tool.nameKey);
            card.innerHTML = `<i class="fas ${tool.icon}"></i><h4>${toolName}</h4>`;
            grid.appendChild(card);
        });
        catDiv.appendChild(grid);
        container.appendChild(catDiv);
    });
}

const settingsOverlay = document.getElementById('settingsOverlay');
const settingsBtn = document.getElementById('settingsBtn');
const closeSettingsBtn = document.getElementById('closeSettingsBtn');
const languageSelect = document.getElementById('languageSelect');
const applyLanguageBtn = document.getElementById('applyLanguageBtn');

settingsBtn.addEventListener('click', function() {
    settingsOverlay.classList.add('show');
    languageSelect.value = currentLang;
});

closeSettingsBtn.addEventListener('click', function() {
    settingsOverlay.classList.remove('show');
});

applyLanguageBtn.addEventListener('click', function() {
    const newLang = languageSelect.value;
    applyLanguage(newLang);
    const savedName = localStorage.getItem('userName') || t('userLabel');
    const savedDays = localStorage.getItem('daysLeft') || '?';
    document.getElementById('userNameDisplay').textContent = `${savedName} (${t('remaining')} ${savedDays} ${t('day')})`;
    settingsOverlay.classList.remove('show');
});

const changeEmail = document.getElementById('changeEmail');
const changeCurrentPass = document.getElementById('changeCurrentPass');
const changeNewPass = document.getElementById('changeNewPass');
const changeConfirmPass = document.getElementById('changeConfirmPass');
const changePasswordBtn = document.getElementById('changePasswordBtn');
const changePassMsg = document.getElementById('changePassMsg');

changePasswordBtn.addEventListener('click', async function() {
    const email = changeEmail.value.trim();
    const current = changeCurrentPass.value.trim();
    const newPass = changeNewPass.value.trim();
    const confirm = changeConfirmPass.value.trim();

    const currentUserEmail = localStorage.getItem('currentUserEmail');
    if (!currentUserEmail) {
        changePassMsg.textContent = t('changePassNotLoggedIn');
        return;
    }
    if (email !== currentUserEmail) {
        changePassMsg.textContent = t('changePassWrongEmail');
        return;
    }

    if (!email || !current || !newPass || !confirm) {
        changePassMsg.textContent = currentLang === 'ar' ? '❌ يرجى ملء جميع الحقول' :
            '❌ Please fill all fields';
        return;
    }
    if (newPass !== confirm) {
        changePassMsg.textContent = t('changePassMismatch');
        return;
    }
    if (newPass.length < 6) {
        changePassMsg.textContent = currentLang === 'ar' ? '❌ كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل' :
            '❌ New password must be at least 6 characters';
        return;
    }

    changePasswordBtn.disabled = true;
    changePasswordBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> ' + (currentLang === 'ar' ? 'جاري...' :
        'Processing...');
    changePassMsg.textContent = '';

    try {
        const formData = new FormData();
        formData.append('action', 'changePassword');
        formData.append('email', email);
        formData.append('currentPassword', current);
        formData.append('newPassword', newPass);
        const resp = await fetch(GOOGLE_SCRIPT_URL, { method: 'POST', body: formData });
        const result = await resp.json();
        if (result.status === 'success') {
            changePassMsg.style.color = '#4ade80';
            changePassMsg.textContent = t('changePassSuccess');
            changeEmail.value = '';
            changeCurrentPass.value = '';
            changeNewPass.value = '';
            changeConfirmPass.value = '';
        } else {
            changePassMsg.style.color = '#f87171';
            changePassMsg.textContent = t('changePassError') + (result.message || '');
        }
    } catch (e) {
        changePassMsg.style.color = '#f87171';
        changePassMsg.textContent = t('errorNetwork');
    } finally {
        changePasswordBtn.disabled = false;
        changePasswordBtn.innerHTML = '<i class="fas fa-key"></i> ' + t('changePassBtn');
    }
});

function loadAllData() {
    loadTodos();
    loadNotes();
    loadAppointments();
    renderTools();
}

let deferredPrompt;
const installBanner = document.getElementById('installBanner');
const installBtn = document.getElementById('installBtn');
const closeInstallBanner = document.getElementById('closeInstallBanner');

const bannerClosed = localStorage.getItem('installBannerClosed') === 'true';

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (!bannerClosed) {
        installBanner.style.display = 'flex';
    }
});

installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const result = await deferredPrompt.userChoice;
        if (result.outcome === 'accepted') {
            installBanner.style.display = 'none';
        }
        deferredPrompt = null;
    }
});

closeInstallBanner.addEventListener('click', () => {
    installBanner.style.display = 'none';
    localStorage.setItem('installBannerClosed', 'true');
});

window.addEventListener('appinstalled', () => {
    installBanner.style.display = 'none';
    localStorage.setItem('installBannerClosed', 'true');
});

setTimeout(() => {
    if (installBanner.style.display === 'flex' && !deferredPrompt) {
        installBanner.style.display = 'none';
    }
}, 5000);
