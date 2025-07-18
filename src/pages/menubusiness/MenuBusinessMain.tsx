import { useState, useEffect } from "react";
import { Plus, ChefHat, Search, Filter, Grid3X3, List, Star, TrendingUp, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MenuTable from "./components/MenuTable";
import MenuAddModal from "./modals/MenuAddModal";
import { menuData, MENU_CATEGORIES } from "./mocks/menuData";
import { useConfirm } from "../../context/provider/ConfirmProvider";
import { useNavigation } from "../../context/provider/NavigationProvider";
import { useNotification } from "../../context/provider/NotificationProvider";
import { MenuItemDetailed } from "../../types";

const mockFetchMenuData = (): Promise<MenuItemDetailed[]> => {
    return new Promise((resolve) => {
        setTimeout(() => resolve(menuData), 500);
    });
};

export default function MenuBusinessMain() {
    const { setActivePath } = useNavigation();
    const [search, setSearch] = useState<string>("");
    const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
    const [menuItems, setMenuItems] = useState<MenuItemDetailed[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
    const [sortBy, setSortBy] = useState<string>("name");
    const [loading, setLoading] = useState<boolean>(true);
    const { showNotification } = useNotification();
    const confirm = useConfirm();

    useEffect(() => {
        setActivePath('/dashboard/menubusiness');
        mockFetchMenuData().then(data => {
            setMenuItems(data);
            setLoading(false);
        });
    }, [setActivePath]);

    // Get unique categories
    const categories = ["all", ...Array.from(new Set(menuItems.map(item => item.category)))];

    // Enhanced filtering logic
    const filteredItems = menuItems
        .filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                                item.category.toLowerCase().includes(search.toLowerCase()) ||
                                item.description?.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
            const matchesStatus = statusFilter === "all" || item.status === statusFilter;
            return matchesSearch && matchesCategory && matchesStatus;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case "name": return a.name.localeCompare(b.name);
                case "price": return a.price - b.price;
                case "category": return a.category.localeCompare(b.category);
                default: return 0;
            }
        });

    const handleAddMenuItem = async (newItem: MenuItemDetailed): Promise<void> => {
        setMenuItems(prev => [...prev, { ...newItem, id: Date.now().toString() }]);
        setAddModalOpen(false);
        showNotification("success", "Ürün başarıyla eklendi.");
    };

    const handleUpdateMenuItem = async (id: string, updatedItem: MenuItemDetailed): Promise<void> => {
        setMenuItems(prev => prev.map(item => item.id === id ? updatedItem : item));
        showNotification("success", "Ürün başarıyla güncellendi.");
    };

    const handleDeleteMenuItem = async (id: string): Promise<void> => {
        const item = menuItems.find(item => item.id === id);
        if (!item) return;

        const result = await confirm({
            title: "Ürün Silme",
            message: `${item.name} adlı ürünü silmek istediğinizden emin misiniz?`,
            confirmText: "Sil",
            cancelText: "İptal"
        });

        if (result) {
            setMenuItems(prev => prev.filter(menuItem => menuItem.id !== id));
            showNotification("success", "Ürün başarıyla silindi.");
        }
    };

    // Statistics calculations
    const stats = {
        total: menuItems.length,
        active: menuItems.filter(item => item.status === "active").length,
        inactive: menuItems.filter(item => item.status === "inactive").length,
        categories: categories.length - 1 // Exclude "all"
    };

    if (loading) {
        return (
            <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 min-h-screen">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-96">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gradient-to-br from-orange-50 to-red-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Modern Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-6 border border-orange-100"
                >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl text-white shadow-lg">
                                <ChefHat size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Menü Yönetimi</h1>
                                <p className="text-gray-600 mt-1">Restoranınızın menüsünü yönetin ve güncelleyin</p>
                            </div>
                        </div>
                        
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl text-center">
                                <div className="text-2xl font-bold">{stats.total}</div>
                                <div className="text-xs opacity-90">Toplam Ürün</div>
                            </div>
                            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl text-center">
                                <div className="text-2xl font-bold">{stats.active}</div>
                                <div className="text-xs opacity-90">Aktif Ürün</div>
                            </div>
                            <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-4 rounded-xl text-center">
                                <div className="text-2xl font-bold">{stats.inactive}</div>
                                <div className="text-xs opacity-90">Pasif Ürün</div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl text-center">
                                <div className="text-2xl font-bold">{stats.categories}</div>
                                <div className="text-xs opacity-90">Kategori</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Enhanced Search and Filters */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100"
                >
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search Bar */}
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Ürün, kategori veya açıklama ara..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                            />
                        </div>

                        {/* Filter Controls */}
                        <div className="flex flex-wrap gap-3">
                            {/* Category Filter */}
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                            >
                                <option value="all">Tüm Kategoriler</option>
                                {categories.slice(1).map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>

                            {/* Status Filter */}
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                            >
                                <option value="all">Tüm Durumlar</option>
                                <option value="active">Aktif</option>
                                <option value="inactive">Pasif</option>
                            </select>

                            {/* Sort */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                            >
                                <option value="name">İsme Göre</option>
                                <option value="price">Fiyata Göre</option>
                                <option value="category">Kategoriye Göre</option>
                            </select>

                            {/* View Mode Toggle */}
                            <div className="flex border border-gray-200 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-3 transition-colors ${viewMode === "grid" ? "bg-orange-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                                >
                                    <Grid3X3 size={20} />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-3 transition-colors ${viewMode === "list" ? "bg-orange-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
                                >
                                    <List size={20} />
                                </button>
                            </div>

                            {/* Add Product Button */}
                            <button
                                onClick={() => setAddModalOpen(true)}
                                className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                            >
                                <Plus size={20} />
                                Ürün Ekle
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Content Area */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-2xl shadow-lg border border-orange-100 overflow-hidden"
                >
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Ürünler ({filteredItems.length})
                            </h2>
                            {filteredItems.length > 0 && (
                                <div className="text-sm text-gray-500">
                                    {search || selectedCategory !== "all" || statusFilter !== "all" ? 
                                        `${filteredItems.length} sonuç gösteriliyor` : 
                                        `Toplam ${menuItems.length} ürün`
                                    }
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <AnimatePresence mode="wait">
                        {filteredItems.length === 0 ? (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="p-12 text-center"
                            >
                                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                    <ChefHat size={32} className="text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ürün Bulunamadı</h3>
                                <p className="text-gray-500 mb-6">
                                    {search || selectedCategory !== "all" || statusFilter !== "all" 
                                        ? "Arama kriterlerinize uygun ürün bulunamadı. Filtreleri temizleyip tekrar deneyin."
                                        : "Henüz menünüze ürün eklenmemiş. İlk ürününüzü ekleyin."}
                                </p>
                                <button
                                    onClick={() => setAddModalOpen(true)}
                                    className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-xl hover:from-orange-600 hover:to-red-600 transition-all"
                                >
                                    <Plus size={18} />
                                    İlk Ürünü Ekle
                                </button>
                            </motion.div>
                        ) : (
                            <MenuTable
                                items={filteredItems}
                                onDelete={handleDeleteMenuItem}
                                onUpdate={handleUpdateMenuItem}
                                viewMode={viewMode}
                            />
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            <MenuAddModal
                open={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onAdd={handleAddMenuItem}
                categories={MENU_CATEGORIES}
            />
        </div>
    );
}
