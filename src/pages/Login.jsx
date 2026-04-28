import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
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
      <div className="auth-top-bar">
        <Link to="/" className="auth-logo">
          <img src="/logo.png" alt="BallotBuddy" />
          <span className="notranslate">BallotBuddy</span>
        </Link>
        <div className="auth-actions">
          <Link to="/signup">Create an Account</Link>
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