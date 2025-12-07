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
        const likertOptions = question.options?.scale || [
          'Strongly Disagree',
          'Disagree',
          'Neutral',
          'Agree',
          'Strongly Agree'
        ];
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
        const choices = question.options?.choices || [];
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
        const choicesWithOther = question.options?.choices || [];
        const isOtherSelected = value && !choicesWithOther.includes(value) && value !== '';
        const otherValue = isOtherSelected ? value : '';

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
                    checked={value === choice}
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
                  onChange={() => onChange('')}
                />
              </div>
            </div>
            {isOtherSelected && (
              <Form.Control
                type="text"
                className="text-input mt-3"
                value={otherValue}
                onChange={(e) => onChange(e.target.value)}
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

