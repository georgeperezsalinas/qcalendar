from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import agenda, citas, disponibilidad
import models
from database import engine

# Crear tablas si no existen
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="QCalendar API",
    description="Sistema de agendamiento QSD Soft",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://qsdsoft.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(agenda.router)
app.include_router(citas.router)
app.include_router(disponibilidad.router)

@app.get("/")
def root():
    return {
        "app": "QCalendar API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
def health():
    return {"status": "ok"}
