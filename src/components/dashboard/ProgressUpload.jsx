import React, { useState } from 'react';
import Card from '@components/common/Card';
import Button from '@components/common/Button';
import FileUpload from '@components/common/FileUpload';
import { dashboardApi } from '@api/dashboardApi';
import { useFileUpload } from '@hooks/useFileUpload';
import { useToast } from '@hooks/useToast';
import { IoCloudUploadOutline } from 'react-icons/io5';

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

      setComment('');
      resetFile();

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
    <Card
      title="Upload Progress"
      headerRight={(
        <span className="text-xs text-muted-foreground">
          Max 5MB
        </span>
      )}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-lg border border-border/70 bg-secondary/60 px-3 py-2">
          <p className="text-xs text-muted-foreground">
            Add on-site photos or files with a short update so progress history stays actionable.
          </p>
        </div>

        <FileUpload
          file={file}
          preview={preview}
          onFileSelect={handleFileSelect}
          onClear={clearFile}
          error={fileError}
          label="Upload Document or Image"
        />

        <div>
          <label className="ds-label text-xs">
            Comment or Notes
          </label>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add notes or updates..."
            rows={3}
            className="ds-input min-h-[96px] text-sm resize-none"
          />

          <p className="mt-1 text-[11px] text-muted-foreground">
            {comment.length} characters
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          loading={uploading}
          disabled={!file}
        >
          <IoCloudUploadOutline size={18} />
          Upload Update
        </Button>
      </form>
    </Card>
  );
};

export default ProgressUpload; 
