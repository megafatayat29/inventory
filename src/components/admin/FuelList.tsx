import { useEffect, useState } from 'react'
import { FileText, Image as ImageIcon } from 'lucide-react'
import Swal from 'sweetalert2'
import DummyListTable from '../common/DummyListTable'
import FuelDepositModal from './FuelDepositModal'
import FuelDetailModal from './FuelDetailModal'
import { getAllFuelDeposits, deleteFuelDeposit } from '../../services/fuelService'
import {
  getInventoryDocumentUrl,
  getInventoryPhotoUrl,
} from '../../services/photoService'
import type { FuelDeposit } from '../../dto/fuel.dto'

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

export default function FuelList() {
  const [fuels, setFuels] = useState<FuelDeposit[]>([])
  const [loading, setLoading] = useState(true)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingFuel, setEditingFuel] = useState<FuelDeposit | null>(null)
  const [detailFuel, setDetailFuel] = useState<FuelDeposit | null>(null)

  useEffect(() => {
    fetchFuels()
  }, [])

  async function fetchFuels() {
    try {
      setLoading(true)
      const data = await getAllFuelDeposits()
      setFuels((data ?? []) as unknown as FuelDeposit[])
    } catch (error) {
      console.error(error)
      alert('Gagal mengambil data BBM & Pelumas')
    } finally {
      setLoading(false)
    }
  }

  function openCreateForm() {
    setEditingFuel(null)
    setIsFormOpen(true)
  }

  function openEditForm(fuel: FuelDeposit) {
    setEditingFuel(fuel)
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingFuel(null)
  }

  async function handleDelete(fuel: FuelDeposit) {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Hapus Data BBM/Pelumas?',
      html: `Data <b>${fuel.fuel_type}</b> milik <b>${fuel.depositor_name}</b> akan dihapus permanen. Tindakan ini tidak bisa dibatalkan.`,
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
    })

    if (!result.isConfirmed) return

    try {
      await deleteFuelDeposit(fuel.id)
      await Swal.fire({
        icon: 'success',
        title: 'Terhapus',
        text: 'Data BBM/Pelumas berhasil dihapus.',
        confirmButtonColor: '#1e3a8a',
      })
      fetchFuels()
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

  const rows = fuels.map((fuel, index) => {
    const photoUrl = getInventoryPhotoUrl(fuel.photo_path)
    const documentUrl = getInventoryDocumentUrl(fuel.supporting_document_path)

    return {
      no: index + 1,
      tanggal_penyimpanan: formatDate(fuel.storage_date),
      unit_pengguna: fuel.user_unit,
      jenis_bbm: fuel.fuel_type,
      volume: `${Number(fuel.volume).toLocaleString('id-ID')} L`,
      pelapor: fuel.depositor_name,
      nipp: fuel.nipp,
      jabatan: fuel.jabatan,
      unit_kerja: fuel.unit_kerja,
      alasan: truncate(fuel.reason),
      foto: photoUrl ? (
        <a
          href={photoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
        >
          <ImageIcon size={16} />
          Lihat Foto
        </a>
      ) : (
        '-'
      ),
      berkas_pendukung: documentUrl ? (
        <a
          href={documentUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
        >
          <FileText size={16} />
          Lihat PDF
        </a>
      ) : (
        '-'
      ),
      aksi: (
        <div className="flex items-center gap-3 text-sm font-medium">
          <button
            type="button"
            onClick={() => setDetailFuel(fuel)}
            className="text-blue-700 hover:underline"
          >
            Detail
          </button>
          <button
            type="button"
            onClick={() => openEditForm(fuel)}
            className="text-orange-600 hover:underline"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => handleDelete(fuel)}
            className="text-red-600 hover:underline"
          >
            Hapus
          </button>
        </div>
      ),
    }
  })

  return (
    <>
      <DummyListTable
        title="Daftar Penyimpanan BBM & Pelumas"
        addLabel="Tambah Penyimpanan BBM"
        onAdd={openCreateForm}
        columns={[
          { key: 'no', label: 'No.' },
          { key: 'tanggal_penyimpanan', label: 'Tanggal Penyimpanan' },
          { key: 'unit_pengguna', label: 'Unit Pengguna' },
          { key: 'jenis_bbm', label: 'Jenis BBM' },
          { key: 'volume', label: 'Volume' },
          { key: 'pelapor', label: 'Pelapor' },
          { key: 'nipp', label: 'NIPP' },
          { key: 'jabatan', label: 'Jabatan' },
          { key: 'unit_kerja', label: 'Unit Kerja' },
          { key: 'alasan', label: 'Alasan Titip' },
          { key: 'foto', label: 'Foto' },
          { key: 'berkas_pendukung', label: 'Berkas Pendukung' },
          { key: 'aksi', label: 'Aksi' },
        ]}
        rows={rows}
        loading={loading}
      />

      <FuelDepositModal
        isOpen={isFormOpen}
        onClose={closeForm}
        onSaved={fetchFuels}
        fuel={editingFuel}
      />

      <FuelDetailModal fuel={detailFuel} onClose={() => setDetailFuel(null)} />
    </>
  )
}
