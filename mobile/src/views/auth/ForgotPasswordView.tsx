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
    <Screen contentClassName="pb-6">
      <AuthHeader title="Recuperar palavra-passe" />

      <View className="flex-1 justify-between px-6 pt-4">
        <View className="gap-6">
          <Text variant="p-m">
            Introduza o seu e-mail ou telefone e enviaremos um código de
            recuperação.
          </Text>

          <Controller
            control={control}
            name="identifier"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="E-mail ou telefone"
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="exemplo@email.com"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.identifier?.message}
              />
            )}
          />

          {error ? (
            <Text variant="p-s" className="text-danger">
              {error}
            </Text>
          ) : null}
        </View>

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
