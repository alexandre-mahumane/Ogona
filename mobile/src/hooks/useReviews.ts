import { useMutation, useQueryClient } from '@tanstack/react-query';

import { reviewsApi } from '@/lib/api/reviews';
import { discoverKeys } from '@/hooks/useDiscover';
import { reservationKeys } from '@/hooks/useReservations';

export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { reservationId: string; rating: number; comment?: string }) =>
      reviewsApi.create(input),
    onSuccess: async () => {
      await Promise.all([
        qc.invalidateQueries({ queryKey: reservationKeys.all }),
        qc.invalidateQueries({ queryKey: discoverKeys.all }),
      ]);
    },
  });
}
