import { useUIContext } from '../context/UIContext';

/**
 * Custom hook for UI state management
 * Wrapper around UIContext for cleaner component usage
 */
export const useUI = () => {
  return useUIContext();
};

export default useUI;
