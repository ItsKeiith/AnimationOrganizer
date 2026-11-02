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

class FilesTasksGroupsClass(BaseModel):
    files_tasks_groups_pk: int
    files_tasks_groups_name: str
    is_active: bool
    task_pk: int
    file_tasks: int

# Conexion a la base de datos 
async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoints
# GET
@router.get("/files_tasks_groups")
async def obtener_files_tasks_groups(db: Session = Depends(get_db)):
    files_tasks_groups = db.query(FilesTasksGroups).all()

    return {
        "mensaje": "Conexión a la base de datos exitosa", 
        "total_part": len(files_tasks_groups),
        "data": files_tasks_groups
    }

# POST
@router.post("/files_tasks_groups")
def create_files_tasks_group(
    group_data: FilesTasksGroupsClass,
    db: Session = Depends(get_db)
):
    existing_group = db.query(FilesTasksGroups).filter(
        FilesTasksGroups.files_tasks_groups_name == group_data.files_tasks_groups_name
    ).first()

    if existing_group:
        raise HTTPException(
            status_code=400,
            detail="Files tasks group name already exists"
        )

    new_group = FilesTasksGroups(
        files_tasks_groups_pk=group_data.files_tasks_groups_pk,
        files_tasks_groups_name=group_data.files_tasks_groups_name,
        is_active=group_data.is_active,
        task_pk=group_data.task_pk,
        file_tasks=group_data.file_tasks
    )

    db.add(new_group)
    db.commit()
    db.refresh(new_group)

    return {
        "message": "Files tasks group created successfully",
        "data": new_group
    }

# POST BULK
@router.post("/files_tasks_groups/bulk")
def create_files_tasks_groups_bulk(
    groups_list: List[FilesTasksGroupsClass],
    db: Session = Depends(get_db)
):
    groups_to_insert = [
        FilesTasksGroups(
            files_tasks_groups_pk=item.files_tasks_groups_pk,
            files_tasks_groups_name=item.files_tasks_groups_name,
            is_active=item.is_active,
            task_pk=item.task_pk,
            file_tasks=item.file_tasks
        )
        for item in groups_list
    ]

    db.add_all(groups_to_insert)
    db.commit()

    return {
        "message": f"{len(groups_to_insert)} files tasks groups inserted"
    }

# PUT
@router.put("/files_tasks_groups/{group_id}")
def update_files_tasks_group(
    group_id: int,
    group_data: FilesTasksGroupsClass,
    db: Session = Depends(get_db)
):
    group_actual = db.query(FilesTasksGroups).filter(
        FilesTasksGroups.files_tasks_groups_pk == group_id
    ).first()

    if not group_actual:
        raise HTTPException(
            status_code=404,
            detail="Files tasks group not found"
        )

    group_actual.files_tasks_groups_name = group_data.files_tasks_groups_name
    group_actual.is_active = group_data.is_active
    group_actual.task_pk = group_data.task_pk
    group_actual.file_tasks = group_data.file_tasks

    db.commit()
    db.refresh(group_actual)

    return {
        "message": "Files tasks group updated",
        "data": group_actual
    }

# DELETE
@router.delete("/files_tasks_groups/{group_pk}")
async def borrar_files_tasks_group(group_pk: int, db: Session = Depends(get_db)):
    group_actual = db.query(FilesTasksGroups).filter(
        FilesTasksGroups.files_tasks_groups_pk == group_pk
    ).first() 

    if not group_actual:
        raise HTTPException(status_code=404, detail="Files tasks group no encontrado")

    group_actual.is_active = False
    db.commit()
    
    return {"mensaje": f"Files tasks group con ID {group_pk} desactivado correctamente"}