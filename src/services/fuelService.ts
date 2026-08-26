import { supabase } from '../lib/supabase'

export async function getAllFuelDeposits() {
  const { data, error } = await supabase
    .from('fuel_deposits')
    .select(`
      id,
      deposit_request_id,
      storage_date,
      user_unit,
      fuel_type,
      volume,
      photo_path,
      supporting_document_path,
      created_at,
      deposit_requests (
        status,
        depositor_name
      )
    `)
    .order('storage_date', { ascending: false })

  if (error) throw error

  return data
}
