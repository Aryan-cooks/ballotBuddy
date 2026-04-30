import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, XCircle, ShieldAlert, FileText, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import './Profile.css';

const VoterStatus = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    const fetchApplication = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          navigate('/login');
          return;
        }

        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "No rows found"
        if (data) setApplication(data);
      } catch (err) {
        console.error("Error fetching application", err);
        setErrorMsg("Error loading data");
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [navigate]);

  const getStatusIcon = (status) => {
    switch(status?.toLowerCase()) {
      case 'valid': case 'approved': return <CheckCircle size={20} />;
      case 'invalid': case 'rejected': return <XCircle size={20} />;
      default: return <Clock size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'valid': case 'approved': return 'var(--success)';
      case 'invalid': case 'rejected': return 'var(--error)';
      default: return '#f59e0b';
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
        <h2 style={{ marginLeft: '24px', margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>Voter Status</h2>
      </div>

      {!application ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--surface-color)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <ShieldAlert size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px auto', opacity: 0.5 }} />
          <h3 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>No Application Found</h3>
          <p style={{ margin: '0 0 24px 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>You haven't started your voter registration application yet.</p>
          <button 
            onClick={() => navigate('/register')}
            className="btn-primary" 
            style={{ width: '100%' }}
          >
            Start Registration
          </button>
        </div>
      ) : (
        <>
          <div style={{ background: 'var(--surface-color)', padding: '24px', borderRadius: '16px', border: '1px solid var(--border-color)', marginBottom: '24px', textAlign: 'center' }}>
            <div style={{ 
              width: '64px', height: '64px', borderRadius: '50%', 
              background: `${getStatusColor(application.status)}15`,
              color: getStatusColor(application.status),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px auto'
            }}>
              {getStatusIcon(application.status)}
            </div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', textTransform: 'capitalize' }}>
              {application.status || 'Pending Review'}
            </h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Reference ID: {application.reference_id || 'Generating...'}
            </p>
          </div>

          <h3 className="section-title">Application Details</h3>
          <div className="list-card">
            <div className="list-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', background: 'var(--bg-color)', borderRadius: '8px', color: 'var(--text-muted)' }}><FileText size={18} /></div>
                <div>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem' }}>Current Step</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{application.progress_step?.replace(/_/g, ' ') || 'Form 6 Submission'}</p>
                </div>
              </div>
            </div>
            <div className="list-item">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '8px', background: 'var(--bg-color)', borderRadius: '8px', color: 'var(--text-muted)' }}><Clock size={18} /></div>
                <div>
                  <h4 style={{ margin: '0 0 2px 0', fontSize: '0.95rem' }}>Last Updated</h4>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {new Date(application.updated_at || application.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default VoterStatus;
