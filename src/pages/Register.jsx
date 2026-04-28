import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, AlertCircle, Sun, Moon } from 'lucide-react';
import './Register.css';

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const Register = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Layout states
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const emailValid = validateEmail(email);
  const usernameValid = username.trim().length > 2;
  const passwordValid = password.length >= 6;
  const formValid = emailValid && usernameValid && passwordValid;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formValid) {
      setError('Please fill all fields correctly (password min 6 characters)');
      return;
    }
    setError(null);
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setLoading(false);
    
    // Simulate auth logic
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userName', username);
    navigate('/');
  };

  const handleGoogleSignup = () => {
    // Simulate Google Signup
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userEmail', 'user@gmail.com');
    localStorage.setItem('userName', 'Google User');
    navigate('/');
  };

  return (
    <div className="auth-page">
      <div className="auth-top-bar" style={{ padding: '12px 16px' }}>
        <Link to="/" className="auth-logo" style={{ gap: '12px', display: 'flex', alignItems: 'center' }}>
          <div style={{ background: 'var(--surface-color)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <img 
              src="/logo.png" 
              alt="BallotBuddy Logo" 
              className="logo-light"
              style={{ width: '85%', height: '85%', objectFit: 'contain' }} 
            />
            <img 
              src="/logo_dark_mode.png" 
              alt="BallotBuddy Logo Dark" 
              className="logo-dark"
              style={{ width: '85%', height: '85%', objectFit: 'contain', display: 'none' }} 
            />
          </div>
          <span className="notranslate" style={{ fontSize: '1.5rem', margin: 0, fontWeight: 800, color: 'var(--primary-blue-dark)', letterSpacing: '-0.5px' }}>
            BallotBuddy
          </span>
        </Link>
        <div className="auth-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Link to="/login" style={{ marginRight: '8px', fontWeight: 600 }}>Log in</Link>

          <button 
            type="button"
            onClick={toggleDarkMode}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: darkMode ? 'var(--primary-blue)' : 'var(--surface-color)', color: darkMode ? 'white' : 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </div>

      <div className="auth-container">
        <h2 className="auth-title">Register</h2>
        
        <div className="auth-form-wrapper">
          <form onSubmit={handleRegister} className="auth-form">
            <div className="auth-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter full name"
                autoFocus
              />
            </div>

            <div className="auth-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
              />
            </div>

            <div className="auth-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
              />
            </div>

            {error && (
              <div className="auth-error">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={!formValid || loading}
              className="auth-btn"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Sign up'}
            </button>

            <div className="auth-divider" style={{ textAlign: 'center', margin: '20px 0', color: 'var(--text-secondary)', fontSize: '0.9rem', position: 'relative' }}>
              <span style={{ background: 'var(--surface-color)', padding: '0 10px', position: 'relative', zIndex: 1 }}>OR</span>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--border-color)', zIndex: 0 }}></div>
            </div>
            
            <button
              type="button"
              onClick={handleGoogleSignup}
              className="auth-btn secondary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'white', color: '#333', border: '1px solid #ddd' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;