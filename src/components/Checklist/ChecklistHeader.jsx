// components/Checklist/ChecklistHeader.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';



const ChecklistHeader = ({ jobTitle, checklistName, checklistDescription }) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      {/* Back Button */}
      <button
        onClick={handleBack}
        className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 mb-4 focus:outline-none focus:ring-2 focus:ring-[#3D1D1C]/50 rounded"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        <span>Back to Job</span>
      </button>


      {/* Checklist Name */}
      <div className="mt-4">
        <p className="text-sm text-gray-500 uppercase tracking-wide">Checklist</p>
        <h2 className="text-xl font-semibold text-gray-800">{checklistName}</h2>
        {checklistDescription && (
          <p className="text-sm text-gray-600 mt-2">{checklistDescription}</p>
        )}
      </div>
    </div>
  );
};

export default ChecklistHeader;