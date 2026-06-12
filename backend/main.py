import os
import sys

# Este truco le asegura a Uvicorn y a Python que encuentren database.py y models.py
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional, List
from datetime import datetime

# Importaciones locales conectadas a la base de datos real
from database import get_db, engine
import models

app = FastAPI(title="API GAC - Clínica San Rafael")

# --- CONFIGURACIÓN DE CORS (Permisos de conexión) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # Permite que cualquier aplicación (frontend) se conecte
    allow_credentials=True,
    allow_methods=["*"],        # Permite usar todos los métodos (GET, POST, etc.)
    allow_headers=["*"],        # Permite enviar cualquier tipo de cabecera de datos
)

# --- Modelos de Pydantic ---
class MovimientoInput(BaseModel):
    codigo_barras: str
    id_usuario: int
    nueva_ubicacion: str
    observaciones: Optional[str] = None

class ActivoInput(BaseModel):
    codigo_barras: str
    nombre: str
    marca: str
    modelo: str
    ubicacion_actual: str
    estado: str = "Operativo"

class ActivoInput(BaseModel):
    codigo_barras: str
    nombre: str
    marca: str
    modelo: str
    ubicacion_actual: str
    estado: str = "Operativo"





@app.get("/")
def ruta_principal():
    return {"mensaje": "¡El backend del GAC está conectado a SQLite con éxito!"}


# 5. Endpoint para REGISTRAR un equipo médico completamente nuevo
@app.post("/activos")
def registrar_nuevo_activo(activo: ActivoInput, db: Session = Depends(get_db)):
    # Primero verificamos que no exista ya un equipo con ese código
    existe = db.query(models.ActivoDB).filter(models.ActivoDB.codigo_barras == activo.codigo_barras).first()
    if existe:
        raise HTTPException(status_code=400, detail="Error: Ya existe un equipo registrado con ese código de barras.")
    
    # Preparamos el nuevo equipo para guardarlo
    nuevo_equipo = models.ActivoDB(
        codigo_barras=activo.codigo_barras,
        nombre=activo.nombre,
        marca=activo.marca,
        modelo=activo.modelo,
        ubicacion_actual=activo.ubicacion_actual,
        estado=activo.estado
    )
    
    db.add(nuevo_equipo)
    db.commit()
    db.refresh(nuevo_equipo)
    
    return {
        "estado": "Éxito",
        "mensaje": f"El equipo '{activo.nombre}' (Marca: {activo.marca}) fue registrado correctamente en el sistema."
    }





# 1. Endpoint para CONSULTAR un activo directamente en la Base de Datos
@app.get("/activos/{codigo_barras}")
def consultar_activo(codigo_barras: str, db: Session = Depends(get_db)):
    activo = db.query(models.ActivoDB).filter(models.ActivoDB.codigo_barras == codigo_barras).first()
    
    if not activo:
        raise HTTPException(status_code=404, detail="Activo no registrado en la clínica")
    
    return activo


# 2. Endpoint para REGISTRAR un traslado real en la Base de Datos
@app.post("/movimientos")
def registrar_movimiento(datos: MovimientoInput, db: Session = Depends(get_db)):
    # 1. Verificar si el activo existe en la clínica usando el código de barras
    activo = db.query(models.ActivoDB).filter(models.ActivoDB.codigo_barras == datos.codigo_barras).first()
    if not activo:
        raise HTTPException(status_code=404, detail="No se puede mover un activo que no existe en el sistema")
    
    ubicacion_anterior = activo.ubicacion_actual
    
    try:
        # 2. Actualizar la ubicación actual del activo en su propia tabla
        activo.ubicacion_actual = datos.nueva_ubicacion
        
        # 3. Crear el registro del traslado en el historial (asegurando el id_usuario)
        nuevo_traslado = models.MovimientoDB(
            codigo_barras=datos.codigo_barras,
            id_usuario=int(datos.id_usuario),  # Forzamos que sea un entero para SQL
            ubicacion_anterior=ubicacion_anterior,
            nueva_ubicacion=datos.nueva_ubicacion,
            observaciones=datos.observaciones
        )
        
        # 4. Guardar los cambios permanentemente en el archivo .db
        db.add(nuevo_traslado)
        db.commit()
        db.refresh(nuevo_traslado)
        
        return {
            "estado": "Éxito",
            "mensaje": f"Traslado guardado en SQL. El equipo '{activo.nombre}' pasó a '{datos.nueva_ubicacion}'."
        }
        
    except Exception as e:
        db.rollback()  # Deshace cualquier cambio a medias si hay error
        raise HTTPException(status_code=400, detail=f"Error al registrar en la base de datos: {str(e)}")

# 3. Endpoint para ver el HISTORIAL acumulado en la base de datos
@app.get("/historial")
def ver_historial(db: Session = Depends(get_db)):
    registros = db.query(models.MovimientoDB).all()
    return {"total_movimientos": len(registros), "registros": registros}


# 5. Endpoint para REGISTRAR un equipo médico o de sistemas nuevo
@app.post("/activos")
def registrar_nuevo_activo(activo: ActivoInput, db: Session = Depends(get_db)):
    # Primero verificamos que no exista ya un equipo con ese código
    existe = db.query(models.ActivoDB).filter(models.ActivoDB.codigo_barras == activo.codigo_barras).first()
    if existe:
        raise HTTPException(status_code=400, detail="Error: Ya existe un equipo registrado con ese código de barras.")
    
    # Preparamos el nuevo equipo para guardarlo
    nuevo_equipo = models.ActivoDB(
        codigo_barras=activo.codigo_barras,
        nombre=activo.nombre,
        marca=activo.marca,
        modelo=activo.modelo,
        ubicacion_actual=activo.ubicacion_actual,
        estado=activo.estado
    )
    
    db.add(nuevo_equipo)
    db.commit()
    db.refresh(nuevo_equipo)
    
    return {
        "estado": "Éxito",
        "mensaje": f"El equipo '{activo.nombre}' (Marca: {activo.marca}) fue registrado correctamente en el sistema."
    }


# 4. ENDPOINT EXTRA: Herramienta para sembrar datos de prueba iniciales
@app.post("/sistema/inicializar-datos")
def inicializar_datos(db: Session = Depends(get_db)):
    existe = db.query(models.ActivoDB).first()
    if existe:
        return {"mensaje": "La base de datos ya tiene equipos médicos de prueba cargados."}
    
    monitor = models.ActivoDB(
        codigo_barras="123456789",
        nombre="Monitor de Signos Vitales",
        marca="Mindray",
        modelo="UMEC12",
        ubicacion_actual="Urgencias - Consultorio 1",
        estado="Operativo"
    )
    bomba = models.ActivoDB(
        codigo_barras="987654321",
        nombre="Bomba de Infusión",
        marca="B. Braun",
        modelo="Infusomat",
        ubicacion_actual="UCI - Cama 4",
        estado="En mantenimiento"
    )
    
    db.add(monitor)
    db.add(bomba)
    db.commit()
    
    return {"mensaje": "¡Datos de prueba (Monitor Mindray y Bomba B. Braun) creados con éxito en SQL!"}