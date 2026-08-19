import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

import { ensureFirebaseUser, getFirebaseStorage } from '@/lib/firebase/app';
import { useAuthStore } from '@/stores/auth.store';

export type UploadFolder = 'properties' | 'rooms' | 'profiles';

type BlobWithClose = Blob & { close?: () => void };

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

function uriToBlob(uri: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response as Blob);
    xhr.onerror = () => reject(new Error('Não foi possível ler a imagem.'));
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
}

function objectPath(folder: UploadFolder, contentType: string): string {
  const userId = useAuthStore.getState().user?.id ?? 'anon';
  const id =
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const ext = extensionFromContentType(contentType);
  return `ogona/${folder}/${userId}/${id}.${ext}`;
}

export async function uploadImage(
  localUri: string,
  folder: UploadFolder,
): Promise<string> {
  await ensureFirebaseUser();

  const contentType = contentTypeFromUri(localUri);
  const blob = (await uriToBlob(localUri)) as BlobWithClose;
  const storageRef = ref(getFirebaseStorage(), objectPath(folder, contentType));

  try {
    await uploadBytes(storageRef, blob, { contentType });
  } finally {
    blob.close?.();
  }

  return getDownloadURL(storageRef);
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
