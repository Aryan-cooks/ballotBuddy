import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ProgressProvider } from './context/ProgressContext';
import { TranslationProvider } from './context/TranslationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import AppLayout from './layouts/AppLayout';
import HomeDashboard from './pages/HomeDashboard';
import LearningModules from './pages/LearningModules';
import MockSimulation from './pages/MockSimulation';
import NewsFeed from './pages/NewsFeed';
import VerifyNews from './pages/VerifyNews';
import RegistrationGuide from './pages/RegistrationGuide';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', background: 'var(--bg-color, #fff)' }}>
        <div className="animate-spin" style={{ width: 32, height: 32, border: '3px solid var(--border-color, #e5e7eb)', borderTopColor: 'var(--primary-blue, #3b82f6)', borderRadius: '50%' }} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TranslationProvider>
          <ProgressProvider>
            <Router>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Register />} />
                <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                  <Route index element={<HomeDashboard />} />
                  <Route path="modules" element={<LearningModules />} />
                  <Route path="news" element={<NewsFeed />} />
                  <Route path="verify" element={<VerifyNews />} />
                  <Route path="register" element={<RegistrationGuide />} />
                </Route>
              </Routes>
            </Router>
          </ProgressProvider>
        </TranslationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
