import { type ReactNode } from 'react';
import {
  StyleSheet,
  Text as RNText,
  type StyleProp,
  type TextProps,
  type TextStyle,
} from 'react-native';

import { colors } from '@/theme/colors';

type Variant =
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'p-m'
  | 'p-s'
  | 'p-xs'
  | 'label-m'
  | 'label-s'
  | 'label-xs'
  | 'logo'
  | 'error'
  | 'plain';

type Props = TextProps & {
  children: ReactNode;
  variant?: Variant;
  className?: string;
};

const variants: Record<Variant, string> = {
  h3: 'font-manrope text-h3 text-ink',
  h4: 'font-manrope text-h4 text-ink',
  h5: 'font-manrope text-h5 text-ink',
  h6: 'font-manrope text-h6 text-ink-secondary',
  'p-m': 'font-inter text-p-m text-ink-muted',
  'p-s': 'font-inter text-p-s text-ink-muted',
  'p-xs': 'font-inter text-p-xs text-ink-soft',
  'label-m': 'font-inter-semibold text-label-m text-ink',
  'label-s': 'font-inter-semibold text-label-s text-ink',
  'label-xs': 'font-inter-semibold text-label-xs text-ink-secondary',
  logo: 'font-oxygen text-[20px] leading-7 text-brand',
  error: 'font-inter text-p-s',
  plain: 'font-inter',
};

const COLOR_CLASS =
  /\btext-(?:ink(?:-\w+)?|brand(?:-\w+)?|white|black|danger|\[#[0-9A-Fa-f]{3,8}\])\b/g;

function stripColorClasses(className: string) {
  COLOR_CLASS.lastIndex = 0;
  return className.replace(COLOR_CLASS, '').replace(/\s+/g, ' ').trim();
}

function hasColorClass(className: string) {
  COLOR_CLASS.lastIndex = 0;
  return COLOR_CLASS.test(className);
}

function styleHasColor(style?: StyleProp<TextStyle>) {
  const flat = StyleSheet.flatten(style);
  return Boolean(flat && flat.color != null);
}

export function Text({
  children,
  variant = 'p-m',
  className = '',
  style,
  ...props
}: Props) {
  const colorFromStyle = styleHasColor(style);
  const colorFromClass = hasColorClass(className);
  const variantClass =
    colorFromStyle || colorFromClass
      ? stripColorClasses(variants[variant])
      : variants[variant];
  const extraClass = colorFromStyle ? stripColorClasses(className) : className;

  return (
    <RNText
      className={`${variantClass} ${extraClass}`}
      style={[
        variant === 'error' && !colorFromStyle
          ? { color: colors.danger }
          : undefined,
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}
