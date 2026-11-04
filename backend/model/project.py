from sqlalchemy import Column, Integer, String, Date, ForeignKey,Boolean
from database.database import Base 
from sqlalchemy.orm import relationship
from datetime import datetime

class Project(Base):
    __tablename__ = "project"
    
    project_pk = Column(Integer, primary_key=True, index=True)
    project_name = Column(String)
    views_fk = Column(Integer, ForeignKey("views.views_pk"))
    users_fk = Column(Integer, ForeignKey("user.user_pk"))
    is_active = Column(Boolean, default=True)
    
    # Relationships
    views = relationship("Views", back_populates="project")
    user = relationship("User", back_populates="project")