import React, { useEffect, useState, ReactNode, useContext } from "react";
import { RestaurantContext } from "../context";
import { tablesData } from "../../pages/restaurantstatus/mocks/tablesData";
import { waitersData } from "../../pages/restaurantstatus/mocks/waitersData";
import { TableData, RestaurantContextType, Waiter } from "../../types";

export const useRestaurant = () => {
    const context = useContext(RestaurantContext);
    if (!context) {
        throw new Error('useRestaurant must be used within a RestaurantProvider');
    }
    return context;
};

interface RestaurantProviderProps {
    children: ReactNode;
}

interface UpdateTableData {
    status?: "available" | "occupied" | "reserved";
    totalAmount?: number;
    waiterId?: string;
    waiterName?: string;
    occupiedAt?: string;
    reservedAt?: string;
    serviceStartTime?: string;
    cleanStatus?: boolean;
    orders?: any;
}

// API'den veri çekiyormuş gibi simüle eden fonksiyonlar
export function fetchTables(): Promise<TableData[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(tablesData);
        }, 500);
    });
}

export function fetchWaiters(): Promise<Waiter[]> {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(waitersData);
        }, 300);
    });
}

export const RestaurantProvider: React.FC<RestaurantProviderProps> = ({ children }) => {
    const [tables, setTables] = useState<TableData[]>([]);
    const [waiters, setWaiters] = useState<Waiter[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        Promise.all([fetchTables(), fetchWaiters()]).then(([tablesData, waitersData]) => {
            setTables(tablesData);
            setWaiters(waitersData);
            setLoading(false);
        });
    }, []);

    // ===== MASA YÖNETİMİ METOTLARI =====
    
    // Masa güncelleme fonksiyonu (genel)
    const updateTable = (tableId: string, newData: UpdateTableData): void => {
        setTables(prev =>
            prev.map(t => (t.id === tableId ? { ...t, ...newData } : t))
        );
    };

    // Masa açma fonksiyonu
    const openTable = (tableId: string, waiterData?: { waiterId?: string; waiterName?: string }): void => {
        const updateData: UpdateTableData = {
            status: "occupied",
            occupiedAt: new Date().toISOString(),
            cleanStatus: true,
            ...waiterData
        };
        updateTable(tableId, updateData);
    };

    // Masa kapatma fonksiyonu
    const closeTable = (tableId: string): void => {
        updateTable(tableId, {
            status: "available",
            totalAmount: 0,
            occupiedAt: undefined,
            waiterId: undefined,
            waiterName: undefined,
            serviceStartTime: undefined,
            cleanStatus: true,
            orders: undefined
        });
    };

    // Masa temizleme fonksiyonu
    const cleanTable = (tableId: string): void => {
        updateTable(tableId, { cleanStatus: true });
    };

    // ===== SİPARİŞ YÖNETİMİ METOTLARI =====

    // Masaya sipariş ekleme
    const addOrderToTable = (tableId: string, orderItems: any[]): void => {
        setTables(prev =>
            prev.map(table => {
                if (table.id === tableId) {
                    const newOrders = orderItems.map(item => ({
                        id: item.orderItemId || `order-${Date.now()}-${Math.random()}`,
                        productName: item.productName || item.name,
                        quantity: item.quantity || 1,
                        price: item.price || 0,
                        note: item.note || [],
                        status: 'pending' as const,
                        orderedAt: new Date().toISOString(),
                        items: [{
                            id: item.orderItemId || `item-${Date.now()}`,
                            name: item.productName || item.name,
                            quantity: item.quantity || 1,
                            price: item.price || 0
                        }],
                        total: (item.price || 0) * (item.quantity || 1)
                    }));

                    const existingOrders = table.orders || [];
                    const updatedOrders = [...existingOrders, ...newOrders];
                    const totalAmount = updatedOrders.reduce((sum, order) => sum + order.total, 0);

                    return {
                        ...table,
                        orders: updatedOrders,
                        totalAmount,
                        status: "occupied" as const,
                        occupiedAt: table.occupiedAt || new Date().toISOString()
                    };
                }
                return table;
            })
        );
    };

    // Sipariş güncelleme
    const updateOrderInTable = (tableId: string, orderItemId: string, updateData: any): void => {
        setTables(prev =>
            prev.map(table => {
                if (table.id === tableId && table.orders) {
                    const updatedOrders = table.orders.map(order => {
                        if (order.id === orderItemId) {
                            const updated = { ...order, ...updateData };
                            updated.total = updated.price * updated.quantity;
                            return updated;
                        }
                        return order;
                    });
                    
                    const totalAmount = updatedOrders.reduce((sum, order) => sum + order.total, 0);
                    
                    return {
                        ...table,
                        orders: updatedOrders,
                        totalAmount
                    };
                }
                return table;
            })
        );
    };

    // Sipariş silme
    const removeOrderFromTable = (tableId: string, orderItemId: string): void => {
        setTables(prev =>
            prev.map(table => {
                if (table.id === tableId && table.orders) {
                    const updatedOrders = table.orders.filter(order => order.id !== orderItemId);
                    const totalAmount = updatedOrders.reduce((sum, order) => sum + order.total, 0);
                    
                    return {
                        ...table,
                        orders: updatedOrders,
                        totalAmount,
                        // Eğer hiç sipariş kalmadıysa masayı boşalt
                        ...(updatedOrders.length === 0 && {
                            status: "available" as const,
                            occupiedAt: undefined,
                            totalAmount: 0
                        })
                    };
                }
                return table;
            })
        );
    };

    // Sipariş durumu güncelleme
    const updateOrderStatus = (tableId: string, orderId: string, status: 'pending' | 'preparing' | 'ready' | 'delivered'): void => {
        setTables(prev =>
            prev.map(table => {
                if (table.id === tableId && table.orders) {
                    const updatedOrders = table.orders.map(order =>
                        order.id === orderId ? { ...order, status } : order
                    );
                    return { ...table, orders: updatedOrders };
                }
                return table;
            })
        );
    };

    // ===== ÖDEME YÖNETİMİ METOTLARI =====

    // Toplam tutar hesaplama
    const calculateTableTotal = (tableId: string): number => {
        const table = tables.find(t => t.id === tableId);
        if (!table?.orders) return 0;
        return table.orders.reduce((sum, order) => sum + order.total, 0);
    };

    // Ödeme işlemi
    const processPayment = (tableId: string, paymentMethod: 'cash' | 'card', amount?: number): void => {
        const table = tables.find(t => t.id === tableId);
        if (!table) return;

        const totalAmount = amount || calculateTableTotal(tableId);
        
        // Masayı temizle ve boşalt
        updateTable(tableId, {
            status: "available",
            totalAmount: 0,
            occupiedAt: undefined,
            orders: undefined,
            cleanStatus: false, // Ödeme sonrası temizlik gerekli
            waiterId: undefined,
            waiterName: undefined,
            serviceStartTime: undefined
        });
    };

    // ===== GARSON YÖNETİMİ METOTLARI =====

    // Garson atama fonksiyonu
    const assignWaiterToTable = (tableId: string, waiterId: string): void => {
        const waiter = waiters.find(w => w.id === waiterId);
        if (!waiter) return;

        setTables(prev =>
            prev.map(t => (t.id === tableId ? { 
                ...t, 
                waiterId,
                waiterName: waiter.name,
                serviceStartTime: new Date().toISOString()
            } : t))
        );

        // Garsonun atanmış masalar listesini güncelle
        setWaiters(prev =>
            prev.map(w => (w.id === waiterId ? {
                ...w,
                assignedTables: [...w.assignedTables.filter(id => id !== tableId), tableId]
            } : w))
        );
    };

    // Garson atama kaldırma fonksiyonu
    const unassignWaiterFromTable = (tableId: string): void => {
        const table = tables.find(t => t.id === tableId);
        if (!table?.waiterId) return;

        setTables(prev =>
            prev.map(t => (t.id === tableId ? { 
                ...t, 
                waiterId: undefined,
                waiterName: undefined,
                serviceStartTime: undefined
            } : t))
        );

        // Garsonun atanmış masalar listesinden kaldır
        setWaiters(prev =>
            prev.map(w => (w.id === table.waiterId ? {
                ...w,
                assignedTables: w.assignedTables.filter(id => id !== tableId)
            } : w))
        );
    };

    // Garson bulma fonksiyonu
    const getWaiterById = (waiterId: string): Waiter | undefined => {
        return waiters.find(w => w.id === waiterId);
    };

    // Müsait garsonları getir
    const getAvailableWaiters = (): Waiter[] => {
        return waiters.filter(w => w.isActive && w.assignedTables.length < 10); // Max 10 masa
    };

    // ===== TRANSFER İŞLEMLERİ =====

    // Aktarım fonksiyonu
    const transferOrder = (fromTableId: string, toTableId: string): void => {
        setTables(prev => {
            const fromTable = prev.find(t => t.id === fromTableId);
            const toTable = prev.find(t => t.id === toTableId);
            
            if (!fromTable || !toTable) return prev;
            
            return prev.map(t => {
                if (t.id === fromTableId) {
                    return {
                        ...t,
                        status: "available" as const,
                        totalAmount: 0,
                        occupiedAt: undefined,
                        orders: undefined,
                        cleanStatus: false // Transfer sonrası temizlik gerekli
                    };
                }
                if (t.id === toTableId) {
                    const existingOrders = t.orders || [];
                    const transferredOrders = fromTable.orders || [];
                    const allOrders = [...existingOrders, ...transferredOrders];
                    const totalAmount = allOrders.reduce((sum, order) => sum + order.total, 0);
                    
                    return {
                        ...t,
                        status: "occupied" as const,
                        totalAmount,
                        occupiedAt: t.occupiedAt || fromTable.occupiedAt || new Date().toISOString(),
                        orders: allOrders,
                        // Eğer hedef masada garson yoksa, kaynak masanın garsonunu aktar
                        ...((!t.waiterId && fromTable.waiterId) && {
                            waiterId: fromTable.waiterId,
                            waiterName: fromTable.waiterName,
                            serviceStartTime: fromTable.serviceStartTime
                        })
                    };
                }
                return t;
            });
        });
    };

    // ===== ESKI METOTLAR (GERİYE UYUMLULUK) =====

    // Eski updateOrder metodu - yeni updateOrderInTable'a yönlendir
    const updateOrder = (tableId: string, orderId: string, updateData: any): void => {
        updateOrderInTable(tableId, orderId, updateData);
    };

    // Eski updateTableStatus metodu - yeni updateTable'a yönlendir
    const updateTableStatus = (tableId: string, status: 'available' | 'occupied' | 'reserved'): void => {
        updateTable(tableId, { status });
    };

    // Eski addOrder metodu - yeni addOrderToTable'a yönlendir
    const addOrder = (tableId: string, order: any): void => {
        addOrderToTable(tableId, [order]);
    };

    const value: RestaurantContextType = {
        // State değerleri
        tables,
        setTables,
        waiters,
        setWaiters,
        loading,
        categories: [], // Boş array olarak başlat

        // Masa yönetimi metotları
        updateTable,
        openTable,
        closeTable,
        cleanTable,

        // Sipariş yönetimi metotları
        addOrderToTable,
        updateOrderInTable,
        removeOrderFromTable,
        updateOrderStatus,

        // Ödeme yönetimi metotları
        calculateTableTotal,
        processPayment,

        // Garson yönetimi metotları
        assignWaiterToTable,
        unassignWaiterFromTable,
        getWaiterById,
        getAvailableWaiters,

        // Transfer işlemleri
        transferOrder,

        // Geriye uyumluluk için eski metotlar
        updateOrder,
        updateTableStatus,
        addOrder
    };

    return (
        <RestaurantContext.Provider value={value}>
            {children}
        </RestaurantContext.Provider>
    );
};
