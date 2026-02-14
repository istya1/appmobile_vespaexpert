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

interface VespaSmartDataResponse {
  success: boolean;
  jenis_motor: string;
  gejala_by_kategori: GejalaByKategori;
  total_aturan: number;
}

interface DiagnosisResponse {
  success: boolean;
  jenis_motor: string;
  gejala_dipilih: number;
  hasil_diagnosis: any[];
  total_kerusakan_ditemukan: number;
}

interface RiwayatDiagnosisData {
  jenis_motor: string;
  gejala_terpilih: string[];
  hasil_diagnosis: any[];
}

// Buat instance axios
const api: AxiosInstance = axios.create({
  baseURL: 'http://192.168.1.4:8000/api',
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

// Export default api instance
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
  gejalaTerpilih: string[]
): Promise<DiagnosisResponse> => {
  try {
    const response = await api.post<DiagnosisResponse>('/mobile/proses-diagnosis', {
      jenis_motor: jenisMotor,
      gejala_terpilih: gejalaTerpilih
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const simpanRiwayatDiagnosis = async (data: RiwayatDiagnosisData): Promise<any> => {
  try {
    const response = await api.post('/mobile/diagnosa', data); // ← Ganti dari /diagnosis ke /diagnosa
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getRiwayatDiagnosis = async (userId: number | null = null): Promise<any> => {
  try {
    const params = userId ? { user_id: userId } : {};
    const response = await api.get('/mobile/diagnosa', { params }); // ← Ganti dari /diagnosis ke /diagnosa
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
    const response = await api.get(`/mobile/diagnosa/${id}`); // ← Ganti dari /diagnosis ke /diagnosa
    return response.data;
  } catch (error) {
    throw error;
  }
};