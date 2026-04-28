import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION = 'entries';

// Sort by createdAt in JS — avoids composite index requirement in Firestore
function sortByCreatedAt(docs) {
  return docs.sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0));
}

export async function getEntriesByYear(year) {
  const q = query(collection(db, COLLECTION), where('year', '==', year));
  const snap = await getDocs(q);
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  console.log('[FIRESTORE_READ] getEntriesByYear', year, '→', docs.length, 'entries');
  return sortByCreatedAt(docs);
}

export async function getEntriesByDate(dateStr) {
  const q = query(collection(db, COLLECTION), where('date', '==', dateStr));
  const snap = await getDocs(q);
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  console.log('[FIRESTORE_READ] getEntriesByDate', dateStr, '→', docs.length, 'entries');
  return sortByCreatedAt(docs);
}

export async function getAllEntries() {
  const snap = await getDocs(collection(db, COLLECTION));
  const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  console.log('[FIRESTORE_READ] getAllEntries →', docs.length, 'entries');
  return sortByCreatedAt(docs);
}

export async function addEntry(entry) {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...entry,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  console.log('[FIRESTORE_CREATE_SUCCESS] id:', docRef.id);
  return docRef.id;
}

export async function updateEntry(entryId, data) {
  const ref = doc(db, COLLECTION, entryId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
  console.log('[FIRESTORE_UPDATE_SUCCESS] id:', entryId);
}

export async function deleteEntry(entryId) {
  await deleteDoc(doc(db, COLLECTION, entryId));
  console.log('[FIRESTORE_DELETE_SUCCESS] id:', entryId);
}
