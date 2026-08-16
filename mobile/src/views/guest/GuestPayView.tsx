import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import {
  GuestScreenHeader,
  StickyFooter,
} from '@/components/guest/GuestChrome';
import { Button, Input, Screen, Text } from '@/components/ui';
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
      <Screen contentClassName="items-center justify-center gap-4 px-6">
        <ActivityIndicator size="large" color={colors.brand.DEFAULT} />
        <Text variant="h5" className="text-center">
          A processar pagamento…
        </Text>
        <Text variant="p-m" className="text-center">
          Confirme o pedido na sua carteira móvel.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen className="bg-[#FCFCFC]" contentClassName="flex-1" keyboard>
      <GuestScreenHeader
        title="Pagamento"
        onBack={() => router.back()}
      />

      <View className="flex-1 justify-between px-6 pt-5">
        <View className="gap-6">
          <View className="gap-1">
            <Text variant="h5">Método de pagamento</Text>
            <Text variant="p-s">
              Escolha a carteira e introduza o número
            </Text>
          </View>

          <View className="flex-row gap-3">
            {wallets.map((wallet) => {
              const active = method === wallet.id;
              return (
                <Pressable
                  key={wallet.id}
                  onPress={() => setMethod(wallet.id)}
                  className={`h-24 flex-1 items-center justify-center gap-2 rounded-button border ${
                    active
                      ? 'border-brand bg-brand-soft'
                      : 'border-surface-border bg-surface'
                  }`}
                >
                  <Image
                    source={wallet.logo}
                    style={{ width: 40, height: 40 }}
                    contentFit="contain"
                  />
                  <Text variant="label-s">{wallet.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Input
            label="Número de telefone"
            keyboardType="phone-pad"
            placeholder="+258 ..."
            value={phone}
            onChangeText={setPhone}
          />

          <View className="flex-row items-center justify-between rounded-[15px] border border-[#F5F5F5] bg-brand-soft px-4 py-4">
            <Text variant="label-s">Total a pagar</Text>
            <Text className="font-manrope-bold text-[17px] text-brand">
              {reservation.amount}
            </Text>
          </View>
        </View>
      </View>

      <StickyFooter>
        <Button disabled={!canSubmit} onPress={confirm}>
          Confirmar pagamento
        </Button>
      </StickyFooter>
    </Screen>
  );
}
