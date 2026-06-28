import type { DepositRequest } from "./deposit"
import type { RackLocation } from "./rack.dto"

export type Placement = {
  id: string
  is_active: boolean
  placed_at: string
  rack_locations: RackLocation | null
  deposit_requests: DepositRequest | null
}