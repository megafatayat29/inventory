export const hitungLamaHari = (tanggalMasuk: string | number | Date) => {
  if (!tanggalMasuk) return 0;
  
  const masuk = new Date(tanggalMasuk);
  masuk.setHours(0, 0, 0, 0);
  
  const sekarang = new Date();
  sekarang.setHours(0, 0, 0, 0);
  
  const selisihWaktu = sekarang.getTime() - masuk.getTime();
  const selisihHari = Math.floor(selisihWaktu / (1000 * 3600 * 24));
  
  return selisihHari >= 0 ? selisihHari : 0; // Jika tanggal di masa depan, tampilkan 0
};