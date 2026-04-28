import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft, Sun, Moon } from 'lucide-react';
import './Login.css';

const formatPhone = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 0) return '';
  if (digits.length <= 5) return digits;
  return digits.slice(0, 5) + ' ' + digits.slice(5);
};

const validatePhone = (phone) => {
  const raw = phone.replace(/\s/g, '');
  return /^[6-9]\d{9}$/.test(raw);
};

const validateOTP = (otp) => /^\d{6}$/.test(otp);

const Login = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
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

  const phoneValid = validatePhone(phone);
  const otpValid = validateOTP(otp);

  const handleGetOTP = async (e) => {
    e.preventDefault();
    if (!phoneValid) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }
    setError(null);
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setLoading(false);
    setStep('otp');
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otpValid) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (otp === '123456' || otp === '000000') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userPhone', '+91 ' + phone.replace(/\s/g, ''));
      navigate('/');
    } else {
      setLoading(false);
      setError('Invalid OTP. Try 123456');
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
          {step === 'phone' ? (
            <form onSubmit={handleGetOTP} className="auth-form">
              <div className="auth-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="Enter 10-digit mobile"
                  autoFocus
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
                disabled={!phoneValid || loading}
                className="auth-btn"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Get OTP'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="auth-form">
              <div className="auth-message">
                OTP sent to <strong>+91 {phone.slice(0, 5)} {phone.slice(6)}</strong>
              </div>

              <div className="auth-group">
                <label htmlFor="otp">Enter 6-Digit OTP</label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="------"
                  maxLength={6}
                  style={{ textAlign: 'center', letterSpacing: '0.4em' }}
                  autoFocus
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
                disabled={!otpValid || loading}
                className="auth-btn"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify & Login'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('phone'); setOtp(''); setError(null); }}
                className="auth-btn secondary"
              >
                <ArrowLeft size={16} /> Change Details
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;