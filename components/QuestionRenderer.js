'use client';

import { Form } from 'react-bootstrap';

export default function QuestionRenderer({ question, value, onChange }) {
  const renderQuestionType = () => {
    switch (question.itemType) {
      case 'text':
        return (
          <Form.Control
            as="textarea"
            className="text-area"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter your answer here..."
          />
        );

      case 'yes-no':
        return (
          <div className="likert-scale">
            <div className="likert-option">
              <Form.Check
                type="radio"
                id={`${question.surveyQuestionId}-yes`}
                label="Yes"
                name={question.surveyQuestionId}
                checked={value === 'Yes'}
                onChange={() => onChange('Yes')}
              />
            </div>
            <div className="likert-option">
              <Form.Check
                type="radio"
                id={`${question.surveyQuestionId}-no`}
                label="No"
                name={question.surveyQuestionId}
                checked={value === 'No'}
                onChange={() => onChange('No')}
              />
            </div>
          </div>
        );

      case 'likert':
        // Handle both array format and object with scale property
        const likertOptions = Array.isArray(question.options)
          ? question.options
          : (question.options?.scale || [
              'Strongly Disagree',
              'Disagree',
              'Neutral',
              'Agree',
              'Strongly Agree'
            ]);
        return (
          <div className="likert-scale">
            {likertOptions.map((option, index) => (
              <div key={index} className="likert-option">
                <Form.Check
                  type="radio"
                  id={`${question.surveyQuestionId}-${index}`}
                  label={option}
                  name={question.surveyQuestionId}
                  checked={value === option}
                  onChange={() => onChange(option)}
                />
              </div>
            ))}
          </div>
        );

      case 'multiple-choice':
        // Handle both array format and object with choices property
        const choices = Array.isArray(question.options)
          ? question.options
          : (question.options?.choices || []);
        return (
          <div className="likert-scale">
            {choices.map((choice, index) => (
              <div key={index} className="choice-option">
                <Form.Check
                  type="radio"
                  id={`${question.surveyQuestionId}-${index}`}
                  label={choice}
                  name={question.surveyQuestionId}
                  checked={value === choice}
                  onChange={() => onChange(choice)}
                />
              </div>
            ))}
          </div>
        );

      case 'multiple-other':
        // Handle both array format and object with choices property
        const choicesWithOther = Array.isArray(question.options)
          ? question.options
          : (question.options?.choices || []);

        // Check if value is an object with choice and value properties (JSON format)
        const isOtherObject = value && typeof value === 'object' && value.choice === 'Other';
        const isOtherSelected = isOtherObject || (value && typeof value === 'string' && !choicesWithOther.includes(value) && value !== '');
        const otherValue = isOtherObject ? value.value : (isOtherSelected ? value : '');
        const currentSelection = isOtherObject ? 'Other' : (typeof value === 'string' ? value : '');

        return (
          <div>
            <div className="likert-scale">
              {choicesWithOther.map((choice, index) => (
                <div key={index} className="choice-option">
                  <Form.Check
                    type="radio"
                    id={`${question.surveyQuestionId}-${index}`}
                    label={choice}
                    name={question.surveyQuestionId}
                    checked={currentSelection === choice}
                    onChange={() => onChange(choice)}
                  />
                </div>
              ))}
              <div className="choice-option">
                <Form.Check
                  type="radio"
                  id={`${question.surveyQuestionId}-other`}
                  label="Other"
                  name={question.surveyQuestionId}
                  checked={isOtherSelected}
                  onChange={() => onChange({ choice: 'Other', value: '' })}
                />
              </div>
            </div>
            {isOtherSelected && (
              <Form.Control
                type="text"
                className="text-input mt-3"
                value={otherValue}
                onChange={(e) => onChange({ choice: 'Other', value: e.target.value })}
                placeholder="Please specify..."
              />
            )}
          </div>
        );

      case 'multiselect':
        // Handle both array format and object with choices property
        const multiselectChoices = Array.isArray(question.options)
          ? question.options
          : (question.options?.choices || []);
        const selectedValues = Array.isArray(value) ? value : [];

        const handleMultiselectChange = (choice) => {
          const newValues = selectedValues.includes(choice)
            ? selectedValues.filter(v => v !== choice)
            : [...selectedValues, choice];
          onChange(newValues);
        };

        return (
          <div className="likert-scale">
            {multiselectChoices.map((choice, index) => (
              <div key={index} className="choice-option">
                <Form.Check
                  type="checkbox"
                  id={`${question.surveyQuestionId}-${index}`}
                  label={choice}
                  checked={selectedValues.includes(choice)}
                  onChange={() => handleMultiselectChange(choice)}
                />
              </div>
            ))}
          </div>
        );

      case 'multiselect-other':
        // Handle both array format and object with choices property
        const multiselectWithOtherChoices = Array.isArray(question.options)
          ? question.options
          : (question.options?.choices || []);
        const selectedMultiValues = Array.isArray(value) ? value : [];

        // Separate standard choices and other objects
        const standardSelections = selectedMultiValues.filter(v =>
          typeof v === 'string' && multiselectWithOtherChoices.includes(v)
        );
        const otherObject = selectedMultiValues.find(v =>
          typeof v === 'object' && v.choice === 'Other'
        );
        const hasOtherValue = !!otherObject;
        const currentOtherValue = otherObject ? otherObject.value : '';

        const handleMultiselectOtherChange = (choice) => {
          if (standardSelections.includes(choice)) {
            // Remove the choice
            const newValues = selectedMultiValues.filter(v =>
              !(typeof v === 'string' && v === choice)
            );
            onChange(newValues);
          } else {
            // Add the choice
            const newValues = [...selectedMultiValues, choice];
            onChange(newValues);
          }
        };

        const handleOtherCheckboxChange = () => {
          if (hasOtherValue) {
            // Remove other value
            onChange(selectedMultiValues.filter(v =>
              !(typeof v === 'object' && v.choice === 'Other')
            ));
          } else {
            // Add other object with empty value (will show text field)
            onChange([...selectedMultiValues, { choice: 'Other', value: '' }]);
          }
        };

        const handleOtherTextChange = (text) => {
          const newValues = selectedMultiValues.filter(v =>
            !(typeof v === 'object' && v.choice === 'Other')
          );
          onChange([...newValues, { choice: 'Other', value: text }]);
        };

        return (
          <div>
            <div className="likert-scale">
              {multiselectWithOtherChoices.map((choice, index) => (
                <div key={index} className="choice-option">
                  <Form.Check
                    type="checkbox"
                    id={`${question.surveyQuestionId}-${index}`}
                    label={choice}
                    checked={standardSelections.includes(choice)}
                    onChange={() => handleMultiselectOtherChange(choice)}
                  />
                </div>
              ))}
              <div className="choice-option">
                <Form.Check
                  type="checkbox"
                  id={`${question.surveyQuestionId}-other`}
                  label="Other"
                  checked={hasOtherValue}
                  onChange={handleOtherCheckboxChange}
                />
              </div>
            </div>
            {hasOtherValue && (
              <Form.Control
                type="text"
                className="text-input mt-3"
                value={currentOtherValue}
                onChange={(e) => handleOtherTextChange(e.target.value)}
                placeholder="Please specify..."
              />
            )}
          </div>
        );

      default:
        return <p className="text-danger">Unknown question type</p>;
    }
  };

  return (
    <div className="question-card">
      <div className="question-text">
        {question.questionText}
        {question.isRequired ? (
          <span className="required-badge">* Required</span>
        ) : (
          <span className="optional-badge">(Optional)</span>
        )}
      </div>
      {renderQuestionType()}
    </div>
  );
}

