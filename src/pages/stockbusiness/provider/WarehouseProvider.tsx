import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import warehouseApi, { 
  WarehouseResponseDto, 
  CreateWarehouseDto, 
  UpdateWarehouseDto, 
  WarehouseStatus,
  WarehouseType,
  WarehouseStatsDto
} from '../apis/warehouseApi';
import { useNotification } from '../../../context/provider/NotificationProvider';

interface WarehouseContextType {
  // State
  warehouses: WarehouseResponseDto[];
  loading: boolean;
  error: string | null;
  stats: WarehouseStatsDto;
  
  // Actions
  loadWarehouses: () => Promise<void>;
  loadStats: () => Promise<void>;
  createWarehouse: (data: CreateWarehouseDto) => Promise<WarehouseResponseDto>;
  updateWarehouse: (id: string, data: UpdateWarehouseDto) => Promise<WarehouseResponseDto>;
  deleteWarehouse: (id: string) => Promise<void>;
  getWarehouseById: (id: string) => WarehouseResponseDto | undefined;
  getWarehousesByStatus: (status: WarehouseStatus) => Promise<WarehouseResponseDto[]>;
  getWarehousesByType: (type: WarehouseType) => Promise<WarehouseResponseDto[]>;
  getActiveWarehouses: () => WarehouseResponseDto[];
  getWarehousesByCapacity: (minCapacityPercentage: number, maxCapacityPercentage: number) => WarehouseResponseDto[];
  getColdStorageWarehouses: () => WarehouseResponseDto[];
  getAvailableWarehouses: () => WarehouseResponseDto[];
  validateWarehouse: (data: Partial<CreateWarehouseDto | UpdateWarehouseDto>) => string[];
  checkWarehouseNameUnique: (name: string, excludeId?: string) => Promise<boolean>;
  checkWarehouseCodeUnique: (code: string, excludeId?: string) => Promise<boolean>;
  searchWarehouses: (searchTerm: string) => WarehouseResponseDto[];
  refreshWarehouses: () => Promise<void>;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

interface WarehouseProviderProps {
  children: ReactNode;
}

export const WarehouseProvider: React.FC<WarehouseProviderProps> = ({ children }) => {
  const [warehouses, setWarehouses] = useState<WarehouseResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<WarehouseStatsDto>({
    totalWarehouses: 0,
    activeWarehouses: 0,
    inactiveWarehouses: 0,
    maintenanceWarehouses: 0,
    totalCapacity: '0 m³',
    totalArea: 0,
    averageCapacityPercentage: 0,
    warehousesByType: {
      normal: 0,
      cold: 0,
      frozen: 0,
      dry: 0
    },
    warehousesByStatus: {
      active: 0,
      inactive: 0,
      maintenance: 0
    }
  });
  const { showNotification } = useNotification();

  // Depoları yükle
  const loadWarehouses = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await warehouseApi.getAllWarehouses();
      
      // Handle API response structure
      if (response && response.data) {
        setWarehouses(response.data);
      } else {
        // Fallback for direct array response
        setWarehouses(response as any || []);
      }
    } catch (error) {
      console.error('Error loading warehouses:', error);
      setError('Depolar yüklenemedi');
      showNotification('error', 'Depolar yüklenirken hata oluştu');
      setWarehouses([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // İstatistikleri yükle
  const loadStats = async () => {
    try {
      const statsData = await warehouseApi.getWarehouseStats();
      setStats(statsData);
      console.log(`Toplam depo sayısı: ${statsData.totalWarehouses}`);
      console.log(`Aktif depolar: ${statsData.activeWarehouses}`);
      console.log(`Toplam kapasite: ${statsData.totalCapacity}`);
    } catch (error) {
      console.error('Error loading warehouse stats:', error);
      // Stats yüklenemezse fallback değerler
      const activeWarehouses = warehouses.filter(w => w.status === WarehouseStatus.ACTIVE).length;
      const inactiveWarehouses = warehouses.filter(w => w.status === WarehouseStatus.INACTIVE).length;
      const maintenanceWarehouses = warehouses.filter(w => w.status === WarehouseStatus.MAINTENANCE).length;
      const totalArea = warehouses.reduce((sum, w) => sum + w.area, 0);
      const totalCapacityPercentage = warehouses.reduce((sum, w) => sum + w.capacityPercentage, 0);
      const averageCapacityPercentage = warehouses.length > 0 ? totalCapacityPercentage / warehouses.length : 0;
      
      // Type distribution
      const warehousesByType = {
        normal: warehouses.filter(w => w.warehouseType === WarehouseType.NORMAL).length,
        cold: warehouses.filter(w => w.warehouseType === WarehouseType.COLD).length,
        frozen: warehouses.filter(w => w.warehouseType === WarehouseType.FROZEN).length,
        dry: warehouses.filter(w => w.warehouseType === WarehouseType.DRY).length
      };

      setStats(prev => ({
        ...prev,
        totalWarehouses: warehouses.length,
        activeWarehouses,
        inactiveWarehouses,
        maintenanceWarehouses,
        totalArea,
        averageCapacityPercentage,
        warehousesByType,
        warehousesByStatus: {
          active: activeWarehouses,
          inactive: inactiveWarehouses,
          maintenance: maintenanceWarehouses
        }
      }));
    }
  };

  // Depo validasyon fonksiyonu
  const validateWarehouse = (data: Partial<CreateWarehouseDto | UpdateWarehouseDto>): string[] => {
    const errors: string[] = [];

    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push('Depo adı zorunludur');
      } else if (data.name.trim().length < 2) {
        errors.push('Depo adı en az 2 karakter olmalıdır');
      } else if (data.name.trim().length > 100) {
        errors.push('Depo adı en fazla 100 karakter olabilir');
      }
    }

    if (data.location !== undefined) {
      if (!data.location || data.location.trim().length === 0) {
        errors.push('Depo konumu zorunludur');
      } else if (data.location.trim().length < 5) {
        errors.push('Depo konumu en az 5 karakter olmalıdır');
      } else if (data.location.trim().length > 200) {
        errors.push('Depo konumu en fazla 200 karakter olabilir');
      }
    }

    if (data.capacity !== undefined) {
      if (!data.capacity || data.capacity.trim().length === 0) {
        errors.push('Depo kapasitesi zorunludur');
      }
    }

    if (data.capacityPercentage !== undefined) {
      if (data.capacityPercentage < 0 || data.capacityPercentage > 100) {
        errors.push('Kapasite yüzdesi 0-100 arasında olmalıdır');
      }
    }

    if (data.manager !== undefined) {
      if (!data.manager || data.manager.trim().length === 0) {
        errors.push('Depo müdürü zorunludur');
      } else if (data.manager.trim().length < 2) {
        errors.push('Depo müdürü adı en az 2 karakter olmalıdır');
      } else if (data.manager.trim().length > 100) {
        errors.push('Depo müdürü adı en fazla 100 karakter olabilir');
      }
    }

    if (data.staffCount !== undefined) {
      if (data.staffCount < 0) {
        errors.push('Personel sayısı 0 veya daha büyük olmalıdır');
      } else if (data.staffCount > 1000) {
        errors.push('Personel sayısı 1000\'den fazla olamaz');
      }
    }

    if (data.area !== undefined) {
      if (data.area <= 0) {
        errors.push('Depo alanı 0\'dan büyük olmalıdır');
      } else if (data.area > 1000000) {
        errors.push('Depo alanı 1,000,000 m²\'den fazla olamaz');
      }
    }

    if (data.temperature !== undefined && data.temperature !== null) {
      if (data.temperature < -50 || data.temperature > 50) {
        errors.push('Sıcaklık -50°C ile 50°C arasında olmalıdır');
      }
    }

    if (data.code !== undefined && data.code) {
      if (data.code.length < 2) {
        errors.push('Depo kodu en az 2 karakter olmalıdır');
      } else if (data.code.length > 20) {
        errors.push('Depo kodu en fazla 20 karakter olabilir');
      }
    }

    return errors;
  };

  // Depo adı benzersizlik kontrolü
  const checkWarehouseNameUnique = async (name: string, excludeId?: string): Promise<boolean> => {
    try {
      const existingWarehouse = warehouses.find(w => 
        w.name.toLowerCase() === name.toLowerCase() && 
        (!excludeId || w.id !== excludeId)
      );
      return !existingWarehouse;
    } catch (error) {
      console.error('Error checking warehouse name uniqueness:', error);
      return true; // Default to allow if check fails
    }
  };

  // Depo kodu benzersizlik kontrolü
  const checkWarehouseCodeUnique = async (code: string, excludeId?: string): Promise<boolean> => {
    try {
      if (!code || !code.trim()) return true; // Empty code is allowed
      
      const existingWarehouse = warehouses.find(w => 
        w.code === code && 
        (!excludeId || w.id !== excludeId)
      );
      return !existingWarehouse;
    } catch (error) {
      console.error('Error checking warehouse code uniqueness:', error);
      return true; // Default to allow if check fails
    }
  };

  // Depo oluştur
  const createWarehouse = async (data: CreateWarehouseDto): Promise<WarehouseResponseDto> => {
    try {
      // Validasyon
      const errors = validateWarehouse(data);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      // Benzersizlik kontrolleri
      const isNameUnique = await checkWarehouseNameUnique(data.name);
      if (!isNameUnique) {
        throw new Error('Bu depo adı zaten mevcut');
      }

      if (data.code) {
        const isCodeUnique = await checkWarehouseCodeUnique(data.code);
        if (!isCodeUnique) {
          throw new Error('Bu depo kodu zaten mevcut');
        }
      }

      const newWarehouse = await warehouseApi.createWarehouse(data);
      setWarehouses(prev => [...prev, newWarehouse]);
      showNotification('success', 'Depo başarıyla oluşturuldu');
      
      // Stats'ları güncelle
      await loadStats();
      
      return newWarehouse;
    } catch (error) {
      console.error('Error creating warehouse:', error);
      const message = error instanceof Error ? error.message : 'Depo oluşturulamadı';
      showNotification('error', message);
      throw error;
    }
  };

  // Depo güncelle
  const updateWarehouse = async (id: string, data: UpdateWarehouseDto): Promise<WarehouseResponseDto> => {
    try {
      // Validasyon
      const errors = validateWarehouse(data);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      // Benzersizlik kontrolleri (kendi ID'si hariç)
      if (data.name) {
        const isNameUnique = await checkWarehouseNameUnique(data.name, id);
        if (!isNameUnique) {
          throw new Error('Bu depo adı zaten mevcut');
        }
      }

      if (data.code) {
        const isCodeUnique = await checkWarehouseCodeUnique(data.code, id);
        if (!isCodeUnique) {
          throw new Error('Bu depo kodu zaten mevcut');
        }
      }

      const updatedWarehouse = await warehouseApi.updateWarehouse(id, data);
      setWarehouses(prev => prev.map(warehouse => warehouse.id === id ? updatedWarehouse : warehouse));
      showNotification('success', 'Depo başarıyla güncellendi');
      
      // Stats'ları güncelle
      await loadStats();
      
      return updatedWarehouse;
    } catch (error) {
      console.error('Error updating warehouse:', error);
      const message = error instanceof Error ? error.message : 'Depo güncellenemedi';
      showNotification('error', message);
      throw error;
    }
  };

  // Depo sil
  const deleteWarehouse = async (id: string): Promise<void> => {
    try {
      await warehouseApi.deleteWarehouse(id);
      setWarehouses(prev => prev.filter(warehouse => warehouse.id !== id));
      showNotification('success', 'Depo başarıyla silindi');
      
      // Stats'ları güncelle
      await loadStats();
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      showNotification('error', 'Depo silinemedi. Bu depoyla ilişkili stok kayıtları olabilir.');
      throw error;
    }
  };

  // ID'ye göre depo bul
  const getWarehouseById = (id: string): WarehouseResponseDto | undefined => {
    return warehouses.find(warehouse => warehouse.id === id);
  };

  // Duruma göre depoları getir
  const getWarehousesByStatus = async (status: WarehouseStatus): Promise<WarehouseResponseDto[]> => {
    try {
      const warehousesByStatus = await warehouseApi.getWarehousesByStatus(status);
      return warehousesByStatus;
    } catch (error) {
      console.error('Error getting warehouses by status:', error);
      showNotification('error', 'Durum filtreleme işlemi başarısız oldu');
      
      // Fallback to local filter
      return warehouses.filter(warehouse => warehouse.status === status);
    }
  };

  // Tipine göre depoları getir
  const getWarehousesByType = async (type: WarehouseType): Promise<WarehouseResponseDto[]> => {
    try {
      const warehousesByType = await warehouseApi.getWarehousesByType(type);
      return warehousesByType;
    } catch (error) {
      console.error('Error getting warehouses by type:', error);
      showNotification('error', 'Tip filtreleme işlemi başarısız oldu');
      
      // Fallback to local filter
      return warehouses.filter(warehouse => warehouse.warehouseType === type);
    }
  };

  // Aktif depoları getir
  const getActiveWarehouses = (): WarehouseResponseDto[] => {
    return warehouses.filter(warehouse => warehouse.status === WarehouseStatus.ACTIVE);
  };

  // Kapasite yüzdesine göre depoları getir
  const getWarehousesByCapacity = (minCapacityPercentage: number, maxCapacityPercentage: number): WarehouseResponseDto[] => {
    return warehouses.filter(warehouse => 
      warehouse.capacityPercentage >= minCapacityPercentage && 
      warehouse.capacityPercentage <= maxCapacityPercentage
    );
  };

  // Soğuk hava depoları getir
  const getColdStorageWarehouses = (): WarehouseResponseDto[] => {
    return warehouses.filter(warehouse => 
      warehouse.warehouseType === WarehouseType.COLD || 
      warehouse.warehouseType === WarehouseType.FROZEN
    );
  };

  // Kullanılabilir depoları getir (Aktif ve kapasite müsait)
  const getAvailableWarehouses = (): WarehouseResponseDto[] => {
    return warehouses.filter(warehouse => 
      warehouse.status === WarehouseStatus.ACTIVE && 
      warehouse.capacityPercentage < 95 // %95'ten az dolu olanlar
    );
  };

  // Depo ara
  const searchWarehouses = (searchTerm: string): WarehouseResponseDto[] => {
    if (!searchTerm.trim()) return warehouses;
    
    const term = searchTerm.toLowerCase();
    return warehouses.filter(warehouse =>
      warehouse.name.toLowerCase().includes(term) ||
      warehouse.location.toLowerCase().includes(term) ||
      warehouse.manager.toLowerCase().includes(term) ||
      (warehouse.code && warehouse.code.toLowerCase().includes(term)) ||
      warehouse.warehouseType.toLowerCase().includes(term)
    );
  };

  // Depoları yenile
  const refreshWarehouses = async (): Promise<void> => {
    await loadWarehouses();
    await loadStats();
  };

  // Component mount edildiğinde depoları ve stats'ları yükle
  useEffect(() => {
    loadWarehouses();
  }, []);

  // Warehouses değiştiğinde stats'ları güncelle
  useEffect(() => {
    if (warehouses.length >= 0) { // 0 or more warehouses
      loadStats();
    }
  }, [warehouses]);

  const value: WarehouseContextType = {
    warehouses,
    loading,
    error,
    stats,
    loadWarehouses,
    loadStats,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    getWarehouseById,
    getWarehousesByStatus,
    getWarehousesByType,
    getActiveWarehouses,
    getWarehousesByCapacity,
    getColdStorageWarehouses,
    getAvailableWarehouses,
    validateWarehouse,
    checkWarehouseNameUnique,
    checkWarehouseCodeUnique,
    searchWarehouses,
    refreshWarehouses
  };

  return (
    <WarehouseContext.Provider value={value}>
      {children}
    </WarehouseContext.Provider>
  );
};

// Custom hook
export const useWarehouses = (): WarehouseContextType => {
  const context = useContext(WarehouseContext);
  if (context === undefined) {
    throw new Error('useWarehouses must be used within a WarehouseProvider');
  }
  return context;
};