import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import SurveyForm from 'src/components/Survey/SurveyForm';
import ThankYouPage from 'src/components/Survey/ThankYouPage';

const SurveyPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [survey, setSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [thankYouMessage, setThankYouMessage] = useState('');

  useEffect(() => {
    if (id) {
      fetchSurvey();
    }
  }, [id]);

  const fetchSurvey = async () => {
    try {
      const response = await fetch(`/api/survey/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load survey');
      }
      const surveyData = await response.json();
      setSurvey(surveyData);
      console.log('Survey Data Returned:', surveyData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSurveyComplete = (message) => {
    setThankYouMessage(message);
    setIsCompleted(true);
  };

  if (loading) {
    return (
      <div className="survey-loading">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-3">Loading survey...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="survey-error">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card border-danger">
                <div className="card-body text-center">
                  <h3 className="card-title text-danger">Survey Unavailable</h3>
                  <p className="card-text">{error}</p>
                  <button
                    className="btn btn-primary"
                    onClick={() => router.push('/')}
                  >
                    Return Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isCompleted) {
    return <ThankYouPage message={thankYouMessage} />;
  }

  return (
    <>
      <Head>
        <title>{survey?.title || 'Survey'}</title>
        <meta name="description" content={survey?.description || 'Complete our survey'} />
      </Head>

      <div className="survey-page">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="survey-header text-center mb-5">
                <h1 className="survey-title">{survey?.title}</h1>
                {survey?.description && (
                  <p className="survey-description">{survey.description}</p>
                )}
              </div>

              <SurveyForm
                survey={survey}
                onComplete={handleSurveyComplete}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SurveyPage;
