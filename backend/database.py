from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Nombre del archivo donde se guardarán tus datos
SQLALCHEMY_DATABASE_URL = "sqlite:///./gac_clinica.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Función que usa FastAPI para conectar
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()