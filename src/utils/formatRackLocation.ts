type RackLocation = {
  rack_code: string
  section: 'FULL' | 'LEFT' | 'RIGHT'
  slot_size: 'S'
  display_col_no: number
  level_no: number
  row_no: number
}

export function formatRackLocation(location: RackLocation) {
  const sectionLabel =
    location.section === 'FULL'
      ? ''
      : location.section === 'LEFT'
        ? 'Kiri'
        : 'Kanan'

  if (location.slot_size === 'S') {
    return `Rak ${location.rack_code}${
      sectionLabel ? ` - ${sectionLabel}` : ''
    } - Large ${location.display_col_no} - Row ${location.row_no}`
  }

  return `Rak ${location.rack_code}${
    sectionLabel ? ` - ${sectionLabel}` : ''
  } - M${location.display_col_no} - Tingkat ${location.level_no} - Row ${
    location.row_no
  }`
}