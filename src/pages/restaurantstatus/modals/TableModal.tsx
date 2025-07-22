import React, { useState, useEffect } from "react";
import { X, Info, ShoppingCart, RefreshCw, CreditCard, CornerDownRight, List, User, Clock, MapPin, Utensils, Sparkles } from "lucide-react";
import { FaBroom } from "react-icons/fa";
import InfoBalloon from "../../../components/InfoBalloon";
import { useNotification } from "../../../context/provider/NotificationProvider";
import OrderPanel from "../components/OrderPanel";
import OrderDetail from "../components/OrderDetail";
import PaymentPanel from "../components/PaymentPanel";
import { useRestaurant } from "../../../context/context";
import { TableData } from "../../../types";
import TableModalHeader from "../components/TableModalHeader";
import InfoCard from "../components/InfoCard";
import NavigationPanel from "../components/NavigationPanel";

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

    useEffect(() => {
        if (isOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.overflow = 'hidden';

            return () => {
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                document.body.style.overflow = '';
                window.scrollTo(0, scrollY);
            };
        }
    }, [isOpen]);

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
        <div>
            {isOpen && (
                <div

                    className="fixed  inset-0 flex items-center  justify-center backdrop-blur-xs z-10 "
                    onClick={handleOverlayClick}
                >
                    <div
                        className={`bg-white/95 backdrop-blur-xl    shadow-2xl border  overflow-auto no-scrollbar border-white/20 flex flex-col max-h-screen   rounded-2xl
                            ${(showOrderPanel || showPaymentPanel) ? "w-[calc(100%-3rem)] py-0  h-screen " : showOrderDetail ? "w-[calc(100%-3rem)] sm:w-full md:max-w-[calc(50%)] h-auto " : "w-[calc(100%-3rem)] sm:w-full max-w-2xl h-auto"}`}

                    >
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
                            <div>
                                <div className="fixed right-0 top-1/2 z-[1] translate-y-[-50%] flex flex-col items-end">
                                    <button
                                        className={`transition-all duration-200 flex items-center justify-center w-12 h-12 rounded-full shadow-lg border border-gray-200 bg-gradient-to-br ${showOrderDetail
                                            ? "from-gray-700 to-gray-600 text-white"
                                            : "from-blue-600 to-blue-500 text-white"}
                                            hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 relative`}
                                        onClick={() => setShowOrderDetail((v) => !v)}
                                        aria-label={showOrderDetail ? "Sipariş Detayını Kapat" : "Sipariş Detayını Göster"}
                                    >
                                        <List size={24} />
                                        {!showOrderDetail && table.orders && table.orders.length > 0 && (
                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></span>
                                        )}
                                    </button>

                                    <InfoBalloon
                                        show={balloonStep === 6}
                                        text={"Sipariş Detayını Göster / Kapat"}
                                        onClose={() => setBalloonStep(balloonStep + 1)}
                                    />
                                </div>

                                {!showOrderDetail ? (
                                    <div className="flex flex-col flex-1">
                                        <div className="sticky top-0 left-0 right-0 z-10">
                                            <TableModalHeader
                                                table={table}
                                                onClose={onClose}
                                                onHint={handleHintClick}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-6">
                                            <InfoCard
                                                title="Durum"
                                                value={<div className="scale-75 sm:scale-100 origin-left"><StatusBadge table={table} /></div>}
                                                icon={<MapPin size={12} className="text-purple-600 sm:w-[18px] sm:h-[18px]" />}
                                                bgGradient="linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 100%)"
                                                boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
                                            />

                                            <InfoCard
                                                title="Kapasite"
                                                value={<p className="text-sm sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{table.capacity} Kişi</p>}
                                                icon={<User size={12} className="text-blue-600 sm:w-[18px] sm:h-[18px]" />}
                                                bgGradient="linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)"
                                                boxShadow="0 8px 32px rgba(59, 130, 246, 0.1)"
                                            />

                                            {table.status === "occupied" && waitTime > 0 && (
                                                <InfoCard
                                                    title="Bekleme Süresi"
                                                    value={<span className="text-sm sm:text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{waitTime} dakika</span>}
                                                    icon={<Clock size={12} className="text-orange-600 sm:w-[18px] sm:h-[18px]" />}
                                                    bgGradient="linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%)"
                                                    boxShadow="0 8px 32px rgba(251, 146, 60, 0.1)"
                                                    className="col-span-2"
                                                />
                                            )}

                                            {table.status === "occupied" && table.totalAmount !== undefined && table.totalAmount > 0 && (
                                                <InfoCard
                                                    title="Toplam Tutar"
                                                    value={<span className="text-sm sm:text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{table.totalAmount}₺</span>}
                                                    icon={<CreditCard size={12} className="text-green-600 sm:w-[18px] sm:h-[18px]" />}
                                                    bgGradient="linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)"
                                                    boxShadow="0 8px 32px rgba(16, 185, 129, 0.1)"
                                                    className="col-span-2"
                                                />
                                            )}
                                        </div>

                                        {(table.status === "occupied" || table.status === "reserved") && table.waiterName && (
                                            <InfoCard
                                                title={<span className="flex items-center gap-2"><User size={12} className="text-amber-600 sm:w-4 sm:h-4" /> Sorumlu Garson</span>}
                                                value={<span className="text-xs sm:text-sm font-bold text-gray-800 truncate">{table.waiterName}</span>}
                                                bgGradient="linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(92, 51, 23, 0.1) 100%)"
                                                boxShadow="0 8px 32px rgba(139, 69, 19, 0.1)"
                                                className="mb-3 sm:mb-6 p-3 sm:p-5"
                                                icon={<User size={10} className="text-amber-600 sm:w-[14px] sm:h-[14px]" />}
                                            >
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-xs text-gray-500 font-medium hidden sm:block">Garson</p>
                                                </div>
                                            </InfoCard>
                                        )}
                                    </div>
                                ) : (
                                    <div
                                        className="flex-1 flex flex-col"
                                    >
                                        <OrderDetail
                                            table={table}
                                            onClose={() => setShowOrderDetail(false)}
                                        />
                                    </div>
                                )}

                                <div className="sticky bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-gray-200 p-3 sm:p-1 z-10">
                                    <NavigationPanel
                                        buttons={NAV_BUTTONS}
                                        isEmpty={isEmpty}
                                        isOccupied={isOccupied}
                                        table={table}
                                        balloonStep={balloonStep}
                                        setBalloonStep={setBalloonStep}
                                        handleOrderClick={handleOrderClick}
                                        setShowOrderPanel={setShowOrderPanel}
                                        setShowPaymentPanel={setShowPaymentPanel}
                                        handleClean={handleClean}
                                        handleTransfer={handleTransfer}
                                    />
                                </div>

                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TableModal;
