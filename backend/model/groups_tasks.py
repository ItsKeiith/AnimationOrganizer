from sqlalchemy import Column, Integer, String, Date, ForeignKey,Boolean
from database.database import Base # Importas la Base que creaste
from sqlalchemy.orm import relationship
from datetime import datetime

class GroupTasks(Base):
    # Nombre de la tabla en tu base de datos (Postgres/SQLite)
    __tablename__ = "group_tasks" 

    # Definición de las columnas basándonos en tu código
    group_tasks_pk = Column(Integer, primary_key=True, index=True)
    group_tasks_name = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=True)
    
 
    
    #Foreign Keys
    task_pk = Column(Integer, ForeignKey("tasks.tasks_pk")) 
    user_pk = Column(Integer, ForeignKey("user.user_pk"))
    
    #Relationships
    task = relationship("Tasks", back_populates="group_tasks")
    user = relationship("User", back_populates="group_tasks")
