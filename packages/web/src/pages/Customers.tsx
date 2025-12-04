import { useEffect, useState } from 'react';
import { customerApi } from '../services/api';
import type { Customer, LeadConversionStats } from '../services/api';
import { StatCard } from '../components/StatCard';
import './Customers.css';

const statusLabels: Record<string, string> = {
  LEAD: 'Lead',
  INTERESTED: 'Interesado',
  NEGOTIATING: 'Negociando',
  APPROVED: 'Aprobado',
  PURCHASED: 'Comprado',
  LOST: 'Perdido'
};

const statusColors: Record<string, string> = {
  LEAD: '#6c757d',
  INTERESTED: '#17a2b8',
  NEGOTIATING: '#ffc107',
  APPROVED: '#28a745',
  PURCHASED: '#28a745',
  LOST: '#dc3545'
};

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [conversionStats, setConversionStats] = useState<LeadConversionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [customerData, statsData] = await Promise.all([
          customerApi.getAll(),
          customerApi.getConversionStats()
        ]);
        setCustomers(customerData);
        setConversionStats(statsData);
        setError(null);
      } catch (err) {
        setError('Error al cargar los clientes');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleStatusChange = async (customerId: string, newStatus: string) => {
    try {
      await customerApi.update(customerId, { status: newStatus });
      // Refresh customers
      const [updatedCustomers, updatedStats] = await Promise.all([
        customerApi.getAll(),
        customerApi.getConversionStats()
      ]);
      setCustomers(updatedCustomers);
      setConversionStats(updatedStats);
    } catch (err) {
      console.error('Error updating customer status:', err);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesFilter = filter === 'ALL' || customer.status === filter;
    const searchLower = searchTerm.toLowerCase();
    const fullName = `${customer.firstName} ${customer.lastName}`.toLowerCase();
    const matchesSearch = searchTerm === '' || 
      fullName.includes(searchLower) ||
      customer.email.toLowerCase().includes(searchLower) ||
      customer.phone.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="customers-page">
        <div className="loading">Cargando clientes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customers-page">
        <div className="error">{error}</div>
      </div>
    );
  }

  return (
    <div className="customers-page">
      <header className="page-header">
        <div className="header-content">
          <h1>👥 Gestión de Clientes</h1>
          <p>Seguimiento de leads y conversiones de ventas</p>
        </div>
      </header>

      {conversionStats && (
        <div className="stats-grid">
          <StatCard
            title="Total Leads"
            value={conversionStats.totalLeads}
            icon="👤"
            color="#4a90d9"
          />
          <StatCard
            title="Convertidos a Venta"
            value={conversionStats.convertedToSale}
            icon="🎯"
            color="#28a745"
          />
          <StatCard
            title="En Progreso"
            value={conversionStats.inProgress}
            icon="🔄"
            color="#ffc107"
          />
          <StatCard
            title="Tasa de Conversión"
            value={`${conversionStats.conversionRate.toFixed(1)}%`}
            icon="📊"
            color="#e94560"
          />
        </div>
      )}

      <div className="filters-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
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
            className={`filter-btn ${filter === 'LEAD' ? 'active' : ''}`}
            onClick={() => setFilter('LEAD')}
          >
            Leads
          </button>
          <button 
            className={`filter-btn ${filter === 'INTERESTED' ? 'active' : ''}`}
            onClick={() => setFilter('INTERESTED')}
          >
            Interesados
          </button>
          <button 
            className={`filter-btn ${filter === 'NEGOTIATING' ? 'active' : ''}`}
            onClick={() => setFilter('NEGOTIATING')}
          >
            Negociando
          </button>
          <button 
            className={`filter-btn ${filter === 'PURCHASED' ? 'active' : ''}`}
            onClick={() => setFilter('PURCHASED')}
          >
            Compradores
          </button>
        </div>
      </div>

      <div className="customers-list">
        {filteredCustomers.map(customer => (
          <div key={customer.id} className="customer-card">
            <div className="customer-header">
              <div className="customer-avatar">
                {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
              </div>
              <div className="customer-info">
                <h3>{customer.firstName} {customer.lastName}</h3>
                <p className="customer-contact">
                  📧 {customer.email} | 📞 {customer.phone}
                </p>
              </div>
              <span 
                className="customer-status" 
                style={{ backgroundColor: statusColors[customer.status] }}
              >
                {statusLabels[customer.status]}
              </span>
            </div>
            
            {customer.address && (
              <p className="customer-address">
                📍 {customer.address}, {customer.city}, {customer.state} {customer.zipCode}
              </p>
            )}
            
            {customer.notes && (
              <p className="customer-notes">
                📝 {customer.notes}
              </p>
            )}
            
            <div className="customer-meta">
              <span>Preferencia: {customer.contactPreference}</span>
              <span>Vehículos interesados: {customer.interestedVehicles.length}</span>
            </div>
            
            <div className="customer-actions">
              {customer.status === 'LEAD' && (
                <button 
                  className="btn btn-sm btn-interested"
                  onClick={() => handleStatusChange(customer.id, 'INTERESTED')}
                >
                  Marcar Interesado
                </button>
              )}
              {customer.status === 'INTERESTED' && (
                <button 
                  className="btn btn-sm btn-negotiating"
                  onClick={() => handleStatusChange(customer.id, 'NEGOTIATING')}
                >
                  Iniciar Negociación
                </button>
              )}
              {customer.status === 'NEGOTIATING' && (
                <>
                  <button 
                    className="btn btn-sm btn-approved"
                    onClick={() => handleStatusChange(customer.id, 'APPROVED')}
                  >
                    Aprobar
                  </button>
                  <button 
                    className="btn btn-sm btn-lost"
                    onClick={() => handleStatusChange(customer.id, 'LOST')}
                  >
                    Marcar Perdido
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="no-results">
          <p>No se encontraron clientes con los filtros seleccionados.</p>
        </div>
      )}
    </div>
  );
}
