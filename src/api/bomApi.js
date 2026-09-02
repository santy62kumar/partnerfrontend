import {
  downloadRepairOrder,
  getBomItems,
  getRequisiteHistory,
  lookupSalesOrder,
  retryRequisiteSync,
  submitSiteRequisite,
  updateRequisiteStatus,
} from './bomGeneratedApi';

export const bomAPI = {
  fetchBOM: getBomItems,
  submitRequisite: submitSiteRequisite,

  getHistory: async (limit = 50, offset = 0) => {
    const history = [];
    while (history.length < limit) {
      const pageLimit = Math.min(50, limit - history.length);
      const page = await getRequisiteHistory(pageLimit, offset + history.length);
      history.push(...page);
      if (page.length < pageLimit) break;
    }
    return history;
  },

  updateStatus: updateRequisiteStatus,
  retrySync: retryRequisiteSync,
  lookupSO: lookupSalesOrder,

  downloadRepairOrder: async (soId, salesOrder) => {
    const blob = await downloadRepairOrder(soId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `repair_order_${salesOrder ?? soId}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  },
};
