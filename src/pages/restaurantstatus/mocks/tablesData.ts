import { TableData } from "../../../types";

export const tablesData: TableData[] = Array.from({ length: 44 }, (_, i): TableData => {
    const status = Math.random() > 0.45 ? "occupied" : Math.random() > 0.8 ? "reserved" : "available";
    
    // Garson isimleri
    const waiterNames = [
        "Mehmet Yılmaz", "Ayşe Demir", "Ali Kaya", "Fatma Şahin", "Mustafa Özkan",
        "Zeynep Çelik", "Ahmet Yıldız", "Elif Arslan", "Can Doğan", "Deniz Aydın"
    ];

    let occupiedAt: string | undefined;
    let reservedAt: string | undefined;
    let serviceStartTime: string | undefined;
    let totalAmount = 0;

    if (status === "occupied") {
        occupiedAt = new Date(Date.now() - Math.floor(Math.random() * 3 * 60 * 60 * 1000)).toISOString();
        serviceStartTime = new Date(Date.now() - Math.floor(Math.random() * 2 * 60 * 60 * 1000)).toISOString();
        totalAmount = Math.floor(Math.random() * 500) + 100;
    } else if (status === "reserved") {
        reservedAt = new Date(Date.now() + Math.floor(Math.random() * 24 * 60 * 60 * 1000)).toISOString();
    }

    const waiterIndex = Math.floor(Math.random() * waiterNames.length);
    const orderQuantity = Math.floor(Math.random() * 4) + 1; // 1-4 arası sipariş

    return {
        id: `table-${i + 1}`,
        number: i + 1,
        capacity: [2, 4, 6][i % 3],
        status,
        occupiedAt,
        reservedAt,
        serviceStartTime,
        totalAmount: totalAmount || undefined,
        cleanStatus: Math.random() > 0.1, // %90 temiz
        
        // Garson bilgileri
        waiterId: status !== "available" ? `waiter-${(i % 8) + 1}` : undefined,
        waiterName: status !== "available" ? waiterNames[waiterIndex] : undefined,
        
        // Sipariş bilgileri
        orders: status === "occupied" ? [
            {
                id: `order-${i + 1}`,
                productName: "Karma Türk Kahvaltısı",
                quantity: orderQuantity,
                price: 85,
                note: ["Az tuzlu", "Çay yerine kahve"],
                items: [
                    { id: "item-1", name: "Türk Kahvaltısı", quantity: orderQuantity, price: 85 },
                    { id: "item-2", name: "Çay", quantity: orderQuantity, price: 15 }
                ],
                status: ['pending', 'preparing', 'ready', 'delivered'][Math.floor(Math.random() * 4)] as 'pending' | 'preparing' | 'ready' | 'delivered',
                total: (85 + 15) * orderQuantity,
                orderedAt: new Date(Date.now() - Math.floor(Math.random() * 60 * 60 * 1000)).toISOString(),
                servedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.floor(Math.random() * 30 * 60 * 1000)).toISOString() : undefined
            }
        ] : undefined
    };
});
