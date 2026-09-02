// components/Checklist/ChecklistPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import useChecklistStore from '../../store/checklistStore';
import { checklistApi } from '../../api/checklistApi';
import ChecklistHeader from './ChecklistHeader';
import ChecklistStats from './ChecklistStats';
import ChecklistItem from './ChecklistItem';
import UnsavedChangesBar from './UnsavedChangesBar';
import LoadingSpinner from '../common/LoadingSpinner';
import Card from '../common/Card';
import Button from '../common/Button';
import { getApiErrorMessage } from '../../api/apiErrors';


// Matches the 10MB ceiling the mobile client shows for checklist documents.
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

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
  const warning = useChecklistStore(state => state.warning);
  const isSaving = useChecklistStore(state => state.isSaving);
  
  // Actions
  const fetchChecklist = useChecklistStore(state => state.fetchChecklist);
  // console.log('ChecklistPage - fetchChecklist:', fetchChecklist);
  const resetStore = useChecklistStore(state => state.resetStore);
  const uploadChecklistDocument = useChecklistStore(state => state.uploadChecklistDocument);
  const [spreadsheet, setSpreadsheet] = useState(null);
  const [documentError, setDocumentError] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  // console.log('ChecklistPage - resetStore:', resetStore);

  // Load checklist data on mount
  useEffect(() => {
    if (jobId && checklistId) {
      void fetchChecklist(Number(jobId), Number(checklistId)).catch(() => {});
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
  if (error && !checklist) {
    return (
      <div className="mx-auto max-w-7xl space-y-3 px-4 py-8 sm:px-6 lg:px-8">
        <Card className="border-destructive/30 bg-destructive/5">
          <p className="font-semibold text-destructive">Checklist unavailable</p>
          <p role="alert" className="mt-1 text-sm text-destructive">{error}</p>
        </Card>
        <Button
          variant="outline"
          onClick={() => fetchChecklist(Number(jobId), Number(checklistId))}
        >
          Try again
        </Button>
      </div>
    );
  }

  // Show empty state
  if (!checklist) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="text-center">
          <p className="font-semibold text-foreground">No checklist found</p>
          <p className="mt-1 text-sm text-muted-foreground">Return to the job and choose an assigned checklist.</p>
        </Card>
      </div>
    );
  }

  const exportChecklist = async () => {
    setDocumentError('');
    setIsExporting(true);
    try {
      await checklistApi.exportChecklist(Number(jobId), Number(checklistId));
    } catch (exportError) {
      setDocumentError(getApiErrorMessage(exportError));
    } finally {
      setIsExporting(false);
    }
  };

  const uploadSpreadsheet = async () => {
    if (!spreadsheet) return;
    setDocumentError('');
    try {
      await uploadChecklistDocument(spreadsheet);
      setSpreadsheet(null);
    } catch (uploadError) {
      setDocumentError(getApiErrorMessage(uploadError));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      
      <UnsavedChangesBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <ChecklistHeader 
          jobTitle={jobTitle}
          checklistName={checklist.name}
          checklistDescription={checklist.description}
        />

        {(error || warning) ? (
          <Card className={`mt-4 ${error ? 'border-destructive/30 bg-destructive/5' : 'border-warning/30 bg-warning/5'}`}>
            <p role="alert" className={`text-sm ${error ? 'text-destructive' : 'text-warning'}`}>{error || warning}</p>
          </Card>
        ) : null}

        <div className="mt-4">
          <Button
            variant="outline"
            onClick={exportChecklist}
            loading={isExporting}
            loadingLabel="Exporting…"
          >
            Export PDF
          </Button>
        </div>

        <Card title="Checklist document" className="mt-6">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Export the supplied PDF above, complete it on site, then upload the finished copy.</p>
            {checklist.document_link && (
              <a href={checklist.document_link} target="_blank" rel="noreferrer" className="inline-block text-sm font-semibold text-primary underline underline-offset-2">
                View uploaded checklist
              </a>
            )}
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                if (file && file.size > MAX_DOCUMENT_BYTES) {
                  setSpreadsheet(null);
                  setDocumentError('Document must be 10MB or smaller.');
                  return;
                }
                setSpreadsheet(file);
                setDocumentError('');
              }}
              className="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-secondary-foreground hover:file:bg-secondary/80"
            />
            <p className="text-xs text-muted-foreground">PDF, JPG, PNG, DOC, or DOCX • Max 10MB</p>
            <Button
              onClick={uploadSpreadsheet}
              disabled={!spreadsheet || isSaving}
              loading={isSaving}
              loadingLabel="Uploading…"
            >
              {checklist.document_link ? 'Replace document' : 'Upload completed checklist'}
            </Button>
            {documentError && <p role="alert" className="text-sm font-medium text-destructive">{documentError}</p>}
          </div>
        </Card>

        <ChecklistStats />
        <Card title="Checklist items" className="mt-6" padding="p-0">
          <div className="divide-y divide-border">
            {items.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <p className="font-semibold text-foreground">No checklist items</p>
                <p className="mt-1 text-sm text-muted-foreground">This checklist has no assigned items yet.</p>
              </div>
            ) : (
              items.map((item) => <ChecklistItem key={item.id} item={item} />)
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChecklistPage;
