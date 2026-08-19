import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AuthHeader, Button, Input, Screen, Text } from '@/components/ui';
import type { WalletInput } from '@/schemas/auth.schema';

const wallets = [
  {
    id: 'mpesa' as const,
    label: 'M-Pesa',
    logo: require('../../../assets/wallets/m-pesa.png'),
  },
  {
    id: 'emola' as const,
    label: 'e-Mola',
    logo: require('../../../assets/wallets/emola.png'),
  },
];

type Props = {
  onSubmit: (data: WalletInput) => void;
  loading?: boolean;
  error?: string | null;
};

export function WalletView({ onSubmit, loading, error }: Props) {
  const [provider, setProvider] = useState<'mpesa' | 'emola' | null>(null);
  const [phone, setPhone] = useState('');

  const canSubmit = Boolean(provider && phone.trim().length >= 9);

  return (
    <Screen contentClassName="pb-6">
      <AuthHeader title="Carteira móvel" />

      <View className="flex-1 justify-between px-6 pt-4">
        <View className="gap-6">
          <View className="gap-1.5">
            <Text variant="h3">Carteira móvel</Text>
            <Text variant="p-m">Adicione os seus dados de recebimento</Text>
          </View>

          <View className="flex-row gap-3">
            {wallets.map((wallet) => {
              const active = provider === wallet.id;
              return (
                <Pressable
                  key={wallet.id}
                  onPress={() => setProvider(wallet.id)}
                  className={`h-24 flex-1 items-center justify-center gap-2 rounded-button border ${
                    active
                      ? 'border-brand bg-brand-soft'
                      : 'border-surface-border bg-surface'
                  }`}
                >
                  <Image source={wallet.logo} style={{ width: 40, height: 40 }} />
                  <Text variant="label-s">{wallet.label}</Text>
                </Pressable>
              );
            })}
          </View>

          <Input
            label="Número da carteira"
            keyboardType="phone-pad"
            placeholder="+258 ..."
            value={phone}
            onChangeText={setPhone}
          />
        </View>

        <View className="gap-3">
          {error ? (
            <Text variant="p-s" className="text-danger">
              {error}
            </Text>
          ) : null}

          <Button
            loading={loading}
            disabled={!canSubmit}
            onPress={() => {
              if (!provider) return;
              onSubmit({ provider, phone });
            }}
          >
            Confirmar e continuar
          </Button>
        </View>
      </View>
    </Screen>
  );
}
