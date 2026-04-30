import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  ChevronRight, 
  Lock, 
  PlayCircle,
  HelpCircle,
  Trophy,
  ArrowLeft,
  Moon,
  Sun,
  RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../context/ProgressContext';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/Card';
import Button from '../components/Button';
import './LearningModules.css';

const LearningModules = () => {
  const navigate = useNavigate();
  const { modules, resetProgress } = useProgress();
  const { darkMode, toggleDarkMode } = useTheme();
  const [selectedModule, setSelectedModule] = useState(null);

  const handleModuleClick = (module) => {
    if (module.status === 'locked') return;
    
    // Module 2 takes you to the mock simulation
    if (module.id === 2) {
      navigate('/mock-voting');
      return;
    }
    
    setSelectedModule(module);
  };

  return (
    <div className="learning-page-wrapper">
      <div className="container py-6 mb-20" style={{ position: 'relative' }}>
        <button 
          onClick={toggleDarkMode}
          className="floating-theme-toggle"
          aria-label="Toggle Dark Mode"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <header className="page-header mb-8 animate-slide-up">
          <div className="flex-between">
            <h2 className="page-title">Education Center</h2>
            <button 
              className="reset-btn" 
              onClick={() => {
                if(window.confirm('Reset all progress? This will reset your score to 0.')) {
                  resetProgress();
                }
              }}
            >
              <RotateCcw size={16} /> Reset
            </button>
          </div>
          <p className="text-muted">Master the democratic process one module at a time.</p>
        </header>

        <div className="modules-list">
          {modules.map((module, index) => (
            <Card 
              key={module.id}
              className={`module-item-card animate-slide-up ${module.status}`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleModuleClick(module)}
            >
              <div className="module-item-layout">
                <div className={`module-icon-box status-${module.status}`}>
                  {module.status === 'completed' ? <CheckCircle2 size={24} /> : 
                   module.status === 'locked' ? <Lock size={24} /> : <PlayCircle size={24} />}
                </div>
                
                <div className="module-item-content">
                  <div className="flex-between mb-1">
                    <span className="module-meta">Module {module.id}</span>
                    {module.status === 'completed' && <span className="completed-badge">Done +150</span>}
                  </div>
                  <h4 className="module-item-title">{module.title}</h4>
                  <p className="module-item-desc">{module.description}</p>
                  
                  {module.status !== 'locked' && (
                    <div className="module-item-footer mt-4">
                      <div className="module-progress-bar">
                        <div className="fill" style={{ width: `${module.progress}%` }}></div>
                      </div>
                      <span className="progress-percent">{module.progress}%</span>
                    </div>
                  )}
                </div>
                
                <div className="module-item-action">
                  {module.status !== 'locked' ? <ChevronRight size={20} className="text-muted" /> : <div />}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <section className="quiz-section mt-10 animate-slide-up" style={{ animationDelay: '400ms' }}>
          <Card className="quiz-promo-card">
            <div className="quiz-promo-layout">
              <div className="quiz-promo-icon">
                <HelpCircle size={32} color="var(--primary-blue)" />
              </div>
              <div className="quiz-promo-text">
                <h4>Civic Quiz Challenge</h4>
                <p>Test your knowledge and earn double points!</p>
              </div>
              <Button size="sm" variant="outline">Start Quiz</Button>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default LearningModules;
