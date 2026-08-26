export type WasteDeposit = {
  id: string
  deposit_request_id: string | null
  storage_date: string
  producing_unit: string
  waste_type: string
  created_at: string
  deposit_requests: {
    status: string
  } | null
}
