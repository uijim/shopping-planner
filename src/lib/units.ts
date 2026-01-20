export type BaseUnit = "g" | "ml" | "unit";

export type MeasurementSystem = "metric" | "imperial";

interface UnitDefinition {
  name: string;
  abbreviation: string;
  baseUnit: BaseUnit;
  conversionFactor: number; // multiply by this to get base unit
}

// Built-in unit definitions
export const BUILT_IN_UNITS: Record<string, UnitDefinition> = {
  // Weight units (base: grams)
  g: { name: "gram", abbreviation: "g", baseUnit: "g", conversionFactor: 1 },
  kg: {
    name: "kilogram",
    abbreviation: "kg",
    baseUnit: "g",
    conversionFactor: 1000,
  },
  oz: { name: "ounce", abbreviation: "oz", baseUnit: "g", conversionFactor: 28.35 },
  lb: { name: "pound", abbreviation: "lb", baseUnit: "g", conversionFactor: 453.59 },

  // Volume units (base: milliliters)
  ml: {
    name: "milliliter",
    abbreviation: "ml",
    baseUnit: "ml",
    conversionFactor: 1,
  },
  l: { name: "liter", abbreviation: "l", baseUnit: "ml", conversionFactor: 1000 },
  tsp: {
    name: "teaspoon",
    abbreviation: "tsp",
    baseUnit: "ml",
    conversionFactor: 4.93,
  },
  tbsp: {
    name: "tablespoon",
    abbreviation: "tbsp",
    baseUnit: "ml",
    conversionFactor: 14.79,
  },
  cup: { name: "cup", abbreviation: "cup", baseUnit: "ml", conversionFactor: 236.59 },
  floz: {
    name: "fluid ounce",
    abbreviation: "fl oz",
    baseUnit: "ml",
    conversionFactor: 29.57,
  },

  // Count units (base: unit)
  unit: { name: "unit", abbreviation: "unit", baseUnit: "unit", conversionFactor: 1 },
  piece: { name: "piece", abbreviation: "pc", baseUnit: "unit", conversionFactor: 1 },
  whole: { name: "whole", abbreviation: "whole", baseUnit: "unit", conversionFactor: 1 },
  clove: { name: "clove", abbreviation: "clove", baseUnit: "unit", conversionFactor: 1 },
  bunch: { name: "bunch", abbreviation: "bunch", baseUnit: "unit", conversionFactor: 1 },
};

/**
 * Convert a quantity from a given unit to its base unit
 */
export function toBaseUnit(
  quantity: number,
  unitAbbreviation: string,
  customUnits?: Record<string, UnitDefinition>
): { baseQuantity: number; baseUnit: BaseUnit } {
  const unit =
    customUnits?.[unitAbbreviation] ?? BUILT_IN_UNITS[unitAbbreviation];

  if (!unit) {
    // Default to count if unit not found
    return { baseQuantity: quantity, baseUnit: "unit" };
  }

  return {
    baseQuantity: quantity * unit.conversionFactor,
    baseUnit: unit.baseUnit,
  };
}

/**
 * Convert a base quantity to a target unit
 */
export function fromBaseUnit(
  baseQuantity: number,
  baseUnit: BaseUnit,
  targetUnitAbbreviation: string,
  customUnits?: Record<string, UnitDefinition>
): number {
  const targetUnit =
    customUnits?.[targetUnitAbbreviation] ??
    BUILT_IN_UNITS[targetUnitAbbreviation];

  if (!targetUnit || targetUnit.baseUnit !== baseUnit) {
    return baseQuantity;
  }

  return baseQuantity / targetUnit.conversionFactor;
}

/**
 * Select an appropriate display unit based on quantity and user's measurement system
 */
export function selectDisplayUnit(
  baseQuantity: number,
  baseUnit: BaseUnit,
  measurementSystem: MeasurementSystem = "metric"
): { displayQuantity: number; displayUnit: string } {
  if (baseUnit === "unit") {
    return { displayQuantity: baseQuantity, displayUnit: "unit" };
  }

  if (baseUnit === "g") {
    if (measurementSystem === "imperial") {
      // Use pounds for larger quantities, ounces for smaller
      if (baseQuantity >= 453.59) {
        return {
          displayQuantity: baseQuantity / 453.59,
          displayUnit: "lb",
        };
      }
      return {
        displayQuantity: baseQuantity / 28.35,
        displayUnit: "oz",
      };
    }
    // Metric: use kg for larger quantities
    if (baseQuantity >= 1000) {
      return {
        displayQuantity: baseQuantity / 1000,
        displayUnit: "kg",
      };
    }
    return { displayQuantity: baseQuantity, displayUnit: "g" };
  }

  if (baseUnit === "ml") {
    if (measurementSystem === "imperial") {
      // Use cups for larger quantities, fl oz for medium, tbsp for small
      if (baseQuantity >= 236.59) {
        return {
          displayQuantity: baseQuantity / 236.59,
          displayUnit: "cup",
        };
      }
      if (baseQuantity >= 29.57) {
        return {
          displayQuantity: baseQuantity / 29.57,
          displayUnit: "fl oz",
        };
      }
      if (baseQuantity >= 14.79) {
        return {
          displayQuantity: baseQuantity / 14.79,
          displayUnit: "tbsp",
        };
      }
      return {
        displayQuantity: baseQuantity / 4.93,
        displayUnit: "tsp",
      };
    }
    // Metric: use liters for larger quantities
    if (baseQuantity >= 1000) {
      return {
        displayQuantity: baseQuantity / 1000,
        displayUnit: "l",
      };
    }
    return { displayQuantity: baseQuantity, displayUnit: "ml" };
  }

  return { displayQuantity: baseQuantity, displayUnit: baseUnit };
}

/**
 * Round a quantity to a reasonable display precision
 */
export function roundQuantity(quantity: number): number {
  if (quantity >= 100) {
    return Math.round(quantity);
  }
  if (quantity >= 10) {
    return Math.round(quantity * 10) / 10;
  }
  return Math.round(quantity * 100) / 100;
}

/**
 * Format a quantity with its unit for display
 */
export function formatQuantity(quantity: number, unit: string): string {
  const rounded = roundQuantity(quantity);
  const unitDef = BUILT_IN_UNITS[unit];
  const displayAbbreviation = unitDef?.abbreviation ?? unit;
  return `${rounded} ${displayAbbreviation}`;
}
