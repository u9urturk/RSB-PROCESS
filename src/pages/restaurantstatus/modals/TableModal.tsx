import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Info, ShoppingCart, RefreshCw, CreditCard, CornerDownRight, List, User, Clock, MapPin, Utensils, Sparkles } from "lucide-react";
import { FaBroom } from "react-icons/fa";
import InfoBalloon from "../../../components/InfoBalloon";
import { useNotification } from "../../../context/provider/NotificationProvider";
import OrderPanel from "../components/OrderPanel";
import OrderDetail from "../components/OrderDetail";
import PaymentPanel from "../components/PaymentPanel";
import { useRestaurant } from "../../../context/context";
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

// Modern Animation Variants
const modalVariants = {
    hidden: {
        opacity: 0,
        scale: 0.9,
        y: 50,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring" as const,
            damping: 25,
            stiffness: 300,
            duration: 0.3,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.95,
        y: -20,
        transition: {
            duration: 0.2,
            ease: "easeInOut" as const,
        },
    },
};

const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { 
        opacity: 1,
        transition: { duration: 0.3 }
    },
    exit: { 
        opacity: 0,
        transition: { duration: 0.2 }
    },
};

// Modern Status Badge Component with Glass Morphism
function StatusBadge({ table }: StatusBadgeProps) {
    const getStatusConfig = () => {
        // Eğer masa dolu ve temizlenmemişse (cleanStatus false), temizlik gerektiriyor
        if (table.status === "occupied" && table.cleanStatus === false) {
            return {
                bg: "bg-gradient-to-r from-yellow-500 to-orange-500",
                text: "text-white",
                icon: <FaBroom size={12} />,
                label: "Temizlenecek",
                glow: "shadow-lg shadow-yellow-500/25"
            };
        }
        
        switch (table.status) {
            case "occupied":
                return {
                    bg: "bg-gradient-to-r from-red-500 to-pink-500",
                    text: "text-white",
                    icon: <User size={12} className="animate-pulse" />,
                    label: "Dolu",
                    glow: "shadow-lg shadow-red-500/25"
                };
            case "reserved":
                return {
                    bg: "bg-gradient-to-r from-blue-500 to-purple-500",
                    text: "text-white",
                    icon: <Clock size={12} />,
                    label: "Rezerve",
                    glow: "shadow-lg shadow-blue-500/25"
                };
            case "available":
                return {
                    bg: "bg-gradient-to-r from-green-500 to-emerald-500",
                    text: "text-white",
                    icon: <Sparkles size={12} className="animate-pulse" />,
                    label: "Müsait",
                    glow: "shadow-lg shadow-green-500/25"
                };
            default:
                return {
                    bg: "bg-gradient-to-r from-green-500 to-emerald-500",
                    text: "text-white",
                    icon: <Sparkles size={12} className="animate-pulse" />,
                    label: "Müsait",
                    glow: "shadow-lg shadow-green-500/25"
                };
        }
    };

    const config = getStatusConfig();
    
    return (
        <span 
            className={`${config.bg} ${config.text} ${config.glow} px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 sm:gap-1.5 backdrop-blur-sm border border-white/20`}
        >
            <span
                className="w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center"
            >
                {config.icon}
            </span>
            <span className="">{config.label}</span>
        </span>
    );
}

// Navigation Buttons Configuration
const NAV_BUTTONS: NavButton[] = [
    {
        key: "order",
        icon: <ShoppingCart size={16} />,
        label: "Sipariş",
        info: "Yeni sipariş oluşturmak için tıklayın.",
    },
    {
        key: "update",
        icon: <RefreshCw size={16} />,
        label: "Güncelle",
        info: "Mevcut siparişi güncellemek için tıklayın.",
    },
    {
        key: "pay",
        icon: <CreditCard size={16} />,
        label: "Ödeme",
        info: "Ödeme almak için tıklayın.",
    },
    {
        key: "clean",
        icon: <FaBroom size={14} />,
        label: "Temizle",
        info: "Masayı temizlendi olarak işaretleyin.",
    },
    {
        key: "transfer",
        icon: <CornerDownRight size={16} />,
        label: "Aktar",
        info: "Masayı başka bir masaya aktarın.",
    },
];

const TableModal: React.FC<TableModalProps> = ({ tableId, isOpen, onClose, onStartTransfer }) => {
    const { tables, processPayment, cleanTable } = useRestaurant();
    const { showNotification } = useNotification();
    
    const [showOrderPanel, setShowOrderPanel] = useState(false);
    const [showPaymentPanel, setShowPaymentPanel] = useState(false);
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [balloonStep, setBalloonStep] = useState(0);
    
    const table = tables.find(t => t.id === tableId);
    
    if (!table || !isOpen) return null;

    const isEmpty = table.status === "available";
    const isOccupied = table.status === "occupied";
    
    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };
    
    const handleOrderClick = () => {
        if (isEmpty) {
            setShowOrderPanel(true);
        }
    };
    
    const handleClean = () => {
        if (table.cleanStatus === false) {
            cleanTable(table.id);
            showNotification("success", `Masa ${table.number} temizlendi!`);
        }
    };
    
    const handleTransfer = () => {
        onStartTransfer(table);
        onClose();
    };
    
    const handleCompletePayment = () => {
        processPayment(table.id, "cash");
        setShowPaymentPanel(false);
        showNotification("success", `Masa ${table.number} ödemesi tamamlandı!`);
    };
    
    const handleHintClick = () => {
        setBalloonStep(1);
    };
    
    const getWaitTime = (occupiedAt: string) => {
        const now = new Date();
        const occupiedTime = new Date(occupiedAt);
        const diffMs = now.getTime() - occupiedTime.getTime();
        return Math.floor(diffMs / (1000 * 60));
    };
    
    const waitTime = table.occupiedAt ? getWaitTime(table.occupiedAt) : 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    variants={backdropVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50 px-4"
                    onClick={handleOverlayClick}
                    aria-modal="true"
                    role="dialog"
                >
                    <motion.div
                        variants={modalVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={`bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20 flex flex-col max-h-[95vh] relative overflow-hidden rounded-2xl
                            ${(showOrderPanel || showPaymentPanel) ? "w-[95vw] sm:w-[90vw] h-[90vh] sm:h-[85vh] p-3 sm:p-6" : showOrderDetail ? "w-[95vw] sm:w-full max-w-3xl h-auto p-3 sm:p-6" : "w-[95vw] sm:w-full max-w-lg h-auto p-3 sm:p-5"}`}
                        style={{
                            background: "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)",
                            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2)",
                        }}
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
                                cart={table.orders?.map(order => ({
                                    id: order.id,
                                    productName: order.productName || order.items?.[0]?.name || 'Ürün',
                                    quantity: order.quantity,
                                    price: order.price,
                                    note: order.note || []
                                })) || []}
                                onClose={() => setShowPaymentPanel(false)}
                                onCompletePayment={handleCompletePayment}
                            />
                        ) : (
                            <>
                                {/* Sade Sipariş Detayları Butonu */}
                                <motion.button
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-3 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full shadow-lg border border-white/30 backdrop-blur-sm ${
                                        showOrderDetail 
                                            ? "bg-gray-600 shadow-gray-600/25" 
                                            : "bg-blue-500 shadow-blue-500/25"
                                    }`}
                                    onClick={() => setShowOrderDetail((v) => !v)}
                                    aria-label={showOrderDetail ? "Sipariş Detayını Kapat" : "Sipariş Detayını Göster"}
                                >
                                    <motion.div
                                        animate={{ rotate: showOrderDetail ? 180 : 0 }}
                                        transition={{ type: "spring", damping: 20 }}
                                        className="w-full h-full flex items-center justify-center"
                                    >
                                        <List size={14} className="text-white sm:w-[18px] sm:h-[18px]" />
                                    </motion.div>
                                    
                                    {/* Basit Notification Dot */}
                                    {!showOrderDetail && table.orders && table.orders.length > 0 && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-0.5 -right-0.5 sm:-top-1 sm:-right-1 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full border-2 border-white"
                                        />
                                    )}
                                    
                                    <InfoBalloon
                                        show={balloonStep === 6}
                                        text={"Sipariş Detayını Göster / Kapat"}
                                        onClose={() => setBalloonStep(balloonStep + 1)}
                                    />
                                </motion.button>
                        
                                {!showOrderDetail ? (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.1 }}
                                        className="flex flex-col flex-1"
                                    >
                                        {/* Modern Glass Header */}
                                        <motion.div 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            whileHover={{ scale: 1.02 }}
                                            className="relative overflow-hidden rounded-xl sm:rounded-2xl p-3 sm:p-6 mb-3 sm:mb-6"
                                            style={{
                                                background: "linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(147, 51, 234, 0.9) 100%)",
                                                backdropFilter: "blur(20px)",
                                                border: "1px solid rgba(255, 255, 255, 0.2)",
                                                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                                            }}
                                        >
                                            {/* Animated Background Elements */}
                                            <motion.div
                                                animate={{ 
                                                    x: [0, 100, 0],
                                                    y: [0, -50, 0],
                                                    opacity: [0.3, 0.6, 0.3]
                                                }}
                                                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                                                className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl"
                                            />
                                            <motion.div
                                                animate={{ 
                                                    x: [0, -80, 0],
                                                    y: [0, 60, 0],
                                                    opacity: [0.2, 0.5, 0.2]
                                                }}
                                                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                                                className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl"
                                            />
                                    
                                            <div className="relative z-10 flex justify-between items-center">
                                                <div>
                                                    <motion.h2 
                                                        initial={{ x: -20, opacity: 0 }}
                                                        animate={{ x: 0, opacity: 1 }}
                                                        transition={{ delay: 0.2 }}
                                                        className="text-lg sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3"
                                                    >
                                                        <motion.div
                                                            animate={{ rotate: [0, 360] }}
                                                            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                                        >
                                                            <Utensils size={18} className="sm:w-6 sm:h-6" />
                                                        </motion.div>
                                                        Masa {table.number}
                                                    </motion.h2>
                                                    <motion.p 
                                                        initial={{ x: -20, opacity: 0 }}
                                                        animate={{ x: 0, opacity: 1 }}
                                                        transition={{ delay: 0.3 }}
                                                        className="text-white/80 text-xs sm:text-sm mt-1 hidden sm:block"
                                                    >
                                                        Masa Yönetim Paneli
                                                    </motion.p>
                                                </div>
                                                <div className="flex items-center gap-2 sm:gap-3">
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={handleHintClick}
                                                        className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20"
                                                        aria-label="İpucu Göster"
                                                    >
                                                        <motion.div
                                                            whileHover={{ rotate: [0, -10, 10, 0] }}
                                                            transition={{ duration: 0.6 }}
                                                        >
                                                            <Info size={14} className="text-white sm:w-[18px] sm:h-[18px]" />
                                                        </motion.div>
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={onClose} 
                                                        className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/20" 
                                                        aria-label="Kapat"
                                                    >
                                                        <motion.div
                                                            whileHover={{ rotate: 90 }}
                                                            transition={{ type: "spring", damping: 15 }}
                                                        >
                                                            <X size={14} className="text-white sm:w-[18px] sm:h-[18px]" />
                                                        </motion.div>
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Modern Glass Info Cards */}
                                        <motion.div 
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.3 }}
                                            className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-6"
                                        >
                                            {/* Status Card */}
                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.4 }}
                                                whileHover={{ y: -5, scale: 1.02 }}
                                                className="relative overflow-hidden rounded-lg sm:rounded-xl p-2 sm:p-4 backdrop-blur-md border border-white/20"
                                                style={{
                                                    background: "linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 100%)",
                                                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
                                                }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="min-w-0 flex-1">
                                                        <motion.p 
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: 0.5 }}
                                                            className="text-xs text-gray-600 mb-1 sm:mb-2 font-medium"
                                                        >
                                                            Durum
                                                        </motion.p>
                                                        <div className="scale-75 sm:scale-100 origin-left">
                                                            <StatusBadge table={table} />
                                                        </div>
                                                    </div>
                                                    <motion.div 
                                                        whileHover={{ scale: 1.2, rotate: 15 }}
                                                        className="w-6 h-6 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg sm:rounded-xl flex items-center justify-center"
                                                    >
                                                        <MapPin size={12} className="text-purple-600 sm:w-[18px] sm:h-[18px]" />
                                                    </motion.div>
                                                </div>
                                            </motion.div>

                                            {/* Capacity Card */}
                                            <motion.div 
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.5 }}
                                                whileHover={{ y: -5, scale: 1.02 }}
                                                className="relative overflow-hidden rounded-lg sm:rounded-xl p-2 sm:p-4 backdrop-blur-md border border-white/20"
                                                style={{
                                                    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)",
                                                    boxShadow: "0 8px 32px rgba(59, 130, 246, 0.1)",
                                                }}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="min-w-0 flex-1">
                                                        <motion.p 
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: 0.6 }}
                                                            className="text-xs text-gray-600 mb-1 sm:mb-2 font-medium"
                                                        >
                                                            Kapasite
                                                        </motion.p>
                                                        <motion.p 
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            transition={{ delay: 0.7, type: "spring", damping: 15 }}
                                                            className="text-sm sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                                                        >
                                                            {table.capacity} Kişi
                                                        </motion.p>
                                                    </div>
                                                    <motion.div 
                                                        whileHover={{ scale: 1.2, rotate: -15 }}
                                                        className="w-6 h-6 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg sm:rounded-xl flex items-center justify-center"
                                                    >
                                                        <User size={12} className="text-blue-600 sm:w-[18px] sm:h-[18px]" />
                                                    </motion.div>
                                                </div>
                                            </motion.div>

                                            {/* Wait Time Card */}
                                            {table.status === "occupied" && waitTime > 0 && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.6 }}
                                                    whileHover={{ y: -5, scale: 1.02 }}
                                                    className="relative overflow-hidden rounded-lg sm:rounded-xl p-2 sm:p-4 backdrop-blur-md border border-white/20 col-span-2"
                                                    style={{
                                                        background: "linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%)",
                                                        boxShadow: "0 8px 32px rgba(251, 146, 60, 0.1)",
                                                    }}
                                                >
                                                    <motion.div 
                                                        animate={{
                                                            scale: [1, 1.05, 1],
                                                            opacity: [1, 0.8, 1],
                                                        }}
                                                        transition={{
                                                            duration: 2,
                                                            repeat: Infinity,
                                                            ease: "easeInOut",
                                                        }}
                                                        className="flex items-center justify-between"
                                                    >
                                                        <div className="min-w-0 flex-1">
                                                            <motion.p 
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ delay: 0.7 }}
                                                                className="text-xs text-gray-600 mb-1 sm:mb-2 font-medium"
                                                            >
                                                                Bekleme Süresi
                                                            </motion.p>
                                                            <motion.p 
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{ delay: 0.8, type: "spring", damping: 15 }}
                                                                className="text-sm sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent"
                                                            >
                                                                {waitTime} dakika
                                                            </motion.p>
                                                        </div>
                                                        <motion.div 
                                                            whileHover={{ scale: 1.2, rotate: 360 }}
                                                            transition={{ duration: 0.8 }}
                                                            className="w-6 h-6 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg sm:rounded-xl flex items-center justify-center"
                                                        >
                                                            <Clock size={12} className="text-orange-600 sm:w-[18px] sm:h-[18px]" />
                                                        </motion.div>
                                                    </motion.div>
                                                </motion.div>
                                            )}

                                            {/* Total Amount Card */}
                                            {table.status === "occupied" && table.totalAmount !== undefined && table.totalAmount > 0 && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.7 }}
                                                    whileHover={{ y: -5, scale: 1.02 }}
                                                    className="relative overflow-hidden rounded-lg sm:rounded-xl p-2 sm:p-4 backdrop-blur-md border border-white/20 col-span-2"
                                                    style={{
                                                        background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)",
                                                        boxShadow: "0 8px 32px rgba(16, 185, 129, 0.1)",
                                                    }}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="min-w-0 flex-1">
                                                            <motion.p 
                                                                initial={{ opacity: 0 }}
                                                                animate={{ opacity: 1 }}
                                                                transition={{ delay: 0.8 }}
                                                                className="text-xs text-gray-600 mb-1 sm:mb-2 font-medium"
                                                            >
                                                                Toplam Tutar
                                                            </motion.p>
                                                            <motion.p 
                                                                initial={{ scale: 0 }}
                                                                animate={{ scale: 1 }}
                                                                transition={{ delay: 0.9, type: "spring", damping: 15 }}
                                                                className="text-sm sm:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"
                                                            >
                                                                {table.totalAmount}₺
                                                            </motion.p>
                                                        </div>
                                                        <motion.div 
                                                            whileHover={{ scale: 1.2, rotate: -360 }}
                                                            transition={{ duration: 0.8 }}
                                                            className="w-6 h-6 sm:w-10 sm:h-10 bg-gradient-to-br from-green-100 to-green-200 rounded-lg sm:rounded-xl flex items-center justify-center"
                                                        >
                                                            <CreditCard size={12} className="text-green-600 sm:w-[18px] sm:h-[18px]" />
                                                        </motion.div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </motion.div>

                                        {/* Modern Waiter Info Section */}
                                        {(table.status === "occupied" || table.status === "reserved") && table.waiterName && (
                                            <motion.div 
                                                initial={{ opacity: 0, x: -30 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 1.0 }}
                                                className="relative overflow-hidden rounded-lg sm:rounded-xl p-3 sm:p-5 mb-3 sm:mb-6 backdrop-blur-md border border-white/20"
                                                style={{
                                                    background: "linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(92, 51, 23, 0.1) 100%)",
                                                    boxShadow: "0 8px 32px rgba(139, 69, 19, 0.1)",
                                                }}
                                            >
                                                <motion.h3 
                                                    initial={{ y: -10, opacity: 0 }}
                                                    animate={{ y: 0, opacity: 1 }}
                                                    transition={{ delay: 1.1 }}
                                                    className="text-xs sm:text-sm font-bold text-gray-800 mb-2 sm:mb-3 flex items-center gap-2"
                                                >
                                                    <motion.div
                                                        animate={{ rotate: [0, 10, -10, 0] }}
                                                        transition={{ duration: 3, repeat: Infinity }}
                                                    >
                                                        <User size={12} className="text-amber-600 sm:w-4 sm:h-4" />
                                                    </motion.div>
                                                    Sorumlu Garson
                                                </motion.h3>
                                                <motion.div 
                                                    whileHover={{ scale: 1.02 }}
                                                    className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-white/50 rounded-lg sm:rounded-xl backdrop-blur-sm"
                                                >
                                                    <motion.div 
                                                        whileHover={{ scale: 1.3, rotate: 360 }}
                                                        transition={{ duration: 0.6 }}
                                                        className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-amber-100 to-amber-200 rounded-md sm:rounded-lg flex items-center justify-center"
                                                    >
                                                        <User size={10} className="text-amber-600 sm:w-[14px] sm:h-[14px]" />
                                                    </motion.div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-xs text-gray-500 font-medium hidden sm:block">Garson</p>
                                                        <motion.p 
                                                            initial={{ opacity: 0 }}
                                                            animate={{ opacity: 1 }}
                                                            transition={{ delay: 1.2 }}
                                                            className="text-xs sm:text-sm font-bold text-gray-800 truncate"
                                                        >
                                                            {table.waiterName}
                                                        </motion.p>
                                                    </div>
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 }}
                                        className="flex-1 flex flex-col"
                                    >
                                        <OrderDetail
                                            table={table}
                                            onClose={() => setShowOrderDetail(false)}
                                        />
                                    </motion.div>
                                )}
                        
                                {/* Modern Navigation Panel */}
                                <motion.nav 
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.3 }}
                                    className="relative overflow-hidden rounded-lg sm:rounded-xl p-2 sm:p-4 mt-3 sm:mt-6 backdrop-blur-md border border-white/20"
                                    style={{
                                        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(168, 85, 247, 0.05) 100%)",
                                        boxShadow: "0 8px 32px rgba(99, 102, 241, 0.08)",
                                    }}
                                >
                                    <motion.div 
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1.4 }}
                                        className="flex justify-between gap-1 sm:gap-3"
                                    >
                                        {NAV_BUTTONS.map((btn, idx) => {
                                            const isDisabled = 
                                                (btn.key === "order" && !isEmpty) ||
                                                (btn.key === "update" && table.status === "available") ||
                                                (btn.key === "pay" && !isOccupied) ||
                                                (btn.key === "clean" && table.cleanStatus ===true) ||
                                                (btn.key === "transfer" && !isOccupied);

                                            return (
                                                <motion.div 
                                                    key={btn.key} 
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 1.5 + (idx * 0.1) }}
                                                    className="flex-1 flex flex-col items-center relative min-w-0"
                                                >
                                                    <motion.button
                                                        whileHover={isDisabled ? {} : { scale: 1.05 }}
                                                        whileTap={isDisabled ? {} : { scale: 0.95 }}
                                                        className={`w-full flex flex-col items-center justify-center p-2 sm:p-3 rounded-lg sm:rounded-xl min-h-[3rem] sm:min-h-[4rem] group relative overflow-hidden ${
                                                            isDisabled 
                                                                ? "bg-gray-100/50 text-gray-400 cursor-not-allowed opacity-60" 
                                                                : "bg-white/80 backdrop-blur-md text-gray-700 hover:text-white shadow-lg border border-white/20"
                                                        }`}
                                                        aria-label={btn.label}
                                                        disabled={isDisabled}
                                                        onClick={
                                                            btn.key === "order" ? handleOrderClick
                                                            : btn.key === "update" ? () => setShowOrderPanel(true)
                                                            : btn.key === "pay" ? () => setShowPaymentPanel(true)
                                                            : btn.key === "clean" ? handleClean
                                                            : btn.key === "transfer" ? handleTransfer
                                                            : undefined
                                                        }
                                                        style={{
                                                            background: isDisabled ? "rgba(156, 163, 175, 0.3)" : 
                                                                `linear-gradient(135deg, rgba(${btn.key === 'order' ? '59, 130, 246' : 
                                                                    btn.key === 'update' ? '16, 185, 129' : 
                                                                    btn.key === 'pay' ? '251, 146, 60' : 
                                                                    btn.key === 'clean' ? '139, 69, 19' : '147, 51, 234'}, 0.8) 0%, rgba(${
                                                                        btn.key === 'order' ? '147, 51, 234' : 
                                                                        btn.key === 'update' ? '5, 150, 105' : 
                                                                        btn.key === 'pay' ? '239, 68, 68' : 
                                                                        btn.key === 'clean' ? '92, 51, 23' : '59, 130, 246'}, 0.8) 100%)`
                                                        }}
                                                    >
                                                        {/* Background Animation */}
                                                        {!isDisabled && (
                                                            <motion.div
                                                                className="absolute inset-0 opacity-0 group-hover:opacity-20"
                                                                animate={{
                                                                    background: [
                                                                        "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.3) 0%, transparent 50%)",
                                                                        "radial-gradient(circle at 100% 100%, rgba(255,255,255,0.3) 0%, transparent 50%)",
                                                                        "radial-gradient(circle at 0% 0%, rgba(255,255,255,0.3) 0%, transparent 50%)"
                                                                    ]
                                                                }}
                                                                transition={{ duration: 2, repeat: Infinity }}
                                                            />
                                                        )}
                                                
                                                        <motion.div 
                                                            className={`p-1 sm:p-2 rounded-md sm:rounded-lg mb-1 sm:mb-2 ${isDisabled ? "bg-gray-400/50" : "bg-white/20"}`}
                                                            whileHover={isDisabled ? {} : { 
                                                                scale: 1.1, 
                                                                rotate: btn.key === 'update' ? 180 : btn.key === 'transfer' ? 15 : 0 
                                                            }}
                                                        >
                                                            <div className="w-3 h-3 sm:w-4 sm:h-4 flex items-center justify-center">
                                                                {btn.key === "order" && <ShoppingCart className="w-full h-full" />}
                                                                {btn.key === "update" && <RefreshCw className="w-full h-full" />}
                                                                {btn.key === "pay" && <CreditCard className="w-full h-full" />}
                                                                {btn.key === "clean" && <FaBroom className="w-full h-full" />}
                                                                {btn.key === "transfer" && <CornerDownRight className="w-full h-full" />}
                                                            </div>
                                                        </motion.div>
                                                        <span className="text-xs font-semibold text-center leading-tight">
                                                            {btn.label}
                                                        </span>
                                                    </motion.button>
                                                    <InfoBalloon
                                                        show={balloonStep === idx + 1}
                                                        text={btn.info}
                                                        onClose={() => setBalloonStep(balloonStep + 1)}
                                                    />
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                </motion.nav>
                            </>
                        )}
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default TableModal;
