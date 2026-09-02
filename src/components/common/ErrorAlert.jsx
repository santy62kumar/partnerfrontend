
// components/Common/ErrorAlert.jsx
import React from 'react';
import useChecklistStore from '../../store/checklistStore';
import { XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Button from './Button';

const ErrorAlert = ({ message }) => {
  const clearError = useChecklistStore(state => state.clearError);

  return (
    <div className="alert-error">
      <div className="flex items-start">
        <XCircleIcon className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-destructive">Error</h3>
          <p className="text-sm text-destructive/80 mt-1">{message}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Dismiss error"
          onClick={clearError}
          className="ml-3 size-8 shrink-0 p-0 text-destructive hover:text-destructive/70"
        >
          <XMarkIcon className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default ErrorAlert;
