// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import VerificationStepper from '@components/verification/VerificationStepper';
// import PANVerification from '@components/verification/PANVerification';
// import BankVerification from '@components/verification/BankVerification';
// import DocumentUpload from '@components/verification/DocumentUpload';
// import Loader from '@components/common/Loader';
// import { useVerificationStore } from '@store/verificationStore';
// import { verificationApi } from '@api/verificationApi';
// import { VERIFICATION_STEPS } from '@utils/constants';

// const VerificationPage = () => {
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
  
//   const {
//     currentStep,
//     isPanVerified,
//     isBankVerified,
//     isDocumentUploaded,
//     setCurrentStep,
//     setVerificationStatus,
//     nextStep,
//   } = useVerificationStore();

//   // Fetch verification status on mount
//   useEffect(() => {
//     fetchVerificationStatus();
//   }, []);

//   const fetchVerificationStatus = async () => {
//     setLoading(true);
//     try {
//       const status = await verificationApi.getVerificationStatus();
//       setVerificationStatus(status);

//       // Redirect to dashboard if fully verified
//       if (
//         status.is_verified &&
//         status.is_pan_verified &&
//         status.is_bank_details_verified
//       ) {
//         navigate('/dashboard');
//       } else {
//         // Set current step based on verification status
//         if (!status.is_pan_verified) {
//           setCurrentStep(VERIFICATION_STEPS.PAN);
//         } else if (!status.is_bank_details_verified) {
//           setCurrentStep(VERIFICATION_STEPS.BANK);
//         } else {
//           setCurrentStep(VERIFICATION_STEPS.DOCUMENT);
//         }
//       }
//     } catch (error) {
//       console.error('Failed to fetch verification status:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePanSuccess = () => {
//     nextStep();
//   };

//   const handleBankSuccess = () => {
//     nextStep();
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <Loader size="lg" text="Loading verification status..." />
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto animate-fadeIn">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold font-montserrat text-primary-grey-900 mb-2">
//           Account Verification
//         </h1>
//         <p className="text-primary-grey-600">
//           Complete your profile verification to start receiving jobs
//         </p>
//       </div>

//       {/* Stepper */}
//       <VerificationStepper
//         currentStep={currentStep}
//         isPanVerified={isPanVerified}
//         isBankVerified={isBankVerified}
//       />

//       {/* Current Step Content */}
//       <div className="mt-8">
//         {currentStep === VERIFICATION_STEPS.PAN && (
//           <PANVerification
//             onSuccess={handlePanSuccess}
//             isPanVerified={isPanVerified}
//           />
//         )}

//         {currentStep === VERIFICATION_STEPS.BANK && (
//           <BankVerification
//             onSuccess={handleBankSuccess}
//             isBankVerified={isBankVerified}
//             canProceed={isPanVerified}
//           />
//         )}

//         {currentStep === VERIFICATION_STEPS.DOCUMENT && (
//           <DocumentUpload
//             canProceed={isPanVerified && isBankVerified}
//             isDocumentUploaded={isDocumentUploaded}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default VerificationPage;


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
  const hasFetched = useRef(false); // Prevent multiple fetches
  
  const {
    currentStep,
    isPanVerified,
    isBankVerified,
    isDocumentUploaded,
    setCurrentStep,
    setVerificationStatus,
    nextStep,
  } = useVerificationStore();

  // Fetch verification status on mount - ONLY ONCE
  useEffect(() => {
    if (hasFetched.current) return; // Prevent multiple calls
    
    hasFetched.current = true;
    fetchVerificationStatus();
  }, []); // Empty dependency array - run once

  const fetchVerificationStatus = async () => {
    setLoading(true);
    try {
      const status = await verificationApi.getVerificationStatus();
      console.log("Fetched Verification Status:", status);
      setVerificationStatus(status);

      // Only redirect if FULLY verified
      // if (
      //   status.is_verified === true &&
      //   status.is_pan_verified === true &&
      //   status.is_bank_details_verified === true
      // ) {
      //   // Use replace to prevent back button issues
      //   navigate('/dashboard', { replace: true });
      //   return;
      // }
      
      // Set current step based on verification status
      if (status.is_pan_verified !== true) {
        setCurrentStep(VERIFICATION_STEPS.PAN);
      } else if (status.is_bank_details_verified !== true) {
        setCurrentStep(VERIFICATION_STEPS.BANK);
      } else {
        setCurrentStep(VERIFICATION_STEPS.DOCUMENT);
      }
    } catch (error) {
      console.error('Failed to fetch verification status:', error);
      // Don't redirect on error, let user try to verify
    } finally {
      setLoading(false);
    }
  };

  const handlePanSuccess = async () => {
    // Fetch the latest status to ensure isPanVerified is set correctly
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
        <h1 className="text-3xl font-bold font-montserrat text-primary-grey-900 mb-2">
          Account Verification
        </h1>
        <p className="text-primary-grey-600">
          Complete your profile verification to start receiving jobs
        </p>
      </div>

      {/* Stepper */}
      <VerificationStepper
        currentStep={currentStep}
        isPanVerified={isPanVerified}
        isBankVerified={isBankVerified}
      />

      {/* Current Step Content */}
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