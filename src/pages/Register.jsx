import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
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
      <div className="auth-top-bar">
        <Link to="/" className="auth-logo">
          <img src="/logo.png" alt="BallotBuddy" />
          <span className="notranslate">BallotBuddy</span>
        </Link>
        <div className="auth-actions">
          <Link to="/login">Log in</Link>
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