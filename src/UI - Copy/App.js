import React, { useState, useRef } from 'react';
import { Upload, Search, Brain, Database, FileText, LogOut, Settings, CheckCircle, XCircle, Loader2, Menu, X } from 'lucide-react';

const API_BASE_URL = 'http://localhost:5000';
const USERS_DB = { admin: 'admin123' };

// Main App Component
export default function HRPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (username) => {
    setCurrentUser(username);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {!isAuthenticated ? (
        <AuthScreen onLogin={handleLogin} />
      ) : (
        <MainApp user={currentUser} onLogout={handleLogout} />
      )}
    </div>
  );
}

// Authentication Screen
function AuthScreen({ onLogin }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [alert, setAlert] = useState(null);
  const [users, setUsers] = useState({ ...USERS_DB });

  const showAlert = (message, type) => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isLoginMode) {
      if (users[username] && users[username] === password) {
        showAlert('Login successful!', 'success');
        setTimeout(() => onLogin(username), 500);
      } else {
        showAlert('Invalid username or password', 'error');
      }
    } else {
      if (!username || !password) {
        showAlert('Please fill in all fields', 'error');
        return;
      }
      if (users[username]) {
        showAlert('Username already exists', 'error');
        return;
      }
      if (password !== confirmPassword) {
        showAlert('Passwords do not match', 'error');
        return;
      }
      if (password.length < 6) {
        showAlert('Password must be at least 6 characters', 'error');
        return;
      }

      setUsers({ ...users, [username]: password });
      showAlert('Account created! Please login.', 'success');
      setTimeout(() => {
        setIsLoginMode(true);
        setPassword('');
        setConfirmPassword('');
      }, 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 transform transition-all duration-500 hover:scale-[1.02]">
          {/* Logo/Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4 transform transition-transform hover:rotate-12">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {isLoginMode ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-blue-200">HR Document Intelligence Portal</p>
          </div>

          {/* Alert */}
          {alert && (
            <div className={`mb-6 p-4 rounded-xl backdrop-blur-sm flex items-center gap-3 transform transition-all duration-300 ${
              alert.type === 'success' 
                ? 'bg-green-500/20 border border-green-400/30 text-green-100' 
                : 'bg-red-500/20 border border-red-400/30 text-red-100'
            }`}>
              {alert.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              <span>{alert.message}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-100">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                placeholder="Enter your username"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-100">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                placeholder="Enter your password"
                required
              />
            </div>

            {!isLoginMode && (
              <div className="space-y-2 animate-fadeIn">
                <label className="text-sm font-medium text-blue-100">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-sm"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              {isLoginMode ? 'Sign In' : 'Create Account'}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setPassword('');
                setConfirmPassword('');
                setAlert(null);
              }}
              className="w-full py-3 px-6 bg-white/10 border border-white/20 text-white font-medium rounded-xl hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
            >
              {isLoginMode ? 'Create New Account' : 'Back to Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// Main Application
function MainApp({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('systemInfo');
  const [projectId, setProjectId] = useState(2);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs = [
    { id: 'systemInfo', label: 'System Info', icon: Settings },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'process', label: 'Process', icon: FileText },
    { id: 'updateIndex', label: 'Update Index', icon: Database },
    { id: 'indexStatus', label: 'Index Status', icon: Database },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'askAI', label: 'Ask AI', icon: Brain },
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center transform transition-transform hover:rotate-12">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-800 hidden sm:block">HR Portal</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logout Button */}
            <button
              onClick={onLogout}
              className="hidden lg:flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 space-y-2 animate-fadeIn">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
              <button
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Global Settings */}
        <div className="mb-8 backdrop-blur-xl bg-gradient-to-r from-blue-500/10 to-purple-600/10 border border-blue-200/50 rounded-2xl p-6 shadow-xl">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Settings className="w-6 h-6" />
            Global Settings
          </h2>
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-slate-700 mb-2">Project ID</label>
            <input
              type="number"
              value={projectId}
              onChange={(e) => setProjectId(parseInt(e.target.value))}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              min="1"
            />
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fadeIn">
          {activeTab === 'systemInfo' && <SystemInfoTab loading={loading} setLoading={setLoading} />}
          {activeTab === 'upload' && <UploadTab projectId={projectId} loading={loading} setLoading={setLoading} />}
          {activeTab === 'process' && <ProcessTab projectId={projectId} loading={loading} setLoading={setLoading} />}
          {activeTab === 'updateIndex' && <UpdateIndexTab projectId={projectId} loading={loading} setLoading={setLoading} />}
          {activeTab === 'indexStatus' && <IndexStatusTab projectId={projectId} loading={loading} setLoading={setLoading} />}
          {activeTab === 'search' && <SearchTab projectId={projectId} loading={loading} setLoading={setLoading} />}
          {activeTab === 'askAI' && <AskAITab projectId={projectId} loading={loading} setLoading={setLoading} />}
        </div>
      </main>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-slate-700 font-medium">Processing...</p>
          </div>
        </div>
      )}
    </div>
  );
}

// System Info Tab
function SystemInfoTab({ loading, setLoading }) {
  const [result, setResult] = useState(null);

  const fetchSystemInfo = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/`);
      const data = await response.json();
      setResult({ data, error: false });
    } catch (error) {
      setResult({ data: error.message, error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-xl bg-white/80 border border-slate-200 rounded-2xl p-8 shadow-xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Settings className="w-6 h-6 text-blue-500" />
        System Information
      </h2>
      <button
        onClick={fetchSystemInfo}
        disabled={loading}
        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Fetch API Status
      </button>
      {result && <ResultBox data={result.data} error={result.error} />}
    </div>
  );
}

// Upload Tab
function UploadTab({ projectId, loading, setLoading }) {
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = async (file) => {
    if (file.type !== 'application/pdf') {
      setResult({ data: 'Please select a PDF file', error: true });
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(`${API_BASE_URL}/api/v1/data/upload/${projectId}`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      setResult({ data, error: false });
    } catch (error) {
      setResult({ data: error.message, error: true });
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="backdrop-blur-xl bg-white/80 border border-slate-200 rounded-2xl p-8 shadow-xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Upload className="w-6 h-6 text-blue-500" />
        Upload PDF Documents
      </h2>
      
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-3 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
          dragActive
            ? 'border-blue-500 bg-blue-50 scale-105'
            : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
        }`}
      >
        <Upload className={`w-16 h-16 mx-auto mb-4 transition-colors ${dragActive ? 'text-blue-500' : 'text-slate-400'}`} />
        <p className="text-lg text-slate-600 mb-2">Drag & drop PDF files here</p>
        <p className="text-sm text-slate-400 mb-4">or click to browse</p>
        <button className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all">
          Browse Files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
          className="hidden"
        />
      </div>
      
      {result && <ResultBox data={result.data} error={result.error} />}
    </div>
  );
}

// Process Tab
function ProcessTab({ projectId, loading, setLoading }) {
  const [chunkSize, setChunkSize] = useState(500);
  const [overlapSize, setOverlapSize] = useState(50);
  const [resetMode, setResetMode] = useState('false');
  const [result, setResult] = useState(null);

  const processDocuments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/data/process/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chunk_size: chunkSize,
          overlap_size: overlapSize,
          do_reset: resetMode === 'true',
        }),
      });
      const data = await response.json();
      setResult({ data, error: false });
    } catch (error) {
      setResult({ data: error.message, error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-xl bg-white/80 border border-slate-200 rounded-2xl p-8 shadow-xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <FileText className="w-6 h-6 text-blue-500" />
        Process Documents
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Chunk Size</label>
          <input
            type="number"
            value={chunkSize}
            onChange={(e) => setChunkSize(parseInt(e.target.value))}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            min="100"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Overlap Size</label>
          <input
            type="number"
            value={overlapSize}
            onChange={(e) => setOverlapSize(parseInt(e.target.value))}
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            min="0"
          />
        </div>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Reset Mode</label>
        <select
          value={resetMode}
          onChange={(e) => setResetMode(e.target.value)}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="false">Keep Existing Data</option>
          <option value="true">Full Reset</option>
        </select>
      </div>

      <button
        onClick={processDocuments}
        disabled={loading}
        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Process Documents
      </button>
      
      {result && <ResultBox data={result.data} error={result.error} />}
    </div>
  );
}

// Update Index Tab
function UpdateIndexTab({ projectId, loading, setLoading }) {
  const [resetMode, setResetMode] = useState('false');
  const [result, setResult] = useState(null);

  const updateIndex = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/nlp/index/push/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ do_reset: resetMode === 'true' }),
      });
      const data = await response.json();
      setResult({ data, error: false });
    } catch (error) {
      setResult({ data: error.message, error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-xl bg-white/80 border border-slate-200 rounded-2xl p-8 shadow-xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Database className="w-6 h-6 text-blue-500" />
        Update Vector Index
      </h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Index Mode</label>
        <select
          value={resetMode}
          onChange={(e) => setResetMode(e.target.value)}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        >
          <option value="false">Incremental Update</option>
          <option value="true">Full Reset</option>
        </select>
      </div>

      <button
        onClick={updateIndex}
        disabled={loading}
        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Push to Index
      </button>
      
      {result && <ResultBox data={result.data} error={result.error} />}
    </div>
  );
}

// Index Status Tab
function IndexStatusTab({ projectId, loading, setLoading }) {
  const [result, setResult] = useState(null);

  const fetchIndexStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/nlp/index/info/${projectId}`);
      const data = await response.json();
      setResult({ data, error: false });
    } catch (error) {
      setResult({ data: error.message, error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-xl bg-white/80 border border-slate-200 rounded-2xl p-8 shadow-xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Database className="w-6 h-6 text-blue-500" />
        Vector Database Status
      </h2>
      
      <button
        onClick={fetchIndexStatus}
        disabled={loading}
        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Fetch Index Info
      </button>
      
      {result && <ResultBox data={result.data} error={result.error} />}
    </div>
  );
}

// Search Tab
function SearchTab({ projectId, loading, setLoading }) {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(5);
  const [result, setResult] = useState(null);

  const searchDocuments = async () => {
    if (!query.trim()) {
      setResult({ data: 'Please enter a search query', error: true });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/nlp/index/search/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query, limit }),
      });
      const data = await response.json();
      setResult({ data, error: false });
    } catch (error) {
      setResult({ data: error.message, error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-xl bg-white/80 border border-slate-200 rounded-2xl p-8 shadow-xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Search className="w-6 h-6 text-blue-500" />
        Search Documents
      </h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Search Query</label>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchDocuments()}
          placeholder="Enter your search query..."
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Result Limit</label>
        <input
          type="number"
          value={limit}
          onChange={(e) => setLimit(parseInt(e.target.value))}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          min="1"
          max="50"
        />
      </div>

      <button
        onClick={searchDocuments}
        disabled={loading}
        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Search
      </button>
      
      {result && <ResultBox data={result.data} error={result.error} />}
    </div>
  );
}

// Ask AI Tab
function AskAITab({ projectId, loading, setLoading }) {
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(5);
  const [result, setResult] = useState(null);

  const askAI = async () => {
    if (!query.trim()) {
      setResult({ data: 'Please enter a question', error: true });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/nlp/index/answer/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: query, limit }),
      });
      const data = await response.json();
      setResult({ data, error: false });
    } catch (error) {
      setResult({ data: error.message, error: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="backdrop-blur-xl bg-white/80 border border-slate-200 rounded-2xl p-8 shadow-xl">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Brain className="w-6 h-6 text-blue-500" />
        Ask AI Assistant
      </h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Your Question</label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question about your documents..."
          rows="4"
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">Context Limit</label>
        <input
          type="number"
          value={limit}
          onChange={(e) => setLimit(parseInt(e.target.value))}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          min="1"
          max="20"
        />
      </div>

      <button
        onClick={askAI}
        disabled={loading}
        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Ask AI
      </button>
      
      {result && <ResultBox data={result.data} error={result.error} />}
    </div>
  );
}

// Result Box Component
function ResultBox({ data, error }) {
  return (
    <div className={`mt-6 p-6 rounded-xl border-2 animate-fadeIn ${
      error 
        ? 'bg-red-50 border-red-200' 
        : 'bg-slate-50 border-slate-200'
    }`}>
      {error ? (
        <div className="flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-700 mb-1">Error</p>
            <p className="text-red-600">{typeof data === 'string' ? data : JSON.stringify(data)}</p>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1 overflow-auto">
            <p className="font-semibold text-slate-700 mb-2">Result</p>
            <pre className="text-sm text-slate-600 whitespace-pre-wrap break-words bg-white p-4 rounded-lg border border-slate-200">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}