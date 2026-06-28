export function getDepositStatusLabel(status: string) {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'stored':
      return 'Tersimpan'
    case 'returned':
      return 'Diambil'
    case 'rejected':
      return 'Ditolak'
    default:
      return status
  }
}

export function getDepositStatusClass(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-orange-100 text-orange-700'
    case 'stored':
      return 'bg-green-100 text-green-700'
    case 'returned':
      return 'bg-blue-100 text-blue-700'
    case 'rejected':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}