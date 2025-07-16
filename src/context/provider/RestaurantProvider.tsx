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

    // Masa güncelleme fonksiyonu
    const updateTable = (tableId: string, newData: UpdateTableData): void => {
        setTables(prev =>
            prev.map(t => (t.id === tableId ? { ...t, ...newData } : t))
        );
    };

    // Garson atama fonksiyonu
    const assignWaiterToTable = (tableId: string, waiterId: string): void => {
        const waiter = waiters.find(w => w.id === waiterId);
        if (!waiter) return;

        setTables(prev =>
            prev.map(t => (t.id === tableId ? { 
                ...t, 
                waiterId,
                waiterName: waiter.name,
                waiterPhone: waiter.phone,
                serviceStartTime: new Date().toISOString()
            } : t))
        );

        // Garsonun atanmış masalar listesini güncelle
        setWaiters(prev =>
            prev.map(w => (w.id === waiterId ? {
                ...w,
                assignedTables: [...w.assignedTables, tableId]
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
                waiterPhone: undefined,
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

    // Aktarım fonksiyonu
    const transferOrder = (fromTableId: string, toTableId: string): void => {
        setTables(prev => {
            const fromTable = prev.find(t => t.id === fromTableId);
            if (!fromTable) return prev;
            
            return prev.map(t => {
                if (t.id === fromTableId) {
                    return {
                        ...t,
                        status: "available",
                        totalAmount: undefined,
                        occupiedAt: undefined,
                        orders: undefined
                    };
                }
                if (t.id === toTableId) {
                    return {
                        ...t,
                        status: "occupied",
                        totalAmount: fromTable.totalAmount,
                        occupiedAt: fromTable.occupiedAt,
                        orders: fromTable.orders
                    };
                }
                return t;
            });
        });
    };

    const value: RestaurantContextType = {
        tables,
        setTables,
        waiters,
        setWaiters,
        loading,
        categories: [], // Boş array olarak başlat
        updateTable,
        assignWaiterToTable,
        unassignWaiterFromTable,
        getWaiterById,
        getAvailableWaiters,
        updateOrder: (tableId: string, orderId: string, updateData: any) => {
            setTables(prevTables => 
                prevTables.map(table => 
                    table.id === tableId 
                        ? { 
                            ...table, 
                            orders: table.orders?.map(order => 
                                order.id === orderId 
                                    ? { ...order, ...updateData }
                                    : order
                            ) 
                        }
                        : table
                )
            );
        },
        updateTableStatus: (tableId: string, status: 'available' | 'occupied' | 'reserved') => {
            setTables(prevTables => 
                prevTables.map(table => 
                    table.id === tableId 
                        ? { ...table, status }
                        : table
                )
            );
        },
        addOrder: (tableId: string, order: any) => {
            setTables(prevTables => 
                prevTables.map(table => 
                    table.id === tableId 
                        ? { ...table, orders: [...(table.orders || []), order] }
                        : table
                )
            );
        },
        updateOrderStatus: (tableId: string, orderId: string, status: 'pending' | 'preparing' | 'ready' | 'delivered') => {
            setTables(prevTables => 
                prevTables.map(table => 
                    table.id === tableId 
                        ? { 
                            ...table, 
                            orders: table.orders?.map(order => 
                                order.id === orderId 
                                    ? { ...order, status }
                                    : order
                            ) 
                        }
                        : table
                )
            );
        },
        transferOrder,
    };

    return (
        <RestaurantContext.Provider value={value}>
            {children}
        </RestaurantContext.Provider>
    );
};
