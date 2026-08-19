import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';

type Option = { value: string; label: string };

type Props = {
  label: string;
  value: string;
  placeholder: string;
  options: Option[];
  required?: boolean;
  error?: string;
  onChange: (value: string) => void;
};

export function SelectField({
  label,
  value,
  placeholder,
  options,
  required,
  error,
  onChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View className="w-full gap-1.5">
      <Text variant="label-xs">
        {label}
        {required ? (
          <Text variant="label-xs" className="text-brand">
            {' '}
            *
          </Text>
        ) : null}
      </Text>
      <Pressable
        onPress={() => setOpen(true)}
        className={`h-[54px] flex-row items-center justify-between rounded-input border bg-surface px-4 ${
          error ? 'border-danger' : 'border-surface-border'
        }`}
      >
        <Text
          variant="plain"
          className="font-inter"
          style={{
            color: selected ? colors.ink.DEFAULT : colors.ink.soft,
            fontSize: 14,
            lineHeight: 18,
          }}
        >
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color={colors.ink.secondary} />
      </Pressable>
      {error ? (
        <Text variant="error">{error}</Text>
      ) : null}

      <Modal visible={open} transparent animationType="fade">
        <Pressable
          className="flex-1 justify-end bg-black/40"
          onPress={() => setOpen(false)}
        >
          <Pressable
            onPress={() => undefined}
            className="max-h-[70%] rounded-t-[24px] bg-surface px-6 pb-8 pt-4"
          >
            <View className="mb-3 items-center">
              <View className="h-1 w-10 rounded-full bg-surface-border" />
            </View>
            <Text variant="h5" className="mb-3">
              {label}
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {options.map((option) => {
                const active = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className="flex-row items-center justify-between py-3"
                  >
                    <Text
                      variant="plain"
                      className="font-inter"
                      style={{
                        color: active ? colors.brand.DEFAULT : colors.ink.DEFAULT,
                        fontSize: 14,
                        lineHeight: 18,
                      }}
                    >
                      {option.label}
                    </Text>
                    {active ? (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={colors.brand.DEFAULT}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
