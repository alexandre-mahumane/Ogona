import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';

import {
  GuestScreenHeader,
  PriceBreakdown,
  StickyFooter,
} from '@/components/guest/GuestChrome';
import { Button, DateField, KeyboardScrollView, Screen, Text } from '@/components/ui';
import {
  CalendarPicker,
  TimePickerModal,
  addDaysIso,
  daysBetween,
  eachIsoDay,
  firstAvailableStay,
  rangeHasUnavailable,
  toIsoDate,
} from '@/components/ui/CalendarPicker';
import {
  calcBookingTotal,
  type GuestRoomRate,
  type StayModality,
} from '@/data/guest.mock';
import { usePropertyDetail } from '@/hooks/useDiscover';
import {
  useCreateReservation,
  useReservationQuote,
  useRoomAvailability,
} from '@/hooks/useReservations';
import {
  isReservationDateConflict,
  unavailableDatesFromError,
} from '@/lib/api/calendar';
import { formatMt, toApiModality } from '@/lib/mappers/guest';
import { colors } from '@/theme/colors';

type Step = 'room' | 'dates' | 'confirm';

const CHIP_ORDER: StayModality[] = ['night', 'month', 'hour'];
const CHIP_SHORT: Record<StayModality, string> = {
  hour: 'Hora',
  night: 'Noite',
  month: 'Mês',
};
const INDIGO = '#615FFF';
const INDIGO_SOFT = '#EEF2FF';

const modalityLabels: Record<StayModality, string> = {
  hour: 'Por Hora',
  night: 'Por Noite',
  month: 'Por Mês',
};

function formatDisplayDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('pt-MZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function defaultCheckInDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toIsoDate(d);
}

function sortRates(rates: GuestRoomRate[]) {
  return [...rates].sort(
    (a, b) => CHIP_ORDER.indexOf(a.modality) - CHIP_ORDER.indexOf(b.modality),
  );
}

function limitsHint(rate: GuestRoomRate) {
  const unit =
    rate.modality === 'hour'
      ? 'horas'
      : rate.modality === 'month'
        ? 'meses'
        : 'noites';
  return `Mín. ${rate.min} · Máx. ${rate.max} ${unit}`;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      variant="plain"
      style={{
        color: colors.ink.secondary,
        fontSize: 14,
        lineHeight: 18,
        fontWeight: '500',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </Text>
  );
}

function Radio({ active }: { active: boolean }) {
  return (
    <View
      className="items-center justify-center"
      style={{
        width: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: active ? colors.brand.soft : '#FFFFFF',
        borderWidth: 1,
        borderColor: active ? colors.brand.DEFAULT : colors.surface.border,
      }}
    >
      {active ? (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: colors.brand.DEFAULT,
          }}
        />
      ) : null}
    </View>
  );
}

function Stepper({
  label,
  value,
  onChange,
  min = 1,
  max = 99,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <View className="gap-2">
      <Text
        variant="plain"
        className="font-inter-semibold"
        style={{ color: colors.ink.secondary, fontSize: 12, lineHeight: 16 }}
      >
        {label}
      </Text>
      <View
        className="h-[54px] flex-row items-center justify-between px-1"
        style={{
          borderRadius: 12,
          borderWidth: 1,
          borderColor: colors.surface.border,
          backgroundColor: '#FFFFFF',
        }}
      >
        <Pressable
          onPress={() => onChange(Math.max(min, value - 1))}
          className="h-12 w-12 items-center justify-center rounded-full"
        >
          <Ionicons name="remove" size={20} color={colors.ink.secondary} />
        </Pressable>
        <Text
          variant="plain"
          style={{ color: colors.ink.DEFAULT, fontSize: 14, lineHeight: 18 }}
        >
          {value}
        </Text>
        <Pressable
          onPress={() => onChange(Math.min(max, value + 1))}
          className="h-12 w-12 items-center justify-center rounded-full"
        >
          <Ionicons name="add" size={20} color={colors.ink.secondary} />
        </Pressable>
      </View>
    </View>
  );
}

function FooterButton({
  children,
  disabled,
  onPress,
}: {
  children: ReactNode;
  disabled?: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      disabled={disabled}
      onPress={onPress}
      className="h-[53px] rounded-[15px]"
    >
      {children}
    </Button>
  );
}

export function GuestBookView() {
  const { id, roomId } = useLocalSearchParams<{ id: string; roomId?: string }>();
  const propertyId = id ? String(id) : undefined;
  const propertyQuery = usePropertyDetail(propertyId);
  const listing = propertyQuery.data;
  const createReservation = useCreateReservation();

  const [step, setStep] = useState<Step>('room');
  const [selectedRoomId, setSelectedRoomId] = useState(roomId ? String(roomId) : '');
  const [modality, setModality] = useState<StayModality>('night');
  const [guests, setGuests] = useState(2);
  const [hours, setHours] = useState(2);
  const [months, setMonths] = useState(1);
  const [checkInDate, setCheckInDate] = useState(defaultCheckInDate);
  const [checkOutDate, setCheckOutDate] = useState(() =>
    addDaysIso(defaultCheckInDate(), 2),
  );
  const [startTime, setStartTime] = useState('14:00');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [conflictDates, setConflictDates] = useState<string[]>([]);

  useEffect(() => {
    if (!listing?.rooms.length) return;
    if (!selectedRoomId || !listing.rooms.some((r) => r.id === selectedRoomId)) {
      setSelectedRoomId(roomId ? String(roomId) : listing.rooms[0].id);
    }
  }, [listing, roomId, selectedRoomId]);

  const room = useMemo(
    () =>
      listing?.rooms.find((r) => r.id === selectedRoomId) ?? listing?.rooms[0],
    [listing?.rooms, selectedRoomId],
  );

  useEffect(() => {
    setConflictDates([]);
  }, [room?.id]);

  const availabilityFrom = toIsoDate();
  const availabilityTo = addDaysIso(availabilityFrom, 180);
  const availabilityQuery = useRoomAvailability(
    room?.id,
    availabilityFrom,
    availabilityTo,
  );
  const unavailableDates = useMemo(() => {
    return [
      ...new Set([
        ...(room?.unavailableDates ?? []),
        ...(availabilityQuery.data?.unavailableDates ?? []),
        ...conflictDates,
      ]),
    ].sort();
  }, [room?.unavailableDates, availabilityQuery.data?.unavailableDates, conflictDates]);
  const unavailable = useMemo(
    () => new Set(unavailableDates),
    [unavailableDates],
  );

  const stayNightsToBlock = () => {
    if (modality === 'hour') return [checkInDate];
    const end =
      modality === 'month'
        ? addDaysIso(checkInDate, months * 30)
        : checkOutDate;
    return eachIsoDay(checkInDate, end);
  };

  const rememberConflictDates = (error: unknown) => {
    const fromApi = unavailableDatesFromError(error);
    const nights =
      fromApi.length > 0
        ? fromApi
        : isReservationDateConflict(error)
          ? stayNightsToBlock()
          : [];
    if (nights.length === 0) return false;
    setConflictDates((prev) => [...new Set([...prev, ...nights])]);
    return true;
  };

  useEffect(() => {
    if (unavailable.size === 0) return;
    const stayLength =
      modality === 'night'
        ? Math.max(daysBetween(checkInDate, checkOutDate), 1)
        : modality === 'month'
          ? months * 30
          : 1;
    const stayEnd = addDaysIso(checkInDate, stayLength);
    const blocked =
      unavailable.has(checkInDate) ||
      rangeHasUnavailable(checkInDate, stayEnd, unavailable);
    if (!blocked) return;
    const next = firstAvailableStay(toIsoDate(), stayLength, unavailable);
    setCheckInDate(next.start);
    setCheckOutDate(next.end);
  }, [unavailableDates, modality, months]); // eslint-disable-line react-hooks/exhaustive-deps

  const availableModalities = room?.rates ?? [];
  const rate =
    availableModalities.find((r) => r.modality === modality) ??
    availableModalities[0];

  useEffect(() => {
    if (rate && rate.modality !== modality) {
      setModality(rate.modality);
    }
  }, [rate, modality]);

  useEffect(() => {
    if (!rate) return;
    if (rate.modality === 'hour') {
      setHours((h) => Math.min(Math.max(h, rate.min), rate.max));
    }
    if (rate.modality === 'month') {
      setMonths((m) => Math.min(Math.max(m, rate.min), rate.max));
    }
  }, [rate?.modality, rate?.min, rate?.max]);

  useEffect(() => {
    if (!room) return;
    setGuests((g) => Math.min(Math.max(1, g), room.guests));
  }, [room]);

  const nights = Math.max(daysBetween(checkInDate, checkOutDate), 1);
  const qty =
    modality === 'hour' ? hours : modality === 'month' ? months : nights;

  const qtyLabel =
    modality === 'hour'
      ? `${hours} hora${hours === 1 ? '' : 's'}`
      : modality === 'month'
        ? `${months} ${months === 1 ? 'mês' : 'meses'}`
        : `${nights} noite${nights === 1 ? '' : 's'}`;

  const quoteInput = useMemo(() => {
    if (!room?.id) return null;
    return {
      roomId: room.id,
      modality: toApiModality(modality),
      checkInDate,
      startTime: modality === 'hour' ? startTime : undefined,
      units: qty,
      guestCount: guests,
    };
  }, [room?.id, modality, checkInDate, startTime, qty, guests]);

  const quoteMutation = useReservationQuote();

  useEffect(() => {
    if (!quoteInput || step === 'room') return;
    quoteMutation.mutate(quoteInput, {
      onError: (error) => {
        rememberConflictDates(error);
      },
    });
  }, [quoteInput, step]); // eslint-disable-line react-hooks/exhaustive-deps -- mutate is stable enough; avoid re-quote loops

  const fallbackTotals = calcBookingTotal(rate?.price ?? 0, qty);
  const totals = quoteMutation.data
    ? {
        subtotal: quoteMutation.data.subtotalAmount,
        fee: quoteMutation.data.feeAmount,
        total: quoteMutation.data.totalAmount,
        unitPrice: quoteMutation.data.unitPrice,
      }
    : {
        ...fallbackTotals,
        unitPrice: rate?.price ?? 0,
      };

  const resolvedCheckOut =
    modality === 'night'
      ? checkOutDate
      : modality === 'month'
        ? addDaysIso(checkInDate, months * 30)
        : checkInDate;

  const periodLabel =
    modality === 'night'
      ? `${formatDisplayDate(checkInDate)} – ${formatDisplayDate(resolvedCheckOut)}`
      : modality === 'hour'
        ? `${formatDisplayDate(checkInDate)} · ${startTime}`
        : formatDisplayDate(checkInDate);

  const datesBlocked = rangeHasUnavailable(
    checkInDate,
    resolvedCheckOut === checkInDate
      ? addDaysIso(checkInDate, 1)
      : resolvedCheckOut,
    unavailable,
  );

  const title =
    step === 'room'
      ? 'Reservar quarto'
      : step === 'dates'
        ? 'Datas e detalhes'
        : 'Confirmar pedido';

  const goBack = () => {
    if (step === 'confirm') {
      setStep('dates');
      return;
    }
    if (step === 'dates') {
      setStep('room');
      return;
    }
    router.back();
  };

  const confirmBooking = () => {
    if (!quoteInput) return;
    setFormError(null);
    createReservation.mutate(quoteInput, {
      onSuccess: (reservation) => {
        if (reservation?.id) {
          router.replace({
            pathname: '/(guest)/book-success',
            params: { id: reservation.id },
          });
          return;
        }
        router.replace('/(guest)/book-success');
      },
      onError: (error) => {
        if (
          rememberConflictDates(error) ||
          isReservationDateConflict(error)
        ) {
          void availabilityQuery.refetch();
          setStep('dates');
          setCalendarOpen(true);
          return;
        }
        const message = error instanceof Error ? error.message : '';
        setFormError(message || 'Não foi possível criar a reserva');
      },
    });
  };

  if (propertyQuery.isLoading || !listing) {
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

  return (
    <Screen className="bg-surface" contentClassName="flex-1" keyboard>
      <GuestScreenHeader title={title} onBack={goBack} />

      <KeyboardScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-6 pb-8 pt-6"
        extraHeight={40}
      >
        {step === 'room' ? (
          <>
            <View className="gap-4">
              <SectionLabel>Quarto</SectionLabel>
              <View style={{ gap: 11 }}>
                {listing.rooms.map((r) => {
                  const active = r.id === selectedRoomId;
                  const from = r.rates.reduce(
                    (min, item) => (item.price < min ? item.price : min),
                    r.rates[0]?.price ?? 0,
                  );
                  return (
                    <Pressable
                      key={r.id}
                      onPress={() => setSelectedRoomId(r.id)}
                      className="flex-row items-start"
                      style={{
                        padding: 15,
                        gap: 11,
                        borderRadius: 15,
                        backgroundColor: active ? colors.brand.soft : '#FFFFFF',
                        borderWidth: 1,
                        borderColor: active
                          ? colors.brand.DEFAULT
                          : colors.surface.border,
                      }}
                    >
                      <Radio active={active} />
                      <View className="flex-1">
                        <Text
                          variant="plain"
                          className="font-inter-semibold"
                          style={{
                            color: colors.ink.DEFAULT,
                            fontSize: 14,
                            lineHeight: 18,
                          }}
                        >
                          {r.name}
                        </Text>
                        <Text
                          variant="plain"
                          className="font-inter-semibold"
                          style={{
                            color: colors.ink.soft,
                            fontSize: 12,
                            lineHeight: 16,
                          }}
                        >
                          {r.detail}
                        </Text>
                        <View className="flex-row flex-wrap" style={{ gap: 8, paddingVertical: 12 }}>
                          {sortRates(r.rates).map((item) => (
                            <View
                              key={item.modality}
                              style={{
                                backgroundColor: INDIGO_SOFT,
                                borderRadius: 999,
                                paddingHorizontal: 8,
                                paddingVertical: 2,
                              }}
                            >
                              <Text
                                variant="plain"
                                className="font-inter-semibold"
                                style={{
                                  color: INDIGO,
                                  fontSize: 10,
                                  lineHeight: 15,
                                }}
                              >
                                {CHIP_SHORT[item.modality]} · {formatMt(item.price)}
                              </Text>
                            </View>
                          ))}
                        </View>
                        <View className="flex-row items-center" style={{ gap: 4 }}>
                          <Text
                            variant="plain"
                            style={{
                              color: colors.ink.soft,
                              fontSize: 12,
                              lineHeight: 16,
                            }}
                          >
                            A partir de
                          </Text>
                          <Text
                            variant="plain"
                            className="font-inter-semibold"
                            style={{
                              color: colors.brand.DEFAULT,
                              fontSize: 14,
                              lineHeight: 18,
                            }}
                          >
                            {formatMt(from)}
                          </Text>
                        </View>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="gap-4">
              <SectionLabel>Como pretende reservar?</SectionLabel>
              <View className="gap-2">
                {sortRates(availableModalities).map((item) => {
                  const active = modality === item.modality;
                  return (
                    <Pressable
                      key={item.modality}
                      onPress={() => setModality(item.modality)}
                      className="flex-row items-center self-stretch"
                      style={{
                        padding: 15,
                        gap: 16,
                        minHeight: 66,
                        borderRadius: 15,
                        backgroundColor: '#FFFFFF',
                        borderWidth: 1,
                        borderColor: colors.surface.border,
                      }}
                    >
                      <Radio active={active} />
                      <View className="flex-1">
                        <Text
                          variant="plain"
                          className="font-inter-semibold"
                          style={{
                            color: colors.ink.DEFAULT,
                            fontSize: 14,
                            lineHeight: 18,
                          }}
                        >
                          {item.label}
                        </Text>
                        <Text
                          variant="plain"
                          className="font-inter-semibold"
                          style={{
                            color: colors.ink.soft,
                            fontSize: 12,
                            lineHeight: 16,
                          }}
                        >
                          {limitsHint(item)}
                        </Text>
                      </View>
                      <View className="items-end">
                        <Text
                          variant="plain"
                          className="font-inter-semibold"
                          style={{
                            color: colors.brand.DEFAULT,
                            fontSize: 14,
                            lineHeight: 18,
                            textAlign: 'right',
                          }}
                        >
                          {formatMt(item.price)}
                        </Text>
                        <Text
                          variant="plain"
                          className="font-inter-semibold"
                          style={{
                            color: colors.ink.soft,
                            fontSize: 10,
                            lineHeight: 15,
                            textAlign: 'right',
                          }}
                        >
                          {item.unit}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </>
        ) : null}

        {step === 'dates' ? (
          <>
            {modality === 'night' ? (
              <View className="gap-4">
                <DateField
                  label="Check-in"
                  value={formatDisplayDate(checkInDate)}
                  onPress={() => setCalendarOpen(true)}
                />
                <DateField
                  label="Check-out"
                  value={formatDisplayDate(checkOutDate)}
                  onPress={() => setCalendarOpen(true)}
                />
                <Stepper
                  label="Hóspedes"
                  value={guests}
                  onChange={setGuests}
                  min={1}
                  max={room?.guests ?? 10}
                />
              </View>
            ) : null}

            {modality === 'hour' ? (
              <View className="gap-4">
                <DateField
                  label="Data"
                  value={formatDisplayDate(checkInDate)}
                  onPress={() => setCalendarOpen(true)}
                />
                <DateField
                  label="Hora de entrada"
                  value={startTime}
                  icon="time-outline"
                  onPress={() => setTimeOpen(true)}
                />
                <Stepper
                  label="Horas"
                  value={hours}
                  onChange={setHours}
                  min={rate?.min ?? 2}
                  max={rate?.max ?? 12}
                />
              </View>
            ) : null}

            {modality === 'month' ? (
              <View className="gap-4">
                <DateField
                  label="Data de início"
                  value={formatDisplayDate(checkInDate)}
                  onPress={() => setCalendarOpen(true)}
                />
                <Stepper
                  label="Meses"
                  value={months}
                  onChange={setMonths}
                  min={rate?.min ?? 1}
                  max={rate?.max ?? 12}
                />
                <Stepper
                  label="Hóspedes"
                  value={guests}
                  onChange={setGuests}
                  min={1}
                  max={room?.guests ?? 10}
                />
              </View>
            ) : null}

            {quoteMutation.isError &&
            !isReservationDateConflict(quoteMutation.error) ? (
              <Text variant="plain" style={{ color: '#FB2C36', fontSize: 14 }}>
                {quoteMutation.error instanceof Error
                  ? quoteMutation.error.message
                  : 'Não foi possível calcular o preço'}
              </Text>
            ) : null}

            <PriceBreakdown
              nightPrice={formatMt(totals.unitPrice)}
              qty={formatMt(totals.subtotal)}
              qtyLabel={qtyLabel}
              fee={formatMt(totals.fee)}
              total={formatMt(totals.total)}
              unitLabel={
                modality === 'hour'
                  ? 'Preço por hora'
                  : modality === 'month'
                    ? 'Preço por mês'
                    : 'Preço por noite'
              }
            />
          </>
        ) : null}

        {step === 'confirm' ? (
          <>
            <View
              className="overflow-hidden"
              style={{
                borderRadius: 15,
                borderWidth: 1,
                borderColor: '#F5F5F5',
                backgroundColor: '#FFFFFF',
              }}
            >
              <View className="flex-row gap-3 p-3">
                <Image
                  source={{ uri: listing.image }}
                  style={{ width: 72, height: 72, borderRadius: 12 }}
                  contentFit="cover"
                />
                <View className="flex-1 justify-center gap-1">
                  <Text
                    variant="plain"
                    className="font-inter-semibold"
                    style={{
                      color: colors.ink.DEFAULT,
                      fontSize: 14,
                      lineHeight: 18,
                    }}
                  >
                    {listing.name}
                  </Text>
                  <Text
                    variant="plain"
                    style={{
                      color: colors.ink.soft,
                      fontSize: 12,
                      lineHeight: 16,
                    }}
                  >
                    {listing.location}
                  </Text>
                  <Text
                    variant="plain"
                    style={{
                      color: colors.ink.soft,
                      fontSize: 12,
                      lineHeight: 16,
                    }}
                  >
                    {room?.name}
                  </Text>
                </View>
              </View>
            </View>

            <View
              className="overflow-hidden"
              style={{
                borderRadius: 15,
                borderWidth: 1,
                borderColor: '#F5F5F5',
                backgroundColor: '#FFFFFF',
              }}
            >
              {[
                { label: 'Modalidade', value: modalityLabels[modality] },
                {
                  label:
                    modality === 'hour'
                      ? 'Horas'
                      : modality === 'month'
                        ? 'Meses'
                        : 'Noites',
                  value: String(qty),
                },
                { label: 'Hóspedes', value: String(guests) },
                { label: 'Período', value: periodLabel },
              ].map((row) => (
                <View
                  key={row.label}
                  className="flex-row items-center justify-between px-4 py-3"
                  style={{ borderBottomWidth: 1, borderBottomColor: '#F5F5F5' }}
                >
                  <Text
                    variant="plain"
                    style={{
                      color: colors.ink.muted,
                      fontSize: 14,
                      lineHeight: 18,
                    }}
                  >
                    {row.label}
                  </Text>
                  <Text
                    variant="plain"
                    className="font-inter-semibold"
                    style={{
                      color: colors.ink.DEFAULT,
                      fontSize: 14,
                      lineHeight: 18,
                    }}
                  >
                    {row.value}
                  </Text>
                </View>
              ))}
            </View>

            {formError ? (
              <Text variant="plain" style={{ color: '#FB2C36', fontSize: 14 }}>
                {formError}
              </Text>
            ) : null}

            <PriceBreakdown
              nightPrice={formatMt(totals.unitPrice)}
              qty={formatMt(totals.subtotal)}
              qtyLabel={qtyLabel}
              fee={formatMt(totals.fee)}
              total={formatMt(totals.total)}
              unitLabel={
                modality === 'hour'
                  ? 'Preço por hora'
                  : modality === 'month'
                    ? 'Preço por mês'
                    : 'Preço por noite'
              }
            />
          </>
        ) : null}
      </KeyboardScrollView>

      <StickyFooter>
        {step === 'room' ? (
          <FooterButton onPress={() => setStep('dates')}>Continuar</FooterButton>
        ) : null}
        {step === 'dates' ? (
          <FooterButton disabled={datesBlocked} onPress={() => setStep('confirm')}>
            Continuar
          </FooterButton>
        ) : null}
        {step === 'confirm' ? (
          <FooterButton
            disabled={createReservation.isPending}
            onPress={confirmBooking}
          >
            {createReservation.isPending ? 'A enviar…' : 'Confirmar pedido'}
          </FooterButton>
        ) : null}
      </StickyFooter>

      <CalendarPicker
        visible={calendarOpen}
        title={modality === 'night' ? 'Escolher datas' : 'Escolher data'}
        mode={modality === 'night' ? 'range' : 'single'}
        startDate={checkInDate}
        endDate={checkOutDate}
        minDate={toIsoDate()}
        unavailableDates={unavailableDates}
        onClose={() => setCalendarOpen(false)}
        onConfirm={(start, end) => {
          setCheckInDate(start);
          if (end) setCheckOutDate(end);
          else if (modality === 'night') setCheckOutDate(addDaysIso(start, 1));
          setCalendarOpen(false);
        }}
      />

      <TimePickerModal
        visible={timeOpen}
        title="Hora de entrada"
        value={startTime}
        onClose={() => setTimeOpen(false)}
        onConfirm={(time) => {
          setStartTime(time);
          setTimeOpen(false);
        }}
      />
    </Screen>
  );
}
