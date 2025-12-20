import { apiGet, apiPost, apiPut, apiDelete } from '@/api/httpClient';
import { ErrorHandlerService } from '@/utils/ErrorHandlerService';

  // Check Product Exists DTO Interface
export interface CheckProductExistsDto {
  productName?: string;
  barcode?: string;
}

// Create Inventory DTO Interface (Parent Inventory)
export interface CreateInventoryDto {
  productId: string;
  minStockLevel: number;
  maxStockLevel: number;
  lastCountedAt?: string; // ISO string format
  expirationDate?: string; // ISO string format
  desc?: string; // Additional notes
}

// Update Inventory DTO Interface
export interface UpdateInventoryDto {
  productId?: string;
  minStockLevel?: number;
  maxStockLevel?: number;
  lastCountedAt?: string; // ISO string format
  expirationDate?: string; // ISO string format
  desc?: string;
}

// Create Sub-Inventory DTO Interface (Batch/Lot)
export interface CreateSubInventoryDto {
  inventoryId: string; // Parent inventory ID
  barcode: string;
  warehouseId: string;
  supplierId?: string;
  quantity: number;
  unitPrice: number;
  expirationDate?: string; // ISO string format
  desc?: string; // Additional notes
}

// Update Sub-Inventory DTO Interface
export interface UpdateSubInventoryDto {
  inventoryId?: string;
  warehouseId?: string;
  supplierId?: string;
  quantity?: number;
  unitPrice?: number;
  expirationDate?: string;
  desc?: string;
}

// Stock Adjustment DTO Interface
export enum AdjustmentType {
  ADD = 'ADD',
  SUBTRACT = 'SUBTRACT',
}

export interface StockAdjustmentDto {
  subInventoryId: string;
  type: AdjustmentType;
  quantity: number;
}

// Quick Add Inventory DTO Interface (combines Product + Inventory + SubInventory)
export interface QuickAddInventoryDto {
  // Product Information
  productName: string;              // Required - Product name (min: 1 character)
  categoryId?: string;              // Required if new product
  baseUnitId?: string;              // Required if new product
  stockTypeId?: string;             // Required if new product
  productDescription?: string;      // Optional
  barcode?: string;                 // Optional - for barcode scanning

  // Inventory Settings
  minStockLevel: number;            // Required - Min stock level (>= 0)
  maxStockLevel: number;            // Required - Max stock level (>= minStockLevel)
  inventoryDesc?: string;           // Optional
  lastCountedAt?: string;           // Optional

  // Batch Information (SubInventory)
  quantity: number;                 // Required - Quantity (> 0)
  unitPrice: number;                // Required - Unit price (> 0)
  supplierId: string;               // Required - Supplier UUID
  warehouseId: string;              // Required - Warehouse UUID
  expirationDate?: string;          // Optional - ISO 8601 date
  subInventoryDesc?: string;        // Optional - Batch notes
}

// Quick Add Response Interface
// Quick Add Response Interface
export interface QuickAddResponseDto {
  message: string;
  isNewProduct: boolean;
  isNewInventory: boolean;
  inventory: {
    id: string;
    productId: string;
    totalQuantity: number;
    minStockLevel: number;
    maxStockLevel: number;
    desc?: string;
    lastCountedAt?: string;

  };
  addedBatch: {
    id: string;
    quantity: number;
    unitPrice: number;
    supplierId: string;
    warehouseId: string;
    expirationDate?: string;
    desc?: string;

  };
}

// Search Inventory Response Interface
export interface SearchInventoryResponseDto {
  success: boolean;
  data: Array<{
    productId: string;
    productName: string;
    barcode?: string;
    inventory: {
      id: string;
      totalQuantity: number;
      minStockLevel: number;
    } | null;
  }>;
  timestamp: string;
}

// Inventory Response DTO Interface
export interface InventoryResponseDto {
  id: string;
  productId: string;
  barcode?: string;
  name: string;
  stockType: string;
  unitType: string;
  totalQuantity: number; // Total across all sub-inventories
  minStockLevel: number;
  maxStockLevel: number;
  averageUnitPrice?: number; // Calculated from sub-inventories
  totalValue?: number; // Calculated total value
  status?: "active" | "inactive" | "low_stock" | "overstock";
  lastCountedAt?: string;
  expirationDate?: string;
  desc?: string;
  categoryId: string;
  stockTypeId: string;
  baseUnitId: string;
  subInventories?: SubInventoryResponseDto[]; // Child batches
  createdAt: string;
  updatedAt: string;
}

// Inventory Summary Item Interface (from backend /summary/all endpoint)
export interface InventorySummaryItem {
  inventoryId: string;
  productId: string;
  productName: string;
  barcode: string | null;
  minStock: number;
  averagePrice: number;
  lastCountedAt: string | null;
  totalStock: number;
  stockStatus: "LOW_STOCK" | "NORMAL" | "OVERSTOCKED";
  batchCount: number;
  category: {
    id: string;
    name: string;
  };
  baseUnit: {
    id: string;
    name: string;
    symbol: string | null;
  };
  stockType: {
    id: string;
    name: string;
    icon: string;
  };
}

// Inventory Summary Response Interface
export interface InventorySummaryResponseDto {
  total: number;
  lowStockCount: number;
  normalStockCount: number;
  overstockedCount: number;
  totalInventoryValue: number;
  items: InventorySummaryItem[];
}

export interface InventorySummaryStats {
  total: number;
  lowStockCount: number;
  normalStockCount: number;
  overstockedCount: number;
  totalInventoryValue: number;
}

// Sub-Inventory Response DTO Interface
export interface SubInventoryResponseDto {
  id: string;
  inventoryId: string; // Parent inventory ID
  warehouseId: string;
  warehouseName?: string;
  supplierId?: string;
  supplierName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number; // quantity * unitPrice
  expirationDate?: string;
  desc?: string;
  createdAt: string;
  updatedAt: string;
}

// Inventory Statistics Interface
export interface InventoryStatsDto {
  totalQuantity: number;
  totalValue: number;
  averageUnitPrice: number;
  numberOfBatches: number;
  stockStatus: "low_stock" | "normal" | "overstock";
  warehouseDistribution: { [warehouseId: string]: number };
  supplierDistribution: { [supplierId: string]: number };
}

// Low Stock Item Interface
export interface LowStockItemDto {
  inventoryId: string;
  productId: string;
  productName: string;
  totalQuantity: number;
  minStockLevel: number;
  shortage: number; // minStockLevel - totalQuantity
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

// Sub-Inventory List Response DTO Interface
export interface SubInventoryListResponseDto {
  success: boolean;
  data: SubInventoryResponseDto[];
  timestamp: string;
}

// Sub-Inventory Single Response DTO Interface
export interface SubInventorySingleResponseDto {
  success: boolean;
  data: SubInventoryResponseDto;
  timestamp: string;
}

// Low Stock Response DTO Interface
export interface LowStockResponseDto {
  success: boolean;
  data: LowStockItemDto[];
  timestamp: string;
}

// API Functions
export const inventoryApi = {
  // ==================== INVENTORY ENDPOINTS ====================

  /**
   * Create new inventory (parent)
   * POST inventory
   */
  createInventory: async (inventoryData: CreateInventoryDto): Promise<InventoryResponseDto> => {
    try {
      const response = await apiPost('inventory', inventoryData);
      // console.log('Create inventory response:', response);
      return response;
    } catch (error) {
      console.error('Create inventory error:', error);
      ErrorHandlerService.handleError(error, 'InventoryApi.createInventory');
      throw error;
    }
  },

  /**
   * Get all inventory records
   * GET inventory
   */
  getAllInventories: async (): Promise<InventoryListResponseDto> => {
    try {
      const response = await apiGet('inventory');
      // console.log('Get all inventories response:', response);
      return response;
    } catch (error) {
      // console.error('Get all inventories error:', error);
      ErrorHandlerService.handleError(error, 'InventoryApi.getAllInventories');
      throw error;
    }
  },

  getSummaryAll: async (): Promise<InventorySummaryResponseDto> => {
    try {
      const response = await apiGet('inventory/summary/all');
      console.log('Get all inventories response:', response.items);
      return response;
    } catch (error) {
      // console.error('Get all inventories error:', error);
      ErrorHandlerService.handleError(error, 'InventoryApi.getSummaryAll');
      throw error;
    }
  },

  /**
   * Get inventory record by ID
   * GET inventory/:id
   */
  getInventoryById: async (id: string): Promise<InventorySingleResponseDto> => {
    try {
      const response = await apiGet(`inventory/${id}`);
      // console.log(`Get inventory ${id} response:`, response);
      return response;
    } catch (error) {
      console.error(`Get inventory ${id} error:`, error);
      ErrorHandlerService.handleError(error, 'InventoryApi.getInventoryById');
      throw error;
    }
  },

  /**
   * Get inventory by product ID
   * GET inventory/product/:productId
   */
  getInventoryByProductId: async (productId: string): Promise<InventorySingleResponseDto> => {
    try {
      const response = await apiGet(`inventory/product/${productId}`);
      // console.log(`Get inventory for product ${productId} response:`, response);
      return response;
    } catch (error) {
      console.error(`Get inventory for product ${productId} error:`, error);
      ErrorHandlerService.handleError(error, 'InventoryApi.getInventoryByProductId');
      throw error;
    }
  },

  /**
   * Update inventory record
   * PUT inventory/:id
   */
  updateInventory: async (id: string, inventoryData: UpdateInventoryDto): Promise<InventorySingleResponseDto> => {
    try {
      const response = await apiPut(`inventory/${id}`, inventoryData);
      // console.log(`Update inventory ${id} response:`, response);
      return response;
    } catch (error) {
      console.error(`Update inventory ${id} error:`, error);
      ErrorHandlerService.handleError(error, 'InventoryApi.updateInventory');
      throw error;
    }
  },

  /**
   * Delete inventory record
   * DELETE inventory/:id
   */
  deleteInventory: async (id: string): Promise<void> => {
    try {
      await apiDelete(`inventory/${id}`);
      // console.log(`Delete inventory ${id} success`);
    } catch (error) {
      console.error(`Delete inventory ${id} error:`, error);
      ErrorHandlerService.handleError(error, 'InventoryApi.deleteInventory');
      throw error;
    }
  },

  /**
   * Get inventory statistics
   * GET inventory/:id/stats
   */
  getInventoryStats: async (id: string): Promise<InventoryStatsDto> => {
    try {
      const response = await apiGet(`inventory/${id}/stats`);
      // console.log(`Get inventory ${id} stats response:`, response);
      return response;
    } catch (error) {
      // console.error(`Get inventory ${id} stats error:`, error);
      ErrorHandlerService.handleError(error, 'InventoryApi.getInventoryStats');
      throw error;
    }
  },

  // ==================== SUB-INVENTORY ENDPOINTS ====================

  /**
   * Create sub-inventory (batch/lot)
   * POST inventory/sub
   */
  createSubInventory: async (subInventoryData: CreateSubInventoryDto): Promise<SubInventoryResponseDto> => {
    try {
      const response = await apiPost('inventory/sub', subInventoryData);
      // console.log('Create sub-inventory response:', response);
      return response;
    } catch (error) {
      console.error('Create sub-inventory error:', error);
      ErrorHandlerService.handleError(error, 'InventoryApi.createSubInventory');
      throw error;
    }
  },

  /**
   * Get all sub-inventories
   * GET inventory/sub/all?inventoryId=xxx
   */
  getAllSubInventories: async (inventoryId?: string): Promise<SubInventoryListResponseDto> => {
    try {
      const url = inventoryId
        ? `inventory/sub/all?inventoryId=${inventoryId}`
        : 'inventory/sub/all';
      const response = await apiGet(url);
      // console.log('Get all sub-inventories response:', response);
      return response;
    } catch (error) {
      console.error('Get all sub-inventories error:', error);
      ErrorHandlerService.handleError(error, 'InventoryApi.getAllSubInventories');
      throw error;
    }
  },

  /**
   * Get sub-inventory by ID
   * GET inventory/sub/:id
   */
  getSubInventoryById: async (id: string): Promise<SubInventorySingleResponseDto> => {
    try {
      const response = await apiGet(`inventory/sub/${id}`);
      // console.log(`Get sub-inventory ${id} response:`, response);
      return response;
    } catch (error) {
      console.error(`Get sub-inventory ${id} error:`, error);
      ErrorHandlerService.handleError(error, 'InventoryApi.getSubInventoryById');
      throw error;
    }
  },

  /**
   * Update sub-inventory
   * PUT inventory/sub/:id
   */
  updateSubInventory: async (id: string, subInventoryData: UpdateSubInventoryDto): Promise<SubInventorySingleResponseDto> => {
    try {
      const response = await apiPut(`inventory/sub/${id}`, subInventoryData);
      // console.log(`Update sub-inventory ${id} response:`, response);
      return response;
    } catch (error) {
      console.error(`Update sub-inventory ${id} error:`, error);
      ErrorHandlerService.handleError(error, 'InventoryApi.updateSubInventory');
      throw error;
    }
  },

  /**
   * Delete sub-inventory
   * DELETE inventory/sub/:id
   */
  deleteSubInventory: async (id: string): Promise<void> => {
    try {
      await apiDelete(`inventory/sub/${id}`);
      // console.log(`Delete sub-inventory ${id} success`);
    } catch (error) {
      console.error(`Delete sub-inventory ${id} error:`, error);
      ErrorHandlerService.handleError(error, 'InventoryApi.deleteSubInventory');
      throw error;
    }
  },

  // ==================== STOCK OPERATIONS ====================

  /**
   * Adjust stock quantity (add or subtract)
   * POST inventory/adjust
   */
  adjustStock: async (adjustmentData: StockAdjustmentDto): Promise<SubInventorySingleResponseDto> => {
    try {
      const response = await apiPost('inventory/adjust', adjustmentData);
      // console.log('Adjust stock response:', response);
      return response;
    } catch (error) {
      console.error('Adjust stock error:', error);
      ErrorHandlerService.handleError(error, 'InventoryApi.adjustStock');
      throw error;
    }
  },

  /**
   * Get low stock items report
   * GET inventory/reports/low-stock?threshold=xxx
   */
  getLowStockItems: async (threshold?: number): Promise<LowStockResponseDto> => {
    try {
      const url = threshold
        ? `inventory/reports/low-stock?threshold=${threshold}`
        : 'inventory/reports/low-stock';
      const response = await apiGet(url);
      // console.log('Get low stock items response:', response);
      return response;
    } catch (error) {
      console.error('Get low stock items error:', error);
      ErrorHandlerService.handleError(error, 'InventoryApi.getLowStockItems');
      throw error;
    }
  },

  // ==================== LEGACY/COMPATIBILITY METHODS ====================
  // Keep for backward compatibility with existing code

  /**
   * @deprecated Use getInventoryByProductId instead
   * Get inventories by warehouse
   */
  getInventoriesByWarehouse: async (warehouseId: string): Promise<SubInventoryListResponseDto> => {
    console.warn('getInventoriesByWarehouse is deprecated. Consider using getAllSubInventories with filter.');
    try {
      const response = await apiGet(`inventory/sub/all`);
      // Filter by warehouse on client side if needed
      if (response.data) {
        response.data = response.data.filter((item: SubInventoryResponseDto) => item.warehouseId === warehouseId);
      }
      return response;
    } catch (error) {
      console.error(`Get inventories by warehouse ${warehouseId} error:`, error);
      ErrorHandlerService.handleError(error, 'InventoryApi.getInventoriesByWarehouse');
      throw error;
    }
  },

  /**
   * @deprecated Use getAllSubInventories with filter instead
   * Get inventories by supplier
   */
  getInventoriesBySupplier: async (supplierId: string): Promise<SubInventoryListResponseDto> => {
    console.warn('getInventoriesBySupplier is deprecated. Consider using getAllSubInventories with filter.');
    try {
      const response = await apiGet(`inventory/sub/all`);
      // Filter by supplier on client side if needed
      if (response.data) {
        response.data = response.data.filter((item: SubInventoryResponseDto) => item.supplierId === supplierId);
      }
      return response;
    } catch (error) {
      console.error(`Get inventories by supplier ${supplierId} error:`, error);
      ErrorHandlerService.handleError(error, 'InventoryApi.getInventoriesBySupplier');
      throw error;
    }
  },

  /**
   * @deprecated Use getInventoryByProductId instead
   */
  getInventoriesByProduct: async (productId: string): Promise<InventorySingleResponseDto> => {
    console.warn('getInventoriesByProduct is deprecated. Use getInventoryByProductId instead.');
    return inventoryApi.getInventoryByProductId(productId);
  },

  /**
   * @deprecated Use getLowStockItems instead
   */
  getLowStockInventories: async (): Promise<LowStockResponseDto> => {
    console.warn('getLowStockInventories is deprecated. Use getLowStockItems instead.');
    return inventoryApi.getLowStockItems();
  },

  /**
   * @deprecated Sub-inventory expiration should be checked in getAllSubInventories
   */
  getExpiringInventories: async (daysAhead: number = 30): Promise<SubInventoryListResponseDto> => {
    console.warn('getExpiringInventories is deprecated. Filter sub-inventories by expiration date on client side.');
    try {
      const response = await apiGet(`inventory/sub/all`);
      // Filter by expiration date on client side
      if (response.data) {
        const now = new Date();
        const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
        response.data = response.data.filter((item: SubInventoryResponseDto) => {
          if (!item.expirationDate) return false;
          const expDate = new Date(item.expirationDate);
          return expDate <= futureDate && expDate >= now;
        });
      }
      return response;
    } catch (error) {
      console.error(`Get expiring inventories error:`, error);
      ErrorHandlerService.handleError(error, 'InventoryApi.getExpiringInventories');
      throw error;
    }
  },


  /**
   * @deprecated Use getAllInventories with search on client side
   */
  searchInventories: async (searchQuery: string): Promise<InventoryListResponseDto> => {
    console.warn('searchInventories is deprecated. Use getAllInventories and filter on client side.');
    try {
      const response = await apiGet(`inventory`);
      // Filter on client side
      if (response.data) {
        response.data = response.data.filter((item: InventoryResponseDto) =>
          item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.desc?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      return response;
    } catch (error) {
      console.error(`Search inventories error:`, error);
      ErrorHandlerService.handleError(error, 'InventoryApi.searchInventories');
      throw error;
    }
  },

  /**
   * @deprecated Use adjustStock for individual adjustments
   */
  bulkUpdateInventories: async (updates: Array<{ id: string; currentQuantity: number }>): Promise<SubInventoryListResponseDto> => {
    console.warn('bulkUpdateInventories is deprecated. Use adjustStock for each sub-inventory.');
    try {
      const results: SubInventoryResponseDto[] = [];
      for (const update of updates) {
        try {
          const adjustment: StockAdjustmentDto = {
            subInventoryId: update.id,
            type: AdjustmentType.ADD, // Assume ADD, adjust logic as needed
            quantity: update.currentQuantity
          };
          const result = await inventoryApi.adjustStock(adjustment);
          if (result.data) {
            results.push(result.data);
          }
        } catch (err) {
          console.error(`Failed to update ${update.id}:`, err);
        }
      }
      return {
        success: true,
        data: results,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Bulk update inventories error:', error);
      ErrorHandlerService.handleError(error, 'InventoryApi.bulkUpdateInventories');
      throw error;
    }
  },

  // ==================== QUICK ADD & SEARCH ENDPOINTS ====================

  /**
   * Quick add inventory - Creates product (if new) + inventory + sub-inventory in one call
   * POST inventory/quick-add
   * 
   * This is the most commonly used endpoint for adding stock:
   * - Searches for existing product by name
   * - Creates product if not found
   * - Creates inventory record if not exists
   * - Adds new batch (sub-inventory)
   */
  quickAddInventory: async (data: QuickAddInventoryDto): Promise<QuickAddResponseDto> => {
    try {
      console.log('Quick add inventory request:', data);
      const response = await apiPost('inventory/quick-add', data);
      console.log('Quick add inventory response:', response);
      return response;
    } catch (error: any) {
      console.error('Quick add inventory error:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error response status:', error.response?.status);
      ErrorHandlerService.handleError(error, 'InventoryApi.quickAddInventory');
      throw error;
    }
  },

  /**
   * Search inventory by product name or barcode
   * GET inventory/search?query={searchTerm}
   * 
   * Use this for barcode scanning or product search before adding stock
   */
  searchInventory: async (searchQuery: string): Promise<SearchInventoryResponseDto> => {
    try {
      console.log('Search inventory request:', searchQuery);
      const response = await apiGet(`inventory/search?query=${encodeURIComponent(searchQuery)}`);
      console.log('Search inventory response:', response);
      return response;
    } catch (error) {
      console.error('Search inventory error:', error);
      ErrorHandlerService.handleError(error, 'InventoryApi.searchInventory');
      throw error;
    }
  },




  /**
   * Check if product exists by name or barcode
   * POST inventory/check-product
   * 
   * Use this to verify if a product exists before adding inventory
   * At least one of productName or barcode must be provided
   */
  checkProductExists: async (data: CheckProductExistsDto): Promise<any> => {
    try {
      console.log('Check product exists request:', data);
      const response = await apiPost('inventory/check-product', data);
      console.log('Check product exists response:', response);
      return response;
    } catch (error) {
      console.error('Check product exists error:', error);
      ErrorHandlerService.handleError(error, 'InventoryApi.checkProductExists');
      throw error;
    }
  }

  
};

export default inventoryApi;