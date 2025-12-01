import React, { useState, useEffect } from 'react';
import QuestionForm from './QuestionForm';

const QuestionManager = ({ surveyId, initialQuestions = [] }) => {
  const [questions, setQuestions] = useState(initialQuestions);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (surveyId && (!questions || questions.length === 0)) {
      fetchQuestions();
    }
  }, [surveyId]);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/admin/surveys/${surveyId}/questions`);
      if (response.ok) {
        const data = await response.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    }
  };

  const handleAddQuestion = async (questionData) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/surveys/${surveyId}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...questionData,
          orderIndex: questions.length
        }),
      });

      if (response.ok) {
        const newQuestion = await response.json();
        setQuestions(prev => [...prev, newQuestion]);
        setShowForm(false);
        alert('Question added successfully!');
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        alert(`Failed to add question: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Add question error:', error);
      alert('Failed to add question');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuestion = async (questionData) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/questions/${editingQuestion.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData),
      });

      if (response.ok) {
        const updatedQuestion = await response.json();
        setQuestions(prev => prev.map(q =>
          q.id === updatedQuestion.id ? updatedQuestion : q
        ));
        setEditingQuestion(null);
        alert('Question updated successfully!');
      } else {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        alert(`Failed to update question: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Update question error:', error);
      alert('Failed to update question');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/questions/${questionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setQuestions(prev => prev.filter(q => q.id !== questionId));
        alert('Question deleted successfully!');
      } else {
        alert('Failed to delete question');
      }
    } catch (error) {
      console.error('Delete question error:', error);
      alert('Failed to delete question');
    } finally {
      setLoading(false);
    }
  };

  const moveQuestion = (questionId, direction) => {
    const currentIndex = questions.findIndex(q => q.id === questionId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;

    const newQuestions = [...questions];
    [newQuestions[currentIndex], newQuestions[newIndex]] = [newQuestions[newIndex], newQuestions[currentIndex]];

    setQuestions(newQuestions);

    // Update order in backend
    updateQuestionOrder(newQuestions);
  };

  const updateQuestionOrder = async (orderedQuestions) => {
    try {
      const updates = orderedQuestions.map((q, index) => ({
        id: q.id,
        orderIndex: index
      }));

      await fetch(`/api/admin/surveys/${surveyId}/questions/reorder`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questions: updates }),
      });
    } catch (error) {
      console.error('Failed to update question order:', error);
    }
  };

  const getQuestionTypeLabel = (type) => {
    const types = {
      'text': 'Text Response',
      'yes_no': 'Yes/No',
      'likert_5': '5-Point Likert Scale',
      'multiple_choice': 'Multiple Choice',
      'multiple_choice_other': 'Multiple Choice with Other'
    };
    return types[type] || type;
  };

  const renderQuestionPreview = (question) => {
    // Enhanced debug logging to check question data and options
    console.log('Rendering question preview:', question);
    console.log('Question options:', question.options);
    console.log('Options type:', typeof question.options);
    console.log('Options length:', question.options?.length);

    return (
      <div key={question.id} className="question-item card mb-3">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div className="question-header-info">
            <span className="badge bg-secondary me-2">
              {getQuestionTypeLabel(question.questionType)}
            </span>
            {question.isRequired && (
              <span className="badge bg-warning">Required</span>
            )}
          </div>
          <div className="question-controls">
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary me-1"
              onClick={() => moveQuestion(question.id, 'up')}
              disabled={questions.findIndex(q => q.id === question.id) === 0}
            >
              ↑
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary me-1"
              onClick={() => moveQuestion(question.id, 'down')}
              disabled={questions.findIndex(q => q.id === question.id) === questions.length - 1}
            >
              ↓
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary me-1"
              onClick={() => setEditingQuestion(question)}
            >
              Edit
            </button>
            <button
              type="button"
              className="btn btn-sm btn-outline-danger"
              onClick={() => handleDeleteQuestion(question.id)}
            >
              Delete
            </button>
          </div>
        </div>
        <div className="card-body">
          {/* Enhanced Question Text Display */}
          <div className="question-content mb-3">
            <h6 className="question-text fw-bold" style={{ fontSize: '1.1rem', color: '#333' }}>
              {question.questionText || 'No question text provided'}
              {question.isRequired && <span className="text-danger ms-1">*</span>}
            </h6>
            {question.helpText && (
              <p className="text-muted small mb-2">{question.helpText}</p>
            )}
          </div>

          {/* Question Type Specific Preview */}
          <div className="question-preview">
            {/* Text Question Preview */}
            {question.questionType === 'text' && (
              <div className="question-preview-content">
                <small className="text-muted">Response Type:</small>
                <div className="mt-1">
                  <span className="badge bg-light text-dark">Text Area - Open Response</span>
                </div>
              </div>
            )}

            {/* Yes/No Question Preview */}
            {question.questionType === 'yes_no' && (
              <div className="question-preview-content">
                <small className="text-muted">Answer Options:</small>
                <div className="mt-1">
                  <span className="badge bg-success me-1">Yes</span>
                  <span className="badge bg-danger">No</span>
                </div>
              </div>
            )}

            {/* Likert Scale Preview */}
            {question.questionType === 'likert_5' && (
              <div className="question-preview-content">
                <small className="text-muted">5-Point Likert Scale:</small>
                <div className="mt-1">
                  <div className="d-flex flex-wrap gap-1">
                    <span className="badge bg-outline-secondary small">1 - Strongly Disagree</span>
                    <span className="badge bg-outline-secondary small">2 - Disagree</span>
                    <span className="badge bg-outline-secondary small">3 - Neutral</span>
                    <span className="badge bg-outline-secondary small">4 - Agree</span>
                    <span className="badge bg-outline-secondary small">5 - Strongly Agree</span>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Multiple Choice Preview */}
            {question.questionType === 'multiple_choice' && (
              <div className="question-preview-content">
                <small className="text-muted">Answer Options:</small>
                {question.options && Array.isArray(question.options) && question.options.length > 0 ? (
                  <div className="mt-2">
                    {question.options.map((option, index) => (
                      <div key={index} className="d-flex align-items-center mb-2">
                        <span className="badge bg-primary me-2" style={{ minWidth: '24px' }}>
                          {index + 1}
                        </span>
                        <span className="text-dark" style={{ fontSize: '0.9rem' }}>
                          {option || 'Empty option'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-1">
                    <span className="text-warning small">
                      {question.options ?
                        `Invalid options format: ${JSON.stringify(question.options)}` :
                        'No options configured'
                      }
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Multiple Choice with Other Preview */}
            {question.questionType === 'multiple_choice_other' && (
              <div className="question-preview-content">
                <small className="text-muted">Answer Options:</small>
                {question.options && Array.isArray(question.options) && question.options.length > 0 ? (
                  <div className="mt-2">
                    {question.options.map((option, index) => (
                      <div key={index} className="d-flex align-items-center mb-2">
                        <span className="badge bg-primary me-2" style={{ minWidth: '24px' }}>
                          {index + 1}
                        </span>
                        <span className="text-dark" style={{ fontSize: '0.9rem' }}>
                          {option || 'Empty option'}
                        </span>
                      </div>
                    ))}
                    <div className="d-flex align-items-center mb-2">
                      <span className="badge bg-info me-2" style={{ minWidth: '24px' }}>
                        +
                      </span>
                      <span className="text-muted fst-italic" style={{ fontSize: '0.9rem' }}>
                        Other (specify)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1">
                    <span className="text-warning small">
                      {question.options ?
                        `Invalid options format: ${JSON.stringify(question.options)}` :
                        'No options configured'
                      }
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Multiselect Preview */}
            {question.questionType === 'multiselect' && (
              <div className="question-preview-content">
                <small className="text-muted">Multi-Select Options:</small>
                {question.options && Array.isArray(question.options) && question.options.length > 0 ? (
                  <div className="mt-2">
                    {question.options.map((option, index) => (
                      <div key={index} className="d-flex align-items-center mb-2">
                        <span className="badge bg-success me-2" style={{ minWidth: '24px' }}>
                          ☑
                        </span>
                        <span className="text-dark" style={{ fontSize: '0.9rem' }}>
                          {option || 'Empty option'}
                        </span>
                      </div>
                    ))}
                    <div className="d-flex align-items-center mb-2">
                      <span className="badge bg-info me-2" style={{ minWidth: '24px' }}>
                        +
                      </span>
                      <span className="text-muted fst-italic" style={{ fontSize: '0.9rem' }}>
                        Other (specify)
                      </span>
                    </div>
                    <div className="mt-2">
                      <small className="text-info">
                        <i className="fas fa-info-circle me-1"></i>
                        Respondents can select multiple options from this list.
                      </small>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1">
                    <span className="text-warning small">
                      {question.options ?
                        `Invalid options format: ${JSON.stringify(question.options)}` :
                        'No options configured'
                      }
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="question-manager">
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h3>Survey Questions</h3>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
            disabled={showForm || editingQuestion}
          >
            Add Question
          </button>
        </div>
        <div className="card-body">
          {/* Add Question Form */}
          {showForm && (
            <div className="mb-4">
              <h5>Add New Question</h5>
              <QuestionForm
                onSave={handleAddQuestion}
                onCancel={() => setShowForm(false)}
                loading={loading}
              />
            </div>
          )}

          {/* Edit Question Form */}
          {editingQuestion && (
            <div className="mb-4">
              <h5>Edit Question</h5>
              <QuestionForm
                question={editingQuestion}
                onSave={handleUpdateQuestion}
                onCancel={() => setEditingQuestion(null)}
                loading={loading}
                isEditing={true}
              />
            </div>
          )}

          {/* Questions List */}
          <div className="questions-list">
            {questions.length === 0 ? (
              <div className="text-center text-muted py-4">
                <p>No questions added yet.</p>
                <p>Click "Add Question" to get started.</p>
              </div>
            ) : (
              <div>
                <h6 className="mb-3">Questions ({questions.length})</h6>
                {questions.map(renderQuestionPreview)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionManager;
