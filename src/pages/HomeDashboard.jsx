import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Award, Flame, BookOpen, Vote, ShieldCheck, FileText, Landmark, Clock, MapPin, Newspaper } from 'lucide-react';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';
import { useProgress } from '../context/ProgressContext';
import './HomeDashboard.css';

const HomeDashboard = () => {
  const navigate = useNavigate();
  const { democracyScore, modules } = useProgress();
  
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('voterProfile');
    return saved ? JSON.parse(saved) : null;
  });
  const [showModal, setShowModal] = useState(!profile);
  const [zipcode, setZipcode] = useState('');

  const [isLocating, setIsLocating] = useState(false);
  const [zipError, setZipError] = useState('');

  const handleSaveProfile = async () => {
    if (!/^\d{6}$/.test(zipcode)) {
      setZipError('Please enter a valid 6-digit Indian PIN code.');
      return;
    }
    
    setIsLocating(true);
    setZipError('');
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${zipcode}`);
      const data = await response.json();
      
      if (data && data[0].Status === "Success") {
        const stateName = data[0].PostOffice[0].State;
        const newProfile = { zipcode, state: stateName, nextElection: "Upcoming" };
        localStorage.setItem('voterProfile', JSON.stringify(newProfile));
        setProfile(newProfile);
        setShowModal(false);
      } else {
        setZipError('Invalid PIN code. Could not find location.');
      }
    } catch (err) {
      // Fallback if API fails
      const newProfile = { zipcode, state: "Delhi", nextElection: "Upcoming" };
      localStorage.setItem('voterProfile', JSON.stringify(newProfile));
      setProfile(newProfile);
      setShowModal(false);
    } finally {
      setIsLocating(false);
    }
  };

  // Determine the Next CTA based on module progress
  const nextModule = modules.find(m => m.status !== 'completed') || modules[modules.length - 1];
  const isRegistrationPending = modules[0].status !== 'completed';
  const overallProgress = modules ? Math.round(modules.reduce((acc, mod) => acc + mod.progress, 0) / modules.length) : 0;

  return (
    <div className="container mt-2 mb-2 animate-slide-up" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', paddingBottom: '10px', position: 'relative' }}>
      
      {showModal && (
        <div className="modal-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.95)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-lg)' }}>
          <Card style={{ padding: 'var(--space-6)', width: '90%', maxWidth: '400px', boxShadow: 'var(--shadow-lg)' }}>
            <h3 className="mb-2">Welcome to <span className="notranslate">BallotBuddy</span>!</h3>
            <p className="text-sm text-muted mb-4">Enter your 6-digit PIN code to personalize your election timeline.</p>
            <input 
              type="text" 
              placeholder="e.g. 110001" 
              value={zipcode}
              onChange={(e) => {
                setZipcode(e.target.value.replace(/\D/g, '').slice(0, 6));
                setZipError('');
              }}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '4px' }}
            />
            {zipError && <p style={{ color: 'var(--error)', fontSize: '0.8rem', margin: '0 0 12px 0' }}>{zipError}</p>}
            <Button fullWidth onClick={handleSaveProfile} disabled={zipcode.length !== 6 || isLocating} style={{ marginTop: zipError ? 0 : '12px' }}>
              {isLocating ? 'Locating...' : 'Personalize My App'}
            </Button>
          </Card>
        </div>
      )}

      {/* App Branding & Intro */}
      <div className="branding-section mt-2">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ background: 'var(--surface-color)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-md)', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
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
            <span className="notranslate" style={{ fontSize: '1.9rem', margin: 0, fontWeight: 800, color: 'var(--primary-blue-dark)', letterSpacing: '-0.5px', display: 'inline-block' }}>
              BallotBuddy
            </span>
        </div>
        <p className="text-muted text-sm" style={{ fontWeight: 500, lineHeight: 1.4, maxWidth: '380px' }}>
          Your smart companion for a confident democratic journey. Learn, verify, and vote!
        </p>
      </div>

      {/* Dynamic Personalization & Democracy Score */}
      <header className="dashboard-header" style={{ alignItems: 'flex-start' }}>
        <div className="profile-section" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
          {profile ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--primary-blue-dark)', fontWeight: 700 }}>
                <Clock size={16} /> <span>195 Days Until Election</span>
              </div>
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '2px' }}
                onClick={() => setShowModal(true)}
              >
                <MapPin size={14} /> <span>{profile.state} General Election</span>
              </div>
            </>
          ) : (
            <h2 className="greeting" style={{ fontSize: '1.2rem' }}>Hello, Voter!</h2>
          )}
        </div>
        
        <div className="gamification-stats" style={{ background: 'var(--surface-color)', padding: '8px 12px', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border-color)' }}>
          <div style={{ position: 'relative', width: '36px', height: '36px', borderRadius: '50%', background: `conic-gradient(var(--success) ${overallProgress}%, var(--border-color) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '28px', height: '28px', background: 'var(--surface-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={14} color="var(--success)" />
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Score</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{democracyScore}</div>
          </div>
        </div>
      </header>

      {/* Dynamic CTA */}
      <section>
        <Card variant="interactive" onClick={() => navigate(isRegistrationPending ? '/register' : '/modules')} className="continue-learning-card bg-primary-gradient">
          <div className="card-content-flex">
            <div className="card-text">
              <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                {isRegistrationPending ? 'ACTION REQUIRED' : 'UP NEXT'}
              </span>
              <h3 className="text-white mt-2">
                {isRegistrationPending ? 'Track your Voter ID' : nextModule.title}
              </h3>
              <p className="text-white-muted text-sm mb-4 notranslate" style={{ opacity: 0.9 }}>
                {isRegistrationPending ? 'Check the status of your Form 6 application.' : nextModule.description}
              </p>
              {!isRegistrationPending && <ProgressBar progress={nextModule.progress} color="var(--accent-yellow)" />}
            </div>
            <div className="card-action">
              <button className="play-button" style={{ background: 'white', color: 'var(--primary-blue)' }}>
                {isRegistrationPending ? <FileText fill="none" stroke="currentColor" size={24} /> : <Play fill="currentColor" size={24} />}
              </button>
            </div>
          </div>
        </Card>
      </section>

      {/* Explore Modules Grid */}
      <section>
        <h3 className="section-title mb-2">Explore</h3>
        <div className="modules-grid">
          <Card variant="interactive" onClick={() => navigate('/modules')} className="module-card">
            <div className="icon-wrapper bg-blue-light">
              <BookOpen size={24} color="var(--primary-blue)" />
            </div>
            <h4>Learn</h4>
            <p className="text-muted text-sm">Step-by-step guides</p>
          </Card>

          <Card variant="interactive" onClick={() => navigate('/news')} className="module-card">
            <div className="icon-wrapper bg-orange-light">
              <Newspaper size={24} color="var(--secondary-orange)" />
            </div>
            <h4>News</h4>
            <p className="text-muted text-sm">Election updates</p>
          </Card>

          <Card variant="interactive" onClick={() => navigate('/verify')} className="module-card">
            <div className="icon-wrapper bg-success-light">
              <ShieldCheck size={24} color="var(--success)" />
            </div>
            <h4>Verify</h4>
            <p className="text-muted text-sm">Spot fake news</p>
          </Card>

          <Card variant="interactive" onClick={() => navigate('/register')} className="module-card">
            <div className="icon-wrapper bg-gray-light">
              <FileText size={24} color="var(--text-secondary)" />
            </div>
            <h4>Register</h4>
            <p className="text-muted text-sm">Get your Voter ID</p>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default HomeDashboard;
