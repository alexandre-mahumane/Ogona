import Mapbox from '@rnmapbox/maps';
import { Platform } from 'react-native';

import { MAPBOX_ACCESS_TOKEN, MAP_STYLE_URL } from '@/lib/maps/config';

let initialized = false;

export const mapViewStyle = { flex: 1, backgroundColor: '#F8F4F0' } as const;

export const mapViewProps = {
  styleURL: MAP_STYLE_URL,
  projection: 'mercator' as const,
  surfaceView: false,
  scaleBarEnabled: false,
  logoEnabled: false,
};

export function initMapbox() {
  if (initialized || Platform.OS === 'web') return;
  Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN || null);
  Mapbox.setTelemetryEnabled(false);
  initialized = true;
}
