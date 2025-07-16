import React, { useState, useEffect } from "react";
import { X, CreditCard, Edit2, Receipt, Banknote, Wallet, Check, Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";

interface CartItem {
    orderItemId: string;
    productName: string;
    quantity: number;
    qty?: number;
    price?: number;
    totalPrice?: number;
    note: string[];
    tableId?: number;
}

interface PaymentPanelProps {
    table: any;
    cart: CartItem[];
    setCart: (cart: CartItem[]) => void;
    onClose: () => void;
    onCompletePayment: (paymentMethod: "cash" | "card") => void;
    updateOrder?: (tableId: number, cart: CartItem[]) => void;
    updateTable?: (tableId: number, data: any) => void;
}

interface PaymentOption {
    key: string;
    label: string;
    icon: React.ReactNode;
}

const paymentOptions: PaymentOption[] = [
    { key: "cash", label: "Nakit", icon: <Banknote size={20} /> },
    { key: "credit", label: "Kredi Kartı", icon: <CreditCard size={20} /> }
];

const noteSuggestions: string[] = [
    "#marul olmasın",
    "#acı sos ekle",
    "#soğansız",
    "#buzsuz",
    "#az pişmiş"
];

interface NoteModalProps {
    open: boolean;
    onClose: () => void;
    onSave: (notes: string[]) => void;
    initialNote?: string[];
    suggestions: string[];
}

// Not güncelleme modalı
const NoteModal = ({ open, onClose, onSave, initialNote = [], suggestions }: NoteModalProps) => {
    const [note, setNote] = useState<string[]>(initialNote);
    const [input, setInput] = useState<string>("");
    useEffect(() => {
        setNote(initialNote);
    }, [initialNote, open]);
    if (!open) return null;

    const handleAddTag = (tag: string) => {
        if (!note.includes(tag)) setNote([...note, tag]);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value);

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && input.trim()) {
            handleAddTag(input.trim());
            setInput("");
        }
    };

    const handleRemoveTag = (tag: string) => setNote(note.filter(n => n !== tag));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4 relative"
            >
                <button 
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors" 
                    onClick={onClose}
                >
                    <X size={20} className="text-gray-600" />
                </button>
                
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-full">
                            <Edit2 size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Ürün Notunu Güncelle</h3>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                        {note.map((tag, i) => (
                            <span key={i} className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 text-sm px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm">
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
                    
                    <input
                        type="text"
                        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                        placeholder="Not giriniz veya #etiket ekleyin..."
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleInputKeyDown}
                        autoFocus
                    />
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                        {suggestions.map((s, i) => (
                            <button
                                key={i}
                                className="bg-gray-100 hover:bg-blue-100 text-gray-700 text-sm px-3 py-1.5 rounded-full transition-colors"
                                onClick={() => handleAddTag(s)}
                                type="button"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
                
                <button
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl px-4 py-3 font-semibold transition-all duration-200 shadow-lg"
                    onClick={() => { onSave(note); }}
                >
                    Kaydet
                </button>
            </motion.div>
        </div>
    );
};

const PaymentPanel = ({
    cart,
    setCart,
    onClose,
    onCompletePayment,
    updateOrder,
    updateTable
}: PaymentPanelProps) => {
    const [selectedPayment, setSelectedPayment] = useState<"cash" | "card">("cash");
    const [noteModal, setNoteModal] = useState<{ open: boolean; item: CartItem | null }>({ open: false, item: null });

    // Sepet işlemleri
    const handleQtyChange = (item: CartItem, delta: number) => {
        const newCart = cart
            .map((it: CartItem) =>
                it.orderItemId === item.orderItemId
                    ? { ...it, quantity: Math.max(1, it.quantity + delta) }
                    : it
            )
            .filter((it: CartItem) => it.quantity > 0);
        setCart(newCart);
        updateOrder && updateOrder(newCart[0]?.tableId || 0, newCart);
    };

    const handleRemove = (item: CartItem) => {
        const newCart = cart.filter((it: CartItem) => it.orderItemId !== item.orderItemId);
        setCart(newCart);
        if (updateOrder && newCart.length > 0) {
            updateOrder(newCart[0].tableId || 0, newCart);
        } else if (updateOrder && cart.length > 0) {
            updateOrder(cart[0].tableId || 0, []);
        }
    };

    // Not güncelleme
    const handleEditNote = (item: CartItem) => setNoteModal({ open: true, item });
    const handleNoteSave = (noteArr: string[]) => {
        if (noteModal.item) {
            const newCart = cart.map((it: CartItem) =>
                it.orderItemId === noteModal.item!.orderItemId
                    ? { ...it, note: noteArr }
                    : it
            );
            setCart(newCart);
            updateOrder && updateOrder(newCart[0]?.tableId || 0, newCart);
        }
        setNoteModal({ open: false, item: null });
    };

    // Toplam tutar
    const total = cart.reduce(
        (sum, it) => sum + ((it.price ?? (it.totalPrice && (it.qty ?? it.quantity) ? it.totalPrice / (it.qty ?? it.quantity) : 0)) * (it.qty ?? it.quantity)),
        0
    );

    // Ödeme işlemi
    const handlePayment = () => {
        if (updateOrder && cart.length > 0) {
            updateOrder(
                cart[0].tableId || 0,
                cart.map((it: CartItem) => ({
                    orderItemId: it.orderItemId,
                    productName: it.productName,
                    quantity: it.qty ?? it.quantity,
                    note: it.note,
                    totalPrice: (it.price ?? (it.totalPrice && (it.qty ?? it.quantity) ? it.totalPrice / (it.qty ?? it.quantity) : 0)) * (it.qty ?? it.quantity)
                } as CartItem))
            );
        }
        updateTable && updateTable(cart[0]?.tableId || 0, { occupied: false, totalBill: 0, waiter: "", lastOrderTime: "" });
        onCompletePayment(selectedPayment);
    };

    return (
        <>
            <NoteModal
                open={noteModal.open}
                onClose={() => setNoteModal({ open: false, item: null })}
                onSave={handleNoteSave}
                initialNote={noteModal.item?.note || []}
                suggestions={noteSuggestions}
            />
            <div className="h-full flex flex-col">
                {/* Modern Header with Gradient */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-2xl mb-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-full">
                                <CreditCard size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">Ödeme Paneli</h2>
                                <p className="text-green-100">Sipariş ödemesini tamamlayın</p>
                            </div>
                        </div>
                        <button
                            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                            onClick={onClose}
                            aria-label="Ödeme Panelini Kapat"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Sol: Sipariş Özeti */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-full">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-full">
                                        <Receipt size={20} className="text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">Sipariş Özeti</h3>
                                </div>
                            </div>
                            <div className="p-6 overflow-y-auto max-h-96">
                                {cart.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Receipt size={32} className="text-gray-400" />
                                        </div>
                                        <p className="text-gray-500">Sepet boş</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {cart.map((item: CartItem, i: number) => (
                                            <motion.div
                                                key={i}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.3, delay: i * 0.1 }}
                                                className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                                            >
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1">
                                                        <h4 className="font-semibold text-gray-800 mb-2">{item.productName}</h4>
                                                        {item.note && item.note.length > 0 && (
                                                            <div className="flex flex-wrap gap-2 mb-3">
                                                                {item.note.map((tag: string, idx: number) => (
                                                                    <span key={idx} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                                                                        {tag}
                                                                    </span>
                                                                ))}
                                                                <button
                                                                    className="text-blue-500 hover:text-blue-700 p-1 rounded-full hover:bg-blue-50"
                                                                    onClick={() => handleEditNote(item)}
                                                                    title="Notu güncelle"
                                                                >
                                                                    <Edit2 size={14} />
                                                                </button>
                                                            </div>
                                                        )}
                                                        <p className="text-sm text-gray-600">
                                                            Birim fiyat: {item.price}₺
                                                        </p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-3">
                                                        <div className="flex items-center gap-2">
                                                            {item.quantity === 1 ? (
                                                                <button
                                                                    className="w-8 h-8 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 flex items-center justify-center transition-colors"
                                                                    onClick={() => handleRemove(item)}
                                                                    title="Ürünü sepetten çıkar"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="w-8 h-8 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center transition-colors"
                                                                    onClick={() => handleQtyChange(item, -1)}
                                                                >
                                                                    <Minus size={16} />
                                                                </button>
                                                            )}
                                                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                                                            <button
                                                                className="w-8 h-8 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 flex items-center justify-center transition-colors"
                                                                onClick={() => handleQtyChange(item, 1)}
                                                            >
                                                                <Plus size={16} />
                                                            </button>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-lg font-bold text-gray-800">
                                                                {(item.price || 0) * item.quantity}₺
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sağ: Ödeme Paneli */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 h-full">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 rounded-full">
                                        <Wallet size={20} className="text-green-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">Ödeme</h3>
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Toplam Tutar */}
                                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
                                    <p className="text-sm text-green-700 mb-1">Toplam Tutar</p>
                                    <p className="text-3xl font-bold text-green-800">{total}₺</p>
                                </div>

                                {/* Ödeme Seçenekleri */}
                                <div>
                                    <p className="font-semibold text-gray-800 mb-3">Ödeme Yöntemi</p>
                                    <div className="space-y-2">
                                        {paymentOptions.map(opt => (
                                            <button
                                                key={opt.key}
                                                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                                                    selectedPayment === opt.key
                                                        ? "bg-blue-50 border-blue-500 text-blue-700"
                                                        : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                                                }`}
                                                onClick={() => setSelectedPayment(opt.key as "cash" | "card")}
                                            >
                                                <div className={`p-2 rounded-full ${
                                                    selectedPayment === opt.key
                                                        ? "bg-blue-100"
                                                        : "bg-gray-200"
                                                }`}>
                                                    {opt.icon}
                                                </div>
                                                <span className="font-medium">{opt.label}</span>
                                                {selectedPayment === opt.key && (
                                                    <div className="ml-auto">
                                                        <Check size={20} className="text-blue-600" />
                                                    </div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Ödeme Butonu */}
                                <button
                                    className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    onClick={handlePayment}
                                    disabled={cart.length === 0}
                                >
                                    {selectedPayment === "cash"
                                        ? "Nakit Ödemeyi Tamamla"
                                        : "Kredi Kartı ile Ödeme"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PaymentPanel;