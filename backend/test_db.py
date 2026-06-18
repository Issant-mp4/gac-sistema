from database import engine, Base
import models

print("Intentando crear la base de datos...")
models.Base.metadata.create_all(bind=engine)
print("¡Éxito! Las tablas han sido creadas. Revisa tu carpeta.")