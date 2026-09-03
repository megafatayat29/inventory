import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import {
  ArrowLeft,
  Download,
  FileText,
  Printer,
  QrCode,
  Trash2,
  Upload,
} from 'lucide-react'
import Swal from 'sweetalert2'
import {
  getDepositRequestDetail,
  updateDepositSupportingDocument,
} from '../../services/depositService'
import {
  deleteInventoryDocument,
  getInventoryDocumentUrl,
  uploadInventoryDocument,
} from '../../services/photoService'
import { getMyProfile } from '../../services/authService'
import { formatRackLocation } from '../../utils/formatRackLocation'
import {
  getDepositStatusClass,
  getDepositStatusLabel,
} from '../../utils/statusBadge'
import { getActivePlacement } from '../../utils/getActivePlacement'
import type { DepositDetail } from '../../dto/deposit.dto'
import type { Profile } from '../../dto/user.dto'
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

export default function DepositQrPage() {
  const { depositRequestId } = useParams()
  const navigate = useNavigate()

  const [deposit, setDeposit] = useState<DepositDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [uploadingDocument, setUploadingDocument] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchDetail()
  }, [depositRequestId])

  useEffect(() => {
    async function fetchProfile() {
      const data = await getMyProfile()
      setProfile(data)
    }

    fetchProfile()
  }, [])

  const isSuperAdmin = profile?.role === 'super_admin'

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

  function triggerDocumentFileSelect() {
    fileInputRef.current?.click()
  }

  async function handleDocumentFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file || !deposit) return

    if (file.type !== 'application/pdf') {
      Swal.fire({
        icon: 'error',
        title: 'Format tidak didukung',
        text: 'Dokumen pendukung harus berupa file PDF.',
        confirmButtonColor: '#ef4444',
      })
      return
    }

    const previousPath = deposit.supporting_document_path

    try {
      setUploadingDocument(true)

      const newPath = await uploadInventoryDocument(
        file,
        `deposit-requests/${deposit.id}`
      )

      await updateDepositSupportingDocument(deposit.id, newPath)

      if (previousPath) {
        try {
          await deleteInventoryDocument(previousPath)
        } catch (cleanupError) {
          console.error('Gagal menghapus dokumen lama:', cleanupError)
        }
      }

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: previousPath
          ? 'Dokumen pendukung berhasil diganti.'
          : 'Dokumen pendukung berhasil diupload.',
        timer: 1400,
        showConfirmButton: false,
      })

      fetchDetail()
    } catch (error) {
      console.error(error)

      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text:
          error instanceof Error
            ? error.message
            : 'Dokumen pendukung gagal diupload.',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setUploadingDocument(false)
    }
  }

  async function handleDeleteDocument() {
    if (!deposit?.supporting_document_path) return

    const confirmation = await Swal.fire({
      icon: 'warning',
      title: 'Hapus dokumen pendukung?',
      text: 'Dokumen ini akan dihapus dari batch dan tidak bisa dikembalikan.',
      showCancelButton: true,
      confirmButtonText: 'Ya, hapus',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
    })

    if (!confirmation.isConfirmed) return

    const pathToDelete = deposit.supporting_document_path

    try {
      setUploadingDocument(true)

      await updateDepositSupportingDocument(deposit.id, null)

      try {
        await deleteInventoryDocument(pathToDelete)
      } catch (cleanupError) {
        console.error(
          'Gagal menghapus file dokumen dari storage:',
          cleanupError
        )
      }

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Dokumen pendukung berhasil dihapus.',
        timer: 1400,
        showConfirmButton: false,
      })

      fetchDetail()
    } catch (error) {
      console.error(error)

      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text:
          error instanceof Error
            ? error.message
            : 'Dokumen pendukung gagal dihapus.',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setUploadingDocument(false)
    }
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
  const documentUrl = getInventoryDocumentUrl(deposit.supporting_document_path)

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
                  {formatDate(deposit.items[0].entry_date)}
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

          <div className="mt-6 border-t border-slate-200 pt-5 print:hidden">
            <h3 className="font-bold text-slate-900 mb-3">
              Dokumen Pendukung
            </h3>

            <div className="flex flex-wrap items-center gap-3">
              {documentUrl ? (
                <>
                  <a
                    href={documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 font-semibold hover:underline"
                  >
                    <FileText size={16} />
                    View
                  </a>
                  <a
                    href={documentUrl}
                    download
                    className="inline-flex items-center gap-1 text-slate-700 font-semibold hover:underline"
                  >
                    <Download size={16} />
                    Download
                  </a>
                </>
              ) : (
                <span className="text-sm text-slate-400">
                  Belum ada dokumen pendukung.
                </span>
              )}

              {isSuperAdmin && (
                <>
                  <button
                    type="button"
                    onClick={triggerDocumentFileSelect}
                    disabled={uploadingDocument}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload size={16} />
                    {uploadingDocument
                      ? 'Memproses...'
                      : documentUrl
                      ? 'Ganti Dokumen'
                      : 'Upload Dokumen'}
                  </button>

                  {documentUrl && (
                    <button
                      type="button"
                      onClick={handleDeleteDocument}
                      disabled={uploadingDocument}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={16} />
                      Hapus
                    </button>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={handleDocumentFileChange}
                  />
                </>
              )}
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
