import PhotoCapturePicker from "../../common/PhotoCapturePicker"

type Props={

data:{

storageDate:string

usingUnit:string

fuelType:string

volume:string

supportingFile:File|null

}

photo:File|null

setPhoto:(file:File|null)=>void

setSupportingFile:(file:File|null)=>void

onChange:(field:string,value:string)=>void

}

export default function BBMPelumasForm({

data,

photo,

setPhoto,

setSupportingFile,

onChange

}:Props){

return(

<div className="space-y-6">

<h2 className="text-lg font-semibold border-b pb-2">
BBM & Pelumas
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
Unit Pengguna
</label>

<input
value={data.usingUnit}
onChange={(e)=>onChange("usingUnit",e.target.value)}
className="w-full border rounded-md px-3 py-2"
/>

</div>

<div>

<label className="block text-sm font-medium mb-1">
Jenis BBM
</label>

<select
value={data.fuelType}
onChange={(e)=>onChange("fuelType",e.target.value)}
className="w-full border rounded-md px-3 py-2"
>

<option value="">Pilih Jenis</option>

<option>Pertalite</option>

<option>Pertamax</option>

<option>Solar</option>

<option>Dexlite</option>

<option>Oli</option>

<option>Grease</option>

<option>Pelumas</option>

</select>

</div>

<div>

<label className="block text-sm font-medium mb-1">
Volume
</label>

<input
type="number"
value={data.volume}
onChange={(e)=>onChange("volume",e.target.value)}
placeholder="Contoh: 200"
className="w-full border rounded-md px-3 py-2"
/>

</div>

</div>

<div>

<h3 className="font-semibold mb-2">
Foto
</h3>

<PhotoCapturePicker
file={photo}
onChange={setPhoto}
required
 />

</div>

<div>

<label className="block text-sm font-medium mb-2">
Berkas Pendukung
</label>

<input
type="file"
accept=".pdf,.jpg,.jpeg,.png"
onChange={(e)=>{

const file=e.target.files?.[0]??null

setSupportingFile(file)

}}
className="block w-full text-sm border rounded-md p-2"
/>

<p className="text-xs text-slate-500 mt-1">
Opsional: berita acara, dokumen pengiriman, atau dokumen pendukung lainnya.
</p>

</div>

</div>

)

}