import { create } from 'zustand';
import type { Profile, UserRole } from '@/types';
import { authService, ensureProfile } from '@/services/auth';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

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
      const fbUser = auth.currentUser;
      if (fbUser) {
        const profile = await ensureProfile(fbUser);
        set({ user: profile, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }

    onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await ensureProfile(fbUser);
          set({ user: profile, isAuthenticated: true });
        } catch {
          // Firestore might not be available — still mark as authenticated
          const partial: Profile = {
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
          set({ user: partial, isAuthenticated: true });
        }
      } else {
        set({ user: null, isAuthenticated: false });
      }
    });
  },

  signInWithGoogle: async () => {
    const profile = await authService.signInWithGoogle();
    set({ user: profile, isAuthenticated: true });
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
