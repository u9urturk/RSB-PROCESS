import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import inventoryApi, { 
  InventoryResponseDto, 
  CreateInventoryDto, 
  UpdateInventoryDto, 
  InventoryStatsDto
} from '../apis/inventoryApi';
import { useNotification } from '../../../context/provider/NotificationProvider';

interface InventoryContextType {
  // State
  inventories: InventoryResponseDto[];
  loading: boolean;
  error: string | null;
  stats: InventoryStatsDto;
  
  // Actions
  loadInventories: () => Promise<void>;
  loadStats: () => Promise<void>;
  createInventory: (data: CreateInventoryDto) => Promise<InventoryResponseDto>;
  updateInventory: (id: string, data: UpdateInventoryDto) => Promise<InventoryResponseDto>;
  deleteInventory: (id: string) => Promise<void>;
  getInventoryById: (id: string) => InventoryResponseDto | undefined;
  searchInventories: (searchTerm: string) => Promise<InventoryResponseDto[]>;
  getLowStockInventories: () => Promise<InventoryResponseDto[]>;
  getExpiringInventories: (daysAhead?: number) => Promise<InventoryResponseDto[]>;
  getInventoriesByWarehouse: (warehouseId: string) => Promise<InventoryResponseDto[]>;
  getInventoriesBySupplier: (supplierId: string) => Promise<InventoryResponseDto[]>;
  getInventoriesByProduct: (productId: string) => Promise<InventoryResponseDto[]>;
  getInventoryByLotNumber: (lotNumber: string) => Promise<InventoryResponseDto>;
  bulkUpdateInventories: (updates: Array<{ id: string; currentQuantity: number }>) => Promise<InventoryResponseDto[]>;
  refreshInventories: () => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

interface InventoryProviderProps {
  children: ReactNode;
}

export const InventoryProvider: React.FC<InventoryProviderProps> = ({ children }) => {
  const [inventories, setInventories] = useState<InventoryResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<InventoryStatsDto>({
    totalInventoryItems: 0,
    lowStockItems: 0,
    overStockItems: 0,
    expiringSoonItems: 0,
    totalValue: 0,
    averageStockLevel: 0,
    warehouseDistribution: {},
    supplierDistribution: {},
    stockLevelsByCategory: {
      low: 0,
      normal: 0,
      high: 0
    },
    recentMovements: {
      totalMovements: 0,
      inMovements: 0,
      outMovements: 0,
      adjustments: 0
    }
  });
  const { showNotification } = useNotification();

  // Inventory'leri yükle
  const loadInventories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await inventoryApi.getAllInventories();
      
      // Handle API response structure
      if (response && response.data) {
        setInventories(response.data);
      } else {
        // Fallback for direct array response
        setInventories(response as any || []);
      }
    } catch (error) {
      console.error('Error loading inventories:', error);
      setError('Inventory verileri yüklenemedi');
      showNotification('error', 'Inventory verileri yüklenirken hata oluştu');
      setInventories([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // İstatistikleri yükle
  const loadStats = async () => {
    try {
      const statsData = await inventoryApi.getInventoryStats();
      setStats(statsData);
      console.log(`Toplam inventory sayısı: ${statsData.totalInventoryItems}`);
      console.log(`Düşük stok uyarısı: ${statsData.lowStockItems}`);
      console.log(`Yaklaşan son kullanma: ${statsData.expiringSoonItems}`);
    } catch (error) {
      console.error('Error loading inventory stats:', error);
      // Stats yüklenemezse fallback değerler
      setStats(prev => ({
        ...prev,
        totalInventoryItems: inventories.length,
        lowStockItems: inventories.filter(inv => inv.quantity <= inv.minQuantity).length,
        totalValue: inventories.reduce((sum, inv) => sum + (inv.quantity * inv.unitPrice), 0)
      }));
    }
  };

  // Inventory oluştur
  const createInventory = async (data: CreateInventoryDto): Promise<InventoryResponseDto> => {
    try {
      // Basic validation
      if (!data.productId) {
        throw new Error('Ürün ID\'si zorunludur');
      }
      if (!data.warehouseId) {
        throw new Error('Depo ID\'si zorunludur');
      }
      if (data.currentQuantity < 0) {
        throw new Error('Miktar 0 veya daha büyük olmalıdır');
      }
      if (data.minStockLevel < 0) {
        throw new Error('Minimum stok seviyesi 0 veya daha büyük olmalıdır');
      }
      if (data.maxStockLevel < data.minStockLevel) {
        throw new Error('Maksimum stok seviyesi minimum stok seviyesinden küçük olamaz');
      }

      console.log('Creating inventory with data:', data);
      const newInventory = await inventoryApi.createInventory(data);
      console.log('API response - new inventory:', newInventory);

      // Inventory'yi state'e ekle
      setInventories(prev => {
        const updatedInventories = [...prev, newInventory];
        console.log('Updated inventories state:', updatedInventories);
        return updatedInventories;
      });

      showNotification('success', 'Inventory başarıyla oluşturuldu');
      
      // Stats'ları güncelle
      await loadStats();
      
      return newInventory;
    } catch (error) {
      console.error('Error creating inventory:', error);
      const message = error instanceof Error ? error.message : 'Inventory oluşturulamadı';
      showNotification('error', message);
      throw error;
    }
  };

  // Inventory güncelle
  const updateInventory = async (id: string, data: UpdateInventoryDto): Promise<InventoryResponseDto> => {
    try {
      // Basic validation
      if (data.currentQuantity !== undefined && data.currentQuantity < 0) {
        throw new Error('Miktar 0 veya daha büyük olmalıdır');
      }
      if (data.minStockLevel !== undefined && data.minStockLevel < 0) {
        throw new Error('Minimum stok seviyesi 0 veya daha büyük olmalıdır');
      }
      if (data.maxStockLevel !== undefined && data.minStockLevel !== undefined && data.maxStockLevel < data.minStockLevel) {
        throw new Error('Maksimum stok seviyesi minimum stok seviyesinden küçük olamaz');
      }

      const response = await inventoryApi.updateInventory(id, data);
      let updatedInventory: InventoryResponseDto;
      
      // Handle different response structures
      if (response?.data) {
        updatedInventory = response.data;
      } else {
        updatedInventory = response as any;
      }

      setInventories(prev => prev.map(inv => inv.id === id ? updatedInventory : inv));
      showNotification('success', 'Inventory başarıyla güncellendi');
      
      // // Stats'ları güncelle
      // await loadStats();
      
      return updatedInventory;
    } catch (error) {
      console.error('Error updating inventory:', error);
      const message = error instanceof Error ? error.message : 'Inventory güncellenemedi';
      showNotification('error', message);
      throw error;
    }
  };

  // Inventory sil
  const deleteInventory = async (id: string): Promise<void> => {
    try {
      await inventoryApi.deleteInventory(id);
      setInventories(prev => prev.filter(inv => inv.id !== id));
      showNotification('success', 'Inventory başarıyla silindi');
      
      // Stats'ları güncelle
      await loadStats();
    } catch (error) {
      console.error('Error deleting inventory:', error);
      showNotification('error', 'Inventory silinemedi');
      throw error;
    }
  };

  // ID'ye göre inventory bul
  const getInventoryById = (id: string): InventoryResponseDto | undefined => {
    return inventories.find(inv => inv.id === id);
  };

  // Inventory ara
  const searchInventories = async (searchTerm: string): Promise<InventoryResponseDto[]> => {
    try {
      if (!searchTerm.trim()) return inventories;
      
      const response = await inventoryApi.searchInventories(searchTerm);
      
      // Handle API response structure
      if (response && response.data) {
        return response.data;
      } else {
        return response as any || [];
      }
    } catch (error) {
      console.error('Error searching inventories:', error);
      showNotification('error', 'Arama işlemi başarısız oldu');
      
      // Fallback to local search
      const term = searchTerm.toLowerCase();
      return inventories.filter(inventory =>
        inventory.name.toLowerCase().includes(term) ||
        (inventory.barcode && inventory.barcode.toLowerCase().includes(term)) ||
        (inventory.lotNumber && inventory.lotNumber.toLowerCase().includes(term)) ||
        (inventory.description && inventory.description.toLowerCase().includes(term))
      );
    }
  };

  // Düşük stok inventory'lerini getir
  const getLowStockInventories = async (): Promise<InventoryResponseDto[]> => {
    try {
      const response = await inventoryApi.getLowStockInventories();
      
      // Handle API response structure
      if (response && response.data) {
        return response.data;
      } else {
        return response as any || [];
      }
    } catch (error) {
      console.error('Error getting low stock inventories:', error);
      showNotification('error', 'Düşük stok verileri yüklenemedi');
      
      // Fallback to local calculation
      return inventories.filter(inv => inv.quantity <= inv.minQuantity);
    }
  };

  // Yaklaşan son kullanma tarihli inventory'leri getir
  const getExpiringInventories = async (daysAhead: number = 30): Promise<InventoryResponseDto[]> => {
    try {
      const response = await inventoryApi.getExpiringInventories(daysAhead);
      
      // Handle API response structure
      if (response && response.data) {
        return response.data;
      } else {
        return response as any || [];
      }
    } catch (error) {
      console.error('Error getting expiring inventories:', error);
      showNotification('error', 'Son kullanma tarihi verileri yüklenemedi');
      return [];
    }
  };

  // Depoya göre inventory'leri getir
  const getInventoriesByWarehouse = async (warehouseId: string): Promise<InventoryResponseDto[]> => {
    try {
      const response = await inventoryApi.getInventoriesByWarehouse(warehouseId);
      
      // Handle API response structure
      if (response && response.data) {
        return response.data;
      } else {
        return response as any || [];
      }
    } catch (error) {
      console.error('Error getting inventories by warehouse:', error);
      showNotification('error', 'Depo inventory verileri yüklenemedi');
      
      // Fallback to local filter
      return inventories.filter(inv => inv.warehouseId === warehouseId);
    }
  };

  // Tedarikçiye göre inventory'leri getir
  const getInventoriesBySupplier = async (supplierId: string): Promise<InventoryResponseDto[]> => {
    try {
      const response = await inventoryApi.getInventoriesBySupplier(supplierId);
      
      // Handle API response structure
      if (response && response.data) {
        return response.data;
      } else {
        return response as any || [];
      }
    } catch (error) {
      console.error('Error getting inventories by supplier:', error);
      showNotification('error', 'Tedarikçi inventory verileri yüklenemedi');
      
      // Fallback to local filter
      return inventories.filter(inv => inv.supplierId === supplierId);
    }
  };

  // Ürüne göre inventory'leri getir
  const getInventoriesByProduct = async (productId: string): Promise<InventoryResponseDto[]> => {
    try {
      const response = await inventoryApi.getInventoriesByProduct(productId);
      
      // Handle API response structure
      if (response && response.data) {
        return response.data;
      } else {
        return response as any || [];
      }
    } catch (error) {
      console.error('Error getting inventories by product:', error);
      showNotification('error', 'Ürün inventory verileri yüklenemedi');
      
      // Fallback to local filter
      return inventories.filter(inv => inv.productId === productId);
    }
  };

  // Lot numarasına göre inventory getir
  const getInventoryByLotNumber = async (lotNumber: string): Promise<InventoryResponseDto> => {
    try {
      const response = await inventoryApi.getInventoryByLotNumber(lotNumber);
      
      // Handle API response structure
      if (response?.data) {
        return response.data;
      } else {
        return response as any;
      }
    } catch (error) {
      console.error('Error getting inventory by lot number:', error);
      showNotification('error', 'Lot numarası ile inventory bulunamadı');
      throw error;
    }
  };

  // Toplu inventory güncelleme
  const bulkUpdateInventories = async (updates: Array<{ id: string; currentQuantity: number }>): Promise<InventoryResponseDto[]> => {
    try {
      const response = await inventoryApi.bulkUpdateInventories(updates);
      
      // Handle API response structure
      let updatedInventories: InventoryResponseDto[];
      if (response && response.data) {
        updatedInventories = response.data;
      } else {
        updatedInventories = response as any || [];
      }

      // Update local state
      setInventories(prev => {
        const newInventories = [...prev];
        updatedInventories.forEach(updated => {
          const index = newInventories.findIndex(inv => inv.id === updated.id);
          if (index !== -1) {
            newInventories[index] = updated;
          }
        });
        return newInventories;
      });

      showNotification('success', `${updates.length} inventory kaydı başarıyla güncellendi`);
      
      // Stats'ları güncelle
      await loadStats();
      
      return updatedInventories;
    } catch (error) {
      console.error('Error bulk updating inventories:', error);
      showNotification('error', 'Toplu güncelleme işlemi başarısız oldu');
      throw error;
    }
  };

  // Inventory'leri yenile
  const refreshInventories = async (): Promise<void> => {
    await loadInventories();
    await loadStats();
  };

  // Component mount edildiğinde inventory'leri ve stats'ları yükle
  useEffect(() => {
    loadInventories();
    loadStats();
  }, []);

  // Inventory'ler değiştiğinde stats'ları güncelle
  useEffect(() => {
    if (inventories.length > 0) {
      loadStats();
    }
  }, [inventories]);

  const value: InventoryContextType = {
    inventories,
    loading,
    error,
    stats,
    loadInventories,
    loadStats,
    createInventory,
    updateInventory,
    deleteInventory,
    getInventoryById,
    searchInventories,
    getLowStockInventories,
    getExpiringInventories,
    getInventoriesByWarehouse,
    getInventoriesBySupplier,
    getInventoriesByProduct,
    getInventoryByLotNumber,
    bulkUpdateInventories,
    refreshInventories
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

// Custom hook
export const useInventories = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventories must be used within an InventoryProvider');
  }
  return context;
};