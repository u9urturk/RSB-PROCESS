import { Warehouse } from "@/types/stock";

export const warehouseData: Warehouse[] = [
    {
        id: '1',
        name: 'Ana Depo',
        location: 'Merkez',
        capacity: '85%',
        capacityPercentage: 85,
        status: 'Aktif',
        manager: 'Ahmet Yılmaz',
        staffCount: 4,
        area: 500,
        warehouseType: 'Normal'
    },
    {
        id: '2',
        name: 'Soğuk Hava Deposu',
        location: 'Yan Bina',
        capacity: '60%',
        capacityPercentage: 60,
        status: 'Aktif',
        manager: 'Fatma Demir',
        staffCount: 2,
        area: 200,
        temperature: 4,
        warehouseType: 'Soğuk'
    },
    {
        id: '3',
        name: 'Kuru Gıda Deposu',
        location: 'Kat 2',
        capacity: '90%',
        capacityPercentage: 90,
        status: 'Aktif',
        manager: 'Mehmet Kaya',
        staffCount: 2,
        area: 300,
        warehouseType: 'Kuru'
    }
];


export default warehouseData;
