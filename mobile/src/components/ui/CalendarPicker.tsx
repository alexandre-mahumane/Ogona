import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';

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

export function eachIsoDay(start: string, endExclusive: string) {
  const days: string[] = [];
  let cursor = start;
  while (cursor < endExclusive) {
    days.push(cursor);
    cursor = addDaysIso(cursor, 1);
  }
  return days;
}

export function rangeHasUnavailable(
  start: string,
  endExclusive: string,
  unavailable: ReadonlySet<string>,
) {
  return eachIsoDay(start, endExclusive).some((day) => unavailable.has(day));
}

export function firstAvailableStay(
  minDate: string,
  nights: number,
  unavailable: ReadonlySet<string>,
  searchDays = 180,
) {
  let start = minDate;
  for (let i = 0; i < searchDays; i += 1) {
    const end = addDaysIso(start, Math.max(nights, 1));
    if (!unavailable.has(start) && !rangeHasUnavailable(start, end, unavailable)) {
      return { start, end };
    }
    start = addDaysIso(start, 1);
  }
  return { start: minDate, end: addDaysIso(minDate, Math.max(nights, 1)) };
}

export function addYearsIso(isoDate: string, years: number) {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setFullYear(d.getFullYear() + years);
  return toIsoDate(d);
}

/** YYYY-MM-DD → DD/MM/YYYY */
export function isoToDmy(iso: string) {
  const [year, month, day] = iso.split('-');
  if (!year || !month || !day) return '';
  return `${day}/${month}/${year}`;
}

/** DD/MM/YYYY → YYYY-MM-DD */
export function dmyToIso(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return '';
  return `${match[3]}-${match[2]}-${match[1]}`;
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
  maxDate?: string;
  unavailableDates?: readonly string[];
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
  maxDate,
  unavailableDates = [],
  onClose,
  onConfirm,
}: Props) {
  const fallback = maxDate ?? minDate ?? toIsoDate();
  const initial = startDate || fallback;
  const parsed = new Date(`${initial}T00:00:00`);
  const [year, setYear] = useState(parsed.getFullYear());
  const [month, setMonth] = useState(parsed.getMonth() + 1);
  const [start, setStart] = useState(initial);
  const [end, setEnd] = useState(endDate);
  const [pickingYear, setPickingYear] = useState(false);

  useEffect(() => {
    if (!visible) return;
    const next = startDate || fallback;
    const d = new Date(`${next}T00:00:00`);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
    setStart(next);
    setEnd(endDate);
    setPickingYear(false);
  }, [visible, startDate, endDate, fallback]);

  const minYear = minDate ? Number(minDate.slice(0, 4)) : year - 100;
  const maxYear = maxDate ? Number(maxDate.slice(0, 4)) : year + 15;
  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = maxYear; y >= minYear; y -= 1) list.push(y);
    return list;
  }, [minYear, maxYear]);

  const unavailable = useMemo(
    () => new Set(unavailableDates),
    [unavailableDates],
  );

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const isDisabled = (iso: string) =>
    Boolean(
      (minDate && iso < minDate) ||
        (maxDate && iso > maxDate) ||
        unavailable.has(iso),
    );

  const shiftMonth = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1);
    const nextYear = d.getFullYear();
    if (nextYear < minYear || nextYear > maxYear) return;
    setYear(nextYear);
    setMonth(d.getMonth() + 1);
  };

  const onSelect = (iso: string) => {
    if (isDisabled(iso)) return;
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
    if (rangeHasUnavailable(start, iso, unavailable)) return;
    setEnd(iso);
  };

  const stayBlocked =
    Boolean(start && unavailable.has(start)) ||
    (mode === 'range' && start && end
      ? rangeHasUnavailable(start, end, unavailable)
      : false);

  const canConfirm =
    (mode === 'single' ? Boolean(start) : Boolean(start && end)) && !stayBlocked;

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
              onPress={() => (pickingYear ? undefined : shiftMonth(-1))}
              className="h-10 w-10 items-center justify-center rounded-full bg-surface-muted"
            >
              <Ionicons
                name="chevron-back"
                size={18}
                color={colors.ink.secondary}
              />
            </Pressable>
            <Pressable
              onPress={() => setPickingYear((open) => !open)}
              className="flex-row items-center gap-1 px-2 py-1"
            >
              <Text className="font-manrope-bold text-[15px] text-ink">
                {pickingYear ? 'Escolher ano' : `${MONTHS[month - 1]} ${year}`}
              </Text>
              <Ionicons
                name={pickingYear ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={colors.ink.secondary}
              />
            </Pressable>
            <Pressable
              onPress={() => (pickingYear ? undefined : shiftMonth(1))}
              className="h-10 w-10 items-center justify-center rounded-full bg-surface-muted"
            >
              <Ionicons
                name="chevron-forward"
                size={18}
                color={colors.ink.secondary}
              />
            </Pressable>
          </View>

          {pickingYear ? (
            <ScrollView
              className="max-h-[280px]"
              showsVerticalScrollIndicator={false}
            >
              <View className="flex-row flex-wrap">
                {years.map((y) => {
                  const active = y === year;
                  return (
                    <Pressable
                      key={y}
                      onPress={() => {
                        setYear(y);
                        setPickingYear(false);
                      }}
                      className="h-12 w-1/4 items-center justify-center"
                    >
                      <View
                        className={`h-10 w-[70px] items-center justify-center rounded-full ${
                          active ? 'bg-brand' : ''
                        }`}
                      >
                        <Text
                          variant="label-s"
                          className={active ? '!text-white' : 'text-ink'}
                        >
                          {y}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          ) : (
            <>
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
                  const booked = unavailable.has(cell.iso);
                  const disabled = isDisabled(cell.iso);
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
                              : booked
                                ? 'bg-surface-muted'
                                : ''
                        }`}
                      >
                        <Text
                          variant="label-xs"
                          className={
                            booked
                              ? 'text-ink-soft line-through'
                              : disabled
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
            </>
          )}

          <View className="mt-5 gap-3">
            {unavailable.size > 0 ? (
              <Text variant="p-xs" className="text-center text-ink-soft">
                Datas riscadas já estão reservadas ou bloqueadas
              </Text>
            ) : null}
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
