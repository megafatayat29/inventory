import { useEffect, useState } from 'react'
import DummyListTable from '../common/DummyListTable'
import { getAllWasteDeposits } from '../../services/wasteService'
import {
  getDepositStatusClass,
  getDepositStatusLabel,
} from '../../utils/statusBadge'
import type { WasteDeposit } from '../../dto/waste.dto'

function formatDate(dateString?: string | null) {
  if (!dateString) return '-'

  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function WasteList() {
  const [wastes, setWastes] = useState<WasteDeposit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchWastes()
  }, [])

  async function fetchWastes() {
    try {
      setLoading(true)
      const data = await getAllWasteDeposits()
      setWastes((data ?? []) as unknown as WasteDeposit[])
    } catch (error) {
      console.error(error)
      alert('Gagal mengambil data limbah')
    } finally {
      setLoading(false)
    }
  }

  const rows = wastes.map((waste, index) => {
    const status = waste.deposit_requests?.status ?? null

    return {
      no: index + 1,
      tanggal_masuk: formatDate(waste.storage_date),
      unit_penghasil: waste.producing_unit,
      jenis_limbah: waste.waste_type,
      status: status ? (
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${getDepositStatusClass(
            status
          )}`}
        >
          {getDepositStatusLabel(status)}
        </span>
      ) : (
        '-'
      ),
      aksi: '-',
    }
  })

  return (
    <DummyListTable
      title="Daftar Limbah"
      addLabel="Tambah Limbah"
      columns={[
        { key: 'no', label: 'No.' },
        { key: 'tanggal_masuk', label: 'Tanggal Masuk' },
        { key: 'unit_penghasil', label: 'Unit Penghasil' },
        { key: 'jenis_limbah', label: 'Jenis Limbah' },
        { key: 'status', label: 'Status' },
        { key: 'aksi', label: 'Aksi' },
      ]}
      rows={rows}
      loading={loading}
    />
  )
}
