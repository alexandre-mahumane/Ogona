import { Ionicons } from '@expo/vector-icons';
import { forwardRef, useState } from 'react';
import {
  Pressable,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';

type Props = TextInputProps & {
  label?: string;
  error?: string;
  className?: string;
  isPassword?: boolean;
  required?: boolean;
};

export const Input = forwardRef<TextInput, Props>(function Input(
  {
    label,
    error,
    className = '',
    isPassword = false,
    required = false,
    secureTextEntry,
    ...props
  },
  ref,
) {
  const [visible, setVisible] = useState(false);
  const hide = isPassword && !visible;

  return (
    <View className={`w-full gap-1.5 ${className}`}>
      {label ? (
        <Text variant="label-xs">
          {label}
          {required ? <Text variant="label-xs" className="text-brand"> *</Text> : null}
        </Text>
      ) : null}
      <View
        className={`h-[54px] flex-row items-center rounded-input border bg-surface px-4 ${
          error ? 'border-danger' : 'border-surface-border'
        }`}
      >
        <TextInput
          ref={ref}
          placeholderTextColor={colors.ink.soft}
          secureTextEntry={isPassword ? hide : secureTextEntry}
          className="flex-1 font-inter text-p-s text-ink"
          {...props}
        />
        {isPassword ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar senha' : 'Mostrar senha'}
            hitSlop={8}
            onPress={() => setVisible((v) => !v)}
          >
            <Ionicons
              name={visible ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.ink.secondary}
            />
          </Pressable>
        ) : null}
      </View>
      {error ? (
        <Text variant="error">{error}</Text>
      ) : null}
    </View>
  );
});
