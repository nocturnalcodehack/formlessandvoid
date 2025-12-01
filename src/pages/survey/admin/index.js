import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import SurveyList from 'src/components/Survey/Admin/SurveyList';
import AdminAuthWrapper from 'src/components/Survey/Admin/AdminAuthWrapper';

const AdminDashboard = () => {
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/admin/', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Fetch surveys response:', response);

      if (response.ok) {
        const data = await response.json();
        setSurveys(data);
      } else if (response.status === 401) {
        // Authentication failed - let AdminAuthWrapper handle re-auth
        setError('Session expired. Please re-authenticate.');
        window.location.reload(); // Trigger re-auth
      } else {
        throw new Error('Failed to load surveys');
      }
    } catch (error) {
      console.error('Failed to fetch surveys:', error);
      setError('Failed to load surveys. Please try again.');
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSurveyDeleted = (surveyId) => {
    setSurveys(prev => prev.filter(survey => survey.id !== surveyId));
  };

  const handleSurveyUpdated = (updatedSurvey) => {
    setSurveys(prev => prev.map(survey =>
      survey.id === updatedSurvey.id ? updatedSurvey : survey
    ));
  };

  return (
    <AdminAuthWrapper onAuthSuccess={fetchSurveys}>
      <Head>
        <title>Survey Admin Dashboard</title>
      </Head>

      <div className="admin-dashboard">
        {/* Breadcrumb Navigation */}
        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <nav aria-label="breadcrumb" className="pt-3">
                <ol className="breadcrumb">
                  <li className="breadcrumb-item">
                    <Link href="/public" className="text-decoration-none">
                      <i className="fas fa-home me-1"></i>
                      Home
                    </Link>
                  </li>
                  <li className="breadcrumb-item active" aria-current="page">
                    Survey Admin
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>

        <div className="container-fluid">
          <div className="row">
            <div className="col-12">
              <div className="admin-header d-flex justify-content-between align-items-center mb-4">
                <h1>Survey Administration</h1>
                <Link href="/survey/admin/create" className="btn btn-primary">
                  <i className="fas fa-plus mr-2"></i>
                  Create New Survey
                </Link>
              </div>

              {loading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : error ? (
                <div className="alert alert-danger" role="alert">
                  {error}
                  <button
                    className="btn btn-sm btn-outline-danger ms-3"
                    onClick={fetchSurveys}
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <SurveyList
                  surveys={surveys}
                  onSurveyDeleted={handleSurveyDeleted}
                  onSurveyUpdated={handleSurveyUpdated}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminAuthWrapper>
  );
};

export default AdminDashboard;
