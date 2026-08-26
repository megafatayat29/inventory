export type FuelDeposit = {
  id: string
  deposit_request_id: string | null
  storage_date: string
  user_unit: string
  fuel_type: string
  volume: number
  photo_path: string | null
  supporting_document_path: string | null
  created_at: string
  deposit_requests: {
    status: string
    depositor_name: string
  } | null
}
