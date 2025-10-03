import httpClient from '@/api/httpClient';
import { StockItem } from '@/types/index';
import { Supplier, StockType, Warehouse } from '@/types/stock';
import { StockMovement } from '../provider/StockBusinessProvider';

// API Endpoints
const ENDPOINTS = {
    STOCKS: '/api/stocks',
    STOCK_MOVEMENTS: '/api/stock-movements',
    SUPPLIERS: '/api/suppliers',
    STOCK_TYPES: '/api/stock-types',
    WAREHOUSES: '/api/warehouses',
} as const;

// Stock API
export const stockApi = {
    // Stock CRUD Operations
    async getStocks(params?: {
        search?: string;
        stockTypeId?: string;
        warehouseId?: string;
        supplierId?: string;
        lowStock?: boolean;
        page?: number;
        limit?: number;
    }) {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.stockTypeId) queryParams.append('stockTypeId', params.stockTypeId);
        if (params?.warehouseId) queryParams.append('warehouseId', params.warehouseId);
        if (params?.supplierId) queryParams.append('supplierId', params.supplierId);
        if (params?.lowStock) queryParams.append('lowStock', 'true');
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        
        const url = queryParams.toString() ? `${ENDPOINTS.STOCKS}?${queryParams}` : ENDPOINTS.STOCKS;
        return httpClient.get<{
            data: StockItem[];
            total: number;
            page: number;
            limit: number;
        }>(url);
    },

    async getStockById(id: string) {
        return httpClient.get<StockItem>(`${ENDPOINTS.STOCKS}/${id}`);
    },

    async createStock(stock: Omit<StockItem, 'id' | 'lastUpdated'>) {
        return httpClient.post<StockItem>(ENDPOINTS.STOCKS, stock);
    },

    async updateStock(id: string, updates: Partial<StockItem>) {
        return httpClient.put<StockItem>(`${ENDPOINTS.STOCKS}/${id}`, updates);
    },

    async deleteStock(id: string) {
        return httpClient.delete(`${ENDPOINTS.STOCKS}/${id}`);
    },

    // Stock Movement Operations
    async addStockMovement(movement: {
        stockId: string;
        type: 'in' | 'out' | 'adjustment';
        quantity: number;
        reason?: string;
        notes?: string;
        supplierId?: string;
        unitPrice?: number;
        totalPrice?: number;
    }) {
        return httpClient.post<StockMovement>(ENDPOINTS.STOCK_MOVEMENTS, movement);
    },

    async getStockMovements(params?: {
        stockId?: string;
        type?: 'in' | 'out' | 'adjustment';
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }) {
        const queryParams = new URLSearchParams();
        if (params?.stockId) queryParams.append('stockId', params.stockId);
        if (params?.type) queryParams.append('type', params.type);
        if (params?.startDate) queryParams.append('startDate', params.startDate);
        if (params?.endDate) queryParams.append('endDate', params.endDate);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        
        const url = queryParams.toString() ? `${ENDPOINTS.STOCK_MOVEMENTS}?${queryParams}` : ENDPOINTS.STOCK_MOVEMENTS;
        return httpClient.get<{
            data: StockMovement[];
            total: number;
            page: number;
            limit: number;
        }>(url);
    },

    // Batch Stock Update
    async batchUpdateStock(updates: Array<{
        id: string;
        quantity: number;
        unitPrice?: number;
        supplierId?: string;
    }>) {
        return httpClient.patch<StockItem[]>(`${ENDPOINTS.STOCKS}/batch`, { updates });
    },

    // Stock Statistics
    async getStockStatistics() {
        return httpClient.get<{
            totalItems: number;
            totalValue: number;
            lowStockItems: number;
            outOfStockItems: number;
            recentMovements: number;
        }>(`${ENDPOINTS.STOCKS}/statistics`);
    },

    // Stock Analytics
    async getStockAnalytics(params?: {
        stockId?: string;
        period?: 'daily' | 'weekly' | 'monthly';
        startDate?: string;
        endDate?: string;
    }) {
        const queryParams = new URLSearchParams();
        if (params?.stockId) queryParams.append('stockId', params.stockId);
        if (params?.period) queryParams.append('period', params.period);
        if (params?.startDate) queryParams.append('startDate', params.startDate);
        if (params?.endDate) queryParams.append('endDate', params.endDate);
        
        const url = queryParams.toString() ? `${ENDPOINTS.STOCKS}/analytics?${queryParams}` : `${ENDPOINTS.STOCKS}/analytics`;
        return httpClient.get<{
            consumptionTrends: Array<{ date: string; quantity: number; value: number }>;
            supplierPerformance: Array<{ supplierId: string; deliveries: number; avgPrice: number }>;
            stockTurnover: Array<{ stockId: string; turnoverRate: number }>;
        }>(url);
    },
};

// Supplier API
export const supplierApi = {
    async getSuppliers(params?: {
        search?: string;
        status?: 'active' | 'inactive';
        category?: string;
    }) {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.category) queryParams.append('category', params.category);
        
        const url = queryParams.toString() ? `${ENDPOINTS.SUPPLIERS}?${queryParams}` : ENDPOINTS.SUPPLIERS;
        return httpClient.get<Supplier[]>(url);
    },

    async getSupplierById(id: string) {
        return httpClient.get<Supplier>(`${ENDPOINTS.SUPPLIERS}/${id}`);
    },

    async createSupplier(supplier: Omit<Supplier, 'id'>) {
        return httpClient.post<Supplier>(ENDPOINTS.SUPPLIERS, supplier);
    },

    async updateSupplier(id: string, updates: Partial<Supplier>) {
        return httpClient.put<Supplier>(`${ENDPOINTS.SUPPLIERS}/${id}`, updates);
    },

    async deleteSupplier(id: string) {
        return httpClient.delete(`${ENDPOINTS.SUPPLIERS}/${id}`);
    },
};

// Stock Type API
export const stockTypeApi = {
    async getStockTypes() {
        return httpClient.get<StockType[]>(ENDPOINTS.STOCK_TYPES);
    },

    async getStockTypeById(id: string) {
        return httpClient.get<StockType>(`${ENDPOINTS.STOCK_TYPES}/${id}`);
    },

    async createStockType(stockType: Omit<StockType, 'id'>) {
        return httpClient.post<StockType>(ENDPOINTS.STOCK_TYPES, stockType);
    },

    async updateStockType(id: string, updates: Partial<StockType>) {
        return httpClient.put<StockType>(`${ENDPOINTS.STOCK_TYPES}/${id}`, updates);
    },

    async deleteStockType(id: string) {
        return httpClient.delete(`${ENDPOINTS.STOCK_TYPES}/${id}`);
    },
};

// Warehouse API
export const warehouseApi = {
    async getWarehouses(params?: {
        search?: string;
        status?: 'active' | 'inactive';
        warehouseType?: string;
    }) {
        const queryParams = new URLSearchParams();
        if (params?.search) queryParams.append('search', params.search);
        if (params?.status) queryParams.append('status', params.status);
        if (params?.warehouseType) queryParams.append('warehouseType', params.warehouseType);
        
        const url = queryParams.toString() ? `${ENDPOINTS.WAREHOUSES}?${queryParams}` : ENDPOINTS.WAREHOUSES;
        return httpClient.get<Warehouse[]>(url);
    },

    async getWarehouseById(id: string) {
        return httpClient.get<Warehouse>(`${ENDPOINTS.WAREHOUSES}/${id}`);
    },

    async createWarehouse(warehouse: Omit<Warehouse, 'id'>) {
        return httpClient.post<Warehouse>(ENDPOINTS.WAREHOUSES, warehouse);
    },

    async updateWarehouse(id: string, updates: Partial<Warehouse>) {
        return httpClient.put<Warehouse>(`${ENDPOINTS.WAREHOUSES}/${id}`, updates);
    },

    async deleteWarehouse(id: string) {
        return httpClient.delete(`${ENDPOINTS.WAREHOUSES}/${id}`);
    },

    async getWarehouseStatistics(id: string) {
        return httpClient.get<{
            totalItems: number;
            totalValue: number;
            utilizationPercentage: number;
            recentActivity: Array<{
                type: 'in' | 'out';
                quantity: number;
                date: string;
            }>;
        }>(`${ENDPOINTS.WAREHOUSES}/${id}/statistics`);
    },
};

// Export all APIs
export const stockBusinessApi = {
    stock: stockApi,
    supplier: supplierApi,
    stockType: stockTypeApi,
    warehouse: warehouseApi,
};

export default stockBusinessApi;
