/**
 * js/app.js — البوابة الرئيسية (FAROUK GRUP v7 — Supabase)
 * المصادقة: Supabase Auth | الاشتراك: RPC my_subscription | النصوص: ui_translations | الأدوات: جدول tools
 * لا توجد أي معادلة مالية في هذا الملف.
 */
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

const passwordField = document.getElementById('passwordInput');
const togglePasswordBtn = document.getElementById('togglePasswordBtn');
const eyeIcon = document.getElementById('eyeIcon');

togglePasswordBtn.addEventListener('click', function() {
    const isPassword = passwordField.type === 'password';
    passwordField.type = isPassword ? 'text' : 'password';
    eyeIcon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
});

// ============================================================
// تبديل اللغة (النصوص من قاعدة البيانات)
// ============================================================
function fillLangSelect(sel, withKeys) {
    if (!sel) return;
    sel.innerHTML = '';
    SUPPORTED_LANGS.forEach(function (l) {
        const o = document.createElement('option');
        o.value = l.code;
        o.textContent = l.name;
        sel.appendChild(o);
    });
    sel.value = currentLang;
}

async function applyLanguage(lang) {
    if (!SUPPORTED_LANGS.some(l => l.code === lang)) lang = 'ar';
    await loadPortalDict(lang);
    currentLang = lang;
    localStorage.setItem('appLanguage', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = langDir(lang);
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });
    fillLangSelect(document.getElementById('languageSelect'));
    fillLangSelect(document.getElementById('loginLangSelect'));
    updateUserLabel();
    document.title = t('headerTitle');
    updateSyncStatus();
    const guideLink = document.getElementById('guideLink');
    const surveyLink = document.getElementById('surveyLink');
    // الدليل والاستبيان صفحات ثابتة بثلاث لغات؛ أي لغة جديدة تعرض النسخة الإنجليزية
    if (guideLink) guideLink.href = lang === 'ar' ? 'guide.html' : (lang === 'tr' ? 'guidetr.html' : 'guideen.html');
    if (surveyLink) surveyLink.href = lang === 'ar' ? 'survey.html' : (lang === 'tr' ? 'surveytr.html' : 'surveyen.html');
    renderTools();
    document.documentElement.classList.remove('fg-loading');
}

function updateUserLabel() {
    const el = document.getElementById('userNameDisplay');
    if (!el) return;
    const savedName = localStorage.getItem('userName') || t('userLabel');
    const savedDays = localStorage.getItem('daysLeft') || '?';
    el.textContent = `${savedName} (${t('remaining')} ${savedDays} ${t('day')})`;
}

const loginLangSelect = document.getElementById('loginLangSelect');
if (loginLangSelect) {
    loginLangSelect.addEventListener('change', async function () {
        await applyLanguage(this.value);
        errorMsg.textContent = '';
    });
}

// ============================================================
// الجلسة والاشتراك — Supabase Auth + RPC my_subscription
// ============================================================
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;   // إعادة الدخول كل 24 ساعة كما في النسخة السابقة
const RENEW_URL = 'https://www.entervia.co/checkout/77';

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
function isSessionExpired() { return getRemainingSessionTime() <= 0; }

function clearLocalSession() {
    // V7.2: لا تبقى نسخة من مهام/ملاحظات المستخدم على جهاز مشترك بعد خروجه (إلا إن لم تُرفع بعد)
    try { if (WS.uid && !WS.dirty) localStorage.removeItem('fg_ws_' + WS.uid); } catch (e) {}
    ['userName', 'userEmail', 'daysLeft', 'loginTimestamp', 'currentUserEmail', 'fg_sub'].forEach(k => localStorage.removeItem(k));
}

async function forceLogout(reason, isSubscriptionExpired = false) {
    dashboard.classList.remove('show');
    if (logoutTimer) { clearTimeout(logoutTimer); logoutTimer = null; }
    await flushWorkspace();
    clearLocalSession();
    try { await sb.auth.signOut(); } catch (e) {}
    if (isSubscriptionExpired) {
        sessionExpiredTitle.textContent = t('sessionExpiredTitle') + ' (' + t('subExpiredTag') + ')';
        renewLinkBtn.style.display = 'inline-block';
    } else {
        sessionExpiredTitle.textContent = t('sessionExpiredTitle');
        renewLinkBtn.style.display = 'none';
    }
    sessionExpiredMsg.textContent = reason;
    loginOverlay.classList.remove('show');
    sessionExpiredOverlay.classList.add('show');
}

function startSessionTimer() {
    if (logoutTimer) clearTimeout(logoutTimer);
    const remaining = getRemainingSessionTime();
    if (remaining > 0) logoutTimer = setTimeout(() => forceLogout(t('sessionExpiredMsg'), false), remaining);
    else forceLogout(t('sessionExpiredMsg'), false);
}

function showLoginScreen() {
    loginOverlay.classList.add('show');
    dashboard.classList.remove('show');
    sessionExpiredOverlay.classList.remove('show');
    if (logoutTimer) clearTimeout(logoutTimer);
    usernameInput?.focus();
}

function showDashboard() {
    loginOverlay.classList.remove('show');
    sessionExpiredOverlay.classList.remove('show');
    dashboard.classList.add('show');
    updateUserLabel();
    startSessionTimer();
    loadAllData();
}

/** يقرأ الاشتراك من السيرفر ويحفظ الاسم/الأيام المتبقية */
async function fetchSubscription() {
    const { data, error } = await sb.rpc('my_subscription');
    if (error) throw error;
    if (data && data.status === 'active') {
        localStorage.setItem('userName', data.full_name || data.email || '');
        localStorage.setItem('userEmail', data.email || '');
        localStorage.setItem('currentUserEmail', data.email || '');
        localStorage.setItem('daysLeft', data.days_left);
        localStorage.setItem('fg_sub', JSON.stringify({ status: 'active', ts: Date.now() }));
    }
    return data || { status: 'none' };
}

async function signIn(email, pass) {
    let r = await sb.auth.signInWithPassword({ email, password: pass });
    if (!r.error) return { ok: true };
    // ترحيل تلقائي لمستخدمي Google Sheet القدامى عند أول دخول
    if (r.error.status === 400 || /invalid/i.test(r.error.message || '')) {
        const m = await sb.functions.invoke('legacy-login', { body: { email, password: pass } });
        const st = m.data && m.data.status;
        if (st === 'migrated') {
            r = await sb.auth.signInWithPassword({ email, password: pass });
            if (!r.error) return { ok: true };
        }
        if (st === 'weak') return { ok: false, reason: 'weak' };
        if (st === 'ratelimit') return { ok: false, reason: 'ratelimit' };
        return { ok: false, reason: 'invalid' };
    }
    if (r.error.status === 429) return { ok: false, reason: 'ratelimit' };
    throw r.error;
}

// ============================================================
// تسجيل الدخول (مع دعم frozen / expired)
// ============================================================
async function attemptLogin() {
    const user = usernameInput.value.trim().toLowerCase();
    const pass = passwordField.value.trim();

    if (!user || !pass) { errorMsg.textContent = t('errorEmpty'); return; }
    if (!user.includes('@') || !user.includes('.')) { errorMsg.textContent = t('errorEmail'); return; }

    loginBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> ' + t('verifying');
    loginBtn.disabled = true;
    errorMsg.innerHTML = '';

    try {
        const res = await signIn(user, pass);
        if (!res.ok) {
            errorMsg.innerHTML = res.reason === 'weak' ? t('weakLegacy') : res.reason === 'ratelimit' ? t('tooMany') : t('errorInvalid');
            return;
        }
        const sub = await fetchSubscription();
        if (sub.status === 'active') {
            localStorage.setItem('loginTimestamp', Date.now().toString());
            showDashboard();
        } else {
            await sb.auth.signOut();
            if (sub.status === 'expired') {
                errorMsg.innerHTML = escHtml(t('errorExpired')) + ' <a href="' + RENEW_URL + '" class="js-pay" data-pay="renew" style="color:#cfa776;">' + escHtml(t('here')) + '</a>';
            } else if (sub.status === 'pending') {
                errorMsg.textContent = t('errorPending');
            } else if (sub.status === 'frozen') {
                errorMsg.textContent = t('errorFrozen');
            } else {
                errorMsg.textContent = t('errorInvalid');
            }
        }
    } catch (error) {
        console.error(error);
        errorMsg.textContent = t('errorNetwork');
    } finally {
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> ' + t('loginBtn');
        loginBtn.disabled = false;
    }
}

async function initialSessionCheck() {
    const { data } = await sb.auth.getSession();
    if (!data || !data.session || isSessionExpired()) {
        if (data && data.session) { try { await sb.auth.signOut(); } catch (e) {} }
        clearLocalSession();
        showLoginScreen();
        return;
    }
    showDashboard();
    // تحقق من السيرفر بالخلفية (انتهاء/تجميد الاشتراك)
    try {
        const sub = await fetchSubscription();
        if (sub.status === 'expired') forceLogout(t('errorExpired'), true);
        else if (sub.status === 'pending') forceLogout(t('errorPending'), false);
        else if (sub.status === 'frozen') forceLogout(t('errorFrozen'), false);
        else if (sub.status !== 'active') forceLogout(t('sessionExpiredMsg'), false);
        else updateUserLabel();
    } catch (e) { /* نستمر بالجلسة المحلية عند انقطاع الشبكة */ }
}

loginBtn.addEventListener('click', attemptLogin);
passwordField.addEventListener('keypress', (e) => { if (e.key === 'Enter') attemptLogin(); });
usernameInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') passwordField.focus(); });

logoutBtn.addEventListener('click', async () => {
    if (logoutTimer) clearTimeout(logoutTimer);
    await flushWorkspace();
    clearLocalSession();
    try { await sb.auth.signOut(); } catch (e) {}
    showLoginScreen();
});

reloginBtn.addEventListener('click', () => {
    sessionExpiredOverlay.classList.remove('show');
    showLoginScreen();
});

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && dashboard.classList.contains('show') && isSessionExpired()) {
        forceLogout(t('sessionExpiredMsg'), false);
    }
});

window.addEventListener('load', async () => {
    try { await loadLanguages(); } catch (e) {}
    await applyLanguage(currentLang);
    initialSessionCheck();
    updateDateTime();
    setInterval(updateDateTime, 1000);
});

const dateSpan = document.getElementById('currentDate');
const timeSpan = document.getElementById('currentTime');

function updateDateTime() {
    const now = new Date();
    const locale = currentLang === 'ar' ? 'ar-EG' : currentLang === 'tr' ? 'tr-TR' : currentLang;
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
            if (b === 0) { alert(t('calcError'));
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

// ============================================================
// V7.2: المهام والملاحظات والمواعيد محفوظة في حساب المستخدم (جدول user_workspace)
// - صف واحد لكل مستخدم: قراءة واحدة عند فتح البوابة، وحفظ واحد (upsert) مؤجَّل 0.8 ثانية بعد آخر تعديل.
// - نسخة محلية لكل مستخدم تعمل دون اتصال وتُرفع تلقائياً عند عودة الشبكة.
// - أول دخول بعد التحديث: البيانات القديمة المحفوظة على الجهاز تُنقل إلى الحساب تلقائياً.
// - كل النصوص تُعرض كنص (escape) لمنع حقن HTML.
// ============================================================
function escHtml(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const todoInput = document.getElementById('todoInput');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoList = document.getElementById('todoList');
const pendingSpan = document.getElementById('pendingCount');
const totalSpan = document.getElementById('totalCount');
const notes = document.getElementById('notesArea');
const appTitle = document.getElementById('appTitle');
const appDate = document.getElementById('appDate');
const appDesc = document.getElementById('appDesc');
const appList = document.getElementById('appointmentsList');
let todos = [];
let apps = [];

const WS = { uid: null, timer: null, online: null, dirty: false, loaded: false };
function wsKey() { return 'fg_ws_' + (WS.uid || 'local'); }
function readJSON(k, d) { try { const v = JSON.parse(localStorage.getItem(k) || 'null'); return v == null ? d : v; } catch (e) { return d; } }
function normTodos(a) { return (Array.isArray(a) ? a : []).filter(x => x && typeof x.text === 'string').slice(0, 1000).map(x => ({ text: x.text.slice(0, 500), completed: !!x.completed })); }
function normApps(a) {
    return (Array.isArray(a) ? a : []).filter(x => x && typeof x.title === 'string' && typeof x.date === 'string').slice(0, 2000)
        .map(x => ({ title: x.title.slice(0, 300), date: x.date.slice(0, 10), desc: String(x.desc || '').slice(0, 2000) }));
}
function applyWS(d) {
    todos = normTodos(d && d.todos);
    apps = normApps(d && d.appointments);
    notes.value = String((d && d.notes) || '');
    renderTodos(); renderApps();
}
function cacheWS() {
    try { localStorage.setItem(wsKey(), JSON.stringify({ todos, notes: notes.value, appointments: apps, dirty: WS.dirty })); } catch (e) {}
}
function updateSyncStatus() {
    const el = document.getElementById('syncStatus');
    if (!el || WS.online === null) return;
    el.className = 'sync-status' + (WS.online ? '' : ' off');
    el.innerHTML = '<i class="fas ' + (WS.online ? 'fa-cloud' : 'fa-cloud-arrow-up') + '"></i> ' + escHtml(t(WS.online ? 'syncCloud' : 'syncOffline'));
}
async function pushWS() {
    clearTimeout(WS.timer); WS.timer = null;
    if (!WS.uid || !WS.loaded) return;
    const { error } = await sb.from('user_workspace')
        .upsert({ user_id: WS.uid, todos, notes: notes.value.slice(0, 200000), appointments: apps }, { onConflict: 'user_id' });
    WS.online = !error; WS.dirty = !!error;
    cacheWS(); updateSyncStatus();
}
function scheduleSave() {
    WS.dirty = true; cacheWS();
    clearTimeout(WS.timer);
    WS.timer = setTimeout(() => { pushWS().catch(() => { WS.online = false; updateSyncStatus(); }); }, 800);
}
async function flushWorkspace() {
    if (WS.timer || WS.dirty) { try { await pushWS(); } catch (e) {} }
}
async function loadWorkspace() {
    let uid = null;
    try { const { data } = await sb.auth.getSession(); uid = data && data.session && data.session.user ? data.session.user.id : null; } catch (e) {}
    WS.uid = uid; WS.loaded = false;
    // 1) عرض فوري من النسخة المحلية لهذا المستخدم (أو البيانات القديمة قبل V7.2)
    let local = readJSON(wsKey(), null);
    let legacy = false;
    if (!local) {
        const lt = readJSON('employeeTodos', []), la = readJSON('employeeAppointments', []), ln = localStorage.getItem('employeeNotes') || '';
        if (lt.length || la.length || ln) { local = { todos: lt, appointments: la, notes: ln }; legacy = true; }
    }
    applyWS(local || {});
    if (!uid) return;
    // 2) قراءة واحدة من قاعدة البيانات (الأعمدة المطلوبة فقط)
    const { data, error } = await sb.from('user_workspace').select('todos,notes,appointments').eq('user_id', uid).maybeSingle();
    if (error) { WS.online = false; WS.loaded = true; updateSyncStatus(); return; }
    WS.loaded = true; WS.online = true;
    if (local && local.dirty) {                 // تعديلات تمت دون اتصال ← ترفع الآن
        await pushWS();
    } else if (data) {
        applyWS(data); WS.dirty = false; cacheWS();
    } else if (local) {                         // أول مرة: نقل البيانات المحلية إلى الحساب
        await pushWS();
        if (legacy && !WS.dirty) ['employeeTodos', 'employeeAppointments', 'employeeNotes'].forEach(k => localStorage.removeItem(k));
    }
    updateSyncStatus();
}
window.addEventListener('online', () => { if (WS.dirty) pushWS().catch(() => {}); });
window.addEventListener('pagehide', () => { if (WS.timer || WS.dirty) pushWS().catch(() => {}); });

function renderTodos() {
    const pending = todos.filter(x => !x.completed).length;
    pendingSpan.textContent = pending;
    totalSpan.textContent = todos.length;
    todoList.innerHTML = todos.map((todo, idx) => `
        <div class="todo-item">
            <div class="todo-text">
                <input type="checkbox" ${todo.completed ? 'checked' : ''} data-index="${idx}">
                <span class="${todo.completed ? 'completed' : ''}">${escHtml(todo.text)}</span>
            </div>
            <span class="delete-btn delete-todo" data-index="${idx}"><i class="fas fa-trash-alt"></i></span>
        </div>`).join('');
}
todoList.addEventListener('change', function (e) {
    const cb = e.target.closest('input[type=checkbox]'); if (!cb) return;
    const i = +cb.dataset.index; if (!todos[i]) return;
    todos[i].completed = cb.checked; renderTodos(); scheduleSave();
});
todoList.addEventListener('click', function (e) {
    const btn = e.target.closest('.delete-todo'); if (!btn) return;
    if (confirm(t('confirmDelTask'))) { todos.splice(+btn.dataset.index, 1); renderTodos(); scheduleSave(); }
});
function addTodo() {
    const text = todoInput.value.trim();
    if (!text) return;
    todos.push({ text: text.slice(0, 500), completed: false });
    renderTodos(); scheduleSave();
    todoInput.value = '';
}
addTodoBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keypress', function (e) { if (e.key === 'Enter') addTodo(); });

let notesTimer = null;
notes.addEventListener('input', function () {        // حفظ تلقائي للملاحظات أثناء الكتابة
    clearTimeout(notesTimer);
    notesTimer = setTimeout(scheduleSave, 1200);
});
document.getElementById('saveLocal').addEventListener('click', async function () {
    clearTimeout(notesTimer);
    WS.dirty = true; cacheWS();
    try { await pushWS(); } catch (e) {}
    alert(t('notesSaved'));
});
document.getElementById('exportNotes').addEventListener('click', function () {
    const blob = new Blob([notes.value], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `notes_faroukgrup_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
});
document.getElementById('importNotes').addEventListener('click', function () {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = function (e) {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = function (ev) { notes.value = String(ev.target.result || '').slice(0, 200000); scheduleSave(); };
        reader.readAsText(file);
    };
    input.click();
});

function renderApps() {
    apps.sort((a, b) => a.date.localeCompare(b.date));   // الترتيب على المصفوفة نفسها فيبقى رقم الحذف صحيحاً
    const loc = currentLang === 'ar' ? 'ar-EG' : currentLang === 'tr' ? 'tr-TR' : currentLang;
    appList.innerHTML = apps.map((a, idx) => {
        const dt = new Date(a.date + 'T00:00:00');
        const d = isNaN(dt) ? escHtml(a.date) : dt.toLocaleDateString(loc, { day: 'numeric', month: 'short' });
        const descHtml = a.desc && a.desc.trim() ? `<div class="appointment-desc">📝 ${escHtml(a.desc)}</div>` : '';
        return `
        <div class="appointment-item">
            <div class="appointment-info">
                <span class="appointment-date">${d}</span>
                <span class="appointment-title">${escHtml(a.title)}</span>
                ${descHtml}
            </div>
            <span class="delete-btn delete-app" data-idx="${idx}"><i class="fas fa-trash-alt"></i></span>
        </div>`;
    }).join('');
}
appList.addEventListener('click', function (e) {
    const btn = e.target.closest('.delete-app'); if (!btn) return;
    if (confirm(t('confirmDelApp'))) { apps.splice(+btn.dataset.idx, 1); renderApps(); scheduleSave(); }
});
document.getElementById('addAppBtn').addEventListener('click', function () {
    if (!appTitle.value || !appDate.value) return alert(t('needTitleDate'));
    apps.push({ title: appTitle.value.slice(0, 300), date: appDate.value, desc: appDesc.value.slice(0, 2000) });
    renderApps(); scheduleSave();
    appTitle.value = '';
    appDate.value = '';
    appDesc.value = '';
});
document.getElementById('exportApps').addEventListener('click', function () {
    const q = v => '"' + String(v || '').replace(/"/g, '""') + '"';
    const lines = apps.map(a => [a.date, a.title, a.desc].map(q).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + t('csvHeader') + '\n' + lines], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `appointments_faroukgrup_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
});

// ============================================================
// V7.2: الاشتراك والتجديد داخل نافذة منبثقة (بوابة الدفع Entervia)
// ============================================================
const payOverlay = document.getElementById('payOverlay');
const payFrame = document.getElementById('payFrame');
const payLoading = document.getElementById('payLoading');
function openPay(kind) {
    const title = payOverlay.querySelector('#payTitle span');
    title.textContent = t(kind === 'new' ? 'payTitleNew' : 'payTitleRenew');
    document.getElementById('payClose').setAttribute('aria-label', t('close'));
    payLoading.style.display = 'flex';
    if (payFrame.getAttribute('src') !== RENEW_URL) payFrame.setAttribute('src', RENEW_URL); else payLoading.style.display = 'none';
    document.getElementById('payOpen').href = RENEW_URL;
    payOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
}
function closePay() { payOverlay.classList.remove('show'); document.body.style.overflow = ''; }
payFrame.addEventListener('load', () => { if (payFrame.getAttribute('src') !== 'about:blank') payLoading.style.display = 'none'; });
document.getElementById('payClose').addEventListener('click', closePay);
payOverlay.addEventListener('click', e => { if (e.target === payOverlay) closePay(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && payOverlay.classList.contains('show')) closePay(); });
document.addEventListener('click', function (e) {
    const a = e.target.closest('.js-pay'); if (!a) return;
    e.preventDefault();
    openPay(a.dataset.pay === 'new' ? 'new' : 'renew');
});

// ============================================================
// قائمة الأدوات من قاعدة البيانات (جدولا tool_categories و tools)
// صفحة واحدة لكل أداة؛ اللغة تُقرأ من appLanguage داخل الصفحة
// ============================================================
let toolCategories = [];
try { toolCategories = JSON.parse(localStorage.getItem('fg_tools') || '[]') || []; } catch (e) {}

async function loadToolCatalog() {
    const [cats, tools] = await Promise.all([
        sb.from('tool_categories').select('cat_key,icon,sort').order('sort'),
        sb.from('tools').select('tool_id,name_key,cat_key,icon,file,sort').eq('enabled', true).order('sort')
    ]);
    if (cats.error || tools.error) return;
    toolCategories = cats.data.map(c => ({
        nameKey: c.cat_key, icon: c.icon,
        tools: tools.data.filter(x => x.cat_key === c.cat_key).map(x => ({ nameKey: x.name_key, icon: x.icon, file: x.file }))
    })).filter(c => c.tools.length);
    localStorage.setItem('fg_tools', JSON.stringify(toolCategories));
    renderTools();
}

function renderTools() {
    const container = document.getElementById('toolsContainer');
    container.innerHTML = '';
    toolCategories.forEach(function(cat) {
        const catDiv = document.createElement('div');
        catDiv.className = 'tools-category';
        const titleDiv = document.createElement('div');
        titleDiv.className = 'category-title';
        titleDiv.innerHTML = `<i class="fas ${cat.icon}"></i> ${t(cat.nameKey)}`;
        catDiv.appendChild(titleDiv);
        const grid = document.createElement('div');
        grid.className = 'tools-grid';
        cat.tools.forEach(function(tool) {
            const card = document.createElement('div');
            card.className = 'tool-card';
            const filePath = 'tools/' + tool.file;
            card.onclick = function() { location.href = filePath; };
            card.innerHTML = `<i class="fas ${tool.icon}"></i><h4>${t(tool.nameKey)}</h4>`;
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
closeSettingsBtn.addEventListener('click', function() { settingsOverlay.classList.remove('show'); });
applyLanguageBtn.addEventListener('click', async function() {
    await applyLanguage(languageSelect.value);
    settingsOverlay.classList.remove('show');
});

// نافذة تغيير كلمة المرور المنبثقة
const changePassOverlay = document.getElementById('changePassOverlay');
document.getElementById('openChangePassBtn').addEventListener('click', function() {
    settingsOverlay.classList.remove('show');
    ['changeEmail','changeCurrentPass','changeNewPass','changeConfirmPass'].forEach(function(id){ document.getElementById(id).value = ''; });
    document.getElementById('changePassMsg').textContent = '';
    var ce = localStorage.getItem('currentUserEmail') || ''; if (ce) document.getElementById('changeEmail').value = ce;
    changePassOverlay.classList.add('show');
});
document.getElementById('closeChangePassBtn').addEventListener('click', function() { changePassOverlay.classList.remove('show'); });
changePassOverlay.addEventListener('click', function(e) { if (e.target === changePassOverlay) changePassOverlay.classList.remove('show'); });

// ============================================================
// تغيير كلمة المرور — تحقق من الحالية ثم sb.auth.updateUser
// ============================================================
const changeEmail = document.getElementById('changeEmail');
const changeCurrentPass = document.getElementById('changeCurrentPass');
const changeNewPass = document.getElementById('changeNewPass');
const changeConfirmPass = document.getElementById('changeConfirmPass');
const changePasswordBtn = document.getElementById('changePasswordBtn');
const changePassMsg = document.getElementById('changePassMsg');

changePasswordBtn.addEventListener('click', async function() {
    const email = changeEmail.value.trim().toLowerCase();
    const current = changeCurrentPass.value.trim();
    const newPass = changeNewPass.value.trim();
    const confirmPass = changeConfirmPass.value.trim();
    changePassMsg.style.color = '#f87171';

    const currentUserEmail = (localStorage.getItem('currentUserEmail') || '').toLowerCase();
    if (!currentUserEmail) { changePassMsg.textContent = t('changePassNotLoggedIn'); return; }
    if (email !== currentUserEmail) { changePassMsg.textContent = t('changePassWrongEmail'); return; }
    if (!email || !current || !newPass || !confirmPass) { changePassMsg.textContent = t('fillAll'); return; }
    if (newPass !== confirmPass) { changePassMsg.textContent = t('changePassMismatch'); return; }
    if (newPass.length < 6) { changePassMsg.textContent = t('newPassShort'); return; }

    changePasswordBtn.disabled = true;
    changePasswordBtn.innerHTML = '<i class="fas fa-spinner fa-pulse"></i> ' + t('processing');
    changePassMsg.textContent = '';
    try {
        const check = await sb.auth.signInWithPassword({ email, password: current });
        if (check.error) { changePassMsg.textContent = t('changePassError') + t('errorInvalid'); return; }
        const { error } = await sb.auth.updateUser({ password: newPass });
        if (error) { changePassMsg.textContent = t('changePassError') + (error.message || ''); return; }
        changePassMsg.style.color = '#4ade80';
        changePassMsg.textContent = t('changePassSuccess');
        changeEmail.value = ''; changeCurrentPass.value = ''; changeNewPass.value = ''; changeConfirmPass.value = '';
    } catch (e) {
        changePassMsg.textContent = t('errorNetwork');
    } finally {
        changePasswordBtn.disabled = false;
        changePasswordBtn.innerHTML = '<i class="fas fa-key"></i> ' + t('changePassBtn');
    }
});

function loadAllData() {
    loadWorkspace().catch(e => console.warn('[workspace]', e));
    renderTools();
    loadToolCatalog();
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