import React, { useState, useEffect } from 'react';

const MultiselectQuestion = ({ question, value, onChange, error }) => {
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [otherText, setOtherText] = useState('');
  const [showOther, setShowOther] = useState(false);

  // Debug logging
  console.log('MultiselectQuestion - question:', question);
  console.log('MultiselectQuestion - options:', question.options);
  console.log('MultiselectQuestion - options length:', question.options?.length || 0);

  // Initialize from existing value
  useEffect(() => {
    if (value) {
      try {
        const parsedValue = typeof value === 'string' ? JSON.parse(value) : value;
        if (parsedValue && typeof parsedValue === 'object') {
          setSelectedOptions(parsedValue.selected || []);
          setOtherText(parsedValue.other || '');
          setShowOther(parsedValue.hasOther || false);
        }
      } catch (e) {
        // If parsing fails, treat as simple string array
        if (Array.isArray(value)) {
          setSelectedOptions(value);
        }
      }
    }
  }, [value]);

  const handleOptionChange = (optionValue, checked) => {
    let newSelected;
    if (checked) {
      newSelected = [...selectedOptions, optionValue];
    } else {
      newSelected = selectedOptions.filter(opt => opt !== optionValue);
    }
    
    setSelectedOptions(newSelected);
    updateValue(newSelected, otherText, showOther);
  };

  const handleOtherToggle = (checked) => {
    setShowOther(checked);
    if (!checked) {
      setOtherText('');
      updateValue(selectedOptions, '', false);
    } else {
      updateValue(selectedOptions, otherText, true);
    }
  };

  const handleOtherTextChange = (text) => {
    setOtherText(text);
    updateValue(selectedOptions, text, showOther);
  };

  const updateValue = (selected, other, hasOther) => {
    const responseValue = {
      selected: selected,
      other: other,
      hasOther: hasOther
    };
    
    // Pass as JSON string for the main value, and additional data
    onChange(JSON.stringify(responseValue), {
      selectedCount: selected.length,
      hasOtherResponse: hasOther && other.trim() !== ''
    });
  };

  const options = question.options || [];

  return (
    <div className="multiselect-question">
      <div className="form-group">
        {options.length === 0 && (
          <div className="alert alert-warning">
            No options available for this question.
          </div>
        )}
        {/* Regular options */}
        <div className="multiselect-options">
          {options.map((option, index) => {
            // Handle both string options and object options with text/value properties
            const optionText = typeof option === 'string' ? option : option.text;
            const optionValue = typeof option === 'string' ? option : option.value;

            console.log(`MultiselectQuestion - Option ${index}:`, { option, optionText, optionValue });

            return (
              <div key={index} className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`multiselect-${question.id}-${index}`}
                  checked={selectedOptions.includes(optionValue)}
                  onChange={(e) => handleOptionChange(optionValue, e.target.checked)}
                />
                <label className="form-check-label" htmlFor={`multiselect-${question.id}-${index}`}>
                  {optionText || 'Empty option'}
                </label>
              </div>
            );
          })}
        </div>
        
        {/* Other option */}
        <div className="multiselect-options-other">
          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              id={`multiselect-other-${question.id}`}
              checked={showOther}
              onChange={(e) => handleOtherToggle(e.target.checked)}
            />
            <label className="form-check-label" htmlFor={`multiselect-other-${question.id}`}>
              Other (please specify):
            </label>
          </div>

          {/* Other text input */}
          {showOther && (
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
      </div>
      {error && <div className="text-danger mt-2">{error}</div>}
    </div>
  );
};

export default MultiselectQuestion;
