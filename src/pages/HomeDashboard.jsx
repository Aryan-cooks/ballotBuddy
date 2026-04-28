import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Award, Flame, BookOpen, ShieldCheck, FileText, Clock, MapPin, Newspaper, UserCheck, CheckCircle, Moon, Sun } from 'lucide-react';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';
import { useProgress } from '../context/ProgressContext';
import { useTranslation } from '../context/TranslationContext';
import './HomeDashboard.css';

const HomeDashboard = () => {
  const navigate = useNavigate();
  const { democracyScore, modules } = useProgress();
  const { t } = useTranslation();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (newDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'false');
    }
  };
  
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('voterProfile');
    return saved ? JSON.parse(saved) : null;
  });
  const [showModal, setShowModal] = useState(!profile);
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState('');

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser');
      return;
    }
    
    setIsLocating(true);
    setLocationError('');
    
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      try {
        // Use a free reverse geocoding API
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        const stateName = data.address?.state || data.address?.city || "Unknown Location";
        
        // Simple logic to mock upcoming vs concluded elections
        const upcomingStates = ['Maharashtra', 'Jharkhand', 'Delhi', 'Bihar', 'Haryana', 'West Bengal'];
        const isUpcoming = upcomingStates.some(s => stateName.includes(s));
        const nextElection = isUpcoming ? "Upcoming Election" : "Election Concluded";
        
        const newProfile = { state: stateName, nextElection };
        localStorage.setItem('voterProfile', JSON.stringify(newProfile));
        setProfile(newProfile);
        setShowModal(false);
      } catch (err) {
        // Fallback if API fails
        const newProfile = { state: "Delhi", nextElection: "Upcoming Election" };
        localStorage.setItem('voterProfile', JSON.stringify(newProfile));
        setProfile(newProfile);
        setShowModal(false);
      } finally {
        setIsLocating(false);
      }
    }, (error) => {
      setIsLocating(false);
      setLocationError('Location access denied. Please enable location services to personalize your app.');
    });
  };

  const nextModule = modules.find(m => m.status !== 'completed') || modules[modules.length - 1];
  const isRegistrationPending = modules[0].status !== 'completed';
  const overallProgress = modules ? Math.round(modules.reduce((acc, mod) => acc + mod.progress, 0) / modules.length) : 0;

  return (
    <div className="container mt-2 mb-2 animate-slide-up" style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', paddingBottom: '10px', position: 'relative' }}>
      
      {showModal && (
        <div className="modal-overlay" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.95)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-lg)' }}>
          <Card style={{ padding: 'var(--space-6)', width: '90%', maxWidth: '400px', boxShadow: 'var(--shadow-lg)', textAlign: 'center' }}>
            <div style={{ background: 'var(--primary-blue-light)', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: 'white' }}>
              <MapPin size={32} />
            </div>
            <h3 className="mb-2">Welcome to BallotBuddy!</h3>
            <p className="text-sm text-muted mb-4">Allow location access to personalize your timeline and see your local election status.</p>
            {locationError && <p style={{ color: 'var(--error)', fontSize: '0.8rem', margin: '0 0 12px 0' }}>{locationError}</p>}
            <Button fullWidth onClick={handleDetectLocation} disabled={isLocating}>
              {isLocating ? 'Detecting...' : 'Detect My Location'}
            </Button>
          </Card>
        </div>
      )}

      <div className="branding-section mt-2" style={{ position: 'relative' }}>
        
        {/* Top Right Controls */}
        <div style={{ position: 'absolute', top: 0, right: 0, display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button 
            onClick={() => navigate('/login')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '6px 14px', borderRadius: '100px', background: 'var(--primary-blue)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', fontWeight: 600, fontSize: '0.8rem' }}
          >
            Login
          </button>
          <button 
            onClick={toggleDarkMode}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', borderRadius: '50%', background: darkMode ? 'var(--primary-blue)' : 'var(--surface-color)', color: darkMode ? 'white' : 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
            aria-label="Toggle Dark Mode"
          >
            {darkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>

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
          <h1 style={{ fontSize: '1.9rem', margin: 0, fontWeight: 800, color: 'var(--primary-blue-dark)', letterSpacing: '-0.5px', display: 'inline-block' }}>
            <span className="notranslate">BallotBuddy</span>
          </h1>
        </div>
        <p className="text-muted tagline">{t('tagline')}</p>
      </div>

      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0 16px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '16px' }}>
        <div className="header-left" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {profile ? (
            <>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>My Progress</h2>
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.85rem', cursor: 'pointer' }}
                onClick={() => setShowModal(true)}
              >
                <MapPin size={14} color="var(--primary-blue)" /> 
                <span style={{ fontWeight: 500 }}>{profile.state} • {profile.nextElection}</span>
              </div>
            </>
          ) : (
            <h2 className="greeting" style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>Hello, Voter!</h2>
          )}
        </div>
        
        <div className="header-right animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--surface-color)', padding: '6px 16px 6px 6px', borderRadius: '100px', boxShadow: 'var(--shadow-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ position: 'relative', width: '40px', height: '40px', borderRadius: '50%', background: `conic-gradient(var(--success) ${overallProgress}%, var(--border-color) 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 1.5s ease-out' }}>
              <div style={{ width: '32px', height: '32px', background: 'var(--surface-color)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)' }}>
                <Flame size={16} color="var(--success)" style={{ filter: 'drop-shadow(0 2px 4px rgba(34, 197, 94, 0.4))' }} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Score</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{democracyScore}</span>
            </div>
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
