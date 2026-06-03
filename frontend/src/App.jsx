import { BrowserRouter, Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Dashboard      from './pages/Dashboard';
import Citas          from './pages/Citas';
import Calendario     from './pages/Calendario';
import Disponibilidad from './pages/Disponibilidad';
import Agendar        from './pages/Agendar';
import Login          from './pages/Login';

const navItems = [
  { to: '/',               icon: '📊', label: 'Dashboard' },
  { to: '/calendario',     icon: '📅', label: 'Calendario' },
  { to: '/citas',          icon: '📋', label: 'Citas' },
  { to: '/disponibilidad', icon: '⏰', label: 'Disponibilidad' },
  { to: '/agendar',        icon: '➕', label: 'Nueva Cita' },
];

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
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
        <div style={{ padding: '12px' }}>
          <div style={{ 
            padding: '10px 12px', borderRadius: 8,
            background: 'rgba(255,255,255,.06)',
            marginBottom: 8
          }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 500 }}>
              {user?.nombre}
            </div>
            <div style={{ color: 'rgba(255,255,255,.45)', fontSize: 12 }}>
              {user?.email}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="nav-item"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <span>🚪</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Routes>
          <Route path="/"               element={<Dashboard      clienteId={user?.cliente_id} />} />
          <Route path="/calendario"     element={<Calendario     clienteId={user?.cliente_id} />} />
          <Route path="/citas"          element={<Citas          clienteId={user?.cliente_id} />} />
          <Route path="/disponibilidad" element={<Disponibilidad clienteId={user?.cliente_id} />} />
          <Route path="/agendar"        element={<Agendar        clienteId={user?.cliente_id} />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
