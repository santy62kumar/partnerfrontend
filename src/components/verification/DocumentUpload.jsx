import React from 'react';
import { verificationApi } from '@api/verificationApi';
import { useFileUpload } from '@hooks/useFileUpload';
import { useToast } from '@hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card';
import { Button } from '@components/ui/button';
import FileUpload from '@components/common/FileUpload';
import { getApiErrorMessage } from '@api/apiErrors';

const DocumentUpload = ({ canProceed, isDocumentUploaded, isIdVerified, onUploaded, onRefresh }) => {
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

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    try {
      await verificationApi.uploadDocument(file);
      toast.success('Document sent for approval');
      onUploaded();
      clearFile();
    } catch (err) {
      const message = getApiErrorMessage(err);
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  if (!canProceed) {
    return (
      <Card className="border-border/80 shadow-sm opacity-80 bg-secondary/10">
        <CardContent className="pt-8 pb-8 text-center flex flex-col items-center">
          <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">Previous Steps Required</h3>
          <p className="text-muted-foreground">
            Please verify your PAN and bank details first.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isDocumentUploaded || isIdVerified) {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardContent className="pt-8 pb-8 text-center flex flex-col items-center">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-success" />
          <h3 className="text-xl font-semibold text-foreground mb-2">{isIdVerified ? 'Your account is ready' : 'Document sent — waiting for approval'}</h3>
          <p className="text-muted-foreground mb-6">{isIdVerified ? 'You can now view your assigned jobs.' : 'Your administrator needs to review your identity document. You do not need to upload it again. Check here for approval before starting work.'}</p>
          <Button size="lg" onClick={isIdVerified ? handleContinue : onRefresh}>
            {isIdVerified ? 'Go to my jobs' : 'Check approval status'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 shadow-sm hover:shadow-md transition-all">
      <CardHeader>
        <CardTitle className="text-xl">Send your identity document</CardTitle>
        <CardDescription>
          Upload a clear identity document for your administrator to review. Approval is required before you can access jobs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FileUpload
          file={file}
          preview={preview}
          onFileSelect={handleFileSelect}
          onClear={clearFile}
          error={error}
          label="Identity document"
          disabled={uploading}
        />

        <div className="flex gap-3 mt-8">
          <Button
            variant="default"
            size="lg"
            className="w-full"
            disabled={!file || uploading}
            onClick={handleUpload}
          >
            {uploading ? "Sending..." : "Send for approval"}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Accepted formats: JPG, PNG, PDF (Max 5MB)
        </p>
      </CardContent>
    </Card>
  );
};

export default DocumentUpload;
