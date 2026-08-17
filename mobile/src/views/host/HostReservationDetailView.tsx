import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import { HostScreenHeader } from '@/components/host/HostChrome';
import { Screen, Text } from '@/components/ui';
import {
  useAcceptReservation,
  useHostReservation,
  useRejectReservation,
} from '@/hooks/useReservations';
import { formatMt } from '@/lib/mappers/guest';
import { colors } from '@/theme/colors';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop';

export function HostReservationDetailView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const reservationId = id ? String(id) : undefined;
  const query = useHostReservation(reservationId);
  const acceptReservation = useAcceptReservation();
  const rejectReservation = useRejectReservation();
  const reservation = query.data;

  if (query.isLoading || !reservation) {
    return (
      <Screen contentClassName="items-center justify-center">
        {query.isError ? (
          <Text variant="p-s">
            {query.error instanceof Error
              ? query.error.message
              : 'Reserva não encontrada'}
          </Text>
        ) : (
          <ActivityIndicator color={colors.brand.DEFAULT} />
        )}
      </Screen>
    );
  }

  const raw = reservation.raw;

  return (
    <Screen className="bg-[#FCFCFC]" contentClassName="flex-1" keyboard={false}>
      <HostScreenHeader
        title="Detalhe da reserva"
        onBack={() => router.back()}
      />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-5 px-6 pb-8 pt-5"
      >
        <View className="overflow-hidden rounded-[15px] border border-[#F5F5F5] bg-surface">
          <View className="flex-row gap-3 p-3">
            <Image
              source={{ uri: raw.thumbnailUrl ?? PLACEHOLDER }}
              style={{ width: 80, height: 80, borderRadius: 12 }}
              contentFit="cover"
            />
            <View className="flex-1 justify-center gap-1">
              <Text variant="label-s">{raw.guestName}</Text>
              <Text variant="p-xs">{raw.propertyName}</Text>
              <Text variant="p-xs">{raw.roomName}</Text>
            </View>
          </View>
        </View>

        <View className="flex-row items-center justify-between rounded-[15px] border border-[#F5F5F5] bg-surface px-4 py-3">
          <Text variant="p-s">Estado</Text>
          <Text variant="label-s">{reservation.statusLabel}</Text>
        </View>

        <View className="overflow-hidden rounded-[15px] border border-[#F5F5F5] bg-surface">
          {[
            { label: 'Datas', value: reservation.dates },
            { label: 'Hóspedes', value: String(raw.guestCount) },
            { label: 'Total', value: formatMt(raw.totalAmount) },
          ].map((row) => (
            <View
              key={row.label}
              className="flex-row items-center justify-between border-b border-[#F5F5F5] px-4 py-3"
            >
              <Text variant="p-s">{row.label}</Text>
              <Text
                variant="label-s"
                className={row.label === 'Total' ? 'text-brand' : undefined}
              >
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        {reservation.status === 'pending' ? (
          <View className="flex-row gap-2">
            <Pressable
              disabled={acceptReservation.isPending}
              onPress={() =>
                acceptReservation.mutate(reservation.id, {
                  onSuccess: () => router.back(),
                })
              }
              className="h-12 flex-1 items-center justify-center rounded-[15px] bg-[#F0FDF4]"
            >
              <Text className="font-inter-semibold text-[13px] text-[#00C950]">
                Aceitar
              </Text>
            </Pressable>
            <Pressable
              disabled={rejectReservation.isPending}
              onPress={() =>
                rejectReservation.mutate(reservation.id, {
                  onSuccess: () => router.back(),
                })
              }
              className="h-12 flex-1 items-center justify-center rounded-[15px] bg-[#FEF2F2]"
            >
              <Text className="font-inter-semibold text-[13px] text-[#FB2C36]">
                Rejeitar
              </Text>
            </Pressable>
          </View>
        ) : null}

        {raw.hostWhatsapp ? (
          <Pressable className="h-12 flex-row items-center justify-center gap-2 rounded-[15px] bg-[#25D366]">
            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
            <Text variant="label-m" className="text-white">
              Contactar hóspede
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
