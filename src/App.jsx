import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProgressProvider } from './context/ProgressContext';
import { TranslationProvider } from './context/TranslationContext';
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

function App() {
  return (
    <TranslationProvider>
      <ProgressProvider>
        <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Register />} />
          <Route path="/" element={<AppLayout />}>
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
  );
}

export default App;
