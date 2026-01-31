import { useAuthContext } from '../context/AuthContext';

/**
 * Custom hook for authentication functionality
 * Wrapper around AuthContext for cleaner component usage
 */
export const useAuth = () => {
  return useAuthContext();
};

export default useAuth;
