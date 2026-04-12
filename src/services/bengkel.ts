// src/services/bengkel-service.ts
import ApiService from './api';

const BengkelService = {
  // GET ALL
  getAll: async () => {
    try {
      const response = await ApiService.get('/bengkel');
      return response.data; // ⬅️ penting!
    } catch (error: any) {
      console.error('❌ getAll Bengkel ERROR:', error?.response?.data || error.message);
      throw error;
    }
  },

  // GET BY ID
  getById: async (id: number) => {
    try {
      const response = await ApiService.get(`/bengkel/${id}`);
      return response.data; // ⬅️ penting!
    } catch (error: any) {
      console.error('❌ getById Bengkel ERROR:', error?.response?.data || error.message);
      throw error;
    }
  },

  // CREATE
  create: async (data: FormData) => {
    try {
      const response = await ApiService.post('/bengkel', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ create Bengkel ERROR:', error?.response?.data || error.message);
      throw error;
    }
  },

  // UPDATE (Laravel biasanya pakai POST + _method PUT)
  update: async (id: number, data: FormData) => {
    try {
      data.append('_method', 'PUT'); // ⬅️ penting untuk Laravel
      const response = await ApiService.post(`/bengkel/${id}`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      console.error('❌ update Bengkel ERROR:', error?.response?.data || error.message);
      throw error;
    }
  },

  // DELETE
  delete: async (id: number) => {
    try {
      const response = await ApiService.delete(`/bengkel/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('❌ delete Bengkel ERROR:', error?.response?.data || error.message);
      throw error;
    }
  },
};

export default BengkelService;