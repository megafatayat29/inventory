import DummyListTable from "../common/DummyListTable";

export default function FuelList() {
  return (
    <DummyListTable
      title="Daftar Penyimpanan BBM & Pelumas"
      addLabel="Tambah Penyimpanan BBM"
      columns={[
        { key: 'no', label: 'No.' },
        { key: 'tanggal_penyimpanan', label: 'Tanggal Penyimpanan' },
        { key: 'unit_pengguna', label: 'Unit Pengguna' },
        { key: 'jenis_bbm', label: 'Jenis BBM' },
        { key: 'volume', label: 'Volume' },
        { key: 'foto', label: 'Foto' },
        { key: 'berkas_pendukung', label: 'Berkas Pendukung' },
        { key: 'lokasi_penyimpanan', label: 'Lokasi Penyimpanan' },
        { key: 'status', label: 'Status' },
        { key: 'aktor', label: 'Aktor' },
        { key: 'aksi', label: 'Aksi' },
      ]}
    />
  )
}
