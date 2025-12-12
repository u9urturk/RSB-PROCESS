import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import productApi, { 
  ProductResponseDto, 
  CreateProductDto, 
  UpdateProductDto, 
  ProductStatus
} from '../apis/productApi';
import { useNotification } from '../../../context/provider/NotificationProvider';

// Product Statistics Interface
interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  draftProducts: number;
  productsByCategory: { [categoryId: string]: number };
  productsByStockType: { [stockTypeId: string]: number };
  productsWithBarcode: number;
  productsWithoutBarcode: number;
}

interface ProductContextType {
  // State
  products: ProductResponseDto[];
  loading: boolean;
  error: string | null;
  stats: ProductStats;
  
  // Actions
  loadProducts: () => Promise<void>;
  loadStats: () => Promise<void>;
  createProduct: (data: CreateProductDto) => Promise<ProductResponseDto>;
  updateProduct: (id: string, data: UpdateProductDto) => Promise<ProductResponseDto>;
  deleteProduct: (id: string) => Promise<void>;
  getProductById: (id: string) => ProductResponseDto | undefined;
  searchProducts: (searchTerm: string) => Promise<ProductResponseDto[]>;
  getProductsByStatus: (status: ProductStatus) => Promise<ProductResponseDto[]>;
  getProductsByCategory: (categoryId: string) => Promise<ProductResponseDto[]>;
  getProductsByStockType: (stockTypeId: string) => Promise<ProductResponseDto[]>;
  getActiveProducts: () => ProductResponseDto[];
  validateProduct: (data: Partial<CreateProductDto | UpdateProductDto>) => string[];
  checkProductNameUnique: (name: string, excludeId?: string) => Promise<boolean>;
  refreshProducts: () => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

interface ProductProviderProps {
  children: ReactNode;
}

export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<ProductResponseDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<ProductStats>({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
    draftProducts: 0,
    productsByCategory: {},
    productsByStockType: {},
    productsWithBarcode: 0,
    productsWithoutBarcode: 0
  });
  const { showNotification } = useNotification();

  // Ürünleri yükle
  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await productApi.getAllProducts();
      
      // Handle API response structure
      if (response && response.data) {
        setProducts(response.data);
      } else {
        // Fallback for direct array response
        setProducts(response as any || []);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Ürünler yüklenemedi');
      showNotification('error', 'Ürünler yüklenirken hata oluştu');
      setProducts([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // İstatistikleri yükle
  const loadStats = async () => {
    try {
      // Local stats calculation since no API endpoint for product stats
      const activeProducts = products.filter(p => p.status === ProductStatus.ACTIVE).length;
      const inactiveProducts = products.filter(p => p.status === ProductStatus.INACTIVE).length;
      const draftProducts = products.filter(p => p.status === ProductStatus.DRAFT).length;
      
      // Category distribution
      const productsByCategory: { [categoryId: string]: number } = {};
      products.forEach(product => {
        productsByCategory[product.categoryId] = (productsByCategory[product.categoryId] || 0) + 1;
      });

      // Stock type distribution
      const productsByStockType: { [stockTypeId: string]: number } = {};
      products.forEach(product => {
        productsByStockType[product.stockTypeId] = (productsByStockType[product.stockTypeId] || 0) + 1;
      });

      // Barcode statistics
      const productsWithBarcode = products.filter(p => p.barcode && p.barcode.trim()).length;
      const productsWithoutBarcode = products.length - productsWithBarcode;

      setStats({
        totalProducts: products.length,
        activeProducts,
        inactiveProducts,
        draftProducts,
        productsByCategory,
        productsByStockType,
        productsWithBarcode,
        productsWithoutBarcode
      });

      // console.log(`Toplam ürün sayısı: ${products.length}`);
      // console.log(`Aktif ürünler: ${activeProducts}`);
      // console.log(`Barkodlu ürünler: ${productsWithBarcode}`);
    } catch (error) {
      console.error('Error calculating product stats:', error);
    }
  };

  // Ürün validasyon fonksiyonu
  const validateProduct = (data: Partial<CreateProductDto | UpdateProductDto>): string[] => {
    const errors: string[] = [];

    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        errors.push('Ürün adı zorunludur');
      } else if (data.name.trim().length < 2) {
        errors.push('Ürün adı en az 2 karakter olmalıdır');
      } else if (data.name.trim().length > 200) {
        errors.push('Ürün adı en fazla 200 karakter olabilir');
      }
    }

    if (data.description !== undefined && data.description) {
      if (data.description.length > 1000) {
        errors.push('Açıklama en fazla 1000 karakter olabilir');
      }
    }

    if (data.note !== undefined && data.note) {
      if (data.note.length > 500) {
        errors.push('Not en fazla 500 karakter olabilir');
      }
    }

    if (data.categoryId !== undefined && (!data.categoryId || data.categoryId.trim().length === 0)) {
      errors.push('Kategori seçimi zorunludur');
    }

    if (data.stockTypeId !== undefined && (!data.stockTypeId || data.stockTypeId.trim().length === 0)) {
      errors.push('Stok tipi seçimi zorunludur');
    }

    if (data.baseUnitId !== undefined && (!data.baseUnitId || data.baseUnitId.trim().length === 0)) {
      errors.push('Birim seçimi zorunludur');
    }

    if (data.imageUrls !== undefined && data.imageUrls) {
      if (data.imageUrls.length > 5) {
        errors.push('En fazla 5 görsel eklenebilir');
      }
      
      // URL validation
      const urlPattern = /^https?:\/\/.+/;
      data.imageUrls.forEach((url, index) => {
        if (url && !urlPattern.test(url)) {
          errors.push(`${index + 1}. görsel URL'si geçersiz`);
        }
      });
    }

    return errors;
  };

  // Ürün adı benzersizlik kontrolü
  const checkProductNameUnique = async (name: string, excludeId?: string): Promise<boolean> => {
    try {
      // Local check since no specific API endpoint
      const existingProduct = products.find(p => 
        p.name.toLowerCase() === name.toLowerCase() && 
        (!excludeId || p.id !== excludeId)
      );
      return !existingProduct;
    } catch (error) {
      console.error('Error checking product name uniqueness:', error);
      return true; // Default to allow if check fails
    }
  };

 
  // Ürün oluştur
  const createProduct = async (data: CreateProductDto): Promise<ProductResponseDto> => {
    try {
      // Validasyon
      const errors = validateProduct(data);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      // Benzersizlik kontrolleri
      const isNameUnique = await checkProductNameUnique(data.name);
      if (!isNameUnique) {
        throw new Error('Bu ürün adı zaten mevcut');
      }


      const response = await productApi.createProduct(data);
      let newProduct: ProductResponseDto;
      
      // Handle different response structures
      if (response) {
        newProduct = response;
      } else {
        newProduct = response as any;
      }

      setProducts(prev => [...prev, newProduct]);
      // console.log('Ürün oluşturuldu.')      
      // Stats'ları güncelle
      await loadStats();
      
      return newProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      const message = error instanceof Error ? error.message : 'Ürün oluşturulamadı';
      showNotification('error', message);
      throw error;
    }
  };

  // Ürün güncelle
  const updateProduct = async (id: string, data: UpdateProductDto): Promise<ProductResponseDto> => {
    try {
      // Validasyon
      const errors = validateProduct(data);
      if (errors.length > 0) {
        throw new Error(errors.join(', '));
      }

      // Benzersizlik kontrolleri (kendi ID'si hariç)
      if (data.name) {
        const isNameUnique = await checkProductNameUnique(data.name, id);
        if (!isNameUnique) {
          throw new Error('Bu ürün adı zaten mevcut');
        }
      }


      const response = await productApi.updateProduct(id, data);
      let updatedProduct: ProductResponseDto;
      
      // Handle different response structures
      if (response?.data) {
        updatedProduct = response.data;
      } else {
        updatedProduct = response as any;
      }

      setProducts(prev => prev.map(product => product.id === id ? updatedProduct : product));
      // console.log('Ürün güncellendi.')
      // Stats'ları güncelle
      await loadStats();
      
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      const message = error instanceof Error ? error.message : 'Ürün güncellenemedi';
      showNotification('error', message);
      throw error;
    }
  };

  // Ürün sil
  const deleteProduct = async (id: string): Promise<void> => {
    try {
      await productApi.deleteProduct(id);
      setProducts(prev => prev.filter(product => product.id !== id));
      // console.log('Ürün silindi.')      
      // Stats'ları güncelle
      await loadStats();
    } catch (error) {
      console.error('Error deleting product:', error);
      showNotification('error', 'Ürün silinemedi. Bu ürünle ilişkili stok kayıtları olabilir.');
      throw error;
    }
  };

  // ID'ye göre ürün bul
  const getProductById = (id: string): ProductResponseDto | undefined => {
    return products.find(product => product.id === id);
  };

  // Ürün ara
  const searchProducts = async (searchTerm: string): Promise<ProductResponseDto[]> => {
    try {
      if (!searchTerm.trim()) return products;
      
      const response = await productApi.searchProducts(searchTerm);
      
      // Handle API response structure
      if (response && response.data) {
        return response.data;
      } else {
        return response as any || [];
      }
    } catch (error) {
      console.error('Error searching products:', error);
      showNotification('error', 'Arama işlemi başarısız oldu');
      
      // Fallback to local search
      const term = searchTerm.toLowerCase();
      return products.filter(product =>
        product.name.toLowerCase().includes(term) ||
        (product.barcode && product.barcode.toLowerCase().includes(term)) ||
        (product.description && product.description.toLowerCase().includes(term))
      );
    }
  };

  // Duruma göre ürünleri getir
  const getProductsByStatus = async (status: ProductStatus): Promise<ProductResponseDto[]> => {
    try {
      const response = await productApi.getProductsByStatus(status);
      
      // Handle API response structure
      if (response && response.data) {
        return response.data;
      } else {
        return response as any || [];
      }
    } catch (error) {
      console.error('Error getting products by status:', error);
      showNotification('error', 'Durum filtreleme işlemi başarısız oldu');
      
      // Fallback to local filter
      return products.filter(product => product.status === status);
    }
  };

  // Kategoriye göre ürünleri getir
  const getProductsByCategory = async (categoryId: string): Promise<ProductResponseDto[]> => {
    try {
      const response = await productApi.getProductsByCategory(categoryId);
      
      // Handle API response structure
      if (response && response.data) {
        return response.data;
      } else {
        return response as any || [];
      }
    } catch (error) {
      console.error('Error getting products by category:', error);
      showNotification('error', 'Kategori filtreleme işlemi başarısız oldu');
      
      // Fallback to local filter
      return products.filter(product => product.categoryId === categoryId);
    }
  };

  // Stok tipine göre ürünleri getir
  const getProductsByStockType = async (stockTypeId: string): Promise<ProductResponseDto[]> => {
    try {
      const response = await productApi.getProductsByStockType(stockTypeId);
      
      // Handle API response structure
      if (response && response.data) {
        return response.data;
      } else {
        return response as any || [];
      }
    } catch (error) {
      console.error('Error getting products by stock type:', error);
      showNotification('error', 'Stok tipi filtreleme işlemi başarısız oldu');
      
      // Fallback to local filter
      return products.filter(product => product.stockTypeId === stockTypeId);
    }
  };

  // Sadece aktif ürünleri getir
  const getActiveProducts = (): ProductResponseDto[] => {
    return products.filter(product => product.status === ProductStatus.ACTIVE);
  };

  // Ürünleri yenile
  const refreshProducts = async (): Promise<void> => {
    await loadProducts();
    await loadStats();
  };

  // Component mount edildiğinde ürünleri ve stats'ları yükle
  useEffect(() => {
    loadProducts();
  }, []);

  // Ürünler değiştiğinde stats'ları güncelle
  useEffect(() => {
    if (products.length >= 0) { // 0 or more products
      loadStats();
    }
  }, [products]);

  const value: ProductContextType = {
    products,
    loading,
    error,
    stats,
    loadProducts,
    loadStats,
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    searchProducts,
    getProductsByStatus,
    getProductsByCategory,
    getProductsByStockType,
    getActiveProducts,
    validateProduct,
    checkProductNameUnique,
    refreshProducts
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

// Custom hook
export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};