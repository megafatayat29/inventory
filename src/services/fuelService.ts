import { supabase } from '../lib/supabase'
import type { CreateFuelDepositInput } from '../dto/fuel.dto'

export async function getAllFuelDeposits() {
  const { data, error } = await supabase
    .from('fuel_deposits')
    .select(`
      id,
      storage_date,
      user_unit,
      fuel_type,
      volume,
      photo_path,
      supporting_document_path,
      depositor_name,
      nipp,
      jabatan,
      unit_kerja,
      reason,
      created_at
    `)
    .order('storage_date', { ascending: false })

  if (error) throw error

  return data
}

export async function createFuelDeposit(input: CreateFuelDepositInput) {
  const { data, error } = await supabase
    .from('fuel_deposits')
    .insert({
      storage_date: input.storage_date,
      user_unit: input.user_unit,
      fuel_type: input.fuel_type,
      volume: input.volume,
      photo_path: input.photo_path,
      supporting_document_path: input.supporting_document_path,
      depositor_name: input.depositor_name,
      nipp: input.nipp,
      jabatan: input.jabatan,
      unit_kerja: input.unit_kerja,
      reason: input.reason,
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function updateFuelDeposit(
  id: string,
  input: CreateFuelDepositInput
) {
  const { data, error } = await supabase
    .from('fuel_deposits')
    .update({
      storage_date: input.storage_date,
      user_unit: input.user_unit,
      fuel_type: input.fuel_type,
      volume: input.volume,
      photo_path: input.photo_path,
      supporting_document_path: input.supporting_document_path,
      depositor_name: input.depositor_name,
      nipp: input.nipp,
      jabatan: input.jabatan,
      unit_kerja: input.unit_kerja,
      reason: input.reason,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function deleteFuelDeposit(id: string) {
  const { error } = await supabase.from('fuel_deposits').delete().eq('id', id)

  if (error) throw error
}
