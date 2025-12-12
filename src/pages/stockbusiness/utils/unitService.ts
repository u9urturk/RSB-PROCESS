/**
 * Unit Service - Birim simgeleri ve dönüşüm işlemleri
 */

// Birim ID'sine göre simge döndürür
export const getUnitSymbol = (unitId?: string): string => {
  if (!unitId) return '';
  
  // Birim ID'sine göre simge mapping'i
  // TODO: Bu değerler backend'den gelen gerçek verilerle güncellenmelidir
  const unitSymbols: Record<string, string> = {
    // Ağırlık birimleri
    'kg': 'kg',
    'gram': 'gr',
    'ton': 'ton',
    
    // Hacim birimleri
    'liter': 'L',
    'mililitre': 'ml',
    
    // Adet birimleri
    'piece': 'adet',
    'box': 'kutu',
    'package': 'paket',
    
    // Varsayılan
    'default': 'adet'
  };

  return unitSymbols[unitId] || unitSymbols['default'];
};

// Birim adına göre simge döndürür
export const getUnitSymbolByName = (unitName?: string): string => {
  if (!unitName) return '';
  
  const unitName_lower = unitName.toLowerCase();
  
  if (unitName_lower.includes('kilogram') || unitName_lower.includes('kg')) return 'kg';
  if (unitName_lower.includes('gram') || unitName_lower.includes('gr')) return 'gr';
  if (unitName_lower.includes('ton')) return 'ton';
  if (unitName_lower.includes('liter') || unitName_lower.includes('litre')) return 'L';
  if (unitName_lower.includes('mililitre') || unitName_lower.includes('ml')) return 'ml';
  if (unitName_lower.includes('adet') || unitName_lower.includes('piece')) return 'adet';
  if (unitName_lower.includes('kutu') || unitName_lower.includes('box')) return 'kutu';
  if (unitName_lower.includes('paket') || unitName_lower.includes('package')) return 'paket';
  
  return unitName;
};

// Birim dönüşümü yapar
export const convertUnit = (
  value: number,
  _fromUnit: string,
  _toUnit: string
): number => {
  // TODO: Gerçek birim dönüşüm mantığı eklenecek
  // Şimdilik aynı değeri döndür
  return value;
};
