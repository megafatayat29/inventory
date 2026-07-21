import { Plus, LayoutList } from 'lucide-react'

type Column = {
  key: string
  label: string
}

type DummyListTableProps = {
  title: string
  addLabel: string
  columns: Column[]
}

export default function DummyListTable({ title, addLabel, columns }: DummyListTableProps) {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
        <p className="text-slate-500 mt-1">
          Halaman ini masih dummy — belum terhubung ke data asli.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <div className="flex items-center gap-2 text-slate-800 font-semibold">
            <LayoutList size={18} className="text-blue-800" />
            {title}
          </div>

          <button
            type="button"
            onClick={() => alert('Fitur ini masih dalam pengembangan.')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white text-sm font-semibold hover:bg-orange-600 transition"
          >
            <Plus size={16} />
            {addLabel}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Tampilkan
            <select disabled className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-slate-50">
              <option>10</option>
            </select>
          </label>

          <input
            type="text"
            placeholder="Cari..."
            disabled
            className="ml-auto border border-slate-300 rounded-lg px-3 py-1.5 text-sm w-48 bg-slate-50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-5 pb-5 border-b border-slate-200">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            Tanggal
            <input type="date" disabled className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-slate-50" />
          </label>
          <span className="text-slate-400">-</span>
          <input type="date" disabled className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-slate-50" />

          <label className="flex items-center gap-2 text-sm text-slate-600">
            Status
            <select disabled className="border border-slate-300 rounded-lg px-2 py-1.5 text-sm bg-slate-50">
              <option>Semua</option>
            </select>
          </label>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border border-slate-200">
            <thead>
              <tr className="bg-slate-100 text-slate-700">
                {columns.map((column) => (
                  <th key={column.key} className="text-left p-3 border border-slate-200 whitespace-nowrap">
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={columns.length} className="text-center p-6 text-slate-400">
                  Kosong
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-sm text-slate-500 mt-4">Menampilkan 0 dari 0 data</p>
      </div>
    </div>
  )
}
