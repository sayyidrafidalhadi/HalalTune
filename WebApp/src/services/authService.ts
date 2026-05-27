import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  GoogleAuthProvider,
  updateProfile,
  sendPasswordResetEmail,
  type User,
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/firebase"

export type AuthMode = "local" | "session"

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback)
}

export async function setAuthPersistence(mode: AuthMode): Promise<void> {
  await setPersistence(auth, mode === "local" ? browserLocalPersistence : browserSessionPersistence)
}

export async function loginWithGoogle(): Promise<User> {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: "select_account" })
  const result = await signInWithPopup(auth, provider)
  await ensureUserProfile(result.user)
  return result.user
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password)
  return result.user
}

export async function registerWithEmail(email: string, password: string, displayName: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(result.user, { displayName })
  await ensureUserProfile(result.user, { displayName })
  return result.user
}

export async function logout(): Promise<void> {
  await signOut(auth)
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email)
}

export async function ensureUserProfile(user: User, extra?: { displayName?: string }): Promise<void> {
  const userRef = doc(db, "users", user.uid)
  const snap = await getDoc(userRef)

  if (!snap.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: extra?.displayName || user.displayName || "User",
      email: user.email || "",
      photoURL: user.photoURL || "",
      role: "listener",
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    })
  } else {
    await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true })
  }
}

export function getCurrentUser(): User | null {
  return auth.currentUser
}
