import type { ReturnRecord } from "../dto/item.dto"

export function getOutbound(
  itemId: string,
  returnRecords: ReturnRecord[]
) {
  return returnRecords.reduce((total, record) => {
    return (
      total +
      (record.return_record_items ?? [])
        .filter(i => i.item_id === itemId)
        .reduce((sum, i) => sum + i.returned_quantity, 0)
    )
  }, 0)
}
