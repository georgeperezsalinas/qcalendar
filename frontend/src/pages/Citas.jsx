import { useState, useEffect } from 'react';
import { listarCitas, cancelarCita, completarCita } from '../services/api';
import dayjs from 'dayjs';

export default function Citas({ clienteId }) {
  const [citas,   setCitas]   = useState([]);
  const [filtro,  setFiltro]  = useState('todas');
  const [loading, setLoading] = useState(true);

  async function cargar() {
    setLoading(true);
    try {
      const r = await listarCitas(clienteId);
      setCitas(r.data);
    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { cargar(); }, [clienteId]);

  const citasFiltradas = citas.filter(c =>
    filtro === 'todas' ? true : c.estado === filtro
  );

  async function handleCompletar(id) {
    await completarCita(id);
    cargar();
  }

  async function handleCancelar(id, token) {
    if (!confirm('¿Cancelar esta cita?')) return;
    await cancelarCita(id, token);
    cargar();
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">📋 Citas</div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['todas','confirmada','completada','cancelada'].map(f => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`btn btn-sm ${filtro === f ? 'btn-primary' : 'btn-secondary'}`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="page-body">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-2)' }}>Cargando...</div>
          ) : citasFiltradas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-2)' }}>No hay citas</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Cliente</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Origen</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {citasFiltradas.map(cita => (
                  <tr key={cita.id}>
                    <td>{dayjs(cita.fecha).format('DD/MM/YYYY')}</td>
                    <td><strong>{cita.hora_inicio.substring(0,5)}</strong></td>
                    <td>{cita.nombre_contacto}</td>
                    <td>{cita.email_contacto}</td>
                    <td>{cita.telefono || '—'}</td>
                    <td>
                      <span className={`badge ${cita.origen === 'whatsapp' ? 'badge-success' : 'badge-blue'}`}>
                        {cita.origen}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${
                        cita.estado === 'confirmada' ? 'success' :
                        cita.estado === 'completada' ? 'blue' :
                        cita.estado === 'cancelada'  ? 'danger' : 'warning'
                      }`}>
                        {cita.estado}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {cita.estado === 'confirmada' && (
                          <>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => handleCompletar(cita.id)}
                            >✅</button>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={() => handleCancelar(cita.id, cita.token_cancelar)}
                            >❌</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
