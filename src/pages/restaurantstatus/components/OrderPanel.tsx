import { useState, useEffect } from "react";
import { X } from "lucide-react";
import NoteModal from "./shared/NoteModal";
import ProductGrid from "./orderpanel/ProductGrid";
import { TableData } from "../../../types";
import CartPanel from "./orderpanel/CartPanel";
import { CartItem, Product } from "./orderpanel/types";
import { useRestaurant } from "../../../context/context";
import { menuData } from "../../menubusiness/mocks/menuData";
import { categoryData } from "../../menubusiness/mocks/categoryData";
import { generateUniqueId } from "../../../utils/idUtils";

interface Category { id: string; name: string; }

// ProductGrid extracted to own file (Stage 3)

interface CategoryTabsProps {
    categories: Category[];
    selected: string;
    onSelect: (categoryName: string) => void;
}

const CategoryTabs = ({ categories, selected, onSelect }: CategoryTabsProps) => (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        <button
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 whitespace-nowrap flex-shrink-0 ${selected === ""
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102"
                }`}
            onClick={() => onSelect("")}
        >
            Tümü
        </button>
        {categories.map(cat => (
            <button
                key={cat.id}
                className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 whitespace-nowrap flex-shrink-0 ${selected === cat.name
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102"
                    }`}
                onClick={() => onSelect(cat.name)}
            >
                {cat.name}
            </button>
        ))}
    </div>
);

// CartItem type moved to shared types

// (Local ProductGrid removed – using extracted version)

// CartPanel moved to its own file

// Not önerileri
const noteSuggestions = [
    "#marul olmasın",
    "#acı sos ekle",
    "#soğansız",
    "#buzsuz",
    "#az pişmiş"
];

// updateOrder artık RestaurantProvider'dan gelecek!
interface OrderPanelProps {
    table: TableData;
    onClose: () => void;
}

const OrderPanel = ({ table, onClose }: OrderPanelProps) => {
    // RestaurantProvider'dan metotları ve güncel table data'sını al
    const { addOrderToTable, updateOrderInTable, removeOrderFromTable, openTable, tables } = useRestaurant();

    // Güncel table data'sını bul (real-time updates için)
    const currentTable = tables.find(t => t.id === table.id) || table;

    // Gerçek kategorilerden ilkini seç (sadece aktif olanları)
    const activeCategories = categoryData;
    const activeMenuItems = menuData.filter(item => item.status === "active");

    const [selectedCategory, setSelectedCategory] = useState<string>(activeCategories[0]?.name || "");
    const [search, setSearch] = useState("");
    // Cart sadece yeni ürünler için - mevcut siparişleri tekrar eklememek için boş başlatıyoruz
    const [cart, setCart] = useState<CartItem[]>([]);
    const [noteModal, setNoteModal] = useState<{ open: boolean; product: Product | null }>({ open: false, product: null });

    // Masa açılış zamanı state'i
    const [openTime, setOpenTime] = useState<Date | null>(table.occupiedAt ? new Date(table.occupiedAt) : null);
    const [elapsed, setElapsed] = useState<string>("");

    // Cart'ı her table değiştiğinde temizle (yeni sipariş için temiz başlangıç)
    useEffect(() => {
        setCart([]);
    }, [table.id]);

    // Sipariş paneli açıldığında masa açık değilse açılış zamanını kaydet
    useEffect(() => {
        if (!table.occupiedAt) {
            const now = new Date();
            setOpenTime(now);
        } else {
            setOpenTime(new Date(table.occupiedAt));
        }
    }, [table.occupiedAt]);

    // Süreyi her dakikada bir güncelle
    useEffect(() => {
        if (!openTime) return;
        const interval = setInterval(() => {
            const now = new Date();
            const diff = Math.floor((now.getTime() - openTime.getTime()) / 1000); // saniye
            const hours = Math.floor(diff / 3600);
            const minutes = Math.floor((diff % 3600) / 60);
            setElapsed(
                hours > 0
                    ? `${hours} saat ${minutes} dk`
                    : `${minutes} dk`
            );
        }, 1000 * 60); // her dakika
        // İlk render için de hesapla
        const now = new Date();
        const diff = Math.floor((now.getTime() - openTime.getTime()) / 1000);
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        setElapsed(
            hours > 0
                ? `${hours} saat ${minutes} dk`
                : `${minutes} dk`
        );
        return () => clearInterval(interval);
    }, [openTime]);

    const filteredProducts = activeMenuItems.filter(
        p =>
            (selectedCategory ? p.category === selectedCategory : true) &&
            p.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleAddToCart = (product: Product, note: string[] = []) => {
        setCart((prev: CartItem[]) => {
            const exists = prev.find((item: CartItem) => item.productName === product.name && JSON.stringify(item.note) === JSON.stringify(note));
            if (exists) {
                return prev.map((item: CartItem) =>
                    item.productName === product.name && JSON.stringify(item.note) === JSON.stringify(note)
                        ? {
                            ...item,
                            quantity: item.quantity + 1
                        }
                        : item
                );
            }



            return [
                ...prev,
                {
                    id: generateUniqueId(),
                    productName: product.name,
                    quantity: 1,
                    note,
                    price: product.price
                }
            ];
        });
    };

    const handleAddToCartWithNote = (product: Product) => {
        setNoteModal({ open: true, product });
    };

    const handleNoteSave = (noteArr: string[]) => {
        if (noteModal.product) {
            handleAddToCart(noteModal.product, noteArr);
        }
        setNoteModal({ open: false, product: null });
    };

    // Mevcut sipariş güncelleme fonksiyonları
    const handleUpdateExistingOrder = (orderId: string, updateData: any) => {
        updateOrderInTable(currentTable.id, orderId, updateData);
    };

    const handleRemoveExistingOrder = (orderId: string) => {
        removeOrderFromTable(currentTable.id, orderId);
    };

    const handleConfirmOrder = async () => {
        try {
            if (cart.length > 0) {
                if (currentTable.status === "available") {
                    openTable(currentTable.id);
                    addOrderToTable(currentTable.id, cart);

                } else {
                    addOrderToTable(currentTable.id, cart);
                }
                setCart([]);
            }

        } catch (error) {
            console.error("Sipariş ekleme hatası:", error);
        }
    };

    const handleClearCart = () => {
        setCart([]);
    };

    return (
        <>
            <NoteModal
                open={noteModal.open}
                onClose={() => setNoteModal({ open: false, product: null })}
                onSave={handleNoteSave}
                suggestions={noteSuggestions}
                mode="add"
                title="Ürün Notu Ekle"
                addButtonLabel="Ekle"
            />

            <div className="flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-lg">
                {/* Header (soft) */}
                <div className="bg-white p-4 sm:p-5 rounded-t-2xl border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-sm">
                                <span className="font-semibold text-sm">{table.number}</span>
                            </div>
                            <div>
                                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Masa {table.number}</h2>
                                <p className="text-gray-500 text-xs sm:text-sm">Sipariş Girişi</p>
                                {openTime && (
                                    <p className="text-gray-400 text-[11px] mt-1">🕒 Açık: {elapsed}</p>
                                )}
                            </div>
                        </div>
                        <button
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                            onClick={onClose}
                            aria-label="Sipariş Panelini Kapat"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Content Area - Minimalist Responsive Layout */}
                <div className="flex-1 flex flex-col xl:flex-row overflow-hidden">
                    {/* Ürünler Bölümü */}
                    <div className="flex-1 flex flex-col p-2 sm:p-4 overflow-hidden bg-gray-50">
                        {/* Kategori + Arama */}
                        <div className="space-y-2 mb-4">
                            <CategoryTabs
                                categories={activeCategories}
                                selected={selectedCategory}
                                onSelect={setSelectedCategory}
                            />
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Ürün, kategori ara..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white shadow-sm text-sm"
                                />
                                {search && (
                                    <button
                                        onClick={() => setSearch("")}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                        {/* Ürün Grid - Full Height */}
                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            <ProductGrid
                                products={filteredProducts}
                                onAddToCart={product => handleAddToCart(product)}
                                onAddToCartWithNote={handleAddToCartWithNote}
                            />
                        </div>
                    </div>

                    {/* Sepet Paneli */}
                    <div className="xl:w-80 flex-shrink-0 border-t xl:border-t-0 xl:border-l border-gray-200 bg-white">
                        <CartPanel
                            cart={cart}
                            setCart={setCart}
                            table={currentTable}
                            onConfirm={handleConfirmOrder}
                            onUpdateExistingOrder={handleUpdateExistingOrder}
                            onRemoveExistingOrder={handleRemoveExistingOrder}
                            onClearCart={handleClearCart}
                            onClose={onClose}
                        />
                    </div>
                </div>
            </div>
        </>
    );
};

export default OrderPanel;