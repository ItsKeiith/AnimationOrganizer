from sqlalchemy import Column, Integer, String, Date, ForeignKey,Boolean
from database.database import Base # Importas la Base que creaste
from sqlalchemy.orm import relationship
from datetime import datetime

class PermissionsGroup(Base):
    # Nombre de la tabla en tu base de datos (Postgres/SQLite)
    __tablename__ = "permissions_group" 

    # Definición de las columnas basándonos en tu código
    permission_group_pk = Column(Integer, primary_key=True, index=True)
    permission_group_name = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=True)
    
 
    
    #Foreign Keys
    permission_pk = Column(Integer, ForeignKey("permission.permission_pk")) 
    
    #Relationships
    permission = relationship("Permissions", back_populates="permission_groups")