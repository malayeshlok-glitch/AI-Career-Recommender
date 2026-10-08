import React from 'react';
import sampleQuestions from '../data/sampleQuestions';

function ReviewScreen({ answers, onEdit, onConfirmSubmit }) {
  return (
    <div className="app-shell">
      <div className="card">
        <div className="heading">Review Your Answers</div>
        <p className="subtext" style={{ marginBottom: 20 }}>
          Check your answers below. Click "Edit" on any question to change it.
        </p>

        {sampleQuestions.map((q, idx) => {
          const selected = answers[q.id];
          return (
            <div key={q.id} className="review-item">
              <div>
                <div className="eyebrow">{q.category} — Question {idx + 1}</div>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>{q.question}</div>
                <div className={`review-answer ${selected ? 'answered' : 'unanswered'}`}>
                  {selected ? `Your answer: ${selected}` : 'Not answered'}
                </div>
              </div>
              <button className="btn btn-secondary" onClick={() => onEdit(idx)}>Edit</button>
            </div>
          );
        })}

        <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={onConfirmSubmit}>
          Confirm & Submit
        </button>
      </div>
    </div>
  );
}

export default ReviewScreen;