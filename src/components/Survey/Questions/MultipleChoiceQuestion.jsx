import React from 'react';

const MultipleChoiceQuestion = ({ question, value, onChange, error }) => {
  const options = question.options || [];

  // Debug logging to see what we're receiving
  console.log('MultipleChoiceQuestion - question:', question);
  console.log('MultipleChoiceQuestion - options:', options);
  console.log('MultipleChoiceQuestion - options type:', typeof options);
  console.log('MultipleChoiceQuestion - options length:', options.length);

  return (
    <div className="multiple-choice-question">
      <div className="form-group">
        {options.length === 0 && (
          <div className="alert alert-warning">
            No options available for this question.
          </div>
        )}
        {options.map((option, index) => {
          // Handle both string options and object options with text/value properties
          const optionText = typeof option === 'string' ? option : option.text;
          const optionValue = typeof option === 'string' ? option : option.value;

          console.log(`MultipleChoiceQuestion - Option ${index}:`, { option, optionText, optionValue });

          return (
            <div key={index} className="form-check mb-2">
              <input
                className="form-check-input"
                type="radio"
                name={`question-${question.id}`}
                id={`option-${question.id}-${index}`}
                value={optionValue}
                checked={value === optionValue}
                onChange={(e) => onChange(e.target.value)}
              />
              <label
                className="form-check-label"
                htmlFor={`option-${question.id}-${index}`}
              >
                {optionText || 'Empty option'}
              </label>
            </div>
          );
        })}
      </div>
      {error && <div className="text-danger mt-2">{error}</div>}
    </div>
  );
};

export default MultipleChoiceQuestion;
