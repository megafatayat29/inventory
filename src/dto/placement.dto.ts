import type { DepositRequest } from "./deposit.dto"
import type { RackLocation } from "./rack.dto"

export type Placement = {
  id: string
  is_active: boolean
  placed_at: string
  rack_locations: RackLocation | null
  deposit_requests: DepositRequest | null
  placement_photo_path: string | null
}