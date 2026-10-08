import React, { useState } from 'react';
 
function LoginScreen({ onContinue }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
 
  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your full name to continue.');
      return;
    }
    setError('');
    onContinue(trimmed);
  };
 
  return (
    <div className="app-shell">
      <div className="card">
        <div className="heading">Welcome</div>
        <p className="subtext" style={{ marginBottom: 24 }}>
          Enter your name to begin the career recommendation test.
        </p>
 
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              fontSize: '15px',
              border: error ? '1.5px solid #FF5DA2' : '1.5px solid #ECECF1',
              borderRadius: '10px',
              marginBottom: error ? '6px' : '20px',
              fontFamily: 'Inter, sans-serif',
              boxSizing: 'border-box',
            }}
          />
          {error && (
            <div style={{ color: '#FF5DA2', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}
 
          <button type="submit" className="btn btn-primary">
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
 
export default LoginScreen;
 