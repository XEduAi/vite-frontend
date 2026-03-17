import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';

const buildTuitionFeeParams = (filters = {}) => {
  const params = {};

  if (filters.semester) params.semester = filters.semester;
  if (filters.classId) params.classId = filters.classId;
  if (filters.status) params.status = filters.status;
  if (filters.search) params.search = filters.search;

  return params;
};

export function useMyTuitionQuery() {
  return useQuery({
    queryKey: ['student', 'tuition'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/my-tuition');

      return {
        fees: data.fees || [],
        stats: data.stats || {},
      };
    },
  });
}

export function usePendingPaymentsQuery() {
  return useQuery({
    queryKey: ['student', 'pending-payments'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/my-pending-payments');
      return data.pendingPayments || [];
    },
  });
}

export function useTuitionQrMutation() {
  return useMutation({
    mutationFn: async ({ feeId, amount }) => {
      const { data } = await axiosClient.get(`/tuition-fees/${feeId}/qr`, {
        params: { amount },
      });

      return { ...data, feeId };
    },
  });
}

export function useSubmitPendingPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosClient.post('/pending-payments', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'tuition'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'pending-payments'] });
    },
  });
}

export function useAdminTuitionFeesQuery(filters) {
  return useQuery({
    queryKey: ['admin', 'tuition-fees', filters],
    queryFn: async () => {
      const { data } = await axiosClient.get('/tuition-fees', {
        params: buildTuitionFeeParams(filters),
      });

      return {
        fees: data.fees || [],
        stats: data.stats || {},
      };
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useTuitionSemestersQuery() {
  return useQuery({
    queryKey: ['admin', 'tuition-semesters'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/tuition-fees/semesters');
      return data.semesters || [];
    },
  });
}

export function useAdminPendingPaymentsQuery(status) {
  return useQuery({
    queryKey: ['admin', 'pending-payments', status || 'all'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/pending-payments', {
        params: status ? { status } : undefined,
      });
      return data.pendingPayments || [];
    },
  });
}

export function useCreateTuitionFeeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosClient.post('/tuition-fees', payload);
      return data.fee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tuition-fees'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'tuition-semesters'] });
    },
  });
}

export function useCreateBatchTuitionFeesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosClient.post('/tuition-fees/batch', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tuition-fees'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'tuition-semesters'] });
    },
  });
}

export function useDeleteTuitionFeeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feeId) => {
      await axiosClient.delete(`/tuition-fees/${feeId}`);
      return feeId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tuition-fees'] });
    },
  });
}

export function useRecordTuitionPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ feeId, payload }) => {
      const { data } = await axiosClient.post(`/tuition-fees/${feeId}/payment`, payload);
      return data.fee;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tuition-fees'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-payments'] });
    },
  });
}

export function useApprovePendingPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ paymentId, note }) => {
      const { data } = await axiosClient.put(`/pending-payments/${paymentId}/approve`, { note });
      return data.pendingPayment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-payments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'tuition-fees'] });
    },
  });
}

export function useRejectPendingPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ paymentId, note }) => {
      const { data } = await axiosClient.put(`/pending-payments/${paymentId}/reject`, { note });
      return data.pendingPayment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-payments'] });
    },
  });
}

export function useDeletePendingPaymentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (paymentId) => {
      await axiosClient.delete(`/pending-payments/${paymentId}`);
      return paymentId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-payments'] });
    },
  });
}
