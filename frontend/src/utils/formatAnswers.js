export function formatAnswers(questions, answers) {
  return questions.map((q) => ({
    question_id: q.id,
    category: q.category,
    selected_option: answers[q.id] || null,
    weight_dimension: q.weightDimension || null,
  }));
}