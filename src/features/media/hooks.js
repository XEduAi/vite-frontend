import { useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';

const invalidateMediaQueries = async (queryClient) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ['admin', 'media'] }),
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard', 'stats'] }),
    queryClient.invalidateQueries({ queryKey: ['admin', 'classes'] }),
  ]);
};

export function useUploadMediaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, onUploadProgress }) => {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await axiosClient.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress,
      });

      return data.media;
    },
    onSuccess: async () => {
      await invalidateMediaQueries(queryClient);
    },
  });
}

export function useDeleteMediaMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mediaId) => {
      await axiosClient.delete(`/media/${mediaId}`);
      return mediaId;
    },
    onSuccess: async () => {
      await invalidateMediaQueries(queryClient);
    },
  });
}
