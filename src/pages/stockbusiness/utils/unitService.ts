import { unitData, Unit } from '../mocks/unitData';

// Utility functions for working with units
export class UnitService {
    
    /**
     * Get unit by ID
     * @param unitId - The ID of the unit
     * @returns Unit object or undefined if not found
     */
    static getUnitById(unitId: string): Unit | undefined {
        return unitData.find(unit => unit.id === unitId);
    }

    /**
     * Get unit name by ID
     * @param unitId - The ID of the unit
     * @returns Unit name or 'Bilinmeyen' if not found
     */
    static getUnitName(unitId: string): string {
        const unit = this.getUnitById(unitId);
        return unit ? unit.name : 'Bilinmeyen';
    }

    /**
     * Get unit symbol by ID
     * @param unitId - The ID of the unit
     * @returns Unit symbol or '' if not found
     */
    static getUnitSymbol(unitId: string): string {
        const unit = this.getUnitById(unitId);
        return unit ? unit.symbol : '';
    }

    /**
     * Get formatted unit display (name + symbol)
     * @param unitId - The ID of the unit
     * @returns Formatted string like "Kilogram (kg)" or 'Bilinmeyen' if not found
     */
    static getUnitDisplay(unitId: string): string {
        const unit = this.getUnitById(unitId);
        if (!unit) return 'Bilinmeyen';
        return `${unit.name} (${unit.symbol})`;
    }

    /**
     * Get units by category
     * @param category - The category to filter by
     * @returns Array of units in the specified category
     */
    static getUnitsByCategory(category: Unit['category']): Unit[] {
        return unitData.filter(unit => unit.category === category && unit.isActive);
    }

    /**
     * Get all active units
     * @returns Array of all active units
     */
    static getActiveUnits(): Unit[] {
        return unitData.filter(unit => unit.isActive);
    }

    /**
     * Convert quantity between units (if conversion factor is available)
     * @param quantity - The quantity to convert
     * @param fromUnitId - Source unit ID
     * @param toUnitId - Target unit ID
     * @returns Converted quantity or null if conversion not possible
     */
    static convertQuantity(quantity: number, fromUnitId: string, toUnitId: string): number | null {
        const fromUnit = this.getUnitById(fromUnitId);
        const toUnit = this.getUnitById(toUnitId);

        if (!fromUnit || !toUnit) return null;
        
        // Same unit, no conversion needed
        if (fromUnitId === toUnitId) return quantity;

        // Both units must have conversion factors and same category
        if (!fromUnit.conversionFactor || !toUnit.conversionFactor || fromUnit.category !== toUnit.category) {
            return null;
        }

        // Convert to base unit first, then to target unit
        const baseQuantity = quantity * fromUnit.conversionFactor;
        const convertedQuantity = baseQuantity / toUnit.conversionFactor;
        
        return Math.round(convertedQuantity * 100) / 100; // Round to 2 decimal places
    }
}

// Export individual functions for convenience
export const getUnitById = UnitService.getUnitById.bind(UnitService);
export const getUnitName = UnitService.getUnitName.bind(UnitService);
export const getUnitSymbol = UnitService.getUnitSymbol.bind(UnitService);
export const getUnitDisplay = UnitService.getUnitDisplay.bind(UnitService);
export const getUnitsByCategory = UnitService.getUnitsByCategory.bind(UnitService);
export const getActiveUnits = UnitService.getActiveUnits.bind(UnitService);
export const convertQuantity = UnitService.convertQuantity.bind(UnitService);