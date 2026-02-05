const firebaseConfig = {
    apiKey: "AIzaSyC2DIO1IrQwn_vNadYlwnI5oj4oe5W0IxM",
    authDomain: "aspedo-7753e.firebaseapp.com",
    databaseURL: "https://aspedo-7753e-default-rtdb.asia-southeast1.firebasedatabase.app/",
    projectId: "aspedo-7753e",
    storageBucket: "aspedo-7753e.firebasestorage.app",
    messagingSenderId: "246861248788",
    appId: "1:246861248788:web:fa14df35f9e9e57ca3ea01"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const db = firebase.database();

const PASSWORDS = {
    'MC': 'mc1',
    'Konsum': 'konsum1',
    'Perkap': 'perkap1',
    'Band': 'band1',
    'PDD': 'pdd1',
    'ADMIN': 'admin1'
};

let currentTarget = null;
let currentDivision = null;

const views = {
    landing: document.getElementById('landing-view'),
    user: document.getElementById('user-view'),
    admin: document.getElementById('admin-view'),
    login: document.getElementById('login-modal')
};

const ui = {
    loginTitle: document.getElementById('login-title'),
    passInput: document.getElementById('password-input'),
    loginBtn: document.getElementById('login-btn'),
    userDivName: document.getElementById('user-division-name'),
    screenMsg: document.getElementById('screen-message'),
    confirmBtn: document.getElementById('confirm-btn'),
    adminInput: document.getElementById('admin-input'),
    targetBtns: document.querySelectorAll('.target-btn')
};

function switchView(viewName) {
    Object.values(views).forEach(el => {
        if(el) el.classList.remove('active');
    });

    if(views[viewName]) views[viewName].classList.add('active');
}

window.openLogin = function(target) {
    currentTarget = target;
    if(ui.loginTitle) ui.loginTitle.innerText = target === 'ADMIN' ? 'Login Admin' : `Login ${target}`;
    if(ui.passInput) ui.passInput.value = '';
    
    views.login.classList.add('active');
    setTimeout(() => {
        if(ui.passInput) ui.passInput.focus();
    }, 100);
}

window.closeLogin = function() {
    views.login.classList.remove('active');
}

if(ui.loginBtn) {
    ui.loginBtn.addEventListener('click', () => {
        const input = ui.passInput.value;
        
        if (PASSWORDS[currentTarget] && input === PASSWORDS[currentTarget]) {
            closeLogin();
            if (currentTarget === 'ADMIN') {
                initAdminPanel();
            } else {
                initUserPanel(currentTarget);
            }
        } else {
            alert('Kode akses salah!');
            ui.passInput.value = '';
        }
    });
}

function initAdminPanel() {
    switchView('admin');
    
    ui.targetBtns.forEach(btn => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.onclick = () => {
            const targetDiv = newBtn.getAttribute('data-target');
            const message = ui.adminInput.value.trim();

            if (!message) {
                alert('Tulis pesan instruksi terlebih dahulu.');
                return;
            }

            if (confirm(`Kirim pesan ke divisi ${targetDiv}?`)) {
                sendMessage(targetDiv, message);
            }
        };
    });
    
    ui.targetBtns = document.querySelectorAll('.target-btn');
}

function sendMessage(division, msg) {
    db.ref('divisions/' + division).set({
        message: msg,
        timestamp: Date.now(),
        status: 'active'
    }).then(() => {
        alert('Pesan terkirim ke ' + division);
    }).catch(err => {
        alert('Error: ' + err.message);
    });
}

window.clearInput = function() {
    if(ui.adminInput) {
        ui.adminInput.value = '';
        ui.adminInput.focus();
    }
}

function initUserPanel(division) {
    currentDivision = division;
    switchView('user');
    if(ui.userDivName) ui.userDivName.innerText = division;

    db.ref('divisions/' + division).on('value', (snapshot) => {
        const data = snapshot.val();
        
        if (data && data.status === 'active' && data.message) {
            setScreenRed(data.message);
        } else {
            setScreenGreen();
        }
    });
}

function setScreenRed(msg) {
    views.user.classList.remove('bg-green');
    views.user.classList.add('bg-red');
    if(ui.screenMsg) ui.screenMsg.innerText = msg;
    if(ui.confirmBtn) ui.confirmBtn.classList.remove('hidden');
    
    if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
}

function setScreenGreen() {
    views.user.classList.remove('bg-red');
    views.user.classList.add('bg-green');
    if(ui.screenMsg) ui.screenMsg.innerText = 'STANDBY';
    if(ui.confirmBtn) ui.confirmBtn.classList.add('hidden');
}

if(ui.confirmBtn) {
    ui.confirmBtn.addEventListener('click', () => {
        if (currentDivision) {
            db.ref('divisions/' + currentDivision).update({
                status: 'confirmed',
                message: null 
            });
        }
    });
}