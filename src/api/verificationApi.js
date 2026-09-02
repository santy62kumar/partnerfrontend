import {
  deleteVerificationData,
  getVerificationStatus,
  uploadDocument,
  verifyBank,
  verifyPan,
} from './verificationGeneratedApi';

export const verificationApi = {
  getVerificationStatus,
  verifyPan,
  verifyBank,
  uploadDocument,
  deleteVerificationData,
};
