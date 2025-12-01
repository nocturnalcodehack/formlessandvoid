import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

const AdminAuthGetWrapper = ({ children, onAuthSuccess }) => {
  const [error, setError] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();

    // Handle both window focus AND route changes
    const handleFocus = () => checkAuth();
    const handleRouteChange = () => checkAuth();

    window.addEventListener('focus', handleFocus);
    router.events.on('routeChangeComplete', handleRouteChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, []); // Empty dependency - set up listeners once

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/schk', {
        method: 'GET',
        credentials: 'include',
      });

      const data = await response.json();

      if (data.status === 'ok' || data.status === 'refresh') {
        setAuthChecked(true);
        if (onAuthSuccess) {
          onAuthSuccess();
        }
      } else {
        await router.push('/');
        return;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      router.push('/');
      return;
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return <div>Loading...</div>;
  }

  // Only render children if auth check completed successfully
  // Note: authChecked only gets set to true if server confirms auth
  return authChecked ? children : null;
};

export default AdminAuthGetWrapper;