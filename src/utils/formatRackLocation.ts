type RackLocation = {
  rack_code: string
  section: 'FULL' | 'LEFT' | 'RIGHT'
  slot_size: 'S'
  display_col_no: number
  level_no: number
  row_no: number
}

export function formatRackLocation(location: RackLocation) {
  return `Rak ${location.rack_code}0${location.level_no}0${location.display_col_no}0${location.row_no}S`
}