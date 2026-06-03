from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date, time, timedelta, datetime
from typing import List
import models, schemas
from database import get_db

router = APIRouter(prefix="/agenda", tags=["agenda"])

def generar_slots(hora_inicio: time, hora_fin: time, duracion: int) -> List[tuple]:
    """Genera lista de slots de tiempo dado un rango y duración en minutos"""
    slots = []
    inicio = datetime.combine(date.today(), hora_inicio)
    fin    = datetime.combine(date.today(), hora_fin)
    
    while inicio + timedelta(minutes=duracion) <= fin:
        slots.append((
            inicio.time(),
            (inicio + timedelta(minutes=duracion)).time()
        ))
        inicio += timedelta(minutes=duracion)
    return slots

@router.get("/slots/{cliente_id}/{fecha}", response_model=List[schemas.SlotDisponible])
def obtener_slots(cliente_id: int, fecha: date, db: Session = Depends(get_db)):
    """Retorna slots disponibles para una fecha específica"""
    
    # Verificar cliente
    cliente = db.query(models.Cliente).filter(
        models.Cliente.id == cliente_id,
        models.Cliente.activo == True
    ).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    # Día de semana (0=Lunes)
    dia_semana = fecha.weekday()

    # Buscar disponibilidad del día
    disponibilidad = db.query(models.Disponibilidad).filter(
        models.Disponibilidad.cliente_id == cliente_id,
        models.Disponibilidad.dia_semana == dia_semana,
        models.Disponibilidad.activo == True
    ).first()

    if not disponibilidad:
        return []

    # Verificar bloqueo total del día
    bloqueo_dia = db.query(models.Bloqueo).filter(
        models.Bloqueo.cliente_id == cliente_id,
        models.Bloqueo.fecha == fecha,
        models.Bloqueo.todo_el_dia == True
    ).first()

    if bloqueo_dia:
        return []

    # Obtener citas ya agendadas ese día
    citas_dia = db.query(models.Cita).filter(
        models.Cita.cliente_id == cliente_id,
        models.Cita.fecha == fecha,
        models.Cita.estado != 'cancelada'
    ).all()

    # Obtener bloqueos parciales
    bloqueos = db.query(models.Bloqueo).filter(
        models.Bloqueo.cliente_id == cliente_id,
        models.Bloqueo.fecha == fecha,
        models.Bloqueo.todo_el_dia == False
    ).all()

    # Generar todos los slots
    todos_slots = generar_slots(
        disponibilidad.hora_inicio,
        disponibilidad.hora_fin,
        disponibilidad.duracion
    )

    # Filtrar slots ocupados
    slots_resultado = []
    for inicio, fin in todos_slots:
        ocupado = False

        # Verificar citas
        for cita in citas_dia:
            if not (fin <= cita.hora_inicio or inicio >= cita.hora_fin):
                ocupado = True
                break

        # Verificar bloqueos parciales
        if not ocupado:
            for bloqueo in bloqueos:
                if bloqueo.hora_inicio and bloqueo.hora_fin:
                    if not (fin <= bloqueo.hora_inicio or inicio >= bloqueo.hora_fin):
                        ocupado = True
                        break

        # No mostrar slots pasados si es hoy
        if fecha == date.today():
            ahora = datetime.now().time()
            if inicio <= ahora:
                ocupado = True

        slots_resultado.append(schemas.SlotDisponible(
            fecha=fecha,
            hora_inicio=inicio,
            hora_fin=fin,
            disponible=not ocupado
        ))

    return slots_resultado


@router.get("/slots-disponibles/{cliente_id}/{fecha}", response_model=List[schemas.SlotDisponible])
def obtener_slots_disponibles(cliente_id: int, fecha: date, db: Session = Depends(get_db)):
    """Retorna SOLO slots disponibles (sin los ocupados)"""
    todos = obtener_slots(cliente_id, fecha, db)
    return [s for s in todos if s.disponible]


@router.get("/proximos-disponibles/{cliente_id}", response_model=List[schemas.SlotDisponible])
def proximos_disponibles(
    cliente_id: int, 
    dias: int = 7,
    db: Session = Depends(get_db)
):
    """Retorna slots disponibles para los próximos N días"""
    resultado = []
    hoy = date.today()
    
    for i in range(dias):
        fecha = hoy + timedelta(days=i)
        slots = obtener_slots_disponibles(cliente_id, fecha, db)
        resultado.extend(slots[:4])  # máximo 4 slots por día
        
        if len(resultado) >= 12:  # máximo 12 slots en total
            break
    
    return resultado
