import React from 'react';
import sampleQuestions from '../data/sampleQuestions';
import { TEST_DURATION_SECONDS } from '../config/testConfig';

function InstructionsScreen({ onStart }) {
  const totalQuestions = sampleQuestions.length;
  const categories = [...new Set(sampleQuestions.map((q) => q.category))];
  const minutes = Math.floor(TEST_DURATION_SECONDS / 60);

  return (
    <div className="app-shell">
      <div className="card">
        <div className="heading">Career Recommendation Test</div>
        <p className="subtext" style={{ marginBottom: 24 }}>
          Please read the details below before starting.
        </p>

        <ul className="info-list">
          <li><strong>Total Questions:</strong> {totalQuestions}</li>
          <li><strong>Sections:</strong> {categories.join(', ')}</li>
          <li><strong>Time Limit:</strong> {minutes} minutes</li>
          <li>The test will auto-submit when time runs out.</li>
          <li>You can navigate back and forth between questions before submitting.</li>
          <li>You'll get a chance to review your answers before final submission.</li>
        </ul>

        <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={onStart}>
          Start Test
        </button>
      </div>
    </div>
  );
}

export default InstructionsScreen;