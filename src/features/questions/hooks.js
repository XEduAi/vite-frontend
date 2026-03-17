import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';

const buildQuestionParams = (filters = {}) => {
  const params = {
    limit: filters.limit || 20,
    page: filters.page || 1,
  };

  if (filters.subject) params.subject = filters.subject;
  if (filters.topic) params.topic = filters.topic;
  if (filters.grade) params.grade = filters.grade;
  if (filters.difficulty) params.difficulty = filters.difficulty;
  if (filters.search) params.search = filters.search;

  return params;
};

export function useQuestionPoolQuery(filters) {
  return useQuery({
    queryKey: ['admin', 'questions', filters],
    queryFn: async () => {
      const { data } = await axiosClient.get('/questions', {
        params: buildQuestionParams(filters),
      });

      return {
        page: data.page || filters?.page || 1,
        questions: data.questions || [],
        total: data.total || 0,
        totalPages: data.totalPages || 1,
      };
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useSaveQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ questionId, payload }) => {
      const response = questionId
        ? await axiosClient.put(`/questions/${questionId}`, payload)
        : await axiosClient.post('/questions', payload);

      return response.data.question;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] });
      queryClient.invalidateQueries({ queryKey: ['questions', 'filters'] });
    },
  });
}

export function useDeleteQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (questionId) => {
      await axiosClient.delete(`/questions/${questionId}`);
      return questionId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'questions'] });
      queryClient.invalidateQueries({ queryKey: ['questions', 'filters'] });
    },
  });
}

export function useUploadQuestionImageMutation() {
  return useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await axiosClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      return data.media?.url || '';
    },
  });
}
