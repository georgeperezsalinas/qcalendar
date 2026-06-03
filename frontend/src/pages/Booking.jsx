import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProximosSlots, crearCita } from '../services/api';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
dayjs.locale('es');

export default function Booking() {
  const { clienteId } = useParams();
  const [slots,   setSlots]   = useState([]);
  const [slotSel, setSlotSel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step,    setStep]    = useState(1); // 1=elegir slot, 2=datos, 3=confirmado
  const [form, setForm] = useState({
    nombre_contacto: '',
    email_contacto:  '',
    telefono:        '',
    notas:           '',
    origen:          'web'
  });

  useEffect(() => {
    getProximosSlots(clienteId, 7)
      .then(r => setSlots(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [clienteId]);

  // Agrupar slots por fecha
  const slotsPorFecha = slots.reduce((acc, slot) => {
    const fecha = slot.fecha;
    if (!acc[fecha]) acc[fecha] = [];
    acc[fecha].push(slot);
    return acc;
  }, {});

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await crearCita(clienteId, {
        ...form,
        fecha:       slotSel.fecha,
        hora_inicio: slotSel.hora_inicio
      });
      setStep(3);
    } catch(err) {
      alert(err.response?.data?.detail || 'Error al agendar. Intenta con otro horario.');
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        background: '#1e293b', padding: '20px 24px',
        display: 'flex', alignItems: 'center', gap: 12
      }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#fff' }}>
          Q<span style={{ color: '#f97316' }}>Cal</span>endar
        </div>
        <div style={{ color: 'rgba(255,255,255,.4)', fontSize: 14 }}>
          Agenda tu cita
        </div>
      </div>

      <div style={{
        flex: 1, display: 'flex', alignItems: 'center',
        justifyContent: 'center', padding: '32px 24px'
      }}>
        <div style={{ width: '100%', maxWidth: 560 }}>

          {/* Paso 1 — Elegir horario */}
          {step === 1 && (
            <div className="card">
              <h2 style={{ fontSize: 20, marginBottom: 6 }}>
                📅 Elige tu horario
              </h2>
              <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 24 }}>
                Selecciona el día y hora que mejor te convenga
              </p>

              {loading ? (
                <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-2)' }}>
                  Cargando horarios disponibles...
                </div>
              ) : Object.keys(slotsPorFecha).length === 0 ? (
                <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-2)' }}>
                  No hay horarios disponibles por ahora. Intenta más tarde.
                </div>
              ) : (
                Object.entries(slotsPorFecha).map(([fecha, slotsDelDia]) => (
                  <div key={fecha} style={{ marginBottom: 20 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600, color: 'var(--text-2)',
                      textTransform: 'uppercase', letterSpacing: '.05em',
                      marginBottom: 10
                    }}>
                      {dayjs(fecha).format('dddd D [de] MMMM')}
                    </div>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                      gap: 8
                    }}>
                      {slotsDelDia.map(slot => (
                        <button
                          key={slot.hora_inicio}
                          onClick={() => {
                            setSlotSel(slot);
                            setStep(2);
                          }}
                          style={{
                            padding: '10px 8px',
                            borderRadius: 8,
                            border: '1.5px solid var(--border)',
                            background: 'var(--white)',
                            color: 'var(--text)',
                            fontWeight: 500, fontSize: 14,
                            cursor: 'pointer',
                            transition: 'all .15s'
                          }}
                          onMouseEnter={e => {
                            e.target.style.borderColor = '#f97316';
                            e.target.style.color = '#f97316';
                          }}
                          onMouseLeave={e => {
                            e.target.style.borderColor = 'var(--border)';
                            e.target.style.color = 'var(--text)';
                          }}
                        >
                          {slot.hora_inicio.substring(0, 5)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Paso 2 — Datos del cliente */}
          {step === 2 && (
            <div className="card">
              <button
                onClick={() => setStep(1)}
                style={{
                  background: 'none', border: 'none',
                  color: 'var(--text-2)', fontSize: 14,
                  cursor: 'pointer', marginBottom: 16,
                  display: 'flex', alignItems: 'center', gap: 6
                }}
              >
                ← Cambiar horario
              </button>

              <div style={{
                background: '#fff7ed', border: '1px solid #fed7aa',
                borderRadius: 8, padding: '12px 16px', marginBottom: 24,
                fontSize: 14, color: '#f97316', fontWeight: 500
              }}>
                ⏰ {dayjs(slotSel.fecha).format('dddd D [de] MMMM')} a las {slotSel.hora_inicio.substring(0,5)}
              </div>

              <h2 style={{ fontSize: 20, marginBottom: 6 }}>
                👤 Tus datos
              </h2>
              <p style={{ color: 'var(--text-2)', fontSize: 14, marginBottom: 24 }}>
                Completa el formulario para confirmar tu cita
              </p>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Nombre completo *</label>
                  <input
                    className="form-input"
                    placeholder="Juan Pérez"
                    value={form.nombre_contacto}
                    onChange={e => setForm({...form, nombre_contacto: e.target.value})}
                    required autoFocus
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
                  <label className="form-label">Teléfono / WhatsApp</label>
                  <input
                    className="form-input"
                    placeholder="51999999999"
                    value={form.telefono}
                    onChange={e => setForm({...form, telefono: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">¿En qué podemos ayudarte?</label>
                  <textarea
                    className="form-input"
                    placeholder="Cuéntanos brevemente sobre tu proyecto..."
                    rows={3}
                    style={{ height: 'auto', padding: '10px 12px' }}
                    value={form.notas}
                    onChange={e => setForm({...form, notas: e.target.value})}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: '100%', justifyContent: 'center', height: 44, marginTop: 8 }}
                >
                  Confirmar cita 🎉
                </button>
              </form>
            </div>
          )}

          {/* Paso 3 — Confirmado */}
          {step === 3 && (
            <div className="card" style={{ textAlign: 'center', padding: 48 }}>
              <div style={{ fontSize: 64, marginBottom: 16 }}>🎉</div>
              <h2 style={{ fontSize: 24, marginBottom: 8 }}>¡Cita confirmada!</h2>
              <p style={{ color: 'var(--text-2)', marginBottom: 24 }}>
                Te hemos registrado para el{' '}
                <strong>{dayjs(slotSel.fecha).format('dddd D [de] MMMM')}</strong>{' '}
                a las <strong>{slotSel.hora_inicio.substring(0,5)}</strong>
              </p>
              <div style={{
                background: '#dcfce7', border: '1px solid #86efac',
                borderRadius: 8, padding: '12px 16px',
                color: '#15803d', fontSize: 14, marginBottom: 24
              }}>
                ✅ Recibirás un email de confirmación en {form.email_contacto}
              </div>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setStep(1);
                  setSlotSel(null);
                  setForm({ nombre_contacto: '', email_contacto: '', telefono: '', notas: '', origen: 'web' });
                }}
              >
                Agendar otra cita
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{
        textAlign: 'center', padding: '16px',
        fontSize: 12, color: 'var(--text-2)',
        borderTop: '1px solid var(--border)'
      }}>
        Powered by <a href="https://qsdsoft.com" style={{ color: '#f97316' }}>QSD Soft</a>
      </div>
    </div>
  );
}
