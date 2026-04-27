
import apiClient from './axiosConfig';

const encodePathSegment = (value) => encodeURIComponent(String(value ?? '').trim());
const BOM_FETCH_TIMEOUT_MS = 120000;

export const bomAPI = {
  fetchBOM: async (salesOrder, cabinetPosition) => {
    const response = await apiClient.get(
      `/dashboard/bom/${encodePathSegment(salesOrder)}/${encodePathSegment(cabinetPosition)}`,
      { timeout: BOM_FETCH_TIMEOUT_MS }
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
    const response = await apiClient.get(`/dashboard/bom/history/by-sales-order/${encodePathSegment(salesOrder)}`);
    return response.data;
  },
  
  updateStatus: async (soId, status) => {
    const response = await apiClient.patch(`/dashboard/bom/status/${soId}`,
      null,
      { params: { status } }
    );
    return response.data;
  },

  lookupSO: async (salesOrder) => {
    const response = await apiClient.get(`/dashboard/bom/so-lookup/${encodePathSegment(salesOrder)}`);
    return response.data;
  },

  downloadRepairOrder: async (soId, salesOrder) => {
    const response = await apiClient.get(
      `/dashboard/bom/history/${soId}/download`,
      { responseType: 'blob' }
    );
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `repair_order_${salesOrder ?? soId}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
  },
};
