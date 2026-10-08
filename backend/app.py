"""
Member 5 — Backend Development
Main Flask API — connects frontend, ML model, and database into one pipeline.
 
Endpoints:
  GET  /api/questions          -> returns question bank (no correct answers)
  POST /api/submit-test        -> receives answers, scores them, runs ML model,
                                   stores everything, returns ranked predictions
  GET  /api/history/<student_id> -> returns a student's past test results
"""
 
from flask import Flask, request, jsonify
import joblib
import pandas as pd
import numpy as np
import os
 
import database
import scoring
 
app = Flask(__name__)
 
MODEL_DIR = os.path.join(os.path.dirname(__file__), 'models')
model = joblib.load(os.path.join(MODEL_DIR, 'final_tuned_model.joblib'))
feature_columns = joblib.load(os.path.join(MODEL_DIR, 'feature_columns.joblib'))
label_names = joblib.load(os.path.join(MODEL_DIR, 'label_names.joblib'))
class_order_idx = sorted(label_names.keys())
 
 
# --- Manual CORS handling (no internet access to install flask-cors in this env,
#     but this achieves the same result) ---
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
    return response
 
 
FEATURE_LABELS = {
    'aptitude_score': 'Aptitude Score',
    'technical_score': 'Technical Knowledge',
    'logical_score': 'Logical Reasoning',
    'interest_software': 'Software Interest',
    'interest_data': 'Data Interest',
    'interest_core_engg': 'Core Engineering Interest',
    'interest_management': 'Management Interest',
    'interest_design': 'Design Interest',
    'overall_ability': 'Overall Cognitive Ability',
    'top_interest_gap': 'Interest Decisiveness',
}
 
# Static roadmap content for the Career Details page
CAREER_INFO = {
    'Software Development': {
        'description': 'Designing, building, and maintaining software applications, websites, and systems.',
        'skills': ['Programming (Python/Java/JavaScript)', 'Data Structures & Algorithms', 'Git & Version Control', 'Problem Solving'],
        'roadmap': [
            'Learn a core programming language and build small projects',
            'Study data structures, algorithms, and databases',
            'Build a portfolio (personal projects, open source, internships)',
            'Specialize (web, mobile, backend, etc.) and apply for roles',
        ],
    },
    'Data Analysis': {
        'description': 'Collecting, cleaning, and interpreting data to help organizations make better decisions.',
        'skills': ['Excel / SQL', 'Python (Pandas, NumPy)', 'Data Visualization', 'Statistics'],
        'roadmap': [
            'Learn SQL and spreadsheet analysis fundamentals',
            'Learn Python for data analysis and visualization libraries',
            'Practice on real datasets and build a portfolio of analyses',
            'Learn basic statistics and dashboarding tools (Power BI/Tableau)',
        ],
    },
    'Core Engineering': {
        'description': 'Applying engineering principles to design, build, and maintain physical systems and infrastructure.',
        'skills': ['Core Subject Fundamentals', 'CAD/Simulation Tools', 'Problem Solving', 'Project Management'],
        'roadmap': [
            'Build strong fundamentals in your engineering discipline',
            'Get hands-on with lab work, tools, and simulations',
            'Complete internships/projects in your specialization',
            'Pursue certifications or higher studies as needed',
        ],
    },
    'Management': {
        'description': 'Leading teams, coordinating projects, and making strategic decisions within organizations.',
        'skills': ['Communication', 'Leadership', 'Decision Making', 'Business Fundamentals'],
        'roadmap': [
            'Build communication and leadership skills through team projects',
            'Learn business/management fundamentals',
            'Take on leadership roles in clubs, internships, or projects',
            'Consider an MBA or management certification later',
        ],
    },
    'Design': {
        'description': 'Creating visual, interactive, or product experiences that are both functional and appealing.',
        'skills': ['Design Tools (Figma/Adobe XD)', 'Visual Design Principles', 'User Research', 'Prototyping'],
        'roadmap': [
            'Learn design fundamentals (color, typography, layout)',
            'Learn a design tool and start building a portfolio',
            'Study UX basics — user research and prototyping',
            'Get feedback on real projects and iterate',
        ],
    },
}
 
 
def engineer_features(scores: dict) -> pd.DataFrame:
    """Matches the feature engineering Member 4 applied during training."""
    df = pd.DataFrame([scores])
    df['overall_ability'] = df[['aptitude_score', 'technical_score', 'logical_score']].mean(axis=1)
    interest_cols = ['interest_software', 'interest_data', 'interest_core_engg',
                      'interest_management', 'interest_design']
    sorted_interests = np.sort(df[interest_cols].values, axis=1)
    df['top_interest_gap'] = sorted_interests[:, -1] - sorted_interests[:, -2]
    return df[feature_columns]
 
 
def build_explanation(row: pd.DataFrame, top_n: int = 3) -> list:
    """
    Explains WHY the model leans the way it does for THIS student specifically.
    Ranks features by (global importance x this student's actual value) —
    not importance alone, since a globally important feature the student
    scored 0 on didn't actually drive their result.
    """
    importances = model.feature_importances_
    contributions = []
 
    for feature, importance in zip(feature_columns, importances):
        value = float(row.iloc[0][feature])
        contributions.append((feature, importance, value, importance * value))
 
    contributions.sort(key=lambda x: x[3], reverse=True)
 
    explanation = []
    for feature, importance, value, _ in contributions[:top_n]:
        explanation.append({
            "factor": FEATURE_LABELS.get(feature, feature),
            "value": round(value, 2),
            "importance_percent": round(importance * 100, 1),
        })
    return explanation
 
 
def predict_careers(scores: dict, top_n: int = 3):
    row = engineer_features(scores)
    probs = model.predict_proba(row)[0]
    ranked_idx = np.argsort(probs)[::-1][:top_n]
    predictions = [
        {
            "career": label_names[class_order_idx[i]],
            "confidence": round(float(probs[i]) * 100, 1)
        }
        for i in ranked_idx
    ]
    explanation = build_explanation(row)
    return predictions, explanation
 
 
@app.route('/api/questions', methods=['GET'])
def get_questions():
    return jsonify(scoring.get_public_question_bank())
 
 
@app.route('/api/career-info/<career_name>', methods=['GET'])
def get_career_info(career_name):
    info = CAREER_INFO.get(career_name)
    if info is None:
        return jsonify({"error": "No details available for this career"}), 404
    return jsonify({"career": career_name, **info})
 
 
@app.route('/api/submit-test', methods=['POST'])
def submit_test():
    payload = request.get_json()
 
    if not payload or 'student_id' not in payload or 'answers' not in payload:
        return jsonify({"error": "student_id and answers are required"}), 400
 
    student_id = payload['student_id']
    student_name = payload.get('name', '').strip() or None
    answers = payload['answers']
    time_taken = payload.get('time_taken_seconds', None)
 
    database.upsert_student(student_id, student_name)
 
    computed_scores = scoring.compute_scores(answers)
    final_score = scoring.compute_final_score(answers)
    answer_breakdown = scoring.get_answer_breakdown(answers)
    submission_id = database.save_submission(student_id, answers, computed_scores, time_taken)
 
    predicted_careers, explanation = predict_careers(computed_scores)
    database.save_prediction(submission_id, predicted_careers)
 
    return jsonify({
        "submission_id": submission_id,
        "name": student_name,
        "final_score": final_score,
        "score_breakdown": computed_scores,
        "predicted_careers": predicted_careers,
        "explanation": explanation,
        "answer_breakdown": answer_breakdown
    })
 
 
@app.route('/api/history/<student_id>', methods=['GET'])
def get_history(student_id):
    history = database.get_student_history(student_id)
    return jsonify(history)
 
 
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "ok"})
 
 
if __name__ == '__main__':
    database.init_db()
    app.run(debug=True, port=5000)
 