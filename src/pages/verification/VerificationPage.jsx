


import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import VerificationStepper from '@components/verification/VerificationStepper';
import PANVerification from '@components/verification/PANVerification';
import BankVerification from '@components/verification/BankVerification';
import DocumentUpload from '@components/verification/DocumentUpload';
import Loader from '@components/common/Loader';
import { useVerificationStore } from '@store/verificationStore';
import { verificationApi } from '@api/verificationApi';
import { VERIFICATION_STEPS } from '@utils/constants';

const VerificationPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  const {
    currentStep,
    isPanVerified,
    isBankVerified,
    isDocumentUploaded,
    setCurrentStep,
    setVerificationStatus,
    nextStep,
  } = useVerificationStore();

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    setLoading(true);
    try {
      const status = await verificationApi.getVerificationStatus();
      console.log("Fetched Verification Status:", status);
      setVerificationStatus(status);

      if (status.is_pan_verified !== true) {
        setCurrentStep(VERIFICATION_STEPS.PAN);
      } else if (status.is_bank_details_verified !== true) {
        setCurrentStep(VERIFICATION_STEPS.BANK);
      } else {
        setCurrentStep(VERIFICATION_STEPS.DOCUMENT);
      }
    } catch (error) {
      console.error('Failed to fetch verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePanSuccess = async () => {
    try {
      const status = await verificationApi.getVerificationStatus();
      setVerificationStatus(status);
    } catch (error) {
      console.error('Failed to fetch verification status:', error);
    }
    nextStep();
  };

  const handleBankSuccess = async () => {
    try {
      const status = await verificationApi.getVerificationStatus();
      setVerificationStatus(status);
    } catch (error) {
      console.error('Failed to fetch verification status:', error);
    }
    nextStep();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader size="lg" text="Loading verification status..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-foreground mb-2">
          Account Verification
        </h1>
        <p className="text-muted-foreground">
          Complete your profile verification to start receiving jobs
        </p>
      </div>

      <VerificationStepper
        currentStep={currentStep}
        isPanVerified={isPanVerified}
        isBankVerified={isBankVerified}
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
          />
        )}
      </div>
    </div>
  );
};

export default VerificationPage;