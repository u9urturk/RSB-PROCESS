import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { categoryApi, Category, CreateCategoryDto, UpdateCategoryDto, CategoryStats, CategoryWithProductCount } from '../apis/categoryApi';
import { useNotification } from '../../../context/provider/NotificationProvider';

interface CategoryContextType {
  // State
  categories: Category[];
  loading: boolean;
  error: string | null;
  stats: CategoryStats;
  
  // Actions
  loadCategories: () => Promise<void>;
  loadStats: () => Promise<void>;
  createCategory: (data: CreateCategoryDto) => Promise<Category>;
  updateCategory: (id: string, data: UpdateCategoryDto) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
  searchCategories: (searchTerm: string) => Category[];
  getCategoriesWithProductCounts: () => Promise<CategoryWithProductCount[]>;
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined);

interface CategoryProviderProps {
  children: ReactNode;
}

export const CategoryProvider: React.FC<CategoryProviderProps> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<CategoryStats>({
    totalCategories: 0,
    categoriesWithProducts: 0,
    emptyCategories: 0
  });
  const { showNotification } = useNotification();

  // Kategorileri yükle
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryApi.getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Kategoriler yüklenemedi');
      showNotification('error', 'Kategoriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // İstatistikleri yükle
  const loadStats = async () => {
    try {
      const statsData = await categoryApi.getCategoryStats();
      setStats(statsData);
      // console.log(`Ürünü olan kategoriler: ${statsData.categoriesWithProducts}`);
      // console.log(`Boş kategoriler: ${statsData.emptyCategories}`);
    } catch (error) {
      console.error('Error loading category stats:', error);
      // Stats yüklenemezse fallback değerler
      setStats({
        totalCategories: categories.length,
        categoriesWithProducts: 0,
        emptyCategories: 0
      });
    }
  };

  // Detaylı analitik için kategorileri ürün sayılarıyla getir
  const getCategoriesWithProductCounts = async (): Promise<CategoryWithProductCount[]> => {
    try {
      const categoriesWithCounts = await categoryApi.getCategoriesWithProductCounts();
      // console.log('Categories with product counts:', categoriesWithCounts);
      return categoriesWithCounts;
    } catch (error) {
      console.error('Error getting categories with product counts:', error);
      throw error;
    }
  };

  // Kategori oluştur
  const createCategory = async (data: CreateCategoryDto): Promise<Category> => {
    try {
      // Validasyon
      const errors = categoryApi.validateCategory(data);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      // Benzersizlik kontrolü
      const isUnique = await categoryApi.checkCategoryNameUnique(data.name);
      if (!isUnique) {
        throw new Error('Bu kategori adı zaten mevcut');
      }

      const newCategory = await categoryApi.createCategory(data);
      setCategories(prev => [...prev, newCategory]);
      showNotification('success', 'Kategori başarıyla oluşturuldu');
      
      // Stats'ları güncelle
      await loadStats();
      
      return newCategory;
    } catch (error) {
      console.error('Error creating category:', error);
      const message = error instanceof Error ? error.message : 'Kategori oluşturulamadı';
      showNotification('error', message);
      throw error;
    }
  };

  // Kategori güncelle
  const updateCategory = async (id: string, data: UpdateCategoryDto): Promise<Category> => {
    try {
      // Validasyon
      const errors = categoryApi.validateCategory(data);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      // Benzersizlik kontrolü (kendi ID'si hariç)
      if (data.name) {
        const isUnique = await categoryApi.checkCategoryNameUnique(data.name, id);
        if (!isUnique) {
          throw new Error('Bu kategori adı zaten mevcut');
        }
      }

      const updatedCategory = await categoryApi.updateCategory(id, data);
      setCategories(prev => prev.map(cat => cat.id === id ? updatedCategory : cat));
      showNotification('success', 'Kategori başarıyla güncellendi');
      
      // Stats'ları güncelle
      await loadStats();
      
      return updatedCategory;
    } catch (error) {
      console.error('Error updating category:', error);
      const message = error instanceof Error ? error.message : 'Kategori güncellenemedi';
      showNotification('error', message);
      throw error;
    }
  };

  // Kategori sil
  const deleteCategory = async (id: string): Promise<void> => {
    try {
      await categoryApi.deleteCategory(id);
      setCategories(prev => prev.filter(cat => cat.id !== id));
      showNotification('success', 'Kategori başarıyla silindi');
      
      // Stats'ları güncelle
      await loadStats();
    } catch (error) {
      console.error('Error deleting category:', error);
      showNotification('error', 'Kategori silinemedi');
      throw error;
    }
  };

  // ID'ye göre kategori bul
  const getCategoryById = (id: string): Category | undefined => {
    return categories.find(cat => cat.id === id);
  };

  // Kategori ara
  const searchCategories = (searchTerm: string): Category[] => {
    if (!searchTerm.trim()) return categories;
    
    const term = searchTerm.toLowerCase();
    return categories.filter(category =>
      category.name.toLowerCase().includes(term) ||
      (category.desc && category.desc.toLowerCase().includes(term))
    );
  };

  // Component mount edildiğinde kategorileri ve stats'ları yükle
  useEffect(() => {
    loadCategories();
    loadStats();
  }, []);

  // Kategoriler değiştiğinde stats'ları güncelle
  useEffect(() => {
    if (categories.length > 0) {
      loadStats();
    }
  }, [categories]);

  const value: CategoryContextType = {
    categories,
    loading,
    error,
    stats,
    loadCategories,
    loadStats,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryById,
    searchCategories,
    getCategoriesWithProductCounts
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
};

// Custom hook
export const useCategories = (): CategoryContextType => {
  const context = useContext(CategoryContext);
  if (context === undefined) {
    throw new Error('useCategories must be used within a CategoryProvider');
  }
  return context;
};