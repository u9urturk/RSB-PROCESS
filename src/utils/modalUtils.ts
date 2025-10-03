import { useState, useEffect } from 'react';

// ============================================================================
// MODAL UTILITY FUNCTIONS AND TYPES
// ============================================================================

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ModalAnimationConfig {
    isOpen: boolean;
    isAnimating: boolean;
    shouldRender: boolean;
}

// ============================================================================
// FRAMER MOTION ANIMATION VARIANTS (STANDART)
// ============================================================================

export const modalOverlayVariants = {
    hidden: { 
        opacity: 0
    },
    visible: { 
        opacity: 1,
        transition: {
            duration: 0.3,
            ease: "easeOut" as const
        }
    },
    exit: {
        opacity: 0,
        transition: {
            duration: 0.2,
            ease: "easeIn" as const
        }
    }
};

export const modalContentVariants = {
    hidden: { 
        opacity: 0,
        scale: 0.8,
        y: -50
    },
    visible: { 
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring" as const,
            stiffness: 300,
            damping: 30,
            delay: 0.1
        }
    },
    exit: {
        opacity: 0,
        scale: 0.9,
        y: -20,
        transition: {
            duration: 0.2,
            ease: "easeIn" as const
        }
    }
};

// Alternatif varyantlar farklı modal tipleri için
export const modalContentVariantsSlide = {
    hidden: { 
        opacity: 0,
        x: 100,
        scale: 0.95
    },
    visible: { 
        opacity: 1,
        x: 0,
        scale: 1,
        transition: {
            type: "spring" as const,
            stiffness: 400,
            damping: 25,
            delay: 0.1
        }
    },
    exit: {
        opacity: 0,
        x: -50,
        scale: 0.95,
        transition: {
            duration: 0.15,
            ease: "easeIn" as const
        }
    }
};

export const modalContentVariantsFade = {
    hidden: { 
        opacity: 0,
        scale: 1,
        y: 20
    },
    visible: { 
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            duration: 0.3,
            ease: "easeOut" as const,
            delay: 0.1
        }
    },
    exit: {
        opacity: 0,
        scale: 1,
        y: 10,
        transition: {
            duration: 0.2,
            ease: "easeIn" as const
        }
    }
};

/**
 * Modal animasyon hook'u
 * @param open - Modal açık mı?
 * @returns isAnimating ve shouldRender state'leri
 */
export const useModalAnimation = (open: boolean) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (open) {
            setShouldRender(true);
            setTimeout(() => setIsAnimating(true), 10);
        } else {
            setIsAnimating(false);
            setTimeout(() => setShouldRender(false), 200);
        }
    }, [open]);

    return { isAnimating, shouldRender };
};

/**
 * Modal CSS classlarını oluşturur (CSS transition için)
 * @param isAnimating - Animasyon durumu
 * @param size - Modal boyutu
 * @param scrollable - Scroll edilebilir mi?
 * @returns overlay ve content CSS classları
 */
export const getModalClasses = (
    isAnimating: boolean,
    size: ModalSize = 'md',
    scrollable: boolean = false
) => {
    const overlayClasses = `modal-overlay ${
        isAnimating ? 'modal-overlay-enter' : 'modal-overlay-exit'
    }`;

    const contentClasses = `modal-content modal-${size} ${
        isAnimating ? 'modal-content-enter' : 'modal-content-exit'
    } ${scrollable ? 'modal-scrollable' : ''}`;

    return { overlayClasses, contentClasses };
};

/**
 * Framer Motion variant seçici
 * @param type - Animasyon tipi
 * @returns content variants
 */
export const getModalVariants = (type: 'default' | 'slide' | 'fade' = 'default') => {
    switch (type) {
        case 'slide':
            return modalContentVariantsSlide;
        case 'fade':
            return modalContentVariantsFade;
        default:
            return modalContentVariants;
    }
};

/**
 * Modal boyut sınıf adını döndürür
 * @param size - Modal boyutu
 * @returns CSS class name
 */
export const getModalSizeClass = (size: ModalSize) => {
    return `modal-${size}`;
};

/**
 * Modal açma/kapama işlemleri için yardımcı fonksiyon
 * @param onClose - Kapanma callback'i
 * @param delay - Kapanma gecikmesi (ms)
 */
export const createModalCloseHandler = (onClose: () => void, delay: number = 200) => {
    return () => {
        setTimeout(onClose, delay);
    };
};
