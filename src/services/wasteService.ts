import { supabase } from '../lib/supabase'

export async function getAllWasteDeposits() {
  const { data, error } = await supabase
    .from('waste_deposits')
    .select(`
      id,
      deposit_request_id,
      storage_date,
      producing_unit,
      waste_type,
      created_at,
      deposit_requests (
        status
      )
    `)
    .order('storage_date', { ascending: false })

  if (error) throw error

  return data
}
