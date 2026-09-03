import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'
import SearchableSelect from '../common/SearchableSelect'
import {
  getInventoryChart,
  getItemNames,
  type InventoryChartRow,
} from '../../services/inventoryChart'

function toISODate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatDayLabel(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`)
  return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })
}

function getDefaultRange() {
  const today = new Date()
  const from = new Date()
  from.setDate(today.getDate() - 29)
  return { dateFrom: toISODate(from), dateTo: toISODate(today) }
}

export default function InventoryChart() {
  const defaultRange = useMemo(getDefaultRange, [])
  const todayISO = useMemo(() => toISODate(new Date()), [])

  const [dateFrom, setDateFrom] = useState(defaultRange.dateFrom)
  const [dateTo, setDateTo] = useState(defaultRange.dateTo)
  const [penitip, setPenitip] = useState('')
  const [barang, setBarang] = useState('')

  const [itemOptions, setItemOptions] = useState<string[]>([])
  const [chartData, setChartData] = useState<InventoryChartRow[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    getItemNames()
      .then(setItemOptions)
      .catch((error) => console.error('Gagal memuat daftar barang', error))
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setErrorMsg(null)

      try {
        const result = await getInventoryChart({
          dateFrom,
          dateTo,
          penitip,
          barang,
        })

        if (!cancelled) setChartData(result)
      } catch (error) {
        console.error(error)
        if (!cancelled) setErrorMsg('Gagal memuat data grafik')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [dateFrom, dateTo, penitip, barang])

  const isFiltered =
    dateFrom !== defaultRange.dateFrom ||
    dateTo !== defaultRange.dateTo ||
    penitip !== '' ||
    barang !== ''

  function handleClear() {
    setDateFrom(defaultRange.dateFrom)
    setDateTo(defaultRange.dateTo)
    setPenitip('')
    setBarang('')
  }

  return (
    <div className="flex flex-col md:flex-row gap-5">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 md:w-64 flex-shrink-0">
        <h4 className="text-sm font-semibold text-slate-800 mb-4">Filter</h4>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Tanggal
            </label>
            <div className="flex flex-col gap-2">
              <div>
                <span className="block text-[11px] text-slate-400 mb-0.5">
                  Dari
                </span>
                <input
                  type="date"
                  value={dateFrom}
                  max={dateTo}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
              </div>
              <div>
                <span className="block text-[11px] text-slate-400 mb-0.5">
                  Sampai
                </span>
                <input
                  type="date"
                  value={dateTo}
                  min={dateFrom}
                  max={todayISO}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full text-sm border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Penitip
            </label>
            <input
              type="text"
              value={penitip}
              onChange={(e) => setPenitip(e.target.value)}
              placeholder="Cari nama penitip..."
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Barang
            </label>
            <SearchableSelect
              value={barang}
              onChange={setBarang}
              options={itemOptions}
              allLabel="Semua barang"
              searchPlaceholder="Cari barang..."
            />
          </div>

          <button
            type="button"
            onClick={handleClear}
            disabled={!isFiltered}
            className="w-full text-sm font-medium text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex-1 min-w-0">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">
          Grafik Arus Barang
        </h3>

        {loading ? (
          <div className="h-[350px] flex items-center justify-center text-sm text-slate-400">
            Memuat data...
          </div>
        ) : errorMsg ? (
          <div className="h-[350px] flex items-center justify-center text-sm text-red-500">
            {errorMsg}
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[350px] flex items-center justify-center text-sm text-slate-400">
            Tidak ada data untuk filter ini
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="day" tickFormatter={formatDayLabel} />

              <YAxis allowDecimals={false} />

              <Tooltip labelFormatter={(label) => formatDayLabel(String(label))} />

              <Legend />

              <Line
                type="monotone"
                dataKey="incoming"
                stroke="#2563eb"
                strokeWidth={3}
                dot={false}
                name="Barang Masuk"
              />

              <Line
                type="monotone"
                dataKey="outgoing"
                stroke="#ef4444"
                strokeWidth={3}
                dot={false}
                name="Barang Keluar"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
