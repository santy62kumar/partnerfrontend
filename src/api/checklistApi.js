import apiClient from './axiosConfig';

const computeStats = (items) => {
  const totalItems = items.length;
  const checkedCount = items.filter((item) => item.checked).length;
  const approvedCount = items.filter((item) => item.is_approved).length;
  const pendingCount = items.filter((item) => item.checked && !item.is_approved).length;
  const completionPercentage = totalItems > 0 ? Math.round((approvedCount / totalItems) * 100) : 0;

  return {
    total_items: totalItems,
    checked_count: checkedCount,
    pending_count: pendingCount,
    approved_count: approvedCount,
    completion_percentage: completionPercentage,
  };
};

const normalizeChecklistPayload = (payload) => {
  const checklist = payload?.checklist || {};
  const rawItems = checklist.items || [];

  const items = rawItems
    .map((item) => {
      const status = item.status || {};
      return {
        id: item.id,
        checklist_item_id: item.id,
        text: item.text || '',
        position: item.position ?? 0,
        checked: status.checked ?? false,
        is_approved: status.is_approved ?? false,
        comment: status.comment ?? '',
        admin_comment: status.admin_comment ?? '',
        document_link: status.document_link ?? null,
        created_at: status.created_at || item.created_at || null,
        updated_at: status.updated_at || item.updated_at || null,
      };
    })
    .sort((a, b) => a.position - b.position);

  const stats = computeStats(items);

  return {
    checklist: {
      id: checklist.id,
      name: checklist.name,
      description: checklist.description,
    },
    items,
    job_id: payload?.job_id,
    job_title: payload?.job_title || `Job #${payload?.job_id ?? ''}`,
    ...stats,
  };
};

export const checklistApi = {
  // Fetch checklist items and normalize for UI/store
  getChecklist: async (jobId, checklistId) => {
    const response = await apiClient.get(
      `/dashboard/jobs/${jobId}/checklists/${checklistId}/items`
    );
    return normalizeChecklistPayload(response.data);
  },

  // Batch update by issuing per-item status updates, then refetching summary
  batchUpdate: async (jobId, checklistId, payload) => {
    const updates = payload?.updates || [];

    await Promise.all(
      updates.map((update) => {
        const itemId = update.checklist_item_id || update.id;
        const body = {};

        if (typeof update.checked === 'boolean') body.checked = update.checked;
        if (typeof update.comment === 'string') body.comment = update.comment;
        if (typeof update.document_link === 'string') body.document_link = update.document_link;

        return apiClient.put(
          `/dashboard/jobs/${jobId}/checklists/items/${itemId}/status`,
          body
        );
      })
    );

    const refreshed = await checklistApi.getChecklist(jobId, checklistId);
    return {
      total_items: refreshed.total_items,
      checked_count: refreshed.checked_count,
      pending_count: refreshed.pending_count,
      approved_count: refreshed.approved_count,
      completion_percentage: refreshed.completion_percentage,
    };
  },

  // Upload file to job media, then link it on checklist item status
  uploadDocument: async (jobId, checklistId, itemId, file, comment = null) => {
    const formData = new FormData();
    formData.append('file', file);

    const uploadResponse = await apiClient.post(
      `/dashboard/jobs/${jobId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    const fileUrl = uploadResponse?.data?.file_url;
    if (!fileUrl) {
      throw new Error('Upload succeeded but file URL was not returned');
    }

    const statusPayload = {
      document_link: fileUrl,
    };
    if (comment) {
      statusPayload.comment = comment;
    }

    await apiClient.put(
      `/dashboard/jobs/${jobId}/checklists/items/${itemId}/status`,
      statusPayload
    );

    const refreshed = await checklistApi.getChecklist(jobId, checklistId);
    return {
      file_url: fileUrl,
      item: refreshed.items.find((item) => item.id === itemId),
    };
  },

  getJobChecklists: async (jobId) => {
    const response = await apiClient.get(`/dashboard/jobs/${jobId}/checklists`);
    return response?.data?.checklists || [];
  },

  getChecklistSummary: async (jobId, checklistId) => {
    const data = await checklistApi.getChecklist(jobId, checklistId);
    return {
      checklist: data.checklist,
      total_items: data.total_items,
      checked_count: data.checked_count,
      pending_count: data.pending_count,
      approved_count: data.approved_count,
      completion_percentage: data.completion_percentage,
    };
  },
};

export default checklistApi;
