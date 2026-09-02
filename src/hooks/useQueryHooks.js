import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardApi } from '@api/dashboardApi';
import { bomAPI } from '@api/bomApi';
import { getRoster } from '@api/rosterApi';

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
            const job = response.job || response.data;
            return response.checklistsError ? { ...job, _partialError: response.checklistsError } : job;
        },
        enabled: !!jobId,
        staleTime: 2 * 60 * 1000, // 2 minutes — detail data may update more often
    });
};

// Starting a job refreshes the job itself, its activity log and the job list card.
export const useStartJob = (jobId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ otp, notes }) => (otp
            ? dashboardApi.verifyStartOtp(jobId, otp, notes)
            : dashboardApi.startJob(jobId, notes)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partner-job', jobId] });
            queryClient.invalidateQueries({ queryKey: ['partner-job-history', jobId] });
            queryClient.invalidateQueries({ queryKey: ['partner-jobs'] });
        },
    });
};

export const useRequestStartOtp = (jobId) => useMutation({
    mutationFn: () => dashboardApi.requestStartOtp(jobId),
});

// Finishing invalidates the same three views starting does.
export const useFinishJob = (jobId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ otp, notes, ...documents }) => (otp
            ? dashboardApi.verifyEndOtp(jobId, otp, notes, documents)
            : dashboardApi.finishJob(jobId, notes, documents)),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['partner-job', jobId] });
            queryClient.invalidateQueries({ queryKey: ['partner-job-history', jobId] });
            queryClient.invalidateQueries({ queryKey: ['partner-jobs'] });
        },
    });
};

export const useRequestEndOtp = (jobId) => useMutation({
    mutationFn: () => dashboardApi.requestEndOtp(jobId),
});

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
            queryClient.invalidateQueries({ queryKey: ['partner-roster'] });
        },
    });
};

export const useRoster = (dateFrom, dateTo = dateFrom) => useQuery({
    queryKey: ['partner-roster', dateFrom, dateTo],
    queryFn: () => getRoster({ date_from: dateFrom, date_to: dateTo }),
    enabled: !!dateFrom,
    staleTime: 60 * 1000,
});

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
