import { useEffect, useState } from 'react';
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
import { getInventoryChart } from '../../services/inventoryChart';

interface InventoryChartData {
  month: string
  incoming: number
  outgoing: number
}

export default function InventoryChart() {
  const [chartData, setChartData] = useState<InventoryChartData[]>([]);

  useEffect(() => {
    async function load() {
      const result = await getInventoryChart();
      setChartData(result);
    }

    load();
  }, []);

  const filteredChartData = chartData.filter(
    item => item.incoming > 0 || item.outgoing > 0
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        Grafik Barang Masuk & Keluar
      </h3>

      <ResponsiveContainer width="100%" height={350}>
        <LineChart data={filteredChartData}>
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="month" />

          <YAxis />

          <Tooltip />

          <Legend />

          <Line
            type="monotone"
            dataKey="incoming"
            stroke="#2563eb"
            strokeWidth={3}
            name="Barang Masuk"
          />

          <Line
            type="monotone"
            dataKey="outgoing"
            stroke="#ef4444"
            strokeWidth={3}
            name="Barang Keluar"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
