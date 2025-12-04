import { useEffect, useState } from 'react';
import { salesApi } from '../services/api';
import type { Sale, SalesStatistics } from '../services/api';
import { StatCard } from '../components/StatCard';
import './Sales.css';

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  IN_PROGRESS: 'En Progreso',
  FINANCING_PENDING: 'Financiamiento Pendiente',
  FINANCING_APPROVED: 'Financiamiento Aprobado',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada'
};

const statusColors: Record<string, string> = {
  PENDING: '#6c757d',
  IN_PROGRESS: '#17a2b8',
  FINANCING_PENDING: '#ffc107',
  FINANCING_APPROVED: '#28a745',
  COMPLETED: '#28a745',
  CANCELLED: '#dc3545'
};

const paymentMethodLabels: Record<string, string> = {
  CASH: 'Efectivo',
  FINANCING: 'Financiamiento',
  LEASE: 'Arrendamiento',
  TRADE_IN: 'Trade-In'
};

export function Sales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [stats, setStats] = useState<SalesStatistics | null>(null);
  const [pipeline, setPipeline] = useState<Record<string, Sale[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'pipeline'>('list');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [salesData, statsData, pipelineData] = await Promise.all([
          salesApi.getAll(),
          salesApi.getStatistics(),
          salesApi.getPipeline()
        ]);
        setSales(salesData);
        setStats(statsData);
        setPipeline(pipelineData);
        setError(null);
      } catch (err) {
        setError('Error al cargar las ventas');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCompleteSale = async (saleId: string) => {
    try {
      await salesApi.complete(saleId);
      // Refresh data
      const [salesData, statsData, pipelineData] = await Promise.all([
        salesApi.getAll(),
        salesApi.getStatistics(),
        salesApi.getPipeline()
      ]);
      setSales(salesData);
      setStats(statsData);
      setPipeline(pipelineData);
    } catch (err) {
      console.error('Error completing sale:', err);
    }
  };

  const handleCancelSale = async (saleId: string) => {
    try {
      await salesApi.cancel(saleId);
      // Refresh data
      const [salesData, statsData, pipelineData] = await Promise.all([
        salesApi.getAll(),
        salesApi.getStatistics(),
        salesApi.getPipeline()
      ]);
      setSales(salesData);
      setStats(statsData);
      setPipeline(pipelineData);
    } catch (err) {
      console.error('Error cancelling sale:', err);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="sales-page">
        <div className="loading">Cargando ventas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sales-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="sales-page">
      <header className="page-header">
        <div className="header-content">
          <h1>💼 Gestión de Ventas</h1>
          <p>Flujo de ventas y seguimiento de transacciones</p>
        </div>
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 Lista
          </button>
          <button 
            className={`toggle-btn ${viewMode === 'pipeline' ? 'active' : ''}`}
            onClick={() => setViewMode('pipeline')}
          >
            📊 Pipeline
          </button>
        </div>
      </header>

      {stats && (
        <div className="stats-grid">
          <StatCard
            title="Ventas Totales"
            value={stats.totalSales}
            icon="📈"
            color="#6f42c1"
          />
          <StatCard
            title="Completadas"
            value={stats.completedSales}
            icon="✔️"
            color="#28a745"
          />
          <StatCard
            title="Pendientes"
            value={stats.pendingSales}
            icon="⏳"
            color="#ffc107"
          />
          <StatCard
            title="Ingresos"
            value={formatCurrency(stats.totalRevenue)}
            icon="💵"
            color="#17a2b8"
          />
        </div>
      )}

      {viewMode === 'list' ? (
        <div className="sales-list">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID Venta</th>
                  <th>Vehículo ID</th>
                  <th>Cliente ID</th>
                  <th>Método Pago</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {sales.map(sale => (
                  <tr key={sale.id}>
                    <td><strong>{sale.id}</strong></td>
                    <td>{sale.vehicleId}</td>
                    <td>{sale.customerId}</td>
                    <td>{paymentMethodLabels[sale.paymentMethod]}</td>
                    <td className="price">{formatCurrency(sale.salePrice)}</td>
                    <td>
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: statusColors[sale.status] }}
                      >
                        {statusLabels[sale.status]}
                      </span>
                    </td>
                    <td>{formatDate(sale.createdAt)}</td>
                    <td className="actions">
                      {!['COMPLETED', 'CANCELLED'].includes(sale.status) && (
                        <>
                          <button 
                            className="btn btn-sm btn-complete"
                            onClick={() => handleCompleteSale(sale.id)}
                          >
                            ✓
                          </button>
                          <button 
                            className="btn btn-sm btn-cancel"
                            onClick={() => handleCancelSale(sale.id)}
                          >
                            ✕
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="pipeline-view">
          {Object.entries(pipeline).map(([status, pipelineSales]) => (
            <div key={status} className="pipeline-column">
              <div className="pipeline-header" style={{ borderTopColor: statusColors[status] }}>
                <h3>{statusLabels[status]}</h3>
                <span className="count">{pipelineSales.length}</span>
              </div>
              <div className="pipeline-cards">
                {pipelineSales.map(sale => (
                  <div key={sale.id} className="pipeline-card">
                    <div className="pipeline-card-header">
                      <span className="sale-id">{sale.id}</span>
                      <span className="sale-price">{formatCurrency(sale.salePrice)}</span>
                    </div>
                    <div className="pipeline-card-body">
                      <p>🚗 Vehículo: {sale.vehicleId}</p>
                      <p>👤 Cliente: {sale.customerId}</p>
                      <p>💳 {paymentMethodLabels[sale.paymentMethod]}</p>
                    </div>
                    <div className="pipeline-card-footer">
                      <span>{formatDate(sale.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
