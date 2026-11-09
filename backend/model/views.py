from sqlalchemy import Column, Integer, String, Date, ForeignKey,Boolean
from database.database import Base # Importas la Base que creaste
from sqlalchemy.orm import relationship
from datetime import datetime

class Views(Base):
    __tablename__ = "views" 

    views_pk = Column(Integer, primary_key=True, index=True)
    views_name = Column(String, unique=True, index=True)
    views_order = Column(Integer)
    is_active = Column(Boolean, default=True)
    
 
    
    #Foreign Keys
    groups_tasks_views_pk = Column(Integer, ForeignKey("groups_tasks_views.groups_tasks_views_pk"))

    #Relationships
    groups_tasks_views = relationship("GroupsTasksViews", back_populates="views")
    project = relationship("Project", back_populates="views")