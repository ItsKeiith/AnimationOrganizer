from sqlalchemy import Column, Integer, String, Date, ForeignKey,Boolean
from database.database import Base # Importas la Base que creaste
from sqlalchemy.orm import relationship
from datetime import datetime

class FilesTasksTypes(Base):
    # Nombre de la tabla en tu base de datos (Postgres/SQLite)
    __tablename__ = "files_tasks_types" 

    files_tasks_types_pk = Column(Integer, primary_key=True, index=True)
    files_tasks_types_name = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=True)
    
 

    #Relationships
    file_tasks = relationship("FilesTasks", back_populates="file_task_type")