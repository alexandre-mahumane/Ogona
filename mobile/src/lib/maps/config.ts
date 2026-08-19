export const MAPBOX_ACCESS_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_TOKEN ??
  'pk.eyJ1Ijoic2hhdzEyIiwiYSI6ImNrZXR4bDhmbDBqYmUzNGxoa2I3M2hmdDMifQ.b-m-i1U8b4MWy5WUCegzSQ';

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
