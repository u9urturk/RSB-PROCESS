import React, { useState } from "react";
import { X, CreditCard, Receipt, Banknote, Wallet, Check, Minus, Plus } from "lucide-react";
import { useRestaurant } from "../../../context/context";
import NoteModal from "./shared/NoteModal";

interface CartItem {
    id: string;
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
    onClose: () => void;
    onCompletePayment: (paymentMethod: "cash" | "card") => void;
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

// NoteModal imported (shared)

const PaymentPanel = ({
    table,
    cart,
    onClose,
    onCompletePayment
}: PaymentPanelProps) => {
    // RestaurantProvider'dan metotları al
    const { updateOrderInTable, removeOrderFromTable } = useRestaurant();

    const [selectedPayment, setSelectedPayment] = useState<"cash" | "card">("cash");
    const [noteModal, setNoteModal] = useState<{ open: boolean; item: CartItem | null }>({ open: false, item: null });

    // Sepet işlemleri - Sadece RestaurantProvider üzerinden güncelleme
    const handleQtyChange = (item: CartItem, delta: number) => {
        const newQuantity = Math.max(1, item.quantity + delta);

        updateOrderInTable(table.id, item.id, { quantity: newQuantity });
    };

    const handleRemove = (item: CartItem) => {
        // Sadece RestaurantProvider'dan silme
        // Local cart state'i useEffect ile otomatik güncellenecek
        removeOrderFromTable(table.id, item.id);
    };

    // Not güncelleme - Sadece RestaurantProvider üzerinden
    const handleEditNote = (item: CartItem) => setNoteModal({ open: true, item });
    const handleNoteSave = (noteArr: string[]) => {
        if (noteModal.item) {
            // Sadece RestaurantProvider'da güncelleme yap
            // Local cart state'i useEffect ile otomatik güncellenecek
            updateOrderInTable(table.id, noteModal.item.id, { note: noteArr });
        }
        setNoteModal({ open: false, item: null });
    };

    // Toplam tutar
    const total = cart.reduce(
        (sum, it) => sum + ((it.price ?? 0) * (it.quantity ?? 1)),
        0
    );

    // Ödeme işlemi
    const handlePayment = () => {
        // PaymentPanel zaten önceden ödeme onayını handle ediyor
        // onCompletePayment callback'i TableModal'da processPayment'ı çağırıyor
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
                mode="edit"
                title="Ürün Notunu Güncelle"
                saveButtonLabel="Kaydet"
            />
            <div className="h-auto flex flex-col overflow-y-auto no-scrollbar">
                {/* Header (soft) */}
                <div className="bg-white border-b border-gray-200 p-3 rounded-t-xl md:rounded-t-2xl mb-3 shadow-sm sticky top-0 z-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white flex items-center justify-center shadow-sm">
                                <CreditCard size={20} />
                            </div>
                            <div className="leading-tight">
                                <h2 className="text-xl font-semibold text-gray-800">Ödeme Paneli</h2>
                                <p className="text-gray-500 text-xs">Sipariş ödemesini tamamlayın</p>
                            </div>
                        </div>
                        <button
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-500"
                            onClick={onClose}
                            aria-label="Ödeme Panelini Kapat"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 px-4  md:px-6 py-1 md:py-8 lg:grid-cols-3 gap-6">
                    {/* Sol: Sipariş Özeti */}
                    <div className="lg:col-span-2 overflow-y-auto no-scrollbar">
                        <div className="bg-white rounded-t-2xl shadow-lg border border-gray-100 h-full">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 rounded-full">
                                        <Receipt size={20} className="text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800">Sipariş Özeti</h3>
                                </div>
                            </div>
                            <div className="p-6 overflow-y-auto no-scrollbar max-h-96">
                                {cart.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Receipt size={32} className="text-gray-400" />
                                        </div>
                                        <p className="text-gray-500">Sepet boş</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4 w-full">
                                        {cart.map((item: CartItem, i: number) => (
                                            <div
                                                key={i}
                                                className="bg-gray-50 rounded-xl w-full p-4 border border-gray-100 animate-fade-in-up"
                                                style={{ animationDelay: `${i * 60}ms` }}
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
                                                                    className="text-blue-500 hover:text-blue-700 px-2 py-1 rounded-full hover:bg-blue-50 text-xs font-medium border border-blue-200"
                                                                    onClick={() => handleEditNote(item)}
                                                                    title="Notu güncelle"
                                                                >
                                                                    Düzenle
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
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sağ: Ödeme Paneli */}
                    <div className="lg:col-span-1 sticky top-0 z-20 lg:order-none">
                        <div className="bg-white rounded-lg md:rounded-2xl shadow-lg border border-gray-100 h-full">
                            <div className=" p-2 md:p-6 border-b border-gray-100">
                                <div className="flex items-center w-full justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-green-100 rounded-full">
                                            <Wallet size={20} className="text-green-600" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-800">Ödeme</h3>
                                    </div>
                                    <div className="bg-gradient-to-r from-green-50 to-green-100  md:hidden rounded-xl
                                     p-2 px-8 border border-green-200">
                                        <p className="text-2xl font-bold text-green-800">{total}₺</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-6 space-y-6">
                                {/* Toplam Tutar */}
                                <div className="bg-gray-50 hidden md:block rounded-xl p-4 border border-gray-200">
                                    <p className="text-sm text-gray-600 mb-1">Toplam Tutar</p>
                                    <p className="text-3xl font-semibold text-gray-800">{total}₺</p>
                                </div>

                                {/* Ödeme Seçenekleri */}
                                <div>
                                    <p className="font-semibold text-gray-800 mb-3">Ödeme Yöntemi</p>
                                    <div className="space-y-2">
                                        {paymentOptions.map(opt => (
                                            <button
                                                key={opt.key}
                                                className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${selectedPayment === opt.key
                                                    ? "bg-blue-50 border-blue-500 text-blue-700"
                                                    : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                                                    }`}
                                                onClick={() => setSelectedPayment(opt.key as "cash" | "card")}
                                            >
                                                <div className={`p-2 rounded-full ${selectedPayment === opt.key
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
                                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl transition-colors shadow disabled:opacity-50 disabled:cursor-not-allowed"
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