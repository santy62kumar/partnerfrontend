// components/Checklist/ChecklistItem.jsx
import React, { useEffect, useRef, useState } from 'react';
import useChecklistStore from '../../store/checklistStore';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon,
  DocumentIcon,
  PaperClipIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';
import { Button } from '@components/ui/button';
import StatusBadge from '../common/StatusBadge';
import { getApiErrorMessage } from '../../api/apiErrors';

const ChecklistItem = ({ item }) => {
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [commentValue, setCommentValue] = useState(item.comment || '');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const toggleCheckbox = useChecklistStore(state => state.toggleCheckbox);
  const updateComment = useChecklistStore(state => state.updateComment);
  const uploadDocument = useChecklistStore(state => state.uploadDocument);

  useEffect(() => {
    setCommentValue(item.comment || '');
  }, [item.comment]);

  const statusConfig = {
    pending: {
      label: 'Pending',
      tone: 'neutral',
    },
    checked: {
      label: 'Under Review',
      tone: 'warning',
    },
    is_approved: {
      label: 'Approved',
      tone: 'success',
    },
    rejected: {
      label: 'Rejected',
      tone: 'danger',
    },
  };

  const handleCheckboxChange = () => {
    // Prevent checking if photo or notes are missing
    if (!item.checked) {
      if (!item.document_link) {
        toast.error('Please upload a photo before marking this item complete.');
        return;
      }
      if (!item.comment || item.comment.trim() === '') {
        toast.error('Please add notes/comment before marking this item complete.');
        return;
      }
    }
    
    toggleCheckbox(item.id);
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

    setIsUploading(true);
    try {
      await uploadDocument(item.id, file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };


  const getStatusKey = (item) => {
    if (item.review_status === 'approved') return 'is_approved';
    if (item.review_status === 'rejected') return 'rejected';
    if (item.checked) return 'checked';
    return 'pending';
  };

  const currentStatus = statusConfig[getStatusKey(item)];

  return (
    <div className="px-6 py-4 hover:bg-secondary/50 transition-colors">
      <div className="flex items-start space-x-4">
        {/* Checkbox */}
        <div className="flex-shrink-0 mt-1">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleCheckboxChange}
            aria-label={item.checked ? 'Uncheck item' : 'Check item'}
          >
            {item.checked ? (
              <CheckCircleSolid className="h-6 w-6 text-primary" />
            ) : (
              <CheckCircleIcon className="h-6 w-6 text-accent hover:text-muted-foreground" />
            )}
          </Button>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm font-medium ${item.checked ? 'text-muted-foreground line-through' : 'text-foreground'
              }`}>
              {item.text}
            </p>

            <StatusBadge tone={currentStatus.tone} className="ml-2">{currentStatus.label}</StatusBadge>
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
                disabled={isUploading}
              />
              <Button asChild variant="ghost" size="sm" disabled={isUploading}>
                <label htmlFor={`file-${item.id}`} className="cursor-pointer">
                  <PaperClipIcon className="h-4 w-4" />
                  <span>{isUploading ? 'Uploading…' : (item.document_link ? 'Replace' : 'Upload')}</span>
                </label>
              </Button>
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
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleCommentSave}
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCommentCancel}
                  >
                    Cancel
                  </Button>
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
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => setIsEditingComment(true)}
                    className="px-0 text-muted-foreground"
                  >
                    Add comment
                  </Button>
                )}
              </div>
            )}
          </div>

          {item.admin_comment && (
            <div className="mt-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-destructive">
                Admin Feedback
              </p>
              <p className="mt-1 text-sm text-destructive">{item.admin_comment}</p>
              {item.review_status === 'rejected' && (
                <p className="mt-2 text-xs text-destructive">
                  Fix the note or photo, then check this item again to send it back for review.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChecklistItem;
