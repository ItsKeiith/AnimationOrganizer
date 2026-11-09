from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from datetime import date

from model.user import User
from model.rol import Role
from model.tasks import Tasks
from model.files_tasks import FilesTasks
from model.files_tasks_groups import FilesTasksGroups
from model.files_tasks_type import FilesTasksTypes
from model.groups_tasks_views import GroupsTasksViews
from model.groups_tasks import GroupTasks
from model.permisions import Permissions
from model.permissions_group import PermissionsGroup
from model.views import Views   

from sqlalchemy.orm import Session
from database.database import SessionLocal, engine

router = APIRouter()

class TasksClass(BaseModel):
    tasks_pk: int
    task_name: str
    task_description: str
    task_status: str
    task_created_at: date
    task_updated_at: date
    tasks_order: int
    tasks_duration:str
    is_estatic:bool
    is_active: bool
    
# Conexion a la base de datos 
async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoints
# GET
@router.get("/tasks")
async def obtener_tasks(db: Session = Depends(get_db)):
    tasks = db.query(Tasks).all()

    return {
        "mensaje": "Conexión a la base de datos exitosa", 
        "total_part": len(tasks),
        "data": tasks
    }

# POST
@router.post("/tasks")
def create_task(
    task_data: TasksClass,
    db: Session = Depends(get_db)
):
    existing_task = db.query(Tasks).filter(
        Tasks.task_name == task_data.task_name
    ).first()

    if existing_task:
        raise HTTPException(
            status_code=400,
            detail="Task name already exists"
        )

    new_task = Tasks(
        tasks_pk=task_data.tasks_pk,
        task_name=task_data.task_name,
        task_description=task_data.task_description,
        task_status=task_data.task_status,
        task_created_at=task_data.task_created_at,
        task_updated_at=task_data.task_updated_at,
        tasks_order = task_data.tasks_order,
        tasks_duration = task_data.tasks_duration,
        is_estatic = task_data.is_estatic,
        is_active=task_data.is_active,
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return {
        "message": "Task created successfully",
        "data": new_task
    }

# POST BULK
@router.post("/tasks/bulk")
def create_tasks_bulk(
    tasks_list: List[TasksClass],
    db: Session = Depends(get_db)
):
    tasks_to_insert = [
        Tasks(
        tasks_pk=task.tasks_pk,
        task_name=task.task_name,
        task_description=task.task_description,
        task_status=task.task_status,
        task_created_at=task.task_created_at,
        task_updated_at=task.task_updated_at,
        tasks_order = task.tasks_order,
        tasks_duration = task.tasks_duration,
        is_estatic = task.is_estatic,
        is_active=task.is_active,
        )
        for task in tasks_list
    ]

    db.add_all(tasks_to_insert)
    db.commit()

    return {
        "message": f"{len(tasks_to_insert)} tasks inserted"
    }

# PUT
@router.put("/tasks/{task_id}")
def update_task(
    task_id: int,
    task_data: TasksClass,
    db: Session = Depends(get_db)
):
    task_actual = db.query(Tasks).filter(
        Tasks.tasks_pk == task_id
    ).first()

    if not task_actual:
        raise HTTPException(
            status_code=404,
            detail="Task not found"
        )

    task_actual.task_name = task_data.task_name,
    task_actual.task_description = task_data.task_description,
    task_actual.task_status = task_data.task_status,
    task_actual.task_created_at = task_data.task_created_at,
    task_actual.task_updated_at = task_data.task_updated_at,
    task_actual.tasks_order = task_data.tasks_order,
    task_actual.tasks_duration = task_data.tasks_duration,
    task_actual.is_estatic = task_data.is_estatic,
    task_actual.is_active = task_data.is_active,

    db.commit()
    db.refresh(task_actual)

    return {
        "message": "Task updated",
        "data": task_actual
    }

# DELETE
@router.delete("/tasks/{tasks_pk}")
async def borrar_task(tasks_pk: int, db: Session = Depends(get_db)):
    task_actual = db.query(Tasks).filter(
        Tasks.tasks_pk == tasks_pk
    ).first() 

    if not task_actual:
        raise HTTPException(status_code=404, detail="Task no encontrado")

    task_actual.is_active = False
    db.commit()
    
    return {"mensaje": f"Task con ID {tasks_pk} desactivado correctamente"}
