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

export interface MonthlyInventoryRow {
  month: string // 'YYYY-MM-DD', tanggal 1 di bulan itu
  incoming: number
  outgoing: number
}

export async function getMonthlyInventorySummary(
  year?: number
): Promise<MonthlyInventoryRow[]> {
  // Kalau year tidak dikirim, params dibiarkan kosong supaya default
  // p_year (tahun berjalan) di sisi Postgres yang dipakai — bukan null.
  const params = year !== undefined ? { p_year: year } : {}

  const { data, error } = await supabase.rpc(
    'get_monthly_inventory_summary',
    params
  )

  if (error) throw error

  return data ?? []
}

export interface SpecialDepositFilters {
  dateFrom: string // 'YYYY-MM-DD'
  dateTo: string // 'YYYY-MM-DD'
  penitip?: string
  jenis?: string
}

export interface SpecialDepositMonthlyRow {
  month: string // 'YYYY-MM-DD', tanggal 1 di bulan itu
  limbah_masuk: number
  limbah_keluar: number
  bbm_masuk: number
  bbm_keluar: number
  barang_bekas_masuk: number
  barang_bekas_keluar: number
}

export async function getSpecialDepositsMonthlySummary(
  filters: SpecialDepositFilters
): Promise<SpecialDepositMonthlyRow[]> {
  const { data, error } = await supabase.rpc(
    'get_special_deposits_monthly_summary',
    {
      p_date_from: filters.dateFrom,
      p_date_to: filters.dateTo,
      p_penitip: filters.penitip?.trim() || null,
      p_jenis: filters.jenis || null,
    }
  )

  if (error) throw error

  return data ?? []
}

export async function getSpecialDepositTypes(): Promise<string[]> {
  const { data, error } = await supabase.rpc('get_special_deposit_types')

  if (error) throw error

  return (data ?? []).map((row: { jenis: string }) => row.jenis)
}
