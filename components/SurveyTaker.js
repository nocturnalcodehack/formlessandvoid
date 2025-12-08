'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container, ProgressBar } from 'react-bootstrap';
import QuestionRenderer from './QuestionRenderer';
import ThankYouPage from './ThankYouPage';

export default function SurveyTaker({ surveyId }) {
  const router = useRouter();
  const [survey, setSurvey] = useState(null);
  const [respondentId, setRespondentId] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState({});
  const [visitCounts, setVisitCounts] = useState({});
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showThankYou, setShowThankYou] = useState(false);

  useEffect(() => {
    initializeSurvey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [surveyId]);

  useEffect(() => {
    if (survey && survey.questions && survey.questions.length > 0) {
      setQuestionStartTime(Date.now());
      const questionId = survey.questions[currentQuestionIndex]?.surveyQuestionId;
      if (questionId) {
        setVisitCounts(prev => ({
          ...prev,
          [questionId]: (prev[questionId] || 0) + 1
        }));
      }
    }
  }, [currentQuestionIndex, survey]);

  const initializeSurvey = async () => {
    try {
      // Fetch survey details
      const surveyResponse = await fetch(`/api/surveys/${surveyId}`);
      if (!surveyResponse.ok) {
        throw new Error('Survey not found');
      }
      const surveyData = await surveyResponse.json();
      setSurvey(surveyData);

      // Create respondent
      const respondentResponse = await fetch('/api/respondents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveyId })
      });

      if (!respondentResponse.ok) {
        throw new Error('Failed to initialize survey');
      }

      const { respondentId: newRespondentId } = await respondentResponse.json();
      setRespondentId(newRespondentId);

      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const saveResponse = async (questionId, value, timeSpent) => {
    if (!respondentId) return;

    try {
      // Serialize arrays and objects to JSON string for complex question types
      let serializedValue;
      if (Array.isArray(value)) {
        // For multiselect and multiselect-other: serialize array
        serializedValue = JSON.stringify(value);
      } else if (typeof value === 'object' && value !== null) {
        // For multiple-other with object format: serialize object
        serializedValue = JSON.stringify(value);
      } else {
        // For simple string values
        serializedValue = value;
      }

      await fetch('/api/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          respondentId,
          surveyQuestionId: questionId,
          responseValue: serializedValue,
          timeSpentSeconds: Math.floor(timeSpent / 1000),
          visitCount: visitCounts[questionId] || 1
        })
      });

      // Update respondent status to in-progress if this is the first response
      if (Object.keys(responses).length === 0) {
        await fetch(`/api/respondents/${respondentId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'in-progress' })
        });
      }
    } catch (error) {
      console.error('Error saving response:', error);
    }
  };

  const handleResponseChange = (value) => {
    const questionId = survey.questions[currentQuestionIndex].surveyQuestionId;
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const isEmptyAnswer = (value) => {
    if (value === null || value === undefined) return true;
    if (Array.isArray(value)) {
      // Empty array or all entries are empty/null
      return value.length === 0 || value.every(v =>
        v === null || v === undefined || (typeof v === 'string' && v.trim() === '')
      );
    }
    if (typeof value === 'string') return value.trim() === '';
    return false;
  };

  const handleNext = async () => {
    const currentQuestion = survey.questions[currentQuestionIndex];
    const questionId = currentQuestion.surveyQuestionId;
    const timeSpent = Date.now() - questionStartTime;
    const currentResponse = responses[questionId];

    // Validate required fields
    if (currentQuestion.isRequired && isEmptyAnswer(currentResponse)) {
      alert('This question is required. Please provide an answer before continuing.');
      return;
    }

    // Save response - preserve empty arrays for multiselect, use empty string for others
    const valueToSave = currentResponse !== undefined && currentResponse !== null
      ? currentResponse
      : (currentQuestion.itemType === 'multiselect' || currentQuestion.itemType === 'multiselect-other' ? [] : '');
    await saveResponse(questionId, valueToSave, timeSpent);

    // Move to next question or thank you page
    if (currentQuestionIndex < survey.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setShowThankYou(true);
    }
  };

  const handleBack = async () => {
    if (currentQuestionIndex > 0) {
      const currentQuestion = survey.questions[currentQuestionIndex];
      const questionId = currentQuestion.surveyQuestionId;
      const timeSpent = Date.now() - questionStartTime;
      const currentResponse = responses[questionId];

      // Save current response before going back
      if (currentResponse) {
        await saveResponse(questionId, currentResponse, timeSpent);
      }

      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async (email) => {
    try {
      await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ respondentId, email })
      });

      // Redirect to home after a delay
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (error) {
      console.error('Error submitting survey:', error);
    }
  };

  if (loading) {
    return (
      <Container className="survey-container">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading survey...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="survey-container">
        <div className="question-card text-center">
          <h2>Error</h2>
          <p className="text-danger">{error}</p>
          <button onClick={() => router.push('/')} className="btn btn-primary mt-3">
            Return Home
          </button>
        </div>
      </Container>
    );
  }

  if (showThankYou) {
    return <ThankYouPage onSubmit={handleSubmit} />;
  }

  if (!survey || !survey.questions || survey.questions.length === 0) {
    return (
      <Container className="survey-container">
        <div className="question-card text-center">
          <h2>No questions available</h2>
          <button onClick={() => router.push('/')} className="btn btn-primary mt-3">
            Return Home
          </button>
        </div>
      </Container>
    );
  }

  const currentQuestion = survey.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / survey.questions.length) * 100;

  return (
    <Container className="survey-container">
      <div className="mb-4">
        <h2 className="text-center mb-3">{survey.fullName}</h2>
        <div className="progress-indicator">
          <p className="progress-text">
            Question {currentQuestionIndex + 1} of {survey.questions.length}
          </p>
          <ProgressBar now={progress} />
        </div>
      </div>

      <QuestionRenderer
        question={currentQuestion}
        value={responses[currentQuestion.surveyQuestionId] || (currentQuestion.itemType === 'multiselect' || currentQuestion.itemType === 'multiselect-other' ? [] : '')}
        onChange={handleResponseChange}
      />

      <div className="survey-navigation">
        <button
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
          className="btn btn-secondary-survey"
        >
          Back
        </button>
        <button
          onClick={handleNext}
          className="btn btn-primary-survey"
        >
          {currentQuestionIndex < survey.questions.length - 1 ? 'Next' : 'Continue to Submit'}
        </button>
      </div>
    </Container>
  );
}

