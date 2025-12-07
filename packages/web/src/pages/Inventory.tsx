import { useEffect, useState } from 'react';
import { VehicleCard } from '../components/VehicleCard';
import { vehicleApi, inventoryApi } from '../services/api';
import type { Vehicle, InventorySummary } from '../services/api';
import './Inventory.css';

export function Inventory() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [vehicleData, summaryData] = await Promise.all([
          vehicleApi.getAll(),
          inventoryApi.getSummary('d1')
        ]);
        setVehicles(vehicleData);
        setSummary(summaryData);
        setError(null);
      } catch (err) {
        setError('Error al cargar el inventario');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = async (vehicleId: string, status: string) => {
    try {
      await vehicleApi.update(vehicleId, { status });
      // Refresh the vehicle list
      const updatedVehicles = await vehicleApi.getAll();
      setVehicles(updatedVehicles);
    } catch (err) {
      console.error('Error updating vehicle status:', err);
    }
  };

  const handlePerformCount = async () => {
    try {
      await inventoryApi.createCount({
        dealerId: 'd1',
        countedBy: 'u1',
        notes: 'Conteo manual desde el dashboard'
      });
      // Refresh summary
      const newSummary = await inventoryApi.getSummary('d1');
      setSummary(newSummary);
      alert('Conteo de inventario completado exitosamente');
    } catch (err) {
      console.error('Error performing inventory count:', err);
      alert('Error al realizar el conteo de inventario');
    }
  };

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesFilter = filter === 'ALL' || vehicle.status === filter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      vehicle.make.toLowerCase().includes(searchLower) ||
      vehicle.model.toLowerCase().includes(searchLower) ||
      vehicle.vin.toLowerCase().includes(searchLower) ||
      vehicle.color.toLowerCase().includes(searchLower);
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="inventory-page">
        <div className="loading">Cargando inventario...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inventory-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="inventory-page">
      <header className="page-header">
        <div className="header-content">
          <h1>📦 Inventario de Vehículos</h1>
          <p>Gestión y conteo de vehículos en el dealer</p>
        </div>
        <button className="btn-primary" onClick={handlePerformCount}>
          🔢 Realizar Conteo
        </button>
      </header>

      {summary && (
        <div className="summary-bar">
          <div className="summary-item">
            <span className="summary-label">Total</span>
            <span className="summary-value">{summary.totalVehicles}</span>
          </div>
          <div className="summary-item available">
            <span className="summary-label">Disponibles</span>
            <span className="summary-value">{summary.byStatus.available}</span>
          </div>
          <div className="summary-item reserved">
            <span className="summary-label">Reservados</span>
            <span className="summary-value">{summary.byStatus.reserved}</span>
          </div>
          <div className="summary-item in-transit">
            <span className="summary-label">En Tránsito</span>
            <span className="summary-value">{summary.byStatus.inTransit}</span>
          </div>
          <div className="summary-item maintenance">
            <span className="summary-label">Mantenimiento</span>
            <span className="summary-value">{summary.byStatus.maintenance}</span>
          </div>
        </div>
      )}

      <div className="filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por marca, modelo, VIN o color..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'ALL' ? 'active' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            Todos
          </button>
          <button 
            className={`filter-btn ${filter === 'AVAILABLE' ? 'active' : ''}`}
            onClick={() => setFilter('AVAILABLE')}
          >
            Disponibles
          </button>
          <button 
            className={`filter-btn ${filter === 'RESERVED' ? 'active' : ''}`}
            onClick={() => setFilter('RESERVED')}
          >
            Reservados
          </button>
          <button 
            className={`filter-btn ${filter === 'IN_TRANSIT' ? 'active' : ''}`}
            onClick={() => setFilter('IN_TRANSIT')}
          >
            En Tránsito
          </button>
        </div>
      </div>

      <div className="vehicles-grid">
        {filteredVehicles.map(vehicle => (
          <VehicleCard 
            key={vehicle.id} 
            vehicle={vehicle}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="no-results">
          <p>No se encontraron vehículos con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  );
}
