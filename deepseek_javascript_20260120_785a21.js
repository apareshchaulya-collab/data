/**
 * BOLT WEIGHT CALCULATOR - ASME, DIN, ISO STANDARDS
 * This calculator provides weight estimation for various bolt types
 */

// =============================================
// 1. CONSTANTS AND CONVERSIONS
// =============================================

const DENSITY = {
  STEEL: 7.85, // g/cm³ (7850 kg/m³)
  STAINLESS_STEEL: 7.93, // g/cm³
  ALUMINIUM: 2.70, // g/cm³
  BRASS: 8.50, // g/cm³
};

const UNITS = {
  KG: 'kg',
  G: 'g',
  LB: 'lb',
  OZ: 'oz'
};

// =============================================
// 2. BOLT DIMENSION DATABASES
// =============================================

const BOLT_DATABASE = {
  // ISO/DIN Metric Bolts (ISO 4014, ISO 4017, DIN 931, DIN 933)
  METRIC: {
    M3: { diameter: 3, headHeight: 2.0, headDiameter: 5.5, threadPitch: 0.5 },
    M4: { diameter: 4, headHeight: 2.8, headDiameter: 7.0, threadPitch: 0.7 },
    M5: { diameter: 5, headHeight: 3.5, headDiameter: 8.0, threadPitch: 0.8 },
    M6: { diameter: 6, headHeight: 4.0, headDiameter: 10.0, threadPitch: 1.0 },
    M8: { diameter: 8, headHeight: 5.3, headDiameter: 13.0, threadPitch: 1.25 },
    M10: { diameter: 10, headHeight: 6.4, headDiameter: 17.0, threadPitch: 1.5 },
    M12: { diameter: 12, headHeight: 7.5, headDiameter: 19.0, threadPitch: 1.75 },
    M16: { diameter: 16, headHeight: 10.0, headDiameter: 24.0, threadPitch: 2.0 },
    M20: { diameter: 20, headHeight: 12.5, headDiameter: 30.0, threadPitch: 2.5 },
    M24: { diameter: 24, headHeight: 15.0, headDiameter: 36.0, threadPitch: 3.0 },
  },
  
  // ASME/ANSI Inch Bolts (ASME B18.2.1)
  ASME: {
    '1/4': { diameter: 0.25, headHeight: 0.162, headDiameter: 0.438, threadPitch: 20 }, // TPI
    '5/16': { diameter: 0.3125, headHeight: 0.203, headDiameter: 0.562, threadPitch: 18 },
    '3/8': { diameter: 0.375, headHeight: 0.244, headDiameter: 0.688, threadPitch: 16 },
    '1/2': { diameter: 0.5, headHeight: 0.325, headDiameter: 0.875, threadPitch: 13 },
    '5/8': { diameter: 0.625, headHeight: 0.406, headDiameter: 1.062, threadPitch: 11 },
    '3/4': { diameter: 0.75, headHeight: 0.487, headDiameter: 1.250, threadPitch: 10 },
    '7/8': { diameter: 0.875, headHeight: 0.568, headDiameter: 1.438, threadPitch: 9 },
    '1': { diameter: 1.0, headHeight: 0.650, headDiameter: 1.625, threadPitch: 8 },
  },
  
  // DIN 603 Carriage Bolts
  DIN_CARRIAGE: {
    M6: { diameter: 6, headHeight: 4.0, headDiameter: 11.5 },
    M8: { diameter: 8, headHeight: 5.0, headDiameter: 15.0 },
    M10: { diameter: 10, headHeight: 6.0, headDiameter: 18.0 },
    M12: { diameter: 12, headHeight: 7.0, headDiameter: 22.0 },
  }
};

// =============================================
// 3. BOLT WEIGHT CALCULATION FUNCTIONS
// =============================================

class BoltWeightCalculator {
  constructor() {
    this.standard = 'ISO';
    this.material = 'STEEL';
  }
  
  /**
   * Calculate bolt weight using geometric approximation
   * @param {string} size - Bolt size (e.g., 'M10', '1/2')
   * @param {number} length - Length in mm or inches
   * @param {string} standard - 'ISO', 'ASME', or 'DIN'
   * @param {string} material - Material type
   * @returns {Object} Weight in different units
   */
  calculateBoltWeight(size, length, standard = 'ISO', material = 'STEEL') {
    // Get bolt dimensions from database
    const dimensions = this.getBoltDimensions(size, standard);
    if (!dimensions) {
      throw new Error(`Bolt size ${size} not found for standard ${standard}`);
    }
    
    const density = DENSITY[material.toUpperCase()] || DENSITY.STEEL;
    
    let weightGrams;
    
    if (standard === 'ASME') {
      // ASME - Inch calculations
      weightGrams = this.calculateInchBoltWeight(
        dimensions.diameter,
        dimensions.headDiameter,
        dimensions.headHeight,
        length,
        density
      );
    } else {
      // ISO/DIN - Metric calculations
      weightGrams = this.calculateMetricBoltWeight(
        dimensions.diameter,
        dimensions.headDiameter,
        dimensions.headHeight,
        length,
        density,
        dimensions.threadPitch
      );
    }
    
    return this.convertWeight(weightGrams);
  }
  
  /**
   * Calculate metric bolt weight
   */
  calculateMetricBoltWeight(diameter, headDiameter, headHeight, length, density, pitch = 1) {
    // All dimensions in mm
    
    // 1. Shank volume (cylinder)
    const shankVolume = (Math.PI * Math.pow(diameter / 2, 2) * length) / 1000; // cm³
    
    // 2. Head volume (hexagon approximated as cylinder)
    const headVolume = (Math.PI * Math.pow(headDiameter / 2, 2) * headHeight) / 1000; // cm³
    
    // 3. Thread volume reduction (simplified)
    const threadDepth = pitch * 0.6134; // Thread depth for metric threads
    const effectiveDiameter = diameter - (threadDepth * 2);
    const threadReduction = (Math.PI * Math.pow(diameter / 2, 2) - Math.PI * Math.pow(effectiveDiameter / 2, 2)) * length / 1000;
    
    // Total volume in cm³
    const totalVolume = shankVolume + headVolume - threadReduction;
    
    // Weight in grams
    return totalVolume * density;
  }
  
  /**
   * Calculate inch bolt weight
   */
  calculateInchBoltWeight(diameter, headDiameter, headHeight, length, density) {
    // Convert inches to mm for calculation
    const inchToMm = 25.4;
    
    const d_mm = diameter * inchToMm;
    const hd_mm = headDiameter * inchToMm;
    const hh_mm = headHeight * inchToMm;
    const l_mm = length * inchToMm;
    
    // Use metric calculation with converted values
    return this.calculateMetricBoltWeight(d_mm, hd_mm, hh_mm, l_mm, density);
  }
  
  /**
   * Get bolt dimensions from database
   */
  getBoltDimensions(size, standard) {
    const db = BOLT_DATABASE[standard === 'ASME' ? 'ASME' : 'METRIC'];
    return db[size.toUpperCase()] || db[size];
  }
  
  /**
   * Convert weight to different units
   */
  convertWeight(weightGrams) {
    return {
      [UNITS.G]: weightGrams,
      [UNITS.KG]: weightGrams / 1000,
      [UNITS.LB]: weightGrams / 453.592,
      [UNITS.OZ]: weightGrams / 28.3495
    };
  }
  
  /**
   * Calculate weight for multiple bolts
   */
  calculateBatch(bolts, standard = 'ISO', material = 'STEEL') {
    return bolts.map(bolt => ({
      ...bolt,
      weight: this.calculateBoltWeight(bolt.size, bolt.length, standard, material)
    }));
  }
  
  /**
   * Standard bolt weight tables (pre-calculated approximations)
   */
  static getStandardWeights(standard = 'ISO') {
    const tables = {
      ISO: {
        M6: { '20': 12, '30': 18, '40': 24, '50': 30, '60': 36 }, // length in mm, weight in grams
        M8: { '20': 24, '30': 32, '40': 40, '50': 48, '60': 56 },
        M10: { '20': 42, '30': 55, '40': 68, '50': 81, '60': 94 },
        M12: { '20': 70, '30': 90, '40': 110, '50': 130, '60': 150 },
        M16: { '30': 210, '40': 260, '50': 310, '60': 360, '80': 460 },
      },
      ASME: {
        '1/4': { '1': 8, '1.5': 11, '2': 14, '2.5': 17, '3': 20 }, // length in inches, weight in ounces
        '3/8': { '1': 18, '1.5': 24, '2': 30, '2.5': 36, '3': 42 },
        '1/2': { '1': 40, '1.5': 55, '2': 70, '2.5': 85, '3': 100 },
      }
    };
    
    return tables[standard] || tables.ISO;
  }
}

// =============================================
// 4. SPECIALIZED CALCULATORS FOR DIFFERENT STANDARDS
// =============================================

class ASMEBoltCalculator extends BoltWeightCalculator {
  constructor() {
    super();
    this.standard = 'ASME';
  }
  
  /**
   * Calculate weight according to ASME B18.2.1
   */
  calculateWeight(size, lengthInInches, material = 'STEEL') {
    return this.calculateBoltWeight(size, lengthInInches, 'ASME', material);
  }
  
  /**
   * Get nut weight (ASME B18.2.2)
   */
  calculateNutWeight(size, material = 'STEEL') {
    const nutWeights = {
      '1/4': 1.5, // ounces
      '5/16': 2.8,
      '3/8': 5.0,
      '1/2': 11.0,
      '5/8': 19.0,
      '3/4': 31.0,
      '7/8': 50.0,
      '1': 75.0
    };
    
    const weightOz = nutWeights[size] || 0;
    const densityFactor = material === 'STEEL' ? 1 : 
                         material === 'STAINLESS_STEEL' ? 1.01 : 
                         material === 'ALUMINIUM' ? 0.34 : 1.08;
    
    return {
      oz: weightOz * densityFactor,
      g: weightOz * densityFactor * 28.3495,
      kg: weightOz * densityFactor * 0.0283495,
      lb: weightOz * densityFactor * 0.0625
    };
  }
}

class ISOBoltCalculator extends BoltWeightCalculator {
  constructor() {
    super();
    this.standard = 'ISO';
  }
  
  /**
   * Calculate weight according to ISO 4014/4017
   */
  calculateWeight(size, lengthInMM, material = 'STEEL', grade = '8.8') {
    const baseWeight = this.calculateBoltWeight(size, lengthInMM, 'ISO', material);
    
    // Adjust for grade (higher grade = slightly more material)
    const gradeFactors = {
      '4.6': 0.98,
      '5.8': 0.99,
      '8.8': 1.00,
      '10.9': 1.01,
      '12.9': 1.02
    };
    
    const factor = gradeFactors[grade] || 1.00;
    
    return Object.keys(baseWeight).reduce((acc, unit) => {
      acc[unit] = baseWeight[unit] * factor;
      return acc;
    }, {});
  }
}

class DINBoltCalculator extends BoltWeightCalculator {
  constructor() {
    super();
    this.standard = 'DIN';
  }
  
  /**
   * Calculate weight for specific DIN bolt types
   */
  calculateDIN931(size, lengthInMM, material = 'STEEL') {
    // DIN 931 - Hexagon head bolts with thread to head
    return this.calculateBoltWeight(size, lengthInMM, 'ISO', material);
  }
  
  calculateDIN933(size, lengthInMM, material = 'STEEL') {
    // DIN 933 - Hexagon head bolts with full thread
    // Full thread bolts are slightly heavier due to thread running to head
    const baseWeight = this.calculateBoltWeight(size, lengthInMM, 'ISO', material);
    
    // Add 2-3% for full thread
    return Object.keys(baseWeight).reduce((acc, unit) => {
      acc[unit] = baseWeight[unit] * 1.025;
      return acc;
    }, {});
  }
}

// =============================================
// 5. UTILITY FUNCTIONS
// =============================================

const BoltUtils = {
  /**
   * Convert between units
   */
  convertUnits(value, fromUnit, toUnit) {
    const conversions = {
      'mm-to-in': 0.0393701,
      'in-to-mm': 25.4,
      'g-to-oz': 0.035274,
      'oz-to-g': 28.3495,
      'kg-to-lb': 2.20462,
      'lb-to-kg': 0.453592
    };
    
    const key = `${fromUnit}-to-${toUnit}`;
    return conversions[key] ? value * conversions[key] : value;
  },
  
  /**
   * Validate bolt specifications
   */
  validateBoltSpec(size, length, standard) {
    const errors = [];
    
    if (standard === 'ISO' || standard === 'DIN') {
      if (!size.match(/^M\d+/)) {
        errors.push('Metric bolts should start with M (e.g., M10)');
      }
      if (length < 10 || length > 500) {
        errors.push('Length should be between 10-500 mm for metric bolts');
      }
    } else if (standard === 'ASME') {
      const validSizes = ['1/4', '5/16', '3/8', '1/2', '5/8', '3/4', '7/8', '1'];
      if (!validSizes.includes(size)) {
        errors.push(`ASME size should be one of: ${validSizes.join(', ')}`);
      }
      if (length < 0.5 || length > 12) {
        errors.push('Length should be between 0.5-12 inches for ASME bolts');
      }
    }
    
    return errors;
  },
  
  /**
   * Calculate total weight for a project
   */
  calculateProjectWeight(items) {
    return items.reduce((total, item) => {
      const weight = item.weight?.kg || 0;
      return total + (weight * item.quantity);
    }, 0);
  }
};

// =============================================
// 6. EXPORT AND USAGE EXAMPLES
// =============================================

// Example usage:
const exampleUsage = () => {
  console.log('=== BOLT WEIGHT CALCULATOR EXAMPLES ===\n');
  
  // Create calculators
  const isoCalculator = new ISOBoltCalculator();
  const asmeCalculator = new ASMEBoltCalculator();
  const dinCalculator = new DINBoltCalculator();
  
  // Example 1: ISO M10 bolt, 50mm length, steel
  console.log('1. ISO M10x50 Bolt (Steel):');
  const isoWeight = isoCalculator.calculateWeight('M10', 50, 'STEEL', '8.8');
  console.log(`   ${isoWeight.kg.toFixed(4)} kg / ${isoWeight.lb.toFixed(4)} lb\n`);
  
  // Example 2: ASME 1/2" bolt, 3" length
  console.log('2. ASME 1/2"x3" Bolt (Steel):');
  const asmeWeight = asmeCalculator.calculateWeight('1/2', 3, 'STEEL');
  console.log(`   ${asmeWeight.lb.toFixed(4)} lb / ${asmeWeight.kg.toFixed(4)} kg\n`);
  
  // Example 3: DIN 933 full thread bolt
  console.log('3. DIN 933 M12x60 Bolt (Stainless Steel):');
  const dinWeight = dinCalculator.calculateDIN933('M12', 60, 'STAINLESS_STEEL');
  console.log(`   ${dinWeight.kg.toFixed(4)} kg / ${dinWeight.g.toFixed(1)} g\n`);
  
  // Example 4: Batch calculation
  console.log('4. Batch Calculation for ISO Bolts:');
  const batch = [
    { size: 'M6', length: 30, quantity: 100 },
    { size: 'M8', length: 40, quantity: 50 },
    { size: 'M10', length: 50, quantity: 25 }
  ];
  
  const calculator = new BoltWeightCalculator();
  const batchResults = calculator.calculateBatch(batch, 'ISO', 'STEEL');
  
  batchResults.forEach(result => {
    console.log(`   ${result.size}x${result.length}: ${result.weight.g.toFixed(1)}g each`);
  });
  
  const totalWeight = BoltUtils.calculateProjectWeight(batchResults);
  console.log(`   Total: ${totalWeight.toFixed(3)} kg\n`);
  
  // Example 5: Unit conversion
  console.log('5. Unit Conversion:');
  const mmToInches = BoltUtils.convertUnits(100, 'mm', 'in');
  console.log(`   100 mm = ${mmToInches.toFixed(2)} inches`);
};

// Uncomment to run examples
// exampleUsage();

// Export for use in browsers or Node.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BoltWeightCalculator,
    ASMEBoltCalculator,
    ISOBoltCalculator,
    DINBoltCalculator,
    BoltUtils,
    DENSITY,
    UNITS,
    BOLT_DATABASE
  };
} else {
  // Browser global
  window.BoltWeightCalculator = BoltWeightCalculator;
  window.ASMEBoltCalculator = ASMEBoltCalculator;
  window.ISOBoltCalculator = ISOBoltCalculator;
  window.DINBoltCalculator = DINBoltCalculator;
  window.BoltUtils = BoltUtils;
}