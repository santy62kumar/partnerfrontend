import toast from 'react-hot-toast';

/**
 * Custom hook for toast notifications
 * Wraps react-hot-toast with custom styling and options
 */
export const useToast = () => {
  const showSuccess = (message, options = {}) => {
    toast.success(message, {
      duration: 3000,
      ...options,
    });
  };

  const showError = (message, options = {}) => {
    toast.error(message, {
      duration: 4000,
      ...options,
    });
  };

  const showInfo = (message, options = {}) => {
    toast(message, {
      duration: 3000,
      icon: 'ℹ️',
      ...options,
    });
  };

  const showWarning = (message, options = {}) => {
    toast(message, {
      duration: 3000,
      icon: '⚠️',
      ...options,
    });
  };

  const showLoading = (message = 'Loading...') => {
    return toast.loading(message);
  };

  const dismissToast = (toastId) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  };

  const showPromise = (promise, messages) => {
    return toast.promise(promise, {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: messages.error || 'Error occurred',
    });
  };

  return {
    success: showSuccess,
    error: showError,
    info: showInfo,
    warning: showWarning,
    loading: showLoading,
    dismiss: dismissToast,
    promise: showPromise,
  };
};