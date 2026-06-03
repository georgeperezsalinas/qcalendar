import { useState, useEffect } from 'react';
import { listarCitas } from '../services/api';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
dayjs.locale('es');

export default function Calendario({ clienteId }) {
  const [mes,    setMes]    = useState(dayjs());
  const [citas,  setCitas]  = useState([]);

  useEffect(() => {
    const desde = mes.startOf('month').format('YYYY-MM-DD');
    const hasta = mes.endOf('month').format('YYYY-MM-DD');
    listarCitas(clienteId, { fecha_desde: desde, fecha_hasta: hasta })
      .then(r => setCitas(r.data))
      .catch(console.error);
  }, [mes, clienteId]);

  const diasMes = [];
  const inicio  = mes.startOf('month');
  const fin     = mes.endOf('month');
  const primerDia = inicio.day() === 0 ? 6 : inicio.day() - 1;

  for (let i = 0; i < primerDia; i++) diasMes.push(null);
  for (let d = 1; d <= fin.date(); d++) diasMes.push(d);

  function citasDia(dia) {
    if (!dia) return [];
    const fecha = mes.date(dia).format('YYYY-MM-DD');
    return citas.filter(c => c.fecha === fecha && c.estado !== 'cancelada');
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">📅 Calendario</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setMes(m => m.subtract(1, 'month'))}>◀</button>
          <span style={{ fontWeight: 600, fontSize: 15, minWidth: 160, textAlign: 'center' }}>
            {mes.format('MMMM YYYY')}
          </span>
          <button className="btn btn-secondary btn-sm" onClick={() => setMes(m => m.add(1, 'month'))}>▶</button>
        </div>
      </div>
      <div className="page-body">
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Cabecera días */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '1px solid var(--border)' }}>
            {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => (
              <div key={d} style={{
                padding: '10px 0', textAlign: 'center',
                fontSize: 12, fontWeight: 600, color: 'var(--text-2)',
                textTransform: 'uppercase', letterSpacing: '.05em'
              }}>{d}</div>
            ))}
          </div>

          {/* Grid días */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {diasMes.map((dia, i) => {
              const citasD = citasDia(dia);
              const esHoy  = dia && mes.date(dia).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD');
              return (
                <div key={i} style={{
                  minHeight: 90, padding: 8,
                  borderRight: '1px solid var(--bg-2)',
                  borderBottom: '1px solid var(--bg-2)',
                  background: esHoy ? '#fff7ed' : 'var(--white)'
                }}>
                  {dia && (
                    <>
                      <div style={{
                        fontSize: 13, fontWeight: esHoy ? 700 : 400,
                        color: esHoy ? 'var(--coral)' : 'var(--text)',
                        marginBottom: 4
                      }}>{dia}</div>
                      {citasD.slice(0, 3).map(c => (
                        <div key={c.id} style={{
                          fontSize: 11, padding: '2px 6px', borderRadius: 4,
                          background: '#dbeafe', color: '#1d4ed8',
                          marginBottom: 2, whiteSpace: 'nowrap',
                          overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>
                          {c.hora_inicio.substring(0,5)} {c.nombre_contacto}
                        </div>
                      ))}
                      {citasD.length > 3 && (
                        <div style={{ fontSize: 11, color: 'var(--text-2)' }}>
                          +{citasD.length - 3} más
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
