import React, { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, BookOpen, Newspaper, ShieldAlert, Globe, Moon, Sun, ChevronDown } from 'lucide-react';
import './AppLayout.css';

const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN', googleCode: 'en' },
  { code: 'hi', label: 'हिन्दी', short: 'HI', googleCode: 'hi' },
];

const AppLayout = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');
  const [language, setLanguage] = useState(() => localStorage.getItem('appLanguage') || 'en');
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const translatePage = (googleCode) => {
    // Clear existing googtrans cookie on all paths/domains
    const clearCookie = (name) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
    };
    clearCookie('googtrans');

    if (googleCode && googleCode !== 'en') {
      const val = `/en/${googleCode}`;
      document.cookie = `googtrans=${val}; path=/`;
      document.cookie = `googtrans=${val}; path=/; domain=${window.location.hostname}`;
    }
    // Reload so Google Translate picks up the new cookie immediately
    window.location.reload();
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang.code);
    localStorage.setItem('appLanguage', lang.code);
    setLangOpen(false);
    translatePage(lang.googleCode);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const currentLang = LANGUAGES.find(l => l.code === language) || LANGUAGES[0];

  return (
    <div className="app-container">
      {/* Top Header / Toggles */}
      <div className="top-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button 
            onClick={() => navigate('/login')}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 18px', borderRadius: '10px', background: 'var(--primary-blue)', color: 'white', border: 'none', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', fontWeight: 600, fontSize: '0.85rem' }}
          >
            Login
          </button>
          
          <div style={{ display: 'flex', gap: '8px', marginLeft: '8px' }}>
            <button 
              onClick={toggleDarkMode}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '50%', background: darkMode ? 'var(--primary-blue)' : 'var(--surface-color)', color: darkMode ? 'white' : 'var(--text-primary)', border: '1px solid var(--border-color)', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}
              aria-label="Toggle Dark Mode"
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
        </div>

        {/* Custom Language Picker */}
        <div ref={langRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setLangOpen(o => !o)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--surface-color)', padding: '6px 12px', borderRadius: '20px', boxShadow: 'var(--shadow-sm)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer', border: '1px solid var(--border-color)' }}
          >
            <Globe size={16} color="var(--primary-blue)" />
            {currentLang.label} ({currentLang.short})
            <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: langOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>

          {langOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 6px)', right: 0,
              background: 'var(--surface-color)', border: '1px solid var(--border-color)',
              borderRadius: '16px', boxShadow: 'var(--shadow-md)', overflow: 'hidden',
              minWidth: '160px', zIndex: 100,
            }}>
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', width: '100%',
                    padding: '10px 16px', background: lang.code === language ? 'var(--primary-blue)' : 'transparent',
                    color: lang.code === language ? 'white' : 'var(--text-primary)',
                    border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                    textAlign: 'left', transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => { if (lang.code !== language) e.currentTarget.style.background = 'var(--bg-color)'; }}
                  onMouseLeave={e => { if (lang.code !== language) e.currentTarget.style.background = 'transparent'; }}
                >
                  {lang.label} ({lang.short})
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <main className="main-content">
        <Outlet />
      </main>

      <nav className="bottom-nav glass-panel">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <Home size={24} />
          <span>Home</span>
        </NavLink>
        
        <NavLink to="/modules" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BookOpen size={24} />
          <span>Learn</span>
        </NavLink>
        
        <NavLink to="/news" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Newspaper size={24} />
          <span>News</span>
        </NavLink>
        
        <NavLink to="/verify" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ShieldAlert size={24} />
          <span>Verify</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default AppLayout;

