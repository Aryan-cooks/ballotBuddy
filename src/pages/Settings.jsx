import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Lock, Save, AlertCircle, Loader2, Phone, Mail } from 'lucide-react';
import { supabase } from '../lib/supabase';
import './Profile.css';

const Settings = () => {
  const navigate = useNavigate();
  
  const [sessionUser, setSessionUser] = useState(null);
  const [profileData, setProfileData] = useState(null);
  
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  
  const [loadingSave, setLoadingSave] = useState(false);
  const [loadingPass, setLoadingPass] = useState(false);
  
  const [msgSave, setMsgSave] = useState({ text: '', type: '' });
  const [msgPass, setMsgPass] = useState({ text: '', type: '' });

  useEffect(() => {
    const fetchUserData = async () => {
      setPageLoading(true);
      setPageError(null);
      try {
        // STEP 1 - Fetch User
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          navigate('/login');
          return;
        }
        setSessionUser(user);
        
        // STEP 2 - Fetch Profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) throw profileError;
        if (!profile) {
          setPageError('Profile not found');
          return;
        }
        
        setProfileData(profile);
        
        // STEP 3 - Form State initialized ONLY after profile loads
        setUsername(profile.username || '');
        setPhone(profile.phone || '');
        
      } catch (err) {
        console.error("Settings load failed", err);
        setPageError("Error loading profile");
      } finally {
        setPageLoading(false);
      }
    };
    fetchUserData();
  }, [navigate]);

  // STEP 5 - Update Profile
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setLoadingSave(true);
    setMsgSave({ text: '', type: '' });
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          username: username.trim(),
          phone: phone.trim()
        })
        .eq('id', sessionUser.id);
        
      if (error) throw error;
      
      setMsgSave({ text: 'Profile updated', type: 'success' });
      setProfileData(prev => ({ ...prev, username: username.trim(), phone: phone.trim() }));
    } catch (err) {
      setMsgSave({ text: err.message || 'Update failed', type: 'error' });
    } finally {
      setLoadingSave(false);
    }
  };

  // STEP 6 - Change Password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setMsgPass({ text: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }
    
    setLoadingPass(true);
    setMsgPass({ text: '', type: '' });
    
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) throw error;
      
      setMsgPass({ text: 'Password updated successfully!', type: 'success' });
      setPassword('');
    } catch (err) {
      setMsgPass({ text: err.message, type: 'error' });
    } finally {
      setLoadingPass(false);
    }
  };

  // Handle States
  if (pageLoading) {
    return (
      <div className="profile-page" style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', alignItems: 'center', height: '100dvh' }}>
        <div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid var(--border-color)', borderTopColor: 'var(--primary-blue)', borderRadius: '50%' }} />
        <div>Loading settings...</div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="profile-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh', color: 'var(--error)' }}>
        {pageError}
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh', color: 'var(--error)' }}>
        Profile not found
      </div>
    );
  }

  const isProfileUnchanged = username.trim() === (profileData.username || '') && phone.trim() === (profileData.phone || '');

  // STEP 4 - UI
  return (
    <div className="profile-page">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ marginLeft: '24px', margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Settings</h2>
      </div>

      <h3 className="section-title">Account Details</h3>
      <div className="list-card mb-4" style={{ padding: '20px' }}>
        <form onSubmit={handleUpdateProfile}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Email (Read-only)</label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-color)', borderRadius: '12px', padding: '12px', border: '1px solid var(--border-color)', opacity: 0.7 }}>
              <Mail size={18} color="var(--text-muted)" style={{ marginRight: '12px' }} />
              <input 
                type="email" 
                value={sessionUser?.email || ''} 
                disabled
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', width: '100%', outline: 'none', fontSize: '1rem' }}
              />
            </div>
          </div>
          
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Username</label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-color)', borderRadius: '12px', padding: '12px', border: '1px solid var(--border-color)' }}>
              <User size={18} color="var(--text-muted)" style={{ marginRight: '12px' }} />
              <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                placeholder="Enter new username"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none', fontSize: '1rem' }}
              />
            </div>
          </div>
          
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Phone</label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-color)', borderRadius: '12px', padding: '12px', border: '1px solid var(--border-color)' }}>
              <Phone size={18} color="var(--text-muted)" style={{ marginRight: '12px' }} />
              <input 
                type="text" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="Enter phone number"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none', fontSize: '1rem' }}
              />
            </div>
          </div>
          
          {msgSave.text && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: msgSave.type === 'error' ? 'var(--error)' : 'var(--success)', fontSize: '0.85rem', marginBottom: '16px' }}>
              <AlertCircle size={14} /> <span>{msgSave.text}</span>
            </div>
          )}
          
          <button type="submit" disabled={loadingSave || isProfileUnchanged} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {loadingSave ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            Save Profile
          </button>
        </form>
      </div>

      <h3 className="section-title">Security</h3>
      <div className="list-card">
        <form onSubmit={handleUpdatePassword} style={{ padding: '20px' }}>
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>New Password</label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-color)', borderRadius: '12px', padding: '12px', border: '1px solid var(--border-color)' }}>
              <Lock size={18} color="var(--text-muted)" style={{ marginRight: '12px' }} />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter new password"
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', width: '100%', outline: 'none', fontSize: '1rem' }}
              />
            </div>
          </div>
          
          {msgPass.text && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: msgPass.type === 'error' ? 'var(--error)' : 'var(--success)', fontSize: '0.85rem', marginBottom: '16px' }}>
              <AlertCircle size={14} /> <span>{msgPass.text}</span>
            </div>
          )}
          
          <button type="submit" disabled={loadingPass || !password} className="btn-primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {loadingPass ? <Loader2 size={18} className="animate-spin" /> : <Lock size={18} />}
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
