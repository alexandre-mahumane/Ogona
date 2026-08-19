import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  TextInput,
  View,
} from 'react-native';

import { HostScreenHeader } from '@/components/host/HostChrome';
import { Screen, Text } from '@/components/ui';
import {
  useBlockCalendarDates,
  useRoomCalendar,
  useSetCalendarPrice,
  useUnblockCalendarDates,
} from '@/hooks/useHost';
import { colors } from '@/theme/colors';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

type DayMark = 'checkin' | 'checkout' | 'booking' | 'blocked' | 'selected';

const fallbackMarks: Record<number, DayMark> = {
  3: 'checkout',
  6: 'selected',
  8: 'checkout',
  10: 'checkin',
  14: 'blocked',
  15: 'blocked',
  16: 'blocked',
  20: 'checkin',
};

const markDot: Record<DayMark, string> = {
  checkin: '#00C950',
  checkout: '#FB2C36',
  booking: '#FF6900',
  blocked: '#EF4444',
  selected: '#FFFFFF',
};

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month - 1, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevMonthDays = new Date(year, month - 1, 0).getDate();

  const cells: Array<{ day: number | null; fromPrev?: boolean; iso?: string }> =
    [];

  for (let i = startWeekday - 1; i >= 0; i -= 1) {
    cells.push({ day: prevMonthDays - i, fromPrev: true });
  }

  for (let d = 1; d <= daysInMonth; d += 1) {
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, iso });
  }

  while (cells.length % 7 !== 0) cells.push({ day: null });
  return cells;
}

function statusToMark(status: string): DayMark | undefined {
  if (status === 'blocked') return 'blocked';
  if (status === 'booked') return 'booking';
  return undefined;
}

const monthNames = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export function HostCalendarView() {
  const { roomId } = useLocalSearchParams<{ roomId?: string }>();
  const resolvedRoomId = roomId ? String(roomId) : undefined;

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [mode, setMode] = useState<'week' | 'month'>('month');
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const [priceOpen, setPriceOpen] = useState(false);
  const [priceValue, setPriceValue] = useState('');

  const calendarQuery = useRoomCalendar(resolvedRoomId, year, month);
  const blockDates = useBlockCalendarDates();
  const unblockDates = useUnblockCalendarDates();
  const setPrice = useSetCalendarPrice();
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const marksByDay = useMemo(() => {
    const map: Record<number, DayMark> = {};
    if (calendarQuery.data?.days) {
      for (const day of calendarQuery.data.days) {
        const dayNum = Number(day.date.slice(8, 10));
        const mark = statusToMark(day.status);
        if (mark) map[dayNum] = mark;
      }
      return map;
    }
    if (!resolvedRoomId) return fallbackMarks;
    return map;
  }, [calendarQuery.data, resolvedRoomId]);

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
    setRange({});
  };

  const selectedRange = () => {
    if (!range.from) return null;
    return { from: range.from, to: range.to ?? range.from };
  };

  const onSelectDay = (iso?: string) => {
    if (!iso) return;
    if (!range.from || (range.from && range.to)) {
      setRange({ from: iso });
      return;
    }
    if (iso < range.from) setRange({ from: iso, to: range.from });
    else setRange({ from: range.from, to: iso });
  };

  const needRoomAndRange = (action: string) => {
    if (!resolvedRoomId) {
      Alert.alert('Calendário', 'Abra o calendário a partir de um quarto.');
      return null;
    }
    const next = selectedRange();
    if (!next) {
      Alert.alert(action, 'Seleccione um dia ou um intervalo no calendário.');
      return null;
    }
    return next;
  };

  const runBlock = () => {
    const next = needRoomAndRange('Bloquear datas');
    if (!next || !resolvedRoomId) return;
    blockDates.mutate(
      { roomId: resolvedRoomId, ...next },
      {
        onSuccess: () => {
          setRange({});
          Alert.alert('Datas bloqueadas');
        },
        onError: (error) =>
          Alert.alert(
            'Não foi possível bloquear',
            error instanceof Error ? error.message : 'Tente novamente.',
          ),
      },
    );
  };

  const runUnblock = () => {
    const next = needRoomAndRange('Desbloquear datas');
    if (!next || !resolvedRoomId) return;
    unblockDates.mutate(
      { roomId: resolvedRoomId, ...next },
      {
        onSuccess: () => {
          setRange({});
          Alert.alert('Datas desbloqueadas');
        },
        onError: (error) =>
          Alert.alert(
            'Não foi possível desbloquear',
            error instanceof Error ? error.message : 'Tente novamente.',
          ),
      },
    );
  };

  const submitPrice = (amount: number) => {
    const next = selectedRange();
    if (!resolvedRoomId || !next) return;
    setPrice.mutate(
      { roomId: resolvedRoomId, ...next, amount },
      {
        onSuccess: () => {
          setRange({});
          setPriceOpen(false);
          setPriceValue('');
          Alert.alert('Preço actualizado');
        },
        onError: (error) =>
          Alert.alert(
            'Não foi possível alterar o preço',
            error instanceof Error ? error.message : 'Tente novamente.',
          ),
      },
    );
  };

  const runSetPrice = () => {
    const next = needRoomAndRange('Alterar preço');
    if (!next) return;
    if (Platform.OS === 'ios') {
      Alert.prompt('Novo preço (MT)', 'Valor por noite para as datas seleccionadas', (text) => {
        const amount = Number(text);
        if (!Number.isFinite(amount) || amount <= 0) {
          Alert.alert('Preço inválido');
          return;
        }
        submitPrice(amount);
      });
      return;
    }
    setPriceOpen(true);
  };

  const runCloseRoom = () => {
    if (!resolvedRoomId) {
      Alert.alert('Calendário', 'Abra o calendário a partir de um quarto.');
      return;
    }
    const last = new Date(year, month, 0).getDate();
    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const to = `${year}-${String(month).padStart(2, '0')}-${String(last).padStart(2, '0')}`;
    Alert.alert(
      'Fechar quarto',
      `Bloquear ${monthNames[month - 1]} ${year} neste quarto?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Fechar',
          style: 'destructive',
          onPress: () =>
            blockDates.mutate(
              { roomId: resolvedRoomId, from, to },
              {
                onSuccess: () => Alert.alert('Quarto fechado neste mês'),
                onError: (error) =>
                  Alert.alert(
                    'Não foi possível fechar',
                    error instanceof Error ? error.message : 'Tente novamente.',
                  ),
              },
            ),
        },
      ],
    );
  };

  const isInRange = (iso?: string) => {
    if (!iso || !range.from) return false;
    const end = range.to ?? range.from;
    return iso >= range.from && iso <= end;
  };

  return (
    <Screen scroll className="bg-[#FCFCFC]" contentClassName="pb-8">
      <HostScreenHeader
        title="Calendário"
        onBack={() => router.back()}
      />

      <View className="gap-6 px-6 pt-6">
        <View className="rounded-xl border-b border-[#F5F5F5] bg-surface px-4 py-3">
          <View className="mb-3 flex-row items-center justify-between">
            <Pressable onPress={() => shiftMonth(-1)}>
              <Ionicons name="chevron-back" size={20} color={colors.ink.secondary} />
            </Pressable>
            <Text className="font-manrope-bold text-[13px] text-ink">
              {monthNames[month - 1]} {year}
            </Text>
            <Pressable onPress={() => shiftMonth(1)}>
              <Ionicons name="chevron-forward" size={20} color={colors.ink.secondary} />
            </Pressable>
          </View>

          {resolvedRoomId && calendarQuery.isLoading ? (
            <ActivityIndicator color={colors.brand.DEFAULT} className="my-4" />
          ) : null}

          <View className="mb-3 flex-row gap-2">
            {(['week', 'month'] as const).map((id) => {
              const active = mode === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => setMode(id)}
                  className={`h-7 flex-1 items-center justify-center rounded-[15px] border ${
                    active
                      ? 'border-brand bg-brand'
                      : 'border-surface-border bg-surface'
                  }`}
                >
                  <Text
                    variant="label-xs"
                    className={active ? 'text-white' : 'text-ink-secondary'}
                  >
                    {id === 'week' ? 'Semana' : 'Mês'}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="mb-1 flex-row">
            {WEEKDAYS.map((day) => (
              <View key={day} className="flex-1 items-center py-1">
                <Text variant="label-xs" className="text-[10px] text-ink-soft">
                  {day}
                </Text>
              </View>
            ))}
          </View>

          <View className="flex-row flex-wrap">
            {cells.map((cell, index) => {
              if (cell.day == null) {
                return <View key={`empty-${index}`} className="h-11 w-[14.28%]" />;
              }
              const isCurrentMonth = !cell.fromPrev;
              const mark = isCurrentMonth ? marksByDay[cell.day] : undefined;
              const picked = isCurrentMonth && isInRange(cell.iso);
              const selected = mark === 'selected' || picked;
              const blocked = mark === 'blocked';
              const highlight =
                mark === 'checkin' || mark === 'checkout' || mark === 'booking';

              return (
                <Pressable
                  key={`${cell.day}-${index}`}
                  onPress={() => isCurrentMonth && onSelectDay(cell.iso)}
                  className="h-11 w-[14.28%] items-center justify-center"
                >
                  <View
                    className={`h-11 w-11 items-center justify-center rounded-[15px] ${
                      selected
                        ? 'bg-brand'
                        : blocked
                          ? 'bg-[#FEF2F2]'
                          : highlight
                            ? 'bg-brand-soft'
                            : ''
                    }`}
                  >
                    <Text
                      variant="label-xs"
                      className={
                        selected
                          ? 'text-white'
                          : blocked
                            ? 'text-[#FB2C36]'
                            : highlight
                              ? 'text-brand'
                              : isCurrentMonth
                                ? 'text-ink'
                                : 'text-surface-border'
                      }
                    >
                      {cell.day}
                    </Text>
                    {mark ? (
                      <View
                        className="absolute bottom-1 h-1 w-1 rounded-full"
                        style={{ backgroundColor: markDot[mark] }}
                      />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-2 flex-row flex-wrap justify-center gap-3">
            {[
              { color: '#00C950', label: 'Check-in' },
              { color: '#FB2C36', label: 'Check-out' },
              { color: '#FF6900', label: 'Reserva' },
              { color: '#EF4444', label: 'Bloqueado' },
            ].map((item) => (
              <View key={item.label} className="flex-row items-center gap-1">
                <View
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <Text variant="p-xs" className="text-[10px] text-ink-soft">
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View className="gap-3">
          <Text
            variant="label-xs"
            className="uppercase tracking-widest text-ink-secondary"
          >
            Ações
          </Text>
          <View className="flex-row flex-wrap gap-2">
            <Pressable
              onPress={runBlock}
              className="h-16 w-[48%] flex-row items-center gap-2 rounded-[15px] bg-[#FEF2F2] px-3"
            >
              <Ionicons name="lock-closed-outline" size={16} color="#FB2C36" />
              <Text
                variant="plain"
                className="font-inter-semibold"
                style={{ color: '#FB2C36', fontSize: 13 }}
              >
                Bloquear datas
              </Text>
            </Pressable>
            <Pressable
              onPress={runUnblock}
              className="h-16 w-[48%] flex-row items-center gap-2 rounded-[15px] bg-[#F0FDF4] px-3"
            >
              <Ionicons name="lock-open-outline" size={16} color="#00C950" />
              <Text
                variant="plain"
                className="flex-1 font-inter-semibold"
                style={{ color: '#00C950', fontSize: 13 }}
              >
                Desbloquear datas
              </Text>
            </Pressable>
            <Pressable
              onPress={runSetPrice}
              className="h-11 w-[48%] flex-row items-center gap-2 rounded-[15px] bg-[#EFF6FF] px-3"
            >
              <Ionicons name="cash-outline" size={16} color="#2B7FFF" />
              <Text
                variant="plain"
                className="font-inter-semibold"
                style={{ color: '#2B7FFF', fontSize: 13 }}
              >
                Alterar preço
              </Text>
            </Pressable>
            <Pressable
              onPress={runCloseRoom}
              className="h-11 w-[48%] flex-row items-center gap-2 rounded-[15px] bg-[#FEFCE8] px-3"
            >
              <Ionicons name="close-circle-outline" size={16} color="#F0B100" />
              <Text
                variant="plain"
                className="font-inter-semibold"
                style={{ color: '#F0B100', fontSize: 13 }}
              >
                Fechar quarto
              </Text>
            </Pressable>
          </View>
          {priceOpen ? (
            <View className="gap-2 rounded-[15px] border border-surface-border bg-surface p-3">
              <Text variant="label-s">Novo preço (MT / noite)</Text>
              <TextInput
                value={priceValue}
                onChangeText={setPriceValue}
                keyboardType="numeric"
                placeholder="3200"
                placeholderTextColor={colors.ink.soft}
                className="h-11 rounded-xl border border-surface-border px-3 font-inter text-ink"
              />
              <View className="flex-row gap-2">
                <Pressable
                  onPress={() => {
                    setPriceOpen(false);
                    setPriceValue('');
                  }}
                  className="h-10 flex-1 items-center justify-center rounded-[15px] border border-surface-border"
                >
                  <Text variant="label-s">Cancelar</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    const amount = Number(priceValue);
                    if (!Number.isFinite(amount) || amount <= 0) {
                      Alert.alert('Preço inválido');
                      return;
                    }
                    submitPrice(amount);
                  }}
                  className="h-10 flex-1 items-center justify-center rounded-[15px] bg-brand"
                >
                  <Text variant="label-s" className="text-white">
                    Guardar
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}
