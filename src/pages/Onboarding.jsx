import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabase';
import './Login.css';

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, setProfile } = useAuth();
  const { darkMode } = useTheme();
  
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const usernameValid = username.trim().length > 2;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!usernameValid) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    
    setError(null);
    setLoading(true);

    try {
      const profileData = {
        id: user.id,
        email: user.email,
        username: username.trim(),
        phone: phone.trim() || null,
      };

      const { error: upsertError } = await supabase
        .from('profiles')
        .update({
          username: username.trim(),
          phone: phone.trim() || null,
        })
        .eq('id', user.id);

      if (upsertError) throw upsertError;

      // Update local profile state
      setProfile(profileData);
      
      // Navigate to dashboard
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to create profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-top-bar" style={{ padding: '12px 16px', justifyContent: 'center' }}>
        <div className="auth-logo" style={{ gap: '12px', display: 'flex', alignItems: 'center' }}>
          <div style={{ background: 'var(--surface-color)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <img src={darkMode ? "/logo_dark_mode.png" : "/logo.png"} alt="BallotBuddy Logo" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
          </div>
          <span className="notranslate" style={{ fontSize: '1.5rem', margin: 0, fontWeight: 800, color: 'var(--primary-blue-dark)', letterSpacing: '-0.5px' }}>
            BallotBuddy
          </span>
        </div>
      </div>

      <div className="auth-container">
        <h2 className="auth-title" style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Let's set up your profile</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '0.9rem' }}>
          Welcome! We just need a few details to complete your account.
        </p>
        
        <div className="auth-form-wrapper">
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-group">
              <label htmlFor="username">Username <span style={{ color: 'var(--error)' }}>*</span></label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                autoFocus
              />
            </div>

            <div className="auth-group">
              <label htmlFor="phone">Phone Number <span style={{ color: 'var(--text-muted)', fontSize: '0.8em', fontWeight: 'normal' }}>(Optional)</span></label>
              <input
                id="phone"
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+919876543210"
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
              disabled={!usernameValid || loading}
              className="auth-btn"
              style={{ marginTop: '12px' }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : 'Complete Setup'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
