import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';

export function useAdminDashboardStatsQuery() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: async () => {
      const [studentRes, classRes, mediaRes] = await Promise.all([
        axiosClient.get('/students'),
        axiosClient.get('/classes'),
        axiosClient.get('/media'),
      ]);

      const students = studentRes.data.students || [];

      return {
        stats: {
          students: students.length,
          classes: (classRes.data.classes || []).length,
          medias: (mediaRes.data.medias || []).length,
        },
        recentStudents: students.slice(0, 5),
      };
    },
  });
}

export function useAdminOverviewQuery() {
  return useQuery({
    queryKey: ['admin', 'analytics', 'overview'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/admin/analytics/overview');
      return data;
    },
  });
}
