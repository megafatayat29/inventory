import PhotoCapturePicker from '../../common/PhotoCapturePicker'

type Props = {
  data: {
    storageDate: string
    producingUnit: string
    wasteType: string
  }

  onChange: (field: string, value: string) => void

  photo: File | null

  setPhoto: (file: File | null) => void
}

export default function LimbahForm({
  data,
  onChange,
  photo,
  setPhoto,
}: Props) {
  return (
    <div className="space-y-6">

      <h2 className="text-lg font-semibold border-b pb-2">
        Data Limbah
      </h2>

      <div className="grid md:grid-cols-2 gap-5">

        <div>
          <label className="block text-sm font-medium mb-1">
            Tanggal Penyimpanan
          </label>

          <input
            type="date"
            value={data.storageDate}
            onChange={(e)=>onChange("storageDate",e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Unit Penghasil
          </label>

          <input
            value={data.producingUnit}
            onChange={(e)=>onChange("producingUnit",e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          />
        </div>

        <div className="md:col-span-2">

          <label className="block text-sm font-medium mb-1">
            Jenis Limbah
          </label>

          <select
            value={data.wasteType}
            onChange={(e)=>onChange("wasteType",e.target.value)}
            className="w-full border rounded-md px-3 py-2"
          >
            <option value="">Pilih Jenis Limbah</option>
            <option>B3</option>
            <option>Non B3</option>
            <option>Elektronik</option>
            <option>Oli Bekas</option>
            <option>Lainnya</option>
          </select>

        </div>

      </div>

      <div>

        <h3 className="font-semibold mb-2">
          Foto Limbah
        </h3>

        <PhotoCapturePicker
          file={photo}
          onChange={setPhoto}
          required
        />

      </div>

    </div>
  )
}