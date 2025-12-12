import { apiGet, apiPost, apiPut, apiDelete } from '@/api/httpClient';

// Enums based on backend DTOs
export enum SupplierStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING'
}

// Type definitions based on backend DTOs
export interface CreateSupplierDto {
  name: string; // Tedarikçi adı
  category: string; // Tedarikçi kategorisi
  phone: string; // Telefon numarası
  email: string; // E-posta adresi
  rating: number; // Değerlendirme puanı (0-5)
  status: SupplierStatus; // Tedarikçi durumu
  address: string; // Adres
  contactPerson: string; // İletişim kişisi
  taxNumber: string; // Vergi numarası
  paymentTerms: string; // Ödeme koşulları
  deliveryTime: number; // Teslimat süresi (gün)
  minimumOrder: number; // Minimum sipariş tutarı (TL)
  products: string[]; // Ürün listesi
  contractStartDate?: string; // Sözleşme başlangıç tarihi (ISO 8601)
  contractEndDate?: string; // Sözleşme bitiş tarihi (ISO 8601)
  contactInfo?: string; // Legacy field
  leadTimeDays?: number; // Legacy field
  isActive?: boolean; // Legacy field
}

export interface UpdateSupplierDto {
  name?: string;
  category?: string;
  phone?: string;
  email?: string;
  rating?: number;
  status?: SupplierStatus;
  address?: string;
  contactPerson?: string;
  taxNumber?: string;
  paymentTerms?: string;
  deliveryTime?: number;
  minimumOrder?: number;
  products?: string[];
  contractStartDate?: string;
  contractEndDate?: string;
  contactInfo?: string;
  leadTimeDays?: number;
  isActive?: boolean;
}

export interface SupplierResponseDto {
  id: string;
  name: string;
  category: string;
  phone: string;
  email: string;
  rating: number;
  status: SupplierStatus;
  address: string;
  contactPerson: string;
  taxNumber: string;
  paymentTerms: string;
  deliveryTime: number;
  minimumOrder: string; // Backend'den string olarak geliyor
  products: string[];
  contractStartDate?: string;
  contractEndDate?: string;
  totalOrders: number;
  monthlyDeliveries: number;
  contactInfo?: string;
  leadTimeDays?: number;
  isActive: boolean;
  createdAt: string; // ISO string format from backend
  updatedAt: string; // ISO string format from backend
  stockItems?: any[]; // Relations from backend
  inventories?: any[]; // Relations from backend
}

export interface SupplierListResponseDto {
  success: boolean;
  data: SupplierResponseDto[];
  timestamp: string;
}

export interface SupplierSingleResponseDto {
  success: boolean;
  data: SupplierResponseDto;
  timestamp: string;
}

export interface SupplierStatsDto {
  totalSuppliers: number;
  activeSuppliers: number;
  inactiveSuppliers: number;
  pendingSuppliers: number;
  averageRating: number;
  suppliersByCategory: { [key: string]: number };
  suppliersByStatus: {
    active: number;
    inactive: number;
    pending: number;
  };
  topSuppliers: SupplierResponseDto[];
  monthlyStats: {
    totalOrders: number;
    totalDeliveries: number;
    averageDeliveryTime: number;
  };
}

// API Functions
export const supplierApi = {
  /**
   * Get all suppliers
   * GET /suppliers
   */
  getAllSuppliers: async (): Promise<SupplierListResponseDto> => {
    try {
      const response = await apiGet('/suppliers');
      return response;
    } catch (error) {
      console.error('Get all suppliers error:', error);
      throw error;
    }
  },

  /**
   * Get supplier by ID
   * GET /suppliers/:id
   */
  getSupplierById: async (id: string): Promise<SupplierSingleResponseDto> => {
    try {
      const response = await apiGet(`/suppliers/${id}`);
      return response;
    } catch (error) {
      console.error(`Get supplier ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Create new supplier
   * POST /suppliers
   */
  createSupplier: async (supplierData: CreateSupplierDto): Promise<SupplierSingleResponseDto> => {
    try {
      const response = await apiPost('/suppliers', supplierData);
      const res:SupplierSingleResponseDto = {
        data:response,
        success:true,
        timestamp:new Date().getDate().toString()
      }
      // console.log(res)
      return res; // Return the full response with { success, data, timestamp }
    } catch (error) {
      console.error('Create supplier error:', error);
      throw error;
    }
  },

  /**
   * Update supplier
   * PUT /suppliers/:id
   */
  updateSupplier: async (id: string, supplierData: UpdateSupplierDto): Promise<SupplierSingleResponseDto> => {
    try {
      const response = await apiPut(`/suppliers/${id}`, supplierData);
      return response; // Return the full response with { success, data, timestamp }
    } catch (error) {
      console.error(`Update supplier ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Delete supplier
   * DELETE /suppliers/:id
   */
  deleteSupplier: async (id: string): Promise<void> => {
    try {
      await apiDelete(`/suppliers/${id}`);
    } catch (error) {
      console.error(`Delete supplier ${id} error:`, error);
      throw error;
    }
  },

  /**
   * Get supplier statistics
   * GET /suppliers/stats
   */
  getSupplierStats: async (): Promise<SupplierStatsDto> => {
    try {
      const response = await apiGet('/suppliers/stats');
      return response.data;
    } catch (error) {
      console.error('Get supplier stats error:', error);
      throw error;
    }
  },

  /**
   * Get suppliers by status
   * GET /suppliers/by-status?status=ACTIVE|INACTIVE|PENDING
   */
  getSuppliersByStatus: async (status: SupplierStatus): Promise<SupplierListResponseDto> => {
    try {
      const response = await apiGet(`/suppliers/by-status?status=${status}`);
      return response;
    } catch (error) {
      console.error(`Get suppliers by status ${status} error:`, error);
      throw error;
    }
  },

  /**
   * Get suppliers by category
   * GET /suppliers/by-category?category=categoryName
   */
  getSuppliersByCategory: async (category: string): Promise<SupplierListResponseDto> => {
    try {
      const response = await apiGet(`/suppliers/by-category?category=${encodeURIComponent(category)}`);
      return response;
    } catch (error) {
      console.error(`Get suppliers by category ${category} error:`, error);
      throw error;
    }
  },

  /**
   * Increment supplier total orders
   * PUT /suppliers/:id/increment-orders
   */
  incrementSupplierOrders: async (id: string): Promise<SupplierResponseDto> => {
    try {
      const response = await apiPut(`/suppliers/${id}/increment-orders`, {});
      return response.data;
    } catch (error) {
      console.error(`Increment supplier ${id} orders error:`, error);
      throw error;
    }
  },

  /**
   * Update monthly deliveries
   * PUT /suppliers/:id/monthly-deliveries?count=number
   */
  updateMonthlyDeliveries: async (id: string, count: number): Promise<SupplierResponseDto> => {
    try {
      const response = await apiPut(`/suppliers/${id}/monthly-deliveries?count=${count}`, {});
      return response.data;
    } catch (error) {
      console.error(`Update supplier ${id} monthly deliveries error:`, error);
      throw error;
    }
  }
};

export default supplierApi;