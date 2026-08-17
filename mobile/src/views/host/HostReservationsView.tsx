import { Ionicons } from '@expo/vector-icons';
import { type Href, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';

import { FilterChips, HostScreenHeader } from '@/components/host/HostChrome';
import { Screen, Text } from '@/components/ui';
import {
  reservationStatusStyle,
  type ReservationStatus,
} from '@/data/host.mock';
import {
  useAcceptReservation,
  useHostReservations,
  useRejectReservation,
} from '@/hooks/useReservations';
import { colors } from '@/theme/colors';

const chips = [
  { id: 'all', label: 'Todos' },
  { id: 'pending', label: 'Pendentes' },
  { id: 'confirmed', label: 'Confirmados' },
  { id: 'staying', label: 'Em estadia' },
  { id: 'completed', label: 'Concluídos' },
  { id: 'cancelled', label: 'Cancelados' },
];

export function HostReservationsView() {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const reservationsQuery = useHostReservations(
    query.trim() ? { search: query.trim() } : undefined,
  );
  const acceptReservation = useAcceptReservation();
  const rejectReservation = useRejectReservation();

  const list = useMemo(() => {
    const rows = reservationsQuery.data ?? [];
    return rows.filter((r) => {
      const matchFilter =
        filter === 'all' ||
        r.status === filter ||
        (filter === 'staying' &&
          (r.status === 'staying' || r.status === 'checkin'));
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        r.guest.toLowerCase().includes(q) ||
        r.property.toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });
  }, [filter, query, reservationsQuery.data]);

  return (
    <Screen
      scroll
      keyboard={false}
      className="bg-[#FCFCFC]"
      contentClassName="pb-8"
    >
      <HostScreenHeader title="Reservas" />
      <View className="gap-4 px-6 pt-4">
        <View className="h-[54px] flex-row items-center gap-3 rounded-xl border border-surface-border bg-surface px-4">
          <Ionicons name="search" size={20} color={colors.ink.secondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Cidade, bairro ou alojamento"
            placeholderTextColor="rgba(38,38,38,0.5)"
            className="flex-1 font-inter text-p-s text-ink"
          />
        </View>
      </View>
      <View className="mt-4">
        <FilterChips chips={chips} value={filter} onChange={setFilter} />
      </View>

      <View className="mt-6 gap-3 px-4">
        {reservationsQuery.isLoading ? (
          <ActivityIndicator color={colors.brand.DEFAULT} />
        ) : reservationsQuery.isError ? (
          <View className="gap-2 py-6">
            <Text variant="p-s" className="text-center">
              {reservationsQuery.error instanceof Error
                ? reservationsQuery.error.message
                : 'Não foi possível carregar as reservas'}
            </Text>
            <Pressable onPress={() => void reservationsQuery.refetch()}>
              <Text className="text-center font-inter-semibold text-brand">
                Tentar novamente
              </Text>
            </Pressable>
          </View>
        ) : list.length === 0 ? (
          <Text variant="p-s" className="text-center text-ink-soft">
            Nenhuma reserva encontrada
          </Text>
        ) : (
          list.map((r) => {
            const style = reservationStatusStyle[r.status as ReservationStatus];
            return (
              <Pressable
                key={r.id}
                onPress={() =>
                  router.push(`/(host)/reservation/${r.id}` as Href)
                }
                className="overflow-hidden rounded-[15px] border border-[#F5F5F5] bg-surface shadow-sm"
              >
                <View className="flex-row gap-3 p-3">
                  <View className="h-[52px] w-[52px] items-center justify-center rounded-[15px] bg-brand-soft">
                    <Text className="font-inter-semibold text-brand">
                      {r.guest.charAt(0)}
                    </Text>
                  </View>
                  <View className="flex-1 gap-1">
                    <View className="flex-row items-start justify-between gap-2">
                      <Text className="font-inter-semibold text-[13px] text-ink">
                        {r.guest}
                      </Text>
                      <View
                        className="rounded-full px-2 py-0.5"
                        style={{ backgroundColor: style.bg }}
                      >
                        <Text
                          className="font-inter-semibold text-[10px]"
                          style={{ color: style.text }}
                        >
                          {r.statusLabel}
                        </Text>
                      </View>
                    </View>
                    <Text className="font-inter text-[11px] text-ink-soft">
                      {r.property}
                    </Text>
                    <View className="flex-row items-center gap-1">
                      <Ionicons name="calendar-outline" size={10} color="#737373" />
                      <Text className="font-inter text-[11px] text-ink-muted">
                        {r.dates}
                      </Text>
                    </View>
                    <Text className="font-inter-semibold text-[11px] text-brand">
                      {r.amount}
                    </Text>
                  </View>
                </View>
                {r.status === 'pending' ? (
                  <View className="flex-row gap-2 px-3 pb-3">
                    <Pressable
                      disabled={acceptReservation.isPending}
                      onPress={(e) => {
                        e.stopPropagation();
                        acceptReservation.mutate(r.id);
                      }}
                      className="h-[34px] flex-1 items-center justify-center rounded-[15px] bg-[#F0FDF4]"
                    >
                      <Text className="font-inter-semibold text-[11px] text-[#00C950]">
                        Aceitar
                      </Text>
                    </Pressable>
                    <Pressable
                      disabled={rejectReservation.isPending}
                      onPress={(e) => {
                        e.stopPropagation();
                        rejectReservation.mutate(r.id);
                      }}
                      className="h-[34px] flex-1 items-center justify-center rounded-[15px] bg-[#FEF2F2]"
                    >
                      <Text className="font-inter-semibold text-[11px] text-[#FB2C36]">
                        Rejeitar
                      </Text>
                    </Pressable>
                  </View>
                ) : null}
              </Pressable>
            );
          })
        )}
      </View>
    </Screen>
  );
}
