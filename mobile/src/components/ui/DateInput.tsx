import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import {
  CalendarPicker,
  addYearsIso,
  dmyToIso,
  isoToDmy,
  toIsoDate,
} from '@/components/ui/CalendarPicker';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';

type DateFieldProps = {
  label: string;
  value: string;
  placeholder?: string;
  error?: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
};

export function DateField({
  label,
  value,
  placeholder = 'DD/MM/YYYY',
  error,
  onPress,
  icon = 'calendar-outline',
}: DateFieldProps) {
  return (
    <View className="w-full gap-1.5">
      <Text variant="label-xs">{label}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        className="h-[54px] flex-row items-center justify-between rounded-input border border-surface-border bg-surface px-4"
      >
        <Text
          variant="p-s"
          className={value ? 'text-ink' : 'text-ink-soft'}
        >
          {value || placeholder}
        </Text>
        <Ionicons name={icon} size={18} color={colors.ink.soft} />
      </Pressable>
      {error ? (
        <Text variant="p-s" className="text-danger">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

type DateInputProps = {
  label: string;
  value: string;
  placeholder?: string;
  error?: string;
  title?: string;
  minDate?: string;
  maxDate?: string;
  onChange: (dmy: string) => void;
};

export function DateInput({
  label,
  value,
  placeholder = 'DD/MM/YYYY',
  error,
  title = 'Escolher data',
  minDate,
  maxDate,
  onChange,
}: DateInputProps) {
  const [open, setOpen] = useState(false);
  const selectedIso = dmyToIso(value) || maxDate || minDate || toIsoDate();

  return (
    <>
      <DateField
        label={label}
        value={value}
        placeholder={placeholder}
        error={error}
        onPress={() => setOpen(true)}
      />
      <CalendarPicker
        visible={open}
        title={title}
        mode="single"
        startDate={selectedIso}
        minDate={minDate}
        maxDate={maxDate}
        onClose={() => setOpen(false)}
        onConfirm={(start) => {
          onChange(isoToDmy(start));
          setOpen(false);
        }}
      />
    </>
  );
}

export function birthDateBounds() {
  const today = toIsoDate();
  return {
    minDate: addYearsIso(today, -120),
    maxDate: addYearsIso(today, -18),
  };
}
