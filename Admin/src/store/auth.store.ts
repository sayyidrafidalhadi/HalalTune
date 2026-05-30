import { create } from 'zustand';
import type { Profile, UserRole } from '@/types';
import { authService, ensureProfile } from '@/services/auth';
import { auth } from '@/lib/firebase';

function makePartialProfile(fbUser: { uid: string; email?: string | null; displayName?: string | null; photoURL?: string | null }): Profile {
  return {
    id: fbUser.uid,
    email: fbUser.email || '',
    display_name: fbUser.displayName || null,
    avatar_url: fbUser.photoURL || null,
    role: 'user' as UserRole,
    is_banned: false,
    is_verified_creator: false,
    ban_reason: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

interface AuthState {
  user: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: Profile | null) => void;
  hasRole: (roles: UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  initialize: async () => {
    try {
      await auth.authStateReady();
      const fbUser = auth.currentUser;
      if (fbUser) {
        try {
          const profile = await ensureProfile(fbUser);
          set({ user: profile, isAuthenticated: true, isLoading: false });
        } catch {
          set({ user: makePartialProfile(fbUser), isAuthenticated: true, isLoading: false });
        }
        return;
      }
    } catch {
      // fall through to set loading false below
    }
    set({ isLoading: false });
  },

  signInWithGoogle: async () => {
    try {
      const profile = await authService.signInWithGoogle();
      set({ user: profile, isAuthenticated: true });
    } catch {
      const fbUser = auth.currentUser;
      if (fbUser) {
        set({ user: makePartialProfile(fbUser), isAuthenticated: true });
      }
    }
  },

  signOut: async () => {
    await authService.signOut();
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  hasRole: (roles: UserRole[]) => {
    const { user } = get();
    if (!user) return false;
    return roles.includes(user.role);
  },
}));
