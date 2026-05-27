import { supabase } from "@/supabase"
import type { User } from "@supabase/supabase-js"
import type { UserProfile } from "@/types"

export type AuthMode = "local" | "session"

export function onAuthChange(callback: (user: User | null) => void): () => void {
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null)
  })
  return () => subscription.unsubscribe()
}

export async function setAuthPersistence(mode: AuthMode): Promise<void> {
  localStorage.setItem("halaltune_auth_persistence", mode)
}

export async function loginWithEmail(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data.user
}

export async function registerWithEmail(email: string, password: string, displayName: string): Promise<User> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  })
  if (error) throw error
  if (!data.user) throw new Error("Registration failed — check email for confirmation link")
  return data.user
}

export async function logout(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email: string): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth`,
  })
  if (error) throw error
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  return mapSupabaseUser(user)
}

export function getCurrentUser(): User | null {
  return supabase.auth.getSession().then(({ data }) => data.session?.user ?? null) as unknown as User | null
}

export function mapSupabaseUser(user: User): UserProfile {
  return {
    uid: user.id,
    displayName: user.user_metadata?.display_name || user.user_metadata?.full_name || undefined,
    email: user.email || undefined,
    photoURL: user.user_metadata?.photo_url || user.user_metadata?.avatar_url || undefined,
  }
}
