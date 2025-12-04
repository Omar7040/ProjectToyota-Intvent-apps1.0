import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export function Navbar() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <span className="brand-icon">🚗</span>
          <span className="brand-text">Toyota Inventory</span>
        </Link>
      </div>
      <ul className="navbar-menu">
        <li className={isActive('/') ? 'active' : ''}>
          <Link to="/">Dashboard</Link>
        </li>
        <li className={isActive('/inventory') ? 'active' : ''}>
          <Link to="/inventory">Inventario</Link>
        </li>
        <li className={isActive('/vin-scanner') ? 'active' : ''}>
          <Link to="/vin-scanner">VIN Scanner</Link>
        </li>
        <li className={isActive('/customers') ? 'active' : ''}>
          <Link to="/customers">Clientes</Link>
        </li>
        <li className={isActive('/sales') ? 'active' : ''}>
          <Link to="/sales">Ventas</Link>
        </li>
      </ul>
    </nav>
  );
}
