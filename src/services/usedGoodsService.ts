import { supabase } from '../lib/supabase'
import type { CreateUsedGoodsDepositInput } from '../dto/usedGoods.dto'

export async function getAllUsedGoodsDeposits() {
  const { data, error } = await supabase
    .from('used_goods_deposits')
    .select(`
      id,
      entry_date,
      producing_unit,
      depositor_name,
      nipp,
      jabatan,
      unit_kerja,
      reason,
      photo_path,
      created_at
    `)
    .order('entry_date', { ascending: false })

  if (error) throw error

  return data
}

export async function createUsedGoodsDeposit(
  input: CreateUsedGoodsDepositInput
) {
  const { data, error } = await supabase
    .from('used_goods_deposits')
    .insert({
      entry_date: input.entry_date,
      producing_unit: input.producing_unit,
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

export async function updateUsedGoodsDeposit(
  id: string,
  input: CreateUsedGoodsDepositInput
) {
  const { data, error } = await supabase
    .from('used_goods_deposits')
    .update({
      entry_date: input.entry_date,
      producing_unit: input.producing_unit,
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

export async function deleteUsedGoodsDeposit(id: string) {
  const { error } = await supabase
    .from('used_goods_deposits')
    .delete()
    .eq('id', id)

  if (error) throw error
}
