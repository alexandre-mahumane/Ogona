export const MAPBOX_ACCESS_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN ?? '';

// Mapbox streets-v11 precisa de um pk. válido. O token actual dá 401 e o mapa fica preto.
export const MAP_STYLE_URL =
  process.env.EXPO_PUBLIC_MAPBOX_STYLE_URL ??
  'https://tiles.openfreemap.org/styles/bright';

export const MAPUTO_COORDINATE = {
  latitude: -25.9692,
  longitude: 32.5732,
};

export const DEFAULT_ZOOM = 14;

export function toLngLat(latitude: number, longitude: number): [number, number] {
  return [longitude, latitude];
}

export function mapsAppUrl(latitude: number, longitude: number, label?: string) {
  const q = label ? encodeURIComponent(label) : `${latitude},${longitude}`;
  return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}&q=${q}`;
}
