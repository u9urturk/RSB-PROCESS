import { apiGet, apiPost, apiPut, apiDelete } from '@/api/httpClient';
import { ErrorHandlerService } from '@/utils/ErrorHandlerService';

// Create Inventory DTO Interface
export interface CreateInventoryDto {
  productId: string;
  warehouseId: string;
  supplierId?: string;
  currentQuantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  unitPrice?: number; // Birim fiyat alanı eklendi
  lastCountedAt?: string; // ISO string format
  expirationDate?: string; // ISO string format
}

// Update Inventory DTO Interface
export interface UpdateInventoryDto {
  productId?: string;
  warehouseId?: string;
  supplierId?: string;
  currentQuantity?: number;
  minStockLevel?: number;
  maxStockLevel?: number;
  unitPrice?: number; // Birim fiyat alanı eklendi
  lastCountedAt?: string; // ISO string format
  expirationDate?: string; // ISO string format
}

// Inventory Response DTO Interface
export interface InventoryResponseDto {
  id: string;
    barcode?: string;
    name: string;
    stockType: string;
    unitType: string;
    quantity: number;
    minQuantity: number;
    maxQuantity: number;
    unitPrice: number;
    totalPrice?: number;
    status?: "active" | "inactive";
    lastUpdated: string;
    supplier?: string;
    warehouse?: string;
    description?: string;
    notes?: string;
    lotNumber?: string;

    productId: string;
    warehouseId: string;
    supplierId?: string;
    categoryId: string;
    stockTypeId: string;
    baseUnitId: string;
}

// Inventory List Response DTO Interface
export interface InventoryListResponseDto {
  success: boolean;
  data: InventoryResponseDto[];
  timestamp: string;
}

// Inventory Single Response DTO Interface
export interface InventorySingleResponseDto {
  success: boolean;
  data: InventoryResponseDto;
  timestamp: string;
}

// Inventory Statistics Interface
export interface InventoryStatsDto {
  totalInventoryItems: number;
  lowStockItems: number;
  overStockItems: number;
  expiringSoonItems: number;
  totalValue: number;
  averageStockLevel: number;
  warehouseDistribution: { [warehouseId: string]: number };
  supplierDistribution: { [supplierId: string]: number };
  stockLevelsByCategory: {
    low: number;
    normal: number;
    high: number;
  };
  recentMovements: {
    totalMovements: number;
    inMovements: number;
    outMovements: number;
    adjustments: number;
  };
}

// API Functions
export const inventoryApi = {
  /**
   * Get all inventory records
   * GET /inventories
   */
  getAllInventories: async (): Promise<InventoryListResponseDto> => {
    try {
      const response = await apiGet('/inventories');
      console.log('Get all inventories response:', response);
      return response;
    } catch (error) {
      console.error('Get all inventories error:', error);
      ErrorHandlerService.handleError(error, 'InventoryApi.getAllInventories');
      throw error;
    }
  },

  /**
   * Get inventory record by ID
   * GET /inventories/:id
   */
  getInventoryById: async (id: string): Promise<InventorySingleResponseDto> => {
    try {
      const response = await apiGet(`/inventories/${id}`);
      console.log(`Get inventory ${id} response:`, response);
      return response;
    } catch (error) {
      console.error(`Get inventory ${id} error:`, error);
      ErrorHandlerService.handleError(error, 'InventoryApi.getInventoryById');
      throw error;
    }
  },

  /**
   * Create new inventory record
   * POST /inventories
   * Note: Lot number will be auto-generated with format LOT-YYYY-MMDD-XXXX
   */
  createInventory: async (inventoryData: CreateInventoryDto): Promise<InventoryResponseDto> => {
    try {
      const response = await apiPost('/inventories', inventoryData);
      console.log('Create inventory response:', response);
      return response;
    } catch (error) {
      console.error('Create inventory error:', error);
      ErrorHandlerService.handleError(error, 'InventoryApi.createInventory');
      throw error;
    }
  },

  /**
   * Update inventory record
   * PUT /inventories/:id
   */
  updateInventory: async (id: string, inventoryData: UpdateInventoryDto): Promise<InventorySingleResponseDto> => {
    try {
      const response = await apiPut(`/inventories/${id}`, inventoryData);
      console.log(`Update inventory ${id} response:`, response);
      return response;
    } catch (error) {
      console.error(`Update inventory ${id} error:`, error);
      ErrorHandlerService.handleError(error, 'InventoryApi.updateInventory');
      throw error;
    }
  },

  /**
   * Delete inventory record
   * DELETE /inventories/:id
   */
  deleteInventory: async (id: string): Promise<void> => {
    try {
      await apiDelete(`/inventories/${id}`);
      console.log(`Delete inventory ${id} success`);
    } catch (error) {
      console.error(`Delete inventory ${id} error:`, error);
      ErrorHandlerService.handleError(error, 'InventoryApi.deleteInventory');
      throw error;
    }
  },

  /**
   * Get inventories by warehouse
   * GET /inventories?warehouseId=uuid
   */
  getInventoriesByWarehouse: async (warehouseId: string): Promise<InventoryListResponseDto> => {
    try {
      const response = await apiGet(`/inventories?warehouseId=${warehouseId}`);
      console.log(`Get inventories by warehouse ${warehouseId} response:`, response);
      return response;
    } catch (error) {
      console.error(`Get inventories by warehouse ${warehouseId} error:`, error);
      ErrorHandlerService.handleError(error, 'InventoryApi.getInventoriesByWarehouse');
      throw error;
    }
  },

  /**
   * Get inventories by supplier
   * GET /inventories?supplierId=uuid
   */
  getInventoriesBySupplier: async (supplierId: string): Promise<InventoryListResponseDto> => {
    try {
      const response = await apiGet(`/inventories?supplierId=${supplierId}`);
      console.log(`Get inventories by supplier ${supplierId} response:`, response);
      return response;
    } catch (error) {
      console.error(`Get inventories by supplier ${supplierId} error:`, error);
      ErrorHandlerService.handleError(error, 'InventoryApi.getInventoriesBySupplier');
      throw error;
    }
  },

  /**
   * Get inventories by product
   * GET /inventories?productId=uuid
   */
  getInventoriesByProduct: async (productId: string): Promise<InventoryListResponseDto> => {
    try {
      const response = await apiGet(`/inventories?productId=${productId}`);
      console.log(`Get inventories by product ${productId} response:`, response);
      return response;
    } catch (error) {
      console.error(`Get inventories by product ${productId} error:`, error);
      ErrorHandlerService.handleError(error, 'InventoryApi.getInventoriesByProduct');
      throw error;
    }
  },

  /**
   * Get low stock inventories
   * GET /inventories?lowStock=true
   */
  getLowStockInventories: async (): Promise<InventoryListResponseDto> => {
    try {
      const response = await apiGet('/inventories?lowStock=true');
      console.log('Get low stock inventories response:', response);
      return response;
    } catch (error) {
      console.error('Get low stock inventories error:', error);
      ErrorHandlerService.handleError(error, 'InventoryApi.getLowStockInventories');
      throw error;
    }
  },

  /**
   * Get expiring inventories
   * GET /inventories?expiringSoon=true
   */
  getExpiringInventories: async (daysAhead: number = 30): Promise<InventoryListResponseDto> => {
    try {
      const response = await apiGet(`/inventories?expiringSoon=true&days=${daysAhead}`);
      console.log(`Get expiring inventories (${daysAhead} days) response:`, response);
      return response;
    } catch (error) {
      console.error(`Get expiring inventories (${daysAhead} days) error:`, error);
      ErrorHandlerService.handleError(error, 'InventoryApi.getExpiringInventories');
      throw error;
    }
  },

  /**
   * Get inventory by lot number
   * GET /inventories?lotNumber=LOT-YYYY-MMDD-XXXX
   */
  getInventoryByLotNumber: async (lotNumber: string): Promise<InventorySingleResponseDto> => {
    try {
      const response = await apiGet(`/inventories?lotNumber=${encodeURIComponent(lotNumber)}`);
      console.log(`Get inventory by lot number ${lotNumber} response:`, response);
      return response;
    } catch (error) {
      console.error(`Get inventory by lot number ${lotNumber} error:`, error);
      ErrorHandlerService.handleError(error, 'InventoryApi.getInventoryByLotNumber');
      throw error;
    }
  },

  /**
   * Get inventory statistics
   * GET /inventories/stats
   */
  getInventoryStats: async (): Promise<InventoryStatsDto> => {
    try {
      const response = await apiGet('/inventories/stats');
      console.log('Get inventory stats response:', response);
      return response;
    } catch (error) {
      console.error('Get inventory stats error:', error);
      ErrorHandlerService.handleError(error, 'InventoryApi.getInventoryStats');
      throw error;
    }
  },

  /**
   * Search inventories by product name or lot number
   * GET /inventories?search=query
   */
  searchInventories: async (searchQuery: string): Promise<InventoryListResponseDto> => {
    try {
      const response = await apiGet(`/inventories?search=${encodeURIComponent(searchQuery)}`);
      console.log(`Search inventories "${searchQuery}" response:`, response);
      return response;
    } catch (error) {
      console.error(`Search inventories "${searchQuery}" error:`, error);
      ErrorHandlerService.handleError(error, 'InventoryApi.searchInventories');
      throw error;
    }
  },

  /**
   * Bulk update inventory quantities
   * PUT /inventories/bulk-update
   */
  bulkUpdateInventories: async (updates: Array<{ id: string; currentQuantity: number }>): Promise<InventoryListResponseDto> => {
    try {
      const response = await apiPut('/inventories/bulk-update', { updates });
      console.log('Bulk update inventories response:', response);
      return response;
    } catch (error) {
      console.error('Bulk update inventories error:', error);
      ErrorHandlerService.handleError(error, 'InventoryApi.bulkUpdateInventories');
      throw error;
    }
  }
};

export default inventoryApi;