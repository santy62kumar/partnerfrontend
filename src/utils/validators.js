import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from './constants';

export const validators = {
  // Phone number validation (Indian format: 10 digits starting with 6-9)
  phone: (phone) => {
    if (!phone) return { valid: false, message: 'Phone number is required' };
    const phoneRegex = /^[6-9]\d{9}$/;
    const valid = phoneRegex.test(phone);
    return {
      valid,
      message: valid ? '' : 'Please enter a valid 10-digit phone number',
    };
  },

  // PAN validation (Format: ABCDE1234F)
  pan: (pan) => {
    if (!pan) return { valid: false, message: 'PAN is required' };
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    const upperPan = pan.toUpperCase();
    const valid = panRegex.test(upperPan);
    return {
      valid,
      message: valid ? '' : 'Please enter a valid PAN (e.g., ABCDE1234F)',
    };
  },

  // IFSC validation (Format: ABCD0123456)
  ifsc: (ifsc) => {
    if (!ifsc) return { valid: false, message: 'IFSC code is required' };
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    const upperIfsc = ifsc.toUpperCase();
    const valid = ifscRegex.test(upperIfsc);
    return {
      valid,
      message: valid ? '' : 'Please enter a valid IFSC code (e.g., ABCD0123456)',
    };
  },

  // Account number validation (9-18 digits)
  accountNumber: (account) => {
    if (!account) return { valid: false, message: 'Account number is required' };
    const accountRegex = /^\d{9,18}$/;
    const valid = accountRegex.test(account);
    return {
      valid,
      message: valid ? '' : 'Account number must be 9-18 digits',
    };
  },

  // Pincode validation (Indian format: 6 digits, first digit cannot be 0)
  pincode: (pincode) => {
    if (!pincode) return { valid: false, message: 'Pincode is required' };
    const pincodeRegex = /^[1-9][0-9]{5}$/;
    const valid = pincodeRegex.test(pincode);
    return {
      valid,
      message: valid ? '' : 'Please enter a valid 6-digit pincode',
    };
  },

  // Name validation (2-50 characters, only letters and spaces)
  name: (name) => {
    if (!name) return { valid: false, message: 'Name is required' };
    const nameRegex = /^[a-zA-Z\s]{2,50}$/;
    const valid = nameRegex.test(name.trim());
    return {
      valid,
      message: valid ? '' : 'Name must be 2-50 characters (letters only)',
    };
  },

  // OTP validation (6 digits)
  otp: (otp) => {
    if (!otp) return { valid: false, message: 'OTP is required' };
    const otpRegex = /^\d{6}$/;
    const valid = otpRegex.test(otp);
    return {
      valid,
      message: valid ? '' : 'OTP must be 6 digits',
    };
  },

  // File validation
  file: (file) => {
    if (!file) return { valid: false, message: 'File is required' };

    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        valid: false,
        message: 'Only JPEG, PNG, and PDF files are allowed',
      };
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        message: 'File size must be less than 5MB',
      };
    }

    return { valid: true, message: '' };
  },
};