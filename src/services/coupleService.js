import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION = 'couples';

export async function getCoupleProfile(coupleId) {
  if (!coupleId) return null;
  const ref = doc(db, COLLECTION, coupleId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function updateCoupleProfile(coupleId, data) {
  if (!coupleId) throw new Error('coupleId gerekli.');
  const ref = doc(db, COLLECTION, coupleId);
  const existing = await getDoc(ref);
  await setDoc(
    ref,
    {
      ...data,
      updatedAt: serverTimestamp(),
      ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true }
  );
  return getCoupleProfile(coupleId);
}
