import { apiGet, apiPost, apiPut, apiDelete } from '@/api/httpClient';
import { ErrorHandlerService } from '@/utils/ErrorHandlerService';

// API response types
export interface BaseUnit {
  id: string;
  name: string;
  desc?: string;
  symbol?: string;
  shortName: string;
  conversionFactor?: number;
  baseUnit?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  products?: any[]; // Product referansları
}

export interface CreateBaseUnitDto {
  name: string;
  desc?: string;
  symbol?: string;
  shortName: string;
  conversionFactor?: number;
  baseUnit?: string;
  isActive: boolean;
}

export interface UpdateBaseUnitDto {
  name?: string;
  desc?: string;
  symbol?: string;
  shortName?: string;
  conversionFactor?: number;
  baseUnit?: string;
  isActive?: boolean;
}

// API response wrapper
export interface BaseUnitResponse {
  data: BaseUnit[];
  total: number;
}

export interface SingleBaseUnitResponse {
  data: BaseUnit;
}

// Stats interfaces
export interface BaseUnitStats {
  totalUnits: number;
  activeUnits: number;
  inactiveUnits: number;
  unitsWithProducts: number;
}

// Base Unit API Functions
export const baseUnitApi = {
  /**
   * Tüm birimleri getirir
   * GET /base-units
   */
  getAllBaseUnits: async (): Promise<BaseUnit[]> => {
    try {
      console.log('Fetching all base units...');
      const response = await apiGet<BaseUnit[]>('/base-units');
      console.log('Base units fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('Error fetching base units:', error);
      ErrorHandlerService.handleError(error, 'BaseUnitApi.getAllBaseUnits');
      throw error;
    }
  },

  /**
   * ID'ye göre birim getirir
   * GET /base-units/:id
   */
  getBaseUnitById: async (id: string): Promise<BaseUnit> => {
    try {
      console.log(`Fetching base unit with id: ${id}`);
      const response = await apiGet<BaseUnit>(`/base-units/${id}`);
      console.log('Base unit fetched successfully:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching base unit with id ${id}:`, error);
      ErrorHandlerService.handleError(error, 'BaseUnitApi.getBaseUnitById');
      throw error;
    }
  },

  /**
   * Yeni birim oluşturur
   * POST /base-units
   */
  createBaseUnit: async (data: CreateBaseUnitDto): Promise<BaseUnit> => {
    try {
      console.log('Creating base unit:', data);
      
      // Frontend validasyonu
      const errors = baseUnitApi.validateBaseUnit(data);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      const response = await apiPost<BaseUnit>('/base-units', data);
      console.log('Base unit created successfully:', response);
      return response;
    } catch (error) {
      console.error('Error creating base unit:', error);
      ErrorHandlerService.handleError(error, 'BaseUnitApi.createBaseUnit');
      throw error;
    }
  },

  /**
   * Birim günceller
   * PUT /base-units/:id
   */
  updateBaseUnit: async (id: string, data: UpdateBaseUnitDto): Promise<BaseUnit> => {
    try {
      console.log(`Updating base unit ${id}:`, data);
      
      // Frontend validasyonu
      const errors = baseUnitApi.validateBaseUnit(data);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      const response = await apiPut<BaseUnit>(`/base-units/${id}`, data);
      console.log('Base unit updated successfully:', response);
      return response;
    } catch (error) {
      console.error(`Error updating base unit with id ${id}:`, error);
      ErrorHandlerService.handleError(error, 'BaseUnitApi.updateBaseUnit');
      throw error;
    }
  },

  /**
   * Birim siler
   * DELETE /base-units/:id
   */
  deleteBaseUnit: async (id: string): Promise<void> => {
    try {
      console.log(`Deleting base unit with id: ${id}`);
      await apiDelete(`/base-units/${id}`);
      console.log('Base unit deleted successfully');
    } catch (error) {
      console.error(`Error deleting base unit with id ${id}:`, error);
      ErrorHandlerService.handleError(error, 'BaseUnitApi.deleteBaseUnit');
      throw error;
    }
  },

  /**
   * Birim adının benzersizliğini kontrol eder
   */
  checkBaseUnitNameUnique: async (name: string, excludeId?: string): Promise<boolean> => {
    try {
      const baseUnits = await baseUnitApi.getAllBaseUnits();
      
      const existingBaseUnit = baseUnits.find(unit => 
        unit.name.toLowerCase() === name.toLowerCase() && 
        unit.id !== excludeId
      );
      
      return !existingBaseUnit;
    } catch (error) {
      console.error('Error checking base unit name uniqueness:', error);
      return true; // Hata durumunda işleme izin ver
    }
  },

  /**
   * Sembol benzersizliğini kontrol eder
   */
  checkBaseUnitSymbolUnique: async (symbol: string, excludeId?: string): Promise<boolean> => {
    try {
      const baseUnits = await baseUnitApi.getAllBaseUnits();
      
      const existingBaseUnit = baseUnits.find(unit => 
        unit.symbol?.toLowerCase() === symbol.toLowerCase() && 
        unit.id !== excludeId
      );
      
      return !existingBaseUnit;
    } catch (error) {
      console.error('Error checking base unit symbol uniqueness:', error);
      return true; // Hata durumunda işleme izin ver
    }
  },

  /**
   * Kısa ad benzersizliğini kontrol eder
   */
  checkBaseUnitShortNameUnique: async (shortName: string, excludeId?: string): Promise<boolean> => {
    try {
      const baseUnits = await baseUnitApi.getAllBaseUnits();
      
      const existingBaseUnit = baseUnits.find(unit => 
        unit.shortName.toLowerCase() === shortName.toLowerCase() && 
        unit.id !== excludeId
      );
      
      return !existingBaseUnit;
    } catch (error) {
      console.error('Error checking base unit short name uniqueness:', error);
      return true; // Hata durumunda işleme izin ver
    }
  },

  /**
   * Dashboard için birim istatistiklerini getirir
   */
  getBaseUnitStats: async (): Promise<BaseUnitStats> => {
    try {
      console.log('Fetching base unit stats...');
      const response = await apiGet<BaseUnitStats>('/base-units/stats');
      console.log('Base unit stats fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('Error fetching base unit stats:', error);
      ErrorHandlerService.handleError(error, 'BaseUnitApi.getBaseUnitStats');
      
      // Fallback: local hesaplama
      const baseUnits = await baseUnitApi.getAllBaseUnits();
      return {
        totalUnits: baseUnits.length,
        activeUnits: baseUnits.filter(unit => unit.isActive).length,
        inactiveUnits: baseUnits.filter(unit => !unit.isActive).length,
        unitsWithProducts: 0 // Backend'den gelecek
      };
    }
  },

  /**
   * Sadece aktif birimleri getirir
   */
  getActiveBaseUnits: async (): Promise<BaseUnit[]> => {
    try {
      const allUnits = await baseUnitApi.getAllBaseUnits();
      return allUnits.filter(unit => unit.isActive);
    } catch (error) {
      console.error('Error fetching active base units:', error);
      throw error;
    }
  },

  /**
   * Birim validasyon fonksiyonu
   */
  validateBaseUnit: (data: CreateBaseUnitDto | UpdateBaseUnitDto): string[] => {
    const errors: string[] = [];

    // Name validasyonu
    if ('name' in data && data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push('Birim adı zorunludur');
      } else if (data.name.trim().length < 2) {
        errors.push('Birim adı en az 2 karakter olmalıdır');
      } else if (data.name.trim().length > 100) {
        errors.push('Birim adı en fazla 100 karakter olabilir');
      }
    }

    // Short name validasyonu
    if ('shortName' in data && data.shortName !== undefined) {
      if (!data.shortName || data.shortName.trim().length === 0) {
        errors.push('Kısa ad zorunludur');
      } else if (data.shortName.trim().length < 1) {
        errors.push('Kısa ad en az 1 karakter olmalıdır');
      } else if (data.shortName.trim().length > 10) {
        errors.push('Kısa ad en fazla 10 karakter olabilir');
      }
    }

    // Symbol validasyonu
    if ('symbol' in data && data.symbol !== undefined && data.symbol.trim().length > 0) {
      if (data.symbol.trim().length > 10) {
        errors.push('Sembol en fazla 10 karakter olabilir');
      }
    }

    // Description validasyonu
    if ('desc' in data && data.desc !== undefined && data.desc.trim().length > 0) {
      if (data.desc.trim().length > 500) {
        errors.push('Açıklama en fazla 500 karakter olabilir');
      }
    }

    // Conversion factor validasyonu
    if ('conversionFactor' in data && data.conversionFactor !== undefined) {
      if (data.conversionFactor <= 0) {
        errors.push('Dönüşüm faktörü 0\'dan büyük olmalıdır');
      }
    }

    return errors;
  },

  /**
   * Birim ara
   */
  searchBaseUnits: async (searchTerm: string): Promise<BaseUnit[]> => {
    try {
      const allUnits = await baseUnitApi.getAllBaseUnits();
      
      if (!searchTerm.trim()) return allUnits;
      
      const term = searchTerm.toLowerCase();
      return allUnits.filter(unit =>
        unit.name.toLowerCase().includes(term) ||
        unit.shortName.toLowerCase().includes(term) ||
        (unit.symbol && unit.symbol.toLowerCase().includes(term)) ||
        (unit.desc && unit.desc.toLowerCase().includes(term))
      );
    } catch (error) {
      console.error('Error searching base units:', error);
      throw error;
    }
  }
};

export default baseUnitApi;