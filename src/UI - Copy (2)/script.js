const BASE_URL = 'http://localhost:5000';

// Track current upload mode
let currentUploadMode = 'file';

// --- AUTHENTICATION LOGIC ---

const STORAGE_KEY = 'hr_portal_users';

const DEFAULT_USERS = {
    "admin": "admin123",
    "hr_manager": "securePass!",
    "demo": "demo"
};

let AUTHORIZED_USERS = JSON.parse(localStorage.getItem(STORAGE_KEY)) || DEFAULT_USERS;

if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(AUTHORIZED_USERS));
}

function toggleAuthMode() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    const authTitle = document.getElementById('authTitle');
    const errorMsg = document.getElementById('authError');
    const successMsg = document.getElementById('authSuccess');
    const toggleText = document.getElementById('toggleText');
    const toggleBtn = document.getElementById('authToggleBtn');

    if (loginForm.style.display === 'none') {
        // Show Login
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        authTitle.textContent = "HR Portal Login";
        if(toggleText) toggleText.textContent = "Don't have an account?";
        if(toggleBtn) toggleBtn.textContent = "Sign Up";
    } else {
        // Show Signup
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        authTitle.textContent = "Create New Account";
        if(toggleText) toggleText.textContent = "Already have an account?";
        if(toggleBtn) toggleBtn.textContent = "Log In";
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
        
        // Auto-slide to the active tab
        const infoTab = document.querySelector('[data-tab="info"]');
        if (infoTab) {
            infoTab.click();
            setTimeout(() => moveSlider(infoTab), 50);
        }
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

    AUTHORIZED_USERS[username] = password;
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
        
        // Reset to login view
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('signupForm').style.display = 'none';
        document.getElementById('authTitle').textContent = "HR Portal Login";

        const infoTab = document.querySelector('[data-tab="info"]');
        if (infoTab) setTimeout(() => moveSlider(infoTab), 50);
    }, 1500);
}

// Improved shake animation from the design file
function shakeCard() {
    const card = document.querySelector('.login-card');
    if (card && card.animate) {
        card.animate([
            { transform: 'translateX(0)' },
            { transform: 'translateX(-5px)' },
            { transform: 'translateX(5px)' },
            { transform: 'translateX(0)' }
        ], {
            duration: 300,
            iterations: 1
        });
    }
}

function handleLogout() {
    document.body.classList.add('not-logged-in');
    
    const userField = document.getElementById('username');
    const passField = document.getElementById('password');
    if(userField) userField.value = '';
    if(passField) passField.value = '';
    
    document.getElementById('authError').style.display = 'none';
    
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
    document.getElementById('authTitle').textContent = "HR Portal Login";
}

// --- TAB & APP LOGIC ---

function moveSlider(activeTab) {
    if (!activeTab) return;
    
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) return;

    const tabOffsetLeft = activeTab.offsetLeft; 
    const tabWidth = activeTab.offsetWidth;
    
    // CSS variable update for the sliding pill
    navLinks.style.setProperty('--slider-left', `${tabOffsetLeft}px`);
    navLinks.style.setProperty('--slider-width', `${tabWidth}px`); 
}

const tabs = document.querySelectorAll('.tab:not(.logout-btn)');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const tabName = tab.dataset.tab;
        
        moveSlider(tab); 
        
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        tab.classList.add('active');
        const content = document.getElementById(tabName);
        if(content) content.classList.add('active');
    });
});

// Add resize listener to keep slider in place (from design file)
window.addEventListener("resize", () => {
    const activeTab = document.querySelector(".tab.active");
    if (activeTab && !document.body.classList.contains("not-logged-in")) {
      moveSlider(activeTab);
    }
});

window.addEventListener('DOMContentLoaded', () => {
    if (!document.body.classList.contains('not-logged-in')) {
        const activeTab = document.querySelector('.tab.active');
        setTimeout(() => moveSlider(activeTab), 50); 
    }
});

// --- UPLOAD MODE SWITCHING ---

function switchUploadMode(mode) {
    currentUploadMode = mode;
    
    // Update button states
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.mode === mode) {
            btn.classList.add('active');
        }
    });
    
    // Update file input attributes
    const fileInput = document.getElementById('fileUpload');
    const dropAreaTitle = document.getElementById('dropAreaTitle');
    const browseBtnText = document.getElementById('fileBrowseBtn'); // Updated ID
    const fileLimits = document.getElementById('fileLimits');
    
    if (mode === 'folder') {
        fileInput.setAttribute('webkitdirectory', '');
        fileInput.setAttribute('directory', '');
        fileInput.setAttribute('multiple', '');
        fileInput.removeAttribute('accept');
        dropAreaTitle.textContent = 'Drag & Drop Folder';
        if(browseBtnText) browseBtnText.textContent = 'Browse Folders';
        fileLimits.textContent = 'Select a folder containing PDF, TXT, MD files';
    } else {
        fileInput.removeAttribute('webkitdirectory');
        fileInput.removeAttribute('directory');
        fileInput.removeAttribute('multiple');
        fileInput.setAttribute('accept', '.pdf,.txt,.md');
        dropAreaTitle.textContent = 'Drag & Drop Single File';
        if(browseBtnText) browseBtnText.textContent = 'Browse';
        fileLimits.textContent = 'PDF, TXT, MD up to 10MB';
    }
    
    // Clear selection
    fileInput.value = '';
    const nameLabel = document.getElementById('fileName');
    if(nameLabel) nameLabel.textContent = '';
}

// Handle "Browse" button click
const browseBtn = document.getElementById("fileBrowseBtn");
const fileInput = document.getElementById("fileUpload");
if (browseBtn && fileInput) {
    browseBtn.addEventListener("click", () => fileInput.click());
}

function getProjectId() { return document.getElementById('globalProjectId').value || '2'; }

function showLoading(section) { 
    const loader = document.getElementById(`${section}-loading`);
    const resp = document.getElementById(`${section}-response`);
    if(loader) loader.classList.add('show'); 
    if(resp) {
        resp.classList.remove('show'); 
        resp.innerHTML = ''; // Clear previous results
    }
}

function hideLoading(section) { 
    const loader = document.getElementById(`${section}-loading`);
    if(loader) loader.classList.remove('show'); 
}

function updateFileName(input) {
    const files = input.files;
    const label = document.getElementById('fileName');
    
    if (!label) return;
    
    if (files.length === 0) {
        label.textContent = '';
        return;
    }
    
    if (currentUploadMode === 'folder') {
        // Show folder info
        const folderName = files[0].webkitRelativePath.split('/')[0] || 'Selected Folder';
        label.textContent = `Selected: ${folderName} (${files.length} files)`;
    } else {
        // Show single file name
        label.textContent = `Selected: ${files[0].name}`;
    }
}

// --- CUSTOM MARKDOWN RENDERER ---

function renderMarkdown(markdownText) {
    if (!markdownText) return '';
    let html = markdownText;
    
    // Convert headers: # Header -> <h1>Header</h1>
    html = html.replace(/^#\s+(.*$)/gim, '<h1>$1</h1>');
    html = html.replace(/^##\s+(.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^###\s+(.*$)/gim, '<h3>$1</h3>');

    // Convert bold text: **text** -> <strong>text</strong>
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

    // Convert horizontal rule: --- -> <hr>
    html = html.replace(/---\s*$/gim, '<hr>');

    // Convert double space at end of line to <br>
    html = html.replace(/  \n/g, '<br>');

    // Convert single newline to <br> (for simple content boxes)
    html = html.replace(/\n/g, '<br>');

    return html;
}

// --- RESPONSE FORMATTING HELPERS ---

function formatKey(key) {
    return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function formatDataToHtml(data) {
    if (!data) return '<p>No data returned.</p>';
    
    // --- 1. HANDLE VECTOR DB SEARCH RESULTS (NEW CUSTOM FORMAT) ---
    if (data.signal === 'vectordb_search_success' && Array.isArray(data.results)) {
        let html = '<div class="search-results-list">';
        html += `<h3>Vector Search Results (${data.results.length} results)</h3>`;
        
        data.results.forEach((result, index) => {
            const resultTextHtml = renderMarkdown(result.text || 'No text content');
            const score = result.score || 0;
            
            html += `
                <div class="search-result-item">
                    <div class="result-header">
                        <h4>Result #${index + 1}</h4>
                        <span class="result-score">Score: ${score.toFixed(4)}</span>
                    </div>
                    <div class="result-snippet">
                        ${resultTextHtml}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    // --- 2. Handle folder upload response ---
    if (data.uploaded_files && Array.isArray(data.uploaded_files)) {
        let html = '<div class="upload-results">';
        html += `<h3 style="color: var(--primary); margin-bottom: 16px;">✓ Upload Complete</h3>`;
        html += `<p style="margin-bottom: 16px;"><strong>Successfully uploaded:</strong> ${data.total_uploaded} files</p>`;
        
        if (data.uploaded_files.length > 0) {
            html += '<div class="file-list">';
            data.uploaded_files.forEach(file => {
                html += `
                    <div class="file-item">
                        <span class="file-name">${file.filename}</span>
                        <span class="file-id">ID: ${file.file_id}</span>
                    </div>`;
            });
            html += '</div>';
        }
        
        if (data.failed_files && data.failed_files.length > 0) {
            html += `<h4 style="color: #ef4444; margin-top: 24px; margin-bottom: 12px;">Failed uploads: ${data.total_failed}</h4>`;
            html += '<div class="file-list">';
            data.failed_files.forEach(file => {
                html += `
                    <div class="file-item error">
                        <span class="file-name">${file.filename}</span>
                        <span class="file-reason">${file.reason}</span>
                    </div>`;
            });
            html += '</div>';
        }
        
        html += '</div>';
        return html;
    }

    // --- 3. Handle AI Answers (Using marked.js if available, otherwise simple Markdown) ---
    if (data.answer) {
        try {
            // Use marked.parse if defined, fallback to simple custom renderMarkdown
            const answerHtml = (typeof marked !== 'undefined' && marked.parse) 
                ? marked.parse(String(data.answer)) 
                : renderMarkdown(String(data.answer));
            
            let html = `
                <div class="ai-answer-box">
                    <h3>AI Assistant Response</h3>
                    <div class="ai-answer-text">${answerHtml}</div>
                </div>`;
                
            if (data.sources) {
                // If sources are simple array of strings/objects, format it.
                html += `<h4>Sources Referenced:</h4>`;
                
                // Re-use standard logic for sources if they are just data points
                if (Array.isArray(data.sources)) {
                     html += formatDataToHtml(data.sources);
                } else {
                     html += `<pre>${JSON.stringify(data.sources, null, 2)}</pre>`;
                }
            }
            return html;
        } catch (err) {
            console.error('Answer markdown parsing error:', err);
            return `<div class="ai-answer-box">${renderMarkdown(String(data.answer))}</div>`;
        }
    }

    // --- 4. Handle HR Email response ---
    if (data.email) {
        try {
            const emailHtml = (typeof marked !== 'undefined' && marked.parse) 
                ? marked.parse(String(data.email)) 
                : renderMarkdown(String(data.email));
            
            return `
                <div class="ai-answer-box">
                    <h3>Generated Email</h3>
                    <div class="ai-answer-text">${emailHtml}</div>
                </div>`;
        } catch (err) {
            return `
                <div class="ai-answer-box">
                    <h3>Generated Email</h3>
                    <div class="ai-answer-text">${renderMarkdown(String(data.email))}</div>
                </div>`;
        }
    }

    // --- 5. Handle Web Scraping Summary ---
    if (data.summary) {
        try {
            const summaryHtml = (typeof marked !== 'undefined' && marked.parse) 
                ? marked.parse(String(data.summary)) 
                : renderMarkdown(String(data.summary));
            
            return `
                <div class="ai-answer-box">
                    <h3>Website Summary</h3>
                    <div class="ai-answer-text">${summaryHtml}</div>
                </div>`;
        } catch (err) {
            return `
                <div class="ai-answer-box">
                    <h3>Website Summary</h3>
                    <div class="ai-answer-text">${renderMarkdown(String(data.summary))}</div>
                </div>`;
        }
    }

    // --- 6. Handle Generic Arrays ---
    if (Array.isArray(data)) {
        if (data.length === 0) return '<p>No results found.</p>';
        
        if (typeof data[0] === 'string') {
            return `<ul style="padding-left: 20px; margin-bottom: 20px;">${data.map(item => `<li>${item}</li>`).join('')}</ul>`;
        }

        // Original generic search result handler (less preferred than the custom one above)
        if (data[0].text || data[0].score || data[0].content) {
            return data.map(item => `
                <div class="result-card">
                    ${item.score ? `<div class="result-score">Similarity: ${(item.score * 100).toFixed(1)}%</div>` : ''}
                    <div class="result-text">${item.text || item.content || 'No text content'}</div>
                    <div class="result-meta">
                        ${Object.entries(item)
                            .filter(([k]) => !['text', 'score', 'content'].includes(k))
                            .map(([k, v]) => `<span><strong>${formatKey(k)}:</strong> ${v}</span>`)
                            .join('')}
                    </div>
                </div>
            `).join('');
        }
        
        return `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    }

    // --- 7. Handle Simple Objects ---
    if (typeof data === 'object' && data !== null) {
        // Recursively handle nested results array if not caught by signal check
        if (data.results && Array.isArray(data.results)) return formatDataToHtml({ ...data, signal: 'vectordb_search_success' }); // Trick to force custom format

        const rows = Object.entries(data).map(([key, value]) => {
            let displayValue = value;
            if (typeof value === 'object' && value !== null) {
                displayValue = `<code style="font-size:0.8em">${JSON.stringify(value)}</code>`;
            }
            return `
                <tr>
                    <th>${formatKey(key)}</th>
                    <td>${displayValue}</td>
                </tr>
            `;
        }).join('');

        return `<table class="kv-table"><tbody>${rows}</tbody></table>`;
    }

    return `<p>${data}</p>`;
}

function showResponse(section, data, isError = false) {
    const responseDiv = document.getElementById(`${section}-response`);
    if(!responseDiv) return;

    responseDiv.classList.remove('error', 'success');
    responseDiv.classList.add(isError ? 'error' : 'success', 'show');

    if (isError) {
        const errorText = typeof data === 'string' ? data : (data.error || data.message || JSON.stringify(data));
        responseDiv.innerHTML = `<strong>Error:</strong> ${errorText}`;
    } else {
        const prettyHtml = formatDataToHtml(data);
        const jsonContent = JSON.stringify(data, null, 2);

        responseDiv.innerHTML = `
            <div class="formatted-view">
                ${prettyHtml}
            </div>
            <details class="raw-json-details">
                <summary>View Raw JSON Response</summary>
                <pre>${jsonContent}</pre>
            </details>
        `;
    }
}

// --- API FUNCTIONS ---

async function getSystemInfo() {
    showLoading('info');
    try {
        const response = await fetch(`${BASE_URL}/api/v1/`, { mode: 'cors', headers: { 'Accept': 'application/json' } });
        const data = await response.json();
        hideLoading('info'); 
        showResponse('info', data);
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
    
    if (!fileInput.files || fileInput.files.length === 0) { 
        hideLoading('upload'); 
        showResponse('upload', 'Please select a file or folder first', true); 
        return; 
    }
    
    const formData = new FormData();
    
    if (currentUploadMode === 'folder') {
        // Multiple files from folder
        for (let i = 0; i < fileInput.files.length; i++) {
            const file = fileInput.files[i];
            // Append with webkitRelativePath to preserve folder structure
            formData.append('files', file, file.webkitRelativePath || file.name);
        }
        
        try {
            const response = await fetch(`${BASE_URL}/api/v1/data/upload-folder/${projectId}`, { 
                method: 'POST', 
                body: formData 
            });
            const data = await response.json();
            hideLoading('upload'); 
            showResponse('upload', data, !response.ok);
            if (response.ok) { 
                fileInput.value = ''; 
                document.getElementById('fileName').textContent = ''; 
            }
        } catch (error) { 
            hideLoading('upload'); 
            showResponse('upload', `Error: ${error.message}`, true); 
        }
    } else {
        // Single file upload
        formData.append('file', fileInput.files[0]);
        
        try {
            const response = await fetch(`${BASE_URL}/api/v1/data/upload/${projectId}`, { 
                method: 'POST', 
                body: formData 
            });
            const data = await response.json();
            hideLoading('upload'); 
            showResponse('upload', data, !response.ok);
            if (response.ok) { 
                fileInput.value = ''; 
                document.getElementById('fileName').textContent = ''; 
            }
        } catch (error) { 
            hideLoading('upload'); 
            showResponse('upload', `Error: ${error.message}`, true); 
        }
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
        showResponse('process', data, !response.ok);
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
        showResponse('push', data, !response.ok);
    } catch (error) { 
        hideLoading('push'); 
        showResponse('push', `Error: ${error.message}`, true); 
    }
}

async function getIndexInfo() {
    showLoading('index-info-loading'); // Matches ID in HTML
    const projectId = getProjectId();
    try {
        const response = await fetch(`${BASE_URL}/api/v1/nlp/index/info/${projectId}`);
        const data = await response.json(); 
        hideLoading('index-info-loading'); 
        showResponse('index-info', data);
    } catch (error) { 
        hideLoading('index-info-loading'); 
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
        // NOTE: The showResponse function now handles the special 'vectordb_search_success' signal
        showResponse('search', data, !response.ok); 
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
        showResponse('answer', data, !response.ok);
    } catch (error) { 
        hideLoading('answer'); 
        showResponse('answer', `Error: ${error.message}`, true); 
    }
}

async function generateHREmail(event) {
    event.preventDefault();
    showLoading('hr-email');
    
    const emailType = document.getElementById('emailType').value;
    const recipientName = document.getElementById('recipientName').value;
    const context = document.getElementById('emailContext').value;
    const tone = document.getElementById('emailTone').value;
    
    try {
        const response = await fetch(`${BASE_URL}/api/v1/hr-email/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email_type: emailType,
                recipient_name: recipientName,
                context: context,
                tone: tone
            })
        });
        const data = await response.json();
        hideLoading('hr-email');
        showResponse('hr-email', data, !response.ok);
    } catch (error) {
        hideLoading('hr-email');
        showResponse('hr-email', `Error: ${error.message}`, true);
    }
}

async function summarizeWebsite(event) {
    event.preventDefault();
    showLoading('web-scraping');
    
    const companyName = document.getElementById('companyName').value;
    const url = document.getElementById('websiteUrl').value;
    
    try {
        const response = await fetch(`${BASE_URL}/api/v1/web-scraping/summarize`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                company_name: companyName,
                url: url
            })
        });
        const data = await response.json();
        hideLoading('web-scraping');
        showResponse('web-scraping', data, !response.ok);
    } catch (error) {
        hideLoading('web-scraping');
        showResponse('web-scraping', `Error: ${error.message}`, true);
    }
}