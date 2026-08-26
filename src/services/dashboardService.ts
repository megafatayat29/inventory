import { supabase } from '../lib/supabase'

export type DashboardStats = {
  pendingRequests: number
  storedRequests: number
  returnedRequests: number
  emptyRacks: number
  occupiedRacks: number
  activeItemTypes: number
  storedQuantity: number
  returnedQuantity: number
  storedWasteRequests: number
  storedFuelRequests: number
  storedUsedGoodsRequests: number
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [
    pendingRequestsResult,
    storedRequestsResult,
    returnedRequestsResult,
    emptyRacksResult,
    occupiedRacksResult,
    activeItemsResult,
    allItemsResult,
    storedWasteRequestsResult,
    storedFuelRequestsResult,
    storedUsedGoodsRequestsResult,
  ] = await Promise.all([
    supabase
      .from('deposit_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),

    supabase
      .from('deposit_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'stored'),

    supabase
      .from('deposit_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'returned'),

    supabase
      .from('rack_locations')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'empty'),

    supabase
      .from('rack_locations')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'occupied'),

    supabase
      .from('items')
      .select('id', { count: 'exact', head: true })
      .gt('remaining_quantity', 0),

    supabase
      .from('items')
      .select('quantity, remaining_quantity'),

    supabase
      .from('deposit_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'stored')
      .eq('deposit_type', 'limbah'),

    supabase
      .from('deposit_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'stored')
      .eq('deposit_type', 'bbm_pelumas'),

    supabase
      .from('deposit_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'stored')
      .eq('deposit_type', 'barang_bekas'),
  ])

  const errors = [
    pendingRequestsResult.error,
    storedRequestsResult.error,
    returnedRequestsResult.error,
    emptyRacksResult.error,
    occupiedRacksResult.error,
    activeItemsResult.error,
    allItemsResult.error,
    storedWasteRequestsResult.error,
    storedFuelRequestsResult.error,
    storedUsedGoodsRequestsResult.error,
  ].filter(Boolean)

  if (errors.length > 0) {
    throw errors[0]
  }

  const storedQuantity =
    allItemsResult.data?.reduce((total, item) => {
      return total + Number(item.remaining_quantity ?? 0)
    }, 0) ?? 0

  const returnedQuantity =
    allItemsResult.data?.reduce((total, item) => {
      const quantity = Number(item.quantity ?? 0)
      const remainingQuantity = Number(item.remaining_quantity ?? 0)

      return total + Math.max(0, quantity - remainingQuantity)
    }, 0) ?? 0

  return {
    pendingRequests: pendingRequestsResult.count ?? 0,
    storedRequests: storedRequestsResult.count ?? 0,
    returnedRequests: returnedRequestsResult.count ?? 0,
    emptyRacks: emptyRacksResult.count ?? 0,
    occupiedRacks: occupiedRacksResult.count ?? 0,
    activeItemTypes: activeItemsResult.count ?? 0,
    storedQuantity,
    returnedQuantity,
    storedWasteRequests: storedWasteRequestsResult.count ?? 0,
    storedFuelRequests: storedFuelRequestsResult.count ?? 0,
    storedUsedGoodsRequests: storedUsedGoodsRequestsResult.count ?? 0,
  }
}
