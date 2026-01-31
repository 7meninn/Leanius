import { usePlayerContext } from '../context/PlayerContext';

/**
 * Custom hook for player functionality
 * Wrapper around PlayerContext for cleaner component usage
 */
export const usePlayer = () => {
  return usePlayerContext();
};

export default usePlayer;
