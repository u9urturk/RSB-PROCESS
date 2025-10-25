import { BaseEntity } from ".";

// ===== STOCK & INVENTORY TYPES =====
export interface Unit extends BaseEntity {
    name: string;
    shortName: string;
    category: 'weight' | 'volume' | 'count' | 'package';
    conversionFactor?: number;
    baseUnit?: string;
    symbol: string;
    description: string;
    isActive: boolean;
}

export interface StockType extends BaseEntity {
    name: string;
    description: string;
    color: string;
    icon: string;
    itemCount: number;
    examples: string[];
}

export interface StockItem extends BaseEntity {
    name: string;
    description?: string;
    stockType: StockType;
    quantity: number;
    unit: string;
    minimumStock: number;
    maximumStock?: number;
    cost: number;
    supplier?: Supplier;
    expirationDate?: string;
    barcode?: string;
    location?: string;
}

export interface Supplier extends BaseEntity {
    name: string;
    category: string;
    phone: string;
    email: string;
    rating: number;
    status: 'ACTIVE' | 'INACTIVE' | 'PENDING';
    address: string;
    contactPerson: string;
    taxNumber: string;
    paymentTerms: string;
    deliveryTime: number; // gün
    minimumOrder: number; // TL
    products: string[];
    contractStartDate?: string;
    contractEndDate?: string;
    totalOrders: number;
    monthlyDeliveries: number;
    contactInfo?: string; // Legacy field
    leadTimeDays?: number; // Legacy field
    isActive?: boolean; // Legacy field
    createdAt?: string;
    updatedAt?: string;
    stockItems?: any[]; // Relations from backend
    inventories?: any[]; // Relations from backend
}

export interface Warehouse extends BaseEntity {
    name: string;
    location: string;
    capacity: string;
    capacityPercentage: number;
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
    manager: string;
    staffCount: number;
    area: number;
    temperature?: number;
    warehouseType: 'NORMAL' | 'COLD' | 'FROZEN' | 'DRY';
    code?: string;
    isActive?: boolean;
}