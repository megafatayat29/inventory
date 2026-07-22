import type { DepositItemInput, DepositRequestInput } from "../dto/deposit.dto";
import { supabase } from "../lib/supabase";

export async function createDepositRequest(payload: DepositRequestInput) {
  if (!payload.items || payload.items.length === 0) {
    throw new Error('Minimal harus ada satu barang yang dititipkan')
  }

  const itemsPayload = payload.items.map((item: DepositItemInput) => ({
    item_name: item.item_name,
    quantity: Number(item.quantity),
    procurement_unit: item.procurement_unit,
    category: item.category || null,
    entry_date: item.entry_date,
  }))

  const { data, error } = await supabase.rpc('create_deposit_with_items', {
    p_depositor_name: payload.depositor_name,
    p_nipp: payload.nipp,
    p_jabatan: payload.jabatan,
    p_unit_kerja: payload.unit_kerja,
    p_initial_photo_path: payload.initial_photo_path,
    p_supporting_document_path: payload.supporting_document_path || '',
    p_items: itemsPayload,
  })

  if (error) throw error

  return {
    requestId: data,
  }
}

export async function getPendingDepositRequests() {
  const { data, error } = await supabase
    .from('deposit_requests')
    .select(`
      id,
      depositor_name,
      nipp,
      jabatan,
      unit_kerja,
      initial_photo_path,
      status,
      created_at,
      items (
        id,
        item_name,
        quantity,
        remaining_quantity,
        procurement_unit,
        category,
        entry_date,
        status
      )
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) throw error

  return data
}

export async function getDepositRequestDetail(depositRequestId: string) {
  const { data, error } = await supabase
    .from('deposit_requests')
    .select(`
      id,
      depositor_name,
      nipp,
      jabatan,
      unit_kerja,
      status,
      created_at,
      initial_photo_path,
      items (
        id,
        item_name,
        quantity,
        remaining_quantity,
        procurement_unit,
        category,
        entry_date,
        status
      ),
      placements (
        id,
        placed_at,
        is_active,
        placement_photo_path,
        rack_locations (
          id,
          rack_code,
          section,
          slot_size,
          display_col_no,
          medium_col_start,
          medium_col_span,
          level_no,
          row_no,
          status
        )
      ),
      return_records (
        id,
        deposit_request_id,
        returned_by_name,
        returned_by_nipp,
        returned_by_unit,
        notes,
        return_date,
        created_at,
        taken_photo_path,
        remaining_photo_path,
        return_record_items (
          id,
          item_id,
          returned_quantity,
          remaining_after_return,
          items (
            id,
            item_name
          )
        )
      )
    `)
    .eq('id', depositRequestId)
    .single()

  if (error) throw error

  return data
}

export async function getAllDepositRequests() {
  const { data, error } = await supabase
    .from('deposit_requests')
    .select(`
      id,
      depositor_name,
      nipp,
      jabatan,
      unit_kerja,
      initial_photo_path,
      status,
      created_at,
      items (
        id,
        item_name,
        quantity,
        remaining_quantity,
        procurement_unit,
        category,
        entry_date,
        status
      ),
      placements (
        id,
        is_active,
        placed_at,
        placement_photo_path,
        rack_locations (
          id,
          rack_code,
          section,
          slot_size,
          display_col_no,
          level_no,
          row_no,
          status
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error

  return data
}

export async function getStoredDepositRequests() {
  const { data, error } = await supabase
    .from('deposit_requests')
    .select(`
      id,
      depositor_name,
      nipp,
      jabatan,
      unit_kerja,
      initial_photo_path,
      status,
      created_at,
      items (
        id,
        item_name,
        quantity,
        remaining_quantity,
        procurement_unit,
        category,
        entry_date,
        status
      ),
      placements (
        id,
        is_active,
        placed_at,
        placement_photo_path,
        rack_locations (
          id,
          rack_code,
          section,
          slot_size,
          display_col_no,
          level_no,
          row_no,
          status
        )
      )
    `)
    .eq('status', 'stored')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createExistingDeposit(payload: {
  depositor_name: string
  nipp: string
  jabatan: string
  unit_kerja: string
  initial_photo_path?: string
  placement_photo_path?: string
  rack_location_id: string
  entry_date: string
  items: {
    item_name: string
    quantity: number
    procurement_unit: string
    category?: string | null
  }[]
}) {
  const { data, error } = await supabase.rpc(
    'create_existing_deposit_with_items',
    {
      p_depositor_name: payload.depositor_name,
      p_nipp: payload.nipp,
      p_jabatan: payload.jabatan,
      p_unit_kerja: payload.unit_kerja,
      p_initial_photo_path: payload.initial_photo_path || '',
      p_placement_photo_path: payload.placement_photo_path || '',
      p_rack_location_id: payload.rack_location_id,
      p_entry_date: payload.entry_date,
      p_items: payload.items.map((item) => ({
        item_name: item.item_name,
        quantity: Number(item.quantity),
        procurement_unit: item.procurement_unit,
        category: item.category || null,
      })),
    }
  )

  if (error) throw error

  return data
}

export async function deleteDepositBatch(depositRequestId: string) {
  const { error } = await supabase.rpc('delete_deposit_batch', {
    p_deposit_request_id: depositRequestId,
  })

  if (error) throw error
}