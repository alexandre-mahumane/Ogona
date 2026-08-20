import * as FileSystem from 'expo-file-system/legacy';
import { getDownloadURL, ref, uploadString } from 'firebase/storage';

import { ensureFirebaseUser, getFirebaseStorage } from '@/lib/firebase/app';
import { useAuthStore } from '@/stores/auth.store';

export type UploadFolder = 'properties' | 'rooms' | 'profiles';

export function isRemoteImageUrl(uri: string) {
  return /^https:\/\//i.test(uri);
}

function contentTypeFromUri(uri: string): string {
  const clean = uri.split('?')[0]?.toLowerCase() ?? '';
  if (clean.endsWith('.png')) return 'image/png';
  if (clean.endsWith('.webp')) return 'image/webp';
  if (clean.endsWith('.heic') || clean.endsWith('.heif')) return 'image/heic';
  return 'image/jpeg';
}

function extensionFromContentType(type: string): string {
  if (type === 'image/png') return 'png';
  if (type === 'image/webp') return 'webp';
  if (type === 'image/heic') return 'heic';
  return 'jpg';
}

function objectPath(folder: UploadFolder, contentType: string): string {
  const userId = useAuthStore.getState().user?.id ?? 'anon';
  const id =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const ext = extensionFromContentType(contentType);
  return `ogona/${folder}/${userId}/${id}.${ext}`;
}

async function toCacheFile(uri: string, ext: string): Promise<string> {
  if (uri.startsWith('file://')) return uri;
  const dest = `${FileSystem.cacheDirectory}ogona-upload-${Date.now()}.${ext}`;
  await FileSystem.copyAsync({ from: uri, to: dest });
  return dest;
}

function toUploadError(error: unknown): Error {
  if (error instanceof Error) {
    const code =
      'code' in error && typeof error.code === 'string' ? error.code : '';
    if (code.includes('unauthorized') || code.includes('unauthenticated')) {
      return new Error('Sem permissão para enviar fotos no Firebase Storage.');
    }
    if (code.includes('canceled') || code.includes('retry-limit')) {
      return new Error('O envio das fotos falhou. Verifique a internet e tente de novo.');
    }
    return error;
  }
  return new Error('Não foi possível enviar as fotos.');
}

export async function uploadImage(
  localUri: string,
  folder: UploadFolder,
): Promise<string> {
  await ensureFirebaseUser();

  const contentType = contentTypeFromUri(localUri);
  const fileUri = await toCacheFile(localUri, extensionFromContentType(contentType));
  const base64 = await FileSystem.readAsStringAsync(fileUri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const storageRef = ref(getFirebaseStorage(), objectPath(folder, contentType));
  try {
    await uploadString(storageRef, base64, 'base64', { contentType });
  } catch (error) {
    throw toUploadError(error);
  }

  const url = await getDownloadURL(storageRef);
  if (!isRemoteImageUrl(url)) {
    throw new Error('O servidor de fotos devolveu um URL inválido.');
  }
  return url;
}

export async function uploadImages(
  localUris: string[],
  folder: UploadFolder,
): Promise<string[]> {
  const urls: string[] = [];
  for (const uri of localUris) {
    urls.push(await uploadImage(uri, folder));
  }
  return urls;
}
