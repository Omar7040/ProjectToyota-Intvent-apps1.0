/**
 * VIN (Vehicle Identification Number) Validator
 * Validates the standard 17-character VIN format
 */

/**
 * Validates if a VIN follows the standard 17-character format
 * @param {string} vin - The Vehicle Identification Number to validate
 * @returns {object} - { isValid: boolean, error: string | null }
 */
export function validateVIN(vin) {
  if (!vin) {
    return { isValid: false, error: 'VIN is required' };
  }

  const cleanVIN = vin.toUpperCase().trim();

  // Check length
  if (cleanVIN.length !== 17) {
    return { 
      isValid: false, 
      error: `VIN must be exactly 17 characters. Current length: ${cleanVIN.length}` 
    };
  }

  // VIN cannot contain I, O, or Q (to avoid confusion with 1 and 0)
  if (/[IOQ]/i.test(cleanVIN)) {
    return { 
      isValid: false, 
      error: 'VIN cannot contain letters I, O, or Q' 
    };
  }

  // VIN must only contain alphanumeric characters
  if (!/^[A-HJ-NPR-Z0-9]{17}$/i.test(cleanVIN)) {
    return { 
      isValid: false, 
      error: 'VIN must contain only valid alphanumeric characters (A-H, J-N, P-R, S-Z, 0-9)' 
    };
  }

  // Check digit validation (position 9)
  const transliteration = {
    'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6, 'G': 7, 'H': 8,
    'J': 1, 'K': 2, 'L': 3, 'M': 4, 'N': 5, 'P': 7, 'R': 9,
    'S': 2, 'T': 3, 'U': 4, 'V': 5, 'W': 6, 'X': 7, 'Y': 8, 'Z': 9
  };

  const weights = [8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 17; i++) {
    const char = cleanVIN[i];
    let value;
    
    if (/[0-9]/.test(char)) {
      value = parseInt(char, 10);
    } else {
      value = transliteration[char];
    }
    
    sum += value * weights[i];
  }

  const checkDigit = sum % 11;
  const expectedCheckChar = checkDigit === 10 ? 'X' : checkDigit.toString();
  const actualCheckChar = cleanVIN[8];

  if (actualCheckChar !== expectedCheckChar) {
    return {
      isValid: false,
      error: 'VIN check digit is invalid'
    };
  }

  return { isValid: true, error: null };
}

/**
 * Extracts basic information from a VIN
 * @param {string} vin - The Vehicle Identification Number
 * @returns {object} - Basic information derived from the VIN
 */
export function parseVIN(vin) {
  if (!vin || vin.length !== 17) {
    return null;
  }

  const cleanVIN = vin.toUpperCase().trim();

  // World Manufacturer Identifier (first 3 characters)
  const wmi = cleanVIN.substring(0, 3);
  
  // Vehicle Descriptor Section (characters 4-9)
  const vds = cleanVIN.substring(3, 9);
  
  // Vehicle Identifier Section (characters 10-17)
  const vis = cleanVIN.substring(9, 17);
  
  // Model year (character 10)
  const modelYearChar = cleanVIN[9];
  const modelYear = getModelYear(modelYearChar);

  return {
    wmi,
    vds,
    vis,
    modelYear,
    plantCode: cleanVIN[10],
    sequentialNumber: cleanVIN.substring(11, 17)
  };
}

/**
 * Converts model year character to actual year
 * @param {string} char - The model year character from VIN position 10
 * @returns {number|null} - The model year or null if invalid
 */
function getModelYear(char) {
  const yearCodes = {
    'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014,
    'F': 2015, 'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019,
    'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024,
    'S': 2025, 'T': 2026, 'V': 2027, 'W': 2028, 'X': 2029,
    'Y': 2030, '1': 2001, '2': 2002, '3': 2003, '4': 2004,
    '5': 2005, '6': 2006, '7': 2007, '8': 2008, '9': 2009
  };

  return yearCodes[char] || null;
}

export default { validateVIN, parseVIN };
