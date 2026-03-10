// components/Checklist/ChecklistHeader.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const ChecklistHeader = ({ jobTitle, checklistName, checklistDescription }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="ds-card p-6">
      <button
        onClick={handleBack}
        className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground mb-4 focus:outline-none focus:ring-2 focus:ring-ring/50 rounded"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        <span>Back to Job</span>
      </button>

      <div className="mt-4">
        <p className="text-sm text-muted-foreground uppercase tracking-wide">Checklist</p>
        <h2 className="text-xl font-semibold text-foreground">{checklistName}</h2>
        {checklistDescription && (
          <p className="text-sm text-muted-foreground mt-2">{checklistDescription}</p>
        )}
      </div>
    </div>
  );
};

export default ChecklistHeader;