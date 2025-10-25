import { StockItem } from "@/types/index";

const mockData: StockItem[] = [
    {
        id: "1",
        name: "Domates",
        stockTypeId: "1", // Hammadde
        quantity: 100,
        unitId: "2", // Kilogram
        unitPrice: 15.99,
        minQuantity: 20,
        maxQuantity: 200,
        description: "Taze domates",
        barcode: "8680123456789",
        lastUpdated: new Date().toISOString(),
        supplierId: "1",
        warehouseId: "1"
    },
    {
        id: "2",
        name: "Tavuk Göğüs",
        stockTypeId: "1", // Hammadde
        quantity: 50,
        unitId: "2", // Kilogram
        unitPrice: 89.99,
        minQuantity: 10,
        maxQuantity: 100,
        description: "Taze tavuk göğüs",
        barcode: "8680987654321",
        lastUpdated: new Date().toISOString(),
        supplierId: "2",
        warehouseId: "2"
    },
    {
        id: "3",
        name: "Süt",
        stockTypeId: "1", // Hammadde
        quantity: 200,
        unitId: "4", // Litre
        unitPrice: 12.50,
        minQuantity: 50,
        maxQuantity: 300,
        description: "Tam yağlı süt",
        barcode: "8680456789123",
        lastUpdated: new Date().toISOString(),
        supplierId: "3",
        warehouseId: "1"
    }
];

export default mockData;
