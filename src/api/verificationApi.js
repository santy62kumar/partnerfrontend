import apiClient from './axiosConfig';

export const verificationApi = {
  // Get verification status
  getVerificationStatus: async () => {
    const response = await apiClient.get('/verification/status');
    console.log("Verification Status Responsesss:", response.data);
    return response.data;
  },

  // Verify PAN
  verifyPan: async (pan) => {
    const response = await apiClient.post('/verification/pan', {
      pan: pan.toUpperCase(),
    });
    return response.data;
  },

  // Verify Bank Details
  verifyBank: async (accountNumber, ifsc) => {
    const response = await apiClient.post('/verification/bank', {
      account_number: accountNumber,
      ifsc: ifsc.toUpperCase(),
      fetch_ifsc: false,
    });
    return response.data;
  },

  // Upload Document (Optional)
  uploadDocument: async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post('/verification/verify_document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get panel access
  getPanelAccess: async () => {
    const response = await apiClient.get('/verification/panel-access');
    return response.data;
  },
};