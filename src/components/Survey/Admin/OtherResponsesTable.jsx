import React, { useState } from 'react';

const OtherResponsesTable = ({ responses }) => {
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'alpha'
  
  if (!responses || responses.length === 0) {
    return <p className="text-muted">No "other" responses provided.</p>;
  }

  // Sort responses
  const sortedResponses = [...responses].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else {
      return a.responseValue.toLowerCase().localeCompare(b.responseValue.toLowerCase());
    }
  });

  const displayResponses = showAll ? sortedResponses : sortedResponses.slice(0, 10);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="other-responses-table">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="text-muted">
          Showing {displayResponses.length} of {responses.length} "other" responses
        </span>
        <div className="btn-group btn-group-sm">
          <button
            className={`btn ${sortBy === 'date' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setSortBy('date')}
          >
            Sort by Date
          </button>
          <button
            className={`btn ${sortBy === 'alpha' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setSortBy('alpha')}
          >
            Sort A-Z
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-sm table-striped">
          <thead>
            <tr>
              <th width="70%">Response</th>
              <th width="30%">Submitted</th>
            </tr>
          </thead>
          <tbody>
            {displayResponses.map((response, index) => (
              <tr key={index}>
                <td>
                  <span className="text-break">{response.responseValue}</span>
                </td>
                <td>
                  <small className="text-muted">
                    {formatDate(response.createdAt)}
                  </small>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {responses.length > 10 && (
        <div className="text-center mt-3">
          <button
            className="btn btn-outline-secondary btn-sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              <>
                <i className="fas fa-chevron-up mr-1"></i>
                Show Less
              </>
            ) : (
              <>
                <i className="fas fa-chevron-down mr-1"></i>
                Show All {responses.length} Responses
              </>
            )}
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="mt-3 p-2 bg-light rounded">
        <small className="text-muted">
          <strong>Summary:</strong> {responses.length} unique "other" responses collected. 
          {responses.length > 1 && (
            <> Most recent: "{sortedResponses[0]?.responseValue}"</>
          )}
        </small>
      </div>
    </div>
  );
};

export default OtherResponsesTable;
