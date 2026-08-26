import { useEffect, useState } from 'react'
import { FileText, Image as ImageIcon } from 'lucide-react'
import DummyListTable from '../common/DummyListTable'
import { getAllFuelDeposits } from '../../services/fuelService'
import {
  getInventoryDocumentUrl,
  getInventoryPhotoUrl,
} from '../../services/photoService'
import {
  getDepositStatusClass,
  getDepositStatusLabel,
} from '../../utils/statusBadge'
import type { FuelDeposit } from '../../dto/fuel.dto'

function formatDate(dateString?: string | null) {
  if (!dateString) return '-'

  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function FuelList() {
  const [fuels, setFuels] = useState<FuelDeposit[]>([])
  const [loading, setLoading] = useState(true)

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

  const rows = fuels.map((fuel, index) => {
    const status = fuel.deposit_requests?.status ?? null
    const depositorName = fuel.deposit_requests?.depositor_name ?? '-'
    const photoUrl = getInventoryPhotoUrl(fuel.photo_path)
    const documentUrl = getInventoryDocumentUrl(fuel.supporting_document_path)

    return {
      no: index + 1,
      tanggal_penyimpanan: formatDate(fuel.storage_date),
      unit_pengguna: fuel.user_unit,
      jenis_bbm: fuel.fuel_type,
      volume: `${Number(fuel.volume).toLocaleString('id-ID')} L`,
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
      aktor: depositorName,
      aksi: '-',
    }
  })

  return (
    <DummyListTable
      title="Daftar Penyimpanan BBM & Pelumas"
      addLabel="Tambah Penyimpanan BBM"
      columns={[
        { key: 'no', label: 'No.' },
        { key: 'tanggal_penyimpanan', label: 'Tanggal Penyimpanan' },
        { key: 'unit_pengguna', label: 'Unit Pengguna' },
        { key: 'jenis_bbm', label: 'Jenis BBM' },
        { key: 'volume', label: 'Volume' },
        { key: 'foto', label: 'Foto' },
        { key: 'berkas_pendukung', label: 'Berkas Pendukung' },
        { key: 'status', label: 'Status' },
        { key: 'aktor', label: 'Aktor' },
        { key: 'aksi', label: 'Aksi' },
      ]}
      rows={rows}
      loading={loading}
    />
  )
}
