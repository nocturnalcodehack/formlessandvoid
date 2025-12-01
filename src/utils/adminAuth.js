import { useState } from 'react';

/**
 * Centralized authentication utilities for admin pages
 * Provides consistent authentication validation and request handling
 */

/**
 * Validates the current user's authentication status by checking the TTL cookie
 * @param {Object} router - Next.js router instance for redirects
 * @returns {Promise<boolean>} - Returns true if authentication is valid, false otherwise
 */
export const validateAuth = async (router) => {
  try {
    const response = await fetch('/api/schk', {
      method: 'GET',
      credentials: 'include', // Send cookies automatically
    });

    const data = await response.json();

    if (data.status === 'ok') {
      return true;
    } else {
      // Invalid TTL - redirect to home
      if (router) {
        router.push('/');
      }
      return false;
    }
  } catch (error) {
    console.error('Auth validation failed:', error);
    if (router) {
      router.push('/');
    }
    return false;
  }
};

/**
 * Makes an authenticated request with automatic TTL cookie inclusion
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Fetch options (method, body, headers, etc.)
 * @returns {Promise<Response>} - Returns the fetch response
 */
export const makeAuthenticatedRequest = async (url, options = {}) => {
  const requestOptions = {
    ...options,
    credentials: 'include', // Always include cookies - TTL sent automatically
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  // Cookies are automatically included for all requests via credentials: 'include'
  // No need to manually extract or include TTL in body

  return fetch(url, requestOptions);
};

/**
 * Custom hook for managing authentication state in admin components
 * @param {Object} router - Next.js router instance
 * @returns {Object} - Returns authentication state and helper functions
 */
export const useAdminAuth = (router) => {
  const [authChecking, setAuthChecking] = useState(true);

  const initAuth = async () => {
    const isValid = await validateAuth(router);
    setAuthChecking(false);
    return isValid;
  };

  return {
    authChecking,
    initAuth,
    validateAuth: () => validateAuth(router),
    makeAuthenticatedRequest
  };
};
