export function getActivePlacement<T extends { is_active?: boolean }>(
  placements: T[] | T | null | undefined
): T | null {
  if (!placements) return null

  const placementList = Array.isArray(placements) ? placements : [placements]

  return (
    placementList.find((placement) => placement.is_active === true) ??
    null
  )
}