import { supabase } from "../lib/supabase"

export async function getInventoryChart() {
  const { data, error } = await supabase.rpc('get_inventory_chart')

  if (error) throw error

  return data
}
