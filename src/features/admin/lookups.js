import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';

export function useAdminClassesQuery({ enabled = true } = {}) {
  return useQuery({
    enabled,
    queryKey: ['admin', 'lookups', 'classes'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/classes');
      return data.classes || [];
    },
  });
}

export function useAdminStudentsQuery({ enabled = true } = {}) {
  return useQuery({
    enabled,
    queryKey: ['admin', 'lookups', 'students'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/students');
      return data.students || [];
    },
  });
}
