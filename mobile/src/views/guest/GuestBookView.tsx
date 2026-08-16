import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, View } from 'react-native';

import {
  GuestScreenHeader,
  PriceBreakdown,
  StickyFooter,
} from '@/components/guest/GuestChrome';
import { Button, Screen, Text } from '@/components/ui';
import { calcBookingTotal, type StayModality } from '@/data/guest.mock';
import { usePropertyDetail } from '@/hooks/useDiscover';
import {
  useCreateReservation,
  useReservationQuote,
} from '@/hooks/useReservations';
import { formatMt, toApiModality } from '@/lib/mappers/guest';
import { colors } from '@/theme/colors';

type Step = 'room' | 'dates' | 'confirm';

const modalityLabels: Record<StayModality, string> = {
  hour: 'Por Hora',
  night: 'Por Noite',
  month: 'Por Mês',
};

function addDays(isoDate: string, days: number) {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function formatDisplayDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('pt-MZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function defaultCheckInDate() {
  const d = new Date();
  d.setDate(d.getDate() + 4);
  return d.toISOString().slice(0, 10);
}

function Stepper({
  label,
  value,
  onChange,
  min = 1,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min?: number;
}) {
  return (
    <View className="gap-2">
      <Text variant="label-xs">{label}</Text>
      <View className="h-[54px] flex-row items-center justify-between rounded-input border border-surface-border bg-surface px-1">
        <Pressable
          onPress={() => onChange(Math.max(min, value - 1))}
          className="h-12 w-12 items-center justify-center rounded-full"
        >
          <Ionicons name="remove" size={20} color={colors.ink.secondary} />
        </Pressable>
        <Text variant="p-s" className="text-ink">
          {value}
        </Text>
        <Pressable
          onPress={() => onChange(value + 1)}
          className="h-12 w-12 items-center justify-center rounded-full"
        >
          <Ionicons name="add" size={20} color={colors.ink.secondary} />
        </Pressable>
      </View>
    </View>
  );
}

function DatePlaceholder({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View className="gap-1.5">
      <Text variant="label-xs">{label}</Text>
      <View className="h-[54px] flex-row items-center justify-between rounded-input border border-surface-border bg-surface px-4">
        <Text variant="p-s" className="text-ink">
          {value}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={colors.ink.soft} />
      </View>
    </View>
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
  const [hours, setHours] = useState(3);
  const [months, setMonths] = useState(1);
  const [nights] = useState(3);
  const [checkInDate] = useState(defaultCheckInDate);

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

  const availableModalities = room?.rates ?? [];
  const rate =
    availableModalities.find((r) => r.modality === modality) ??
    availableModalities[0];

  useEffect(() => {
    if (rate && rate.modality !== modality) {
      setModality(rate.modality);
    }
  }, [rate, modality]);

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
      units: qty,
      guestCount: guests,
    };
  }, [room?.id, modality, checkInDate, qty, guests]);

  const quoteMutation = useReservationQuote();

  useEffect(() => {
    if (!quoteInput || step === 'room') return;
    quoteMutation.mutate(quoteInput);
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

  const checkOutDate =
    modality === 'night'
      ? addDays(checkInDate, nights)
      : modality === 'month'
        ? addDays(checkInDate, months * 30)
        : checkInDate;

  const periodLabel =
    modality === 'night'
      ? `${formatDisplayDate(checkInDate)} – ${formatDisplayDate(checkOutDate)}`
      : formatDisplayDate(checkInDate);

  const title =
    step === 'room'
      ? 'Escolher quarto'
      : step === 'dates'
        ? 'Datas e detalhes'
        : 'Confirmar pedido';

  const confirmBooking = () => {
    if (!quoteInput) return;
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
    <Screen className="bg-[#FCFCFC]" contentClassName="flex-1" keyboard>
      <GuestScreenHeader title={title} onBack={() => router.back()} />

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-5 px-6 pb-8 pt-5"
      >
        {step === 'room' ? (
          <>
            <View className="gap-3">
              <Text variant="label-s">Selecione o quarto</Text>
              {listing.rooms.map((r) => {
                const active = r.id === selectedRoomId;
                return (
                  <Pressable
                    key={r.id}
                    onPress={() => setSelectedRoomId(r.id)}
                    className={`flex-row gap-3 rounded-[15px] border p-3 ${
                      active
                        ? 'border-brand bg-brand-soft'
                        : 'border-[#F5F5F5] bg-surface'
                    }`}
                  >
                    <View
                      className={`mt-1 h-5 w-5 items-center justify-center rounded-full border ${
                        active ? 'border-brand bg-brand' : 'border-surface-border'
                      }`}
                    >
                      {active ? (
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      ) : null}
                    </View>
                    <Image
                      source={{ uri: r.image }}
                      style={{ width: 64, height: 64, borderRadius: 12 }}
                      contentFit="cover"
                    />
                    <View className="flex-1 justify-center gap-1">
                      <Text variant="label-s">{r.name}</Text>
                      <Text variant="p-xs">{r.detail}</Text>
                      <Text variant="label-s" className="text-brand">
                        {r.priceLabel}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View className="gap-2">
              <Text variant="label-s">Modalidade</Text>
              <View className="flex-row flex-wrap gap-2">
                {availableModalities.map((r) => {
                  const active = modality === r.modality;
                  return (
                    <Pressable
                      key={r.modality}
                      onPress={() => setModality(r.modality)}
                      className={`h-10 items-center justify-center rounded-full border px-4 ${
                        active
                          ? 'border-brand bg-brand'
                          : 'border-surface-border bg-surface'
                      }`}
                    >
                      <Text
                        variant="label-xs"
                        className={active ? 'text-white' : 'text-ink-secondary'}
                      >
                        {modalityLabels[r.modality]}
                      </Text>
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
                <DatePlaceholder
                  label="Check-in"
                  value={formatDisplayDate(checkInDate)}
                />
                <DatePlaceholder
                  label="Check-out"
                  value={formatDisplayDate(checkOutDate)}
                />
                <Stepper
                  label="Hóspedes"
                  value={guests}
                  onChange={setGuests}
                />
              </View>
            ) : null}

            {modality === 'hour' ? (
              <View className="gap-4">
                <DatePlaceholder
                  label="Data"
                  value={formatDisplayDate(checkInDate)}
                />
                <Stepper label="Horas" value={hours} onChange={setHours} />
              </View>
            ) : null}

            {modality === 'month' ? (
              <View className="gap-4">
                <DatePlaceholder
                  label="Data de início"
                  value={formatDisplayDate(checkInDate)}
                />
                <Stepper label="Meses" value={months} onChange={setMonths} />
              </View>
            ) : null}

            <PriceBreakdown
              nightPrice={formatMt(totals.unitPrice)}
              qty={formatMt(totals.subtotal)}
              qtyLabel={qtyLabel}
              fee={formatMt(totals.fee)}
              total={formatMt(totals.total)}
            />
          </>
        ) : null}

        {step === 'confirm' ? (
          <>
            <View className="overflow-hidden rounded-[15px] border border-[#F5F5F5] bg-surface">
              <View className="flex-row gap-3 p-3">
                <Image
                  source={{ uri: listing.image }}
                  style={{ width: 72, height: 72, borderRadius: 12 }}
                  contentFit="cover"
                />
                <View className="flex-1 justify-center gap-1">
                  <Text variant="label-s">{listing.name}</Text>
                  <Text variant="p-xs">{listing.location}</Text>
                  <Text variant="p-xs">{room?.name}</Text>
                </View>
              </View>
            </View>

            <View className="overflow-hidden rounded-[15px] border border-[#F5F5F5] bg-surface">
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
                  className="flex-row items-center justify-between border-b border-[#F5F5F5] px-4 py-3"
                >
                  <Text variant="p-s">{row.label}</Text>
                  <Text variant="label-s">{row.value}</Text>
                </View>
              ))}
            </View>

            <PriceBreakdown
              nightPrice={formatMt(totals.unitPrice)}
              qty={formatMt(totals.subtotal)}
              qtyLabel={qtyLabel}
              fee={formatMt(totals.fee)}
              total={formatMt(totals.total)}
            />
          </>
        ) : null}
      </ScrollView>

      <StickyFooter>
        {step === 'room' ? (
          <Button onPress={() => setStep('dates')}>Continuar</Button>
        ) : null}
        {step === 'dates' ? (
          <Button onPress={() => setStep('confirm')}>Confirmar</Button>
        ) : null}
        {step === 'confirm' ? (
          <Button
            disabled={createReservation.isPending}
            onPress={confirmBooking}
          >
            {createReservation.isPending
              ? 'A enviar…'
              : 'Confirmar pedido'}
          </Button>
        ) : null}
      </StickyFooter>
    </Screen>
  );
}
