"""
Database module — SQLite storage for student profiles, test submissions,
and predicted career results.
"""
 
import sqlite3
import json
import os
from datetime import datetime
 
DB_PATH = os.path.join(os.path.dirname(__file__), 'career_app.db')
 
 
def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn
 
 
def init_db():
    conn = get_connection()
    cursor = conn.cursor()
 
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS students (
            student_id TEXT PRIMARY KEY,
            name TEXT,
            created_at TEXT
        )
    ''')
 
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS test_submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id TEXT,
            raw_answers TEXT,
            computed_scores TEXT,
            time_taken_seconds INTEGER,
            submitted_at TEXT,
            FOREIGN KEY (student_id) REFERENCES students (student_id)
        )
    ''')
 
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            submission_id INTEGER,
            predicted_careers TEXT,
            predicted_at TEXT,
            FOREIGN KEY (submission_id) REFERENCES test_submissions (id)
        )
    ''')
 
    conn.commit()
    conn.close()
 
 
def upsert_student(student_id: str, name: str = None):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT student_id FROM students WHERE student_id = ?', (student_id,))
    existing = cursor.fetchone()
 
    if existing is None:
        cursor.execute(
            'INSERT INTO students (student_id, name, created_at) VALUES (?, ?, ?)',
            (student_id, name, datetime.utcnow().isoformat())
        )
    elif name is not None:
        cursor.execute(
            'UPDATE students SET name = ? WHERE student_id = ?',
            (name, student_id)
        )
 
    conn.commit()
    conn.close()
 
 
def save_submission(student_id: str, raw_answers: list, computed_scores: dict, time_taken_seconds: int) -> int:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        '''INSERT INTO test_submissions
           (student_id, raw_answers, computed_scores, time_taken_seconds, submitted_at)
           VALUES (?, ?, ?, ?, ?)''',
        (student_id, json.dumps(raw_answers), json.dumps(computed_scores),
         time_taken_seconds, datetime.utcnow().isoformat())
    )
    submission_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return submission_id
 
 
def save_prediction(submission_id: int, predicted_careers: list):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO predictions (submission_id, predicted_careers, predicted_at) VALUES (?, ?, ?)',
        (submission_id, json.dumps(predicted_careers), datetime.utcnow().isoformat())
    )
    conn.commit()
    conn.close()
 
 
def get_student_history(student_id: str) -> list:
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT ts.id, ts.computed_scores, ts.submitted_at, p.predicted_careers, s.name
        FROM test_submissions ts
        LEFT JOIN predictions p ON p.submission_id = ts.id
        LEFT JOIN students s ON s.student_id = ts.student_id
        WHERE ts.student_id = ?
        ORDER BY ts.submitted_at DESC
    ''', (student_id,))
    rows = cursor.fetchall()
    conn.close()
    return [dict(row) for row in rows]
 