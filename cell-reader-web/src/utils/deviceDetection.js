/**
 * Utility functions for device detection
 */

import { ref, onMounted, onUnmounted } from 'vue';

// Check if device is mobile based on user agent and screen width
export const checkIsMobile = () => {
  if (typeof window !== 'undefined') {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth <= 768;
  }
  return false;
};

// Vue composable for reactive mobile detection
export const useIsMobile = () => {
  if (typeof window === 'undefined') {
    // For SSR, return based on common mobile width
    return ref(false);
  }
  
  const isMobile = ref(checkIsMobile());
  
  const handleResize = () => {
    isMobile.value = checkIsMobile();
  };
  
  onMounted(() => {
    window.addEventListener('resize', handleResize);
  });
  
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
  });
  
  return isMobile;
};