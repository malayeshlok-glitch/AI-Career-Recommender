import React from 'react';

function LoadingScreen() {
  return (
    <div className="app-shell">
      <div className="card" style={{ textAlign: 'center', padding: '60px 32px' }}>
        <div className="spinner" />
        <div className="heading" style={{ fontSize: 19, marginBottom: 8 }}>
          Analyzing your responses...
        </div>
        <p className="subtext">Our AI is matching your answers to the best-fit career paths.</p>
      </div>
    </div>
  );
}

export default LoadingScreen;