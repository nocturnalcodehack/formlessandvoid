import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { validateAuth, makeAuthenticatedRequest } from 'src/utils/adminAuth';
import SurveyLayout from 'src/components/SurveyLayout';

const CreateSurvey = () => {
  const [survey, setSurvey] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    isActive: false
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      const isValid = await validateAuth(router);
      setAuthChecking(false);
    };
    initAuth();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create formSubmit data structure with proper date formatting
      const formSubmit = {
        ...survey,
        endDate: survey.endDate ? survey.endDate + 'T11:59:59.999' : '',
        questions
      };

      // Debug logging to see what we're sending
      console.log('CREATE: handleSubmit - Full formSubmit data:', JSON.stringify(formSubmit, null, 2));
      console.log('CREATE: handleSubmit - Questions being sent:', questions);
      questions.forEach((question, index) => {
        console.log(`CREATE: Question ${index + 1}:`, {
          questionText: question.questionText,
          questionType: question.questionType,
          options: question.options,
          optionsLength: question.options?.length,
          optionsType: typeof question.options,
          isArray: Array.isArray(question.options),
          required: question.required
        });
      });

      const response = await makeAuthenticatedRequest('/api/admin/surveys', {
        method: 'POST',
        body: JSON.stringify(formSubmit),
      });

      if (response.ok) {
        router.push('/survey/admin');
      } else {
        throw new Error('Failed to create survey');
      }
    } catch (error) {
      console.error('Create failed:', error);
      alert('Failed to create survey');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([...questions, {
      questionText: '',
      questionType: 'text',
      options: [],
      required: false,
      orderIndex: questions.length
    }]);
  };

  const updateQuestion = (index, field, value) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };

    // Handle question type changes - set default options
    if (field === 'questionType') {
      if (value === 'likert_5') {
        updated[index].options = [
          { text: 'Strongly Disagree', value: 1 },
          { text: 'Disagree', value: 2 },
          { text: 'Neutral', value: 3 },
          { text: 'Agree', value: 4 },
          { text: 'Strongly Agree', value: 5 }
        ];
      } else if (value === 'yes_no') {
        updated[index].options = [
          { text: 'Yes', value: 'yes' },
          { text: 'No', value: 'no' }
        ];
      } else if (['multiple_choice', 'multiple_choice_other', 'multiselect'].includes(value)) {
        updated[index].options = [{ text: '', value: '' }];
      } else {
        updated[index].options = [];
      }
    }

    setQuestions(updated);
  };

  const addOption = (questionIndex) => {
    const updated = [...questions];
    updated[questionIndex].options.push({ text: '', value: '' });
    setQuestions(updated);
  };

  const updateOption = (questionIndex, optionIndex, field, value) => {
    const updated = [...questions];

    // Always set the raw field first
    updated[questionIndex].options[optionIndex][field] = value;

    // When the option text changes, auto-generate the value and limit each word to 5 characters
    if (field === 'text') {
      // Normalize to lowercase, replace non-alphanumeric with space to split words cleanly
      const normalized = String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ') // non-alphanum -> single space
        .trim();

      // Split to words, truncate each to max 5 chars, then join with underscore
      const limited = normalized
        .split(/\s+/)
        .filter(Boolean)
        .map(w => w.slice(0, 5))
        .join('_');

      // Fallback to empty string preserved
      updated[questionIndex].options[optionIndex].value = limited;
    }

    // Additionally, if the user manually edits the value field, enforce the same 5-char-per-word rule
    if (field === 'value') {
      const normalized = String(value || '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
      const limited = normalized
        .split(/\s+/)
        .filter(Boolean)
        .map(w => w.slice(0, 5))
        .join('_');
      updated[questionIndex].options[optionIndex].value = limited;
    }

    setQuestions(updated);
  };

  const removeOption = (questionIndex, optionIndex) => {
    const updated = [...questions];
    updated[questionIndex].options.splice(optionIndex, 1);
    setQuestions(updated);
  };

  const moveOption = (questionIndex, optionIndex, direction) => {
    const updated = [...questions];
    const options = updated[questionIndex].options;
    const newIndex = direction === 'up' ? optionIndex - 1 : optionIndex + 1;

    if (newIndex >= 0 && newIndex < options.length) {
      [options[optionIndex], options[newIndex]] = [options[newIndex], options[optionIndex]];
      setQuestions(updated);
    }
  };

  // Helper function to determine if question type requires options
  const requiresOptions = (questionType) => {
    return ['multiple_choice', 'multiple_choice_other', 'multiselect'].includes(questionType);
  };

  const removeQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  if (authChecking) {
    return (
      <SurveyLayout>
        <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </SurveyLayout>
    );
  }

  return (
    <SurveyLayout>
      <Head>
        <title>Create Survey - Admin</title>
      </Head>

      <div className="survey-create-page" style={{backgroundColor: '#1a1a1a', minHeight: '100vh', color: 'white'}}>
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="d-flex justify-content-between align-items-center mb-4 pt-4">
                <h1 className="text-white">Create New Survey</h1>
                <Link href="/survey/admin" className="btn btn-outline-light">
                  Back to Dashboard
                </Link>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="card mb-4 bg-dark text-white">
                  <div className="card-header">
                    <h5 className="text-white">Survey Information</h5>
                  </div>
                  <div className="card-body">
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label text-white">Title</label>
                      <input
                        type="text"
                        className="form-control"
                        id="title"
                        value={survey.title}
                        onChange={(e) => setSurvey({ ...survey, title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="description" className="form-label text-white">Description</label>
                      <textarea
                        className="form-control"
                        id="description"
                        rows="3"
                        value={survey.description}
                        onChange={(e) => setSurvey({ ...survey, description: e.target.value })}
                      />
                    </div>

                    <div className="row">
                      <div className="col-md-6">
                        <label htmlFor="startDate" className="form-label text-white">Start Date</label>
                        <input
                          type="date"
                          className="form-control"
                          id="startDate"
                          value={survey.startDate}
                          onChange={(e) => setSurvey({ ...survey, startDate: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="endDate" className="form-label text-white">End Date</label>
                        <input
                          type="date"
                          className="form-control"
                          id="endDate"
                          value={survey.endDate}
                          onChange={(e) => setSurvey({ ...survey, endDate: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="form-check mt-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="isActive"
                        checked={survey.isActive}
                        onChange={(e) => setSurvey({ ...survey, isActive: e.target.checked })}
                      />
                      <label className="form-check-label text-white" htmlFor="isActive">
                        Activate survey immediately
                      </label>
                    </div>
                  </div>
                </div>

                <div className="card mb-4 bg-dark text-white">
                  <div className="card-header d-flex justify-content-between align-items-center">
                    <h5 className="text-white">Questions</h5>
                    <button type="button" className="btn btn-sm btn-success" onClick={addQuestion}>
                      Add Question
                    </button>
                  </div>
                  <div className="card-body">
                    {questions.length === 0 ? (
                      <p className="text-muted">No questions added yet. Click "Add Question" to get started.</p>
                    ) : (
                      questions.map((question, index) => (
                        <div key={index} className="border border-secondary p-3 mb-3 rounded bg-dark">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="text-white">Question {index + 1}</h6>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeQuestion(index)}
                            >
                              Remove
                            </button>
                          </div>

                          <div className="mb-3">
                            <label className="form-label text-white">Question Text</label>
                            <input
                              type="text"
                              className="form-control"
                              value={question.questionText}
                              onChange={(e) => updateQuestion(index, 'questionText', e.target.value)}
                              required
                            />
                          </div>

                          <div className="mb-3">
                            <label className="form-label text-white">Question Type</label>
                            <select
                              className="form-select"
                              value={question.questionType}
                              onChange={(e) => updateQuestion(index, 'questionType', e.target.value)}
                            >
                              <option value="text">Text Response</option>
                              <option value="yes_no">Yes/No</option>
                              <option value="likert_5">5-Point Likert Scale</option>
                              <option value="multiple_choice">Multiple Choice</option>
                              <option value="multiple_choice_other">Multiple Choice with Other</option>
                              <option value="multiselect">Multi-Select with Other</option>
                            </select>
                          </div>

                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={question.required}
                              onChange={(e) => updateQuestion(index, 'required', e.target.checked)}
                            />
                            <label className="form-check-label text-white">Required</label>
                          </div>

                          {/* Options Management Section */}
                          {(question.questionType === 'likert_5' || question.questionType === 'yes_no') && (
                            <div className="mt-3">
                              <h6 className="text-white">Default Options (Read-only)</h6>
                              <div className="bg-secondary p-2 rounded">
                                {question.options.map((option, optionIndex) => (
                                  <div key={optionIndex} className="text-light mb-1">
                                    {option.text} (Value: {option.value})
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {requiresOptions(question.questionType) && (
                            <div className="mt-3">
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="text-white mb-0">Options</h6>
                                <button
                                  type="button"
                                  className="btn btn-sm btn-success"
                                  onClick={() => addOption(index)}
                                >
                                  + Add Option
                                </button>
                              </div>

                              {question.options.map((option, optionIndex) => (
                                <div key={optionIndex} className="card bg-secondary mb-2">
                                  <div className="card-body p-3">
                                    <div className="row align-items-center">
                                      <div className="col-md-5">
                                        <label className="form-label text-white small">Option Text</label>
                                        <input
                                          type="text"
                                          className="form-control form-control-sm"
                                          value={option.text}
                                          onChange={(e) => updateOption(index, optionIndex, 'text', e.target.value)}
                                          placeholder="Enter option text"
                                          required
                                        />
                                      </div>
                                      <div className="col-md-4">
                                        <label className="form-label text-white small">Value (auto-generated)</label>
                                        <input
                                          type="text"
                                          className="form-control form-control-sm"
                                          value={option.value}
                                          onChange={(e) => updateOption(index, optionIndex, 'value', e.target.value)}
                                          placeholder="Auto-generated from text"
                                          style={{backgroundColor: '#e9ecef'}}
                                        />
                                      </div>
                                      <div className="col-md-3">
                                        <label className="form-label text-white small d-block">&nbsp;</label>
                                        <div className="btn-group w-100">
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-outline-light"
                                            onClick={() => moveOption(index, optionIndex, 'up')}
                                            disabled={optionIndex === 0}
                                            title="Move Up"
                                          >
                                            ↑
                                          </button>
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-outline-light"
                                            onClick={() => moveOption(index, optionIndex, 'down')}
                                            disabled={optionIndex === question.options.length - 1}
                                            title="Move Down"
                                          >
                                            ↓
                                          </button>
                                          <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => removeOption(index, optionIndex)}
                                            disabled={question.options.length <= 1}
                                            title="Remove Option"
                                          >
                                            ×
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}

                              {(question.questionType === 'multiple_choice_other' || question.questionType === 'multiselect') && (
                                <div className="alert alert-info">
                                  <small>
                                    ℹ️ An "Other" option will be automatically added for respondents to enter custom text.
                                  </small>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <Link href="/survey/admin" className="btn btn-secondary">
                    Cancel
                  </Link>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Creating...' : 'Create Survey'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </SurveyLayout>
  );
};

export default CreateSurvey;
