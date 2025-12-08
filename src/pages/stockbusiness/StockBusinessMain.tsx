import { useState, useCallback, useEffect } from "react";
import { Package, Plus, AlertTriangle, TrendingUp, Clock, ShoppingBag } from "lucide-react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import StockTable from "./components/StockTable";
import StockSearchBar from "./components/StockSearchBar";
import StockAddModal from "./modals/StockAddModal";
import BarcodeScannerModal from "./modals/BarcodeScannerModal";
import StockChangeModal from "./modals/StockChangeModal";
import StockDetailModal from "./modals/StockDetailModal";
import PageTransition from "../../components/PageTransition";
import { useNavigation } from "../../context/provider/NavigationProvider";
import { CategoryProvider, useCategories } from "./provider/CategoryProvider";
import { BaseUnitProvider, useBaseUnits } from "./provider/BaseUnitProvider";
import { StockTypeProvider, useStockTypes } from "./provider/StockTypeProvider";
import { InventoryProvider, useInventories } from "./provider/InventoryProvider";
import { ProductProvider } from "./provider/ProductProvider";
import { SupplierProvider, useSuppliers } from "./provider/SupplierProvider";
import { WarehouseProvider, useWarehouses } from "./provider/WarehouseProvider";
import { StockItem, StockItemAddDto } from "@/types/index";

interface StockTableProps {
    items: StockItem[];
    onStockChange: (id: string, amount: number, type: "add" | "remove") => void;
}

interface StockAddModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (item: StockItemAddDto) => void;
}

// StockAddModal wrapper component that uses categories from context
interface StockAddModalWrapperProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (item: StockItemAddDto) => void;
}

const StockAddModalWrapper: React.FC<StockAddModalWrapperProps> = ({ open, onClose, onSubmit }) => {
    const { categories } = useCategories();
    const { stockTypes } = useStockTypes();
    const { suppliers } = useSuppliers();
    const { warehouses } = useWarehouses();
    const { baseUnits } = useBaseUnits();
    const [pendingBarcode, setPendingBarcode] = useState<string | null>(null);

    return (
        <StockAddModal
            open={open}
            onClose={() => {
                onClose();
                setPendingBarcode(null);
            }}
            onAdd={onSubmit}
            initialBarcode={pendingBarcode || ""}
            suppliers={suppliers.map(supplier => ({
                ...supplier,
                minimumOrder: typeof supplier.minimumOrder === 'string'
                    ? parseFloat(supplier.minimumOrder) || 0
                    : supplier.minimumOrder
            }))}
            stockTypes={stockTypes}
            warehouses={warehouses}
            categories={categories}
            units={baseUnits.length > 0 ? baseUnits.map(unit => ({
                id: unit.id,
                name: unit.name,
                symbol: unit.symbol || unit.shortName,
                description: unit.desc
            })) : []}
        />
    );
};

export default function StockBusinessMain() {
    return (
        <CategoryProvider>
            <BaseUnitProvider>
                <StockTypeProvider>
                    <ProductProvider>
                        <SupplierProvider>
                            <InventoryProvider>
                                <WarehouseProvider>
                                    <StockBusinessMainContent />
                                </WarehouseProvider>
                            </InventoryProvider>
                        </SupplierProvider>
                    </ProductProvider>
                </StockTypeProvider>
            </BaseUnitProvider>
        </CategoryProvider>
    );
}

function StockBusinessMainContent() {
    const { setActivePath } = useNavigation();
    const navigate = useNavigate();
    const location = useLocation();
    const { inventories, loading: loadingInventory } = useInventories();
    const [stocks, setStocks] = useState<StockItem[]>([]);
    const [search, setSearch] = useState<string>("");
    const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
    const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState<boolean>(false);
    const [activeDetail, setActiveDetail] = useState<StockItem | null>(null);
    const [activeChange, setActiveChange] = useState<{ item: StockItem; type: 'add' | 'remove' } | null>(null);
    const [activeTab, setActiveTab] = useState<string>('stock');

    // URL'e göre aktif tab'ı belirle
    useEffect(() => {
        const path = location.pathname;
        if (path.includes('/stock-types')) {
            setActiveTab('stock-types');
        } else if (path.includes('/categories')) {
            setActiveTab('categories');
        } else if (path.includes('/base-units')) {
            setActiveTab('base-units');
        } else if (path.includes('/warehouse')) {
            setActiveTab('warehouse');
        } else if (path.includes('/suppliers')) {
            setActiveTab('suppliers');
        } else {
            setActiveTab('stock');
        }
    }, [location.pathname]);


    const handleTabChange = (tab: { id: string; path: string }) => {
        setActiveTab(tab.id);
        navigate(tab.path);
    };

    useEffect(() => {
        setActivePath('/dashboard/stockbusiness');
    }, [setActivePath]);

    // Client-side stats hesaplama - provider'dan gelen inventories verisini kullan
    const calculateStats = () => {
        const totalItems = inventories.length;
        const lowStockItems = inventories.filter(item => item.quantity <= item.minQuantity).length;
        const totalValue = inventories.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const outOfStockItems = inventories.filter(item => item.quantity === 0).length;

        return {
            totalItems,
            lowStockItems,
            totalValue,
            outOfStockItems
        };
    };

    const stats = calculateStats();

    const handleBarcodeClick = useCallback(() => {
        setIsBarcodeModalOpen(true);
    }, []);

    const handleBarcodeResult = useCallback((barcode: string) => {
        setSearch(barcode);
        setIsBarcodeModalOpen(false);

        // Barcode ile eşleşen ürün var mı?
        const found = stocks.some(stock => stock.barcode === barcode);
        if (!found) {
            // Barcode bulunamadı, ekleme modalını aç
            setIsAddModalOpen(true);
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

    const handleAddStock = useCallback((newStock: StockItemAddDto) => {
        setStocks(prev => [...prev, newStock]);
        setIsAddModalOpen(false);
    }, []);

    const filteredStocks = inventories.filter(stock => {
        return (
            stock?.name?.toLowerCase().includes(search.toLowerCase()) ||
            stock?.stockType?.toLowerCase().includes(search.toLowerCase()) ||
            stock?.barcode?.toLowerCase().includes(search.toLowerCase())
        );
    });

    const TableComponent = ({ items, onStockChange }: StockTableProps) => (




        <StockTable
            items={items}
            onStockChange={onStockChange}
            onOpenAdd={(item) => setActiveChange({ item, type: 'add' })}
            onOpenRemove={(item) => setActiveChange({ item, type: 'remove' })}
            onOpenDetail={(item) => setActiveDetail(item)}
        />
    );

    const ModalComponent = ({ open, onClose, onSubmit }: StockAddModalProps) => {
        return <StockAddModalWrapper open={open} onClose={onClose} onSubmit={onSubmit} />;
    };

    // Stok kartları
    const stockStats = [
        {
            title: "Toplam Ürün",
            value: stats.totalItems,
            icon: <Package size={20} />,
            color: "from-blue-500 to-blue-600"
        },
        {
            title: "Düşük Stok",
            value: stats.lowStockItems,
            icon: <AlertTriangle size={20} />,
            color: "from-red-500 to-red-600"
        },
        {
            title: "Toplam Değer",
            value: `₺${stats.totalValue.toLocaleString()}`,
            icon: <TrendingUp size={20} />,
            color: "from-green-500 to-green-600"
        },
        {
            title: "Tükenen Ürün",
            value: stats.outOfStockItems,
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

                        {/* Tab Navigation */}
                        <div className="mt-6 border-t border-white/20 pt-6">
                            <div className="flex flex-wrap gap-2 sm:gap-4">
                                {[
                                    { id: 'stock', label: 'Stok İşlemleri', icon: '📦', path: '/dashboard/stockbusiness' },
                                    { id: 'stock-types', label: 'Stok Türü İşlemleri', icon: '🏷️', path: '/dashboard/stockbusiness/stock-types' },
                                    { id: 'categories', label: 'Kategori İşlemleri', icon: '📂', path: '/dashboard/stockbusiness/categories' },
                                    { id: 'base-units', label: 'Birim İşlemleri', icon: '📏', path: '/dashboard/stockbusiness/base-units' },
                                    { id: 'warehouse', label: 'Depo İşlemleri', icon: '🏢', path: '/dashboard/stockbusiness/warehouse' },
                                    { id: 'suppliers', label: 'Tedarikçi İşlemleri', icon: '🚚', path: '/dashboard/stockbusiness/suppliers' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        className={`
                                            px-4 py-2 sm:px-6 sm:py-3 rounded-xl font-semibold text-sm sm:text-base
                                            transition-all duration-300 transform hover:scale-105
                                            flex items-center gap-2 backdrop-blur-sm
                                            ${activeTab === tab.id
                                                ? 'bg-white text-orange-600 shadow-lg'
                                                : 'bg-white/20 text-white hover:bg-white/30'
                                            }
                                        `}
                                        onClick={() => handleTabChange(tab)}
                                    >
                                        <span className="text-lg">{tab.icon}</span>
                                        <span className="hidden sm:inline">{tab.label}</span>
                                        <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Ana stok yönetimi içeriği - sadece stock tab'ında görünür */}
                    {activeTab === 'stock' && (
                        <>
                            {loadingInventory ? (
                                <div className="flex items-center justify-center min-h-[400px]">
                                    <div className="text-center">
                                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
                                        <p className="text-gray-600">Stok verileri yükleniyor...</p>
                                    </div>
                                </div>
                            ) : (
                                <>
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
                                </>
                            )}
                        </>
                    )}

                    {/* Child route content - diğer tab'lar için */}
                    {activeTab !== 'stock' && (
                        <div className="animate-fade-in">
                            <Outlet />
                        </div>
                    )}
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
                    onSubmit={(amt: number, updateData?: any) => {
                        if (updateData) {
                            // Gelişmiş güncelleme - tüm stok bilgilerini güncelle
                            setStocks(prev => prev.map(stock => {
                                if (stock.id === activeChange.item.id) {
                                    return {
                                        ...stock,
                                        quantity: updateData.quantity,
                                        unitPrice: updateData.unitPrice,
                                        supplierId: updateData.supplierId,
                                        lastUpdated: updateData.lastUpdated
                                    };
                                }
                                return stock;
                            }));
                        } else {
                            // Basit güncelleme - sadece miktar
                            handleStockChange(activeChange.item.id, amt, activeChange.type);
                        }
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
