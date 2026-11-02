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

class FilesTasksClass(BaseModel):
    files_tasks_pk: int
    files_tasks_name: str
    link: str
    is_active: bool
    files_tasks_types_pk: int
    
# Conexion a la base de datos 
async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoints
# GET
@router.get("/files_tasks")
async def obtener_files_tasks(db: Session = Depends(get_db)):
    files_tasks = db.query(FilesTasks).all()

    return {
        "mensaje": "Conexión a la base de datos exitosa", 
        "total_part": len(files_tasks),
        "data": files_tasks
    }

# POST
@router.post("/files_tasks")
def create_file_task(
    file_task_data: FilesTasksClass,
    db: Session = Depends(get_db)
):
    existing_file_task = db.query(FilesTasks).filter(
        FilesTasks.files_tasks_name == file_task_data.files_tasks_name
    ).first()

    if existing_file_task:
        raise HTTPException(
            status_code=400,
            detail="Files tasks name already exists"
        )

    new_file_task = FilesTasks(
        files_tasks_pk=file_task_data.files_tasks_pk,
        files_tasks_name=file_task_data.files_tasks_name,
        link=file_task_data.link,
        is_active=file_task_data.is_active,
        files_tasks_types_pk=file_task_data.files_tasks_types_pk
    )

    db.add(new_file_task)
    db.commit()
    db.refresh(new_file_task)

    return {
        "message": "File task created successfully",
        "data": new_file_task
    }

# POST BULK
@router.post("/files_tasks/bulk")
def create_files_tasks_bulk(
    files_tasks_list: List[FilesTasksClass],
    db: Session = Depends(get_db)
):
    files_tasks_to_insert = [
        FilesTasks(
            files_tasks_pk=item.files_tasks_pk,
            files_tasks_name=item.files_tasks_name,
            link=item.link,
            is_active=item.is_active,
            files_tasks_types_pk=item.files_tasks_types_pk
        )
        for item in files_tasks_list
    ]

    db.add_all(files_tasks_to_insert)
    db.commit()

    return {
        "message": f"{len(files_tasks_to_insert)} files tasks inserted"
    }

# PUT
@router.put("/files_tasks/{file_task_id}")
def update_file_task(
    file_task_id: int,
    file_task_data: FilesTasksClass,
    db: Session = Depends(get_db)
):
    file_task_actual = db.query(FilesTasks).filter(
        FilesTasks.files_tasks_pk == file_task_id
    ).first()

    if not file_task_actual:
        raise HTTPException(
            status_code=404,
            detail="File task not found"
        )

    file_task_actual.files_tasks_name = file_task_data.files_tasks_name
    file_task_actual.link = file_task_data.link
    file_task_actual.is_active = file_task_data.is_active
    file_task_actual.files_tasks_types_pk = file_task_data.files_tasks_types_pk

    db.commit()
    db.refresh(file_task_actual)

    return {
        "message": "File task updated",
        "data": file_task_actual
    }

# DELETE
@router.delete("/files_tasks/{file_tasks_pk}")
async def borrar_file_task(file_tasks_pk: int, db: Session = Depends(get_db)):
    file_task_actual = db.query(FilesTasks).filter(
        FilesTasks.files_tasks_pk == file_tasks_pk
    ).first() 

    if not file_task_actual:
        raise HTTPException(status_code=404, detail="File task no encontrado")

    file_task_actual.is_active = False
    db.commit()
    
    return {"mensaje": f"File task con ID {file_tasks_pk} desactivado correctamente"}