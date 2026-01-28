// components/Checklist/ChecklistPage.jsx
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import useChecklistStore from '../../store/checklistStore';
import ChecklistHeader from './ChecklistHeader';
import ChecklistStats from './ChecklistStats';
import ChecklistItem from './ChecklistItem';
import UnsavedChangesBar from './UnsavedChangesBar';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorAlert from '../common/ErrorAlert';


/**
 * Main Checklist Page Component
 * 
 * Features:
 * - Bulk data loading on mount
 * - Optimistic UI updates
 * - Unsaved changes tracking
 * - Batch save functionality
 */

const ChecklistPage = () => {
  const { jobId, checklistId } = useParams();
  
  // Zustand selectors for optimized re-renders
  const checklist = useChecklistStore(state => state.checklist);
  const items = useChecklistStore(state => state.items);
  const jobTitle = useChecklistStore(state => state.jobTitle);
  const isLoading = useChecklistStore(state => state.isLoading);
  const error = useChecklistStore(state => state.error);
  
  // Actions
  const fetchChecklist = useChecklistStore(state => state.fetchChecklist);
  const resetStore = useChecklistStore(state => state.resetStore);

  // Load checklist data on mount
  useEffect(() => {
    if (jobId && checklistId) {
      fetchChecklist(parseInt(jobId), parseInt(checklistId));
    }

    // Cleanup on unmount
    return () => {
      resetStore();
    };
  }, [jobId, checklistId, fetchChecklist, resetStore]);

  // Show loading state
  if (isLoading) {
    return <LoadingSpinner message="Loading checklist..." />;
  }

  // Show error state
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorAlert message={error} />
      </div>
    );
  }

  // Show empty state
  if (!checklist) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-500">No checklist found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Unsaved changes notification bar */}
      <UnsavedChangesBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <ChecklistHeader 
          jobTitle={jobTitle}
          checklistName={checklist.name}
          checklistDescription={checklist.description}
        />

        {/* Statistics */}
        <ChecklistStats />

        {/* Checklist Items */}
        <div className="bg-white rounded-lg shadow-sm mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Checklist Items
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {items.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="text-gray-500">No items in this checklist</p>
              </div>
            ) : (
              items.map((item) => (
                <ChecklistItem key={item.id} item={item} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChecklistPage;