
import { useCallback, useRef } from 'react';

export const useCleanup = () => {
  // Clean up timeout
  const cleanupTimeoutRef = useRef<number | null>(null);

  const restoreBodyScroll = useCallback(() => {
    // Ensure body scroll is restored
    document.body.style.overflow = 'auto';
    document.body.style.removeProperty('position');
    document.body.classList.remove('no-scroll', 'overflow-hidden');
    
    // Force a style recalculation
    document.body.offsetHeight;
  }, []);

  // Combined cleanup function that handles all resources
  const cleanup = useCallback(() => {
    // Clear any pending timeouts
    if (cleanupTimeoutRef.current) {
      window.clearTimeout(cleanupTimeoutRef.current);
      cleanupTimeoutRef.current = null;
    }
    
    // Restore scroll behavior
    restoreBodyScroll();
  }, [restoreBodyScroll]);

  return {
    cleanup,
    restoreBodyScroll,
    cleanupTimeoutRef
  };
};
