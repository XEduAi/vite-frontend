import { QueryClient } from '@tanstack/react-query';

const shouldRetryQuery = (failureCount, error) => {
  const status = error?.response?.status;

  if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) {
    return false;
  }

  return failureCount < 1;
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: shouldRetryQuery,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  },
});
