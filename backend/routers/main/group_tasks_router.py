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

class GroupTasksClass(BaseModel):
    groups_tasks_pk: int
    groups_tasks_name: str
    is_active: bool
    tasks_pk: int
    user_pk: int
    
# Conexion a la base de datos 
async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoints
# GET
@router.get("/groups_tasks")
async def obtener_groups_tasks(db: Session = Depends(get_db)):
    groups_tasks = db.query(GroupTasks).all()

    return {
        "mensaje": "Conexión a la base de datos exitosa", 
        "total_part": len(groups_tasks),
        "data": groups_tasks
    }

# POST
@router.post("/groups_tasks")
def create_group_task(
    group_task_data: GroupTasksClass,
    db: Session = Depends(get_db)
):
    existing_group_task = db.query(GroupTasks).filter(
        GroupTasks.groups_tasks_name == group_task_data.groups_tasks_name
    ).first()

    if existing_group_task:
        raise HTTPException(
            status_code=400,
            detail="Group Task name already exists"
        )

    new_group_task = GroupTasks(
        groups_tasks_pk=group_task_data.groups_tasks_pk,
        groups_tasks_name=group_task_data.groups_tasks_name,
        is_active=group_task_data.is_active,
        tasks_pk=group_task_data.tasks_pk,
        user_pk=group_task_data.user_pk
    )

    db.add(new_group_task)
    db.commit()
    db.refresh(new_group_task)

    return {
        "message": "Group Task created successfully",
        "data": new_group_task
    }

# POST BULK
@router.post("/groups_tasks/bulk")
def create_groups_tasks_bulk(
    group_tasks_list: List[GroupTasksClass],
    db: Session = Depends(get_db)
):
    tasks_to_insert = [
        GroupTasks(
            groups_tasks_pk=item.groups_tasks_pk,
            groups_tasks_name=item.groups_tasks_name,
            is_active=item.is_active,
            tasks_pk=item.tasks_pk,
            user_pk=item.user_pk
        )
        for item in group_tasks_list
    ]

    db.add_all(tasks_to_insert)
    db.commit()

    return {
        "message": f"{len(tasks_to_insert)} group tasks inserted"
    }

# PUT
@router.put("/groups_tasks/{group_task_id}")
def update_group_task(
    group_task_id: int,
    group_task_data: GroupTasksClass,
    db: Session = Depends(get_db)
):
    group_task_actual = db.query(GroupTasks).filter(
        GroupTasks.groups_tasks_pk == group_task_id
    ).first()

    if not group_task_actual:
        raise HTTPException(
            status_code=404,
            detail="Group Task not found"
        )

    group_task_actual.groups_tasks_name = group_task_data.groups_tasks_name
    group_task_actual.is_active = group_task_data.is_active
    group_task_actual.tasks_pk = group_task_data.tasks_pk
    group_task_actual.user_pk = group_task_data.user_pk

    db.commit()
    db.refresh(group_task_actual)

    return {
        "message": "Group Task updated",
        "data": group_task_actual
    }

# DELETE
@router.delete("/groups_tasks/{groups_tasks_pk}")
async def borrar_group_task(groups_tasks_pk: int, db: Session = Depends(get_db)):
    group_task_actual = db.query(GroupTasks).filter(
        GroupTasks.groups_tasks_pk == groups_tasks_pk
    ).first() 

    if not group_task_actual:
        raise HTTPException(status_code=404, detail="Group Task no encontrado")

    group_task_actual.is_active = False
    db.commit()
    
    return {"mensaje": f"Group Task con ID {groups_tasks_pk} desactivado correctamente"}