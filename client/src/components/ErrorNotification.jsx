import React from 'react';
import './ErrorNotification.css';

const ErrorNotification = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="error-notification">
      <div className="error-content">
        <span className="error-message">{message}</span>
        <button className="error-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default ErrorNotification; 