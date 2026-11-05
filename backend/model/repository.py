from sqlalchemy import Column, Integer, String, Date, ForeignKey,Boolean
from database.database import Base 
from sqlalchemy.orm import relationship
from datetime import datetime

class Repository(Base):
    __tablename__ = "repository"
    
    repository_pk = Column(Integer, primary_key=True, index=True)
    link = Column(String)
    repository_description = Column(String)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    repositorygroups = relationship("RepositoryGroups", back_populates="repository")