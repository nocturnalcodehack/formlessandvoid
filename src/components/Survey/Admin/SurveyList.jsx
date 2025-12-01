import React, { useState } from 'react';
import Link from 'next/link';


const SurveyList = ({ surveys, onSurveyDeleted, onSurveyUpdated }) => {
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (surveyId) => {
    if (!confirm('Are you sure you want to delete this survey? This action cannot be undone.')) {
      return;
    }

    setDeletingId(surveyId);
    try {
      const response = await fetch(`/api/admin/surveys/${surveyId}`, {
        method: 'DELETE',
        credentials: 'include', // Ensure cookies are sent
      });

      if (response.ok) {
        onSurveyDeleted(surveyId);
      } else {
        alert('Failed to delete survey');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete survey');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleActive = async (survey) => {
    try {
      const response = await fetch(`/api/admin/surveys/${survey.id}/toggle-active`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        // Update the survey in the local state with the new isActive status
        const updatedSurvey = { ...survey, isActive: result.isActive };
        onSurveyUpdated(updatedSurvey);
      } else {
        const errorData = await response.json();
        console.error('Update error:', errorData);
        alert(`Failed to update survey status: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Update error:', error);
      alert('Failed to update survey status');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  if (surveys.length === 0) {
    return (
      <div className="empty-state text-center py-5">
        <i className="fas fa-poll fa-3x text-muted mb-3"></i>
        <h3>No Surveys Yet</h3>
        <p className="text-muted">Create your first survey to get started.</p>
        <Link href="/survey/admin/create" className="btn btn-primary">
          Create Survey
        </Link>
      </div>
    );
  }

  return (
    <div className="survey-list">
      <div className="table-responsive">
        <table className="table table-hover">
          <thead>
          <tr>
            <th className="text-white">Title</th>
            <th className="text-white">Status</th>
            <th className="text-white">Questions</th>
            <th className="text-white">Survey URL</th>
            <th className="text-white">Start Date</th>
            <th className="text-white">End Date</th>
            <th className="text-white">Created</th>
            <th className="text-white">Actions</th>
          </tr>
          </thead>
          <tbody>
          {surveys.map((survey) => (
            <tr key={survey.id}>
              <td className="text-white">
                <div>
                  <strong className="text-white">{survey.title}</strong>
                  {survey.description && (
                    <div className="text-muted small">{survey.description}</div>
                  )}
                </div>
              </td>
              <td className="text-white">
                  <span className={`badge ${survey.isActive ? 'badge-success' : 'badge-secondary'}`}>
                    {survey.isActive ? 'Active' : 'Draft'}
                  </span>
              </td>
              <td className="text-white">{survey.questions?.length || 0}</td>
              <td className="text-white">
                <div className="survey-url">
                  <input
                    type="text"
                    value={`${window.location.hostname}/survey/${survey.id}`}
                    readOnly
                    className="form-control form-control-sm bg-dark text-white border-secondary"
                    style={{ fontSize: '0.8rem', width: '200px' }}
                    onClick={(e) => e.target.select()}
                    title="Click to select survey URL"
                  />
                </div>
              </td>
              <td className="text-white">{formatDate(survey.startDate)}</td>
              <td className="text-white">{formatDate(survey.endDate)}</td>
              <td className="text-white">{formatDate(survey.createdAt)}</td>
              <td>
                <div className="btn-group btn-group-sm">
                  <Link
                    href={`/survey/admin/edit/${survey.id}`}
                    className="btn btn-outline-primary"
                    title={"Edit"}
                  >
                    <i className="fas fa-edit"></i>
                  </Link>

                  <button
                    className={`btn ${survey.isActive ? 'btn-outline-warning' : 'btn-outline-success'}`}
                    onClick={() => handleToggleActive(survey)}
                    title={survey.isActive ? "Deactivate" : "Activate"}
                  >
                    <i className={`fas ${survey.isActive ? 'fa-pause' : 'fa-play'}`}></i>
                  </button>

                  {survey.isActive && (
                    <Link
                      href={`/survey/${survey.id}`}
                      className="btn btn-outline-info"
                      title={"Preview"}
                      target="_blank"
                    >
                      <i className="fas fa-eye"></i>
                    </Link>
                  )}

                  <Link
                    href={`/survey/admin/responses/${survey.id}`}
                    className="btn btn-outline-secondary"
                    title={"Responses"}
                  >
                    <i className="fas fa-chart-bar"></i>
                  </Link>

                  <button
                    className="btn btn-outline-danger"
                    onClick={() => handleDelete(survey.id)}
                    disabled={deletingId === survey.id}
                    title={"Delete"}
                  >
                    {deletingId === survey.id ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-trash"></i>
                    )}
                  </button>
                </div>
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SurveyList;
