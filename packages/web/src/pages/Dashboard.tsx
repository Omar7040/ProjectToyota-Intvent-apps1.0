import { useEffect, useState } from 'react';
import { StatCard } from '../components/StatCard';
import { 
  vehicleApi, 
  customerApi, 
  salesApi, 
  inventoryApi
} from '../services/api';
import type {
  InventorySummary,
  SalesStatistics,
  LeadConversionStats 
} from '../services/api';
import './Dashboard.css';

export function Dashboard() {
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null);
  const [salesStats, setSalesStats] = useState<SalesStatistics | null>(null);
  const [leadStats, setLeadStats] = useState<LeadConversionStats | null>(null);
  const [vehicleCount, setVehicleCount] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [inventory, sales, leads, counts] = await Promise.all([
          inventoryApi.getSummary('d1'),
          salesApi.getStatistics(),
          customerApi.getConversionStats(),
          vehicleApi.getStatusCount()
        ]);
        setInventorySummary(inventory);
        setSalesStats(sales);
        setLeadStats(leads);
        setVehicleCount(counts);
        setError(null);
      } catch (err) {
        setError('Error al cargar los datos del dashboard');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">Cargando dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Resumen general del inventario y ventas del dealer</p>
      </header>

      <section className="stats-section">
        <h2>📊 Resumen de Inventario</h2>
        <div className="stats-grid">
          <StatCard
            title="Total Vehículos"
            value={inventorySummary?.totalVehicles || 0}
            icon="🚗"
            color="#4a90d9"
          />
          <StatCard
            title="Disponibles"
            value={vehicleCount.AVAILABLE || 0}
            icon="✅"
            color="#28a745"
          />
          <StatCard
            title="Reservados"
            value={vehicleCount.RESERVED || 0}
            icon="📋"
            color="#ffc107"
          />
          <StatCard
            title="Valor Total"
            value={formatCurrency(inventorySummary?.totalValue || 0)}
            icon="💰"
            color="#e94560"
          />
        </div>
      </section>

      <section className="stats-section">
        <h2>💼 Estadísticas de Ventas</h2>
        <div className="stats-grid">
          <StatCard
            title="Ventas Totales"
            value={salesStats?.totalSales || 0}
            icon="📈"
            color="#6f42c1"
          />
          <StatCard
            title="Ventas Completadas"
            value={salesStats?.completedSales || 0}
            icon="✔️"
            color="#28a745"
          />
          <StatCard
            title="Ventas Pendientes"
            value={salesStats?.pendingSales || 0}
            icon="⏳"
            color="#fd7e14"
          />
          <StatCard
            title="Ingresos Totales"
            value={formatCurrency(salesStats?.totalRevenue || 0)}
            icon="💵"
            color="#17a2b8"
          />
        </div>
      </section>

      <section className="stats-section">
        <h2>👥 Conversión de Clientes</h2>
        <div className="stats-grid">
          <StatCard
            title="Total Leads"
            value={leadStats?.totalLeads || 0}
            icon="👤"
            color="#4a90d9"
          />
          <StatCard
            title="Convertidos a Venta"
            value={leadStats?.convertedToSale || 0}
            icon="🎯"
            color="#28a745"
          />
          <StatCard
            title="En Progreso"
            value={leadStats?.inProgress || 0}
            icon="🔄"
            color="#ffc107"
          />
          <StatCard
            title="Tasa de Conversión"
            value={`${(leadStats?.conversionRate || 0).toFixed(1)}%`}
            icon="📊"
            color="#e94560"
          />
        </div>
      </section>

      {inventorySummary && inventorySummary.byModel.length > 0 && (
        <section className="stats-section">
          <h2>🚙 Inventario por Modelo</h2>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Modelo</th>
                  <th>Total</th>
                  <th>Disponibles</th>
                  <th>Reservados</th>
                  <th>Vendidos</th>
                </tr>
              </thead>
              <tbody>
                {inventorySummary.byModel.map((item) => (
                  <tr key={item.model}>
                    <td><strong>{item.model}</strong></td>
                    <td>{item.count}</td>
                    <td className="available">{item.available}</td>
                    <td className="reserved">{item.reserved}</td>
                    <td className="sold">{item.sold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
