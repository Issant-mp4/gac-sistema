from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from database import Base 

# Tabla de Activos Fijos (Inventario de la clínica a 14 campos)
class ActivoDB(Base):
    __tablename__ = "activos"

    codigo_barras = Column(String(50), primary_key=True) 
    codigo_activo = Column(String(50), nullable=True)
    nombre = Column(String(255), nullable=False)
    serie = Column(String(100), nullable=True)
    ubicacion_origen = Column(String(255), nullable=True)
    ubicacion_destino = Column(String(255), nullable=True)
    responsable_origen = Column(String(255), nullable=True)
    responsable_destino = Column(String(255), nullable=True)
    centro_costos_origen = Column(Integer, nullable=True)
    centro_costos_destino = Column(Integer, nullable=True)
    porcentaje = Column(Float, default=100.0)
    secuencia = Column(String(50), nullable=True)
    enlace = Column(String(255), nullable=True)
    archivo_plano = Column(String(255), nullable=True)
    estado = Column(String(50), default="Operativo")

# Tabla de Historial de Movimientos (Traslados)
class MovimientoDB(Base):
    __tablename__ = "movimientos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo_barras = Column(String(50), ForeignKey("activos.codigo_barras"), nullable=False)
    id_usuario = Column(Integer, nullable=False)
    ubicacion_anterior = Column(String(255), nullable=False)
    nueva_ubicacion = Column(String(255), nullable=False)
    fecha_movimiento = Column(DateTime, server_default=func.now())
    observaciones = Column(String(255), nullable=True)