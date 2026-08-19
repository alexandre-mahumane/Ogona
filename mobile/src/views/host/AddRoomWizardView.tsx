import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';

import {
  WizardFooter,
  WizardProgressHeader,
} from '@/components/host/HostChrome';
import { PhotoGrid } from '@/components/host/PhotoGrid';
import { Input, Screen, SuccessView, Text } from '@/components/ui';
import { propertyAmenities, roomTypes } from '@/data/host.mock';
import { useCreateRoom } from '@/hooks/useHost';
import type { BookingModality } from '@/lib/api/types';
import { uploadImages } from '@/lib/firebase/storage';
import { pickImages } from '@/lib/images/picker';
import {
  amenityApiByLabel,
  roomTypeApiByLabel,
} from '@/lib/mappers/host';
import { colors } from '@/theme/colors';

const TOTAL_STEPS = 5;
const MAX_PHOTOS = 8;

const BED_OPTIONS = [
  'Cama de casal',
  'Cama de solteiro',
  'Beliche',
  'Sofá-cama',
];

type FormState = {
  name: string;
  type: string;
  description: string;
  capacity: number;
  beds: string[];
  priceNight: string;
  priceWeek: string;
  amenities: string[];
  photos: string[];
};

const emptyForm: FormState = {
  name: '',
  type: '',
  description: '',
  capacity: 1,
  beds: [],
  priceNight: '',
  priceWeek: '',
  amenities: [],
  photos: [],
};

function AmenityRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <Pressable onPress={onToggle} className="flex-row items-center gap-2 py-1">
      <View
        className="h-4 w-4 items-center justify-center rounded"
        style={{
          backgroundColor: checked ? '#FFF7ED' : '#FFFFFF',
          borderWidth: 1,
          borderColor: checked ? colors.brand.DEFAULT : '#E5E5E5',
        }}
      >
        {checked ? (
          <Ionicons name="checkmark" size={12} color={colors.brand.DEFAULT} />
        ) : null}
      </View>
      <Text variant="label-s" className="text-ink-secondary">
        {label}
      </Text>
    </Pressable>
  );
}

function Stepper({
  value,
  onChange,
  hint,
}: {
  value: number;
  onChange: (n: number) => void;
  hint?: string;
}) {
  return (
    <View className="gap-2">
      <Text variant="label-xs">Capacidade de hóspedes</Text>
      <View className="h-[54px] flex-row items-center justify-between rounded-input border border-surface-border bg-surface px-1">
        <Pressable
          onPress={() => onChange(Math.max(1, value - 1))}
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
      {hint ? <Text variant="p-s">{hint}</Text> : null}
    </View>
  );
}

function MoneyInput({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View className="gap-1.5">
      <Text variant="label-xs">{label}</Text>
      <View className="h-[54px] flex-row overflow-hidden rounded-input border border-surface-border bg-surface">
        <View className="h-full items-center justify-center border-r border-surface-border bg-[#FCFCFC] px-3">
          <Text variant="label-m" className="text-ink-muted">
            MZN
          </Text>
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="1200"
          placeholderTextColor={colors.ink.soft}
          keyboardType="numeric"
          className="flex-1 px-3 font-inter-semibold text-label-m text-ink"
        />
      </View>
    </View>
  );
}

export function AddRoomWizardView() {
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const resolvedPropertyId = propertyId ? String(propertyId) : '';
  const createRoom = useCreateRoom(resolvedPropertyId);

  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const busy = uploading || createRoom.isPending;

  const titles = useMemo(
    () => [
      'Informações do quarto',
      'Tipo de cama',
      'Preço',
      'Comodidades do quarto',
      'Fotos do quarto',
    ],
    [],
  );

  const descriptions = useMemo(
    () => [
      'Dê um nome ao quarto e descreva o que o torna especial.',
      'Seleccione as configurações de cama disponíveis neste quarto.',
      'Defina quanto custa este quarto e a sua disponibilidade.',
      'Ainda não acabamos — adicione comodidades.',
      'Adicione fotos atractivas. A primeira será a capa.',
    ],
    [],
  );

  function patch(partial: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  function toggle(list: string[], label: string) {
    return list.includes(label)
      ? list.filter((x) => x !== label)
      : [...list, label];
  }

  async function addPhotos() {
    try {
      const remaining = MAX_PHOTOS - form.photos.length;
      if (remaining <= 0) return;
      const uris = await pickImages({ limit: remaining });
      if (!uris.length) return;
      patch({ photos: [...form.photos, ...uris].slice(0, MAX_PHOTOS) });
    } catch (error) {
      Alert.alert(
        'Não foi possível escolher fotos',
        error instanceof Error ? error.message : 'Tente novamente.',
      );
    }
  }

  function goBack() {
    if (busy) return;
    if (step === 1) {
      router.back();
      return;
    }
    setStep((s) => s - 1);
  }

  async function goNext() {
    if (busy) return;
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }

    if (!form.photos.length) {
      Alert.alert('Fotos obrigatórias', 'Adicione pelo menos uma foto do quarto.');
      return;
    }

    if (!resolvedPropertyId) {
      setDone(true);
      return;
    }

    const nightPrice = Number(form.priceNight) || 0;
    const weekPrice = Number(form.priceWeek) || 0;
    const modalities: BookingModality[] = [];
    const prices: Partial<Record<BookingModality, number>> = {};

    if (nightPrice > 0) {
      modalities.push('noite');
      prices.noite = nightPrice;
    }
    if (weekPrice > 0) {
      modalities.push('semana');
      prices.semana = weekPrice;
    }
    if (modalities.length === 0) {
      modalities.push('noite');
      prices.noite = 1000;
    }

    setUploading(true);
    try {
      const images = await uploadImages(form.photos, 'rooms');

      createRoom.mutate(
        {
          name: form.name.trim() || 'Novo quarto',
          type:
            roomTypeApiByLabel[form.type] ??
            roomTypeApiByLabel.Suite ??
            'suite',
          description:
            form.description.trim() || 'Quarto adicionado via Ogona.',
          maxCapacity: form.capacity,
          bedLabel: form.beds[0],
          modalities,
          prices,
          amenities: form.amenities
            .map((label) => amenityApiByLabel[label])
            .filter(Boolean),
          images,
        },
        {
          onSuccess: () => setDone(true),
          onError: (error) => {
            Alert.alert(
              'Não foi possível publicar',
              error instanceof Error ? error.message : 'Tente novamente.',
            );
          },
          onSettled: () => setUploading(false),
        },
      );
    } catch (error) {
      setUploading(false);
      Alert.alert(
        'Não foi possível enviar as fotos',
        error instanceof Error ? error.message : 'Tente novamente.',
      );
    }
  }

  function resetWizard() {
    setForm(emptyForm);
    setStep(1);
    setDone(false);
  }

  if (done) {
    return (
      <SuccessView
        title="Quarto adicionado com sucesso!"
        description="O quarto foi publicado. Pode ver o alojamento ou voltar ao início."
        primaryLabel="Ir para o dashboard"
        onPrimary={() => router.replace('/(host)/(tabs)')}
        secondaryLabel="Adicionar outro"
        onSecondary={resetWizard}
      />
    );
  }

  return (
    <Screen keyboard className="bg-surface" contentClassName="flex-1">
      <WizardProgressHeader
        title="Adicionar quarto"
        step={step}
        total={TOTAL_STEPS}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-8 px-6 py-4 pb-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="gap-1.5">
          <Text variant="h3">{titles[step - 1]}</Text>
          <Text variant="p-m">{descriptions[step - 1]}</Text>
        </View>

        {step === 1 ? (
          <View className="gap-4">
            <Input
              label="Nome do quarto"
              placeholder="Ex: Quarto Deluxe Vista Mar"
              value={form.name}
              onChangeText={(name) => patch({ name })}
            />
            <View className="gap-1.5">
              <Text variant="label-xs">Tipo de quarto</Text>
              <View className="flex-row flex-wrap gap-2">
                {roomTypes.map((t) => {
                  const active = form.type === t;
                  return (
                    <Pressable
                      key={t}
                      onPress={() => patch({ type: t })}
                      className={`rounded-full border px-3 py-2 ${
                        active
                          ? 'border-brand bg-brand'
                          : 'border-surface-border bg-surface'
                      }`}
                    >
                      <Text
                        variant="label-xs"
                        className={active ? 'text-white' : 'text-ink-secondary'}
                      >
                        {t}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
            <Stepper
              value={form.capacity}
              onChange={(capacity) => patch({ capacity })}
              hint="Número máximo de hóspedes neste quarto"
            />
            <View className="gap-1.5">
              <Text variant="label-xs">Descrição</Text>
              <View className="min-h-[172px] rounded-input border border-surface-border bg-surface p-3">
                <TextInput
                  multiline
                  placeholder="Conte mais sobre o quarto...."
                  placeholderTextColor={colors.ink.soft}
                  value={form.description}
                  onChangeText={(description) => patch({ description })}
                  maxLength={500}
                  className="min-h-[132px] font-inter text-p-s text-ink"
                  textAlignVertical="top"
                />
                <Text variant="label-xs" className="self-end text-ink-muted">
                  {form.description.length}/500
                </Text>
              </View>
            </View>
          </View>
        ) : null}

        {step === 2 ? (
          <View className="gap-3">
            {BED_OPTIONS.map((b) => (
              <AmenityRow
                key={b}
                label={b}
                checked={form.beds.includes(b)}
                onToggle={() => patch({ beds: toggle(form.beds, b) })}
              />
            ))}
          </View>
        ) : null}

        {step === 3 ? (
          <View className="gap-4">
            <MoneyInput
              label="Preço por noite"
              value={form.priceNight}
              onChangeText={(priceNight) => patch({ priceNight })}
            />
            <MoneyInput
              label="Preço por semana"
              value={form.priceWeek}
              onChangeText={(priceWeek) => patch({ priceWeek })}
            />
          </View>
        ) : null}

        {step === 4 ? (
          <View className="gap-4">
            <View className="gap-0.5">
              <Text variant="label-s" className="text-ink-secondary">
                Comodidades disponíveis
              </Text>
              <Text variant="label-s" className="text-ink-soft">
                (Mais usados)
              </Text>
            </View>
            <View className="gap-3">
              {propertyAmenities.map((a) => (
                <AmenityRow
                  key={a}
                  label={a}
                  checked={form.amenities.includes(a)}
                  onToggle={() =>
                    patch({ amenities: toggle(form.amenities, a) })
                  }
                />
              ))}
            </View>
          </View>
        ) : null}

        {step === 5 ? (
          <View className="gap-4">
            <Text variant="label-xs">Fotos do quarto</Text>
            <PhotoGrid
              photos={form.photos}
              max={MAX_PHOTOS}
              onAdd={() => void addPhotos()}
              onRemove={(index) =>
                patch({ photos: form.photos.filter((_, i) => i !== index) })
              }
            />
            <View className="mt-4 gap-3 rounded-xl border border-surface-border bg-[#FCFCFC] p-4">
              <Text variant="label-s">Resumo</Text>
              <Text variant="p-s">
                {form.name || 'Quarto Deluxe Vista Mar'}
              </Text>
              <Text variant="p-xs">
                {form.type || 'Suite'} · {form.capacity} hóspede
                {form.capacity === 1 ? '' : 's'} ·{' '}
                {form.priceNight ? `${form.priceNight} MT/noite` : '—'}
              </Text>
              <Text variant="p-xs">
                {form.amenities.length} comodidades · {form.photos.length} fotos
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <WizardFooter
        onBack={goBack}
        onContinue={() => void goNext()}
        disabled={busy}
        continueLabel={
          busy
            ? uploading
              ? 'A enviar fotos…'
              : 'A publicar…'
            : step === TOTAL_STEPS
              ? 'Publicar quarto'
              : 'Continuar'
        }
      />
    </Screen>
  );
}
