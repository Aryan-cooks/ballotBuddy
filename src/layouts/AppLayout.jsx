import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, BookOpen, UserPlus, Newspaper, ShieldCheck } from 'lucide-react';
import './AppLayout.css';

const AppLayout = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: <Home size={24} />, label: 'Home' },
    { path: '/modules', icon: <BookOpen size={24} />, label: 'Learn' },
    { path: '/register', icon: <UserPlus size={24} />, label: 'Register' },
    { path: '/news', icon: <Newspaper size={24} />, label: 'News' },
    { path: '/verify', icon: <ShieldCheck size={24} />, label: 'Verify' },
  ];

  return (
    <div className="app-container">
      <main className="main-content">
        <Outlet />
      </main>
      
      <nav className="bottom-nav glass-panel">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AppLayout;
