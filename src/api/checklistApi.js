import {
  exportChecklistPdf,
  getChecklistItems,
  getJobChecklists,
  updateChecklistItem,
  uploadCompletedChecklist,
  uploadJobProgress,
} from './checklistGeneratedApi';
import { getApiErrorMessage } from './apiErrors';

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
  const checklist = payload?.checklist || null;
  if (!checklist) {
    return {
      checklist: null,
      items: [],
      job_id: payload?.job_id,
      job_title: payload?.job_title || '',
      ...computeStats([]),
    };
  }
  const rawItems = checklist.items || [];

  const items = rawItems
    .map((item) => {
      const status = item.status || {};
      const reviewStatus = status.review_status || (status.is_approved ? 'approved' : (status.admin_comment ? 'rejected' : 'pending'));
      return {
        id: item.id,
        checklist_item_id: item.id,
        text: item.text || '',
        position: item.position ?? 0,
        checked: status.checked ?? false,
        is_approved: status.is_approved ?? false,
        review_status: reviewStatus,
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
      document_link: checklist.document_link ?? null,
      template_available: checklist.template_available ?? false,
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
    return normalizeChecklistPayload(await getChecklistItems(jobId, checklistId));
  },

  // Batch update by issuing per-item status updates, then refetching summary
  batchUpdate: async (jobId, checklistId, payload) => {
    const updates = payload?.updates || [];

    const results = await Promise.allSettled(
      updates.map((update) => {
        const itemId = update.checklist_item_id || update.id;
        const body = {};

        if (typeof update.checked === 'boolean') body.checked = update.checked;
        if (typeof update.comment === 'string') body.comment = update.comment;
        if (typeof update.document_link === 'string') body.document_link = update.document_link;

        return updateChecklistItem(jobId, itemId, body);
      })
    );

    const failures = results.filter((r) => r.status === 'rejected');

    if (failures.length === updates.length && updates.length > 0) {
      const firstError = failures[0]?.reason;
      throw firstError;
    }

    const refreshed = await checklistApi.getChecklist(jobId, checklistId);
    return {
      total_items: refreshed.total_items,
      checked_count: refreshed.checked_count,
      pending_count: refreshed.pending_count,
      approved_count: refreshed.approved_count,
      completion_percentage: refreshed.completion_percentage,
      ...(failures.length > 0 && {
        partial_failure: true,
        partial_error: getApiErrorMessage(failures[0]?.reason),
      }),
    };
  },

  // Upload file to job media, then link it on checklist item status
  uploadDocument: async (jobId, checklistId, itemId, file, comment = null) => {
    try {
      const uploadResponse = await uploadJobProgress(jobId, file);
      const fileUrl = uploadResponse?.file_url;
      if (!fileUrl) {
        throw new Error('Upload succeeded but file URL was not returned');
      }

      const statusPayload = {
        document_link: fileUrl,
      };
      if (comment) {
        statusPayload.comment = comment;
      }

      await updateChecklistItem(jobId, itemId, statusPayload);

      const refreshed = await checklistApi.getChecklist(jobId, checklistId);
      return {
        file_url: fileUrl,
        item: refreshed.items.find((item) => item.id === itemId),
      };
    } catch (error) {
      // Extract error message from response
      throw new Error(getApiErrorMessage(error));
    }
  },

  uploadChecklistDocument: async (jobId, checklistId, file) => {
    return uploadCompletedChecklist(jobId, checklistId, file);
  },

  // Export the official PDF supplied for this checklist.
  exportChecklist: async (jobId, checklistId) => {
    const response = await exportChecklistPdf(jobId, checklistId);
    const disposition = String(response.headers?.['content-disposition'] || '');
    const encodedFilename = disposition.match(/filename\*=utf-8''([^;]+)/i)?.[1];
    const filename = encodedFilename
      ? decodeURIComponent(encodedFilename)
      : disposition.match(/filename="?([^";]+)/i)?.[1] || 'checklist.pdf';
    const url = globalThis.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => globalThis.URL.revokeObjectURL(url), 10000);
  },

  getJobChecklists: async (jobId) => {
    const response = await getJobChecklists(jobId);
    return response?.checklists || [];
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
