import React from 'react';


export interface BaseEntity {
    id: string;
    createdAt?: string;
    updatedAt?: string;
}
// Auth Types
export interface User {
    userId: string;
    username: string;
    roles: string[];
    sessionId?: string;
    access_token?: string;
}

// Waiter (Garson) Types
export interface Waiter {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    shift: 'morning' | 'afternoon' | 'evening' | 'night';
    isActive: boolean;
    performanceScore?: number;
    assignedTables: string[]; // Atanmış masa ID'leri
    currentOrdersCount: number;
    joiningDate: string;
    avatar?: string;
}

export interface WaiterPerformance {
    waiterId: string;
    waiterName: string;
    totalOrders: number;
    completedOrders: number;
    avgServiceTime: number; // dakika cinsinden
    customerRating: number; // 1-5 arası
    efficiency: number; // yüzde olarak
}

// Restaurant Types
export interface MenuItem {
    id: string;
    name: string;
    price: number;
    category: string;
    description?: string;
    image?: string;
    available: boolean;
}

export interface OrderItem {
    id: string;
    menuItem: MenuItem;
    quantity: number;
    notes?: string;
}

export interface Order {
    id: string;
    items: OrderItem[];
    total: number;
    status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
    tableNumber?: number;
    customerName?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Chart Types
export interface ChartData {
    name: string;
    value: number;
    color?: string;
}

// Component Props Types
export interface CardProps {
    value: number | string;
    title: string;
    icon: React.ReactNode;
    type?: 'price' | 'str';
    targetProgress?: number;
    duration?: number;
    className?: string;
}

// Circle Types
export interface CircleProps {
    index?: number;
    label: string;
    info?: string;
    value: number;
    duration?: number;
}

// Select Types
export interface SelectProps {
    options: any[];
    defaultValue?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
}

// GenericSearchBar Types
export interface AddButtonConfig {
    show: boolean;
    text?: string;
    icon?: React.ReactNode;
}

export interface GenericSearchBarProps {
    value: string;
    onChange: (value: string) => void;
    onAddClick?: () => void;
    placeholder?: string;
    addButton?: AddButtonConfig;
    inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
    containerClass?: string;
    inputClass?: string;
    buttonClass?: string;
}

// InfoBalloon Types
export interface InfoBalloonProps {
    show: boolean;
    text: string;
    onClose?: () => void;
    position?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
}

// PageTransition Types
export interface PageVariant {
    [key: string]: {
        opacity: number;
        transition?: {
            duration: number;
            ease: string;
        };
        [key: string]: any;
    };
}

export interface PageTransitionProps {
    children: React.ReactNode;
    variant?: number;
    className?: string;
}

// Menu Types
export interface MenuItemType {
    to: string;
    icon: React.ReactNode;
    label: string;
    show: boolean;
    color: string;
}

export interface MenuProps {
    className?: string;
}

export interface NavigationContextType {
    activePath: string;
    setActivePath: (path: string) => void;
    previousPath: string;
    setPreviousPath: (path: string) => void;
}

// Restaurant Menu Types
export interface MenuItem {
    id: string;
    name: string;
    price: number;
    category: string;
    description?: string;
    image?: string;
    available: boolean;
}

// Navbar Types
export interface NavbarProps {
    title?: string;
    showMobileMenu?: boolean;
    className?: string;
}

// OrderSummary Types
export interface OrderSummaryData {
    label: string;
    value: number;
    info?: string;
}

export interface OrderSummaryProps {
    className?: string;
    data?: OrderSummaryData[];
    title?: string;
    periodOptions?: string[];
}

export interface OrderSummarySelectOption {
    value: string;
    label: string;
}

// TopSellingItems Types
export interface TopSellingItem {
    id: string;
    name: string;
    count: number;
    percentage: number;
    image?: string;
    price?: number;
    category?: string;
}

export interface TopSellingItemsProps {
    items: TopSellingItem[];
    className?: string;
    title?: string;
    maxItems?: number;
}

// CustomerMap Types
export interface Location {
    lat: number;
    lng: number;
}

export interface CustomerMapData {
    id: string;
    location: Location;
    name: string;
    address: string;
    orderStatus: 'preparing' | 'onTheWay' | 'delivered';
    orderTime: string;
    deliveryTime?: string;
}

export interface CustomerMapProps {
    data: CustomerMapData[];
    className?: string;
}

// TotalRevenueChart Types
export interface RevenueData {
    name: string;
    revenue: number;
    orders: number;
    date: string;
}

export interface TotalRevenueChartProps {
    data: RevenueData[];
    className?: string;
    title?: string;
    period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
    showLegend?: boolean;
}

// OverviewChart Types
export interface OverviewChartData {
    name: string;
    value: number;
    color: string;
}

export interface OverviewChartProps {
    data: OverviewChartData[];
    className?: string;
    title?: string;
    width?: number;
    height?: number;
    innerRadius?: number;
    outerRadius?: number;
}

// Page Types
export interface LoginFormData {
    username: string;
    otp?: string;
}

export interface DashboardStats {
    orders: number;
    revenue: number;
    customers: number;
    avgOrderValue: number;
}

export interface DashboardCard {
    title: string;
    value: number;
    type: 'str' | 'price';
    icon: React.ReactNode;
}

export interface TableStatus {
    id: string;
    number: number;
    status: 'empty' | 'occupied' | 'reserved';
    currentOrder?: Order;
}

export interface MenuBusinessState {
    items: MenuItem[];
    categories: string[];
    loading: boolean;
    error: string | null;
    selectedItem: MenuItem | null;
    isAddModalOpen: boolean;
    isDetailModalOpen: boolean;
}

export interface StockBusinessState {
    items: StockItem[];
    loading: boolean;
    error: string | null;
    selectedItem: StockItem | null;
    isAddModalOpen: boolean;
    isDetailModalOpen: boolean;
    searchQuery: string;
}

export interface NotificationContextType {
    notifications: Array<{
        id: string;
        type: 'success' | 'error' | 'warning' | 'info';
        message: string;
        countdown?: number;
        remaining?: number;
        onComplete?: () => void;
    }>;
    showNotification: (
        type: 'success' | 'error' | 'warning' | 'info',
        message: string,
        options?: {
            countdown?: number;
            onComplete?: () => void;
        }
    ) => void;
    hideNotification: (id: string) => void;
}

export interface ConfirmContextType {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText: string;
    cancelText: string;
    type: 'default' | 'danger' | 'warning' | 'info';
    icon: string | React.ReactNode;
    details: Array<{ label: string; value: string | number }>;
    warnings: string[];
    data: any;
    onConfirm: () => void;
    onCancel: () => void;
    showConfirm: (params: {
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        type?: 'default' | 'danger' | 'warning' | 'info';
        icon?: string | React.ReactNode;
        details?: Array<{ label: string; value: string | number }>;
        warnings?: string[];
        data?: any;
        onConfirm: () => void;
        onCancel?: () => void;
    }) => void;
    hideConfirm: () => void;
}

export interface RestaurantContextType {
    // State değerleri
    tables: TableData[];
    setTables: React.Dispatch<React.SetStateAction<TableData[]>>;
    loading: boolean;

    // Garson yönetimi
    waiters: Waiter[];
    setWaiters: React.Dispatch<React.SetStateAction<Waiter[]>>;
    assignWaiterToTable: (tableId: string, waiterId: string) => void;
    unassignWaiterFromTable: (tableId: string) => void;
    getWaiterById: (waiterId: string) => Waiter | undefined;
    getAvailableWaiters: () => Waiter[];

    // Kategori verisi
    categories: Array<{
        id: string;
        name: string;
        items: Array<{
            id: string;
            name: string;
            price: number;
            description?: string;
            image?: string;
        }>;
    }>;

    // Masa yönetimi metotları
    updateTable: (tableId: string, updateData: any) => void;
    openTable: (tableId: string, waiterData?: { waiterId?: string; waiterName?: string }) => void;
    closeTable: (tableId: string) => void;
    cleanTable: (tableId: string) => void;

    // Sipariş yönetimi metotları
    addOrderToTable: (tableId: string, orderItems: any[]) => void;
    updateOrderInTable: (tableId: string, orderItemId: string, updateData: any) => void;
    removeOrderFromTable: (tableId: string, orderItemId: string) => void;
    updateOrderStatus: (tableId: string, orderId: string, status: 'pending' | 'preparing' | 'ready' | 'delivered') => void;

    // Ödeme yönetimi metotları
    calculateTableTotal: (tableId: string) => number;
    processPayment: (tableId: string, paymentMethod: 'cash' | 'card', amount?: number) => void;

    // Transfer işlemleri
    transferOrder: (fromTableId: string, toTableId: string) => void;

    // Geriye uyumluluk için eski metotlar
    updateOrder: (tableId: string, orderId: string, updateData: any) => void;
    updateTableStatus: (tableId: string, status: 'available' | 'occupied' | 'reserved') => void;
    addOrder: (tableId: string, order: any) => void;
}

// Dashboard Types
export interface DashboardOverviewData {
    name: string;
    value: number;
    color: string;
}

export interface DashboardRevenueData {
    name: string;
    revenue: number;
    orders: number;
    date: string;
}

export interface DashboardTopSellingItem {
    id: string;
    name: string;
    count: number;
    percentage: number;
}

export interface CustomerLocation {
    id: string;
    name: string;
    location: {
        lat: number;
        lng: number;
    };
    status: 'active' | 'inactive';
    lastOrder: string;
}

// MenuBusiness Types
export interface MenuItemDetailed {
    id: string;
    name: string;
    category: string;
    price: number;
    description?: string;
    ingredients?: string[];
    allergens?: string[];
    preparationTime?: number;
    prepTime?: number; // Hazırlık süresi (dakika)
    isSpecial?: boolean;
    image?: string;
    // Yeni yapı: her görsel için ana görsel işareti
    images?: MenuImage[] | string[]; // string[] legacy destek
    status: "active" | "inactive";
    rating?: number; // 1-5 arası puan
    views?: number; // Görüntülenme sayısı
    likes?: number; // Beğeni sayısı
    popularity?: number; // Popülerlik skoru
    variants?: {
        name: string;
        price: number;
    }[];
}

// Menü görsel tipi
export interface MenuImage {
    url: string;
    mainPicture?: boolean; // true olan tek bir görsel (opsiyonel)
}

export interface MenuCategory {
    id: string;
    name: string;
    items: MenuItemDetailed[];
}

export interface MenuTableProps {
    items: MenuItemDetailed[];
    onDelete?: (id: string) => Promise<void>;
    onEdit?: (item: MenuItemDetailed) => void;
    onUpdate?: (id: string, updatedItem: MenuItemDetailed) => Promise<void>;
    onAdd?: (item: MenuItemDetailed) => void;
}

export interface MenuModalProps {
    open: boolean;
    onClose: () => void;
}

export interface MenuAddModalProps extends MenuModalProps {
    onAdd: (item: MenuItemDetailed) => Promise<void>;
    categories: string[];
}

export interface MenuDetailModalProps extends MenuModalProps {
    item: MenuItemDetailed;
    onUpdate: (item: MenuItemDetailed) => Promise<void>;
    categories: string[];
}

// RestaurantStatus Types
export interface TableData {
    id: string;
    number: number;
    capacity: number;
    status: "available" | "occupied" | "reserved";
    occupiedAt?: string;
    reservedAt?: string;
    orderStatus?: string;
    totalAmount?: number;

    // Garson bilgileri
    waiterId?: string;
    waiterName?: string;

    name?: string;
    occupied?: boolean;
    reserved?: boolean;
    cleanStatus?: boolean;
    lastOrderTime?: string;
    serviceStartTime?: string; // Garsonun masaya başlama zamanı

    orders?: Array<{
        id: string;
        productName?: string;
        quantity: number;
        price: number;
        note?: string[];
        items: Array<{
            id: string;
            name: string;
            quantity: number;
            price: number;
        }>;
        status: 'pending' | 'preparing' | 'ready' | 'delivered';
        total: number;
        orderedAt: string;
        servedAt?: string;
    }>;
}

export interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    notes?: string;
    status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
}

export interface Order {
    id: string;
    tableId: string;
    items: OrderItem[];
    status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
    totalAmount: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface TableCardProps {
    table: TableData;
    onClick?: (table: TableData) => void;
}

export interface TableModalProps {
    open: boolean;
    onClose: () => void;
    table?: TableData;
    onSave: (table: TableData) => void;
}

export interface OrderDetailProps {
    order?: Order;
    onUpdateOrder: (order: Order) => void;
}

export interface TableManagementProps {
    tables: TableData[];
    onTableClick: (table: TableData) => void;
    onTableUpdate: (table: TableData) => void;
}

// StockBusiness Types
export interface StockItem {
    id: string;
    barcode?: string;
    name: string;
    stockTypeId: string;
    unit: string;
    quantity: number;
    minQuantity: number;
    maxQuantity: number;
    unitPrice: number;
    totalPrice?: number;
    status?: "active" | "inactive";
    lastUpdated: string;
    supplierId?: string;
    warehouseId?: string;
    description?: string;
    notes?: string;
}

export interface StockAddModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (item: StockItem) => void;
}

export interface StockChangeModalProps {
    open: boolean;
    onClose: () => void;
    item: StockItem;
    type: "add" | "remove";
    onSubmit: (amount: number, updateData?: any) => void;
}

export interface StockDetailModalProps {
    open: boolean;
    onClose: () => void;
    item: StockItem;
}
