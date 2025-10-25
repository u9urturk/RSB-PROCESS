export interface Unit {
    id: string;
    name: string;
    shortName: string;
    category: 'weight' | 'volume' | 'count' | 'package';
    conversionFactor?: number; // Base conversion factor (e.g., 1 kg = 1000 g)
    baseUnit?: string; // Reference to base unit for conversion
    symbol: string;
    description: string;
    isActive: boolean;
}

export const unitData: Unit[] = [
    {
        id: '1',
        name: 'Adet',
        shortName: 'adet',
        category: 'count',
        symbol: 'adet',
        description: 'Sayılabilir ürünler için kullanılır',
        isActive: true
    },
    {
        id: '2',
        name: 'Kilogram',
        shortName: 'kg',
        category: 'weight',
        symbol: 'kg',
        description: 'Ağırlık ölçü birimi - 1000 gram',
        conversionFactor: 1000,
        baseUnit: '3', // gram
        isActive: true
    },
    {
        id: '3',
        name: 'Gram',
        shortName: 'gr',
        category: 'weight',
        symbol: 'g',
        description: 'Temel ağırlık ölçü birimi',
        conversionFactor: 1,
        isActive: true
    },
    {
        id: '4',
        name: 'Litre',
        shortName: 'lt',
        category: 'volume',
        symbol: 'L',
        description: 'Hacim ölçü birimi - 1000 mililitre',
        conversionFactor: 1000,
        baseUnit: '5', // mililitre
        isActive: true
    },
    {
        id: '5',
        name: 'Mililitre',
        shortName: 'ml',
        category: 'volume',
        symbol: 'mL',
        description: 'Temel hacim ölçü birimi',
        conversionFactor: 1,
        isActive: true
    },
    {
        id: '6',
        name: 'Paket',
        shortName: 'paket',
        category: 'package',
        symbol: 'pkt',
        description: 'Paketlenmiş ürünler için kullanılır',
        isActive: true
    },
    {
        id: '7',
        name: 'Kutu',
        shortName: 'kutu',
        category: 'package',
        symbol: 'kutu',
        description: 'Kutuda satılan ürünler için kullanılır',
        isActive: true
    },
    {
        id: '8',
        name: 'Şişe',
        shortName: 'şişe',
        category: 'package',
        symbol: 'şişe',
        description: 'Şişede satılan ürünler için kullanılır',
        isActive: true
    },
    {
        id: '9',
        name: 'Ton',
        shortName: 'ton',
        category: 'weight',
        symbol: 't',
        description: 'Büyük ağırlık ölçü birimi - 1000 kilogram',
        conversionFactor: 1000000,
        baseUnit: '3', // gram
        isActive: true
    },
    {
        id: '10',
        name: 'Metreküp',
        shortName: 'm³',
        category: 'volume',
        symbol: 'm³',
        description: 'Büyük hacim ölçü birimi',
        conversionFactor: 1000000,
        baseUnit: '5', // mililitre
        isActive: true
    },
    {
        id: '11',
        name: 'Koli',
        shortName: 'koli',
        category: 'package',
        symbol: 'koli',
        description: 'Toplu paketler için kullanılır',
        isActive: true
    },
    {
        id: '12',
        name: 'Çuval',
        shortName: 'çuval',
        category: 'package',
        symbol: 'çuval',
        description: 'Çuvallarda satılan ürünler için kullanılır',
        isActive: true
    }
];

// Helper function to get units by category
export const getUnitsByCategory = (category: Unit['category']): Unit[] => {
    return unitData.filter(unit => unit.category === category && unit.isActive);
};

// Helper function to get unit by id
export const getUnitById = (id: string): Unit | undefined => {
    return unitData.find(unit => unit.id === id);
};

// Helper function to get active units
export const getActiveUnits = (): Unit[] => {
    return unitData.filter(unit => unit.isActive);
};