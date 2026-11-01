from sqlalchemy import Column, Integer, String, Date, ForeignKey,Boolean
from database.database import Base # Importas la Base que creaste
from sqlalchemy.orm import relationship
from datetime import datetime

class Permissions(Base):
    # Nombre de la tabla en tu base de datos (Postgres/SQLite)
    __tablename__ = "permission" 

    # Definición de las columnas basándonos en tu código
    permission_pk = Column(Integer, primary_key=True, index=True)
    permission_name = Column(String, unique=True, index=True)
    permission_description = Column(String)
    is_active = Column(Boolean, default=True)
    
    
    #Relationships
    permission_groups = relationship("PermissionGroup", back_populates="permission")