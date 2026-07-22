export function generateRackCode(params: {
  rack_code: string
  level_no: number
  display_col_no: number
  row_no: number
  slot_size: 'S' | 'M' | 'L'
}) {
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${params.rack_code}${pad(params.level_no)}${pad(params.display_col_no)}${pad(params.row_no)}${params.slot_size}`
}
