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
  ])

  const errors = [
    pendingRequestsResult.error,
    storedRequestsResult.error,
    returnedRequestsResult.error,
    emptyRacksResult.error,
    occupiedRacksResult.error,
    activeItemsResult.error,
    allItemsResult.error,
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
  }
}
