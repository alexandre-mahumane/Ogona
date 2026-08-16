import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import {
  FilterChips,
  GuestScreenHeader,
  StatusBadge,
} from '@/components/guest/GuestChrome';
import { Screen, Text } from '@/components/ui';
import type { GuestReservationStatus } from '@/data/guest.mock';
import { useGuestReservations } from '@/hooks/useReservations';
import { colors } from '@/theme/colors';

const chips = [
  { id: 'all', label: 'Todas' },
  { id: 'pending', label: 'Aguardando resposta' },
  { id: 'awaiting_payment', label: 'A pagar' },
  { id: 'completed', label: 'Concluídas' },
];

const statusTone: Record<
  GuestReservationStatus,
  'yellow' | 'blue' | 'gray' | 'green' | 'orange'
> = {
  pending: 'yellow',
  awaiting_payment: 'blue',
  confirmed: 'green',
  completed: 'gray',
  cancelled: 'gray',
};

export function GuestReservationsView() {
  const [filter, setFilter] = useState('all');
  const reservationsQuery = useGuestReservations(
    filter === 'all' ? undefined : { status: filter },
  );

  const list = useMemo(() => {
    const rows = reservationsQuery.data ?? [];
    if (filter === 'all') return rows;
    return rows.filter((r) => r.status === filter);
  }, [filter, reservationsQuery.data]);

  return (
    <Screen
      scroll
      keyboard={false}
      className="bg-[#FCFCFC]"
      contentClassName="pb-8"
    >
      <GuestScreenHeader title="Reservas" />

      <View className="mt-4">
        <FilterChips chips={chips} value={filter} onChange={setFilter} />
      </View>

      <View className="mt-6 gap-3 px-4">
        {reservationsQuery.isLoading ? (
          <ActivityIndicator color={colors.brand.DEFAULT} />
        ) : list.length === 0 ? (
          <Text variant="p-s" className="text-center text-ink-soft">
            Nenhuma reserva encontrada
          </Text>
        ) : (
          list.map((r) => (
            <Pressable
              key={r.id}
              onPress={() => router.push(`/(guest)/reservation/${r.id}`)}
              className="overflow-hidden rounded-[15px] border border-[#F5F5F5] bg-surface shadow-sm"
            >
              <View className="flex-row gap-3 p-3">
                <Image
                  source={{ uri: r.image }}
                  style={{ width: 72, height: 72, borderRadius: 12 }}
                  contentFit="cover"
                />
                <View className="flex-1 gap-1">
                  <View className="flex-row items-start justify-between gap-2">
                    <Text
                      variant="label-s"
                      className="flex-1 text-[13px]"
                      numberOfLines={1}
                    >
                      {r.property}
                    </Text>
                    <StatusBadge
                      label={r.statusLabel}
                      tone={statusTone[r.status]}
                    />
                  </View>
                  <Text variant="p-xs">{r.room}</Text>
                  <View className="flex-row items-center gap-1">
                    <Ionicons
                      name="calendar-outline"
                      size={10}
                      color={colors.ink.muted}
                    />
                    <Text variant="p-xs">
                      {r.checkIn} – {r.checkOut}
                    </Text>
                  </View>
                  <Text className="font-inter-semibold text-[11px] text-brand">
                    {r.amount}
                  </Text>
                </View>
              </View>

              {r.status === 'awaiting_payment' ? (
                <View className="flex-row gap-2 px-3 pb-3">
                  <Pressable
                    onPress={() => router.push(`/(guest)/pay/${r.id}`)}
                    className="h-[34px] flex-1 items-center justify-center rounded-[15px] bg-[#EFF6FF]"
                  >
                    <Text className="font-inter-semibold text-[11px] text-[#2B7FFF]">
                      Pagar agora
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => router.push(`/(guest)/reservation/${r.id}`)}
                    className="h-[34px] flex-1 items-center justify-center rounded-[15px] border border-surface-border"
                  >
                    <Text className="font-inter-semibold text-[11px] text-ink-secondary">
                      Ver detalhes
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </Pressable>
          ))
        )}
      </View>
    </Screen>
  );
}
