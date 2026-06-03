import { useState, useEffect } from 'react';
import { getSlots, crearCita } from '../services/api';
import dayjs from 'dayjs';

export default function Agendar({ clienteId }) {
  const [fecha,      setFecha]      = useState(dayjs().format('YYYY-MM-DD'));
  const [slots,      setSlots]      = useState([]);
  const [slotSel,    setSlotSel]    = useState(null);
  const [loading,    setLoading]    = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [form, setForm] = useState({
    nombre_contacto: '',
    email_contacto:  '',
    telefono:        '',
    notas:           '',
    origen:          'manual'
  });

  useEffect(() => {
    if (!fecha) return;
    setLoading(true);
    setSlotSel(null);
    getSlots(clienteId, fecha)
      .then(r => setSlots(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fecha, clienteId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!slotSel) return alert('Selecciona un horario');
    try {
      await crearCita(clienteId, {
        ...form,
        fecha,
        hora_inicio: slotSel.hora_inicio
      });
      setSuccess(true);
      setSlotSel(null);
      setForm({ nombre_contacto: '', email_contacto: '', telefono: '', notas: '', origen: 'manual' });
    } catch(e) {
      alert(e.response?.data?.detail || 'Error al agendar');
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">➕ Nueva Cita</div>
      </div>
      <div className="page-body">
        {success && (
          <div style={{
            background: '#dcfce7', border: '1px solid #86efac',
            borderRadius: 8, padding: '12px 16px', marginBottom: 20,
            color: '#15803d', display: 'flex', justifyContent: 'space-between'
          }}>
            ✅ Cita agendada exitosamente
            <button onClick={() => setSuccess(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Selector de fecha y slots */}
          <div className="card">
            <h3 style={{ marginBottom: 16, fontSize: 15 }}>📅 Seleccionar fecha y hora</h3>
            <div className="form-group">
              <label className="form-label">Fecha</label>
              <input
                type="date"
                className="form-input"
                value={fecha}
                min={dayjs().format('YYYY-MM-DD')}
                onChange={e => setFecha(e.target.value)}
              />
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-2)' }}>
                Cargando horarios...
              </div>
            ) : slots.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 24, color: 'var(--text-2)' }}>
                No hay horarios disponibles para este día
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 8 }}>
                {slots.map(slot => (
                  <button
                    key={slot.hora_inicio}
                    onClick={() => setSlotSel(slot)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: 8,
                      border: `2px solid ${slotSel?.hora_inicio === slot.hora_inicio ? 'var(--coral)' : 'var(--border)'}`,
                      background: slotSel?.hora_inicio === slot.hora_inicio ? '#fff7ed' : 'var(--white)',
                      color: slotSel?.hora_inicio === slot.hora_inicio ? 'var(--coral)' : 'var(--text)',
                      fontWeight: 500, fontSize: 14,
                      cursor: 'pointer', transition: 'all .15s'
                    }}
                  >
                    {slot.hora_inicio.substring(0, 5)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Formulario */}
          <div className="card">
            <h3 style={{ marginBottom: 16, fontSize: 15 }}>👤 Datos del cliente</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nombre completo *</label>
                <input
                  className="form-input"
                  placeholder="Juan Pérez"
                  value={form.nombre_contacto}
                  onChange={e => setForm({...form, nombre_contacto: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="juan@email.com"
                  value={form.email_contacto}
                  onChange={e => setForm({...form, email_contacto: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Teléfono</label>
                <input
                  className="form-input"
                  placeholder="51999999999"
                  value={form.telefono}
                  onChange={e => setForm({...form, telefono: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Notas</label>
                <textarea
                  className="form-input"
                  placeholder="Información adicional..."
                  rows={3}
                  style={{ height: 'auto', padding: '10px 12px' }}
                  value={form.notas}
                  onChange={e => setForm({...form, notas: e.target.value})}
                />
              </div>

              {slotSel && (
                <div style={{
                  background: '#fff7ed', border: '1px solid #fed7aa',
                  borderRadius: 8, padding: '10px 14px', marginBottom: 16,
                  fontSize: 14, color: 'var(--coral)'
                }}>
                  ⏰ {dayjs(fecha).format('DD/MM/YYYY')} a las {slotSel.hora_inicio.substring(0,5)}
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Confirmar cita
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
