import { useSongsContext } from '../context/SongsContext';

/**
 * Custom hook for songs management functionality
 * Wrapper around SongsContext for cleaner component usage
 */
export const useSongs = () => {
  return useSongsContext();
};

export default useSongs;
