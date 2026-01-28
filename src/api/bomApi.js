
import apiClient from './axiosConfig';

export const bomAPI = {
  fetchBOM: async (salesOrder, cabinetPosition) => {
    const response = await apiClient.get(
      `/dashboard/bom/${salesOrder}/${cabinetPosition}`
    );
    return response.data;
  },
  
  submitRequisite: async (data) => {
    const response = await apiClient.post('/dashboard/bom/submit', data);
    return response.data;
  },
  
  getHistory: async (limit = 50, offset = 0) => {
    const response = await apiClient.get('/dashboard/bom/history', {
      params: { limit, offset }
    });
    return response.data;
  },
  
  getHistoryBySalesOrder: async (salesOrder) => {
    const response = await apiClient.get(`/dashboard/bom/history/${salesOrder}`);
    return response.data;
  },
  
  updateStatus: async (soId, status) => {
    const response = await apiClient.patch(`/dashboard/bom/status/${soId}`,
      null, 
      { params: { status } }
    );
    return response.data;
  }
};

