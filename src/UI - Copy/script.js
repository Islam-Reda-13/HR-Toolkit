const BASE_URL = 'http://localhost:5000';

// --- AUTHENTICATION LOGIC ---

const STORAGE_KEY = 'hr_portal_users';

const DEFAULT_USERS = {
    "admin": "admin123",
    "hr_manager": "securePass!",
    "demo": "demo"
};

// Load users from browser storage, or use defaults if empty
let AUTHORIZED_USERS = JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_USERS;

// Initialize storage with defaults if this is the first run
if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(AUTHORIZED_USERS));
}

function toggleAuthMode() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const authTitle = document.getElementById('authTitle');
    const errorMsg = document.getElementById('authError');
    const successMsg = document.getElementById('authSuccess');

    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        authTitle.textContent = "HR Portal Login";
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        authTitle.textContent = "Create New Account";
    }

    errorMsg.style.display = 'none';
    successMsg.style.display = 'none';
}

function handleLogin(event) {
    event.preventDefault();
    
    const userField = document.getElementById('username');
    const passField = document.getElementById('password');
    const errorMsg = document.getElementById('authError');
    
    const username = userField.value.trim();
    const password = passField.value.trim();

    if (AUTHORIZED_USERS.hasOwnProperty(username) && AUTHORIZED_USERS[username] === password) {
        document.body.classList.remove('not-logged-in');
        passField.value = ''; 
        errorMsg.style.display = 'none';
    } else {
        errorMsg.textContent = "Invalid Username or Password";
        errorMsg.style.display = 'block';
        shakeCard();
    }
}

function handleSignup(event) {
    event.preventDefault();

    const userField = document.getElementById('newUsername');
    const passField = document.getElementById('newPassword');
    const confirmField = document.getElementById('confirmPassword');
    const errorMsg = document.getElementById('authError');
    const successMsg = document.getElementById('authSuccess');

    const username = userField.value.trim();
    const password = passField.value.trim();
    const confirm = confirmField.value.trim();

    if (AUTHORIZED_USERS.hasOwnProperty(username)) {
        errorMsg.textContent = "Username '" + username + "' is already taken.";
        errorMsg.style.display = 'block';
        shakeCard();
        return;
    }

    if (password.length < 3) {
        errorMsg.textContent = "Password must be at least 3 characters.";
        errorMsg.style.display = 'block';
        shakeCard();
        return;
    }

    if (password !== confirm) {
        errorMsg.textContent = "Passwords do not match.";
        errorMsg.style.display = 'block';
        shakeCard();
        return;
    }

    // Save to memory
    AUTHORIZED_USERS[username] = password;
    // Save to browser storage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(AUTHORIZED_USERS));
    
    errorMsg.style.display = 'none';
    successMsg.textContent = "Account created successfully! Logging you in...";
    successMsg.style.display = 'block';

    setTimeout(() => {
        document.body.classList.remove('not-logged-in');
        successMsg.style.display = 'none';
        
        userField.value = '';
        passField.value = '';
        confirmField.value = '';
        
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('signupForm').style.display = 'none';
        document.getElementById('authTitle').textContent = "HR Portal Login";
    }, 1500);
}

function shakeCard() {
    const card = document.querySelector('.login-card');
    card.style.transform = 'translateX(5px)';
    setTimeout(() => card.style.transform = 'translateX(0)', 100);
}

function handleLogout() {
    document.body.classList.add('not-logged-in');
    
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('authError').style.display = 'none';
    
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('authTitle').textContent = "HR Portal Login";

    // Try to reset to the info tab
    const infoTab = document.querySelector('[data-tab="info"]');
    if(infoTab) infoTab.click();
}

// --- TAB & APP LOGIC ---

// Re-attach tab listeners
document.querySelectorAll('.tab:not(.logout-btn)').forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        const content = document.getElementById(tabName);
        if(content) content.classList.add('active');
    });
});

function getProjectId() { return document.getElementById('globalProjectId').value || '2'; }

function showLoading(section) { 
    const loader = document.getElementById(`${section}-loading`);
    const resp = document.getElementById(`${section}-response`);
    if(loader) loader.classList.add('show'); 
    if(resp) resp.classList.remove('show'); 
}

function hideLoading(section) { 
    const loader = document.getElementById(`${section}-loading`);
    if(loader) loader.classList.remove('show'); 
}

function showResponse(section, content, isError = false) {
    const responseDiv = document.getElementById(`${section}-response`);
    if(!responseDiv) return;
    responseDiv.innerHTML = `<pre>${content}</pre>`;
    responseDiv.classList.remove('error', 'success');
    responseDiv.classList.add(isError ? 'error' : 'success', 'show');
}

function updateFileName(input) {
    const fileName = input.files[0]?.name || '';
    const label = document.getElementById('fileName');
    if(label) label.textContent = fileName ? `Selected: ${fileName}` : '';
}

// --- API FUNCTIONS ---

async function getSystemInfo() {
    showLoading('info');
    try {
        const response = await fetch(`${BASE_URL}/api/v1/`, { mode: 'cors', headers: { 'Accept': 'application/json' } });
        const data = await response.json();
        hideLoading('info'); 
        showResponse('info', JSON.stringify(data, null, 2));
    } catch (error) { 
        hideLoading('info'); 
        showResponse('info', `Error: ${error.message}\n\nMake sure the backend is running at ${BASE_URL}`, true); 
    }
}

async function uploadFile(event) {
    event.preventDefault(); 
    showLoading('upload');
    const projectId = getProjectId(); 
    const fileInput = document.getElementById('fileUpload');
    if (!fileInput.files[0]) { 
        hideLoading('upload'); 
        showResponse('upload', 'Please select a file first', true); 
        return; 
    }
    const formData = new FormData(); 
    formData.append('file', fileInput.files[0]);
    try {
        const response = await fetch(`${BASE_URL}/api/v1/data/upload/${projectId}`, { method: 'POST', body: formData });
        const data = await response.json();
        hideLoading('upload'); 
        showResponse('upload', JSON.stringify(data, null, 2), !response.ok);
        if (response.ok) { 
            fileInput.value = ''; 
            document.getElementById('fileName').textContent = ''; 
        }
    } catch (error) { 
        hideLoading('upload'); 
        showResponse('upload', `Error: ${error.message}`, true); 
    }
}

async function processFiles(event) {
    event.preventDefault(); 
    showLoading('process');
    const projectId = getProjectId(); 
    const fileId = document.getElementById('fileId').value;
    const chunkSize = parseInt(document.getElementById('chunkSize').value);
    const overlapSize = parseInt(document.getElementById('overlapSize').value);
    const doReset = parseInt(document.getElementById('doReset').value);
    
    const body = { chunk_size: chunkSize, overlap_size: overlapSize, do_reset: doReset };
    if (fileId) body.file_id = fileId;
    
    try {
        const response = await fetch(`${BASE_URL}/api/v1/data/process/${projectId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await response.json(); 
        hideLoading('process'); 
        showResponse('process', JSON.stringify(data, null, 2), !response.ok);
    } catch (error) { 
        hideLoading('process'); 
        showResponse('process', `Error: ${error.message}`, true); 
    }
}

async function pushToIndex(event) {
    event.preventDefault(); 
    showLoading('push');
    const projectId = getProjectId(); 
    const doReset = parseInt(document.getElementById('pushReset').value);
    try {
        const response = await fetch(`${BASE_URL}/api/v1/nlp/index/push/${projectId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ do_reset: doReset }) });
        const data = await response.json(); 
        hideLoading('push'); 
        showResponse('push', JSON.stringify(data, null, 2), !response.ok);
    } catch (error) { 
        hideLoading('push'); 
        showResponse('push', `Error: ${error.message}`, true); 
    }
}

async function getIndexInfo() {
    showLoading('index-info'); 
    const projectId = getProjectId();
    try {
        const response = await fetch(`${BASE_URL}/api/v1/nlp/index/info/${projectId}`);
        const data = await response.json(); 
        hideLoading('index-info'); 
        showResponse('index-info', JSON.stringify(data, null, 2));
    } catch (error) { 
        hideLoading('index-info'); 
        showResponse('index-info', `Error: ${error.message}`, true); 
    }
}

async function searchIndex(event) {
    event.preventDefault(); 
    showLoading('search');
    const projectId = getProjectId(); 
    const text = document.getElementById('searchText').value;
    const limit = parseInt(document.getElementById('searchLimit').value);
    try {
        const response = await fetch(`${BASE_URL}/api/v1/nlp/index/search/${projectId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, limit }) });
        const data = await response.json(); 
        hideLoading('search'); 
        showResponse('search', JSON.stringify(data, null, 2), !response.ok);
    } catch (error) { 
        hideLoading('search'); 
        showResponse('search', `Error: ${error.message}`, true); 
    }
}

async function askQuestion(event) {
    event.preventDefault(); 
    showLoading('answer');
    const projectId = getProjectId(); 
    const text = document.getElementById('questionText').value;
    const limit = parseInt(document.getElementById('answerLimit').value);
    try {
        const response = await fetch(`${BASE_URL}/api/v1/nlp/index/answer/${projectId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text, limit }) });
        const data = await response.json(); 
        hideLoading('answer'); 
        showResponse('answer', JSON.stringify(data, null, 2), !response.ok);
    } catch (error) { 
        hideLoading('answer'); 
        showResponse('answer', `Error: ${error.message}`, true); 
    }
}