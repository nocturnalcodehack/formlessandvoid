// Simple API utilities without authentication
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export function handleApiError(error) {
  console.error('API Error:', error);
  return error.message || 'An error occurred';
}
