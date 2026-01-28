
// components/Common/ErrorAlert.jsx
import React from 'react';
import useChecklistStore from '../../store/checklistStore';
import { XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const ErrorAlert = ({ message }) => {
  const clearError = useChecklistStore(state => state.clearError);

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start">
        <XCircleIcon className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="text-sm text-red-700 mt-1">{message}</p>
        </div>
        <button
          onClick={clearError}
          className="ml-3 flex-shrink-0 text-red-600 hover:text-red-800 focus:outline-none"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ErrorAlert;