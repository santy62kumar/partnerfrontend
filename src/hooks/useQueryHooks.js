import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@api/dashboardApi';
import { bomAPI } from '@api/bomApi';

// ─── Dashboard / Jobs ────────────────────────────────────────────

export const useJobs = () => {
    return useQuery({
        queryKey: ['partner-jobs'],
        queryFn: async () => {
            const response = await dashboardApi.getJobs();
            return response.jobs || response.data || [];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
};

export const useJobDetail = (jobId) => {
    return useQuery({
        queryKey: ['partner-job', jobId],
        queryFn: async () => {
            const response = await dashboardApi.getJob(jobId);
            return response.job || response.data;
        },
        enabled: !!jobId,
        staleTime: 2 * 60 * 1000, // 2 minutes — detail data may update more often
    });
};

export const useJobHistory = (jobId) => useQuery({
    queryKey: ['partner-job-history', jobId],
    queryFn: () => dashboardApi.getJobHistory(jobId),
    enabled: !!jobId,
    staleTime: 60 * 1000,
});

export const useAddJobNote = (jobId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (notes) => dashboardApi.addJobNote(jobId, notes),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['partner-job-history', jobId] }),
    });
};

export const useAttendance = () => {
    return useQuery({
        queryKey: ['partner-attendance'],
        queryFn: async () => {
            const response = await dashboardApi.getAttendance();
            return response || { records: [], missing_reports: [] };
        },
        staleTime: 60 * 1000,
    });
};

export const useRecordAttendance = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => dashboardApi.recordAttendance(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partner-attendance'] });
        },
    });
};

export const useBilling = (jobId, enabled = true) => {
    return useQuery({
        queryKey: ['partner-billing', jobId],
        queryFn: async () => {
            const response = await dashboardApi.getBilling(jobId);
            return response;
        },
        enabled: !!jobId && enabled,
        staleTime: 60 * 1000,
    });
};

export const useRequestInvoice = (jobId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => dashboardApi.requestInvoice(jobId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partner-billing', jobId] });
        },
    });
};

export const useRequestAdditionalInvoice = (jobId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => dashboardApi.requestAdditionalInvoice(jobId, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['partner-billing', jobId] }),
    });
};

// ─── BOM / Site Requisite ────────────────────────────────────────

export const useBOMHistory = (limit = 100, offset = 0) => {
    return useQuery({
        queryKey: ['partner-bom-history', limit, offset],
        queryFn: () => bomAPI.getHistory(limit, offset),
        staleTime: 5 * 60 * 1000,
    });
};

export const useUpdateBOMStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ soId, status }) => bomAPI.updateStatus(soId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partner-bom-history'] });
        },
    });
};
