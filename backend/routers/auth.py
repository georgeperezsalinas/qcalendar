from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from typing import Optional
import models
from database import get_db
import os

router = APIRouter(prefix="/auth", tags=["auth"])

SECRET_KEY = os.getenv("SECRET_KEY", "qsd2026secretkey")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# ── Schemas ──
class Token(BaseModel):
    access_token: str
    token_type:   str
    cliente_id:   int
    nombre:       str

class TokenData(BaseModel):
    email:      Optional[str] = None
    cliente_id: Optional[int] = None

# ── Helpers ──
def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_cliente(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload    = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email      = payload.get("sub")
        cliente_id = payload.get("cliente_id")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    cliente = db.query(models.Cliente).filter(
        models.Cliente.email == email,
        models.Cliente.activo == True
    ).first()

    if not cliente:
        raise credentials_exception
    return cliente

# ── Endpoints ──
@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    cliente = db.query(models.Cliente).filter(
        models.Cliente.email == form_data.username,
        models.Cliente.activo == True
    ).first()

    if not cliente or not cliente.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )

    if not verify_password(form_data.password, cliente.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos"
        )

    token = create_access_token({
        "sub":        cliente.email,
        "cliente_id": cliente.id
    })

    return {
        "access_token": token,
        "token_type":   "bearer",
        "cliente_id":   cliente.id,
        "nombre":       cliente.nombre_empresa
    }

@router.get("/me")
def get_me(current: models.Cliente = Depends(get_current_cliente)):
    return {
        "id":             current.id,
        "nombre_empresa": current.nombre_empresa,
        "email":          current.email,
        "telefono":       current.telefono
    }

@router.post("/set-password")
def set_password(
    email: str,
    password: str,
    db: Session = Depends(get_db)
):
    """Solo para setup inicial — desactivar en producción"""
    cliente = db.query(models.Cliente).filter(
        models.Cliente.email == email
    ).first()
    if not cliente:
        raise HTTPException(status_code=404, detail="Cliente no encontrado")

    cliente.password_hash = get_password_hash(password)
    db.commit()
    return {"message": "Password actualizado"}
