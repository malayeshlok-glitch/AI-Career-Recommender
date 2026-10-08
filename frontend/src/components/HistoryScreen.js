import React, { useState, useEffect } from 'react';
 
const API_BASE_URL = 'http://localhost:5000';
 
function HistoryScreen({ studentId, onBack }) {
  const [history, setHistory] = useState(null);
  const [error, setError] = useState(null);
 
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/history/${studentId}`)
      .then((res) => res.json())
      .then(setHistory)
      .catch(() => setError('Could not load history.'));
  }, [studentId]);
 
  return (
    <div className="app-shell">
      <div className="card">
        <button className="btn btn-secondary" onClick={onBack} style={{ marginBottom: 20 }}>
          ← Back to Results
        </button>
 
        <div className="heading" style={{ marginBottom: 16 }}>Your Past Attempts</div>
 
        {error && <p className="subtext">{error}</p>}
        {history && history.length === 0 && (
          <p className="subtext">No past attempts found for this session.</p>
        )}
 
        {history && history.map((item, idx) => {
          const predictions = item.predicted_careers ? JSON.parse(item.predicted_careers) : [];
          const top = predictions[0];
          const date = new Date(item.submitted_at).toLocaleString();
 
          return (
            <div key={idx} className="review-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div className="eyebrow">{date}</div>
              <div style={{ fontWeight: 600, fontSize: 15, marginTop: 4 }}>
                {top ? `${top.career} (${top.confidence}%)` : 'No prediction available'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
 
export default HistoryScreen;
 