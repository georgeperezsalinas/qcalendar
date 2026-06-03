from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, timedelta
from typing import List, Optional
import models, schemas
from database import get_db
import secrets

router = APIRouter(prefix="/citas", tags=["citas"])

@router.post("/", response_model=schemas.CitaOut)
def crear_cita(
    cliente_id: int,
    cita: schemas.CitaCreate,
    db: Session = Depends(get_db)
):
    """Agenda una nueva cita verificando disponibilidad"""
    
    # Verificar que el slot esté disponible
    citas_existentes = db.query(models.Cita).filter(
        models.Cita.cliente_id == cliente_id,
        models.Cita.fecha == cita.fecha,
        models.Cita.hora_inicio == cita.hora_inicio,
        models.Cita.estado != 'cancelada'
    ).first()

    if citas_existentes:
        raise HTTPException(
            status_code=409, 
            detail="Este horario ya está ocupado"
        )

    # Calcular hora_fin según duración del tipo de cita
    duracion = 30
    if cita.tipo_cita_id:
        tipo = db.query(models.TipoCita).filter(
            models.TipoCita.id == cita.tipo_cita_id
        ).first()
        if tipo:
            duracion = tipo.duracion

    from datetime import datetime, timedelta
    hora_fin = (
        datetime.combine(date.today(), cita.hora_inicio) + 
        timedelta(minutes=duracion)
    ).time()

    # Crear cita
    nueva_cita = models.Cita(
        cliente_id      = cliente_id,
        tipo_cita_id    = cita.tipo_cita_id,
        nombre_contacto = cita.nombre_contacto,
        email_contacto  = cita.email_contacto,
        telefono        = cita.telefono,
        fecha           = cita.fecha,
        hora_inicio     = cita.hora_inicio,
        hora_fin        = hora_fin,
        notas           = cita.notas,
        origen          = cita.origen or 'web',
        token_cancelar  = secrets.token_hex(32)
    )

    db.add(nueva_cita)
    db.commit()
    db.refresh(nueva_cita)
    return nueva_cita


@router.get("/", response_model=List[schemas.CitaOut])
def listar_citas(
    cliente_id: int,
    fecha_desde: Optional[date] = None,
    fecha_hasta: Optional[date] = None,
    estado: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Lista citas con filtros opcionales"""
    query = db.query(models.Cita).filter(
        models.Cita.cliente_id == cliente_id
    )

    if fecha_desde:
        query = query.filter(models.Cita.fecha >= fecha_desde)
    if fecha_hasta:
        query = query.filter(models.Cita.fecha <= fecha_hasta)
    if estado:
        query = query.filter(models.Cita.estado == estado)

    return query.order_by(models.Cita.fecha, models.Cita.hora_inicio).all()


@router.get("/hoy", response_model=List[schemas.CitaOut])
def citas_hoy(cliente_id: int, db: Session = Depends(get_db)):
    """Retorna citas del día de hoy"""
    return db.query(models.Cita).filter(
        models.Cita.cliente_id == cliente_id,
        models.Cita.fecha == date.today(),
        models.Cita.estado != 'cancelada'
    ).order_by(models.Cita.hora_inicio).all()


@router.patch("/{cita_id}/cancelar")
def cancelar_cita(
    cita_id: int,
    token: str,
    db: Session = Depends(get_db)
):
    """Cancela una cita por token"""
    cita = db.query(models.Cita).filter(
        models.Cita.id == cita_id,
        models.Cita.token_cancelar == token
    ).first()

    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada")

    if cita.estado == 'cancelada':
        raise HTTPException(status_code=400, detail="La cita ya está cancelada")

    cita.estado = 'cancelada'
    db.commit()
    return {"message": "Cita cancelada exitosamente"}


@router.patch("/{cita_id}/completar")
def completar_cita(cita_id: int, db: Session = Depends(get_db)):
    """Marca una cita como completada"""
    cita = db.query(models.Cita).filter(
        models.Cita.id == cita_id
    ).first()

    if not cita:
        raise HTTPException(status_code=404, detail="Cita no encontrada")

    cita.estado = 'completada'
    db.commit()
    return {"message": "Cita completada"}
