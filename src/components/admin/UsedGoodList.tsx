import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import DummyListTable from '../common/DummyListTable'
import UsedGoodsDepositModal from './UsedGoodsDepositModal'
import UsedGoodsDetailModal from './UsedGoodsDetailModal'
import {
  getAllUsedGoodsDeposits,
  deleteUsedGoodsDeposit,
} from '../../services/usedGoodsService'
import type { UsedGoodsDeposit } from '../../dto/usedGoods.dto'

function formatDate(dateString?: string | null) {
  if (!dateString) return '-'

  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function truncate(text: string, max = 40) {
  if (!text) return '-'
  return text.length > max ? `${text.slice(0, max)}…` : text
}

export default function UsedGoodsList() {
  const [usedGoods, setUsedGoods] = useState<UsedGoodsDeposit[]>([])
  const [loading, setLoading] = useState(true)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<UsedGoodsDeposit | null>(null)
  const [detailItem, setDetailItem] = useState<UsedGoodsDeposit | null>(null)

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

  function openCreateForm() {
    setEditingItem(null)
    setIsFormOpen(true)
  }

  function openEditForm(item: UsedGoodsDeposit) {
    setEditingItem(item)
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingItem(null)
  }

  async function handleDelete(item: UsedGoodsDeposit) {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Hapus Data Barang Bekas?',
      html: `Data barang bekas milik <b>${item.depositor_name}</b> akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`,
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
    })

    if (!result.isConfirmed) return

    try {
      await deleteUsedGoodsDeposit(item.id)
      await Swal.fire({
        icon: 'success',
        title: 'Terhapus',
        text: 'Data barang bekas berhasil dihapus.',
        confirmButtonColor: '#1e3a8a',
      })
      fetchUsedGoods()
    } catch (error: any) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'Gagal Menghapus',
        text: error?.message ?? 'Terjadi kesalahan saat menghapus data.',
        confirmButtonText: 'Tutup',
        confirmButtonColor: '#dc2626',
      })
    }
  }

  const rows = usedGoods.map((item, index) => ({
    no: index + 1,
    tanggal_masuk: formatDate(item.entry_date),
    unit_penghasil: item.producing_unit,
    pelapor: item.depositor_name,
    nipp: item.nipp,
    jabatan: item.jabatan,
    unit_kerja: item.unit_kerja,
    alasan: truncate(item.reason),
    aksi: (
      <div className="flex items-center gap-3 text-sm font-medium">
        <button
          type="button"
          onClick={() => setDetailItem(item)}
          className="text-blue-700 hover:underline"
        >
          Detail
        </button>
        <button
          type="button"
          onClick={() => openEditForm(item)}
          className="text-orange-600 hover:underline"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => handleDelete(item)}
          className="text-red-600 hover:underline"
        >
          Hapus
        </button>
      </div>
    ),
  }))

  return (
    <>
      <DummyListTable
        title="Daftar Penyimpanan Barang Bekas"
        addLabel="Tambah Penyimpanan Barang Bekas"
        onAdd={openCreateForm}
        columns={[
          { key: 'no', label: 'No.' },
          { key: 'tanggal_masuk', label: 'Tanggal Masuk' },
          { key: 'unit_penghasil', label: 'Unit Penghasil' },
          { key: 'pelapor', label: 'Pelapor' },
          { key: 'nipp', label: 'NIPP' },
          { key: 'jabatan', label: 'Jabatan' },
          { key: 'unit_kerja', label: 'Unit Kerja' },
          { key: 'alasan', label: 'Alasan Titip' },
          { key: 'aksi', label: 'Aksi' },
        ]}
        rows={rows}
        loading={loading}
      />

      <UsedGoodsDepositModal
        isOpen={isFormOpen}
        onClose={closeForm}
        onSaved={fetchUsedGoods}
        usedGoods={editingItem}
      />

      <UsedGoodsDetailModal
        usedGoods={detailItem}
        onClose={() => setDetailItem(null)}
      />
    </>
  )
}
