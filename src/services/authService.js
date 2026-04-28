import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth } from '../firebase';
import { ALLOWED_USERS } from '../config/appConfig';

export function isAllowedUser(email) {
  return ALLOWED_USERS.includes(email?.toLowerCase());
}

export async function login(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  if (!isAllowedUser(credential.user.email)) {
    await signOut(auth);
    throw new Error('Bu hesap bu uygulamaya erişim iznine sahip değil.');
  }
  return credential.user;
}

export async function logout() {
  await signOut(auth);
}

export function observeAuthState(callback) {
  return onAuthStateChanged(auth, (user) => {
    if (user && !isAllowedUser(user.email)) {
      signOut(auth);
      callback(null);
    } else {
      callback(user);
    }
  });
}
