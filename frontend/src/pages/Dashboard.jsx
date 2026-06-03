import { useState, useEffect } from 'react';
import { citasHoy, listarCitas } from '../services/api';
import dayjs from 'dayjs';

export default function Dashboard({ clienteId }) {
  const [hoy, setHoy]         = useState([]);
  const [stats, setStats]     = useState({ total: 0, confirmadas: 0, completadas: 0, canceladas: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const [resHoy, resTodas] = await Promise.all([
          citasHoy(clienteId),
          listarCitas(clienteId)
        ]);
        setHoy(resHoy.data);
        const todas = resTodas.data;
        setStats({
          total:      todas.length,
          confirmadas: todas.filter(c => c.estado === 'confirmada').length,
          completadas: todas.filter(c => c.estado === 'completada').length,
          canceladas:  todas.filter(c => c.estado === 'cancelada').length,
        });
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, [clienteId]);

  const statCards = [
    { label: 'Total citas',   value: stats.total,       color: '#3b82f6', icon: '📋' },
    { label: 'Confirmadas',   value: stats.confirmadas,  color: '#22c55e', icon: '✅' },
    { label: 'Completadas',   value: stats.completadas,  color: '#8b5cf6', icon: '🎯' },
    { label: 'Canceladas',    value: stats.canceladas,   color: '#ef4444', icon: '❌' },
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div style={{ color: 'var(--text-2)', fontSize: '14px', marginTop: 4 }}>
            {dayjs().format('dddd, D [de] MMMM [de] YYYY')}
          </div>
        </div>
      </div>

      <div className="page-body">
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
          {statCards.map(s => (
            <div className="card" key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
              <div style={{ fontSize: 32, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ color: 'var(--text-2)', fontSize: 13 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Citas de hoy */}
        <div className="card">
          <h3 style={{ marginBottom: 16, fontSize: 16 }}>
            📅 Citas de hoy — {dayjs().format('D MMM')}
          </h3>
          {loading ? (
            <div style={{ color: 'var(--text-2)', textAlign: 'center', padding: 32 }}>Cargando...</div>
          ) : hoy.length === 0 ? (
            <div style={{ color: 'var(--text-2)', textAlign: 'center', padding: 32 }}>
              No hay citas programadas para hoy
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Hora</th>
                  <th>Cliente</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {hoy.map(cita => (
                  <tr key={cita.id}>
                    <td><strong>{cita.hora_inicio}</strong></td>
                    <td>{cita.nombre_contacto}</td>
                    <td>{cita.email_contacto}</td>
                    <td>{cita.telefono || '—'}</td>
                    <td>
                      <span className={`badge badge-${
                        cita.estado === 'confirmada' ? 'success' :
                        cita.estado === 'completada' ? 'blue' : 'danger'
                      }`}>
                        {cita.estado}
                      </span>
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
