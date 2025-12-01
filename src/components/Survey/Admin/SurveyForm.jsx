import React, { useState } from 'react';
import QuestionManager from './QuestionManager';

const SurveyForm = ({ survey = null, onSave, saving = false, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: survey?.title || '',
    description: survey?.description || '',
    isActive: survey?.isActive || false,
    startDate: survey?.startDate ? new Date(survey.startDate).toISOString().slice(0, 10) : '',
    endDate: survey?.endDate ? new Date(survey.endDate).toISOString().slice(0, 10) : '',
    thankYouMessage: survey?.thankYouMessage || 'Thank you for completing our survey!',
    thankYouEmailSubject: survey?.thankYouEmailSubject || 'Thank you for your participation',
    thankYouEmailBody: survey?.thankYouEmailBody || 'Thank you for taking the time to complete our survey. Your responses are valuable to us.',
    createdBy: survey?.createdBy || 'Admin'
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when field is updated
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) >= new Date(formData.endDate)) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const formSubmitData = {
        ...formData,
        endDate: formData.endDate ? formData.endDate + 'T23:59:59.999Z' : null
      };
      onSave(formSubmitData);
    }
  };

  return (
    <div className="survey-form-admin">
      <form onSubmit={handleSubmit}>
        <div className="card mb-4">
          <div className="card-header">
            <h3>Survey Details</h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-8">
                <div className="form-group mb-3">
                  <label htmlFor="title" style={{ color: '#333', fontWeight: 'normal', display: 'inline-block' }}>Survey Title *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.title ? 'is-invalid' : ''}`}
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="Enter survey title"
                  />
                  {errors.title && <div className="invalid-feedback">{errors.title}</div>}
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="description" style={{ color: '#333', fontWeight: 'normal', display: 'inline-block' }}>Description</label>
                  <textarea
                    className="form-control"
                    id="description"
                    rows="3"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Brief description of the survey"
                  />
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-group mb-3">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => handleChange('isActive', e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="isActive" style={{ color: '#333', fontWeight: 'normal', display: 'inline-block' }}>
                      Active Survey
                    </label>
                  </div>
                  <small className="form-text text-muted">
                    Only active surveys can be accessed by respondents
                  </small>
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="startDate" style={{ color: '#333', fontWeight: 'normal', display: 'inline-block' }}>Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    id="startDate"
                    value={formData.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                  />
                </div>

                <div className="form-group mb-3">
                  <label htmlFor="endDate" style={{ color: '#333', fontWeight: 'normal', display: 'inline-block' }}>End Date</label>
                  <input
                    type="date"
                    className={`form-control ${errors.endDate ? 'is-invalid' : ''}`}
                    id="endDate"
                    value={formData.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                  />
                  {errors.endDate && <div className="invalid-feedback">{errors.endDate}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header">
            <h3>Thank You Messages</h3>
          </div>
          <div className="card-body">
            <div className="form-group mb-3">
              <label htmlFor="thankYouMessage" style={{ color: '#333', fontWeight: 'normal', display: 'inline-block' }}>Thank You Message</label>
              <textarea
                className="form-control"
                id="thankYouMessage"
                rows="2"
                value={formData.thankYouMessage}
                onChange={(e) => handleChange('thankYouMessage', e.target.value)}
                placeholder="Message shown to users after completing the survey"
              />
            </div>

            <div className="row">
              <div className="col-md-6">
                <div className="form-group mb-3">
                  <label htmlFor="thankYouEmailSubject" style={{ color: '#333', fontWeight: 'normal', display: 'inline-block' }}>Email Subject</label>
                  <input
                    type="text"
                    className="form-control"
                    id="thankYouEmailSubject"
                    value={formData.thankYouEmailSubject}
                    onChange={(e) => handleChange('thankYouEmailSubject', e.target.value)}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-group mb-3">
                  <label htmlFor="createdBy" style={{ color: '#333', fontWeight: 'normal', display: 'inline-block' }}>Created By</label>
                  <input
                    type="text"
                    className="form-control"
                    id="createdBy"
                    value={formData.createdBy}
                    onChange={(e) => handleChange('createdBy', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-group mb-3">
              <label htmlFor="thankYouEmailBody" style={{ color: '#333', fontWeight: 'normal', display: 'inline-block' }}>Email Body</label>
              <textarea
                className="form-control"
                id="thankYouEmailBody"
                rows="3"
                value={formData.thankYouEmailBody}
                onChange={(e) => handleChange('thankYouEmailBody', e.target.value)}
                placeholder="Email content sent to respondents"
              />
            </div>
          </div>
        </div>

        <div className="form-actions mb-4">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : isEditing ? 'Update Survey' : 'Create Survey'}
          </button>
          <button
            type="button"
            className="btn btn-secondary ms-2"
            onClick={() => window.history.back()}
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Question Management Section - Only show for existing surveys */}
      {isEditing && survey && (
        <QuestionManager surveyId={survey.id} questions={survey.questions || []} />
      )}
    </div>
  );
};

export default SurveyForm;
