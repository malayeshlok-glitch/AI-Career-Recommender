import React, { useState } from 'react';
import './App.css';
import LoginScreen from './components/LoginScreen';
import InstructionsScreen from './components/InstructionsScreen';
import MCQTest from './components/MCQTest';
import ReviewScreen from './components/ReviewScreen';
import LoadingScreen from './components/LoadingScreen';
import ResultDashboard from './components/ResultDashboard';
import CareerDetailsScreen from './components/CareerDetailsScreen';
import HistoryScreen from './components/HistoryScreen';
import sampleQuestions from './data/sampleQuestions';
import { formatAnswers } from './utils/formatAnswers';
 
const API_BASE_URL = 'http://localhost:5000';
 
// Stages: 'login' -> 'instructions' -> 'test' -> 'review' -> 'loading' -> 'result'
//         -> 'career-details' / 'history' (both return to 'result') -> 'error'
 
function App() {
  const [stage, setStage] = useState('login');
  const [studentName, setStudentName] = useState('');
  const [rawAnswers, setRawAnswers] = useState({});
  const [jumpIndex, setJumpIndex] = useState(0);
  const [results, setResults] = useState(null);
  const [finalScore, setFinalScore] = useState(null);
  const [scoreBreakdown, setScoreBreakdown] = useState({});
  const [explanation, setExplanation] = useState([]);
  const [answerBreakdown, setAnswerBreakdown] = useState([]);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
 
  const [studentId] = useState(() => 'STU_' + Date.now());
 
  const handleLogin = (name) => {
    setStudentName(name);
    setStage('instructions');
  };
 
  const handleStart = () => {
    setStage('test');
  };
 
  const handleReview = (answers) => {
    setRawAnswers(answers);
    setStage('review');
  };
 
  const handleEdit = (index) => {
    setJumpIndex(index);
    setStage('test');
  };
 
  const handleConfirmSubmit = async () => {
    const formatted = formatAnswers(sampleQuestions, rawAnswers);
    setStage('loading');
 
    try {
      const response = await fetch(`${API_BASE_URL}/api/submit-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: studentId,
          name: studentName,
          answers: formatted,
        }),
      });
 
      if (!response.ok) {
        throw new Error(`Server responded with status ${response.status}`);
      }
 
      const data = await response.json();
      setResults(data.predicted_careers);
      setFinalScore(data.final_score);
      setScoreBreakdown(data.score_breakdown || {});
      setExplanation(data.explanation || []);
      setAnswerBreakdown(data.answer_breakdown || []);
      setStage('result');
    } catch (error) {
      console.error('Error submitting test:', error);
      setErrorMessage(
        'Could not connect to the server. Make sure the backend is running at ' + API_BASE_URL
      );
      setStage('error');
    }
  };
 
  const handleViewCareerDetails = (careerName) => {
    setSelectedCareer(careerName);
    setStage('career-details');
  };
 
  const handleViewHistory = () => {
    setStage('history');
  };
 
  const handleRetake = () => {
    setRawAnswers({});
    setJumpIndex(0);
    setResults(null);
    setFinalScore(null);
    setScoreBreakdown({});
    setExplanation([]);
    setAnswerBreakdown([]);
    setStage('instructions');
  };
 
  return (
    <div className="App">
      {stage === 'login' && <LoginScreen onContinue={handleLogin} />}
      {stage === 'instructions' && <InstructionsScreen onStart={handleStart} />}
      {stage === 'test' && (
        <MCQTest
          onReview={handleReview}
          initialAnswers={rawAnswers}
          initialIndex={jumpIndex}
        />
      )}
      {stage === 'review' && (
        <ReviewScreen
          answers={rawAnswers}
          onEdit={handleEdit}
          onConfirmSubmit={handleConfirmSubmit}
        />
      )}
      {stage === 'loading' && <LoadingScreen />}
      {stage === 'result' && results && (
        <ResultDashboard
          name={studentName}
          finalScore={finalScore}
          results={results}
          answerBreakdown={answerBreakdown}
          scoreBreakdown={scoreBreakdown}
          explanation={explanation}
          onViewCareerDetails={handleViewCareerDetails}
          onViewHistory={handleViewHistory}
          onRetake={handleRetake}
        />
      )}
      {stage === 'career-details' && (
        <CareerDetailsScreen
          careerName={selectedCareer}
          onBack={() => setStage('result')}
        />
      )}
      {stage === 'history' && (
        <HistoryScreen
          studentId={studentId}
          onBack={() => setStage('result')}
        />
      )}
      {stage === 'error' && (
        <div className="app-shell">
          <div className="card">
            <div className="heading" style={{ marginBottom: 12 }}>Something went wrong</div>
            <p className="subtext" style={{ marginBottom: 20 }}>{errorMessage}</p>
            <button className="btn btn-primary" onClick={() => setStage('review')}>
              Go Back
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
 
export default App;
 