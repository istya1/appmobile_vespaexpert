import api from './api'; // sesuaikan dengan nama file api kamu

const DiagnosaService = {

  async prosesDiagnosis(jenis_motor: string, gejala_terpilih: string[]) {
    const res = await api.post('/mobile/proses-diagnosis', {
      jenis_motor,
      gejala_terpilih,
    });
    return res.data;
  },

  async simpanDiagnosisMobile(data: {
    jenis_motor: string;
    gejala_terpilih: string[];
    hasil_diagnosis: any[];
  }) {
    const res = await api.post('/mobile/diagnosa', data);
    return res.data;
  },

};

export default DiagnosaService;