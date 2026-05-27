import { supabase } from '../supabase';
import type { Profile, UserRole } from '@/types';

function mapUser(data: Record<string, unknown>): Profile {
  return { id: data.uid as string, ...data } as unknown as Profile;
}

export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('uid', userId)
      .single();
    if (error) throw error;
    if (!data) return null;
    return mapUser(data);
  },

  async hasRole(userId: string, allowedRoles: UserRole[]): Promise<boolean> {
    const profile = await this.getProfile(userId);
    if (!profile) return false;
    return allowedRoles.includes(profile.role);
  },

  onAuthStateChange(callback: (event: string, session: unknown) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },
};
