import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Activity, FileText, Bell, Settings, LogOut, Moon, Sun, ShieldAlert } from 'lucide-react';
import './ProfileDropdown.css';

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, profile, signOut } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️';
    if (hour < 18) return '☕';
    return '🌙';
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  let username = profile?.username;
  if (!username) {
    if (user?.email) {
      username = user.email.split('@')[0];
    } else if (profile?.email) {
      username = profile.email.split('@')[0];
    } else {
      username = 'Voter';
    }
  }
  const displayIdentifier = profile?.email || profile?.phone || user?.email || '';

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      <button 
        className="profile-avatar-btn" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle profile menu"
      >
        {username.charAt(0).toUpperCase()}
      </button>

      {isOpen && (
        <div className="profile-dropdown-menu animate-dropdown">
          <div className="dropdown-header">
            <h4 className="greeting-text">
              {getGreeting()}, {username} {getEmoji()}
            </h4>
            {displayIdentifier && <p className="user-identifier">{displayIdentifier}</p>}
          </div>

          <div className="dropdown-section">
            <button className="dropdown-item" onClick={() => { navigate('/profile'); setIsOpen(false); }}>
              <User size={16} />
              <span>View Profile</span>
            </button>
            <button className="dropdown-item" onClick={() => { navigate('/progress'); setIsOpen(false); }}>
              <Activity size={16} />
              <span>My Progress</span>
            </button>
            <button className="dropdown-item" onClick={() => { navigate('/voter-status'); setIsOpen(false); }}>
              <ShieldAlert size={16} />
              <span>Voter Status</span>
            </button>
            <button className="dropdown-item" onClick={() => { navigate('/submissions'); setIsOpen(false); }}>
              <FileText size={16} />
              <span>My Submissions</span>
            </button>
          </div>

          <div className="dropdown-section">
            <button className="dropdown-item" onClick={() => { navigate('/settings'); setIsOpen(false); }}>
              <Settings size={16} />
              <span>Settings</span>
            </button>
            <button className="dropdown-item" onClick={(e) => {
              e.preventDefault();
              toggleDarkMode();
            }}>
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>

          <div className="dropdown-section" style={{ borderBottom: 'none' }}>
            <button className="dropdown-item text-error" onClick={handleSignOut}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;
