import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, ShieldCheck, ChevronRight, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import './Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  
  const [submissions, setSubmissions] = useState([]);
  const [localProfile, setLocalProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          navigate('/login');
          return;
        }

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
          
        if (profileError) throw profileError;
        setLocalProfile(profileData);

        // Fetch ID submissions just for the verification badge
        const { data: subs, error: subError } = await supabase
          .from('id_submissions')
          .select('verification_status')
          .eq('user_id', user.id);
        
        if (subError) throw subError;
        if (subs) setSubmissions(subs);
      } catch (err) {
        console.error("Error fetching profile data", err);
        setErrorMsg("Error loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  let username = localProfile?.username || profile?.username || 'Voter';
  const displayIdentifier = localProfile?.email || localProfile?.phone || profile?.email || profile?.phone || 'No contact info';
  const initial = username.charAt(0).toUpperCase();

  const isVerified = submissions.some(s => s.verification_status === 'valid') || localProfile?.is_verified || profile?.is_verified;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (loading) return <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', alignItems: 'center', height: '100dvh' }}><div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid var(--border-color)', borderTopColor: 'var(--primary-blue)', borderRadius: '50%' }} /><div>Loading...</div></div>;
  if (errorMsg) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh', color: 'var(--error)' }}>{errorMsg}</div>;


  return (
    <div className="profile-page">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ marginLeft: '24px', margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>My Profile</h2>
      </div>

      <div style={{ background: 'var(--surface-color)', padding: '32px 24px', borderRadius: '24px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginTop: '20px' }}>
        <div className="profile-avatar-large" style={{ margin: '0 auto 16px auto', width: '96px', height: '96px', fontSize: '2.5rem' }}>
          {initial}
          {isVerified && (
            <div className="verified-badge" style={{ width: '28px', height: '28px', bottom: '2px', right: '2px' }}>
              <ShieldCheck size={18} color="var(--success)" fill="white" />
            </div>
          )}
        </div>
        
        <h1 style={{ margin: '0 0 8px 0', fontSize: '1.75rem', color: 'var(--text-primary)' }}>{username}</h1>
        
        {displayIdentifier && (
          <div className="profile-contact" style={{ justifyContent: 'center', fontSize: '1rem', marginBottom: '24px' }}>
            {displayIdentifier.includes('@') ? <Mail size={16} /> : <Phone size={16} />}
            <span>{displayIdentifier}</span>
          </div>
        )}

        <div style={{ width: '100%', height: '1px', background: 'var(--border-color)', margin: '16px 0 32px 0' }} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <button className="list-item" onClick={() => navigate('/settings')} style={{ width: '100%', background: 'var(--bg-color)', border: '1px solid var(--border-color)', cursor: 'pointer', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ color: 'var(--primary-blue)' }}><User size={20} /></div>
              <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Edit Profile Details</span>
            </div>
            <ChevronRight size={20} color="var(--text-muted)" />
          </button>
          
          <button className="list-item" onClick={handleSignOut} style={{ width: '100%', background: 'var(--bg-color)', border: '1px solid var(--border-color)', cursor: 'pointer', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ color: 'var(--error)' }}><LogOut size={20} /></div>
              <span style={{ fontWeight: 500, color: 'var(--error)' }}>Sign Out</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
