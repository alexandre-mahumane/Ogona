import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { AuthHeader, Button, Input, Screen, Text } from '@/components/ui';
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from '@/schemas/auth.schema';

type Props = {
  onSubmit: (data: ResetPasswordInput) => void;
  loading?: boolean;
  error?: string | null;
};

export function ResetPasswordView({ onSubmit, loading, error }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: { password: '', confirmPassword: '' },
  });

  return (
    <Screen contentClassName="pb-6">
      <AuthHeader title="Recuperar palavra-passe" />

      <View className="flex-1 justify-between px-6 pt-4">
        <View className="gap-6">
          <Text variant="p-m">Crie uma nova palavra-passe.</Text>

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Palavra-passe"
                isPassword
                placeholder="Mínimo de 8 caracteres"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Confirmar palavra-passe"
                isPassword
                placeholder="Repita a sua palavra-passe"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.confirmPassword?.message}
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
          Criar nova senha
        </Button>
      </View>
    </Screen>
  );
}
