from sqlalchemy import Column, Integer, String, Date, ForeignKey,Boolean
from database.database import Base # Importas la Base que creaste
from sqlalchemy.orm import relationship
from datetime import datetime

class FilesTasks(Base):
    __tablename__ = "files_tasks" 

    files_tasks_pk = Column(Integer, primary_key=True, index=True)
    files_tasks_name = Column(String, unique=True, index=True)
    link = Column(String)
    is_active = Column(Boolean, default=True)
    
 
    
    #Foreign Keys
    files_tasks_types_pk = Column(Integer, ForeignKey("files_tasks_types.files_tasks_types_pk"))
    
 

    #Relationships
    files_tasks_groups = relationship("FilesTasksGroups", back_populates="file_task")
    file_task_types = relationship("FilesTasksTypes", back_populates="file_tasks")