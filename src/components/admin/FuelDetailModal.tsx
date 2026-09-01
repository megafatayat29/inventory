import { useState } from 'react'
import { X, User, Fuel as FuelIcon, FileText } from 'lucide-react'
import {
  getInventoryPhotoUrl,
  getInventoryDocumentUrl,
} from '../../services/photoService'
import type { FuelDeposit } from '../../dto/fuel.dto'

type FuelDetailModalProps = {
  fuel: FuelDeposit | null
  onClose: () => void
}

function formatDate(dateString?: string | null) {
  if (!dateString) return '-'

  return new Date(dateString).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm text-gray-800 mt-0.5 whitespace-pre-wrap">
        {value || '-'}
      </p>
    </div>
  )
}

function PhotoPreview({ path }: { path: string | null }) {
  const [failed, setFailed] = useState(false)

  if (!path) {
    return <p className="text-sm text-gray-500">Tidak ada foto.</p>
  }

  const url = getInventoryPhotoUrl(path)

  if (!url || failed) {
    return (
      <p className="text-sm text-gray-500">
        Foto tidak bisa ditampilkan langsung di sini. Path tersimpan:{' '}
        <span className="font-mono break-all">{path}</span>
      </p>
    )
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer">
      <img
        src={url}
        alt="Foto penitipan BBM/Pelumas"
        className="max-h-72 rounded-md border border-gray-200 object-contain hover:opacity-90 transition"
        onError={() => setFailed(true)}
      />
    </a>
  )
}

function DocumentLink({ path }: { path: string | null }) {
  if (!path) {
    return <p className="text-sm text-gray-500">Tidak ada dokumen pendukung.</p>
  }

  const url = getInventoryDocumentUrl(path)

  if (!url) {
    return (
      <p className="text-sm text-gray-500">
        Dokumen tidak bisa dibuka langsung. Path tersimpan:{' '}
        <span className="font-mono break-all">{path}</span>
      </p>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-blue-700 font-semibold hover:underline"
    >
      <FileText className="w-4 h-4" />
      Lihat Dokumen PDF
    </a>
  )
}

export default function FuelDetailModal({ fuel, onClose }: FuelDetailModalProps) {
  if (!fuel) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-lg overflow-hidden border-t-8 border-blue-800 my-auto">
        <div className="bg-[#1e3a8a] px-6 py-4 text-white flex items-center justify-between">
          <h2 className="text-lg font-bold">Detail BBM/Pelumas</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-blue-100 hover:text-white transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <h3 className="text-base font-semibold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#1e3a8a]" />
              Identitas Penitip
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Nama" value={fuel.depositor_name} />
              <Field label="NIPP" value={fuel.nipp} />
              <Field label="Jabatan" value={fuel.jabatan} />
              <Field label="Unit Kerja" value={fuel.unit_kerja} />
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4 flex items-center gap-2">
              <FuelIcon className="w-5 h-5 text-[#1e3a8a]" />
              Detail BBM/Pelumas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Field label="Unit Pengguna" value={fuel.user_unit} />
              <Field label="Jenis BBM" value={fuel.fuel_type} />
              <Field
                label="Volume"
                value={`${Number(fuel.volume).toLocaleString('id-ID')} Liter`}
              />
              <Field label="Tanggal Penyimpanan" value={formatDate(fuel.storage_date)} />
              <Field label="Dicatat Pada" value={formatDate(fuel.created_at)} />
              <div className="md:col-span-2">
                <Field label="Alasan Titip" value={fuel.reason} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1e3a8a]" />
              Foto Penitipan
            </h3>
            <PhotoPreview path={fuel.photo_path} />
          </div>

          <div>
            <h3 className="text-base font-semibold text-gray-900 border-b-2 border-gray-200 pb-2 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#1e3a8a]" />
              Dokumen Pendukung
            </h3>
            <DocumentLink path={fuel.supporting_document_path} />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#1e3a8a] text-white font-semibold rounded-md hover:bg-blue-800 transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}
