// src/services/bengkel-service.ts
import ApiService from './api';

const BengkelService = {
  getAll: async () => {
    try {
      console.log('=== BengkelService.getAll dipanggil ===');
      const result = await ApiService.get('/bengkel');
      console.log('Bengkel data berhasil:', result);
      return result;
    } catch (error: any) {
      console.error('❌ BengkelService.getAll ERROR:', error.message || error);
      throw error;
    }
  },

  getById: async (id: number) => {
    return await ApiService.get(`/bengkel/${id}`);
  },

  // create, update, delete tetap sama
  create: async (data: FormData) => {
    return await ApiService.post('/bengkel', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  update: async (id: number, data: FormData) => {
    return await ApiService.post(`/bengkel/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  delete: async (id: number) => {
    return await ApiService.delete(`/bengkel/${id}`);
  },
};

export default BengkelService;