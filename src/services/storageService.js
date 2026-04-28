import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

export async function uploadImages(files, date, userId) {
  const [year, month, day] = date.split('-');
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

export async function deleteImage(path) {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}
