import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, TextInput, View } from 'react-native';

import {
  GuestScreenHeader,
  StickyFooter,
} from '@/components/guest/GuestChrome';
import { Button, Screen, Text } from '@/components/ui';
import { useGuestReservation } from '@/hooks/useReservations';
import { useCreateReview } from '@/hooks/useReviews';
import { colors } from '@/theme/colors';

export function GuestReviewView() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const reservationId = id ? String(id) : undefined;
  const reservationQuery = useGuestReservation(reservationId);
  const createReview = useCreateReview();
  const reservation = reservationQuery.data;

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <Screen contentClassName="justify-between px-6 pb-6 pt-16">
        <View className="items-center gap-4 pt-20">
          <View
            className="h-20 w-20 items-center justify-center rounded-full"
            style={{ backgroundColor: '#FFF7ED' }}
          >
            <Ionicons
              name="checkmark"
              size={36}
              color={colors.brand.DEFAULT}
            />
          </View>
          <Text variant="h3" className="text-center">
            Obrigado pela avaliação
          </Text>
          <Text variant="p-m" className="text-center">
            A sua opinião ajuda outros viajantes a escolher melhor.
          </Text>
        </View>
        <Button onPress={() => router.replace('/(guest)/(tabs)')}>
          Voltar ao início
        </Button>
      </Screen>
    );
  }

  if (reservationQuery.isLoading || !reservation) {
    return (
      <Screen contentClassName="items-center justify-center">
        {reservationQuery.isError ? (
          <Text variant="p-s">
            {reservationQuery.error instanceof Error
              ? reservationQuery.error.message
              : 'Reserva não encontrada'}
          </Text>
        ) : (
          <ActivityIndicator color={colors.brand.DEFAULT} />
        )}
      </Screen>
    );
  }

  return (
    <Screen className="bg-[#FCFCFC]" contentClassName="flex-1" keyboard>
      <GuestScreenHeader
        title="Avaliar estadia"
        onBack={() => router.back()}
      />

      <View className="flex-1 gap-6 px-6 pt-6">
        <View className="gap-1">
          <Text variant="h5">{reservation.property}</Text>
          <Text variant="p-s">{reservation.room}</Text>
        </View>

        <View className="items-center gap-3">
          <Text variant="label-s">Como foi a sua experiência?</Text>
          <View className="flex-row gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => setRating(star)} hitSlop={6}>
                <Ionicons
                  name={star <= rating ? 'star' : 'star-outline'}
                  size={36}
                  color={
                    star <= rating ? colors.brand.DEFAULT : colors.ink.soft
                  }
                />
              </Pressable>
            ))}
          </View>
        </View>

        <View className="gap-1.5">
          <Text variant="label-xs">Comentário</Text>
          <View className="min-h-[140px] rounded-input border border-surface-border bg-surface px-4 py-3">
            <TextInput
              value={comment}
              onChangeText={(v) => setComment(v.slice(0, 500))}
              placeholder="Conte-nos como foi a estadia…"
              placeholderTextColor={colors.ink.soft}
              multiline
              textAlignVertical="top"
              className="min-h-[110px] font-inter text-p-s text-ink"
            />
          </View>
          <Text variant="p-xs" className="text-right">
            {comment.length}/500
          </Text>
        </View>
      </View>

      <StickyFooter>
        <Button
          disabled={rating === 0 || createReview.isPending}
          onPress={() => {
            if (!reservationId) return;
            createReview.mutate(
              {
                reservationId,
                rating,
                comment: comment.trim() || undefined,
              },
              { onSuccess: () => setSent(true) },
            );
          }}
        >
          {createReview.isPending ? 'A enviar…' : 'Enviar'}
        </Button>
      </StickyFooter>
    </Screen>
  );
}
