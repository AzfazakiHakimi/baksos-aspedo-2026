// --- KONFIGURASI FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyC2DIO1IrQwn_vNadYlwnI5oj4oe5W0IxM",
    authDomain: "aspedo-7753e.firebaseapp.com",
    databaseURL: "https://aspedo-7753e-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "aspedo-7753e",
    storageBucket: "aspedo-7753e.firebasestorage.app",
    messagingSenderId: "246861248788",
    appId: "1:246861248788:web:fa14df35f9e9e57ca3ea01"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// --- DATA ---
const PASSWORDS = { 'MC':'mc1', 'Konsum':'konsum1', 'Perkap':'perkap1', 'Band':'band1', 'PDD':'pdd1', 'ADMIN':'admin1' };
const ALL_DIVISIONS = ['MC', 'Konsum', 'Perkap', 'Band', 'PDD'];

// --- UI ELEMENTS ---
const ui = {
    views: {
        landing: document.getElementById('landing-view'),
        user: document.getElementById('user-view'),
        admin: document.getElementById('admin-view'),
        login: document.getElementById('login-modal')
    },
    login: {
        title: document.getElementById('login-title'),
        input: document.getElementById('password-input'),
        btn: document.getElementById('login-btn')
    },
    alert: {
        overlay: document.getElementById('custom-alert-overlay'),
        icon: document.getElementById('alert-icon'),
        title: document.getElementById('alert-title'),
        msg: document.getElementById('alert-msg'),
        actions: document.getElementById('alert-actions')
    },
    adminInput: document.getElementById('admin-input'),
    userMsg: document.getElementById('screen-message'),
    userBtn: document.getElementById('confirm-btn')
};

let currentTarget = null;
let currentDivision = null;

// --- CUSTOM ALERT SYSTEM ---
function showAlert(title, msg, icon='✨') {
    ui.alert.icon.innerText = icon;
    ui.alert.title.innerText = title;
    ui.alert.msg.innerText = msg;
    ui.alert.actions.innerHTML = `<button class="alert-btn btn-ok" onclick="closeAlert()">Oke</button>`;
    ui.alert.overlay.style.display = 'flex';
    setTimeout(() => ui.alert.overlay.classList.add('active'), 10);
}

function showConfirm(title, msg, onYes) {
    ui.alert.icon.innerText = '❓';
    ui.alert.title.innerText = title;
    ui.alert.msg.innerText = msg;
    ui.alert.actions.innerHTML = `
        <button class="alert-btn btn-cancel" onclick="closeAlert()">Batal</button>
        <button class="alert-btn btn-ok" id="confirm-yes-btn">Kirim</button>
    `;
    
    document.getElementById('confirm-yes-btn').onclick = () => {
        closeAlert();
        onYes();
    };

    ui.alert.overlay.style.display = 'flex';
    setTimeout(() => ui.alert.overlay.classList.add('active'), 10);
}

window.closeAlert = function() {
    ui.alert.overlay.classList.remove('active');
    setTimeout(() => ui.alert.overlay.style.display = 'none', 300);
}

// --- NAVIGATION ---
window.openLogin = function(target) {
    currentTarget = target;
    ui.login.title.innerText = target === 'ADMIN' ? 'Akses Admin' : target;
    ui.login.input.value = '';
    ui.views.login.classList.add('active');
    setTimeout(() => ui.login.input.focus(), 100);
}

window.closeLogin = function() {
    ui.views.login.classList.remove('active');
}

// --- LOGIN LOGIC ---
function attemptLogin() {
    const input = ui.login.input.value;
    if (PASSWORDS[currentTarget] && input === PASSWORDS[currentTarget]) {
        closeLogin();
        if (currentTarget === 'ADMIN') initAdmin();
        else initUser(currentTarget);
    } else {
        showAlert('Gagal', 'Kode akses salah!', '❌');
        ui.login.input.value = '';
    }
}

ui.login.btn.onclick = attemptLogin;
ui.login.input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') attemptLogin();
});

// --- ADMIN LOGIC ---
function initAdmin() {
    ui.views.landing.classList.remove('active');
    ui.views.admin.classList.add('active');

    document.querySelectorAll('.target-btn').forEach(btn => {
        btn.onclick = () => {
            const target = btn.getAttribute('data-target');
            const msg = ui.adminInput.value.trim();

            if (!msg) {
                showAlert('Kosong', 'Tulis pesan dulu!', '✍️');
                return;
            }

            if (target === 'ALL') {
                showConfirm('Broadcast', 'Kirim pesan ke SEMUA divisi?', () => {
                    ALL_DIVISIONS.forEach(div => sendToFirebase(div, msg));
                    showAlert('Sukses', 'Pesan terkirim ke semua!', '🚀');
                });
            } else {
                showConfirm('Konfirmasi', `Kirim ke ${target}?`, () => {
                    sendToFirebase(target, msg);
                    showAlert('Sukses', `Terkirim ke ${target}`, '✅');
                });
            }
        };
    });
}

function sendToFirebase(div, msg) {
    db.ref('divisions/' + div).set({
        message: msg,
        timestamp: Date.now(),
        status: 'active'
    });
}

window.clearInput = function() {
    ui.adminInput.value = '';
    ui.adminInput.focus();
}

// --- USER LOGIC ---
function initUser(div) {
    currentDivision = div;
    ui.views.landing.classList.remove('active');
    ui.views.user.classList.add('active');
    document.getElementById('user-division-name').innerText = div;

    db.ref('divisions/' + div).on('value', (snap) => {
        const data = snap.val();
        if (data && data.status === 'active' && data.message) {
            ui.views.user.className = 'view bg-red active';
            ui.userMsg.innerText = data.message;
            ui.userBtn.classList.remove('hidden');
            if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
        } else {
            ui.views.user.className = 'view bg-green active';
            ui.userMsg.innerText = '';
            ui.userBtn.classList.add('hidden');
        }
    });
}

ui.userBtn.onclick = () => {
    if (currentDivision) {
        db.ref('divisions/' + currentDivision).update({ status: 'confirmed', message: null });
    }
};