import { apiClient } from '@/lib/api/client';

export const reviewsApi = {
  create(input: { reservationId: string; rating: number; comment?: string }) {
    return apiClient<{
      review: {
        id: string;
        reservationId: string;
        rating: number;
        comment: string | null;
      };
    }>('/reviews/', {
      method: 'POST',
      body: input,
    }).then((d) => d.review);
  },
};
