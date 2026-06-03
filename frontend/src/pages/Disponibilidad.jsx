import { useState, useEffect } from 'react';
import { getDisponibilidad, guardarDisponibilidad, eliminarDisponibilidad } from '../services/api';

const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

export default function Disponibilidad({ clienteId }) {
  const [disponibilidad, setDisponibilidad] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ hora_inicio: '09:00', hora_fin: '18:00', duracion: 30 });

  async function cargar() {
    const r = await getDisponibilidad(clienteId);
    setDisponibilidad(r.data);
    setLoading(false);
  }

  useEffect(() => { cargar(); }, [clienteId]);

  async function handleGuardar(diaSemana) {
    await guardarDisponibilidad(clienteId, { ...form, dia_semana: diaSemana });
    setEditando(null);
    cargar();
  }

  async function handleEliminar(diaSemana) {
    if (!confirm('¿Eliminar disponibilidad de este día?')) return;
    await eliminarDisponibilidad(clienteId, diaSemana);
    cargar();
  }

  const getDia = (dia) => disponibilidad.find(d => d.dia_semana === dia);

  return (
    <div>
      <div className="page-header">
        <div className="page-title">⏰ Disponibilidad</div>
      </div>
      <div className="page-body">
        <div className="card">
          <p style={{ color: 'var(--text-2)', marginBottom: 20, fontSize: 14 }}>
            Configura los horarios de atención por día de la semana.
          </p>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 32 }}>Cargando...</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {DIAS.map((nombre, idx) => {
                const dia = getDia(idx);
                const isEditing = editando === idx;
                return (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '14px 16px', borderRadius: 8,
                    border: `1px solid ${dia ? 'var(--border)' : 'var(--bg-2)'}`,
                    background: dia ? 'var(--white)' : 'var(--bg)',
                  }}>
                    <div style={{ width: 100, fontWeight: 600, fontSize: 14 }}>{nombre}</div>

                    {isEditing ? (
                      <>
                        <input type="time" className="form-input" style={{ width: 130 }}
                          value={form.hora_inicio}
                          onChange={e => setForm({...form, hora_inicio: e.target.value})}
                        />
                        <span style={{ color: 'var(--text-2)' }}>a</span>
                        <input type="time" className="form-input" style={{ width: 130 }}
                          value={form.hora_fin}
                          onChange={e => setForm({...form, hora_fin: e.target.value})}
                        />
                        <select className="form-input" style={{ width: 150 }}
                          value={form.duracion}
                          onChange={e => setForm({...form, duracion: parseInt(e.target.value)})}
                        >
                          <option value={15}>15 min</option>
                          <option value={30}>30 min</option>
                          <option value={45}>45 min</option>
                          <option value={60}>1 hora</option>
                        </select>
                        <button className="btn btn-primary btn-sm" onClick={() => handleGuardar(idx)}>Guardar</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setEditando(null)}>Cancelar</button>
                      </>
                    ) : dia ? (
                      <>
                        <div style={{ flex: 1, fontSize: 14, color: 'var(--text-2)' }}>
                          {dia.hora_inicio.substring(0,5)} — {dia.hora_fin.substring(0,5)} · cada {dia.duracion} min
                        </div>
                        <button className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setForm({ hora_inicio: dia.hora_inicio.substring(0,5), hora_fin: dia.hora_fin.substring(0,5), duracion: dia.duracion });
                            setEditando(idx);
                          }}>
                          Editar
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(idx)}>Eliminar</button>
                      </>
                    ) : (
                      <>
                        <div style={{ flex: 1, fontSize: 13, color: 'var(--text-2)' }}>Sin horario configurado</div>
                        <button className="btn btn-secondary btn-sm"
                          onClick={() => {
                            setForm({ hora_inicio: '09:00', hora_fin: '18:00', duracion: 30 });
                            setEditando(idx);
                          }}>
                          + Agregar
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
