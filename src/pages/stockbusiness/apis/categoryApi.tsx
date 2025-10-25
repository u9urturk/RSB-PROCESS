import { apiGet, apiPost, apiPut, apiDelete } from '@/api/httpClient';
import { ErrorHandlerService } from '@/utils/ErrorHandlerService';

// API response types
export interface Category {
  id: string;
  name: string;
  desc?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCategoryDto {
  name: string;
  desc?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  desc?: string;
}

// API response wrapper
export interface CategoryResponse {
  data: Category[];
  total: number;
}

export interface SingleCategoryResponse {
  data: Category;
}

// Stats interfaces
export interface CategoryStats {
  totalCategories: number;
  categoriesWithProducts: number;
  emptyCategories: number;
}

export interface CategoryWithProductCount {
  id: string;
  name: string;
  desc?: string;
  productCount: number;
}

// Category API Functions
export const categoryApi = {
  /**
   * Tüm kategorileri getirir
   * GET /categories
   */
  getAllCategories: async (): Promise<Category[]> => {
    try {
      console.log('Fetching all categories...');
      const response = await apiGet<Category[]>('/categories');
      console.log('Categories fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('Error fetching categories:', error);
      ErrorHandlerService.handleError(error, 'CategoryApi.getAllCategories');
      throw error;
    }
  },

  /**
   * ID'ye göre kategori getirir
   * GET /categories/:id
   */
  getCategoryById: async (id: string): Promise<Category> => {
    try {
      console.log('Fetching category by id:', id);
      const response = await apiGet<Category>(`/categories/${id}`);
      console.log('Category fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('Error fetching category:', error);
      ErrorHandlerService.handleError(error, 'CategoryApi.getCategoryById');
      throw error;
    }
  },

  /**
   * Yeni kategori oluşturur
   * POST /categories
   */
  createCategory: async (categoryData: CreateCategoryDto): Promise<Category> => {
    try {
      console.log('Creating category:', categoryData);
      const response = await apiPost<Category>('/categories', categoryData);
      console.log('Category created successfully:', response);
      return response;
    } catch (error) {
      console.error('Error creating category:', error);
      ErrorHandlerService.handleError(error, 'CategoryApi.createCategory');
      throw error;
    }
  },

  /**
   * Kategori günceller
   * PUT /categories/:id
   */
  updateCategory: async (id: string, categoryData: UpdateCategoryDto): Promise<Category> => {
    try {
      console.log('Updating category:', id, categoryData);
      const response = await apiPut<Category>(`/categories/${id}`, categoryData);
      console.log('Category updated successfully:', response);
      return response;
    } catch (error) {
      console.error('Error updating category:', error);
      ErrorHandlerService.handleError(error, 'CategoryApi.updateCategory');
      throw error;
    }
  },

  /**
   * Kategori siler
   * DELETE /categories/:id
   */
  deleteCategory: async (id: string): Promise<void> => {
    try {
      console.log('Deleting category:', id);
      await apiDelete(`/categories/${id}`);
      console.log('Category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      ErrorHandlerService.handleError(error, 'CategoryApi.deleteCategory');
      throw error;
    }
  },

  /**
   * Kategori adına göre arama yapar
   */
  searchCategories: async (searchTerm: string): Promise<Category[]> => {
    try {
      console.log('Searching categories with term:', searchTerm);
      const allCategories = await categoryApi.getAllCategories();
      
      const filteredCategories = allCategories.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.desc && category.desc.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      console.log('Categories search completed:', filteredCategories);
      return filteredCategories;
    } catch (error) {
      console.error('Error searching categories:', error);
      ErrorHandlerService.handleError(error, 'CategoryApi.searchCategories');
      throw error;
    }
  },

  /**
   * Kategori validasyonu yapar
   */
  validateCategory: (categoryData: CreateCategoryDto | UpdateCategoryDto): string[] => {
    const errors: string[] = [];

    if ('name' in categoryData && categoryData.name !== undefined) {
      if (!categoryData.name || categoryData.name.trim().length === 0) {
        errors.push('Kategori adı zorunludur');
      } else if (categoryData.name.length > 100) {
        errors.push('Kategori adı 100 karakterden fazla olamaz');
      }
    }

    if (categoryData.desc && categoryData.desc.length > 500) {
      errors.push('Kategori açıklaması 500 karakterden fazla olamaz');
    }

    return errors;
  },

  /**
   * Kategori adının benzersiz olup olmadığını kontrol eder
   */
  checkCategoryNameUnique: async (name: string, excludeId?: string): Promise<boolean> => {
    try {
      const categories = await categoryApi.getAllCategories();
      
      const existingCategory = categories.find(category => 
        category.name.toLowerCase() === name.toLowerCase() && 
        category.id !== excludeId
      );
      
      return !existingCategory;
    } catch (error) {
      console.error('Error checking category name uniqueness:', error);
      return true; // Hata durumunda işleme izin ver
    }
  },

  /**
   * Dashboard için kategori istatistiklerini getirir
   * GET /api/v1/categories/stats
   */
  getCategoryStats: async (): Promise<CategoryStats> => {
    try {
      const response = await apiGet<CategoryStats>('/categories/stats');
      return response;
    } catch (error) {
      console.error('Error fetching category stats:', error);
      ErrorHandlerService.handleError(error, 'CategoryApi.getCategoryStats');
      
      // Fallback: local hesaplama
      const categories = await categoryApi.getAllCategories();
      return {
        totalCategories: categories.length,
        categoriesWithProducts: 0,
        emptyCategories: 0
      };
    }
  },

  /**
   * Detaylı analitik için ürün sayılarıyla birlikte kategorileri getirir
   * GET /api/v1/categories/with-product-counts
   */
  getCategoriesWithProductCounts: async (): Promise<CategoryWithProductCount[]> => {
    try {
      console.log('Fetching categories with product counts...');
      const response = await apiGet<CategoryWithProductCount[]>('/api/v1/categories/with-product-counts');
      console.log('Categories with product counts fetched successfully:', response);
      return response;
    } catch (error) {
      console.error('Error fetching categories with product counts:', error);
      ErrorHandlerService.handleError(error, 'CategoryApi.getCategoriesWithProductCounts');
      
      // Fallback: temel kategoriler
      const categories = await categoryApi.getAllCategories();
      return categories.map(category => ({
        id: category.id,
        name: category.name,
        desc: category.desc,
        productCount: 0
      }));
    }
  }
};

export default categoryApi;