import { BaseEntity } from ".";

// ===== STOCK & INVENTORY TYPES =====
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
    status: 'Aktif' | 'Pasif' | 'Beklemede';
    address: string;
    contactPerson: string;
    taxNumber: string;
    paymentTerms: string;
    deliveryTime: number; // gün
    minimumOrder: number; // TL
    products: string[];
    contractStartDate: string;
    contractEndDate: string;
    totalOrders: number;
    monthlyDeliveries: number;
}

export interface Warehouse extends BaseEntity {
    name: string;
    location: string;
    capacity: string;
    capacityPercentage: number;
    status: 'Aktif' | 'Pasif' | 'Bakım';
    manager: string;
    staffCount: number;
    area: number;
    temperature?: number;
    warehouseType: 'Normal' | 'Soğuk' | 'Dondurucu' | 'Kuru';
}