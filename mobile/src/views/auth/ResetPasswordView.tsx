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
    <Screen contentClassName="flex-1">
      <AuthHeader title="Recuperar palavra-passe" />

      <View className="gap-10 px-6 pt-12">
        <View className="gap-5">
          <Text className="font-manrope text-[14px] uppercase leading-5 text-ink-soft">
            Nova senha
          </Text>
          <View className="gap-4">
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Palavra-passe"
                  isPassword
                  placeholder="Mínimo 8 caracteres"
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
                  placeholder="Repita a palavra-passe"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.confirmPassword?.message}
                />
              )}
            />
          </View>
        </View>

        {error ? (
          <Text variant="p-s" className="text-danger">
            {error}
          </Text>
        ) : null}

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
