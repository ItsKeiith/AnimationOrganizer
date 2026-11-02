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

class GroupsTasksViewsClass(BaseModel):
    groups_tasks_views_pk: int
    groups_tasks_views_name: str
    is_active: bool
    tasks_pk: int
    
# Conexion a la base de datos 
async def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Endpoints
# GET
@router.get("/groups_tasks_views")
async def obtener_groups_tasks_views(db: Session = Depends(get_db)):
    groups_tasks_views = db.query(GroupsTasksViews).all()

    return {
        "mensaje": "Conexión a la base de datos exitosa", 
        "total_part": len(groups_tasks_views),
        "data": groups_tasks_views
    }

# POST
@router.post("/groups_tasks_views")
def create_groups_tasks_view(
    view_data: GroupsTasksViewsClass,
    db: Session = Depends(get_db)
):
    existing_view = db.query(GroupsTasksViews).filter(
        GroupsTasksViews.groups_tasks_views_name == view_data.groups_tasks_views_name
    ).first()

    if existing_view:
        raise HTTPException(
            status_code=400,
            detail="Groups Tasks View name already exists"
        )

    new_view = GroupsTasksViews(
        groups_tasks_views_pk=view_data.groups_tasks_views_pk,
        groups_tasks_views_name=view_data.groups_tasks_views_name,
        is_active=view_data.is_active,
        tasks_pk=view_data.tasks_pk
    )

    db.add(new_view)
    db.commit()
    db.refresh(new_view)

    return {
        "message": "Groups Tasks View created successfully",
        "data": new_view
    }

# POST BULK
@router.post("/groups_tasks_views/bulk")
def create_groups_tasks_views_bulk(
    views_list: List[GroupsTasksViewsClass],
    db: Session = Depends(get_db)
):
    views_to_insert = [
        GroupsTasksViews(
            groups_tasks_views_pk=item.groups_tasks_views_pk,
            groups_tasks_views_name=item.groups_tasks_views_name,
            is_active=item.is_active,
            tasks_pk=item.tasks_pk
        )
        for item in views_list
    ]

    db.add_all(views_to_insert)
    db.commit()

    return {
        "message": f"{len(views_to_insert)} groups tasks views inserted"
    }

# PUT
@router.put("/groups_tasks_views/{view_id}")
def update_groups_tasks_view(
    view_id: int,
    view_data: GroupsTasksViewsClass,
    db: Session = Depends(get_db)
):
    view_actual = db.query(GroupsTasksViews).filter(
        GroupsTasksViews.groups_tasks_views_pk == view_id
    ).first()

    if not view_actual:
        raise HTTPException(
            status_code=404,
            detail="Groups Tasks View not found"
        )

    view_actual.groups_tasks_views_name = view_data.groups_tasks_views_name
    view_actual.is_active = view_data.is_active
    view_actual.tasks_pk = view_data.tasks_pk

    db.commit()
    db.refresh(view_actual)

    return {
        "message": "Groups Tasks View updated",
        "data": view_actual
    }

# DELETE
@router.delete("/groups_tasks_views/{view_pk}")
async def borrar_groups_tasks_view(view_pk: int, db: Session = Depends(get_db)):
    view_actual = db.query(GroupsTasksViews).filter(
        GroupsTasksViews.groups_tasks_views_pk == view_pk
    ).first() 

    if not view_actual:
        raise HTTPException(status_code=404, detail="Groups Tasks View no encontrado")

    view_actual.is_active = False
    db.commit()
    
    return {"mensaje": f"Groups Tasks View con ID {view_pk} desactivado correctamente"}