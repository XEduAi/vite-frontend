import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';

const invalidateAnnouncementQueries = async (queryClient) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['admin', 'announcements'] }),
    queryClient.invalidateQueries({ queryKey: ['student', 'announcements'] }),
  ]);
};

export function useAdminAnnouncementsQuery() {
  return useQuery({
    queryKey: ['admin', 'announcements'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/announcements');
      return data.announcements || [];
    },
  });
}

export function useCreateAnnouncementMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosClient.post('/announcements', payload);
      return data.announcement;
    },
    onSuccess: async () => {
      await invalidateAnnouncementQueries(queryClient);
    },
  });
}

export function useDeleteAnnouncementMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (announcementId) => {
      await axiosClient.delete(`/announcements/${announcementId}`);
      return announcementId;
    },
    onSuccess: async () => {
      await invalidateAnnouncementQueries(queryClient);
    },
  });
}
