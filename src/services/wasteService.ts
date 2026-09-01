import { supabase } from '../lib/supabase'
import type { CreateWasteDepositInput } from '../dto/waste.dto'

export async function getAllWasteDeposits() {
  const { data, error } = await supabase
    .from('waste_deposits')
    .select(`
      id,
      storage_date,
      producing_unit,
      waste_type,
      depositor_name,
      nipp,
      jabatan,
      unit_kerja,
      reason,
      photo_path,
      created_at
    `)
    .order('storage_date', { ascending: false })

  if (error) throw error

  return data
}

export async function createWasteDeposit(input: CreateWasteDepositInput) {
  const { data, error } = await supabase
    .from('waste_deposits')
    .insert({
      storage_date: input.storage_date,
      producing_unit: input.producing_unit,
      waste_type: input.waste_type,
      depositor_name: input.depositor_name,
      nipp: input.nipp,
      jabatan: input.jabatan,
      unit_kerja: input.unit_kerja,
      reason: input.reason,
      photo_path: input.photo_path,
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function updateWasteDeposit(
  id: string,
  input: CreateWasteDepositInput
) {
  const { data, error } = await supabase
    .from('waste_deposits')
    .update({
      storage_date: input.storage_date,
      producing_unit: input.producing_unit,
      waste_type: input.waste_type,
      depositor_name: input.depositor_name,
      nipp: input.nipp,
      jabatan: input.jabatan,
      unit_kerja: input.unit_kerja,
      reason: input.reason,
      photo_path: input.photo_path,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  return data
}

export async function deleteWasteDeposit(id: string) {
  const { error } = await supabase.from('waste_deposits').delete().eq('id', id)

  if (error) throw error
}
