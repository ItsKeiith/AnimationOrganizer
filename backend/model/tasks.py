from sqlalchemy import Column, Integer, String, Date, ForeignKey,Boolean
from database.database import Base # Importas la Base que creaste
from sqlalchemy.orm import relationship
from datetime import datetime

class Tasks(Base):
    # Nombre de la tabla en tu base de datos (Postgres/SQLite)
    __tablename__ = "tasks" 

    # Definición de las columnas basándonos en tu código
    tasks_pk = Column(Integer, primary_key=True, index=True)
    task_name = Column(String, unique=True, index=True)
    task_description = Column(String)
    task_status = Column(String)
    task_created_at = Column(Date)
    task_updated_at = Column(Date)
    is_active = Column(Boolean, default=True)
    
    #Relationships
    group_tasks = relationship("GroupTasks", back_populates="task")
    group_tasks_views = relationship("GroupsTasksViews", back_populates="task")
    files_tasks_groups = relationship("FilesTasksGroups", back_populates="task")