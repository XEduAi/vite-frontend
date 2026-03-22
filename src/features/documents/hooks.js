import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { downloadProtectedFile } from '../../api/protectedFiles';

const getPayload = (responseData) => responseData?.data ?? responseData;

const normalizeDocumentFile = (file, index) => ({
  ...file,
  fileName: file?.fileName || file?.filename || `Tệp ${index + 1}`,
  fileSize: file?.fileSize ?? file?.size ?? null,
});

export const normalizeDocument = (doc) => {
  if (!doc) {
    return null;
  }

  return {
    ...doc,
    downloadCount: doc.downloadCount ?? doc.totalDownloads ?? 0,
    files: Array.isArray(doc.files) ? doc.files.map(normalizeDocumentFile) : [],
    ratingCount: doc.ratingCount ?? doc.reviewCount ?? 0,
    thumbnailUrl: doc.thumbnailUrl || doc.thumbnail || '',
    uploadedBy: doc.uploadedBy || doc.seller || null,
    recommendedDocuments: Array.isArray(doc.recommendedDocuments)
      ? doc.recommendedDocuments.map((item) => normalizeDocument(item))
      : [],
    bundleOffer: doc.bundleOffer
      ? {
          ...doc.bundleOffer,
          documents: Array.isArray(doc.bundleOffer.documents)
            ? doc.bundleOffer.documents.map((item) => normalizeDocument(item))
            : [],
        }
      : null,
  };
};

const normalizeDocumentReview = (review) => ({
  ...review,
  user: review?.user || review?.reviewer || null,
});

const normalizeDocumentPurchase = (purchase) => ({
  ...purchase,
  document: normalizeDocument(purchase?.document || null),
  followUp: purchase?.followUp
    ? {
        ...purchase.followUp,
        recommendedDocuments: (purchase.followUp.recommendedDocuments || []).map((item) => normalizeDocument(item)),
      }
    : null,
  purchasedAt: purchase?.purchasedAt || purchase?.createdAt || null,
});

export function useDocumentFiltersQuery() {
  return useQuery({
    queryKey: ['documents', 'filters'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/documents/filters');
      const payload = getPayload(data);

      return {
        grades: payload?.grades || [],
        subjects: payload?.subjects || [],
      };
    },
  });
}

export function useDocumentMarketplaceQuery(filters) {
  return useQuery({
    queryKey: ['documents', filters],
    queryFn: async () => {
      const { data } = await axiosClient.get('/documents', {
        params: {
          ...filters,
          limit: filters?.limit || 12,
        },
      });
      const payload = getPayload(data);

      return {
        documents: (payload?.documents || []).map(normalizeDocument),
        page: payload?.page || filters?.page || 1,
        total: payload?.total || 0,
        totalPages: payload?.totalPages || 0,
      };
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useDocumentDetailQuery(documentId) {
  return useQuery({
    enabled: Boolean(documentId),
    queryKey: ['documents', 'detail', documentId],
    queryFn: async () => {
      const { data } = await axiosClient.get(`/documents/${documentId}`);
      return normalizeDocument(getPayload(data));
    },
  });
}

export function useDocumentReviewsQuery(documentId) {
  return useQuery({
    enabled: Boolean(documentId),
    queryKey: ['documents', 'reviews', documentId],
    queryFn: async () => {
      const { data } = await axiosClient.get(`/documents/${documentId}/reviews`);
      const payload = getPayload(data);
      const reviews = Array.isArray(payload) ? payload : payload?.reviews || [];

      return reviews.map(normalizeDocumentReview);
    },
  });
}

export function useMyDocumentsQuery() {
  return useQuery({
    queryKey: ['student', 'my-documents'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/student/my-documents');
      const payload = getPayload(data);
      const purchases = Array.isArray(payload) ? payload : payload?.documents || [];

      return purchases.map(normalizeDocumentPurchase);
    },
  });
}

export function usePurchaseDocumentMutation(documentId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosClient.post(`/documents/${documentId}/purchase`, payload);
      return normalizeDocumentPurchase(getPayload(data));
    },
    onSuccess: (purchase) => {
      if (purchase?.status === 'completed') {
        queryClient.setQueryData(['student', 'my-documents'], (currentPurchases = []) => {
          if (currentPurchases.some((item) => item.document?._id === purchase.document?._id)) {
            return currentPurchases;
          }

          return [purchase, ...currentPurchases];
        });
      }

      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents', 'detail', documentId] });
      queryClient.invalidateQueries({ queryKey: ['student', 'my-documents'] });
    },
  });
}

export function usePurchaseDocumentBundleMutation(documentId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosClient.post(`/documents/${documentId}/purchase-bundle`, payload);
      return getPayload(data);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['documents'] }),
        queryClient.invalidateQueries({ queryKey: ['documents', 'detail', documentId] }),
        queryClient.invalidateQueries({ queryKey: ['student', 'my-documents'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'documents', 'analytics'] }),
      ]);
    },
  });
}

export function useSubmitDocumentReviewMutation(documentId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await axiosClient.post(`/documents/${documentId}/reviews`, payload);
      return getPayload(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['documents', 'detail', documentId] });
      queryClient.invalidateQueries({ queryKey: ['documents', 'reviews', documentId] });
    },
  });
}

export function useDownloadDocumentMutation() {
  return useMutation({
    mutationFn: async (input) => {
      const documentId = typeof input === 'string' ? input : input?.documentId;
      const params = typeof input === 'string' || input?.fileIndex === undefined
        ? undefined
        : { fileIndex: input.fileIndex };
      const fallbackName = typeof input === 'string' ? undefined : input?.fallbackName;

      return downloadProtectedFile(`/student/my-documents/${documentId}/download`, {
        fallbackName,
        params,
      });
    },
  });
}

export function useAdminDocumentsQuery() {
  return useQuery({
    queryKey: ['admin', 'documents'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/admin/documents');
      return (getPayload(data) || []).map(normalizeDocument);
    },
  });
}

export function useDocumentAnalyticsQuery() {
  return useQuery({
    queryKey: ['admin', 'documents', 'analytics'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/admin/documents/analytics');
      return getPayload(data);
    },
  });
}

export function useSaveDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, payload }) => {
      const config = payload instanceof FormData ? {} : undefined;
      const response = documentId
        ? await axiosClient.put(`/admin/documents/${documentId}`, payload, config)
        : await axiosClient.post('/admin/documents', payload, config);

      return normalizeDocument(getPayload(response.data));
    },
    onSuccess: (document) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'documents'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'documents', 'analytics'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      if (document?._id) {
        queryClient.invalidateQueries({ queryKey: ['documents', 'detail', document._id] });
      }
    },
  });
}

export function useDeleteDocumentMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId) => {
      await axiosClient.delete(`/admin/documents/${documentId}`);
      return documentId;
    },
    onSuccess: (documentId) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'documents'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'documents', 'analytics'] });
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.removeQueries({ queryKey: ['documents', 'detail', documentId] });
    },
  });
}
