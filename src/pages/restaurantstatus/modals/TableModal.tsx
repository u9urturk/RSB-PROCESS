import React, { useState } from "react";
import { ShoppingCart, RefreshCw, CreditCard, CornerDownRight, List, User, Clock, MapPin } from "lucide-react";
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
import TableStatusBadge from "../components/shared/TableStatusBadge";
import { useScrollLock } from "../hooks/useScrollLock";

// Shared badge now imported (TableStatusBadge)
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



const NAV_BUTTONS: NavButton[] = [
    { key: "order", icon: <ShoppingCart size={16} />, label: "Sipariş", info: "Yeni sipariş oluşturmak için tıklayın." },
    { key: "update", icon: <RefreshCw size={16} />, label: "Güncelle", info: "Mevcut siparişi güncellemek için tıklayın." },
    { key: "pay", icon: <CreditCard size={16} />, label: "Ödeme", info: "Ödeme almak için tıklayın." },
    { key: "clean", icon: <FaBroom size={14} />, label: "Temizle", info: "Masayı temizlendi olarak işaretleyin." },
    { key: "transfer", icon: <CornerDownRight size={16} />, label: "Aktar", info: "Masayı başka bir masaya aktarın." },
];

const TableModal: React.FC<TableModalProps> = ({ tableId, isOpen, onClose, onStartTransfer }) => {
    const { tables, processPayment, cleanTable } = useRestaurant();
    const { showNotification } = useNotification();

    const [showOrderPanel, setShowOrderPanel] = useState(false);
    const [showPaymentPanel, setShowPaymentPanel] = useState(false);
    const [showOrderDetail, setShowOrderDetail] = useState(false);
    const [balloonStep, setBalloonStep] = useState(0);

    useScrollLock(isOpen);

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
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
                    onClick={handleOverlayClick}
                >
                    <div
                        className={`bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col animate-in zoom-in-95 duration-300 relative overflow-hidden
                            ${(showOrderPanel || showPaymentPanel)
                                ? "w-full max-w-4xl max-h-[90vh]"
                                : showOrderDetail
                                    ? "w-full max-w-6xl max-h-[90vh]"
                                    : "w-full max-w-2xl max-h-[90vh]"}`}
                    >
                        {/* Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-red-50/50 pointer-events-none"></div>
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
                            <div className="relative z-10 flex flex-col h-full">
                                <div className="fixed right-4 top-1/2 z-50 -translate-y-1/2 flex flex-col items-end">
                                    <button
                                        className={`group transition-all duration-300 flex items-center justify-center w-12 h-12 rounded-full shadow-lg border border-gray-200 ${showOrderDetail
                                            ? "bg-gradient-to-br from-gray-600 to-gray-700 text-white"
                                            : "bg-gradient-to-br from-blue-500 to-blue-600 text-white"}
                                            hover:scale-110 hover:shadow-xl`}
                                        onClick={() => setShowOrderDetail((v) => !v)}
                                        aria-label={showOrderDetail ? "Sipariş Detayını Kapat" : "Sipariş Detayını Göster"}
                                    >
                                        <div className="absolute inset-0 bg-white/20 transform scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full"></div>
                                        <List size={20} className="relative z-10" />
                                        {!showOrderDetail && table.orders && table.orders.length > 0 && (
                                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                                                <span className="text-xs font-bold">{table.orders.length}</span>
                                            </span>
                                        )}
                                    </button>

                                    <InfoBalloon
                                        show={balloonStep === 6}
                                        text={"Sipariş Detayını Göster / Kapat"}
                                        onClose={() => setBalloonStep(balloonStep + 1)}
                                    />
                                </div>

                                {!showOrderDetail ? (
                                    <div className="flex flex-col flex-1 overflow-hidden">
                                        <div className="flex-shrink-0">
                                            <TableModalHeader
                                                table={table}
                                                onClose={onClose}
                                                onHint={handleHintClick}
                                            />
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                                <InfoCard
                                                    title="Durum"
                                                    value={<div className="transform scale-90 sm:scale-100 origin-left"><TableStatusBadge table={table} /></div>}
                                                    icon={<MapPin size={16} className="text-purple-600" />}
                                                    bgGradient="linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.6) 100%)"
                                                    boxShadow="0 8px 32px rgba(0, 0, 0, 0.1)"
                                                />

                                                <InfoCard
                                                    title="Kapasite"
                                                    value={<p className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{table.capacity} Kişi</p>}
                                                    icon={<User size={16} className="text-blue-600" />}
                                                    bgGradient="linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)"
                                                    boxShadow="0 8px 32px rgba(59, 130, 246, 0.1)"
                                                />

                                                {table.status === "occupied" && waitTime > 0 && (
                                                    <InfoCard
                                                        title="Bekleme Süresi"
                                                        value={<span className="text-lg font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{waitTime} dakika</span>}
                                                        icon={<Clock size={16} className="text-orange-600" />}
                                                        bgGradient="linear-gradient(135deg, rgba(251, 146, 60, 0.1) 0%, rgba(239, 68, 68, 0.1) 100%)"
                                                        boxShadow="0 8px 32px rgba(251, 146, 60, 0.1)"
                                                        className="col-span-full"
                                                    />
                                                )}

                                                {table.status === "occupied" && table.totalAmount !== undefined && table.totalAmount > 0 && (
                                                    <InfoCard
                                                        title="Toplam Tutar"
                                                        value={<span className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{table.totalAmount}₺</span>}
                                                        icon={<CreditCard size={16} className="text-green-600" />}
                                                        bgGradient="linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)"
                                                        boxShadow="0 8px 32px rgba(16, 185, 129, 0.1)"
                                                        className="col-span-full"
                                                    />
                                                )}
                                            </div>

                                            {(table.status === "occupied" || table.status === "reserved") && table.waiterName && (
                                                <InfoCard
                                                    title={<span className="flex items-center gap-2"><User size={14} className="text-amber-600" /> Sorumlu Garson</span>}
                                                    value={<span className="text-sm font-bold text-gray-800">{table.waiterName}</span>}
                                                    bgGradient="linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(92, 51, 23, 0.1) 100%)"
                                                    boxShadow="0 8px 32px rgba(139, 69, 19, 0.1)"
                                                    className="mb-6"
                                                    icon={<User size={14} className="text-amber-600" />}
                                                />
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col overflow-hidden">
                                        <OrderDetail
                                            table={table}
                                            onClose={() => setShowOrderDetail(false)}
                                        />
                                    </div>
                                )}

                                <div className="flex-shrink-0 bg-white/90 backdrop-blur-sm border-t border-gray-200">
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
