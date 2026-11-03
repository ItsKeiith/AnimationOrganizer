from sqlalchemy import Column, Integer, String, Date, ForeignKey,Boolean
from database.database import Base # Importas la Base que creaste
from sqlalchemy.orm import relationship
from datetime import datetime

class FilesTasksGroups(Base):
    __tablename__ = "files_tasks_groups" 

    files_tasks_groups_pk = Column(Integer, primary_key=True, index=True)
    files_tasks_groups_name = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=True)
    
 
    
    #Foreign Keys
    task_pk = Column(Integer, ForeignKey("tasks.tasks_pk")) 
    file_task_pk = Column(Integer, ForeignKey("files_tasks.files_tasks_pk"))
 

    #Relationships
    task = relationship("Tasks", back_populates="files_tasks_groups")
    file_task = relationship("FilesTasks", back_populates="files_tasks_groups")