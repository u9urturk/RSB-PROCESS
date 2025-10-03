import { StockType } from "@/types/stock";

export const stockTypeDatas: StockType[] = [
        {
            id: '1',
            name: 'Hammadde',
            description: 'Yemek hazırlığı için kullanılan temel malzemeler',
            color: 'from-green-500 to-green-600',
            icon: '🥗',
            itemCount: 45,
            examples: ['Et', 'Sebze', 'Baharat', 'Süt ürünleri']
        },
        {
            id: '2',
            name: 'Ürün',
            description: 'Satışa hazır nihai ürünler',
            color: 'from-blue-500 to-blue-600',
            icon: '🍽️',
            itemCount: 32,
            examples: ['Menü yemekleri', 'İçecekler', 'Tatlılar', 'Atıştırmalık']
        },
        {
            id: '3',
            name: 'Temizlik',
            description: 'Hijyen ve temizlik malzemeleri',
            color: 'from-purple-500 to-purple-600',
            icon: '🧽',
            itemCount: 18,
            examples: ['Deterjan', 'Dezenfektan', 'Kağıt havlu', 'Çöp torbası']
        },
        {
            id: '4',
            name: 'Mutfak Gereçleri',
            description: 'Mutfak ekipmanları ve araç gereçler',
            color: 'from-orange-500 to-orange-600',
            icon: '🔧',
            itemCount: 25,
            examples: ['Bıçak', 'Tencere', 'Tabak', 'Bardak']
        },
        {
            id: '5',
            name: 'Ambalaj',
            description: 'Paketleme ve servis malzemeleri',
            color: 'from-red-500 to-red-600',
            icon: '📦',
            itemCount: 12,
            examples: ['Karton kutu', 'Plastik poşet', 'Alüminyum folyo', 'Servis kabı']
        },
        {
            id: '6',
            name: 'İçecek Malzemeleri',
            description: 'İçecek hazırlığı için gerekli malzemeler',
            color: 'from-cyan-500 to-cyan-600',
            icon: '🥤',
            itemCount: 20,
            examples: ['Kahve çekirdeği', 'Çay yaprakları', 'Şurup', 'Buz']
        }
    ];

export default stockTypeDatas;
