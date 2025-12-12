import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import inventoryApi, {
  InventoryResponseDto,
  SubInventoryResponseDto,
  CreateInventoryDto,
  UpdateInventoryDto,
  CreateSubInventoryDto,
  UpdateSubInventoryDto,
  StockAdjustmentDto,
  InventoryStatsDto,
  LowStockItemDto,
  AdjustmentType
} from '../apis/inventoryApi';
import { useNotification } from '@/context/provider/NotificationProvider';

// Context State Interface
interface InventoryContextState {
  // Parent Inventories
  inventories: InventoryResponseDto[];
  selectedInventory: InventoryResponseDto | null;
  
  // Sub-Inventories (Batches)
  subInventories: SubInventoryResponseDto[];
  selectedSubInventory: SubInventoryResponseDto | null;
  
  // Statistics
  stats: InventoryStatsDto | null;
  lowStockItems: LowStockItemDto[];
  
  // Loading States
  loading: boolean;
  loadingSubInventories: boolean;
  loadingStats: boolean;
  
  // CRUD Operations - Parent Inventory
  createInventory: (data: CreateInventoryDto) => Promise<void>;
  updateInventory: (id: string, data: UpdateInventoryDto) => Promise<void>;
  deleteInventory: (id: string) => Promise<void>;
  getInventoryById: (id: string) => Promise<void>;
  getInventoryByProductId: (productId: string) => Promise<void>;
  setSelectedInventory: (inventory: InventoryResponseDto | null) => void;
  
  // CRUD Operations - Sub-Inventory
  createSubInventory: (data: CreateSubInventoryDto) => Promise<void>;
  updateSubInventory: (id: string, data: UpdateSubInventoryDto) => Promise<void>;
  deleteSubInventory: (id: string) => Promise<void>;
  getSubInventoryById: (id: string) => Promise<void>;
  getAllSubInventories: (inventoryId?: string) => Promise<void>;
  setSelectedSubInventory: (subInventory: SubInventoryResponseDto | null) => void;
  
  // Stock Operations
  adjustStock: (data: StockAdjustmentDto) => Promise<void>;
  
  // Reports & Stats
  loadInventoryStats: (id: string) => Promise<void>;
  loadLowStockItems: (threshold?: number) => Promise<void>;
  
  // Utility
  refreshInventories: () => Promise<void>;
  clearSelection: () => void;
}

const InventoryContext = createContext<InventoryContextState | undefined>(undefined);

interface InventoryProviderProps {
  children: ReactNode;
}

export const InventoryProvider: React.FC<InventoryProviderProps> = ({ children }) => {
  const { showNotification } = useNotification();
  
  // State
  const [inventories, setInventories] = useState<InventoryResponseDto[]>([]);
  const [selectedInventory, setSelectedInventory] = useState<InventoryResponseDto | null>(null);
  
  const [subInventories, setSubInventories] = useState<SubInventoryResponseDto[]>([]);
  const [selectedSubInventory, setSelectedSubInventory] = useState<SubInventoryResponseDto | null>(null);
  
  const [stats, setStats] = useState<InventoryStatsDto | null>(null);
  const [lowStockItems, setLowStockItems] = useState<LowStockItemDto[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingSubInventories, setLoadingSubInventories] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);

  // Load all inventories on mount
  useEffect(() => {
    refreshInventories();
  }, []);

  // ==================== PARENT INVENTORY OPERATIONS ====================

  const refreshInventories = useCallback(async () => {
    setLoading(true);
    try {
      const response = await inventoryApi.getAllInventories();
      setInventories(response.data || []);
    } catch (error) {
      showNotification('error', 'Envanter listesi yüklenemedi');
      console.error('Error loading inventories:', error);
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  const createInventory = useCallback(async (data: CreateInventoryDto) => {
    try {
      // Validation
      if (data.maxStockLevel <= data.minStockLevel) {
        throw new Error('Maksimum stok seviyesi minimum stok seviyesinden büyük olmalıdır');
      }

      const newInventory = await inventoryApi.createInventory(data);
      
      setInventories(prev => [...prev, newInventory]);
      showNotification('success', 'Envanter başarıyla oluşturuldu');
      
      return;
    } catch (error: any) {
      showNotification('error', error.message || 'Envanter oluşturulurken hata oluştu');
      throw error;
    }
  }, [showNotification]);

  const updateInventory = useCallback(async (id: string, data: UpdateInventoryDto) => {
    try {
      // Validation
      if (data.maxStockLevel && data.minStockLevel && data.maxStockLevel <= data.minStockLevel) {
        throw new Error('Maksimum stok seviyesi minimum stok seviyesinden büyük olmalıdır');
      }

      const response = await inventoryApi.updateInventory(id, data);
      
      setInventories(prev =>
        prev.map(inv => (inv.id === id ? response.data : inv))
      );
      
      if (selectedInventory?.id === id) {
        setSelectedInventory(response.data);
      }
      
      showNotification('success', 'Envanter başarıyla güncellendi');
    } catch (error: any) {
      showNotification('error', error.message || 'Envanter güncellenirken hata oluştu');
      throw error;
    }
  }, [selectedInventory, showNotification]);

  const deleteInventory = useCallback(async (id: string) => {
    try {
      await inventoryApi.deleteInventory(id);
      
      setInventories(prev => prev.filter(inv => inv.id !== id));
      
      if (selectedInventory?.id === id) {
        setSelectedInventory(null);
      }
      
      showNotification('success', 'Envanter başarıyla silindi');
    } catch (error: any) {
      showNotification('error', error.message || 'Envanter silinirken hata oluştu');
      throw error;
    }
  }, [selectedInventory, showNotification]);

  const getInventoryById = useCallback(async (id: string) => {
    try {
      const response = await inventoryApi.getInventoryById(id);
      setSelectedInventory(response.data);
    } catch (error: any) {
      showNotification('error', 'Envanter bulunamadı');
      throw error;
    }
  }, [showNotification]);

  const getInventoryByProductId = useCallback(async (productId: string) => {
    try {
      const response = await inventoryApi.getInventoryByProductId(productId);
      setSelectedInventory(response.data);
    } catch (error: any) {
      showNotification('error', 'Ürün için envanter bulunamadı');
      throw error;
    }
  }, [showNotification]);

  // ==================== SUB-INVENTORY OPERATIONS ====================

  const getAllSubInventories = useCallback(async (inventoryId?: string) => {
    setLoadingSubInventories(true);
    try {
      const response = await inventoryApi.getAllSubInventories(inventoryId);
      setSubInventories(response.data || []);
    } catch (error) {
      showNotification('error', 'Alt envanter listesi yüklenemedi');
      console.error('Error loading sub-inventories:', error);
    } finally {
      setLoadingSubInventories(false);
    }
  }, [showNotification]);

  const createSubInventory = useCallback(async (data: CreateSubInventoryDto) => {
    try {
      // Validation
      if (data.quantity <= 0) {
        throw new Error('Miktar 0\'dan büyük olmalıdır');
      }
      if (data.unitPrice <= 0) {
        throw new Error('Birim fiyat 0\'dan büyük olmalıdır');
      }

      const newSubInventory = await inventoryApi.createSubInventory(data);
      
      setSubInventories(prev => [...prev, newSubInventory]);
      
      // Refresh parent inventory to update totals
      await refreshInventories();
      
      showNotification('success', 'Parti/Lot başarıyla oluşturuldu');
    } catch (error: any) {
      showNotification('error', error.message || 'Parti oluşturulurken hata oluştu');
      throw error;
    }
  }, [showNotification, refreshInventories]);

  const updateSubInventory = useCallback(async (id: string, data: UpdateSubInventoryDto) => {
    try {
      const response = await inventoryApi.updateSubInventory(id, data);
      
      setSubInventories(prev =>
        prev.map(sub => (sub.id === id ? response.data : sub))
      );
      
      if (selectedSubInventory?.id === id) {
        setSelectedSubInventory(response.data);
      }
      
      // Refresh parent inventory to update totals
      await refreshInventories();
      
      showNotification('success', 'Parti başarıyla güncellendi');
    } catch (error: any) {
      showNotification('error', error.message || 'Parti güncellenirken hata oluştu');
      throw error;
    }
  }, [selectedSubInventory, showNotification, refreshInventories]);

  const deleteSubInventory = useCallback(async (id: string) => {
    try {
      await inventoryApi.deleteSubInventory(id);
      
      setSubInventories(prev => prev.filter(sub => sub.id !== id));
      
      if (selectedSubInventory?.id === id) {
        setSelectedSubInventory(null);
      }
      
      // Refresh parent inventory to update totals
      await refreshInventories();
      
      showNotification('success', 'Parti başarıyla silindi');
    } catch (error: any) {
      showNotification('error', error.message || 'Parti silinirken hata oluştu');
      throw error;
    }
  }, [selectedSubInventory, showNotification, refreshInventories]);

  const getSubInventoryById = useCallback(async (id: string) => {
    try {
      const response = await inventoryApi.getSubInventoryById(id);
      setSelectedSubInventory(response.data);
    } catch (error: any) {
      showNotification('error', 'Parti bulunamadı');
      throw error;
    }
  }, [showNotification]);

  // ==================== STOCK OPERATIONS ====================

  const adjustStock = useCallback(async (data: StockAdjustmentDto) => {
    try {
      // Validation
      if (data.quantity <= 0) {
        throw new Error('Miktar 0\'dan büyük olmalıdır');
      }

      const response = await inventoryApi.adjustStock(data);
      
      // Update sub-inventory in state
      setSubInventories(prev =>
        prev.map(sub => (sub.id === data.subInventoryId ? response.data : sub))
      );
      
      // Refresh parent inventory to update totals
      await refreshInventories();
      
      const actionText = data.type === AdjustmentType.ADD ? 'eklendi' : 'çıkarıldı';
      showNotification('success', `Stok başarıyla ${actionText}`);
    } catch (error: any) {
      showNotification('error', error.message || 'Stok ayarlanırken hata oluştu');
      throw error;
    }
  }, [showNotification, refreshInventories]);

  // ==================== REPORTS & STATISTICS ====================

  const loadInventoryStats = useCallback(async (id: string) => {
    setLoadingStats(true);
    try {
      const statsData = await inventoryApi.getInventoryStats(id);
      setStats(statsData);
    } catch (error) {
      showNotification('error', 'İstatistikler yüklenemedi');
      console.error('Error loading inventory stats:', error);
    } finally {
      setLoadingStats(false);
    }
  }, [showNotification]);

  const loadLowStockItems = useCallback(async (threshold?: number) => {
    try {
      const response = await inventoryApi.getLowStockItems(threshold);
      setLowStockItems(response.data || []);
    } catch (error) {
      showNotification('error', 'Düşük stok raporu yüklenemedi');
      console.error('Error loading low stock items:', error);
    }
  }, [showNotification]);

  // ==================== UTILITY ====================

  const clearSelection = useCallback(() => {
    setSelectedInventory(null);
    setSelectedSubInventory(null);
    setStats(null);
  }, []);

  const value: InventoryContextState = {
    // State
    inventories,
    selectedInventory,
    subInventories,
    selectedSubInventory,
    stats,
    lowStockItems,
    loading,
    loadingSubInventories,
    loadingStats,
    
    // Parent Inventory Operations
    createInventory,
    updateInventory,
    deleteInventory,
    getInventoryById,
    getInventoryByProductId,
    setSelectedInventory,
    
    // Sub-Inventory Operations
    createSubInventory,
    updateSubInventory,
    deleteSubInventory,
    getSubInventoryById,
    getAllSubInventories,
    setSelectedSubInventory,
    
    // Stock Operations
    adjustStock,
    
    // Reports & Stats
    loadInventoryStats,
    loadLowStockItems,
    
    // Utility
    refreshInventories,
    clearSelection,
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

// Custom Hook
export const useInventory = (): InventoryContextState => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};

export default InventoryProvider;
