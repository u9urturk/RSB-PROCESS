import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { baseUnitApi, BaseUnit, CreateBaseUnitDto, UpdateBaseUnitDto, BaseUnitStats } from '../apis/baseUnitApi';
import { useNotification } from '../../../context/provider/NotificationProvider';

interface BaseUnitContextType {
  // State
  baseUnits: BaseUnit[];
  loading: boolean;
  error: string | null;
  stats: BaseUnitStats;
  
  // Actions
  loadBaseUnits: () => Promise<void>;
  loadStats: () => Promise<void>;
  createBaseUnit: (data: CreateBaseUnitDto) => Promise<BaseUnit>;
  updateBaseUnit: (id: string, data: UpdateBaseUnitDto) => Promise<BaseUnit>;
  deleteBaseUnit: (id: string) => Promise<void>;
  getBaseUnitById: (id: string) => BaseUnit | undefined;
  searchBaseUnits: (searchTerm: string) => BaseUnit[];
  getActiveBaseUnits: () => BaseUnit[];
  toggleBaseUnitStatus: (id: string) => Promise<void>;
}

const BaseUnitContext = createContext<BaseUnitContextType | undefined>(undefined);

interface BaseUnitProviderProps {
  children: ReactNode;
}

export const BaseUnitProvider: React.FC<BaseUnitProviderProps> = ({ children }) => {
  const [baseUnits, setBaseUnits] = useState<BaseUnit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<BaseUnitStats>({
    totalUnits: 0,
    activeUnits: 0,
    inactiveUnits: 0,
    unitsWithProducts: 0
  });
  const { showNotification } = useNotification();

  // Birimleri yükle
  const loadBaseUnits = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await baseUnitApi.getAllBaseUnits();
      setBaseUnits(data);
    } catch (error) {
      console.error('Error loading base units:', error);
      setError('Birimler yüklenemedi');
      showNotification('error', 'Birimler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // İstatistikleri yükle
  const loadStats = async () => {
    try {
      // const statsData = await baseUnitApi.getBaseUnitStats();
      // setStats(statsData);
      // console.log(`Toplam birim sayısı: ${statsData.totalUnits}`);
      // console.log(`Aktif birimler: ${statsData.activeUnits}`);
      // console.log(`Pasif birimler: ${statsData.inactiveUnits}`);
    } catch (error) {
      console.error('Error loading base unit stats:', error);
      // Stats yüklenemezse fallback değerler
      setStats({
        totalUnits: baseUnits.length,
        activeUnits: baseUnits.filter(unit => unit.isActive).length,
        inactiveUnits: baseUnits.filter(unit => !unit.isActive).length,
        unitsWithProducts: 0
      });
    }
  };

  // Birim oluştur
  const createBaseUnit = async (data: CreateBaseUnitDto): Promise<BaseUnit> => {
    try {
      // Validasyon
      const errors = baseUnitApi.validateBaseUnit(data);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      // Benzersizlik kontrolleri
      const isNameUnique = await baseUnitApi.checkBaseUnitNameUnique(data.name);
      if (!isNameUnique) {
        throw new Error('Bu birim adı zaten mevcut');
      }

      const isShortNameUnique = await baseUnitApi.checkBaseUnitShortNameUnique(data.shortName);
      if (!isShortNameUnique) {
        throw new Error('Bu kısa ad zaten mevcut');
      }

      if (data.symbol) {
        const isSymbolUnique = await baseUnitApi.checkBaseUnitSymbolUnique(data.symbol);
        if (!isSymbolUnique) {
          throw new Error('Bu sembol zaten mevcut');
        }
      }

      const newBaseUnit = await baseUnitApi.createBaseUnit(data);
      setBaseUnits(prev => [...prev, newBaseUnit]);
      showNotification('success', 'Birim başarıyla oluşturuldu');
      
      // Stats'ları güncelle
      await loadStats();
      
      return newBaseUnit;
    } catch (error) {
      console.error('Error creating base unit:', error);
      const message = error instanceof Error ? error.message : 'Birim oluşturulamadı';
      showNotification('error', message);
      throw error;
    }
  };

  // Birim güncelle
  const updateBaseUnit = async (id: string, data: UpdateBaseUnitDto): Promise<BaseUnit> => {
    try {
      // Validasyon
      const errors = baseUnitApi.validateBaseUnit(data);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      // Benzersizlik kontrolleri (kendi ID'si hariç)
      if (data.name) {
        const isNameUnique = await baseUnitApi.checkBaseUnitNameUnique(data.name, id);
        if (!isNameUnique) {
          throw new Error('Bu birim adı zaten mevcut');
        }
      }

      if (data.shortName) {
        const isShortNameUnique = await baseUnitApi.checkBaseUnitShortNameUnique(data.shortName, id);
        if (!isShortNameUnique) {
          throw new Error('Bu kısa ad zaten mevcut');
        }
      }

      if (data.symbol) {
        const isSymbolUnique = await baseUnitApi.checkBaseUnitSymbolUnique(data.symbol, id);
        if (!isSymbolUnique) {
          throw new Error('Bu sembol zaten mevcut');
        }
      }

      const updatedBaseUnit = await baseUnitApi.updateBaseUnit(id, data);
      setBaseUnits(prev => prev.map(unit => unit.id === id ? updatedBaseUnit : unit));
      showNotification('success', 'Birim başarıyla güncellendi');
      
      // Stats'ları güncelle
      await loadStats();
      
      return updatedBaseUnit;
    } catch (error) {
      console.error('Error updating base unit:', error);
      const message = error instanceof Error ? error.message : 'Birim güncellenemedi';
      showNotification('error', message);
      throw error;
    }
  };

  // Birim sil
  const deleteBaseUnit = async (id: string): Promise<void> => {
    try {
      await baseUnitApi.deleteBaseUnit(id);
      setBaseUnits(prev => prev.filter(unit => unit.id !== id));
      showNotification('success', 'Birim başarıyla silindi');
      
      // Stats'ları güncelle
      await loadStats();
    } catch (error) {
      console.error('Error deleting base unit:', error);
      showNotification('error', 'Birim silinemedi');
      throw error;
    }
  };

  // ID'ye göre birim bul
  const getBaseUnitById = (id: string): BaseUnit | undefined => {
    return baseUnits.find(unit => unit.id === id);
  };

  // Birim ara
  const searchBaseUnits = (searchTerm: string): BaseUnit[] => {
    if (!searchTerm.trim()) return baseUnits;
    
    const term = searchTerm.toLowerCase();
    return baseUnits.filter(unit =>
      unit.name.toLowerCase().includes(term) ||
      unit.shortName.toLowerCase().includes(term) ||
      (unit.symbol && unit.symbol.toLowerCase().includes(term)) ||
      (unit.desc && unit.desc.toLowerCase().includes(term))
    );
  };

  // Sadece aktif birimleri getir
  const getActiveBaseUnits = (): BaseUnit[] => {
    return baseUnits.filter(unit => unit.isActive);
  };

  // Birim durumunu değiştir (aktif/pasif)
  const toggleBaseUnitStatus = async (id: string): Promise<void> => {
    try {
      const unit = getBaseUnitById(id);
      if (!unit) {
        throw new Error('Birim bulunamadı');
      }

      await updateBaseUnit(id, { isActive: !unit.isActive });
      showNotification('success', `Birim ${unit.isActive ? 'pasifleştirildi' : 'aktifleştirildi'}`);
    } catch (error) {
      console.error('Error toggling base unit status:', error);
      const message = error instanceof Error ? error.message : 'Birim durumu değiştirilemedi';
      showNotification('error', message);
      throw error;
    }
  };

  // Component mount edildiğinde birimleri ve stats'ları yükle
  useEffect(() => {
    loadBaseUnits();
    loadStats();
  }, []);

  // Birimler değiştiğinde stats'ları güncelle
  useEffect(() => {
    if (baseUnits.length > 0) {
      loadStats();
    }
  }, [baseUnits]);

  const value: BaseUnitContextType = {
    baseUnits,
    loading,
    error,
    stats,
    loadBaseUnits,
    loadStats,
    createBaseUnit,
    updateBaseUnit,
    deleteBaseUnit,
    getBaseUnitById,
    searchBaseUnits,
    getActiveBaseUnits,
    toggleBaseUnitStatus
  };

  return (
    <BaseUnitContext.Provider value={value}>
      {children}
    </BaseUnitContext.Provider>
  );
};

// Custom hook
export const useBaseUnits = (): BaseUnitContextType => {
  const context = useContext(BaseUnitContext);
  if (context === undefined) {
    throw new Error('useBaseUnits must be used within a BaseUnitProvider');
  }
  return context;
};