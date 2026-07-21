import { supabase } from '../lib/supabase'

export async function getEmptyRackLocations() {
  const { data, error } = await supabase
    .from('rack_locations')
    .select(`
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
    `)
    .eq('status', 'empty')
    .order('rack_code')
    .order('medium_col_start')
    .order('level_no')
    .order('row_no')

  if (error) throw error

  return data
}

export async function placeDepositRequestToRack(
  depositRequestId: string,
  rackLocationId: string,
  placementPhotoPath: string,
  placedAt: string,
) {
  const { data, error } = await supabase.rpc('place_deposit_to_rack', {
    p_deposit_request_id: depositRequestId,
    p_rack_location_id: rackLocationId,
    p_placement_photo_path: placementPhotoPath,
    p_placed_at: placedAt,
  })

  if (error) throw error

  return data
}

export async function getAllRackLocations() {
  const { data, error } = await supabase
    .from('rack_locations')
    .select(`
      id,
      rack_code,
      section,
      slot_size,
      display_col_no,
      medium_col_start,
      medium_col_span,
      level_no,
      row_no,
      status,
      placements (
        id,
        is_active,
        placed_at,
        deposit_requests (
          id,
          depositor_name,
          nipp,
          jabatan,
          unit_kerja,
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
        )
      )
    `)
    .order('rack_code')
    .order('medium_col_start')
    .order('level_no')
    .order('row_no')

  if (error) throw error
  return data
}

export async function getRackLocationDetail(rackLocationId: string) {
  const { data, error } = await supabase
    .from('rack_locations')
    .select(`
      id,
      rack_code,
      section,
      slot_size,
      display_col_no,
      medium_col_start,
      medium_col_span,
      level_no,
      row_no,
      status,
      placements (
        id,
        placed_at,
        is_active,
        deposit_requests (
          id,
          depositor_name,
          nipp,
          jabatan,
          unit_kerja,
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
        )
      )
    `)
    .eq('id', rackLocationId)
    .single()

  if (error) throw error
  return data
}
