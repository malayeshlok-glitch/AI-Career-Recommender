"""
Scoring logic — converts a student's raw MCQ answers (as sent by the frontend)
into the 8 normalized 0-1 scores the ML model expects:
aptitude_score, technical_score, logical_score,
interest_software, interest_data, interest_core_engg,
interest_management, interest_design
 
The question bank (with correct answers) lives server-side only —
the frontend never receives correct answers, just question text/options.
"""
 
import json
import os
 
QUESTION_BANK_PATH = os.path.join(os.path.dirname(__file__), 'data', 'question_bank.json')
 
with open(QUESTION_BANK_PATH, 'r', encoding='utf-8') as f:
    QUESTION_BANK = {q['question_id']: q for q in json.load(f)}
 
# Maps the 5-point agreement scale used on interest questions to a 0-1 value
LIKERT_SCALE = {
    'Strongly Disagree': 0.0,
    'Disagree': 0.25,
    'Neutral': 0.5,
    'Agree': 0.75,
    'Strongly Agree': 1.0,
}
 
SCORED_CATEGORIES = {
    'Aptitude': 'aptitude_score',
    'Technical': 'technical_score',
    'Logical': 'logical_score',
}
 
OPTION_LETTERS = ['A', 'B', 'C', 'D', 'E']
 
 
def get_correct_answer_text(question: dict) -> str:
    """
    Question bank stores correct_option as a letter (A/B/C/D) — an index into
    the options array. The frontend sends the actual option TEXT the student
    clicked, so we resolve the letter to text here before comparing.
    """
    correct_letter = question.get('correct_option')
    if correct_letter is None:
        return None
    try:
        index = OPTION_LETTERS.index(correct_letter)
        return question['options'][index]
    except (ValueError, IndexError):
        return None
 
 
def compute_scores(answers: list) -> dict:
    """
    answers: list of {"question_id": str, "selected_option": str}
    Returns: dict with the 8 keys the ML model expects, each 0-1.
    """
    category_correct = {cat: 0 for cat in SCORED_CATEGORIES}
    category_total = {cat: 0 for cat in SCORED_CATEGORIES}
 
    interest_sums = {}
    interest_counts = {}
 
    for ans in answers:
        qid = ans.get('question_id')
        selected = ans.get('selected_option')
        question = QUESTION_BANK.get(qid)
 
        if question is None or selected is None:
            continue
 
        category = question['category']
 
        if category in SCORED_CATEGORIES:
            category_total[category] += 1
            correct_text = get_correct_answer_text(question)
            if selected == correct_text:
                category_correct[category] += 1
 
        elif category.startswith('Interest-'):
            dimension = question.get('weight_dimension')
            if dimension is None:
                continue
            value = LIKERT_SCALE.get(selected)
            if value is None:
                continue
            interest_sums[dimension] = interest_sums.get(dimension, 0) + value
            interest_counts[dimension] = interest_counts.get(dimension, 0) + 1
 
    scores = {}
    for category, score_key in SCORED_CATEGORIES.items():
        total = category_total[category]
        scores[score_key] = round(category_correct[category] / total, 4) if total > 0 else 0.0
 
    for dimension in ['interest_software', 'interest_data', 'interest_core_engg',
                       'interest_management', 'interest_design']:
        count = interest_counts.get(dimension, 0)
        scores[dimension] = round(interest_sums.get(dimension, 0) / count, 4) if count > 0 else 0.0
 
    return scores
 
 
def compute_final_score(answers: list) -> dict:
    """
    Computes an overall "final score" for display purposes — total correct
    answers out of total scoreable questions (Aptitude + Technical + Logical).
    Interest-based questions have no right/wrong answer, so they're excluded.
    Returns: {"correct": int, "total": int, "percentage": float}
    """
    correct = 0
    total = 0
 
    for ans in answers:
        qid = ans.get('question_id')
        selected = ans.get('selected_option')
        question = QUESTION_BANK.get(qid)
 
        if question is None or selected is None:
            continue
        if question['category'] not in SCORED_CATEGORIES:
            continue
 
        total += 1
        if selected == get_correct_answer_text(question):
            correct += 1
 
    percentage = round((correct / total) * 100, 1) if total > 0 else 0.0
    return {"correct": correct, "total": total, "percentage": percentage}
 
 
def get_answer_breakdown(answers: list) -> list:
    """
    Builds a per-question review list for scored categories (Aptitude,
    Technical, Logical) — shows what the student picked, whether it was
    correct, and what the correct answer was. Interest-based questions
    are excluded since they have no right/wrong answer.
    """
    breakdown = []
 
    for ans in answers:
        qid = ans.get('question_id')
        selected = ans.get('selected_option')
        question = QUESTION_BANK.get(qid)
 
        if question is None or question['category'] not in SCORED_CATEGORIES:
            continue
 
        correct_text = get_correct_answer_text(question)
 
        breakdown.append({
            "question_id": qid,
            "question_text": question['question_text'],
            "category": question['category'],
            "selected_option": selected,
            "correct_option": correct_text,
            "is_correct": selected == correct_text,
        })
 
    return breakdown
 
 
def get_public_question_bank() -> list:
    """
    Returns the question bank WITHOUT correct_option — this is what's safe
    to send to the frontend (so students can't see answers in the network tab).
    """
    public_questions = []
    for q in QUESTION_BANK.values():
        public_questions.append({
            'question_id': q['question_id'],
            'category': q['category'],
            'question_text': q['question_text'],
            'options': q['options'],
        })
    return public_questions
 