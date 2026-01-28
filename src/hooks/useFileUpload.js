import { useState } from 'react';
import { validators } from '@utils/validators';
import { useToast } from './useToast';

/**
 * Custom hook for file upload handling
 * @returns {Object} - File upload state and handlers
 */
export const useFileUpload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const toast = useToast();

  // Handle file selection
  const handleFileSelect = (selectedFile) => {
    setError(null);

    if (!selectedFile) {
      clearFile();
      return;
    }

    // Validate file
    const validation = validators.file(selectedFile);
    if (!validation.valid) {
      setError(validation.message);
      toast.error(validation.message);
      return;
    }

    setFile(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  };

  // Handle file input change
  const handleInputChange = (event) => {
    const selectedFile = event.target.files?.[0];
    handleFileSelect(selectedFile);
  };

  // Handle drag and drop
  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const droppedFile = event.dataTransfer.files?.[0];
    handleFileSelect(droppedFile);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  // Clear file
  const clearFile = () => {
    setFile(null);
    setPreview(null);
    setError(null);
  };

  // Reset all states
  const reset = () => {
    setFile(null);
    setPreview(null);
    setUploading(false);
    setError(null);
  };

  return {
    file,
    preview,
    uploading,
    error,
    setUploading,
    handleFileSelect,
    handleInputChange,
    handleDrop,
    handleDragOver,
    clearFile,
    reset,
  };
};