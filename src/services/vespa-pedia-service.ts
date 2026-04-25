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

const BASE_URL = 'https://appraiser-pasty-helpline.ngrok-free.dev';

class VespaPediaService {
  async getList(search?: string): Promise<VespaPediaItem[]> {
    try {
      const params: any = { kategori: 'Pengenalan', status: 'published' };
      if (search) params.search = search;

      const response = await api.get('/vespa-pedia', { params });

      // Normalize gambar_url
      return response.data.map((item: VespaPediaItem) => ({
        ...item,
        gambar_url: this.normalizeImageUrl(item.gambar_url),
      }));
    } catch (error: any) {
      console.error('Error fetching vespa list:', error);
      throw new Error(error.response?.data?.message || 'Gagal mengambil data vespa');
    }
  }

  async getDetail(jenisMotor: string): Promise<VespaPediaItem[]> {
    try {
      const response = await api.get('/vespa-pedia', {
        params: { jenis_motor: jenisMotor, status: 'published' }
      });

      // Normalize gambar_url
      return response.data.map((item: VespaPediaItem) => ({
        ...item,
        gambar_url: this.normalizeImageUrl(item.gambar_url),
      }));
    } catch (error: any) {
      console.error('Error fetching vespa detail:', error);
      throw new Error(error.response?.data?.message || 'Gagal mengambil detail vespa');
    }
  }

  // Normalize URL — handle path relatif maupun full URL
  normalizeImageUrl(url?: string | null): string | null {
    if (!url) return null;
    if (url.startsWith('http')) return url; // sudah full URL
    return `${BASE_URL}/storage/${url}`;    // path relatif → full URL
  }
}


export default new VespaPediaService();