import React from 'react';
import jsPDF from 'jspdf';
 
const SCORE_LABELS = {
  aptitude_score: 'Aptitude',
  technical_score: 'Technical',
  logical_score: 'Logical',
  interest_software: 'Interest: Software',
  interest_data: 'Interest: Data',
  interest_core_engg: 'Interest: Core Engg',
  interest_management: 'Interest: Management',
  interest_design: 'Interest: Design',
};
 
function ResultDashboard({
  name,
  finalScore,
  results,
  answerBreakdown = [],
  scoreBreakdown = {},
  explanation = [],
  onViewCareerDetails,
  onViewHistory,
  onRetake,
}) {
  const sortedResults = [...results].sort((a, b) => b.confidence - a.confidence);
  const topCareer = sortedResults[0];
 
  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    let y = 20;
 
    doc.setFontSize(18);
    doc.text('Career Recommendation Report', 14, y);
    y += 10;
 
    doc.setFontSize(11);
    doc.text(`Name: ${name || 'N/A'}`, 14, y);
    y += 7;
    if (finalScore) {
      doc.text(`Final Score: ${finalScore.correct} / ${finalScore.total} (${finalScore.percentage}%)`, 14, y);
      y += 10;
    }
 
    doc.setFontSize(14);
    doc.text('Recommended Career Path', 14, y);
    y += 8;
    doc.setFontSize(11);
    sortedResults.forEach((r) => {
      doc.text(`${r.career}: ${r.confidence}%`, 14, y);
      y += 7;
    });
 
    if (explanation.length > 0) {
      y += 5;
      doc.setFontSize(14);
      doc.text('Why This Recommendation', 14, y);
      y += 8;
      doc.setFontSize(11);
      explanation.forEach((e) => {
        doc.text(`${e.factor}: your score ${e.value}`, 14, y);
        y += 7;
      });
    }
 
    doc.save(`${name ? name.replace(/\s+/g, '_') : 'career'}_report.pdf`);
  };
 
  return (
    <div className="app-shell">
      <div className="card">
        <div className="heading" style={{ marginBottom: 4 }}>
          {name ? `${name}'s Results` : 'Your Results'}
        </div>
        {finalScore && (
          <p className="subtext" style={{ marginBottom: 20 }}>
            Final Score: {finalScore.correct} / {finalScore.total} ({finalScore.percentage}%)
          </p>
        )}
 
        <div className="best-match">
          <div className="eyebrow">Best Match — Career Recommendation</div>
          <div className="career-name">{topCareer.career}</div>
          <div>{topCareer.confidence}% confidence</div>
        </div>
 
        <div className="heading" style={{ fontSize: 16, marginBottom: 16 }}>All Ranked Options</div>
        {sortedResults.map((result, idx) => (
          <div className="result-row" key={idx}>
            <div className="result-row-top">
              <span style={{ fontWeight: 500 }}>{result.career}</span>
              <span>{result.confidence}%</span>
            </div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{
                  width: `${result.confidence}%`,
                  background: idx === 0 ? 'linear-gradient(90deg, #6C5CE7, #FF5DA2)' : '#D9D9E5',
                }}
              />
            </div>
          </div>
        ))}
 
        <button
          className="btn btn-secondary"
          style={{ marginTop: 8, marginBottom: 8 }}
          onClick={() => onViewCareerDetails(topCareer.career)}
        >
          View Career Roadmap →
        </button>
 
        {explanation.length > 0 && (
          <>
            <div className="heading" style={{ fontSize: 16, margin: '24px 0 12px 0' }}>
              Why This Recommendation?
            </div>
            <p className="subtext" style={{ marginBottom: 14, fontSize: 13 }}>
              The AI weighed these factors most heavily for your result:
            </p>
            {explanation.map((e, idx) => (
              <div key={idx} className="result-row">
                <div className="result-row-top">
                  <span style={{ fontWeight: 500 }}>{e.factor}</span>
                  <span>{Math.round(e.value * 100)}%</span>
                </div>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${e.value * 100}%`, background: '#00C2A8' }}
                  />
                </div>
              </div>
            ))}
          </>
        )}
 
        {Object.keys(scoreBreakdown).length > 0 && (
          <>
            <div className="heading" style={{ fontSize: 16, margin: '24px 0 12px 0' }}>
              Your Score Breakdown
            </div>
            {Object.entries(scoreBreakdown).map(([key, value]) => (
              <div key={key} className="result-row">
                <div className="result-row-top">
                  <span style={{ fontWeight: 500 }}>{SCORE_LABELS[key] || key}</span>
                  <span>{Math.round(value * 100)}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${value * 100}%`, background: '#90CAF9' }} />
                </div>
              </div>
            ))}
          </>
        )}
 
        {answerBreakdown.length > 0 && (
          <>
            <div className="heading" style={{ fontSize: 16, margin: '28px 0 16px 0' }}>
              Answer Review
            </div>
            {answerBreakdown.map((item, idx) => (
              <div
                key={item.question_id}
                className="review-item"
                style={{
                  flexDirection: 'column',
                  alignItems: 'stretch',
                  borderColor: item.is_correct ? '#00C2A8' : '#FF5DA2',
                }}
              >
                <div className="eyebrow">{item.category} — Question {idx + 1}</div>
                <div style={{ fontWeight: 500, marginBottom: 6 }}>{item.question_text}</div>
                <div className={`review-answer ${item.is_correct ? 'answered' : 'unanswered'}`}>
                  Your answer: {item.selected_option || 'Not answered'}{item.is_correct ? ' ✓' : ' ✗'}
                </div>
                {!item.is_correct && (
                  <div style={{ fontSize: 14, color: '#00C2A8', marginTop: 4 }}>
                    Correct answer: {item.correct_option}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
 
        <div style={{ display: 'flex', gap: 10, marginTop: 28, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={handleDownloadPDF}>
            Download PDF Report
          </button>
          <button className="btn btn-secondary" onClick={onViewHistory}>
            View Past Attempts
          </button>
          <button className="btn btn-secondary" onClick={onRetake}>
            Retake Test
          </button>
        </div>
      </div>
    </div>
  );
}
 
export default ResultDashboard;
 