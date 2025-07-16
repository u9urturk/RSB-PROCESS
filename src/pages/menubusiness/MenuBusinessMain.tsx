import { useState, useEffect } from "react";
import { Plus, ChefHat } from "lucide-react";
import MenuTable from "./components/MenuTable";
import MenuAddModal from "./modals/MenuAddModal";
import { menuData } from "./mocks/menuData";
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
    const { showNotification } = useNotification();
    const confirm = useConfirm();

    useEffect(() => {
        setActivePath('/dashboard/menubusiness');
        mockFetchMenuData().then(setMenuItems);
    }, [setActivePath]);

    const filteredItems = menuItems.filter(item =>
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.category.toLowerCase().includes(search.toLowerCase())
    );

    const handleAddMenuItem = async (newItem: MenuItemDetailed): Promise<void> => {
        setMenuItems(prev => [...prev, { ...newItem, id: Date.now().toString() }]);
        setAddModalOpen(false);
        showNotification("success", "Ürün başarıyla eklendi.");
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
        } else {
            showNotification("warning", "Silme işlemi iptal edildi.");
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <ChefHat size={28} className="text-orange-500" />
                        <h1 className="text-2xl font-bold text-gray-900">Menü Yönetimi</h1>
                    </div>
                    <input
                        type="text"
                        placeholder="Ürün ara..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                </div>

                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900">Ürünler</h2>
                        <button
                            onClick={() => setAddModalOpen(true)}
                            className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                        >
                            <Plus size={18} />
                            Ürün Ekle
                        </button>
                    </div>
                    
                    <MenuTable
                        items={filteredItems}
                        onDelete={handleDeleteMenuItem}
                        onAdd={handleAddMenuItem}
                    />
                </div>
            </div>

            <MenuAddModal
                open={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onAdd={handleAddMenuItem}
                categories={["Ana Yemek", "Aperatif", "Tatlı", "İçecek"]}
            />
        </div>
    );
}
