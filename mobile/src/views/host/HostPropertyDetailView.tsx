import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, View } from 'react-native';

import { HostScreenHeader } from '@/components/host/HostChrome';
import { EditPencilIcon } from '@/components/icons/HomeIcons';
import { Screen, Text } from '@/components/ui';
import {
  propertyStatusStyle,
  roomStatusStyle,
} from '@/data/host.mock';
import { useDeleteProperty, useHostProperty } from '@/hooks/useHost';
import { colors } from '@/theme/colors';

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop';

export function HostPropertyDetailView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const propertyId = id ? String(id) : undefined;
  const propertyQuery = useHostProperty(propertyId);
  const deleteProperty = useDeleteProperty();
  const property = propertyQuery.data?.property;
  const rooms = propertyQuery.data?.rooms ?? [];

  if (propertyQuery.isLoading || !property) {
    return (
      <Screen contentClassName="items-center justify-center">
        {propertyQuery.isError ? (
          <Text variant="p-s">
            {propertyQuery.error instanceof Error
              ? propertyQuery.error.message
              : 'Propriedade não encontrada'}
          </Text>
        ) : (
          <ActivityIndicator color={colors.brand.DEFAULT} />
        )}
      </Screen>
    );
  }

  const status = propertyStatusStyle[property.status];
  const firstRoomId = rooms[0]?.id;

  return (
    <Screen scroll className="bg-[#FCFCFC]" contentClassName="pb-8">
      <HostScreenHeader
        title={property.name}
        onBack={() => router.back()}
        right={
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(host)/add-property',
                params: { propertyId: property.id },
              })
            }
            className="h-[30px] w-[30px] items-center justify-center rounded-[15px] bg-brand-soft"
          >
            <EditPencilIcon size={15} color={colors.brand.DEFAULT} />
          </Pressable>
        }
      />

      <View className="gap-6 px-6 pt-6">
        <View className="overflow-hidden rounded-[15px] border border-[#F5F5F5] bg-surface">
          <View className="relative h-[135px] bg-surface-muted">
            <Image
              source={{ uri: property.coverImageUrl ?? PLACEHOLDER }}
              style={{ width: '100%', height: 135 }}
              contentFit="cover"
            />
            <View
              className="absolute right-3 top-3 rounded-full px-3 py-1"
              style={{ backgroundColor: status.bg }}
            >
              <Text
                variant="label-xs"
                style={{ color: status.text }}
                className="font-inter-bold"
              >
                {property.statusLabel}
              </Text>
            </View>
          </View>
          <View className="flex-row gap-2 p-4">
            {[
              { value: String(property.rooms), label: 'Quartos' },
              { value: String(property.reservations), label: 'Reservas' },
              { value: property.revenue, label: 'Receita' },
            ].map((stat) => (
              <View
                key={stat.label}
                className="flex-1 items-center rounded-[15px] border border-[#F5F5F5] bg-surface px-3 py-3"
              >
                <Text
                  variant="plain"
                  className="font-manrope-bold"
                  style={{ color: '#CA3500', fontSize: 17, lineHeight: 22 }}
                >
                  {stat.value}
                </Text>
                <Text variant="p-xs" className="text-ink-soft">
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="overflow-hidden rounded-[15px] border border-[#F5F5F5] bg-surface">
          {[
            { label: 'Tipo', value: property.type },
            { label: 'Cidade', value: property.city },
            { label: 'Bairro', value: property.neighborhood },
            { label: 'Telefone', value: property.phone },
          ].map((row) => (
            <View
              key={row.label}
              className="flex-row items-center justify-between border-b border-[#F5F5F5] px-4 py-3"
            >
              <Text variant="p-s" className="text-ink-muted">
                {row.label}
              </Text>
              <Text variant="label-s">{row.value}</Text>
            </View>
          ))}
        </View>

        <View className="gap-2">
          <Text variant="label-s" className="font-inter-bold text-[13px]">
            Quartos
          </Text>
          {rooms.length === 0 ? (
            <Text variant="p-s" className="text-ink-soft">
              Ainda sem quartos
            </Text>
          ) : (
            rooms.map((room) => {
              const style = roomStatusStyle[room.status];
              return (
                <View
                  key={room.id}
                  className="flex-row items-center gap-3 rounded-[15px] border border-[#F5F5F5] bg-surface p-3"
                >
                  <View className="h-[34px] w-[34px] items-center justify-center rounded-[15px] bg-brand-soft">
                    <Ionicons name="bed-outline" size={16} color={colors.brand.DEFAULT} />
                  </View>
                  <View className="flex-1">
                    <Text variant="label-s" className="text-[13px]">
                      {room.name}
                    </Text>
                    <Text variant="p-xs" className="text-ink-soft">
                      {room.detail}
                    </Text>
                  </View>
                  <View
                    className="rounded-full px-2 py-0.5"
                    style={{ backgroundColor: style.bg }}
                  >
                    <Text
                      variant="label-xs"
                      style={{ color: style.text }}
                      className="font-inter-bold text-[10px]"
                    >
                      {room.statusLabel}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <View className="flex-row gap-2">
          <Pressable
            onPress={() => {
              if (!firstRoomId) {
                Alert.alert('Sem quartos', 'Adicione um quarto primeiro.');
                return;
              }
              router.push({
                pathname: '/(host)/calendar',
                params: { roomId: firstRoomId },
              });
            }}
            className="h-10 flex-1 items-center justify-center rounded-[15px] border border-brand bg-surface"
          >
            <Text variant="label-xs" className="text-brand">
              Gerir quartos
            </Text>
          </Pressable>
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(host)/add-room',
                params: { propertyId: property.id },
              })
            }
            className="h-10 flex-1 items-center justify-center rounded-[15px] bg-brand"
          >
            <Text variant="label-xs" className="text-white">
              Adicionar quarto
            </Text>
          </Pressable>
        </View>

        <View className="flex-row gap-2">
          <Pressable
            onPress={() =>
              router.push({
                pathname: '/(host)/calendar',
                params: firstRoomId ? { roomId: firstRoomId } : {},
              })
            }
            className="h-9 flex-1 flex-row items-center justify-center gap-1.5 rounded-[15px] border border-surface-border"
          >
            <Ionicons name="calendar-outline" size={13} color={colors.ink.secondary} />
            <Text variant="label-xs" className="font-inter-bold text-ink-secondary">
              Calendário
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              if (!firstRoomId) {
                Alert.alert('Sem quartos', 'Adicione um quarto primeiro.');
                return;
              }
              router.push({
                pathname: '/(host)/calendar',
                params: { roomId: firstRoomId },
              });
            }}
            className="h-9 flex-1 flex-row items-center justify-center gap-1.5 rounded-[15px] border border-surface-border"
          >
            <Ionicons name="checkmark-circle-outline" size={13} color={colors.ink.secondary} />
            <Text variant="label-xs" className="font-inter-bold text-ink-secondary">
              Disponibilidade
            </Text>
          </Pressable>
          <Pressable
            onPress={() => {
              if (!firstRoomId) {
                Alert.alert('Sem quartos', 'Adicione um quarto primeiro.');
                return;
              }
              router.push({
                pathname: '/(host)/calendar',
                params: { roomId: firstRoomId },
              });
            }}
            className="h-9 flex-1 flex-row items-center justify-center gap-1.5 rounded-[15px] border border-surface-border"
          >
            <Ionicons name="cash-outline" size={13} color={colors.ink.secondary} />
            <Text variant="label-xs" className="font-inter-bold text-ink-secondary">
              Preços
            </Text>
          </Pressable>
        </View>

        <Pressable
          onPress={() =>
            Alert.alert(
              'Eliminar propriedade',
              `Tem a certeza que quer eliminar "${property.name}"? Esta acção não pode ser revertida.`,
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Eliminar',
                  style: 'destructive',
                  onPress: () =>
                    deleteProperty.mutate(property.id, {
                      onSuccess: () => router.replace('/(host)/(tabs)/properties'),
                      onError: (error) =>
                        Alert.alert(
                          'Não foi possível eliminar',
                          error instanceof Error ? error.message : 'Tente novamente.',
                        ),
                    }),
                },
              ],
            )
          }
          className="h-12 flex-row items-center justify-center gap-2 rounded-[15px] border"
          style={{ borderColor: '#CA3500' }}
        >
          <Ionicons name="trash-outline" size={15} color="#CA3500" />
          <Text
            variant="plain"
            className="font-inter-bold"
            style={{ color: '#CA3500', fontSize: 13, lineHeight: 18 }}
          >
            Eliminar propriedade
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}
