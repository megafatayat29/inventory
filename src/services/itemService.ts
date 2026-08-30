import { supabase } from '../lib/supabase'

export async function updateInventoryItem(payload: {
  item_id: string
  item_name: string
  category?: string | null
  quantity: number
  procurement_unit: string
  entry_date: string
  placed_date: string
  deposit_request_id: string
}) {
  const { error } = await supabase.rpc('update_inventory_item', {
    p_item_id: payload.item_id,
    p_item_name: payload.item_name,
    p_category: payload.category || '',
    p_quantity: payload.quantity,
    p_procurement_unit: payload.procurement_unit,
    p_entry_date: payload.entry_date,
    p_placed_at: payload.placed_date,
    p_deposit_request_id: payload.deposit_request_id,
  })

  if (error) throw error
}

export async function deleteInventoryItem(itemId: string) {
  const { error } = await supabase.rpc('delete_inventory_item', {
    p_item_id: itemId,
  })

  if (error) throw error
}