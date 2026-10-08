import React, { useState, useEffect } from 'react';
import sampleQuestions from '../data/sampleQuestions';
import { formatAnswers } from '../utils/formatAnswers';
 
const TEST_DURATION_SECONDS = 1800;
 
function MCQTest({ onSubmit, onReview, initialAnswers = {}, initialIndex = 0 }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [answers, setAnswers] = useState(initialAnswers);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);
 
  const currentQuestion = sampleQuestions[currentIndex];
  const totalQuestions = sampleQuestions.length;
 
  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinish();
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);
 
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
 
  const handleOptionSelect = (option) => {
    setAnswers({ ...answers, [currentQuestion.id]: option });
  };
 
  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) setCurrentIndex(currentIndex + 1);
  };
 
  const handlePrevious = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };
 
  const handleFinish = () => {
    if (onReview) {
      onReview(answers);
    } else {
      onSubmit(formatAnswers(sampleQuestions, answers));
    }
  };
 
  // DEMO CONVENIENCE: instantly picks a random option for every question,
  // then jumps to the last question so you can hit "Review Answers" right away.
  // Useful for presentations/demos so you don't have to click through all questions.
  const handleAutoFill = () => {
    const filled = {};
    sampleQuestions.forEach((q) => {
      const randomOption = q.options[Math.floor(Math.random() * q.options.length)];
      filled[q.id] = randomOption;
    });
    setAnswers(filled);
    setCurrentIndex(totalQuestions - 1);
  };
 
  const answeredCount = Object.keys(answers).length;
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100;
 
  return (
    <div className="app-shell">
      <div className="card">
        <div className="gradient-bar-track">
          <div className="gradient-bar-fill" style={{ width: `${progressPercent}%` }} />
        </div>
 
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
          <div className="eyebrow">
            {currentQuestion.category} — Question {currentIndex + 1} of {totalQuestions}
          </div>
          <div className={`timer ${timeLeft <= 30 ? 'low' : ''}`}>
            {formatTime(timeLeft)}
          </div>
        </div>
 
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div className="subtext">
            Answered: {answeredCount} / {totalQuestions}
          </div>
          <button
            type="button"
            onClick={handleAutoFill}
            style={{
              fontSize: 12,
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid #ECECF1',
              background: '#F7F5FF',
              color: '#6C5CE7',
              cursor: 'pointer',
            }}
            title="Randomly fills all answers — for demo purposes only"
          >
            ⚡ Auto-Fill (Demo)
          </button>
        </div>
 
        <div className="heading" style={{ fontSize: 19, marginBottom: 20 }}>
          {currentQuestion.question}
        </div>
 
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {currentQuestion.options.map((option, idx) => {
            const isSelected = answers[currentQuestion.id] === option;
            return (
              <label key={idx} className={`option ${isSelected ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={option}
                  checked={isSelected}
                  onChange={() => handleOptionSelect(option)}
                />
                {option}
              </label>
            );
          })}
        </div>
 
        <div className="nav-row">
          <button className="btn btn-secondary" onClick={handlePrevious} disabled={currentIndex === 0}>
            Previous
          </button>
 
          {currentIndex < totalQuestions - 1 ? (
            <button className="btn btn-primary" onClick={handleNext}>Next</button>
          ) : (
            <button className="btn btn-primary" onClick={handleFinish}>
              {onReview ? 'Review Answers' : 'Submit'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
 
export default MCQTest;
 