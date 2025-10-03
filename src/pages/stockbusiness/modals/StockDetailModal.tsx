import { useEffect, useState } from "react";
import {
    X,
    Package,
    AlertTriangle,
    Calendar,
    FileText,
    TrendingUp,
    Tag,
    BarChart3,
    History,
    Info,
    User,
    Truck,
    Minus,
    DollarSign,
    Building,
    Warehouse
} from "lucide-react";
import { StockDetailModalProps } from "@/types/index";
import { StockType, Supplier } from "@/types/stock";
import { stockTypeDatas } from "../mocks/stockTypeData";
import mockSuppliers from "../mocks/supplierData";
import { warehouseData } from "../mocks/warehouseData";

// Stok hareket türleri
interface StockMovement {
    id: string;
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    unit: string;
    date: string;
    supplierId?: string;
    userId: string;
    userName: string;
    reason?: string;
    notes?: string;
    unitPrice?: number; // Stok girişlerinde birim fiyat bilgisi
    totalPrice?: number; // Hesaplanan toplam fiyat
}

export default function StockDetailModal({ open, onClose, item }: StockDetailModalProps) {
    const [render, setRender] = useState(open);
    const [stockTypes] = useState<StockType[]>(stockTypeDatas);
    const [suppliers] = useState<Supplier[]>(mockSuppliers);
    const [warehouses] = useState(warehouseData);
    const [isAnimating, setIsAnimating] = useState(false);
    const [activeTab, setActiveTab] = useState<'details' | 'history' | 'analytics'>('details');
    const [isTabChanging, setIsTabChanging] = useState(false);

    // Mock stok hareketleri verisi
    const [stockMovements] = useState<StockMovement[]>([
        {
            id: '1',
            type: 'in',
            quantity: 50,
            unit: item.unit,
            date: '2024-10-01T10:30:00Z',
            supplierId: '1',
            userId: 'user1',
            userName: 'Ahmet Yılmaz',
            reason: 'Yeni sevkiyat',
            notes: 'Kalite kontrolden geçti',
            unitPrice: 12.50,
            totalPrice: 50 * 12.50
        },
        {
            id: '2',
            type: 'out',
            quantity: 15,
            unit: item.unit,
            date: '2024-09-28T14:20:00Z',
            userId: 'user2',
            userName: 'Fatma Demir',
            reason: 'Mutfak kullanımı',
            notes: 'Günlük tüketim'
            // Çıkışlarda fiyat bilgisi yok
        },
        {
            id: '3',
            type: 'in',
            quantity: 30,
            unit: item.unit,
            date: '2024-09-25T09:15:00Z',
            supplierId: '2',
            userId: 'user1',
            userName: 'Ahmet Yılmaz',
            reason: 'Acil sevkiyat',
            notes: 'Stok azalması nedeniyle',
            unitPrice: 11.80,
            totalPrice: 30 * 11.80
        },
        {
            id: '4',
            type: 'adjustment',
            quantity: -5,
            unit: item.unit,
            date: '2024-09-20T16:45:00Z',
            userId: 'user3',
            userName: 'Mehmet Kaya',
            reason: 'Sayım farkı',
            notes: 'Periyodik sayım sonucu eksik tespit edildi'
            // Düzeltmelerde fiyat bilgisi yok
        },
        {
            id: '5',
            type: 'in',
            quantity: 100,
            unit: item.unit,
            date: '2024-09-15T09:00:00Z',
            supplierId: '1',
            userId: 'user1',
            userName: 'Ahmet Yılmaz',
            reason: 'Toplu satın alma',
            notes: 'Kampanya döneminde avantajlı fiyat',
            unitPrice: 10.90,
            totalPrice: 100 * 10.90
        }
    ]);

    // Tab tanımlamaları
    const tabs = [
        {
            id: 'details' as const,
            label: 'Detaylar',
            icon: <Info size={16} />
        },
        {
            id: 'history' as const,
            label: 'Stok Geçmişi',
            icon: <History size={16} />
        },
        {
            id: 'analytics' as const,
            label: 'Analitik',
            icon: <BarChart3 size={16} />
        }
    ];

    useEffect(() => {
        if (open) {
            setRender(true);
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            setIsAnimating(false);
            setTimeout(() => setRender(false), 200);
        }
    }, [open]);

    // Tab değişimi animasyonu için
    useEffect(() => {
        if (isTabChanging) {
            const timer = setTimeout(() => {
                setIsTabChanging(false);
            }, 300);
            return () => clearTimeout(timer);
        }
    }, [activeTab, isTabChanging]);

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(() => onClose(), 200);
    };

    const handleTabChange = (newTab: 'details' | 'history' | 'analytics') => {
        if (newTab === activeTab || isTabChanging) return;
        
        setIsTabChanging(true);
        
        // İlk olarak mevcut content'i fade out yap
        setTimeout(() => {
            setActiveTab(newTab);
        }, 150);
    };

    if (!render) return null;

    const stockType = stockTypes.find(st => st.id === item.stockTypeId);
    const warehouse = warehouses.find(w => w.id === item.warehouseId);
    const supplier = suppliers.find(s => s.id === item.supplierId);
    const isLowStock = item.quantity <= item.minQuantity;
    const totalValue = item.quantity * item.unitPrice;

    return (
        <div
            className={`fixed inset-0 flex items-center justify-center z-50 p-4 transition-all duration-200 ease-out ${isAnimating
                ? 'bg-opacity-50 bg-gray-700/20 backdrop-blur-sm'
                : 'bg-opacity-0 backdrop-blur-none'
                }`}
            onClick={handleClose}
        >
            <div
                className={`bg-white rounded-2xl shadow-2xl max-w-4xl w-full min-h-[60vh] max-h-[90vh] overflow-hidden transition-all duration-500 ease-in-out flex flex-col ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                    }`}
                onClick={(e) => e.stopPropagation()}
                style={{
                    height: 'auto',
                    minHeight: '20vh'
                }}
            >
                {/* Header */}
                <div className={`bg-gradient-to-r ${isLowStock ? 'from-red-500 to-red-600' : 'from-orange-500 to-red-600'} text-white p-6 rounded-t-2xl`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-white/20 rounded-xl">
                                <Package size={24} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold">{item.name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    {isLowStock && (
                                        <div className="flex items-center gap-1 bg-red-500/30 px-2 py-1 rounded-lg">
                                            <AlertTriangle size={14} />
                                            <span className="text-xs font-medium">Düşük Stok</span>
                                        </div>
                                    )}
                                    <span className="text-white/80">#{item.barcode || item.id}</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="border-b border-gray-200 transition-all duration-200 ease-in-out">
                    <div className="flex px-6">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => handleTabChange(tab.id)}
                                disabled={isTabChanging}
                                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-all duration-300 ease-in-out transform hover:scale-105 disabled:pointer-events-none ${activeTab === tab.id
                                    ? 'border-orange-500 text-orange-600 bg-orange-50'
                                    : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                                    } ${isTabChanging ? 'opacity-70' : ''}`}
                            >
                                {tab.icon}
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-h-0">
                    <div className="p-6 h-full overflow-y-auto transition-all duration-500 ease-in-out">
                        {isTabChanging && (
                            <div className="flex flex-col items-center justify-center min-h-[300px] space-y-4">
                                <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent"></div>
                                <p className="text-gray-500 text-sm animate-pulse">İçerik yükleniyor...</p>
                            </div>
                        )}
                        {!isTabChanging && (
                            <div key={`${activeTab}-content`} className="animate-in fade-in-0 zoom-in-95 duration-400 ease-out">
                                {activeTab === 'details' && (
                                    <div className="slide-in-from-left-4 duration-300 min-h-[300px]">
                                {/* Main Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 transform hover:scale-105 transition-all duration-200 ease-in-out hover:shadow-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500 rounded-lg text-white">
                                                <Package size={20} />
                                            </div>
                                            <div>
                                                <div className="text-sm text-blue-600">Mevcut Stok</div>
                                                <div className="text-2xl font-bold text-blue-800">
                                                    {item.quantity}
                                                </div>
                                                <div className="text-sm text-blue-600">{item.unit}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 transform hover:scale-105 transition-all duration-200 ease-in-out hover:shadow-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-500 rounded-lg text-white">
                                                <TrendingUp size={20} />
                                            </div>
                                            <div>
                                                <div className="text-sm text-green-600">Toplam Değer</div>
                                                <div className="text-2xl font-bold text-green-800">
                                                    ₺{totalValue.toLocaleString()}
                                                </div>
                                                <div className="text-sm text-green-600">TL</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 transform hover:scale-105 transition-all duration-200 ease-in-out hover:shadow-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-500 rounded-lg text-white">
                                                <AlertTriangle size={20} />
                                            </div>
                                            <div>
                                                <div className="text-sm text-amber-600">Minimum Stok</div>
                                                <div className="text-2xl font-bold text-amber-800">
                                                    {item.minQuantity}
                                                </div>
                                                <div className="text-sm text-amber-600">{item.unit}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Stock Type */}
                                <div className="bg-gray-50 rounded-xl p-4 mb-6 hover:bg-gray-100 transition-all duration-200 ease-in-out">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-purple-500 rounded-lg text-white">
                                            <Tag size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm text-gray-600 mb-1">Stok Tipi</div>
                                            <div className="flex items-center gap-2 font-semibold text-gray-800">
                                                {stockType ? (
                                                    <>
                                                        <span className="text-lg">{stockType.icon}</span>
                                                        <span>{stockType.name}</span>
                                                    </>
                                                ) : (
                                                    <span>Tanımsız</span>
                                                )}
                                            </div>
                                            {stockType?.description && (
                                                <div className="text-xs text-gray-500 mt-1">{stockType.description}</div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Warehouse Information */}
                                <div className="bg-gray-50 rounded-xl p-4 mb-6 hover:bg-gray-100 transition-all duration-200 ease-in-out">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-500 rounded-lg text-white">
                                            <Warehouse size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm text-gray-600 mb-1">Depo Bilgileri</div>
                                            <div className="flex items-center gap-2 font-semibold text-gray-800">
                                                {warehouse ? (
                                                    <>
                                                        <span>{warehouse.name}</span>
                                                        <span className="text-gray-500 text-sm">({warehouse.warehouseType})</span>
                                                    </>
                                                ) : (
                                                    <span>Depo bilgisi bulunamadı</span>
                                                )}
                                            </div>
                                            {warehouse?.location && (
                                                <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    <Building size={12} />
                                                    {warehouse.location}
                                                </div>
                                            )}
                                            {warehouse && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Kapasite: {warehouse.capacity} | Yönetici: {warehouse.manager}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Supplier Information */}
                                <div className="bg-gray-50 rounded-xl p-4 mb-6 hover:bg-gray-100 transition-all duration-200 ease-in-out">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-green-500 rounded-lg text-white">
                                            <Truck size={16} />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm text-gray-600 mb-1">Tedarikçi Bilgileri</div>
                                            <div className="flex items-center gap-2 font-semibold text-gray-800">
                                                {supplier ? (
                                                    <span>{supplier.name}</span>
                                                ) : (
                                                    <span>Tedarikçi bilgisi bulunamadı</span>
                                                )}
                                            </div>
                                            {supplier && (
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {supplier.phone && `Tel: ${supplier.phone}`}
                                                    {supplier.contactPerson && ` | İletişim: ${supplier.contactPerson}`}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Additional Details */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 ease-in-out hover:shadow-md">
                                        <div className="p-2 bg-indigo-500 rounded-lg text-white">
                                            <Calendar size={16} />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">Son Güncelleme</div>
                                            <div className="font-semibold text-gray-800">
                                                {new Date(item.lastUpdated).toLocaleDateString("tr-TR", {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 ease-in-out hover:shadow-md">
                                        <div className="p-2 bg-amber-500 rounded-lg text-white">
                                            <TrendingUp size={16} />
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">Birim Fiyat</div>
                                            <div className="font-semibold text-gray-800">
                                                ₺{item.unitPrice.toLocaleString()} / {item.unit}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                {item.description && (
                                    <div className="bg-gray-50 rounded-xl p-4 mb-6 hover:bg-gray-100 transition-all duration-200 ease-in-out">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-gray-500 rounded-lg text-white">
                                                <FileText size={16} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm text-gray-600 mb-1">Açıklama</div>
                                                <div className="text-gray-800 leading-relaxed">
                                                    {item.description}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="space-y-4 slide-in-from-right-4 duration-500 min-h-[350px]">
                                <div className="flex items-center gap-2 mb-4 animate-in fade-in-0 slide-in-from-left-4 duration-300 delay-100">
                                    <History size={20} className="text-orange-500" />
                                    <h3 className="text-lg font-semibold text-gray-800">Stok Hareketleri</h3>
                                </div>

                                <div className="space-y-3">
                                    {stockMovements.map((movement, index) => {
                                        const supplier = suppliers.find(s => s.id === movement.supplierId);
                                        const isIncoming = movement.type === 'in';
                                        const isAdjustment = movement.type === 'adjustment';

                                        // Hareket tipine göre ikon ve renk belirleme
                                        const getMovementIcon = () => {
                                            if (isAdjustment) return <Minus size={16} />;
                                            return isIncoming ? <TrendingUp size={16} /> : <Package size={16} />;
                                        };

                                        const getMovementColor = () => {
                                            if (isAdjustment) return 'bg-orange-500';
                                            return isIncoming ? 'bg-green-500' : 'bg-red-500';
                                        };

                                        const getMovementTitle = () => {
                                            if (isAdjustment) return 'Stok Düzeltmesi';
                                            return isIncoming ? 'Stok Girişi' : 'Stok Çıkışı';
                                        };

                                        return (
                                            <div
                                                key={movement.id}
                                                className={`bg-gray-50 rounded-xl p-4 border-l-4 border-l-orange-500 animate-in fade-in-0 slide-in-from-left-6 duration-400 ease-out hover:shadow-lg hover:scale-[1.02] transition-all hover:bg-gray-100`}
                                                style={{
                                                    animationDelay: `${200 + index * 100}ms`,
                                                    animationFillMode: 'both'
                                                }}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2 animate-in fade-in-0 slide-in-from-left-3 duration-300"
                                                            style={{ animationDelay: `${300 + index * 100}ms`, animationFillMode: 'both' }}>
                                                            <div className={`p-2 rounded-lg text-white transition-all duration-300 hover:scale-110 ${getMovementColor()}`}>
                                                                {getMovementIcon()}
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-gray-800">
                                                                    {getMovementTitle()}
                                                                </div>
                                                                <div className="text-sm text-gray-600">
                                                                    {new Date(movement.date).toLocaleDateString('tr-TR', {
                                                                        year: 'numeric',
                                                                        month: 'long',
                                                                        day: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-12 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
                                                            style={{ animationDelay: `${400 + index * 100}ms`, animationFillMode: 'both' }}>
                                                            <div className="flex items-center gap-2">
                                                                <Package size={14} className="text-gray-500" />
                                                                <span className="text-sm text-gray-600">Miktar:</span>
                                                                <span className="font-semibold text-gray-800">
                                                                    {Math.abs(movement.quantity)} {movement.unit}
                                                                </span>
                                                            </div>

                                                            {/* Fiyat bilgisi - sadece stok girişlerinde */}
                                                            {movement.unitPrice && (
                                                                <div className="flex items-center gap-2">
                                                                    <DollarSign size={14} className="text-gray-500" />
                                                                    <span className="text-sm text-gray-600">Birim Fiyat:</span>
                                                                    <span className="font-semibold text-gray-800">
                                                                        ₺{movement.unitPrice.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {supplier && (
                                                                <div className="flex items-center gap-2">
                                                                    <Truck size={14} className="text-gray-500" />
                                                                    <span className="text-sm text-gray-600">Tedarikçi:</span>
                                                                    <span className="font-semibold text-gray-800">
                                                                        {supplier.name}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            <div className="flex items-center gap-2">
                                                                <User size={14} className="text-gray-500" />
                                                                <span className="text-sm text-gray-600">Kullanıcı:</span>
                                                                <span className="font-semibold text-gray-800">
                                                                    {movement.userName}
                                                                </span>
                                                            </div>

                                                            {movement.reason && (
                                                                <div className="flex items-center gap-2">
                                                                    <Info size={14} className="text-gray-500" />
                                                                    <span className="text-sm text-gray-600">Sebep:</span>
                                                                    <span className="font-semibold text-gray-800">
                                                                        {movement.reason}
                                                                    </span>
                                                                </div>
                                                            )}

                                                            {/* Toplam fiyat bilgisi - sadece stok girişlerinde */}
                                                            {movement.totalPrice && (
                                                                <div className="flex items-center gap-2">
                                                                    <DollarSign size={14} className="text-green-500" />
                                                                    <span className="text-sm text-gray-600">Toplam Değer:</span>
                                                                    <span className="font-semibold text-green-600">
                                                                        ₺{movement.totalPrice.toLocaleString()}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {movement.notes && (
                                                            <div className="mt-3 ml-12 animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
                                                                style={{ animationDelay: `${500 + index * 100}ms`, animationFillMode: 'both' }}>
                                                                <div className="text-sm text-gray-600 bg-white rounded-lg p-3 border hover:shadow-sm transition-shadow">
                                                                    <strong>Not:</strong> {movement.notes}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className={`text-right animate-in fade-in-0 slide-in-from-right-3 duration-300 ${isAdjustment
                                                            ? (movement.quantity > 0 ? 'text-green-600' : 'text-red-600')
                                                            : (isIncoming ? 'text-green-600' : 'text-red-600')
                                                        }`}
                                                        style={{ animationDelay: `${350 + index * 100}ms`, animationFillMode: 'both' }}>
                                                        <div className="font-bold text-lg transform transition-all duration-300 hover:scale-110">
                                                            {isAdjustment
                                                                ? (movement.quantity > 0 ? '+' : '') + movement.quantity
                                                                : (isIncoming ? '+' : '-') + Math.abs(movement.quantity)
                                                            }
                                                        </div>
                                                        <div className="text-sm">{movement.unit}</div>
                                                        {movement.unitPrice && (
                                                            <div className="text-xs text-gray-500 mt-1 animate-in fade-in-0 duration-200"
                                                                style={{ animationDelay: `${600 + index * 100}ms`, animationFillMode: 'both' }}>
                                                                ₺{movement.unitPrice}/adet
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {stockMovements.length === 0 && (
                                    <div className="text-center py-8 animate-in fade-in-0 zoom-in-50 duration-500 delay-300">
                                        <Package size={48} className="mx-auto text-gray-300 mb-4 animate-pulse" />
                                        <p className="text-gray-500">Henüz stok hareketi bulunmuyor.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'analytics' && (
                            <div className="space-y-4 slide-in-from-bottom-4 duration-300 min-h-[250px]">
                                <div className="flex items-center gap-2 mb-4">
                                    <BarChart3 size={20} className="text-orange-500" />
                                    <h3 className="text-lg font-semibold text-gray-800">Analitik Veriler</h3>
                                </div>
                                <div className="text-center py-8">
                                    <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
                                    <p className="text-gray-500">Analitik veriler yakında eklenecek.</p>
                                </div>
                            </div>
                        )}
                            </div>
                        )}
                    </div>

                    {/* Action Button - Fixed at bottom */}
                    <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50 transition-all duration-200 ease-in-out flex-shrink-0">
                        <button
                            onClick={handleClose}
                            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 ease-in-out font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1"
                        >
                            Kapat
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
