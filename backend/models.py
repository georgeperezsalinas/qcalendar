from sqlalchemy import Column, Integer, String, Boolean, Date, Time, Text, ForeignKey, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Cliente(Base):
    __tablename__ = "clientes"
    id             = Column(Integer, primary_key=True, index=True)
    nombre_empresa = Column(String(100), nullable=False)
    email          = Column(String(100), unique=True, nullable=False)
    telefono       = Column(String(20))
    password_hash  = Column(String(255))
    zona_horaria   = Column(String(50), default="America/Lima")
    activo         = Column(Boolean, default=True)
    fecha_alta     = Column(TIMESTAMP, server_default=func.now())

    disponibilidad = relationship("Disponibilidad", back_populates="cliente")
    tipos_cita     = relationship("TipoCita", back_populates="cliente")
    citas          = relationship("Cita", back_populates="cliente")
    bloqueos       = relationship("Bloqueo", back_populates="cliente")

class Disponibilidad(Base):
    __tablename__ = "disponibilidad"
    id          = Column(Integer, primary_key=True, index=True)
    cliente_id  = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    dia_semana  = Column(Integer, nullable=False)
    hora_inicio = Column(Time, nullable=False)
    hora_fin    = Column(Time, nullable=False)
    duracion    = Column(Integer, default=30)
    activo      = Column(Boolean, default=True)

    cliente = relationship("Cliente", back_populates="disponibilidad")

class TipoCita(Base):
    __tablename__ = "tipos_cita"
    id          = Column(Integer, primary_key=True, index=True)
    cliente_id  = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    nombre      = Column(String(100), nullable=False)
    duracion    = Column(Integer, default=30)
    descripcion = Column(Text)
    color       = Column(String(7), default="#coral")
    activo      = Column(Boolean, default=True)

    cliente = relationship("Cliente", back_populates="tipos_cita")
    citas   = relationship("Cita", back_populates="tipo_cita")

class Cita(Base):
    __tablename__ = "citas"
    id              = Column(Integer, primary_key=True, index=True)
    cliente_id      = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    tipo_cita_id    = Column(Integer, ForeignKey("tipos_cita.id"))
    nombre_contacto = Column(String(100), nullable=False)
    email_contacto  = Column(String(100), nullable=False)
    telefono        = Column(String(30))
    fecha           = Column(Date, nullable=False)
    hora_inicio     = Column(Time, nullable=False)
    hora_fin        = Column(Time, nullable=False)
    estado          = Column(String(20), default="confirmada")
    notas           = Column(Text)
    origen          = Column(String(20), default="web")
    token_cancelar  = Column(String(64), unique=True)
    fecha_creacion  = Column(TIMESTAMP, server_default=func.now())
    fecha_update    = Column(TIMESTAMP, server_default=func.now())

    cliente   = relationship("Cliente", back_populates="citas")
    tipo_cita = relationship("TipoCita", back_populates="citas")

class Bloqueo(Base):
    __tablename__ = "bloqueos"
    id          = Column(Integer, primary_key=True, index=True)
    cliente_id  = Column(Integer, ForeignKey("clientes.id"), nullable=False)
    fecha       = Column(Date, nullable=False)
    hora_inicio = Column(Time)
    hora_fin    = Column(Time)
    todo_el_dia = Column(Boolean, default=False)
    motivo      = Column(String(100))

    cliente = relationship("Cliente", back_populates="bloqueos")
