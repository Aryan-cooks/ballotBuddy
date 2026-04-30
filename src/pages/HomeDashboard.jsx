import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Bell, 
  Calendar, 
  ChevronRight, 
  Trophy, 
  Vote, 
  ShieldCheck, 
  HelpCircle,
  Menu,
  Moon,
  Sun,
  User
} from 'lucide-react';
import { useProgress } from '../context/ProgressContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/Card';
import Button from '../components/Button';
import './HomeDashboard.css';

const HomeDashboard = () => {
  const navigate = useNavigate();
  const { democracyScore, modules } = useProgress();
  const { user, signOut } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const nextModule = modules.find(m => m.status === 'in-progress') || modules[0];

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-bg"></div>
      
      <div className="container py-6">
        <header className="dashboard-header mb-8">
          <div className="flex-between">
            <div className="brand-section">
              <div className="logo-container glass-panel">
                <img src="/logo.png" alt="BallotBuddy Logo" className="logo-light" />
                <img src="/logo_dark_mode.png" alt="BallotBuddy Logo" className="logo-dark" />
              </div>
              <h1 className="notranslate brand-name">BallotBuddy</h1>
            </div>
            
            <div className="header-actions">
              <button 
                className="action-btn theme-toggle" 
                onClick={toggleDarkMode}
                aria-label="Toggle theme"
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <div className="user-profile glass-panel" onClick={() => navigate('/profile')}>
                <User size={20} />
              </div>
            </div>
          </div>

          <div className="welcome-section mt-8 animate-slide-up">
            <span className="greeting-badge">{greeting}, Citizen</span>
            <h2 className="user-name">
              {user?.user_metadata?.username || user?.email?.split('@')[0] || 'User'}
            </h2>
            <p className="dashboard-subtitle">Your journey to becoming an informed voter continues.</p>
          </div>
        </header>

        <section className="stats-grid mb-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <Card className="democracy-score-card glass-panel" variant="glass">
            <div className="score-header">
              <Trophy size={20} className="text-accent" />
              <span>Democracy Score</span>
            </div>
            <div className="score-value-container">
              <span className="score-number">{democracyScore}</span>
              <span className="score-total">/1000</span>
            </div>
            <div className="score-rank">Civic Explorer</div>
          </Card>

          <Card className="election-timer-card glass-panel" variant="glass">
            <div className="timer-header">
              <Calendar size={20} className="text-secondary" />
              <span>Next Election</span>
            </div>
            <div className="timer-content">
              <span className="timer-date">June 2026</span>
              <span className="timer-days">420 Days left</span>
            </div>
            <div className="timer-status">Get Ready!</div>
          </Card>
        </section>

        <section className="modules-section mb-8 animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="section-header flex-between mb-4">
            <h3>Learning Path</h3>
            <Link to="/modules" className="view-all">View All</Link>
          </div>
          
          <Card className="current-module-card" onClick={() => navigate('/modules')}>
            <div className="module-badge">Next Lesson</div>
            <h4 className="module-title">{nextModule.title}</h4>
            <p className="module-desc">{nextModule.description}</p>
            <div className="module-progress-info">
              <div className="progress-text">{nextModule.progress}% Complete</div>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${nextModule.progress}%` }}></div>
              </div>
            </div>
            <Button fullWidth className="mt-4" icon={<ChevronRight size={18} />}>
              Continue Learning
            </Button>
          </Card>
        </section>

        <section className="tools-section animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="section-header mb-4">
            <h3>Quick Actions</h3>
          </div>
          <div className="actions-grid">
            <Card className="tool-card" onClick={() => navigate('/register')}>
              <div className="tool-icon bg-success-light">
                <Vote size={24} color="var(--success)" />
              </div>
              <span className="tool-label">Voter ID Guide</span>
            </Card>
            
            <Card className="tool-card" onClick={() => navigate('/verify')}>
              <div className="tool-icon bg-error-light">
                <ShieldCheck size={24} color="var(--error)" />
              </div>
              <span className="tool-label">Fact Checker</span>
            </Card>
            
            <Card className="tool-card" onClick={() => navigate('/news')}>
              <div className="tool-icon bg-primary-light">
                <Bell size={24} color="var(--primary-blue)" />
              </div>
              <span className="tool-label">Latest Updates</span>
            </div>
            
            <Card className="tool-card" onClick={() => navigate('/help')}>
              <div className="tool-icon bg-warning-light">
                <HelpCircle size={24} color="var(--warning)" />
              </div>
              <span className="tool-label">Support</span>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HomeDashboard;
