import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { AuthHero, Button, Input, SafeAreaView, Text } from '@/components/ui';
import { loginSchema, type LoginInput } from '@/schemas/auth.schema';

type Props = {
  onSubmit: (data: LoginInput) => void;
  loading?: boolean;
  error?: string | null;
};

export function LoginView({ onSubmit, loading, error }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { identifier: '', password: '' },
  });

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <StatusBar style="dark" />

      <AuthHero />

      <View className="flex-1 px-6 pt-12">
        <View className="gap-8">
          <View className="gap-1.5">
            <Text variant="h3">Bem-vindo de volta</Text>
            <Text variant="p-m">
              Entre na sua conta para gerir as suas reservas
            </Text>
          </View>

          <View className="gap-4">
            <Controller
              control={control}
              name="identifier"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Número de celular"
                  autoCapitalize="none"
                  autoComplete="username"
                  keyboardType="phone-pad"
                  placeholder="83 000 0000"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.identifier?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Senha"
                  isPassword
                  placeholder="Senha"
                  value={value}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={errors.password?.message}
                />
              )}
            />

            <Link href="/(auth)/forgot-password" asChild>
              <Button
                variant="link"
                className="self-end"
                labelClassName="text-label-xs !text-ink"
              >
                Esqueceu senha?
              </Button>
            </Link>
          </View>

          {error ? (
            <Text variant="error">{error}</Text>
          ) : null}

          <Button
            loading={loading}
            onPress={handleSubmit(onSubmit)}
          >
            Entrar na minha conta
          </Button>
        </View>

        <View className="mt-auto flex-row items-center justify-center gap-1.5 pb-6">
          <Text variant="p-s">Não tem conta?</Text>
          <Link href="/(auth)/register" asChild>
            <Button variant="link">Registar</Button>
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
