import { Printer, QrCode } from 'lucide-react'
import QRCode from 'react-qr-code'

export default function PublicFormQrPage() {
  const publicFormUrl = `${window.location.origin}/penitipan-barang`

  function handlePrint() {
    window.print()
  }

  return (
    <div className="min-h-screen bg-slate-100 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <div className="print:hidden flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              QR Form Penitipan Barang
            </h2>
            <p className="text-slate-500 mt-1">
              Cetak QR ini dan letakkan di meja admin warehouse.
            </p>
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-white font-semibold hover:bg-orange-600"
          >
            <Printer size={18} />
            Print QR
          </button>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 print:shadow-none print:border-slate-300">
          <div className="border-4 border-blue-800 rounded-3xl p-8">
            <div className="flex items-start justify-between mb-8">
              <div>
                <p className="text-orange-500 font-semibold uppercase tracking-wide">
                  RakFat SIGAPQ
                </p>
                <h1 className="text-3xl font-bold text-slate-800 mt-2">
                  QR Form Penitipan Barang
                </h1>
                <p className="text-slate-500 mt-2">
                  Scan QR ini untuk mengisi form penitipan barang.
                </p>
              </div>

              <QrCode size={40} className="text-blue-800" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-8 items-center">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 w-fit">
                <QRCode
                  value={publicFormUrl}
                  size={220}
                  style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
                />
              </div>

              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">
                  Petunjuk
                </h3>

                <ol className="list-decimal pl-5 text-slate-600 space-y-2">
                  <li>Scan QR code menggunakan kamera HP.</li>
                  <li>Buka link form penitipan barang.</li>
                  <li>Isi identitas dan daftar barang yang dititipkan.</li>
                  <li>Upload foto awal barang.</li>
                  <li>Submit form, lalu serahkan barang ke admin warehouse.</li>
                </ol>

                <div className="mt-6">
                  <p className="text-sm font-semibold text-slate-700 mb-1">
                    Link form:
                  </p>
                  <p className="text-sm break-all text-blue-700">
                    {publicFormUrl}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 border-t border-slate-200 pt-4 text-sm text-slate-500">
              Gudang Logistik Unit Kerja — Sistem RakFat SIGAPQ
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}