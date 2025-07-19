import { useState, useEffect } from "react";
import { X, Plus } from "lucide-react";
import { TableData } from "../../../types";
import { useRestaurant } from "../../../context/context";
import { menuData } from "../../menubusiness/mocks/menuData";
import { categoryData } from "../../menubusiness/mocks/categoryData";
import { generateUniqueId } from "../../../utils/idUtils";

interface Category {
    id: string;
    name: string;
}

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image?: string;
    description?: string;
    status: string;
}

interface CartItem {
    id: string;
    productName: string;
    quantity: number;
    price: number;
    note: string[];
}

interface CategoryTabsProps {
    categories: Category[];
    selected: string;
    onSelect: (categoryName: string) => void;
}

// Kategori sekmeleri bileşeni - Modern responsive tasarım
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

interface NoteModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (notes: string[]) => void;
    suggestions: string[];
}

// Not giriş pop-up'ı - Modern tasarım
const NoteModal = ({ open, onClose, onSave, suggestions }: NoteModalProps) => {
    const [note, setNote] = useState<string[]>([]);
    const [input, setInput] = useState<string>("");

    useEffect(() => {
        setNote([]);
        setInput("");
    }, [open]);

    if (!open) return null;

    const handleAddTag = (tag: string) => {
        if (!note.includes(tag)) setNote([...note, tag]);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);

    const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && input.trim()) {
            handleAddTag(input.trim());
            setInput("");
        }
    };

    const handleRemoveTag = (tag: string) => setNote(note.filter(n => n !== tag));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 animate-in fade-in-0 zoom-in-95 duration-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">Ürün Notu Ekle</h3>
                    <button
                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                        onClick={onClose}
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                <div className="space-y-4">
                    {/* Not etiketleri */}
                    <div className="flex flex-wrap gap-2">
                        {note.map((tag, i) => (
                            <span key={i} className="bg-blue-100 text-blue-700 text-sm px-3 py-1.5 rounded-full flex items-center gap-1">
                                {tag}
                                <button
                                    className="text-blue-500 hover:text-red-500 transition-colors"
                                    onClick={() => handleRemoveTag(tag)}
                                    type="button"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                    </div>

                    {/* Not girişi */}
                    <input
                        type="text"
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                        placeholder="Not giriniz veya #etiket ekleyin..."
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleInputKeyDown}
                        autoFocus
                    />

                    {/* Öneriler */}
                    <div className="space-y-2">
                        <p className="text-sm text-gray-600 font-medium">Hızlı Seçenekler:</p>
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-full hover:bg-blue-100 hover:text-blue-700 transition-colors"
                                    onClick={() => handleAddTag(s)}
                                    type="button"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Butonlar */}
                    <div className="flex gap-3 pt-4">
                        <button
                            className="flex-1 bg-gray-100 text-gray-700 rounded-xl px-4 py-3 font-semibold hover:bg-gray-200 transition-colors"
                            onClick={onClose}
                        >
                            İptal
                        </button>
                        <button
                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl px-4 py-3 font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25"
                            onClick={() => { onSave(note); setNote([]); setInput(""); }}
                        >
                            Ekle
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ProductCardProps {
    product: Product;
    onAdd: () => void;
    onAddWithNote: () => void;
}

// Ürün kartı bileşeni - Modern responsive tasarım
const ProductCard = ({ product, onAdd, onAddWithNote }: ProductCardProps) => (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden group hover:shadow-xl hover:scale-[1.02] transition-all duration-300 hover:border-blue-200">
        {/* Ürün Resmi */}
        <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden group-hover:from-blue-50 group-hover:to-blue-100 transition-all">
            <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300"></div>
        </div>

        {/* Ürün Bilgileri */}
        <div className="p-3 sm:p-4">
            <h4 className="font-bold text-gray-800 text-sm sm:text-base mb-1 line-clamp-2">{product.name}</h4>
            <p className="text-blue-600 font-bold text-lg sm:text-xl mb-3">₺{product.price.toFixed(2)}</p>

            {/* Butonlar */}
            <div className="flex gap-2">
                <button
                    className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold text-sm hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/25"
                    onClick={onAdd}
                >
                    Ekle
                </button>
                <button
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-colors"
                    onClick={onAddWithNote}
                    title="Notla Ekle"
                >
                    <Plus size={16} />
                </button>
            </div>
        </div>
    </div>
);

interface ProductGridProps {
    products: Product[];
    onAddToCart: (product: Product) => void;
    onAddToCartWithNote: (product: Product) => void;
}

// Ürün grid bileşeni - Modern responsive tasarım
const ProductGrid = ({ products, onAddToCart, onAddToCartWithNote }: ProductGridProps) => (
    <div className="h-full overflow-y-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4 pb-4">
            {products.map((product: Product) => (
                <ProductCard
                    key={product.id}
                    product={product}
                    onAdd={() => onAddToCart(product)}
                    onAddWithNote={() => onAddToCartWithNote(product)}
                />
            ))}
        </div>
        {products.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-lg font-medium">Ürün bulunamadı</p>
                <p className="text-sm">Farklı bir kategori seçin veya arama teriminizi değiştirin</p>
            </div>
        )}
    </div>
);

interface CartPanelProps {
    cart: CartItem[];
    setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
    table: TableData;
    onConfirm: () => void;
    onUpdateExistingOrder: (orderId: string, updateData: any) => void;
    onRemoveExistingOrder: (orderId: string) => void;
    onClearCart: () => void; // Sepeti temizleme fonksiyonu
    onClose: () => void; // Modal kapatma fonksiyonu
}

const CartPanel = ({ cart, setCart, table, onConfirm, onUpdateExistingOrder, onRemoveExistingOrder, onClearCart, onClose }: CartPanelProps) => {
    const handleQtyChange = (id: string, delta: number) => {
        setCart((prev: CartItem[]) =>
            prev
                .map((item: CartItem) =>
                    item.id === id
                        ? { ...item, quantity: Math.max(1, item.quantity + delta) }
                        : item
                )
                .filter((item: CartItem) => item.quantity > 0)
        );
    };

    const handleRemove = (id: string) =>
        setCart((prev: CartItem[]) => prev.filter((item: CartItem) => item.id !== id));

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const existingOrders = table.orders || [];
    const existingTotal = existingOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const grandTotal = existingTotal + totalAmount;

    console.log(existingOrders)

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col h-full">
            {/* Sepet Header - Genel Toplam */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">{existingOrders.length + cart.length}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">Sipariş Yönetimi</h3>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-bold text-blue-600">₺{grandTotal.toFixed(2)}</span>
                    {totalAmount > 0 && (
                        <p className="text-xs text-gray-500">Yeni: +₺{totalAmount.toFixed(2)}</p>
                    )}
                </div>
            </div>

            {existingOrders.length > 0 && (
                <div className="border-b border-gray-200">
                    <div className="p-3 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-semibold text-gray-700">Mevcut Siparişler</h4>
                            <span className="text-sm font-bold text-gray-600">₺{existingTotal.toFixed(2)}</span>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {existingOrders.map((order: any, idx: number) => (
                                <div key={order.id || idx} className="bg-white rounded-lg p-3 border border-gray-100">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h5 className="font-medium text-gray-800 text-sm">{order.productName}</h5>
                                            {order.note && order.note.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {order.note.map((tag: string, idx: number) => (
                                                        <span key={idx} className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-right ml-2">
                                            <p className="font-bold text-gray-800 text-sm">₺{(order.total || 0).toFixed(2)}</p>
                                            <p className="text-xs text-gray-500">₺{(order.price || 0).toFixed(2)} x {order.quantity}</p>
                                        </div>
                                    </div>

                                    {/* Mevcut Sipariş Düzenleme Kontrolleri */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {order.quantity === 1 ? (
                                                <button
                                                    className="w-6 h-6 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center text-xs"
                                                    onClick={() => onRemoveExistingOrder(order.id)}
                                                    title="Siparişi sil"
                                                >
                                                    <X size={12} />
                                                </button>
                                            ) : (
                                                <button
                                                    className="w-6 h-6 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center text-xs font-bold"
                                                    onClick={() => onUpdateExistingOrder(order.id, { quantity: order.quantity - 1 })}
                                                >
                                                    -
                                                </button>
                                            )}
                                            <span className="min-w-[1.5rem] text-center font-semibold text-xs">{order.quantity}</span>
                                            <button
                                                className="w-6 h-6 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center text-xs font-bold"
                                                onClick={() => onUpdateExistingOrder(order.id, { quantity: order.quantity + 1 })}
                                            >
                                                +
                                            </button>
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs ${order.status === 'delivered' ? 'bg-green-100 text-green-600' :
                                            order.status === 'ready' ? 'bg-blue-100 text-blue-600' :
                                                order.status === 'preparing' ? 'bg-yellow-100 text-yellow-600' :
                                                    'bg-gray-100 text-gray-600'
                                            }`}>
                                            {order.status === 'pending' ? 'Bekliyor' :
                                                order.status === 'preparing' ? 'Hazırlanıyor' :
                                                    order.status === 'ready' ? 'Hazır' : 'Teslim'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4">
                {cart.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-6xl mb-4">🛒</div>
                        <p className="text-gray-500 font-medium">Sepet boş</p>
                        <p className="text-sm text-gray-400">Ürün ekleyerek siparişe başlayın</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {cart.map((item: CartItem) => (
                            <div key={item.id} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-gray-800 text-sm">{item.productName}</h4>
                                        {item.note && item.note.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {item.note.map((tag: string, idx: number) => (
                                                    <span key={idx} className="bg-blue-50 text-blue-600 text-xs px-2 py-1 rounded-full">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right ml-2">
                                        <p className="font-bold text-gray-800 text-sm">₺{(item.price * item.quantity).toFixed(2)}</p>
                                        <p className="text-xs text-gray-500">₺{item.price.toFixed(2)} x {item.quantity}</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-2">
                                        {item.quantity === 1 ? (
                                            <button
                                                className="w-7 h-7 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center justify-center"
                                                onClick={() => handleRemove(item.id)}
                                                title="Ürünü sepetten çıkar"
                                            >
                                                <X size={14} />
                                            </button>
                                        ) : (
                                            <button
                                                className="w-7 h-7 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center text-sm font-bold"
                                                onClick={() => handleQtyChange(item.id, -1)}
                                            >
                                                -
                                            </button>
                                        )}
                                        <span className="min-w-[1.5rem] text-center font-semibold text-sm">{item.quantity}</span>
                                        <button
                                            className="w-7 h-7 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center text-sm font-bold"
                                            onClick={() => handleQtyChange(item.id, 1)}
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-200 space-y-3">
                {cart.length > 0 && (
                    <button
                        className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-500/25"
                        onClick={onConfirm}
                    >
                        Yeni Ürünleri Ekle ({cart.length} ürün)
                    </button>
                )}
                <button
                    className="w-full py-2 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                    onClick={cart.length > 0 ? onClearCart : onClose}
                >
                    {cart.length > 0 ? 'Sepeti Temizle' : 'Kapat'}
                </button>
            </div>
        </div>
    );
};

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
            />

            <div className="flex flex-col h-full bg-gray-50 rounded-2xl overflow-hidden">
                {/* Modern Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 relative">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">Masa {table.number}</h2>
                            <p className="text-blue-100 mt-1">Sipariş Girişi</p>
                            {openTime && (
                                <p className="text-blue-200 text-sm mt-1">
                                    🕒 Açık: {elapsed}
                                </p>
                            )}
                        </div>
                        <button
                            className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
                            onClick={onClose}
                            aria-label="Sipariş Panelini Kapat"
                        >
                            <X size={24} className="text-white" />
                        </button>
                    </div>
                </div>

                {/* Content Area - Modern Responsive Layout */}
                <div className="flex-1 overflow-hidden">
                    <div className="flex flex-col xl:flex-row h-full">
                        {/* Ürünler Bölümü */}
                        <div className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden">
                            {/* Kategori + Arama - Mobile İyileştirmesi */}
                            <div className="space-y-4 mb-6">
                                <CategoryTabs
                                    categories={activeCategories}
                                    selected={selectedCategory}
                                    onSelect={setSelectedCategory}
                                />

                                {/* Modern Arama Çubuğu */}
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
                                        className="block w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white shadow-sm"
                                    />
                                    {search && (
                                        <button
                                            onClick={() => setSearch("")}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                        >
                                            <X size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Ürün Grid - Full Height */}
                            <div className="flex-1 overflow-hidden">
                                <ProductGrid
                                    products={filteredProducts}
                                    onAddToCart={product => handleAddToCart(product)}
                                    onAddToCartWithNote={handleAddToCartWithNote}
                                />
                            </div>
                        </div>

                        <div className="xl:w-96 flex-shrink-0 border-t xl:border-t-0 xl:border-l border-gray-200">
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
            </div>
        </>
    );
};

export default OrderPanel;