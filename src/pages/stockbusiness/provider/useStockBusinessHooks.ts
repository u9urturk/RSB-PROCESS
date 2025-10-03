import { useCallback } from 'react';
import { useStockBusiness } from './StockBusinessProvider';
import { StockItem } from '@/types/index';

// Hook for Stock Operations
export const useStockOperations = () => {
    const { 
        state, 
        fetchStocks, 
        addStock, 
        updateStock, 
        deleteStock,
        getFilteredStocks,
        getStockById 
    } = useStockBusiness();

    const {
        stocks,
        loading: { stocks: stocksLoading, operation: operationLoading },
        error: { stocks: stocksError, operation: operationError },
        statistics
    } = state;

    // Add stock with validation
    const createStock = useCallback(async (stockData: Omit<StockItem, 'id' | 'lastUpdated'>) => {
        try {
            await addStock(stockData);
            return { success: true, error: null };
        } catch (error) {
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Failed to create stock' 
            };
        }
    }, [addStock]);

    // Update stock with optimistic updates
    const modifyStock = useCallback(async (id: string, updates: Partial<StockItem>) => {
        try {
            await updateStock(id, updates);
            return { success: true, error: null };
        } catch (error) {
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Failed to update stock' 
            };
        }
    }, [updateStock]);

    // Delete stock with confirmation
    const removeStock = useCallback(async (id: string) => {
        try {
            await deleteStock(id);
            return { success: true, error: null };
        } catch (error) {
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Failed to delete stock' 
            };
        }
    }, [deleteStock]);

    // Batch operations
    const bulkUpdateStocks = useCallback(async (updates: Array<{ id: string; updates: Partial<StockItem> }>) => {
        try {
            const results = await Promise.allSettled(
                updates.map(({ id, updates: stockUpdates }) => updateStock(id, stockUpdates))
            );
            
            const failed = results.filter(result => result.status === 'rejected').length;
            const successful = results.length - failed;
            
            return { 
                success: failed === 0, 
                successful, 
                failed, 
                error: failed > 0 ? `${failed} operations failed` : null 
            };
        } catch (error) {
            return { 
                success: false, 
                successful: 0, 
                failed: updates.length, 
                error: error instanceof Error ? error.message : 'Bulk update failed' 
            };
        }
    }, [updateStock]);

    return {
        // Data
        stocks,
        filteredStocks: getFilteredStocks(),
        statistics,
        
        // Loading states
        isLoading: stocksLoading,
        isOperationLoading: operationLoading,
        
        // Error states
        error: stocksError || operationError,
        
        // Operations
        fetchStocks,
        createStock,
        modifyStock,
        removeStock,
        bulkUpdateStocks,
        getStockById,
    };
};

// Hook for Stock Movement Operations
export const useStockMovements = () => {
    const { 
        state, 
        addStockMovement, 
        fetchStockMovements 
    } = useStockBusiness();

    const {
        stockMovements,
        loading: { stockMovements: movementsLoading, operation: operationLoading },
        error: { stockMovements: movementsError, operation: operationError }
    } = state;

    // Add stock movement with stock update
    const createStockMovement = useCallback(async (movementData: {
        stockId: string;
        type: 'in' | 'out' | 'adjustment';
        quantity: number;
        reason?: string;
        notes?: string;
        supplierId?: string;
        unitPrice?: number;
    }) => {
        try {
            await addStockMovement({
                ...movementData,
                unit: 'kg', // This should come from the stock item
                userId: 'current-user-id', // This should come from auth context
                userName: 'Current User', // This should come from auth context
                totalPrice: movementData.unitPrice ? movementData.quantity * movementData.unitPrice : undefined,
            });
            return { success: true, error: null };
        } catch (error) {
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Failed to create stock movement' 
            };
        }
    }, [addStockMovement]);

    // Get movements by stock ID
    const getMovementsByStockId = useCallback((stockId: string) => {
        return stockMovements.filter(movement => movement.stockId === stockId);
    }, [stockMovements]);

    // Get recent movements
    const getRecentMovements = useCallback((limit: number = 10) => {
        return [...stockMovements]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, limit);
    }, [stockMovements]);

    return {
        // Data
        stockMovements,
        
        // Loading states
        isLoading: movementsLoading,
        isOperationLoading: operationLoading,
        
        // Error states
        error: movementsError || operationError,
        
        // Operations
        fetchStockMovements,
        createStockMovement,
        getMovementsByStockId,
        getRecentMovements,
    };
};

// Hook for Supplier Operations
export const useSuppliers = () => {
    const { 
        state, 
        fetchSuppliers,
        getSupplierById 
    } = useStockBusiness();

    const {
        suppliers,
        loading: { suppliers: suppliersLoading },
        error: { suppliers: suppliersError }
    } = state;

    // Get active suppliers
    const getActiveSuppliers = useCallback(() => {
        return suppliers.filter(supplier => supplier.status === 'Aktif');
    }, [suppliers]);

    // Get supplier by category
    const getSuppliersByCategory = useCallback((category: string) => {
        return suppliers.filter(supplier => supplier.category === category);
    }, [suppliers]);

    // Search suppliers
    const searchSuppliers = useCallback((query: string) => {
        const lowercaseQuery = query.toLowerCase();
        return suppliers.filter(supplier => 
            supplier.name.toLowerCase().includes(lowercaseQuery) ||
            supplier.category.toLowerCase().includes(lowercaseQuery) ||
            supplier.contactPerson?.toLowerCase().includes(lowercaseQuery)
        );
    }, [suppliers]);

    return {
        // Data
        suppliers,
        activeSuppliers: getActiveSuppliers(),
        
        // Loading states
        isLoading: suppliersLoading,
        
        // Error states
        error: suppliersError,
        
        // Operations
        fetchSuppliers,
        getSupplierById,
        getSuppliersByCategory,
        searchSuppliers,
    };
};

// Hook for Stock Type Operations
export const useStockTypes = () => {
    const { 
        state, 
        fetchStockTypes,
        getStockTypeById 
    } = useStockBusiness();

    const {
        stockTypes,
        loading: { stockTypes: stockTypesLoading },
        error: { stockTypes: stockTypesError }
    } = state;

    // Get stock type with examples
    const getStockTypeWithExamples = useCallback((id: string) => {
        const stockType = getStockTypeById(id);
        if (!stockType) return null;
        
        return {
            ...stockType,
            stockCount: state.stocks.filter(stock => stock.stockTypeId === id).length
        };
    }, [getStockTypeById, state.stocks]);

    // Get stock types with stock counts
    const getStockTypesWithCounts = useCallback(() => {
        return stockTypes.map(type => ({
            ...type,
            stockCount: state.stocks.filter(stock => stock.stockTypeId === type.id).length
        }));
    }, [stockTypes, state.stocks]);

    return {
        // Data
        stockTypes,
        stockTypesWithCounts: getStockTypesWithCounts(),
        
        // Loading states
        isLoading: stockTypesLoading,
        
        // Error states
        error: stockTypesError,
        
        // Operations
        fetchStockTypes,
        getStockTypeById,
        getStockTypeWithExamples,
    };
};

// Hook for Warehouse Operations
export const useWarehouses = () => {
    const { 
        state, 
        fetchWarehouses,
        getWarehouseById 
    } = useStockBusiness();

    const {
        warehouses,
        loading: { warehouses: warehousesLoading },
        error: { warehouses: warehousesError }
    } = state;

    // Get warehouses with stock counts
    const getWarehousesWithStockCounts = useCallback(() => {
        return warehouses.map(warehouse => ({
            ...warehouse,
            stockCount: state.stocks.filter(stock => stock.warehouseId === warehouse.id).length,
            totalValue: state.stocks
                .filter(stock => stock.warehouseId === warehouse.id)
                .reduce((sum, stock) => sum + (stock.quantity * stock.unitPrice), 0)
        }));
    }, [warehouses, state.stocks]);

    // Get warehouse by type
    const getWarehousesByType = useCallback((type: string) => {
        return warehouses.filter(warehouse => warehouse.warehouseType === type);
    }, [warehouses]);

    // Get active warehouses
    const getActiveWarehouses = useCallback(() => {
        return warehouses.filter(warehouse => warehouse.status === 'Aktif');
    }, [warehouses]);

    return {
        // Data
        warehouses,
        warehousesWithStockCounts: getWarehousesWithStockCounts(),
        activeWarehouses: getActiveWarehouses(),
        
        // Loading states
        isLoading: warehousesLoading,
        
        // Error states
        error: warehousesError,
        
        // Operations
        fetchWarehouses,
        getWarehouseById,
        getWarehousesByType,
    };
};

// Hook for Filters and Search
export const useStockFilters = () => {
    const { 
        state,
        setSearchFilter,
        setTypeFilter,
        getFilteredStocks 
    } = useStockBusiness();

    const { filters } = state;

    // Advanced filtering
    const applyFilters = useCallback((filterOptions: {
        search?: string;
        stockTypeId?: string;
        warehouseId?: string;
        supplierId?: string;
        lowStock?: boolean;
        priceRange?: { min: number; max: number };
        quantityRange?: { min: number; max: number };
    }) => {
        if (filterOptions.search !== undefined) {
            setSearchFilter(filterOptions.search);
        }
        if (filterOptions.stockTypeId !== undefined) {
            setTypeFilter(filterOptions.stockTypeId);
        }
        // Additional filters can be implemented as needed
    }, [setSearchFilter, setTypeFilter]);

    // Clear all filters
    const clearAllFilters = useCallback(() => {
        setSearchFilter('');
        setTypeFilter('');
        // Clear other filters as needed
    }, [setSearchFilter, setTypeFilter]);

    // Get filter summary
    const getFilterSummary = useCallback(() => {
        const activeFilters = [];
        if (filters.search) activeFilters.push(`Search: "${filters.search}"`);
        if (filters.stockTypeId) activeFilters.push(`Type: ${filters.stockTypeId}`);
        if (filters.warehouseId) activeFilters.push(`Warehouse: ${filters.warehouseId}`);
        if (filters.supplierId) activeFilters.push(`Supplier: ${filters.supplierId}`);
        if (filters.lowStock) activeFilters.push('Low Stock Only');
        
        return {
            count: activeFilters.length,
            summary: activeFilters.join(', ') || 'No filters applied'
        };
    }, [filters]);

    return {
        // Current filters
        filters,
        
        // Filtered data
        filteredStocks: getFilteredStocks(),
        
        // Filter operations
        applyFilters,
        clearAllFilters,
        setSearchFilter,
        setTypeFilter,
        
        // Filter metadata
        filterSummary: getFilterSummary(),
    };
};

// Combined hook for full stock business functionality
export const useStockBusinessFull = () => {
    const stockOperations = useStockOperations();
    const stockMovements = useStockMovements();
    const suppliers = useSuppliers();
    const stockTypes = useStockTypes();
    const warehouses = useWarehouses();
    const filters = useStockFilters();
    
    return {
        stocks: stockOperations,
        movements: stockMovements,
        suppliers,
        stockTypes,
        warehouses,
        filters,
    };
};
