import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, FileSpreadsheet, Search } from 'lucide-react'
import * as XLSX from 'xlsx'
import { getAllDepositRequests } from '../../services/depositService'
import { formatRackLocation } from '../../utils/formatRackLocation'
import { getActivePlacement } from '../../utils/getActivePlacement'
import {
  getDepositStatusClass,
  getDepositStatusLabel,
} from '../../utils/statusBadge'

type RackLocation = {
  id: string
  rack_code: string
  section: 'FULL' | 'LEFT' | 'RIGHT'
  slot_size: 'M' | 'L'
  display_col_no: number
  level_no: number
  row_no: number
  status: string
}

type Placement = {
  id: string
  is_active?: boolean
  placed_at: string
  rack_locations: RackLocation | null
}

type Item = {
  id: string
  item_name: string
  quantity: number
  remaining_quantity: number
  procurement_unit: string
  category: string | null
  entry_date: string
  status: string
}

type DepositRequest = {
  id: string
  depositor_name: string
  nipp: string
  jabatan: string
  unit_kerja: string
  status: string
  created_at: string
  items: Item[]
  placements: Placement[] | Placement | null
}

type TableRow = {
  depositId: string
  itemId: string
  depositorName: string
  nipp: string
  jabatan: string
  unitKerja: string
  itemName: string
  category: string
  quantity: number
  remainingQuantity: number
  procurementUnit: string
  position: string
  rackCode: string
  rowNo: string
  entryDate: string
  daysStored: number
  status: string
}

function getDaysSince(dateString: string) {
  const start = new Date(dateString)
  const now = new Date()

  const diff = now.getTime() - start.getTime()
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))
}

function downloadBlob(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
}

function escapeCsv(value: string | number) {
  const stringValue = String(value ?? '')
  return `"${stringValue.replace(/"/g, '""')}"`
}

export default function AllDeposits() {
  const navigate = useNavigate()

  const [deposits, setDeposits] = useState<DepositRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [rowFilter, setRowFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  useEffect(() => {
    fetchDeposits()
  }, [])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter, rowFilter, pageSize])

  async function fetchDeposits() {
    try {
      setLoading(true)
      const data = await getAllDepositRequests()
      setDeposits((data ?? []) as unknown as DepositRequest[])
    } catch (error) {
      console.error(error)
      alert('Gagal mengambil data list barang')
    } finally {
      setLoading(false)
    }
  }

  const tableRows = useMemo<TableRow[]>(() => {
    return deposits.flatMap((deposit) => {
      const placement = getActivePlacement<Placement>(deposit.placements)
      const rackLocation = placement?.rack_locations ?? null

      return deposit.items.map((item) => {
        const position = rackLocation ? formatRackLocation(rackLocation) : '-'
        const entryDate = item.entry_date || deposit.created_at

        return {
          depositId: deposit.id,
          itemId: item.id,
          depositorName: deposit.depositor_name,
          nipp: deposit.nipp,
          jabatan: deposit.jabatan,
          unitKerja: deposit.unit_kerja,
          itemName: item.item_name,
          category: item.category || '-',
          quantity: item.quantity,
          remainingQuantity: item.remaining_quantity,
          procurementUnit: item.procurement_unit,
          position,
          rackCode: rackLocation?.rack_code ?? '-',
          rowNo: rackLocation?.row_no ? String(rackLocation.row_no) : '-',
          entryDate,
          daysStored: getDaysSince(entryDate),
          status: deposit.status,
        }
      })
    })
  }, [deposits])

  const filteredRows = useMemo(() => {
    return tableRows.filter((row) => {
      const keyword = search.toLowerCase()

      const matchSearch =
        row.itemName.toLowerCase().includes(keyword) ||
        row.category.toLowerCase().includes(keyword) ||
        row.depositorName.toLowerCase().includes(keyword) ||
        row.nipp.toLowerCase().includes(keyword) ||
        row.unitKerja.toLowerCase().includes(keyword) ||
        row.position.toLowerCase().includes(keyword)

      const matchStatus =
        statusFilter === 'all' ? true : row.status === statusFilter

      const matchRow = rowFilter === 'all' ? true : row.rowNo === rowFilter

      return matchSearch && matchStatus && matchRow
    })
  }, [tableRows, search, statusFilter, rowFilter])

  const totalItems = filteredRows.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize

    return filteredRows.slice(startIndex, endIndex)
  }, [filteredRows, currentPage, pageSize])

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const availableRows = useMemo(() => {
    const uniqueRows = Array.from(
      new Set(tableRows.map((row) => row.rowNo).filter((row) => row !== '-'))
    )

    return uniqueRows.sort((a, b) => Number(a) - Number(b))
  }, [tableRows])

  function handleExportCsv() {
    const headers = [
      'Nama Barang',
      'Kategori',
      'Jumlah Awal',
      'Sisa Gudang',
      'Unit Pengadaan',
      'Posisi',
      'Tanggal Masuk',
      'Lama Simpan',
      'Status',
      'Nama Penitip',
      'NIPP',
      'Jabatan',
      'Unit Kerja',
    ]

    const rows = paginatedRows.map((row) => [
      row.itemName,
      row.category,
      row.quantity,
      row.remainingQuantity,
      row.procurementUnit,
      row.position,
      new Date(row.entryDate).toLocaleDateString('id-ID'),
      `${row.daysStored} hari`,
      getDepositStatusLabel(row.status),
      row.depositorName,
      row.nipp,
      row.jabatan,
      row.unitKerja,
    ])

    const csvContent = [
      headers.map(escapeCsv).join(','),
      ...rows.map((row) => row.map(escapeCsv).join(',')),
    ].join('\n')

    downloadBlob(
      csvContent,
      `list-barang-rakfat-${new Date().toISOString().slice(0, 10)}.csv`,
      'text/csv;charset=utf-8;'
    )
  }

  function handleExportExcel() {
    const rows = paginatedRows.map((row) => ({
      'Nama Barang': row.itemName,
      Kategori: row.category,
      'Jumlah Awal': row.quantity,
      'Sisa Gudang': row.remainingQuantity,
      'Unit Pengadaan': row.procurementUnit,
      Posisi: row.position,
      'Tanggal Masuk': new Date(row.entryDate).toLocaleDateString('id-ID'),
      'Lama Simpan': `${row.daysStored} hari`,
      Status: getDepositStatusLabel(row.status),
      'Nama Penitip': row.depositorName,
      NIPP: row.nipp,
      Jabatan: row.jabatan,
      'Unit Kerja': row.unitKerja,
    }))

    const worksheet = XLSX.utils.json_to_sheet(rows)
    const workbook = XLSX.utils.book_new()

    XLSX.utils.book_append_sheet(workbook, worksheet, 'List Barang')

    XLSX.writeFile(
      workbook,
      `list-barang-rakfat-${new Date().toISOString().slice(0, 10)}.xlsx`
    )
  }

  const pageNumbers = useMemo(() => {
    const pages: number[] = []
    const maxVisible = 5

    let start = Math.max(1, currentPage - 2)
    let end = Math.min(totalPages, start + maxVisible - 1)

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1)
    }

    for (let page = start; page <= end; page++) {
      pages.push(page)
    }

    return pages
  }, [currentPage, totalPages])

  if (loading) {
    return <p className="text-slate-500">Loading list barang...</p>
  }

  return (
    <div>
      <div className="mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">List All Barang</h2>
          <p className="text-slate-500 mt-1">
            Daftar barang tersimpan dan riwayat batch penitipan.
          </p>
        </div>

        <div className="text-sm text-slate-500">
          <span className="font-semibold text-slate-800">
            {filteredRows.length}
          </span>{' '}
          barang
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5 shadow-sm">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_180px_160px_120px_130px] gap-3">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama barang, penitip, NIPP, unit kerja, atau posisi..."
              className="w-full border border-slate-300 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="stored">Tersimpan</option>
            <option value="returned">Diambil</option>
            <option value="rejected">Ditolak</option>
          </select>

          <select
            value={rowFilter}
            onChange={(event) => setRowFilter(event.target.value)}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Semua Row</option>
            {availableRows.map((row) => (
              <option key={row} value={row}>
                Row {row}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearch('')
              setStatusFilter('all')
              setRowFilter('all')
            }}
            className="px-4 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50"
          >
            Reset
          </button>

          <button
            onClick={fetchDeposits}
            className="px-4 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>

        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={handleExportExcel}
            disabled={filteredRows.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet size={18} />
            Export Excel
          </button>

          <button
            onClick={handleExportCsv}
            disabled={filteredRows.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-700 text-white font-semibold hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="text-left px-5 py-4 font-bold uppercase tracking-wide">
                  No
                </th>
                <th className="text-left px-5 py-4 font-bold uppercase tracking-wide">
                  Nama Barang
                </th>
                <th className="text-left px-5 py-4 font-bold uppercase tracking-wide">
                  Kategori
                </th>
                <th className="text-left px-5 py-4 font-bold uppercase tracking-wide">
                  Jumlah
                </th>
                <th className="text-left px-5 py-4 font-bold uppercase tracking-wide">
                  Sisa
                </th>
                <th className="text-left px-5 py-4 font-bold uppercase tracking-wide">
                  Posisi
                </th>
                <th className="text-left px-5 py-4 font-bold uppercase tracking-wide">
                  Tanggal Masuk
                </th>
                <th className="text-left px-5 py-4 font-bold uppercase tracking-wide">
                  Lama Simpan
                </th>
                <th className="text-left px-5 py-4 font-bold uppercase tracking-wide">
                  Status
                </th>
                <th className="text-right px-5 py-4 font-bold uppercase tracking-wide">
                  Aksi
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-10 text-center text-slate-500"
                  >
                    Data tidak ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((row, i) => (
                  <tr
                    key={`${row.depositId}-${row.itemId}`}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 text-slate-600">
                      {i+1}
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {row.itemName}
                      <p className="text-xs font-normal text-slate-500 mt-1">
                        {row.depositorName} · {row.unitKerja}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {row.category}
                    </td>

                    <td className="px-5 py-4 text-slate-800">
                      {row.quantity}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={[
                          'font-bold',
                          row.remainingQuantity === 0
                            ? 'text-red-600'
                            : 'text-blue-700',
                        ].join(' ')}
                      >
                        {row.remainingQuantity}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-semibold text-indigo-600">
                        {row.position}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {new Date(row.entryDate).toLocaleDateString('id-ID')}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {row.daysStored} hari
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${getDepositStatusClass(
                          row.status
                        )}`}
                      >
                        {getDepositStatusLabel(row.status)}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() =>
                          navigate(`/admin/deposits/${row.depositId}/qr`)
                        }
                        className="font-semibold text-blue-600 hover:text-blue-800"
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 px-5 py-4 border-t border-slate-100">
          <div className="text-sm text-slate-500">
            Menampilkan{' '}
            <span className="font-semibold text-slate-700">{startItem}</span>
            {' '}–{' '}
            <span className="font-semibold text-slate-700">{endItem}</span>
            {' '}dari{' '}
            <span className="font-semibold text-slate-700">{totalItems}</span>
            {' '}barang
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
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Prev
              </button>

              <div className="flex items-center gap-1">
                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={[
                      'w-9 h-9 rounded-lg text-sm font-semibold',
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                    ].join(' ')}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                type="button"
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
  )
}