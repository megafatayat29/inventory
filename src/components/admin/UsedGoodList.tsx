import DummyListTable from "../common/DummyListTable";

export default function UsedGoodsList() {
  return (
    <DummyListTable
      title="Daftar Penyimpanan Barang Bekas"
      addLabel="Tambah Penyimpanan Barang Bekas"
      columns={[
        { key: 'no', label: 'No.' },
        { key: 'tanggal_masuk', label: 'Tanggal Masuk' },
        { key: 'unit_penghasil', label: 'Unit Penghasil' },
        { key: 'jumlah_armada', label: 'Jumlah Armada' },
        { key: 'status', label: 'Status' },
        { key: 'aksi', label: 'Aksi' },
      ]}
    />
  )
}