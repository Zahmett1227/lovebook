import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';
import { normalizeDateKey } from '../utils/dateUtils';
import { getErrorMessage, storageUserMessage } from '../utils/errorUtils';

function buildStorageDateParts(date) {
  const safeDate = normalizeDateKey(date);
  if (!safeDate) {
    throw new Error('Geçersiz tarih bilgisi.');
  }
  return safeDate.split('-');
}

function detectContentType(file, kind) {
  const explicit = file?.type;
  if (explicit && explicit.includes('/')) return explicit;
  const lowerName = String(file?.name || '').toLowerCase();
  if (kind === 'image') {
    if (lowerName.endsWith('.png')) return 'image/png';
    if (lowerName.endsWith('.webp')) return 'image/webp';
    if (lowerName.endsWith('.gif')) return 'image/gif';
    return 'image/jpeg';
  }
  if (lowerName.endsWith('.mov')) return 'video/quicktime';
  if (lowerName.endsWith('.m4v')) return 'video/x-m4v';
  if (lowerName.endsWith('.webm')) return 'video/webm';
  return 'video/mp4';
}

export async function uploadImages(files, date, userId) {
  if (!Array.isArray(files) || files.length === 0) return [];
  if (!userId) throw new Error('Kullanıcı bilgisi bulunamadı.');
  const [year, month, day] = buildStorageDateParts(date);
  const uploads = files.map(async (file) => {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `memories/${year}/${month}/${day}/${userId}/${fileName}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file, {
      contentType: detectContentType(file, 'image'),
      cacheControl: 'public,max-age=31536000,immutable',
    });
    const url = await getDownloadURL(storageRef);
    return { url, path };
  });
  const settled = await Promise.allSettled(uploads);
  const success = settled.filter((item) => item.status === 'fulfilled').map((item) => item.value);
  if (success.length === 0) {
    const firstError = settled.find((item) => item.status === 'rejected');
    const reason = firstError?.reason;
    console.error('[STORAGE_UPLOAD]', reason?.code, getErrorMessage(reason));
    throw new Error(storageUserMessage(reason));
  }
  return success;
}

export async function uploadVideos(files, date, userId) {
  if (!Array.isArray(files) || files.length === 0) return [];
  if (!userId) throw new Error('Kullanıcı bilgisi bulunamadı.');
  const [year, month, day] = buildStorageDateParts(date);
  const uploads = files.map(async (file) => {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `memories/${year}/${month}/${day}/${userId}/${fileName}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file, {
      contentType: detectContentType(file, 'video'),
      cacheControl: 'public,max-age=31536000,immutable',
    });
    const url = await getDownloadURL(storageRef);
    return {
      url,
      path,
      name: file.name,
      contentType: file.type || 'video/mp4',
      sizeBytes: file.size || 0,
    };
  });
  const settled = await Promise.allSettled(uploads);
  const success = settled.filter((item) => item.status === 'fulfilled').map((item) => item.value);
  if (success.length === 0) {
    const firstError = settled.find((item) => item.status === 'rejected');
    const reason = firstError?.reason;
    console.error('[STORAGE_UPLOAD]', reason?.code, getErrorMessage(reason));
    throw new Error(storageUserMessage(reason));
  }
  return success;
}

export async function deleteImage(path) {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}
