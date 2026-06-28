import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Inbox, Package, MapPin } from 'lucide-react'
import { getPendingDepositRequests } from '../../services/depositService'
import type { DepositRequest } from '../../dto/deposit'

export default function IncomingList() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<DepositRequest[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetchIncoming()
  }, [])

  async function fetchIncoming() {
    try {
      setLoading(true)
      const data = await getPendingDepositRequests()
      setRequests((data ?? []) as unknown as DepositRequest[])
    } catch (error) {
      console.error(error)
      alert('Gagal mengambil data incoming barang')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading incoming barang...</p>
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Incoming Barang</h2>
          <p className="text-slate-500 mt-1">
            Form penitipan yang menunggu plotting lokasi rak.
          </p>
        </div>

        <button
          onClick={fetchIncoming}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <Inbox className="mx-auto text-slate-400" size={48} />
          <h3 className="mt-4 text-lg font-semibold text-slate-700">
            Belum ada incoming barang
          </h3>
          <p className="text-slate-500 mt-1">
            Data penitipan baru akan muncul di sini setelah user submit form.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-700">
                      Pending
                    </span>
  
                  </div>

                  <h3 className="text-xl font-bold text-slate-800 mt-3">
                    {request.depositor_name}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 text-sm text-slate-600">
                    <p>
                      <span className="font-semibold">NIPP:</span> {request.nipp}
                    </p>
                    <p>
                      <span className="font-semibold">Jabatan:</span>{' '}
                      {request.jabatan}
                    </p>
                    <p>
                      <span className="font-semibold">Unit Kerja:</span>{' '}
                      {request.unit_kerja}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    navigate(`/admin/deposits/${request.id}/place`)
                  }
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 whitespace-nowrap"
                >
                  <MapPin size={18} />
                  Plot Rak
                </button>
              </div>

              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Package size={18} className="text-blue-700" />
                  <h4 className="font-semibold text-slate-800">
                    Daftar Barang Dititipkan
                  </h4>
                  <span className="text-sm text-slate-500">
                    ({request.items?.length ?? 0} jenis barang)
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-50 text-slate-600">
                        <th className="text-left px-4 py-3 rounded-l-lg">
                          Nama Barang
                        </th>
                        <th className="text-left px-4 py-3">Jumlah</th>
                        <th className="text-left px-4 py-3">Unit Pengadaan</th>
                        <th className="text-left px-4 py-3">Kategori</th>
                        <th className="text-left px-4 py-3 rounded-r-lg">
                          Tanggal Masuk
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {request.items?.map((item) => (
                        <tr key={item.id} className="border-b border-slate-100">
                          <td className="px-4 py-3 font-medium text-slate-800">
                            {item.item_name}
                          </td>
                          <td className="px-4 py-3">{item.quantity}</td>
                          <td className="px-4 py-3">
                            {item.procurement_unit}
                          </td>
                          <td className="px-4 py-3">
                            {item.category || '-'}
                          </td>
                          <td className="px-4 py-3">
                            {item.entry_date
                              ? new Date(item.entry_date).toLocaleDateString(
                                  'id-ID'
                                )
                              : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}