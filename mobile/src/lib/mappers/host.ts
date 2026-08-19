import type {
  ApiReservation,
  HostDashboard,
  HostProperty,
  HostRoom,
  ReservationDisplayStatus,
} from '@/lib/api/types';
import type { PropertyStatus, ReservationStatus } from '@/data/host.mock';
import { formatMt } from '@/lib/mappers/guest';

export const propertyTypeLabel: Record<string, string> = {
  pensao: 'Pensão',
  apartamento: 'Apartamento',
  hotel: 'Hotel',
  casa: 'Casa',
  hostel: 'Hostel',
  villa: 'Villa',
  lodge: 'Lodge',
  resort: 'Resort',
  guest_house: 'Guest House',
};

const propertyStatusMap: Record<string, { status: PropertyStatus; label: string }> = {
  published: { status: 'published', label: 'Publicada' },
  draft: { status: 'draft', label: 'Rascunho' },
  hidden: { status: 'hidden', label: 'Oculta' },
  under_review: { status: 'review', label: 'Em revisão' },
};

const hostStatusFromDisplay: Record<
  ReservationDisplayStatus,
  { status: ReservationStatus; label: string }
> = {
  pending: { status: 'pending', label: 'Aguard. decisão' },
  awaiting_payment: { status: 'confirmed', label: 'Aguard. pagamento' },
  confirmed: { status: 'confirmed', label: 'Confirmada' },
  check_in_today: { status: 'checkin', label: 'Check-in hoje' },
  check_out_today: { status: 'checkout', label: 'Check-out hoje' },
  in_stay: { status: 'staying', label: 'Em estadia' },
  completed: { status: 'completed', label: 'Concluída' },
  rejected: { status: 'cancelled', label: 'Rejeitada' },
  cancelled: { status: 'cancelled', label: 'Cancelada' },
};

function formatDateRange(checkIn: string, checkOut: string) {
  const fmt = (iso: string) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString('pt-MZ', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  return `${fmt(checkIn)} → ${fmt(checkOut)}`;
}

export function mapHostReservation(r: ApiReservation) {
  const mapped = hostStatusFromDisplay[r.displayStatus] ?? {
    status: 'confirmed' as ReservationStatus,
    label: r.status,
  };

  return {
    id: r.id,
    guest: r.guestName,
    property: `${r.propertyName} · ${r.roomName}`,
    dates: formatDateRange(r.checkInDate, r.checkOutDate),
    amount: formatMt(r.totalAmount),
    status: mapped.status,
    statusLabel: mapped.label,
    raw: r,
  };
}

export function mapHostPropertyCard(p: HostProperty) {
  const statusMeta = propertyStatusMap[p.status] ?? {
    status: 'draft' as PropertyStatus,
    label: p.status,
  };

  return {
    id: p.id,
    name: p.name,
    location: [p.location.neighborhood, p.location.city].filter(Boolean).join(', '),
    status: statusMeta.status,
    statusLabel: statusMeta.label,
    rooms: p.stats?.rooms ?? p.rooms?.length ?? 0,
    reservations: p.stats?.reservations ?? 0,
    revenue: formatMt(p.stats?.revenue ?? 0),
    phone: p.contactPhone,
    type: propertyTypeLabel[p.type] ?? p.type,
    city: p.location.city,
    neighborhood: p.location.neighborhood,
    coverImageUrl: p.coverImageUrl,
    raw: p,
  };
}

export function mapHostRoom(room: HostRoom) {
  const night = room.prices?.noite ?? Object.values(room.prices ?? {})[0];
  const available = room.status === 'disponivel';
  return {
    id: room.id,
    name: room.name,
    detail: `${room.type}${night != null ? ` · ${formatMt(night)}/noite` : ''}`,
    status: available ? ('available' as const) : ('booked' as const),
    statusLabel: available ? 'Disponível' : 'Indisponível',
  };
}

export function mapHostDashboard(dashboard: HostDashboard, greetingName: string) {
  const m = dashboard.metrics;
  const pending = dashboard.pendingRequests[0];

  return {
    greetingName,
    stats: [
      {
        id: 'revenue',
        value: formatMt(m.monthlyRevenue),
        label: 'Receita do mês',
        hint: `${m.revenueTrendPercent >= 0 ? '+' : ''}${m.revenueTrendPercent}% vs mês ant.`,
        iconBg: '#F0FDF4',
        iconColor: '#00C950',
        icon: 'cash-outline' as const,
      },
      {
        id: 'reservations',
        value: String(m.reservations),
        label: 'Reservas',
        hint: `${m.pendingReservations} pendentes`,
        iconBg: '#FFF7ED',
        iconColor: '#FF6900',
        icon: 'calendar-outline' as const,
      },
      {
        id: 'rooms',
        value: String(m.rooms),
        label: 'Quartos',
        hint: `${m.availableRooms} disponíveis`,
        iconBg: '#EFF6FF',
        iconColor: '#2B7FFF',
        icon: 'bed-outline' as const,
      },
      {
        id: 'occupancy',
        value: `${m.occupancyRate}%`,
        label: 'Taxa de ocupação',
        hint: `${m.occupancyTrendPercent >= 0 ? '+' : ''}${m.occupancyTrendPercent}% vs mês ant.`,
        iconBg: '#F5F3FF',
        iconColor: '#8B5CF6',
        icon: 'analytics-outline' as const,
      },
    ],
    today: [
      {
        label: 'Propriedades activas',
        value: String(dashboard.quickStats.activeProperties),
      },
      {
        label: 'Check-ins hoje',
        value: String(dashboard.quickStats.checkInsToday),
      },
      {
        label: 'Check-outs hoje',
        value: String(dashboard.quickStats.checkOutsToday),
      },
    ],
    pending: pending
      ? {
          id: pending.id,
          guest: pending.guestName,
          property: `${pending.propertyName} · ${pending.roomName}`,
          dates: formatDateRange(pending.checkInDate, pending.checkOutDate),
          amount: formatMt(pending.totalAmount),
        }
      : null,
    activity: dashboard.recentActivity.map((a) => ({
      id: a.id,
      title: a.title,
      detail: a.description ?? '',
      time: new Date(a.createdAt).toLocaleTimeString('pt-MZ', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      icon: 'calendar-outline' as const,
      bg: '#FFF7ED',
      color: '#FF6900',
    })),
  };
}

export const amenityApiByLabel: Record<string, string> = {
  'Wi-Fi gratuito': 'wifi_gratuito',
  'Ar condicionado': 'ar_condicionado',
  Televisão: 'televisao',
  'Casa de banho privativa': 'casa_banho_privativa',
  'Água quente': 'agua_quente',
  Toalhas: 'toalhas',
  'Roupa de cama': 'roupa_de_cama',
  'Mesa de trabalho': 'mesa_de_trabalho',
  Estacionamento: 'estacionamento',
  Cozinha: 'kitchenette',
  Minibar: 'minibar',
  Cofre: 'cofre',
  Varanda: 'varanda',
  'Vista mar': 'vista_mar',
  'Pequeno-almoço': 'pequeno_almoco',
  Frigorífico: 'frigorifico',
  Roupeiro: 'roupeiro',
  'Secador de cabelo': 'secador_cabelo',
  'Ferro de engomar': 'ferro_engomar',
  'Rede mosquiteira': 'rede_mosquito',
};

export const propertyTypeApiByLabel: Record<string, string> = {
  Pensão: 'pensao',
  'Guest House': 'hostel',
  Apartamento: 'apartamento',
  Hostel: 'hostel',
  Lodge: 'lodge',
  Hotel: 'hotel',
  Casa: 'casa',
};

export const roomTypeApiByLabel: Record<string, string> = {
  Individual: 'individual',
  Casal: 'casal',
  Twin: 'twin',
  Triple: 'triple',
  Suite: 'suite',
  Familiar: 'familiar',
  Estúdio: 'estudio',
  Dormitório: 'dormitorio',
  Standard: 'casal',
  'Quarto Deluxe': 'suite',
  'Quarto inteiro': 'familiar',
  'Quarto compartilhado': 'dormitorio',
};
