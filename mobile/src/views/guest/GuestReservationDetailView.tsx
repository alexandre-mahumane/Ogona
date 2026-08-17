import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import {
  GuestScreenHeader,
  StatusBadge,
  StickyFooter,
} from '@/components/guest/GuestChrome';
import { Button, Screen, Text } from '@/components/ui';
import {
  useCancelReservation,
  useGuestReservation,
} from '@/hooks/useReservations';
import { colors } from '@/theme/colors';

const bannerBg = {
  yellow: { bg: '#FEFCE8', border: '#F0B100', text: '#A16207' },
  blue: { bg: '#EFF6FF', border: '#2B7FFF', text: '#1D4ED8' },
  gray: { bg: '#F5F5F5', border: '#A1A1A1', text: '#525252' },
} as const;

const statusTone = {
  pending: 'yellow',
  awaiting_payment: 'blue',
  confirmed: 'green',
  completed: 'gray',
  cancelled: 'gray',
} as const;

export function GuestReservationDetailView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const reservationId = id ? String(id) : undefined;
  const reservationQuery = useGuestReservation(reservationId);
  const cancelReservation = useCancelReservation();
  const reservation = reservationQuery.data;

  if (reservationQuery.isLoading || !reservation) {
    return (
      <Screen contentClassName="items-center justify-center">
        {reservationQuery.isError ? (
          <Text variant="p-s">
            {reservationQuery.error instanceof Error
              ? reservationQuery.error.message
              : 'Reserva não encontrada'}
          </Text>
        ) : (
          <ActivityIndicator color={colors.brand.DEFAULT} />
        )}
      </Screen>
    );
  }

  const banner = bannerBg[reservation.bannerTone];

  return (
    <Screen className="bg-[#FCFCFC]" contentClassName="flex-1" keyboard={false}>
      <GuestScreenHeader
        title="Detalhe da reserva"
        onBack={() => router.back()}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-5 px-6 pb-8 pt-5"
      >
        <View
          className="gap-1 rounded-[15px] border px-4 py-3"
          style={{
            backgroundColor: banner.bg,
            borderColor: banner.border,
          }}
        >
          <Text
            variant="label-s"
            style={{ color: banner.text }}
            className="font-inter-bold"
          >
            {reservation.bannerTitle}
          </Text>
          <Text variant="p-s" style={{ color: banner.text }}>
            {reservation.bannerBody}
          </Text>
          {reservation.expiryHint ? (
            <Text
              variant="label-xs"
              style={{ color: banner.text }}
              className="mt-1"
            >
              {reservation.expiryHint}
            </Text>
          ) : null}
        </View>

        <View className="overflow-hidden rounded-[15px] border border-[#F5F5F5] bg-surface">
          <View className="flex-row gap-3 p-3">
            <Image
              source={{ uri: reservation.image }}
              style={{ width: 80, height: 80, borderRadius: 12 }}
              contentFit="cover"
            />
            <View className="flex-1 justify-center gap-1">
              <Text variant="label-s">{reservation.property}</Text>
              <Text variant="p-xs">{reservation.room}</Text>
              <Text variant="p-xs">{reservation.location}</Text>
            </View>
          </View>
        </View>

        <View className="flex-row items-center justify-between rounded-[15px] border border-[#F5F5F5] bg-surface px-4 py-3">
          <Text variant="p-s">Estado</Text>
          <StatusBadge
            label={reservation.statusLabel}
            tone={statusTone[reservation.status]}
          />
        </View>

        <View className="overflow-hidden rounded-[15px] border border-[#F5F5F5] bg-surface">
          {[
            { label: 'Check-in', value: reservation.checkIn },
            { label: 'Check-out', value: reservation.checkOut },
            { label: 'Noites', value: String(reservation.nights) },
            { label: 'Hóspedes', value: String(reservation.guests) },
            { label: 'Total', value: reservation.amount },
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

        {reservation.canContact ? (
          <Pressable className="h-12 flex-row items-center justify-center gap-2 rounded-[15px] bg-[#25D366]">
            <Ionicons name="logo-whatsapp" size={18} color="#fff" />
            <Text variant="label-m" className="text-white">
              Contactar anfitrião
            </Text>
          </Pressable>
        ) : null}

        {reservation.canCancel ? (
          <Pressable
            disabled={cancelReservation.isPending}
            onPress={() => cancelReservation.mutate(reservation.id)}
            className="h-12 items-center justify-center rounded-[15px] border border-[#FB2C36]"
          >
            <Text className="font-inter-bold text-[13px] text-[#FB2C36]">
              {cancelReservation.isPending
                ? 'A cancelar…'
                : 'Cancelar reserva'}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>

      {reservation.canPay || reservation.canReview ? (
        <StickyFooter>
          {reservation.canPay ? (
            <Button
              onPress={() =>
                router.push({
                  pathname: '/(guest)/pay/[id]',
                  params: { id: reservation.id },
                })
              }
            >
              Efectuar pagamento
            </Button>
          ) : null}
          {reservation.canReview ? (
            <Button
              onPress={() =>
                router.push({
                  pathname: '/(guest)/review/[id]',
                  params: { id: reservation.id },
                })
              }
            >
              Avaliar estadia
            </Button>
          ) : null}
        </StickyFooter>
      ) : null}
    </Screen>
  );
}
