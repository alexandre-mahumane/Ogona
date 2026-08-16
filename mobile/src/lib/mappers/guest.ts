import type {
  ApiReservation,
  BookingModality,
  DiscoverCard,
  DiscoverCity,
  DiscoverPropertyDetail,
  DiscoverRoomDetail,
  ReservationDisplayStatus,
} from '@/lib/api/types';
import type {
  GuestListing,
  GuestReservation,
  GuestReservationStatus,
  GuestReview,
  GuestRoom,
  StayModality,
} from '@/data/guest.mock';

const PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop';

const amenityMeta: Record<string, { icon: string; label: string }> = {
  wifi_gratuito: { icon: 'wifi', label: 'Wi-Fi' },
  ar_condicionado: { icon: 'snow', label: 'AC' },
  televisao: { icon: 'tv', label: 'TV' },
  agua_quente: { icon: 'water', label: 'Água quente' },
  toalhas: { icon: 'shirt', label: 'Toalhas' },
  roupa_de_cama: { icon: 'bed', label: 'Roupa de cama' },
  estacionamento: { icon: 'car', label: 'Parking' },
  cozinha: { icon: 'restaurant', label: 'Cozinha' },
};

const modalityUi: Record<string, StayModality> = {
  hora: 'hour',
  noite: 'night',
  mes: 'month',
  semana: 'night',
};

const modalityApi: Record<StayModality, BookingModality> = {
  hour: 'hora',
  night: 'noite',
  month: 'mes',
};

export function formatMt(value: number) {
  return `${Math.round(value).toLocaleString('pt-MZ')} MT`;
}

export function toApiModality(modality: StayModality): BookingModality {
  return modalityApi[modality];
}

export function toUiModality(modality: string): StayModality {
  return modalityUi[modality] ?? 'night';
}

export function mapDiscoverCardToListing(card: DiscoverCard): GuestListing {
  const price = card.priceFrom ?? 0;
  const location = [card.location.neighborhood, card.location.city]
    .filter(Boolean)
    .join(', ');

  return {
    id: card.id,
    name: card.name,
    location,
    priceLabel: price > 0 ? `MZN ${Math.round(price).toLocaleString('pt-MZ')}` : 'Sob consulta',
    priceUnit: card.priceModality === 'hora' ? 'hora' : 'noite',
    rating: card.rating.average,
    reviewCount: card.rating.total,
    image: card.coverImageUrl ?? PLACEHOLDER_IMAGE,
    images: card.coverImageUrl ? [card.coverImageUrl] : [PLACEHOLDER_IMAGE],
    badge: card.available
      ? { label: 'Disponível', tone: 'green' }
      : { label: 'Indisponível', tone: 'orange' },
    favorite: card.isFavorite,
    amenities: [
      { icon: 'people', label: `${card.roomsCount} quarto${card.roomsCount === 1 ? '' : 's'}` },
    ],
    description: '',
    houseRules: '',
    guests: 2,
    rooms: [],
    reviews: [],
    ratingBreakdown: [],
  };
}

export function mapCity(city: DiscoverCity) {
  return {
    id: city.city.toLowerCase().replace(/\s+/g, '-'),
    name: city.city,
    count: `${city.propertiesCount} alojamento${city.propertiesCount === 1 ? '' : 's'}`,
    image: city.coverImageUrl ?? PLACEHOLDER_IMAGE,
  };
}

function mapAmenities(codes: string[]) {
  return codes.map((code) => amenityMeta[code] ?? { icon: 'checkmark', label: code.replace(/_/g, ' ') });
}

function mapRoomSummary(
  room: DiscoverPropertyDetail['rooms'][number],
  full?: DiscoverRoomDetail | null,
): GuestRoom {
  const prices = full?.prices ?? {};
  const rates = (Object.entries(prices) as [BookingModality, number][])
    .filter(([, amount]) => amount != null)
    .map(([modality, price]) => {
      const ui = toUiModality(modality);
      return {
        modality: ui,
        label:
          ui === 'hour' ? 'Por Hora' : ui === 'month' ? 'Por Mês' : 'Por Noite',
        price,
        unit: ui === 'hour' ? '/hora' : ui === 'month' ? '/mês' : '/noite',
      };
    });

  const priceFrom = room.priceFrom ?? rates[0]?.price ?? 0;

  return {
    id: room.id,
    name: room.name,
    guests: room.maxCapacity,
    image: room.thumbnailUrl ?? PLACEHOLDER_IMAGE,
    priceLabel: priceFrom > 0 ? `MZN ${Math.round(priceFrom).toLocaleString('pt-MZ')}` : 'Sob consulta',
    available: room.available,
    detail: `${room.type} · até ${room.maxCapacity} hóspede${room.maxCapacity === 1 ? '' : 's'}`,
    rates:
      rates.length > 0
        ? rates
        : [
            {
              modality: toUiModality(room.priceModality ?? 'noite'),
              label: 'Por Noite',
              price: priceFrom,
              unit: '/noite',
            },
          ],
  };
}

export function mapPropertyDetail(
  property: DiscoverPropertyDetail,
  reviews: GuestReview[] = [],
  roomsFull: DiscoverRoomDetail[] = [],
): GuestListing {
  const byId = new Map(roomsFull.map((r) => [r.id, r]));
  const location = [property.location.neighborhood, property.location.city]
    .filter(Boolean)
    .join(', ');
  const images = [
    ...(property.coverImageUrl ? [property.coverImageUrl] : []),
    ...property.images.filter((u) => u && u !== property.coverImageUrl),
  ];
  const rooms = property.rooms.map((r) => mapRoomSummary(r, byId.get(r.id)));
  const maxGuests = Math.max(2, ...rooms.map((r) => r.guests), 0);

  return {
    id: property.id,
    name: property.name,
    location,
    priceLabel:
      rooms[0]?.priceLabel ??
      (property.rooms[0]?.priceFrom
        ? `MZN ${Math.round(property.rooms[0].priceFrom).toLocaleString('pt-MZ')}`
        : 'Sob consulta'),
    priceUnit: 'noite',
    rating: property.rating.average,
    reviewCount: property.rating.total,
    image: images[0] ?? PLACEHOLDER_IMAGE,
    images: images.length ? images : [PLACEHOLDER_IMAGE],
    badge: { label: 'Disponível', tone: 'green' },
    favorite: property.isFavorite,
    amenities: [
      ...mapAmenities(property.amenities).slice(0, 3),
      { icon: 'people', label: `${maxGuests} hóspedes` },
    ],
    description: property.description,
    houseRules: property.houseRules.join('. '),
    guests: maxGuests,
    rooms,
    reviews,
    ratingBreakdown: [],
  };
}

export function mapApiReview(review: {
  id: string;
  guestName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
}): GuestReview {
  const when = new Date(review.createdAt).toLocaleDateString('pt-MZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  return {
    id: review.id,
    name: review.guestName,
    rating: review.rating,
    comment: review.comment ?? '',
    when,
  };
}

const guestStatusLabel: Record<GuestReservationStatus, string> = {
  pending: 'Pendente',
  awaiting_payment: 'Aguard. pagamento',
  confirmed: 'Confirmada',
  completed: 'Concluída',
  cancelled: 'Cancelada',
};

function toGuestStatus(status: string, display?: ReservationDisplayStatus): GuestReservationStatus {
  if (status === 'rejected' || status === 'cancelled') return 'cancelled';
  if (
    status === 'pending' ||
    status === 'awaiting_payment' ||
    status === 'confirmed' ||
    status === 'completed'
  ) {
    return status;
  }
  if (display === 'awaiting_payment') return 'awaiting_payment';
  return 'confirmed';
}

function formatDateLabel(iso: string) {
  const d = new Date(`${iso}T00:00:00Z`);
  return d.toLocaleDateString('pt-MZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function nightsBetween(checkIn: string, checkOut: string) {
  const a = new Date(`${checkIn}T00:00:00Z`).getTime();
  const b = new Date(`${checkOut}T00:00:00Z`).getTime();
  return Math.max(1, Math.round((b - a) / 86_400_000));
}

export function mapGuestReservation(r: ApiReservation): GuestReservation {
  const status = toGuestStatus(r.status, r.displayStatus);
  const canPay = status === 'awaiting_payment';
  const canCancel = status === 'pending' || status === 'awaiting_payment';
  const canReview = status === 'completed';

  let bannerTitle = 'Reserva';
  let bannerBody = '';
  let bannerTone: GuestReservation['bannerTone'] = 'gray';

  if (status === 'pending') {
    bannerTitle = 'Aguardando resposta do anfitrião';
    bannerBody =
      'O seu pedido foi enviado. Receberá uma notificação quando o anfitrião responder.';
    bannerTone = 'yellow';
  } else if (status === 'awaiting_payment') {
    bannerTitle = 'Reserva aprovada — aguardando pagamento';
    bannerBody = 'O anfitrião aprovou o pedido. Conclua o pagamento antes do prazo.';
    bannerTone = 'blue';
  } else if (status === 'confirmed') {
    bannerTitle = 'Reserva confirmada';
    bannerBody = 'Tudo certo. Guarde os detalhes da estadia.';
    bannerTone = 'blue';
  } else if (status === 'completed') {
    bannerTitle = 'Estadia concluída';
    bannerBody = 'Obrigado por escolher a Ogona. Avalie a sua experiência.';
    bannerTone = 'gray';
  } else {
    bannerTitle = 'Reserva cancelada';
    bannerBody = 'Esta reserva já não está activa.';
    bannerTone = 'gray';
  }

  const expiryHint =
    canPay && r.expiresInSeconds != null
      ? `Expira em ${Math.floor(r.expiresInSeconds / 3600)}h ${Math.floor((r.expiresInSeconds % 3600) / 60)}min`
      : undefined;

  return {
    id: r.id,
    property: r.propertyName,
    room: r.roomName,
    location: '',
    image: r.thumbnailUrl ?? PLACEHOLDER_IMAGE,
    checkIn: formatDateLabel(r.checkInDate),
    checkOut: formatDateLabel(r.checkOutDate),
    nights: nightsBetween(r.checkInDate, r.checkOutDate),
    guests: r.guestCount,
    amount: formatMt(r.totalAmount),
    status,
    statusLabel: guestStatusLabel[status],
    bannerTitle,
    bannerBody,
    bannerTone,
    expiryHint,
    canPay,
    canCancel,
    canContact: Boolean(r.hostWhatsapp),
    canReview,
  };
}
