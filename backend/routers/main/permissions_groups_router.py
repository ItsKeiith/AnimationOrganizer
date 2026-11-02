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

class PermissionsGroupsClass(BaseModel):
    permission_group_pk: int
    permission_group_name: str
    is_active: bool
    permission_pk: int
    
# Conexion a la base de datos 
async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoints
# GET
@router.get("/permission_group")
async def obtener_permission_group(db: Session = Depends(get_db)):
    permission_group = db.query(PermissionsGroups).all()

    return {
        "mensaje": "Conexión a la base de datos exitosa", 
        "total_part": len(permission_group),
        "data": permission_group
    }

# POST
@router.post("/permission_group")
def create_permission_group(
    group_data: PermissionsGroupsClass,
    db: Session = Depends(get_db)
):
    existing_group = db.query(PermissionsGroups).filter(
        PermissionsGroups.permission_group_name == group_data.permission_group_name
    ).first()

    if existing_group:
        raise HTTPException(
            status_code=400,
            detail="Permission group name already exists"
        )

    new_group = PermissionsGroups(
        permission_group_pk=group_data.permission_group_pk,
        permission_group_name=group_data.permission_group_name,
        is_active=group_data.is_active,
        permission_pk=group_data.permission_pk
    )

    db.add(new_group)
    db.commit()
    db.refresh(new_group)

    return {
        "message": "Permission group created successfully",
        "data": new_group
    }

# POST BULK
@router.post("/permission_group/bulk")
def create_permission_groups_bulk(
    groups_list: List[PermissionsGroupsClass],
    db: Session = Depends(get_db)
):
    groups_to_insert = [
        PermissionsGroups(
            permission_group_pk=item.permission_group_pk,
            permission_group_name=item.permission_group_name,
            is_active=item.is_active,
            permission_pk=item.permission_pk
        )
        for item in groups_list
    ]

    db.add_all(groups_to_insert)
    db.commit()

    return {
        "message": f"{len(groups_to_insert)} permission groups inserted"
    }

# PUT
@router.put("/permission_group/{group_id}")
def update_permission_group(
    group_id: int,
    group_data: PermissionsGroupsClass,
    db: Session = Depends(get_db)
):
    group_actual = db.query(PermissionsGroups).filter(
        PermissionsGroups.permission_group_pk == group_id
    ).first()

    if not group_actual:
        raise HTTPException(
            status_code=404,
            detail="Permission group not found"
        )

    group_actual.permission_group_name = group_data.permission_group_name
    group_actual.is_active = group_data.is_active
    group_actual.permission_pk = group_data.permission_pk

    db.commit()
    db.refresh(group_actual)

    return {
        "message": "Permission group updated",
        "data": group_actual
    }

# DELETE
@router.delete("/permission_group/{group_pk}")
async def borrar_permission_group(group_pk: int, db: Session = Depends(get_db)):
    group_actual = db.query(PermissionsGroups).filter(
        PermissionsGroups.permission_group_pk == group_pk
    ).first() 

    if not group_actual:
        raise HTTPException(status_code=404, detail="Permission group no encontrado")

    group_actual.is_active = False
    db.commit()
    
    return {"mensaje": f"Permission group con ID {group_pk} desactivado correctamente"}