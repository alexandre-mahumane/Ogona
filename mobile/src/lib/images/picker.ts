import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

type PickOptions = {
  limit?: number;
  allowsEditing?: boolean;
};

export async function pickImages(options: PickOptions = {}): Promise<string[]> {
  if (Platform.OS === 'ios') {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      throw new Error('Precisamos de acesso à galeria para adicionar fotos.');
    }
  }

  const limit = Math.max(1, options.limit ?? 1);
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: limit > 1,
    selectionLimit: limit,
    quality: 0.7,
    exif: false,
    allowsEditing: options.allowsEditing ?? false,
    aspect: options.allowsEditing ? [1, 1] : undefined,
  });

  if (result.canceled) return [];
  return result.assets.map((asset) => asset.uri).filter(Boolean);
}
