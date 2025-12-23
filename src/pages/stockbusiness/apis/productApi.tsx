import { apiGet, apiPost, apiPut, apiDelete } from '@/api/httpClient';
import { ErrorHandlerService } from '@/utils/ErrorHandlerService';

// Product Status Enum (matching backend Prisma enum)
export enum ProductStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  DRAFT = 'DRAFT'
}

// Create Product DTO Interface
export interface CreateProductDto {
  name: string;
  description?: string;
  note?: string;
  imageUrls?: string[];
  status: ProductStatus;
  categoryId: string;
  stockTypeId: string;
  baseUnitId: string;
}

// Update Product DTO Interface
export interface UpdateProductDto {
  name?: string;
  description?: string;
  note?: string;
  imageUrls?: string[];
  status?: ProductStatus;
  categoryId?: string;
  stockTypeId?: string;
  baseUnitId?: string;
}

// Product Response DTO Interface
export interface ProductResponseDto {
  id: string;
  barcode?: string;
  name: string;
  description?: string;
  note?: string;
  imageUrls: string[];
  status: ProductStatus;
  categoryId: string;
  stockTypeId: string;
  baseUnitId: string;
  createdAt: string; // ISO string format from backend
  updatedAt: string; // ISO string format from backend
  // Relations from backend (optional based on include queries)
  category?: any;
  stockType?: any;
  baseUnit?: any;
  stockItems?: any[];
  inventoryId?: string;
  inventory?: {
    id: string;
    minStockLevel: number;
    maxStockLevel: number;
    totalQuantity?: number;
  }
  minStockLevel?: number;
  maxStockLevel?: number;
  totalStock?: number;
}

// Product List Response DTO Interface
export interface ProductListResponseDto {
  success: boolean;
  data: ProductResponseDto[];
  timestamp: string;
}

// Product Single Response DTO Interface
export interface ProductSingleResponseDto {
  success: boolean;
  data: ProductResponseDto;
  timestamp: string;
}

// API Functions
export const productApi = {
  /**
   * Get all products
   * GET /products
   */
  getAllProducts: async (): Promise<ProductListResponseDto> => {
    try {
      const response = await apiGet('/products');
      // console.log('Get all products response:', response);
      return response;
    } catch (error) {
      console.error('Get all products error:', error);
      ErrorHandlerService.handleError(error, 'ProductApi.getAllProducts');
      throw error;
    }
  },

  /**
   * Get product by ID
   * GET /products/:id
   */
  getProductById: async (id: string): Promise<ProductSingleResponseDto> => {
    try {
      const response = await apiGet(`/products/${id}`);
      // console.log(`Get product ${id} response:`, response);
      return response;
    } catch (error) {
      console.error(`Get product ${id} error:`, error);
      ErrorHandlerService.handleError(error, 'ProductApi.getProductById');
      throw error;
    }
  },

  /**
   * Create new product
   * POST /products
   */
  createProduct: async (productData: CreateProductDto): Promise<ProductResponseDto> => {
    try {
      const response = await apiPost('/products', productData);
      // console.log('Create product response:', response);
      return response;
    } catch (error) {
      console.error('Create product error:', error);
      ErrorHandlerService.handleError(error, 'ProductApi.createProduct');
      throw error;
    }
  },

  /**
   * Update product
   * PUT /products/:id
   */
  updateProduct: async (id: string, productData: UpdateProductDto): Promise<ProductSingleResponseDto> => {
    try {
      const response = await apiPut(`/products/${id}`, productData);
      // console.log(`Update product ${id} response:`, response);
      return response;
    } catch (error) {
      console.error(`Update product ${id} error:`, error);
      ErrorHandlerService.handleError(error, 'ProductApi.updateProduct');
      throw error;
    }
  },

  /**
   * Delete product
   * DELETE /products/:id
   */
  deleteProduct: async (id: string): Promise<void> => {
    try {
      await apiDelete(`/products/${id}`);
      // console.log(`Delete product ${id} success`);
    } catch (error) {
      console.error(`Delete product ${id} error:`, error);
      ErrorHandlerService.handleError(error, 'ProductApi.deleteProduct');
      throw error;
    }
  },

  /**
   * Get products by status
   * GET /products?status=ACTIVE
   */
  getProductsByStatus: async (status: ProductStatus): Promise<ProductListResponseDto> => {
    try {
      const response = await apiGet(`/products?status=${status}`);
      // console.log(`Get products by status ${status} response:`, response);
      return response;
    } catch (error) {
      console.error(`Get products by status ${status} error:`, error);
      ErrorHandlerService.handleError(error, 'ProductApi.getProductsByStatus');
      throw error;
    }
  },

  /**
   * Get products by category
   * GET /products?categoryId=uuid
   */
  getProductsByCategory: async (categoryId: string): Promise<ProductListResponseDto> => {
    try {
      const response = await apiGet(`/products?categoryId=${categoryId}`);
      // console.log(`Get products by category ${categoryId} response:`, response);
      return response;
    } catch (error) {
      console.error(`Get products by category ${categoryId} error:`, error);
      ErrorHandlerService.handleError(error, 'ProductApi.getProductsByCategory');
      throw error;
    }
  },

  /**
   * Get products by stock type
   * GET /products?stockTypeId=uuid
   */
  getProductsByStockType: async (stockTypeId: string): Promise<ProductListResponseDto> => {
    try {
      const response = await apiGet(`/products?stockTypeId=${stockTypeId}`);
      // console.log(`Get products by stock type ${stockTypeId} response:`, response);
      return response;
    } catch (error) {
      console.error(`Get products by stock type ${stockTypeId} error:`, error);
      ErrorHandlerService.handleError(error, 'ProductApi.getProductsByStockType');
      throw error;
    }
  },

  /**
   * Search products by name
   * GET /products?search=query
   */
  searchProducts: async (searchQuery: string): Promise<ProductListResponseDto> => {
    try {
      const response = await apiGet(`/products?search=${encodeURIComponent(searchQuery)}`);
      // console.log(`Search products "${searchQuery}" response:`, response);
      return response;
    } catch (error) {
      console.error(`Search products "${searchQuery}" error:`, error);
      ErrorHandlerService.handleError(error, 'ProductApi.searchProducts');
      throw error;
    }
  },


};

export default productApi;