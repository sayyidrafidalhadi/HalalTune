import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Profile, UserRole } from '@/types';

const ADMIN_EMAIL = 'halaltune.app@gmail.com';

export function mapUser(user: User, profile?: Partial<Profile>): Profile {
  return {
    id: user.uid,
    email: user.email || '',
    display_name: profile?.display_name || user.displayName || null,
    avatar_url: profile?.avatar_url || user.photoURL || null,
    role: profile?.role || 'user',
    is_banned: profile?.is_banned || false,
    is_verified_creator: profile?.is_verified_creator || false,
    ban_reason: profile?.ban_reason || null,
    created_at: profile?.created_at || user.metadata?.creationTime || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function ensureProfile(user: User): Promise<Profile> {
  const ref = doc(db, 'users', user.uid);
  const existing = await getDoc(ref);
  if (existing.exists()) {
    return { id: existing.id, ...existing.data() } as Profile;
  }

  const role: UserRole = user.email === ADMIN_EMAIL ? 'admin' : 'user';
  const profile: Profile = {
    id: user.uid,
    email: user.email || '',
    display_name: user.displayName || null,
    avatar_url: user.photoURL || null,
    role,
    is_banned: false,
    is_verified_creator: false,
    ban_reason: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  await setDoc(ref, profile);
  return profile;
}

export const authService = {
  async signInWithGoogle(): Promise<Profile> {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    return ensureProfile(result.user);
  },

  async signOut() {
    await fbSignOut(auth);
  },

  async getSession() {
    return auth.currentUser;
  },

  async getCurrentUser() {
    return auth.currentUser;
  },

  async getProfile(userId: string): Promise<Profile | null> {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Profile;
  },

  hasRole(user: Profile | null, allowedRoles: UserRole[]): boolean {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },
};
