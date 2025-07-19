import React, { useState } from "react";
import TableModal from "../modals/TableModal";
import { useConfirm } from "../../../context/provider/ConfirmProvider";
import { useRestaurant } from "../../../context/context";
import { TableData } from "../../../types";

interface FilterState {
    occupied: boolean | null;
    reserved: boolean;
    cleanStatus: boolean | null;
}

interface FilterBarProps {
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const FilterBar = ({ filters, setFilters }: FilterBarProps) => (
    <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2 text-gray-700 font-semibold">
                <span>Masa Durumu:</span>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
                <button 
                    onClick={() => setFilters({ occupied: null, reserved: false, cleanStatus: null })} 
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                        filters.occupied === null && filters.reserved === false && filters.cleanStatus === null 
                            ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                    Tümü
                </button>
                <button 
                    onClick={() => setFilters({ ...filters, occupied: filters.occupied ? null : true })} 
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                        filters.occupied === true 
                            ? "bg-red-500 text-white shadow-lg" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                    Dolu
                </button>
                <button 
                    onClick={() => setFilters({ ...filters, occupied: filters.occupied === false ? null : false })} 
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                        filters.occupied === false 
                            ? "bg-green-500 text-white shadow-lg" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                    Boş
                </button>
                <button 
                    onClick={() => setFilters({ ...filters, reserved: !filters.reserved })} 
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                        filters.reserved 
                            ? "bg-blue-500 text-white shadow-lg" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                    Rezerve
                </button>
                <button 
                    onClick={() => setFilters({ ...filters, cleanStatus: filters.cleanStatus ? null : true })} 
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                        filters.cleanStatus 
                            ? "bg-emerald-500 text-white shadow-lg" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                    Temiz
                </button>
                <button 
                    onClick={() => setFilters({ ...filters, cleanStatus: filters.cleanStatus === false ? null : false })} 
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-200 ${
                        filters.cleanStatus === false 
                            ? "bg-yellow-500 text-white shadow-lg" 
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                >
                    Temizlenecek
                </button>
            </div>
        </div>
    </div>
);

interface TableManagementProps {
    tables: TableData[];
}

const TableManagement = ({ tables: externalTables }: TableManagementProps) => {
    const { transferOrder } = useRestaurant();
    const [filters, setFilters] = useState<FilterState>({ occupied: null, reserved: false, cleanStatus: null });
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [currentTableId, setCurrentTableId] = useState<string | null>(null);

    // Aktarım modu için ek state'ler
    const [transferMode, setTransferMode] = useState<boolean>(false);
    const [sourceTableId, setSourceTableId] = useState<string | null>(null);

    // Bilgilendirme balonu için ek state
    const [showTransferBalloon, setShowTransferBalloon] = useState<boolean>(false);

    const confirm = useConfirm();

    // Aktarım başlatıcı fonksiyon (TableModal'a prop olarak gönderilecek)
    const handleStartTransfer = (table: TableData) => {
        setTransferMode(true);
        setSourceTableId(table.id);
        setIsModalOpen(false);
        setShowTransferBalloon(true);
    };

    // Aktarım modunda sadece boş ve temiz masalar tıklanabilir olacak
    const handleTableClick = async (table: TableData) => {
        if (transferMode) {
            if (!table.occupied && table.cleanStatus === true) {
                setShowTransferBalloon(false);

                const result = await confirm({
                    title: "Masa Aktarımı",
                    message: "Siparişi bu masaya aktarmak istediğinize emin misiniz?",
                    confirmText: "Evet",
                    cancelText: "Hayır"
                });

                if (result) {
                    if (sourceTableId) {
                        await transferOrder(sourceTableId, table.id);
                    }
                    setTransferMode(false);
                    setSourceTableId(null);
                    setShowTransferBalloon(false);
                    setCurrentTableId(table.id);
                    setIsModalOpen(true);
                } else {
                    setShowTransferBalloon(true);
                }
            }
        } else {
            setCurrentTableId(table.id);
            setIsModalOpen(true);
        }
    };

    // Hem dışarıdan gelen filtrelenmiş tabloyu hem de kendi filtrelerini uygula
    const filteredTables = (externalTables || []).filter((table: TableData) => {
        return (
            (filters.occupied === null || (filters.occupied === true && table.status === "occupied") || (filters.occupied === false && table.status !== "occupied")) &&
            (filters.reserved === false || (filters.reserved === true && table.status === "reserved")) &&
            (filters.cleanStatus === null || table.cleanStatus === filters.cleanStatus)
        );
    });

    // Her bir masanın siparişlerinden toplam ücreti hesaplayan fonksiyon
    function calculateTotalBill(table: TableData): number {
        if (!table.orders || !Array.isArray(table.orders)) return 0;
        return table.orders.reduce((sum: number, order: any) => sum + (order.quantity * order.price), 0);
    }

    interface TableSummaryCardProps {
        table: TableData;
    }

    // Özet Kart Bileşeni
    const TableSummaryCard = ({ table }: TableSummaryCardProps) => {
        // Duruma göre renkler ve stiller
        let bgGradient = "";
        let borderColor = "";
        let statusColor = "";
        let statusText = "";
        let statusDot = "";
        let shadowColor = "";
        let hoverScale = "hover:scale-[1.02]";
        
        // Masa durumuna göre stil belirleme
        if (table.status === "occupied") {
            bgGradient = "from-red-50 via-red-100 to-red-200";
            borderColor = "border-red-300";
            statusColor = "bg-red-500";
            statusText = "Dolu";
            statusDot = "bg-red-500";
            shadowColor = "shadow-red-100";
            hoverScale = "hover:scale-[1.02]";
        } else if (table.status === "reserved") {
            bgGradient = "from-blue-50 via-blue-100 to-blue-200";
            borderColor = "border-blue-300";
            statusColor = "bg-blue-500";
            statusText = "Rezerve";
            statusDot = "bg-blue-500";
            shadowColor = "shadow-blue-100";
            hoverScale = "hover:scale-[1.02]";
        } else if (table.status === "available") {
            if (table.cleanStatus) {
                // Temiz ve boş
                bgGradient = "from-green-50 via-green-100 to-green-200";
                borderColor = "border-green-300";
                statusColor = "bg-green-500";
                statusText = "Boş";
                statusDot = "bg-green-500";
                shadowColor = "shadow-green-100";
            } else {
                // Temizlenecek
                bgGradient = "from-amber-50 via-amber-100 to-amber-200";
                borderColor = "border-amber-300";
                statusColor = "bg-amber-500";
                statusText = "Temizlenecek";
                statusDot = "bg-amber-500";
                shadowColor = "shadow-amber-100";
            }
        }

        // Toplam ücreti hesapla
        const totalBill = calculateTotalBill(table);

        // Zaman hesaplama
        const getTimeDisplay = () => {
            if (table.status === "occupied" && table.occupiedAt) {
                const occupiedTime = new Date(table.occupiedAt);
                const now = new Date();
                const diffMinutes = Math.floor((now.getTime() - occupiedTime.getTime()) / 60000);
                
                if (diffMinutes < 60) {
                    return `${diffMinutes}dk`;
                } else {
                    const hours = Math.floor(diffMinutes / 60);
                    const minutes = diffMinutes % 60;
                    return `${hours}sa ${minutes}dk`;
                }
            }
            return table.occupiedAt ? new Date(table.occupiedAt).toLocaleTimeString('tr-TR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }) : null;
        };

        return (
            <div
                className={`
                    relative bg-gradient-to-br ${bgGradient} ${borderColor} ${shadowColor}
                    rounded-2xl shadow-lg border-2 backdrop-blur-sm
                    cursor-pointer transition-all duration-200 ease-out
                    hover:shadow-xl ${hoverScale} hover:-translate-y-0.5
                    min-h-[130px] sm:min-h-[140px]
                    flex flex-col justify-between
                    group overflow-hidden
                    will-change-transform
                `}
            >
                {/* Üst Kısım - Masa Numarası ve Durum */}
                <div className="flex items-start justify-between p-3 pb-2">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100">
                            <span className="font-bold text-gray-700 text-sm">{table.number}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 text-sm truncate">{table.name || "Masa"}</h3>
                            <p className="text-xs text-gray-500">Kapasite: {table.capacity || 4}</p>
                        </div>
                    </div>
                    
                    {/* Durum Indicator - Sadece simge */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        <div className={`w-3 h-3 ${statusDot} rounded-full`}></div>
                    </div>
                </div>
                
                {/* Alt Kısım - Bilgiler */}
                <div className="px-3 pb-3 space-y-2">
                    {/* Garson Bilgisi */}
                    {table.waiterName && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <span className="text-purple-500">👨‍💼</span>
                            <span className="truncate flex-1 font-medium">{table.waiterName}</span>
                        </div>
                    )}
                    
                    {/* Zaman ve Tutar */}
                    <div className="flex items-center justify-between text-xs">
                        {/* Süre/Zaman */}
                        <div className="flex items-center gap-1.5 text-gray-600">
                            <span className="text-orange-500">🕒</span>
                            <span className="font-medium">
                                {getTimeDisplay() || "--:--"}
                            </span>
                        </div>
                        
                        {/* Toplam Tutar */}
                        <div className="flex items-center gap-1.5 text-gray-600">
                            <span className="text-green-500">💰</span>
                            <span className="font-semibold text-green-700">
                                {totalBill ? `${totalBill.toLocaleString('tr-TR')}₺` : "0₺"}
                            </span>
                        </div>
                    </div>
                    
                    {/* Sipariş Durumu */}
                    {table.orders && table.orders.length > 0 && (
                        <div className="flex items-center justify-center text-xs">
                            <div className="flex items-center gap-1.5 text-gray-600">
                                <span className="text-blue-500">🛒</span>
                                <span className="font-medium">{table.orders.length} sipariş</span>
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Hover Effect Overlay */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/0 to-white/0 group-hover:from-white/10 group-hover:to-white/5 transition-opacity duration-200" />
                
                {/* Status Ribbon - Sadece mobile'da görünür */}
                <div className={`absolute -top-1 -right-1 w-16 h-6 ${statusColor} rounded-bl-lg rounded-tr-2xl flex items-center justify-center sm:hidden`}>
                    <span className="text-white text-xs font-medium transform rotate-0 truncate">
                        {statusText.substring(0, 5)}
                    </span>
                </div>
                
                {/* Temizlik Durumu İndikator */}
                {!table.cleanStatus && (
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 bg-yellow-500 rounded-tr-lg rounded-bl-2xl flex items-center justify-center">
                        <span className="text-white text-xs">🧹</span>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="max-w-7xl mx-auto">
            <FilterBar filters={filters} setFilters={setFilters} />

            {/* Aktarım modunda görünecek uyarı ve iptal butonu */}
            {transferMode && (
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl p-4 sm:p-6 mb-6 shadow-lg">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-xl">🔄</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Aktarım Modu</h3>
                                <p className="text-blue-100 text-sm">Siparişi aktarmak için boş ve temiz bir masa seçin</p>
                            </div>
                        </div>
                        <button
                            className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold shadow-lg hover:bg-gray-100 transition-all duration-200"
                            onClick={() => {
                                setTransferMode(false);
                                setSourceTableId(null);
                                setShowTransferBalloon(false);
                            }}
                        >
                            İptal Et
                        </button>
                    </div>
                </div>
            )}

            {/* Masalar Grid */}
            <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <span>🏪</span>
                        Masa Durumu
                    </h2>
                    <div className="text-sm text-gray-600">
                        {filteredTables.length} masa gösteriliyor
                    </div>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                    {filteredTables.map(table => (
                        <div
                            key={table.id}
                            className={`
                                relative transition-all duration-200 ease-out
                                ${transferMode && table.status === "available" && table.cleanStatus === true
                                    ? "ring-2 ring-blue-400 ring-opacity-60 rounded-2xl"
                                    : ""
                                }
                            `}
                            onClick={() => handleTableClick(table)}
                        >
                            <TableSummaryCard table={table} />
                            
                            {/* Aktarım modunda bilgi balonu */}
                            {transferMode && table.status === "available" && table.cleanStatus === true && showTransferBalloon && (
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-50">
                                    <div className="bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium shadow-lg">
                                        Aktarım için tıklayın
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-600"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                
                {/* Boş durum */}
                {filteredTables.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-6xl mb-4">🏪</div>
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Masa bulunamadı</h3>
                        <p className="text-gray-500">Seçili filtrelere uygun masa bulunmuyor</p>
                    </div>
                )}
            </div>
            
            {/* Modal */}
            {currentTableId && (
                <TableModal
                    tableId={currentTableId}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onStartTransfer={handleStartTransfer}
                />
            )}
        </div>
    );
};

export default TableManagement;

