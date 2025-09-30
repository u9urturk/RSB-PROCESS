interface Category {
    key: string;
    label: string;
}

export const AREA_CATEGORIES: Category[] = [
    { key: "garden", label: "Bahçe" },
    { key: "indoor", label: "İç Mekan" },
    { key: "terrace", label: "Teras" },
];

export const CAPACITY_CATEGORIES: Category[] = [
    { key: "2", label: "2 Kişilik" },
    { key: "4", label: "4 Kişilik" },
    { key: "6", label: "6 Kişilik" },
];
