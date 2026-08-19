import { and, eq } from 'drizzle-orm';
import { db } from '../config/database';
import {
  favorites,
  properties,
  reservations,
  roomAmenities,
  roomImages,
  roomPrices,
  rooms,
  users,
} from '../db/schema';
import { normalizePhone } from '../utils/phone';
import { hashPassword } from '../utils/password';

const IMAGE =
  'https://media.istockphoto.com/id/1990444472/pt/foto/scandinavian-style-cozy-living-room-interior.jpg?s=612x612&w=0&k=20&c=Tz_iUbuMBRFbv2qpI1F4ERenCrfn1gvQMkHizktwRTI=';
const IMAGE_2 = `${IMAGE}&v=2`;

const GUEST = {
  name: 'Maria Sitoe',
  birthDate: '15/03/1995',
  phone: '841111111',
  password: 'senha12345',
};

const HOST = {
  name: 'Host',
  birthDate: '20/01/1990',
  phone: '842222222',
  password: 'senha12345',
};

function parseBirthDate(value: string): Date {
  const [day, month, year] = value.split('/').map(Number);
  return new Date(Date.UTC(year!, month! - 1, day!));
}

function addDays(base: Date, days: number): Date {
  const next = new Date(base);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

async function upsertUser(input: {
  name: string;
  phone: string;
  password: string;
  birthDate: string;
  role: 'guest' | 'host';
}) {
  const phone = normalizePhone(input.phone);
  const passwordHash = await hashPassword(input.password);
  const birthDate = parseBirthDate(input.birthDate);

  const [existing] = await db.select().from(users).where(eq(users.phone, phone)).limit(1);
  if (existing) {
    const [updated] = await db
      .update(users)
      .set({
        name: input.name,
        passwordHash,
        birthDate,
        role: input.role,
        updatedAt: new Date(),
      })
      .where(eq(users.id, existing.id))
      .returning();
    return updated ?? existing;
  }

  const [created] = await db
    .insert(users)
    .values({
      name: input.name,
      phone,
      passwordHash,
      birthDate,
      role: input.role,
    })
    .returning();

  if (!created) throw new Error('Failed to create user');
  return created;
}

async function createRoomForProperty(
  propertyId: string,
  name: string,
  prices: Partial<Record<'hora' | 'noite' | 'semana' | 'mes', number>>,
) {
  const [room] = await db
    .insert(rooms)
    .values({
      propertyId,
      name,
      type: 'suite',
      status: 'disponivel',
      description: 'Quarto espaçoso com vista e comodidades completas para o hóspede.',
      maxCapacity: 2,
    })
    .returning();

  if (!room) throw new Error('Failed to create room');

  await db.insert(roomPrices).values(
    (Object.entries(prices) as [keyof typeof prices, number][]).map(([modality, amount]) => ({
      roomId: room.id,
      modality,
      amount: amount.toFixed(2),
      currency: 'MZN',
    })),
  );

  await db.insert(roomAmenities).values(
    (['wifi_gratuito', 'ar_condicionado', 'televisao'] as const).map((amenity) => ({
      roomId: room.id,
      amenity,
    })),
  );

  await db.insert(roomImages).values(
    [IMAGE, IMAGE_2].map((url, sortOrder) => ({
      roomId: room.id,
      url,
      sortOrder,
    })),
  );

  return room;
}

/** Demo dataset used by mobile + `npm run db:seed`. */
export async function seedDemoData() {
  const host = await upsertUser({ ...HOST, role: 'host' });
  const guest = await upsertUser({ ...GUEST, role: 'guest' });

  const existingPublished = await db
    .select()
    .from(properties)
    .where(and(eq(properties.hostId, host.id), eq(properties.status, 'published')))
    .limit(1);

  if (existingPublished.length > 0) {
    return {
      host,
      guest,
      reused: true as const,
      propertyId: existingPublished[0]!.id,
    };
  }

  const [maputo] = await db
    .insert(properties)
    .values({
      hostId: host.id,
      name: 'Pensão Maputo Sundown',
      type: 'pensao',
      description:
        'Ambiente acolhedor no coração de Maputo, ideal para estadias curtas e longas.',
      contactPhone: normalizePhone('843333333'),
      whatsapp: normalizePhone('843333333'),
      coverImageUrl: IMAGE,
      province: 'maputo_cidade',
      city: 'Maputo',
      community: 'polana',
      neighborhood: 'Polana',
      address: 'Avenida Julius Nyerere, nº 120',
      postalCode: '1205',
      latitude: -25.962,
      longitude: 32.581,
      bathrooms: 2,
      parkingSpots: 1,
      houseRules: ['Proibido fumar', 'Check-in a partir das 14:00'],
      status: 'published',
    })
    .returning();

  if (!maputo) throw new Error('Failed to create Maputo property');

  const [beira] = await db
    .insert(properties)
    .values({
      hostId: host.id,
      name: 'Guest House Beira Central',
      type: 'hostel',
      description:
        'Guest house confortável no centro da Beira, perto da praia e do comércio local.',
      contactPhone: normalizePhone('844444444'),
      whatsapp: normalizePhone('844444444'),
      coverImageUrl: IMAGE_2,
      province: 'sofala',
      city: 'Beira',
      community: 'beira',
      neighborhood: 'Ponta Gêa',
      address: 'Rua Major Matola, 45',
      postalCode: '2100',
      latitude: -19.833,
      longitude: 34.85,
      bathrooms: 2,
      parkingSpots: 1,
      houseRules: ['Silêncio após as 22h'],
      status: 'published',
    })
    .returning();

  if (!beira) throw new Error('Failed to create Beira property');

  const suite = await createRoomForProperty(maputo.id, 'Suite Deluxe', {
    hora: 1200,
    noite: 3200,
  });
  await createRoomForProperty(maputo.id, 'Quarto Standard', { noite: 1800 });
  await createRoomForProperty(beira.id, 'Quarto Standard', {
    hora: 800,
    noite: 1500,
  });

  const checkIn = addDays(new Date(), 10);
  const checkOut = addDays(checkIn, 3);

  await db.insert(reservations).values({
    propertyId: maputo.id,
    roomId: suite.id,
    guestId: guest.id,
    hostId: host.id,
    modality: 'noite',
    checkInDate: checkIn,
    checkOutDate: checkOut,
    units: 3,
    guestCount: 2,
    unitPrice: '3200.00',
    subtotalAmount: '9600.00',
    feePercent: '3.30',
    feeAmount: '316.80',
    totalAmount: '9916.80',
    currency: 'MZN',
    status: 'pending',
  });

  await db.insert(favorites).values({
    guestId: guest.id,
    propertyId: maputo.id,
  });

  return {
    host,
    guest,
    reused: false as const,
    propertyId: maputo.id,
    suiteId: suite.id,
  };
}
