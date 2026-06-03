from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import get_db

router = APIRouter(prefix="/disponibilidad", tags=["disponibilidad"])

DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']

@router.get("/{cliente_id}", response_model=List[schemas.DisponibilidadOut])
def obtener_disponibilidad(cliente_id: int, db: Session = Depends(get_db)):
    return db.query(models.Disponibilidad).filter(
        models.Disponibilidad.cliente_id == cliente_id
    ).all()

@router.post("/{cliente_id}", response_model=schemas.DisponibilidadOut)
def crear_disponibilidad(
    cliente_id: int,
    disp: schemas.DisponibilidadCreate,
    db: Session = Depends(get_db)
):
    # Verificar si ya existe ese día
    existente = db.query(models.Disponibilidad).filter(
        models.Disponibilidad.cliente_id == cliente_id,
        models.Disponibilidad.dia_semana == disp.dia_semana
    ).first()

    if existente:
        # Actualizar
        for key, value in disp.model_dump().items():
            setattr(existente, key, value)
        db.commit()
        db.refresh(existente)
        return existente

    nueva = models.Disponibilidad(cliente_id=cliente_id, **disp.model_dump())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

@router.delete("/{cliente_id}/{dia_semana}")
def eliminar_disponibilidad(
    cliente_id: int,
    dia_semana: int,
    db: Session = Depends(get_db)
):
    disp = db.query(models.Disponibilidad).filter(
        models.Disponibilidad.cliente_id == cliente_id,
        models.Disponibilidad.dia_semana == dia_semana
    ).first()

    if not disp:
        raise HTTPException(status_code=404, detail="No encontrado")

    db.delete(disp)
    db.commit()
    return {"message": f"Disponibilidad del {DIAS[dia_semana]} eliminada"}
