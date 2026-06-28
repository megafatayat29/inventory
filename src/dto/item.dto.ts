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