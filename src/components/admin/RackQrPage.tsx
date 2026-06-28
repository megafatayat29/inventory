import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { QRCodeCanvas } from 'qrcode.react'
import { ArrowLeft, Printer, QrCode } from 'lucide-react'
import { getRackLocationDetail } from '../../services/rackService'
import { formatRackLocation } from '../../utils/formatRackLocation'
import { getActivePlacement } from '../../utils/getActivePlacement'
import type { RackLocationDetail } from '../../dto/rack.dto'

export default function RackQrPage() {
  const { rackLocationId } = useParams()
  const navigate = useNavigate()

  const [rack, setRack] = useState<RackLocationDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDetail()
  }, [rackLocationId])

  async function fetchDetail() {
    if (!rackLocationId) return

    try {
      setLoading(true)
      const data = await getRackLocationDetail(rackLocationId)
      setRack(data as unknown as RackLocationDetail)
    } catch (error) {
      console.error(error)
      alert('Gagal mengambil detail rak')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading QR rak...</p>
  }

  if (!rack) {
    return <p className="text-red-500">Data rak tidak ditemukan.</p>
  }

  const qrUrl = `${window.location.origin}/rack/${rack.id}`
  const placement = getActivePlacement(rack.placements)
  const deposit = placement?.deposit_requests
  
  return (
    <div>
      <div className="print:hidden">
        <button
          onClick={() => navigate('/admin/racks')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-5"
        >
          <ArrowLeft size={18} />
          Kembali ke Dashboard Rak
        </button>

        <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">QR Rak</h2>
            <p className="text-slate-500 mt-1">
              Cetak QR ini untuk ditempel pada slot/kotak rak.
            </p>
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600"
          >
            <Printer size={18} />
            Print QR Rak
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-w-2xl print:shadow-none print:border-none print:max-w-full">
        <div className="border-4 border-blue-900 rounded-2xl p-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-sm font-semibold text-orange-500">
                RAKFAT SIGAPQ INVENTORY SYSTEM
              </p>
              <h1 className="text-2xl font-bold text-slate-900 mt-1">QR Rak</h1>
              <p className="text-sm text-slate-500 mt-1">
                Scan untuk melihat isi slot rak.
              </p>
            </div>

            <QrCode size={42} className="text-blue-800 print:hidden" />
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
              <h2 className="text-xl font-bold text-slate-900">
                {formatRackLocation(rack)}
              </h2>

              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <p>
                  <span className="font-semibold">Isi Saat Ini:</span>{' '}
                  {deposit
                    ? `${deposit.depositor_name} - ${deposit.items?.length ?? 0} jenis barang`
                    : 'Belum ada barang'}
                </p>
                <p>
                  <span className="font-semibold">Ukuran Slot:</span>{' '}
                  {rack.slot_size === 'L' ? 'Large' : 'Medium'}
                </p>
              </div>
            </div>
          </div>

          {deposit && (
            <div className="mt-6 border-t border-slate-200 pt-5">
              <h3 className="font-bold text-slate-900 mb-3">
                Isi Rak Saat Ini
              </h3>

              <div className="text-sm text-slate-700 mb-3">
                <p>
                  <span className="font-semibold">Penitip:</span>{' '}
                  {deposit.depositor_name}
                </p>
                <p>
                  <span className="font-semibold">Unit:</span>{' '}
                  {deposit.unit_kerja}
                </p>
              </div>

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
                  </tr>
                </thead>

                <tbody>
                  {deposit.items?.map((item: any, index: number) => (
                    <tr key={item.id}>
                      <td className="p-3 border border-slate-200">
                        {index + 1}
                      </td>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}