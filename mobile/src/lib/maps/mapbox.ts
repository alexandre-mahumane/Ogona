import Mapbox from '@rnmapbox/maps';
import { Platform } from 'react-native';

import { MAPBOX_ACCESS_TOKEN } from '@/lib/maps/config';

let initialized = false;

export function initMapbox() {
  if (initialized || Platform.OS === 'web') return;
  Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);
  initialized = true;
}
