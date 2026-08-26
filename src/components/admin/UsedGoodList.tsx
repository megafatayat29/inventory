import { useEffect, useState } from 'react'
import DummyListTable from '../common/DummyListTable'
import { getAllUsedGoodsDeposits } from '../../services/usedGoodsService'
import {
  getDepositStatusClass,
  getDepositStatusLabel,
} from '../../utils/statusBadge'
import type { UsedGoodsDeposit } from '../../dto/usedGoods.dto'

function formatDate(dateString?: string | null) {
  if (!dateString) return '-'

  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function UsedGoodsList() {
  const [usedGoods, setUsedGoods] = useState<UsedGoodsDeposit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUsedGoods()
  }, [])

  async function fetchUsedGoods() {
    try {
      setLoading(true)
      const data = await getAllUsedGoodsDeposits()
      setUsedGoods((data ?? []) as unknown as UsedGoodsDeposit[])
    } catch (error) {
      console.error(error)
      alert('Gagal mengambil data barang bekas')
    } finally {
      setLoading(false)
    }
  }

  const rows = usedGoods.map((item, index) => {
    const status = item.deposit_requests?.status ?? null

    return {
      no: index + 1,
      tanggal_masuk: formatDate(item.entry_date),
      unit_penghasil: item.producing_unit,
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
      title="Daftar Penyimpanan Barang Bekas"
      addLabel="Tambah Penyimpanan Barang Bekas"
      columns={[
        { key: 'no', label: 'No.' },
        { key: 'tanggal_masuk', label: 'Tanggal Masuk' },
        { key: 'unit_penghasil', label: 'Unit Penghasil' },
        { key: 'status', label: 'Status' },
        { key: 'aksi', label: 'Aksi' },
      ]}
      rows={rows}
      loading={loading}
    />
  )
}
