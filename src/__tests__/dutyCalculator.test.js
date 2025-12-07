import {
  calculatePuertoRicoDuty,
  calculateExportDuty,
  getSupportedCountries,
  getPuertoRicoTaxBrackets
} from '../utils/dutyCalculator.js';

describe('Duty Calculator', () => {
  describe('calculatePuertoRicoDuty', () => {
    test('should return error for invalid price', () => {
      const result = calculatePuertoRicoDuty('invalid');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid vehicle price');
    });

    test('should return error for negative price', () => {
      const result = calculatePuertoRicoDuty(-1000);
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid vehicle price');
    });

    test('should calculate minimum tax for vehicles up to $6,170', () => {
      const result = calculatePuertoRicoDuty(5000);
      expect(result.success).toBe(true);
      expect(result.totalDuty).toBe(637.50);
      expect(result.destination).toBe('Puerto Rico');
    });

    test('should calculate correctly for first bracket boundary ($6,170)', () => {
      const result = calculatePuertoRicoDuty(6170);
      expect(result.success).toBe(true);
      expect(result.totalDuty).toBe(637.50);
    });

    test('should calculate correctly for second bracket ($6,170 - $10,690)', () => {
      const result = calculatePuertoRicoDuty(8000);
      // Fixed: $637.50 + 10.2% of ($8,000 - $6,170)
      // = $637.50 + 10.2% of $1,830
      // = $637.50 + $186.66 = $824.16
      const result2 = calculatePuertoRicoDuty(8000);
      expect(result2.success).toBe(true);
      expect(result2.totalDuty).toBe(824.16);
    });

    test('should calculate correctly for third bracket ($10,690 - $21,380)', () => {
      const result = calculatePuertoRicoDuty(15000);
      // Fixed: $1,098.00 + 19.6% of ($15,000 - $10,690)
      // = $1,098.00 + 19.6% of $4,310
      // = $1,098.00 + $844.76 = $1,942.76
      expect(result.success).toBe(true);
      expect(result.totalDuty).toBe(1942.76);
    });

    test('should calculate correctly for fourth bracket ($21,380 - $32,070)', () => {
      const result = calculatePuertoRicoDuty(25000);
      // Fixed: $3,193.08 + 30% of ($25,000 - $21,380)
      // = $3,193.08 + 30% of $3,620
      // = $3,193.08 + $1,086 = $4,279.08
      expect(result.success).toBe(true);
      expect(result.totalDuty).toBe(4279.08);
    });

    test('should calculate correctly for highest bracket (over $64,140)', () => {
      const result = calculatePuertoRicoDuty(100000);
      // Fixed: $22,435.08 + 65% of ($100,000 - $64,140)
      // = $22,435.08 + 65% of $35,860
      // = $22,435.08 + $23,309 = $45,744.08
      expect(result.success).toBe(true);
      expect(result.totalDuty).toBe(45744.08);
    });

    test('should include SURI portal URL', () => {
      const result = calculatePuertoRicoDuty(10000);
      expect(result.suriPortalUrl).toBe('https://suri.hacienda.pr.gov/');
    });

    test('should include breakdown details', () => {
      const result = calculatePuertoRicoDuty(10000);
      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.fixedTax).toBeDefined();
      expect(result.breakdown.percentageTax).toBeDefined();
      expect(result.breakdown.excessAmount).toBeDefined();
    });
  });

  describe('calculateExportDuty', () => {
    test('should return error for invalid price', () => {
      const result = calculateExportDuty('invalid', 'US');
      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid vehicle price');
    });

    test('should return error for unsupported country', () => {
      const result = calculateExportDuty(10000, 'XX');
      expect(result.success).toBe(false);
      expect(result.error).toContain('not supported');
    });

    test('should calculate US duty correctly', () => {
      const result = calculateExportDuty(10000, 'US');
      // 2.5% of $10,000 = $250 + $0 additional fees = $250
      expect(result.success).toBe(true);
      expect(result.totalDuty).toBe(250);
      expect(result.breakdown.dutyRate).toBe(2.5);
    });

    test('should calculate Canada duty correctly', () => {
      const result = calculateExportDuty(10000, 'CA');
      // 6.1% of $10,000 = $610 + $100 additional fees = $710
      expect(result.success).toBe(true);
      expect(result.totalDuty).toBe(710);
      expect(result.breakdown.dutyRate).toBe(6.1);
      expect(result.breakdown.additionalFees).toBe(100);
    });

    test('should calculate Mexico duty correctly', () => {
      const result = calculateExportDuty(10000, 'MX');
      // 15% of $10,000 = $1,500 + $200 additional fees = $1,700
      expect(result.success).toBe(true);
      expect(result.totalDuty).toBe(1700);
    });

    test('should handle lowercase country codes', () => {
      const result = calculateExportDuty(10000, 'us');
      expect(result.success).toBe(true);
      expect(result.totalDuty).toBe(250);
    });

    test('should include country name in result', () => {
      const result = calculateExportDuty(10000, 'JP');
      expect(result.destination).toBe('Japan');
    });
  });

  describe('getSupportedCountries', () => {
    test('should return an array of countries', () => {
      const countries = getSupportedCountries();
      expect(Array.isArray(countries)).toBe(true);
      expect(countries.length).toBeGreaterThan(0);
    });

    test('should include US in supported countries', () => {
      const countries = getSupportedCountries();
      const us = countries.find(c => c.code === 'US');
      expect(us).toBeDefined();
      expect(us.name).toBe('United States');
    });

    test('should be sorted by country name', () => {
      const countries = getSupportedCountries();
      const names = countries.map(c => c.name);
      const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
      expect(names).toEqual(sortedNames);
    });

    test('should include rate for each country', () => {
      const countries = getSupportedCountries();
      countries.forEach(country => {
        expect(typeof country.rate).toBe('number');
      });
    });
  });

  describe('getPuertoRicoTaxBrackets', () => {
    test('should return an array of tax brackets', () => {
      const brackets = getPuertoRicoTaxBrackets();
      expect(Array.isArray(brackets)).toBe(true);
      expect(brackets.length).toBe(8);
    });

    test('should include price range for each bracket', () => {
      const brackets = getPuertoRicoTaxBrackets();
      brackets.forEach(bracket => {
        expect(bracket.priceRange).toBeDefined();
      });
    });

    test('should include fixed rate for each bracket', () => {
      const brackets = getPuertoRicoTaxBrackets();
      brackets.forEach(bracket => {
        expect(bracket.fixedRate).toBeDefined();
      });
    });

    test('should include percent rate for each bracket', () => {
      const brackets = getPuertoRicoTaxBrackets();
      brackets.forEach(bracket => {
        expect(bracket.percentRate).toBeDefined();
      });
    });
  });
});
