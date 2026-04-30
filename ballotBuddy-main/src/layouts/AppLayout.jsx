import React, { useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { Home, BookOpen, Newspaper, ShieldAlert, UserPlus, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './AppLayout.css';

const AppLayout = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  useEffect(() => {
    // Clear Google Translate cookies to ensure it doesn't auto-translate
    const clearCookie = (name) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname}`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname}`;
    };
    clearCookie('googtrans');
  }, []);

  return (
    <div className="app-container">
      <main className="main-content">
        <Outlet />
      </main>

      <nav className="bottom-nav glass-panel">
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <Home size={24} />
          <span>Home</span>
        </NavLink>
        
        <NavLink to="/modules" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BookOpen size={22} />
          <span>Learn</span>
        </NavLink>

        <NavLink to="/register" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <UserPlus size={22} />
          <span>Register</span>
        </NavLink>

        <NavLink to="/news" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Newspaper size={22} />
          <span>News</span>
        </NavLink>

        <NavLink to="/verify" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <ShieldAlert size={22} />
          <span>Verify</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default AppLayout;
