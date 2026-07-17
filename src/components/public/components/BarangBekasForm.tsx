import PhotoCapturePicker from "../../common/PhotoCapturePicker"

type Props = {

  data:{
    entryDate:string
    producingUnit:string
  }

  onChange:(field:string,value:string)=>void

  photo:File|null

  setPhoto:(file:File|null)=>void

}

export default function BarangBekasForm({

data,
onChange,
photo,
setPhoto

}:Props){

return(

<div className="space-y-6">

<h2 className="text-lg font-semibold border-b pb-2">
Barang Bekas
</h2>

<div className="grid md:grid-cols-2 gap-5">

<div>

<label className="block text-sm font-medium mb-1">
Tanggal Masuk
</label>

<input
type="date"
value={data.entryDate}
onChange={(e)=>onChange("entryDate",e.target.value)}
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

</div>
  <div>
    <h3 className="font-semibold mb-2">
      Foto Barang
    </h3>

    <PhotoCapturePicker
      file={photo}
      onChange={setPhoto}
      required
    />
  </div>
</div>
)}