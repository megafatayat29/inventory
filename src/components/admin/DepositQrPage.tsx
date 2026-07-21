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
import type { DepositDetail } from '../../dto/deposit.dto'
import PhotoGallery from '../common/PhotoGallery'
import { getPublicImage } from '../../utils/getPublicImage'

function formatDate(dateString?: string | null) {
  if (!dateString) return '-'

  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

function formatDateTime(dateString?: string | null) {
  if (!dateString) return '-'

  return new Date(dateString).toLocaleString('id-ID')
}

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
  console.log('deposit', deposit);
  const gallery = [
    ...(deposit.initial_photo_path
      ? [{
          title: 'Foto Penitipan',
          image: getPublicImage(deposit.initial_photo_path),
          subtitle: 'Diupload oleh Penitip',
        }]
      : []),

    ...(placement?.placement_photo_path
      ? [{
          title: 'Foto Setelah Plot',
          image: getPublicImage(placement.placement_photo_path),
          subtitle: 'Diupload Admin Gudang',
        }]
      : []),

    ...(deposit.return_records ?? []).flatMap((record, index) =>
      record.taken_photo_path
        ? [{
            title: `Pengambilan #${index + 1}`,
            image: getPublicImage(record.taken_photo_path),
            subtitle: record.return_date,
          }]
        : []
    ),
  ]

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
                  <span className="font-semibold">Tanggal Masuk:</span>{' '}
                  {formatDateTime(deposit.items[0].entry_date)}
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
                    Satuan
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
                      Piece/s
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

          <PhotoGallery photos={gallery} />

          <div className="mt-6 border-t border-slate-200 pt-5">
            <h3 className="font-bold text-slate-900 mb-3">
              Riwayat Pengambilan Barang
            </h3>

            {!deposit.return_records || deposit.return_records.length === 0 ? (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-500">
                Belum ada riwayat pengambilan barang.
              </div>
            ) : (
              <div className="space-y-4">
                {deposit.return_records
                  .slice()
                  .sort(
                    (a, b) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime()
                  )
                  .map((record, index) => (
                    <div
                      key={record.id}
                      className="rounded-xl border border-slate-200 overflow-hidden"
                    >
                      <div className="bg-slate-50 p-4 border-b border-slate-200">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                          <div>
                            <p className="text-xs text-slate-500">
                              Pengambilan #{deposit.return_records!.length - index}
                            </p>

                            <p className="font-bold text-slate-800 mt-1">
                              {record.returned_by_name}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 mt-2 text-sm text-slate-700">
                              <p>
                                <span className="font-semibold">NIPP:</span>{' '}
                                {record.returned_by_nipp || '-'}
                              </p>

                              <p>
                                <span className="font-semibold">Unit:</span>{' '}
                                {record.returned_by_unit || '-'}
                              </p>

                              <p>
                                <span className="font-semibold">Tanggal Keluar:</span>{' '}
                                {formatDate(record.return_date)}
                              </p>

                              <p>
                                <span className="font-semibold">Diproses Sistem:</span>{' '}
                                {formatDateTime(record.created_at)}
                              </p>
                            </div>
                          </div>

                          <span className="w-fit rounded-full bg-orange-100 text-orange-700 px-3 py-1 text-xs font-semibold">
                            Pengambilan
                          </span>
                        </div>

                        {record.notes && (
                          <div className="mt-3 rounded-lg bg-white border border-slate-200 p-3 text-sm text-slate-700">
                            <span className="font-semibold">Catatan:</span>{' '}
                            {record.notes}
                          </div>
                        )}
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border-collapse">
                          <thead>
                            <tr className="bg-white text-slate-700">
                              <th className="text-left p-3 border-b border-slate-200">
                                No
                              </th>
                              <th className="text-left p-3 border-b border-slate-200">
                                Nama Barang
                              </th>
                              <th className="text-left p-3 border-b border-slate-200">
                                Jumlah Diambil
                              </th>
                              <th className="text-left p-3 border-b border-slate-200">
                                Sisa Setelah Diambil
                              </th>
                            </tr>
                          </thead>

                          <tbody>
                            {record.return_record_items?.map((returnItem, itemIndex) => (
                              <tr key={returnItem.id}>
                                <td className="p-3 border-b border-slate-100">
                                  {itemIndex + 1}
                                </td>

                                <td className="p-3 border-b border-slate-100 font-medium">
                                  {returnItem.items?.item_name || '-'}
                                </td>

                                <td className="p-3 border-b border-slate-100">
                                  {returnItem.returned_quantity}
                                </td>

                                <td className="p-3 border-b border-slate-100">
                                  {returnItem.remaining_after_return ?? '-'}
                                </td>
                              </tr>
                            ))}

                            {(!record.return_record_items ||
                              record.return_record_items.length === 0) && (
                              <tr>
                                <td
                                  colSpan={4}
                                  className="p-4 text-center text-slate-500"
                                >
                                  Detail barang yang diambil tidak tersedia.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <p className="text-xs text-slate-400 mt-5">
            QR ini digunakan untuk identifikasi batch penitipan barang di gudang.
          </p>
        </div>
      </div>
    </div>
  )
}