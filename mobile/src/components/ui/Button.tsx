import { type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type PressableProps,
} from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';

type Variant = 'primary' | 'disabled' | 'ghost' | 'link';

type Props = PressableProps & {
  children: ReactNode;
  loading?: boolean;
  variant?: Variant;
  className?: string;
  labelClassName?: string;
};

export function Button({
  children,
  loading = false,
  variant = 'primary',
  disabled,
  className = '',
  labelClassName = '',
  ...props
}: Props) {
  const isDisabled = Boolean(disabled || loading);
  const resolvedVariant: Variant =
    variant === 'primary' && isDisabled ? 'disabled' : variant;

  const container = {
    primary: 'h-14 items-center justify-center rounded-button bg-brand px-5',
    disabled: 'h-14 items-center justify-center rounded-button bg-brand-soft px-5',
    ghost: 'h-14 items-center justify-center rounded-button bg-transparent px-5',
    link: 'items-center justify-center py-2',
  }[resolvedVariant];

  const label = {
    primary: 'text-white',
    disabled: 'text-brand-muted',
    ghost: 'text-brand',
    link: 'text-brand',
  }[resolvedVariant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={`${container} ${className}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={resolvedVariant === 'primary' ? '#fff' : colors.brand.DEFAULT}
        />
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
