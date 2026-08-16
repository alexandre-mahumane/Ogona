import { zodResolver } from '@hookform/resolvers/zod';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';

import { Button, Input, SafeAreaView, Text } from '@/components/ui';
import { loginSchema, type LoginInput } from '@/schemas/auth.schema';

const hero = require('../../../assets/login/b12b6a32d4a0aae46fdfcc3c18b2f6785bd0f519.jpg');

type Props = {
  onSubmit: (data: LoginInput) => void;
  loading?: boolean;
  error?: string | null;
};

export function LoginView({ onSubmit, loading, error }: Props) {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: { identifier: '', password: '' },
  });

  return (
    <SafeAreaView className="flex-1 bg-surface">
      <StatusBar style="dark" />

      <View className="h-[200px] w-full overflow-hidden">
        <Image
          source={hero}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
        />
        <LinearGradient
          colors={['rgba(39, 31, 20, 0.8)', 'rgba(39, 31, 20, 0)']}
          start={{ x: 0.05, y: 1 }}
          end={{ x: 0.85, y: 0.1 }}
          style={StyleSheet.absoluteFill}
        />
        <View className="flex-1 justify-end px-6 pb-4">
          <Text variant="logo">Ogona</Text>
          <Text variant="label-s" className="mt-1 text-ink-inverse">
            Alojamentos em Moçambique
          </Text>
        </View>
      </View>

      <View className="flex-1 gap-8 px-6 pt-12">
        <View className="gap-1.5">
          <Text variant="h3">Bem-vindo de volta</Text>
          <Text variant="p-m">
            Entre para encontrar o alojamento ideal para a sua próxima estadia
          </Text>
        </View>

        <View className="gap-5">
          <View className="gap-4">
            <Controller
              control={control}
              name="identifier"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email ou telefone"
                  autoCapitalize="none"
                  autoComplete="username"
                  keyboardType="email-address"
                  placeholder="Seu email ou telefone"
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
                  placeholder="Password"
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
                labelClassName="text-label-xs"
              >
                Esqueci a palavra-passe
              </Button>
            </Link>
          </View>

          {error ? (
            <Text variant="p-s" className="text-danger">
              {error}
            </Text>
          ) : null}

          <View className="gap-4">
            <Button
              loading={loading}
              disabled={!isValid}
              onPress={handleSubmit(onSubmit)}
            >
              Entrar
            </Button>

            <View className="flex-row items-center justify-center gap-1.5">
              <Text variant="p-s">Não tem conta.?</Text>
              <Link href="/(auth)/register" asChild>
                <Button variant="link">Registar</Button>
              </Link>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
