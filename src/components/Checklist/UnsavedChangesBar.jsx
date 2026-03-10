// components/Checklist/UnsavedChangesBar.jsx
import React from 'react';
import useChecklistStore from '../../store/checklistStore';
import { ExclamationTriangleIcon, CheckIcon } from '@heroicons/react/24/outline';

const UnsavedChangesBar = () => {
  const hasUnsavedChanges = useChecklistStore(state => state.hasUnsavedChanges());
  const unsavedCount = useChecklistStore(state => state.getUnsavedCount());
  const isSaving = useChecklistStore(state => state.isSaving);

  const saveChanges = useChecklistStore(state => state.saveChanges);
  const discardChanges = useChecklistStore(state => state.discardChanges);

  if (!hasUnsavedChanges) {
    return null;
  }

  const handleSave = async () => {
    try {
      await saveChanges();
    } catch (error) {
      console.error('Save failed:', error);
    }
  };

  const handleDiscard = () => {
    if (window.confirm('Are you sure you want to discard all changes?')) {
      discardChanges();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-warning/10 border-t-2 border-warning shadow-elevated">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-warning flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">
                You have {unsavedCount} unsaved {unsavedCount === 1 ? 'change' : 'changes'}
              </p>
              <p className="text-xs text-muted-foreground">
                Don't forget to save your changes before leaving this page
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleDiscard}
              disabled={isSaving}
              className="btn-secondary btn-md"
            >
              Discard
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary btn-md"
            >
              {isSaving ? (
                <>
                  <svg
                    className="animate-spin w-5 h-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>

                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckIcon className="h-4 w-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnsavedChangesBar;