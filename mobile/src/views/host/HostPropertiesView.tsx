import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';

import { FilterChips, HostScreenHeader } from '@/components/host/HostChrome';
import { Screen, Text } from '@/components/ui';
import {
  propertyStatusStyle,
  type PropertyStatus,
} from '@/data/host.mock';
import { useHostProperties } from '@/hooks/useHost';
import { colors } from '@/theme/colors';

const chips = [
  { id: 'all', label: 'Todas' },
  { id: 'published', label: 'Publicadas' },
  { id: 'draft', label: 'Rascunho' },
  { id: 'hidden', label: 'Ocultas' },
  { id: 'review', label: 'Em revisão' },
];

const PLACEHOLDER =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=400&fit=crop';

export function HostPropertiesView() {
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const propertiesQuery = useHostProperties(
    query.trim() ? { search: query.trim() } : undefined,
  );

  const list = useMemo(() => {
    const rows = propertiesQuery.data ?? [];
    return rows.filter((p) => {
      const matchFilter =
        filter === 'all' ||
        p.status === filter ||
        (filter === 'review' && p.status === 'review');
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q);
      return matchFilter && matchQuery;
    });
  }, [filter, query, propertiesQuery.data]);

  return (
    <Screen
      scroll
      keyboard={false}
      className="bg-[#FCFCFC]"
      contentClassName="pb-8"
    >
      <HostScreenHeader
        title="Propriedades"
        right={
          <Pressable onPress={() => router.push('/(host)/add-property')}>
            <Text variant="label-s" className="text-brand">
              Adicionar
            </Text>
          </Pressable>
        }
      />

      <View className="gap-4 px-6 pt-4">
        <View className="h-[54px] flex-row items-center gap-3 rounded-xl border border-surface-border bg-surface px-4">
          <Ionicons name="search" size={20} color={colors.ink.secondary} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Nome ou localização"
            placeholderTextColor={colors.ink.soft}
            className="flex-1 font-inter text-p-s text-ink"
          />
        </View>
      </View>
      <View className="mt-4">
        <FilterChips chips={chips} value={filter} onChange={setFilter} />
      </View>

      <View className="mt-6 gap-3 px-6">
        {propertiesQuery.isLoading ? (
          <ActivityIndicator color={colors.brand.DEFAULT} />
        ) : (
          <>
            <Text className="font-inter text-[11px] text-ink-soft">
              {list.length} propriedades
            </Text>
            {list.map((p) => {
              const style = propertyStatusStyle[p.status as PropertyStatus];
              return (
                <Pressable
                  key={p.id}
                  onPress={() => router.push(`/(host)/property/${p.id}`)}
                  className="overflow-hidden rounded-[15px] border border-[#F5F5F5] bg-surface shadow-sm"
                >
                  <View className="relative h-[135px]">
                    <Image
                      source={{ uri: p.coverImageUrl ?? PLACEHOLDER }}
                      style={{ width: '100%', height: 135 }}
                      contentFit="cover"
                    />
                    <View className="absolute inset-0 bg-black/40" />
                    <View
                      className="absolute right-3 top-3 rounded-full px-2 py-1"
                      style={{ backgroundColor: style.bg }}
                    >
                      <Text
                        className="font-inter-semibold text-[10px]"
                        style={{ color: style.text }}
                      >
                        {p.statusLabel}
                      </Text>
                    </View>
                    <View className="absolute bottom-3 left-3">
                      <Text className="font-inter-semibold text-[13px] text-white">
                        {p.name}
                      </Text>
                      <Text className="font-inter-semibold text-[11px] text-white/70">
                        {p.location}
                      </Text>
                    </View>
                  </View>
                  <View className="flex-row border-b border-[#F5F5F5] py-3">
                    {[
                      { v: String(p.rooms), l: 'Quartos' },
                      { v: String(p.reservations), l: 'Reservas' },
                      { v: p.revenue, l: 'Receita' },
                    ].map((m, i) => (
                      <View
                        key={m.l}
                        className={`flex-1 items-center ${
                          i < 2 ? 'border-r border-surface-border' : ''
                        }`}
                      >
                        <Text className="font-inter-semibold text-[13px] text-ink">
                          {m.v}
                        </Text>
                        <Text className="font-inter-semibold text-[10px] text-ink-soft">
                          {m.l}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <View className="flex-row">
                    {[
                      { icon: 'create-outline' as const, label: 'Editar' },
                      { icon: 'bed-outline' as const, label: 'Quartos' },
                      {
                        icon:
                          p.status === 'hidden'
                            ? ('eye-outline' as const)
                            : ('eye-off-outline' as const),
                        label: p.status === 'hidden' ? 'Publicar' : 'Ocultar',
                      },
                      {
                        icon: 'trash-outline' as const,
                        label: 'Eliminar',
                        danger: true,
                      },
                    ].map((a, i) => (
                      <Pressable
                        key={a.label}
                        className={`h-[38px] flex-1 flex-row items-center justify-center gap-1 ${
                          i < 3 ? 'border-r border-[#F5F5F5]' : ''
                        }`}
                      >
                        <Ionicons
                          name={a.icon}
                          size={14}
                          color={a.danger ? '#FB2C36' : '#A1A1A1'}
                        />
                        <Text
                          className={`font-inter-semibold text-[11px] ${
                            a.danger ? 'text-[#FB2C36]' : 'text-ink-secondary'
                          }`}
                        >
                          {a.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </Pressable>
              );
            })}
          </>
        )}
      </View>
    </Screen>
  );
}
