import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { AuthHeader, Button, OtpInput, Screen, Text } from '@/components/ui';
import { formatDisplayPhone } from '@/schemas/auth.schema';

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
  const phone = destination ? formatDisplayPhone(destination) : 'o seu número';

  return (
    <Screen contentClassName="flex-1">
      <AuthHeader title="Verificar telefone" />

      <View className="items-center gap-10 px-6 pt-12">
        <View className="items-center gap-1">
          <Text variant="p-s" className="text-center">
            Introduza o código de 4 dígitos enviado para
          </Text>
          <Text variant="label-s" className="text-ink">
            {phone}
          </Text>
        </View>

        <OtpInput value={code} onChange={setCode} error={error ?? undefined} />

        {error ? <Text variant="error">{error}</Text> : null}

        <View className="w-full items-center gap-4">
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
            Reenviar código
          </Button>
        </View>
      </View>
    </Screen>
  );
}
