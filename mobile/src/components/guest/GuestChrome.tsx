import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';

export { FilterChips, HostScreenHeader as GuestScreenHeader } from '@/components/host/HostChrome';

type BadgeTone = 'green' | 'blue' | 'orange' | 'yellow' | 'gray';

const badgeStyles: Record<BadgeTone, { bg: string; text: string }> = {
  green: { bg: 'bg-[#F0FDF4]', text: 'text-[#00C950]' },
  blue: { bg: 'bg-[#EFF6FF]', text: 'text-[#2B7FFF]' },
  orange: { bg: 'bg-[#FFF7ED]', text: 'text-brand' },
  yellow: { bg: 'bg-[#FEFCE8]', text: 'text-[#F0B100]' },
  gray: { bg: 'bg-[#F5F5F5]', text: 'text-ink-secondary' },
};

export function StatusBadge({
  label,
  tone = 'green',
  withDot,
}: {
  label: string;
  tone?: BadgeTone;
  withDot?: boolean;
}) {
  const s = badgeStyles[tone];
  return (
    <View className={`flex-row items-center gap-1.5 rounded-full px-2.5 py-1 ${s.bg}`}>
      {withDot ? (
        <View
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: tone === 'green' ? '#00C950' : colors.brand.DEFAULT }}
        />
      ) : null}
      <Text className={`font-inter-semibold text-[10px] leading-4 ${s.text}`}>
        {label}
      </Text>
    </View>
  );
}

export function SectionHeader({
  title,
  actionLabel = 'Ver todos',
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-manrope text-h5 text-ink">{title}</Text>
      {onAction ? (
        <Pressable onPress={onAction}>
          <Text className="font-inter-semibold text-[12px] text-brand">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function StickyFooter({ children }: { children: ReactNode }) {
  return (
    <View className="border-t border-[#F5F5F5] bg-surface px-6 py-4">
      {children}
    </View>
  );
}

export function PriceBreakdown({
  nightPrice,
  qty,
  qtyLabel,
  fee,
  total,
}: {
  nightPrice: string;
  qty: string;
  qtyLabel: string;
  fee: string;
  total: string;
}) {
  const rows = [
    { label: 'Preço por noite', value: nightPrice },
    { label: 'Quantidade', value: qtyLabel },
    { label: 'Subtotal', value: qty, hint: true },
    { label: 'Taxa Ogona (3.3%)', value: fee },
  ];
  return (
    <View className="overflow-hidden rounded-[15px] border border-surface-border">
      <View className="border-b border-surface-border bg-surface-muted px-4 py-2">
        <Text className="font-inter-semibold text-[10px] uppercase tracking-wider text-ink-secondary">
          Cálculo do preço
        </Text>
      </View>
      {rows.map((row) => (
        <View
          key={row.label}
          className="flex-row items-center justify-between border-b border-surface-border px-4 py-2.5"
        >
          <Text className="font-inter text-[13px] text-ink-muted">{row.label}</Text>
          <Text className="font-inter-semibold text-[13px] text-ink">{row.value}</Text>
        </View>
      ))}
      <View className="flex-row items-center justify-between bg-brand-soft px-4 py-3.5">
        <Text className="font-inter-semibold text-[13px] text-ink">Total</Text>
        <Text className="font-manrope-bold text-[17px] text-brand">{total}</Text>
      </View>
    </View>
  );
}

export function FavoriteButton({
  active,
  onPress,
}: {
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="h-6 w-6 items-center justify-center rounded-full border border-[#F5F5F5] bg-surface"
    >
      <Ionicons
        name={active ? 'heart' : 'heart-outline'}
        size={12}
        color={active ? colors.brand.DEFAULT : colors.ink.secondary}
      />
    </Pressable>
  );
}
