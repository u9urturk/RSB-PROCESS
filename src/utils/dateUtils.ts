/**
 * Date utility functions for formatting dates in user-friendly formats
 */

/**
 * Formats an ISO date string to Turkish locale format
 * @param dateString - ISO date string from backend
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted date string in Turkish locale
 */
export const formatDate = (
  dateString: string, 
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }
): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Geçersiz tarih';
    }
    return date.toLocaleDateString('tr-TR', options);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Geçersiz tarih';
  }
};

/**
 * Formats date to short format (dd.mm.yyyy)
 * @param dateString - ISO date string
 * @returns Short date format
 */
export const formatDateShort = (dateString: string): string => {
  return formatDate(dateString, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

/**
 * Formats date to include time (dd.mm.yyyy HH:mm)
 * @param dateString - ISO date string
 * @returns Date with time format
 */
export const formatDateWithTime = (dateString: string): string => {
  return formatDate(dateString, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formats date relative to now (Bugün, Dün, vs.)
 * @param dateString - ISO date string
 * @returns Relative date format
 */
export const formatDateRelative = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Bugün';
    if (diffInDays === 1) return 'Dün';
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} hafta önce`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} ay önce`;
    
    return formatDateShort(dateString);
  } catch (error) {
    return formatDateShort(dateString);
  }
};