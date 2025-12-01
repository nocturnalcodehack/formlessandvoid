import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import SurveyLayout from 'src/components/SurveyLayout';

const SurveyStartPage = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActiveSurveys();
  }, []);

  const fetchActiveSurveys = async () => {
    try {
      const response = await fetch('/api/survey/active', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setSurveys(data);
      } else {
        throw new Error('Failed to load surveys');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isExpiringSoon = (endDate) => {
    if (!endDate) return false;
    const end = new Date(endDate);
    const now = new Date();
    const timeDiff = end.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff <= 7 && daysDiff > 0;
  };

  if (loading) {
    return (
      <SurveyLayout>
        <Head>
          <title>Loading Surveys</title>
        </Head>
        <div className="survey-start-loading">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                  <p className="mt-3">Loading available surveys...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SurveyLayout>
    );
  }

  if (error) {
    return (
      <SurveyLayout>
        <Head>
          <title>Survey Error</title>
        </Head>
        <div className="survey-start-error">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="card border-danger">
                  <div className="card-body text-center">
                    <h3 className="card-title text-danger">Unable to Load Surveys</h3>
                    <p className="card-text">{error}</p>
                    <button
                      className="btn btn-primary"
                      onClick={fetchActiveSurveys}
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SurveyLayout>
    );
  }

  // The HTML space code is &nbsp; (non-breaking space)
  return (
    <SurveyLayout>
      <Head>
        <title>Available Surveys</title>
        <meta name="description" content="Participate in our active surveys and share your valuable feedback" />
      </Head>

      <div className="survey-start-page">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="survey-start-header text-center mb-5">
                <h1 className="survey-start-title">Available Surveys</h1>
                <p className="survey-start-description lead">
                  Participate in our surveys and help us gather valuable insights.
                  Your feedback makes a difference!
                </p>
              </div>

              {surveys.length === 0 ? (
                <div className="no-surveys-available">
                  <div className="row justify-content-center">
                    <div className="col-lg-8">
                      <div className="card bg-light">
                        <div className="card-body text-center py-5">
                          <i className="fas fa-poll fa-4x text-muted mb-4"></i>
                          <h3>No Surveys Available</h3>
                          <p className="text-muted mb-4">
                            There are currently no active surveys available for participation.
                            Please check back later for new opportunities to share your feedback.
                          </p>
                          <Link href="/public" className="btn btn-primary">
                            Return Home
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="surveys-grid">
                  <div className="row">
                    {surveys.map((survey, index) => (
                      <div key={survey.id || index} className="col-lg-6 col-md-8 col-sm-12 mx-auto mb-4">
                        <div className="survey-card card h-100 shadow-sm">
                            <div className="card-body d-flex flex-column">
                              <div className="survey-header mb-3">
                                <h3 className="survey-title text-dark">{survey?.title || 'No Title'}</h3>
                                {survey?.description && (
                                  <p className="survey-description text-muted">
                                    {survey.description}
                                  </p>
                                )}
                              </div>

                            <div className="survey-meta mb-3">
                              <div className="survey-info">
                                {survey.questions && (
                                  <div className="question-count mb-2">
                                    <i className="fas fa-question-circle text-primary mr-2"></i>
                                    <span className="text-dark">&nbsp;{survey.questions.length} Questions</span>
                                  </div>
                                )}

                                {survey.endDate && (
                                  <div className={`end-date ${isExpiringSoon(survey.endDate) ? 'text-warning' : 'text-muted'}`}>
                                    <i className="fas fa-calendar-alt mr-2"></i>
                                    <span>
                                      {isExpiringSoon(survey.endDate) ? 'Ending soon: ' : 'Available until: '}
                                      {formatDate(survey.endDate)}
                                    </span>
                                    {isExpiringSoon(survey.endDate) && (
                                      <i className="fas fa-exclamation-triangle ml-2"></i>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="survey-actions mt-auto">
                              <Link
                                href={`/survey/${survey.id}`}
                                className="btn btn-primary btn-lg btn-block"
                              >
                                <i className="fas fa-play mr-2"></i>
                                Start Survey
                              </Link>
                            </div>
                          </div>

                          {isExpiringSoon(survey.endDate) && (
                            <div className="card-footer bg-warning text-dark">
                              <small>
                                <i className="fas fa-clock mr-2"></i>
                                This survey is ending soon! Complete it before it expires.
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="survey-start-footer text-center mt-5">
                <div className="row justify-content-center">
                  <div className="col-lg-8">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h5>Have Questions?</h5>
                        <p className="mb-3">
                          If you have any questions about our surveys or need assistance,
                          please don't hesitate to contact us.
                        </p>
                        <Link href="/dark/page-contact" className="btn btn-outline-primary">
                          Contact Us
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SurveyLayout>
  );
};

export default SurveyStartPage;
