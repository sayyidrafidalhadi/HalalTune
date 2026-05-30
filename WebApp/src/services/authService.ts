import { initializeApp } from "firebase/app"
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from "firebase/auth"
import type { UserProfile } from "@/types"

const firebaseConfig = {
  apiKey: "AIzaSyB2ZpsWlcZX9B75X2wLn5u_GQM21v0LEtU",
  authDomain: "halaltune-736b6.firebaseapp.com",
  projectId: "halaltune-736b6",
  storageBucket: "halaltune-736b6.firebasestorage.app",
  messagingSenderId: "316147520878",
  appId: "1:316147520878:web:7f2d26508b278fb7a31d7f",
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)

export function onAuthChange(callback: (user: UserProfile | null) => void): () => void {
  const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    callback(firebaseUser ? mapFirebaseUser(firebaseUser) : null)
  })
  return unsubscribe
}

export async function loginWithEmail(email: string, password: string): Promise<UserProfile> {
  const { user } = await signInWithEmailAndPassword(auth, email, password)
  return mapFirebaseUser(user)
}

export async function registerWithEmail(email: string, password: string, displayName: string): Promise<UserProfile> {
  const { user } = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(user, { displayName })
  return mapFirebaseUser(user)
}

export async function logout(): Promise<void> {
  await signOut(auth)
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email)
}

export function getCurrentUserSync(): UserProfile | null {
  const user = auth.currentUser
  return user ? mapFirebaseUser(user) : null
}

export function mapFirebaseUser(user: User): UserProfile {
  return {
    uid: user.uid,
    displayName: user.displayName || undefined,
    email: user.email || undefined,
    photoURL: user.photoURL || undefined,
  }
}