import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';

const buildParams = (filters = {}) => {
  const params = {
    page: filters.page || 1,
    limit: filters.limit || 20,
  };

  if (filters.search) params.search = filters.search;
  if (filters.action) params.action = filters.action;
  if (filters.entityType) params.entityType = filters.entityType;

  return params;
};

export function useAuditLogsQuery(filters) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', filters],
    queryFn: async () => {
      const { data } = await axiosClient.get('/admin/audit-logs', {
        params: buildParams(filters),
      });

      return {
        logs: data.logs || [],
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
