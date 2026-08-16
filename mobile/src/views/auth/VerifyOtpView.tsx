import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { AuthHeader, Button, OtpInput, Screen, Text } from '@/components/ui';

type Props = {
  destination?: string | null;
  onSubmit: (code: string) => void;
  onResend?: () => void;
  loading?: boolean;
  error?: string | null;
};

export function VerifyOtpView({
  destination,
  onSubmit,
  onResend,
  loading,
  error,
}: Props) {
  const [code, setCode] = useState('');
  const [seconds, setSeconds] = useState(59);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  const canVerify = /^\d{4}$/.test(code);

  return (
    <Screen contentClassName="pb-6">
      <AuthHeader title="Verificar telefone" />

      <View className="flex-1 justify-between px-6 pt-4">
        <View className="gap-6">
          <Text variant="p-m">
            Introduza o código de 4 dígitos enviado para{' '}
            <Text variant="label-s" className="text-ink">
              {destination ?? 'o seu número'}
            </Text>
          </Text>

          <OtpInput value={code} onChange={setCode} />

          {error ? (
            <Text variant="p-s" className="text-danger">
              {error}
            </Text>
          ) : null}
        </View>

        <View className="gap-3">
          <Button
            loading={loading}
            disabled={!canVerify}
            onPress={() => onSubmit(code)}
          >
            Verificar
          </Button>

          <Button
            variant="link"
            disabled={seconds > 0}
            onPress={() => {
              setSeconds(59);
              onResend?.();
            }}
          >
            {seconds > 0
              ? `Reenviar código 00:${String(seconds).padStart(2, '0')}`
              : 'Reenviar código'}
          </Button>
        </View>
      </View>
    </Screen>
  );
}
