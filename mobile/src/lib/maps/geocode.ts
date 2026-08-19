import * as Location from 'expo-location';

export type PickedLocation = {
  latitude: number;
  longitude: number;
  country: string;
  city: string;
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

export function provinceFromCity(city: string): string {
  const key = city.trim().toLowerCase();
  for (const [name, province] of CITY_PROVINCE) {
    if (key.includes(name)) return province;
  }
  return 'maputo_cidade';
}

function fromGeocode(
  latitude: number,
  longitude: number,
  place?: Location.LocationGeocodedAddress,
): PickedLocation {
  return {
    latitude,
    longitude,
    country: place?.country || 'Moçambique',
    city: place?.city || place?.subregion || place?.region || '',
    street: place?.street || place?.district || '',
    door: place?.streetNumber || '',
    postal: place?.postalCode || '',
  };
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<PickedLocation> {
  const [place] = await Location.reverseGeocodeAsync({ latitude, longitude });
  return fromGeocode(latitude, longitude, place);
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
  const line = [location.street, location.door].filter(Boolean).join(' ');
  return (
    [line, location.city, location.country].filter(Boolean).join(', ') ||
    `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}`
  );
}
