import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { type Href, router } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Screen, Text } from '@/components/ui';
import { guestHome } from '@/data/guest.mock';
import {
  useAcceptReservation,
  useRejectReservation,
} from '@/hooks/useReservations';
import { useHostDashboard } from '@/hooks/useHost';
import { useAuthStore } from '@/stores/auth.store';
import { colors } from '@/theme/colors';

export function HostDashboardView() {
  const dashboardQuery = useHostDashboard();
  const acceptReservation = useAcceptReservation();
  const rejectReservation = useRejectReservation();
  const user = useAuthStore((s) => s.user);
  const d = dashboardQuery.data;

  if (dashboardQuery.isLoading || !d) {
    return (
      <Screen contentClassName="items-center justify-center">
        {dashboardQuery.isError ? (
          <Text variant="p-s">
            {dashboardQuery.error instanceof Error
              ? dashboardQuery.error.message
              : 'Não foi possível carregar o dashboard'}
          </Text>
        ) : (
          <ActivityIndicator color={colors.brand.DEFAULT} />
        )}
      </Screen>
    );
  }

  return (
    <Screen scroll keyboard={false} contentClassName="pb-8">
      <View className="border-b border-[#F5F5F5] bg-surface px-6 pb-4 pt-2">
        <View className="flex-row items-center justify-between">
          <View className="gap-1">
            <Text variant="h5">Olá, {d.greetingName}</Text>
            <Text variant="p-s">Gerencie seus alojamentos</Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Pressable className="h-10 w-10 items-center justify-center rounded-full border border-[#F5F5F5]">
              <Ionicons name="notifications-outline" size={18} color="#525252" />
            </Pressable>
            <View className="h-10 w-10 overflow-hidden rounded-full border border-surface-border">
              <Image
                source={{
                  uri: user?.photoUrl ?? guestHome.avatar,
                }}
                style={{ width: 40, height: 40 }}
              />
            </View>
          </View>
        </View>
      </View>

      <View className="gap-8 px-6 pt-10">
        <View className="flex-row flex-wrap justify-between gap-y-3">
          {d.stats.map((stat) => (
            <View
              key={stat.id}
              className="w-[48%] rounded-[15px] border border-[#F5F5F5] bg-surface p-4"
            >
              <View
                className="mb-2 h-[34px] w-[34px] items-center justify-center rounded-[15px]"
                style={{ backgroundColor: stat.iconBg }}
              >
                <Ionicons name={stat.icon} size={16} color={stat.iconColor} />
              </View>
              <Text className="font-manrope-bold text-[19px] leading-5 text-ink">
                {stat.value}
              </Text>
              <Text className="mt-1 font-inter text-[11px] leading-[15px] text-ink-soft">
                {stat.label}
              </Text>
              <Text
                variant="plain"
                className="mt-1 font-inter-semibold"
                style={{ color: '#00C950', fontSize: 10, lineHeight: 15 }}
              >
                {stat.hint}
              </Text>
            </View>
          ))}
        </View>

        <View className="rounded-xl border border-[#F5F5F5] bg-[#FCFCFC] p-3">
          <View className="flex-row items-center justify-between rounded-[15px] bg-surface p-3">
            {d.today.map((item, i) => (
              <View key={item.label} className="flex-1 flex-row items-center">
                {i > 0 ? (
                  <View className="mr-2 h-[30px] w-px bg-surface-border" />
                ) : null}
                <View className="gap-0.5">
                  <Text className="font-inter-semibold text-[11px] text-ink-secondary">
                    {item.label}
                  </Text>
                  <Text
                    variant="plain"
                    className="font-manrope-bold"
                    style={{ color: '#CA3500', fontSize: 17, lineHeight: 22 }}
                  >
                    {item.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View>
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="font-manrope-bold text-[13px] text-ink">
              Pedidos pendentes
            </Text>
            {d.pending ? (
              <Pressable onPress={() => router.push('/(host)/(tabs)/reservations')}>
                <Text variant="label-xs" className="text-brand">
                  Ver todos
                </Text>
              </Pressable>
            ) : null}
          </View>
          {d.pending ? (
            <Pressable
              onPress={() =>
                router.push(`/(host)/reservation/${d.pending!.id}` as Href)
              }
              className="rounded-[15px] border border-[#FEFCE8] bg-surface p-4 shadow-sm"
            >
              <View className="flex-row items-center gap-3">
                <View className="h-[38px] w-[38px] items-center justify-center rounded-full bg-brand">
                  <Text className="font-inter-semibold text-[13px] text-white">
                    {d.pending.guest.charAt(0)}
                  </Text>
                </View>
                <View className="flex-1">
                  <Text className="font-inter-semibold text-[13px] text-ink">
                    {d.pending.guest}
                  </Text>
                  <Text className="font-inter text-[11px] text-ink-soft">
                    {d.pending.property}
                  </Text>
                </View>
                <Text
                  variant="plain"
                  className="font-inter-semibold"
                  style={{ color: '#CA3500', fontSize: 13, lineHeight: 18 }}
                >
                  {d.pending.amount}
                </Text>
              </View>
              <View className="mt-3 flex-row items-center gap-1">
                <Ionicons name="calendar-outline" size={11} color="#737373" />
                <Text className="font-inter text-[11px] text-ink-muted">
                  {d.pending.dates}
                </Text>
              </View>
              <View className="mt-3 flex-row gap-2">
                <Pressable
                  disabled={acceptReservation.isPending}
                  onPress={(e) => {
                    e.stopPropagation();
                    acceptReservation.mutate(d.pending!.id);
                  }}
                  className="h-[34px] flex-1 items-center justify-center rounded-[15px] bg-[#F0FDF4]"
                >
                  <Text
                    variant="plain"
                    className="font-inter-semibold"
                    style={{ color: '#00C950', fontSize: 11, lineHeight: 15 }}
                  >
                    Aceitar
                  </Text>
                </Pressable>
                <Pressable
                  disabled={rejectReservation.isPending}
                  onPress={(e) => {
                    e.stopPropagation();
                    rejectReservation.mutate(d.pending!.id);
                  }}
                  className="h-[34px] flex-1 items-center justify-center rounded-[15px] bg-[#FEF2F2]"
                >
                  <Text
                    variant="plain"
                    className="font-inter-semibold"
                    style={{ color: '#FB2C36', fontSize: 11, lineHeight: 15 }}
                  >
                    Rejeitar
                  </Text>
                </Pressable>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    router.push(`/(host)/reservation/${d.pending!.id}` as Href);
                  }}
                  className="h-[34px] w-[34px] items-center justify-center rounded-[15px] border border-surface-border"
                >
                  <Ionicons name="chevron-forward" size={14} color="#525252" />
                </Pressable>
              </View>
            </Pressable>
          ) : (
            <View className="rounded-[15px] border border-[#F5F5F5] bg-surface px-4 py-6">
              <Text variant="p-s" className="text-center text-ink-soft">
                Sem pedidos pendentes
              </Text>
            </View>
          )}
        </View>

        <View>
          <Text className="mb-3 font-manrope-bold text-[13px] text-ink">
            Atividade recente
          </Text>
          <View className="overflow-hidden rounded-[15px] border border-[#F5F5F5]">
            {d.activity.length === 0 ? (
              <View className="px-4 py-6">
                <Text variant="p-s" className="text-center text-ink-soft">
                  Sem atividade recente
                </Text>
              </View>
            ) : (
              d.activity.map((item, i) => (
                <View
                  key={item.id}
                  className={`flex-row items-center gap-3 px-4 py-3 ${
                    i < d.activity.length - 1 ? 'border-b border-[#F5F5F5]' : ''
                  }`}
                >
                  <View
                    className="h-[34px] w-[34px] items-center justify-center rounded-full"
                    style={{ backgroundColor: item.bg }}
                  >
                    <Ionicons name={item.icon} size={15} color={item.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-inter-semibold text-[11px] text-ink">
                      {item.title}
                    </Text>
                    <Text className="font-inter text-[10px] text-ink-soft">
                      {item.detail}
                    </Text>
                  </View>
                  <Text className="font-inter text-[10px] text-ink-soft">
                    {item.time}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </View>
    </Screen>
  );
}
