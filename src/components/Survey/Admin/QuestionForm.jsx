import React, { useState, useEffect } from 'react';

const QuestionForm = ({ question = null, onSave, onCancel, loading = false, isEditing = false }) => {
  const [formData, setFormData] = useState({
    questionText: question?.questionText || '',
    questionType: question?.questionType || 'text',
    options: question?.options || [],
    isRequired: question?.isRequired !== undefined ? question.isRequired : true,
    helpText: question?.helpText || ''
  });

  const [optionInput, setOptionInput] = useState('');
  const [errors, setErrors] = useState({});

  const questionTypes = [
    { value: 'text', label: 'Text Response' },
    { value: 'yes_no', label: 'Yes/No' },
    { value: 'likert_5', label: '5-Point Likert Scale' },
    { value: 'multiple_choice', label: 'Multiple Choice' },
    { value: 'multiple_choice_other', label: 'Multiple Choice with Other' },
    { value: 'multiselect', label: 'Multi-Select with Other' }
  ];

  const requiresOptions = ['multiple_choice', 'multiple_choice_other', 'multiselect'];

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear options when changing to a type that doesn't need them
    if (field === 'questionType' && !requiresOptions.includes(value)) {
      setFormData(prev => ({
        ...prev,
        options: []
      }));
    }

    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const addOption = () => {
    if (optionInput.trim()) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, optionInput.trim()]
      }));
      setOptionInput('');
    }
  };

  const removeOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const moveOption = (index, direction) => {
    const newOptions = [...formData.options];
    const newIndex = direction === 'up' ? index - 1 : index + 1;

    // Check if move is valid
    if (newIndex < 0 || newIndex >= newOptions.length) return;

    // Swap options
    [newOptions[index], newOptions[newIndex]] = [newOptions[newIndex], newOptions[index]];

    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.questionText.trim()) {
      newErrors.questionText = 'Question text is required';
    }

    if (requiresOptions.includes(formData.questionType) && formData.options.length === 0) {
      newErrors.options = 'At least one option is required for this question type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addOption();
    }
  };

  return (
    <div className="question-form">
      <form onSubmit={handleSubmit}>
        <div className="row">
          <div className="col-md-8">
            <div className="form-group mb-3">
              <label htmlFor="questionText">Question Text *</label>
              <textarea
                className={`form-control ${errors.questionText ? 'is-invalid' : ''}`}
                id="questionText"
                rows="3"
                value={formData.questionText}
                onChange={(e) => handleChange('questionText', e.target.value)}
                placeholder="Enter your question"
              />
              {errors.questionText && <div className="invalid-feedback">{errors.questionText}</div>}
            </div>

            <div className="form-group mb-3">
              <label htmlFor="helpText">Help Text (Optional)</label>
              <input
                type="text"
                className="form-control"
                id="helpText"
                value={formData.helpText}
                onChange={(e) => handleChange('helpText', e.target.value)}
                placeholder="Additional instructions or clarification"
              />
            </div>
          </div>

          <div className="col-md-4">
            <div className="form-group mb-3">
              <label htmlFor="questionType">Question Type *</label>
              <select
                className="form-control"
                id="questionType"
                value={formData.questionType}
                onChange={(e) => handleChange('questionType', e.target.value)}
              >
                {questionTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group mb-3">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="isRequired"
                  checked={formData.isRequired}
                  onChange={(e) => handleChange('isRequired', e.target.checked)}
                />
                <label className="form-check-label" htmlFor="isRequired">
                  Required Question
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Options Section for Multiple Choice Questions */}
        {requiresOptions.includes(formData.questionType) && (
          <div className="form-group mb-3">
            <label>Answer Options *</label>
            <div className="input-group mb-2">
              <input
                type="text"
                className="form-control"
                value={optionInput}
                onChange={(e) => setOptionInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter an option"
              />
              <button
                type="button"
                className="btn btn-outline-secondary"
                onClick={addOption}
              >
                Add Option
              </button>
            </div>

            {errors.options && <div className="text-danger small">{errors.options}</div>}

            {formData.options.length > 0 && (
              <div className="options-list">
                <h6>Current Options:</h6>
                <ul className="list-group">
                  {formData.options.map((option, index) => (
                    <li key={index} className="list-group-item d-flex justify-content-between align-items-center">
                      <span className="fw-normal">{option}</span>
                      <div className="btn-group" role="group">
                        {index > 0 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => moveOption(index, 'up')}
                            title="Move up"
                          >
                            ↑
                          </button>
                        )}
                        {index < formData.options.length - 1 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => moveOption(index, 'down')}
                            title="Move down"
                          >
                            ↓
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeOption(index)}
                          title="Remove option"
                        >
                          ×
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                {(formData.questionType === 'multiple_choice_other' || formData.questionType === 'multiselect') && (
                  <small className="text-muted mt-2 d-block">
                    Note: An "Other (specify)" option will be automatically added for respondents.
                  </small>
                )}
              </div>
            )}
          </div>
        )}

        {/* Question Type Description */}
        <div className="form-group mb-3">
          <div className="alert alert-info">
            {formData.questionType === 'text' && (
              <small>Respondents will see a text input field for their answer.</small>
            )}
            {formData.questionType === 'yes_no' && (
              <small>Respondents will choose between Yes and No options.</small>
            )}
            {formData.questionType === 'likert_5' && (
              <small>Respondents will rate on a scale from 1 (Strongly Disagree) to 5 (Strongly Agree).</small>
            )}
            {formData.questionType === 'multiple_choice' && (
              <small>Respondents will select one option from the choices you provide.</small>
            )}
            {formData.questionType === 'multiple_choice_other' && (
              <small>Respondents will select one option or specify their own answer in an "Other" field.</small>
            )}
            {formData.questionType === 'multiselect' && (
              <small>Respondents can select multiple options from the choices you provide, plus an optional "Other" field.</small>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEditing ? 'Update Question' : 'Add Question'}
          </button>
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuestionForm;
