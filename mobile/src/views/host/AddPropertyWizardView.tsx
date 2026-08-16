import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';

import {
  WizardFooter,
  WizardProgressHeader,
} from '@/components/host/HostChrome';
import { Input, Screen, SuccessView, Text } from '@/components/ui';
import { propertyAmenities } from '@/data/host.mock';
import { useCreateProperty } from '@/hooks/useHost';
import { propertiesApi } from '@/lib/api/properties';
import { propertyTypeApiByLabel } from '@/lib/mappers/host';
import { colors } from '@/theme/colors';

const TOTAL_STEPS = 5;
const PROPERTY_TYPES = ['Pensão', 'Guest House', 'Apartamento', 'Hostel', 'Lodge'];
const COVER_IMAGE_URL =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop';
const MAPUTO_LAT = -25.9692;
const MAPUTO_LNG = 32.5732;

type FormState = {
  name: string;
  type: string;
  description: string;
  contactName: string;
  phone: string;
  country: string;
  city: string;
  street: string;
  door: string;
  postal: string;
  amenities: string[];
  photos: number;
};

const emptyForm: FormState = {
  name: '',
  type: '',
  description: '',
  contactName: '',
  phone: '',
  country: '',
  city: '',
  street: '',
  door: '',
  postal: '',
  amenities: [],
  photos: 0,
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

function PhotoGrid({
  count,
  onAdd,
}: {
  count: number;
  onAdd: () => void;
}) {
  const slots = Array.from({ length: 9 }, (_, i) => i);
  return (
    <View className="flex-row flex-wrap gap-2">
      {slots.map((i) => {
        if (i === 0) {
          return (
            <Pressable
              key={i}
              onPress={onAdd}
              className="h-[140px] w-[30.5%] items-center justify-center gap-3 rounded-xl border border-dashed border-brand bg-[#FCFCFC]"
            >
              <Ionicons name="add" size={24} color={colors.brand.DEFAULT} />
              <Text variant="label-xs" className="text-ink-muted">
                Adicionar fotos
              </Text>
            </Pressable>
          );
        }
        const filled = i <= count;
        return (
          <View
            key={i}
            className="h-[140px] w-[30.5%] items-center justify-center overflow-hidden rounded-xl border border-surface-border bg-[#FCFCFC]"
          >
            {filled ? (
              <View className="h-full w-full bg-[#E5E5E5]">
                <View className="absolute bottom-2 right-2 h-8 w-8 items-center justify-center rounded-full bg-[#FB2C36]">
                  <Ionicons name="close" size={16} color="#FFFFFF" />
                </View>
              </View>
            ) : (
              <Ionicons name="image-outline" size={24} color="#E5E5E5" />
            )}
          </View>
        );
      })}
    </View>
  );
}

export function AddPropertyWizardView() {
  const [step, setStep] = useState(1);
  const [done, setDone] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const createProperty = useCreateProperty();

  const titles = useMemo(
    () => [
      'Informações do alojamento',
      'Localização da propriedade',
      'Características do alojamento',
      'Fotos do alojamento',
      'Revise o seu anúncio',
    ],
    [],
  );

  const descriptions = useMemo(
    () => [
      'Comece com o nome, tipo e uma descrição clara do seu alojamento.',
      'Indique onde a propriedade fica para os hóspedes a encontrarem.',
      'Ainda não acabamos — adicione comodidades que os hóspedes vão gostar.',
      'Adicione fotos atractivas. A primeira será a capa do anúncio.',
      'Confirme os detalhes antes de publicar o alojamento.',
    ],
    [],
  );

  function patch(partial: Partial<FormState>) {
    setForm((prev) => ({ ...prev, ...partial }));
  }

  function toggleAmenity(label: string) {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(label)
        ? prev.amenities.filter((a) => a !== label)
        : [...prev.amenities, label],
    }));
  }

  function goBack() {
    if (step === 1) {
      router.back();
      return;
    }
    setStep((s) => s - 1);
  }

  function goNext() {
    if (step >= TOTAL_STEPS) {
      const type =
        propertyTypeApiByLabel[form.type] ??
        propertyTypeApiByLabel.Pensão ??
        'pensao';

      createProperty.mutate(
        {
          name: form.name.trim() || 'Novo alojamento',
          type,
          description:
            form.description.trim() || 'Alojamento adicionado via Ogona.',
          contactPhone: form.phone.trim() || '840000000',
          coverImageUrl: COVER_IMAGE_URL,
          province: 'maputo_cidade',
          city: form.city.trim() || 'Maputo',
          community: 'polana',
          neighborhood: form.city.trim() || 'Polana',
          address:
            [form.street, form.door].filter(Boolean).join(', ') ||
            'Av. Julius Nyerere',
          postalCode: form.postal.trim() || undefined,
          latitude: MAPUTO_LAT,
          longitude: MAPUTO_LNG,
        },
        {
          onSuccess: async (property) => {
            try {
              await propertiesApi.updateStatus(property.id, 'published');
            } catch {
              // Property created even if publish fails
            }
            setDone(true);
          },
        },
      );
      return;
    }
    setStep((s) => s + 1);
  }

  function resetWizard() {
    setForm(emptyForm);
    setStep(1);
    setDone(false);
  }

  if (done) {
    return (
      <SuccessView
        title="Propriedade criada com sucesso!"
        description="O seu alojamento foi adicionado. Pode ir ao dashboard ou adicionar outro."
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
        title="Adicionar propriedade"
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
              label="Nome do alojamento"
              placeholder="Ex: Pensão Horizonte Azul"
              value={form.name}
              onChangeText={(name) => patch({ name })}
            />
            <View className="gap-1.5">
              <Text variant="label-xs">Tipo de alojamento</Text>
              <View className="flex-row flex-wrap gap-2">
                {PROPERTY_TYPES.map((t) => {
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
            <View className="gap-1.5">
              <Text variant="label-xs">Descrição</Text>
              <View className="min-h-[172px] rounded-input border border-surface-border bg-surface p-3">
                <TextInput
                  multiline
                  placeholder="Conte mais sobre sua propriedade...."
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
            <Text variant="h4">Contacto</Text>
            <Input
              label="Nome do responsável"
              placeholder="Nome completo"
              value={form.contactName}
              onChangeText={(contactName) => patch({ contactName })}
            />
            <Input
              label="Telefone"
              placeholder="+258 8X XXX XXXX"
              keyboardType="phone-pad"
              value={form.phone}
              onChangeText={(phone) => patch({ phone })}
            />
          </View>
        ) : null}

        {step === 2 ? (
          <View className="gap-4">
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
              onPress={() =>
                patch({
                  country: 'Moçambique',
                  city: 'Maputo',
                  street: 'Av. Julius Nyerere',
                  door: '120',
                  postal: '1100',
                })
              }
              className="h-10 flex-row items-center justify-center gap-2 rounded-xl border border-ink-secondary"
            >
              <Ionicons
                name="navigate-outline"
                size={20}
                color={colors.ink.secondary}
              />
              <Text variant="label-s" className="text-ink-secondary">
                Usar localização actual
              </Text>
            </Pressable>
            <Input
              label="País"
              placeholder="Seleccione o país"
              value={form.country}
              onChangeText={(country) => patch({ country })}
            />
            <Input
              label="Cidade"
              placeholder="Seleccione a cidade"
              value={form.city}
              onChangeText={(city) => patch({ city })}
            />
            <Input
              label="Rua"
              placeholder="Nome da rua"
              value={form.street}
              onChangeText={(street) => patch({ street })}
            />
            <Input
              label="Número"
              placeholder="Nº da porta / edifício"
              value={form.door}
              onChangeText={(door) => patch({ door })}
            />
            <Input
              label="Código postal (Opcional)"
              placeholder="Ex: 1100"
              value={form.postal}
              onChangeText={(postal) => patch({ postal })}
            />
          </View>
        ) : null}

        {step === 3 ? (
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
                  onToggle={() => toggleAmenity(a)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {step === 4 ? (
          <View className="gap-4">
            <Text variant="label-xs">Fotos da propriedade</Text>
            <PhotoGrid
              count={form.photos}
              onAdd={() =>
                patch({ photos: Math.min(8, form.photos + 1) })
              }
            />
          </View>
        ) : null}

        {step === 5 ? (
          <View className="gap-8">
            <Text variant="p-m">Pré-visualização do anúncio</Text>
            <View className="overflow-hidden rounded-xl border border-[#F5F5F5] bg-surface shadow-sm">
              <View className="h-[150px] bg-[#E5E5E5]" />
              <View className="gap-1 p-4">
                <Text variant="label-s">
                  {form.name || 'Pensão Horizonte Azul'}
                </Text>
                <Text variant="p-xs">
                  {[form.city, form.country].filter(Boolean).join(', ') ||
                    'Polana, Maputo'}
                </Text>
              </View>
            </View>

            <View className="gap-2">
              {[
                {
                  icon: 'document-text-outline' as const,
                  title: 'Informações',
                  detail: `${form.type || 'Pensão'} · ${form.contactName || 'Contacto'}`,
                },
                {
                  icon: 'location-outline' as const,
                  title: 'Localização',
                  detail: `${form.street || 'Rua'} ${form.door}`.trim(),
                },
                {
                  icon: 'grid-outline' as const,
                  title: 'Comodidades',
                  detail: `${form.amenities.length || 0} seleccionadas`,
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
                  <Text variant="label-xs" className="text-brand">
                    Editar
                  </Text>
                </View>
              ))}
            </View>

            <Pressable
              onPress={() =>
                patch({
                  amenities: form.amenities.includes('confirm')
                    ? form.amenities
                    : [...form.amenities],
                })
              }
              className="flex-row items-start gap-3"
            >
              <View className="mt-0.5 h-4 w-4 rounded border border-surface-border bg-surface" />
              <Text variant="label-m" className="flex-1 text-ink-secondary">
                Confirmo que as informações estão correctas e aceito as políticas
                da plataforma.
              </Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      <WizardFooter
        onBack={goBack}
        onContinue={goNext}
        continueLabel={
          createProperty.isPending
            ? 'A publicar…'
            : step === TOTAL_STEPS
              ? 'Publicar alojamento'
              : 'Continuar'
        }
      />

      <Modal visible={mapOpen} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/50">
          <View className="rounded-t-xl bg-surface pb-6">
            <View className="items-center border-b border-surface-border px-4 pb-4 pt-2">
              <View className="mb-4 h-0.5 w-6 rounded-full bg-[#FAFAFA]" />
              <Text variant="h6" className="self-stretch text-ink">
                Selecionar no mapa
              </Text>
              <Pressable
                onPress={() => setMapOpen(false)}
                className="absolute right-4 top-4"
              >
                <Ionicons name="close" size={18} color={colors.ink.DEFAULT} />
              </Pressable>
            </View>
            <View className="gap-8 px-4 pt-8">
              <View className="h-[280px] items-center justify-center rounded-2xl bg-[#E5E5E5]">
                <Ionicons
                  name="map"
                  size={48}
                  color={colors.brand.DEFAULT}
                />
                <Text variant="p-s" className="mt-2">
                  Mapa interactivo
                </Text>
              </View>
              <View className="flex-row items-start gap-3 rounded-lg border border-surface-border bg-[#FCFCFC] p-4">
                <View className="h-8 w-8 items-center justify-center rounded-md border border-surface-border bg-[#FAFAFA]">
                  <Ionicons
                    name="location"
                    size={16}
                    color={colors.brand.DEFAULT}
                  />
                </View>
                <Text variant="p-s" className="flex-1">
                  Av. Julius Nyerere, Polana, Maputo, Moçambique
                </Text>
              </View>
              <View className="flex-row gap-2.5">
                <Pressable
                  onPress={() => setMapOpen(false)}
                  className="h-12 flex-1 items-center justify-center rounded-full border border-ink-secondary"
                >
                  <Text variant="label-m" className="text-ink-secondary">
                    Cancelar
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    patch({
                      country: 'Moçambique',
                      city: 'Maputo',
                      street: 'Av. Julius Nyerere',
                      door: '120',
                      postal: '1100',
                    });
                    setMapOpen(false);
                  }}
                  className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-button bg-brand"
                >
                  <Ionicons name="checkmark" size={20} color="#FFFFFF" />
                  <Text variant="label-m" className="text-white">
                    Confirmar
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
