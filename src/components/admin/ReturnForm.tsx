import { useEffect, useState } from 'react'
import Swal from 'sweetalert2'
import { PackageCheck, Search } from 'lucide-react'
import { getStoredDepositRequests } from '../../services/depositService'
import { formatRackLocation } from '../../utils/formatRackLocation'
import type { DepositRequest } from '../../dto/deposit'
import { processItemReturn } from '../../services/returnService'
import { getActivePlacement } from '../../utils/getActivePlacement'
import { uploadInventoryPhoto } from '../../services/photoService'
import PhotoCapturePicker from '../common/PhotoCapturePicker'

export default function ReturnForm() {
  const [deposits, setDeposits] = useState<DepositRequest[]>([])
  const [selectedDepositId, setSelectedDepositId] = useState('')
  const [returnQuantities, setReturnQuantities] = useState<Record<string, number>>({})
  const [returnedByName, setReturnedByName] = useState('')
  const [returnedByNipp, setReturnedByNipp] = useState('')
  const [returnedByUnit, setReturnedByUnit] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [takenPhotoFile, setTakenPhotoFile] = useState<File | null>(null)
  const [remainingPhotoFile, setRemainingPhotoFile] = useState<File | null>(null)

  useEffect(() => {
    fetchDeposits()
  }, [])

  async function fetchDeposits() {
    try {
      setLoading(true)
      const data = await getStoredDepositRequests()
      setDeposits((data ?? []) as unknown as DepositRequest[])
    } catch (error) {
      console.error(error)
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: 'Gagal mengambil data barang tersimpan.',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredDeposits = deposits.filter((deposit) => {
    const keyword = search.toLowerCase()

    return (
      deposit.depositor_name.toLowerCase().includes(keyword) ||
      deposit.nipp.toLowerCase().includes(keyword) ||
      deposit.unit_kerja.toLowerCase().includes(keyword) ||
      deposit.items?.some((item) =>
        item.item_name.toLowerCase().includes(keyword)
      )
    )
  })

  const selectedDeposit = deposits.find(
    (deposit) => deposit.id === selectedDepositId
  )

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!selectedDepositId || !returnedByName || !selectedDeposit) {
      Swal.fire({
        icon: 'warning',
        title: 'Data belum lengkap',
        text: 'Pilih batch penitipan dan isi nama pengambil.',
        confirmButtonColor: '#f97316',
      })
      return
    }

    const itemsToReturn =
      selectedDeposit.items
        .map((item) => ({
          item_id: item.id,
          returned_quantity: returnQuantities[item.id] ?? 0,
        }))
        .filter((item) => item.returned_quantity > 0)

    if (itemsToReturn.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Belum ada barang diambil',
        text: 'Isi minimal satu jumlah barang yang diambil.',
        confirmButtonColor: '#f97316',
      })
      return
    }

    const invalidItem = selectedDeposit.items.find((item) => {
      const returnedQty = returnQuantities[item.id] ?? 0
      return returnedQty < 0 || returnedQty > item.remaining_quantity
    })

    if (invalidItem) {
      Swal.fire({
        icon: 'warning',
        title: 'Jumlah tidak valid',
        text: `Jumlah pengambilan ${invalidItem.item_name} melebihi sisa barang di gudang.`,
        confirmButtonColor: '#f97316',
      })
      return
    }

    const confirmation = await Swal.fire({
      icon: 'question',
      title: 'Konfirmasi Pengambilan',
      text: 'Sisa barang di gudang akan diperbarui. Rak hanya akan kosong jika semua barang dalam batch sudah habis.',
      showCancelButton: true,
      confirmButtonText: 'Ya, proses',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#f97316',
      cancelButtonColor: '#64748b',
    })

    if (!confirmation.isConfirmed) return

    try {
      setSaving(true)

      if (!takenPhotoFile || !remainingPhotoFile) {
        Swal.fire({
          icon: 'warning',
          title: 'Foto belum lengkap',
          text: 'Upload foto barang yang diambil dan foto sisa aktual.',
          confirmButtonColor: '#f97316',
        })
        return
      }

      const takenPhotoPath = await uploadInventoryPhoto(
        takenPhotoFile,
        'return-taken'
      )

      const remainingPhotoPath = await uploadInventoryPhoto(
        remainingPhotoFile,
        'return-remaining'
      )

      await processItemReturn({
        deposit_request_id: selectedDepositId,
        returned_by_name: returnedByName,
        returned_by_nipp: returnedByNipp,
        returned_by_unit: returnedByUnit,
        notes,
        taken_photo_path: takenPhotoPath,
        remaining_photo_path: remainingPhotoPath,
        items: itemsToReturn,
      })

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil!',
        text: 'Pengambilan barang berhasil diproses dan sisa barang di gudang diperbarui.',
        confirmButtonColor: '#f97316',
      })

      setSelectedDepositId('')
      setReturnQuantities({})
      setReturnedByName('')
      setReturnedByNipp('')
      setReturnedByUnit('')
      setNotes('')
      setTakenPhotoFile(null)
      setRemainingPhotoFile(null)

      fetchDeposits()
    } catch (error) {
      console.error(error)

      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: error instanceof Error ? error.message : 'Pengambilan barang gagal diproses.',
        confirmButtonColor: '#ef4444',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <p className="text-slate-500">Loading data pengambilan...</p>
  }

  const placement = getActivePlacement(selectedDeposit?.placements)
  const rackLocation = placement?.rack_locations

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          Form Pengambilan Barang
        </h2>
        <p className="text-slate-500 mt-1">
          Proses pengambilan batch penitipan dari gudang.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-4">
            Pilih Batch Penitipan
          </h3>

          <div className="relative mb-4">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari penitip/barang..."
              className="w-full border border-slate-300 rounded-xl pl-11 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
            {filteredDeposits.length === 0 ? (
              <div className="text-center text-slate-500 py-8">
                Tidak ada barang tersimpan.
              </div>
            ) : (
              filteredDeposits.map((deposit) => {
                const placement = getActivePlacement(deposit.placements)
                const rackLocation = placement?.rack_locations

                return (
                  <button
                    key={deposit.id}
                    onClick={() => {
                      setSelectedDepositId(deposit.id)
                      setReturnedByName(deposit.depositor_name)
                      setReturnedByNipp(deposit.nipp)
                      setReturnedByUnit(deposit.unit_kerja)

                      const initialQuantities: Record<string, number> = {}
                      deposit.items.forEach((item) => {
                        initialQuantities[item.id] = 0
                      })
                      setReturnQuantities(initialQuantities)
                    }}
                    className={[
                      'w-full text-left rounded-2xl border p-4 transition',
                      selectedDepositId === deposit.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-slate-200 bg-white hover:bg-slate-50',
                    ].join(' ')}
                  >
                    <p className="font-bold text-slate-800">
                      {deposit.depositor_name}
                    </p>
                    <p className="text-sm text-slate-500">
                      {deposit.items?.length ?? 0} jenis barang
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      {rackLocation
                        ? formatRackLocation(rackLocation)
                        : 'Lokasi tidak ditemukan'}
                    </p>
                  </button>
                )
              })
            )}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-5">
            <PackageCheck size={22} className="text-blue-700" />
            <h3 className="font-bold text-slate-800">Detail Pengambilan</h3>
          </div>

          {selectedDeposit && (
            <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 mb-5">
              <p className="font-bold text-blue-900">
                {selectedDeposit.depositor_name}
              </p>
              <p className="text-sm text-blue-800 mt-1">
                Lokasi:{' '}
                {rackLocation
                  ? formatRackLocation(rackLocation)
                  : 'Lokasi tidak ditemukan'}
              </p>
              <p className="text-sm text-blue-800">
                Isi: {selectedDeposit.items?.length ?? 0} jenis barang
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-2">
                Nama Pengambil <span className="text-red-500">*</span>
              </label>
              <input
                value={returnedByName}
                onChange={(event) => setReturnedByName(event.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nama pengambil barang"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-2">
                NIPP Pengambil
              </label>
              <input
                value={returnedByNipp}
                onChange={(event) => setReturnedByNipp(event.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="NIPP pengambil"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-2">
                Unit Pengambil
              </label>
              <input
                value={returnedByUnit}
                onChange={(event) => setReturnedByUnit(event.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Unit kerja pengambil"
              />
            </div>

            {selectedDeposit && (
              <div className="md:col-span-2">
                <div className="bg-slate-50 px-5 py-4 border-b border-slate-200">
                  <h4 className="font-bold text-slate-800">Detail Barang Diambil</h4>
                  <p className="text-sm text-slate-500 mt-1">
                    Isi jumlah barang yang diambil. Kosongkan atau isi 0 jika tidak diambil.
                  </p>
                </div>

                <div className="p-4 space-y-4">
                  {selectedDeposit.items.map((item) => {
                    const returnedQty = returnQuantities[item.id] ?? 0
                    const remainingAfter = item.remaining_quantity - returnedQty
                    const isInvalid =
                      returnedQty < 0 || returnedQty > item.remaining_quantity

                    return (
                      <div
                        key={item.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          <div className="flex-1">
                            <h5 className="font-bold text-slate-800">
                              {item.item_name}
                            </h5>
                            <p className="text-sm text-slate-500 mt-1">
                              {item.category || '-'} | {item.procurement_unit}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                              <div className="rounded-xl bg-slate-50 p-3">
                                <p className="text-xs text-slate-500">Jumlah Awal</p>
                                <p className="text-lg font-bold text-slate-800">
                                  {item.quantity}
                                </p>
                              </div>

                              <div className="rounded-xl bg-blue-50 p-3">
                                <p className="text-xs text-blue-600">Sisa di Gudang</p>
                                <p className="text-lg font-bold text-blue-700">
                                  {item.remaining_quantity}
                                </p>
                              </div>

                              <div
                                className={[
                                  'rounded-xl p-3',
                                  remainingAfter < 0
                                    ? 'bg-red-50'
                                    : 'bg-green-50',
                                ].join(' ')}
                              >
                                <p
                                  className={[
                                    'text-xs',
                                    remainingAfter < 0
                                      ? 'text-red-600'
                                      : 'text-green-600',
                                  ].join(' ')}
                                >
                                  Sisa Setelah Diambil
                                </p>
                                <p
                                  className={[
                                    'text-lg font-bold',
                                    remainingAfter < 0
                                      ? 'text-red-700'
                                      : 'text-green-700',
                                  ].join(' ')}
                                >
                                  {remainingAfter}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="w-full lg:w-48">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                              Jumlah Diambil
                            </label>

                            <input
                              type="number"
                              min={0}
                              max={item.remaining_quantity}
                              value={returnedQty}
                              onChange={(event) => {
                                const rawValue = event.target.value
                                const value = rawValue === '' ? 0 : Number(rawValue)

                                setReturnQuantities((prev) => ({
                                  ...prev,
                                  [item.id]: value,
                                }))
                              }}
                              className={[
                                'w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2',
                                isInvalid
                                  ? 'border-red-400 focus:ring-red-400'
                                  : 'border-slate-300 focus:ring-blue-500',
                              ].join(' ')}
                            />

                            {isInvalid && (
                              <p className="text-xs text-red-500 mt-2">
                                Maksimal {item.remaining_quantity}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="md:col-span-2">
              <label className="block font-semibold text-slate-700 mb-2">
                Catatan
              </label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 min-h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Catatan pengambilan barang jika ada"
              />
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              Dokumentasi Pengambilan
            </h3>
            <p className="text-slate-500 mb-4">
              Upload foto barang yang diambil dan foto sisa barang aktual di rak.
            </p>

            <PhotoCapturePicker
              file={takenPhotoFile}
              onChange={setTakenPhotoFile}
              required
            />
            {!takenPhotoFile && (
              <p className="text-sm text-orange-600 mt-2">
                * Foto awal barang wajib diupload sebelum submit.
              </p>
            )}
            
            <PhotoCapturePicker
              file={remainingPhotoFile}
              onChange={setRemainingPhotoFile}
              required
            />
            {!remainingPhotoFile && (
              <p className="text-sm text-orange-600 mt-2">
                * Foto awal barang wajib diupload sebelum submit.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || !selectedDepositId}
            className="mt-5 w-full px-4 py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600 disabled:bg-slate-300 disabled:cursor-not-allowed"
          >
            {saving ? 'Memproses...' : 'Proses Pengambilan Barang'}
          </button>
        </form>
      </div>
    </div>
  )
}