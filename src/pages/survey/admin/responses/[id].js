import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SurveyLayout from 'src/components/SurveyLayout';
import ResponseChart from 'src/components/Survey/Admin/ResponseChart';
import OtherResponsesTable from 'src/components/Survey/Admin/OtherResponsesTable';
import { validateAuth, makeAuthenticatedRequest } from 'src/utils/adminAuth';

const SurveyResponsesPage = () => {
  const router = useRouter();
  const { id: surveyId } = router.query;
  const [survey, setSurvey] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analytics, setAnalytics] = useState({});
  const [authChecking, setAuthChecking] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const isValid = await validateAuth(router);
      if (isValid && surveyId) {
        fetchSurveyData();
      }
      setAuthChecking(false);
    };
    initAuth();
  }, [surveyId]);

  useEffect(() => {
    if (survey) {
      fetchResponses();
    }
  }, [survey]);

  const fetchSurveyData = async () => {
    try {
      console.log('Fetching survey data for ID:', surveyId);
      const response = await makeAuthenticatedRequest(`/api/admin/surveys/${surveyId}`, {
        method: 'GET',
        credentials: 'include',
      });
      console.log('Survey fetch response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Survey data received:', data);
        setSurvey(data);
      } else {
        const errorText = await response.text();
        console.error('Survey fetch error:', response.status, errorText);
        throw new Error(`Failed to load survey: ${response.status} - ${errorText}`);
      }
    } catch (err) {
      console.error('Survey fetch error:', err);
      setError(err.message);
    }
  };

  const fetchResponses = async () => {
    try {
      const response = await makeAuthenticatedRequest(`/api/admin/surveys/${surveyId}/responses`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setResponses(data.byRespondent || data); // Support both new and legacy format
        // Only calculate analytics after we have both survey and response data
        if (survey && survey.questions) {
          // Use the new grouped data if available, otherwise fall back to legacy calculation
          if (data.byQuestion) {
            calculateAnalyticsFromGroupedData(data);
          } else {
            calculateAnalytics(data.byRespondent || data);
          }
        }
      } else {
        throw new Error('Failed to load responses');
      }
    } catch (err) {
      console.error('Responses fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistribution = (question, responses) => {
    if (!responses || responses.length === 0) {
      // Still need to return all possible options with 0 values for proper chart display
      const distribution = {};

      if (question.questionType === 'yes_no') {
        distribution['yes'] = 0;
        distribution['no'] = 0;
      } else if (question.questionType === 'likert_5') {
        // Initialize all Likert scale values
        distribution['1'] = 0;
        distribution['2'] = 0;
        distribution['3'] = 0;
        distribution['4'] = 0;
        distribution['5'] = 0;
      } else if (question.questionType === 'multiple_choice' || question.questionType === 'multiple_choice_other') {
        const options = question.options || [];
        options.forEach(option => {
          // Always use the value field for grouping - this ensures consistency
          const optionValue = (typeof option === 'object' && option !== null)
            ? (option.value || String(option))
            : String(option);
          distribution[optionValue] = 0;
        });
        // Add Other option for multiple_choice_other
        if (question.questionType === 'multiple_choice_other') {
          distribution['Other'] = 0;
        }
      } else if (question.questionType === 'multiselect') {
        const options = question.options || [];
        options.forEach(option => {
          // Always use the value field for grouping - this ensures consistency
          const optionValue = (typeof option === 'object' && option !== null)
            ? (option.value || String(option))
            : String(option);
          distribution[optionValue] = 0;
        });
        // Add Other option for multiselect with other
        distribution['Other'] = 0;
      }

      return distribution;
    }

    const distribution = {};

    if (question.questionType === 'yes_no') {
      // Initialize yes/no options
      distribution['yes'] = 0;
      distribution['no'] = 0;

      // For yes/no questions, count yes and no responses
      responses.forEach(response => {
        // Ensure we have a string value
        const value = (typeof response === 'object' && response !== null)
          ? (response.value || response.responseValue || JSON.stringify(response))
          : String(response).toLowerCase();
        if (distribution.hasOwnProperty(value)) {
          distribution[value] = (distribution[value] || 0) + 1;
        }
      });
    } else if (question.questionType === 'likert_5') {
      // Initialize all Likert scale values
      distribution['1'] = 0;
      distribution['2'] = 0;
      distribution['3'] = 0;
      distribution['4'] = 0;
      distribution['5'] = 0;

      // For Likert scale, count each scale value
      responses.forEach(response => {
        // Ensure we have a string value
        const value = (typeof response === 'object' && response !== null)
          ? (response.value || response.responseValue || JSON.stringify(response))
          : String(response);
        if (distribution.hasOwnProperty(value)) {
          distribution[value] = (distribution[value] || 0) + 1;
        }
      });
    } else if (question.questionType === 'multiple_choice') {
      // For standard multiple choice, count each option using value field
      const options = question.options || [];

      // Initialize all options to 0 - ALWAYS use the value field for consistency
      options.forEach(option => {
        const optionValue = (typeof option === 'object' && option !== null)
          ? (option.value || String(option))
          : String(option);
        distribution[optionValue] = 0;
      });

      responses.forEach(response => {
        // Extract the actual response value - responses should contain the option value, not text
        let responseValue = response;
        if (typeof response === 'object' && response !== null) {
          responseValue = response.value || response.responseValue || String(response);
        }

        // Convert to string for comparison
        const responseStr = String(responseValue);

        // Make sure the response matches one of our initialized option values
        if (distribution.hasOwnProperty(responseStr)) {
          distribution[responseStr] = (distribution[responseStr] || 0) + 1;
        } else {
          // If response doesn't match any option value, add it as a new option
          distribution[responseStr] = 1;
        }
      });
    } else if (question.questionType === 'multiple_choice_other') {
      // For multiple choice with other, check responseData JSON for isOther flag
      const options = question.options || [];

      // Initialize all options to 0 - ALWAYS use the value field for consistency
      options.forEach(option => {
        const optionValue = (typeof option === 'object' && option !== null)
          ? (option.value || String(option))
          : String(option);
        distribution[optionValue] = 0;
      });

      // Add Other option
      distribution['Other'] = 0;

      responses.forEach(response => {
        let responseData = null;
        let responseValue = null;

        // Extract responseData and responseValue
        if (typeof response === 'object' && response !== null) {
          responseData = response.responseData;
          responseValue = response.responseValue;
        } else {
          // Fallback for legacy format
          const responseStr = String(response);
          if (distribution.hasOwnProperty(responseStr)) {
            distribution[responseStr] = (distribution[responseStr] || 0) + 1;
          } else {
            distribution[responseStr] = 1;
          }
          return;
        }

        // Parse responseData if it's a string
        let parsedResponseData = null;
        if (typeof responseData === 'string') {
          try {
            parsedResponseData = JSON.parse(responseData);
          } catch (e) {
            // Fallback to legacy format if parsing fails
            const responseStr = String(responseValue || responseData);
            if (distribution.hasOwnProperty(responseStr)) {
              distribution[responseStr] = (distribution[responseStr] || 0) + 1;
            } else {
              distribution[responseStr] = 1;
            }
            return;
          }
        } else if (typeof responseData === 'object' && responseData !== null) {
          parsedResponseData = responseData;
        }

        // Handle the JSON structure with "isOther" field in responseData
        if (parsedResponseData) {
          if (parsedResponseData.isOther === true) {
            // When isOther is true, count as "Other"
            distribution['Other'] = (distribution['Other'] || 0) + 1;
          } else {
            // When isOther is false, use responseValue which contains the selected option value
            const selectedValue = String(responseValue);
            if (selectedValue && distribution.hasOwnProperty(selectedValue)) {
              distribution[selectedValue] = (distribution[selectedValue] || 0) + 1;
            } else if (selectedValue) {
              distribution[selectedValue] = 1;
            }
          }
        }
      });
    } else if (question.questionType === 'multiselect') {
      // For multiselect, parse JSON structure in responseValue field
      const options = question.options || [];

      // Initialize all options to 0 - ALWAYS use the value field for consistency
      options.forEach(option => {
        const optionValue = (typeof option === 'object' && option !== null)
          ? (option.value || String(option))
          : String(option);
        distribution[optionValue] = 0;
      });

      // Add Other option for multiselect with other
      distribution['Other'] = 0;

      responses.forEach(response => {
        let responseValue = null;

        // Extract responseValue
        if (typeof response === 'object' && response !== null) {
          responseValue = response.responseValue;
        } else {
          responseValue = response;
        }

        // Parse responseValue if it's a string
        let parsedResponse = null;
        if (typeof responseValue === 'string') {
          try {
            parsedResponse = JSON.parse(responseValue);
          } catch (e) {
            // Fallback to legacy format if parsing fails
            const selections = responseValue.split(',').map(s => s.trim());
            selections.forEach(selection => {
              if (distribution.hasOwnProperty(selection)) {
                distribution[selection] = (distribution[selection] || 0) + 1;
              } else {
                distribution[selection] = 1;
              }
            });
            return;
          }
        } else if (typeof responseValue === 'object' && responseValue !== null) {
          parsedResponse = responseValue;
        }

        // Handle the JSON structure with "selected", "value", and "hasOther" keys
        if (parsedResponse) {
          if (parsedResponse.hasOther === true) {
            // When hasOther is true, count as "Other"
            distribution['Other'] = (distribution['Other'] || 0) + 1;
          }

          // Process selected options - this can be an array or single value
          const selectedOptions = Array.isArray(parsedResponse.selected)
            ? parsedResponse.selected
            : (parsedResponse.selected ? [parsedResponse.selected] : []);

          selectedOptions.forEach(selectedValue => {
            if (selectedValue && distribution.hasOwnProperty(selectedValue)) {
              distribution[selectedValue] = (distribution[selectedValue] || 0) + 1;
            } else if (selectedValue) {
              distribution[selectedValue] = 1;
            }
          });
        }
      });
    }

    return distribution;
  };

  const calculateAnalytics = (responseData) => {
    // Add safety check to prevent errors when survey data isn't loaded yet
    if (!survey || !survey.questions || !responseData) {
      console.warn('calculateAnalytics called without required data');
      return;
    }

    const questionAnalytics = {};
    const totalResponses = responseData.length;

    survey.questions.forEach(question => {
      const questionResponses = responseData
        .map(r => r.responses && r.responses[question.id])
        .filter(response => response !== undefined && response !== null && response !== '');

      questionAnalytics[question.id] = {
        totalResponses: questionResponses.length,
        responses: questionResponses,
        distribution: calculateDistribution(question, questionResponses)
      };

      // Handle different question types
      if (question.questionType === 'text') {
        questionAnalytics[question.id].textResponses = responseData
          .filter(r => r.responses && r.responses[question.id])
          .map(r => ({
            responseValue: r.responses[question.id],
            createdAt: r.createdAt
          }));
      } else if (question.questionType === 'multiple_choice_other') {
        // Extract "other" responses from responseData and responseValue fields
        questionAnalytics[question.id].otherResponses = responseData
          .filter(r => {
            const response = r.responses && r.responses[question.id];
            if (!response) return false;

            // Check responseData JSON for isOther flag
            let responseData = response.responseData;

            if (typeof responseData === 'string') {
              try {
                const parsedData = JSON.parse(responseData);
                return parsedData.isOther === true;
              } catch (e) {
                return false;
              }
            } else if (typeof responseData === 'object' && responseData !== null) {
              return responseData.isOther === true;
            }
            return false;
          })
          .map(r => {
            // Extract the other text from responseValue field when isOther is true
            const otherText = r.responses[question.id].responseValue || '';


            return {
              responseValue: otherText,
              createdAt: r.createdAt
            };
          });
      } else if (question.questionType === 'multiselect') {
        // Extract "other" responses from multiselect responseValue JSON structure
        questionAnalytics[question.id].otherResponses = responseData
          .filter(r => {
            const response = r.responses && r.responses[question.id];
            if (!response) return false;

            // Parse the responseValue JSON to check for hasOther flag
            let responseValue = response;
            if (typeof response === 'object' && response.responseValue) {
              responseValue = response.responseValue;
            }

            if (typeof responseValue === 'string') {
              try {
                const parsedValue = JSON.parse(responseValue);
                return parsedValue.hasOther === true;
              } catch (e) {
                return false;
              }
            }
            return false;
          })
          .map(r => {
            const response = r.responses[question.id];
            let otherText = '';

            // Extract the other text from the "value" field when hasOther is true
            let responseValue = response;
            if (typeof response === 'object' && response.responseValue) {
              responseValue = response.responseValue;
            }

            if (typeof responseValue === 'string') {
              try {
                const parsedValue = JSON.parse(responseValue);
                // For multiselect with hasOther=true, the other text is typically in the "otherText" field
                otherText = parsedValue.other || '';
              } catch (e) {
                otherText = '';
              }
            }

            return {
              responseValue: otherText,
              createdAt: r.createdAt
            };
          });
      }
    });

    setAnalytics({ questionAnalytics, totalResponses });
  };

  const calculateAnalyticsFromGroupedData = (data) => {
    if (!survey || !survey.questions || !data.byQuestion) {
      console.warn('calculateAnalyticsFromGroupedData called without required data');
      return;
    }

    const questionAnalytics = {};
    const totalResponses = data.totalRespondents || 0;

    // Process the pre-grouped question data
    data.byQuestion.forEach(questionGroup => {
      const questionId = questionGroup.questionId;
      const question = survey.questions.find(q => q.id === questionId);

      if (!question) return;

      const validResponses = questionGroup.responses.filter(
        response => response.responseValue !== undefined &&
                   response.responseValue !== null &&
                   response.responseValue !== ''
      );

      questionAnalytics[questionId] = {
        totalResponses: validResponses.length,
        responses: validResponses,
        distribution: calculateDistribution(question, validResponses)
      };

      // Handle different question types
      if (question.questionType === 'text') {
        questionAnalytics[questionId].textResponses = validResponses.map(response => ({
          responseValue: response.responseValue,
          createdAt: response.createdAt
        }));
      } else if (question.questionType === 'multiple_choice_other') {
        // Extract "other" responses from responseData and responseValue fields
        questionAnalytics[questionId].otherResponses = validResponses
          .filter(response => {
            // Check responseData JSON for isOther flag
            let responseData = response.responseData;

            if (typeof responseData === 'string') {
              try {
                const parsedData = JSON.parse(responseData);
                return parsedData.isOther === true;
              } catch (e) {
                return false;
              }
            } else if (typeof responseData === 'object' && responseData !== null) {
              return responseData.isOther === true;
            }
            return false;
          })
          .map(response => {
            // Extract the other text from responseValue field when isOther is true
            const otherText = response.responseValue || '';

            return {
              responseValue: otherText,
              createdAt: response.createdAt
            };
          });
      } else if (question.questionType === 'multiselect') {
        // Extract "other" responses from multiselect responseValue JSON structure
        questionAnalytics[questionId].otherResponses = validResponses
          .filter(response => {
            // Parse the responseValue JSON to check for hasOther flag
            let responseValue = response.responseValue;

            if (typeof responseValue === 'string') {
              try {
                const parsedValue = JSON.parse(responseValue);
                return parsedValue.hasOther === true;
              } catch (e) {
                return false;
              }
            }
            return false;
          })
          .map(response => {
            let otherText = '';

            // Extract the other text from the "value" field when hasOther is true
            let responseValue = response.responseValue;

            if (typeof responseValue === 'string') {
              try {
                const parsedValue = JSON.parse(responseValue);
                // For multiselect with hasOther=true, the other text is typically in the "otherText" field
                otherText = parsedValue.otherText || parsedValue.other || parsedValue.value || '';
              } catch (e) {
                otherText = '';
              }
            }

            return {
              responseValue: otherText,
              createdAt: response.createdAt
            };
          });
      }
    });

    setAnalytics({ questionAnalytics, totalResponses });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  if (authChecking) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Validating authentication...</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <SurveyLayout>
        <Head>
          <title>Loading Survey Responses</title>
        </Head>
        <div className="container">
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="mt-3">Loading survey responses...</p>
          </div>
        </div>
      </SurveyLayout>
    );
  }

  if (error) {
    return (
      <SurveyLayout>
        <Head>
          <title>Error Loading Responses</title>
        </Head>
        <div className="container">
          <div className="alert alert-danger">
            <h4>Error Loading Survey Responses</h4>
            <p>{error}</p>
            <Link href="/survey/admin" className="btn btn-primary">
              Return to Admin
            </Link>
          </div>
        </div>
      </SurveyLayout>
    );
  }

  if (!survey) {
    return (
      <SurveyLayout>
        <Head>
          <title>Survey Not Found</title>
        </Head>
        <div className="container">
          <div className="alert alert-warning">
            <h4>Survey Not Found</h4>
            <p>The requested survey could not be found.</p>
            <Link href="/survey/admin" className="btn btn-primary">
              Return to Admin
            </Link>
          </div>
        </div>
      </SurveyLayout>
    );
  }

  const totalResponses = analytics.totalResponses || 0;

  return (
          <SurveyLayout>
              <Head>
                  <title>{survey.title} - Survey Responses</title>
              </Head>

              <div className="survey-responses-page" style={{backgroundColor: '#1a1a1a', minHeight: '100vh', color: 'white'}}>
                  <div className="container">
                      <div className="row">
                          <div className="col-12">
                              {/* Header */}
                              <div className="d-flex justify-content-between align-items-center mb-4 pt-4">
                                  <div>
                                      <h1 className="text-white">{survey.title} - Results</h1>
                                      <p className="text-muted mb-0">
                                          Survey created on {formatDate(survey.createdAt)}
                                      </p>
                                  </div>
                                  <Link
                                      href="/survey/admin"
                                      className="btn btn-outline-light"
                                  >
                                      <i className="fas fa-arrow-left mr-2"></i>
                                      Back to Admin
                                  </Link>
                              </div>

                              {/* Summary Cards */}
                              <div className="row mb-4">
                                  <div className="col-md-3">
                                      <div className="card bg-primary text-white">
                                          <div className="card-body text-center">
                                              <h3 className="mb-0">{totalResponses}</h3>
                                              <p className="mb-0">Total Responses</p>
                                          </div>
                                      </div>
                                  </div>
                                  <div className="col-md-3">
                                      <div className="card bg-info text-white">
                                          <div className="card-body text-center">
                                              <h3 className="mb-0">{survey.questions?.length || 0}</h3>
                                              <p className="mb-0">Questions</p>
                                          </div>
                                      </div>
                                  </div>
                                  <div className="col-md-3">
                                      <div className="card bg-success text-white">
                                          <div className="card-body text-center">
                                              <h3 className="mb-0">
                                                  {survey.isActive ? 'Active' : 'Inactive'}
                                              </h3>
                                              <p className="mb-0">Status</p>
                                          </div>
                                      </div>
                                  </div>
                                  <div className="col-md-3">
                                      <div className="card bg-warning text-white">
                                          <div className="card-body text-center">
                                              <h3 className="mb-0">
                                                  {totalResponses > 0 ?
                                                      Math.round((totalResponses / (survey.questions?.length || 1)) * 100) : 0}%
                                              </h3>
                                              <p className="mb-0">Completion Rate</p>
                                          </div>
                                      </div>
                                  </div>
                              </div>

                              {/* Results Section */}
                              {totalResponses === 0 ? (
                                  <div className="card bg-dark text-white">
                                      <div className="card-body text-center py-5">
                                          <i className="fas fa-chart-bar fa-3x text-muted mb-3"></i>
                                          <h3>No Responses Yet</h3>
                                          <p className="text-muted">
                                              This survey hasn't received any responses yet. Share the survey link to start collecting data.
                                          </p>
                                          {survey.isActive && (
                                              <Link
                                                  href={`/survey/${survey.id}`}
                                                  className="btn btn-primary"
                                                  target="_blank"
                                              >
                                                  Preview Survey
                                              </Link>
                                          )}
                                      </div>
                                  </div>
                              ) : (
                                  <div className="results-section">
                                      <h2 className="text-white mb-4">Question Results</h2>

                                      {survey.questions?.map((question, index) => {
                                          const questionAnalytics = analytics.questionAnalytics?.[question.id];

                                          return (
                                              <div key={question.id} className="card mb-4 bg-dark text-white">
                                                  <div className="card-body">
                                                      <h5 className="card-title text-white">
                                                          Question {index + 1}: {question.questionText}
                                                      </h5>
                                                      <p className="text-muted mb-3">
                                                          Type: {question.questionType.replace('_', ' ').toUpperCase()} |
                                                          Responses: {questionAnalytics?.totalResponses || 0}
                                                      </p>

                                                      {/* Chart for non-text questions */}
                                                      {question.questionType !== 'text' && questionAnalytics && (
                                                          <div className="mb-3">
                                                              <ResponseChart
                                                                  question={question}
                                                                  analytics={questionAnalytics}
                                                              />
                                                          </div>
                                                      )}

                                                      {/* Other responses table for multiple_choice_other */}
                                                      {question.questionType === 'multiple_choice_other' &&
                                                          questionAnalytics?.otherResponses?.length > 0 && (
                                                              <div className="mt-3">
                                                                  <h6>Other Responses:</h6>
                                                                  <OtherResponsesTable
                                                                      responses={questionAnalytics.otherResponses}
                                                                  />
                                                              </div>
                                                          )}

                                                      {/* Other responses table for multiselect */}
                                                      {question.questionType === 'multiselect' &&
                                                          questionAnalytics?.otherResponses?.length > 0 && (
                                                              <div className="mt-3">
                                                                  <h6>Other Responses:</h6>
                                                                  <OtherResponsesTable
                                                                      responses={questionAnalytics.otherResponses}
                                                                  />
                                                              </div>
                                                          )}

                                                      {/* Text responses preview */}
                                                      {question.questionType === 'text' && questionAnalytics?.textResponses && (
                                                          <div>
                                                              <h6>Text Responses ({questionAnalytics.textResponses.length}):</h6>
                                                              <div className="text-responses" style={{maxHeight: '300px', overflowY: 'auto'}}>
                                                                  {questionAnalytics.textResponses.slice(0, 10).map((response, idx) => (
                                                                      <div key={idx} className="border-bottom py-2">
                                                                          <small className="text-muted">
                                                                              {formatDate(response.createdAt)}
                                                                          </small>
                                                                          <p className="mb-0">{response.responseValue}</p>
                                                                      </div>
                                                                  ))}
                                                                  {questionAnalytics.textResponses.length > 10 && (
                                                                      <p className="text-muted mt-2">
                                                                          ... and {questionAnalytics.textResponses.length - 10} more responses
                                                                      </p>
                                                                  )}
                                                              </div>
                                                          </div>
                                                      )}
                                                  </div>
                                              </div>
                                          );
                                      })}
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
              </div>
          </SurveyLayout>
  );
};

export default SurveyResponsesPage;
