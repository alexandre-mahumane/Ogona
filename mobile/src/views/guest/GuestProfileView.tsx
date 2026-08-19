import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ActivityIndicator, Pressable, View } from 'react-native';

import { Screen, Text } from '@/components/ui';
import { guestHome } from '@/data/guest.mock';
import { useAvatar } from '@/hooks/useAvatar';
import { useLogoutMutation, useMeQuery } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/auth.store';
import { colors } from '@/theme/colors';

const menu = [
  { icon: 'person-outline' as const, label: 'Dados pessoais' },
  { icon: 'lock-closed-outline' as const, label: 'Segurança' },
  { icon: 'notifications-outline' as const, label: 'Notificações' },
  { icon: 'help-circle-outline' as const, label: 'Ajuda' },
];

export function GuestProfileView() {
  const me = useMeQuery();
  const storeUser = useAuthStore((s) => s.user);
  const user = me.data ?? storeUser;
  const logout = useLogoutMutation();
  const { changeAvatar, busy } = useAvatar();
  const canSwitchToHost = user?.role === 'host';

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => router.replace('/(auth)/login'),
    });
  };

  return (
    <Screen
      scroll
      keyboard={false}
      className="bg-[#FCFCFC]"
      contentClassName="pb-8"
    >
      <View className="border-b border-[#F5F5F5] bg-surface px-6 pb-4 pt-5">
        <Text variant="h5">Perfil</Text>
      </View>

      <View className="gap-6 px-6 pt-6">
        <View className="items-center gap-4">
          <Pressable onPress={() => void changeAvatar()} disabled={busy} className="relative">
            <View className="h-[120px] w-[120px] overflow-hidden rounded-full border border-surface-border">
              <Image
                source={{
                  uri: user?.photoUrl ?? guestHome.avatar,
                }}
                style={{ width: 120, height: 120 }}
              />
              {busy ? (
                <View className="absolute inset-0 items-center justify-center bg-black/40">
                  <ActivityIndicator color="#FFFFFF" />
                </View>
              ) : null}
            </View>
            <View className="absolute bottom-2 right-0 h-8 w-8 items-center justify-center rounded-full border border-[#FFD6A8] bg-brand-soft">
              <Ionicons name="camera" size={16} color={colors.brand.DEFAULT} />
            </View>
          </Pressable>
          <View className="items-center gap-1">
            <Text className="font-inter-medium text-h5 text-ink-secondary">
              {user?.name ?? 'Hóspede'}
            </Text>
            <Text className="font-inter text-p-xs text-ink-muted">
              {user?.email || user?.phone || ''}
            </Text>
          </View>
        </View>

        <View className="gap-2">
          <Text className="font-inter-semibold text-[10px] uppercase tracking-widest text-ink-soft">
            Trocar modo
          </Text>
          <View className="h-11 flex-row overflow-hidden rounded-[15px] border border-surface-border bg-surface p-1">
            <View className="flex-1 items-center justify-center rounded-[12px] bg-brand">
              <Text className="font-inter-semibold text-[12px] text-white">
                Hóspede
              </Text>
            </View>
            <Pressable
              onPress={() => {
                if (canSwitchToHost) router.replace('/(host)/(tabs)');
              }}
              className="flex-1 items-center justify-center rounded-[12px]"
            >
              <Text className="font-inter-semibold text-[12px] text-ink-secondary">
                Anfitrião
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="gap-1">
          {menu.map((item) => (
            <Pressable
              key={item.label}
              className="mb-1 flex-row items-center justify-between rounded-[15px] border border-[#F5F5F5] bg-surface px-4 py-3.5"
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name={item.icon} size={16} color="#A1A1A1" />
                <Text className="font-inter-semibold text-[13px] text-ink">
                  {item.label}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={15} color="#E5E5E5" />
            </Pressable>
          ))}
          <Pressable
            onPress={handleLogout}
            className="mt-1 flex-row items-center justify-center gap-3 rounded-[15px] border border-[#FFC9C9] bg-[#FEF2F2] px-4 py-3.5"
          >
            <Ionicons name="log-out-outline" size={16} color="#FB2C36" />
            <Text className="font-inter-semibold text-[13px] text-[#FB2C36]">
              Terminar sessão
            </Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}
