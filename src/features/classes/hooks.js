import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';

const invalidateClassQueries = async (queryClient) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['admin', 'classes'] }),
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'stats'] }),
    queryClient.invalidateQueries({ queryKey: ['student', 'classes'] }),
  ]);
};

export function useAdminClassDetailQuery(classId) {
  return useQuery({
    enabled: Boolean(classId),
    queryKey: ['admin', 'classes', classId],
    queryFn: async () => {
      const { data } = await axiosClient.get(`/classes/${classId}`);
      return data.class || null;
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useSaveClassMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classId, payload }) => {
      const response = classId
        ? await axiosClient.put(`/classes/${classId}`, payload)
        : await axiosClient.post('/classes', payload);

      return response.data.class;
    },
    onSuccess: async () => {
      await invalidateClassQueries(queryClient);
    },
  });
}

export function useDeleteClassMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (classId) => {
      await axiosClient.delete(`/classes/${classId}`);
      return classId;
    },
    onSuccess: async () => {
      await invalidateClassQueries(queryClient);
    },
  });
}

export function useAssignStudentToClassMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classId, studentId }) => {
      const { data } = await axiosClient.post(`/classes/${classId}/students`, { studentId });
      return data.class;
    },
    onSuccess: async () => {
      await invalidateClassQueries(queryClient);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'students'] });
    },
  });
}

export function useRemoveStudentFromClassMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classId, studentId }) => {
      const { data } = await axiosClient.delete(`/classes/${classId}/students/${studentId}`);
      return data.class;
    },
    onSuccess: async () => {
      await invalidateClassQueries(queryClient);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'students'] });
    },
  });
}

export function useAssignClassMediaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classId, mediaId }) => {
      const { data } = await axiosClient.post(`/classes/${classId}/media`, { mediaId });
      return data.class;
    },
    onSuccess: async () => {
      await invalidateClassQueries(queryClient);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });
    },
  });
}

export function useRemoveClassMediaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ classId, mediaId }) => {
      const { data } = await axiosClient.delete(`/classes/${classId}/media/${mediaId}`);
      return data.class;
    },
    onSuccess: async () => {
      await invalidateClassQueries(queryClient);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });
    },
  });
}
