import React, { useEffect, useState, useRef } from 'react';
import VerificationStepper from '@components/verification/VerificationStepper';
import PANVerification from '@components/verification/PANVerification';
import BankVerification from '@components/verification/BankVerification';
import DocumentUpload from '@components/verification/DocumentUpload';
import Loader from '@components/common/Loader';
import { useVerificationStore } from '@store/verificationStore';
import { useAuthStore } from '@store/authStore';
import { verificationApi } from '@api/verificationApi';
import { VERIFICATION_STEPS } from '@utils/constants';
import Button from '@components/common/Button';
import { useToast } from '@hooks/useToast';
import { getApiErrorMessage } from '@api/apiErrors';

const VerificationPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();
  const hasFetched = useRef(false);

  const {
    currentStep,
    isPanVerified,
    isBankVerified,
    isDocumentUploaded,
    isIdVerified,
    setDocumentUploaded,
    setCurrentStep,
    setVerificationStatus,
    nextStep,
  } = useVerificationStore();

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchVerificationStatus();
    // The ref also prevents React StrictMode from issuing a duplicate request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchVerificationStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const status = await verificationApi.getVerificationStatus();
      const { user, setUser } = useAuthStore.getState();
      if (!user || user.id !== status.id) return;
      setVerificationStatus(status);
      setUser({ ...user,
        is_verified: status.is_verified,
        is_pan_verified: status.is_pan_verified,
        is_bank_details_verified: status.is_bank_details_verified,
        is_id_verified: status.is_id_verified,
      });

      if (status.is_pan_verified !== true) {
        setCurrentStep(VERIFICATION_STEPS.PAN);
      } else if (status.is_bank_details_verified !== true) {
        setCurrentStep(VERIFICATION_STEPS.BANK);
      } else {
        setCurrentStep(VERIFICATION_STEPS.DOCUMENT);
      }
    } catch (fetchError) {
      const message = getApiErrorMessage(fetchError);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePanSuccess = (status) => {
    setVerificationStatus(status);
    nextStep();
  };

  const handleBankSuccess = (status) => {
    setVerificationStatus(status);
    nextStep();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading verification status..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
        <p className="mb-4 text-sm text-destructive">{error}</p>
        <Button onClick={fetchVerificationStatus} loading={loading} loadingLabel="Retrying…">Retry</Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-foreground mb-2">
          Set up your account
        </h1>
        <p className="text-muted-foreground">
          Verify your PAN and bank account, then send an identity document for approval.
        </p>
      </div>

      <VerificationStepper
        currentStep={currentStep}
        isPanVerified={isPanVerified}
        isBankVerified={isBankVerified}
        isIdVerified={isIdVerified}
        isDocumentUploaded={isDocumentUploaded}
      />

      <div className="mt-8">
        {currentStep === VERIFICATION_STEPS.PAN && (
          <PANVerification
            onSuccess={handlePanSuccess}
            isPanVerified={isPanVerified}
          />
        )}

        {currentStep === VERIFICATION_STEPS.BANK && (
          <BankVerification
            onSuccess={handleBankSuccess}
            isBankVerified={isBankVerified}
            canProceed={isPanVerified}
          />
        )}

        {currentStep === VERIFICATION_STEPS.DOCUMENT && (
          <DocumentUpload
            canProceed={isPanVerified && isBankVerified}
            isDocumentUploaded={isDocumentUploaded}
            isIdVerified={isIdVerified}
            onUploaded={() => setDocumentUploaded(true)}
            onRefresh={fetchVerificationStatus}
          />
        )}
      </div>
    </div>
  );
};

export default VerificationPage;
