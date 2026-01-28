import { create } from 'zustand';
import { VERIFICATION_STEPS } from '@utils/constants';

export const useVerificationStore = create((set, get) => ({
  // State
  currentStep: VERIFICATION_STEPS.PAN,
  isVerified: false,
  isPanVerified: false,
  isBankVerified: false,
  isDocumentUploaded: false,
  
  verificationData: {
    pan: '',
    accountNumber: '',
    ifsc: '',
  },

  // Actions
  setCurrentStep: (step) => set({ currentStep: step }),

  setVerificationStatus: (status) => set({
    isVerified: status.is_verified || false,
    isPanVerified: status.is_pan_verified || false,
    isBankVerified: status.is_bank_details_verified || false,
  }),

  setPanVerified: (verified) => set({ isPanVerified: verified }),

  setBankVerified: (verified) => set({ isBankVerified: verified }),

  setDocumentUploaded: (uploaded) => set({ isDocumentUploaded: uploaded }),

  updateVerificationData: (data) => set((state) => ({
    verificationData: { ...state.verificationData, ...data },
  })),

  nextStep: () => {
    const { currentStep } = get();
    if (currentStep === VERIFICATION_STEPS.PAN) {
      set({ currentStep: VERIFICATION_STEPS.BANK });
    } else if (currentStep === VERIFICATION_STEPS.BANK) {
      set({ currentStep: VERIFICATION_STEPS.DOCUMENT });
    }
  },

  previousStep: () => {
    const { currentStep } = get();
    if (currentStep === VERIFICATION_STEPS.BANK) {
      set({ currentStep: VERIFICATION_STEPS.PAN });
    } else if (currentStep === VERIFICATION_STEPS.DOCUMENT) {
      set({ currentStep: VERIFICATION_STEPS.BANK });
    }
  },

  resetVerification: () => set({
    currentStep: VERIFICATION_STEPS.PAN,
    isVerified: false,
    isPanVerified: false,
    isBankVerified: false,
    isDocumentUploaded: false,
    verificationData: {
      pan: '',
      accountNumber: '',
      ifsc: '',
    },
  }),

  // Getters
  canProceedToBank: () => get().isPanVerified,
  canProceedToDocument: () => get().isPanVerified && get().isBankVerified,
  isFullyVerified: () => get().isPanVerified && get().isBankVerified,
}));