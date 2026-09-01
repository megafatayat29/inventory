import { useEffect, useState } from 'react'
import DummyListTable from '../common/DummyListTable'
import WasteDepositModal from './WasteDepositModal'
import { getAllWasteDeposits } from '../../services/wasteService'
import type { WasteDeposit } from '../../dto/waste.dto'

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
  const [isModalOpen, setIsModalOpen] = useState(false)

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

  // Catatan: foto belum ditampilkan di list (photo_path sudah tersimpan dan
  // ada di data, tapi belum di-resolve jadi URL publik di sini karena
  // photoService.ts belum terlihat — lihat pesan pendamping).
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
    aksi: '-',
  }))

  return (
    <>
      <DummyListTable
        title="Daftar Limbah"
        addLabel="Tambah Limbah"
        onAdd={() => setIsModalOpen(true)}
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
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={fetchWastes}
      />
    </>
  )
}
