import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', // primary, secondary, outline, ghost
  size = 'md', // sm, md, lg
  fullWidth = false,
  icon,
  className = '',
  ...props 
}) => {
  const baseClass = 'ui-button';
  const variantClass = `ui-button--${variant}`;
  const sizeClass = `ui-button--${size}`;
  const widthClass = fullWidth ? 'ui-button--full' : '';
  
  return (
    <button 
      className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${className}`}
      {...props}
    >
      {icon && <span className="ui-button__icon">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
