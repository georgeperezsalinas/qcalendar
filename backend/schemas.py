from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, time, datetime

# ── Disponibilidad ──
class DisponibilidadBase(BaseModel):
    dia_semana:  int
    hora_inicio: time
    hora_fin:    time
    duracion:    int = 30
    activo:      bool = True

class DisponibilidadCreate(DisponibilidadBase):
    pass

class DisponibilidadOut(DisponibilidadBase):
    id: int
    cliente_id: int
    class Config:
        from_attributes = True

# ── Tipo Cita ──
class TipoCitaBase(BaseModel):
    nombre:      str
    duracion:    int = 30
    descripcion: Optional[str] = None
    color:       Optional[str] = "#3b82f6"
    activo:      bool = True

class TipoCitaCreate(TipoCitaBase):
    pass

class TipoCitaOut(TipoCitaBase):
    id: int
    cliente_id: int
    class Config:
        from_attributes = True

# ── Cita ──
class CitaCreate(BaseModel):
    tipo_cita_id:    Optional[int] = None
    nombre_contacto: str
    email_contacto:  EmailStr
    telefono:        Optional[str] = None
    fecha:           date
    hora_inicio:     time
    notas:           Optional[str] = None
    origen:          Optional[str] = "web"

class CitaOut(BaseModel):
    id:              int
    cliente_id:      int
    nombre_contacto: str
    email_contacto:  str
    telefono:        Optional[str]
    fecha:           date
    hora_inicio:     time
    hora_fin:        time
    estado:          str
    notas:           Optional[str]
    origen:          str
    fecha_creacion:  datetime
    class Config:
        from_attributes = True

# ── Bloqueo ──
class BloqueoCreate(BaseModel):
    fecha:       date
    hora_inicio: Optional[time] = None
    hora_fin:    Optional[time] = None
    todo_el_dia: bool = False
    motivo:      Optional[str] = None

class BloqueoOut(BloqueoCreate):
    id: int
    cliente_id: int
    class Config:
        from_attributes = True

# ── Slot disponible ──
class SlotDisponible(BaseModel):
    fecha:       date
    hora_inicio: time
    hora_fin:    time
    disponible:  bool = True
