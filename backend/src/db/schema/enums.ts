import { pgEnum } from 'drizzle-orm/pg-core';

/** Papel do utilizador. */
export const userRoleEnum = pgEnum('user_role', ['guest', 'host']);

/** Províncias de Moçambique. */
export const provinceEnum = pgEnum('province', [
  'maputo_cidade',
  'maputo_provincia',
  'gaza',
  'inhambane',
  'sofala',
  'manica',
  'tete',
  'zambezia',
  'nampula',
  'cabo_delgado',
  'niassa',
]);

/**
 * Comunidades / zonas de referência (turísticas e urbanas).
 * Complementa bairro (texto livre).
 */
export const communityEnum = pgEnum('community', [
  'polana',
  'sommerschield',
  'costa_do_sol',
  'bairro_central',
  'malhangalene',
  'maxaquene',
  'alto_mae',
  'coop',
  'triunfo',
  'matola_cidade',
  'matola_rio',
  'ka_tembe',
  'catembe',
  'marracuene',
  'xai_xai',
  'bilene',
  'inhambane_cidade',
  'tofo',
  'barra',
  'vilanculos',
  'bazaruto',
  'beira',
  'chimoio',
  'tete_cidade',
  'quelimane',
  'nampula_cidade',
  'ilha_de_mocambique',
  'pemba',
  'nacala',
  'lichinga',
  'outra',
]);

/** Tipo de propriedade / alojamento. */
export const propertyTypeEnum = pgEnum('property_type', [
  'pensao',
  'apartamento',
  'hotel',
  'casa',
  'hostel',
  'villa',
  'lodge',
  'resort',
]);

/** Estado de publicação da propriedade (UI: Publicadas / Rascunho / Ocultas / Em revisão). */
export const propertyStatusEnum = pgEnum('property_status', [
  'draft',
  'published',
  'hidden',
  'under_review',
]);

/** Tipo de quarto. */
export const roomTypeEnum = pgEnum('room_type', [
  'individual',
  'casal',
  'twin',
  'triple',
  'suite',
  'familiar',
  'estudio',
  'dormitorio',
]);

/** Disponibilidade operacional do quarto. */
export const roomStatusEnum = pgEnum('room_status', [
  'disponivel',
  'indisponivel',
  'manutencao',
]);

/** Modalidades de reserva. */
export const bookingModalityEnum = pgEnum('booking_modality', [
  'hora',
  'noite',
  'semana',
  'mes',
]);

/** Comodidades do quarto. */
export const amenityEnum = pgEnum('amenity', [
  'wifi_gratuito',
  'ar_condicionado',
  'televisao',
  'casa_banho_privativa',
  'agua_quente',
  'roupa_de_cama',
  'toalhas',
  'mesa_de_trabalho',
  'minibar',
  'cofre',
  'varanda',
  'vista_mar',
  'estacionamento',
  'pequeno_almoco',
  'kitchenette',
  'frigorifico',
  'roupeiro',
  'secador_cabelo',
  'ferro_engomar',
  'rede_mosquito',
]);

/** Estado persistido da reserva. */
export const reservationStatusEnum = pgEnum('reservation_status', [
  'pending',
  'awaiting_payment',
  'confirmed',
  'rejected',
  'cancelled',
  'completed',
]);

/** Método de pagamento (stub local). */
export const paymentMethodEnum = pgEnum('payment_method', ['m_pesa', 'e_mola']);

/** Estado de um dia no calendário do quarto. */
export const calendarDayKindEnum = pgEnum('calendar_day_kind', [
  'blocked',
  'price_override',
]);

/** Pagamento. */
export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'paid',
  'failed',
  'refunded',
]);

/** Tipos de actividade no feed do host. */
export const activityTypeEnum = pgEnum('activity_type', [
  'reservation_created',
  'reservation_accepted',
  'reservation_rejected',
  'reservation_cancelled',
  'payment_received',
  'review_created',
]);
