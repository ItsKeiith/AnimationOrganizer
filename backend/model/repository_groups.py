from sqlalchemy import Column, Integer, String, Date, ForeignKey,Boolean
from database.database import Base 
from sqlalchemy.orm import relationship
from datetime import datetime

class RepositoryGroups(Base):
    __tablename__ = "repositorygroups"
    
    repository_groups_pk = Column(Integer, primary_key=True, index=True)
    repository_groups_name = Column(String)
    is_active = Column(Boolean, default=True)

    tasks_fk = Column(Integer, ForeignKey("tasks.tasks_pk"))
    repository_fk = Column(Integer, ForeignKey("repository.repository_pk"))


    
    # Relationships
    task = relationship("Tasks", back_populates="repositorygroups")
    repository = relationship("Repository", back_populates="repositorygroups")