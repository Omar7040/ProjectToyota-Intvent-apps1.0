import { useState, useCallback } from 'react';
import { vehicleApi } from '../services/api';
import type { VinLookupResult } from '../services/api';
import './VinScanner.css';

type ScanMode = 'manual' | 'camera';

export function VinScanner() {
  const [scanMode, setScanMode] = useState<ScanMode>('manual');
  const [vinInput, setVinInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lookupResult, setLookupResult] = useState<VinLookupResult | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);

  // Normalize VIN input (uppercase, remove invalid chars)
  const normalizeVin = (value: string): string => {
    return value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');
  };

  const handleVinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const normalized = normalizeVin(e.target.value);
    if (normalized.length <= 17) {
      setVinInput(normalized);
      setError(null);
      // Clear previous results when user starts typing new VIN
      if (lookupResult) {
        setLookupResult(null);
      }
    }
  };

  const handleLookupVin = useCallback(async (vin: string) => {
    if (!vin) {
      setError('Please enter a VIN');
      return;
    }

    if (vin.length !== 17) {
      setError('VIN must be exactly 17 characters');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await vehicleApi.lookupVin(vin);
      setLookupResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to lookup VIN';
      setError(errorMessage);
      setLookupResult(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookupVin(vinInput);
  };

  const handleClearResults = () => {
    setVinInput('');
    setLookupResult(null);
    setError(null);
  };

  const handleScanFromCamera = () => {
    setIsCameraActive(true);
    // For now, we'll show a simulated camera view
    // In a real implementation, this would use a barcode scanning library like Quagga2
    // or the device's native camera API
  };

  const handleStopCamera = () => {
    setIsCameraActive(false);
  };

  // Simulate a scanned VIN for demo purposes
  const handleSimulateScan = () => {
    // Use a VIN from the sample data
    const sampleVin = '1HGBH41JXMN109186';
    setVinInput(sampleVin);
    handleLookupVin(sampleVin);
    setIsCameraActive(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const statusColors: Record<string, string> = {
    AVAILABLE: '#28a745',
    RESERVED: '#ffc107',
    SOLD: '#dc3545',
    IN_TRANSIT: '#17a2b8',
    MAINTENANCE: '#6c757d'
  };

  const statusLabels: Record<string, string> = {
    AVAILABLE: 'Disponible',
    RESERVED: 'Reservado',
    SOLD: 'Vendido',
    IN_TRANSIT: 'En Tránsito',
    MAINTENANCE: 'Mantenimiento'
  };

  return (
    <div className="vin-scanner-page">
      <header className="page-header">
        <div className="header-content">
          <h1>🔍 VIN Scanner</h1>
          <p>Scan or enter a VIN to lookup vehicle information</p>
        </div>
      </header>

      <div className="scan-mode-selector">
        <button
          className={`mode-btn ${scanMode === 'manual' ? 'active' : ''}`}
          onClick={() => {
            setScanMode('manual');
            setIsCameraActive(false);
          }}
        >
          ⌨️ Manual Entry
        </button>
        <button
          className={`mode-btn ${scanMode === 'camera' ? 'active' : ''}`}
          onClick={() => setScanMode('camera')}
        >
          📷 Camera Scan
        </button>
      </div>

      <div className="scanner-content">
        {scanMode === 'manual' ? (
          <div className="manual-entry-section">
            <form onSubmit={handleManualSubmit} className="vin-form">
              <div className="vin-input-group">
                <label htmlFor="vin-input">Enter VIN (17 characters):</label>
                <input
                  id="vin-input"
                  type="text"
                  value={vinInput}
                  onChange={handleVinInputChange}
                  placeholder="e.g., 1HGBH41JXMN109186"
                  className="vin-input"
                  maxLength={17}
                  autoComplete="off"
                  spellCheck="false"
                />
                <span className="vin-length">{vinInput.length}/17</span>
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn-lookup"
                  disabled={isLoading || vinInput.length !== 17}
                >
                  {isLoading ? 'Looking up...' : '🔍 Lookup VIN'}
                </button>
                {(vinInput || lookupResult) && (
                  <button
                    type="button"
                    className="btn-clear"
                    onClick={handleClearResults}
                  >
                    Clear
                  </button>
                )}
              </div>
            </form>

            <div className="vin-format-help">
              <h4>VIN Format Information</h4>
              <p>A VIN (Vehicle Identification Number) is a unique 17-character code:</p>
              <ul>
                <li><strong>Characters 1-3:</strong> World Manufacturer Identifier</li>
                <li><strong>Characters 4-8:</strong> Vehicle Descriptor Section</li>
                <li><strong>Character 9:</strong> Check Digit</li>
                <li><strong>Character 10:</strong> Model Year</li>
                <li><strong>Character 11:</strong> Plant Code</li>
                <li><strong>Characters 12-17:</strong> Sequential Number</li>
              </ul>
              <p className="note">Note: VINs cannot contain letters I, O, or Q.</p>
            </div>
          </div>
        ) : (
          <div className="camera-section">
            {!isCameraActive ? (
              <div className="camera-placeholder">
                <div className="camera-icon">📸</div>
                <p>Point your camera at a VIN barcode or QR code to scan</p>
                <button className="btn-start-camera" onClick={handleScanFromCamera}>
                  Start Camera
                </button>
              </div>
            ) : (
              <div className="camera-active">
                <div className="camera-viewfinder">
                  <div className="viewfinder-frame">
                    <span className="corner top-left"></span>
                    <span className="corner top-right"></span>
                    <span className="corner bottom-left"></span>
                    <span className="corner bottom-right"></span>
                  </div>
                  <div className="scan-line"></div>
                  <p className="scanning-text">Scanning...</p>
                </div>
                <div className="camera-controls">
                  <button className="btn-stop-camera" onClick={handleStopCamera}>
                    Stop Camera
                  </button>
                  <button className="btn-simulate-scan" onClick={handleSimulateScan}>
                    🎯 Simulate Scan (Demo)
                  </button>
                </div>
              </div>
            )}

            <div className="camera-tips">
              <h4>Scanning Tips</h4>
              <ul>
                <li>Hold the device steady</li>
                <li>Ensure good lighting</li>
                <li>Position the VIN within the frame</li>
                <li>VIN barcodes are typically on windshield or door frame</li>
              </ul>
            </div>
          </div>
        )}

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        {lookupResult && (
          <div className="lookup-results">
            <h3>Lookup Results</h3>
            
            <div className="vin-display">
              <span className="vin-label">VIN:</span>
              <span className="vin-value">{lookupResult.decoded?.vin || vinInput}</span>
            </div>

            {lookupResult.decoded && (
              <div className="decoded-info">
                <h4>Decoded VIN Information</h4>
                <div className="decoded-grid">
                  <div className="decoded-item">
                    <span className="label">Manufacturer ID:</span>
                    <span className="value">{lookupResult.decoded.worldManufacturerIdentifier}</span>
                  </div>
                  <div className="decoded-item">
                    <span className="label">Vehicle Descriptor:</span>
                    <span className="value">{lookupResult.decoded.vehicleDescriptorSection}</span>
                  </div>
                  <div className="decoded-item">
                    <span className="label">Check Digit:</span>
                    <span className="value">{lookupResult.decoded.checkDigit}</span>
                  </div>
                  {lookupResult.decoded.decodedYear && (
                    <div className="decoded-item">
                      <span className="label">Model Year:</span>
                      <span className="value">{lookupResult.decoded.decodedYear}</span>
                    </div>
                  )}
                  <div className="decoded-item">
                    <span className="label">Plant Code:</span>
                    <span className="value">{lookupResult.decoded.plantCode}</span>
                  </div>
                  <div className="decoded-item">
                    <span className="label">Sequential #:</span>
                    <span className="value">{lookupResult.decoded.sequentialNumber}</span>
                  </div>
                  <div className="decoded-item">
                    <span className="label">North American:</span>
                    <span className="value">{lookupResult.decoded.isNorthAmerican ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>
            )}

            {lookupResult.found && lookupResult.vehicle ? (
              <div className="vehicle-found">
                <h4>✅ Vehicle Found in Inventory</h4>
                <div className="vehicle-result-card">
                  <div className="vehicle-header-result">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: statusColors[lookupResult.vehicle.status] }}
                    >
                      {statusLabels[lookupResult.vehicle.status]}
                    </span>
                    <span className="condition-badge">{lookupResult.vehicle.condition.replace('_', ' ')}</span>
                  </div>
                  <h3>{lookupResult.vehicle.year} {lookupResult.vehicle.make} {lookupResult.vehicle.model}</h3>
                  <p className="price">{formatPrice(lookupResult.vehicle.price)}</p>
                  <div className="vehicle-details-grid">
                    <div className="detail-item">
                      <span className="detail-icon">🎨</span>
                      <span>Color: {lookupResult.vehicle.color}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">📍</span>
                      <span>Location: {lookupResult.vehicle.location || 'N/A'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">⛽</span>
                      <span>Fuel: {lookupResult.vehicle.fuelType}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">🔧</span>
                      <span>Transmission: {lookupResult.vehicle.transmission}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-icon">🔢</span>
                      <span>Mileage: {lookupResult.vehicle.mileage.toLocaleString()} mi</span>
                    </div>
                  </div>
                  <div className="vehicle-actions">
                    <a href={`/inventory?highlight=${lookupResult.vehicle.id}`} className="btn-view-inventory">
                      View in Inventory
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="vehicle-not-found">
                <h4>❌ Vehicle Not Found</h4>
                <p>This VIN is not in our current inventory.</p>
                <p className="help-text">
                  If you believe this vehicle should be in inventory, please contact your inventory manager.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
