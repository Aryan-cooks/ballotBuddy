import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Trophy, CheckCircle, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useProgress } from '../context/ProgressContext';
import { supabase } from '../lib/supabase';
import './Profile.css';

const Progress = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { democracyScore, modules } = useProgress();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          navigate('/login');
        }
      } catch (err) {
        console.error("Auth check failed", err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, [navigate]);

  if (loading) {
    return (
      <div className="profile-page" style={{ display: 'flex', flexDirection: 'column', gap: '16px', justifyContent: 'center', alignItems: 'center', height: '100dvh' }}>
        <div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid var(--border-color)', borderTopColor: 'var(--primary-blue)', borderRadius: '50%' }} />
        <div>Loading...</div>
      </div>
    );
  }

  const completedModules = modules ? modules.filter(m => m.status === 'completed').length : 0;
  const totalModules = modules ? modules.length : 1;
  const completionPercent = Math.round((completedModules / totalModules) * 100);

  return (
    <div className="profile-page">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
        <button className="back-btn" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h2 style={{ marginLeft: '24px', margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>My Progress</h2>
      </div>

      <div style={{ background: 'linear-gradient(135deg, var(--primary-blue), #2563eb)', padding: '24px', borderRadius: '16px', color: 'white', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <Activity size={100} style={{ position: 'absolute', right: '-10px', bottom: '-20px', opacity: 0.1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <Trophy size={24} color="#fcd34d" />
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Democracy Score</h3>
        </div>
        <div style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1 }}>
          {democracyScore} <span style={{ fontSize: '1rem', fontWeight: 500, opacity: 0.8 }}>pts</span>
        </div>
      </div>

      <h3 className="section-title">Course Completion</h3>
      <div className="list-card mb-4" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' }}>
          <div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem' }}>Modules Completed</h4>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>{completedModules} of {totalModules} modules finished</p>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-blue)' }}>
            {completionPercent}%
          </div>
        </div>
        
        <div style={{ height: '8px', background: 'var(--bg-color)', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${completionPercent}%`, background: 'var(--primary-blue)', borderRadius: '4px', transition: 'width 1s ease-out' }}></div>
        </div>
      </div>

      <h3 className="section-title">Module Status</h3>
      <div className="list-card">
        {modules?.map(module => (
          <div key={module.id} className="list-item">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ 
                width: '40px', height: '40px', borderRadius: '10px', 
                background: module.status === 'completed' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-color)',
                color: module.status === 'completed' ? 'var(--success)' : 'var(--text-muted)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {module.status === 'completed' ? <CheckCircle size={20} /> : <BookOpen size={20} />}
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', fontWeight: 600 }}>{module.title}</h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {module.status === 'completed' ? 'Completed' : module.status === 'unlocked' ? 'In Progress' : 'Locked'}
                </p>
              </div>
            </div>
            {module.status === 'completed' && <span style={{ fontWeight: 600, color: 'var(--success)', fontSize: '0.9rem' }}>+100 pts</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Progress;
