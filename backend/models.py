from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.sql import func
from database import Base # Nota: Sin el punto para que el script suelto funcione directo

# Tabla de Activos Fijos (Inventario de la clínica)
class ActivoDB(Base):
    __tablename__ = "activos"

    codigo_barras = Column(String, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    marca = Column(String, nullable=False)
    modelo = Column(String, nullable=False)
    ubicacion_actual = Column(String, nullable=False)
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