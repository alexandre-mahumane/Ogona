import { useState } from 'react';
import { Alert } from 'react-native';

import { useUpdateProfileMutation } from '@/hooks/useAuth';
import { uploadImage } from '@/lib/firebase/storage';
import { pickImages } from '@/lib/images/picker';

export function useAvatar() {
  const updateProfile = useUpdateProfileMutation();
  const [busy, setBusy] = useState(false);

  async function changeAvatar() {
    if (busy || updateProfile.isPending) return;

    try {
      const [uri] = await pickImages({ limit: 1, allowsEditing: true });
      if (!uri) return;

      setBusy(true);
      const photoUrl = await uploadImage(uri, 'profiles');
      await updateProfile.mutateAsync({ photoUrl });
    } catch (error) {
      Alert.alert(
        'Não foi possível actualizar a foto',
        error instanceof Error ? error.message : 'Tente novamente.',
      );
    } finally {
      setBusy(false);
    }
  }

  return { changeAvatar, busy: busy || updateProfile.isPending };
}
