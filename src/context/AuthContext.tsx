import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '../types';
import apiClient, { getErrorMessage } from '../utils/api';
import { ENDPOINTS } from '../utils/constants';
import { setAuthToken, getAuthToken, clearAuthToken, isTokenExpired } from '../utils/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (name: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = getAuthToken();
    if (!token || isTokenExpired(token)) {
      clearAuthToken();
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.get(ENDPOINTS.USER.PROFILE);
      setUser(response.data.data);
    } catch {
      clearAuthToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check for existing auth on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.LOGIN, { email, password });
      const { token } = response.data.data;
      setAuthToken(token);
      
      // Fetch user profile after login since backend doesn't return user data
      const profileResponse = await apiClient.get(ENDPOINTS.USER.PROFILE);
      setUser(profileResponse.data.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await apiClient.post(ENDPOINTS.AUTH.SIGNUP, { name, email, password });
      const { token } = response.data.data;
      setAuthToken(token);
      
      // Fetch user profile after signup since backend doesn't return user data
      const profileResponse = await apiClient.get(ENDPOINTS.USER.PROFILE);
      setUser(profileResponse.data.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const logout = async () => {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Ignore logout API errors - still clear local state
    } finally {
      clearAuthToken();
      setUser(null);
    }
  };

  const updateProfile = async (name: string) => {
    try {
      const response = await apiClient.put(ENDPOINTS.USER.PROFILE, { name });
      setUser(response.data.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await apiClient.put(ENDPOINTS.USER.PASSWORD, { currentPassword, newPassword });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      await apiClient.post(ENDPOINTS.AUTH.RESET_PASSWORD, { email });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const resetPassword = async (token: string, newPassword: string) => {
    try {
      await apiClient.post(ENDPOINTS.AUTH.VERIFY_RESET_TOKEN(token), { password: newPassword });
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
