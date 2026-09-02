import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import DummyListTable from '../common/DummyListTable'
import WasteDepositModal from './WasteDepositModal'
import WasteDetailModal from './WasteDetailModal'
import { getAllWasteDeposits, deleteWasteDeposit } from '../../services/wasteService'
import type { WasteDeposit } from '../../dto/waste.dto'
import type { Profile } from '../../dto/user.dto'
import { getMyProfile } from '../../services/authService'

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

export default function WasteList() {
  const [wastes, setWastes] = useState<WasteDeposit[]>([])
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingWaste, setEditingWaste] = useState<WasteDeposit | null>(null)
  const [detailWaste, setDetailWaste] = useState<WasteDeposit | null>(null)
  
  useEffect(() => {
    fetchWastes()
  }, [])
  
  useEffect(() => {
    async function fetchProfile() {
      const data = await getMyProfile()
      setProfile(data)
    }
    
    fetchProfile()
  }, [])

  const isSuperAdmin = profile?.role === 'super_admin'
  
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

  function openCreateForm() {
    setEditingWaste(null)
    setIsFormOpen(true)
  }

  function openEditForm(waste: WasteDeposit) {
    setEditingWaste(waste)
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingWaste(null)
  }

  async function handleDelete(waste: WasteDeposit) {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Hapus Data Limbah?',
      html: `Data limbah <b>${waste.waste_type}</b> milik <b>${waste.depositor_name}</b> akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`,
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
    })

    if (!result.isConfirmed) return

    try {
      await deleteWasteDeposit(waste.id)
      await Swal.fire({
        icon: 'success',
        title: 'Terhapus',
        text: 'Data limbah berhasil dihapus.',
        confirmButtonColor: '#1e3a8a',
      })
      fetchWastes()
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

  const rows = wastes.map((waste, index) => ({
    no: index + 1,
    tanggal_masuk: formatDate(waste.storage_date),
    unit_penghasil: waste.producing_unit,
    jenis_limbah: waste.waste_type,
    pelapor: waste.depositor_name,
    nipp: waste.nipp,
    jabatan: waste.jabatan,
    unit_kerja: waste.unit_kerja,
    alasan: truncate(waste.reason),
    aksi: (
      <div className="flex items-center gap-3 text-sm font-medium">
        <button
          type="button"
          onClick={() => setDetailWaste(waste)}
          className="text-blue-700 hover:underline"
        >
          Detail
        </button>
        {isSuperAdmin && (
          <>
            <button
              type="button"
              onClick={() => openEditForm(waste)}
              className="text-orange-600 hover:underline"
            >
              Edit
            </button>
            <button
              type="button"
              onClick={() => handleDelete(waste)}
              className="text-red-600 hover:underline"
            >
              Hapus
            </button>
          </>
        )}
      </div>
    ),
  }))

  return (
    <>
      <DummyListTable
        title="Daftar Limbah"
        addLabel="Tambah Limbah"
        onAdd={openCreateForm}
        columns={[
          { key: 'no', label: 'No.' },
          { key: 'tanggal_masuk', label: 'Tanggal Masuk' },
          { key: 'unit_penghasil', label: 'Unit Penghasil' },
          { key: 'jenis_limbah', label: 'Jenis Limbah' },
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

      <WasteDepositModal
        isOpen={isFormOpen}
        onClose={closeForm}
        onSaved={fetchWastes}
        waste={editingWaste}
      />

      <WasteDetailModal waste={detailWaste} onClose={() => setDetailWaste(null)} />
    </>
  )
}
