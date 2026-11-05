
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
from model.project import Project
from model.repository import Repository
from model.comments import Comments
from model.repository_groups import RepositoryGroups

from sqlalchemy.orm import Session
from database.database import SessionLocal, engine

router = APIRouter()

class RepositoryGroupsClass(BaseModel):
    repository_groups_pk: int
    repository_groups_name: str
    tasks_fk: int
    repository: int
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
@router.get("/repository_groups")
async def obtener_repository_groups(db: Session = Depends(get_db)):
    repository_groups = db.query(RepositoryGroups).all()

    return {
        "mensaje": "Conexión a la base de datos exitosa", 
        "total_part": len(repository_groups),
        "data": repository_groups
    }

# POST
@router.post("/repository_groups")
def create_repository_group(
    group_data: RepositoryGroupsClass,
    db: Session = Depends(get_db)
):
    existing_group = db.query(RepositoryGroups).filter(
        RepositoryGroups.repository_groups_name == group_data.repository_groups_name
    ).first()

    if existing_group:
        raise HTTPException(
            status_code=400,
            detail="Repository group name already exists"
        )

    new_group = RepositoryGroups(
        repository_groups_pk=group_data.repository_groups_pk,
        repository_groups_name=group_data.repository_groups_name,
        tasks_fk=group_data.tasks_fk,
        repository=group_data.repository,
        is_active=group_data.is_active
    )

    db.add(new_group)
    db.commit()
    db.refresh(new_group)

    return {
        "message": "Repository group created successfully",
        "data": new_group
    }

# POST BULK
@router.post("/repository_groups/bulk")
def create_repository_groups_bulk(
    groups_list: List[RepositoryGroupsClass],
    db: Session = Depends(get_db)
):
    groups_to_insert = [
        RepositoryGroups(
            repository_groups_pk=item.repository_groups_pk,
            repository_groups_name=item.repository_groups_name,
            tasks_fk=item.tasks_fk,
            repository=item.repository,
            is_active=item.is_active
        )
        for item in groups_list
    ]

    db.add_all(groups_to_insert)
    db.commit()

    return {
        "message": f"{len(groups_to_insert)} repository groups inserted"
    }

# PUT
@router.put("/repository_groups/{group_id}")
def update_repository_group(
    group_id: int,
    group_data: RepositoryGroupsClass,
    db: Session = Depends(get_db)
):
    group_actual = db.query(RepositoryGroups).filter(
        RepositoryGroups.repository_groups_pk == group_id
    ).first()

    if not group_actual:
        raise HTTPException(
            status_code=404,
            detail="Repository group not found"
        )

    group_actual.repository_groups_name = group_data.repository_groups_name
    group_actual.tasks_fk = group_data.tasks_fk
    group_actual.repository = group_data.repository
    group_actual.is_active = group_data.is_active

    db.commit()
    db.refresh(group_actual)

    return {
        "message": "Repository group updated",
        "data": group_actual
    }

# DELETE
@router.delete("/repository_groups/{group_pk}")
async def borrar_repository_group(group_pk: int, db: Session = Depends(get_db)):
    group_actual = db.query(RepositoryGroups).filter(
        RepositoryGroups.repository_groups_pk == group_pk
    ).first() 

    if not group_actual:
        raise HTTPException(status_code=404, detail="Repository group no encontrado")

    group_actual.is_active = False
    db.commit()
    
    return {"mensaje": f"Repository group con ID {group_pk} desactivado correctamente"}
