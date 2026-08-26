export type UsedGoodsDeposit = {
  id: string
  deposit_request_id: string | null
  entry_date: string
  producing_unit: string
  created_at: string
  deposit_requests: {
    status: string
  } | null
}
