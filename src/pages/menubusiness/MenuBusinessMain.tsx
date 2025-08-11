import { useState, useEffect, useMemo, useCallback } from "react";
import { Plus, ChefHat, Search, Grid3X3, List, Filter, SortAsc } from "lucide-react";
import MenuTable from "./components/MenuTable";
import MenuAddModal from "./modals/MenuAddModal";
import { menuData, MENU_CATEGORIES } from "./mocks/menuData";
import { useConfirm } from "../../context/provider/ConfirmProvider";
import { useNavigation } from "../../context/provider/NavigationProvider";
import { useNotification } from "../../context/provider/NotificationProvider";
import { MenuItemDetailed } from "../../types";
import "./animations.css";

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
    const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
    const { showNotification } = useNotification();
    const confirm = useConfirm();

    useEffect(() => {
        setActivePath('/dashboard/menubusiness');
        mockFetchMenuData().then(data => {
            setMenuItems(data);
            setLoading(false);
        });
    }, [setActivePath]);

    // Memoized categories for performance
    const categories = useMemo(() => 
        ["all", ...Array.from(new Set(menuItems.map(item => item.category)))],
        [menuItems]
    );

    // Memoized filtered items for performance
    const filteredItems = useMemo(() => {
        return menuItems
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
    }, [menuItems, search, selectedCategory, statusFilter, sortBy]);

    // Optimized handlers with useCallback
    const handleAddMenuItem = useCallback(async (newItem: MenuItemDetailed): Promise<void> => {
        setMenuItems(prev => [...prev, { ...newItem, id: Date.now().toString() }]);
        setAddModalOpen(false);
        showNotification("success", "Ürün başarıyla eklendi.");
    }, [showNotification]);

    const handleUpdateMenuItem = useCallback(async (id: string, updatedItem: MenuItemDetailed): Promise<void> => {
        setMenuItems(prev => prev.map(item => item.id === id ? updatedItem : item));
        showNotification("success", "Ürün başarıyla güncellendi.");
    }, [showNotification]);

    const handleDeleteMenuItem = useCallback(async (id: string): Promise<void> => {
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
    }, [menuItems, confirm, showNotification]);

    // Memoized statistics for performance
    const stats = useMemo(() => ({
        total: menuItems.length,
        active: menuItems.filter(item => item.status === "active").length,
        inactive: menuItems.filter(item => item.status === "inactive").length,
        categories: categories.length - 1 // Exclude "all"
    }), [menuItems, categories]);

    const clearFilters = useCallback(() => {
        setSearch("");
        setSelectedCategory("all");
        setStatusFilter("all");
        setSortBy("name");
        setIsFilterOpen(false);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-center h-96">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-slate-200 border-t-indigo-500 rounded-full animate-spin"></div>
                                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-blue-400 rounded-full animate-spin animation-delay-75"></div>
                            </div>
                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-slate-700 animate-fade-in">Menü yükleniyor...</h3>
                                <p className="text-sm text-slate-500 animate-fade-in animation-delay-150">Lütfen bekleyiniz</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 animate-fade-in">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Modern Header */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8 hover-lift animate-fade-in-up">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div className="flex items-center gap-6">
                            <div className="relative p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl text-white shadow-xl">
                                <ChefHat size={36} />
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-gentle-bounce"></div>
                            </div>
                            <div className="space-y-2">
                                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                                    Menü Yönetimi
                                </h1>
                                <p className="text-slate-600 text-lg">Restoranınızın lezzetlerini yönetin ve güncelleyin</p>
                            </div>
                        </div>
                        
                        {/* Enhanced Stats Cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: "Toplam", value: stats.total, color: "from-blue-500 to-cyan-500", icon: "📊" },
                                { label: "Aktif", value: stats.active, color: "from-emerald-500 to-green-500", icon: "✅" },
                                { label: "Pasif", value: stats.inactive, color: "from-slate-500 to-gray-500", icon: "⏸️" },
                                { label: "Kategori", value: stats.categories, color: "from-purple-500 to-violet-500", icon: "🏷️" }
                            ].map((stat, index) => (
                                <div 
                                    key={stat.label}
                                    className={`bg-gradient-to-br ${stat.color} text-white p-5 rounded-2xl text-center hover-scale transition-smooth shadow-lg animate-slide-in-right stagger-${index + 1}`}
                                >
                                    <div className="text-sm opacity-90 mb-1">{stat.icon}</div>
                                    <div className="text-3xl font-bold mb-1">{stat.value}</div>
                                    <div className="text-xs opacity-90 font-medium">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Enhanced Search and Filters */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-6 hover-lift animate-fade-in-up stagger-2">
                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Enhanced Search Bar */}
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 z-10" size={20} />
                            <input
                                type="text"
                                placeholder="Ürün, kategori veya açıklama ara..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-6 py-4 bg-white/80 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-smooth placeholder-slate-400 shadow-sm"
                            />
                            {search && (
                                <button
                                    onClick={() => setSearch("")}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-smooth"
                                >
                                    ✕
                                </button>
                            )}
                        </div>

                        {/* Filter Controls */}
                        <div className="flex flex-wrap gap-3 items-center">
                            {/* Filter Toggle */}
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-smooth ${
                                    isFilterOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <Filter size={16} />
                                Filtreler
                            </button>

                            {/* Quick Filters (always visible) */}
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-smooth"
                            >
                                <option value="all">Tüm Kategoriler</option>
                                {categories.slice(1).map(category => (
                                    <option key={category} value={category}>{category}</option>
                                ))}
                            </select>

                            {/* View Mode Toggle */}
                            <div className="flex bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <button
                                    onClick={() => setViewMode("grid")}
                                    className={`p-3 transition-smooth ${viewMode === "grid" ? "bg-indigo-500 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                                >
                                    <Grid3X3 size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode("list")}
                                    className={`p-3 transition-smooth ${viewMode === "list" ? "bg-indigo-500 text-white" : "text-slate-600 hover:bg-slate-50"}`}
                                >
                                    <List size={18} />
                                </button>
                            </div>

                            {/* Add Product Button */}
                            <button
                                onClick={() => setAddModalOpen(true)}
                                className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-smooth shadow-lg hover:shadow-xl hover-scale btn-press"
                            >
                                <Plus size={20} />
                                Ürün Ekle
                            </button>
                        </div>
                    </div>

                    {/* Expanded Filters */}
                    {isFilterOpen && (
                        <div className="mt-6 pt-6 border-t border-slate-200 animate-fade-in-down">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Durum</label>
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-smooth"
                                    >
                                        <option value="all">Tüm Durumlar</option>
                                        <option value="active">Aktif</option>
                                        <option value="inactive">Pasif</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">Sıralama</label>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-smooth"
                                    >
                                        <option value="name">İsme Göre</option>
                                        <option value="price">Fiyata Göre</option>
                                        <option value="category">Kategoriye Göre</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={clearFilters}
                                        className="w-full px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-smooth"
                                    >
                                        Filtreleri Temizle
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Content Area */}
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 overflow-hidden hover-lift animate-fade-in-up stagger-3">
                    <div className="p-6 border-b border-slate-200/50">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                                <SortAsc size={24} className="text-indigo-500" />
                                Ürünler ({filteredItems.length})
                            </h2>
                            {filteredItems.length > 0 && (
                                <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                                    {search || selectedCategory !== "all" || statusFilter !== "all" ? 
                                        `${filteredItems.length} sonuç gösteriliyor` : 
                                        `Toplam ${menuItems.length} ürün`
                                    }
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {filteredItems.length === 0 ? (
                        <div className="p-12 text-center animate-fade-in">
                            <div className="w-32 h-32 mx-auto mb-6 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                                <ChefHat size={48} className="text-slate-400" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-3">Ürün Bulunamadı</h3>
                            <p className="text-slate-600 mb-8 max-w-md mx-auto leading-relaxed">
                                {search || selectedCategory !== "all" || statusFilter !== "all" 
                                    ? "Arama kriterlerinize uygun ürün bulunamadı. Filtreleri değiştirip tekrar deneyin."
                                    : "Henüz menünüze ürün eklenmemiş. İlk ürününüzü ekleyerek başlayın."}
                            </p>
                            <button
                                onClick={() => setAddModalOpen(true)}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-smooth focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg hover:shadow-xl hover-scale btn-press"
                            >
                                <Plus size={20} />
                                İlk Ürünü Ekle
                            </button>
                        </div>
                    ) : (
                        <MenuTable
                            items={filteredItems}
                            onDelete={handleDeleteMenuItem}
                            onUpdate={handleUpdateMenuItem}
                            viewMode={viewMode}
                        />
                    )}
                </div>
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
