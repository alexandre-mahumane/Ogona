import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import {
  AuthHeader,
  Button,
  Input,
  Screen,
  SelectField,
  Text,
} from '@/components/ui';
import {
  DEFAULT_BIRTH_DATE,
  isValidMzPhone,
  type RegisterAccountInput,
  type RegisterBusinessInput,
  type WalletInput,
} from '@/schemas/auth.schema';
import { colors } from '@/theme/colors';

const roles = [
  { value: 'guest' as const, label: 'Hóspede', icon: 'person-outline' as const },
  { value: 'host' as const, label: 'Anfitrião', icon: 'business-outline' as const },
];

const PROPERTY_TYPES = [
  { value: 'pensao', label: 'Pensão' },
  { value: 'guest_house', label: 'Guest House' },
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'lodge', label: 'Lodge' },
];

const PROVINCES = [
  { value: 'maputo_cidade', label: 'Cidade de Maputo' },
  { value: 'maputo_provincia', label: 'Maputo' },
  { value: 'gaza', label: 'Gaza' },
  { value: 'inhambane', label: 'Inhambane' },
  { value: 'sofala', label: 'Sofala' },
  { value: 'manica', label: 'Manica' },
  { value: 'tete', label: 'Tete' },
  { value: 'zambezia', label: 'Zambézia' },
  { value: 'nampula', label: 'Nampula' },
  { value: 'cabo_delgado', label: 'Cabo Delgado' },
  { value: 'niassa', label: 'Niassa' },
];

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

export type RegisterPayload = RegisterAccountInput & {
  birthDate: string;
  acceptTerms: boolean;
  business?: RegisterBusinessInput;
  wallet?: WalletInput;
};

type Props = {
  onSubmit: (data: RegisterPayload) => void;
  loading?: boolean;
  error?: string | null;
};

function TermsRow({
  checked,
  onToggle,
}: {
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable onPress={onToggle} className="flex-row items-start gap-2">
      <View
        className="mt-0.5 h-4 w-4 items-center justify-center rounded"
        style={{
          backgroundColor: checked ? '#FFF7ED' : '#FFFFFF',
          borderWidth: 1,
          borderColor: checked ? colors.brand.DEFAULT : '#E5E5E5',
        }}
      >
        {checked ? (
          <Ionicons name="checkmark" size={11} color={colors.brand.DEFAULT} />
        ) : null}
      </View>
      <Text variant="label-s" className="flex-1 text-ink-muted">
        Aceito os <Text variant="label-s" className="text-brand">Termos de Uso</Text>
        {' '}e a{' '}
        <Text variant="label-s" className="text-brand">Política de Privacidade</Text>
        {' '}do Ogona.
      </Text>
    </Pressable>
  );
}

function LoginRow() {
  return (
    <View className="flex-row items-center justify-center gap-1.5">
      <Text variant="p-s">Já tem conta?</Text>
      <Link href="/(auth)/login" asChild>
        <Button variant="link">Entrar</Button>
      </Link>
    </View>
  );
}

export function RegisterView({ onSubmit, loading, error }: Props) {
  const [role, setRole] = useState<'guest' | 'host'>('guest');
  const [hostStep, setHostStep] = useState<1 | 2 | 3>(1);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [account, setAccount] = useState({
    name: '',
    identifier: '',
    password: '',
    confirmPassword: '',
  });
  const [business, setBusiness] = useState({
    businessName: '',
    propertyType: '',
    province: '',
    city: '',
    whatsapp: '',
    altPhone: '',
  });
  const [wallet, setWallet] = useState<{
    provider: 'mpesa' | 'emola';
    phone: string;
  }>({ provider: 'mpesa', phone: '' });

  const step = role === 'host' ? hostStep : 1;

  const accountValid = useMemo(() => {
    return (
      account.name.trim().length >= 2 &&
      isValidMzPhone(account.identifier) &&
      account.password.length >= 8 &&
      account.password === account.confirmPassword
    );
  }, [account]);

  const businessValid = useMemo(() => {
    return (
      business.businessName.trim().length >= 2 &&
      Boolean(business.propertyType) &&
      Boolean(business.province) &&
      business.city.trim().length >= 2 &&
      business.whatsapp.replace(/\s|-/g, '').length >= 9 &&
      business.altPhone.replace(/\s|-/g, '').length >= 9
    );
  }, [business]);

  const walletValid = wallet.phone.replace(/\s|-/g, '').length >= 9;

  const guestReady = accountValid && acceptTerms;
  const hostReady = accountValid && businessValid && walletValid && acceptTerms;

  function setAccountField(key: keyof typeof account, value: string) {
    setAccount((prev) => ({ ...prev, [key]: value }));
  }

  function setBusinessField(key: keyof typeof business, value: string) {
    setBusiness((prev) => ({ ...prev, [key]: value }));
  }

  function submitGuest() {
    if (!guestReady) {
      setFormError(
        account.password !== account.confirmPassword
          ? 'As palavras-passe não coincidem'
          : 'Aceite os termos para continuar',
      );
      return;
    }
    setFormError(null);
    onSubmit({
      role: 'guest',
      name: account.name.trim(),
      identifier: account.identifier.trim(),
      password: account.password,
      confirmPassword: account.confirmPassword,
      birthDate: DEFAULT_BIRTH_DATE,
      acceptTerms,
    });
  }

  function submitHost() {
    if (!hostReady) {
      setFormError('Aceite os termos para continuar');
      return;
    }
    setFormError(null);
    onSubmit({
      role: 'host',
      name: account.name.trim(),
      identifier: account.identifier.trim(),
      password: account.password,
      confirmPassword: account.confirmPassword,
      birthDate: DEFAULT_BIRTH_DATE,
      acceptTerms,
      business,
      wallet,
    });
  }

  const headerRight =
    role === 'host' ? (
      <Text variant="p-s">{step}/3</Text>
    ) : undefined;

  return (
    <Screen contentClassName="flex-1">
      <AuthHeader
        title="Criar conta"
        right={headerRight}
        onBack={
          role === 'host' && step > 1
            ? () => setHostStep((step - 1) as 1 | 2)
            : undefined
        }
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="flex-grow pb-6"
      >

      <View className="gap-8 px-6 pt-12">
        {step === 1 ? (
          <View className="flex-row items-center gap-2 rounded-[12px] border border-[#F5F5F5] bg-[#FDFCFC] p-2">
            {roles.map((item) => {
              const active = role === item.value;
              return (
                <Pressable
                  key={item.value}
                  onPress={() => {
                    setRole(item.value);
                    setHostStep(1);
                    setFormError(null);
                  }}
                  className={`h-10 flex-1 flex-row items-center justify-center gap-1 rounded-[12px] ${
                    active ? 'border border-brand bg-surface' : 'bg-[#FDFCFC]'
                  }`}
                >
                  <Ionicons
                    name={item.icon}
                    size={14}
                    color={active ? colors.brand.DEFAULT : colors.ink.muted}
                  />
                  <Text
                    variant="p-s"
                    className={active ? 'text-brand' : 'text-ink-muted'}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {step === 1 ? (
          <View className="gap-10">
            <View className="gap-5">
              <Text className="font-manrope text-[14px] uppercase leading-5 text-ink-soft">
                Dados do responsável
              </Text>
              <View className="gap-4">
                <Input
                  label="Nome completo"
                  placeholder="Nome completo"
                  value={account.name}
                  onChangeText={(value) => setAccountField('name', value)}
                />
                <Input
                  label="Telefone"
                  autoCapitalize="none"
                  keyboardType="phone-pad"
                  placeholder="+258 84 000 0000"
                  value={account.identifier}
                  onChangeText={(value) => setAccountField('identifier', value)}
                />
                <Input
                  label="Palavra-passe"
                  isPassword
                  placeholder="Palavra-passe"
                  value={account.password}
                  onChangeText={(value) => setAccountField('password', value)}
                />
                <Input
                  label="Confirmar palavra-passe"
                  isPassword
                  placeholder="Confirmar palavra-passe"
                  value={account.confirmPassword}
                  onChangeText={(value) =>
                    setAccountField('confirmPassword', value)
                  }
                />
              </View>
            </View>

            {role === 'guest' ? (
              <View className="gap-10">
                <TermsRow
                  checked={acceptTerms}
                  onToggle={() => setAcceptTerms((value) => !value)}
                />
                {error || formError ? (
                  <Text variant="error">{error ?? formError}</Text>
                ) : null}
                <View className="gap-4">
                  <Button
                    loading={loading}
                    disabled={!guestReady}
                    onPress={submitGuest}
                  >
                    Criar conta de hóspede
                  </Button>
                  <LoginRow />
                </View>
              </View>
            ) : (
              <View className="gap-4">
                {formError ? (
                  <Text variant="error">{formError}</Text>
                ) : null}
                <Button
                  disabled={!accountValid}
                  onPress={() => {
                    if (account.password !== account.confirmPassword) {
                      setFormError('As palavras-passe não coincidem');
                      return;
                    }
                    setFormError(null);
                    setHostStep(2);
                  }}
                >
                  Próximo
                </Button>
                <LoginRow />
              </View>
            )}
          </View>
        ) : null}

        {step === 2 ? (
          <View className="gap-10">
            <View className="gap-5">
              <Text className="font-manrope text-[14px] uppercase leading-5 text-ink-soft">
                Dados do negócio
              </Text>
              <View className="gap-4">
                <Input
                  required
                  label="Nome do negócio / propriedade"
                  placeholder="Ex.: Pensão Central Maputo"
                  value={business.businessName}
                  onChangeText={(value) =>
                    setBusinessField('businessName', value)
                  }
                />
                <SelectField
                  required
                  label="Tipo de alojamento"
                  placeholder="Selecione o alojamento"
                  value={business.propertyType}
                  options={PROPERTY_TYPES}
                  onChange={(value) => setBusinessField('propertyType', value)}
                />
                <SelectField
                  required
                  label="Província"
                  placeholder="Selecione a província"
                  value={business.province}
                  options={PROVINCES}
                  onChange={(value) => setBusinessField('province', value)}
                />
                <Input
                  required
                  label="Cidade"
                  placeholder="EX: Maputo"
                  value={business.city}
                  onChangeText={(value) => setBusinessField('city', value)}
                />
                <Input
                  required
                  label="Whatsapp"
                  keyboardType="phone-pad"
                  placeholder="+258 84 000 0000"
                  value={business.whatsapp}
                  onChangeText={(value) => setBusinessField('whatsapp', value)}
                />
                <Input
                  required
                  label="Telefone alternativo"
                  keyboardType="phone-pad"
                  placeholder="+258 84 000 0000"
                  value={business.altPhone}
                  onChangeText={(value) => setBusinessField('altPhone', value)}
                />
              </View>
            </View>
            <View className="gap-4">
              <Button
                disabled={!businessValid}
                onPress={() => setHostStep(3)}
              >
                Próximo
              </Button>
              <LoginRow />
            </View>
          </View>
        ) : null}

        {step === 3 ? (
          <View className="flex-1 justify-between gap-10">
            <View className="gap-5">
              <Text className="font-manrope text-[14px] uppercase leading-5 text-ink-soft">
                Dados de pagamento
              </Text>
              <View className="gap-4">
                <View className="flex-row gap-[25px]">
                  {wallets.map((item) => {
                    const active = wallet.provider === item.id;
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() =>
                          setWallet((prev) => ({ ...prev, provider: item.id }))
                        }
                        className={`h-[84px] flex-1 items-center justify-center gap-2 rounded-[12px] border ${
                          active
                            ? 'border-brand bg-surface'
                            : 'border-[#F5F5F5] bg-[#FDFCFC]'
                        }`}
                      >
                        <Image
                          source={item.logo}
                          style={{ width: 32, height: 32 }}
                          contentFit="contain"
                        />
                        <Text variant="label-s" className="text-ink-secondary">
                          {item.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Input
                  required
                  label="Número M-Pesa / e-Mola"
                  keyboardType="phone-pad"
                  placeholder="+258 84 000 0000"
                  value={wallet.phone}
                  onChangeText={(value) =>
                    setWallet((prev) => ({ ...prev, phone: value }))
                  }
                />
              </View>
            </View>

            <View className="gap-10">
              <TermsRow
                checked={acceptTerms}
                onToggle={() => setAcceptTerms((value) => !value)}
              />
              {error || formError ? (
                <Text variant="error">{error ?? formError}</Text>
              ) : null}
              <View className="gap-4">
                <Button
                  loading={loading}
                  disabled={!hostReady}
                  onPress={submitHost}
                >
                  Criar conta de anfitrião
                </Button>
                <LoginRow />
              </View>
            </View>
          </View>
        ) : null}
      </View>
      </ScrollView>
    </Screen>
  );
}
