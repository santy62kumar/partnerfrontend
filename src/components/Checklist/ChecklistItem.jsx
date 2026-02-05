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

/**
 * Individual Checklist Item Component
 * 
 * Features:
 * - Checkbox toggle
 * - Status dropdown
 * - Comment editing
 * - Document upload
 * - Optimistic updates
 */

const ChecklistItem = ({ item }) => {
  // console.log('Rendering ChecklistItem - item:', item);
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [commentValue, setCommentValue] = useState(item.comment || '');
  const fileInputRef = useRef(null);

  // Actions from store
  const toggleCheckbox = useChecklistStore(state => state.toggleCheckbox);
  const updateStatus = useChecklistStore(state => state.updateStatus);
  const updateComment = useChecklistStore(state => state.updateComment);
  const uploadDocument = useChecklistStore(state => state.uploadDocument);

  // Status styling
  const statusConfig = {
    pending: {
      label: 'Pending',
      className: 'bg-[#3D1D1C]/10 text-[#3D1D1C]',
    },
    checked: {
      label: 'Under Review',
      className: 'bg-yellow-100 text-yellow-800',
    },
    is_approved: {
      label: 'Approved',
      className: 'bg-green-100 text-green-800',
    },

  };

  // Handle checkbox toggle
  const handleCheckboxChange = () => {
    toggleCheckbox(item.id);
  };

  // Handle status change
  const handleStatusChange = (e) => {
    updateStatus(item.id, e.target.value);
  };

  // Handle comment save
  const handleCommentSave = () => {
    updateComment(item.id, commentValue);
    setIsEditingComment(false);
  };

  // Handle comment cancel
  const handleCommentCancel = () => {
    setCommentValue(item.comment || '');
    setIsEditingComment(false);
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      await uploadDocument(item.id, file);
      // Reset file input
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

  // const currentStatus = statusConfig[item.is_approved ? 'is_approved' : 'pending'];

  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start space-x-4">
        {/* Checkbox */}
        <div className="flex-shrink-0 mt-1">
          <button
            onClick={handleCheckboxChange}
            className="focus:outline-none focus:ring-2 focus:ring-[#3D1D1C]/50 rounded"
            aria-label={item.checked ? 'Uncheck item' : 'Check item'}
          >
            {item.checked ? (
              <CheckCircleSolid className="h-6 w-6 text-[#3D1D1C]" />
            ) : (
              <CheckCircleIcon className="h-6 w-6 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Item Text */}
          <div className="flex items-center justify-between mb-2">
            <p className={`text-sm font-medium ${
              item.checked ? 'text-gray-500 line-through' : 'text-gray-900'
            }`}>
              {item.text}
            </p>
            
            {/* Status Badge */}
            <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
              currentStatus.className
            }`}>
              {currentStatus.label}
            </span>
          </div>

          {/* Status Selector & Document */}
          <div className="flex items-center space-x-4 mb-3">
            

            {/* Document Link */}
            {item.document_link && (
              <a
                href={item.document_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-xs text-[#3D1D1C] hover:text-[#3D1D1C]/80"
              >
                <DocumentIcon className="h-4 w-4" />
                <span>View Document</span>
              </a>
            )}

            {/* Upload Button */}
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
                className="flex items-center space-x-1 text-xs text-gray-600 hover:text-gray-900 cursor-pointer"
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
                  className="w-full text-sm border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#3D1D1C]/50 focus:border-transparent"
                  placeholder="Add a comment..."
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleCommentSave}
                    className="px-3 py-1 text-xs font-medium text-white bg-[#3D1D1C] rounded hover:bg-[#3D1D1C]/80 focus:outline-none focus:ring-2 focus:ring-[#3D1D1C]/50"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCommentCancel}
                    className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
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
                    className="text-sm text-gray-600 bg-gray-50 rounded px-3 py-2 cursor-pointer hover:bg-gray-100"
                  >
                    {item.comment}
                  </div>
                ) : (
                  <button
                    onClick={() => setIsEditingComment(true)}
                    className="text-xs text-gray-500 hover:text-gray-700 underline"
                  >
                    Add comment
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Timestamp */}
          {/* <div className="mt-2 text-xs text-gray-400">
            Created: {new Date(item.created_at).toLocaleDateString()}
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default ChecklistItem;