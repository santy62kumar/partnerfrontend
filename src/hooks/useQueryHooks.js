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

export const useJobProgress = (jobId) => {
    return useQuery({
        queryKey: ['partner-job-progress', jobId],
        queryFn: async () => {
            const response = await dashboardApi.getJobProgress(jobId);
            return response.uploads || [];
        },
        enabled: !!jobId,
        staleTime: 2 * 60 * 1000,
    });
};

export const useUploadProgress = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ jobId, file, comment }) =>
            dashboardApi.uploadProgress(jobId, file, comment),
        onSuccess: (_, variables) => {
            // Invalidate both progress and job detail so they refresh
            queryClient.invalidateQueries({ queryKey: ['partner-job-progress', variables.jobId] });
            queryClient.invalidateQueries({ queryKey: ['partner-job', variables.jobId] });
        },
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
