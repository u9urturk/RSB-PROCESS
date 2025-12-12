import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import supplierApi, { 
  SupplierResponseDto, 
  CreateSupplierDto, 
  UpdateSupplierDto, 
  SupplierStatus,
  SupplierStatsDto
} from '../apis/supplierApi';
import { useNotification } from '../../../context/provider/NotificationProvider';

interface SupplierContextType {
  // State
  suppliers: SupplierResponseDto[];
  loading: boolean;
  error: string | null;
  stats: SupplierStatsDto;
  
  // Actions
  loadSuppliers: () => Promise<void>;
  loadStats: () => Promise<void>;
  createSupplier: (data: CreateSupplierDto) => Promise<SupplierResponseDto>;
  updateSupplier: (id: string, data: UpdateSupplierDto) => Promise<SupplierResponseDto>;
  deleteSupplier: (id: string) => Promise<void>;
  getSupplierById: (id: string) => SupplierResponseDto | undefined;
  getSuppliersByStatus: (status: SupplierStatus) => Promise<SupplierResponseDto[]>;
  getSuppliersByCategory: (category: string) => Promise<SupplierResponseDto[]>;
  getActiveSuppliers: () => SupplierResponseDto[];
  getSuppliersByRating: (minRating: number) => SupplierResponseDto[];
  incrementSupplierOrders: (id: string) => Promise<SupplierResponseDto>;
  updateMonthlyDeliveries: (id: string, count: number) => Promise<SupplierResponseDto>;
  validateSupplier: (data: Partial<CreateSupplierDto | UpdateSupplierDto>) => string[];
  checkSupplierNameUnique: (name: string, excludeId?: string) => Promise<boolean>;
  checkSupplierEmailUnique: (email: string, excludeId?: string) => Promise<boolean>;
  checkSupplierTaxNumberUnique: (taxNumber: string, excludeId?: string) => Promise<boolean>;
  searchSuppliers: (searchTerm: string) => SupplierResponseDto[];
  refreshSuppliers: () => Promise<void>;
}

const SupplierContext = createContext<SupplierContextType | undefined>(undefined);

interface SupplierProviderProps {
  children: ReactNode;
}

export const SupplierProvider: React.FC<SupplierProviderProps> = ({ children }) => {
  const [suppliers, setSuppliers] = useState<SupplierResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SupplierStatsDto>({
    totalSuppliers: 0,
    activeSuppliers: 0,
    inactiveSuppliers: 0,
    pendingSuppliers: 0,
    averageRating: 0,
    suppliersByCategory: {},
    suppliersByStatus: {
      active: 0,
      inactive: 0,
      pending: 0
    },
    topSuppliers: [],
    monthlyStats: {
      totalOrders: 0,
      totalDeliveries: 0,
      averageDeliveryTime: 0
    }
  });
  const { showNotification } = useNotification();

  // Tedarikçileri yükle
  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await supplierApi.getAllSuppliers();
      
      // Handle API response structure
      if (response && response.data) {
        setSuppliers(response.data);
      } else {
        // Fallback for direct array response
        setSuppliers(response as any || []);
      }
    } catch (error) {
      console.error('Error loading suppliers:', error);
      setError('Tedarikçiler yüklenemedi');
      showNotification('error', 'Tedarikçiler yüklenirken hata oluştu');
      setSuppliers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // İstatistikleri yükle
  const loadStats = async () => {
    try {
      const statsData = await supplierApi.getSupplierStats();
      setStats(statsData);
      // console.log(`Toplam tedarikçi sayısı: ${statsData.totalSuppliers}`);
      // console.log(`Aktif tedarikçiler: ${statsData.activeSuppliers}`);
      // console.log(`Ortalama rating: ${statsData.averageRating}`);
    } catch (error) {
      console.error('Error loading supplier stats:', error);
      // Stats yüklenemezse fallback değerler
      const activeSuppliers = suppliers.filter(s => s.status === SupplierStatus.ACTIVE).length;
      const inactiveSuppliers = suppliers.filter(s => s.status === SupplierStatus.INACTIVE).length;
      const pendingSuppliers = suppliers.filter(s => s.status === SupplierStatus.PENDING).length;
      const totalRating = suppliers.reduce((sum, s) => sum + s.rating, 0);
      const averageRating = suppliers.length > 0 ? totalRating / suppliers.length : 0;
      
      // Category distribution
      const suppliersByCategory: { [key: string]: number } = {};
      suppliers.forEach(supplier => {
        suppliersByCategory[supplier.category] = (suppliersByCategory[supplier.category] || 0) + 1;
      });

      setStats(prev => ({
        ...prev,
        totalSuppliers: suppliers.length,
        activeSuppliers,
        inactiveSuppliers,
        pendingSuppliers,
        averageRating,
        suppliersByCategory,
        suppliersByStatus: {
          active: activeSuppliers,
          inactive: inactiveSuppliers,
          pending: pendingSuppliers
        }
      }));
    }
  };

  // Tedarikçi validasyon fonksiyonu
  const validateSupplier = (data: Partial<CreateSupplierDto | UpdateSupplierDto>): string[] => {
    const errors: string[] = [];

    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push('Tedarikçi adı zorunludur');
      } else if (data.name.trim().length < 2) {
        errors.push('Tedarikçi adı en az 2 karakter olmalıdır');
      } else if (data.name.trim().length > 100) {
        errors.push('Tedarikçi adı en fazla 100 karakter olabilir');
      }
    }

    if (data.email !== undefined) {
      if (!data.email || data.email.trim().length === 0) {
        errors.push('E-posta adresi zorunludur');
      } else {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(data.email)) {
          errors.push('Geçerli bir e-posta adresi giriniz');
        }
      }
    }

    if (data.phone !== undefined) {
      if (!data.phone || data.phone.trim().length === 0) {
        errors.push('Telefon numarası zorunludur');
      } else if (data.phone.length < 10) {
        errors.push('Telefon numarası en az 10 karakter olmalıdır');
      }
    }

    if (data.taxNumber !== undefined) {
      if (!data.taxNumber || data.taxNumber.trim().length === 0) {
        errors.push('Vergi numarası zorunludur');
      } else if (data.taxNumber.length !== 10 && data.taxNumber.length !== 11) {
        errors.push('Vergi numarası 10 veya 11 karakter olmalıdır');
      }
    }

    if (data.rating !== undefined) {
      if (data.rating < 0 || data.rating > 5) {
        errors.push('Rating 0-5 arasında olmalıdır');
      }
    }

    if (data.deliveryTime !== undefined) {
      if (data.deliveryTime < 0) {
        errors.push('Teslimat süresi 0 veya daha büyük olmalıdır');
      } else if (data.deliveryTime > 365) {
        errors.push('Teslimat süresi 365 günden fazla olamaz');
      }
    }

    if (data.minimumOrder !== undefined) {
      if (data.minimumOrder < 0) {
        errors.push('Minimum sipariş tutarı 0 veya daha büyük olmalıdır');
      }
    }

    if (data.category !== undefined) {
      if (!data.category || data.category.trim().length === 0) {
        errors.push('Kategori seçimi zorunludur');
      }
    }

    if (data.contactPerson !== undefined) {
      if (!data.contactPerson || data.contactPerson.trim().length === 0) {
        errors.push('İletişim kişisi zorunludur');
      }
    }

    if (data.address !== undefined) {
      if (!data.address || data.address.trim().length === 0) {
        errors.push('Adres zorunludur');
      } else if (data.address.length < 10) {
        errors.push('Adres en az 10 karakter olmalıdır');
      }
    }

    if (data.paymentTerms !== undefined) {
      if (!data.paymentTerms || data.paymentTerms.trim().length === 0) {
        errors.push('Ödeme koşulları zorunludur');
      }
    }

    if (data.contractStartDate && data.contractEndDate) {
      const startDate = new Date(data.contractStartDate);
      const endDate = new Date(data.contractEndDate);
      if (endDate <= startDate) {
        errors.push('Sözleşme bitiş tarihi başlangıç tarihinden sonra olmalıdır');
      }
    }

    return errors;
  };

  // Tedarikçi adı benzersizlik kontrolü
  const checkSupplierNameUnique = async (name: string, excludeId?: string): Promise<boolean> => {
    try {
      const existingSupplier = suppliers.find(s => 
        s.name.toLowerCase() === name.toLowerCase() && 
        (!excludeId || s.id !== excludeId)
      );
      return !existingSupplier;
    } catch (error) {
      console.error('Error checking supplier name uniqueness:', error);
      return true; // Default to allow if check fails
    }
  };

  // E-posta benzersizlik kontrolü
  const checkSupplierEmailUnique = async (email: string, excludeId?: string): Promise<boolean> => {
    try {
      const existingSupplier = suppliers.find(s => 
        s.email.toLowerCase() === email.toLowerCase() && 
        (!excludeId || s.id !== excludeId)
      );
      return !existingSupplier;
    } catch (error) {
      console.error('Error checking supplier email uniqueness:', error);
      return true; // Default to allow if check fails
    }
  };

  // Vergi numarası benzersizlik kontrolü
  const checkSupplierTaxNumberUnique = async (taxNumber: string, excludeId?: string): Promise<boolean> => {
    try {
      const existingSupplier = suppliers.find(s => 
        s.taxNumber === taxNumber && 
        (!excludeId || s.id !== excludeId)
      );
      return !existingSupplier;
    } catch (error) {
      console.error('Error checking supplier tax number uniqueness:', error);
      return true; // Default to allow if check fails
    }
  };

  // Tedarikçi oluştur
  const createSupplier = async (data: CreateSupplierDto): Promise<SupplierResponseDto> => {
    try {
      // Validasyon
      const errors = validateSupplier(data);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      // Benzersizlik kontrolleri
      const isNameUnique = await checkSupplierNameUnique(data.name);
      if (!isNameUnique) {
        throw new Error('Bu tedarikçi adı zaten mevcut');
      }

      const isEmailUnique = await checkSupplierEmailUnique(data.email);
      if (!isEmailUnique) {
        throw new Error('Bu e-posta adresi zaten mevcut');
      }

      const isTaxNumberUnique = await checkSupplierTaxNumberUnique(data.taxNumber);
      if (!isTaxNumberUnique) {
        throw new Error('Bu vergi numarası zaten mevcut');
      }

      const response = await supplierApi.createSupplier(data);
      let newSupplier: SupplierResponseDto;
      
      // Handle different response structures
      if (response?.data) {
        newSupplier = response.data;
      } else {
        newSupplier = response as any;
      }

      setSuppliers(prev => [...prev, newSupplier]);
      showNotification('success', 'Tedarikçi başarıyla oluşturuldu');
      
      // Stats'ları güncelle
      await loadStats();
      
      return newSupplier;
    } catch (error) {
      console.error('Error creating supplier:', error);
      const message = error instanceof Error ? error.message : 'Tedarikçi oluşturulamadı';
      showNotification('error', message);
      throw error;
    }
  };

  // Tedarikçi güncelle
  const updateSupplier = async (id: string, data: UpdateSupplierDto): Promise<SupplierResponseDto> => {
    try {
      // Validasyon
      const errors = validateSupplier(data);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      // Benzersizlik kontrolleri (kendi ID'si hariç)
      if (data.name) {
        const isNameUnique = await checkSupplierNameUnique(data.name, id);
        if (!isNameUnique) {
          throw new Error('Bu tedarikçi adı zaten mevcut');
        }
      }

      if (data.email) {
        const isEmailUnique = await checkSupplierEmailUnique(data.email, id);
        if (!isEmailUnique) {
          throw new Error('Bu e-posta adresi zaten mevcut');
        }
      }

      if (data.taxNumber) {
        const isTaxNumberUnique = await checkSupplierTaxNumberUnique(data.taxNumber, id);
        if (!isTaxNumberUnique) {
          throw new Error('Bu vergi numarası zaten mevcut');
        }
      }

      const response = await supplierApi.updateSupplier(id, data);
      let updatedSupplier: SupplierResponseDto;
      
      // Handle different response structures
      if (response?.data) {
        updatedSupplier = response.data;
      } else {
        updatedSupplier = response as any;
      }

      setSuppliers(prev => prev.map(supplier => supplier.id === id ? updatedSupplier : supplier));
      showNotification('success', 'Tedarikçi başarıyla güncellendi');
      
      // Stats'ları güncelle
      await loadStats();
      
      return updatedSupplier;
    } catch (error) {
      console.error('Error updating supplier:', error);
      const message = error instanceof Error ? error.message : 'Tedarikçi güncellenemedi';
      showNotification('error', message);
      throw error;
    }
  };

  // Tedarikçi sil
  const deleteSupplier = async (id: string): Promise<void> => {
    try {
      await supplierApi.deleteSupplier(id);
      setSuppliers(prev => prev.filter(supplier => supplier.id !== id));
      showNotification('success', 'Tedarikçi başarıyla silindi');
      
      // Stats'ları güncelle
      await loadStats();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      showNotification('error', 'Tedarikçi silinemedi. Bu tedarikçiyle ilişkili kayıtlar olabilir.');
      throw error;
    }
  };

  // ID'ye göre tedarikçi bul
  const getSupplierById = (id: string): SupplierResponseDto | undefined => {
    return suppliers.find(supplier => supplier.id === id);
  };

  // Duruma göre tedarikçileri getir
  const getSuppliersByStatus = async (status: SupplierStatus): Promise<SupplierResponseDto[]> => {
    try {
      const response = await supplierApi.getSuppliersByStatus(status);
      
      // Handle API response structure
      if (response && response.data) {
        return response.data;
      } else {
        return response as any || [];
      }
    } catch (error) {
      console.error('Error getting suppliers by status:', error);
      showNotification('error', 'Durum filtreleme işlemi başarısız oldu');
      
      // Fallback to local filter
      return suppliers.filter(supplier => supplier.status === status);
    }
  };

  // Kategoriye göre tedarikçileri getir
  const getSuppliersByCategory = async (category: string): Promise<SupplierResponseDto[]> => {
    try {
      const response = await supplierApi.getSuppliersByCategory(category);
      
      // Handle API response structure
      if (response && response.data) {
        return response.data;
      } else {
        return response as any || [];
      }
    } catch (error) {
      console.error('Error getting suppliers by category:', error);
      showNotification('error', 'Kategori filtreleme işlemi başarısız oldu');
      
      // Fallback to local filter
      return suppliers.filter(supplier => supplier.category === category);
    }
  };

  // Aktif tedarikçileri getir
  const getActiveSuppliers = (): SupplierResponseDto[] => {
    return suppliers.filter(supplier => supplier.status === SupplierStatus.ACTIVE);
  };

  // Rating'e göre tedarikçileri getir
  const getSuppliersByRating = (minRating: number): SupplierResponseDto[] => {
    return suppliers.filter(supplier => supplier.rating >= minRating);
  };

  // Tedarikçi sipariş sayısını artır
  const incrementSupplierOrders = async (id: string): Promise<SupplierResponseDto> => {
    try {
      const updatedSupplier = await supplierApi.incrementSupplierOrders(id);
      setSuppliers(prev => prev.map(supplier => supplier.id === id ? updatedSupplier : supplier));
      
      // Stats'ları güncelle
      await loadStats();
      
      return updatedSupplier;
    } catch (error) {
      console.error('Error incrementing supplier orders:', error);
      showNotification('error', 'Sipariş sayısı güncellenemedi');
      throw error;
    }
  };

  // Aylık teslimat sayısını güncelle
  const updateMonthlyDeliveries = async (id: string, count: number): Promise<SupplierResponseDto> => {
    try {
      const updatedSupplier = await supplierApi.updateMonthlyDeliveries(id, count);
      setSuppliers(prev => prev.map(supplier => supplier.id === id ? updatedSupplier : supplier));
      
      // Stats'ları güncelle
      await loadStats();
      
      return updatedSupplier;
    } catch (error) {
      console.error('Error updating monthly deliveries:', error);
      showNotification('error', 'Aylık teslimat sayısı güncellenemedi');
      throw error;
    }
  };

  // Tedarikçi ara
  const searchSuppliers = (searchTerm: string): SupplierResponseDto[] => {
    if (!searchTerm.trim()) return suppliers;
    
    const term = searchTerm.toLowerCase();
    return suppliers.filter(supplier =>
      supplier.name.toLowerCase().includes(term) ||
      supplier.contactPerson.toLowerCase().includes(term) ||
      supplier.email.toLowerCase().includes(term) ||
      supplier.phone.includes(term) ||
      supplier.category.toLowerCase().includes(term) ||
      supplier.taxNumber.includes(term)
    );
  };

  // Tedarikçileri yenile
  const refreshSuppliers = async (): Promise<void> => {
    await loadSuppliers();
    await loadStats();
  };

  // Component mount edildiğinde tedarikçileri ve stats'ları yükle
  useEffect(() => {
    loadSuppliers();
  }, []);

  // Suppliers değiştiğinde stats'ları güncelle
  useEffect(() => {
    if (suppliers.length >= 0) { // 0 or more suppliers
      loadStats();
    }
  }, [suppliers]);

  const value: SupplierContextType = {
    suppliers,
    loading,
    error,
    stats,
    loadSuppliers,
    loadStats,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
    getSuppliersByStatus,
    getSuppliersByCategory,
    getActiveSuppliers,
    getSuppliersByRating,
    incrementSupplierOrders,
    updateMonthlyDeliveries,
    validateSupplier,
    checkSupplierNameUnique,
    checkSupplierEmailUnique,
    checkSupplierTaxNumberUnique,
    searchSuppliers,
    refreshSuppliers
  };

  return (
    <SupplierContext.Provider value={value}>
      {children}
    </SupplierContext.Provider>
  );
};

// Custom hook
export const useSuppliers = (): SupplierContextType => {
  const context = useContext(SupplierContext);
  if (context === undefined) {
    throw new Error('useSuppliers must be used within a SupplierProvider');
  }
  return context;
};