export const TEST_IMAGE_URL =
  'https://media.istockphoto.com/id/1990444472/pt/foto/scandinavian-style-cozy-living-room-interior.jpg?s=612x612&w=0&k=20&c=Tz_iUbuMBRFbv2qpI1F4ERenCrfn1gvQMkHizktwRTI=';

export const TEST_IMAGE_URL_2 = `${TEST_IMAGE_URL}&v=2`;

export const guestPayload = {
  name: 'Maria Sitoe',
  birthDate: '15/03/1995',
  phone: '841111111',
  password: 'senha12345',
  confirmPassword: 'senha12345',
};

export const hostPayload = {
  name: 'Osvaldo Host',
  birthDate: '20/01/1990',
  phone: '842222222',
  password: 'senha12345',
  confirmPassword: 'senha12345',
};

export const propertyPayload = {
  name: 'Pensão Maputo Sundown',
  type: 'pensao' as const,
  description:
    'Ambiente acolhedor no coração de Maputo, ideal para estadias curtas e longas.',
  contactPhone: '843333333',
  whatsapp: '843333333',
  coverImageUrl: TEST_IMAGE_URL,
  province: 'maputo_cidade' as const,
  city: 'Maputo',
  community: 'polana' as const,
  neighborhood: 'Polana',
  address: 'Avenida Julius Nyerere, nº 120',
  postalCode: '1205',
  latitude: -25.962,
  longitude: 32.581,
};

export const roomPayload = {
  name: 'Suite Deluxe',
  type: 'suite' as const,
  status: 'disponivel' as const,
  description: 'Quarto espaçoso com vista e comodidades completas para o hóspede.',
  maxCapacity: 2,
  modalities: ['hora', 'noite'] as Array<'hora' | 'noite'>,
  prices: { hora: 1200, noite: 3200 },
  amenities: ['wifi_gratuito', 'ar_condicionado', 'televisao'] as Array<
    'wifi_gratuito' | 'ar_condicionado' | 'televisao'
  >,
  images: [TEST_IMAGE_URL, TEST_IMAGE_URL_2],
};
