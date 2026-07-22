import { useEffect, useMemo, useState } from 'react'
import { QrCode, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getAllRackLocations } from '../../services/rackService'
import { formatRackLocation } from '../../utils/formatRackLocation'
import type { RackLocation } from '../../dto/rack.dto'

export default function PrintRackQr() {
  const navigate = useNavigate()
  const [locations, setLocations] = useState<RackLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [rackFilter, setRackFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  useEffect(() => {
    fetchLocations()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, rackFilter, pageSize])

  async function fetchLocations() {
    try {
      setLoading(true)
      const data = await getAllRackLocations()
      setLocations((data ?? []) as unknown as RackLocation[])
    } catch (error) {
      console.error(error)
      alert('Gagal mengambil data rak')
    } finally {
      setLoading(false)
    }
  }

  const filteredLocations = useMemo(() => {
    return locations.filter((location) => {
      const label = formatRackLocation(location).toLowerCase()
      const matchSearch = label.includes(search.toLowerCase())
      const matchRack =
        rackFilter === 'all' ? true : location.rack_code === rackFilter

      return matchSearch && matchRack
    })
  }, [locations, rackFilter, search])

  const totalItems = filteredLocations.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  const paginatedLocations = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize

    return filteredLocations.slice(startIndex, endIndex)
  }, [filteredLocations, currentPage, pageSize])

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  if (loading) {
    return <p className="text-slate-500">Loading QR rak...</p>
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Cetak QR Rak</h2>
        <p className="text-slate-500 mt-1">
          Pilih slot rak untuk mencetak QR Code rak.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="lg:col-span-2 relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari lokasi rak..."
              className="w-full border border-slate-300 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={rackFilter}
            onChange={(event) => setRackFilter(event.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Rak</option>
            <option value="A">Rak A</option>
            <option value="B">Rak B</option>
            <option value="C">Rak C</option>
            <option value="D">Rak D</option>
            <option value="E">Rak E</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600">
                <th className="text-left px-4 py-3">Lokasi Rak</th>
                <th className="text-left px-4 py-3">Ukuran</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-right px-4 py-3">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {paginatedLocations.map((location) => (
                <tr key={location.id} className="border-b border-slate-100">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {formatRackLocation(location)}
                  </td>
                  <td className="px-4 py-3">
                    Small
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={[
                        'px-3 py-1 rounded-full text-xs font-semibold',
                        location.status === 'empty'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700',
                      ].join(' ')}
                    >
                      {location.status === 'empty' ? 'Kosong' : 'Terisi'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => navigate(`/admin/racks/${location.id}/qr`)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <QrCode size={16} />
                      Cetak QR
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-4 py-4 border-t border-slate-100">
          <div className="text-sm text-slate-500">
            Menampilkan{' '}
            <span className="font-semibold text-slate-700">{startItem}</span>
            {' '}–{' '}
            <span className="font-semibold text-slate-700">{endItem}</span>
            {' '}dari{' '}
            <span className="font-semibold text-slate-700">{totalItems}</span>
            {' '}slot rak
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value))
                setCurrentPage(1)
              }}
              className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10 / halaman</option>
              <option value={20}>20 / halaman</option>
              <option value={50}>50 / halaman</option>
              <option value={100}>100 / halaman</option>
            </select>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>

              <div className="px-3 py-2 rounded-lg bg-slate-100 text-sm font-semibold text-slate-700">
                {currentPage} / {totalPages}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}