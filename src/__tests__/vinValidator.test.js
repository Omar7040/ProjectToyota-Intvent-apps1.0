import { validateVIN, parseVIN } from '../utils/vinValidator.js';

describe('VIN Validator', () => {
  describe('validateVIN', () => {
    test('should return error for empty VIN', () => {
      const result = validateVIN('');
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('VIN is required');
    });

    test('should return error for null VIN', () => {
      const result = validateVIN(null);
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('VIN is required');
    });

    test('should return error for VIN with wrong length', () => {
      const result = validateVIN('1234567890');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('must be exactly 17 characters');
    });

    test('should return error for VIN containing I', () => {
      const result = validateVIN('1G1YY22G965I06230');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot contain letters I, O, or Q');
    });

    test('should return error for VIN containing O', () => {
      const result = validateVIN('1G1YY22G965O06230');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot contain letters I, O, or Q');
    });

    test('should return error for VIN containing Q', () => {
      const result = validateVIN('1G1YY22G965Q06230');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('cannot contain letters I, O, or Q');
    });

    test('should return error for VIN with invalid characters', () => {
      const result = validateVIN('1G1YY22G965!06230');
      expect(result.isValid).toBe(false);
      expect(result.error).toContain('must contain only valid alphanumeric characters');
    });

    test('should validate a correct VIN', () => {
      // Using a known valid VIN
      const result = validateVIN('1HGBH41JXMN109186');
      expect(result.isValid).toBe(true);
      expect(result.error).toBe(null);
    });

    test('should handle lowercase VIN', () => {
      const result = validateVIN('1hgbh41jxmn109186');
      expect(result.isValid).toBe(true);
      expect(result.error).toBe(null);
    });

    test('should trim whitespace', () => {
      const result = validateVIN('  1HGBH41JXMN109186  ');
      expect(result.isValid).toBe(true);
      expect(result.error).toBe(null);
    });
  });

  describe('parseVIN', () => {
    test('should return null for invalid VIN', () => {
      const result = parseVIN('');
      expect(result).toBeNull();
    });

    test('should return null for VIN with wrong length', () => {
      const result = parseVIN('1234567890');
      expect(result).toBeNull();
    });

    test('should parse WMI correctly', () => {
      const result = parseVIN('1HGBH41JXMN109186');
      expect(result.wmi).toBe('1HG');
    });

    test('should parse VDS correctly', () => {
      const result = parseVIN('1HGBH41JXMN109186');
      expect(result.vds).toBe('BH41JX');
    });

    test('should parse VIS correctly', () => {
      const result = parseVIN('1HGBH41JXMN109186');
      expect(result.vis).toBe('MN109186');
    });

    test('should parse model year correctly for M (2021)', () => {
      const result = parseVIN('1HGBH41JXMN109186');
      expect(result.modelYear).toBe(2021);
    });

    test('should parse plant code correctly', () => {
      const result = parseVIN('1HGBH41JXMN109186');
      expect(result.plantCode).toBe('N');
    });

    test('should parse sequential number correctly', () => {
      const result = parseVIN('1HGBH41JXMN109186');
      expect(result.sequentialNumber).toBe('109186');
    });
  });
});
