// PWA Installation and Offline utilities

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

export const checkOnlineStatus = () => {
  return navigator.onLine;
};

export const addOnlineStatusListener = (callback) => {
  window.addEventListener('online', () => callback(true));
  window.addEventListener('offline', () => callback(false));
};

// Offline data management
export const saveOfflineData = (key, data) => {
  try {
    localStorage.setItem(`offline_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }));
  } catch (error) {
    console.error('Error saving offline data:', error);
  }
};

export const getOfflineData = (key) => {
  try {
    const stored = localStorage.getItem(`offline_${key}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.data;
    }
  } catch (error) {
    console.error('Error getting offline data:', error);
  }
  return null;
};