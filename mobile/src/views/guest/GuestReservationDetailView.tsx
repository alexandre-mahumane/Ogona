import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Linking, Pressable, ScrollView, View } from 'react-native';

import {
  GuestScreenHeader,
  StickyFooter,
} from '@/components/guest/GuestChrome';
import { Button, Screen, Text } from '@/components/ui';
import type { GuestReservationStatus } from '@/data/guest.mock';
import {
  useCancelReservation,
  useGuestReservation,
} from '@/hooks/useReservations';
import { colors } from '@/theme/colors';

const bannerByStatus: Record<
  GuestReservationStatus,
  {
    bg: string;
    border: string;
    iconBg: string;
    title: string;
    body: string;
  } | null
> = {
  pending: {
    bg: '#FEFCE8',
    border: '#F0B100',
    iconBg: '#F0B100',
    title: '#A65F00',
    body: '#D08700',
  },
  awaiting_payment: {
    bg: 'rgba(238, 242, 255, 0.5)',
    border: '#615FFF',
    iconBg: '#615FFF',
    title: '#432DD7',
    body: '#615FFF',
  },
  confirmed: {
    bg: '#F0FDF4',
    border: '#7BF1A8',
    iconBg: '#00C950',
    title: '#008236',
    body: '#00A63E',
  },
  completed: null,
  cancelled: {
    bg: '#F5F5F5',
    border: '#E5E5E5',
    iconBg: '#737373',
    title: '#525252',
    body: '#737373',
  },
};

const statusBadge: Record<
  GuestReservationStatus,
  { bg: string; text: string; size: number; weight: '600' | '700' }
> = {
  pending: { bg: '#FEFCE8', text: '#F0B100', size: 12, weight: '600' },
  awaiting_payment: { bg: '#EFF6FF', text: '#2B7FFF', size: 11.25, weight: '700' },
  confirmed: { bg: '#F0FDF4', text: '#00C950', size: 12, weight: '600' },
  completed: { bg: '#F5F5F5', text: '#525252', size: 12, weight: '600' },
  cancelled: { bg: '#F5F5F5', text: '#525252', size: 12, weight: '600' },
};

function openWhatsApp(phone?: string | null) {
  const digits = (phone ?? '').replace(/\D/g, '');
  const url = digits
    ? `https://wa.me/${digits.startsWith('258') ? digits : `258${digits}`}`
    : 'https://wa.me/258';
  void Linking.openURL(url);
}

function ActionLink({
  children,
  onPress,
  disabled,
  tone,
}: {
  children: string;
  onPress: () => void;
  disabled?: boolean;
  tone: 'whatsapp' | 'cancel';
}) {
  const green = tone === 'whatsapp';
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className="flex-1 flex-row items-center justify-center"
      style={{
        height: 41,
        borderRadius: green ? 12 : 15,
        backgroundColor: green ? '#DCFCE7' : '#FFFFFF',
        borderWidth: 1,
        borderColor: green ? '#7BF1A8' : '#FB2C36',
        gap: 8,
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <Ionicons
        name={green ? 'logo-whatsapp' : 'close-circle-outline'}
        size={green ? 20 : 15}
        color={green ? '#00C950' : '#FB2C36'}
      />
      <Text
        variant="plain"
        className="font-inter-semibold"
        style={{
          color: green ? '#00C950' : '#FB2C36',
          fontSize: 13,
          lineHeight: 19,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}

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

  const banner = bannerByStatus[reservation.status];
  const badge = statusBadge[reservation.status];
  const rows = [
    { label: 'Propriedade', value: reservation.property },
    { label: 'Quarto', value: reservation.room },
    { label: 'Check-in', value: reservation.checkIn },
    { label: 'Check-out', value: reservation.checkOut },
    { label: 'Noites', value: String(reservation.nights) },
    { label: 'Total', value: reservation.amount, accent: true },
  ];

  return (
    <Screen className="bg-[#FCFCFC]" contentClassName="flex-1" keyboard={false}>
      <GuestScreenHeader
        title="Detalhes da reserva"
        onBack={() => router.back()}
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="px-[19px] pb-8 pt-6"
        contentContainerStyle={{ gap: 16, alignItems: 'center' }}
      >
        {banner ? (
          <View
            className="w-full"
            style={{
              padding: 16,
              gap: 12,
              borderRadius: 12,
              backgroundColor: banner.bg,
              borderWidth: 1,
              borderColor: banner.border,
            }}
          >
            <View className="flex-row items-start" style={{ gap: 12 }}>
              <View
                className="items-center justify-center"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  backgroundColor: banner.iconBg,
                }}
              >
                <Ionicons name="time-outline" size={17} color="#FFFFFF" />
              </View>
              <View className="flex-1" style={{ gap: 4 }}>
                <Text
                  variant="plain"
                  className="font-inter-semibold"
                  style={{ color: banner.title, fontSize: 14, lineHeight: 18 }}
                >
                  {reservation.bannerTitle}
                </Text>
                <Text
                  variant="plain"
                  style={{ color: banner.body, fontSize: 12, lineHeight: 16 }}
                >
                  {reservation.bannerBody}
                </Text>
              </View>
            </View>
            {reservation.expiryHint ? (
              <View
                className="flex-row items-center self-start"
                style={{
                  paddingHorizontal: 11,
                  paddingVertical: 6,
                  borderRadius: 11,
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  gap: 6,
                }}
              >
                <Ionicons name="time-outline" size={11} color="#615FFF" />
                <Text
                  variant="plain"
                  className="font-inter-semibold"
                  style={{ color: '#615FFF', fontSize: 11, lineHeight: 15, fontWeight: '700' }}
                >
                  {reservation.expiryHint}
                </Text>
              </View>
            ) : null}
          </View>
        ) : null}

        <View
          className="w-full flex-row items-center justify-between"
          style={{
            paddingHorizontal: 15,
            paddingVertical: 11,
            borderRadius: 15,
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#F5F5F5',
          }}
        >
          <Text
            variant="plain"
            className="font-inter-semibold"
            style={{ color: colors.ink.DEFAULT, fontSize: 14, lineHeight: 18 }}
          >
            Estado
          </Text>
          <View
            style={{
              backgroundColor: badge.bg,
              borderRadius: 999,
              paddingHorizontal: 11,
              paddingVertical: 4,
            }}
          >
            <Text
              variant="plain"
              className="font-inter-semibold"
              style={{
                color: badge.text,
                fontSize: badge.size,
                lineHeight: 16,
                fontWeight: badge.weight,
              }}
            >
              {reservation.statusLabel}
            </Text>
          </View>
        </View>

        <View
          className="w-full overflow-hidden"
          style={{
            borderRadius: 15,
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#F5F5F5',
          }}
        >
          {rows.map((row, i) => (
            <View
              key={row.label}
              className="flex-row items-start justify-between"
              style={{
                paddingHorizontal: 15,
                paddingVertical: 11,
                borderBottomWidth: i === rows.length - 1 ? 0 : 1,
                borderBottomColor: '#F5F5F5',
              }}
            >
              <Text
                variant="plain"
                style={{ color: colors.ink.muted, fontSize: 14, lineHeight: 18 }}
              >
                {row.label}
              </Text>
              <Text
                variant="plain"
                className="font-inter-semibold"
                style={{
                  color: row.accent ? colors.brand.DEFAULT : colors.ink.DEFAULT,
                  fontSize: 14,
                  lineHeight: 18,
                  textAlign: 'right',
                  flexShrink: 1,
                  marginLeft: 12,
                }}
              >
                {row.value}
              </Text>
            </View>
          ))}
        </View>

        {reservation.canContact || reservation.canCancel ? (
          <View className="w-full flex-row" style={{ gap: 16 }}>
            {reservation.canContact ? (
              <ActionLink
                tone="whatsapp"
                onPress={() => openWhatsApp(reservation.hostWhatsapp)}
              >
                Contactar anfitrião
              </ActionLink>
            ) : null}
            {reservation.canCancel ? (
              <ActionLink
                tone="cancel"
                disabled={cancelReservation.isPending}
                onPress={() => cancelReservation.mutate(reservation.id)}
              >
                {cancelReservation.isPending ? 'A cancelar…' : 'Cancelar'}
              </ActionLink>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      {reservation.canPay || reservation.canReview ? (
        <StickyFooter>
          {reservation.canPay ? (
            <View style={{ gap: 16 }}>
              <View className="flex-row items-center justify-between">
                <Text
                  variant="plain"
                  className="font-inter-semibold"
                  style={{
                    color: colors.ink.DEFAULT,
                    fontSize: 14,
                    lineHeight: 18,
                  }}
                >
                  Total a pagar
                </Text>
                <Text
                  variant="plain"
                  className="font-manrope"
                  style={{
                    color: colors.brand.DEFAULT,
                    fontSize: 16,
                    lineHeight: 20,
                    fontWeight: '600',
                  }}
                >
                  {reservation.amount}
                </Text>
              </View>
              <Button
                className="h-14 rounded-2xl"
                onPress={() =>
                  router.push({
                    pathname: '/(guest)/pay/[id]',
                    params: { id: reservation.id },
                  })
                }
              >
                Efetuar pagamento agora
              </Button>
            </View>
          ) : null}
          {reservation.canReview && !reservation.canPay ? (
            <Button
              className="h-14 rounded-2xl"
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
