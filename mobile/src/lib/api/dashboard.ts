import { apiClient } from '@/lib/api/client';
import type { HostDashboard } from '@/lib/api/types';

export const dashboardApi = {
  get() {
    return apiClient<{ dashboard: HostDashboard }>('/dashboard').then((d) => d.dashboard);
  },
};
