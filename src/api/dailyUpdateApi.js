import apiClient from './axiosConfig';

export const dailyUpdateApi = {
  submit: async ({ jobId, notes, updateDate, photos }) => {
    const formData = new FormData();
    if (notes?.trim()) formData.append('notes', notes.trim());
    if (updateDate) formData.append('update_date', updateDate);
    photos.forEach((file) => formData.append('photos', file));

    const response = await apiClient.post(`/dashboard/jobs/${jobId}/daily-updates`, formData);
    return response.data;
  },

  getUpdates: async (jobId, { skip = 0, limit = 50 } = {}) => {
    const response = await apiClient.get(`/dashboard/jobs/${jobId}/daily-updates`, {
      params: { skip, limit },
    });
    return response.data;
  },
};
