from sqlalchemy import Column, Integer, String, Date, ForeignKey,Boolean
from database.database import Base # Importas la Base que creaste
from sqlalchemy.orm import relationship
from datetime import datetime

class Tasks(Base):
    __tablename__ = "tasks" 

    tasks_pk = Column(Integer, primary_key=True, index=True)
    task_name = Column(String, unique=True, index=True)
    task_description = Column(String)
    task_status = Column(String)
    task_created_at = Column(Date)
    task_updated_at = Column(Date)

    task_due_date = Column(Date)#muy importante para el cronograma y para las deadlines 

    tasks_order = Column(Integer) #este seria el orden donde esta puesto la tasks en las views 
                            #pensar que podemos usar el poryecto para proyectos de animacion 
                            #y proyectos de estaticos como de comic 
    
    tasks_duration = Column(String, nullable=True)#Si llegase a usarse para un poryecto estatico seria null
                            # de lo contrario seria una marca de tiempo asignada desde el front 
                            # marcando minutos y segundos 00hr.00min.00sec
   
    is_estatic= Column(Boolean, default= False)#Al agregar una task se le pregunta al usario en el front
                                                #Si la task sera estatica o sera un proyecto de aniamcion



    is_active = Column(Boolean, default=True)
    
    #Relationships
    group_tasks = relationship("GroupTasks", back_populates="task")
    group_tasks_views = relationship("GroupsTasksViews", back_populates="task")
    files_tasks_groups = relationship("FilesTasksGroups", back_populates="task")
    repositorygroups = relationship("RepositoryGroups", back_populates="task")  
    comments = relationship("Comments", back_populates = "task")