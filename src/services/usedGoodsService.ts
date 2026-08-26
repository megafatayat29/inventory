import { supabase } from '../lib/supabase'

export async function getAllUsedGoodsDeposits() {
  const { data, error } = await supabase
    .from('used_goods_deposits')
    .select(`
      id,
      deposit_request_id,
      entry_date,
      producing_unit,
      created_at,
      deposit_requests (
        status
      )
    `)
    .order('entry_date', { ascending: false })

  if (error) throw error

  return data
}
