// services/api.ts
import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

interface GejalaByKategori {
  [kategori: string]: any[];
}

export interface VespaSmartDataResponse {
  success: boolean;
  jenis_motor: string;
  gejala_by_kategori: {
    [kategori: string]: GejalaDetail[];
  };
  total_aturan: number;
}

export interface GejalaDetail {
  kode_gejala: string;
  nama_gejala: string;
  kategori: string;
  deskripsi?: string;
}

export interface HasilDiagnosisFinal {
  id_aturan: number;
  kode_kerusakan: string;
  nama_kerusakan: string;
  solusi: string;
  persentase_kecocokan: number;
  jumlah_gejala: number;
  status: 'final';
}

export interface AturanKandidat {
 id_aturan: number;
  kode_kerusakan: string;
  nama_kerusakan: string;
  solusi: string;
  kecocokan: {
    persentase: number;
    sudah_cocok: number;
    total_rule: number;
    sisa_konfirmasi: number;
  };
  gejala: {
    sudah_dipilih: GejalaDetail[];
    perlu_dikonfirmasi: GejalaDetail[];
  };
  status: 'kemungkinan';
}

export interface KemungkinanKecil {
  id_aturan: number;
  kode_kerusakan: string;
  nama_kerusakan: string;
  kecocokan: {
    persentase: number;
    sudah_cocok: number;
    total_rule: number;
  };
  status: 'kemungkinan_kecil';
}

export interface DiagnosisResponse {
  success: boolean;
  status_diagnosis: 'selesai' | 'tidak_ditemukan';
  message: string;
  hasil_diagnosis: HasilDiagnosisFinal[];
  kemungkinan_kerusakan: AturanKandidat[]; // ← semua partial masuk sini

}

interface DiagnosisResult {
  id_aturan: number;
  kode_kerusakan: string;
  nama_kerusakan: string;
  solusi: string;
  persentase_kecocokan: number;
  gejala_cocok: number;
  total_gejala_aturan: number;
  gejala_yang_cocok: string[];
  semua_gejala_aturan: string[];
  prioritas: number;
  tingkat_kepastian: string;
}


interface DiagnosisItem {
  id_aturan: number;
  kode_kerusakan: string;
  nama_kerusakan: string;
  solusi: string;
  persentase_kecocokan: number;
}

interface GejalaItem {
  kode_gejala: string;
  nama_gejala: string;
  jenis_motor: string;
  kategori: string;
  deskripsi?: string;
}

interface RiwayatDiagnosisData {
  jenis_motor: string;
  gejala_terpilih: string[];
  hasil_diagnosis: DiagnosisResult[];
}

const api: AxiosInstance = axios.create({
  baseURL: 'http://192.168.1.12:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000,
});

// Interceptor untuk menambahkan token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    console.log("TOKEN:", token); 
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk handle response error
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      console.error('API Error:', error.response.data);
      if (error.response.status === 401) {
        AsyncStorage.removeItem('token');
      }
    } else if (error.request) {
      console.error('Network Error:', error.request);
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;

export const getGejala = async (jenisMotor: string): Promise<any> => {
  try {
    const response = await api.get('/mobile/gejala', {
      params: { jenis_motor: jenisMotor }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getVespaSmartData = async (jenisMotor: string): Promise<VespaSmartDataResponse> => {
  try {
    const response = await api.get<VespaSmartDataResponse>('/mobile/vespa-smart-data', {
      params: { jenis_motor: jenisMotor }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const prosesDiagnosis = async (
  jenisMotor: string,
  gejala: string[]
): Promise<DiagnosisResponse> => {

  if (!jenisMotor) {
    throw new Error('Jenis motor wajib diisi');
  }

  if (!gejala || gejala.length === 0) {
    throw new Error('Minimal satu gejala harus dipilih');
  }

  const response = await api.post('/mobile/proses-diagnosis', {
    jenis_motor: jenisMotor,
    gejala,
  });

  return response.data;
};


export const simpanRiwayatDiagnosis = async (data: RiwayatDiagnosisData): Promise<any> => {
  try {
    const response = await api.post('/mobile/diagnosa', data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getRiwayatDiagnosis = async (userId: number | null = null): Promise<any> => {
  try {
    const params = userId ? { user_id: userId } : {};
    const response = await api.get('/mobile/diagnosa', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDetailKerusakan = async (kodeKerusakan: string): Promise<any> => {
  try {
    const response = await api.get(`/mobile/kerusakan/${kodeKerusakan}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getDetailRiwayatDiagnosis = async (id: string | number): Promise<any> => {
  try {
    const response = await api.get(`/mobile/diagnosa/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }

  
};

export const hapusRiwayatDiagnosis = async (id: string | number): Promise<any> => {
  try {
    const response = await api.delete(`/mobile/diagnosa/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};