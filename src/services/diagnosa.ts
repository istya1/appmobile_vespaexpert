
import api from './api';  

const DiagnosaService = {
  /**
   * Proses diagnosis (hitung hasil dari gejala)
   */
  async prosesDiagnosis(jenis_motor: string, gejala_terpilih: string[]) {
    const res = await api.post('/mobile/proses-diagnosis', {
      jenis_motor,
      gejala_terpilih,
    });
    return res.data;
  },

  /**
   * Simpan riwayat diagnosis ke backend (pakai DiagnosaController@storeMobile)
   * Endpoint diganti jadi /mobile/diagnosa (atau /diagnosa, tergantung route final)
   */
  async simpanDiagnosisMobile(data: {
    jenis_motor: string;
    gejala_terpilih: string[];
    hasil_diagnosis: any[];           // array hasil dari prosesDiagnosis
    kemungkinan_kerusakan?: any[];    // optional kalau ada
  }) {
    try {
      const res = await api.post('/mobile/diagnosa', data);
      console.log('Simpan riwayat berhasil:', res.data);
      return res.data;
    } catch (error: any) {
      console.error('Gagal simpan riwayat dari mobile:', error.response?.data || error.message);
      throw error;  // biar bisa catch di UI kalau perlu
    }
  },

  /**
   * Ambil riwayat diagnosis milik user yang login
   * Pakai DiagnosaController@indexMobile
   */
 // Di getRiwayatMobile():
async getRiwayatMobile() {
  try {
    const res = await api.get('/mobile/diagnosa');
    console.log('Riwayat mobile:', res.data);
    return res.data.data || res.data || [];  // aman kalau struktur response beda
  } catch (error: any) {
    console.error('Gagal ambil riwayat:', error.response?.data || error);
    return [];
  }
},

async hapusRiwayatDiagnosis(id: number) {
  try {
    const res = await api.delete(`/mobile/diagnosa/${id}`);
    console.log('Hapus riwayat berhasil:', res.data);
    return res.data;
  } catch (error: any) {
    console.error('Gagal hapus riwayat:', error.response?.data || error);
    throw error;
  }
}
};

export default DiagnosaService;