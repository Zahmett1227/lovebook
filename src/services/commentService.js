import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  getCountFromServer,
} from 'firebase/firestore';
import { db } from '../firebase';

function commentsCol(entryId) {
  return collection(db, 'entries', entryId, 'comments');
}

export async function getComments(entryId) {
  if (!entryId) return [];
  const q = query(commentsCol(entryId), orderBy('createdAt', 'asc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getCommentCount(entryId) {
  if (!entryId) return 0;
  const q = query(commentsCol(entryId));
  const agg = await getCountFromServer(q);
  return agg.data().count;
}

export async function addComment(entryId, commentData) {
  if (!entryId) throw new Error('entryId gerekli.');
  const payload = {
    ...commentData,
    entryId,
    createdAt: serverTimestamp(),
  };
  const ref = await addDoc(commentsCol(entryId), payload);
  console.log('[FIRESTORE_CREATE_SUCCESS] comment:', ref.id);
  return ref.id;
}

export async function deleteComment(entryId, commentId, currentUserId) {
  if (!entryId || !commentId || !currentUserId) throw new Error('Geçersiz silme isteği.');
  const cref = doc(db, 'entries', entryId, 'comments', commentId);
  const snap = await getDoc(cref);
  if (!snap.exists()) throw new Error('Yorum bulunamadı.');
  const ownerId = snap.data()?.userId;
  if (ownerId !== currentUserId) throw new Error('Bu yorumu silme yetkin yok.');
  await deleteDoc(cref);
  console.log('[FIRESTORE_DELETE_SUCCESS] comment:', commentId);
}
