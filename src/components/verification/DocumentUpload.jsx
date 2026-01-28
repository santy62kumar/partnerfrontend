import React, { useState } from 'react';
import Button from '@components/common/Button';
import Card from '@components/common/Card';
import FileUpload from '@components/common/FileUpload';
import { verificationApi } from '@api/verificationApi';
import { useFileUpload } from '@hooks/useFileUpload';
import { useToast } from '@hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { IoCheckmarkCircleOutline, IoLockClosedOutline } from 'react-icons/io5';

/**
 * Document Upload Component
 * Third step in verification process (Optional)
 */
const DocumentUpload = ({ canProceed, isDocumentUploaded }) => {
  const toast = useToast();
  const navigate = useNavigate();
  const {
    file,
    preview,
    uploading,
    error,
    setUploading,
    handleFileSelect,
    clearFile,
  } = useFileUpload();
  const [uploaded, setUploaded] = useState(isDocumentUploaded);

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      await verificationApi.uploadDocument(file);
      toast.success('Document uploaded successfully!');
      setUploaded(true);
      clearFile();
    } catch (err) {
      const message = err.message || 'Document upload failed';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  if (!canProceed) {
    return (
      <Card>
        <div className="text-center py-8">
          <IoLockClosedOutline
            size={64}
            className="text-primary-grey-400 mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold text-primary-grey-900 mb-2">
            Complete Previous Steps
          </h3>
          <p className="text-primary-grey-600">
            Please verify your PAN and bank details first.
          </p>
        </div>
      </Card>
    );
  }

  if (uploaded) {
    return (
      <Card>
        <div className="text-center py-8">
          <IoCheckmarkCircleOutline
            size={64}
            className="text-[#3D1D1C] mx-auto mb-4"
          />
          <h3 className="text-xl font-semibold text-primary-grey-900 mb-2">
            Document Uploaded Successfully
          </h3>
          <p className="text-primary-grey-600 mb-6">
            Your verification is complete. You can now access the dashboard.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={handleContinue}
          >
            Continue to Dashboard
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Upload Educational Documents (Optional)">
      <p className="text-sm text-primary-grey-600 mb-4">
        Upload your educational certificates or degrees. This step is optional but recommended for better opportunities.
      </p>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
        <p className="text-xs text-yellow-800">
          <strong>Optional Step:</strong> You can skip this step and complete it later from your profile.
        </p>
      </div>

      <FileUpload
        file={file}
        preview={preview}
        onFileSelect={handleFileSelect}
        onClear={clearFile}
        error={error}
        label="Educational Certificate"
      />

      <div className="flex gap-3 mt-6">
        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={handleSkip}
        >
          Skip for Now
        </Button>
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={uploading}
          disabled={!file}
          onClick={handleUpload}
        >
          Upload & Continue
        </Button>
      </div>

      <p className="text-xs text-primary-grey-500 text-center mt-4">
        Accepted formats: JPG, PNG, PDF (Max 5MB)
      </p>
    </Card>
  );
};

export default DocumentUpload;