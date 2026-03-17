import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';

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
