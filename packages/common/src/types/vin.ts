/**
 * VIN (Vehicle Identification Number) Types and Utilities
 * 
 * VINs are 17-character strings that uniquely identify vehicles.
 * They follow a specific structure defined by ISO 3779 and 3780.
 */

/**
 * Result of VIN validation
 */
export interface VinValidationResult {
  isValid: boolean;
  error?: string;
  normalizedVin?: string;
}

/**
 * Decoded VIN information
 */
export interface VinDecodedInfo {
  vin: string;
  worldManufacturerIdentifier: string; // Characters 1-3
  vehicleDescriptorSection: string;    // Characters 4-8
  checkDigit: string;                   // Character 9
  modelYear: string;                    // Character 10
  plantCode: string;                    // Character 11
  sequentialNumber: string;             // Characters 12-17
  decodedYear?: number;
  isNorthAmerican: boolean;
}

/**
 * VIN lookup request
 */
export interface VinLookupRequest {
  vin: string;
}

/**
 * VIN lookup response
 */
export interface VinLookupResult {
  found: boolean;
  vehicle?: {
    id: string;
    vin: string;
    make: string;
    model: string;
    year: number;
    color: string;
    condition: string;
    status: string;
    price: number;
    mileage: number;
    fuelType: string;
    transmission: string;
    location: string;
  };
  decoded?: VinDecodedInfo;
}

// Characters that are not allowed in VINs (I, O, Q)
const INVALID_VIN_CHARS = /[IOQ]/i;

// VIN character transliteration values for check digit calculation
const VIN_TRANSLITERATION: Record<string, number> = {
  'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
  'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9,
  'S': 2, 'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9,
  '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
};

// Position weights for check digit calculation
const VIN_POSITION_WEIGHTS = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

// Model year characters (starting from 1980)
const MODEL_YEAR_CHARS: Record<string, number> = {
  'A': 1980, 'B': 1981, 'C': 1982, 'D': 1983, 'E': 1984, 'F': 1985,
  'G': 1986, 'H': 1987, 'J': 1988, 'K': 1989, 'L': 1990, 'M': 1991,
  'N': 1992, 'P': 1993, 'R': 1994, 'S': 1995, 'T': 1996, 'V': 1997,
  'W': 1998, 'X': 1999, 'Y': 2000, '1': 2001, '2': 2002, '3': 2003,
  '4': 2004, '5': 2005, '6': 2006, '7': 2007, '8': 2008, '9': 2009,
  'A2': 2010, 'B2': 2011, 'C2': 2012, 'D2': 2013, 'E2': 2014, 'F2': 2015,
  'G2': 2016, 'H2': 2017, 'J2': 2018, 'K2': 2019, 'L2': 2020, 'M2': 2021,
  'N2': 2022, 'P2': 2023, 'R2': 2024, 'S2': 2025, 'T2': 2026
};

/**
 * Normalizes a VIN by removing invalid characters and converting to uppercase
 */
export function normalizeVin(vin: string): string {
  return vin
    .toUpperCase()
    .replace(/[^A-HJ-NPR-Z0-9]/g, ''); // Remove any invalid characters including I, O, Q
}

/**
 * Validates a VIN according to ISO 3779 and 3780 standards
 */
export function validateVin(vin: string): VinValidationResult {
  if (!vin) {
    return { isValid: false, error: 'VIN is required' };
  }

  const normalizedVin = normalizeVin(vin);

  // Check length
  if (normalizedVin.length !== 17) {
    return { 
      isValid: false, 
      error: `VIN must be exactly 17 characters (got ${normalizedVin.length})`,
      normalizedVin 
    };
  }

  // Check for invalid characters (I, O, Q)
  if (INVALID_VIN_CHARS.test(vin)) {
    return { 
      isValid: false, 
      error: 'VIN cannot contain letters I, O, or Q',
      normalizedVin 
    };
  }

  // Validate check digit (position 9) for North American vehicles
  if (!validateCheckDigit(normalizedVin)) {
    return { 
      isValid: false, 
      error: 'Invalid VIN check digit',
      normalizedVin 
    };
  }

  return { isValid: true, normalizedVin };
}

/**
 * Validates the check digit (9th character) of a VIN
 * This is mandatory for North American vehicles
 */
function validateCheckDigit(vin: string): boolean {
  let sum = 0;
  
  for (let i = 0; i < 17; i++) {
    const char = vin[i];
    const value = VIN_TRANSLITERATION[char];
    
    if (value === undefined) {
      return false;
    }
    
    sum += value * VIN_POSITION_WEIGHTS[i];
  }
  
  const remainder = sum % 11;
  const checkDigit = remainder === 10 ? 'X' : String(remainder);
  
  return vin[8] === checkDigit;
}

/**
 * Decodes a VIN to extract information about the vehicle
 */
export function decodeVin(vin: string): VinDecodedInfo | null {
  const validation = validateVin(vin);
  if (!validation.isValid || !validation.normalizedVin) {
    return null;
  }

  const normalizedVin = validation.normalizedVin;
  const yearChar = normalizedVin[9];
  
  // Determine model year - need to consider the cycle repeats every 30 years
  let decodedYear: number | undefined;
  const currentYear = new Date().getFullYear();
  
  // First try the recent cycle (2010+)
  const recentKey = `${yearChar}2`;
  if (MODEL_YEAR_CHARS[recentKey] && MODEL_YEAR_CHARS[recentKey] <= currentYear + 1) {
    decodedYear = MODEL_YEAR_CHARS[recentKey];
  } else if (MODEL_YEAR_CHARS[yearChar]) {
    // Fall back to older cycle
    decodedYear = MODEL_YEAR_CHARS[yearChar];
  }

  // Check if it's a North American VIN (starts with 1, 4, 5 for USA, 2 for Canada, 3 for Mexico)
  const isNorthAmerican = ['1', '2', '3', '4', '5'].includes(normalizedVin[0]);

  return {
    vin: normalizedVin,
    worldManufacturerIdentifier: normalizedVin.substring(0, 3),
    vehicleDescriptorSection: normalizedVin.substring(3, 8),
    checkDigit: normalizedVin[8],
    modelYear: yearChar,
    plantCode: normalizedVin[10],
    sequentialNumber: normalizedVin.substring(11, 17),
    decodedYear,
    isNorthAmerican
  };
}

/**
 * Formats a VIN for display (adds spaces for readability)
 */
export function formatVinForDisplay(vin: string): string {
  const normalized = normalizeVin(vin);
  if (normalized.length !== 17) {
    return normalized;
  }
  // Format: WMI-VDS-Check-VIS (3-5-1-8)
  return `${normalized.substring(0, 3)}-${normalized.substring(3, 8)}-${normalized[8]}-${normalized.substring(9, 17)}`;
}
