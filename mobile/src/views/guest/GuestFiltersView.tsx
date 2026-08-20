import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import {
  GuestScreenHeader,
  StickyFooter,
} from '@/components/guest/GuestChrome';
import { Screen, SelectField, KeyboardScrollView, Text } from '@/components/ui';
import {
  useFiltersStore,
  type FiltersState,
} from '@/stores/filters.store';
import { colors } from '@/theme/colors';

const lodgingTypes = [
  { value: 'pensao', label: 'Pensão' },
  { value: 'casa', label: 'Guest House' },
  { value: 'hostel', label: 'Hostel' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'lodge', label: 'Lodge' },
];

const ratingOptions = [
  { id: 'all', label: 'Todos', star: false },
  { id: '3', label: '3+', star: true },
  { id: '4', label: '4+', star: true },
  { id: '4.5', label: '4.5+', star: true },
];

const modalities = [
  { id: 'hour', label: 'Hora' },
  { id: 'night', label: 'Noite' },
  { id: 'week', label: 'Semana' },
  { id: 'month', label: 'Mês' },
];

const roomOptions = ['1+', '2+', '3+', '4+', '5+'];
const bathOptions = ['1+', '2+', '3+', '4+', '5+'];
const parkingOptions = [
  { id: 'none', label: 'Sem vaga' },
  { id: '2', label: '2+' },
  { id: '3', label: '3+' },
  { id: '4', label: '4+' },
  { id: '5', label: '5+' },
];

function FieldLabel({ children }: { children: string }) {
  return (
    <Text
      variant="plain"
      className="font-inter-semibold"
      style={{ color: colors.ink.secondary, fontSize: 16, lineHeight: 20 }}
    >
      {children}
    </Text>
  );
}

function Pill({
  label,
  active,
  onPress,
  star,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  star?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="h-[34px] flex-row items-center rounded-full px-3"
      style={{
        backgroundColor: active ? colors.brand.DEFAULT : '#FFFFFF',
        borderWidth: 1,
        borderColor: active ? colors.brand.DEFAULT : colors.surface.border,
      }}
    >
      {star ? (
        <Ionicons
          name="star"
          size={12}
          color={active ? '#FFFFFF' : colors.ink.secondary}
          style={{ marginRight: 4 }}
        />
      ) : null}
      <Text
        variant="plain"
        className={active ? 'font-inter' : 'font-inter-semibold'}
        style={{
          color: active ? '#FFFFFF' : colors.ink.secondary,
          fontSize: 14,
          lineHeight: 18,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { id: string; label: string; star?: boolean }[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <View className="flex-row overflow-hidden rounded-xl">
      {options.map((opt, i) => {
        const active = value === opt.id;
        const first = i === 0;
        const last = i === options.length - 1;
        return (
          <Pressable
            key={opt.id}
            onPress={() => onChange(opt.id)}
            className="h-14 flex-row items-center justify-center px-4"
            style={{
              flex: opt.label.length > 4 ? undefined : 1,
              backgroundColor: active ? colors.brand.soft : '#FCFCFC',
              borderWidth: 1,
              borderColor: active ? colors.brand.DEFAULT : '#F5F5F5',
              marginLeft: first ? 0 : -1,
              borderTopLeftRadius: first ? 12 : 0,
              borderBottomLeftRadius: first ? 12 : 0,
              borderTopRightRadius: last ? 12 : 0,
              borderBottomRightRadius: last ? 12 : 0,
              zIndex: active ? 2 : 1,
            }}
          >
            <Text
              variant="plain"
              numberOfLines={1}
              style={{
                color: colors.ink.secondary,
                fontSize: opt.label.length > 4 ? 16 : 17,
                lineHeight: 22,
                fontWeight: opt.label.length > 4 ? '600' : '400',
              }}
            >
              {opt.label}
            </Text>
            {opt.star ? (
              <Ionicons
                name="star-outline"
                size={10}
                color={colors.ink.muted}
                style={{ marginLeft: 4 }}
              />
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function PriceField({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <View className="h-14 flex-1 flex-row items-center rounded-xl border border-[#F5F5F5] bg-surface px-4">
      <Text variant="plain" style={{ color: colors.ink.muted, fontSize: 16, marginRight: 8 }}>
        MZN
      </Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        keyboardType="numeric"
        placeholderTextColor={colors.ink.soft}
        className="flex-1 font-inter text-[16px] text-ink"
      />
    </View>
  );
}

export function GuestFiltersView() {
  const saved = useFiltersStore((s) => s.filters);
  const setFilters = useFiltersStore((s) => s.setFilters);
  const startExplore = useFiltersStore((s) => s.startExplore);
  const clearStore = useFiltersStore((s) => s.clearFilters);

  const [destination, setDestination] = useState(saved.destination);
  const [propertyType, setPropertyType] = useState(saved.types[0] ?? '');
  const [rating, setRating] = useState(saved.rating);
  const [priceMin, setPriceMin] = useState(saved.priceMin);
  const [priceMax, setPriceMax] = useState(saved.priceMax);
  const [modality, setModality] = useState(saved.modality);
  const [rooms, setRooms] = useState(saved.rooms);
  const [baths, setBaths] = useState(saved.baths);
  const [parking, setParking] = useState(saved.parking);

  const draft: FiltersState = {
    destination,
    types: propertyType ? [propertyType] : [],
    rating,
    priceMin,
    priceMax,
    modality,
    rooms,
    baths,
    parking,
  };

  const clearAll = () => {
    setDestination('');
    setPropertyType('');
    setRating('all');
    setPriceMin('');
    setPriceMax('');
    setModality('night');
    setRooms('1+');
    setBaths('1+');
    setParking('none');
    clearStore();
  };

  const apply = () => {
    setFilters(draft);
    startExplore(draft.destination.trim() ? 'city' : 'all', draft.destination);
    router.navigate('/(guest)/(tabs)/explore');
  };

  return (
    <Screen className="bg-surface" contentClassName="flex-1" keyboard>
      <GuestScreenHeader
        title="Filtros"
        onBack={() => router.back()}
        right={
          <Pressable onPress={clearAll} hitSlop={8}>
            <Text
              variant="plain"
              className="font-inter-semibold"
              style={{ color: colors.brand.DEFAULT, fontSize: 14, lineHeight: 18 }}
            >
              Limpar
            </Text>
          </Pressable>
        }
      />

      <KeyboardScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-6 pb-8 pt-12"
        extraHeight={40}
      >
        <View className="gap-2">
          <FieldLabel>Destino</FieldLabel>
          <View className="h-14 flex-row items-center justify-between rounded-2xl border border-surface-border bg-surface px-4">
            <TextInput
              value={destination}
              onChangeText={setDestination}
              placeholder="Pesquisa cidade ou bairro"
              placeholderTextColor={colors.ink.soft}
              className="flex-1 font-inter text-p-s text-ink"
            />
            <Ionicons name="location-outline" size={24} color={colors.ink.muted} />
          </View>
        </View>

        <SelectField
          label="Tipo de propriedade"
          value={propertyType}
          placeholder="Selecione o tipo de propriedade"
          options={lodgingTypes}
          onChange={setPropertyType}
        />

        <View className="gap-4">
          <FieldLabel>Avaliação mínima</FieldLabel>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="gap-3"
          >
            {ratingOptions.map((opt) => (
              <Pill
                key={opt.id}
                label={opt.label}
                star={opt.star}
                active={rating === opt.id}
                onPress={() => setRating(opt.id)}
              />
            ))}
          </ScrollView>
        </View>

        <View className="gap-2">
          <FieldLabel>Preço</FieldLabel>
          <View className="flex-row gap-2">
            <PriceField value={priceMin} onChange={setPriceMin} placeholder="500" />
            <PriceField value={priceMax} onChange={setPriceMax} placeholder="10.000" />
          </View>
        </View>

        <View className="gap-3">
          <Text
            variant="plain"
            className="font-manrope"
            style={{ color: colors.ink.DEFAULT, fontSize: 16, lineHeight: 20, fontWeight: '600' }}
          >
            Modalidade
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {modalities.map((opt) => (
              <Pill
                key={opt.id}
                label={opt.label}
                active={modality === opt.id}
                onPress={() => setModality(opt.id)}
              />
            ))}
          </View>
        </View>

        <View className="gap-2">
          <FieldLabel>Quartos</FieldLabel>
          <Segmented
            options={roomOptions.map((id, i) => ({
              id,
              label: id,
              star: i === 0,
            }))}
            value={rooms}
            onChange={setRooms}
          />
        </View>

        <View className="gap-2">
          <FieldLabel>Banheiros</FieldLabel>
          <Segmented
            options={bathOptions.map((id) => ({ id, label: id }))}
            value={baths}
            onChange={setBaths}
          />
        </View>

        <View className="gap-2">
          <FieldLabel>Vagas de carro</FieldLabel>
          <Segmented
            options={parkingOptions}
            value={parking}
            onChange={setParking}
          />
        </View>
      </KeyboardScrollView>
      <StickyFooter>
        <View className="flex-row gap-3">
          <Pressable
            onPress={clearAll}
            className="h-[53px] flex-1 items-center justify-center rounded-[15px]"
            style={{
              backgroundColor: '#FFFFFF',
              borderWidth: 1,
              borderColor: colors.brand.DEFAULT,
            }}
          >
            <Text
              variant="plain"
              className="font-inter-semibold"
              style={{ color: colors.brand.DEFAULT, fontSize: 15, lineHeight: 22 }}
            >
              Limpar
            </Text>
          </Pressable>
          <Pressable
            onPress={apply}
            className="h-[53px] flex-1 items-center justify-center rounded-[15px]"
            style={{ backgroundColor: colors.brand.DEFAULT }}
          >
            <Text
              variant="plain"
              className="font-inter-semibold"
              style={{ color: '#FFFFFF', fontSize: 15, lineHeight: 22 }}
            >
              Aplicar filtros
            </Text>
          </Pressable>
        </View>
      </StickyFooter>
    </Screen>
  );
}
