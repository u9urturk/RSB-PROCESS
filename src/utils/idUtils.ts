// UUID benzeri benzersiz ID oluşturucu yardımcı fonksiyonu
export const generateUniqueId = (prefix: string = ''): string => {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 15);
    const extraRandom = Math.random().toString(36).substring(2, 9);
    return `${prefix}${timestamp}-${randomStr}-${extraRandom}`;
};

// Daha kısa ID oluşturucu (debugging için)
export const generateShortId = (prefix: string = ''): string => {
    const randomStr = Math.random().toString(36).substring(2, 8);
    const timestamp = Date.now().toString(36).slice(-4);
    return `${prefix}${timestamp}${randomStr}`;
};
