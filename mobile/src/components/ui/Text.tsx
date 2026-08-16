import { type ReactNode } from 'react';
import { Text as RNText, type TextProps } from 'react-native';

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
  | 'logo';

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
};

export function Text({
  children,
  variant = 'p-m',
  className = '',
  ...props
}: Props) {
  return (
    <RNText className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </RNText>
  );
}
