import os
import sys

# Este truco le dice a Python que busque en la carpeta actual
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import Base, engine
import models

print("Conectando a la base de datos y creando tablas...")
Base.metadata.create_all(bind=engine)
print("¡Tablas creadas con éxito! Ya puedes revisar tu explorador.")