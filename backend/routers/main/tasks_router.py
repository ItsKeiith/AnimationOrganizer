from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List
from datetime import date

from model.user import User
from model.rol import Role
from model.tasks import Tasks
from model.files_tasks import FilesTasks
from model.files_tasks_groups import FilesTasksGroups
from model.files_tasks_type import FilesTasksType
from model.groups_tasks_views import GroupsTasksViews
from model.groups_tasks import GroupTasks
from model.permisions import Permissions
from model.permissions_group import PermissionsGroups

from sqlalchemy.orm import Session
from database.database import SessionLocal, engine

router = APIRouter()

class TasksClass(BaseModel):
    tasks_pk: int
    tasks_name: str
    tasks_description: str
    tasks_status: str
    tasks_created_at: date
    tasks_updated_at: date
    is_active: bool
    groups_tasks_pk: int
    
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
        Tasks.tasks_name == task_data.tasks_name
    ).first()

    if existing_task:
        raise HTTPException(
            status_code=400,
            detail="Task name already exists"
        )

    new_task = Tasks(
        tasks_pk=task_data.tasks_pk,
        tasks_name=task_data.tasks_name,
        tasks_description=task_data.tasks_description,
        tasks_status=task_data.tasks_status,
        tasks_created_at=task_data.tasks_created_at,
        tasks_updated_at=task_data.tasks_updated_at,
        is_active=task_data.is_active,
        groups_tasks_pk=task_data.groups_tasks_pk
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
            tasks_name=task.tasks_name,
            tasks_description=task.tasks_description,
            tasks_status=task.tasks_status,
            tasks_created_at=task.tasks_created_at,
            tasks_updated_at=task.tasks_updated_at,
            is_active=task.is_active,
            groups_tasks_pk=task.groups_tasks_pk
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

    task_actual.tasks_name = task_data.tasks_name
    task_actual.tasks_description = task_data.tasks_description
    task_actual.tasks_status = task_data.tasks_status
    task_actual.tasks_created_at = task_data.tasks_created_at
    task_actual.tasks_updated_at = task_data.tasks_updated_at
    task_actual.is_active = task_data.is_active
    task_actual.groups_tasks_pk = task_data.groups_tasks_pk

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