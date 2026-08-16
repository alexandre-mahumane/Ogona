export type ReservationStatus =
  | 'pending'
  | 'confirmed'
  | 'checkin'
  | 'staying'
  | 'checkout'
  | 'completed'
  | 'cancelled';

export type PropertyStatus = 'published' | 'draft' | 'hidden' | 'review';

export const hostDashboard = {
  greetingName: 'Osvaldo',
  stats: [
    {
      id: 'revenue',
      value: '148,200 MT',
      label: 'Receita do mês',
      hint: '+12% vs mês ant.',
      iconBg: '#F0FDF4',
      iconColor: '#00C950',
      icon: 'cash-outline' as const,
    },
    {
      id: 'reservations',
      value: '18',
      label: 'Reservas',
      hint: '4 pendentes',
      iconBg: '#FFF7ED',
      iconColor: '#FF6900',
      icon: 'calendar-outline' as const,
    },
    {
      id: 'rooms',
      value: '12',
      label: 'Quartos',
      hint: '8 disponíveis',
      iconBg: '#EFF6FF',
      iconColor: '#2B7FFF',
      icon: 'bed-outline' as const,
    },
    {
      id: 'occupancy',
      value: '67%',
      label: 'Taxa de ocupação',
      hint: '+5% vs mês ant.',
      iconBg: '#F5F3FF',
      iconColor: '#8B5CF6',
      icon: 'analytics-outline' as const,
    },
  ],
  today: [
    { label: 'Propriedades activas', value: '3' },
    { label: 'Check-ins hoje', value: '2' },
    { label: 'Check-outs hoje', value: '1' },
  ],
  pending: {
    id: 'r1',
    guest: 'Maria Sitoe',
    property: 'Pensão Maputo Sundown · Suite Deluxe',
    dates: '28 Jul 2026 → 31 Jul 2026 · 3 noites',
    amount: '9960 MT',
  },
  activity: [
    {
      id: 'a1',
      title: 'Nova reserva',
      detail: 'Maria Sitoe · Suite Deluxe · 28–31 Jul',
      time: '14:32',
      icon: 'calendar-outline' as const,
      bg: '#FFF7ED',
      color: '#FF6900',
    },
    {
      id: 'a2',
      title: 'Pagamento recebido',
      detail: '9,960 MT · OGN-2026-4821',
      time: '13:10',
      icon: 'cash-outline' as const,
      bg: '#F0FDF4',
      color: '#00C950',
    },
    {
      id: 'a3',
      title: 'Nova avaliação',
      detail: 'António Bila deixou 4★',
      time: '10:45',
      icon: 'star-outline' as const,
      bg: '#FEF9C3',
      color: '#CA8A04',
    },
    {
      id: 'a4',
      title: 'Reserva cancelada',
      detail: 'João Machava · Suite Mar',
      time: '09:20',
      icon: 'close-circle-outline' as const,
      bg: '#FEF2F2',
      color: '#FB2C36',
    },
  ],
};

export const hostReservations = [
  {
    id: 'r1',
    guest: 'Maria Sitoe',
    property: 'Pensão Maputo Sundown · Suite Deluxe',
    dates: '28 Jul 2026 → 31 Jul 2026',
    amount: '9960 MT',
    status: 'pending' as ReservationStatus,
    statusLabel: 'Aguard. decisão',
  },
  {
    id: 'r2',
    guest: 'António Bila',
    property: 'Guest House Beira Central · Quarto Standard',
    dates: '05 Ago 2026 → 08 Ago 2026',
    amount: '5955 MT',
    status: 'confirmed' as ReservationStatus,
    statusLabel: 'Confirmada',
  },
  {
    id: 'r3',
    guest: 'Fátima Cossa',
    property: 'Pensão Maputo Sundown · Standard Twin',
    dates: '10 Ago 2026 → 12 Ago 2026',
    amount: '5600 MT',
    status: 'checkin' as ReservationStatus,
    statusLabel: 'Check-in hoje',
  },
  {
    id: 'r4',
    guest: 'João Machava',
    property: 'Apartamento Vista Mar Pemba · Suite Mar',
    dates: '01 Ago 2026 → 06 Ago 2026',
    amount: '21 840 MT',
    status: 'staying' as ReservationStatus,
    statusLabel: 'Em estadia',
  },
  {
    id: 'r5',
    guest: 'Rosa Nhanala',
    property: 'Hostel Baixa Maputo · Dorm',
    dates: '01 Ago 2026 → 03 Ago 2026',
    amount: '1500 MT',
    status: 'checkout' as ReservationStatus,
    statusLabel: 'Check-out hoje',
  },
  {
    id: 'r6',
    guest: 'Carlos Nhantumbo',
    property: 'Lodge Savana Nampula · Suite Premium',
    dates: '20 Jun 2026 → 25 Jun 2026',
    amount: '18 375 MT',
    status: 'completed' as ReservationStatus,
    statusLabel: 'Concluída',
  },
];

export const hostProperties = [
  {
    id: 'p1',
    name: 'Pensão Maputo Sundown',
    location: 'Polana, Maputo',
    status: 'published' as PropertyStatus,
    statusLabel: 'Publicada',
    rooms: 2,
    reservations: 12,
    revenue: '48k MT',
    phone: '+258 833582020',
    type: 'Pensão',
    city: 'Maputo',
    neighborhood: 'Polana',
  },
  {
    id: 'p2',
    name: 'Guest House Beira Central',
    location: 'Ponta Gêa, Beira',
    status: 'published' as PropertyStatus,
    statusLabel: 'Publicada',
    rooms: 1,
    reservations: 12,
    revenue: '48k MT',
    phone: '+258 840000001',
    type: 'Guest House',
    city: 'Beira',
    neighborhood: 'Ponta Gêa',
  },
  {
    id: 'p3',
    name: 'Lodge Savana Nampula',
    location: 'Cidade Alta, Nampula',
    status: 'hidden' as PropertyStatus,
    statusLabel: 'Oculta',
    rooms: 0,
    reservations: 12,
    revenue: '48k MT',
    phone: '+258 840000002',
    type: 'Lodge',
    city: 'Nampula',
    neighborhood: 'Cidade Alta',
  },
  {
    id: 'p4',
    name: 'Hostel Baixa Maputo',
    location: 'Baixa, Maputo',
    status: 'draft' as PropertyStatus,
    statusLabel: 'Rascunho',
    rooms: 1,
    reservations: 12,
    revenue: '48k MT',
    phone: '+258 840000003',
    type: 'Hostel',
    city: 'Maputo',
    neighborhood: 'Baixa',
  },
  {
    id: 'p5',
    name: 'Apartamento Vista Mar Pemba',
    location: 'Wimbe, Pemba',
    status: 'published' as PropertyStatus,
    statusLabel: 'Publicada',
    rooms: 1,
    reservations: 12,
    revenue: '48k MT',
    phone: '+258 840000004',
    type: 'Apartamento',
    city: 'Pemba',
    neighborhood: 'Wimbe',
  },
];

export const reservationStatusStyle: Record<
  ReservationStatus,
  { bg: string; text: string }
> = {
  pending: { bg: '#FEFCE8', text: '#F0B100' },
  confirmed: { bg: '#F0FDF4', text: '#00C950' },
  checkin: { bg: '#FFF7ED', text: '#FF6900' },
  staying: { bg: '#EFF6FF', text: '#2B7FFF' },
  checkout: { bg: '#F5F3FF', text: '#8B5CF6' },
  completed: { bg: '#F5F5F5', text: '#737373' },
  cancelled: { bg: '#FEF2F2', text: '#FB2C36' },
};

export const propertyStatusStyle: Record<
  PropertyStatus,
  { bg: string; text: string }
> = {
  published: { bg: '#F0FDF4', text: '#00C950' },
  draft: { bg: '#FEFCE8', text: '#F0B100' },
  hidden: { bg: '#F5F5F5', text: '#737373' },
  review: { bg: '#EFF6FF', text: '#2B7FFF' },
};

export const propertyAmenities = [
  'Wi-Fi gratuito',
  'Ar condicionado',
  'Televisão',
  'Água quente',
  'Toalhas',
  'Roupa de cama',
  'Estacionamento',
  'Cozinha',
];

export const roomTypes = [
  'Quarto inteiro',
  'Quarto compartilhado',
  'Suite',
  'Standard',
];

export const propertyRooms = [
  {
    id: 'rm1',
    name: 'Suite Deluxe',
    detail: 'Suite · 3200 MT/noite',
    status: 'available' as const,
    statusLabel: 'Disponível',
  },
  {
    id: 'rm2',
    name: 'Standard Twin',
    detail: 'Standard · 2800 MT/noite',
    status: 'booked' as const,
    statusLabel: 'Reservado',
  },
];

export const roomStatusStyle = {
  available: { bg: '#F0FDF4', text: '#00C950' },
  booked: { bg: '#EFF6FF', text: '#2B7FFF' },
} as const;
