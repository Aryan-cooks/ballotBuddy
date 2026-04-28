import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ progress = 0, color = 'var(--primary-blue)', height = '8px' }) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="ui-progress-bar" style={{ height }}>
      <div 
        className="ui-progress-bar__fill" 
        style={{ 
          width: `${normalizedProgress}%`,
          backgroundColor: color
        }}
      />
    </div>
  );
};

export default ProgressBar;
