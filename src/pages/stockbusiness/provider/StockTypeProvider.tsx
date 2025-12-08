import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import stockTypeApi, { 
  StockTypeResponseDto, 
  CreateStockTypeDto, 
  UpdateStockTypeDto, 
  StockTypeStatsDto
} from '../apis/stockTypeApi';
import { useNotification } from '../../../context/provider/NotificationProvider';

interface StockTypeContextType {
  // State
  stockTypes: StockTypeResponseDto[];
  loading: boolean;
  error: string | null;
  stats: StockTypeStatsDto;
  
  // Actions
  loadStockTypes: () => Promise<void>;
  loadStats: () => Promise<void>;
  createStockType: (data: CreateStockTypeDto) => Promise<StockTypeResponseDto>;
  updateStockType: (id: string, data: UpdateStockTypeDto) => Promise<StockTypeResponseDto>;
  deleteStockType: (id: string) => Promise<void>;
  toggleStockTypeStatus: (id: string) => Promise<StockTypeResponseDto>;
  getStockTypeById: (id: string) => StockTypeResponseDto | undefined;
  getActiveStockTypes: () => Promise<StockTypeResponseDto[]>;
  getLocalActiveStockTypes: () => StockTypeResponseDto[];
  validateStockType: (data: Partial<CreateStockTypeDto | UpdateStockTypeDto>) => string[];
  checkStockTypeNameUnique: (name: string, excludeId?: string) => Promise<boolean>;
  refreshStockTypes: () => Promise<void>;
}

const StockTypeContext = createContext<StockTypeContextType | undefined>(undefined);

interface StockTypeProviderProps {
  children: ReactNode;
}

export const StockTypeProvider: React.FC<StockTypeProviderProps> = ({ children }) => {
  const [stockTypes, setStockTypes] = useState<StockTypeResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<StockTypeStatsDto>({
    totalStockTypes: 0,
    activeStockTypes: 0,
    inactiveStockTypes: 0,
    totalProducts: 0,
    averageProductsPerStockType: 0,
    topStockTypes: [],
    lastUpdated: new Date().toISOString()
  });
  const { showNotification } = useNotification();

  // Stok tiplerini yükle
  const loadStockTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await stockTypeApi.getAllStockTypes();
      
      // Handle API response structure
      if (response && response.data) {
        setStockTypes(response.data);
        
        // Update stats from the response if available
        if (response.total !== undefined) {
          setStats(prev => ({
            ...prev,
            totalStockTypes: response.total || response.data.length,
            activeStockTypes: response.activeCount || response.data.filter(st => st.isActive).length,
            inactiveStockTypes: response.inactiveCount || response.data.filter(st => !st.isActive).length,
            totalProducts: response.totalProducts || 0,
            averageProductsPerStockType: response.averageProductsPerStockType || 0,
            mostUsedStockType: response.mostUsedStockType,
            topStockTypes: response.topStockTypes || [],
            lastUpdated: response.lastUpdated || new Date().toISOString()
          }));
        }
      } else {
        // Fallback for direct array response
        setStockTypes(response as any || []);
      }
    } catch (error) {
      console.error('Error loading stock types:', error);
      setError('Stok tipleri yüklenemedi');
      showNotification('error', 'Stok tipleri yüklenirken hata oluştu');
      setStockTypes([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // İstatistikleri yükle
  const loadStats = async () => {
    try {
      const statsData = await stockTypeApi.getStockTypeStats();
      setStats(statsData);
      console.log(`Toplam stok tipi sayısı: ${statsData.totalStockTypes}`);
      console.log(`Aktif stok tipleri: ${statsData.activeStockTypes}`);
      console.log(`En çok kullanılan: ${statsData.mostUsedStockType?.name || 'Yok'}`);
    } catch (error) {
      console.error('Error loading stock type stats:', error);
      // Stats yüklenemezse fallback değerler
      const activeCount = stockTypes.filter(st => st.isActive).length;
      const totalProducts = stockTypes.reduce((sum, st) => sum + st.itemCount, 0);
      
      setStats(prev => ({
        ...prev,
        totalStockTypes: stockTypes.length,
        activeStockTypes: activeCount,
        inactiveStockTypes: stockTypes.length - activeCount,
        totalProducts,
        averageProductsPerStockType: stockTypes.length > 0 ? totalProducts / stockTypes.length : 0,
        lastUpdated: new Date().toISOString()
      }));
    }
  };

  // Stok tipi validasyon fonksiyonu
  const validateStockType = (data: Partial<CreateStockTypeDto | UpdateStockTypeDto>): string[] => {
    const errors: string[] = [];

    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push('Stok tipi adı zorunludur');
      } else if (data.name.trim().length < 2) {
        errors.push('Stok tipi adı en az 2 karakter olmalıdır');
      } else if (data.name.trim().length > 50) {
        errors.push('Stok tipi adı en fazla 50 karakter olabilir');
      }
    }

    if (data.description !== undefined && data.description) {
      if (data.description.length < 10) {
        errors.push('Açıklama en az 10 karakter olmalıdır');
      } else if (data.description.length > 500) {
        errors.push('Açıklama en fazla 500 karakter olabilir');
      }
    }

    if (data.icon !== undefined && data.icon) {
      if (data.icon.length > 2) {
        errors.push('İkon en fazla 2 karakter olabilir (emoji önerilir)');
      }
    }

    if (data.color !== undefined && data.color) {
      // Tailwind gradient formatı kontrolü
      const gradientPattern = /^from-\w+-\d{3} to-\w+-\d{3}$/;
      if (!gradientPattern.test(data.color)) {
        errors.push('Renk formatı "from-color-500 to-color-600" şeklinde olmalıdır');
      }
    }

    if (data.examples !== undefined && data.examples) {
      if (data.examples.length > 10) {
        errors.push('En fazla 10 örnek ürün eklenebilir');
      }
      
      data.examples.forEach((example, index) => {
        if (example.trim().length < 2) {
          errors.push(`${index + 1}. örnek en az 2 karakter olmalıdır`);
        } else if (example.trim().length > 50) {
          errors.push(`${index + 1}. örnek en fazla 50 karakter olabilir`);
        }
      });
    }

    return errors;
  };

  // Stok tipi adı benzersizlik kontrolü
  const checkStockTypeNameUnique = async (name: string, excludeId?: string): Promise<boolean> => {
    try {
      // Local check since no specific API endpoint
      const existingStockType = stockTypes.find(st => 
        st.name.toLowerCase() === name.toLowerCase() && 
        (!excludeId || st.id !== excludeId)
      );
      return !existingStockType;
    } catch (error) {
      console.error('Error checking stock type name uniqueness:', error);
      return true; // Default to allow if check fails
    }
  };

  // Stok tipi oluştur
  const createStockType = async (data: CreateStockTypeDto): Promise<StockTypeResponseDto> => {
    try {
      // Validasyon
      const errors = validateStockType(data);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      // Benzersizlik kontrolü
      const isNameUnique = await checkStockTypeNameUnique(data.name);
      if (!isNameUnique) {
        throw new Error('Bu stok tipi adı zaten mevcut');
      }

      const newStockType = await stockTypeApi.createStockType(data);
      setStockTypes(prev => [...prev, newStockType]);
      showNotification('success', 'Stok tipi başarıyla oluşturuldu');
      
      // Stats'ları güncelle
      await loadStats();
      
      return newStockType;
    } catch (error) {
      console.error('Error creating stock type:', error);
      const message = error instanceof Error ? error.message : 'Stok tipi oluşturulamadı';
      showNotification('error', message);
      throw error;
    }
  };

  // Stok tipi güncelle
  const updateStockType = async (id: string, data: UpdateStockTypeDto): Promise<StockTypeResponseDto> => {
    try {
      // Validasyon
      const errors = validateStockType(data);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      // Benzersizlik kontrolü (kendi ID'si hariç)
      if (data.name) {
        const isNameUnique = await checkStockTypeNameUnique(data.name, id);
        if (!isNameUnique) {
          throw new Error('Bu stok tipi adı zaten mevcut');
        }
      }

      const updatedStockType = await stockTypeApi.updateStockType(id, data);
      setStockTypes(prev => prev.map(st => st.id === id ? updatedStockType : st));
      showNotification('success', 'Stok tipi başarıyla güncellendi');
      
      // Stats'ları güncelle
      await loadStats();
      
      return updatedStockType;
    } catch (error) {
      console.error('Error updating stock type:', error);
      const message = error instanceof Error ? error.message : 'Stok tipi güncellenemedi';
      showNotification('error', message);
      throw error;
    }
  };

  // Stok tipi sil
  const deleteStockType = async (id: string): Promise<void> => {
    try {
      await stockTypeApi.deleteStockType(id);
      setStockTypes(prev => prev.filter(st => st.id !== id));
      showNotification('success', 'Stok tipi başarıyla silindi');
      
      // Stats'ları güncelle
      await loadStats();
    } catch (error) {
      console.error('Error deleting stock type:', error);
      showNotification('error', 'Stok tipi silinemedi. Bu tiple ilişkili ürünler olabilir.');
      throw error;
    }
  };

  // Stok tipi durumunu değiştir (aktif/pasif)
  const toggleStockTypeStatus = async (id: string): Promise<StockTypeResponseDto> => {
    try {
      const updatedStockType = await stockTypeApi.toggleStockTypeStatus(id);
      setStockTypes(prev => prev.map(st => st.id === id ? updatedStockType : st));
      
      const statusText = updatedStockType.isActive ? 'aktifleştirildi' : 'pasifleştirildi';
      showNotification('success', `Stok tipi ${statusText}`);
      
      // Stats'ları güncelle
      await loadStats();
      
      return updatedStockType;
    } catch (error) {
      console.error('Error toggling stock type status:', error);
      const message = error instanceof Error ? error.message : 'Stok tipi durumu değiştirilemedi';
      showNotification('error', message);
      throw error;
    }
  };

  // ID'ye göre stok tipi bul
  const getStockTypeById = (id: string): StockTypeResponseDto | undefined => {
    return stockTypes.find(st => st.id === id);
  };

  // Aktif stok tiplerini API'den getir
  const getActiveStockTypes = async (): Promise<StockTypeResponseDto[]> => {
    try {
      const activeStockTypes = await stockTypeApi.getActiveStockTypes();
      return activeStockTypes;
    } catch (error) {
      console.error('Error getting active stock types:', error);
      showNotification('error', 'Aktif stok tipleri yüklenemedi');
      
      // Fallback to local filter
      return getLocalActiveStockTypes();
    }
  };

  // Lokal aktif stok tiplerini getir
  const getLocalActiveStockTypes = (): StockTypeResponseDto[] => {
    return stockTypes.filter(st => st.isActive);
  };

  // Stok tiplerini yenile
  const refreshStockTypes = async (): Promise<void> => {
    await loadStockTypes();
    await loadStats();
  };

  // Component mount edildiğinde stok tiplerini ve stats'ları yükle
  useEffect(() => {
    loadStockTypes();
  }, []);

  // Stock types değiştiğinde stats'ları güncelle
  useEffect(() => {
    if (stockTypes.length >= 0) { // 0 or more stock types
      loadStats();
    }
  }, [stockTypes]);

  const value: StockTypeContextType = {
    stockTypes,
    loading,
    error,
    stats,
    loadStockTypes,
    loadStats,
    createStockType,
    updateStockType,
    deleteStockType,
    toggleStockTypeStatus,
    getStockTypeById,
    getActiveStockTypes,
    getLocalActiveStockTypes,
    validateStockType,
    checkStockTypeNameUnique,
    refreshStockTypes
  };

  return (
    <StockTypeContext.Provider value={value}>
      {children}
    </StockTypeContext.Provider>
  );
};

// Custom hook
export const useStockTypes = (): StockTypeContextType => {
  const context = useContext(StockTypeContext);
  if (context === undefined) {
    throw new Error('useStockTypes must be used within a StockTypeProvider');
  }
  return context;
};