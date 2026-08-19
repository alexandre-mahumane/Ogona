import * as ImagePicker from 'expo-image-picker';

type PickOptions = {
  limit?: number;
  allowsEditing?: boolean;
};

export async function pickImages(options: PickOptions = {}): Promise<string[]> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) {
    throw new Error('Precisamos de acesso à galeria para adicionar fotos.');
  }

  const limit = Math.max(1, options.limit ?? 1);
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: limit > 1,
    selectionLimit: limit,
    quality: 0.8,
    allowsEditing: options.allowsEditing ?? false,
    aspect: options.allowsEditing ? [1, 1] : undefined,
  });

  if (result.canceled) return [];
  return result.assets.map((asset) => asset.uri).filter(Boolean);
}
