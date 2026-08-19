import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { AuthHeader, Button, Input, Screen, Text } from '@/components/ui';
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from '@/schemas/auth.schema';

type Props = {
  onSubmit: (data: ForgotPasswordInput) => void;
  loading?: boolean;
  error?: string | null;
};

export function ForgotPasswordView({ onSubmit, loading, error }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: { identifier: '' },
  });

  return (
    <Screen contentClassName="flex-1">
      <AuthHeader title="Recuperar palavra-passe" />

      <View className="gap-10 px-6 pt-12">
        <Text variant="p-s">
          Introduza o seu telefone e enviaremos um código de recuperação.
        </Text>

        <Controller
          control={control}
          name="identifier"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Telefone"
              autoCapitalize="none"
              keyboardType="phone-pad"
              placeholder="+258 84 000 0000"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={errors.identifier?.message}
            />
          )}
        />

        {error ? (
          <Text variant="error">{error}</Text>
        ) : null}

        <Button
          loading={loading}
          disabled={!isValid}
          onPress={handleSubmit(onSubmit)}
        >
          Enviar código
        </Button>
      </View>
    </Screen>
  );
}
