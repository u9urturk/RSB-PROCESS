import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { StockItem } from '@/types/index';
import { Supplier, StockType, Warehouse } from '@/types/stock';

// Action Types
export enum StockBusinessActionType {
    // Stock Actions
    FETCH_STOCKS_START = 'FETCH_STOCKS_START',
    FETCH_STOCKS_SUCCESS = 'FETCH_STOCKS_SUCCESS',
    FETCH_STOCKS_ERROR = 'FETCH_STOCKS_ERROR',
    
    ADD_STOCK_START = 'ADD_STOCK_START',
    ADD_STOCK_SUCCESS = 'ADD_STOCK_SUCCESS',
    ADD_STOCK_ERROR = 'ADD_STOCK_ERROR',
    
    UPDATE_STOCK_START = 'UPDATE_STOCK_START',
    UPDATE_STOCK_SUCCESS = 'UPDATE_STOCK_SUCCESS',
    UPDATE_STOCK_ERROR = 'UPDATE_STOCK_ERROR',
    
    DELETE_STOCK_START = 'DELETE_STOCK_START',
    DELETE_STOCK_SUCCESS = 'DELETE_STOCK_SUCCESS',
    DELETE_STOCK_ERROR = 'DELETE_STOCK_ERROR',
    
    // Stock Movement Actions
    ADD_STOCK_MOVEMENT_START = 'ADD_STOCK_MOVEMENT_START',
    ADD_STOCK_MOVEMENT_SUCCESS = 'ADD_STOCK_MOVEMENT_SUCCESS',
    ADD_STOCK_MOVEMENT_ERROR = 'ADD_STOCK_MOVEMENT_ERROR',
    
    FETCH_STOCK_MOVEMENTS_START = 'FETCH_STOCK_MOVEMENTS_START',
    FETCH_STOCK_MOVEMENTS_SUCCESS = 'FETCH_STOCK_MOVEMENTS_SUCCESS',
    FETCH_STOCK_MOVEMENTS_ERROR = 'FETCH_STOCK_MOVEMENTS_ERROR',
    
    // Supplier Actions
    FETCH_SUPPLIERS_START = 'FETCH_SUPPLIERS_START',
    FETCH_SUPPLIERS_SUCCESS = 'FETCH_SUPPLIERS_SUCCESS',
    FETCH_SUPPLIERS_ERROR = 'FETCH_SUPPLIERS_ERROR',
    
    // Stock Type Actions
    FETCH_STOCK_TYPES_START = 'FETCH_STOCK_TYPES_START',
    FETCH_STOCK_TYPES_SUCCESS = 'FETCH_STOCK_TYPES_SUCCESS',
    FETCH_STOCK_TYPES_ERROR = 'FETCH_STOCK_TYPES_ERROR',
    
    // Warehouse Actions
    FETCH_WAREHOUSES_START = 'FETCH_WAREHOUSES_START',
    FETCH_WAREHOUSES_SUCCESS = 'FETCH_WAREHOUSES_SUCCESS',
    FETCH_WAREHOUSES_ERROR = 'FETCH_WAREHOUSES_ERROR',
    
    // UI Actions
    SET_LOADING = 'SET_LOADING',
    SET_ERROR = 'SET_ERROR',
    CLEAR_ERROR = 'CLEAR_ERROR',
    SET_SEARCH_FILTER = 'SET_SEARCH_FILTER',
    SET_TYPE_FILTER = 'SET_TYPE_FILTER',
}

// Stock Movement Interface
export interface StockMovement {
    id: string;
    stockId: string;
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    unit: string;
    date: string;
    supplierId?: string;
    userId: string;
    userName: string;
    reason?: string;
    notes?: string;
    unitPrice?: number;
    totalPrice?: number;
}

// State Interface
export interface StockBusinessState {
    // Data
    stocks: StockItem[];
    stockMovements: StockMovement[];
    suppliers: Supplier[];
    stockTypes: StockType[];
    warehouses: Warehouse[];
    
    // Loading States
    loading: {
        stocks: boolean;
        stockMovements: boolean;
        suppliers: boolean;
        stockTypes: boolean;
        warehouses: boolean;
        operation: boolean; // For add/update/delete operations
    };
    
    // Error States
    error: {
        stocks: string | null;
        stockMovements: string | null;
        suppliers: string | null;
        stockTypes: string | null;
        warehouses: string | null;
        operation: string | null;
    };
    
    // Filters
    filters: {
        search: string;
        stockTypeId: string;
        warehouseId: string;
        supplierId: string;
        lowStock: boolean;
    };
    
    // Statistics
    statistics: {
        totalItems: number;
        totalValue: number;
        lowStockItems: number;
        outOfStockItems: number;
    };
}

// Action Interface
export interface StockBusinessAction {
    type: StockBusinessActionType;
    payload?: any;
}

// Initial State
const initialState: StockBusinessState = {
    stocks: [],
    stockMovements: [],
    suppliers: [],
    stockTypes: [],
    warehouses: [],
    
    loading: {
        stocks: false,
        stockMovements: false,
        suppliers: false,
        stockTypes: false,
        warehouses: false,
        operation: false,
    },
    
    error: {
        stocks: null,
        stockMovements: null,
        suppliers: null,
        stockTypes: null,
        warehouses: null,
        operation: null,
    },
    
    filters: {
        search: '',
        stockTypeId: '',
        warehouseId: '',
        supplierId: '',
        lowStock: false,
    },
    
    statistics: {
        totalItems: 0,
        totalValue: 0,
        lowStockItems: 0,
        outOfStockItems: 0,
    },
};

// Reducer Function
function stockBusinessReducer(state: StockBusinessState, action: StockBusinessAction): StockBusinessState {
    switch (action.type) {
        // Stock Actions
        case StockBusinessActionType.FETCH_STOCKS_START:
            return {
                ...state,
                loading: { ...state.loading, stocks: true },
                error: { ...state.error, stocks: null },
            };
            
        case StockBusinessActionType.FETCH_STOCKS_SUCCESS:
            const stocks = action.payload;
            return {
                ...state,
                stocks,
                loading: { ...state.loading, stocks: false },
                error: { ...state.error, stocks: null },
                statistics: {
                    ...state.statistics,
                    totalItems: stocks.length,
                    totalValue: stocks.reduce((sum: number, item: StockItem) => sum + (item.quantity * item.unitPrice), 0),
                    lowStockItems: stocks.filter((item: StockItem) => item.quantity <= item.minQuantity).length,
                    outOfStockItems: stocks.filter((item: StockItem) => item.quantity === 0).length,
                },
            };
            
        case StockBusinessActionType.FETCH_STOCKS_ERROR:
            return {
                ...state,
                loading: { ...state.loading, stocks: false },
                error: { ...state.error, stocks: action.payload },
            };
            
        case StockBusinessActionType.ADD_STOCK_SUCCESS:
            const newStock = action.payload;
            const updatedStocks = [...state.stocks, newStock];
            return {
                ...state,
                stocks: updatedStocks,
                loading: { ...state.loading, operation: false },
                error: { ...state.error, operation: null },
                statistics: {
                    ...state.statistics,
                    totalItems: updatedStocks.length,
                    totalValue: updatedStocks.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
                    lowStockItems: updatedStocks.filter(item => item.quantity <= item.minQuantity).length,
                    outOfStockItems: updatedStocks.filter(item => item.quantity === 0).length,
                },
            };
            
        case StockBusinessActionType.UPDATE_STOCK_SUCCESS:
            const updatedStock = action.payload;
            const stocksAfterUpdate = state.stocks.map(stock => 
                stock.id === updatedStock.id ? updatedStock : stock
            );
            return {
                ...state,
                stocks: stocksAfterUpdate,
                loading: { ...state.loading, operation: false },
                error: { ...state.error, operation: null },
                statistics: {
                    ...state.statistics,
                    totalValue: stocksAfterUpdate.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
                    lowStockItems: stocksAfterUpdate.filter(item => item.quantity <= item.minQuantity).length,
                    outOfStockItems: stocksAfterUpdate.filter(item => item.quantity === 0).length,
                },
            };
            
        case StockBusinessActionType.DELETE_STOCK_SUCCESS:
            const deletedStockId = action.payload;
            const remainingStocks = state.stocks.filter(stock => stock.id !== deletedStockId);
            return {
                ...state,
                stocks: remainingStocks,
                loading: { ...state.loading, operation: false },
                error: { ...state.error, operation: null },
                statistics: {
                    ...state.statistics,
                    totalItems: remainingStocks.length,
                    totalValue: remainingStocks.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
                    lowStockItems: remainingStocks.filter(item => item.quantity <= item.minQuantity).length,
                    outOfStockItems: remainingStocks.filter(item => item.quantity === 0).length,
                },
            };
            
        // Stock Movement Actions
        case StockBusinessActionType.FETCH_STOCK_MOVEMENTS_SUCCESS:
            return {
                ...state,
                stockMovements: action.payload,
                loading: { ...state.loading, stockMovements: false },
                error: { ...state.error, stockMovements: null },
            };
            
        case StockBusinessActionType.ADD_STOCK_MOVEMENT_SUCCESS:
            return {
                ...state,
                stockMovements: [action.payload, ...state.stockMovements],
                loading: { ...state.loading, operation: false },
                error: { ...state.error, operation: null },
            };
            
        // Supplier Actions
        case StockBusinessActionType.FETCH_SUPPLIERS_SUCCESS:
            return {
                ...state,
                suppliers: action.payload,
                loading: { ...state.loading, suppliers: false },
                error: { ...state.error, suppliers: null },
            };
            
        // Stock Type Actions
        case StockBusinessActionType.FETCH_STOCK_TYPES_SUCCESS:
            return {
                ...state,
                stockTypes: action.payload,
                loading: { ...state.loading, stockTypes: false },
                error: { ...state.error, stockTypes: null },
            };
            
        // Warehouse Actions
        case StockBusinessActionType.FETCH_WAREHOUSES_SUCCESS:
            return {
                ...state,
                warehouses: action.payload,
                loading: { ...state.loading, warehouses: false },
                error: { ...state.error, warehouses: null },
            };
            
        // Loading Actions
        case StockBusinessActionType.SET_LOADING:
            return {
                ...state,
                loading: { ...state.loading, operation: action.payload },
            };
            
        // Error Actions
        case StockBusinessActionType.SET_ERROR:
            return {
                ...state,
                error: { ...state.error, operation: action.payload },
                loading: { ...state.loading, operation: false },
            };
            
        case StockBusinessActionType.CLEAR_ERROR:
            return {
                ...state,
                error: {
                    stocks: null,
                    stockMovements: null,
                    suppliers: null,
                    stockTypes: null,
                    warehouses: null,
                    operation: null,
                },
            };
            
        // Filter Actions
        case StockBusinessActionType.SET_SEARCH_FILTER:
            return {
                ...state,
                filters: { ...state.filters, search: action.payload },
            };
            
        case StockBusinessActionType.SET_TYPE_FILTER:
            return {
                ...state,
                filters: { ...state.filters, stockTypeId: action.payload },
            };
            
        default:
            return state;
    }
}

// Context Interface
export interface StockBusinessContextType {
    state: StockBusinessState;
    
    // Stock Operations
    fetchStocks: () => Promise<void>;
    addStock: (stock: Omit<StockItem, 'id' | 'lastUpdated'>) => Promise<void>;
    updateStock: (id: string, updates: Partial<StockItem>) => Promise<void>;
    deleteStock: (id: string) => Promise<void>;
    
    // Stock Movement Operations
    addStockMovement: (movement: Omit<StockMovement, 'id' | 'date'>) => Promise<void>;
    fetchStockMovements: (stockId?: string) => Promise<void>;
    
    // Data Fetching
    fetchSuppliers: () => Promise<void>;
    fetchStockTypes: () => Promise<void>;
    fetchWarehouses: () => Promise<void>;
    
    // Utility Functions
    setSearchFilter: (search: string) => void;
    setTypeFilter: (typeId: string) => void;
    clearError: () => void;
    
    // Computed Properties
    getFilteredStocks: () => StockItem[];
    getStockById: (id: string) => StockItem | undefined;
    getSupplierById: (id: string) => Supplier | undefined;
    getStockTypeById: (id: string) => StockType | undefined;
    getWarehouseById: (id: string) => Warehouse | undefined;
}

// Create Context
const StockBusinessContext = createContext<StockBusinessContextType | undefined>(undefined);

// Provider Props Interface
interface StockBusinessProviderProps {
    children: ReactNode;
}

// Provider Component
export const StockBusinessProvider: React.FC<StockBusinessProviderProps> = ({ children }) => {
    const [state, dispatch] = useReducer(stockBusinessReducer, initialState);
    
    // Stock Operations
    const fetchStocks = async (): Promise<void> => {
        dispatch({ type: StockBusinessActionType.FETCH_STOCKS_START });
        try {
            // TODO: Replace with actual API call
            // const response = await stockApi.getStocks();
            // dispatch({ type: StockBusinessActionType.FETCH_STOCKS_SUCCESS, payload: response.data });
            
            // Mock implementation for now
            setTimeout(() => {
                dispatch({ 
                    type: StockBusinessActionType.FETCH_STOCKS_SUCCESS, 
                    payload: [] // Will be replaced with mock data or API call
                });
            }, 1000);
        } catch (error) {
            dispatch({ 
                type: StockBusinessActionType.FETCH_STOCKS_ERROR, 
                payload: error instanceof Error ? error.message : 'An error occurred'
            });
        }
    };
    
    const addStock = async (stock: Omit<StockItem, 'id' | 'lastUpdated'>): Promise<void> => {
        dispatch({ type: StockBusinessActionType.SET_LOADING, payload: true });
        try {
            // TODO: Replace with actual API call
            // const response = await stockApi.createStock(stock);
            // dispatch({ type: StockBusinessActionType.ADD_STOCK_SUCCESS, payload: response.data });
            
            // Mock implementation
            const newStock: StockItem = {
                ...stock,
                id: Math.random().toString(36).substr(2, 9),
                lastUpdated: new Date().toISOString(),
            };
            
            setTimeout(() => {
                dispatch({ type: StockBusinessActionType.ADD_STOCK_SUCCESS, payload: newStock });
            }, 500);
        } catch (error) {
            dispatch({ 
                type: StockBusinessActionType.SET_ERROR, 
                payload: error instanceof Error ? error.message : 'Failed to add stock'
            });
        }
    };
    
    const updateStock = async (id: string, updates: Partial<StockItem>): Promise<void> => {
        dispatch({ type: StockBusinessActionType.SET_LOADING, payload: true });
        try {
            // TODO: Replace with actual API call
            // const response = await stockApi.updateStock(id, updates);
            // dispatch({ type: StockBusinessActionType.UPDATE_STOCK_SUCCESS, payload: response.data });
            
            // Mock implementation
            const existingStock = state.stocks.find(stock => stock.id === id);
            if (existingStock) {
                const updatedStock: StockItem = {
                    ...existingStock,
                    ...updates,
                    lastUpdated: new Date().toISOString(),
                };
                
                setTimeout(() => {
                    dispatch({ type: StockBusinessActionType.UPDATE_STOCK_SUCCESS, payload: updatedStock });
                }, 500);
            }
        } catch (error) {
            dispatch({ 
                type: StockBusinessActionType.SET_ERROR, 
                payload: error instanceof Error ? error.message : 'Failed to update stock'
            });
        }
    };
    
    const deleteStock = async (id: string): Promise<void> => {
        dispatch({ type: StockBusinessActionType.SET_LOADING, payload: true });
        try {
            // TODO: Replace with actual API call
            // await stockApi.deleteStock(id);
            // dispatch({ type: StockBusinessActionType.DELETE_STOCK_SUCCESS, payload: id });
            
            // Mock implementation
            setTimeout(() => {
                dispatch({ type: StockBusinessActionType.DELETE_STOCK_SUCCESS, payload: id });
            }, 500);
        } catch (error) {
            dispatch({ 
                type: StockBusinessActionType.SET_ERROR, 
                payload: error instanceof Error ? error.message : 'Failed to delete stock'
            });
        }
    };
    
    // Stock Movement Operations
    const addStockMovement = async (movement: Omit<StockMovement, 'id' | 'date'>): Promise<void> => {
        dispatch({ type: StockBusinessActionType.SET_LOADING, payload: true });
        try {
            // TODO: Replace with actual API call
            const newMovement: StockMovement = {
                ...movement,
                id: Math.random().toString(36).substr(2, 9),
                date: new Date().toISOString(),
            };
            
            setTimeout(() => {
                dispatch({ type: StockBusinessActionType.ADD_STOCK_MOVEMENT_SUCCESS, payload: newMovement });
            }, 500);
        } catch (error) {
            dispatch({ 
                type: StockBusinessActionType.SET_ERROR, 
                payload: error instanceof Error ? error.message : 'Failed to add stock movement'
            });
        }
    };
    
    const fetchStockMovements = async (stockId?: string): Promise<void> => {
        dispatch({ type: StockBusinessActionType.FETCH_STOCK_MOVEMENTS_START });
        try {
            // TODO: Replace with actual API call
            // Use stockId parameter in the actual API call
            console.log('Fetching stock movements for stockId:', stockId);
            
            setTimeout(() => {
                dispatch({ 
                    type: StockBusinessActionType.FETCH_STOCK_MOVEMENTS_SUCCESS, 
                    payload: [] // Will be replaced with API call
                });
            }, 1000);
        } catch (error) {
            dispatch({ 
                type: StockBusinessActionType.FETCH_STOCK_MOVEMENTS_ERROR, 
                payload: error instanceof Error ? error.message : 'Failed to fetch stock movements'
            });
        }
    };
    
    // Data Fetching Operations
    const fetchSuppliers = async (): Promise<void> => {
        dispatch({ type: StockBusinessActionType.FETCH_SUPPLIERS_START });
        try {
            // TODO: Replace with actual API call
            setTimeout(() => {
                dispatch({ 
                    type: StockBusinessActionType.FETCH_SUPPLIERS_SUCCESS, 
                    payload: [] // Will be replaced with API call
                });
            }, 1000);
        } catch (error) {
            dispatch({ 
                type: StockBusinessActionType.FETCH_SUPPLIERS_ERROR, 
                payload: error instanceof Error ? error.message : 'Failed to fetch suppliers'
            });
        }
    };
    
    const fetchStockTypes = async (): Promise<void> => {
        dispatch({ type: StockBusinessActionType.FETCH_STOCK_TYPES_START });
        try {
            // TODO: Replace with actual API call
            setTimeout(() => {
                dispatch({ 
                    type: StockBusinessActionType.FETCH_STOCK_TYPES_SUCCESS, 
                    payload: [] // Will be replaced with API call
                });
            }, 1000);
        } catch (error) {
            dispatch({ 
                type: StockBusinessActionType.FETCH_STOCK_TYPES_ERROR, 
                payload: error instanceof Error ? error.message : 'Failed to fetch stock types'
            });
        }
    };
    
    const fetchWarehouses = async (): Promise<void> => {
        dispatch({ type: StockBusinessActionType.FETCH_WAREHOUSES_START });
        try {
            // TODO: Replace with actual API call
            setTimeout(() => {
                dispatch({ 
                    type: StockBusinessActionType.FETCH_WAREHOUSES_SUCCESS, 
                    payload: [] // Will be replaced with API call
                });
            }, 1000);
        } catch (error) {
            dispatch({ 
                type: StockBusinessActionType.FETCH_WAREHOUSES_ERROR, 
                payload: error instanceof Error ? error.message : 'Failed to fetch warehouses'
            });
        }
    };
    
    // Utility Functions
    const setSearchFilter = (search: string): void => {
        dispatch({ type: StockBusinessActionType.SET_SEARCH_FILTER, payload: search });
    };
    
    const setTypeFilter = (typeId: string): void => {
        dispatch({ type: StockBusinessActionType.SET_TYPE_FILTER, payload: typeId });
    };
    
    const clearError = (): void => {
        dispatch({ type: StockBusinessActionType.CLEAR_ERROR });
    };
    
    // Computed Properties
    const getFilteredStocks = (): StockItem[] => {
        return state.stocks.filter(stock => {
            const matchesSearch = !state.filters.search || 
                stock.name.toLowerCase().includes(state.filters.search.toLowerCase()) ||
                stock.barcode?.toLowerCase().includes(state.filters.search.toLowerCase());
                
            const matchesType = !state.filters.stockTypeId || 
                stock.stockTypeId === state.filters.stockTypeId;
                
            const matchesWarehouse = !state.filters.warehouseId || 
                stock.warehouseId === state.filters.warehouseId;
                
            const matchesSupplier = !state.filters.supplierId || 
                stock.supplierId === state.filters.supplierId;
                
            const matchesLowStock = !state.filters.lowStock || 
                stock.quantity <= stock.minQuantity;
                
            return matchesSearch && matchesType && matchesWarehouse && matchesSupplier && matchesLowStock;
        });
    };
    
    const getStockById = (id: string): StockItem | undefined => {
        return state.stocks.find(stock => stock.id === id);
    };
    
    const getSupplierById = (id: string): Supplier | undefined => {
        return state.suppliers.find(supplier => supplier.id === id);
    };
    
    const getStockTypeById = (id: string): StockType | undefined => {
        return state.stockTypes.find(type => type.id === id);
    };
    
    const getWarehouseById = (id: string): Warehouse | undefined => {
        return state.warehouses.find(warehouse => warehouse.id === id);
    };
    
    const contextValue: StockBusinessContextType = {
        state,
        
        // Stock Operations
        fetchStocks,
        addStock,
        updateStock,
        deleteStock,
        
        // Stock Movement Operations
        addStockMovement,
        fetchStockMovements,
        
        // Data Fetching
        fetchSuppliers,
        fetchStockTypes,
        fetchWarehouses,
        
        // Utility Functions
        setSearchFilter,
        setTypeFilter,
        clearError,
        
        // Computed Properties
        getFilteredStocks,
        getStockById,
        getSupplierById,
        getStockTypeById,
        getWarehouseById,
    };
    
    return (
        <StockBusinessContext.Provider value={contextValue}>
            {children}
        </StockBusinessContext.Provider>
    );
};

// Custom Hook
export const useStockBusiness = (): StockBusinessContextType => {
    const context = useContext(StockBusinessContext);
    if (context === undefined) {
        throw new Error('useStockBusiness must be used within a StockBusinessProvider');
    }
    return context;
};

export default StockBusinessProvider;
