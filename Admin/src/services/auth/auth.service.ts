import {
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Profile, UserRole } from '@/types';

function mapUser(user: User, profile?: Partial<Profile>): Profile {
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

export const authService = {
  async signIn(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
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
    const data = snap.data();
    return {
      id: snap.id,
      email: data.email || '',
      display_name: data.display_name || null,
      avatar_url: data.avatar_url || null,
      role: data.role || 'user',
      is_banned: data.is_banned || false,
      is_verified_creator: data.is_verified_creator || false,
      ban_reason: data.ban_reason || null,
      created_at: data.created_at || '',
      updated_at: data.updated_at || '',
    };
  },

  async hasRole(userId: string, allowedRoles: UserRole[]): Promise<boolean> {
    const profile = await this.getProfile(userId);
    if (!profile) return false;
    return allowedRoles.includes(profile.role);
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },
};
