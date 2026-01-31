import { STORAGE_KEYS } from './constants';

/**
 * Set the authentication token in localStorage
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
};

/**
 * Get the authentication token from localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Remove the authentication token from localStorage
 */
export const clearAuthToken = (): void => {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
};

/**
 * Check if the user has a stored authentication token
 */
export const hasAuthToken = (): boolean => {
  return !!getAuthToken();
};

/**
 * Decode a JWT token payload (without verification)
 */
export const decodeToken = (token: string): Record<string, unknown> | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
};

/**
 * Check if a JWT token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  const payload = decodeToken(token);
  if (!payload || typeof payload.exp !== 'number') return true;
  
  // exp is in seconds, Date.now() is in milliseconds
  return payload.exp * 1000 < Date.now();
};

/**
 * Get the expiration time of a JWT token
 */
export const getTokenExpiration = (token: string): Date | null => {
  const payload = decodeToken(token);
  if (!payload || typeof payload.exp !== 'number') return null;
  
  return new Date(payload.exp * 1000);
};

/**
 * Check if user is authenticated (has valid, non-expired token)
 */
export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  if (!token) return false;
  return !isTokenExpired(token);
};
