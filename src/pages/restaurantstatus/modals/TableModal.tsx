import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info, ShoppingCart, RefreshCw, CreditCard, CornerDownRight, List, User, Clock, MapPin, Utensils, Sparkles } from "lucide-react";
import { FaBroom } from "react-icons/fa";
import InfoBalloon from "../../../components/InfoBalloon";
import { useNotification } from "../../../context/provider/NotificationProvider";
import OrderPanel from "../components/OrderPanel";
import OrderDetail from "../components/OrderDetail";
import PaymentPanel from "../components/PaymentPanel";
import { useRestaurant } from "../../../context/provider/RestaurantProvider";
import { TableData } from "../../../types";

interface StatusBadgeProps {
    table: TableData;
}

interface TableModalProps {
    tableId: string;
    isOpen: boolean;
    onClose: () => void;
    onStartTransfer: (table: TableData) => void;
}

interface NavButton {
    key: string;
    icon: React.ReactElement;
    label: string;
    info: string;
}

// Modern Status Badge Component
function StatusBadge({ table }: StatusBadgeProps) {
    const getStatusConfig = () => {
        switch (table.status) {
            case "occupied":
                return {
                    bg: "bg-gradient-to-r from-red-500 to-red-600",
                    text: "text-white",
                    icon: <User size={14} />,
                    label: "Dolu",
                    shadow: "shadow-lg shadow-red-500/25"
                };
            case "reserved":
                return {
                    bg: "bg-gradient-to-r from-blue-500 to-blue-600",
                    text: "text-white",
                    icon: <Clock size={14} />,
                    label: "Rezerve",
                    shadow: "shadow-lg shadow-blue-500/25"
                };
            case "available":
                return {
                    bg: "bg-gradient-to-r from-green-500 to-green-600",
                    text: "text-white",
                    icon: <Sparkles size={14} />,
                    label: "Boş",
                    shadow: "shadow-lg shadow-green-500/25"
                };
            default:
                return {
                    bg: "bg-gradient-to-r from-green-500 to-green-600",
                    text: "text-white",
                    icon: <Sparkles size={14} />,
                    label: "Boş",
                    shadow: "shadow-lg shadow-green-500/25"
                };
        }
    };

    const config = getStatusConfig();
    
    return (
        <span className={`${config.bg} ${config.text} px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1.5 ${config.shadow}`}>
            {config.icon}
            {config.label}
        </span>
    );
}

// Modern Navigation Buttons Configuration
const NAV_BUTTONS: NavButton[] = [
    {
        key: "order",
        icon: <ShoppingCart size={20} />,
        label: "Sipariş",
        info: "Yeni sipariş oluşturmak için tıklayın.",
    },
    {
        key: "update",
        icon: <RefreshCw size={20} />,
        label: "Güncelle",
        info: "Mevcut siparişi güncellemek için tıklayın.",
    },
    {
        key: "pay",
        icon: <CreditCard size={20} />,
        label: "Ödeme",
        info: "Ödeme almak için tıklayın.",
    },
    {
        key: "clean",
        icon: <FaBroom size={18} />,
        label: "Temizle",
        info: "Masayı temizlendi olarak işaretleyin.",
    },
    {
        key: "transfer",
        icon: <CornerDownRight size={20} />,
        label: "Aktar",
        info: "Masayı başka bir masaya aktarın.",
    },
];

const TableModal: React.FC<TableModalProps> = ({ tableId, isOpen, onClose, onStartTransfer }) => {
    const { tables, updateTable } = useRestaurant();
    const table = tables.find(t => t.id === tableId);

    // Eğer modal kapalıysa veya table yoksa render etme
    if (!isOpen || !table) return null;

    const isEmpty = table.status === "available";
    const isOccupied = table.status === "occupied";

    const [balloonStep, setBalloonStep] = useState<number>(0);
    const [showOrderDetail, setShowOrderDetail] = useState<boolean>(false);
    const [showOrderPanel, setShowOrderPanel] = useState<boolean>(false);
    const [showPaymentPanel, setShowPaymentPanel] = useState<boolean>(false);
    const [cart, setCart] = useState<any[]>(table.orders || []);

    const { showNotification } = useNotification();

    const handleHintClick = () => {
        setBalloonStep(1);
    };

    useEffect(() => {
        if (balloonStep > 0 && balloonStep <= NAV_BUTTONS.length + 1) {
            const timer = setTimeout(() => setBalloonStep(balloonStep + 1), 1500);
            return () => clearTimeout(timer);
        }
        if (balloonStep > NAV_BUTTONS.length) setBalloonStep(0);
    }, [balloonStep]);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) onClose();
    };

    const handleClean = async () => {
        try {
            updateTable(table.id, { status: "available" });
            showNotification("success", "Masa temizlendi");
        } catch (err) {
            showNotification("error", "Temizleme işlemi başarısız oldu. Lütfen tekrar deneyin.");
            console.error("Temizleme işlemi başarısız:", err);
        }
    };

    const handleTransfer = () => {
        onStartTransfer(table);
        onClose();
    };

    const handleOrderClick = () => setShowOrderPanel(true);

    // Ödeme tamamlandığında yapılacaklar
    const handleCompletePayment = (type: "cash" | "card") => {
        setShowPaymentPanel(false);
        showNotification("success", type === "cash" ? "Nakit ödeme tamamlandı" : "Kredi kartı ile ödeme başarıyla tamamlandı");
        updateTable(table.id, { status: "available", totalAmount: 0 });
    };

    // Bekleme süresini hesapla (dakika cinsinden)
    const getWaitTime = (occupiedAt: string | undefined): number => {
        if (!occupiedAt) return 0;
        const now = new Date();
        const opened = new Date(occupiedAt);
        return Math.floor((now.getTime() - opened.getTime()) / 60000);
    };

    const waitTime = table.occupiedAt ? getWaitTime(table.occupiedAt) : 0;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 px-2 sm:px-6"
            onClick={handleOverlayClick}
            aria-modal="true"
            role="dialog"
        >
            <motion.div
                layoutId="modal"
                initial={{ opacity: 0 }}
                animate={
                    showOrderPanel
                        ? "orderPanel"
                        : showPaymentPanel
                            ? "orderPanel"
                            : showOrderDetail
                                ? "expanded"
                                : "normal"
                }
                exit={{ opacity: 0 }}
                variants={{
                    normal: {
                        opacity: 1,
                        width: "95%",
                        minWidth: "24rem",
                        maxWidth: "36rem",
                        minHeight: "24rem",
                        borderRadius: "1.5rem"
                    },
                    expanded: {
                        opacity: 1,
                        width: "99%",
                        maxWidth: "48rem",
                        minHeight: "32rem",
                        borderRadius: "1.5rem"
                    },
                    orderPanel: {
                        opacity: 1,
                        width: "90vw",
                        maxWidth: "90vw",
                        minHeight: "90vh",
                        borderRadius: "1.5rem"
                    }
                }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className={`bg-white shadow-2xl flex flex-col max-h-[95vh] relative overflow-visible transition-all duration-300
                    ${(showOrderPanel || showPaymentPanel) ? "p-4 sm:p-10" : showOrderDetail ? "p-4 sm:p-8" : "px-2 sm:px-16 p-4 sm:p-6"} rounded-2xl`}
                style={{ willChange: "opacity, width, height" }}
            >
                {/* Sipariş Paneli */}
                {showOrderPanel ? (
                    <OrderPanel
                        table={table}
                        onClose={() => setShowOrderPanel(false)}
                    />
                ) : showPaymentPanel ? (
                    <PaymentPanel
                        table={table}
                        cart={cart}
                        setCart={setCart}
                        onClose={() => setShowPaymentPanel(false)}
                        onCompletePayment={handleCompletePayment}
                    />
                ) : (
                    <>
                        {/* Modern Order Detail Toggle Button */}
                        <button
                            className={`absolute top-1/2 right-0 -translate-y-1/2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg rounded-l-2xl p-3 z-20 transition-all duration-200 ${
                                showOrderDetail ? "from-purple-700 to-purple-800" : ""
                            }`}
                            onClick={() => setShowOrderDetail((v) => !v)}
                            aria-label={showOrderDetail ? "Sipariş Detayını Kapat" : "Sipariş Detayını Göster"}
                        >
                            <List size={24} />
                            <InfoBalloon
                                show={balloonStep === 6}
                                text={"Sipariş Detayını Göster / Kapat"}
                                onClose={() => setBalloonStep(balloonStep + 1)}
                            />
                        </button>
                        <AnimatePresence mode="wait">
                            {!showOrderDetail ? (
                                <motion.div
                                    key="main"
                                    initial={{ opacity: 0, x: -40 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 40 }}
                                    transition={{ duration: 0.25 }}
                                    className="flex flex-col flex-1"
                                >
                                    {/* Modern Header */}
                                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl p-6 mb-6">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                                    <Utensils size={28} />
                                                    Masa {table.number}
                                                </h2>
                                                <p className="text-orange-100 mt-1">İşlem Paneli</p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={handleHintClick}
                                                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
                                                    aria-label="İpucu Göster"
                                                    title="İpucu: Butonlar hakkında bilgi al"
                                                >
                                                    <Info size={20} className="text-white" />
                                                </button>
                                                <button 
                                                    onClick={onClose} 
                                                    className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors" 
                                                    aria-label="Kapat"
                                                >
                                                    <X size={20} className="text-white" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Modern Info Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        {/* Status Card */}
                                        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-1">Masa Durumu</p>
                                                    <StatusBadge table={table} />
                                                </div>
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                                                    <MapPin size={20} className="text-gray-600" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Capacity Card */}
                                        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-1">Kapasite</p>
                                                    <p className="text-xl font-bold text-gray-800">{table.capacity} Kişi</p>
                                                </div>
                                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <User size={20} className="text-blue-600" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Wait Time Card */}
                                        {table.status === "occupied" && waitTime > 0 && (
                                            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-gray-600 mb-1">Bekleme Süresi</p>
                                                        <p className="text-xl font-bold text-orange-600">{waitTime} dk</p>
                                                    </div>
                                                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                                                        <Clock size={20} className="text-orange-600" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Total Amount Card */}
                                        {table.status === "occupied" && table.totalAmount !== undefined && table.totalAmount > 0 && (
                                            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-gray-600 mb-1">Toplam Tutar</p>
                                                        <p className="text-xl font-bold text-green-600">{table.totalAmount}₺</p>
                                                    </div>
                                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                                        <CreditCard size={20} className="text-green-600" />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Waiter Info Section */}
                                    {(table.status === "occupied" || table.status === "reserved") && table.waiterName && (
                                        <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100 mb-6">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Garson Bilgileri</h3>
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                                        <User size={18} className="text-purple-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Sorumlu Garson</p>
                                                        <p className="font-semibold text-gray-800">{table.waiterName}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="order-detail"
                                    initial={{ opacity: 0, x: 40 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -40 }}
                                    transition={{ duration: 0.25 }}
                                    className="flex-1 flex flex-col"
                                >
                                    <OrderDetail
                                        table={table}
                                        onClose={() => setShowOrderDetail(false)}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {/* Modern Navigation Bar - Responsive */}
                        <nav className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl shadow-lg border border-gray-200 p-4 relative z-10 overflow-visible">
                            <div className="flex justify-between items-center gap-2 sm:gap-3">
                                {NAV_BUTTONS.map((btn, idx) => {
                                    const isDisabled = 
                                        (btn.key === "order" && !isEmpty) ||
                                        (btn.key === "update" && table.status === "available") ||
                                        (btn.key === "pay" && !isOccupied) ||
                                        (btn.key === "clean" && table.status !== "occupied") ||
                                        (btn.key === "transfer" && !isOccupied);

                                    return (
                                        <div key={btn.key} className="flex-1 flex flex-col items-center relative overflow-visible min-w-0">
                                            <button
                                                className={`w-full flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl transition-all duration-200 min-h-[4.5rem] sm:min-h-[5.5rem] ${
                                                    isDisabled 
                                                        ? "bg-gray-100 text-gray-400 cursor-not-allowed opacity-50" 
                                                        : "bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 shadow-md hover:shadow-lg hover:scale-105"
                                                }`}
                                                aria-label={btn.label}
                                                tabIndex={0}
                                                disabled={isDisabled}
                                                onClick={
                                                    btn.key === "order" ? handleOrderClick
                                                    : btn.key === "update" ? () => setShowOrderPanel(true)
                                                    : btn.key === "pay" ? () => setShowPaymentPanel(true)
                                                    : btn.key === "clean" ? handleClean
                                                    : btn.key === "transfer" ? handleTransfer
                                                    : undefined
                                                }
                                            >
                                                <div className={`p-2 sm:p-2.5 rounded-full mb-2 ${
                                                    isDisabled 
                                                        ? "bg-gray-200" 
                                                        : "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                                                }`}>
                                                    {btn.icon}
                                                </div>
                                                <span className="text-sm sm:text-base font-medium text-center leading-tight px-1">
                                                    {btn.label}
                                                </span>
                                            </button>
                                            <InfoBalloon
                                                show={balloonStep === idx + 1}
                                                text={btn.info}
                                                onClose={() => setBalloonStep(balloonStep + 1)}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </nav>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default TableModal;
