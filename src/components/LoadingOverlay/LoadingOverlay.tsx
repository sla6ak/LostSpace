import React from 'react';
import './LoadingOverlay.css';

const LoadingOverlay = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-spinner">
        <div className="spinner-inner"></div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
