// components/Checklist/ChecklistHeader.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeftIcon } from '@heroicons/react/24/outline';
import Card from '../common/Card';
import Button from '../common/Button';

const ChecklistHeader = ({ jobTitle, checklistName, checklistDescription }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Card>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleBack}
        className="mb-4"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        <span>Back to Job</span>
      </Button>

      <div className="mt-4">
        <p className="text-sm text-muted-foreground uppercase tracking-wide">Checklist</p>
        <h2 className="text-xl font-semibold text-foreground">{checklistName}</h2>
        {jobTitle ? <p className="mt-1 text-sm font-medium text-foreground">{jobTitle}</p> : null}
        {checklistDescription && (
          <p className="text-sm text-muted-foreground mt-2">{checklistDescription}</p>
        )}
      </div>
    </Card>
  );
};

export default ChecklistHeader;
