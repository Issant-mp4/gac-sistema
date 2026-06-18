import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Optional

from database import get_db, engine
import models
import csv
import io
from sqlalchemy import text 

# Crear las tablas nuevas automáticamente si no existen
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="API GAC - Clínica San Rafael")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- NUEVO MODELO QUE ACEPTA LOS 14 CAMPOS SIN ERROR 422 ---
class ActivoInput(BaseModel):
    codigo_activo: str
    placa: str
    nombre: str
    serie: str
    ubicacion_origen: str
    ubicacion_destino: str
    responsable_origen: str
    responsable_destino: str
    centro_costos_origen: int
    centro_costos_destino: int
    porcentaje: float
    secuencia: str
    enlace: str
    archivo_plano: str

class MovimientoInput(BaseModel):
    codigo_barras: str
    id_usuario: int
    nueva_ubicacion: str
    observaciones: Optional[str] = None


@app.get("/")
def ruta_principal():
    return {"mensaje": "¡Backend GAC 14 campos conectado con éxito!"}

# REGISTRAR UN ACTIVO NUEVO EN LA BASE DE DATOS
@app.post("/activos")
def registrar_nuevo_activo(activo: ActivoInput, db: Session = Depends(get_db)):
    # Verificamos por la placa (codigo de barras)
    existe = db.query(models.ActivoDB).filter(models.ActivoDB.codigo_barras == activo.placa).first()
    if existe:
        raise HTTPException(status_code=400, detail="Error: Esta placa de activo ya existe en el sistema.")
    
    nuevo_equipo = models.ActivoDB(
        codigo_barras=activo.placa,
        codigo_activo=activo.codigo_activo,
        nombre=activo.nombre,
        serie=activo.serie,
        ubicacion_origen=activo.ubicacion_origen,
        ubicacion_destino=activo.ubicacion_destino,
        responsable_origen=activo.responsable_origen,
        responsable_destino=activo.responsable_destino,
        centro_costos_origen=activo.centro_costos_origen,
        centro_costos_destino=activo.centro_costos_destino,
        porcentaje=activo.porcentaje,
        secuencia=activo.secuencia,
        enlace=activo.enlace,
        archivo_plano=activo.archivo_plano,
        estado="Operativo"
    )
    
    db.add(nuevo_equipo)
    db.commit()
    
    return {"estado": "Éxito", "mensaje": "¡Activo registrado contablemente!"}

# CONSULTAR UN ACTIVO
@app.get("/activos/{codigo_barras}")
def consultar_activo(codigo_barras: str, db: Session = Depends(get_db)):
    activo = db.query(models.ActivoDB).filter(models.ActivoDB.codigo_barras == codigo_barras).first()
    if not activo:
        raise HTTPException(status_code=404, detail="Activo no registrado en la clínica")
    return activo

# TRASLADOS
@app.post("/movimientos")
def registrar_movimiento(datos: MovimientoInput, db: Session = Depends(get_db)):
    activo = db.query(models.ActivoDB).filter(models.ActivoDB.codigo_barras == datos.codigo_barras).first()
    if not activo:
        raise HTTPException(status_code=404, detail="No se puede mover un activo que no existe")
    
    ubicacion_anterior = activo.ubicacion_destino # La ubicación actual es la de destino anterior
    
    try:
        activo.ubicacion_destino = datos.nueva_ubicacion
        nuevo_traslado = models.MovimientoDB(
            codigo_barras=datos.codigo_barras,
            id_usuario=int(datos.id_usuario),
            ubicacion_anterior=ubicacion_anterior,
            nueva_ubicacion=datos.nueva_ubicacion,
            observaciones=datos.observaciones
        )
        db.add(nuevo_traslado)
        db.commit()
        return {"estado": "Éxito", "mensaje": "Traslado guardado."}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Error al registrar el traslado.")

@app.get("/historial")
def ver_historial(db: Session = Depends(get_db)):
    registros = db.query(models.MovimientoDB).all()
    return {"total_movimientos": len(registros), "registros": registros}