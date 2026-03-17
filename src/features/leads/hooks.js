import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';

const DEFAULT_HANDOFF_CHECKLIST = {
  consultationCompleted: false,
  placementReviewed: false,
  trialClassBooked: false,
  scheduleShared: false,
  tuitionExplained: false,
  enrollmentConfirmed: false,
};

const normalizeLead = (lead = {}) => {
  const handoffChecklist = {
    ...DEFAULT_HANDOFF_CHECKLIST,
    ...(lead.handoffChecklist || {}),
  };
  const completed = Object.values(handoffChecklist).filter(Boolean).length;

  return {
    ...lead,
    assignedTo: lead.assignedTo || null,
    convertedStudent: lead.convertedStudent || null,
    handoffChecklist,
    handoffProgress: lead.handoffProgress || {
      completed,
      total: Object.keys(DEFAULT_HANDOFF_CHECKLIST).length,
      isComplete: completed === Object.keys(DEFAULT_HANDOFF_CHECKLIST).length,
    },
  };
};

const buildLeadParams = (filters = {}) => {
  const params = {
    page: filters.page || 1,
    limit: filters.limit || 20,
  };

  if (filters.status) {
    params.status = filters.status;
  }

  if (filters.source) {
    params.source = filters.source;
  }

  if (filters.ownerId) {
    params.ownerId = filters.ownerId;
  }

  if (filters.search) {
    params.search = filters.search;
  }

  if (filters.overdue) {
    params.overdue = true;
  }

  return params;
};

export function useAdminLeadsQuery(filters) {
  return useQuery({
    queryKey: ['admin', 'leads', filters],
    queryFn: async () => {
      const { data } = await axiosClient.get('/leads', {
        params: buildLeadParams(filters),
      });

      return {
        leads: (data.data || []).map(normalizeLead),
        pagination: data.pagination || {
          page: filters?.page || 1,
          limit: filters?.limit || 20,
          total: 0,
          totalPages: 1,
        },
      };
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useLeadDashboardQuery() {
  return useQuery({
    queryKey: ['admin', 'leads', 'dashboard'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/leads/dashboard');
      return data.data || {
        summary: {
          total: 0,
          new: 0,
          contacted: 0,
          qualified: 0,
          converted: 0,
          lost: 0,
          overdue: 0,
          dueToday: 0,
          conversionRate: 0,
        },
        funnel: [],
        sources: [],
        owners: [],
        ownerBreakdown: [],
      };
    },
  });
}

export function useUpdateLeadMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, payload }) => {
      const { data } = await axiosClient.put(`/leads/${leadId}`, payload);
      return normalizeLead(data.data);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'leads'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'leads', 'dashboard'] }),
      ]);
    },
  });
}

export function useUpdateLeadStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ leadId, payload }) => {
      const { data } = await axiosClient.put(`/leads/${leadId}/status`, payload);
      return normalizeLead(data.data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin', 'leads'] });
    },
  });
}
