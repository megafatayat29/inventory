import type { Profile } from '../dto/user.dto'
import { supabase } from '../lib/supabase'

export async function loginAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error

  return data
}

export async function getMyProfile(): Promise<Profile | null> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, role, is_active')
    .eq('id', user.id)
    .maybeSingle()

  if (error) throw error

  return data as Profile | null
}

export async function logoutAdmin() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  return data.user;
}