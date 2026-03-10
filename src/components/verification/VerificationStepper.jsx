import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { VERIFICATION_STEPS } from '@utils/constants';

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
              <div className="flex flex-col items-center flex-1 relative z-10">
                <div
                  className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all bg-card
                    ${status === 'completed'
                      ? 'border-primary text-primary'
                      : status === 'current'
                        ? 'border-primary text-primary ring-4 ring-primary/10'
                        : 'border-muted text-muted-foreground'
                    }
                  `}
                >
                  {status === 'completed' ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <span className="font-semibold text-sm">{index + 1}</span>
                  )}
                </div>

                <div className="mt-4 text-center">
                  <p
                    className={`text-sm font-semibold ${status === 'completed' || status === 'current'
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                      }`}
                  >
                    {step.name}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1 hidden sm:block font-medium">
                    {step.description}
                  </p>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-[-1rem] transition-all relative z-0
                    ${getStepStatus(steps[index + 1].id) === 'completed' || getStepStatus(steps[index + 1].id) === 'current'
                      ? 'bg-primary'
                      : 'bg-muted'
                    }
                  `}
                  style={{ marginTop: '-4rem' }}
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