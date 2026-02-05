// api/checklistApi.js
import apiClient from './axiosConfig';

/**
 * Checklist API Client
 * 
 * Handles all HTTP requests to the checklist endpoints
 * Uses the existing axios configuration from axiosConfig
 */

export const checklistApi = {
  /**
   * 📥 BULK FETCH: Get complete checklist with all items
   * 
   * @param {number} jobId - Job ID
   * @param {number} checklistId - Checklist ID
   * @returns {Promise} Response data
   */
  getChecklist: async (jobId, checklistId) => {
    const response = await apiClient.get(
      `/dashboard/jobs/${jobId}/checklist/${checklistId}`
    );
    return response.data;
  },

  /**
   * 💾 BATCH UPDATE: Update multiple checklist items at once
   * 
   * @param {number} jobId - Job ID
   * @param {number} checklistId - Checklist ID
   * @param {Object} payload - Batch update payload
   * @param {Array} payload.updates - Array of item updates
   * @returns {Promise} Response data
   * 
   * @example
   * await checklistApi.batchUpdate(123, 456, {
   *   updates: [
   *     { id: 1, checked: true, comment: "Done" },
   *     { id: 2, status: "approved" }
   *   ]
   * });
   */
  batchUpdate: async (jobId, checklistId, payload) => {
    const response = await apiClient.post(
      `/dashboard/jobs/${jobId}/checklist/${checklistId}/batch-update`,
      payload
    );
    return response.data;
  },

  /**
   * 📤 DOCUMENT UPLOAD: Upload document for a checklist item
   * 
   * @param {number} jobId - Job ID
   * @param {number} checklistId - Checklist ID
   * @param {number} itemId - Item ID
   * @param {File} file - File to upload
   * @param {string|null} comment - Optional comment
   * @returns {Promise} Response data
   */
  uploadDocument: async (jobId, checklistId, itemId, file, comment = null) => {
    const formData = new FormData();
    formData.append('file', file);
    
    if (comment) {
      formData.append('comment', comment);
    }

    const response = await apiClient.post(
      `/dashboard/jobs/${jobId}/checklist/${checklistId}/items/${itemId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  /**
   * 📋 Get all checklists for a job with summary statistics
   * 
   * @param {number} jobId - Job ID
   * @returns {Promise} Response data
   */
  getJobChecklists: async (jobId) => {
    const response = await apiClient.get(`/dashboard/jobs/${jobId}/checklists`);
    return response.data;
  },

  /**
   * 📊 Get checklist summary (metadata + stats only, no items)
   * 
   * @param {number} jobId - Job ID
   * @param {number} checklistId - Checklist ID
   * @returns {Promise} Response data
   */
  getChecklistSummary: async (jobId, checklistId) => {
    const response = await apiClient.get(
      `/dashboard/jobs/${jobId}/checklist/${checklistId}/summary`
    );
    return response.data;
  },
};

export default checklistApi;