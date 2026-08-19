import { useRef, useState } from 'react';
import {
  Pressable,
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from 'react-native';

import { colors } from '@/theme/colors';

type Props = {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  error?: string;
};

export function OtpInput({ value, onChange, length = 4, error }: Props) {
  const refs = useRef<Array<TextInput | null>>([]);
  const digits = value.padEnd(length, ' ').slice(0, length).split('');
  const [focused, setFocused] = useState(0);

  function setAt(index: number, char: string) {
    const next = digits.map((d, i) => (i === index ? char : d === ' ' ? '' : d));
    const code = next.join('').replace(/\s/g, '').slice(0, length);
    onChange(code);
    if (char && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  }

  function onKeyPress(
    index: number,
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
  ) {
    if (e.nativeEvent.key === 'Backspace' && !digits[index]?.trim() && index > 0) {
      refs.current[index - 1]?.focus();
      setAt(index - 1, '');
    }
  }

  return (
    <View className="flex-row justify-center gap-1.5">
      {Array.from({ length }).map((_, index) => (
        <Pressable
          key={index}
          onPress={() => refs.current[index]?.focus()}
          className={`h-[54px] w-[54px] items-center justify-center rounded-input border ${
            error
              ? 'border-danger'
              : focused === index
                ? 'border-brand'
                : 'border-surface-border'
          }`}
        >
          <TextInput
            ref={(el) => {
              refs.current[index] = el;
            }}
            value={digits[index]?.trim() ?? ''}
            onChangeText={(text) => {
              const char = text.replace(/\D/g, '').slice(-1);
              setAt(index, char);
            }}
            onKeyPress={(e) => onKeyPress(index, e)}
            onFocus={() => setFocused(index)}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
            className="h-full w-full font-inter-semibold text-h4 text-ink"
            selectionColor={colors.brand.DEFAULT}
          />
        </Pressable>
      ))}
    </View>
  );
}
