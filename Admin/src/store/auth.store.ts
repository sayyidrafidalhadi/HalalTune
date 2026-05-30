import { create } from 'zustand';
import type { Profile, UserRole } from '@/types';
import { authService } from '@/services/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface AuthState {
  user: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
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
        const profile = await authService.getProfile(fbUser.uid);
        set({ user: profile, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }

    onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const profile = await authService.getProfile(fbUser.uid);
        set({ user: profile, isAuthenticated: true });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    });
  },

  signIn: async (email: string, password: string) => {
    const fbUser = await authService.signIn(email, password);
    const profile = await authService.getProfile(fbUser.uid);
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
