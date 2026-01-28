import React from 'react';
import { IoCheckmarkCircle, IoEllipseOutline } from 'react-icons/io5';
import { VERIFICATION_STEPS } from '@utils/constants';

/**
 * Verification Stepper Component
 * Shows the current step in verification process
 */
const VerificationStepper = ({ currentStep, isPanVerified, isBankVerified }) => {
  const steps = [
    {
      id: VERIFICATION_STEPS.PAN,
      name: 'PAN Verification',
      description: 'Verify your PAN card',
    },
    {
      id: VERIFICATION_STEPS.BANK,
      name: 'Bank Details',
      description: 'Add your bank account',
    },
    {
      id: VERIFICATION_STEPS.DOCUMENT,
      name: 'Documents',
      description: 'Upload documents (Optional)',
    },
  ];

  const getStepStatus = (stepId) => {
    if (stepId === VERIFICATION_STEPS.PAN) {
      return isPanVerified ? 'completed' : currentStep === stepId ? 'current' : 'upcoming';
    }
    if (stepId === VERIFICATION_STEPS.BANK) {
      return isBankVerified ? 'completed' : currentStep === stepId ? 'current' : 'upcoming';
    }
    return currentStep === stepId ? 'current' : 'upcoming';
  };

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1">
                {/* Step Circle */}
                <div
                  className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all
                    ${
                      status === 'completed'
                        ? 'bg-[#3D1D1C] border-[#3D1D1C] text-white'
                        : status === 'current'
                        ? 'bg-white border-[#3D1D1C] text-[#3D1D1C]'
                        : 'bg-white border-primary-grey-300 text-primary-grey-400'
                    }
                  `}
                >
                  {status === 'completed' ? (
                    <IoCheckmarkCircle size={24} />
                  ) : (
                    <span className="font-semibold">{index + 1}</span>
                  )}
                </div>

                {/* Step Info */}
                <div className="mt-2 text-center">
                  <p
                    className={`text-sm font-medium ${
                      status === 'completed' || status === 'current'
                        ? 'text-primary-grey-900'
                        : 'text-primary-grey-500'
                    }`}
                  >
                    {step.name}
                  </p>
                  <p className="text-xs text-primary-grey-500 mt-1 hidden sm:block">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-2 transition-all
                    ${
                      getStepStatus(steps[index + 1].id) === 'completed'
                        ? 'bg-[#3D1D1C]'
                        : 'bg-primary-grey-300'
                    }
                  `}
                  style={{ marginTop: '-3rem' }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default VerificationStepper;