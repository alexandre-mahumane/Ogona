import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';

import {
  GuestScreenHeader,
  StickyFooter,
} from '@/components/guest/GuestChrome';
import { Button, KeyboardScrollView, Screen, Text } from '@/components/ui';
import {
  useGuestReservation,
  usePayReservation,
} from '@/hooks/useReservations';
import { colors } from '@/theme/colors';

const wallets = [
  {
    id: 'mpesa' as const,
    label: 'M-Pesa',
    logo: require('../../../assets/wallets/m-pesa.png'),
  },
  {
    id: 'emola' as const,
    label: 'E-Mola',
    logo: require('../../../assets/wallets/emola.png'),
  },
];

const methodMap = {
  mpesa: 'm_pesa',
  emola: 'e_mola',
} as const;

type Phase = 'form' | 'processing';

export function GuestPayView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const reservationId = id ? String(id) : undefined;
  const reservationQuery = useGuestReservation(reservationId);
  const payReservation = usePayReservation();
  const reservation = reservationQuery.data;

  const [method, setMethod] = useState<'mpesa' | 'emola' | null>(null);
  const [phone, setPhone] = useState('');
  const [phase, setPhase] = useState<Phase>('form');

  const canSubmit = Boolean(method && phone.trim().length >= 9);

  const confirm = () => {
    if (!canSubmit || !method || !reservationId) return;
    setPhase('processing');
    payReservation.mutate(
      { id: reservationId, method: methodMap[method] },
      {
        onSuccess: () => router.replace('/(guest)/pay-success'),
        onError: () => setPhase('form'),
      },
    );
  };

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

  if (phase === 'processing') {
    return (
      <Screen className="bg-surface" contentClassName="flex-1 items-center justify-center px-6">
        <View className="items-center" style={{ gap: 8 }}>
          <View
            className="items-center justify-center"
            style={{
              width: 60,
              height: 60,
              borderRadius: 999,
              borderWidth: 4,
              borderColor: 'rgba(255, 105, 0, 0.25)',
            }}
          >
            <ActivityIndicator size="small" color={colors.brand.DEFAULT} />
          </View>
          <Text
            variant="plain"
            className="font-manrope text-center"
            style={{
              color: colors.ink.DEFAULT,
              fontSize: 16,
              lineHeight: 20,
              fontWeight: '600',
            }}
          >
            A processar pagamento…
          </Text>
          <Text
            variant="plain"
            className="text-center"
            style={{ color: colors.ink.muted, fontSize: 14, lineHeight: 18 }}
          >
            Por favor aguarde
          </Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen className="bg-[#FCFCFC]" contentClassName="flex-1" keyboard>
      <GuestScreenHeader title="Pagamento" onBack={() => router.back()} />

      <KeyboardScrollView
        className="flex-1"
        contentContainerClassName="gap-4 px-[19px] pt-6 pb-8"
        extraHeight={40}
      >
        <Text
          variant="plain"
          className="font-inter-semibold"
          style={{ color: colors.ink.DEFAULT, fontSize: 14, lineHeight: 18 }}
        >
          Selecionar método de pagamento
        </Text>

        <View className="flex-row" style={{ gap: 11 }}>
          {wallets.map((wallet) => {
            const active = method === wallet.id;
            return (
              <Pressable
                key={wallet.id}
                onPress={() => setMethod(wallet.id)}
                className="items-center"
                style={{
                  width: 155,
                  height: 97,
                  paddingVertical: 19,
                  gap: 8,
                  borderRadius: 12,
                  backgroundColor: active ? colors.brand.soft : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: active
                    ? colors.brand.DEFAULT
                    : colors.surface.border,
                }}
              >
                <Image
                  source={wallet.logo}
                  style={{ width: 32, height: 32 }}
                  contentFit="contain"
                />
                <Text
                  variant="plain"
                  className="font-inter-semibold text-center"
                  style={{
                    color: colors.ink.DEFAULT,
                    fontSize: 14,
                    lineHeight: 18,
                  }}
                >
                  {wallet.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {method ? (
          <>
            <View style={{ gap: 8 }}>
              <Text
                variant="plain"
                className="font-inter-semibold"
                style={{
                  color: colors.ink.secondary,
                  fontSize: 14,
                  lineHeight: 18,
                }}
              >
                {method === 'mpesa' ? 'Número M-Pesa' : 'Número E-Mola'}
              </Text>
              <View
                className="flex-row items-center"
                style={{
                  height: 54,
                  paddingHorizontal: 12,
                  borderRadius: 12,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: colors.surface.border,
                }}
              >
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  placeholder="+258 84 000 000"
                  placeholderTextColor={colors.ink.soft}
                  className="flex-1 font-inter"
                  style={{
                    color: colors.ink.DEFAULT,
                    fontSize: 16,
                    lineHeight: 20,
                  }}
                />
              </View>
            </View>

            <View
              className="flex-row items-center justify-between"
              style={{
                padding: 15,
                borderRadius: 15,
                backgroundColor: '#FCFCFC',
                borderWidth: 1,
                borderColor: '#F5F5F5',
              }}
            >
              <Text
                variant="plain"
                style={{ color: colors.ink.muted, fontSize: 14, lineHeight: 18 }}
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

            <Text
              variant="plain"
              style={{ color: colors.ink.soft, fontSize: 12, lineHeight: 16 }}
            >
              Ao confirmar, receberá um PIN de confirmação no seu telemóvel para
              verificar o pagamento.
            </Text>
          </>
        ) : null}
      </KeyboardScrollView>

      {method ? (
        <StickyFooter>
          <Button
            disabled={!canSubmit}
            onPress={confirm}
            className="h-14 rounded-2xl"
          >
            Confirmar pagamento
          </Button>
        </StickyFooter>
      ) : null}
    </Screen>
  );
}
