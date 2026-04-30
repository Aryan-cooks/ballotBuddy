import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, AlertCircle, Sun, Moon, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Login.css';

const validateEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const Login = () => {
  const navigate = useNavigate();
  const { signInWithEmail, signInWithGoogle, signInWithPhone, verifyPhoneOtp, user } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const isPhone = !identifier.includes('@') && identifier.trim().length >= 7 && /^[0-9+ \-]+$/.test(identifier);
  const isEmail = validateEmail(identifier);

  const { darkMode, toggleDarkMode } = useTheme();

  // If already logged in, redirect to home
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const formValid = otpSent ? otp.length === 6 : (isEmail ? password.length >= 6 : false);

  const handleGetOtp = async () => {
    if (!isPhone) {
      setError('Please enter a valid phone number (e.g., +919876543210)');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signInWithPhone(identifier);
      setOtpSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formValid) {
      if (otpSent) setError('Please enter the 6-digit OTP');
      else if (isEmail) setError('Password must be at least 6 characters');
      else setError('Please enter a valid email or phone number');
      return;
    }
    setError(null);
    setLoading(true);
    
    try {
      if (otpSent) {
        await verifyPhoneOtp(identifier, otp);
      } else {
        await signInWithEmail(identifier, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err) {
      setError(err.message || 'Google login failed. Please try again.');
    }
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
          <Link to="/signup" style={{ marginRight: '8px', fontWeight: 600 }}>Create an Account</Link>

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
        <h2 className="auth-title">Log in</h2>
        
        <div className="auth-form-wrapper">
          <form onSubmit={handleLogin} className="auth-form">
            <div className="auth-group">
              <label htmlFor="identifier">Email / Phone No.</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    setOtpSent(false);
                  }}
                  placeholder="Email or Phone (with +country code)"
                  autoFocus
                  style={{ paddingRight: isPhone && !otpSent ? '100px' : '14px' }}
                />
                {isPhone && !otpSent && (
                  <button
                    type="button"
                    onClick={handleGetOtp}
                    disabled={loading}
                    style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', padding: '6px 12px', background: 'var(--primary-blue)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    {loading ? '...' : 'Get OTP'}
                  </button>
                )}
              </div>
            </div>
            
            {!otpSent ? (
              <div className="auth-group">
                <label htmlFor="password">Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px', display: 'flex', alignItems: 'center' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-group">
                <label htmlFor="otp">Verification Code (OTP)</label>
                <input
                  id="otp"
                  type="text"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit OTP"
                />
              </div>
            )}

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
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Log in'}
            </button>
            
            <div className="auth-divider" style={{ textAlign: 'center', margin: '20px 0', color: 'var(--text-secondary)', fontSize: '0.9rem', position: 'relative' }}>
              <span style={{ background: 'var(--surface-color)', padding: '0 10px', position: 'relative', zIndex: 1 }}>OR</span>
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'var(--border-color)', zIndex: 0 }}></div>
            </div>
            
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="auth-btn secondary"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'white', color: '#333', border: '1px solid #ddd' }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Login with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;