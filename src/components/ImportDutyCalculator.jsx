import React, { useState } from 'react';
import { validateVIN, parseVIN } from '../utils/vinValidator';
import {
  calculatePuertoRicoDuty,
  calculateExportDuty,
  getSupportedCountries,
  getPuertoRicoTaxBrackets
} from '../utils/dutyCalculator';

/**
 * Import Duty Calculator Component
 * Provides UI for estimating import duties for vehicles
 */
function ImportDutyCalculator() {
  const [destination, setDestination] = useState('PR'); // PR for Puerto Rico
  const [inputMethod, setInputMethod] = useState('vin'); // 'vin' or 'manual'
  const [vin, setVin] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [vehiclePrice, setVehiclePrice] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [vinInfo, setVinInfo] = useState(null);

  const supportedCountries = getSupportedCountries();
  const puertoRicoTaxBrackets = getPuertoRicoTaxBrackets();

  const handleVinChange = (e) => {
    const value = e.target.value.toUpperCase();
    setVin(value);
    setError(null);
    setVinInfo(null);

    if (value.length === 17) {
      const validation = validateVIN(value);
      if (validation.isValid) {
        const parsed = parseVIN(value);
        setVinInfo(parsed);
      } else {
        setError(validation.error);
      }
    }
  };

  const handleCalculate = () => {
    setError(null);
    setResult(null);

    // Validate vehicle price
    const price = parseFloat(vehiclePrice);
    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid vehicle price greater than 0');
      return;
    }

    // Validate VIN if using VIN input method
    if (inputMethod === 'vin') {
      const validation = validateVIN(vin);
      if (!validation.isValid) {
        setError(validation.error);
        return;
      }
    } else {
      // Validate manual entry
      if (!make.trim()) {
        setError('Please enter the vehicle make');
        return;
      }
      if (!model.trim()) {
        setError('Please enter the vehicle model');
        return;
      }
      const yearNum = parseInt(year, 10);
      if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 2) {
        setError('Please enter a valid year');
        return;
      }
    }

    // Calculate duty based on destination
    let calculationResult;
    if (destination === 'PR') {
      calculationResult = calculatePuertoRicoDuty(price);
    } else {
      calculationResult = calculateExportDuty(price, selectedCountry);
    }

    if (calculationResult.success) {
      setResult({
        ...calculationResult,
        vehicleInfo: inputMethod === 'vin' 
          ? { vin, ...vinInfo }
          : { make: make.trim(), model: model.trim(), year: parseInt(year, 10) }
      });
    } else {
      setError(calculationResult.error);
    }
  };

  const handleReset = () => {
    setVin('');
    setMake('');
    setModel('');
    setYear('');
    setVehiclePrice('');
    setResult(null);
    setError(null);
    setVinInfo(null);
  };

  return (
    <div className="import-duty-calculator" style={styles.container}>
      <h1 style={styles.title}>Import Duty Calculator</h1>
      <p style={styles.subtitle}>
        Estimate import duties for vehicles to Puerto Rico or other countries
      </p>

      {/* Destination Selection */}
      <div style={styles.section}>
        <label style={styles.label}>Destination</label>
        <select
          value={destination}
          onChange={(e) => {
            setDestination(e.target.value);
            setResult(null);
          }}
          style={styles.select}
          aria-label="Select destination"
        >
          <option value="PR">Puerto Rico</option>
          <option value="OTHER">Other Country</option>
        </select>

        {destination === 'OTHER' && (
          <div style={styles.countrySelect}>
            <label style={styles.label}>Select Country</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              style={styles.select}
              aria-label="Select country"
            >
              {supportedCountries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name} ({country.rate}% duty)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Input Method Selection */}
      <div style={styles.section}>
        <label style={styles.label}>Vehicle Information Method</label>
        <div style={styles.radioGroup}>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="inputMethod"
              value="vin"
              checked={inputMethod === 'vin'}
              onChange={() => setInputMethod('vin')}
            />
            <span style={styles.radioText}>Enter VIN</span>
          </label>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="inputMethod"
              value="manual"
              checked={inputMethod === 'manual'}
              onChange={() => setInputMethod('manual')}
            />
            <span style={styles.radioText}>Enter Make, Model, Year</span>
          </label>
        </div>
      </div>

      {/* VIN Input */}
      {inputMethod === 'vin' && (
        <div style={styles.section}>
          <label style={styles.label}>
            Vehicle Identification Number (VIN)
          </label>
          <input
            type="text"
            value={vin}
            onChange={handleVinChange}
            placeholder="Enter 17-character VIN"
            maxLength={17}
            style={styles.input}
            aria-label="VIN input"
            aria-describedby="vin-char-count"
          />
          <span 
            id="vin-char-count"
            style={styles.charCount}
            aria-live="polite"
          >
            {vin.length}/17 characters
          </span>
          
          {vinInfo && (
            <div style={styles.vinInfo} role="status" aria-live="polite">
              <p style={styles.vinInfoText}>
                Valid VIN detected
                {vinInfo.modelYear && ` - Model Year: ${vinInfo.modelYear}`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Manual Input */}
      {inputMethod === 'manual' && (
        <div style={styles.section}>
          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Make</label>
              <input
                type="text"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="e.g., Toyota"
                style={styles.input}
                aria-label="Vehicle make"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Model</label>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g., Camry"
                style={styles.input}
                aria-label="Vehicle model"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Year</label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                placeholder="e.g., 2024"
                min="1900"
                max={new Date().getFullYear() + 2}
                style={styles.input}
                aria-label="Vehicle year"
              />
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Price Input */}
      <div style={styles.section}>
        <label style={styles.label}>Vehicle Price (USD)</label>
        <div style={styles.priceInputWrapper}>
          <span style={styles.currencySymbol}>$</span>
          <input
            type="number"
            value={vehiclePrice}
            onChange={(e) => setVehiclePrice(e.target.value)}
            placeholder="Enter vehicle price"
            min="0"
            step="0.01"
            style={styles.priceInput}
            aria-label="Vehicle price in USD"
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={styles.errorBox} role="alert">
          <span style={styles.errorIcon} aria-hidden="true">!</span>
          <span>Warning: {error}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div style={styles.buttonGroup}>
        <button
          onClick={handleCalculate}
          style={styles.calculateButton}
          aria-label="Calculate import duty"
        >
          Calculate Duty
        </button>
        <button
          onClick={handleReset}
          style={styles.resetButton}
          aria-label="Reset form"
        >
          Reset
        </button>
      </div>

      {/* Results Display */}
      {result && (
        <div style={styles.resultBox}>
          <h2 style={styles.resultTitle}>Estimated Import Duty</h2>
          
          <div style={styles.resultMain}>
            <span style={styles.resultLabel}>Total Duty</span>
            <span style={styles.resultValue}>
              ${result.totalDuty.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div style={styles.resultDetails}>
            <h3 style={styles.detailsTitle}>Calculation Breakdown</h3>
            
            <div style={styles.detailRow}>
              <span>Vehicle Price:</span>
              <span>${result.vehiclePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            
            <div style={styles.detailRow}>
              <span>Destination:</span>
              <span>{result.destination}</span>
            </div>

            {result.breakdown && destination === 'PR' && (
              <>
                <div style={styles.detailRow}>
                  <span>Tax Bracket:</span>
                  <span>${result.breakdown.bracket.min.toLocaleString()} - {
                    typeof result.breakdown.bracket.max === 'number' 
                      ? `$${result.breakdown.bracket.max.toLocaleString()}` 
                      : result.breakdown.bracket.max
                  }</span>
                </div>
                <div style={styles.detailRow}>
                  <span>Fixed Tax:</span>
                  <span>${result.breakdown.fixedTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={styles.detailRow}>
                  <span>Excess Amount:</span>
                  <span>${result.breakdown.excessAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={styles.detailRow}>
                  <span>Percentage Tax ({result.breakdown.bracket.percentRate}%):</span>
                  <span>${result.breakdown.percentageTax.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </>
            )}

            {result.breakdown && destination === 'OTHER' && (
              <>
                <div style={styles.detailRow}>
                  <span>Duty Rate:</span>
                  <span>{result.breakdown.dutyRate}%</span>
                </div>
                <div style={styles.detailRow}>
                  <span>Duty Amount:</span>
                  <span>${result.breakdown.dutyAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div style={styles.detailRow}>
                  <span>Additional Fees:</span>
                  <span>${result.breakdown.additionalFees.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </>
            )}

            {result.vehicleInfo && (
              <div style={styles.vehicleInfoSection}>
                <h4 style={styles.vehicleInfoTitle}>Vehicle Information</h4>
                {result.vehicleInfo.vin && (
                  <div style={styles.detailRow}>
                    <span>VIN:</span>
                    <span>{result.vehicleInfo.vin}</span>
                  </div>
                )}
                {result.vehicleInfo.make && (
                  <div style={styles.detailRow}>
                    <span>Make:</span>
                    <span>{result.vehicleInfo.make}</span>
                  </div>
                )}
                {result.vehicleInfo.model && (
                  <div style={styles.detailRow}>
                    <span>Model:</span>
                    <span>{result.vehicleInfo.model}</span>
                  </div>
                )}
                {(result.vehicleInfo.year || result.vehicleInfo.modelYear) && (
                  <div style={styles.detailRow}>
                    <span>Year:</span>
                    <span>{result.vehicleInfo.year || result.vehicleInfo.modelYear}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SURI Portal Link for Puerto Rico */}
          {destination === 'PR' && (
            <div style={styles.suriLink}>
              <a
                href={result.suriPortalUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.linkButton}
              >
                Visit SURI Portal for Official Information
              </a>
              <p style={styles.disclaimer}>
                * This is an estimate only. For official duty calculations, please visit the SURI portal.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Puerto Rico Tax Brackets Reference */}
      {destination === 'PR' && (
        <div style={styles.taxBracketsSection}>
          <h3 style={styles.bracketsTitle}>Puerto Rico Tax Brackets Reference</h3>
          <div style={styles.bracketsTable}>
            <div style={styles.bracketsHeader}>
              <span>Price Range</span>
              <span>Fixed Rate</span>
              <span>% of Excess</span>
            </div>
            {puertoRicoTaxBrackets.map((bracket, index) => (
              <div key={index} style={styles.bracketsRow}>
                <span>{bracket.priceRange}</span>
                <span>{bracket.fixedRate}</span>
                <span>{bracket.percentRate}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, sans-serif',
  },
  title: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '8px',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '16px',
    color: '#666',
    marginBottom: '24px',
    textAlign: 'center',
  },
  section: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#444',
    marginBottom: '8px',
  },
  select: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#fff',
    cursor: 'pointer',
  },
  countrySelect: {
    marginTop: '16px',
  },
  radioGroup: {
    display: 'flex',
    gap: '20px',
    flexWrap: 'wrap',
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  radioText: {
    marginLeft: '8px',
    fontSize: '14px',
    color: '#444',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    boxSizing: 'border-box',
  },
  charCount: {
    display: 'block',
    fontSize: '12px',
    color: '#888',
    marginTop: '4px',
    textAlign: 'right',
  },
  vinInfo: {
    marginTop: '8px',
    padding: '10px',
    backgroundColor: '#e8f5e9',
    borderRadius: '6px',
  },
  vinInfoText: {
    margin: 0,
    fontSize: '14px',
    color: '#2e7d32',
  },
  formRow: {
    display: 'flex',
    gap: '16px',
    flexWrap: 'wrap',
  },
  formGroup: {
    flex: '1',
    minWidth: '150px',
  },
  priceInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    border: '2px solid #ddd',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  currencySymbol: {
    padding: '12px',
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    color: '#666',
  },
  priceInput: {
    flex: '1',
    padding: '12px',
    fontSize: '16px',
    border: 'none',
    outline: 'none',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#ffebee',
    borderRadius: '8px',
    marginBottom: '20px',
    color: '#c62828',
  },
  errorIcon: {
    marginRight: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    backgroundColor: '#c62828',
    color: '#fff',
    borderRadius: '50%',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
    marginBottom: '24px',
  },
  calculateButton: {
    flex: '2',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: '#1976d2',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  resetButton: {
    flex: '1',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: '#f5f5f5',
    color: '#666',
    border: '2px solid #ddd',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  resultBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '2px solid #e0e0e0',
  },
  resultTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '16px',
    textAlign: 'center',
  },
  resultMain: {
    textAlign: 'center',
    marginBottom: '24px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  resultLabel: {
    display: 'block',
    fontSize: '14px',
    color: '#666',
    marginBottom: '8px',
  },
  resultValue: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#1976d2',
  },
  resultDetails: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
  },
  detailsTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '12px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #eee',
    fontSize: '14px',
  },
  vehicleInfoSection: {
    marginTop: '16px',
    paddingTop: '16px',
    borderTop: '2px solid #e0e0e0',
  },
  vehicleInfoTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#666',
    marginBottom: '8px',
  },
  suriLink: {
    textAlign: 'center',
    marginTop: '16px',
  },
  linkButton: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#43a047',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  disclaimer: {
    fontSize: '12px',
    color: '#888',
    marginTop: '12px',
    fontStyle: 'italic',
  },
  taxBracketsSection: {
    marginTop: '24px',
    padding: '16px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '2px solid #e0e0e0',
  },
  bracketsTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '16px',
  },
  bracketsTable: {
    fontSize: '14px',
  },
  bracketsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '2px solid #333',
    fontWeight: 'bold',
  },
  bracketsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #eee',
  },
};

export default ImportDutyCalculator;
