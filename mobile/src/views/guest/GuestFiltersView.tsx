import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import {
  GuestScreenHeader,
  StickyFooter,
} from '@/components/guest/GuestChrome';
import { Button, Screen, Text } from '@/components/ui';
import { colors } from '@/theme/colors';

const lodgingTypes = [
  { id: 'hotel', label: 'Hotel' },
  { id: 'apartment', label: 'Apartamento' },
  { id: 'house', label: 'Vivenda' },
  { id: 'room', label: 'Quarto' },
  { id: 'lodge', label: 'Lodge' },
];

const ratingOptions = [
  { id: 'all', label: 'Todos' },
  { id: '3', label: '3+' },
  { id: '4', label: '4+' },
  { id: '4.5', label: '4.5+' },
];

const modalities = [
  { id: 'hour', label: 'Hora' },
  { id: 'night', label: 'Noite' },
  { id: 'month', label: 'Mês' },
];

const roomOptions = ['1+', '2+', '3+', '4+', '5+'];
const bathOptions = ['1+', '2+', '3+'];
const parkingOptions = [
  { id: 'none', label: 'Sem vaga' },
  { id: '1', label: '1+' },
  { id: '2', label: '2+' },
  { id: '3', label: '3+' },
];

function ChipGroup({
  options,
  value,
  onChange,
  multi,
}: {
  options: { id: string; label: string }[];
  value: string | string[];
  onChange: (id: string) => void;
  multi?: boolean;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((opt) => {
        const active = multi
          ? (value as string[]).includes(opt.id)
          : value === opt.id;
        return (
          <Pressable
            key={opt.id}
            onPress={() => onChange(opt.id)}
            className={`h-9 items-center justify-center rounded-full border px-3.5 ${
              active
                ? 'border-brand bg-brand'
                : 'border-surface-border bg-surface'
            }`}
          >
            <Text
              variant="label-xs"
              className={active ? 'text-white' : 'text-ink-secondary'}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View className="flex-row overflow-hidden rounded-xl border border-surface-border">
      {options.map((opt, i) => {
        const active = value === opt;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            className={`h-11 flex-1 items-center justify-center ${
              active ? 'bg-brand' : 'bg-surface'
            } ${i > 0 ? 'border-l border-surface-border' : ''}`}
          >
            <Text
              variant="label-s"
              className={active ? 'text-white' : 'text-ink-secondary'}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function FieldLabel({ children }: { children: string }) {
  return (
    <Text variant="label-s" className="mb-2">
      {children}
    </Text>
  );
}

export function GuestFiltersView() {
  const [destination, setDestination] = useState('');
  const [types, setTypes] = useState<string[]>([]);
  const [rating, setRating] = useState('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [modality, setModality] = useState('night');
  const [rooms, setRooms] = useState('1+');
  const [baths, setBaths] = useState('1+');
  const [parking, setParking] = useState('none');

  const clearAll = () => {
    setDestination('');
    setTypes([]);
    setRating('all');
    setPriceMin('');
    setPriceMax('');
    setModality('night');
    setRooms('1+');
    setBaths('1+');
    setParking('none');
  };

  const toggleType = (id: string) => {
    setTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id],
    );
  };

  return (
    <Screen className="bg-[#FCFCFC]" contentClassName="flex-1" keyboard>
      <GuestScreenHeader
        title="Filtros"
        onBack={() => router.back()}
        right={
          <Pressable onPress={clearAll} hitSlop={8}>
            <Text variant="label-s" className="text-brand">
              Limpar
            </Text>
          </Pressable>
        }
      />

      <ScrollView
        className="flex-1"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="gap-6 px-6 pb-8 pt-6"
      >
        <View>
          <FieldLabel>Destino</FieldLabel>
          <View className="h-[54px] justify-center rounded-input border border-surface-border bg-surface px-4">
            <TextInput
              value={destination}
              onChangeText={setDestination}
              placeholder="Cidade, bairro ou região"
              placeholderTextColor={colors.ink.soft}
              className="font-inter text-p-s text-ink"
            />
          </View>
        </View>

        <View>
          <FieldLabel>Tipo de alojamento</FieldLabel>
          <ChipGroup
            options={lodgingTypes}
            value={types}
            onChange={toggleType}
            multi
          />
        </View>

        <View>
          <FieldLabel>Avaliação mínima</FieldLabel>
          <ChipGroup
            options={ratingOptions}
            value={rating}
            onChange={setRating}
          />
        </View>

        <View>
          <FieldLabel>Preço (MZN)</FieldLabel>
          <View className="flex-row gap-3">
            <View className="h-[54px] flex-1 justify-center rounded-input border border-surface-border bg-surface px-4">
              <TextInput
                value={priceMin}
                onChangeText={setPriceMin}
                placeholder="Mín"
                keyboardType="numeric"
                placeholderTextColor={colors.ink.soft}
                className="font-inter text-p-s text-ink"
              />
            </View>
            <View className="h-[54px] flex-1 justify-center rounded-input border border-surface-border bg-surface px-4">
              <TextInput
                value={priceMax}
                onChangeText={setPriceMax}
                placeholder="Máx"
                keyboardType="numeric"
                placeholderTextColor={colors.ink.soft}
                className="font-inter text-p-s text-ink"
              />
            </View>
          </View>
        </View>

        <View>
          <FieldLabel>Modalidade</FieldLabel>
          <ChipGroup
            options={modalities}
            value={modality}
            onChange={setModality}
          />
        </View>

        <View>
          <FieldLabel>Quartos</FieldLabel>
          <Segmented options={roomOptions} value={rooms} onChange={setRooms} />
        </View>

        <View>
          <FieldLabel>Banheiros</FieldLabel>
          <Segmented options={bathOptions} value={baths} onChange={setBaths} />
        </View>

        <View>
          <FieldLabel>Vagas</FieldLabel>
          <ChipGroup
            options={parkingOptions}
            value={parking}
            onChange={setParking}
          />
        </View>
      </ScrollView>

      <StickyFooter>
        <View className="flex-row gap-2.5">
          <Pressable
            onPress={clearAll}
            className="h-14 flex-1 items-center justify-center rounded-button border border-ink-secondary"
          >
            <Text variant="label-m" className="text-ink-secondary">
              Limpar
            </Text>
          </Pressable>
          <View className="flex-1">
            <Button onPress={() => router.back()}>Aplicar filtros</Button>
          </View>
        </View>
      </StickyFooter>
    </Screen>
  );
}
