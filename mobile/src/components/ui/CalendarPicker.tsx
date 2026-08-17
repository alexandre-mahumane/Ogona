import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { colors } from '@/theme/colors';

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
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

export function toIsoDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDaysIso(isoDate: string, days: number) {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toIsoDate(d);
}

export function daysBetween(start: string, end: string) {
  const a = new Date(`${start}T00:00:00`).getTime();
  const b = new Date(`${end}T00:00:00`).getTime();
  return Math.max(1, Math.round((b - a) / 86_400_000));
}

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month - 1, 1);
  const startWeekday = first.getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: Array<{ iso: string | null; day: number | null; current: boolean }> =
    [];

  for (let i = 0; i < startWeekday; i += 1) {
    cells.push({ iso: null, day: null, current: false });
  }

  for (let d = 1; d <= daysInMonth; d += 1) {
    const iso = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ iso, day: d, current: true });
  }

  while (cells.length % 7 !== 0) {
    cells.push({ iso: null, day: null, current: false });
  }

  return cells;
}

type Props = {
  visible: boolean;
  title: string;
  mode?: 'single' | 'range';
  startDate: string;
  endDate?: string;
  minDate?: string;
  onClose: () => void;
  onConfirm: (start: string, end?: string) => void;
};

export function CalendarPicker({
  visible,
  title,
  mode = 'single',
  startDate,
  endDate,
  minDate,
  onClose,
  onConfirm,
}: Props) {
  const min = minDate ?? toIsoDate();
  const initial = startDate || min;
  const parsed = new Date(`${initial}T00:00:00`);
  const [year, setYear] = useState(parsed.getFullYear());
  const [month, setMonth] = useState(parsed.getMonth() + 1);
  const [start, setStart] = useState(initial);
  const [end, setEnd] = useState(endDate);

  useEffect(() => {
    if (!visible) return;
    const next = startDate || min;
    const d = new Date(`${next}T00:00:00`);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
    setStart(next);
    setEnd(endDate);
  }, [visible, startDate, endDate, min]);

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  };

  const onSelect = (iso: string) => {
    if (iso < min) return;
    if (mode === 'single') {
      setStart(iso);
      setEnd(undefined);
      return;
    }
    if (!start || end) {
      setStart(iso);
      setEnd(undefined);
      return;
    }
    if (iso < start) {
      setStart(iso);
      return;
    }
    setEnd(iso);
  };

  const canConfirm = mode === 'single' ? Boolean(start) : Boolean(start && end);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-end bg-black/50"
      >
        <Pressable
          onPress={() => undefined}
          className="w-full rounded-t-[24px] bg-surface px-5 pb-8 pt-4"
        >
          <View className="mb-4 items-center">
            <View className="mb-3 h-1 w-10 rounded-full bg-surface-border" />
            <Text variant="h5">{title}</Text>
            {mode === 'range' ? (
              <Text variant="p-s" className="mt-1 text-ink-soft">
                {start
                  ? end
                    ? `${start} → ${end}`
                    : 'Escolha a data de check-out'
                  : 'Escolha a data de check-in'}
              </Text>
            ) : null}
          </View>

          <View className="mb-3 flex-row items-center justify-between">
            <Pressable
              onPress={() => shiftMonth(-1)}
              className="h-10 w-10 items-center justify-center rounded-full bg-surface-muted"
            >
              <Ionicons
                name="chevron-back"
                size={18}
                color={colors.ink.secondary}
              />
            </Pressable>
            <Text className="font-manrope-bold text-[15px] text-ink">
              {MONTHS[month - 1]} {year}
            </Text>
            <Pressable
              onPress={() => shiftMonth(1)}
              className="h-10 w-10 items-center justify-center rounded-full bg-surface-muted"
            >
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.ink.secondary}
              />
            </Pressable>
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
              if (!cell.iso || cell.day == null) {
                return <View key={`empty-${index}`} className="h-11 w-[14.28%]" />;
              }
              const disabled = cell.iso < min;
              const isStart = cell.iso === start;
              const isEnd = cell.iso === end;
              const inRange =
                mode === 'range' &&
                start &&
                end &&
                cell.iso > start &&
                cell.iso < end;
              const selected = isStart || isEnd;

              return (
                <Pressable
                  key={cell.iso}
                  disabled={disabled}
                  onPress={() => onSelect(cell.iso!)}
                  className="h-11 w-[14.28%] items-center justify-center"
                >
                  <View
                    className={`h-10 w-10 items-center justify-center rounded-full ${
                      selected
                        ? 'bg-brand'
                        : inRange
                          ? 'bg-brand-soft'
                          : ''
                    }`}
                  >
                    <Text
                      variant="label-xs"
                      className={
                        disabled
                          ? 'text-surface-border'
                          : selected
                            ? 'text-white'
                            : inRange
                              ? 'text-brand'
                              : 'text-ink'
                      }
                    >
                      {cell.day}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View className="mt-5">
            <Button
              disabled={!canConfirm}
              onPress={() => {
                if (!start) return;
                onConfirm(start, mode === 'range' ? end : undefined);
              }}
            >
              Confirmar
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const HOURS = Array.from({ length: 17 }, (_, i) => {
  const hour = i + 6;
  return `${String(hour).padStart(2, '0')}:00`;
});

export function TimePickerModal({
  visible,
  title,
  value,
  onClose,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  value: string;
  onClose: () => void;
  onConfirm: (time: string) => void;
}) {
  const [selected, setSelected] = useState(value || '14:00');

  useEffect(() => {
    if (visible) setSelected(value || '14:00');
  }, [visible, value]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-end bg-black/50"
      >
        <Pressable
          onPress={() => undefined}
          className="w-full rounded-t-[24px] bg-surface px-5 pb-8 pt-4"
        >
          <View className="mb-4 items-center">
            <View className="mb-3 h-1 w-10 rounded-full bg-surface-border" />
            <Text variant="h5">{title}</Text>
          </View>
          <View className="flex-row flex-wrap gap-2 pb-4">
            {HOURS.map((hour) => {
              const active = selected === hour;
              return (
                <Pressable
                  key={hour}
                  onPress={() => setSelected(hour)}
                  className={`h-10 w-[22%] items-center justify-center rounded-full border ${
                    active
                      ? 'border-brand bg-brand'
                      : 'border-surface-border bg-surface'
                  }`}
                >
                  <Text
                    variant="label-xs"
                    className={active ? 'text-white' : 'text-ink-secondary'}
                  >
                    {hour}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Button onPress={() => onConfirm(selected)}>Confirmar</Button>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
