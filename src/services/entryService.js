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
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore';
import { db } from '../firebase';
import { normalizeDateKey } from '../utils/dateUtils';
import { normalizeImageUrls } from '../utils/imageUtils';

const COLLECTION = 'entries';

function normalizeVideoItems(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (typeof item === 'string') return { url: item };
      if (!item || typeof item !== 'object') return null;
      const url = typeof item.url === 'string'
        ? item.url
        : (typeof item.downloadURL === 'string' ? item.downloadURL : null);
      if (!url) return null;
      return {
        url,
        path: typeof item.path === 'string' ? item.path : '',
        contentType: typeof item.contentType === 'string' ? item.contentType : '',
        sizeBytes: Number.isFinite(item.sizeBytes) ? item.sizeBytes : 0,
        name: typeof item.name === 'string' ? item.name : '',
      };
    })
    .filter(Boolean);
}

function normalizeEntry(raw) {
  const safeDate = normalizeDateKey(raw?.date) ?? '';
  return {
    ...raw,
    date: safeDate,
    favorite: Boolean(raw?.favorite),
    imageUrls: normalizeImageUrls(raw?.imageUrls),
    videoUrls: normalizeVideoItems(raw?.videoUrls),
  };
}

// Sort by createdAt in JS — avoids composite index requirement in Firestore
function sortByCreatedAt(docs) {
  return docs.sort((a, b) => (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0));
}

export async function getEntriesByYear(year) {
  const q = query(collection(db, COLLECTION), where('year', '==', year));
  const snap = await getDocs(q);
  const docs = snap.docs.map((d) => normalizeEntry({ id: d.id, ...d.data() }));
  console.log('[FIRESTORE_READ] getEntriesByYear', year, '→', docs.length, 'entries');
  return sortByCreatedAt(docs);
}

export async function getEntriesByDate(dateStr) {
  const q = query(collection(db, COLLECTION), where('date', '==', dateStr));
  const snap = await getDocs(q);
  const docs = snap.docs.map((d) => normalizeEntry({ id: d.id, ...d.data() }));
  console.log('[FIRESTORE_READ] getEntriesByDate', dateStr, '→', docs.length, 'entries');
  return sortByCreatedAt(docs);
}

export async function getAllEntries() {
  const snap = await getDocs(collection(db, COLLECTION));
  const docs = snap.docs.map((d) => normalizeEntry({ id: d.id, ...d.data() }));
  console.log('[FIRESTORE_READ] getAllEntries →', docs.length, 'entries');
  return sortByCreatedAt(docs);
}

export async function getLatestEntries(limitN = 50) {
  const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'), limit(limitN));
  const snap = await getDocs(q);
  const docs = snap.docs.map((d) => normalizeEntry({ id: d.id, ...d.data() }));
  return docs;
}

export async function getEntriesPage({ cursor = null, pageSize = 30 } = {}) {
  const constraints = [orderBy('createdAt', 'desc'), limit(pageSize)];
  if (cursor) constraints.push(startAfter(cursor));
  const q = query(collection(db, COLLECTION), ...constraints);
  const snap = await getDocs(q);
  const docs = snap.docs.map((d) => normalizeEntry({ id: d.id, ...d.data() }));
  const nextCursor = snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null;
  return { docs, cursor: nextCursor, hasMore: snap.docs.length === pageSize };
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
