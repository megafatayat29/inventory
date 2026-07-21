import DummyListTable from "../common/DummyListTable";

export default function WasteList() {
  return (
    <DummyListTable
      title="Daftar Limbah"
      addLabel="Tambah Limbah"
      columns={[
        { key: 'no', label: 'No.' },
        { key: 'tanggal_masuk', label: 'Tanggal Masuk' },
        { key: 'unit_penghasil', label: 'Unit Penghasil' },
        { key: 'jumlah_armada', label: 'Jumlah Armada' },
        { key: 'jenis_limbah', label: 'Jenis Limbah' },
        { key: 'status', label: 'Status' },
        { key: 'aksi', label: 'Aksi' },
      ]}
    />
  )
}
