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
import ErrorAlert from '../common/ErrorAlert';


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
  const isSaving = useChecklistStore(state => state.isSaving);
  
  // Actions
  const fetchChecklist = useChecklistStore(state => state.fetchChecklist);
  // console.log('ChecklistPage - fetchChecklist:', fetchChecklist);
  const resetStore = useChecklistStore(state => state.resetStore);
  const uploadChecklistDocument = useChecklistStore(state => state.uploadChecklistDocument);
  const [spreadsheet, setSpreadsheet] = useState(null);
  const [documentError, setDocumentError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  // console.log('ChecklistPage - resetStore:', resetStore);

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
      <div className="mx-auto max-w-7xl space-y-3 px-4 py-8 sm:px-6 lg:px-8">
        <ErrorAlert message={error} />
        <button
          type="button"
          onClick={() => fetchChecklist(Number(jobId), Number(checklistId))}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50"
        >
          Try again
        </button>
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

  const downloadTemplate = async () => {
    setDocumentError('');
    setIsDownloading(true);
    try {
      await checklistApi.downloadChecklistTemplate(Number(jobId), Number(checklistId));
    } catch (downloadError) {
      setDocumentError(downloadError?.message || 'Could not download the checklist workbook.');
    } finally {
      setIsDownloading(false);
    }
  };

  const exportChecklist = async () => {
    setDocumentError('');
    setIsExporting(true);
    try {
      await checklistApi.exportChecklist(Number(jobId), Number(checklistId));
    } catch (exportError) {
      setDocumentError(exportError?.message || 'Could not export this checklist.');
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
      setDocumentError(uploadError?.message || 'Could not upload the completed checklist.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      
      <UnsavedChangesBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <ChecklistHeader 
          jobTitle={jobTitle}
          checklistName={checklist.name}
          checklistDescription={checklist.description}
        />

        {/* Rendered outside both branches: every checklist exports, ISM or not. */}
        <div className="mt-4">
          <button
            type="button"
            onClick={exportChecklist}
            disabled={isExporting}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isExporting ? 'Exporting…' : 'Export PDF'}
          </button>
        </div>

        {checklist.template_available && (
          <section className="mt-6 overflow-hidden rounded-lg border border-amber-200 bg-white shadow-sm">
            <div className="border-b border-amber-100 bg-amber-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">Excel workflow</p>
              <h2 className="mt-1 text-lg font-semibold text-gray-900">Complete the ISM Checklist tab offline</h2>
            </div>
            <div className="space-y-4 p-5">
              <ol className="grid gap-3 text-sm text-gray-700 sm:grid-cols-3">
                {['Download the workbook', 'Fill the ISM Checklist tab', 'Upload the completed .xlsx'].map((step, index) => (
                  <li key={step} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-800">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>

              <div className="flex flex-col gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={downloadTemplate}
                  disabled={isDownloading}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDownloading ? 'Downloading…' : 'Download workbook'}
                </button>
                <label className="min-w-0 flex-1 cursor-pointer rounded-md border border-dashed border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-amber-400 hover:bg-amber-50/40">
                  <span className="block truncate">{spreadsheet?.name || 'Choose completed .xlsx file'}</span>
                  <input
                    type="file"
                    accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                    className="sr-only"
                    onChange={(event) => {
                      const file = event.target.files?.[0] || null;
                      setDocumentError(file && !file.name.toLowerCase().endsWith('.xlsx') ? 'Please choose an .xlsx file.' : '');
                      setSpreadsheet(file?.name.toLowerCase().endsWith('.xlsx') ? file : null);
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={uploadSpreadsheet}
                  disabled={!spreadsheet || isSaving}
                  className="rounded-md bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? 'Uploading…' : 'Upload completed checklist'}
                </button>
              </div>

              {checklist.document_link && (
                <a href={checklist.document_link} target="_blank" rel="noreferrer" className="inline-block text-sm font-semibold text-amber-800 underline underline-offset-2">
                  View uploaded checklist
                </a>
              )}
              {documentError && <p role="alert" className="text-sm font-medium text-red-600">{documentError}</p>}
            </div>
          </section>
        )}

        {!checklist.template_available && (
          <>
            {/* Non-ISM checklists take a supporting document too — the mobile client
                has always offered this, so the web client must not be the odd one out. */}
            <section className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-5 py-4">
                <h2 className="text-base font-semibold text-gray-900">Checklist Document</h2>
              </div>
              <div className="space-y-3 px-5 py-4">
                {checklist.document_link && (
                  <a
                    href={checklist.document_link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-block text-sm font-semibold text-emerald-700 underline underline-offset-2"
                  >
                    View uploaded document
                  </a>
                )}
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.docx"
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
                  className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-md file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-semibold hover:file:bg-gray-200"
                />
                <p className="text-xs text-gray-500">PDF, JPG, PNG, or DOCX • Max 10MB</p>
                <button
                  type="button"
                  onClick={uploadSpreadsheet}
                  disabled={!spreadsheet || isSaving}
                  className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSaving ? 'Uploading…' : checklist.document_link ? 'Replace document' : 'Upload document'}
                </button>
                {documentError && (
                  <p role="alert" className="text-sm font-medium text-red-600">{documentError}</p>
                )}
              </div>
            </section>

            <ChecklistStats />
            <div className="bg-white rounded-lg shadow-sm mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Checklist Items</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {items.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className="text-gray-500">No items in this checklist</p>
                  </div>
                ) : (
                  items.map((item) => <ChecklistItem key={item.id} item={item} />)
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChecklistPage;
