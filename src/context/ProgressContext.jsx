import React, { createContext, useContext, useState, useEffect } from 'react';

const ProgressContext = createContext();

export const useProgress = () => useContext(ProgressContext);

const initialModulesData = [
  {
    id: 1,
    title: 'Voter Registration',
    description: 'Learn how to get your name on the voter list.',
    progress: 0,
    status: 'in-progress'
  },
  {
    id: 2,
    title: 'The Voting Process',
    description: 'Step-by-step guide on what happens at the booth.',
    progress: 0,
    status: 'locked'
  },
  {
    id: 3,
    title: 'How Votes Are Counted',
    description: 'Understanding the EVM and VVPAT system.',
    progress: 0,
    status: 'locked'
  }
];

export const ProgressProvider = ({ children }) => {
  const [democracyScore, setDemocracyScore] = useState(() => {
    const saved = localStorage.getItem('democracyScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [modules, setModules] = useState(() => {
    const saved = localStorage.getItem('modulesProgress');
    return saved ? JSON.parse(saved) : initialModulesData;
  });

  useEffect(() => {
    localStorage.setItem('democracyScore', democracyScore.toString());
    localStorage.setItem('modulesProgress', JSON.stringify(modules));
  }, [democracyScore, modules]);

  const addScore = (points) => {
    setDemocracyScore(prev => Math.min(1000, prev + points));
  };

  const updateModuleProgress = (moduleId, newProgress, newStatus) => {
    setModules(prev => prev.map(mod => {
      if (mod.id === moduleId) {
        // If completing for the first time, add score
        if (newStatus === 'completed' && mod.status !== 'completed') {
          addScore(150);
        }
        return { ...mod, progress: newProgress, status: newStatus || mod.status };
      }
      return mod;
    }));
  };

  const unlockModule = (moduleId) => {
    setModules(prev => prev.map(mod => 
      mod.id === moduleId ? { ...mod, status: 'in-progress' } : mod
    ));
  };

  const resetProgress = () => {
    setDemocracyScore(0);
    setModules(initialModulesData);
    localStorage.removeItem('democracyScore');
    localStorage.removeItem('modulesProgress');
    localStorage.removeItem('moduleTwoStep');
    localStorage.removeItem('moduleThreeStep');
  };

  return (
    <ProgressContext.Provider value={{
      democracyScore,
      addScore,
      modules,
      updateModuleProgress,
      unlockModule,
      resetProgress
    }}>
      {children}
    </ProgressContext.Provider>
  );
};
