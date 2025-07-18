import { MenuItemDetailed } from "../../../types";

export const MENU_CATEGORIES = [
    "Pizza",
    "Salata", 
    "Tatlı",
    "İçecek",
    "Makarna",
    "Ana Yemek",
    "Aperatif",
    "Kahvaltı",
    "Burger",
    "Kebap"
];

export const menuData: MenuItemDetailed[] = [
    {
        id: "1",
        name: "Margherita Pizza",
        category: "Pizza",
        price: 120,
        status: "active",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
        description: "Klasik domates soslu, mozzarella ve fesleğenli pizza. İnce hamur üzerine taze malzemelerle hazırlanır.",
        images: [
            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80",
            "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80"
        ]
    },
    {
        id: "2", 
        name: "Tavuklu Caesar Salata",
        category: "Salata",
        price: 85,
        status: "active",
        image: "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80",
        description: "Izgara tavuk, taze yeşillikler, kruton ve parmesan peyniri ile özel Caesar sosu.",
        images: [
            "https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=crop&w=400&q=80"
        ]
    },
    {
        id: "3",
        name: "Çikolatalı Sufle",
        category: "Tatlı", 
        price: 60,
        status: "inactive",
        image: "https://images.unsplash.com/photo-1505250469679-203ad9ced0cb?auto=format&fit=crop&w=400&q=80",
        description: "Akışkan çikolatalı sıcak sufle. Vanilyalı dondurma ile servis edilir.",
        images: [
            "https://images.unsplash.com/photo-1505250469679-203ad9ced0cb?auto=format&fit=crop&w=400&q=80"
        ]
    },
    {
        id: "4",
        name: "Ev Yapımı Limonata",
        category: "İçecek",
        price: 35,
        status: "active", 
        image: "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80",
        description: "Taze limon, nane ve sade şeker ile hazırlanan serinletici içecek.",
        images: [
            "https://images.unsplash.com/photo-1464306076886-debca5e8a6b0?auto=format&fit=crop&w=400&q=80"
        ]
    },
    {
        id: "5",
        name: "Sebzeli Penne Arrabiata",
        category: "Makarna",
        price: 95,
        status: "active",
        image: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?auto=format&fit=crop&w=400&q=80",
        description: "Mevsim sebzeleri, domates sosu ve baharatlarla hazırlanan acılı makarna.",
        images: [
            "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?auto=format&fit=crop&w=400&q=80"
        ]
    },
    {
        id: "6",
        name: "BBQ Burger",
        category: "Burger",
        price: 110,
        status: "active",
        image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=400&q=80", 
        description: "200gr dana eti, BBQ sosu, cheddar peyniri, soğan halkası ve patates kızartması.",
        images: [
            "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=400&q=80"
        ]
    },
    {
        id: "7",
        name: "Adana Kebap",
        category: "Kebap",
        price: 140,
        status: "active",
        image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80",
        description: "Özel baharatlarla hazırlanan acılı adana kebap. Bulgur pilavı ve salata ile.",
        images: [
            "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80"
        ]
    },
    {
        id: "8",
        name: "Karışık Aperatif",
        category: "Aperatif",
        price: 75,
        status: "active",
        image: "https://images.unsplash.com/photo-1541014741259-de529411b96a?auto=format&fit=crop&w=400&q=80",
        description: "Cips, çerez, zeytin ve peynir çeşitleriyle hazırlanan aperatif tabağı.",
        images: [
            "https://images.unsplash.com/photo-1541014741259-de529411b96a?auto=format&fit=crop&w=400&q=80"
        ]
    },
    {
        id: "9", 
        name: "Serpme Kahvaltı",
        category: "Kahvaltı",
        price: 90,
        status: "active",
        image: "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=400&q=80",
        description: "Çeşitli peynirler, reçeller, bal, siyah zeytin ve taze ekmekle zengin kahvaltı.", 
        images: [
            "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=400&q=80"
        ]
    },
    {
        id: "10",
        name: "Fırın Tavuk",
        category: "Ana Yemek", 
        price: 125,
        status: "active",
        image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=400&q=80",
        description: "Özel baharatlarla marine edilmiş fırın tavuk. Sebzeli garnitür ile.",
        images: [
            "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?auto=format&fit=crop&w=400&q=80"
        ]
    },
    {
        id: "11",
        name: "Cappuccino",
        category: "İçecek",
        price: 25,
        status: "active",
        image: "https://images.unsplash.com/photo-1572286258217-c5b8b3e3b398?auto=format&fit=crop&w=400&q=80",
        description: "İtalyan espresso üzerine buharda ısıtılmış süt köpüğü ile hazırlanan cappuccino.",
        images: [
            "https://images.unsplash.com/photo-1572286258217-c5b8b3e3b398?auto=format&fit=crop&w=400&q=80"
        ]
    },
    {
        id: "12",
        name: "Tiramisu",
        category: "Tatlı",
        price: 70,
        status: "active",
        image: "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=400&q=80",
        description: "Geleneksel İtalyan tatlısı. Kahve emdirilmiş kedi dili ve mascarpone krem.",
        images: [
            "https://images.unsplash.com/photo-1579372786545-d24232daf58c?auto=format&fit=crop&w=400&q=80"
        ]
    }
];
