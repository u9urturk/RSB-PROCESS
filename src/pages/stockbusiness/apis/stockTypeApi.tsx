import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '@/api/httpClient';

// Type definitions based on backend DTOs
export interface CreateStockTypeDto {
  name: string; // 2-50 karakter arası zorunlu
  description?: string; // 10-500 karakter arası opsiyonel
  color?: string; // Tailwind gradient formatı: "from-color-500 to-color-600"
  icon?: string; // 1-2 karakter emoji opsiyonel
  examples?: string[]; // Örnek ürünler dizisi, her biri 2-50 karakter
}

export interface UpdateStockTypeDto {
  name?: string; // 2-50 karakter arası opsiyonel
  description?: string; // 10-500 karakter arası opsiyonel
  color?: string; // Tailwind gradient formatı: "from-color-500 to-color-600"
  icon?: string; // 1-2 karakter emoji opsiyonel
  examples?: string[]; // Örnek ürünler dizisi, her biri 2-50 karakter
}

export interface StockTypeResponseDto {
  id: string;
  name: string;
  description?: string;
  color?: string; // Tailwind gradient class
  icon?: string; // Emoji icon
  examples?: string[]; // Example products
  isActive: boolean;
  itemCount: number;
  createdAt: string; // ISO string format from backend
  updatedAt: string; // ISO string format from backend
}

export interface StockTypeListResponseDto {
  data: StockTypeResponseDto[];
  total: number;
  activeCount: number;
  inactiveCount: number;
  totalProducts: number;
  averageProductsPerStockType: number;
  mostUsedStockType?: {
    id: string;
    name: string;
    itemCount: number;
  };
  topStockTypes: Array<{
    id: string;
    name: string;
    itemCount: number;
  }>;
  lastUpdated: string; // ISO string format from backend
}

export interface StockTypeStatsDto {
  totalStockTypes: number;
  activeStockTypes: number;
  inactiveStockTypes: number;
  totalProducts: number;
  averageProductsPerStockType: number;
  mostUsedStockType?: {
    id: string;
    name: string;
    itemCount: number;
  };
  topStockTypes: Array<{
    id: string;
    name: string;
    itemCount: number;
  }>;
  lastUpdated: string; // ISO string format from backend
}

// API Functions
export const stockTypeApi = {
  /**
   * Get all stock types with comprehensive analytics
   * GET /stock-types
   */
  getAllStockTypes: async (): Promise<StockTypeListResponseDto> => {
    return apiGet<StockTypeListResponseDto>('/stock-types');
  },

  /**
   * Get stock type analytics and statistics only
   * GET /stock-types/stats
   */
  getStockTypeStats: async (): Promise<StockTypeStatsDto> => {
    return apiGet<StockTypeStatsDto>('/stock-types/stats');
  },

  /**
   * Get only active stock types
   * GET /stock-types/active
   */
  getActiveStockTypes: async (): Promise<StockTypeResponseDto[]> => {
    return apiGet<StockTypeResponseDto[]>('/stock-types/active');
  },

  /**
   * Get stock type by ID with product count
   * GET /stock-types/:id
   */
  getStockTypeById: async (id: string): Promise<StockTypeResponseDto> => {
    return apiGet<StockTypeResponseDto>(`/stock-types/${id}`);
  },

  /**
   * Create new stock type
   * POST /stock-types
   */
  createStockType: async (dto: CreateStockTypeDto): Promise<StockTypeResponseDto> => {
    return apiPost<StockTypeResponseDto>('/stock-types', dto);
  },

  /**
   * Update stock type completely
   * PUT /stock-types/:id
   */
  updateStockType: async (id: string, dto: UpdateStockTypeDto): Promise<StockTypeResponseDto> => {
    return apiPut<StockTypeResponseDto>(`/stock-types/${id}`, dto);
  },

  /**
   * Toggle stock type active/inactive status
   * PATCH /stock-types/:id/toggle-status
   */
  toggleStockTypeStatus: async (id: string): Promise<StockTypeResponseDto> => {
    return apiPatch<StockTypeResponseDto>(`/stock-types/${id}/toggle-status`);
  },

  /**
   * Delete stock type (only if no products assigned)
   * DELETE /stock-types/:id
   */
  deleteStockType: async (id: string): Promise<void> => {
    return apiDelete<void>(`/stock-types/${id}`);
  }
};

export default stockTypeApi;