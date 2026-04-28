import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft, Sun, Moon } from 'lucide-react';
import './Register.css';

const formatPhone = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 0) return '';
  if (digits.length <= 5) return digits;
  return digits.slice(0, 5) + ' ' + digits.slice(5);
};

const formatAadhar = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 12);
  const groups = digits.match(/.{1,4}/g);
  return groups ? groups.join(' ') : digits;
};

const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone.replace(/\s/g, ''));
const validateAadhar = (aadhar) => aadhar.replace(/\s/g, '').length === 12;
const validateOTP = (otp) => /^\d{6}$/.test(otp);

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('details'); // details, verify
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhar, setAadhar] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [aadharOtp, setAadharOtp] = useState('');
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
  const aadharValid = validateAadhar(aadhar);
  const nameValid = name.trim().length > 2;

  const phoneOtpValid = validateOTP(phoneOtp);
  const aadharOtpValid = validateOTP(aadharOtp);

  const handleGetOTP = async (e) => {
    e.preventDefault();
    if (!nameValid || !phoneValid || !aadharValid) {
      setError('Please fill all fields correctly');
      return;
    }
    setError(null);
    setLoading(true);
    
    // Simulate API call to send OTPs
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    setLoading(false);
    setStep('verify');
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!phoneOtpValid || !aadharOtpValid) {
      setError('Please enter valid 6-digit OTPs for both');
      return;
    }
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if ((phoneOtp === '123456' || phoneOtp === '000000') && (aadharOtp === '123456' || aadharOtp === '000000')) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userPhone', '+91 ' + phone.replace(/\s/g, ''));
      navigate('/');
    } else {
      setLoading(false);
      setError('Invalid OTPs. Try 123456');
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
          {step === 'details' ? (
            <form onSubmit={handleGetOTP} className="auth-form">
              <div className="auth-group">
                <label htmlFor="name">Name (As per Aadhar)</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                  autoFocus
                />
              </div>

              <div className="auth-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="Enter 10-digit mobile"
                />
              </div>

              <div className="auth-group">
                <label htmlFor="aadhar">Aadhar Number</label>
                <input
                  id="aadhar"
                  type="tel"
                  value={aadhar}
                  onChange={(e) => setAadhar(formatAadhar(e.target.value))}
                  placeholder="0000 0000 0000"
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
                disabled={!nameValid || !phoneValid || !aadharValid || loading}
                className="auth-btn"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Get OTPs'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="auth-form">
              <div className="auth-message">
                OTPs have been sent to your phone and Aadhar linked number.
              </div>

              <div className="auth-group">
                <label htmlFor="phoneOtp">Phone OTP (+91 {phone.slice(0, 5)} {phone.slice(6)})</label>
                <input
                  id="phoneOtp"
                  type="text"
                  value={phoneOtp}
                  onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="------"
                  maxLength={6}
                  style={{ textAlign: 'center', letterSpacing: '0.4em' }}
                  autoFocus
                />
              </div>

              <div className="auth-group">
                <label htmlFor="aadharOtp">Aadhar OTP</label>
                <input
                  id="aadharOtp"
                  type="text"
                  value={aadharOtp}
                  onChange={(e) => setAadharOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="------"
                  maxLength={6}
                  style={{ textAlign: 'center', letterSpacing: '0.4em' }}
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
                disabled={!phoneOtpValid || !aadharOtpValid || loading}
                className="auth-btn"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Verify & Register'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('details'); setPhoneOtp(''); setAadharOtp(''); setError(null); }}
                className="auth-btn secondary"
              >
                <ArrowLeft size={16} /> Edit Details
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;