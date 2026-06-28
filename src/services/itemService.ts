import { supabase } from '../lib/supabase'

export async function updateInventoryItem(payload: {
  item_id: string
  item_name: string
  category?: string | null
  procurement_unit: string
  entry_date: string
}) {
  const { error } = await supabase.rpc('update_inventory_item', {
    p_item_id: payload.item_id,
    p_item_name: payload.item_name,
    p_category: payload.category || '',
    p_procurement_unit: payload.procurement_unit,
    p_entry_date: payload.entry_date,
  })

  if (error) throw error
}

export async function deleteInventoryItem(itemId: string) {
  const { error } = await supabase.rpc('delete_inventory_item', {
    p_item_id: itemId,
  })

  if (error) throw error
}