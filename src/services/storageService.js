import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';
import { normalizeDateKey } from '../utils/dateUtils';

function buildStorageDateParts(date) {
  const safeDate = normalizeDateKey(date);
  if (!safeDate) {
    throw new Error('Geçersiz tarih bilgisi.');
  }
  return safeDate.split('-');
}

export async function uploadImages(files, date, userId) {
  if (!Array.isArray(files) || files.length === 0) return [];
  if (!userId) throw new Error('Kullanıcı bilgisi bulunamadı.');
  const [year, month, day] = buildStorageDateParts(date);
  const urls = [];

  for (const file of files) {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `memories/${year}/${month}/${day}/${userId}/${fileName}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    urls.push({ url, path });
  }

  return urls;
}

export async function uploadVideos(files, date, userId) {
  if (!Array.isArray(files) || files.length === 0) return [];
  if (!userId) throw new Error('Kullanıcı bilgisi bulunamadı.');
  const [year, month, day] = buildStorageDateParts(date);
  const videos = [];

  for (const file of files) {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `memories/${year}/${month}/${day}/${userId}/${fileName}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    videos.push({
      url,
      path,
      name: file.name,
      contentType: file.type || 'video/mp4',
      sizeBytes: file.size || 0,
    });
  }

  return videos;
}

export async function deleteImage(path) {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}
