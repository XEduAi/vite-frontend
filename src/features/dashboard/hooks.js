import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';

export function useStudentClassesQuery() {
  return useQuery({
    queryKey: ['student', 'classes'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/my-classes');
      return data.classes || [];
    },
  });
}

export function useStudentDashboardSummaryQuery() {
  return useQuery({
    queryKey: ['student', 'dashboard-summary'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/student/dashboard-summary');
      return data;
    },
  });
}

export function useAnnouncementsQuery() {
  return useQuery({
    queryKey: ['student', 'announcements'],
    queryFn: async () => {
      try {
        const { data } = await axiosClient.get('/announcements');
        return data.announcements || [];
      } catch {
        return [];
      }
    },
  });
}

export function useStudentGamificationQuery() {
  return useQuery({
    queryKey: ['student', 'gamification'],
    queryFn: async () => {
      try {
        const { data } = await axiosClient.get('/student/gamification');
        return data;
      } catch {
        return null;
      }
    },
  });
}
