import React, { useEffect, useState, ReactNode, useCallback } from "react";
import { RestaurantContext } from "../context";
import { tablesData } from "../../pages/restaurantstatus/mocks/tablesData";
import { waitersData } from "../../pages/restaurantstatus/mocks/waitersData";
import { TableData, RestaurantContextType, Waiter } from "../../types";
import { generateUniqueId } from "../../utils/idUtils";

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

    // Uygulama başlangıcında verileri yükle
    useEffect(() => {
        const loadData = async () => {
            try {
                const [tablesList, waitersList] = await Promise.all([
                    fetchTables(),
                    fetchWaiters()
                ]);
                setTables(tablesList);
                setWaiters(waitersList);
            } catch (error) {
                console.error('Error loading restaurant data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Masa açma
    const openTable = (tableId: string, waiterData?: { waiterId?: string; waiterName?: string }): void => {
        // Default waiter atama
        const defaultWaiter = { id: generateUniqueId('waiter-'), name: 'Garson', shift: 'morning' };

        updateTable(tableId, {
            status: "occupied",
            totalAmount: 0,
            waiterId: waiterData?.waiterId || defaultWaiter.id,
            waiterName: waiterData?.waiterName || defaultWaiter.name,
            occupiedAt: new Date().toISOString(),
            serviceStartTime: new Date().toISOString(),
            cleanStatus: false,
            orders: []
        });
    };

    // Masa kapatma
    const closeTable = (tableId: string): void => {
        updateTable(tableId, {
            status: "available",
            totalAmount: 0,
            waiterId: "",
            waiterName: "",
            occupiedAt: "",
            serviceStartTime: "",
            cleanStatus: false,
            orders: []
        });
    };

    // Masa temizleme
    const cleanTable = (tableId: string): void => {
        updateTable(tableId, { cleanStatus: true });
    };

    // Masa güncelleme
    const updateTable = (tableId: string, updateData: UpdateTableData): void => {
        setTables(prev =>
            prev.map(table => {
                if (table.id === tableId) {
                    return { ...table, ...updateData };
                }
                return table;
            })
        );
    };

    const addOrderToTable = (tableId: string, orderItems: any[]): void => {
        setTables(prev =>
            prev.map(table => {
                if (table.id === tableId) {
                    const defaultWaiter = { id: generateUniqueId('waiter-'), name: 'Garson', shift: 'morning' };

                    const existingOrders = table.orders || [];

                    const processedOrderItems = orderItems.map(item => ({
                        ...item,
                        id: item.orderItemId || generateUniqueId(`order-${tableId}-`),
                        total: item.price * item.quantity,
                        status: item.status || 'pending',
                        orderedAt: item.orderedAt || new Date().toISOString()
                    }));

                    const newOrders = [...existingOrders, ...processedOrderItems];
                    const totalAmount = newOrders.reduce((sum, order) => sum + order.total, 0);

                    console.log("Adding orders to table:", {
                        tableId,
                        processedOrderItems,
                        totalOrders: newOrders.length
                    });

                    return {
                        ...table, 
                        orders: newOrders,
                        totalAmount,
                        status: "occupied",
                        waiterId: table.waiterId || defaultWaiter.id,
                        waiterName: table.waiterName || defaultWaiter.name,
                        occupiedAt: table.occupiedAt || new Date().toISOString(),
                        serviceStartTime: table.serviceStartTime || new Date().toISOString(),
                        waiterShift: defaultWaiter.shift
                    };
                }
                return table;
            })
        );
    };

    // Sipariş güncelleme
    const updateOrderInTable = (tableId: string, orderItemId: string, updateData: any): void => {
        console.log("RestaurantProvider updateOrderInTable called:", {
            tableId,
            orderItemId,
            updateData
        });

        setTables(prev => {
            const updated = prev.map(table => {
                if (table.id === tableId && table.orders) {
                    const updatedOrders = table.orders.map(order => {
                        if (order.id === orderItemId) {
                            const updated = { ...order, ...updateData };
                            updated.total = updated.price * updated.quantity;
                            console.log("Updated order:", updated);
                            return updated;
                        }
                        return order;
                    });

                    const totalAmount = updatedOrders.reduce((sum, order) => sum + order.total, 0);

                    const newTable = {
                        ...table,
                        orders: updatedOrders,
                        totalAmount
                    };

                    return newTable;
                }
                return table;
            });

            return updated;
        });
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
                        totalAmount
                    };
                }
                return table;
            })
        );
    };

    // Toplam hesaplama
    const calculateTableTotal = (tableId: string): number => {
        const table = tables.find(t => t.id === tableId);
        if (!table || !table.orders) return 0;
        return table.orders.reduce((sum, order) => sum + order.total, 0);
    };

    // Ödeme işleme
    const processPayment = (tableId: string, paymentMethod: 'cash' | 'card', amount?: number): void => {
        const table = tables.find(t => t.id === tableId);
        if (!table) return;

        const totalAmount = amount || calculateTableTotal(tableId);

        // Ödeme sonrası masayı sıfırla
        updateTable(tableId, {
            status: "available",
            totalAmount: 0,
            orders: [],
            waiterId: "",
            waiterName: "",
            occupiedAt: "",
            serviceStartTime: "",
            cleanStatus: false
        });

        console.log(`Payment processed: ${paymentMethod}, Amount: ${totalAmount}`);
    };

    // Garson yönetimi metotları
    const assignWaiterToTable = (tableId: string, waiterId: string): void => {
        const waiter = waiters.find(w => w.id === waiterId);
        if (waiter) {
            updateTable(tableId, {
                waiterId: waiter.id,
                waiterName: waiter.name
            });
        }
    };

    const unassignWaiterFromTable = (tableId: string): void => {
        updateTable(tableId, {
            waiterId: "",
            waiterName: ""
        });
    };

    const getWaiterById = (waiterId: string): Waiter | undefined => {
        return waiters.find(w => w.id === waiterId);
    };

    const getAvailableWaiters = (): Waiter[] => {
        return waiters;
    };

    // Sipariş durumu güncelleme
    const updateOrderStatus = (tableId: string, orderId: string, status: 'pending' | 'preparing' | 'ready' | 'delivered'): void => {
        updateOrderInTable(tableId, orderId, { status });
    };

    // Transfer işlemleri
    const transferOrder = useCallback(async (sourceTableId: string, targetTableId: string) => {
        try {
            const sourceTable = tables.find(t => t.id === sourceTableId);
            const targetTable = tables.find(t => t.id === targetTableId);
            
            if (!sourceTable || !targetTable) {
                throw new Error('Kaynak veya hedef masa bulunamadı');
            }

            if (!sourceTable.orders || sourceTable.orders.length === 0) {
                throw new Error('Kaynak masada aktarılacak sipariş bulunmuyor');
            }

            if (targetTable.occupied) {
                throw new Error('Hedef masa zaten dolu');
            }

            // Yeni tables array'ini oluştur
            const updatedTables = tables.map(table => {
                if (table.id === sourceTableId) {
                    // Kaynak masa: Tüm bilgileri temizle, boş ve temizlenecek olarak işaretle
                    return {
                        ...table,
                        status: "available" as const,
                        occupied: false,
                        orders: [],
                        totalAmount: 0,
                        waiterName: undefined,
                        occupiedAt: undefined,
                        cleanStatus: false, // Temizlenecek olarak işaretle
                        serviceStartTime: undefined
                    };
                } else if (table.id === targetTableId) {
                    // Hedef masa: Tüm bilgileri kaynak masadan aktar
                    return {
                        ...table,
                        status: "occupied" as const,
                        occupied: true,
                        orders: sourceTable.orders ? [...sourceTable.orders] : [], // Siparişleri güvenli kopyala
                        totalAmount: sourceTable.totalAmount || 0,
                        waiterName: sourceTable.waiterName,
                        occupiedAt: new Date().toISOString(), // Yeni açılış zamanı
                        cleanStatus: true, // Temiz masa olduğu için true
                        serviceStartTime: sourceTable.serviceStartTime
                    };
                }
                return table;
            });

            // State'i güncelle
            setTables(updatedTables);

            // Başarı mesajı (opsiyonel - notification context'i varsa)
            console.log(`Sipariş ${sourceTable.name || sourceTable.number} masasından ${targetTable.name || targetTable.number} masasına başarıyla aktarıldı`);
            
            return true;

        } catch (error) {
            console.error('Masa aktarım hatası:', error);
            throw error;
        }
    }, [tables, setTables]);

    // Geriye uyumluluk metotları
    const updateOrder = (tableId: string, orderId: string, updateData: any): void => {
        updateOrderInTable(tableId, orderId, updateData);
    };

    const updateTableStatus = (tableId: string, status: 'available' | 'occupied' | 'reserved'): void => {
        updateTable(tableId, { status });
    };

    const addOrder = (tableId: string, order: any): void => {
        addOrderToTable(tableId, [order]);
    };

    const contextValue: RestaurantContextType = {
        tables,
        setTables,
        waiters,
        setWaiters,
        loading,
        openTable,
        closeTable,
        cleanTable,
        updateTable,
        addOrderToTable,
        updateOrderInTable,
        removeOrderFromTable,
        calculateTableTotal,
        processPayment,
        assignWaiterToTable,
        unassignWaiterFromTable,
        getWaiterById,
        getAvailableWaiters,
        categories: [], // Mock olarak boş array
        updateOrderStatus,
        transferOrder,
        updateOrder,
        updateTableStatus,
        addOrder
    };

    return (
        <RestaurantContext.Provider value={contextValue}>
            {children}
        </RestaurantContext.Provider>
    );
};
