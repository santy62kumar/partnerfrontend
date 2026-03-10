import React, { useRef } from 'react';
import { IoCloudUploadOutline, IoClose, IoDocumentTextOutline } from 'react-icons/io5';
import { formatters } from '@utils/formatters';

const FileUpload = ({
  file,
  preview,
  onFileSelect,
  onClear,
  error,
  disabled = false,
  accept = 'image/jpeg,image/jpg,image/png,application/pdf',
  label = 'Upload File',
}) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleKeyDown = (e) => {
    if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const handleChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!disabled) {
      const droppedFile = e.dataTransfer.files?.[0];
      if (droppedFile) {
        onFileSelect(droppedFile);
      }
    }
  };

  return (
    <div className="w-full">
      {label && (
        <label className="ds-label">
          {label}
        </label>
      )}

      {!file ? (
        <div
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label={`${label} — click or drag and drop a JPG, PNG, or PDF file (max 5MB)`}
          aria-disabled={disabled}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-all duration-200
                        ${isDragging
              ? 'border-primary bg-primary/10'
              : error
                ? 'border-destructive bg-destructive/5'
                : 'border-input hover:border-primary hover:bg-primary/5'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <IoCloudUploadOutline
            aria-hidden="true"
            className={`mx-auto mb-4 ${error ? 'text-destructive' : 'text-accent'
              }`}
            size={48}
          />
          <p className="text-sm font-medium text-foreground mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG or PDF (Max 5MB)
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            disabled={disabled}
            aria-hidden="true"
            tabIndex={-1}
            className="hidden"
          />
        </div>
      ) : (
        <div className="border border-border rounded-lg p-4 flex items-center justify-between bg-secondary">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {preview ? (
              <img
                src={preview}
                alt={`Preview of ${file.name}`}
                className="w-12 h-12 object-cover rounded"
              />
            ) : (
              <IoDocumentTextOutline
                aria-hidden="true"
                className="text-accent flex-shrink-0"
                size={32}
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatters.fileSize(file.size)}
              </p>
            </div>
          </div>
          <button
            onClick={onClear}
            aria-label={`Remove ${file.name}`}
            className="text-muted-foreground hover:text-destructive transition-colors ml-2"
            type="button"
          >
            <IoClose aria-hidden="true" size={20} />
          </button>
        </div>
      )}

      {error && (
        <p className="mt-2 text-sm text-destructive" role="alert">{error}</p>
      )}
    </div>
  );
};

export default FileUpload;