import { TableData } from "../../../types";
import { menuData } from "../../menubusiness/mocks/menuData";
import { generateUniqueId } from "../../../utils/idUtils";

// Rastgele sipariş notları
const orderNotes = [
    ["#acı sos ekle"],
    ["#soğansız", "#marul olmasın"],
    ["#az tuz"],
    ["#sıcak servis"],
    ["#buzsuz"],
    ["#ekstra peynir"],
    ["#ince hamur"],
    ["#az pişmiş"],
    [],
    ["#ekstra sos"]
];

// Sipariş durumları
const orderStatuses = ['pending', 'preparing', 'ready', 'delivered'] as const;

// Rastgele sipariş oluşturma fonksiyonu
const generateRandomOrders = (tableNumber: number) => {
    const orderCount = Math.floor(Math.random() * 5) + 1; // 1-5 arası sipariş
    const orders = [];

    for (let i = 0; i < orderCount; i++) {
        const randomMenuItem = menuData[Math.floor(Math.random() * menuData.length)];
        const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 adet
        const randomNotes = orderNotes[Math.floor(Math.random() * orderNotes.length)];
        const randomStatus = orderStatuses[Math.floor(Math.random() * orderStatuses.length)];

        // Sipariş zamanı (son 2 saat içinde)
        const orderedAt = new Date(Date.now() - Math.floor(Math.random() * 2 * 60 * 60 * 1000)).toISOString();

        // Benzersiz ID'ler oluştur - UUID benzeri güvenilir ID'ler
        const uniqueOrderId = generateUniqueId(`order-t${tableNumber}-`);

        const order = {
            id: uniqueOrderId,
            productName: randomMenuItem.name,
            quantity: quantity,
            price: randomMenuItem.price,
            note: randomNotes,
            status: randomStatus,
            orderedAt: orderedAt,
            name: randomMenuItem.name,
            total: randomMenuItem.price * quantity
        };

        orders.push(order);
    }

    return orders;
};

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
    let orders: any[] | undefined;
    let totalAmount = 0;

    // Sipariş ve tutar hesaplaması
    if (status === "occupied") {
        occupiedAt = new Date(Date.now() - Math.floor(Math.random() * 3 * 60 * 60 * 1000)).toISOString();
        serviceStartTime = new Date(Date.now() - Math.floor(Math.random() * 2 * 60 * 60 * 1000)).toISOString();

        // Rastgele siparişler oluştur
        orders = generateRandomOrders(i + 1);

        // Toplam tutarı siparişlerden hesapla
        totalAmount = orders.reduce((sum, order) => sum + order.total, 0);
    } else if (status === "reserved") {
        reservedAt = new Date(Date.now() + Math.floor(Math.random() * 24 * 60 * 60 * 1000)).toISOString();
    }

    const waiterIndex = Math.floor(Math.random() * waiterNames.length);

    return {
        id: generateUniqueId(`table-${i + 1}-`),
        number: i + 1,
        capacity: [2, 4, 6][i % 3],
        status,
        occupiedAt,
        reservedAt,
        serviceStartTime,
        totalAmount: totalAmount || undefined,
        cleanStatus: Math.random() > 0.1, // %90 temiz

        // Garson bilgileri
        waiterId: status !== "available" ? generateUniqueId(`waiter-${(i % 8) + 1}-`) : undefined,
        waiterName: status !== "available" ? waiterNames[waiterIndex] : undefined,

        // Sipariş bilgileri
        orders: orders
    };
});
