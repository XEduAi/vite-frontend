import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';

const getPayload = (responseData) => responseData?.data ?? responseData;

const normalizeMessage = (message) => ({
  ...message,
  citations: message?.citations || [],
});

const normalizeConversation = (conversation) => ({
  ...conversation,
  contextLabel: conversation?.contextLabel || '',
  messages: (conversation?.messages || []).map(normalizeMessage),
  title: conversation?.title || 'Cuộc trò chuyện mới',
});

export const upsertConversationPreview = (conversations = [], nextConversation) => {
  const nextId = nextConversation?._id;

  if (!nextId) {
    return conversations;
  }

  return [nextConversation, ...conversations.filter((conversation) => conversation._id !== nextId)].sort(
    (left, right) => new Date(right.lastMessageAt || right.createdAt || 0) - new Date(left.lastMessageAt || left.createdAt || 0)
  );
};

export function useChatConversationsQuery() {
  return useQuery({
    queryKey: ['chat', 'conversations'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/chat/conversations');
      return (getPayload(data) || []).map(normalizeConversation);
    },
  });
}

export function useChatConversationQuery(conversationId) {
  return useQuery({
    enabled: Boolean(conversationId),
    queryKey: ['chat', 'conversation', conversationId],
    queryFn: async () => {
      const { data } = await axiosClient.get(`/chat/conversations/${conversationId}`);
      return normalizeConversation(getPayload(data));
    },
  });
}

export function useCreateConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosClient.post('/chat/conversations', payload);
      return normalizeConversation(getPayload(data));
    },
    onSuccess: (conversation) => {
      queryClient.setQueryData(['chat', 'conversations'], (previousData = []) =>
        upsertConversationPreview(previousData, conversation)
      );
      queryClient.setQueryData(['chat', 'conversation', conversation._id], conversation);
    },
  });
}

export function useDeleteConversationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (conversationId) => {
      await axiosClient.delete(`/chat/conversations/${conversationId}`);
      return conversationId;
    },
    onSuccess: (conversationId) => {
      queryClient.setQueryData(['chat', 'conversations'], (previousData = []) =>
        previousData.filter((conversation) => conversation._id !== conversationId)
      );
      queryClient.removeQueries({ queryKey: ['chat', 'conversation', conversationId] });
    },
  });
}

export function useAiStatsQuery() {
  return useQuery({
    queryKey: ['admin', 'ai-stats'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/admin/ai-stats');
      return getPayload(data);
    },
  });
}

export function useMyAiUsageQuery() {
  return useQuery({
    queryKey: ['chat', 'usage'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/chat/usage');
      return getPayload(data);
    },
  });
}
