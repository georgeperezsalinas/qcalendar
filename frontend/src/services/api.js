import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
});

// ── Agenda ──
export const getSlots = (clienteId, fecha) =>
  api.get(`/agenda/slots-disponibles/${clienteId}/${fecha}`);

export const getProximosSlots = (clienteId, dias = 7) =>
  api.get(`/agenda/proximos-disponibles/${clienteId}?dias=${dias}`);

// ── Citas ──
export const crearCita = (clienteId, data) =>
  api.post(`/citas/?cliente_id=${clienteId}`, data);

export const listarCitas = (clienteId, params = {}) =>
  api.get(`/citas/?cliente_id=${clienteId}`, { params });

export const citasHoy = (clienteId) =>
  api.get(`/citas/hoy?cliente_id=${clienteId}`);

export const cancelarCita = (citaId, token) =>
  api.patch(`/citas/${citaId}/cancelar?token=${token}`);

export const completarCita = (citaId) =>
  api.patch(`/citas/${citaId}/completar`);

// ── Disponibilidad ──
export const getDisponibilidad = (clienteId) =>
  api.get(`/disponibilidad/${clienteId}`);

export const guardarDisponibilidad = (clienteId, data) =>
  api.post(`/disponibilidad/${clienteId}`, data);

export const eliminarDisponibilidad = (clienteId, diaSemana) =>
  api.delete(`/disponibilidad/${clienteId}/${diaSemana}`);

export default api;
