import api from './api';

export interface VespaPediaItem {
  id: number;
  judul: string;
  jenis_motor: string;
  kategori: string;
  gambar_url?: string | null;
  konten: string;
  urutan: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface VespaPediaDetail {
  jenis_motor: string;
  detail: {
    kategori: string;
    data: VespaPediaItem[];
  }[];
}

class VespaPediaService {
  // Get list vespa (hanya kategori Pengenalan)
  async getList(search?: string): Promise<VespaPediaItem[]> {
    try {
      const params: any = { kategori: 'Pengenalan', status: 'published' };
      if (search) {
        params.search = search;
      }
      const response = await api.get('/vespa-pedia', { params });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching vespa list:', error);
      throw new Error(error.response?.data?.message || 'Gagal mengambil data vespa');
    }
  }

  // Get detail by jenis motor
    async getDetail(jenisMotor: string): Promise<VespaPediaItem[]> {
    try {
      const response = await api.get('/vespa-pedia', {
        params: { 
          jenis_motor: jenisMotor,
          status: 'published'
        }
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching vespa detail:', error);
      throw new Error(error.response?.data?.message || 'Gagal mengambil detail vespa');
    }
  }

  // Get image URL
  getImageUrl(filename: string | null): string | null {
    if (!filename) return null;
    // Sesuaikan dengan base URL Laravel Anda
    return `http://192.168.1.100:8000/storage/vespa-pedia/${filename}`;
  }
}

export default new VespaPediaService();