import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Citas from './pages/Citas';
import Calendario from './pages/Calendario';
import Disponibilidad from './pages/Disponibilidad';
import Agendar from './pages/Agendar';

const CLIENTE_ID = 1; // QSD Soft

const navItems = [
  { to: '/',              icon: '📊', label: 'Dashboard' },
  { to: '/calendario',   icon: '📅', label: 'Calendario' },
  { to: '/citas',        icon: '📋', label: 'Citas' },
  { to: '/disponibilidad', icon: '⏰', label: 'Disponibilidad' },
  { to: '/agendar',      icon: '➕', label: 'Nueva Cita' },
];

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">
        <aside className="sidebar">
          <div className="sidebar-logo">
            Q<span>Cal</span>endar
          </div>
          <nav className="sidebar-nav">
            {navItems.map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div style={{ padding: '16px 20px', color: 'rgba(255,255,255,.4)', fontSize: '12px' }}>
            QSD Soft © 2026
          </div>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/"               element={<Dashboard clienteId={CLIENTE_ID} />} />
            <Route path="/calendario"     element={<Calendario clienteId={CLIENTE_ID} />} />
            <Route path="/citas"          element={<Citas clienteId={CLIENTE_ID} />} />
            <Route path="/disponibilidad" element={<Disponibilidad clienteId={CLIENTE_ID} />} />
            <Route path="/agendar"        element={<Agendar clienteId={CLIENTE_ID} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
