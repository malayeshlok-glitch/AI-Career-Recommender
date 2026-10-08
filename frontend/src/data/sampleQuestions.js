import rawQuestions from './question_bank.json';

// Reshape Member 1's format to match what our components use,
// and clean up "Interest-interest_software" into a readable label.
const sampleQuestions = rawQuestions.map((q) => {
  let category = q.category;

  if (category.startsWith('Interest-')) {
    const label = category.replace('Interest-interest_', '');
    category = 'Interest — ' + label.charAt(0).toUpperCase() + label.slice(1);
  }

  return {
    id: q.question_id,
    category: category,
    question: q.question_text,
    options: q.options,
    weightDimension: q.weight_dimension,
  };
});

export default sampleQuestions;