import { useState, useCallback, useEffect } from "react";
import { Package, Plus, AlertTriangle, TrendingUp, Clock, ShoppingBag } from "lucide-react";
import StockTable from "./components/StockTable";
import StockSearchBar from "./components/StockSearchBar";
import StockAddModal from "./components/modals/StockAddModal";
import BarcodeScannerModal from "./components/modals/BarcodeScannerModal";
import StockChangeModal from "./components/modals/StockChangeModal";
import StockDetailModal from "./components/modals/StockDetailModal";
import PageTransition from "../../components/PageTransition";
import { StockItem } from "../../types";
import { useNavigation } from "../../context/provider/NavigationProvider";

// Geçici mock data
import mockData from "./mocks/stockData";

interface StockTableProps {
    items: StockItem[];
    onStockChange: (id: string, amount: number, type: "add" | "remove") => void;
}

interface StockAddModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (item: StockItem) => void;
}

export default function StockBusinessMain() {
    const { setActivePath } = useNavigation();
    const [stocks, setStocks] = useState<StockItem[]>(() => 
        mockData.map(item => ({
            ...item,
            id: item.id.toString(),
            lastUpdated: new Date().toISOString(),
            status: "active" as const
        }))
    );
    const [search, setSearch] = useState<string>("");
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState<boolean>(false);
    const [pendingBarcode, setPendingBarcode] = useState<string | null>(null);
    const [activeDetail, setActiveDetail] = useState<StockItem | null>(null);
    const [activeChange, setActiveChange] = useState<{ item: StockItem; type: 'add' | 'remove' } | null>(null);

    useEffect(() => {
        setActivePath('/dashboard/stockbusiness');
    }, [setActivePath]);

    // Stok istatistikleri
    const totalItems = stocks.length;
    const lowStockItems = stocks.filter(item => item.quantity <= item.minQuantity).length;
    const totalValue = stocks.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const outOfStockItems = stocks.filter(item => item.quantity === 0).length;

    const handleBarcodeClick = useCallback(() => {
        setIsBarcodeModalOpen(true);
    }, []);

    const handleBarcodeResult = useCallback((barcode: string) => {
        setSearch(barcode);
        setIsBarcodeModalOpen(false);

        // Barcode ile eşleşen ürün var mı?
        const found = stocks.some(stock => stock.barcode === barcode);
        if (!found) {
            setPendingBarcode(barcode); // barcode'ı sakla
            setIsAddModalOpen(true);    // ekleme modalını aç
        }
    }, [stocks]);

    const handleStockChange = useCallback((id: string, amount: number, type: "add" | "remove") => {
        setStocks(prev => prev.map(stock => {
            if (stock.id === id) {
                const newQuantity = type === "add" 
                    ? stock.quantity + amount 
                    : Math.max(0, stock.quantity - amount);
                
                return {
                    ...stock,
                    quantity: newQuantity,
                    lastUpdated: new Date().toISOString()
                };
            }
            return stock;
        }));
    }, []);

    const handleAddStock = useCallback((newStock: StockItem) => {
        setStocks(prev => [...prev, newStock]);
        setIsAddModalOpen(false);
        setPendingBarcode(null); // barcode eklenince temizle
    }, []);

    const filteredStocks = stocks.filter(stock => 
        stock.name.toLowerCase().includes(search.toLowerCase()) ||
        stock.category.toLowerCase().includes(search.toLowerCase()) ||
        stock.barcode?.toLowerCase().includes(search.toLowerCase())
    );

    const TableComponent = ({ items, onStockChange }: StockTableProps) => (
        <StockTable
            items={items}
            onStockChange={onStockChange}
            onOpenAdd={(item) => setActiveChange({ item, type: 'add' })}
            onOpenRemove={(item) => setActiveChange({ item, type: 'remove' })}
            onOpenDetail={(item) => setActiveDetail(item)}
        />
    );

    const ModalComponent = ({ open, onClose, onSubmit }: StockAddModalProps) => (
        <StockAddModal
            open={open}
            onClose={() => {
                onClose();
                setPendingBarcode(null); // modal kapatılırsa barcode temizle
            }}
            onAdd={onSubmit}
            initialBarcode={pendingBarcode || ""}
        />
    );

    // Stok kartları
    const stockStats = [
        { 
            title: "Toplam Ürün", 
            value: totalItems, 
            icon: <Package size={20} />, 
            color: "from-blue-500 to-blue-600" 
        },
        { 
            title: "Düşük Stok", 
            value: lowStockItems, 
            icon: <AlertTriangle size={20} />, 
            color: "from-red-500 to-red-600" 
        },
        { 
            title: "Toplam Değer", 
            value: `₺${totalValue.toLocaleString()}`, 
            icon: <TrendingUp size={20} />, 
            color: "from-green-500 to-green-600" 
        },
        { 
            title: "Tükenen Ürün", 
            value: outOfStockItems, 
            icon: <ShoppingBag size={20} />, 
            color: "from-orange-500 to-orange-600" 
        }
    ];

    return (
        <PageTransition>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Hero Section */}
                <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-6 sm:p-8 rounded-b-3xl shadow-2xl">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="animate-fade-in">
                                <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3">
                                    <Package className="text-white" size={32} />
                                    Stok Yönetimi
                                </h1>
                                <p className="text-orange-100 text-sm sm:text-base">
                                    Envanter takibi ve stok durumu kontrolü
                                </p>
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 animate-slide-in">
                                <div className="text-right">
                                    <div className="text-xs sm:text-sm text-orange-100 mb-1">Son Güncelleme</div>
                                    <div className="text-lg sm:text-xl font-semibold flex items-center gap-2">
                                        <Clock size={16} />
                                        {new Date().toLocaleDateString('tr-TR')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Stat Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                        {stockStats.map((stat, index) => (
                            <div 
                                key={index} 
                                className="group"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 animate-fade-in">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`p-2 sm:p-3 bg-gradient-to-br ${stat.color} rounded-xl text-white group-hover:scale-110 transition-transform duration-300`}>
                                            {stat.icon}
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs sm:text-sm text-gray-500 mb-1">
                                                {stat.title}
                                            </div>
                                            <div className="text-lg sm:text-2xl font-bold text-gray-800">
                                                {stat.value}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`h-1 bg-gradient-to-r ${stat.color} rounded-full transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300`}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Search and Add Section */}
                    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-8">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                            <div className="flex-1 w-full sm:w-auto">
                                <StockSearchBar 
                                    search={search} 
                                    setSearch={setSearch} 
                                    onBarcodeClick={handleBarcodeClick}
                                />
                            </div>
                            <button
                                onClick={() => setIsAddModalOpen(true)}
                                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2 justify-center font-semibold"
                            >
                                <Plus size={20} />
                                Yeni Stok Ekle
                            </button>
                        </div>
                    </div>

                    {/* Stock Table */}
                    <TableComponent items={filteredStocks} onStockChange={handleStockChange} />
                </div>
            </div>
            
            <ModalComponent
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSubmit={handleAddStock}
            />
            <BarcodeScannerModal
                open={isBarcodeModalOpen}
                onClose={() => setIsBarcodeModalOpen(false)}
                onResult={handleBarcodeResult}
            />
            {activeChange && (
                <StockChangeModal
                    open={true}
                    onClose={() => setActiveChange(null)}
                    item={activeChange.item}
                    type={activeChange.type}
                    onSubmit={(amt) => {
                        handleStockChange(activeChange.item.id, amt, activeChange.type);
                        setActiveChange(null);
                    }}
                />
            )}
            {activeDetail && (
                <StockDetailModal
                    open={true}
                    onClose={() => setActiveDetail(null)}
                    item={activeDetail}
                />
            )}
        </PageTransition>
    );
}
