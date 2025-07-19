import { useEffect, useState } from "react";
import { Users, CheckCircle, XCircle, Filter } from "lucide-react";
import Circle from "../../components/Circle";
import { useNavigation } from "../../context/provider/NavigationProvider";
import TableManagement from "./components/TableManagement";
import { AREA_CATEGORIES, CAPACITY_CATEGORIES } from "./mocks/categoriesData";
import { useRestaurant } from "../../context/context";
import { TableData } from "../../types";
import { RestaurantProvider } from "../../context/provider/RestaurantProvider";

interface AreaCategory {
    key: string;
    label: string;
}

interface CapacityCategory {
    key: string;
    label: string;
}

const STATUS_FILTERS = [
    { key: "all", label: "Tüm Masalar" },
    { key: "occupied", label: "Dolu" },
    { key: "available", label: "Boş" },
    { key: "reserved", label: "Rezerve" },
    { key: "clean", label: "Temiz" },
    { key: "dirty", label: "Temizlenecek" },
] as const;

function RestaurantStatusMainContent() {
    const { setActivePath } = useNavigation();
    const { tables } = useRestaurant();

    const [areaCategories, setAreaCategories] = useState<AreaCategory[]>([]);
    const [capacityCategories, setCapacityCategories] = useState<CapacityCategory[]>([]);
    const [areaFilter, setAreaFilter] = useState<string>("all");
    const [capacityFilter, setCapacityFilter] = useState<string>("all");
    const [statusFilter] = useState<typeof STATUS_FILTERS[number]["key"]>("all");

    useEffect(() => {
        setActivePath('/dashboard/restaurantstatus');
        setAreaCategories(AREA_CATEGORIES);
        setCapacityCategories(CAPACITY_CATEGORIES);
    }, [setActivePath]);

    // Filtrelenmiş masalar
    const filteredTables = tables.filter((table: TableData) => {
        const capacityMatch = capacityFilter === "all" || table.capacity === Number(capacityFilter);
        let statusMatch = true;
        
        switch (statusFilter) {
            case "occupied":
                statusMatch = table.status === "occupied";
                break;
            case "available":
                statusMatch = table.status === "available";
                break;
            case "reserved":
                statusMatch = table.status === "reserved";
                break;
            default:
                statusMatch = true;
        }

        return capacityMatch && statusMatch;
    });

    const totalTables = filteredTables.length;
    const occupiedTables = filteredTables.filter(t => t.status === "occupied").length;
    const availableTables = totalTables - occupiedTables;
    const occupancyRate = totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-orange-500 to-red-600 text-white p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                        <div className="animate-fade-in">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 flex items-center gap-3">
                                <Users className="text-white" size={32} />
                                Restoran Durumu
                            </h1>
                            <p className="text-orange-100 text-sm sm:text-base">
                                Masa durumları ve rezervasyon yönetimi
                            </p>
                        </div>
                        
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full lg:w-auto">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                                <div className="flex justify-center mb-2">
                                    <Users className="text-white" size={24} />
                                </div>
                                <p className="text-2xl font-bold text-white">{totalTables}</p>
                                <span className="text-orange-100 text-xs">Toplam Masa</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                                <div className="flex justify-center mb-2">
                                    <CheckCircle className="text-white" size={24} />
                                </div>
                                <p className="text-2xl font-bold text-white">{occupiedTables}</p>
                                <span className="text-orange-100 text-xs">Dolu Masa</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                                <div className="flex justify-center mb-2">
                                    <XCircle className="text-white" size={24} />
                                </div>
                                <p className="text-2xl font-bold text-white">{availableTables}</p>
                                <span className="text-orange-100 text-xs">Boş Masa</span>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/20">
                                <div className="flex justify-center mb-2">
                                    <Circle label="Doluluk"  value={occupancyRate} />
                                </div>
                                <p className="text-2xl font-bold text-white">{occupancyRate}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 border border-gray-100">
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="flex items-center gap-2 text-gray-700 font-semibold">
                            <Filter size={20} className="text-orange-500" />
                            <span>Filtreler</span>
                        </div>
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600 text-sm font-medium">Alan:</span>
                                <select
                                    value={areaFilter}
                                    onChange={e => setAreaFilter(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="all">Tümü</option>
                                    {areaCategories.map(area => (
                                        <option key={area.key} value={area.key}>{area.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600 text-sm font-medium">Kapasite:</span>
                                <select
                                    value={capacityFilter}
                                    onChange={e => setCapacityFilter(e.target.value)}
                                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                >
                                    <option value="all">Tümü</option>
                                    {capacityCategories.map(cap => (
                                        <option key={cap.key} value={cap.key}>{cap.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Management */}
                <TableManagement tables={filteredTables} />
            </div>
        </div>
    );
}

export default function RestaurantStatusMain() {
    return (
        <RestaurantProvider>
            <RestaurantStatusMainContent />
        </RestaurantProvider>
    );
}
