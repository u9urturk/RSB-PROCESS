import { apiGet, apiPost, apiPut, apiDelete } from '@/api/httpClient';

// Enums based on backend DTOs
export enum WarehouseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE'
}

export enum WarehouseType {
  NORMAL = 'NORMAL',
  COLD = 'COLD',
  FROZEN = 'FROZEN',
  DRY = 'DRY'
}

// Type definitions based on backend DTOs
export interface CreateWarehouseDto {
  name: string; // Depo adı
  location: string; // Depo konumu
  capacity: string; // Depo kapasitesi (örn: "1000 m³")
  capacityPercentage: number; // Kapasite yüzdesi (0-100)
  status: WarehouseStatus; // Depo durumu
  manager: string; // Depo müdürü
  staffCount: number; // Personel sayısı
  area: number; // Depo alanı (m²)
  temperature?: number; // Sıcaklık (°C) - opsiyonel
  warehouseType: WarehouseType; // Depo tipi
  code?: string; // Depo kodu - opsiyonel
  isActive?: boolean; // Aktif durumu - opsiyonel
}

export interface UpdateWarehouseDto {
  name?: string;
  location?: string;
  capacity?: string;
  capacityPercentage?: number;
  status?: WarehouseStatus;
  manager?: string;
  staffCount?: number;
  area?: number;
  temperature?: number;
  warehouseType?: WarehouseType;
  code?: string;
  isActive?: boolean;
}

export interface WarehouseResponseDto {
  id: string;
  name: string;
  location: string;
  capacity: string;
  capacityPercentage: number;
  status: WarehouseStatus;
  manager: string;
  staffCount: number;
  area: number;
  temperature?: number;
  warehouseType: WarehouseType;
  code?: string;
  isActive: boolean;
  createdAt: string; // ISO string format from backend
  updatedAt: string; // ISO string format from backend
}

export interface WarehouseListResponseDto {
  data: WarehouseResponseDto[];
  total: number;
  active: number;
  inactive: number;
  maintenance?: number;
}

export interface WarehouseStatsDto {
  totalWarehouses: number;
  activeWarehouses: number;
  inactiveWarehouses: number;
  maintenanceWarehouses: number;
  totalCapacity: string;
  totalArea: number;
  averageCapacityPercentage: number;
  warehousesByType: {
    normal: number;
    cold: number;
    frozen: number;
    dry: number;
  };
  warehousesByStatus: {
    active: number;
    inactive: number;
    maintenance: number;
  };
}

// API Functions
export const warehouseApi = {
  /**
   * Get all warehouses
   * GET /warehouses
   */
  getAllWarehouses: async (): Promise<WarehouseListResponseDto> => {
    return apiGet<WarehouseListResponseDto>('/warehouses');
  },

  /**
   * Get warehouse statistics
   * GET /warehouses/stats
   */
  getWarehouseStats: async (): Promise<WarehouseStatsDto> => {
    return apiGet<WarehouseStatsDto>('/warehouses/stats');
  },

  /**
   * Get warehouses by status
   * GET /warehouses/by-status?status=ACTIVE
   */
  getWarehousesByStatus: async (status: WarehouseStatus): Promise<WarehouseResponseDto[]> => {
    return apiGet<WarehouseResponseDto[]>(`/warehouses/by-status?status=${status}`);
  },

  /**
   * Get warehouses by type
   * GET /warehouses/by-type?type=NORMAL
   */
  getWarehousesByType: async (type: WarehouseType): Promise<WarehouseResponseDto[]> => {
    return apiGet<WarehouseResponseDto[]>(`/warehouses/by-type?type=${type}`);
  },

  /**
   * Get warehouse by ID
   * GET /warehouses/:id
   */
  getWarehouseById: async (id: string): Promise<WarehouseResponseDto> => {
    return apiGet<WarehouseResponseDto>(`/warehouses/${id}`);
  },

  /**
   * Create new warehouse
   * POST /warehouses
   */
  createWarehouse: async (dto: CreateWarehouseDto): Promise<WarehouseResponseDto> => {
    return apiPost<WarehouseResponseDto>('/warehouses', dto);
  },

  /**
   * Update warehouse
   * PUT /warehouses/:id
   */
  updateWarehouse: async (id: string, dto: UpdateWarehouseDto): Promise<WarehouseResponseDto> => {
    return apiPut<WarehouseResponseDto>(`/warehouses/${id}`, dto);
  },

  /**
   * Delete warehouse
   * DELETE /warehouses/:id
   */
  deleteWarehouse: async (id: string): Promise<void> => {
    return apiDelete<void>(`/warehouses/${id}`);
  }
};

export default warehouseApi;