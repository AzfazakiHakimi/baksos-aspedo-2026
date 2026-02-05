firebase.initializeApp(firebaseConfig);
const db = firebase.database();

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

let currentTarget = null;
let currentDivision = null;

function switchView(viewName) {
    Object.values(views).forEach(el => el.classList.remove('active'));
    views[viewName].classList.add('active');
}

function openLogin(target) {
    currentTarget = target;
    ui.loginTitle.innerText = target === 'ADMIN' ? 'Login Admin' : `Login ${target}`;
    ui.passInput.value = '';
    views.login.classList.add('active');
    ui.passInput.focus();
}

function closeLogin() {
    views.login.classList.remove('active');
}

ui.loginBtn.addEventListener('click', () => {
    const input = ui.passInput.value;
    if (SECRETS.passwords[currentTarget] && input === SECRETS.passwords[currentTarget]) {
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

function initAdminPanel() {
    switchView('admin');
    
    ui.targetBtns.forEach(btn => {
        btn.onclick = () => {
            const targetDiv = btn.getAttribute('data-target');
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
}

function sendMessage(division, msg) {
    db.ref('divisions/' + division).set({
        message: msg,
        timestamp: Date.now(),
        status: 'active'
    });
    alert('Pesan terkirim!');
}

function clearInput() {
    ui.adminInput.value = '';
    ui.adminInput.focus();
}

function initUserPanel(division) {
    currentDivision = division;
    switchView('user');
    ui.userDivName.innerText = division;

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
    ui.screenMsg.innerText = msg;
    ui.confirmBtn.classList.remove('hidden');
    
    if (navigator.vibrate) navigator.vibrate([500, 200, 500]);
}

function setScreenGreen() {
    views.user.classList.remove('bg-red');
    views.user.classList.add('bg-green');
    ui.screenMsg.innerText = 'STANDBY';
    ui.confirmBtn.classList.add('hidden');
}

ui.confirmBtn.addEventListener('click', () => {
    if (currentDivision) {
        db.ref('divisions/' + currentDivision).update({
            status: 'confirmed',
            message: null 
        });
    }
});