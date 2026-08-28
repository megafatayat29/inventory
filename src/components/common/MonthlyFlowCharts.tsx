import { useEffect, useState } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'
import { getMonthlyInventorySummary, type MonthlyInventoryRow } from '../../services/inventoryChart'

function formatMonthLabel(isoDate: string) {
  const date = new Date(`${isoDate}T00:00:00`)
  return date.toLocaleDateString('id-ID', { month: 'short' })
}

export default function MonthlyFlowCharts() {
  const [data, setData] = useState<MonthlyInventoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setErrorMsg(null)

      try {
        const result = await getMonthlyInventorySummary()
        if (!cancelled) setData(result)
      } catch (error) {
        console.error(error)
        if (!cancelled) setErrorMsg('Gagal memuat data')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      <MonthlyBarCard
        title="Barang Masuk per Bulan"
        dataKey="incoming"
        color="#2563eb"
        data={data}
        loading={loading}
        errorMsg={errorMsg}
      />
      <MonthlyBarCard
        title="Barang Keluar per Bulan"
        dataKey="outgoing"
        color="#ef4444"
        data={data}
        loading={loading}
        errorMsg={errorMsg}
      />
    </div>
  )
}

function MonthlyBarCard({
  title,
  dataKey,
  color,
  data,
  loading,
  errorMsg,
}: {
  title: string
  dataKey: 'incoming' | 'outgoing'
  color: string
  data: MonthlyInventoryRow[]
  loading: boolean
  errorMsg: string | null
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>

      {loading ? (
        <div className="h-[280px] flex items-center justify-center text-sm text-slate-400">
          Memuat data...
        </div>
      ) : errorMsg ? (
        <div className="h-[280px] flex items-center justify-center text-sm text-red-500">
          {errorMsg}
        </div>
      ) : data.length === 0 ? (
        <div className="h-[280px] flex items-center justify-center text-sm text-slate-400">
          Belum ada data
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" tickFormatter={formatMonthLabel} />

            <YAxis allowDecimals={false} />

            <Tooltip
              labelFormatter={(label) => formatMonthLabel(String(label))}
            />

            <Bar dataKey={dataKey} fill={color} radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
