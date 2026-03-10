import React, { useState } from 'react';
import { verificationApi } from '@api/verificationApi';
import { useFileUpload } from '@hooks/useFileUpload';
import { useToast } from '@hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/ui/card';
import { Button } from '@components/ui/button';
import FileUpload from '@components/common/FileUpload';

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

  if (uploaded) {
    return (
      <Card className="border-border/80 shadow-sm">
        <CardContent className="pt-8 pb-8 text-center flex flex-col items-center">
          <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-success" />
          <h3 className="text-xl font-semibold text-foreground mb-2">Document Uploaded Successfully</h3>
          <p className="text-muted-foreground mb-6">Your verification applies are complete. You can now access the dashboard.</p>
          <Button size="lg" onClick={handleContinue}>
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/80 shadow-sm hover:shadow-md transition-all">
      <CardHeader>
        <CardTitle className="text-xl">Upload Educational Documents</CardTitle>
        <CardDescription>
          Upload your educational certificates or degrees. This step is optional but recommended for better opportunities.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-warning/10 border border-warning/25 rounded-lg p-3 mb-6">
          <p className="text-xs text-warning-foreground font-medium">
            Optional Step: You can skip this step and complete it later from your profile.
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

        <div className="flex gap-3 mt-8">
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={handleSkip}
          >
            Skip for Now
          </Button>
          <Button
            variant="default"
            size="lg"
            className="w-full"
            disabled={!file || uploading}
            onClick={handleUpload}
          >
            {uploading ? "Uploading..." : "Upload & Continue"}
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