import React from 'react';

const LikertQuestion = ({ question, value, onChange, error }) => {
  const options = [
    { value: '1', label: 'Strongly Disagree' },
    { value: '2', label: 'Disagree' },
    { value: '3', label: 'Neutral' },
    { value: '4', label: 'Agree' },
    { value: '5', label: 'Strongly Agree' }
  ];

  // Debug logging to check if data is being passed correctly
  console.log('LikertQuestion - question:', question);
  console.log('LikertQuestion - value:', value);
  console.log('LikertQuestion - options:', options);

  // Safety check for question object
  if (!question || !question.id) {
    console.error('LikertQuestion: Invalid question object', question);
    return <div className="alert alert-danger">Error: Invalid question data</div>;
  }

  return (
    <div className="likert-question">
      <div className="form-group">
        <div className="likert-scale">
          <div className="mb-3">
            <small className="text-muted">Please select your level of agreement:</small>
          </div>
          {options.map((option) => {
            const radioId = `likert-${question.id}-${option.value}`;
            const radioName = `question-${question.id}`;

            return (
              <div key={option.value} className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name={radioName}
                  id={radioId}
                  value={option.value}
                  checked={value === option.value}
                  onChange={(e) => {
                    console.log('Likert option selected:', e.target.value);
                    onChange(e.target.value);
                  }}
                />
                <label
                  className="form-check-label"
                  htmlFor={radioId}
                >
                  <span style={{ fontWeight: 'bold', marginRight: '8px' }}>
                    {option.value}
                  </span>
                  - {option.label}
                </label>
              </div>
            );
          })}
        </div>
      </div>
      {error && (
        <div className="text-danger mt-3">
          <small>{error}</small>
        </div>
      )}
    </div>
  );
};

export default LikertQuestion;
