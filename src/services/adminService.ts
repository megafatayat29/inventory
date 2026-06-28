import type { AdminProfile } from '../dto/user.dto'
import { supabase } from '../lib/supabase'

export async function getAdminProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, role, is_active, created_at')
    .order('created_at', { ascending: true })

  if (error) throw error

  return data as AdminProfile[]
}

export async function updateAdminProfile(payload: {
  id: string
  name: string
  is_active: boolean
}) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      name: payload.name,
      is_active: payload.is_active,
    })
    .eq('id', payload.id)
    .select('id, name, role, is_active, created_at')
    .maybeSingle()

  if (error) throw error

  if (!data) {
    throw new Error(
      'Data admin tidak berhasil diperbarui. Pastikan akun login adalah super admin dan RLS policy sudah benar.'
    )
  }

  return data
}