import React, { useState, useEffect } from 'react';
 
const API_BASE_URL = 'http://localhost:5000';
 
function CareerDetailsScreen({ careerName, onBack }) {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/career-info/${encodeURIComponent(careerName)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(setInfo)
      .catch(() => setError('Could not load details for this career.'));
  }, [careerName]);
 
  return (
    <div className="app-shell">
      <div className="card">
        <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: 20 }}>
          ← Back to Results
        </button>
 
        <div className="heading" style={{ marginBottom: 4 }}>{careerName}</div>
 
        {error && <p className="subtext">{error}</p>}
 
        {info && (
          <>
            <p className="subtext" style={{ marginBottom: 20, fontSize: 14.5 }}>{info.description}</p>
 
            <div className="heading" style={{ fontSize: 16, marginBottom: 12 }}>Key Skills</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
              {info.skills.map((skill, idx) => (
                <span
                  key={idx}
                  style={{
                    background: '#F7F5FF',
                    color: '#6C5CE7',
                    padding: '6px 12px',
                    borderRadius: 20,
                    fontSize: 12.5,
                    fontWeight: 500,
                  }}
                >
                  {skill}
                </span>
              ))}
            </div>
 
            <div className="heading" style={{ fontSize: 16, marginBottom: 12 }}>Suggested Roadmap</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {info.roadmap.map((step, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div
                    style={{
                      minWidth: 24, height: 24, borderRadius: '50%',
                      background: 'linear-gradient(90deg, #6C5CE7, #FF5DA2)',
                      color: 'white', fontSize: 12, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div style={{ fontSize: 13.5, color: '#1B1D2A', paddingTop: 2 }}>{step}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
 
export default CareerDetailsScreen;
 