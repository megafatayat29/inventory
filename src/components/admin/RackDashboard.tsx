import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QrCode, RefreshCcw, Warehouse } from 'lucide-react'
import { getAllRackLocations } from '../../services/rackService'
import { formatRackLocation } from '../../utils/formatRackLocation'
import { getActivePlacement } from '../../utils/getActivePlacement'
import type { RackLocation } from '../../dto/rack.dto'

const rackCodes = ['A', 'B', 'C', 'D', 'E']

export default function RackDashboard() {
  const navigate = useNavigate()
  const [locations, setLocations] = useState<RackLocation[]>([])
  const [selectedRack, setSelectedRack] = useState('A')
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

  const selectedLocations = useMemo(() => {
    return locations.filter((location) => location.rack_code === selectedRack)
  }, [locations, selectedRack])

  const selectedStats = useMemo(() => {
    const total = selectedLocations.length
    const occupied = selectedLocations.filter(
      (location) => location.status === 'occupied'
    ).length
    const empty = total - occupied

    return { total, occupied, empty }
  }, [selectedLocations])

  const groupedBySection = useMemo(() => {
    return {
      FULL: selectedLocations.filter((location) => location.section === 'FULL'),
      LEFT: selectedLocations.filter((location) => location.section === 'LEFT'),
      RIGHT: selectedLocations.filter((location) => location.section === 'RIGHT'),
    }
  }, [selectedLocations])

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
          {rackCodes.map((rack) => (
            <button
              key={rack}
              onClick={() => setSelectedRack(rack)}
              className={[
                'shrink-0 px-5 py-2 rounded-xl font-semibold transition',
                selectedRack === rack
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
              ].join(' ')}
            >
              Rak {rack}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-5">
        <StatCard title="Total Slot" value={selectedStats.total} />
        <StatCard title="Slot Kosong" value={selectedStats.empty} />
        <StatCard title="Slot Terisi" value={selectedStats.occupied} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm overflow-hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-5">
          <div className="flex items-center gap-2">
            <Warehouse size={22} className="text-blue-700 shrink-0" />
            <h3 className="text-xl font-bold text-slate-800">Rak {selectedRack}</h3>
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-green-500" />
              <span>Kosong</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded bg-red-500" />
              <span>Terisi</span>
            </div>
          </div>
        </div>

        {selectedRack === 'A' ? (
          <div className="max-w-full overflow-x-auto pb-3">
            <RackSection
              title="Rak A - Small"
              locations={groupedBySection.FULL}
              onQrClick={(id) => navigate(`/admin/racks/${id}/qr`)}
            />
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto pb-3">
            <div className="flex min-w-max items-start gap-5">
              <RackSection
                title="Sisi Kiri"
                locations={groupedBySection.LEFT}
                onQrClick={(id) => navigate(`/admin/racks/${id}/qr`)}
              />

              <div className="flex min-h-[260px] w-20 shrink-0 rounded-2xl bg-slate-100 border border-dashed border-slate-300 items-center justify-center text-slate-500 font-semibold">
                Jalan
              </div>

              <RackSection
                title="Sisi Kanan"
                locations={groupedBySection.RIGHT}
                onQrClick={(id) => navigate(`/admin/racks/${id}/qr`)}
              />
            </div>
          </div>
        )}
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

function RackSection({
  title,
  locations,
  onQrClick,
}: {
  title: string
  locations: RackLocation[]
  onQrClick: (id: string) => void
}) {
  const groupedByColumn = useMemo(() => {
    const map = new Map<number, RackLocation[]>()

    locations.forEach((location) => {
      const key = location.display_col_no
      const current = map.get(key) ?? []
      current.push(location)
      map.set(key, current)
    })

    return Array.from(map.entries()).sort(([a], [b]) => a - b)
  }, [locations])

  return (
    <div className="shrink-0">
      <h4 className="font-bold text-slate-800 mb-3">{title}</h4>

      <div className="flex gap-4">
        {groupedByColumn.map(([columnNo, columnLocations]) => (
          <div
            key={columnNo}
            className="w-[118px] sm:w-[130px] shrink-0 rounded-2xl border border-slate-200 bg-slate-50 p-3"
          >
            <p className="font-semibold text-slate-700 text-center mb-3 text-sm sm:text-base">
              {columnLocations[0]?.slot_size === 'S'
                ? `Small ${columnNo}`
                : `S${columnNo}`}
            </p>

            <div className="grid grid-cols-1 gap-2">
              {columnLocations.map((location) => {
                const placement = getActivePlacement(location.placements)
                const deposit = placement?.deposit_requests

                return (
                  <button
                    key={location.id}
                    onClick={() => onQrClick(location.id)}
                    title={
                      deposit
                        ? `${formatRackLocation(location)} - ${deposit.depositor_name}`
                        : formatRackLocation(location)
                    }
                    className={[
                      'relative rounded-xl px-2 py-3 text-[11px] sm:text-xs font-semibold text-white transition hover:scale-[1.02]',
                      'min-h-[44px]',
                      location.status === 'empty'
                        ? 'bg-green-500 hover:bg-green-600'
                        : 'bg-red-500 hover:bg-red-600',
                    ].join(' ')}
                  >
                    <div className="pr-4 truncate">
                      {location.slot_size === 'S'
                        ? `R${location.row_no}`
                        : `T${location.level_no}-R${location.row_no}`}
                    </div>

                    <QrCode
                      size={13}
                      className="absolute right-2 top-1/2 -translate-y-1/2 opacity-80"
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
}