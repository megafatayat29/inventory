import { supabase } from "../lib/supabase"

export interface InventoryChartFilters {
  dateFrom: string // 'YYYY-MM-DD'
  dateTo: string // 'YYYY-MM-DD'
  penitip?: string
  barang?: string
}

export interface InventoryChartRow {
  day: string // 'YYYY-MM-DD'
  incoming: number
  outgoing: number
}

export async function getInventoryChart(
  filters: InventoryChartFilters
): Promise<InventoryChartRow[]> {
  const { data, error } = await supabase.rpc('get_inventory_chart', {
    p_date_from: filters.dateFrom,
    p_date_to: filters.dateTo,
    p_penitip: filters.penitip?.trim() || null,
    p_barang: filters.barang || null,
  })

  if (error) throw error

  return data ?? []
}

export async function getItemNames(): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_item_names')

  if (error) throw error

  return (data ?? []).map((row: { item_name: string }) => row.item_name)
}
