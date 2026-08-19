export type AuthRole = 'guest' | 'host';

export type ApiUser = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  photoUrl: string | null;
  birthDate: string;
  role: AuthRole;
  createdAt: string;
};

export type BookingModality = 'hora' | 'noite' | 'semana' | 'mes';

export type DiscoverCard = {
  id: string;
  name: string;
  type: string;
  coverImageUrl: string | null;
  location: {
    city: string;
    neighborhood: string;
    community: string | null;
    latitude: number;
    longitude: number;
  };
  rating: { average: number; total: number };
  priceFrom: number | null;
  priceModality: BookingModality | string;
  currency: string;
  roomsCount: number;
  bookingsCount: number;
  distanceKm: number | null;
  available: boolean;
  isFavorite: boolean;
};

export type DiscoverCity = {
  city: string;
  propertiesCount: number;
  coverImageUrl: string | null;
};

export type DiscoverHome = {
  nearYou: DiscoverCard[];
  mostBooked: DiscoverCard[];
  cities: DiscoverCity[];
};

export type PropertyRoomSummary = {
  id: string;
  name: string;
  type: string;
  status: string;
  maxCapacity: number;
  priceFrom: number | null;
  priceModality: string | null;
  currency: string;
  thumbnailUrl: string | null;
  available: boolean;
  unavailableDates?: string[];
};

export type DiscoverPropertyDetail = {
  id: string;
  hostId: string;
  name: string;
  type: string;
  description: string;
  contactPhone: string;
  whatsapp: string | null;
  coverImageUrl: string | null;
  bathrooms: number;
  parkingSpots: number;
  houseRules: string[];
  location: {
    province: string;
    city: string;
    community: string | null;
    neighborhood: string;
    address: string;
    postalCode: string | null;
    latitude: number;
    longitude: number;
  };
  status: string;
  amenities: string[];
  images: string[];
  rating: { average: number; total: number };
  isFavorite: boolean;
  rooms: PropertyRoomSummary[];
};

export type DiscoverRoomDetail = {
  id: string;
  propertyId: string;
  name: string;
  type: string;
  status: string;
  description: string;
  maxCapacity: number;
  bedLabel: string | null;
  modalities: BookingModality[];
  prices: Partial<Record<BookingModality, number>>;
  priceLimits?: Partial<Record<BookingModality, { min: number; max: number }>>;
  currency: string;
  amenities: string[];
  images: { id: string; url: string; sortOrder: number }[];
  unavailableDates?: string[];
  property: {
    id: string;
    name: string;
    type: string;
    location: {
      city: string;
      neighborhood: string;
      latitude: number;
      longitude: number;
    };
  };
};

export type ReservationStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'confirmed'
  | 'rejected'
  | 'cancelled'
  | 'completed';

export type ReservationDisplayStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'confirmed'
  | 'check_in_today'
  | 'check_out_today'
  | 'in_stay'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export type ApiReservation = {
  id: string;
  propertyId: string;
  roomId: string;
  guestId: string;
  hostId: string;
  guestName: string;
  propertyName: string;
  roomName: string;
  thumbnailUrl: string | null;
  hostWhatsapp: string | null;
  modality: BookingModality;
  checkInDate: string;
  checkOutDate: string;
  startTime: string | null;
  units: number;
  guestCount: number;
  status: ReservationStatus;
  displayStatus: ReservationDisplayStatus;
  unitPrice: number;
  subtotalAmount: number;
  feePercent: number;
  feeAmount: number;
  totalAmount: number;
  currency: string;
  paymentMethod: 'm_pesa' | 'e_mola' | null;
  paymentExpiresAt: string | null;
  expiresInSeconds: number | null;
  createdAt: string;
  updatedAt: string;
};

export type QuoteResult = {
  roomId: string;
  propertyId: string;
  propertyName: string;
  roomName: string;
  modality: BookingModality;
  checkInDate: string;
  checkOutDate: string;
  startTime: string | null;
  estimatedEndTime: string | null;
  units: number;
  guestCount: number;
  unitPrice: number;
  subtotalAmount: number;
  feePercent: number;
  feeAmount: number;
  totalAmount: number;
  currency: string;
  limits: { min: number; max: number };
};

export type HostDashboard = {
  metrics: {
    monthlyRevenue: number;
    revenueTrendPercent: number;
    reservations: number;
    pendingReservations: number;
    rooms: number;
    availableRooms: number;
    occupancyRate: number;
    occupancyTrendPercent: number;
  };
  quickStats: {
    activeProperties: number;
    checkInsToday: number;
    checkOutsToday: number;
  };
  pendingRequests: ApiReservation[];
  recentActivity: {
    id: string;
    type: string;
    title: string;
    description: string | null;
    createdAt: string;
  }[];
};

export type HostProperty = {
  id: string;
  name: string;
  type: string;
  status: string;
  coverImageUrl: string | null;
  contactPhone: string;
  whatsapp?: string | null;
  bathrooms?: number;
  parkingSpots?: number;
  description?: string;
  houseRules?: string[];
  location: {
    city: string;
    neighborhood: string;
    province?: string;
    community?: string | null;
    address?: string;
    postalCode?: string | null;
    latitude?: number;
    longitude?: number;
  };
  stats?: {
    rooms: number;
    reservations: number;
    revenue: number;
  };
  rooms?: HostRoom[];
};

export type HostRoom = {
  id: string;
  name: string;
  type: string;
  status: string;
  maxCapacity: number;
  description?: string;
  prices?: Partial<Record<BookingModality, number>>;
  currency?: string;
  images?: { url: string }[];
};
