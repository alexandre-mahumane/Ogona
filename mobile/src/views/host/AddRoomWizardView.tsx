import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState, type ComponentProps } from 'react';
import { Alert, Pressable, TextInput, View } from 'react-native';

import {
  WizardFooter,
  WizardProgressHeader,
} from '@/components/host/HostChrome';
import { PhotoGrid } from '@/components/host/PhotoGrid';
import { PropertySuccessIllustration } from '@/components/icons/PropertySuccessIllustration';
import { Button, Input, KeyboardScrollView, Screen, SelectField, Text } from '@/components/ui';
import { propertyAmenities } from '@/data/host.mock';
import { useCreateRoom, useHostProperty } from '@/hooks/useHost';
import type { BookingModality } from '@/lib/api/types';
import { isRemoteImageUrl, uploadImages } from '@/lib/firebase/storage';
import { pickImages } from '@/lib/images/picker';
import {
  amenityApiByLabel,
  roomTypeApiByLabel,
} from '@/lib/mappers/host';
import { colors } from '@/theme/colors';

const TOTAL_STEPS = 6;
const MAX_PHOTOS = 10;
const MAIN_AMENITY_COUNT = 8;

const ROOM_TYPE_OPTIONS = [
  { value: 'Individual', label: 'Individual' },
  { value: 'Casal', label: 'Casal' },
  { value: 'Twin', label: 'Twin' },
  { value: 'Triple', label: 'Triple' },
  { value: 'Suite', label: 'Suite' },
  { value: 'Quarto Deluxe', label: 'Quarto Deluxe' },
  { value: 'Familiar', label: 'Familiar' },
  { value: 'Estúdio', label: 'Estúdio' },
  { value: 'Dormitório', label: 'Dormitório' },
];

const ROOM_STATUS_OPTIONS = [
  { value: 'disponivel', label: 'Disponível' },
  { value: 'indisponivel', label: 'Indisponível' },
  { value: 'manutencao', label: 'Manutenção' },
];

const MODALITIES: { id: BookingModality; label: string }[] = [
  { id: 'hora', label: 'Por hora' },
  { id: 'noite', label: 'Por noite' },
  { id: 'semana', label: 'Por semana' },
  { id: 'mes', label: 'Por mês' },
];

const AMENITY_ICONS: Record<string, ComponentProps<typeof Ionicons>['name']> = {
  'Wi-Fi gratuito': 'wifi-outline',
  'Ar condicionado': 'snow-outline',
  Televisão: 'tv-outline',
  'Casa de banho privativa': 'water-outline',
  'Água quente': 'thermometer-outline',
  'Roupa de cama': 'bed-outline',
  Toalhas: 'file-tray-outline',
  'Mesa de trabalho': 'desktop-outline',
  Estacionamento: 'car-outline',
  Cozinha: 'restaurant-outline',
  Minibar: 'wine-outline',
  Cofre: 'lock-closed-outline',
  Varanda: 'sunny-outline',
  'Vista mar': 'boat-outline',
  'Pequeno-almoço': 'cafe-outline',
  Frigorífico: 'cube-outline',
  Roupeiro: 'file-tray-stacked-outline',
  'Secador de cabelo': 'flash-outline',
  'Ferro de engomar': 'shirt-outline',
  'Rede mosquiteira': 'bug-outline',
};

type Prices = Partial<Record<BookingModality, string>>;

type FormState = {
  name: string;
  type: string;
  status: string;
  description: string;
  capacity: number;
  modalities: BookingModality[];
  prices: Prices;
  amenities: string[];
  photos: string[];
  confirmed: boolean;
};

const emptyForm: FormState = {
  name: '',
  type: '',
  status: 'disponivel',
  description: '',
  capacity: 1,
  modalities: [],
  prices: {},
  amenities: [],
  photos: [],
  confirmed: false,
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
    <Pressable onPress={onToggle} className="flex-row items-center gap-3 py-1.5">
      <View
        className="h-5 w-5 items-center justify-center rounded"
        style={{
          backgroundColor: checked ? '#FFF7ED' : '#FFFFFF',
          borderWidth: 1,
          borderColor: checked ? colors.brand.DEFAULT : '#D4D4D4',
        }}
      >
        {checked ? (
          <Ionicons name="checkmark" size={14} color={colors.brand.DEFAULT} />
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
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <View className="gap-1.5">
      <Text variant="label-xs">Capacidade maxima</Text>
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
          onPress={() => onChange(Math.min(50, value + 1))}
          className="h-12 w-12 items-center justify-center rounded-full"
        >
          <Ionicons name="add" size={20} color={colors.ink.secondary} />
        </Pressable>
      </View>
      <Text variant="p-s">Numero de hospedes que este quarto acomoda.</Text>
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

function formatMzn(value: number) {
  return `MZN ${Math.round(value).toLocaleString('pt-MZ')}`;
}

function modalityLabel(id: BookingModality) {
  return MODALITIES.find((item) => item.id === id)?.label ?? id;
}

export function AddRoomWizardView() {
  const { propertyId, amenities: amenitiesParam } = useLocalSearchParams<{
    propertyId?: string;
    amenities?: string | string[];
  }>();
  const resolvedPropertyId = propertyId ? String(propertyId) : '';
  const createRoom = useCreateRoom(resolvedPropertyId);
  const property = useHostProperty(resolvedPropertyId || undefined);
  const presetAmenities = useMemo(() => {
    const raw = Array.isArray(amenitiesParam) ? amenitiesParam[0] : amenitiesParam;
    return raw ? raw.split('|').filter(Boolean) : [];
  }, [amenitiesParam]);

  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [form, setForm] = useState<FormState>({
    ...emptyForm,
    amenities: presetAmenities,
  });
  const busy = uploading || createRoom.isPending;

  const visibleAmenities = showAllAmenities
    ? propertyAmenities
    : propertyAmenities.slice(0, MAIN_AMENITY_COUNT);

  const previewPhotos = form.photos.slice(0, 6);
  const extraPhotos = Math.max(0, form.photos.length - 6);
  const nightPrice = Number(form.prices.noite) || 0;
  const previewPrice =
    nightPrice ||
    Number(form.prices[form.modalities[0] ?? 'noite']) ||
    0;

  function patch(partial: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  function toggleModality(id: BookingModality) {
    setForm((prev) => {
      const selected = prev.modalities.includes(id)
        ? prev.modalities.filter((item) => item !== id)
        : [...prev.modalities, id];
      const prices = { ...prev.prices };
      if (!selected.includes(id)) delete prices[id];
      return { ...prev, modalities: selected, prices };
    });
  }

  function toggleAmenity(label: string) {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(label)
        ? prev.amenities.filter((item) => item !== label)
        : [...prev.amenities, label],
    }));
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

    if (step === 2 && form.modalities.length === 0) {
      Alert.alert(
        'Modalidade obrigatória',
        'Escolha pelo menos uma forma de reserva.',
      );
      return;
    }

    if (step === 3) {
      const missing = form.modalities.filter((id) => !(Number(form.prices[id]) > 0));
      if (missing.length) {
        Alert.alert(
          'Preço obrigatório',
          'Informe o preço para cada modalidade seleccionada.',
        );
        return;
      }
    }

    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
      return;
    }

    if (!form.confirmed) {
      Alert.alert(
        'Confirmação necessária',
        'Confirme que todas as informações fornecidas são verdadeiras.',
      );
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

    const prices: Partial<Record<BookingModality, number>> = {};
    for (const modality of form.modalities) {
      prices[modality] = Number(form.prices[modality]);
    }

    setUploading(true);
    try {
      const localPhotos = form.photos.filter((uri) => !isRemoteImageUrl(uri));
      const remotePhotos = form.photos.filter((uri) => isRemoteImageUrl(uri));
      const images = [
        ...remotePhotos,
        ...(localPhotos.length ? await uploadImages(localPhotos, 'rooms') : []),
      ];
      if (!images.length) {
        throw new Error('Não foi possível enviar as fotos. Tente outras imagens.');
      }

      createRoom.mutate(
        {
          name: form.name.trim() || 'Novo quarto',
          type:
            roomTypeApiByLabel[form.type] ??
            roomTypeApiByLabel.Suite ??
            'suite',
          status: form.status || 'disponivel',
          description:
            form.description.trim() || 'Quarto adicionado via Ogona.',
          maxCapacity: form.capacity,
          modalities: form.modalities,
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
    setForm({ ...emptyForm, amenities: presetAmenities });
    setShowAllAmenities(false);
    setStep(1);
    setDone(false);
  }

  if (done) {
    return (
      <Screen className="bg-surface" contentClassName="flex-1 px-5">
        <View className="flex-1 items-center justify-center">
          <PropertySuccessIllustration />
          <View className="mt-6 items-center px-2">
            <Text
              variant="plain"
              className="text-center font-manrope"
              style={{
                color: colors.ink.DEFAULT,
                fontSize: 18,
                lineHeight: 24,
                fontWeight: '600',
              }}
            >
              Quarto adicionado com sucesso!
            </Text>
            <Text
              variant="plain"
              className="mt-2 text-center"
              style={{
                color: colors.ink.muted,
                fontSize: 14,
                lineHeight: 20,
              }}
            >
              O seu quarto foi adicionado à propriedade e já está pronto para
              receber reservas, de acordo com a disponibilidade definida.
            </Text>
          </View>
        </View>

        <View className="gap-3 pb-6">
          <Button className="h-14 w-full rounded-2xl" onPress={resetWizard}>
            Adicionar outro quarto
          </Button>
          <Pressable
            onPress={() => router.replace('/(host)/(tabs)')}
            className="h-14 w-full items-center justify-center"
            style={{
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.ink.secondary,
            }}
          >
            <Text
              variant="plain"
              className="font-inter-semibold"
              style={{
                color: colors.ink.secondary,
                fontSize: 16,
                lineHeight: 20,
              }}
            >
              Voltar ao Dashboard
            </Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  return (
    <Screen keyboard className="bg-surface" contentClassName="flex-1">
      <WizardProgressHeader
        title="Adicionar quarto"
        step={step}
        total={TOTAL_STEPS}
      />

      <KeyboardScrollView
        className="flex-1"
        contentContainerClassName="gap-8 px-6 py-4 pb-8"
        extraHeight={40}
      >
        {step === 1 ? (
          <View className="gap-4">
            <View className="gap-1.5">
              <Text variant="h3">Informações do quarto</Text>
              <Text variant="p-m">Informe os dados básicos deste quarto.</Text>
            </View>
            <Input
              label="Nome do quarto"
              placeholder="Ex: Quarto Deluxe Vista Mar"
              value={form.name}
              onChangeText={(name) => patch({ name })}
            />
            <SelectField
              label="Tipo de quarto"
              placeholder="Selecione o tipo de quarto"
              value={form.type}
              options={ROOM_TYPE_OPTIONS}
              onChange={(type) => patch({ type })}
            />
            <SelectField
              label="Estado"
              placeholder="Selecione o estado"
              value={form.status}
              options={ROOM_STATUS_OPTIONS}
              onChange={(status) => patch({ status })}
            />
            <View className="gap-1.5">
              <Text variant="label-xs">Descrição</Text>
              <View className="min-h-[172px] rounded-input border border-surface-border bg-surface p-3">
                <TextInput
                  multiline
                  placeholder="Descreva o quarto, os seus diferenciais e o que os hóspedes podem esperar."
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
            <Stepper
              value={form.capacity}
              onChange={(capacity) => patch({ capacity })}
            />
          </View>
        ) : null}

        {step === 2 ? (
          <View className="gap-4">
            <View className="gap-1.5">
              <Text variant="h3">Como os hóspedes podem reservar este quarto?</Text>
              <Text variant="p-m">
                Escolha as modalidades de reserva disponíveis para este quarto.
              </Text>
            </View>
            <View className="gap-1">
              {MODALITIES.map((item) => (
                <AmenityRow
                  key={item.id}
                  label={item.label}
                  checked={form.modalities.includes(item.id)}
                  onToggle={() => toggleModality(item.id)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {step === 3 ? (
          <View className="gap-4">
            <View className="gap-1.5">
              <Text variant="h3">Preço</Text>
              <Text variant="p-m">
                Defina o valor para cada modalidade que escolheu.
              </Text>
            </View>
            {form.modalities.length === 0 ? (
              <Text variant="p-s">
                Volte atrás e escolha pelo menos uma modalidade de reserva.
              </Text>
            ) : (
              form.modalities.map((id) => (
                <MoneyInput
                  key={id}
                  label={`Preço ${modalityLabel(id).toLowerCase()}`}
                  value={form.prices[id] ?? ''}
                  onChangeText={(value) =>
                    patch({ prices: { ...form.prices, [id]: value } })
                  }
                />
              ))
            )}
          </View>
        ) : null}

        {step === 4 ? (
          <View className="gap-4">
            <View className="gap-1.5">
              <Text variant="h3">Adicione as comodidades do quarto</Text>
              <Text variant="p-m">
                Selecione os recursos disponíveis neste quarto para ajudar os
                hóspedes a escolherem melhor.
              </Text>
            </View>
            <Text variant="label-s" className="text-ink-secondary">
              Principais comodidades (Mais usados)
            </Text>
            <View className="gap-1">
              {visibleAmenities.map((label) => (
                <AmenityRow
                  key={label}
                  label={label}
                  checked={form.amenities.includes(label)}
                  onToggle={() => toggleAmenity(label)}
                />
              ))}
            </View>
            {propertyAmenities.length > MAIN_AMENITY_COUNT ? (
              <Pressable
                onPress={() => setShowAllAmenities((open) => !open)}
                className="h-12 items-center justify-center rounded-xl border border-ink-secondary"
              >
                <Text variant="label-s" className="text-ink-secondary">
                  {showAllAmenities
                    ? 'Ver menos comodidades'
                    : 'Ver mais comodidades'}
                </Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {step === 5 ? (
          <View className="gap-4">
            <View className="gap-1.5">
              <Text variant="h3">Fotos do quarto</Text>
              <Text variant="p-m">
                Adicione fotografias de boa qualidade para aumentar as hipóteses
                de reserva.
              </Text>
            </View>
            <Text variant="label-xs">
              Fotos do quarto ({form.photos.length}/{MAX_PHOTOS})
            </Text>
            <PhotoGrid
              photos={form.photos}
              max={MAX_PHOTOS}
              onAdd={() => void addPhotos()}
              onRemove={(index) =>
                patch({ photos: form.photos.filter((_, i) => i !== index) })
              }
            />
          </View>
        ) : null}

        {step === 6 ? (
          <View className="gap-6">
            <View className="gap-1.5">
              <Text variant="h3">Revise o seu quarto</Text>
              <Text variant="p-m">
                Confirme todas as informações antes de publicar.
              </Text>
            </View>

            <View className="overflow-hidden rounded-xl border border-[#F5F5F5] bg-surface">
              <View>
                {form.photos[0] ? (
                  <Image
                    source={{ uri: form.photos[0] }}
                    style={{ height: 150, width: '100%' }}
                  />
                ) : (
                  <View className="h-[150px] bg-[#E5E5E5]" />
                )}
                <View
                  className="absolute left-3 top-3 rounded-full px-2.5 py-1"
                  style={{ backgroundColor: '#DBEAFE' }}
                >
                  <Text
                    variant="plain"
                    style={{ color: '#1D4ED8', fontSize: 11, fontWeight: '600' }}
                  >
                    Novo anúncio
                  </Text>
                </View>
              </View>
              <View className="gap-1 p-4">
                <Text variant="label-s">
                  {property.data?.property.name ||
                    form.name ||
                    'Pensão Horizonte Azul'}
                </Text>
                <Text variant="p-xs">
                  {property.data?.property.location || 'Polana, Maputo'}
                </Text>
                {previewPrice > 0 ? (
                  <Text variant="label-s">
                    {formatMzn(previewPrice)}
                    {form.prices.noite ? ' / noite' : ''}
                  </Text>
                ) : null}
              </View>
            </View>

            <View className="gap-3 rounded-xl border border-surface-border bg-[#FCFCFC] p-4">
              <View className="flex-row items-center justify-between">
                <Text variant="label-s">Informações do quarto</Text>
                <Pressable onPress={() => setStep(1)}>
                  <Text variant="label-xs" className="text-brand">
                    Editar
                  </Text>
                </Pressable>
              </View>
              <Text variant="p-xs">Nome: {form.name || '—'}</Text>
              <Text variant="p-xs">Tipo: {form.type || '—'}</Text>
              <Text variant="p-xs">
                Descrição: {form.description.trim() || '—'}
              </Text>
            </View>

            <View className="gap-3 rounded-xl border border-surface-border bg-[#FCFCFC] p-4">
              <View className="flex-row items-center justify-between">
                <Text variant="label-s">Preço e disponibilidade</Text>
                <Pressable onPress={() => setStep(3)}>
                  <Text variant="label-xs" className="text-brand">
                    Editar
                  </Text>
                </Pressable>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {form.modalities.map((id) => (
                  <View
                    key={id}
                    className="flex-row items-center gap-1 rounded-full px-3 py-1.5"
                    style={{ backgroundColor: '#F5F3FF' }}
                  >
                    <Ionicons name="checkmark" size={12} color="#7C3AED" />
                    <Text
                      variant="plain"
                      style={{ color: '#5B21B6', fontSize: 12 }}
                    >
                      {modalityLabel(id)}
                    </Text>
                  </View>
                ))}
              </View>
              {form.modalities.map((id) => (
                <Text key={id} variant="p-xs">
                  {modalityLabel(id)}: {formatMzn(Number(form.prices[id]) || 0)}
                </Text>
              ))}
            </View>

            <View className="gap-3 rounded-xl border border-surface-border bg-[#FCFCFC] p-4">
              <View className="flex-row items-center justify-between">
                <Text variant="label-s">Comodidades</Text>
                <Pressable onPress={() => setStep(4)}>
                  <Text variant="label-xs" className="text-brand">
                    Editar
                  </Text>
                </Pressable>
              </View>
              <View className="flex-row flex-wrap">
                {form.amenities.length ? (
                  form.amenities.map((label) => (
                    <View
                      key={label}
                      className="mb-3 w-1/2 flex-row items-center gap-2 pr-2"
                    >
                      <Ionicons
                        name={AMENITY_ICONS[label] ?? 'checkmark-outline'}
                        size={16}
                        color={colors.ink.secondary}
                      />
                      <Text variant="p-xs">{label}</Text>
                    </View>
                  ))
                ) : (
                  <Text variant="p-xs">Nenhuma comodidade seleccionada</Text>
                )}
              </View>
            </View>

            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text variant="label-s">Fotos</Text>
                <Pressable onPress={() => setStep(5)}>
                  <Text variant="label-xs" className="text-brand">
                    Editar
                  </Text>
                </Pressable>
              </View>
              <Text variant="p-xs">{form.photos.length} fotos adicionadas</Text>
              {form.photos.length ? (
                <View className="flex-row flex-wrap gap-2">
                  {previewPhotos.map((uri, index) => {
                    const isLast =
                      index === previewPhotos.length - 1 && extraPhotos > 0;
                    return (
                      <View
                        key={`${uri}-${index}`}
                        className="h-[88px] w-[31%] overflow-hidden rounded-xl"
                      >
                        <Image
                          source={{ uri }}
                          style={{ width: '100%', height: '100%' }}
                        />
                        {isLast ? (
                          <View className="absolute inset-0 items-center justify-center bg-black/55">
                            <Text
                              variant="plain"
                              className="font-inter-semibold"
                              style={{ color: '#FFFFFF', fontSize: 16 }}
                            >
                              +{extraPhotos}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    );
                  })}
                </View>
              ) : null}
            </View>

            <Pressable
              onPress={() => patch({ confirmed: !form.confirmed })}
              className="flex-row items-start gap-3"
            >
              <View
                className="mt-0.5 h-5 w-5 items-center justify-center rounded"
                style={{
                  backgroundColor: form.confirmed ? '#FFF7ED' : '#FFFFFF',
                  borderWidth: 1,
                  borderColor: form.confirmed
                    ? colors.brand.DEFAULT
                    : '#D4D4D4',
                }}
              >
                {form.confirmed ? (
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color={colors.brand.DEFAULT}
                  />
                ) : null}
              </View>
              <Text variant="label-m" className="flex-1 text-ink-secondary">
                Confirmo que todas as informações fornecidas são verdadeiras.
              </Text>
            </Pressable>
          </View>
        ) : null}
      </KeyboardScrollView>

      <WizardFooter
        onBack={goBack}
        onContinue={() => void goNext()}
        disabled={busy || (step === TOTAL_STEPS && !form.confirmed)}
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
