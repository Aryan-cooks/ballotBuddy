import React from 'react';
import './Card.css';

const Card = ({ children, className = '', onClick, variant = 'default' }) => {
  const baseClass = 'ui-card';
  const variantClass = `ui-card--${variant}`; // default, interactive, glass
  const interactiveClass = onClick ? 'ui-card--clickable' : '';
  
  return (
    <div 
      className={`${baseClass} ${variantClass} ${interactiveClass} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
};

export default Card;
