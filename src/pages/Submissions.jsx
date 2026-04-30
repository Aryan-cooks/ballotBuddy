import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, XCircle, FileImage, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import './Profile.css';

const Submissions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          navigate('/login');
          return;
        }

        const { data, error } = await supabase
          .from('id_submissions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        if (data) setSubmissions(data);
      } catch (err) {
        console.error("Error fetching submissions", err);
        setErrorMsg("Error loading data");
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [navigate]);

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'valid': return <CheckCircle size={14} />;
      case 'invalid': return <XCircle size={14} />;
      default: return <Clock size={14} />;
    }
  };

  if (loading) {
    return (
      <div className="profile-page" style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', alignItems: 'center', height: '100dvh' }}>
        <div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid var(--border-color)', borderTopColor: 'var(--primary-blue)', borderRadius: '50%' }} />
        <div>Loading...</div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="profile-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100dvh', color: 'var(--error)' }}>
        {errorMsg}
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ marginLeft: '24px', margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>My Submissions</h2>
      </div>

      {submissions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--surface-color)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <FileImage size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>No ID Submissions</h3>
          <p style={{ margin: '0 0 24px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>You haven't uploaded any verification documents yet.</p>
        </div>
      ) : (
        <div className="list-card">
          {submissions.map(sub => (
            <div key={sub.id} className="list-item" style={{ flexDirection: 'column', alignItems: 'flex-start', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ padding: '10px', background: 'var(--bg-color)', borderRadius: '8px', color: 'var(--text-muted)' }}>
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem' }}>{sub.detected_type || 'Uploaded ID'}</h4>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(sub.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className={`status-badge ${sub.verification_status?.toLowerCase() || 'pending'}`}>
                  {getStatusIcon(sub.verification_status)}
                  <span style={{ textTransform: 'capitalize' }}>{sub.verification_status || 'Pending'}</span>
                </div>
              </div>

              {sub.image_url && (
                <div style={{ width: '100%', height: '160px', borderRadius: '12px', overflow: 'hidden', background: '#000' }}>
                  <img src={sub.image_url} alt="ID Submission" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Submissions;
