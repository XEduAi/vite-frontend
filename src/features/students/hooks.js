import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';

const invalidateStudentQueries = async (queryClient) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['admin', 'students'] }),
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'stats'] }),
    queryClient.invalidateQueries({ queryKey: ['admin', 'classes'] }),
  ]);
};

export function useSaveStudentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ studentId, payload }) => {
      const response = studentId
        ? await axiosClient.put(`/students/${studentId}`, payload)
        : await axiosClient.post('/students', payload);

      return response.data.student;
    },
    onSuccess: async () => {
      await invalidateStudentQueries(queryClient);
    },
  });
}

export function useDeleteStudentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentId) => {
      await axiosClient.delete(`/students/${studentId}`);
      return studentId;
    },
    onSuccess: async () => {
      await invalidateStudentQueries(queryClient);
    },
  });
}

export function useResetStudentPasswordMutation() {
  return useMutation({
    mutationFn: async ({ studentId, newPassword }) => {
      const { data } = await axiosClient.put(`/students/${studentId}/reset-password`, { newPassword });
      return data;
    },
  });
}

export function useImportStudentsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (students) => {
      const { data } = await axiosClient.post('/students/import', { students });
      return data;
    },
    onSuccess: async () => {
      await invalidateStudentQueries(queryClient);
    },
  });
}
