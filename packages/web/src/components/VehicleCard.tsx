import type { Vehicle } from '../services/api';
import './VehicleCard.css';

interface VehicleCardProps {
  vehicle: Vehicle;
  onStatusChange?: (vehicleId: string, status: string) => void;
}

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

export function VehicleCard({ vehicle, onStatusChange }: VehicleCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <div className="vehicle-card">
      <div className="vehicle-header">
        <span 
          className="vehicle-status" 
          style={{ backgroundColor: statusColors[vehicle.status] }}
        >
          {statusLabels[vehicle.status]}
        </span>
        <span className="vehicle-condition">{vehicle.condition.replace('_', ' ')}</span>
      </div>
      
      <div className="vehicle-image">
        <span className="vehicle-icon">🚗</span>
      </div>
      
      <div className="vehicle-info">
        <h3 className="vehicle-title">
          {vehicle.year} {vehicle.make} {vehicle.model}
        </h3>
        <p className="vehicle-price">{formatPrice(vehicle.price)}</p>
        
        <div className="vehicle-details">
          <div className="detail">
            <span className="detail-icon">🎨</span>
            <span>{vehicle.color}</span>
          </div>
          <div className="detail">
            <span className="detail-icon">📍</span>
            <span>{vehicle.location || 'N/A'}</span>
          </div>
          <div className="detail">
            <span className="detail-icon">⛽</span>
            <span>{vehicle.fuelType}</span>
          </div>
          <div className="detail">
            <span className="detail-icon">🔧</span>
            <span>{vehicle.transmission}</span>
          </div>
        </div>
        
        <p className="vehicle-vin">VIN: {vehicle.vin}</p>
        
        {vehicle.features.length > 0 && (
          <div className="vehicle-features">
            {vehicle.features.slice(0, 3).map((feature, index) => (
              <span key={index} className="feature-tag">{feature}</span>
            ))}
            {vehicle.features.length > 3 && (
              <span className="feature-tag more">+{vehicle.features.length - 3}</span>
            )}
          </div>
        )}
      </div>
      
      {onStatusChange && vehicle.status === 'AVAILABLE' && (
        <div className="vehicle-actions">
          <button 
            className="btn btn-reserve"
            onClick={() => onStatusChange(vehicle.id, 'RESERVED')}
          >
            Reservar
          </button>
        </div>
      )}
    </div>
  );
}
