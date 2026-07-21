import type { ReturnRecord } from '../dto/item.dto'

export function getLastReturnDate(
  itemId: string,
  returnRecords: ReturnRecord[]
) {
  const dates = returnRecords
    .filter(record =>
      (record.return_record_items ?? []).some(
        item => item.item_id === itemId
      )
    )
    .map(record => new Date(record.return_date))
    .sort((a, b) => b.getTime() - a.getTime())

  return dates.length
    ? dates[0].toLocaleDateString('id-ID')
    : '-'
}
