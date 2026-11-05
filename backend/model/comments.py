from sqlalchemy import Column, Integer, String, Date, ForeignKey,Boolean
from database.database import Base 
from sqlalchemy.orm import relationship
from datetime import datetime

class Comments(Base):
    __tablename__ = "comments"
    
    comments_pk = Column(Integer, primary_key=True, index=True)
    comments_description = Column(String)
    comments_created_at = Column(Date)
    comments_updated_at = Column(Date)
    created_by = Column(String)
    is_active = Column(Boolean, default=True)
    
    #FK
    tasks_fk = Column(Integer, ForeignKey("tasks.tasks_pk"))
    
    # Relationships
    task = relationship("Tasks", back_populates="comments")