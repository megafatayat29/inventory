import { useEffect, useState } from 'react'
import {
  Archive,
  Boxes,
  Fuel,
  Inbox,
  PackageCheck,
  Recycle,
  RotateCcw,
  Trash2,
  Warehouse,
} from 'lucide-react'
import {
  getDashboardStats,
  type DashboardStats,
} from '../../services/dashboardService'
import InventoryChart from '../common/InventoryChart'
import MonthlyFlowCharts from '../common/MonthlyFlowCharts'
import SpecialDepositsChart from '../common/SpecialDepositsChart'

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    pendingRequests: 0,
    storedRequests: 0,
    returnedRequests: 0,
    emptyRacks: 0,
    occupiedRacks: 0,
    activeItemTypes: 0,
    storedQuantity: 0,
    returnedQuantity: 0,
    storedWasteRequests: 0,
    storedFuelRequests: 0,
    storedUsedGoodsRequests: 0,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const result = await getDashboardStats()
        setStats(result)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <p className="text-slate-500">Loading dashboard...</p>
  }

  const batchCards = [
    {
      title: 'Incoming Batch',
      value: stats.pendingRequests,
      icon: Inbox,
      description: 'Batch penitipan menunggu plotting rak',
    },
    {
      title: 'Batch Tersimpan',
      value: stats.storedRequests,
      icon: PackageCheck,
      description: 'Batch penitipan yang masih tersimpan di rak',
    },
    {
      title: 'Batch Diambil Habis',
      value: stats.returnedRequests,
      icon: RotateCcw,
      description: 'Batch penitipan yang sudah diambil seluruhnya',
    },
  ]

  const rackCards = [
    {
      title: 'Slot Rak Kosong',
      value: stats.emptyRacks,
      icon: Warehouse,
      description: 'Lokasi rak yang masih tersedia',
    },
    {
      title: 'Slot Rak Terisi',
      value: stats.occupiedRacks,
      icon: Warehouse,
      description: 'Lokasi rak yang sedang digunakan',
    },
  ]

  const itemCards = [
    {
      title: 'Jenis Barang Aktif',
      value: stats.activeItemTypes,
      icon: Boxes,
      description: 'Jenis barang dengan sisa quantity di gudang',
    },
    {
      title: 'Total Quantity Tersimpan',
      value: stats.storedQuantity,
      icon: Archive,
      description: 'Total sisa quantity seluruh barang di gudang',
    },
    {
      title: 'Total Quantity Diambil',
      value: stats.returnedQuantity,
      icon: RotateCcw,
      description: 'Total quantity barang yang sudah pernah diambil',
    },
  ]

  const specialDepositCards = [
    {
      title: 'Limbah Tersimpan',
      value: stats.storedWasteRequests,
      icon: Trash2,
      description: 'Batch limbah yang masih tersimpan di gudang',
    },
    {
      title: 'BBM & Pelumas Tersimpan',
      value: stats.storedFuelRequests,
      icon: Fuel,
      description: 'Batch BBM & pelumas yang masih tersimpan di gudang',
    },
    {
      title: 'Barang Bekas Tersimpan',
      value: stats.storedUsedGoodsRequests,
      icon: Recycle,
      description: 'Batch barang bekas yang masih tersimpan di gudang',
    },
  ]

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Overview Gudang</h2>
        <p className="text-slate-500">
          Ringkasan batch penitipan, kapasitas rak, dan stok aktual barang.
        </p>
      </div>

      <section className="mt-8">
        <InventoryChart />
      </section>

      <section className="mt-8">
        <MonthlyFlowCharts />
      </section>

      <section className="mt-8">
        <SpecialDepositsChart />
      </section>
      <br />

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">
            Ringkasan Batch Penitipan
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {batchCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">
            Kapasitas Rak
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {rackCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">
            Stok Aktual Barang
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {itemCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-800">
            Limbah, BBM & Barang Bekas
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {specialDepositCards.map((card) => (
            <StatCard key={card.title} {...card} />
          ))}
        </div>
      </section>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string
  value: number
  icon: React.ElementType
  description: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <h3 className="text-4xl font-bold text-slate-800 mt-2">
            {value.toLocaleString('id-ID')}
          </h3>
        </div>

        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
          <Icon size={24} />
        </div>
      </div>

      <p className="text-sm text-slate-500 mt-4">{description}</p>
    </div>
  )
}
