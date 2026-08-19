import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';

import {
  WizardFooter,
  WizardProgressHeader,
} from '@/components/host/HostChrome';
import { PhotoGrid } from '@/components/host/PhotoGrid';
import { PropertySuccessIllustration } from '@/components/icons/PropertySuccessIllustration';
import { LocationPickerModal } from '@/components/maps/LocationPickerModal';
import { Button, Input, Screen, SelectField, Text } from '@/components/ui';
import { propertyAmenities } from '@/data/host.mock';
import { useCreateProperty, useHostProperty, useUpdateProperty } from '@/hooks/useHost';
import { propertiesApi } from '@/lib/api/properties';
import { uploadImages } from '@/lib/firebase/storage';
import { pickImages } from '@/lib/images/picker';
import { MAPUTO_COORDINATE } from '@/lib/maps/config';
import {
  getCurrentLocation,
  provinceFromCity,
  type PickedLocation,
} from '@/lib/maps/geocode';
import { propertyTypeApiByLabel, propertyTypeLabel } from '@/lib/mappers/host';
import { colors } from '@/theme/colors';

const TOTAL_STEPS = 5;
const MAX_PHOTOS = 10;
const MAIN_AMENITY_COUNT = 8;

const PROPERTY_TYPE_OPTIONS = [
  { value: 'Pensão', label: 'Pensão' },
  { value: 'Guest House', label: 'Guest House' },
  { value: 'Hotel', label: 'Hotel' },
  { value: 'Apartamento', label: 'Apartamento' },
  { value: 'Hostel', label: 'Hostel' },
  { value: 'Lodge', label: 'Lodge' },
];

const PROVINCES = [
  { value: 'maputo_cidade', label: 'Cidade de Maputo' },
  { value: 'maputo_provincia', label: 'Maputo Província' },
  { value: 'gaza', label: 'Gaza' },
  { value: 'inhambane', label: 'Inhambane' },
  { value: 'sofala', label: 'Sofala' },
  { value: 'manica', label: 'Manica' },
  { value: 'tete', label: 'Tete' },
  { value: 'zambezia', label: 'Zambézia' },
  { value: 'nampula', label: 'Nampula' },
  { value: 'cabo_delgado', label: 'Cabo Delgado' },
  { value: 'niassa', label: 'Niassa' },
];

const CITIES_BY_PROVINCE: Record<string, { value: string; label: string }[]> = {
  maputo_cidade: [{ value: 'Maputo', label: 'Maputo' }],
  maputo_provincia: [
    { value: 'Matola', label: 'Matola' },
    { value: 'Marracuene', label: 'Marracuene' },
  ],
  gaza: [
    { value: 'Xai-Xai', label: 'Xai-Xai' },
    { value: 'Bilene', label: 'Bilene' },
  ],
  inhambane: [
    { value: 'Inhambane', label: 'Inhambane' },
    { value: 'Vilanculos', label: 'Vilanculos' },
    { value: 'Tofo', label: 'Tofo' },
  ],
  sofala: [{ value: 'Beira', label: 'Beira' }],
  manica: [{ value: 'Chimoio', label: 'Chimoio' }],
  tete: [{ value: 'Tete', label: 'Tete' }],
  zambezia: [{ value: 'Quelimane', label: 'Quelimane' }],
  nampula: [
    { value: 'Nampula', label: 'Nampula' },
    { value: 'Nacala', label: 'Nacala' },
  ],
  cabo_delgado: [{ value: 'Pemba', label: 'Pemba' }],
  niassa: [{ value: 'Lichinga', label: 'Lichinga' }],
};

type FormState = {
  name: string;
  type: string;
  description: string;
  phone: string;
  whatsapp: string;
  province: string;
  city: string;
  neighborhood: string;
  address: string;
  postal: string;
  amenities: string[];
  photos: string[];
  latitude: number;
  longitude: number;
  confirmed: boolean;
};

const emptyForm: FormState = {
  name: '',
  type: '',
  description: '',
  phone: '',
  whatsapp: '',
  province: '',
  city: '',
  neighborhood: '',
  address: '',
  postal: '',
  amenities: [],
  photos: [],
  latitude: MAPUTO_COORDINATE.latitude,
  longitude: MAPUTO_COORDINATE.longitude,
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

export function AddPropertyWizardView() {
  const { propertyId } = useLocalSearchParams<{ propertyId?: string }>();
  const editingId = propertyId ? String(propertyId) : undefined;
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [createdId, setCreatedId] = useState<string | undefined>();
  const [mapOpen, setMapOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();
  const existing = useHostProperty(editingId);
  const busy = uploading || createProperty.isPending || updateProperty.isPending;

  const cityOptions = useMemo(() => {
    const base = form.province
      ? (CITIES_BY_PROVINCE[form.province] ?? [])
      : Object.values(CITIES_BY_PROVINCE).flat();
    if (form.city && !base.some((option) => option.value === form.city)) {
      return [...base, { value: form.city, label: form.city }];
    }
    return base;
  }, [form.province, form.city]);

  const visibleAmenities = showAllAmenities
    ? propertyAmenities
    : propertyAmenities.slice(0, MAIN_AMENITY_COUNT);

  const previewPhotos = form.photos.slice(0, 6);
  const extraPhotos = Math.max(0, form.photos.length - 6);

  useEffect(() => {
    const raw = existing.data?.raw;
    if (!raw) return;
    setForm({
      name: raw.name,
      type: propertyTypeLabel[raw.type] ?? raw.type,
      description: raw.description ?? '',
      phone: raw.contactPhone ?? '',
      whatsapp: raw.whatsapp ?? '',
      province: raw.location.province ?? provinceFromCity(raw.location.city ?? ''),
      city: raw.location.city ?? '',
      neighborhood: raw.location.neighborhood ?? '',
      address: raw.location.address ?? '',
      postal: raw.location.postalCode ?? '',
      amenities: [],
      photos: raw.coverImageUrl ? [raw.coverImageUrl] : [],
      latitude: raw.location.latitude ?? MAPUTO_COORDINATE.latitude,
      longitude: raw.location.longitude ?? MAPUTO_COORDINATE.longitude,
      confirmed: false,
    });
  }, [existing.data?.raw]);

  function patch(partial: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  function applyLocation(location: PickedLocation) {
    setForm((prev) => {
      const city = location.city || prev.city;
      return {
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
        city,
        province: city ? provinceFromCity(city) : prev.province,
        neighborhood: prev.neighborhood || location.street || prev.neighborhood,
        address:
          [location.street, location.door].filter(Boolean).join(', ') ||
          prev.address,
        postal: location.postal || prev.postal,
      };
    });
  }

  async function useDeviceLocation() {
    if (locating) return;
    setLocating(true);
    try {
      applyLocation(await getCurrentLocation());
    } catch (error) {
      Alert.alert(
        'Não foi possível obter a localização',
        error instanceof Error ? error.message : 'Tente novamente.',
      );
    } finally {
      setLocating(false);
    }
  }

  function toggleAmenity(label: string) {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(label)
        ? prev.amenities.filter((a) => a !== label)
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

    const type =
      propertyTypeApiByLabel[form.type] ??
      propertyTypeApiByLabel.Pensão ??
      'pensao';

    setUploading(true);
    try {
      const localPhotos = form.photos.filter((uri) => !/^https?:\/\//.test(uri));
      const remotePhotos = form.photos.filter((uri) => /^https?:\/\//.test(uri));
      const uploaded = localPhotos.length
        ? await uploadImages(localPhotos, 'properties')
        : [];
      const coverImageUrl = uploaded[0] ?? remotePhotos[0];

      const input = {
        name: form.name.trim() || 'Novo alojamento',
        type,
        description:
          form.description.trim() || 'Alojamento adicionado via Ogona.',
        contactPhone: form.phone.trim() || '840000000',
        whatsapp:
          form.whatsapp.replace(/\s|-/g, '').length >= 9
            ? form.whatsapp.trim()
            : undefined,
        coverImageUrl,
        province: (form.province ||
          provinceFromCity(form.city.trim() || 'Maputo')) as string,
        city: form.city.trim() || 'Maputo',
        community: 'outra' as const,
        neighborhood: form.neighborhood.trim() || form.city.trim() || 'Polana',
        address: form.address.trim() || 'Avenida Julius Nyerere, nº 120',
        postalCode: form.postal.trim() || undefined,
        latitude: form.latitude,
        longitude: form.longitude,
      };

      if (editingId) {
        updateProperty.mutate(
          { id: editingId, input },
          {
            onSuccess: () => {
              setCreatedId(editingId);
              setDone(true);
            },
            onError: (error) => {
              Alert.alert(
                'Não foi possível guardar',
                error instanceof Error ? error.message : 'Tente novamente.',
              );
            },
            onSettled: () => setUploading(false),
          },
        );
        return;
      }

      createProperty.mutate(input, {
        onSuccess: async (property) => {
          setCreatedId(property.id);
          try {
            await propertiesApi.updateStatus(property.id, 'published');
          } catch {
            // Property created even if publish fails
          }
          setDone(true);
        },
        onError: (error) => {
          Alert.alert(
            'Não foi possível publicar',
            error instanceof Error ? error.message : 'Tente novamente.',
          );
        },
        onSettled: () => setUploading(false),
      });
    } catch (error) {
      setUploading(false);
      Alert.alert(
        'Não foi possível enviar as fotos',
        error instanceof Error ? error.message : 'Tente novamente.',
      );
    }
  }

  if (done) {
    const targetId = createdId ?? editingId;
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
              {editingId
                ? 'Propriedade actualizada com sucesso!'
                : 'Propriedade criada com sucesso!'}
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
              {editingId
                ? 'As alterações foram guardadas e o anúncio está actualizado.'
                : 'A sua propriedade foi cadastrada com sucesso e está pronta para receber quartos. O próximo passo é adicionar pelo menos um quarto para que os hóspedes possam fazer reservas.'}
            </Text>
          </View>
        </View>

        <View className="gap-3 pb-6">
          {editingId ? (
            <Button
              className="h-14 w-full rounded-2xl"
              onPress={() =>
                router.replace(
                  targetId
                    ? `/(host)/property/${targetId}`
                    : '/(host)/(tabs)',
                )
              }
            >
              Ver propriedade
            </Button>
          ) : (
            <Button
              className="h-14 w-full rounded-2xl"
              onPress={() => {
                const params = new URLSearchParams();
                if (targetId) params.set('propertyId', targetId);
                if (form.amenities.length) {
                  params.set('amenities', form.amenities.join('|'));
                }
                const query = params.toString();
                router.replace(
                  query ? `/(host)/add-room?${query}` : '/(host)/add-room',
                );
              }}
            >
              Adicionar primeiro quarto
            </Button>
          )}
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
        title={editingId ? 'Editar propriedade' : 'Adicionar propriedade'}
        step={step}
        total={TOTAL_STEPS}
      />

      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-8 px-6 py-4 pb-8"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 1 ? (
          <View className="gap-6">
            <View className="gap-1.5">
              <Text variant="h3">Informações da propriedade</Text>
              <Text variant="p-m">
                Preencha as informações principais para que os hóspedes conheçam
                a sua propriedade.
              </Text>
            </View>
            <Input
              label="Nome da propriedade"
              required
              placeholder="Ex.: Pensão Horizonte Azul"
              value={form.name}
              onChangeText={(name) => patch({ name })}
            />
            <SelectField
              label="Tipo de propriedade"
              placeholder="Selecione uma opção"
              value={form.type}
              options={PROPERTY_TYPE_OPTIONS}
              onChange={(type) => patch({ type })}
            />
            <View className="gap-1.5">
              <Text variant="label-xs">Descrição</Text>
              <View className="min-h-[172px] rounded-input border border-surface-border bg-surface p-3">
                <TextInput
                  multiline
                  placeholder="Descreva a sua propriedade, os diferenciais, o ambiente e o que os hóspedes podem esperar durante a estadia."
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
            <View className="gap-4">
              <Text variant="h4">Contacto</Text>
              <Input
                label="Número de contacto"
                placeholder="Ex.: +258 84 123 4567"
                keyboardType="phone-pad"
                value={form.phone}
                onChangeText={(phone) => patch({ phone })}
              />
              <Input
                label="WhatsApp"
                placeholder="Ex.: +258 84 123 4567"
                keyboardType="phone-pad"
                value={form.whatsapp}
                onChangeText={(whatsapp) => patch({ whatsapp })}
              />
            </View>
          </View>
        ) : null}

        {step === 2 ? (
          <View className="gap-4">
            <View className="gap-1.5">
              <Text variant="h3">Localização da propriedade</Text>
              <Text variant="p-m">
                Informe onde a propriedade está localizada para facilitar que os
                hóspedes a encontrem.
              </Text>
            </View>
            <Pressable
              onPress={() => setMapOpen(true)}
              className="h-10 flex-row items-center justify-center gap-2 rounded-xl border border-ink-secondary"
            >
              <Ionicons name="map-outline" size={20} color={colors.ink.secondary} />
              <Text variant="label-s" className="text-ink-secondary">
                Selecionar no mapa
              </Text>
            </Pressable>
            <View className="flex-row items-center gap-2">
              <View className="h-px flex-1 bg-[#F5F5F5]" />
              <Text variant="label-s" className="text-[#D4D4D4]">
                OU
              </Text>
              <View className="h-px flex-1 bg-[#F5F5F5]" />
            </View>
            <Pressable
              onPress={() => void useDeviceLocation()}
              disabled={locating}
              className="h-10 flex-row items-center justify-center gap-2 rounded-xl border border-ink-secondary"
              style={{ opacity: locating ? 0.6 : 1 }}
            >
              <Ionicons
                name="navigate-outline"
                size={20}
                color={colors.ink.secondary}
              />
              <Text variant="label-s" className="text-ink-secondary">
                {locating ? 'A obter localização…' : 'Usar localização atual'}
              </Text>
            </Pressable>
            <SelectField
              label="Província"
              placeholder="Selecione a província"
              value={form.province}
              options={PROVINCES}
              onChange={(province) => {
                const cities = CITIES_BY_PROVINCE[province] ?? [];
                const cityStillValid = cities.some((c) => c.value === form.city);
                patch({ province, city: cityStillValid ? form.city : '' });
              }}
            />
            <SelectField
              label="Cidade"
              placeholder="Selecione a cidade"
              value={form.city}
              options={cityOptions}
              onChange={(city) => patch({ city })}
            />
            <Input
              label="Bairro"
              placeholder="Digite o bairro"
              value={form.neighborhood}
              onChangeText={(neighborhood) => patch({ neighborhood })}
            />
            <Input
              label="Endereço"
              placeholder="Ex.: Avenida Julius Nyerere, nº 120"
              value={form.address}
              onChangeText={(address) => patch({ address })}
            />
            <Input
              label="Codigo postal (Opcional)"
              placeholder="EX: 1205"
              value={form.postal}
              onChangeText={(postal) => patch({ postal })}
            />
          </View>
        ) : null}

        {step === 3 ? (
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
              {visibleAmenities.map((a) => (
                <AmenityRow
                  key={a}
                  label={a}
                  checked={form.amenities.includes(a)}
                  onToggle={() => toggleAmenity(a)}
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

        {step === 4 ? (
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

        {step === 5 ? (
          <View className="gap-6">
            <View className="gap-1.5">
              <Text variant="h3">Revise o seu quarto</Text>
              <Text variant="p-m">
                Confirme todas as informações antes de publicar.
              </Text>
            </View>

            <View className="gap-2">
              <Text variant="p-m">Pré-visualização do anúncio</Text>
              <View className="overflow-hidden rounded-xl border border-[#F5F5F5] bg-surface shadow-sm">
                <View>
                  {form.photos[0] ? (
                    <Image
                      source={{ uri: form.photos[0] }}
                      style={{ height: 150, width: '100%' }}
                    />
                  ) : (
                    <View className="h-[150px] bg-[#E5E5E5]" />
                  )}
                  {editingId ? null : (
                    <View
                      className="absolute left-3 top-3 rounded-full px-2.5 py-1"
                      style={{ backgroundColor: '#DBEAFE' }}
                    >
                      <Text
                        variant="plain"
                        style={{
                          color: '#1D4ED8',
                          fontSize: 11,
                          fontWeight: '600',
                        }}
                      >
                        Novo anúncio
                      </Text>
                    </View>
                  )}
                </View>
                <View className="gap-1 p-4">
                  <Text variant="label-s">
                    {form.name || 'Pensão Horizonte Azul'}
                  </Text>
                  <Text variant="p-xs">
                    {[form.neighborhood, form.city].filter(Boolean).join(', ') ||
                      'Polana, Maputo'}
                  </Text>
                </View>
              </View>
            </View>

            <View className="gap-2">
              {[
                {
                  step: 1,
                  icon: 'document-text-outline' as const,
                  title: 'Informações',
                  detail: `${form.type || 'Hotel'} • ${
                    form.description.trim()
                      ? 'descrição definida'
                      : 'sem descrição'
                  }`,
                },
                {
                  step: 2,
                  icon: 'location-outline' as const,
                  title: 'Localização',
                  detail:
                    [form.neighborhood, form.city].filter(Boolean).join(', ') ||
                    'Localização por definir',
                },
                {
                  step: 3,
                  icon: 'grid-outline' as const,
                  title: 'Comodidades',
                  detail: `${form.amenities.length} comodidades selecionadas`,
                },
              ].map((row) => (
                <View
                  key={row.title}
                  className="flex-row items-start justify-between rounded-lg border border-surface-border bg-[#FCFCFC] p-4"
                >
                  <View className="flex-1 flex-row gap-3">
                    <Ionicons
                      name={row.icon}
                      size={16}
                      color={colors.brand.DEFAULT}
                    />
                    <View className="gap-0.5">
                      <Text variant="label-s">{row.title}</Text>
                      <Text variant="p-xs">{row.detail}</Text>
                    </View>
                  </View>
                  <Pressable onPress={() => setStep(row.step)}>
                    <Text variant="label-xs" className="text-brand">
                      Editar
                    </Text>
                  </Pressable>
                </View>
              ))}
            </View>

            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <Text variant="label-s">Fotos</Text>
                <Pressable onPress={() => setStep(4)}>
                  <Text variant="label-xs" className="text-brand">
                    Editar
                  </Text>
                </Pressable>
              </View>
              <Text variant="p-xs">
                {form.photos.length} fotos adicionadas
              </Text>
              {form.photos.length ? (
                <View className="flex-row flex-wrap gap-2">
                  {previewPhotos.map((uri, index) => {
                    const isLast = index === previewPhotos.length - 1 && extraPhotos > 0;
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
      </ScrollView>

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
              ? 'Publicar Propriedade'
              : 'Continuar'
        }
      />

      <LocationPickerModal
        visible={mapOpen}
        latitude={form.latitude}
        longitude={form.longitude}
        onClose={() => setMapOpen(false)}
        onConfirm={applyLocation}
      />
    </Screen>
  );
}
