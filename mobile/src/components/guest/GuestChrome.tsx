import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';

export { FilterChips, HostScreenHeader as GuestScreenHeader } from '@/components/host/HostChrome';

type BadgeTone = 'green' | 'blue' | 'orange' | 'yellow' | 'gray';

const badgeColors: Record<BadgeTone, { bg: string; text: string }> = {
  green: { bg: '#F0FDF4', text: '#00C950' },
  blue: { bg: '#EFF6FF', text: '#2B7FFF' },
  orange: { bg: '#FFF7ED', text: colors.brand.DEFAULT },
  yellow: { bg: '#FEFCE8', text: '#F0B100' },
  gray: { bg: '#F5F5F5', text: colors.ink.secondary },
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
  const s = badgeColors[tone];
  return (
    <View
      className="flex-row items-center gap-1.5 rounded-full px-2 py-0.5"
      style={{ backgroundColor: s.bg }}
    >
      {withDot ? (
        <View
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: s.text }}
        />
      ) : null}
      <Text
        variant="plain"
        className="font-inter-semibold"
        style={{ color: s.text, fontSize: 10, lineHeight: 16 }}
      >
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
          <Text
            variant="plain"
            className="font-inter-semibold"
            style={{ color: colors.brand.DEFAULT, fontSize: 12, lineHeight: 16 }}
          >
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
  unitLabel = 'Preço por noite',
}: {
  nightPrice: string;
  qty: string;
  qtyLabel: string;
  fee: string;
  total: string;
  unitLabel?: string;
}) {
  const rows = [
    { label: unitLabel, value: nightPrice },
    { label: 'Quantidade', value: qtyLabel },
    { label: 'Subtotal', value: qty },
    { label: 'Taxa Ogona (3.3%)', value: fee },
  ];
  return (
    <View
      className="overflow-hidden rounded-[15px]"
      style={{ borderWidth: 1, borderColor: colors.surface.border }}
    >
      <View
        className="border-b px-4 py-2"
        style={{
          borderBottomColor: colors.surface.border,
          backgroundColor: colors.surface.muted,
        }}
      >
        <Text
          variant="plain"
          className="font-inter-semibold"
          style={{
            color: colors.ink.secondary,
            fontSize: 10,
            lineHeight: 15,
            letterSpacing: 0.8,
            textTransform: 'uppercase',
          }}
        >
          Cálculo do preço
        </Text>
      </View>
      {rows.map((row) => (
        <View
          key={row.label}
          className="flex-row items-center justify-between border-b px-4 py-2.5"
          style={{ borderBottomColor: colors.surface.border }}
        >
          <Text
            variant="plain"
            style={{ color: colors.ink.muted, fontSize: 13, lineHeight: 18 }}
          >
            {row.label}
          </Text>
          <Text
            variant="plain"
            className="font-inter-semibold"
            style={{ color: colors.ink.DEFAULT, fontSize: 13, lineHeight: 18 }}
          >
            {row.value}
          </Text>
        </View>
      ))}
      <View
        className="flex-row items-center justify-between px-4 py-3.5"
        style={{ backgroundColor: colors.brand.soft }}
      >
        <Text
          variant="plain"
          className="font-inter-semibold"
          style={{ color: colors.ink.DEFAULT, fontSize: 13, lineHeight: 18 }}
        >
          Total
        </Text>
        <Text
          variant="plain"
          className="font-manrope-bold"
          style={{ color: colors.brand.DEFAULT, fontSize: 17, lineHeight: 22 }}
        >
          {total}
        </Text>
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
