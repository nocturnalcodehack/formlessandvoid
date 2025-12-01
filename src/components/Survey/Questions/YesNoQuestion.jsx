import React from 'react';

const YesNoQuestion = ({ question, value, onChange, error }) => {
  return (
    <div className="yes-no-question">
      <div className="form-group">
        <div className="d-flex gap-3">
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name={`question-${question.id}`}
              id={`yes-${question.id}`}
              value="yes"
              checked={value === 'yes'}
              onChange={(e) => onChange(e.target.value)}
            />
            <label className="form-check-label" htmlFor={`yes-${question.id}`}>
              Yes
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name={`question-${question.id}`}
              id={`no-${question.id}`}
              value="no"
              checked={value === 'no'}
              onChange={(e) => onChange(e.target.value)}
            />
            <label className="form-check-label" htmlFor={`no-${question.id}`}>
              No
            </label>
          </div>
        </div>
      </div>
      {error && <div className="text-danger mt-2">{error}</div>}
    </div>
  );
};

export default YesNoQuestion;
