import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import { ArrowLeft, Printer, QrCode } from 'lucide-react'
import { getDepositRequestDetail } from '../../services/depositService'
import { formatRackLocation } from '../../utils/formatRackLocation'
import {
  getDepositStatusClass,
  getDepositStatusLabel,
} from '../../utils/statusBadge'
import { getActivePlacement } from '../../utils/getActivePlacement'
import type { DepositDetail } from '../../dto/deposit'

export default function DepositQrPage() {
  const { depositRequestId } = useParams()
  const navigate = useNavigate()

  const [deposit, setDeposit] = useState<DepositDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDetail()
  }, [depositRequestId])

  async function fetchDetail() {
    if (!depositRequestId) return

    try {
      setLoading(true)
      const data = await getDepositRequestDetail(depositRequestId)
      setDeposit(data as unknown as DepositDetail)
    } catch (error) {
      console.error(error)
      alert('Gagal mengambil detail QR penitipan')
    } finally {
      setLoading(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  if (loading) {
    return <p className="text-slate-500">Loading QR penitipan...</p>
  }

  if (!deposit) {
    return <p className="text-red-500">Data penitipan tidak ditemukan.</p>
  }

  const qrUrl = `${window.location.origin}/deposit/${deposit.id}`
  const placement = getActivePlacement(deposit.placements)
  const rackLocation = placement?.rack_locations

  return (
    <div>
      <div className="print:hidden">
        <button
          onClick={() => navigate('/admin/deposits')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-5"
        >
          <ArrowLeft size={18} />
          Kembali ke List All Barang
        </button>

        <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              QR Batch Penitipan
            </h2>
            <p className="text-slate-500 mt-1">
              Cetak QR ini untuk ditempel pada batch/kardus barang titipan.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
          >
            <Printer size={18} />
            Print QR
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-3xl print:shadow-none print:border-none print:max-w-full">
        <div className="border-4 border-blue-900 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-orange-500">
                RAKFAT SIGAPQ INVENTORY SYSTEM
              </p>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">
                QR Batch Penitipan
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Scan untuk melihat detail penitipan barang.
              </p>
            </div>

            <div className="w-14 h-14 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center print:hidden">
              <QrCode size={28} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-6">
            <div className="flex flex-col items-center">
              <div className="p-4 bg-white border border-slate-200 rounded-2xl">
                <QRCodeCanvas value={qrUrl} size={180} />
              </div>

              <p className="text-xs text-slate-400 mt-3 text-center break-all">
                {qrUrl}
              </p>
            </div>

            <div>
              <div className="mb-4">
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ${getDepositStatusClass(
                    deposit.status
                  )}`}
                >
                  {getDepositStatusLabel(deposit.status)}
                </span>
              </div>

              <div className="space-y-2 text-sm text-slate-700">
                <p>
                  <span className="font-semibold">ID Penitipan:</span>{' '}
                  {deposit.id}
                </p>
                <p>
                  <span className="font-semibold">Nama Penitip:</span>{' '}
                  {deposit.depositor_name}
                </p>
                <p>
                  <span className="font-semibold">NIPP:</span> {deposit.nipp}
                </p>
                <p>
                  <span className="font-semibold">Jabatan:</span>{' '}
                  {deposit.jabatan}
                </p>
                <p>
                  <span className="font-semibold">Unit Kerja:</span>{' '}
                  {deposit.unit_kerja}
                </p>
                <p>
                  <span className="font-semibold">Tanggal Submit:</span>{' '}
                  {new Date(deposit.created_at).toLocaleString('id-ID')}
                </p>
                <p>
                  <span className="font-semibold">Lokasi Rak:</span>{' '}
                  {rackLocation
                    ? formatRackLocation(rackLocation)
                    : 'Belum diplot'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <h3 className="font-bold text-slate-900 mb-3">Daftar Isi Barang</h3>

            <table className="w-full text-sm border border-slate-200">
              <thead>
                <tr className="bg-slate-100">
                  <th className="text-left p-3 border border-slate-200">No</th>
                  <th className="text-left p-3 border border-slate-200">
                    Nama Barang
                  </th>
                  <th className="text-left p-3 border border-slate-200">
                    Jumlah Awal
                  </th>
                  <th className="text-left p-3 border border-slate-200">
                    Sisa Gudang
                  </th>
                  <th className="text-left p-3 border border-slate-200">
                    Kategori
                  </th>
                  <th className="text-left p-3 border border-slate-200">
                    Unit Pengadaan
                  </th>
                </tr>
              </thead>

              <tbody>
                {deposit.items?.map((item, index) => (
                  <tr key={item.id}>
                    <td className="p-3 border border-slate-200">{index + 1}</td>
                    <td className="p-3 border border-slate-200">
                      {item.item_name}
                    </td>
                    <td className="p-3 border border-slate-200">
                      {item.quantity}
                    </td>
                    <td className="p-3 border border-slate-200">
                      {item.remaining_quantity}
                    </td>
                    <td className="p-3 border border-slate-200">
                      {item.category || '-'}
                    </td>
                    <td className="p-3 border border-slate-200">
                      {item.procurement_unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-slate-400 mt-5">
            QR ini digunakan untuk identifikasi batch penitipan barang di gudang.
          </p>
        </div>
      </div>
    </div>
  )
}