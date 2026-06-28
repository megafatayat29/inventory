import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, MapPin } from 'lucide-react'
import { getDepositRequestDetail } from '../../services/depositService'
import {
  getEmptyRackLocations,
  placeDepositRequestToRack,
} from '../../services/rackService'
import { formatRackLocation } from '../../utils/formatRackLocation'
import Swal from 'sweetalert2'
import type { DepositDetail } from '../../dto/deposit'
import PhotoCapturePicker from '../common/PhotoCapturePicker';
import { uploadInventoryPhoto } from '../../services/photoService'
import type { RackLocation } from '../../dto/rack.dto'

export default function PlaceDeposit() {
  const { depositRequestId } = useParams()
  const navigate = useNavigate()
  const [placementPhotoFile, setPlacementPhotoFile] = useState<File | null>(null)
  const [deposit, setDeposit] = useState<DepositDetail | null>(null)
  const [locations, setLocations] = useState<RackLocation[]>([])
  const [selectedLocationId, setSelectedLocationId] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchData()
  }, [depositRequestId])

  async function fetchData() {
    if (!depositRequestId) return

    try {
      setLoading(true)

      const [depositData, locationData] = await Promise.all([
        getDepositRequestDetail(depositRequestId),
        getEmptyRackLocations(),
      ])

      setDeposit(depositData as unknown as DepositDetail)
      setLocations((locationData ?? []) as RackLocation[])
    } catch (error) {
      console.error(error)
      alert('Gagal mengambil data penempatan')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit() {
    if (!depositRequestId || !selectedLocationId) {
      Swal.fire({
        icon: 'warning',
        title: 'Lokasi belum dipilih',
        text: 'Pilih lokasi rak terlebih dahulu sebelum menyimpan.',
        confirmButtonText: 'Oke',
        confirmButtonColor: '#f97316',
      })
      return
    }

    try {
      setSaving(true)

      if (!placementPhotoFile) {
        Swal.fire({
          icon: 'warning',
          title: 'Foto wajib diupload',
          text: 'Upload foto barang setelah ditempatkan di rak.',
          confirmButtonColor: '#f97316',
        })
        return
      }

      const placementPhotoPath = await uploadInventoryPhoto(
        placementPhotoFile,
        'placement',
      )

      await placeDepositRequestToRack(
        depositRequestId,
        selectedLocationId,
        placementPhotoPath
      )

      await Swal.fire({
        icon: 'success',
        title: 'Plotting Berhasil!',
        html: `
          <div style="text-align: center">
            <p>Batch penitipan berhasil ditempatkan di:</p>
            <strong style="color:#1e3a8a">${selectedLocation ? formatRackLocation(selectedLocation) : 'Lokasi rak terpilih'}</strong>
          </div>
        `,
        confirmButtonText: 'Kembali ke Incoming',
        confirmButtonColor: '#f97316',
      })

      navigate('/admin/incoming')
    } catch (error) {
      console.error(error)

      Swal.fire({
        icon: 'error',
        title: 'Gagal!',
        text: 'Barang gagal diplot ke rak. Silakan coba lagi.',
        confirmButtonText: 'Oke',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading data plotting...</p>
  }

  if (!deposit) {
    return <p className="text-red-500">Data penitipan tidak ditemukan.</p>
  }

  const selectedLocation = locations.find(
    (location) => location.id === selectedLocationId
  )

  return (
    <div>
      <button
        onClick={() => navigate('/admin/incoming')}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-5"
      >
        <ArrowLeft size={18} />
        Kembali ke Incoming Barang
      </button>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Plot Barang ke Rak</h2>
        <p className="text-slate-500 mt-1">
          Pilih satu slot rak untuk batch penitipan ini.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Detail Penitipan
          </h3>

          <div className="space-y-2 text-sm text-slate-600">
            <p>
              <span className="font-semibold">Nama:</span>{' '}
              {deposit.depositor_name}
            </p>
            <p>
              <span className="font-semibold">NIPP:</span> {deposit.nipp}
            </p>
            <p>
              <span className="font-semibold">Jabatan:</span> {deposit.jabatan}
            </p>
            <p>
              <span className="font-semibold">Unit Kerja:</span>{' '}
              {deposit.unit_kerja}
            </p>
            <p>
              <span className="font-semibold">Status:</span> {deposit.status}
            </p>
          </div>

          <div className="mt-5">
            <h4 className="font-semibold text-slate-800 mb-3">Isi Barang</h4>

            <div className="space-y-3">
              {deposit.items?.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl bg-slate-50 border border-slate-100 p-3"
                >
                  <p className="font-semibold text-slate-800">
                    {item.item_name}
                  </p>
                  <p className="text-sm text-slate-500">
                    Jumlah: {item.quantity} | Kategori: {item.category || '-'}
                  </p>
                  <p className="text-sm text-slate-500">
                    Unit Pengadaan: {item.procurement_unit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4">
            Pilih Lokasi Rak Kosong
          </h3>

          <div className="mb-4">
            <select
              value={selectedLocationId}
              onChange={(event) => setSelectedLocationId(event.target.value)}
              className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Pilih Lokasi Rak --</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {formatRackLocation(location)}
                </option>
              ))}
            </select>
          </div>

          {selectedLocation && (
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 mb-5">
              <div className="flex items-center gap-2 text-blue-700 font-semibold">
                <MapPin size={18} />
                Lokasi Terpilih
              </div>
              <p className="text-blue-900 mt-2">
                {formatRackLocation(selectedLocation)}
              </p>
            </div>
          )}

          <div className="mb-5">
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Foto Barang di Rak
            </h3>
            <p className="text-slate-500 mb-4">
              Upload foto kondisi aktual setelah barang ditempatkan di rak.
            </p>

            <PhotoCapturePicker
              file={placementPhotoFile}
              onChange={setPlacementPhotoFile}
              required
            />
            {!placementPhotoFile && (
              <p className="text-sm text-orange-600 mt-2">
                * Foto awal barang wajib diupload sebelum submit.
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving || !selectedLocationId}
            className="w-full px-4 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {saving ? 'Menyimpan...' : 'Simpan Plotting Rak'}
          </button>
        </div>
      </div>
    </div>
  )
}