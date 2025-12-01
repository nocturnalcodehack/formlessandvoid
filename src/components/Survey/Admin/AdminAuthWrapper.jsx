import React, { useState, useEffect, useCallback} from 'react';
import { useRouter } from 'next/router';

const AdminAuthWrapper = ({ children, onAuthSuccess }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [clientKey, setClientKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = useCallback( async () => {
    try {
      const response = await fetch('/api/schk', {
        method: 'GET',
        credentials: 'include', // Ensure cookies are sent
      });

      const data = await response.json();

      if (data.status === 'ok') {
        // Valid cookie found and TTL is still good
        setIsAuthenticated(true);
        setShowDialog(false);
        setError('');
        // Call onAuthSuccess callback when authentication is confirmed
        if (onAuthSuccess) {
          onAuthSuccess();
        }
      } else if (data.status === 'refresh') {
        // Cookie exists but TTL has expired
        setIsAuthenticated(false);
        setShowDialog(true);
        setError('Your session has expired. Please re-enter your CLIENT_KEY.');
      } else if (response.status === 400 && data.status === 'error') {
        // No cookie present (first time user) - this is expected behavior
        setIsAuthenticated(false);
        setShowDialog(true);
        setError(''); // No error message for first-time auth
      } else if (response.status === 500) {
        // Server error - don't show dialog, show error message instead
        console.error('Server error during authentication check:', data);
        setIsAuthenticated(false);
        setShowDialog(false);
        setError('Server authentication error. Please contact administrator.');
        setLoading(false);
        return; // Exit early to prevent showing dialog
      } else if (response.status === 403) {
        // IP blocked
        setIsAuthenticated(false);
        setShowDialog(false);
        setError('Access denied. IP may be temporarily blocked.');
        setLoading(false);
        return; // Exit early to prevent showing dialog
      } else {
        // Other errors (rate limiting, etc.)
        setIsAuthenticated(false);
        setShowDialog(true);
        setError('Authentication error. Please try again.');
      }
    } catch (error) {
      // Network or other fetch errors
      console.error('Auth check failed:', error);
      setIsAuthenticated(false);
      setShowDialog(false);
      setError('Unable to connect to authentication service. Please check your connection and try again.');
      setLoading(false);
      return; // Exit early to prevent showing dialog
    } finally {
      // Only set loading to false if we haven't already done so above
      if (loading) {
        setLoading(false);
      }
    }
  }, []);

  const handleKeySubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/schk', {
        method: 'POST',
        credentials: 'include', // Ensure cookies are sent
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ CLIENT_KEY: clientKey }),
      });

      const data = await response.json();

      if (data.status === 'ok') {
        setIsAuthenticated(true);
        setShowDialog(false);
        setClientKey(''); // Clear the key for security
        // Call onAuthSuccess callback when authentication succeeds
        if (onAuthSuccess) {
          onAuthSuccess();
        }
      } else {
        setError('Invalid CLIENT_KEY. Please try again.');
      }
    } catch (error) {
      setError('Authentication failed. Please try again.');
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Provide children without exposing TTL value
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return child; // Remove ttlValue prop passing
    }
    return child;
  });

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (showDialog) {
    return (
      <>
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Admin Authentication Required</h5>
              </div>
              <form onSubmit={handleKeySubmit}>
                <div className="modal-body">
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}
                  <div className="mb-3">
                    <label htmlFor="clientKey" className="form-label text-dark">
                      Enter your CLIENT_KEY:
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        id="clientKey"
                        value={clientKey}
                        onChange={(e) => setClientKey(e.target.value)}
                        required
                        autoFocus
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={togglePasswordVisibility}
                        style={{ borderLeft: 'none' }}
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancel}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Authenticate
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Only render children if authenticated and dialog is not showing
  if (isAuthenticated && !showDialog) {
    return childrenWithProps;
  }

  // Show error message for server/connection errors
  if (error && !showDialog) {
    return (
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="alert alert-danger" role="alert">
              <h4 className="alert-heading">Authentication Error</h4>
              <p>{error}</p>
              <hr />
              <p className="mb-0">
                <button
                  className="btn btn-primary me-2"
                  onClick={checkAuth}
                >
                  Retry
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  Return to Home
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default fallback - show nothing while determining auth state
  return null;
};

export default AdminAuthWrapper;
