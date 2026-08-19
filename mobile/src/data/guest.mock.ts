export type GuestReservationStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

export type StayModality = 'hour' | 'night' | 'month';

const img = {
  pool: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
  room: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop',
  beach: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
  lobby: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
  suite: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop',
  city: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=800&h=500&fit=crop',
  avatar:
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=240&h=240&fit=crop',
};

export const guestHome = {
  greetingName: 'Osvaldo',
  subtitle: 'Encontre o seu próximo alojamento',
  avatar: img.avatar,
  categories: [
    { id: 'all', label: 'Todos', icon: 'apps' as const },
    { id: 'apartments', label: 'Apartamentos', icon: 'business' as const },
    { id: 'houses', label: 'Vivendas', icon: 'home' as const },
    { id: 'rooms', label: 'Quartos', icon: 'bed' as const },
    { id: 'hotels', label: 'Hotéis', icon: 'storefront' as const },
  ],
};

export type GuestListing = {
  id: string;
  name: string;
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  priceLabel: string;
  priceUnit: string;
  rating: number;
  reviewCount: number;
  image: string;
  images: string[];
  propertyType?: string;
  badge?: { label: string; tone: 'green' | 'blue' | 'orange' };
  favorite?: boolean;
  amenities: { icon: string; label: string }[];
  description: string;
  houseRules: string;
  guests: number;
  rooms: GuestRoom[];
  reviews: GuestReview[];
  ratingBreakdown: { stars: number; count: number }[];
};

export type GuestRoom = {
  id: string;
  name: string;
  guests: number;
  image: string;
  priceLabel: string;
  available: boolean;
  detail: string;
  rates: { modality: StayModality; label: string; price: number; unit: string }[];
  unavailableDates?: string[];
};

export type GuestReview = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  when: string;
};

export const guestListings: GuestListing[] = [
  {
    id: 'p1',
    name: 'Pensão Horizonte Azul',
    location: 'Polana, Maputo',
    priceLabel: 'MZN 1 300',
    priceUnit: 'noite',
    rating: 4.61,
    reviewCount: 28,
    image: img.pool,
    images: [img.pool, img.room, img.lobby, img.suite, img.beach, img.city],
    badge: { label: 'Disponível', tone: 'green' },
    favorite: true,
    amenities: [
      { icon: 'wifi', label: 'Wi-Fi' },
      { icon: 'car', label: 'Parking' },
      { icon: 'snow', label: 'AC' },
      { icon: 'people', label: '2 hóspedes' },
    ],
    description:
      'Uma pensão acolhedora com vista para o Oceano Índico, localizada no coração da Baixa de Maputo. Quartos confortáveis com ar condicionado e Wi-Fi gratuito. Ideal para viajantes de negócios e turistas que procuram uma estadia tranquila a preços acessíveis.',
    houseRules:
      'Não é permitido fumar dentro dos quartos. Check-in a partir das 14h. Check-out até às 12h. Animais de estimação não são permitidos.',
    guests: 2,
    rooms: [
      {
        id: 'r1',
        name: 'Suite Deluxe',
        guests: 2,
        image: img.suite,
        priceLabel: 'MZN 3 200',
        available: true,
        detail: 'Suite · 1 cama king · até 2 hóspedes',
        rates: [
          { modality: 'hour', label: 'Por Hora', price: 600, unit: '/hora' },
          { modality: 'night', label: 'Por Noite', price: 3200, unit: '/noite' },
          { modality: 'month', label: 'Por Mês', price: 65000, unit: '/mês' },
        ],
      },
      {
        id: 'r2',
        name: 'Quarto Standard',
        guests: 2,
        image: img.room,
        priceLabel: 'MZN 1 300',
        available: true,
        detail: 'Quarto · 1 cama casal · até 2 hóspedes',
        rates: [
          { modality: 'hour', label: 'Por Hora', price: 400, unit: '/hora' },
          { modality: 'night', label: 'Por Noite', price: 1300, unit: '/noite' },
          { modality: 'month', label: 'Por Mês', price: 28000, unit: '/mês' },
        ],
      },
      {
        id: 'r3',
        name: 'Suite Premium',
        guests: 3,
        image: img.beach,
        priceLabel: 'MZN 4 500',
        available: true,
        detail: 'Suite · 1 cama king · até 3 hóspedes',
        rates: [
          { modality: 'hour', label: 'Por Hora', price: 800, unit: '/hora' },
          { modality: 'night', label: 'Por Noite', price: 4500, unit: '/noite' },
          { modality: 'month', label: 'Por Mês', price: 85000, unit: '/mês' },
        ],
      },
    ],
    reviews: [
      {
        id: 'rv1',
        name: 'Jane Cooper',
        rating: 4.2,
        comment:
          'Boa localização e quarto limpo. O staff é simpático. O ar condicionado do meu quarto fazia um pouco de barulho, mas no geral foi uma estadia agradável.',
        when: '2 semanas atrás',
      },
      {
        id: 'rv2',
        name: 'Ana Pereira',
        rating: 4.2,
        comment:
          'Serviço lento e quarto não estava limpo na chegada. Esperava mais pela localização e pelo preço cobrado. Não voltarei.',
        when: '3 semanas atrás',
      },
    ],
    ratingBreakdown: [
      { stars: 5, count: 18 },
      { stars: 4, count: 7 },
      { stars: 3, count: 2 },
      { stars: 2, count: 0 },
      { stars: 1, count: 1 },
    ],
  },
  {
    id: 'p2',
    name: 'Pensão Maputo Sundown',
    location: 'Polana, Maputo',
    priceLabel: 'MZN 2 100',
    priceUnit: 'noite',
    rating: 4.8,
    reviewCount: 42,
    image: img.lobby,
    images: [img.lobby, img.suite, img.room],
    badge: { label: 'Novo', tone: 'blue' },
    amenities: [
      { icon: 'wifi', label: 'Wi-Fi' },
      { icon: 'car', label: 'Parking' },
      { icon: 'snow', label: 'AC' },
      { icon: 'people', label: '4 hóspedes' },
    ],
    description:
      'Alojamento moderno no centro de Maputo com vistas panorâmicas e pequeno-almoço incluído.',
    houseRules: 'Check-in 15h. Check-out 11h. Silêncio após as 22h.',
    guests: 4,
    rooms: [
      {
        id: 'r4',
        name: 'Suite Deluxe',
        guests: 2,
        image: img.suite,
        priceLabel: 'MZN 3 200',
        available: true,
        detail: 'Suite · 1 cama king · até 2 hóspedes',
        rates: [
          { modality: 'hour', label: 'Por Hora', price: 600, unit: '/hora' },
          { modality: 'night', label: 'Por Noite', price: 3200, unit: '/noite' },
          { modality: 'month', label: 'Por Mês', price: 65000, unit: '/mês' },
        ],
      },
    ],
    reviews: [],
    ratingBreakdown: [
      { stars: 5, count: 30 },
      { stars: 4, count: 10 },
      { stars: 3, count: 2 },
      { stars: 2, count: 0 },
      { stars: 1, count: 0 },
    ],
  },
  {
    id: 'p3',
    name: 'Lodge Savana Nampula',
    location: 'Centro, Nampula',
    priceLabel: 'MZN 1 800',
    priceUnit: 'noite',
    rating: 4.4,
    reviewCount: 15,
    image: img.beach,
    images: [img.beach, img.pool],
    badge: { label: 'Disponível', tone: 'green' },
    amenities: [
      { icon: 'wifi', label: 'Wi-Fi' },
      { icon: 'snow', label: 'AC' },
      { icon: 'people', label: '2 hóspedes' },
    ],
    description: 'Lodge tranquilo com jardim e piscina em Nampula.',
    houseRules: 'Não fumar. Animais sob pedido.',
    guests: 2,
    rooms: [
      {
        id: 'r5',
        name: 'Suite Premium',
        guests: 2,
        image: img.beach,
        priceLabel: 'MZN 3 675',
        available: true,
        detail: 'Suite · 1 cama king · até 2 hóspedes',
        rates: [
          { modality: 'night', label: 'Por Noite', price: 3675, unit: '/noite' },
        ],
      },
    ],
    reviews: [],
    ratingBreakdown: [
      { stars: 5, count: 8 },
      { stars: 4, count: 5 },
      { stars: 3, count: 2 },
      { stars: 2, count: 0 },
      { stars: 1, count: 0 },
    ],
  },
];

export const guestCities = [
  { id: 'maputo', name: 'Maputo', count: '124 alojamentos', image: img.city },
  { id: 'beira', name: 'Beira', count: '48 alojamentos', image: img.beach },
  { id: 'nampula', name: 'Nampula', count: '36 alojamentos', image: img.lobby },
];

export const popularDestinations = [
  'Maputo',
  'Beira',
  'Nampula',
  'Pemba',
  'Inhambane',
  'Tete',
];

export const recentSearches = [
  'Maputo · 2 hóspedes',
  'Pensão Beira',
  'Lodge Nampula',
];

export type GuestReservation = {
  id: string;
  property: string;
  room: string;
  location: string;
  image: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  amount: string;
  status: GuestReservationStatus;
  statusLabel: string;
  bannerTitle: string;
  bannerBody: string;
  bannerTone: 'yellow' | 'blue' | 'gray';
  expiryHint?: string;
  canPay?: boolean;
  canCancel?: boolean;
  canContact?: boolean;
  canReview?: boolean;
};

export const guestReservations: GuestReservation[] = [
  {
    id: 'gr1',
    property: 'Apartamento Vista Mar Pemba',
    room: 'Suite Mar',
    location: 'Pemba',
    image: img.beach,
    checkIn: '10 Ago 2026',
    checkOut: '13 Ago 2026',
    nights: 3,
    guests: 2,
    amount: '21 840 MT',
    status: 'pending',
    statusLabel: 'Pendente',
    bannerTitle: 'Aguardando resposta do anfitrião',
    bannerBody:
      'O seu pedido foi enviado. Receberá uma notificação quando o anfitrião responder.',
    bannerTone: 'yellow',
    canContact: true,
  },
  {
    id: 'gr2',
    property: 'Lodge Savana Nampula',
    room: 'Suite Premium',
    location: 'Nampula',
    image: img.lobby,
    checkIn: '20 Ago 2026',
    checkOut: '25 Ago 2026',
    nights: 5,
    guests: 1,
    amount: '18 375 MT',
    status: 'awaiting_payment',
    statusLabel: 'Aguard. pagamento',
    bannerTitle: 'Reserva aprovada — aguardando pagamento',
    bannerBody:
      'O anfitrião aprovou o pedido. Conclua o pagamento antes do prazo.',
    bannerTone: 'blue',
    expiryHint: 'Expira em 23h 47min',
    canPay: true,
    canCancel: true,
    canContact: true,
  },
  {
    id: 'gr3',
    property: 'Pensão Horizonte Azul',
    room: 'Quarto Standard',
    location: 'Maputo',
    image: img.pool,
    checkIn: '01 Jul 2026',
    checkOut: '04 Jul 2026',
    nights: 3,
    guests: 2,
    amount: '3 900 MT',
    status: 'completed',
    statusLabel: 'Concluída',
    bannerTitle: 'Estadia concluída',
    bannerBody: 'Obrigado por escolher a Ogona. Avalie a sua experiência.',
    bannerTone: 'gray',
    canContact: true,
    canReview: true,
  },
];

export function getListing(id: string) {
  return guestListings.find((l) => l.id === id) ?? guestListings[0];
}

export function getReservation(id: string) {
  return guestReservations.find((r) => r.id === id) ?? guestReservations[0];
}

export { formatMt } from '@/lib/mappers/guest';

export function calcBookingTotal(nightPrice: number, qty: number) {
  const subtotal = nightPrice * qty;
  const fee = Math.round(subtotal * 0.033);
  return { subtotal, fee, total: subtotal + fee };
}
