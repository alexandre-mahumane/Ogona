import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, View } from 'react-native';

import { AuthHeader, Button, Input, Screen, Text } from '@/components/ui';
import { registerSchema, type RegisterInput } from '@/schemas/auth.schema';

type Props = {
  onSubmit: (data: RegisterInput) => void;
  loading?: boolean;
  error?: string | null;
};

export function RegisterView({ onSubmit, loading, error }: Props) {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      role: 'guest',
      name: '',
      identifier: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const role = watch('role');
  const acceptTerms = watch('acceptTerms');

  return (
    <Screen scroll contentClassName="pb-6" className="bg-surface">
      <AuthHeader title="Criar conta" />

      <View className="gap-8 px-6 pt-2">
        <View className="flex-row gap-3">
          {(['guest', 'host'] as const).map((value) => {
            const active = role === value;
            return (
              <Pressable
                key={value}
                onPress={() => setValue('role', value, { shouldValidate: true })}
                className={`h-11 flex-1 items-center justify-center rounded-button border ${
                  active
                    ? 'border-brand bg-brand-soft'
                    : 'border-surface-border bg-surface'
                }`}
              >
                <Text
                  variant="label-s"
                  className={active ? 'text-brand' : 'text-ink-muted'}
                >
                  {value === 'guest' ? 'Hóspede' : 'Anfitrião'}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View className="gap-4">
          <Text variant="label-xs" className="uppercase tracking-wide text-ink-muted">
            {role === 'host' ? 'Dados do responsável' : 'Dados pessoais'}
          </Text>

          <Controller
            control={control}
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Nome completo"
                placeholder="O seu nome"
                value={value}
                onBlur={onBlur}
                onChangeText={onChange}
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="identifier"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email ou telefone"
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

          <Pressable
            className="flex-row items-start gap-3"
            onPress={() =>
              setValue('acceptTerms', !acceptTerms, { shouldValidate: true })
            }
          >
            <View
              className={`mt-0.5 h-5 w-5 items-center justify-center rounded-full border ${
                acceptTerms ? 'border-brand bg-brand' : 'border-surface-border'
              }`}
            >
              {acceptTerms ? (
                <View className="h-2 w-2 rounded-full bg-white" />
              ) : null}
            </View>
            <Text variant="p-s" className="flex-1 text-ink-muted">
              Aceito os{' '}
              <Text variant="label-s" className="text-brand">
                Termos de Uso
              </Text>{' '}
              e a{' '}
              <Text variant="label-s" className="text-brand">
                Política de Privacidade
              </Text>{' '}
              do Ogona.
            </Text>
          </Pressable>
          {errors.acceptTerms?.message ? (
            <Text variant="p-s" className="text-danger">
              {errors.acceptTerms.message}
            </Text>
          ) : null}
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
            {role === 'host' ? 'Continuar' : 'Criar conta de hóspede'}
          </Button>

          <View className="flex-row items-center justify-center gap-1.5">
            <Text variant="p-s">Já tem conta?</Text>
            <Link href="/(auth)/login" asChild>
              <Button variant="link">Entrar</Button>
            </Link>
          </View>
        </View>
      </View>
    </Screen>
  );
}
