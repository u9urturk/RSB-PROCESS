import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '@/api/httpClient';
import { ErrorHandlerService } from '@/utils/ErrorHandlerService';
import { StockItem } from '@/types/index';
import { Supplier, StockType, Warehouse, Unit } from '@/types/stock';
import { StockMovement } from '../provider/StockBusinessProvider';

// Common response wrapper
interface ApiResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

// Paginated response
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ===== STOCK INTERFACES =====
interface StockSearchParams {
  search?: string;
  stockTypeId?: string;
  warehouseId?: string;
  supplierId?: string;
  lowStock?: boolean;
  page?: number;
  limit?: number;
}

interface CreateStockRequest {
  name: string;
  stockTypeId: string;
  unitId: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  unitPrice: number;
  barcode?: string;
  description?: string;
  supplierId?: string;
  warehouseId: string;
  status?: "active" | "inactive";
  notes?: string;
}

interface UpdateStockRequest {
  name?: string;
  stockTypeId?: string;
  unitId?: string;
  quantity?: number;
  minQuantity?: number;
  maxQuantity?: number;
  unitPrice?: number;
  barcode?: string;
  description?: string;
  supplierId?: string;
  warehouseId?: string;
  status?: "active" | "inactive";
  notes?: string;
}

interface StockMovementRequest {
  stockId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason?: string;
  notes?: string;
  supplierId?: string;
  unitPrice?: number;
  totalPrice?: number;
}

interface BatchStockUpdateRequest {
  updates: Array<{
    id: string;
    quantity: number;
    unitPrice?: number;
    supplierId?: string;
  }>;
}

// ===== SUPPLIER INTERFACES =====
interface SupplierSearchParams {
  search?: string;
  status?: 'active' | 'inactive';
  category?: string;
}

interface CreateSupplierRequest {
  name: string;
  category: string;
  phone: string;
  email: string;
  address: string;
  contactPerson: string;
  taxNumber: string;
  paymentTerms: string;
  deliveryTime: number;
  minimumOrder: number;
  products: string[];
  contractStartDate: string;
  contractEndDate: string;
}

// ===== WAREHOUSE INTERFACES =====
interface WarehouseSearchParams {
  search?: string;
  status?: 'active' | 'inactive';
  warehouseType?: string;
}

interface CreateWarehouseRequest {
  name: string;
  location: string;
  warehouseType: string;
  capacity?: number;
  status?: 'active' | 'inactive';
}

// ===== UNIT INTERFACES =====
interface CreateUnitRequest {
  name: string;
  shortName: string;
  category: 'weight' | 'volume' | 'count' | 'package';
  symbol: string;
  description: string;
  conversionFactor?: number;
  baseUnit?: string;
}

// ===== ANALYTICS INTERFACES =====
interface StockAnalyticsParams {
  stockId?: string;
  period?: 'daily' | 'weekly' | 'monthly';
  startDate?: string;
  endDate?: string;
}

interface StockMovementSearchParams {
  stockId?: string;
  type?: 'in' | 'out' | 'adjustment';
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// ===== STOCK API SERVICE =====
class StockApiService {
  private readonly endpoint = '/api/stocks';

  async getStocks(params?: StockSearchParams): Promise<PaginatedResponse<StockItem>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.stockTypeId) queryParams.append('stockTypeId', params.stockTypeId);
      if (params?.warehouseId) queryParams.append('warehouseId', params.warehouseId);
      if (params?.supplierId) queryParams.append('supplierId', params.supplierId);
      if (params?.lowStock) queryParams.append('lowStock', 'true');
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const url = queryParams.toString() ? `${this.endpoint}?${queryParams}` : this.endpoint;
      return await apiGet<PaginatedResponse<StockItem>>(url);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'StockApi.getStocks');
      throw new Error(handledError.userMessage);
    }
  }

  async getStockById(id: string): Promise<StockItem> {
    try {
      return await apiGet<StockItem>(`${this.endpoint}/${id}`);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'StockApi.getStockById');
      throw new Error(handledError.userMessage);
    }
  }

  async createStock(stockData: CreateStockRequest): Promise<StockItem> {
    try {
      return await apiPost<StockItem>(this.endpoint, stockData);
    } catch (error) {
      if (ErrorHandlerService.isConflictError(error)) {
        throw new Error('Stock with this barcode already exists');
      }
      const handledError = ErrorHandlerService.handleError(error, 'StockApi.createStock');
      throw new Error(handledError.userMessage);
    }
  }

  async updateStock(id: string, updates: UpdateStockRequest): Promise<StockItem> {
    try {
      return await apiPut<StockItem>(`${this.endpoint}/${id}`, updates);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'StockApi.updateStock');
      throw new Error(handledError.userMessage);
    }
  }

  async deleteStock(id: string): Promise<void> {
    try {
      await apiDelete(`${this.endpoint}/${id}`);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'StockApi.deleteStock');
      throw new Error(handledError.userMessage);
    }
  }

  async batchUpdateStock(updates: BatchStockUpdateRequest): Promise<StockItem[]> {
    try {
      return await apiPatch<StockItem[]>(`${this.endpoint}/batch`, updates);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'StockApi.batchUpdateStock');
      throw new Error(handledError.userMessage);
    }
  }

  async getStockStatistics(): Promise<{
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    outOfStockItems: number;
    recentMovements: number;
  }> {
    try {
      return await apiGet(`${this.endpoint}/statistics`);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'StockApi.getStockStatistics');
      throw new Error(handledError.userMessage);
    }
  }

  async getStockAnalytics(params?: StockAnalyticsParams): Promise<{
    consumptionTrends: Array<{ date: string; quantity: number; value: number }>;
    supplierPerformance: Array<{ supplierId: string; deliveries: number; avgPrice: number }>;
    stockTurnover: Array<{ stockId: string; turnoverRate: number }>;
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.stockId) queryParams.append('stockId', params.stockId);
      if (params?.period) queryParams.append('period', params.period);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      
      const url = queryParams.toString() ? `${this.endpoint}/analytics?${queryParams}` : `${this.endpoint}/analytics`;
      return await apiGet(url);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'StockApi.getStockAnalytics');
      throw new Error(handledError.userMessage);
    }
  }
}

// ===== STOCK MOVEMENT API SERVICE =====
class StockMovementApiService {
  private readonly endpoint = '/api/stock-movements';

  async addStockMovement(movement: StockMovementRequest): Promise<StockMovement> {
    try {
      return await apiPost<StockMovement>(this.endpoint, movement);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'StockMovementApi.addStockMovement');
      throw new Error(handledError.userMessage);
    }
  }

  async getStockMovements(params?: StockMovementSearchParams): Promise<PaginatedResponse<StockMovement>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.stockId) queryParams.append('stockId', params.stockId);
      if (params?.type) queryParams.append('type', params.type);
      if (params?.startDate) queryParams.append('startDate', params.startDate);
      if (params?.endDate) queryParams.append('endDate', params.endDate);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());
      
      const url = queryParams.toString() ? `${this.endpoint}?${queryParams}` : this.endpoint;
      return await apiGet<PaginatedResponse<StockMovement>>(url);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'StockMovementApi.getStockMovements');
      throw new Error(handledError.userMessage);
    }
  }
}

// ===== SUPPLIER API SERVICE =====
class SupplierApiService {
  private readonly endpoint = '/api/suppliers';

  async getSuppliers(params?: SupplierSearchParams): Promise<Supplier[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.category) queryParams.append('category', params.category);
      
      const url = queryParams.toString() ? `${this.endpoint}?${queryParams}` : this.endpoint;
      return await apiGet<Supplier[]>(url);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'SupplierApi.getSuppliers');
      throw new Error(handledError.userMessage);
    }
  }

  async getSupplierById(id: string): Promise<Supplier> {
    try {
      return await apiGet<Supplier>(`${this.endpoint}/${id}`);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'SupplierApi.getSupplierById');
      throw new Error(handledError.userMessage);
    }
  }

  async createSupplier(supplierData: CreateSupplierRequest): Promise<Supplier> {
    try {
      return await apiPost<Supplier>(this.endpoint, supplierData);
    } catch (error) {
      if (ErrorHandlerService.isConflictError(error)) {
        throw new Error('Supplier with this tax number already exists');
      }
      const handledError = ErrorHandlerService.handleError(error, 'SupplierApi.createSupplier');
      throw new Error(handledError.userMessage);
    }
  }

  async updateSupplier(id: string, updates: Partial<CreateSupplierRequest>): Promise<Supplier> {
    try {
      return await apiPut<Supplier>(`${this.endpoint}/${id}`, updates);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'SupplierApi.updateSupplier');
      throw new Error(handledError.userMessage);
    }
  }

  async deleteSupplier(id: string): Promise<void> {
    try {
      await apiDelete(`${this.endpoint}/${id}`);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'SupplierApi.deleteSupplier');
      throw new Error(handledError.userMessage);
    }
  }
}

// ===== STOCK TYPE API SERVICE =====
class StockTypeApiService {
  private readonly endpoint = '/api/stock-types';

  async getStockTypes(): Promise<StockType[]> {
    try {
      return await apiGet<StockType[]>(this.endpoint);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'StockTypeApi.getStockTypes');
      throw new Error(handledError.userMessage);
    }
  }

  async getStockTypeById(id: string): Promise<StockType> {
    try {
      return await apiGet<StockType>(`${this.endpoint}/${id}`);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'StockTypeApi.getStockTypeById');
      throw new Error(handledError.userMessage);
    }
  }

  async createStockType(stockTypeData: Omit<StockType, 'id'>): Promise<StockType> {
    try {
      return await apiPost<StockType>(this.endpoint, stockTypeData);
    } catch (error) {
      if (ErrorHandlerService.isConflictError(error)) {
        throw new Error('Stock type with this name already exists');
      }
      const handledError = ErrorHandlerService.handleError(error, 'StockTypeApi.createStockType');
      throw new Error(handledError.userMessage);
    }
  }

  async updateStockType(id: string, updates: Partial<Omit<StockType, 'id'>>): Promise<StockType> {
    try {
      return await apiPut<StockType>(`${this.endpoint}/${id}`, updates);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'StockTypeApi.updateStockType');
      throw new Error(handledError.userMessage);
    }
  }

  async deleteStockType(id: string): Promise<void> {
    try {
      await apiDelete(`${this.endpoint}/${id}`);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'StockTypeApi.deleteStockType');
      throw new Error(handledError.userMessage);
    }
  }
}

// ===== WAREHOUSE API SERVICE =====
class WarehouseApiService {
  private readonly endpoint = '/api/warehouses';

  async getWarehouses(params?: WarehouseSearchParams): Promise<Warehouse[]> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append('search', params.search);
      if (params?.status) queryParams.append('status', params.status);
      if (params?.warehouseType) queryParams.append('warehouseType', params.warehouseType);
      
      const url = queryParams.toString() ? `${this.endpoint}?${queryParams}` : this.endpoint;
      return await apiGet<Warehouse[]>(url);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'WarehouseApi.getWarehouses');
      throw new Error(handledError.userMessage);
    }
  }

  async getWarehouseById(id: string): Promise<Warehouse> {
    try {
      return await apiGet<Warehouse>(`${this.endpoint}/${id}`);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'WarehouseApi.getWarehouseById');
      throw new Error(handledError.userMessage);
    }
  }

  async createWarehouse(warehouseData: CreateWarehouseRequest): Promise<Warehouse> {
    try {
      return await apiPost<Warehouse>(this.endpoint, warehouseData);
    } catch (error) {
      if (ErrorHandlerService.isConflictError(error)) {
        throw new Error('Warehouse with this name already exists');
      }
      const handledError = ErrorHandlerService.handleError(error, 'WarehouseApi.createWarehouse');
      throw new Error(handledError.userMessage);
    }
  }

  async updateWarehouse(id: string, updates: Partial<CreateWarehouseRequest>): Promise<Warehouse> {
    try {
      return await apiPut<Warehouse>(`${this.endpoint}/${id}`, updates);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'WarehouseApi.updateWarehouse');
      throw new Error(handledError.userMessage);
    }
  }

  async deleteWarehouse(id: string): Promise<void> {
    try {
      await apiDelete(`${this.endpoint}/${id}`);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'WarehouseApi.deleteWarehouse');
      throw new Error(handledError.userMessage);
    }
  }

  async getWarehouseStatistics(id: string): Promise<{
    totalItems: number;
    totalValue: number;
    utilizationPercentage: number;
    recentActivity: Array<{
      type: 'in' | 'out';
      quantity: number;
      date: string;
    }>;
  }> {
    try {
      return await apiGet(`${this.endpoint}/${id}/statistics`);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'WarehouseApi.getWarehouseStatistics');
      throw new Error(handledError.userMessage);
    }
  }
}

// ===== UNIT API SERVICE =====
class UnitApiService {
  private readonly endpoint = '/api/units';

  async getUnits(): Promise<Unit[]> {
    try {
      return await apiGet<Unit[]>(this.endpoint);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'UnitApi.getUnits');
      throw new Error(handledError.userMessage);
    }
  }

  async getUnitById(id: string): Promise<Unit> {
    try {
      return await apiGet<Unit>(`${this.endpoint}/${id}`);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'UnitApi.getUnitById');
      throw new Error(handledError.userMessage);
    }
  }

  async createUnit(unitData: CreateUnitRequest): Promise<Unit> {
    try {
      return await apiPost<Unit>(this.endpoint, unitData);
    } catch (error) {
      if (ErrorHandlerService.isConflictError(error)) {
        throw new Error('Unit with this name already exists');
      }
      const handledError = ErrorHandlerService.handleError(error, 'UnitApi.createUnit');
      throw new Error(handledError.userMessage);
    }
  }

  async updateUnit(id: string, updates: Partial<CreateUnitRequest>): Promise<Unit> {
    try {
      return await apiPut<Unit>(`${this.endpoint}/${id}`, updates);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'UnitApi.updateUnit');
      throw new Error(handledError.userMessage);
    }
  }

  async deleteUnit(id: string): Promise<void> {
    try {
      await apiDelete(`${this.endpoint}/${id}`);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'UnitApi.deleteUnit');
      throw new Error(handledError.userMessage);
    }
  }

  async getUnitsByCategory(category: 'weight' | 'volume' | 'count' | 'package'): Promise<Unit[]> {
    try {
      return await apiGet<Unit[]>(`${this.endpoint}/category/${category}`);
    } catch (error) {
      const handledError = ErrorHandlerService.handleError(error, 'UnitApi.getUnitsByCategory');
      throw new Error(handledError.userMessage);
    }
  }
}

// ===== SERVICE INSTANCES =====
export const stockApiService = new StockApiService();
export const stockMovementApiService = new StockMovementApiService();
export const supplierApiService = new SupplierApiService();
export const stockTypeApiService = new StockTypeApiService();
export const warehouseApiService = new WarehouseApiService();
export const unitApiService = new UnitApiService();

// ===== MAIN API EXPORT =====
export const stockBusinessApiService = {
  stock: stockApiService,
  stockMovement: stockMovementApiService,
  supplier: supplierApiService,
  stockType: stockTypeApiService,
  warehouse: warehouseApiService,
  unit: unitApiService,
};

export default stockBusinessApiService;

// ===== TYPE EXPORTS =====
export type {
  // Response types
  ApiResponse,
  PaginatedResponse,
  
  // Request types
  StockSearchParams,
  CreateStockRequest,
  UpdateStockRequest,
  StockMovementRequest,
  BatchStockUpdateRequest,
  StockMovementSearchParams,
  StockAnalyticsParams,
  
  SupplierSearchParams,
  CreateSupplierRequest,
  
  WarehouseSearchParams,
  CreateWarehouseRequest,
  
  CreateUnitRequest,
  
  // Entity types
  StockItem,
  StockMovement,
  Supplier,
  StockType,
  Warehouse,
  Unit,
};
