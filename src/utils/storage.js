// LocalStorage utility functions with error handling

export const storage = {
  // Get item from localStorage
  get: (key) => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item ${key} from localStorage:`, error);
      return null;
    }
  },

  // Set item in localStorage
  set: (key, value) => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting item ${key} in localStorage:`, error);
      return false;
    }
  },

  // Remove item from localStorage
  remove: (key) => {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing item ${key} from localStorage:`, error);
      return false;
    }
  },

  // Clear all localStorage
  clear: () => {
    try {
      window.localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },

  // Check if key exists
  has: (key) => {
    try {
      return window.localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Error checking if ${key} exists in localStorage:`, error);
      return false;
    }
  },
};