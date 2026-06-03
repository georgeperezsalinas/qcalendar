from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import agenda, citas, disponibilidad, auth
import models
from database import engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="QCalendar API",
    description="Sistema de agendamiento QSD Soft",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://cal.qsdsoft.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(agenda.router)
app.include_router(citas.router)
app.include_router(disponibilidad.router)

@app.get("/")
def root():
    return {"app": "QCalendar API", "version": "1.0.0", "status": "running"}

@app.get("/health")
def health():
    return {"status": "ok"}
