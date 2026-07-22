import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrCode, RefreshCcw, Warehouse } from 'lucide-react'
import { getAllRackLocations } from '../../services/rackService'
import { formatRackLocation } from '../../utils/formatRackLocation'
import { getActivePlacement } from '../../utils/getActivePlacement'
import type { RackLocation } from '../../dto/rack.dto'
import { generateRackCode } from '../../utils/generateRackCode'

type Category = 'outdoor' | 'indoor'

const CATEGORY_RACK_CODES: Record<Category, string[]> = {
  // Urutan tampil atas -> bawah. Rak A sengaja di posisi terakhir (paling bawah).
  outdoor: ['E', 'D', 'C', 'B', 'A'],
  // Belum ada data F-I di DB — urutan ini asumsi sementara.
  indoor: ['F', 'G', 'H', 'I'],
}

const CATEGORY_LABELS: Record<Category, string> = {
  outdoor: 'Outdoor',
  indoor: 'Indoor (Gudang AC)',
}

export default function RackDashboard() {
  const navigate = useNavigate()
  const [locations, setLocations] = useState<RackLocation[]>([])
  const [category, setCategory] = useState<Category>('outdoor')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLocations()
  }, [])

  async function fetchLocations() {
    try {
      setLoading(true)
      const data = await getAllRackLocations()
      setLocations((data ?? []) as unknown as RackLocation[])
    } catch (error) {
      console.error(error)
      alert('Gagal mengambil data dashboard rak')
    } finally {
      setLoading(false)
    }
  }

  const rackCodesInCategory = CATEGORY_RACK_CODES[category]

  const categoryLocations = useMemo(() => {
    return locations.filter((location) =>
      rackCodesInCategory.includes(location.rack_code)
    )
  }, [locations, rackCodesInCategory])

  const categoryStats = useMemo(() => {
    const total = categoryLocations.length
    const occupied = categoryLocations.filter(
      (location) => location.status === 'occupied'
    ).length
    return { total, occupied, empty: total - occupied }
  }, [categoryLocations])

  if (loading) {
    return <p className="text-slate-500">Loading dashboard rak...</p>
  }

  return (
    <div className="w-full max-w-full overflow-hidden">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold text-slate-800">Dashboard Rak</h2>
          <p className="text-slate-500 mt-1">
            Visualisasi status slot rak. Hijau kosong, merah terisi.
          </p>
        </div>

        <button
          onClick={fetchLocations}
          className="inline-flex w-fit items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          <RefreshCcw size={18} />
          Refresh
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-5 shadow-sm overflow-hidden">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(Object.keys(CATEGORY_RACK_CODES) as Category[]).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={[
                'shrink-0 px-5 py-2 rounded-xl font-semibold transition',
                category === cat
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
              ].join(' ')}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-5">
        <StatCard title="Total Slot" value={categoryStats.total} />
        <StatCard title="Slot Kosong" value={categoryStats.empty} />
        <StatCard title="Slot Terisi" value={categoryStats.occupied} />
      </div>

      <div className="flex flex-col gap-5">
        {rackCodesInCategory.map((rackCode) => {
          const rackLocations = categoryLocations.filter(
            (location) => location.rack_code === rackCode
          )

          return (
            <RackBlock
              key={rackCode}
              rackCode={rackCode}
              locations={rackLocations}
              onQrClick={(id) => navigate(`/admin/racks/${id}/qr`)}
            />
          )
        })}
      </div>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm min-w-0">
      <p className="text-slate-500 text-sm">{title}</p>
      <p className="text-3xl font-bold text-slate-900 mt-2">
        {value.toLocaleString('id-ID')}
      </p>
    </div>
  )
}

function RackBlock({
  rackCode,
  locations,
  onQrClick,
}: {
  rackCode: string
  locations: RackLocation[]
  onQrClick: (id: string) => void
}) {
  const fullLocations = locations.filter((location) => location.section === 'FULL')
  const leftLocations = locations.filter((location) => location.section === 'LEFT')
  const rightLocations = locations.filter((location) => location.section === 'RIGHT')

  const stats = useMemo(() => {
    const total = locations.length
    const occupied = locations.filter((location) => location.status === 'occupied').length
    return { total, occupied }
  }, [locations])

  if (locations.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-5 text-center text-slate-400">
        Rak {rackCode} — belum ada data rak.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm overflow-hidden">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-2">
          <Warehouse size={20} className="text-blue-700 shrink-0" />
          <h3 className="text-lg font-bold text-slate-800">Rak {rackCode}</h3>
          <span className="text-xs text-slate-400">
            ({stats.occupied}/{stats.total} terisi)
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-green-500" />
            Kosong
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-500" />
            Terisi
          </div>
        </div>
      </div>

      {fullLocations.length > 0 ? (
        <div className="max-w-full overflow-x-auto pb-2">
          <ColumnGroup
            locations={fullLocations}
            onQrClick={onQrClick}
          />
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto pb-2">
          <div className="flex min-w-max items-start gap-4">
            {leftLocations.length > 0 ? (
              <ColumnGroup
                locations={leftLocations}
                onQrClick={onQrClick}
              />
            ) : (
              <div className="w-[80px] sm:w-[92px] shrink-0 flex items-center justify-center min-h-[140px] rounded-xl border border-dashed border-slate-200 text-[10px] text-slate-300 text-center px-2">
                Tidak ada rak
              </div>
            )}

            <div className="flex min-h-[140px] w-14 sm:w-16 shrink-0 rounded-xl bg-slate-100 border border-dashed border-slate-300 items-center justify-center text-slate-500 font-semibold text-xs">
              Jalan
            </div>

            <ColumnGroup
              locations={rightLocations}
              onQrClick={onQrClick}
            />
          </div>
        </div>
      )}
    </div>
  )
}

function ColumnGroup({
  locations,
  onQrClick,
}: {
  locations: RackLocation[]
  onQrClick: (id: string) => void
}) {
  const columns = useMemo(() => {
    const map = new Map<number, RackLocation[]>()

    locations.forEach((location) => {
      const key = location.display_col_no
      const current = map.get(key) ?? []
      current.push(location)
      map.set(key, current)
    })

    return Array.from(map.entries()).sort(([a], [b]) => b - a)
  }, [locations])

  return (
    <div className="flex gap-3">
      {columns.map(([columnNo, columnLocations]) => {
        const levels = groupByLevel(columnLocations)
        const sizeLabel ='Small'

        return (
          <div
            key={columnLocations[0]?.id ?? columnNo}
            className="w-[80px] sm:w-[92px] shrink-0 rounded-xl border border-slate-200 bg-slate-50 p-2"
          >
            <p className="font-semibold text-slate-700 text-center mb-2 text-[11px] sm:text-xs">
              {sizeLabel} {columnNo}
            </p>

            <div className="space-y-2">
              {levels.map(([levelNo, rows]) => (
                <div key={levelNo}>
                  <p className="text-[9px] font-semibold text-slate-400 text-center mb-1 uppercase tracking-wide">
                    Tingkat {levelNo}
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    {rows.map((location) => {
                      const placement = getActivePlacement(location.placements)
                      const deposit = placement?.deposit_requests
                      const code = generateRackCode(location)

                      return (
                        <button
                          key={location.id}
                          onClick={() => onQrClick(location.id)}
                          title={
                            deposit
                              ? `${code} — ${formatRackLocation(location)} - ${deposit.depositor_name}`
                              : `${code} — ${formatRackLocation(location)}`
                          }
                          className={[
                            'relative rounded-md px-1.5 py-1.5 text-[9px] sm:text-[10px] font-semibold text-white transition hover:scale-[1.03]',
                            'min-h-[26px]',
                            location.status === 'empty'
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'bg-red-500 hover:bg-red-600',
                          ].join(' ')}
                        >
                          <span className="pr-3">R{location.row_no}</span>
                          <QrCode
                            size={9}
                            className="absolute right-1 top-1/2 -translate-y-1/2 opacity-80"
                          />
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function groupByLevel(columnLocations: RackLocation[]) {
  const map = new Map<number, RackLocation[]>()

  columnLocations.forEach((location) => {
    const key = location.level_no
    const current = map.get(key) ?? []
    current.push(location)
    map.set(key, current)
  })

  return Array.from(map.entries())
    .sort(([a], [b]) => a - b)
    .map(
      ([level, rows]) =>
        [level, rows.sort((a, b) => a.row_no - b.row_no)] as [number, RackLocation[]]
    )
}