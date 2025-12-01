import React from 'react';

const TextQuestion = ({ question, value, onChange, error }) => {
  return (
    <div className="text-question">
      <div className="form-group">
        <textarea
          className="form-control"
          rows="4"
          placeholder="Enter your response here..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      {error && <div className="text-danger mt-2">{error}</div>}
    </div>
  );
};

export default TextQuestion;
