// components/Checklist/ChecklistItem.jsx
import React, { useState, useRef } from 'react';
import useChecklistStore from '../../store/checklistStore';
import {
  CheckCircleIcon,
  DocumentIcon,
  PaperClipIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const ChecklistItem = ({ item }) => {
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [commentValue, setCommentValue] = useState(item.comment || '');
  const fileInputRef = useRef(null);

  const toggleCheckbox = useChecklistStore(state => state.toggleCheckbox);
  const updateStatus = useChecklistStore(state => state.updateStatus);
  const updateComment = useChecklistStore(state => state.updateComment);
  const uploadDocument = useChecklistStore(state => state.uploadDocument);

  const statusConfig = {
    pending: {
      label: 'Pending',
      className: 'badge-primary',
    },
    checked: {
      label: 'Under Review',
      className: 'badge-warning',
    },
    is_approved: {
      label: 'Approved',
      className: 'badge-success',
    },
  };

  const handleCheckboxChange = () => {
    toggleCheckbox(item.id);
  };

  const handleStatusChange = (e) => {
    updateStatus(item.id, e.target.value);
  };

  const handleCommentSave = () => {
    updateComment(item.id, commentValue);
    setIsEditingComment(false);
  };

  const handleCommentCancel = () => {
    setCommentValue(item.comment || '');
    setIsEditingComment(false);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await uploadDocument(item.id, file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload document');
    }
  };


  const getStatusKey = (item) => {
    if (item.is_approved) return 'is_approved';
    if (item.checked) return 'checked';
    return 'pending';
  };

  const currentStatus = statusConfig[getStatusKey(item)];

  return (
    <div className="px-6 py-4 hover:bg-secondary/50 transition-colors">
      <div className="flex items-start space-x-4">
        {/* Checkbox */}
        <div className="flex-shrink-0 mt-1">
          <button
            onClick={handleCheckboxChange}
            className="focus:outline-none focus:ring-2 focus:ring-ring/50 rounded"
            aria-label={item.checked ? 'Uncheck item' : 'Check item'}
          >
            {item.checked ? (
              <CheckCircleSolid className="h-6 w-6 text-primary" />
            ) : (
              <CheckCircleIcon className="h-6 w-6 text-accent hover:text-muted-foreground" />
            )}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm font-medium ${item.checked ? 'text-muted-foreground line-through' : 'text-foreground'
              }`}>
              {item.text}
            </p>

            <span className={`ml-2 ${currentStatus.className}`}>
              {currentStatus.label}
            </span>
          </div>

          <div className="flex items-center space-x-4 mb-3">
            {item.document_link && (
              <a
                href={item.document_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-xs text-primary hover:text-primary/80"
              >
                <DocumentIcon className="h-4 w-4" />
                <span>View Document</span>
              </a>
            )}

            <div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                id={`file-${item.id}`}
              />
              <label
                htmlFor={`file-${item.id}`}
                className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <PaperClipIcon className="h-4 w-4" />
                <span>{item.document_link ? 'Replace' : 'Upload'}</span>
              </label>
            </div>
          </div>

          {/* Comment Section */}
          <div className="mt-2">
            {isEditingComment ? (
              <div className="space-y-2">
                <textarea
                  value={commentValue}
                  onChange={(e) => setCommentValue(e.target.value)}
                  rows={3}
                  className="ds-input text-sm"
                  placeholder="Add a comment..."
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleCommentSave}
                    className="btn-primary btn-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCommentCancel}
                    className="btn-secondary btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {item.comment ? (
                  <div
                    onClick={() => setIsEditingComment(true)}
                    className="text-sm text-muted-foreground bg-secondary rounded px-3 py-2 cursor-pointer hover:bg-accent"
                  >
                    {item.comment}
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingComment(true)}
                    className="text-xs text-muted-foreground hover:text-foreground underline"
                  >
                    Add comment
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChecklistItem;