import React, { useState, useEffect } from 'react';

const MultipleChoiceOtherQuestion = ({ question, value, onChange, error }) => {
  const options = question.options || [];
  const [otherText, setOtherText] = useState('');
  const [selectedValue, setSelectedValue] = useState(value || '');

  // Debug logging
  console.log('MultipleChoiceOtherQuestion - question:', question);
  console.log('MultipleChoiceOtherQuestion - options:', options);
  console.log('MultipleChoiceOtherQuestion - options length:', options.length);

  useEffect(() => {
    // Handle both string options and object options
    const optionValues = options.map(option =>
      typeof option === 'string' ? option : option.value
    );

    // If the current value is not in the predefined options, it's an "other" value
    if (value && !optionValues.includes(value)) {
      setSelectedValue('other');
      setOtherText(value);
    } else {
      setSelectedValue(value || '');
      setOtherText('');
    }
  }, [value, options]);

  const handleOptionChange = (selectedOption) => {
    setSelectedValue(selectedOption);
    if (selectedOption === 'other') {
      onChange(otherText, { isOther: true });
    } else {
      setOtherText('');
      onChange(selectedOption, { isOther: false });
    }
  };

  const handleOtherTextChange = (text) => {
    setOtherText(text);
    if (selectedValue === 'other') {
      onChange(text, { isOther: true });
    }
  };

  return (
    <div className="multiple-choice-other-question">
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

          console.log(`MultipleChoiceOtherQuestion - Option ${index}:`, { option, optionText, optionValue });

          return (
            <div key={index} className="form-check mb-2">
              <input
                className="form-check-input"
                type="radio"
                name={`question-${question.id}`}
                id={`option-${question.id}-${index}`}
                value={optionValue}
                checked={selectedValue === optionValue}
                onChange={(e) => handleOptionChange(e.target.value)}
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

        {/* Other option */}
        <div className="form-check mb-2">
          <input
            className="form-check-input"
            type="radio"
            name={`question-${question.id}`}
            id={`other-${question.id}`}
            value="other"
            checked={selectedValue === 'other'}
            onChange={(e) => handleOptionChange(e.target.value)}
          />
          <label
            className="form-check-label"
            htmlFor={`other-${question.id}`}
          >
            Other (please specify):
          </label>
        </div>

        {/* Other text input */}
        {selectedValue === 'other' && (
          <div className="mt-2 ms-4">
            <input
              type="text"
              className="form-control"
              placeholder="Please specify..."
              value={otherText}
              onChange={(e) => handleOtherTextChange(e.target.value)}
            />
          </div>
        )}
      </div>
      {error && <div className="text-danger mt-2">{error}</div>}
    </div>
  );
};

export default MultipleChoiceOtherQuestion;
