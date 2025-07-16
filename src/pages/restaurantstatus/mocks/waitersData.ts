import { Waiter } from "../../../types";

export const waitersData: Waiter[] = [
    {
        id: "waiter-1",
        name: "Mehmet Yılmaz",
        phone: "+90 555 123 4567",
        email: "mehmet.yilmaz@restaurant.com",
        shift: "morning",
        isActive: true,
        performanceScore: 4.8,
        assignedTables: ["table-1", "table-2", "table-3"],
        currentOrdersCount: 5,
        joiningDate: "2024-01-15",
        avatar: "https://i.pravatar.cc/150?img=1"
    },
    {
        id: "waiter-2", 
        name: "Ayşe Demir",
        phone: "+90 555 234 5678",
        email: "ayse.demir@restaurant.com",
        shift: "afternoon",
        isActive: true,
        performanceScore: 4.9,
        assignedTables: ["table-4", "table-5", "table-6"],
        currentOrdersCount: 3,
        joiningDate: "2024-02-01",
        avatar: "https://i.pravatar.cc/150?img=2"
    },
    {
        id: "waiter-3",
        name: "Ali Kaya",
        phone: "+90 555 345 6789", 
        email: "ali.kaya@restaurant.com",
        shift: "evening",
        isActive: true,
        performanceScore: 4.6,
        assignedTables: ["table-7", "table-8", "table-9"],
        currentOrdersCount: 7,
        joiningDate: "2024-03-10",
        avatar: "https://i.pravatar.cc/150?img=3"
    },
    {
        id: "waiter-4",
        name: "Fatma Şahin",
        phone: "+90 555 456 7890",
        email: "fatma.sahin@restaurant.com", 
        shift: "night",
        isActive: true,
        performanceScore: 4.7,
        assignedTables: ["table-10", "table-11", "table-12"],
        currentOrdersCount: 4,
        joiningDate: "2024-01-20",
        avatar: "https://i.pravatar.cc/150?img=4"
    },
    {
        id: "waiter-5",
        name: "Mustafa Özkan",
        phone: "+90 555 567 8901",
        email: "mustafa.ozkan@restaurant.com",
        shift: "morning",
        isActive: true,
        performanceScore: 4.5,
        assignedTables: ["table-13", "table-14", "table-15"],
        currentOrdersCount: 6,
        joiningDate: "2024-02-15",
        avatar: "https://i.pravatar.cc/150?img=5"
    },
    {
        id: "waiter-6",
        name: "Zeynep Çelik",
        phone: "+90 555 678 9012",
        email: "zeynep.celik@restaurant.com",
        shift: "afternoon", 
        isActive: false, // Mola/istirahat
        performanceScore: 4.8,
        assignedTables: [],
        currentOrdersCount: 0,
        joiningDate: "2024-01-10",
        avatar: "https://i.pravatar.cc/150?img=6"
    },
    {
        id: "waiter-7",
        name: "Ahmet Yıldız",
        phone: "+90 555 789 0123",
        email: "ahmet.yildiz@restaurant.com",
        shift: "evening",
        isActive: true,
        performanceScore: 4.4,
        assignedTables: ["table-16", "table-17"],
        currentOrdersCount: 2,
        joiningDate: "2024-03-05",
        avatar: "https://i.pravatar.cc/150?img=7"
    },
    {
        id: "waiter-8",
        name: "Elif Arslan",
        phone: "+90 555 890 1234",
        email: "elif.arslan@restaurant.com",
        shift: "night",
        isActive: true,
        performanceScore: 4.9,
        assignedTables: ["table-18", "table-19", "table-20"],
        currentOrdersCount: 8,
        joiningDate: "2024-01-25",
        avatar: "https://i.pravatar.cc/150?img=8"
    }
];
