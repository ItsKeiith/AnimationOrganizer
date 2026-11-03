from sqlalchemy import Column, Integer, String, Date, ForeignKey,Boolean
from database.database import Base # Importas la Base que creaste
from sqlalchemy.orm import relationship
from datetime import datetime

class Permissions(Base):
    __tablename__ = "permission" 

    permission_pk = Column(Integer, primary_key=True, index=True)
    permission_name = Column(String, unique=True, index=True)
    permission_description = Column(String)
    is_active = Column(Boolean, default=True)
    
    
    #Relationships
    permission_groups = relationship("PermissionsGroup", back_populates="permission")