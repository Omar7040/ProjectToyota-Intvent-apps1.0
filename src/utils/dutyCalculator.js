/**
 * Import Duty Calculator
 * Calculates import duties for vehicles based on destination country
 */

/**
 * Round a number to two decimal places
 * @param {number} value - The value to round
 * @returns {number} - The value rounded to 2 decimal places
 */
function roundToTwoDecimals(value) {
  return Math.round(value * 100) / 100;
}

/**
 * Puerto Rico tax brackets for vehicle imports
 * Based on the taxable price of the vehicle
 */
const PUERTO_RICO_TAX_BRACKETS = [
  { min: 0, max: 6170, fixedRate: 637.50, percentRate: 0, baseExcess: 0 },
  { min: 6170, max: 10690, fixedRate: 637.50, percentRate: 10.2, baseExcess: 6170 },
  { min: 10690, max: 21380, fixedRate: 1098.00, percentRate: 19.6, baseExcess: 10690 },
  { min: 21380, max: 32070, fixedRate: 3193.08, percentRate: 30.0, baseExcess: 21380 },
  { min: 32070, max: 42760, fixedRate: 6400.08, percentRate: 40.0, baseExcess: 32070 },
  { min: 42760, max: 53450, fixedRate: 10676.08, percentRate: 50.0, baseExcess: 42760 },
  { min: 53450, max: 64140, fixedRate: 16021.08, percentRate: 60.0, baseExcess: 53450 },
  { min: 64140, max: Infinity, fixedRate: 22435.08, percentRate: 65.0, baseExcess: 64140 }
];

/**
 * Export duty rates for various countries
 * Rates are percentages of the vehicle value
 */
const COUNTRY_DUTY_RATES = {
  US: { name: 'United States', rate: 2.5, additionalFees: 0 },
  CA: { name: 'Canada', rate: 6.1, additionalFees: 100 },
  MX: { name: 'Mexico', rate: 15.0, additionalFees: 200 },
  DE: { name: 'Germany', rate: 10.0, additionalFees: 150 },
  JP: { name: 'Japan', rate: 0, additionalFees: 50 },
  CN: { name: 'China', rate: 25.0, additionalFees: 500 },
  BR: { name: 'Brazil', rate: 35.0, additionalFees: 300 },
  UK: { name: 'United Kingdom', rate: 10.0, additionalFees: 180 },
  AU: { name: 'Australia', rate: 5.0, additionalFees: 75 },
  FR: { name: 'France', rate: 10.0, additionalFees: 150 },
  IT: { name: 'Italy', rate: 10.0, additionalFees: 150 },
  KR: { name: 'South Korea', rate: 8.0, additionalFees: 100 },
  IN: { name: 'India', rate: 60.0, additionalFees: 400 },
  RU: { name: 'Russia', rate: 23.0, additionalFees: 250 },
  ES: { name: 'Spain', rate: 10.0, additionalFees: 150 },
  DO: { name: 'Dominican Republic', rate: 20.0, additionalFees: 175 },
  CO: { name: 'Colombia', rate: 35.0, additionalFees: 200 },
  CL: { name: 'Chile', rate: 6.0, additionalFees: 100 },
  AR: { name: 'Argentina', rate: 35.0, additionalFees: 350 },
  PE: { name: 'Peru', rate: 9.0, additionalFees: 120 }
};

/**
 * Calculate import duty for Puerto Rico
 * @param {number} vehiclePrice - The taxable price of the vehicle in USD
 * @returns {object} - Calculation result with breakdown
 */
export function calculatePuertoRicoDuty(vehiclePrice) {
  if (typeof vehiclePrice !== 'number' || vehiclePrice < 0) {
    return {
      success: false,
      error: 'Invalid vehicle price. Please provide a positive number.',
      totalDuty: 0,
      breakdown: null
    };
  }

  // Find the applicable tax bracket
  const bracket = PUERTO_RICO_TAX_BRACKETS.find(
    b => vehiclePrice >= b.min && vehiclePrice < b.max
  ) || PUERTO_RICO_TAX_BRACKETS[PUERTO_RICO_TAX_BRACKETS.length - 1];

  // Calculate the excess amount over the base
  const excessAmount = Math.max(0, vehiclePrice - bracket.baseExcess);
  
  // Calculate additional tax based on percentage of excess
  const percentageTax = (excessAmount * bracket.percentRate) / 100;
  
  // Total duty is fixed rate plus percentage tax
  const totalDuty = bracket.fixedRate + percentageTax;

  return {
    success: true,
    error: null,
    vehiclePrice,
    totalDuty: roundToTwoDecimals(totalDuty),
    breakdown: {
      bracket: {
        min: bracket.min,
        max: bracket.max === Infinity ? 'No limit' : bracket.max,
        fixedRate: bracket.fixedRate,
        percentRate: bracket.percentRate
      },
      fixedTax: bracket.fixedRate,
      excessAmount: roundToTwoDecimals(excessAmount),
      percentageTax: roundToTwoDecimals(percentageTax)
    },
    currency: 'USD',
    destination: 'Puerto Rico',
    suriPortalUrl: 'https://suri.hacienda.pr.gov/'
  };
}

/**
 * Calculate export duty for a specific country
 * @param {number} vehiclePrice - The value of the vehicle in USD
 * @param {string} countryCode - The ISO 2-letter country code
 * @returns {object} - Calculation result with breakdown
 */
export function calculateExportDuty(vehiclePrice, countryCode) {
  if (typeof vehiclePrice !== 'number' || vehiclePrice < 0) {
    return {
      success: false,
      error: 'Invalid vehicle price. Please provide a positive number.',
      totalDuty: 0,
      breakdown: null
    };
  }

  const country = COUNTRY_DUTY_RATES[countryCode.toUpperCase()];
  
  if (!country) {
    return {
      success: false,
      error: `Country code "${countryCode}" is not supported. Please select a valid country.`,
      totalDuty: 0,
      breakdown: null
    };
  }

  const dutyAmount = (vehiclePrice * country.rate) / 100;
  const totalDuty = dutyAmount + country.additionalFees;

  return {
    success: true,
    error: null,
    vehiclePrice,
    totalDuty: roundToTwoDecimals(totalDuty),
    breakdown: {
      countryName: country.name,
      dutyRate: country.rate,
      dutyAmount: roundToTwoDecimals(dutyAmount),
      additionalFees: country.additionalFees
    },
    currency: 'USD',
    destination: country.name
  };
}

/**
 * Get list of supported countries for export duty calculation
 * @returns {Array} - Array of country objects with code and name
 */
export function getSupportedCountries() {
  return Object.entries(COUNTRY_DUTY_RATES).map(([code, data]) => ({
    code,
    name: data.name,
    rate: data.rate
  })).sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get Puerto Rico tax brackets information
 * @returns {Array} - Array of tax bracket objects
 */
export function getPuertoRicoTaxBrackets() {
  return PUERTO_RICO_TAX_BRACKETS.map(bracket => ({
    priceRange: bracket.max === Infinity 
      ? `$${bracket.min.toLocaleString()}+` 
      : `$${bracket.min.toLocaleString()} - $${bracket.max.toLocaleString()}`,
    fixedRate: `$${bracket.fixedRate.toLocaleString()}`,
    percentRate: `${bracket.percentRate}%`,
    baseExcess: bracket.baseExcess
  }));
}

export default {
  calculatePuertoRicoDuty,
  calculateExportDuty,
  getSupportedCountries,
  getPuertoRicoTaxBrackets
};
