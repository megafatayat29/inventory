import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Package, MapPin, User, CalendarDays, Archive } from 'lucide-react'
import { getDepositRequestDetail } from '../../services/depositService'
import { formatRackLocation } from '../../utils/formatRackLocation'
import {
  getDepositStatusClass,
  getDepositStatusLabel,
} from '../../utils/statusBadge'
import { getActivePlacement } from '../../utils/getActivePlacement'
import type { DepositDetail } from '../../dto/deposit.dto'
import { getOutbound } from '../../utils/getOutbound'
import { getLastReturnDate } from '../../utils/getLastReturnDate'
import kaiLogo from '../../assets/kai.png'
import lrtLogo from '../../assets/lrt.png'

function getDateOnly(dateString: string) {
  const date = new Date(dateString)
  date.setHours(0, 0, 0, 0)
  return date
}

function getDaysSince(dateString: string) {
  const start = getDateOnly(dateString)
  const now = new Date()
  now.setHours(0, 0, 0, 0)

  const diff = now.getTime() - start.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

function getDepositEntryDate(deposit: DepositDetail) {
  const itemEntryDates =
    deposit.items
      ?.map((item) => item.entry_date)
      .filter(Boolean) ?? []

  if (itemEntryDates.length > 0) {
    return itemEntryDates.sort(
      (a, b) => new Date(a).getTime() - new Date(b).getTime()
    )[0]
  }

  return deposit.created_at
}

export default function PublicDepositDetail() {
  const { depositRequestId } = useParams()
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
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-500">Loading detail penitipan...</p>
      </div>
    )
  }

  if (!deposit) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md">
          <h1 className="text-xl font-bold text-slate-800">
            Data tidak ditemukan
          </h1>
          <p className="text-slate-500 mt-2">
            QR tidak valid atau data penitipan sudah tidak tersedia.
          </p>
        </div>
      </div>
    )
  }

  const placement = getActivePlacement(deposit.placements)
  const rackLocation = placement?.rack_locations
  const entryDate = getDepositEntryDate(deposit)
  const daysInWarehouse = getDaysSince(entryDate)

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-5 py-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-orange-400 font-semibold">RakFat SIGAPQ Inventory</p>
            <h1 className="text-3xl font-bold mt-1">Detail Penitipan Barang</h1>
            <p className="text-blue-100 mt-2">
              Informasi batch penitipan berdasarkan QR Code.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white rounded-lg px-3 py-2 shadow-sm shrink-0">
            <img src={kaiLogo} alt="Logo KAI" className="h-9 w-auto object-contain" />
            <div className="w-px h-8 bg-gray-300" />
            <img src={lrtLogo} alt="Logo LRT Jabodebek" className="h-9 w-auto object-contain" />
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-5 py-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${getDepositStatusClass(
                  deposit.status
                )}`}
              >
                {getDepositStatusLabel(deposit.status)}
              </span>

              <h2 className="text-2xl font-bold text-slate-800 mt-4">
                {deposit.depositor_name}
              </h2>
              <p className="text-slate-500">ID: {deposit.id}</p>
            </div>

            <div className="rounded-xl bg-blue-50 text-blue-800 px-4 py-3">
              <p className="text-sm">Lama di Gudang</p>
              <p className="text-2xl font-bold">{daysInWarehouse} hari</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-blue-800 font-semibold mb-3">
                <User size={18} />
                Identitas Penitip
              </div>

              <div className="space-y-2 text-sm text-slate-700">
                <p>
                  <span className="font-semibold">Nama:</span>{' '}
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
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center gap-2 text-blue-800 font-semibold mb-3">
                <MapPin size={18} />
                Lokasi Rak
              </div>

              <div className="space-y-2 text-sm text-slate-700">
                <p>
                  <span className="font-semibold">Lokasi:</span>{' '}
                  {rackLocation
                    ? formatRackLocation(rackLocation)
                    : 'Belum diplot'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5 md:col-span-2">
              <div className="flex items-center gap-2 text-blue-800 font-semibold mb-3">
                <CalendarDays size={18} />
                Waktu Penitipan
              </div>

              <div className="space-y-2 text-sm text-slate-700">
                <p>
                  <span className="font-semibold">Tanggal Masuk:</span>{' '}
                  {new Date(entryDate).toLocaleDateString('id-ID')}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="flex items-center gap-2 text-blue-800 font-semibold mb-3">
              <Package size={18} />
              Daftar Isi Barang
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="text-left p-3 border border-slate-200">No</th>
                    <th className="text-left p-3 border border-slate-200">
                      Nama Barang
                    </th>
                    <th className="text-left p-3 border border-slate-200">
                      Inbound
                    </th>
                    <th className="text-left p-3 border border-slate-200">
                      Outbound
                    </th>
                    <th className="text-left p-3 border border-slate-200">
                      Sisa
                    </th>
                    <th className="text-left p-3 border border-slate-200">
                      Kategori
                    </th>
                    <th className="text-left p-3 border border-slate-200">
                      Unit Pengadaan
                    </th>
                    <th className="text-left p-3 border border-slate-200">
                      Tanggal Masuk
                    </th>
                    <th className="text-left p-3 border border-slate-200">
                      Tanggal Pengambilan Terakhir
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deposit.items?.map((item, index) => (
                    <tr key={item.id}>
                      <td className="p-3 border border-slate-200">
                        {index + 1}
                      </td>
                      <td className="p-3 border border-slate-200 font-medium">
                        {item.item_name}
                      </td>
                      <td className="p-3 border border-slate-200">
                        {item.quantity}
                      </td>
                      <td className="p-3 border border-slate-200">
                        {deposit.return_records ? getOutbound(item.id, deposit.return_records) : '-'}
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
                      <td className="p-3 border border-slate-200">
                        {item.entry_date
                          ? new Date(item.entry_date).toLocaleDateString('id-ID')
                          : '-'}
                      </td>
                      <td>{deposit.return_records ? getLastReturnDate(item.id, deposit.return_records) : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="flex items-center gap-2 text-blue-800 font-semibold mb-3">
              <Archive size={18} />
              Riwayat Pengambilan
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-slate-200">
                <thead>
                  <tr className="bg-slate-100 text-slate-700">
                    <th className="text-left p-3 border border-slate-200">No</th>
                    <th className="text-left p-3 border border-slate-200">
                      Tanggal
                    </th>
                    <th className="text-left p-3 border border-slate-200">
                      Nama Barang
                    </th>
                    <th className="text-left p-3 border border-slate-200">
                      Qty
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {deposit.return_records
                    ?.flatMap((record) =>
                      (record.return_record_items ?? []).map((detail) => ({
                        id: detail.id,
                        returnDate: record.return_date,
                        itemName: detail.items?.item_name ?? "-",
                        qty: detail.returned_quantity,
                      }))
                    )
                    .map((row, index) => (
                      <tr key={row.id}>
                        <td className="p-3 border border-slate-200">
                          {index + 1}
                        </td>

                        <td className="p-3 border border-slate-200">
                          {new Date(row.returnDate).toLocaleDateString("id-ID")}
                        </td>

                        <td className="p-3 border border-slate-200">
                          {row.itemName}
                        </td>

                        <td className="p-3 border border-slate-200">
                          {row.qty}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}