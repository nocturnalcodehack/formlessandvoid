import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import YesNoQuestion from './Questions/YesNoQuestion';
import LikertQuestion from './Questions/LikertQuestion';
import MultipleChoiceQuestion from './Questions/MultipleChoiceQuestion';
import MultipleChoiceOtherQuestion from './Questions/MultipleChoiceOtherQuestion';
import MultiselectQuestion from './Questions/MultiselectQuestion';
import TextQuestion from './Questions/TextQuestion';

const SurveyForm = ({ survey, onComplete }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState({});
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const questions = survey?.questions || [];
  const totalQuestions = questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  const handleResponse = (questionId, value, data = null) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: { value, data }
    }));

    // Clear validation error for this question
    setValidationErrors(prev => ({
      ...prev,
      [questionId]: null
    }));
  };

  const validateCurrentQuestion = () => {
    const question = questions[currentQuestion];
    if (!question.isRequired) return true;

    const response = responses[question.id];
    if (!response || !response.value || response.value.trim() === '') {
      setValidationErrors(prev => ({
        ...prev,
        [question.id]: 'This question is required'
      }));
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateCurrentQuestion()) {
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(prev => prev + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentQuestion()) return;

    setIsSubmitting(true);
    try {
      const sessionId = localStorage.getItem('surveySessionId') || uuidv4();
      localStorage.setItem('surveySessionId', sessionId);

      const formattedResponses = Object.entries(responses).map(([questionId, response]) => ({
        questionId: parseInt(questionId),
        value: response.value,
        data: response.data
      }));

      const response = await fetch('/api/survey/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          surveyId: survey.id,
          responses: formattedResponses,
          email: email.trim() || null,
          sessionId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit survey');
      }

      const result = await response.json();
      
      // Clear the session ID from localStorage after successful completion
      localStorage.removeItem('surveySessionId');
      
      onComplete(result.thankYouMessage);
    } catch (error) {
      alert('Failed to submit survey. Please try again.');
      console.error('Survey submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question) => {
    const currentResponse = responses[question.id]?.value || '';
    const error = validationErrors[question.id];

    switch (question.questionType) {
      case 'text':
        return (
          <TextQuestion
            key={question.id}
            question={question}
            value={currentResponse}
            onChange={(value) => handleResponse(question.id, value)}
            error={error}
          />
        );
      case 'yes_no':
        return (
          <YesNoQuestion
            key={question.id}
            question={question}
            value={currentResponse}
            onChange={(value) => handleResponse(question.id, value)}
            error={error}
          />
        );
      case 'likert_5':
        return (
          <LikertQuestion
            key={question.id}
            question={question}
            value={currentResponse}
            onChange={(value) => handleResponse(question.id, value)}
            error={error}
          />
        );
      case 'multiple_choice':
        return (
          <MultipleChoiceQuestion
            key={question.id}
            question={question}
            value={currentResponse}
            onChange={(value) => handleResponse(question.id, value)}
            error={error}
          />
        );
      case 'multiple_choice_other':
        return (
          <MultipleChoiceOtherQuestion
            key={question.id}
            question={question}
            value={currentResponse}
            onChange={(value, data) => handleResponse(question.id, value, data)}
            error={error}
          />
        );
      case 'multiselect':
        return (
          <MultiselectQuestion
            key={question.id}
            question={question}
            value={currentResponse}
            onChange={(value, data) => handleResponse(question.id, value, data)}
            error={error}
          />
        );
      default:
        return <div>Unknown question type: {question.questionType}</div>;
    }
  };

  if (totalQuestions === 0) {
    return (
      <div className="survey-form">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card">
                <div className="card-body text-center">
                  <h3>No Questions Available</h3>
                  <p>This survey doesn't have any questions yet.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestionData = questions[currentQuestion];
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  // Debug logging to check question data
  console.log('SurveyForm - currentQuestionData:', currentQuestionData);
  console.log('SurveyForm - survey:', survey);
  console.log('SurveyForm - questions:', questions);

  return (
    <div className="survey-form">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card">
              <div className="card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="mb-0 text-dark">{survey.title}</h4>
                  <span className="badge bg-primary">
                    {currentQuestion + 1} of {totalQuestions}
                  </span>
                </div>
              </div>
              <div className="card-body">
                {/* Progress Bar */}
                <div className="progress mb-4">
                  <div
                    className="progress-bar"
                    role="progressbar"
                    style={{ width: `${progress}%` }}
                    aria-valuenow={progress}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  >
                    {Math.round(progress)}%
                  </div>
                </div>

                {/* Question */}
                <div className="question-container">
                  <div className="question-header mb-3">
                    <h5 className="question-text" style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#333' }}>
                      {currentQuestionData?.questionText || 'Question text not available'}
                      {currentQuestionData?.isRequired && (
                        <span className="text-danger ms-1" style={{ fontSize: '1.5rem' }}>*</span>
                      )}
                    </h5>
                    {currentQuestionData?.helpText && (
                      <small className="text-muted d-block mt-2" style={{ fontSize: '0.9rem' }}>
                        {currentQuestionData.helpText}
                      </small>
                    )}
                  </div>

                  {/* Render Question Component */}
                  <div className="question-input">
                    {currentQuestionData ? renderQuestion(currentQuestionData) : <div>Loading question...</div>}
                  </div>
                </div>

                {/* Email Input (only on last question) */}
                {isLastQuestion && (
                  <div className="email-section mt-4 pt-4 border-top">
                    <div className="form-group">
                      <label htmlFor="email">
                        Email Address (Optional)
                        <small className="text-muted ms-2">
                          Leave blank to submit anonymously
                        </small>
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <div className="d-flex justify-content-between">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                  >
                    Previous
                  </button>

                  {isLastQuestion ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Survey'}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={handleNext}
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurveyForm;
