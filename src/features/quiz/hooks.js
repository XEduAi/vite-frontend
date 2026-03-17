import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';

export function useQuizCatalogQuery() {
  return useQuery({
    queryKey: ['student', 'quizzes'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/my-quizzes');

      return {
        officialQuizzes: data.officialQuizzes || [],
        practiceQuizzes: data.practiceQuizzes || [],
        attempts: data.attempts || {},
      };
    },
  });
}

export function useQuestionFiltersQuery() {
  return useQuery({
    queryKey: ['questions', 'filters'],
    queryFn: async () => {
      try {
        const { data } = await axiosClient.get('/questions/filters');
        return data;
      } catch {
        return { subjects: [], topics: [], grades: [] };
      }
    },
  });
}

export function useWeakTopicsQuery() {
  return useQuery({
    queryKey: ['student', 'weak-topics'],
    queryFn: async () => {
      try {
        const { data } = await axiosClient.get('/my-performance');
        const topics = data?.topicStats || [];
        return topics.filter((topic) => topic.percentage < 60).slice(0, 3);
      } catch {
        return [];
      }
    },
  });
}

export function useStartQuizMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (quizId) => {
      const { data } = await axiosClient.post(`/quizzes/${quizId}/start`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'quizzes'] });
      queryClient.invalidateQueries({ queryKey: ['student', 'dashboard-summary'] });
    },
  });
}

export function useSmartPracticeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await axiosClient.post('/student/smart-practice');
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'quizzes'] });
    },
  });
}

export function useCreatePracticeQuizMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const practiceRes = await axiosClient.post('/practice-quizzes', payload);
      const startRes = await axiosClient.post(`/quizzes/${practiceRes.data.quiz._id}/start`);

      return startRes.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', 'quizzes'] });
    },
  });
}
