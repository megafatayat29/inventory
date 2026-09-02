import { useEffect, useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'
import { getSpecialDepositsMonthlySummary, getSpecialDepositTypes, type SpecialDepositMonthlyRow } from '../../services/inventoryChart'

function toISODate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatMonthLabel(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`)
  return date.toLocaleDateString('id-ID', { month: 'short' })
}

function getDefaultRange() {
  const today = new Date()
  const from = new Date()
  from.setDate(today.getDate() - 29)
  return { dateFrom: toISODate(from), dateTo: toISODate(today) }
}

export default function SpecialDepositsChart() {
  const defaultRange = useMemo(getDefaultRange, [])
  const todayISO = useMemo(() => toISODate(new Date()), [])

  const [dateFrom, setDateFrom] = useState(defaultRange.dateFrom)
  const [dateTo, setDateTo] = useState(defaultRange.dateTo)
  const [penitip, setPenitip] = useState('')
  const [jenis, setJenis] = useState('')

  const [jenisOptions, setJenisOptions] = useState<string[]>([])
  const [chartData, setChartData] = useState<SpecialDepositMonthlyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    getSpecialDepositTypes()
      .then(setJenisOptions)
      .catch((error) => console.error('Gagal memuat daftar jenis', error))
  }, [])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setErrorMsg(null)

      try {
        const result = await getSpecialDepositsMonthlySummary({
          dateFrom,
          dateTo,
          penitip,
          jenis,
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
  }, [dateFrom, dateTo, penitip, jenis])

  const isFiltered =
    dateFrom !== defaultRange.dateFrom ||
    dateTo !== defaultRange.dateTo ||
    penitip !== '' ||
    jenis !== ''

  function handleClear() {
    setDateFrom(defaultRange.dateFrom)
    setDateTo(defaultRange.dateTo)
    setPenitip('')
    setJenis('')
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
              Barang (jenis limbah)
            </label>
            <select
              value={jenis}
              onChange={(e) => setJenis(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
            >
              <option value="">Semua jenis</option>
              {jenisOptions.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Barang Bekas tidak punya kolom jenis, jadi selalu 0 saat filter
              ini diisi.
            </p>
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
        <h3 className="text-lg font-semibold text-slate-800">
          Limbah B3
        </h3>
        <p className="text-sm text-slate-500 mb-4">
          {formatMonthLabel(dateFrom)} – {formatMonthLabel(dateTo)}
        </p>

        {loading ? (
          <div className="h-[380px] flex items-center justify-center text-sm text-slate-400">
            Memuat data...
          </div>
        ) : errorMsg ? (
          <div className="h-[380px] flex items-center justify-center text-sm text-red-500">
            {errorMsg}
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[380px] flex items-center justify-center text-sm text-slate-400">
            Tidak ada data untuk filter ini
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={380}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis dataKey="month" tickFormatter={formatMonthLabel} />

              <YAxis allowDecimals={false} />

              <Tooltip
                labelFormatter={(label) => formatMonthLabel(String(label))}
              />

              <Legend />

              <Bar dataKey="limbah_masuk" name="Limbah B3 Masuk" fill="#2563eb" radius={[4, 4, 0, 0]} />
              <Bar dataKey="limbah_keluar" name="Limbah B3 Keluar" fill="#93c5fd" radius={[4, 4, 0, 0]} />

              {/* <Bar dataKey="bbm_masuk" name="BBM Masuk" fill="#f97316" radius={[4, 4, 0, 0]} />
              <Bar dataKey="bbm_keluar" name="BBM Keluar" fill="#fdba74" radius={[4, 4, 0, 0]} />

              <Bar dataKey="barang_bekas_masuk" name="Barang Bekas Masuk" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="barang_bekas_keluar" name="Barang Bekas Keluar" fill="#86efac" radius={[4, 4, 0, 0]} /> */}
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}
