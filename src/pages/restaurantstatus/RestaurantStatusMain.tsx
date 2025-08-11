import { useEffect, useState, useRef } from "react";
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

// Custom hook for animated counter
const useAnimatedCounter = (targetValue: number, duration: number = 1500) => {
  const [currentValue, setCurrentValue] = useState(0);
  const animationRef = useRef<number | null>(null); // null başlangıç değeri ve tip tanımı
  const startTimeRef = useRef<number | null>(null); // null başlangıç değeri ve tip tanımı

  useEffect(() => {
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const animatedValue = Math.floor(easeOutCubic * targetValue);

      setCurrentValue(animatedValue);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    // Reset animation when target value changes
    startTimeRef.current = null; // undefined yerine null
    setCurrentValue(0);
    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) { // null kontrolü
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [targetValue, duration]);

  return currentValue;
};

// Animated Number Component
const AnimatedNumber: React.FC<{ value: number; className?: string }> = ({ value, className = "" }) => {
  const animatedValue = useAnimatedCounter(value);
  
  return (
    <span className={className}>
      {animatedValue}
    </span>
  );
};

// Animated Circle Component (wrapper for Circle with animated value)
const AnimatedCircle: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const animatedValue = useAnimatedCounter(value);
  
  return <Circle label={label} value={animatedValue} />;
};

function RestaurantStatusMainContent() {
  const { setActivePath } = useNavigation();
  const { tables } = useRestaurant();

  const [areaCategories, setAreaCategories] = useState<AreaCategory[]>([]);
  const [capacityCategories, setCapacityCategories] = useState<CapacityCategory[]>([]);
  const [areaFilter, setAreaFilter] = useState<string>("all");
  const [capacityFilter, setCapacityFilter] = useState<string>("all");
  const [statusFilter] = useState<typeof STATUS_FILTERS[number]["key"]>("all");

  useEffect(() => {
    setActivePath("/dashboard/restaurantstatus");
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
  const occupiedTables = filteredTables.filter((t) => t.status === "occupied").length;
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
              <p className="text-orange-100 text-sm sm:text-base">Masa durumları ve rezervasyon yönetimi</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 w-full lg:w-auto">
              {[ 
                { type: 'icon' as const, icon: Users, label: "Toplam Masa", value: totalTables },
                { type: 'icon' as const, icon: CheckCircle, label: "Dolu Masa", value: occupiedTables },
                { type: 'icon' as const, icon: XCircle, label: "Boş Masa", value: availableTables },
                { type: 'circle' as const, label: "Doluluk", value: occupancyRate }
              ].map((item, i) => (
                <div
                  key={i}
                  className="group bg-white/10 backdrop-blur-sm rounded-2xl p-6 flex flex-col items-center justify-center border border-white/20 min-h-[160px] hover:scale-105 transition-all duration-300 ease-out cursor-default animate-fade-in relative overflow-hidden"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-2xl"></div>
                  
                  <div className="flex justify-center mb-3 relative z-10">
                    {item.type === 'circle' ? (
                      <AnimatedCircle label={item.label} value={item.value} />
                    ) : (
                      <item.icon className="text-white group-hover:scale-110 transition-transform duration-300" size={28} />
                    )}
                  </div>
                  {item.type !== 'circle' && (
                    <>
                      <AnimatedNumber 
                        value={item.value} 
                        className="text-3xl font-bold text-white relative z-10"
                      />
                      <span className="text-orange-100 text-sm mt-1 relative z-10">{item.label}</span>
                    </>
                  )}
                  {item.type === 'circle' && (
                    <p className="text-3xl font-bold text-white mt-4 relative z-10">
                      <AnimatedNumber value={item.value} />%
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 mb-6 border border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center gap-2 text-gray-700 font-semibold mb-2 sm:mb-0">
              <Filter size={20} className="text-orange-500" />
              <span>Filtreler</span>
            </div>
            <div className="flex flex-wrap gap-4 items-center flex-1">
              {/* Alan */}
              <div className="flex items-center gap-2 flex-grow max-w-xs">
                <label
                  htmlFor="area-filter"
                  className="text-gray-600 text-sm font-medium whitespace-nowrap"
                >
                  Alan:
                </label>
                <select
                  id="area-filter"
                  value={areaFilter}
                  onChange={(e) => setAreaFilter(e.target.value)}
                  className="flex-grow border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">Tümü</option>
                  {areaCategories.map((area) => (
                    <option key={area.key} value={area.key}>
                      {area.label}
                    </option>
                  ))}
                </select>
              </div>
              {/* Kapasite */}
              <div className="flex items-center gap-2 flex-grow max-w-xs">
                <label
                  htmlFor="capacity-filter"
                  className="text-gray-600 text-sm font-medium whitespace-nowrap"
                >
                  Kapasite:
                </label>
                <select
                  id="capacity-filter"
                  value={capacityFilter}
                  onChange={(e) => setCapacityFilter(e.target.value)}
                  className="flex-grow border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="all">Tümü</option>
                  {capacityCategories.map((cap) => (
                    <option key={cap.key} value={cap.key}>
                      {cap.label}
                    </option>
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
