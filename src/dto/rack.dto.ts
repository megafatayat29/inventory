import type { Placement } from "./placement.dto"

export type RackLocation = {
  id: string
  rack_code: string
  section: 'FULL' | 'LEFT' | 'RIGHT'
  slot_size: 'M' | 'L'
  display_col_no: number
  medium_col_start: number
  medium_col_span: number
  level_no: number
  row_no: number
  status: 'empty' | 'occupied'
  placements: Placement[] | Placement | null
}

export type RackLocationDetail = {
  id: string
  rack_code: string
  section: 'FULL' | 'LEFT' | 'RIGHT'
  slot_size: 'M' | 'L'
  display_col_no: number
  medium_col_start: number
  medium_col_span: number
  level_no: number
  row_no: number
  status: 'empty' | 'occupied'
  placements: Placement[] | Placement | null
}