from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime
from sqlalchemy.sql import func
from database import Base 

# Tabla de Activos Fijos (Inventario de la clínica a 14 campos)
class ActivoDB(Base):
    __tablename__ = "activos"

    codigo_barras = Column(String, primary_key=True, index=True) # Usaremos la Placa como código de barras
    codigo_activo = Column(String, nullable=True)
    nombre = Column(String, nullable=False)
    serie = Column(String, nullable=True)
    ubicacion_origen = Column(String, nullable=True)
    ubicacion_destino = Column(String, nullable=True)
    responsable_origen = Column(String, nullable=True)
    responsable_destino = Column(String, nullable=True)
    centro_costos_origen = Column(Integer, nullable=True)
    centro_costos_destino = Column(Integer, nullable=True)
    porcentaje = Column(Float, default=100.0)
    secuencia = Column(String, nullable=True)
    enlace = Column(String, nullable=True)
    archivo_plano = Column(String, nullable=True)
    estado = Column(String, default="Operativo")

# Tabla de Historial de Movimientos (Traslados)
class MovimientoDB(Base):
    __tablename__ = "movimientos"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    codigo_barras = Column(String, ForeignKey("activos.codigo_barras"), nullable=False)
    id_usuario = Column(Integer, nullable=False)
    ubicacion_anterior = Column(String, nullable=False)
    nueva_ubicacion = Column(String, nullable=False)
    fecha_movimiento = Column(DateTime, server_default=func.now())
    observaciones = Column(String, nullable=True)