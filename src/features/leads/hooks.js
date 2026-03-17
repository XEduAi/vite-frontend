import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';

const buildLeadParams = (filters = {}) => {
  const params = {
    page: filters.page || 1,
    limit: filters.limit || 20,
  };

  if (filters.status) {
    params.status = filters.status;
  }

  return params;
};

export function useAdminLeadsQuery(filters) {
  return useQuery({
    queryKey: ['admin', 'leads', filters],
    queryFn: async () => {
      const { data } = await axiosClient.get('/leads', {
        params: buildLeadParams(filters),
      });

      return {
        leads: data.data || [],
        pagination: data.pagination || {
          page: filters?.page || 1,
          limit: filters?.limit || 20,
          total: 0,
          totalPages: 1,
        },
      };
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useUpdateLeadStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, payload }) => {
      const { data } = await axiosClient.put(`/leads/${leadId}/status`, payload);
      return data.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'leads'] });
    },
  });
}
