import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';

const buildStudentParams = (filters = {}) => {
  const params = {};

  if (filters.grade) params.grade = Number(filters.grade);
  if (filters.status) params.status = filters.status;
  if (filters.search) params.search = filters.search;

  return params;
};

export function useAdminClassesQuery({ enabled = true } = {}) {
  return useQuery({
    enabled,
    queryKey: ['admin', 'classes'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/classes');
      return data.classes || [];
    },
  });
}

export function useAdminStudentsQuery({ enabled = true, filters = {} } = {}) {
  return useQuery({
    enabled,
    queryKey: ['admin', 'students', filters],
    queryFn: async () => {
      const { data } = await axiosClient.get('/students', {
        params: buildStudentParams(filters),
      });

      return data.students || [];
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminMediaQuery({ enabled = true } = {}) {
  return useQuery({
    enabled,
    queryKey: ['admin', 'media'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/media');
      return data.medias || [];
    },
  });
}
