import * as Location from 'expo-location';

export type PickedLocation = {
  latitude: number;
  longitude: number;
  country: string;
  city: string;
  neighborhood: string;
  street: string;
  door: string;
  postal: string;
};

const CITY_PROVINCE: [string, string][] = [
  ['matola', 'maputo_provincia'],
  ['marracuene', 'maputo_provincia'],
  ['maputo', 'maputo_cidade'],
  ['beira', 'sofala'],
  ['nampula', 'nampula'],
  ['pemba', 'cabo_delgado'],
  ['quelimane', 'zambezia'],
  ['tete', 'tete'],
  ['chimoio', 'manica'],
  ['vilanculos', 'inhambane'],
  ['tofo', 'inhambane'],
  ['inhambane', 'inhambane'],
  ['xai-xai', 'gaza'],
  ['xai xai', 'gaza'],
  ['bilene', 'gaza'],
  ['lichinga', 'niassa'],
  ['nacala', 'nampula'],
];

const KNOWN_CITIES = [
  'Maputo',
  'Matola',
  'Marracuene',
  'Xai-Xai',
  'Bilene',
  'Inhambane',
  'Vilanculos',
  'Tofo',
  'Beira',
  'Chimoio',
  'Tete',
  'Quelimane',
  'Nampula',
  'Nacala',
  'Pemba',
  'Lichinga',
];

type NominatimAddress = {
  neighbourhood?: string;
  neighborhood?: string;
  suburb?: string;
  quarter?: string;
  residential?: string;
  village?: string;
  hamlet?: string;
  city_district?: string;
  city?: string;
  town?: string;
  municipality?: string;
  county?: string;
  road?: string;
  pedestrian?: string;
  house_number?: string;
  postcode?: string;
  country?: string;
};

function clean(value?: string | null) {
  return value?.replace(/\s+/g, ' ').trim() || '';
}

function looksLikeStreet(value: string) {
  return /^(av\.?|avenida|rua|travessa|praça|praca|estrada|en)\b/i.test(value);
}

export function matchKnownCity(value: string) {
  const key = clean(value).toLowerCase();
  if (!key) return '';
  const match = KNOWN_CITIES.find(
    (city) => key === city.toLowerCase() || key.includes(city.toLowerCase()),
  );
  return match ?? clean(value);
}

export function provinceFromCity(city: string): string {
  const key = city.trim().toLowerCase();
  for (const [name, province] of CITY_PROVINCE) {
    if (key.includes(name)) return province;
  }
  return 'maputo_cidade';
}

function pickDistinct(
  candidates: Array<string | null | undefined>,
  ...exclude: string[]
) {
  const skipped = new Set(exclude.map((item) => item.toLowerCase()).filter(Boolean));
  for (const candidate of candidates) {
    const value = clean(candidate);
    if (!value || looksLikeStreet(value)) continue;
    if (skipped.has(value.toLowerCase())) continue;
    return value;
  }
  return '';
}

function emptyPicked(latitude: number, longitude: number): PickedLocation {
  return {
    latitude,
    longitude,
    country: 'Moçambique',
    city: '',
    neighborhood: '',
    street: '',
    door: '',
    postal: '',
  };
}

function mergePicked(
  latitude: number,
  longitude: number,
  ...parts: Array<Partial<PickedLocation> | null>
): PickedLocation {
  const base = emptyPicked(latitude, longitude);
  for (const part of parts) {
    if (!part) continue;
    if (part.country) base.country = part.country;
    if (part.city) base.city = matchKnownCity(part.city);
    if (part.neighborhood) base.neighborhood = part.neighborhood;
    if (part.street) base.street = part.street;
    if (part.door) base.door = part.door;
    if (part.postal) base.postal = part.postal;
  }
  if (base.neighborhood && base.neighborhood.toLowerCase() === base.city.toLowerCase()) {
    base.neighborhood = '';
  }
  return base;
}

function fromExpo(place?: Location.LocationGeocodedAddress | null): Partial<PickedLocation> {
  if (!place) return {};
  const city = matchKnownCity(place.city || place.subregion || '');
  const street = clean(place.street);
  return {
    country: clean(place.country) || 'Moçambique',
    city,
    neighborhood: pickDistinct([place.district, place.subregion, place.name], city, street),
    street,
    door: clean(place.streetNumber),
    postal: clean(place.postalCode),
  };
}

function fromNominatim(address?: NominatimAddress | null): Partial<PickedLocation> {
  if (!address) return {};
  const city = matchKnownCity(
    address.city || address.town || address.municipality || address.county || '',
  );
  const street = clean(address.road || address.pedestrian);
  return {
    country: clean(address.country) || 'Moçambique',
    city,
    neighborhood: pickDistinct(
      [
        address.neighbourhood,
        address.neighborhood,
        address.suburb,
        address.quarter,
        address.residential,
        address.village,
        address.hamlet,
        address.city_district,
      ],
      city,
      street,
    ),
    street,
    door: clean(address.house_number),
    postal: clean(address.postcode),
  };
}

async function reverseNominatim(
  latitude: number,
  longitude: number,
): Promise<Partial<PickedLocation> | null> {
  const url =
    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}` +
    `&lon=${longitude}&format=jsonv2&addressdetails=1&zoom=18&accept-language=pt`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Accept-Language': 'pt',
      'User-Agent': 'Ogona/1.0 (https://ogona.app)',
    },
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { address?: NominatimAddress };
  const parsed = fromNominatim(data.address);
  return parsed.city || parsed.neighborhood || parsed.street ? parsed : null;
}

async function reverseExpo(
  latitude: number,
  longitude: number,
): Promise<Partial<PickedLocation> | null> {
  const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
  const parsed = fromExpo(place);
  return parsed.city || parsed.neighborhood || parsed.street ? parsed : null;
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<PickedLocation> {
  const [nominatim, expo] = await Promise.all([
    reverseNominatim(latitude, longitude).catch(() => null),
    reverseExpo(latitude, longitude).catch(() => null),
  ]);
  return mergePicked(latitude, longitude, expo, nominatim);
}

export async function getCurrentCoords(): Promise<{ lat: number; lng: number } | null> {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') return null;

  const position = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Balanced,
  });

  return {
    lat: position.coords.latitude,
    lng: position.coords.longitude,
  };
}

export async function getCurrentLocation(): Promise<PickedLocation> {
  const coords = await getCurrentCoords();
  if (!coords) {
    throw new Error('Precisamos da localização para preencher o endereço.');
  }

  return reverseGeocode(coords.lat, coords.lng);
}

export function formatPickedAddress(location: PickedLocation): string {
  const line = [location.street, location.door].filter(Boolean).join(', ');
  return (
    [location.neighborhood, line, location.city].filter(Boolean).join(', ') ||
    `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
  );
}
