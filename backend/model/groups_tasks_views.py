from sqlalchemy import Column, Integer, String, Date, ForeignKey,Boolean
from database.database import Base # Importas la Base que creaste
from sqlalchemy.orm import relationship
from datetime import datetime

class GroupsTasksViews(Base):
    __tablename__ = "groups_tasks_views" 

    groups_tasks_views_pk = Column(Integer, primary_key=True, index=True)
    groups_tasks_views_name = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=True)
    
 
    
    #Foreign Keys
    task_pk = Column(Integer, ForeignKey("tasks.tasks_pk"))
    views_pk = Column(Integer, ForeignKey("views.views_pk"))


    #Relationships
    task = relationship("Tasks", back_populates="group_tasks_views")
    views = relationship("Views", back_populates="groups_tasks_views")