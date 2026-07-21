import type { ReturnItemPayload } from '../dto/deposit.dto'
import { supabase } from '../lib/supabase'

export async function processItemReturn(payload: ReturnItemPayload) {
  const { data, error } = await supabase.rpc('process_item_return', {
    p_deposit_request_id: payload.deposit_request_id,
    p_returned_by_name: payload.returned_by_name,
    p_returned_by_nipp: payload.returned_by_nipp || '',
    p_returned_by_unit: payload.returned_by_unit || '',
    p_notes: payload.notes || '',
    p_return_date: payload.return_date,
    p_taken_photo_path: payload.taken_photo_path || '',
    p_remaining_photo_path: payload.remaining_photo_path || '',
    p_items: payload.items,
  })

  if (error) throw error

  return data
}