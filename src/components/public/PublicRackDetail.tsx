import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { MapPin, Package, Warehouse } from 'lucide-react'
import { getRackLocationDetail } from '../../services/rackService'
import { formatRackLocation } from '../../utils/formatRackLocation'
import { getActivePlacement } from '../../utils/getActivePlacement'
import type { RackLocationDetail } from '../../dto/rack.dto'
import kaiLogo from '../../assets/kai.png'
import lrtLogo from '../../assets/lrt.png'

export default function PublicRackDetail() {
  const { rackLocationId } = useParams()
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
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <p className="text-slate-500">Loading detail rak...</p>
      </div>
    )
  }

  if (!rack) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md">
          <h1 className="text-xl font-bold text-slate-800">
            Data rak tidak ditemukan
          </h1>
          <p className="text-slate-500 mt-2">
            QR tidak valid atau lokasi rak tidak tersedia.
          </p>
        </div>
      </div>
    )
  }

  const placement = getActivePlacement(rack.placements)
  const deposit = placement?.deposit_requests

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-blue-900 text-white">
        <div className="max-w-4xl mx-auto px-5 py-8 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-orange-400 font-semibold">Rakfat SIGAPQ Inventory</p>
            <h1 className="text-3xl font-bold mt-1">Detail Rak</h1>
            <p className="text-blue-100 mt-2">
              Informasi isi slot rak berdasarkan QR Code.
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
              <div className="flex items-center gap-2 text-blue-800 font-semibold">
                <Warehouse size={20} />
                Lokasi Rak
              </div>

              <h2 className="text-2xl font-bold text-slate-800 mt-3">
                {formatRackLocation(rack)}
              </h2>
              <p className="text-slate-500">
                Ukuran slot: 'Small'
              </p>
            </div>

            <div
              className={[
                'rounded-xl px-4 py-3',
                rack.status === 'empty'
                  ? 'bg-green-50 text-green-800'
                  : 'bg-red-50 text-red-800',
              ].join(' ')}
            >
              <p className="text-sm">Status</p>
              <p className="text-2xl font-bold">
                {rack.status === 'empty' ? 'Kosong' : 'Terisi'}
              </p>
            </div>
          </div>

          {deposit ? (
            <div className="mt-6">
              <div className="rounded-2xl bg-slate-50 p-5 mb-5">
                <div className="flex items-center gap-2 text-blue-800 font-semibold mb-3">
                  <MapPin size={18} />
                  Batch Penitipan di Rak Ini
                </div>

                <div className="space-y-2 text-sm text-slate-700">
                  <p>
                    <span className="font-semibold">Nama Penitip:</span>{' '}
                    {deposit.depositor_name}
                  </p>
                  <p>
                    <span className="font-semibold">NIPP:</span> {deposit.nipp}
                  </p>
                  <p>
                    <span className="font-semibold">Unit Kerja:</span>{' '}
                    {deposit.unit_kerja}
                  </p>
                  <p>
                    <span className="font-semibold">Tanggal Plot:</span>{' '}
                    {placement?.placed_at
                      ? new Date(placement.placed_at).toLocaleString('id-ID')
                      : '-'}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 text-blue-800 font-semibold mb-3">
                  <Package size={18} />
                  Daftar Isi Barang
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-slate-200">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700">
                        <th className="text-left p-3 border border-slate-200">
                          No
                        </th>
                        <th className="text-left p-3 border border-slate-200">
                          Nama Barang
                        </th>
                        <th className="text-left p-3 border border-slate-200">
                          Jumlah
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
                      {deposit.items?.map((item: any, index: number) => (
                        <tr key={item.id}>
                          <td className="p-3 border border-slate-200">
                            {index + 1}
                          </td>
                          <td className="p-3 border border-slate-200 font-medium">
                            {item.item_name}
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
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl bg-green-50 border border-green-100 p-6 text-green-800">
              <h3 className="font-bold text-lg">Rak masih kosong</h3>
              <p className="mt-1">
                Belum ada batch penitipan yang ditempatkan di slot rak ini.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}