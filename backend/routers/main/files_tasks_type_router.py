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
from model.permissions_group import PermissionsGroups

from sqlalchemy.orm import Session
from database.database import SessionLocal, engine

router = APIRouter()

class FilesTasksTypeClass(BaseModel):
    files_tasks_type_pk: int
    files_tasks_type_name: str
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
@router.get("/files_tasks_types")
async def obtener_files_tasks_types(db: Session = Depends(get_db)):
    files_tasks_types = db.query(FilesTasksTypes).all()

    return {
        "mensaje": "Conexión a la base de datos exitosa", 
        "total_part": len(files_tasks_types),
        "data": files_tasks_types
    }

# POST
@router.post("/files_tasks_types")
def create_files_tasks_type(
    type_data: FilesTasksTypeClass,
    db: Session = Depends(get_db)
):
    existing_type = db.query(FilesTasksTypes).filter(
        FilesTasksTypes.files_tasks_type_name == type_data.files_tasks_type_name
    ).first()

    if existing_type:
        raise HTTPException(
            status_code=400,
            detail="Files tasks type name already exists"
        )

    new_type = FilesTasksTypes(
        files_tasks_type_pk=type_data.files_tasks_type_pk,
        files_tasks_type_name=type_data.files_tasks_type_name,
        is_active=type_data.is_active
    )

    db.add(new_type)
    db.commit()
    db.refresh(new_type)

    return {
        "message": "Files tasks type created successfully",
        "data": new_type
    }

# POST BULK
@router.post("/files_tasks_types/bulk")
def create_files_tasks_types_bulk(
    types_list: List[FilesTasksTypeClass],
    db: Session = Depends(get_db)
):
    types_to_insert = [
        FilesTasksTypes(
            files_tasks_type_pk=item.files_tasks_type_pk,
            files_tasks_type_name=item.files_tasks_type_name,
            is_active=item.is_active
        )
        for item in types_list
    ]

    db.add_all(types_to_insert)
    db.commit()

    return {
        "message": f"{len(types_to_insert)} files tasks types inserted"
    }

# PUT
@router.put("/files_tasks_types/{type_id}")
def update_files_tasks_type(
    type_id: int,
    type_data: FilesTasksTypeClass,
    db: Session = Depends(get_db)
):
    type_actual = db.query(FilesTasksTypes).filter(
        FilesTasksTypes.files_tasks_type_pk == type_id
    ).first()

    if not type_actual:
        raise HTTPException(
            status_code=404,
            detail="Files tasks type not found"
        )

    type_actual.files_tasks_type_name = type_data.files_tasks_type_name
    type_actual.is_active = type_data.is_active

    db.commit()
    db.refresh(type_actual)

    return {
        "message": "Files tasks type updated",
        "data": type_actual
    }

# DELETE
@router.delete("/files_tasks_types/{type_pk}")
async def borrar_files_tasks_type(type_pk: int, db: Session = Depends(get_db)):
    type_actual = db.query(FilesTasksTypes).filter(
        FilesTasksTypes.files_tasks_type_pk == type_pk
    ).first() 

    if not type_actual:
        raise HTTPException(status_code=404, detail="Files tasks type no encontrado")

    type_actual.is_active = False
    db.commit()
    
    return {"mensaje": f"Files tasks type con ID {type_pk} desactivado correctamente"}