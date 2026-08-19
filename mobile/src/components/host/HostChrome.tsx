import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';

type Chip = { id: string; label: string };

type Props = {
  chips: Chip[];
  value: string;
  onChange: (id: string) => void;
};

export function FilterChips({ chips, value, onChange }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="gap-2 px-6"
    >
      {chips.map((chip) => {
        const active = chip.id === value;
        return (
          <Pressable
            key={chip.id}
            onPress={() => onChange(chip.id)}
            className={`h-7 items-center justify-center rounded-full border px-3 ${
              active
                ? 'border-brand bg-brand'
                : 'border-surface-border bg-surface'
            }`}
          >
            <Text
              variant="plain"
              className="font-inter-semibold"
              style={{
                color: active ? '#FFFFFF' : colors.ink.secondary,
                fontSize: 12,
                lineHeight: 16,
              }}
            >
              {chip.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

type HeaderProps = {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
};

export function HostScreenHeader({ title, onBack, right }: HeaderProps) {
  const showBack = typeof onBack === 'function';
  return (
    <View className="flex-row items-center justify-between border-b border-[#F5F5F5] bg-surface px-6 pb-4 pt-5">
      {showBack ? (
        <Pressable
          onPress={onBack}
          className="h-[34px] w-[34px] items-center justify-center rounded-full bg-surface-muted"
        >
          <Ionicons name="arrow-back" size={16} color={colors.ink.secondary} />
        </Pressable>
      ) : (
        <View className={right ? 'w-[34px]' : 'w-0'} />
      )}
      <Text className="flex-1 text-center font-manrope text-h5 text-ink">
        {title}
      </Text>
      {right ?? <View className={showBack ? 'w-[34px]' : 'w-0'} />}
    </View>
  );
}

type ProgressProps = {
  title: string;
  step: number;
  total: number;
};

export function WizardProgressHeader({ title, step, total }: ProgressProps) {
  return (
    <View className="gap-4 bg-[#FCFCFC] px-6 py-4">
      <View className="flex-row items-center justify-between">
        <Text className="font-manrope text-h6 text-ink-secondary">{title}</Text>
        <Text variant="label-xs" className="text-ink-muted">
          Passo {step} de {total}
        </Text>
      </View>
      <View className="flex-row gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            className="h-1.5 flex-1 rounded-full"
            style={{
              backgroundColor: i < step ? colors.brand.DEFAULT : '#FFEDD4',
            }}
          />
        ))}
      </View>
    </View>
  );
}

type FooterProps = {
  onBack: () => void;
  onContinue: () => void;
  continueLabel?: string;
  backLabel?: string;
  disabled?: boolean;
};

export function WizardFooter({
  onBack,
  onContinue,
  continueLabel = 'Continuar',
  backLabel = 'Voltar',
  disabled = false,
}: FooterProps) {
  return (
    <View className="flex-row gap-2.5 border-t border-[#F5F5F5] bg-[#FCFCFC] px-6 py-5">
      <Pressable
        onPress={onBack}
        disabled={disabled}
        className="h-12 flex-1 items-center justify-center rounded-button border border-ink-secondary"
        style={{ opacity: disabled ? 0.6 : 1 }}
      >
        <Text variant="label-m" className="text-ink-secondary">
          {backLabel}
        </Text>
      </Pressable>
      <Pressable
        onPress={onContinue}
        disabled={disabled}
        className="h-12 flex-1 items-center justify-center rounded-button bg-brand"
        style={{ opacity: disabled ? 0.6 : 1 }}
      >
        <Text variant="label-m" className="text-white">
          {continueLabel}
        </Text>
      </Pressable>
    </View>
  );
}
