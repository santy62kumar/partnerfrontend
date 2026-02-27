import React, { useState } from 'react';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import FileUpload from '@components/common/FileUpload';
import { dashboardApi } from '@api/dashboardApi';
import { useFileUpload } from '@hooks/useFileUpload';
import { useToast } from '@hooks/useToast';

/**
 * Progress Upload Component
 * Allows users to upload job progress (file and/or comment)
 */
const ProgressUpload = ({ jobId, onUploadSuccess }) => {
  const toast = useToast();
  const [comment, setComment] = useState('');
  const [uploading, setUploading] = useState(false);
  
  const {
    file,
    preview,
    error: fileError,
    handleFileSelect,
    clearFile,
    reset: resetFile,
  } = useFileUpload();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Backend requires a file for progress uploads.
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      const response = await dashboardApi.uploadProgress(
        jobId,
        file,
        comment.trim()
      );
      
      toast.success('Progress uploaded successfully!');
      
      // Clear form
      setComment('');
      resetFile();
      
      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess(response);
      }
    } catch (err) {
      const message = err.message || 'Failed to upload progress';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card title="Upload Progress">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> You can upload a file, add a comment, or both. Once uploaded, this information cannot be deleted.
          </p>
        </div> */}

        {/* File Upload */}
        <FileUpload
          file={file}
          preview={preview}
          onFileSelect={handleFileSelect}
          onClear={clearFile}
          error={fileError}
          label="Upload Document or Image"
        />

        {/* Comment */}

        <div>
  <label className="block text-xs font-medium text-primary-grey-700 mb-1">
    Comment or Notes
  </label>

  <textarea
    value={comment}
    onChange={(e) => setComment(e.target.value)}
    placeholder="Add notes or updates..."
    rows={3}
    className="
      w-full px-3 py-1.5 text-xs
      border border-primary-grey-300 rounded-md
      focus:outline-none focus:ring-1 focus:border-[#3D1D1C] focus:ring-[#3D1D1C]
      transition-colors resize-none
    "
  />

  <p className="mt-0.5 text-[11px] text-primary-grey-500">
    {comment.length} characters
  </p>
</div>

        {/* <div>
          <label className="block text-sm font-medium text-primary-grey-700 mb-2">
            Comment or Notes
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add any notes or updates about this job..."
            rows={4}
          />
          <p className="mt-1 text-xs text-primary-grey-500">
            {comment.length} characters
          </p>
        </div> */}

        {/* Submit Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={uploading}
          disabled={!file}
        >
          Upload Progress
        </Button>
      </form>
    </Card>
  );
};

export default ProgressUpload; 
