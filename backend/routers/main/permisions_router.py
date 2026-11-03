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

# Clase base para manejar la base de datos (Sin modificaciones)
class PermissionsClass(BaseModel):
    permission_pk: int
    permission_name: str
    permission_description: str
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
@router.get("/permissions")
async def obtener_permissions(db: Session = Depends(get_db)):
    permissions = db.query(Permissions).all()

    return {
        "mensaje": "Conexión a la base de datos exitosa", 
        "total_part": len(permissions),
        "data": permissions
    }

# POST
@router.post("/permissions")
def create_permission(
    permission_data: PermissionsClass,
    db: Session = Depends(get_db)
):
    existing_permission = db.query(Permissions).filter(
        Permissions.permission_name == permission_data.permission_name
    ).first()

    if existing_permission:
        raise HTTPException(
            status_code=400,
            detail="Permission name already exists"
        )

    new_permission = Permissions(
        permission_pk=permission_data.permission_pk,
        permission_name=permission_data.permission_name,
        permission_description=permission_data.permission_description,
        is_active=permission_data.is_active
    )

    db.add(new_permission)
    db.commit()
    db.refresh(new_permission)

    return {
        "message": "Permission created successfully",
        "data": new_permission
    }


# POST BULK
@router.post("/permissions/bulk")
def create_permissions_bulk(
    permissions_list: List[PermissionsClass],
    db: Session = Depends(get_db)
):
    permissions_to_insert = [
        Permissions(
            permission_pk=perm.permission_pk,
            permission_name=perm.permission_name,
            permission_description=perm.permission_description,
            is_active=perm.is_active
        )
        for perm in permissions_list
    ]

    db.add_all(permissions_to_insert)
    db.commit()

    return {
        "message": f"{len(permissions_to_insert)} permissions inserted"
    }

# PUT
@router.put("/permissions/{permission_id}")
def update_permission(
    permission_id: int,
    permission_data: PermissionsClass,
    db: Session = Depends(get_db)
):
    permission_actual = db.query(Permissions).filter(
        Permissions.permission_pk == permission_id
    ).first()

    if not permission_actual:
        raise HTTPException(
            status_code=404,
            detail="Permission not found"
        )

    permission_actual.permission_name = permission_data.permission_name
    permission_actual.permission_description = permission_data.permission_description
    permission_actual.is_active = permission_data.is_active

    db.commit()
    db.refresh(permission_actual)

    return {
        "message": "Permission updated",
        "data": permission_actual
    }

# DELETE
@router.delete("/permissions/{permission_pk}")
async def borrar_permission(permission_pk: int, db: Session = Depends(get_db)):
    permission_actual = db.query(Permissions).filter(
        Permissions.permission_pk == permission_pk
    ).first() 

    if not permission_actual:
        raise HTTPException(status_code=404, detail="Permission no encontrado")

    permission_actual.is_active = False
    db.commit()
    
    return {"mensaje": f"Permission con ID {permission_pk} desactivado correctamente"}