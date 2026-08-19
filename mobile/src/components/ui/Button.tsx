import { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  View,
  type PressableProps,
} from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';

type Variant = 'primary' | 'disabled' | 'ghost' | 'link';

type Props = PressableProps & {
  children: ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  variant?: Variant;
  className?: string;
  labelClassName?: string;
};

export function Button({
  children,
  loading = false,
  loadingLabel,
  variant = 'primary',
  disabled,
  className = '',
  labelClassName = '',
  ...props
}: Props) {
  const isDisabled = Boolean(disabled || loading);
  const resolvedVariant: Variant =
    variant === 'primary' && isDisabled && !loading ? 'disabled' : variant;

  const container = {
    primary: 'h-14 items-center justify-center rounded-button bg-brand px-5',
    disabled: 'h-14 items-center justify-center rounded-button bg-brand-soft px-5',
    ghost: 'h-14 items-center justify-center rounded-button bg-transparent px-5',
    link: 'items-center justify-center py-2',
  }[resolvedVariant];

  const label = {
    primary: '!text-white',
    disabled: '!text-brand-muted',
    ghost: '!text-brand',
    link: '!text-brand',
  }[resolvedVariant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={`${container} ${className}`}
      {...props}
    >
      {loading ? (
        <View className="flex-row items-center gap-2">
          <ActivityIndicator
            color={resolvedVariant === 'primary' ? '#fff' : colors.brand.DEFAULT}
          />
          {loadingLabel ? (
            <Text
              variant="label-m"
              className={`${label} ${labelClassName}`}
            >
              {loadingLabel}
            </Text>
          ) : null}
        </View>
      ) : (
        <Text
          variant={resolvedVariant === 'link' ? 'label-s' : 'label-m'}
          className={`${label} ${labelClassName}`}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}
