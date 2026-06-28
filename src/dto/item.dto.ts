export type Item = {
  id: string
  item_name: string
  quantity: number
  procurement_unit: string
  category: string | null
  entry_date: string
  status: string
  remaining_quantity: number
}

export type ExistingItem = {
  item_name: string
  quantity: number
  procurement_unit: string
  category: string
}

export type ReturnRecordItem = {
  id: string
  item_id: string
  returned_quantity: number
  remaining_after_return: number | null
  items?: {
    id: string
    item_name: string
  } | null
}

export type ReturnRecord = {
  id: string
  deposit_request_id: string
  returned_by_name: string
  returned_by_nipp: string | null
  returned_by_unit: string | null
  notes: string | null
  return_date: string
  created_at: string
  taken_photo_path: string | null
  remaining_photo_path: string | null
  return_record_items?: ReturnRecordItem[]
}