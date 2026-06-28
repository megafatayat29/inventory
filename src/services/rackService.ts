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
  placementPhotoPath: string
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) throw userError
  if (!user) throw new Error('User belum login')

  const { data, error } = await supabase
    .from('placements')
    .insert({
      deposit_request_id: depositRequestId,
      rack_location_id: rackLocationId,
      placement_photo_path: placementPhotoPath,
      placed_by: user.id,
    })
    .select()
    .single()

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
