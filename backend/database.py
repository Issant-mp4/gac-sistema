from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Definimos dónde se guardará el archivo de la base de datos local
DATABASE_URL = "sqlite:///./gac_clinica.db"

# El argumento connect_args es exclusivo y necesario para SQLite
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Creamos una sesión para poder hacer consultas
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Esta será la clase base de la que heredarán nuestros modelos de tablas
Base = declarative_base()

# Función auxiliar para abrir y cerrar la conexión automáticamente
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()